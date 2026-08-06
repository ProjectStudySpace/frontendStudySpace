/**
 * Lifecycle commands must be honest about failure.
 *
 * Pause, abandon, complete, end-break and skip-break are non-idempotent POSTs:
 * a rejected or lost command must leave the local session untouched, and an
 * ambiguous one must be resolved by an authoritative GET, never by a replay.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, resetAuthExpiryStateForTests } from "../../../utils/axiosConfig";
import { useIntensiveSessions } from "../../../../hooks/useIntensiveSessions";
import {
  installSettlingAdapter,
  responseLessFailure,
  type TestResponse,
} from "./testAxios";
import type { IntensiveMutationOutcome } from "../state/mutationOutcome";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 10, email: "student@example.test" } }),
}));

type HookState = ReturnType<typeof useIntensiveSessions>;
type Outcome = IntensiveMutationOutcome<unknown>;

let latest: HookState | null = null;
let root: Root | null = null;

function Probe() {
  latest = useIntensiveSessions();
  return null;
}

async function renderHookProbe() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(React.createElement(Probe));
  });
  await vi.waitFor(() => expect(latest).not.toBeNull());
}

const BREAK_BLOCK = {
  id: 102,
  sessionId: 1,
  blockNumber: 2,
  status: "ON_BREAK",
  breakType: "SHORT",
  startedAt: "2026-08-05T10:00:00.000Z",
  durationMinutes: 25,
  breakStartedAt: "2026-08-05T10:25:00.000Z",
  breakDurationMinutes: 5,
  createdAt: "2026-08-05T10:00:00.000Z",
  updatedAt: "2026-08-05T10:25:00.000Z",
};

const WORK_BLOCK = { ...BREAK_BLOCK, status: "ACTIVE" };

function baseSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    topicId: 7,
    userId: 10,
    intensity: "NORMAL",
    status: "ACTIVE",
    totalCards: 10,
    completedCards: 2,
    totalPomodoros: 4,
    completedPomodoros: 0,
    xpEarned: 0,
    createdAt: "2026-08-05T09:59:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    pomodoroBlocks: [],
    sessionCards: [],
    ...overrides,
  };
}

/** Authoritative detail payload served by GET `/intensive-sessions/1`. */
function detail(sessionStatus: string, block: Record<string, unknown> | null) {
  return {
    status: 200,
    data: {
      session: baseSession({ status: sessionStatus }),
      activeBlock: block,
    },
  } satisfies TestResponse;
}

/** Detail served while the session is still on break: no command has landed. */
const UNCHANGED_DETAIL = detail("ACTIVE", BREAK_BLOCK);

/** A POST either resolves with a payload or dies before reaching the backend. */
type PostOutcome = TestResponse | "network";

let currentDetail: TestResponse = UNCHANGED_DETAIL;
let calls: string[] = [];
let postOutcome: ((url: string) => PostOutcome) | null = null;

function installRoutes() {
  calls = [];
  installSettlingAdapter(api, (config) => {
    const url = String(config.url);
    const method = String(config.method);
    calls.push(`${method}:${url}`);

    if (method === "get") {
      if (url === "/intensive-sessions/1") {
        return currentDetail;
      }
      if (url === "/intensive-sessions/1/cards/next") {
        return { status: 404, data: { error: "no cards" } };
      }
      return { status: 404, data: { error: `no route for ${url}` } };
    }

    const outcome = postOutcome?.(url);
    if (outcome === "network") {
      throw responseLessFailure(config, "Network Error");
    }
    if (outcome) {
      return outcome;
    }
    return { status: 404, data: { error: `no route for ${url}` } };
  });
}

function postCalls() {
  return calls.filter((call) => call.startsWith("post:"));
}

/** Hydrate authoritative local state so "unchanged" is a meaningful assertion. */
async function hydrate() {
  currentDetail = UNCHANGED_DETAIL;
  await act(async () => {
    await latest?.resumeSession(1);
  });
  calls = [];
}

