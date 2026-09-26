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

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 10, email: "student@example.test" } }),
}));

type HookState = ReturnType<typeof useIntensiveSessions>;

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

/** Routes GET responses by URL so each test declares the authoritative payloads it serves. */
function installRoutes(
  routes: Record<string, TestResponse>,
  calls: string[] = [],
) {
  installSettlingAdapter(api, (config) => {
    const url = String(config.url);
    calls.push(`${config.method}:${url}`);
    const route = routes[url];
    if (!route) {
      return { status: 404, data: { error: `no route for ${url}` } };
    }
    return route;
  });
  return calls;
}

describe("intensive session discovery and authoritative resume", () => {
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    latest = null;
    localStorage.clear();
    document.body.innerHTML = "";
    resetAuthExpiryStateForTests();
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

  it("discovers a canonical ACTIVE session", async () => {
    installRoutes({
      "/intensive-sessions": {
        status: 200,
        data: {
          sessions: [
            baseSession({ id: 4, status: "COMPLETED" }),
            baseSession({ id: 5, status: "ACTIVE" }),
          ],
        },
      },
    });
    await renderHookProbe();

    let found: Awaited<ReturnType<HookState["getActiveSession"]>> | undefined;
    await act(async () => {
      found = await latest?.getActiveSession();
    });

    expect(found?.id).toBe(5);
  });

  it("discovers a canonical PAUSED session", async () => {
    installRoutes({
      "/intensive-sessions": {
        status: 200,
        data: { sessions: [baseSession({ id: 6, status: "PAUSED" })] },
      },
    });
    await renderHookProbe();

    let found: Awaited<ReturnType<HookState["getActiveSession"]>> | undefined;
    await act(async () => {
      found = await latest?.getActiveSession();
    });

    expect(found?.id).toBe(6);
  });

  it("rejects CONFIGURING and terminal sessions during discovery", async () => {
    installRoutes({
      "/intensive-sessions": {
        status: 200,
        data: {
          sessions: [
            baseSession({ id: 1, status: "CONFIGURING" }),
            baseSession({ id: 2, status: "COMPLETED" }),
            baseSession({ id: 3, status: "ABANDONED" }),
          ],
        },
      },
    });
    await renderHookProbe();

    let found: Awaited<ReturnType<HookState["getActiveSession"]>> | undefined;
    await act(async () => {
      found = await latest?.getActiveSession();
    });

    expect(found).toBeNull();
  });

  it("hydrates session, active block, card and absolute timer when resuming active work", async () => {
    const calls: string[] = [];
    installRoutes(
      {
        "/intensive-sessions/1": {
          status: 200,
          data: {
            session: baseSession({
              pomodoroBlocks: [
                {
                  id: 101,
                  sessionId: 1,
                  blockNumber: 2,
                  status: "ACTIVE",
                  breakType: "SHORT",
                  startedAt: "2026-08-05T10:00:00.000Z",
                  durationMinutes: 25,
                  createdAt: "2026-08-05T10:00:00.000Z",
                  updatedAt: "2026-08-05T10:00:00.000Z",
                },
              ],
            }),
          },
        },
        "/intensive-sessions/1/cards/next": {
          status: 200,
          data: {
            sessionCardId: 501,
            cardId: 900,
            question: "What is spaced repetition?",
            answer: "Reviewing at increasing intervals",
            blockComplete: false,
          },
        },
      },
      calls,
    );
    await renderHookProbe();

    let snapshot: Awaited<ReturnType<HookState["rehydrateSession"]>> | undefined;
    await act(async () => {
      snapshot = await latest?.rehydrateSession(1);
    });

    expect(snapshot?.phase).toBe("ACTIVE");
    expect(snapshot?.block?.id).toBe(101);
    expect(snapshot?.card?.cardId).toBe(900);
    expect(snapshot?.timer).toEqual({
      phase: "WORK",
      startedAt: "2026-08-05T10:00:00.000Z",
      endsAt: "2026-08-05T10:25:00.000Z",
      durationSeconds: 1500,
    });
    expect(latest?.currentSession?.id).toBe(1);
    expect(latest?.currentPomodoro?.id).toBe(101);
    expect(latest?.currentCard?.cardId).toBe(900);
    expect(latest?.error).toBeNull();
    expect(calls).toEqual([
      "get:/intensive-sessions/1",
      "get:/intensive-sessions/1/cards/next",
    ]);
  });

  it("hydrates a break resume without requesting a card", async () => {
    const calls: string[] = [];
    installRoutes(
      {
        "/intensive-sessions/1": {
          status: 200,
          data: {
            session: baseSession(),
            activeBlock: {
              id: 102,
              sessionId: 1,
              blockNumber: 1,
              status: "ON_BREAK",
              breakType: "SHORT",
              startedAt: "2026-08-05T10:00:00.000Z",
              durationMinutes: 25,
              breakStartedAt: "2026-08-05T10:25:00.000Z",
              breakDurationMinutes: 5,
              createdAt: "2026-08-05T10:00:00.000Z",
              updatedAt: "2026-08-05T10:25:00.000Z",
            },
          },
        },
      },
      calls,
    );
    await renderHookProbe();

    let snapshot: Awaited<ReturnType<HookState["rehydrateSession"]>> | undefined;
    await act(async () => {
      snapshot = await latest?.rehydrateSession(1);
    });

    expect(snapshot?.phase).toBe("BREAK");
    expect(snapshot?.block?.id).toBe(102);
    expect(snapshot?.card).toBeNull();
    expect(snapshot?.timer).toEqual({
      phase: "SHORT_BREAK",
      startedAt: "2026-08-05T10:25:00.000Z",
      endsAt: "2026-08-05T10:30:00.000Z",
      durationSeconds: 300,
    });
    expect(calls).toEqual(["get:/intensive-sessions/1"]);
  });

  it("hydrates a paused partial resume with the interrupted block and no timer", async () => {
    const calls: string[] = [];
    installRoutes(
      {
        "/intensive-sessions/1": {
          status: 200,
          data: {
            session: baseSession({
              status: "PAUSED",
              pomodoroBlocks: [
                {
                  id: 103,
                  sessionId: 1,
                  blockNumber: 2,
                  status: "PENDING",
                  breakType: "SHORT",
                  startedAt: "2026-08-05T10:00:00.000Z",
                  durationMinutes: 25,
                  createdAt: "2026-08-05T10:00:00.000Z",
                  updatedAt: "2026-08-05T10:10:00.000Z",
                },
              ],
            }),
          },
        },
      },
      calls,
    );
    await renderHookProbe();

    let snapshot: Awaited<ReturnType<HookState["rehydrateSession"]>> | undefined;
    await act(async () => {
      snapshot = await latest?.rehydrateSession(1);
    });

    expect(snapshot?.phase).toBe("PAUSED");
    expect(snapshot?.block?.id).toBe(103);
    expect(snapshot?.timer).toBeNull();
    expect(snapshot?.card).toBeNull();
    expect(latest?.currentCard).toBeNull();
    expect(calls).toEqual(["get:/intensive-sessions/1"]);
  });

  it("resumes an active session with no active block as READY without fetching a card", async () => {
    const calls: string[] = [];
    installRoutes(
      {
        "/intensive-sessions/1": {
          status: 200,
          data: { session: baseSession(), activeBlock: null },
        },
      },
      calls,
    );
    await renderHookProbe();

    let snapshot: Awaited<ReturnType<HookState["rehydrateSession"]>> | undefined;
    await act(async () => {
      snapshot = await latest?.rehydrateSession(1);
    });

    expect(snapshot?.phase).toBe("READY");
    expect(snapshot?.block).toBeNull();
    expect(snapshot?.timer).toBeNull();
    expect(latest?.currentPomodoro).toBeNull();
    expect(calls).toEqual(["get:/intensive-sessions/1"]);
  });

  it("refuses to hydrate a session owned by another user", async () => {
    const calls: string[] = [];
    installRoutes(
      {
        "/intensive-sessions/1": {
          status: 200,
          data: { session: baseSession({ userId: 999 }) },
        },
      },
      calls,
    );
    await renderHookProbe();

    let snapshot: Awaited<ReturnType<HookState["rehydrateSession"]>> | undefined;
    await act(async () => {
      snapshot = await latest?.rehydrateSession(1);
    });

    expect(snapshot).toBeNull();
    expect(latest?.currentSession).toBeNull();
    expect(latest?.currentPomodoro).toBeNull();
    expect(latest?.currentCard).toBeNull();
    expect(calls).toEqual(["get:/intensive-sessions/1"]);
  });

  it("ignores a stale block that belongs to another session", async () => {
    installRoutes({
      "/intensive-sessions/1": {
        status: 200,
        data: {
          session: baseSession({
            pomodoroBlocks: [
              {
                id: 777,
                sessionId: 42,
                blockNumber: 1,
                status: "ACTIVE",
                breakType: "SHORT",
                startedAt: "2026-08-05T10:00:00.000Z",
                durationMinutes: 25,
                createdAt: "2026-08-05T10:00:00.000Z",
                updatedAt: "2026-08-05T10:00:00.000Z",
              },
            ],
          }),
        },
      },
    });
    await renderHookProbe();

    let snapshot: Awaited<ReturnType<HookState["rehydrateSession"]>> | undefined;
    await act(async () => {
      snapshot = await latest?.rehydrateSession(1);
    });

    expect(snapshot?.phase).toBe("READY");
    expect(snapshot?.block).toBeNull();
    expect(latest?.currentPomodoro).toBeNull();
  });

  it("does not hydrate state when the authoritative detail request fails", async () => {
    installRoutes({
      "/intensive-sessions/1": {
        status: 500,
        data: { error: "Detalle no disponible" },
      },
    });
    await renderHookProbe();

    let snapshot: Awaited<ReturnType<HookState["rehydrateSession"]>> | undefined;
    await act(async () => {
      snapshot = await latest?.rehydrateSession(1);
    });

    expect(snapshot).toBeNull();
    expect(latest?.currentSession).toBeNull();
    // An uncoded 500 is the backend's "missing or not owned" answer, rendered
    // with the same unavailable message as a reconciliation read.
    expect(latest?.error).toBe("La sesión ya no está disponible.");
  });
});

