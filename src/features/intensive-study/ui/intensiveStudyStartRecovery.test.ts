/**
 * A Pomodoro start the backend rejects must never strand the page.
 *
 * The start endpoint answers coded 409s: some mean the session already moved
 * on (reload it and adopt its phase), some mean nothing is left to start
 * (offer completing the session), and anything else stays retryable.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import IntensiveStudy from "../../../pages/IntensiveStudy";
import type { IntensiveError } from "../api/errors";
import type {
  IntensiveMutationOutcome,
  IntensiveSessionReload,
} from "../state/mutationOutcome";
import {
  PomodoroStatus,
  type IntensiveResumeSnapshot,
  type PomodoroBlock,
  type ResumePhase,
} from "../../../types/intensiveSessions";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const hook = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
const timer = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("../../../../hooks/useIntensiveSessions", () => ({
  useIntensiveSessions: () => hook.current,
}));

vi.mock("../../../../hooks/usePomodoroTimer", () => ({
  usePomodoroTimer: () => timer.current,
}));

vi.mock("../../../../hooks/useTopics", () => ({
  useTopics: () => ({ topics: [], fetchUserTopics: vi.fn(), loading: false }),
}));

const SESSION = {
  id: 1,
  userId: 10,
  status: PomodoroStatus.ACTIVE,
  totalCards: 8,
  completedCards: 0,
  totalPomodoros: 4,
  pomodoroBlocks: [],
  sessionCards: [],
};

function block(overrides: Partial<PomodoroBlock> = {}): PomodoroBlock {
  return {
    id: 11,
    sessionId: 1,
    blockNumber: 1,
    status: PomodoroStatus.ON_BREAK,
    durationMinutes: 25,
    ...overrides,
  } as PomodoroBlock;
}

function snapshot(
  phase: ResumePhase,
  overrides: Partial<IntensiveResumeSnapshot> = {},
): IntensiveResumeSnapshot {
  return {
    session: SESSION,
    block: phase === "ACTIVE" || phase === "BREAK" ? block() : null,
    card: null,
    phase,
    timer: null,
    ...overrides,
  } as unknown as IntensiveResumeSnapshot;
}

function startError(overrides: Partial<IntensiveError> = {}): IntensiveError {
  return {
    kind: "business",
    message: "Conflicto al iniciar",
    status: 409,
    code: null,
    path: null,
    method: null,
    raw: null,
    ...overrides,
  };
}

function failedStart(
  overrides: Partial<IntensiveError> = {},
): IntensiveMutationOutcome<PomodoroBlock> {
  return { status: "failed", error: startError(overrides) };
}

function found(phase: ResumePhase, overrides = {}): IntensiveSessionReload {
  return { status: "found", snapshot: snapshot(phase, overrides) };
}

let root: Root | null = null;
let container: HTMLDivElement;

function installHook() {
  hook.current = {
    sessions: [],
    currentSession: SESSION,
    currentPomodoro: block(),
    currentCard: null,
    loading: false,
    error: null,
    createSession: vi.fn(),
    fetchSessions: vi.fn(),
    fetchSessionDetail: vi.fn(),
    startSession: vi.fn(),
    pauseSession: vi.fn(),
    abandonSession: vi.fn(),
    getAbandonInfo: vi.fn(),
    completeSession: vi.fn(),
    retryCompleteSession: vi.fn(),
    retryAbandonSession: vi.fn(),
    getActiveSession: vi.fn(async () => ({ id: 1 })),
    rehydrateSession: vi.fn(),
    reloadSession: vi.fn(),
    resumeFromPause: vi.fn(),
    startPomodoro: vi.fn(),
    completePomodoro: vi.fn(),
    endBreak: vi.fn(),
    skipBreak: vi.fn(async () => ({
      status: "success",
      data: null,
      snapshot: null,
    })),
    getNextCard: vi.fn(async () => ({
      card: null,
      blockComplete: false,
      block: null,
      sessionComplete: false,
    })),
    completeCard: vi.fn(),
    clearError: vi.fn(),
  };
}

function installTimer() {
  timer.current = {
    timeRemaining: 0,
    totalTime: 300,
    phase: "SHORT_BREAK",
    blockNumber: 1,
    isRunning: false,
    completionTick: 0,
    transitionTo: vi.fn(),
    setBlockNumber: vi.fn(),
    setPhase: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    syncWithBackend: vi.fn(),
  };
}

const fn = (name: string) => hook.current[name] as ReturnType<typeof vi.fn>;
const timerFn = (name: string) =>
  timer.current[name] as ReturnType<typeof vi.fn>;

function text(): string {
  return container.textContent ?? "";
}

function findButton(label: string): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find((button) =>
    button.textContent?.includes(label),
  );
}

async function click(label: string) {
  const button = findButton(label);
  if (!button) {
    throw new Error(`No button labelled ${label}`);
  }
  await act(async () => {
    button.click();
  });
}

async function renderPage() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(React.createElement(IntensiveStudy));
  });
}

/** Enter a view through the existing continue-session resume path. */
async function resumeInto(phase: ResumePhase) {
  fn("rehydrateSession").mockResolvedValue(snapshot(phase));
  await renderPage();
  await click("intensiveStudy.continueSession");
}

