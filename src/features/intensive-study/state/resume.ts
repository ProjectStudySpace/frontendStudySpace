/**
 * Pure derivation of the resume state for intensive sessions.
 *
 * Every value here is derived from authoritative backend data. The client never
 * fabricates a block, a card or a timer: when the backend does not provide the
 * absolute anchors, the corresponding value is `null` and the UI stays inert.
 */
import {
  IntensiveResumeSnapshot,
  IntensiveSessionCard,
  IntensiveSessionDetail,
  IntensiveTimerDescriptor,
  PomodoroBlock,
  PomodoroStatus,
  ResumePhase,
  SessionStatus,
  BreakType,
} from "../../../types/intensiveSessions";

/** Views the page can render for a resumed session. */
export type ResumeView = "CONFIG" | "READY" | "ACTIVE" | "BREAK" | "PAUSED";

/** Only canonical ACTIVE and PAUSED sessions can be discovered and resumed. */
export function isResumableSession(status: SessionStatus | string): boolean {
  return status === SessionStatus.ACTIVE || status === SessionStatus.PAUSED;
}

function belongsToSession(
  block: PomodoroBlock | null | undefined,
  sessionId: number,
): boolean {
  return Boolean(block) && block?.sessionId === sessionId;
}

/**
 * Select the block the session must resume on.
 * Preference order: authoritative `activeBlock` envelope, live block
 * (ACTIVE/ON_BREAK), then the earliest interrupted PENDING block.
 * Blocks owned by another session are always discarded.
 */
export function selectResumeBlock(
  session: IntensiveSessionDetail,
  activeBlock: PomodoroBlock | null,
): PomodoroBlock | null {
  if (belongsToSession(activeBlock, session.id)) {
    return activeBlock;
  }

  const ownedBlocks = (session.pomodoroBlocks || []).filter((block) =>
    belongsToSession(block, session.id),
  );

  const liveBlock = ownedBlocks.find(
    (block) =>
      block.status === PomodoroStatus.ACTIVE ||
      block.status === PomodoroStatus.ON_BREAK,
  );
  if (liveBlock) {
    return liveBlock;
  }

  const pendingBlocks = ownedBlocks
    .filter((block) => block.status === PomodoroStatus.PENDING)
    .sort((a, b) => a.blockNumber - b.blockNumber);

  return pendingBlocks[0] || null;
}

/** Derive the resume phase from the authoritative session and block statuses. */
export function deriveResumePhase(
  session: IntensiveSessionDetail,
  block: PomodoroBlock | null,
): ResumePhase {
  if (
    session.status === SessionStatus.COMPLETED ||
    session.status === SessionStatus.ABANDONED
  ) {
    return "TERMINAL";
  }

  if (session.status === SessionStatus.PAUSED) {
    return "PAUSED";
  }

  if (session.status === SessionStatus.ACTIVE) {
    if (block?.status === PomodoroStatus.ON_BREAK) {
      return "BREAK";
    }
    if (block?.status === PomodoroStatus.ACTIVE) {
      return "ACTIVE";
    }
  }

  return "READY";
}

function toEpoch(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const epoch = Date.parse(value);
  return Number.isFinite(epoch) ? epoch : null;
}

function timerPhaseFor(
  block: PomodoroBlock,
  isBreak: boolean,
): IntensiveTimerDescriptor["phase"] {
  if (!isBreak) {
    return "WORK";
  }
  return block.breakType === BreakType.LONG ? "LONG_BREAK" : "SHORT_BREAK";
}

/**
 * Build the absolute timer descriptor for the running phase.
 * Returns `null` for phases without a live timer and whenever the backend
 * anchors are incomplete, so no duration is ever invented client-side.
 */
export function buildTimerDescriptor(
  block: PomodoroBlock | null,
  phase: ResumePhase,
): IntensiveTimerDescriptor | null {
  if (!block || (phase !== "ACTIVE" && phase !== "BREAK")) {
    return null;
  }

  const isBreak = phase === "BREAK";
  const startedAt = isBreak ? block.breakStartedAt : block.startedAt;
  const declaredEndsAt = isBreak ? block.breakEndsAt : block.endsAt;
  const declaredMinutes = isBreak
    ? block.breakDurationMinutes
    : block.durationMinutes;
  const declaredSeconds = isBreak ? block.breakDuration : block.duration;

  const startEpoch = toEpoch(startedAt);
  if (!startedAt || startEpoch === null) {
    return null;
  }

  // An explicit backend boundary always wins over a declared duration.
  const endEpoch = toEpoch(declaredEndsAt);
  const durationSeconds =
    endEpoch !== null
      ? Math.round((endEpoch - startEpoch) / 1000)
      : declaredMinutes !== undefined && declaredMinutes !== null
        ? declaredMinutes * 60
        : (declaredSeconds ?? null);

  if (
    durationSeconds === null ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return null;
  }

  return {
    phase: timerPhaseFor(block, isBreak),
    startedAt,
    endsAt:
      declaredEndsAt && endEpoch !== null
        ? declaredEndsAt
        : new Date(startEpoch + durationSeconds * 1000).toISOString(),
    durationSeconds,
  };
}

export interface BuildResumeSnapshotInput {
  session: IntensiveSessionDetail | null | undefined;
  activeBlock: PomodoroBlock | null;
  card: IntensiveSessionCard | null;
  /** Authenticated user id; `User.id` is a string while session ids are numbers. */
  userId: number | string | null;
}

/** Compare identities that the app models as string (auth) and number (session). */
function isSameIdentity(
  sessionUserId: number | undefined | null,
  userId: number | string | null,
): boolean {
  if (userId === null || sessionUserId === undefined || sessionUserId === null) {
    return true;
  }
  return String(sessionUserId) === String(userId);
}

/**
 * Assemble the resume snapshot, enforcing session and block ownership.
 * Returns `null` when the payload cannot be trusted for this user.
 */
export function buildResumeSnapshot({
  session,
  activeBlock,
  card,
  userId,
}: BuildResumeSnapshotInput): IntensiveResumeSnapshot | null {
  if (!session) {
    return null;
  }

  if (!isSameIdentity(session.userId, userId)) {
    return null;
  }

  const block = selectResumeBlock(session, activeBlock);
  const phase = deriveResumePhase(session, block);
  const ownedCard =
    phase === "ACTIVE" && card && card.sessionId === session.id ? card : null;

  return {
    phase,
    session,
    block,
    card: ownedCard,
    timer: buildTimerDescriptor(block, phase),
  };
}

/** Map a resume phase to the page view. Terminal sessions never become actionable. */
export function resumeViewFor(phase: ResumePhase): ResumeView {
  switch (phase) {
    case "ACTIVE":
      return "ACTIVE";
    case "BREAK":
      return "BREAK";
    case "PAUSED":
      return "PAUSED";
    case "READY":
      return "READY";
    case "TERMINAL":
    default:
      return "CONFIG";
  }
}

/**
 * The "block complete" panel is only truthful once hydration finished; before
 * that, a missing card only means the authoritative card is still unknown.
 */
export function shouldShowBlockComplete({
  hydrated,
  card,
}: {
  hydrated: boolean;
  card: IntensiveSessionCard | null;
}): boolean {
  return hydrated && !card;
}