/** One scripted response per call, consumed in order; a network step throws. */
type RouteStep = TestResponse | "network";

/**
 * Routes GET/POST calls against `/intensive-sessions/1` and its `/start`
 * command by call order, so a test can script an authoritative GET, a
 * command, and a follow-up re-GET independently.
 */
function installSequencedRoutes(
  steps: {
    get?: RouteStep[];
    post?: RouteStep[];
    /** Simple keyed routes (e.g. next-card) that do not need sequencing. */
    extra?: Record<string, TestResponse>;
  },
  calls: string[] = [],
) {
  let getIndex = 0;
  let postIndex = 0;

  installSettlingAdapter(api, (config) => {
    const url = String(config.url);
    const method = String(config.method);
    calls.push(`${method}:${url}`);

    if (method === "get" && url === "/intensive-sessions/1") {
      const step = steps.get?.[getIndex++];
      if (!step) {
        return { status: 404, data: { error: "no more scripted GET steps" } };
      }
      if (step === "network") {
        throw responseLessFailure(config, "Network Error");
      }
      return step;
    }

    if (method === "post" && url === "/intensive-sessions/1/start") {
      const step = steps.post?.[postIndex++];
      if (!step) {
        return { status: 404, data: { error: "no more scripted POST steps" } };
      }
      if (step === "network") {
        throw responseLessFailure(config, "Network Error");
      }
      return step;
    }

    const extraRoute = steps.extra?.[url];
    if (extraRoute) {
      return extraRoute;
    }

    return { status: 404, data: { error: `no route for ${method}:${url}` } };
  });

  return calls;
}

