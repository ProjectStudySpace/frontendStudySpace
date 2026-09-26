/**
 * Completion commands must keep the whole backend contract.
 *
 * Session completion answers `{ message, session, summary }` where `session` is
 * a bare row, and block completion answers the break boundary plus a badge
 * evaluation outcome. A lost completion claim answers 5xx with no code even
 * though the commit may have landed, so it is reconciled before being trusted.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, resetAuthExpiryStateForTests } from "../../../utils/axiosConfig";
import { useIntensiveSessions } from "../../../../hooks/useIntensiveSessions";
import { installSettlingAdapter, type TestResponse } from "./testAxios";

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

const WORK_BLOCK = {
  id: 102,
  sessionId: 1,
  blockNumber: 2,
  status: "ACTIVE",
  breakType: "SHORT",
  startedAt: "2026-08-05T10:00:00.000Z",
  durationMinutes: 25,
  breakDurationMinutes: 5,
  createdAt: "2026-08-05T10:00:00.000Z",
  updatedAt: "2026-08-05T10:00:00.000Z",
};

const BREAK_BLOCK = {
  ...WORK_BLOCK,
  status: "ON_BREAK",
  breakStartedAt: "2026-08-05T10:25:00.000Z",
};

const SESSION_CARD = {
  id: 501,
  sessionId: 1,
  cardId: 9,
  completed: true,
  order: 1,
  createdAt: "2026-08-05T09:59:00.000Z",
  updatedAt: "2026-08-05T10:10:00.000Z",
};

function baseSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    topicId: 7,
    userId: 10,
    intensity: "NORMAL",
    status: "ACTIVE",
    totalCards: 1,
    completedCards: 1,
    totalPomodoros: 1,
    completedPomodoros: 0,
    xpEarned: 0,
    createdAt: "2026-08-05T09:59:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    pomodoroBlocks: [WORK_BLOCK],
    sessionCards: [SESSION_CARD],
    ...overrides,
  };
}

/** The completion endpoint returns the session row without its relations. */
function bareSessionRow(overrides: Record<string, unknown> = {}) {
  const { pomodoroBlocks: _blocks, sessionCards: _cards, ...row } =
    baseSession(overrides);
  return row;
}

function detail(sessionStatus: string, block: Record<string, unknown> | null) {
  return {
    status: 200,
    data: {
      session: baseSession({ status: sessionStatus }),
      activeBlock: block,
    },
  } satisfies TestResponse;
}

const SUMMARY = {
  topicName: "Biology",
  cardsCompleted: 1,
  totalCards: 1,
  cardsEasy: 1,
  cardsMedium: 0,
  cardsHard: 0,
  pomodorosCompleted: 1,
  totalDuration: 27,
  xpEarned: 120,
  multiplier: 2,
  appliedMultipliers: [
    { type: "NO_ABANDON", value: 2, label: "Sin abandonar x2" },
  ],
  nextReviews: [
    {
      id: 900,
      sessionId: 1,
      userId: 10,
      reviewNumber: 1,
      scheduledFor: "2026-08-05T12:00:00.000Z",
      difficultyFilter: null,
      cardCount: 1,
      status: "SCHEDULED",
      notificationSent: false,
      cardsReviewed: 0,
      xpEarned: 0,
      createdAt: "2026-08-05T10:30:00.000Z",
    },
  ],
  intradayReviewScheduling: { status: "notification_pending", retryable: true },
};

const LOST_CLAIM: TestResponse = {
  status: 500,
  data: {
    error: "No se pudo confirmar la finalización de la sesión. Recarga el estado.",
    path: "/api/intensive-sessions/1/complete",
    method: "POST",
  },
};

/** A coded 409 from the completion endpoints (backend conflict contract). */
function conflict(code: string, error = "Conflicto"): TestResponse {
  return { status: 409, data: { error, code, path: "/api", method: "POST" } };
}

/** The session GET answers an uncoded 500 for a missing or foreign session. */
const SESSION_GONE: TestResponse = {
  status: 500,
  data: { error: "Sesión no encontrada", path: "/api", method: "GET" },
};

type CompleteOutcome = Awaited<ReturnType<HookState["completeSession"]>>;
type BlockOutcome = Awaited<ReturnType<HookState["completePomodoro"]>>;

let currentDetail: TestResponse = detail("ACTIVE", WORK_BLOCK);
let postResponse: TestResponse | null = null;
let calls: string[] = [];