describe("IntensiveStudy start recovery", () => {
  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    document.body.innerHTML = "";
    installHook();
    installTimer();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
      root = null;
    }
    document.body.innerHTML = "";
  });

  it("resumes the already active block instead of stranding the ready view", async () => {
    await resumeInto("READY");
    fn("startPomodoro").mockResolvedValue(
      failedStart({ code: "BLOCK_ALREADY_ACTIVE" }),
    );
    fn("reloadSession").mockResolvedValue(
      found("ACTIVE", { block: block({ status: PomodoroStatus.ACTIVE, blockNumber: 2 }) }),
    );

    await click("intensiveStudy.startPomodoro");

    expect(fn("startPomodoro")).toHaveBeenCalledTimes(1);
    expect(fn("reloadSession")).toHaveBeenCalledWith(1);
    expect(timerFn("setBlockNumber")).toHaveBeenLastCalledWith(2);
    expect(fn("getNextCard")).toHaveBeenCalledWith(1);
    expect(text()).toContain("intensiveStudy.cards");
    expect(text()).not.toContain("intensiveStudy.sessionReady");
  });

  it("stays on the authoritative break without advancing the block number", async () => {
    await resumeInto("BREAK");
    fn("startPomodoro").mockResolvedValue(
      failedStart({ code: "BLOCK_ON_BREAK" }),
    );
    fn("reloadSession").mockResolvedValue(found("BREAK"));

    await click("intensiveStudy.skipBreak");

    expect(fn("reloadSession")).toHaveBeenCalledWith(1);
    expect(timerFn("setBlockNumber")).not.toHaveBeenCalledWith(2);
    expect(text()).toContain("intensiveStudy.takeBreak");
  });

  it("adopts a paused session reported by SESSION_NOT_ACTIVE", async () => {
    await resumeInto("READY");
    fn("startPomodoro").mockResolvedValue(
      failedStart({ code: "SESSION_NOT_ACTIVE" }),
    );
    fn("reloadSession").mockResolvedValue(found("PAUSED"));

    await click("intensiveStudy.startPomodoro");

    expect(text()).toContain("intensiveStudy.sessionPaused");
  });

  it("does not offer a retry when the reloaded session is unavailable", async () => {
    await resumeInto("READY");
    fn("startPomodoro").mockResolvedValue(
      failedStart({ code: "SESSION_NOT_ACTIVE" }),
    );
    fn("reloadSession").mockResolvedValue({
      status: "unavailable",
      error: startError({
        code: "SESSION_UNAVAILABLE",
        message: "La sesión ya no está disponible.",
      }),
    });

    await click("intensiveStudy.startPomodoro");

    expect(fn("reloadSession")).toHaveBeenCalledWith(1);
    expect(findButton("intensiveStudy.retryCommand")).toBeUndefined();
    expect(text()).not.toContain("intensiveStudy.cards");
  });

  it.each(["NO_PENDING_BLOCKS", "NO_CARDS_AVAILABLE"])(
    "offers completing the session when a start answers %s",
    async (code) => {
      await resumeInto("BREAK");
      fn("startPomodoro").mockResolvedValue(failedStart({ code }));
      fn("completeSession").mockResolvedValue({
        status: "failed",
        error: startError({
          code: "PENDING_CARDS",
          message: "Aún tienes 2 tarjetas pendientes",
        }),
      });

      await click("intensiveStudy.skipBreak");

      expect(fn("reloadSession")).not.toHaveBeenCalled();
      expect(text()).toContain("intensiveStudy.startNoBlocksLeft");

      await click("intensiveStudy.actions.complete");

      expect(fn("completeSession")).toHaveBeenCalledWith(1);
      // PENDING_CARDS keeps the backend message visible and retryable.
      expect(text()).toContain("Aún tienes 2 tarjetas pendientes");
      expect(findButton("intensiveStudy.retryCommand")).toBeDefined();
    },
  );

  it("keeps a failed next-block start retryable and derives the block number from the started block", async () => {
    await resumeInto("BREAK");
    fn("startPomodoro")
      .mockResolvedValueOnce(
        failedStart({ kind: "network", status: null, message: "Network Error" }),
      )
      .mockResolvedValueOnce({
        status: "success",
        data: block({ id: 12, status: PomodoroStatus.ACTIVE, blockNumber: 2 }),
        snapshot: null,
      });
    fn("reloadSession").mockResolvedValue(found("READY"));

    await click("intensiveStudy.skipBreak");

    expect(text()).toContain("Network Error");
    expect(timerFn("setBlockNumber")).not.toHaveBeenCalledWith(2);

    await click("intensiveStudy.retryCommand");

    // The retry reads the session first and only then starts again.
    expect(fn("reloadSession")).toHaveBeenCalledWith(1);
    expect(fn("startPomodoro")).toHaveBeenCalledTimes(2);
    expect(timerFn("setBlockNumber")).toHaveBeenLastCalledWith(2);
    expect(timerFn("transitionTo")).toHaveBeenLastCalledWith(
      expect.objectContaining({ phase: "WORK" }),
    );
    expect(text()).toContain("intensiveStudy.cards");
    expect(text()).not.toContain("Network Error");
  });

  it("never replays a start the retry finds already landed", async () => {
    await resumeInto("BREAK");
    fn("startPomodoro").mockResolvedValue(
      failedStart({ kind: "network", status: null, message: "Network Error" }),
    );
    fn("reloadSession").mockResolvedValue(
      found("ACTIVE", { block: block({ status: PomodoroStatus.ACTIVE, blockNumber: 2 }) }),
    );

    await click("intensiveStudy.skipBreak");
    await click("intensiveStudy.retryCommand");

    expect(fn("startPomodoro")).toHaveBeenCalledTimes(1);
    expect(timerFn("setBlockNumber")).toHaveBeenLastCalledWith(2);
    expect(text()).toContain("intensiveStudy.cards");
  });
});