function pausedSession() {
  return baseSession({ status: "PAUSED" });
}

function activeWorkSession() {
  return baseSession({
    status: "ACTIVE",
    pomodoroBlocks: [
      {
        id: 201,
        sessionId: 1,
        blockNumber: 1,
        status: "ACTIVE",
        breakType: "SHORT",
        startedAt: "2026-08-05T10:00:00.000Z",
        durationMinutes: 25,
        createdAt: "2026-08-05T10:00:00.000Z",
        updatedAt: "2026-08-05T10:00:00.000Z",
      },
    ],
  });
}

const NEXT_CARD_ROUTE: TestResponse = {
  status: 200,
  data: {
    sessionCardId: 501,
    cardId: 900,
    question: "What is spaced repetition?",
    answer: "Reviewing at increasing intervals",
    blockComplete: false,
  },
};

describe("resumeFromPause: GET-gated resume without replaying a landed start", () => {
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    latest = null;
    localStorage.clear();
    document.body.innerHTML = "";
    resetAuthExpiryStateForTests();
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

  it("resumeFromPause does not replay start when the session is already active", async () => {
    const calls: string[] = [];
    installRoutes(
      {
        "/intensive-sessions/1": {
          status: 200,
          data: { session: activeWorkSession() },
        },
        "/intensive-sessions/1/cards/next": NEXT_CARD_ROUTE,
      },
      calls,
    );
    await renderHookProbe();

    let snapshot:
      | Awaited<ReturnType<HookState["resumeFromPause"]>>
      | undefined;
    await act(async () => {
      snapshot = await latest?.resumeFromPause(1);
    });

    expect(snapshot?.phase).toBe("ACTIVE");
    expect(calls.filter((call) => call.startsWith("post:"))).toHaveLength(0);
  });

  it("resumeFromPause starts a genuinely paused session exactly once and rehydrates", async () => {
    const calls = installSequencedRoutes({
      get: [
        { status: 200, data: { session: pausedSession() } },
        { status: 200, data: { session: activeWorkSession() } },
      ],
      post: [{ status: 200, data: { session: activeWorkSession() } }],
      // The second reconciliation reports the running work block, so it
      // also needs the next-card route.
      extra: { "/intensive-sessions/1/cards/next": NEXT_CARD_ROUTE },
    });
    await renderHookProbe();

    let snapshot:
      | Awaited<ReturnType<HookState["resumeFromPause"]>>
      | undefined;
    await act(async () => {
      snapshot = await latest?.resumeFromPause(1);
    });

    const postCalls = calls.filter((call) => call.startsWith("post:"));
    const getCalls = calls.filter(
      (call) => call === "get:/intensive-sessions/1",
    );
    expect(postCalls).toHaveLength(1);
    expect(getCalls).toHaveLength(2);
    expect(snapshot?.phase).toBe("ACTIVE");
  });

  it("resumeFromPause recovers on retry after a landed start whose hydration failed", async () => {
    // A response-carrying failure (unlike a response-less network error) is
    // never auto-retried by the transport, so it deterministically models an
    // irrecoverable hydration GET without waiting on retry backoff.
    const calls = installSequencedRoutes({
      get: [
        { status: 200, data: { session: pausedSession() } },
        { status: 500, data: { error: "Detalle no disponible" } },
        { status: 200, data: { session: baseSession({ status: "ACTIVE" }) } },
      ],
      post: [{ status: 200, data: { session: activeWorkSession() } }],
    });
    await renderHookProbe();

    let firstResult:
      | Awaited<ReturnType<HookState["resumeFromPause"]>>
      | undefined;
    await act(async () => {
      firstResult = await latest?.resumeFromPause(1);
    });
    expect(firstResult).toBeNull();

    let secondResult:
      | Awaited<ReturnType<HookState["resumeFromPause"]>>
      | undefined;
    await act(async () => {
      secondResult = await latest?.resumeFromPause(1);
    });

    const postCalls = calls.filter((call) => call.startsWith("post:"));
    expect(postCalls).toHaveLength(1);
    expect(secondResult?.phase).toBe("READY");
  });

  it("resumeFromPause surfaces a rejected start without a second reconciliation GET", async () => {
    // A response-carrying HTTP 500 (not a response-less/network failure) is
    // used here for the same reason as elsewhere in this file: it is
    // deterministic with zero interceptor interaction (the auth interceptor
    // at src/utils/axiosConfig.ts:265-283 only auto-retries response-LESS
    // idempotent failures), and it additionally proves the backend business
    // message is what surfaces through the hook's error state.
    const calls = installSequencedRoutes({
      get: [{ status: 200, data: { session: pausedSession() } }],
      post: [{ status: 500, data: { error: "No se pudo iniciar la sesión" } }],
    });
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["resumeFromPause"]>> | undefined;
    await act(async () => {
      result = await latest?.resumeFromPause(1);
    });

    expect(result).toBeNull();
    expect(
      calls.filter((call) => call === "post:/intensive-sessions/1/start"),
    ).toHaveLength(1);
    expect(
      calls.filter((call) => call === "get:/intensive-sessions/1"),
    ).toHaveLength(1);
    expect(latest?.error).toBe("No se pudo iniciar la sesión");
    expect(latest?.currentSession?.status).toBe("PAUSED");
  });

  it("resumeFromPause issues no start when the initial reconciliation fails", async () => {
    const calls = installSequencedRoutes({
      get: [{ status: 500, data: { error: "Detalle no disponible" } }],
    });
    await renderHookProbe();

    let snapshot:
      | Awaited<ReturnType<HookState["resumeFromPause"]>>
      | undefined;
    await act(async () => {
      snapshot = await latest?.resumeFromPause(1);
    });

    expect(snapshot).toBeNull();
    expect(calls.filter((call) => call.startsWith("post:"))).toHaveLength(0);
  });
});