function installRoutes() {
  calls = [];
  installSettlingAdapter(api, (config) => {
    const url = String(config.url);
    const method = String(config.method);
    calls.push(`${method}:${url}`);
    if (method === "get" && url === "/intensive-sessions/1") {
      return currentDetail;
    }
    if (method === "post" && postResponse) {
      return postResponse;
    }
    return { status: 404, data: { error: `no route for ${url}` } };
  });
}

function postCalls() {
  return calls.filter((call) => call.startsWith("post:"));
}

async function hydrate(unchanged: TestResponse) {
  currentDetail = unchanged;
  await act(async () => {
    await latest?.rehydrateSession(1);
  });
  calls = [];
}

describe("intensive completion contract", () => {
  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    latest = null;
    postResponse = null;
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

  describe("completeSession", () => {
    it("returns the backend summary alongside the completed session", async () => {
      postResponse = {
        status: 200,
        data: {
          message: "ok",
          session: bareSessionRow({ status: "COMPLETED" }),
          summary: SUMMARY,
        },
      };
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));

      let outcome: Awaited<ReturnType<HookState["completeSession"]>> | undefined;
      await act(async () => {
        outcome = await latest?.completeSession(1);
      });

      expect(outcome?.status).toBe("success");
      if (outcome?.status !== "success") return;
      expect(outcome.data.summary).toEqual(SUMMARY);
      expect(outcome.data.session.status).toBe("COMPLETED");
    });

    it("passes the badge evaluation outcome through with the completion", async () => {
      postResponse = {
        status: 200,
        data: {
          message: "ok",
          session: bareSessionRow({ status: "COMPLETED" }),
          summary: SUMMARY,
          badgeEvaluation: { status: "pending_reconciliation", retryable: true },
        },
      };
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));

      let outcome: CompleteOutcome | undefined;
      await act(async () => {
        outcome = await latest?.completeSession(1);
      });

      expect(outcome?.status).toBe("success");
      if (outcome?.status !== "success") return;
      expect(outcome.data.badgeEvaluation).toEqual({
        status: "pending_reconciliation",
        retryable: true,
      });
    });

    for (const code of ["COMPLETION_UNCONFIRMED", "SESSION_NOT_ACTIVE"]) {
      it(`confirms a completed session behind a ${code} conflict without replaying`, async () => {
        postResponse = conflict(code);
        await renderHookProbe();
        await hydrate(detail("ACTIVE", WORK_BLOCK));
        currentDetail = detail("COMPLETED", null);

        let outcome: CompleteOutcome | undefined;
        await act(async () => {
          outcome = await latest?.completeSession(1);
        });

        expect(outcome?.status).toBe("success");
        if (outcome?.status !== "success") return;
        expect(outcome.snapshot?.session.status).toBe("COMPLETED");
        expect(outcome.data.badgeEvaluation).toBeNull();
        expect(postCalls()).toEqual(["post:/intensive-sessions/1/complete"]);
        expect(latest?.error).toBeNull();
      });
    }

    it("does not report an abandoned session as completed", async () => {
      postResponse = conflict("SESSION_NOT_ACTIVE", "Sesión no activa");
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));
      currentDetail = detail("ABANDONED", null);

      let outcome: CompleteOutcome | undefined;
      await act(async () => {
        outcome = await latest?.completeSession(1);
      });

      expect(outcome?.status).toBe("failed");
      expect(calls).toContain("get:/intensive-sessions/1");
      expect(latest?.error).toBe("Sesión no activa");
    });

    it("keeps pending cards as a plain rejection without reconciling", async () => {
      postResponse = conflict("PENDING_CARDS", "Aún tienes 2 tarjetas pendientes");
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));

      let outcome: CompleteOutcome | undefined;
      await act(async () => {
        outcome = await latest?.completeSession(1);
      });

      expect(outcome?.status).toBe("failed");
      if (outcome?.status !== "failed") return;
      expect(outcome.error.code).toBe("PENDING_CARDS");
      expect(calls).toEqual(["post:/intensive-sessions/1/complete"]);
      expect(latest?.error).toBe("Aún tienes 2 tarjetas pendientes");
    });

    it("reports an unavailable session when the reconciliation GET cannot find it", async () => {
      postResponse = conflict("COMPLETION_UNCONFIRMED");
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));
      currentDetail = SESSION_GONE;

      let outcome: CompleteOutcome | undefined;
      await act(async () => {
        outcome = await latest?.completeSession(1);
      });

      expect(outcome?.status).toBe("failed");
      if (outcome?.status !== "failed") return;
      expect(outcome.error.code).toBe("SESSION_UNAVAILABLE");
      expect(latest?.error).toBe("La sesión ya no está disponible.");
      expect(postCalls()).toEqual(["post:/intensive-sessions/1/complete"]);
    });

    it("keeps the known relations when the completion answers a bare session row", async () => {
      postResponse = {
        status: 200,
        data: {
          message: "ok",
          session: bareSessionRow({ status: "COMPLETED" }),
          summary: SUMMARY,
        },
      };
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));

      await act(async () => {
        await latest?.completeSession(1);
      });

      expect(latest?.currentSession?.status).toBe("COMPLETED");
      expect(latest?.currentSession?.sessionCards).toHaveLength(1);
      expect(latest?.currentSession?.pomodoroBlocks).toHaveLength(1);
    });

    it("reconciles a lost completion claim instead of reporting a rejection", async () => {
      postResponse = LOST_CLAIM;
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));
      currentDetail = detail("COMPLETED", null);

      let outcome: Awaited<ReturnType<HookState["completeSession"]>> | undefined;
      await act(async () => {
        outcome = await latest?.completeSession(1);
      });

      expect(outcome?.status).toBe("success");
      if (outcome?.status !== "success") return;
      expect(outcome.snapshot).not.toBeNull();
      expect(outcome.data.summary).toBeNull();
      expect(postCalls()).toEqual(["post:/intensive-sessions/1/complete"]);
      expect(calls).toContain("get:/intensive-sessions/1");
      expect(latest?.error).toBeNull();
    });
  });

  describe("completePomodoro", () => {
    it("returns the break boundary and badge evaluation with the block", async () => {
      postResponse = {
        status: 200,
        data: {
          message: "ok",
          block: BREAK_BLOCK,
          breakDuration: 5,
          breakEndsAt: "2026-08-05T10:30:00.000Z",
          isLongBreak: false,
          xpAwarded: 10,
          badgeEvaluation: { status: "failed", retryable: true },
        },
      };
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));

      let outcome: Awaited<ReturnType<HookState["completePomodoro"]>> | undefined;
      await act(async () => {
        outcome = await latest?.completePomodoro(1, 102);
      });

      expect(outcome?.status).toBe("success");
      if (outcome?.status !== "success") return;
      expect(outcome.data).toEqual({
        block: BREAK_BLOCK,
        breakDuration: 5,
        breakEndsAt: "2026-08-05T10:30:00.000Z",
        isLongBreak: false,
        xpAwarded: 10,
        badgeEvaluation: { status: "failed", retryable: true },
      });
      expect(latest?.currentPomodoro?.status).toBe("ON_BREAK");
    });

    it("reconciles a lost block completion claim instead of reporting a rejection", async () => {
      postResponse = {
        status: 500,
        data: {
          error:
            "No se pudo confirmar la finalización del bloque. Recarga el estado.",
        },
      };
      await renderHookProbe();
      await hydrate(detail("ACTIVE", WORK_BLOCK));
      currentDetail = detail("ACTIVE", BREAK_BLOCK);

      let outcome: Awaited<ReturnType<HookState["completePomodoro"]>> | undefined;
      await act(async () => {
        outcome = await latest?.completePomodoro(1, 102);
      });

      expect(outcome?.status).toBe("success");
      if (outcome?.status !== "success") return;
      expect(outcome.snapshot?.phase).toBe("BREAK");
      expect(outcome.data.block?.status).toBe("ON_BREAK");
      expect(postCalls()).toEqual([
        "post:/intensive-sessions/1/pomodoro/102/complete",
      ]);
      expect(latest?.error).toBeNull();
    });

    for (const code of ["COMPLETION_UNCONFIRMED", "BLOCK_NOT_ACTIVE"]) {
      it(`confirms a block already on break behind a ${code} conflict`, async () => {
        postResponse = conflict(code);
        await renderHookProbe();
        await hydrate(detail("ACTIVE", WORK_BLOCK));
        currentDetail = detail("ACTIVE", BREAK_BLOCK);

        let outcome: BlockOutcome | undefined;
        await act(async () => {
          outcome = await latest?.completePomodoro(1, 102);
        });

        expect(outcome?.status).toBe("success");
        if (outcome?.status !== "success") return;
        expect(outcome.snapshot?.phase).toBe("BREAK");
        expect(postCalls()).toEqual([
          "post:/intensive-sessions/1/pomodoro/102/complete",
        ]);
        expect(latest?.error).toBeNull();
      });
    }
  });
});