interface CommandCase {
  name: string;
  url: string;
  successBody: unknown;
  /** Authoritative detail proving the command really landed. */
  landedDetail: TestResponse;
  invoke: (hook: HookState) => Promise<Outcome>;
}

const CASES: CommandCase[] = [
  {
    name: "pauseSession",
    url: "/intensive-sessions/1/pause",
    successBody: { session: baseSession({ status: "PAUSED" }) },
    landedDetail: detail("PAUSED", null),
    invoke: (hook) => hook.pauseSession(1),
  },
  {
    name: "abandonSession",
    url: "/intensive-sessions/1/abandon",
    successBody: baseSession({ status: "ABANDONED" }),
    landedDetail: detail("ABANDONED", null),
    invoke: (hook) => hook.abandonSession(1),
  },
  {
    name: "completeSession",
    url: "/intensive-sessions/1/complete",
    successBody: { session: baseSession({ status: "COMPLETED" }) },
    landedDetail: detail("COMPLETED", null),
    invoke: (hook) => hook.completeSession(1),
  },
  {
    name: "endBreak",
    url: "/intensive-sessions/1/pomodoro/102/end-break",
    successBody: { success: true, message: "ok" },
    landedDetail: detail("ACTIVE", WORK_BLOCK),
    invoke: (hook) => hook.endBreak(1, 102),
  },
  {
    name: "skipBreak",
    url: "/intensive-sessions/1/pomodoro/102/skip-break",
    successBody: { success: true, message: "ok" },
    landedDetail: detail("ACTIVE", WORK_BLOCK),
    invoke: (hook) => hook.skipBreak(1, 102),
  },
];

