import { describe, expect, it } from "vitest";
import {
  BreakType,
  CardDifficulty,
  IntensiveSessionCard,
  IntensiveSessionDetail,
  PomodoroBlock,
  PomodoroStatus,
  SessionStatus,
  StudyIntensity,
} from "../../../types/intensiveSessions";
import {
  buildResumeSnapshot,
  buildTimerDescriptor,
  deriveResumePhase,
  isResumableSession,
  resumeViewFor,
  selectResumeBlock,
  shouldShowBlockComplete,
} from "./resume";

const OWNER_ID = 10;

function makeBlock(overrides: Partial<PomodoroBlock> = {}): PomodoroBlock {
  return {
    id: 101,
    sessionId: 1,
    blockNumber: 1,
    status: PomodoroStatus.ACTIVE,
    breakType: BreakType.SHORT,
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    ...overrides,
  };
}

function makeSession(
  overrides: Partial<IntensiveSessionDetail> = {},
): IntensiveSessionDetail {
  return {
    id: 1,
    topicId: 7,
    userId: OWNER_ID,
    intensity: StudyIntensity.NORMAL,
    status: SessionStatus.ACTIVE,
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

function makeCard(
  overrides: Partial<IntensiveSessionCard> = {},
): IntensiveSessionCard {
  return {
    id: 501,
    sessionId: 1,
    cardId: 900,
    difficulty: CardDifficulty.MEDIUM,
    completed: false,
    order: 1,
    createdAt: "2026-08-05T09:59:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    ...overrides,
  };
}

describe("intensive resume derivation", () => {
  it("treats only canonical ACTIVE and PAUSED sessions as resumable", () => {
    expect(isResumableSession(SessionStatus.ACTIVE)).toBe(true);
    expect(isResumableSession(SessionStatus.PAUSED)).toBe(true);
    expect(isResumableSession(SessionStatus.CONFIGURING)).toBe(false);
    expect(isResumableSession(SessionStatus.COMPLETED)).toBe(false);
    expect(isResumableSession(SessionStatus.ABANDONED)).toBe(false);
  });

  it("selects the authoritative active block and ignores blocks of another session", () => {
    const session = makeSession({
      pomodoroBlocks: [
        makeBlock({ id: 900, sessionId: 99, status: PomodoroStatus.ACTIVE }),
        makeBlock({ id: 101, status: PomodoroStatus.ACTIVE }),
      ],
    });

    expect(selectResumeBlock(session, null)?.id).toBe(101);
  });

  it("prefers the explicit activeBlock envelope when it belongs to the session", () => {
    const session = makeSession({
      pomodoroBlocks: [makeBlock({ id: 101, status: PomodoroStatus.PENDING })],
    });
    const activeBlock = makeBlock({ id: 202, status: PomodoroStatus.ON_BREAK });

    expect(selectResumeBlock(session, activeBlock)?.id).toBe(202);
  });

  it("ignores a foreign activeBlock envelope", () => {
    const session = makeSession({ pomodoroBlocks: [] });
    const foreignBlock = makeBlock({ id: 202, sessionId: 42 });

    expect(selectResumeBlock(session, foreignBlock)).toBeNull();
  });

  it("falls back to the earliest interrupted PENDING block when nothing is active", () => {
    const session = makeSession({
      status: SessionStatus.PAUSED,
      pomodoroBlocks: [
        makeBlock({ id: 103, blockNumber: 3, status: PomodoroStatus.PENDING }),
        makeBlock({ id: 102, blockNumber: 2, status: PomodoroStatus.PENDING }),
        makeBlock({ id: 100, blockNumber: 1, status: PomodoroStatus.COMPLETED }),
      ],
    });

    expect(selectResumeBlock(session, null)?.id).toBe(102);
  });

  it("derives every resume phase from authoritative statuses", () => {
    const active = makeSession();
    expect(
      deriveResumePhase(active, makeBlock({ status: PomodoroStatus.ACTIVE })),
    ).toBe("ACTIVE");
    expect(
      deriveResumePhase(active, makeBlock({ status: PomodoroStatus.ON_BREAK })),
    ).toBe("BREAK");
    expect(
      deriveResumePhase(active, makeBlock({ status: PomodoroStatus.PENDING })),
    ).toBe("READY");
    expect(deriveResumePhase(active, null)).toBe("READY");
    expect(
      deriveResumePhase(
        makeSession({ status: SessionStatus.PAUSED }),
        makeBlock({ status: PomodoroStatus.PENDING }),
      ),
    ).toBe("PAUSED");
    expect(
      deriveResumePhase(makeSession({ status: SessionStatus.COMPLETED }), null),
    ).toBe("TERMINAL");
    expect(
      deriveResumePhase(makeSession({ status: SessionStatus.ABANDONED }), null),
    ).toBe("TERMINAL");
    expect(
      deriveResumePhase(
        makeSession({ status: SessionStatus.CONFIGURING }),
        null,
      ),
    ).toBe("READY");
  });

  it("builds an absolute work timer from startedAt and backend duration", () => {
    const timer = buildTimerDescriptor(
      makeBlock({
        startedAt: "2026-08-05T10:00:00.000Z",
        durationMinutes: 25,
      }),
      "ACTIVE",
    );

    expect(timer).toEqual({
      phase: "WORK",
      startedAt: "2026-08-05T10:00:00.000Z",
      endsAt: "2026-08-05T10:25:00.000Z",
      durationSeconds: 1500,
    });
  });

  it("prefers the backend absolute endsAt over a derived boundary", () => {
    const timer = buildTimerDescriptor(
      makeBlock({
        startedAt: "2026-08-05T10:00:00.000Z",
        endsAt: "2026-08-05T10:20:00.000Z",
      }),
      "ACTIVE",
    );

    expect(timer?.endsAt).toBe("2026-08-05T10:20:00.000Z");
    expect(timer?.durationSeconds).toBe(1200);
  });

  it("builds a long-break timer from the authoritative break anchors", () => {
    const timer = buildTimerDescriptor(
      makeBlock({
        status: PomodoroStatus.ON_BREAK,
        breakType: BreakType.LONG,
        startedAt: "2026-08-05T10:00:00.000Z",
        durationMinutes: 25,
        breakStartedAt: "2026-08-05T10:25:00.000Z",
        breakDurationMinutes: 15,
      }),
      "BREAK",
    );

    expect(timer).toEqual({
      phase: "LONG_BREAK",
      startedAt: "2026-08-05T10:25:00.000Z",
      endsAt: "2026-08-05T10:40:00.000Z",
      durationSeconds: 900,
    });
  });

  it("never fabricates a timer when the block has no absolute anchors", () => {
    expect(
      buildTimerDescriptor(makeBlock({ durationMinutes: 25 }), "ACTIVE"),
    ).toBeNull();
    expect(
      buildTimerDescriptor(
        makeBlock({ startedAt: "2026-08-05T10:00:00.000Z" }),
        "ACTIVE",
      ),
    ).toBeNull();
    expect(buildTimerDescriptor(null, "ACTIVE")).toBeNull();
    expect(
      buildTimerDescriptor(
        makeBlock({
          startedAt: "2026-08-05T10:00:00.000Z",
          durationMinutes: 25,
        }),
        "PAUSED",
      ),
    ).toBeNull();
  });

  it("builds a full ACTIVE snapshot with the assigned card", () => {
    const block = makeBlock({
      startedAt: "2026-08-05T10:00:00.000Z",
      durationMinutes: 25,
    });
    const session = makeSession({ pomodoroBlocks: [block] });

    const snapshot = buildResumeSnapshot({
      session,
      activeBlock: null,
      card: makeCard(),
      userId: OWNER_ID,
    });

    expect(snapshot?.phase).toBe("ACTIVE");
    expect(snapshot?.block?.id).toBe(101);
    expect(snapshot?.card?.id).toBe(501);
    expect(snapshot?.timer?.durationSeconds).toBe(1500);
  });

  it("drops a card that belongs to another session", () => {
    const block = makeBlock({
      startedAt: "2026-08-05T10:00:00.000Z",
      durationMinutes: 25,
    });
    const session = makeSession({ pomodoroBlocks: [block] });

    const snapshot = buildResumeSnapshot({
      session,
      activeBlock: null,
      card: makeCard({ sessionId: 77 }),
      userId: OWNER_ID,
    });

    expect(snapshot?.card).toBeNull();
  });

  it("rejects a session owned by another user", () => {
    const snapshot = buildResumeSnapshot({
      session: makeSession({ userId: 999 }),
      activeBlock: null,
      card: null,
      userId: OWNER_ID,
    });

    expect(snapshot).toBeNull();
  });

  it("accepts the owner when the auth id is a string and the session id is a number", () => {
    const snapshot = buildResumeSnapshot({
      session: makeSession(),
      activeBlock: null,
      card: null,
      userId: String(OWNER_ID),
    });

    expect(snapshot?.phase).toBe("READY");
  });

  it("rejects the legacy IN_PROGRESS session status during discovery", () => {
    expect(isResumableSession("IN_PROGRESS")).toBe(false);
  });

  it("maps resume phases to the page views without exposing terminal sessions", () => {
    expect(resumeViewFor("READY")).toBe("READY");
    expect(resumeViewFor("ACTIVE")).toBe("ACTIVE");
    expect(resumeViewFor("BREAK")).toBe("BREAK");
    expect(resumeViewFor("PAUSED")).toBe("PAUSED");
    expect(resumeViewFor("TERMINAL")).toBe("CONFIG");
  });

  it("hides the block-complete state until authoritative hydration finishes", () => {
    expect(
      shouldShowBlockComplete({
        hydrated: false,
        card: null,
        timeRemaining: 1500,
      }),
    ).toBe(false);
    expect(
      shouldShowBlockComplete({
        hydrated: true,
        card: null,
        timeRemaining: 1500,
      }),
    ).toBe(true);
    expect(
      shouldShowBlockComplete({
        hydrated: true,
        card: makeCard(),
        timeRemaining: 1500,
      }),
    ).toBe(false);
    expect(
      shouldShowBlockComplete({ hydrated: true, card: null, timeRemaining: 0 }),
    ).toBe(false);
  });
});