describe("intensive lifecycle commands", () => {
  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    latest = null;
    postOutcome = null;
    currentDetail = UNCHANGED_DETAIL;
    localStorage.clear();
    document.body.innerHTML = "";
    resetAuthExpiryStateForTests();
    installRoutes();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
      root = null;
    }
    delete api.defaults.adapter;
    resetAuthExpiryStateForTests();
    localStorage.clear();
    document.body.innerHTML = "";
  });

  for (const testCase of CASES) {
    describe(testCase.name, () => {
      it("reports a single success when the backend accepts the command", async () => {
        postOutcome = () => ({ status: 200, data: testCase.successBody });
        await renderHookProbe();
        await hydrate();

        let outcome: Outcome | undefined;
        await act(async () => {
          outcome = await testCase.invoke(latest as HookState);
        });

        expect(outcome?.status).toBe("success");
        expect(
          outcome?.status === "success" ? outcome.snapshot : "missing",
        ).toBeNull();
        expect(postCalls()).toEqual([`post:${testCase.url}`]);
        expect(latest?.error).toBeNull();
      });

      it("keeps the local session untouched on an HTTP error", async () => {
        postOutcome = () => ({ status: 500, data: { error: "Fallo interno" } });
        await renderHookProbe();
        await hydrate();
        const before = {
          session: latest?.currentSession,
          pomodoro: latest?.currentPomodoro,
          card: latest?.currentCard,
        };

        let outcome: Outcome | undefined;
        await act(async () => {
          outcome = await testCase.invoke(latest as HookState);
        });

        expect(outcome?.status).toBe("failed");
        expect(latest?.currentSession).toBe(before.session);
        expect(latest?.currentPomodoro).toBe(before.pomodoro);
        expect(latest?.currentCard).toBe(before.card);
        expect(latest?.error).toBe("Fallo interno");
        expect(postCalls()).toEqual([`post:${testCase.url}`]);
      });

      it("keeps the local session untouched on a business rule rejection", async () => {
        postOutcome = () => ({
          status: 409,
          data: { error: "La sesión no admite esta acción" },
        });
        await renderHookProbe();
        await hydrate();
        const before = latest?.currentSession;

        let outcome: Outcome | undefined;
        await act(async () => {
          outcome = await testCase.invoke(latest as HookState);
        });

        expect(outcome?.status).toBe("failed");
        expect(
          outcome?.status === "failed" ? outcome.error.kind : "missing",
        ).toBe("business");
        expect(latest?.currentSession).toBe(before);
        expect(latest?.error).toBe("La sesión no admite esta acción");
        expect(postCalls()).toEqual([`post:${testCase.url}`]);
      });

      it("keeps the local session untouched when a network failure did not land", async () => {
        postOutcome = () => "network";
        await renderHookProbe();
        await hydrate();
        const before = latest?.currentSession;
        currentDetail = UNCHANGED_DETAIL;

        let outcome: Outcome | undefined;
        await act(async () => {
          outcome = await testCase.invoke(latest as HookState);
        });

        expect(outcome?.status).toBe("failed");
        expect(latest?.currentSession).toBe(before);
        expect(latest?.error).toBe("Network Error");
        expect(postCalls()).toEqual([`post:${testCase.url}`]);
      });

      it("reconciles an ambiguous network failure through an authoritative GET without replaying the command", async () => {
        postOutcome = () => "network";
        await renderHookProbe();
        await hydrate();
        currentDetail = testCase.landedDetail;

        let outcome: Outcome | undefined;
        await act(async () => {
          outcome = await testCase.invoke(latest as HookState);
        });

        expect(outcome?.status).toBe("success");
        expect(
          outcome?.status === "success" ? outcome.snapshot : null,
        ).not.toBeNull();
        expect(postCalls()).toEqual([`post:${testCase.url}`]);
        expect(calls).toContain("get:/intensive-sessions/1");
        expect(latest?.error).toBeNull();
      });

      it("clears a previous command error once a retry succeeds", async () => {
        postOutcome = () => ({ status: 500, data: { error: "Fallo interno" } });
        await renderHookProbe();
        await hydrate();

        await act(async () => {
          await testCase.invoke(latest as HookState);
        });
        expect(latest?.error).toBe("Fallo interno");

        postOutcome = () => ({ status: 200, data: testCase.successBody });
        let retried: Outcome | undefined;
        await act(async () => {
          retried = await testCase.invoke(latest as HookState);
        });

        expect(retried?.status).toBe("success");
        expect(latest?.error).toBeNull();
      });
    });
  }

  it("treats an unsuccessful end-break acknowledgement as a failure", async () => {
    postOutcome = () => ({
      status: 200,
      data: { success: false, message: "El descanso ya terminó" },
    });
    await renderHookProbe();
    await hydrate();
    const before = latest?.currentSession;

    let outcome: Outcome | undefined;
    await act(async () => {
      outcome = await latest?.endBreak(1, 102);
    });

    expect(outcome?.status).toBe("failed");
    expect(latest?.currentSession).toBe(before);
    expect(latest?.error).toBe("El descanso ya terminó");
  });

  it("treats an unsuccessful skip-break acknowledgement as a failure", async () => {
    postOutcome = () => ({
      status: 200,
      data: { success: false, message: "El descanso ya terminó" },
    });
    await renderHookProbe();
    await hydrate();
    const before = latest?.currentSession;

    let outcome: Outcome | undefined;
    await act(async () => {
      outcome = await latest?.skipBreak(1, 102);
    });

    expect(outcome?.status).toBe("failed");
    expect(latest?.currentSession).toBe(before);
    expect(latest?.error).toBe("El descanso ya terminó");
  });

  it("does not reconcile a rejected command with an extra GET", async () => {
    postOutcome = () => ({ status: 409, data: { error: "Conflicto" } });
    await renderHookProbe();
    await hydrate();

    await act(async () => {
      await latest?.pauseSession(1);
    });

    expect(calls).toEqual(["post:/intensive-sessions/1/pause"]);
  });
});
