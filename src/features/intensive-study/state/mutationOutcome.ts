/**
 * Outcome contract for the intensive commands that mutate a session lifecycle.
 *
 * `null` cannot express the difference between "the backend rejected this" and
 * "the request never reached the backend", so every command returns a
 * discriminated outcome instead. The caller may only move the local lifecycle
 * on `success`; an ambiguous failure is resolved by an authoritative GET, never
 * by replaying a non-idempotent POST.
 */
import { IntensiveErrorCode, type IntensiveError } from "../api/errors";
import type {
  IntensiveResumeSnapshot,
  ResumePhase,
} from "../../../types/intensiveSessions";

/** Commands whose failure must not advance the local lifecycle. */
export type IntensiveCommand =
  | "PAUSE"
  | "ABANDON"
  | "COMPLETE"
  | "COMPLETE_BLOCK"
  | "END_BREAK"
  | "SKIP_BREAK";

export type IntensiveMutationOutcome<T> =
  | {
      status: "success";
      data: T;
      /**
       * Present only when the success was established by authoritative
       * reconciliation, so the caller can rehydrate instead of guessing.
       */
      snapshot: IntensiveResumeSnapshot | null;
    }
  | { status: "failed"; error: IntensiveError };

/** A command failure the user can retry from the current view. */
export interface IntensiveCommandFailure {
  command: IntensiveCommand;
  message: string;
}

/**
 * A failure without an HTTP response may or may not have been applied by the
 * backend, so it must be reconciled instead of trusted.
 */
export function isAmbiguousFailure(error: IntensiveError): boolean {
  return error.kind === "network" || error.kind === "unknown";
}

/**
 * Completion commands commit inside a serializable transaction; when the claim
 * is lost the backend answers 5xx with no code even though the commit may have
 * landed. Only those commands treat a 5xx as unconfirmed, so every other
 * command keeps reporting a 5xx as a plain rejection.
 */
const COMPLETION_COMMANDS: ReadonlySet<IntensiveCommand> = new Set([
  "COMPLETE",
  "COMPLETE_BLOCK",
]);

/**
 * Coded conflicts that do not prove a completion failed: the claim was lost
 * after a possible commit, or the target already left the state the command
 * expects (possibly because this very command landed). Both are resolved by
 * reloading the authoritative session. Any other code is a real rejection.
 */
const RECONCILE_CODES: Partial<Record<IntensiveCommand, ReadonlySet<string>>> = {
  COMPLETE: new Set([
    IntensiveErrorCode.COMPLETION_UNCONFIRMED,
    IntensiveErrorCode.SESSION_NOT_ACTIVE,
  ]),
  COMPLETE_BLOCK: new Set([
    IntensiveErrorCode.COMPLETION_UNCONFIRMED,
    IntensiveErrorCode.BLOCK_NOT_ACTIVE,
  ]),
};

/** Decide whether a command failure must be reconciled before it is trusted. */
export function isUnconfirmedCommandFailure(
  command: IntensiveCommand,
  error: IntensiveError,
): boolean {
  if (isAmbiguousFailure(error)) {
    return true;
  }
  if (error.code !== null && RECONCILE_CODES[command]?.has(error.code)) {
    return true;
  }
  // Fallback for a backend that still answers a lost claim with an uncoded 5xx.
  return (
    COMPLETION_COMMANDS.has(command) &&
    error.status !== null &&
    error.status >= 500
  );
}

/**
 * A Pomodoro start may have landed when its response was lost or when the
 * backend reports it could not confirm the start. Other start conflicts are
 * definitive answers the caller handles on its own.
 */
export function isUnconfirmedStartFailure(error: IntensiveError): boolean {
  return (
    isAmbiguousFailure(error) ||
    error.code === IntensiveErrorCode.START_UNCONFIRMED
  );
}

export const SESSION_UNAVAILABLE_MESSAGE = "La sesión ya no está disponible.";

/**
 * The session GET answers an uncoded 500 (or a 404) when the session does not
 * exist or belongs to someone else. That is a definitive answer, unlike a lost
 * response or a gateway error, which only mean the read itself failed.
 */
export function isSessionUnavailable(error: IntensiveError): boolean {
  return (
    error.kind === "business" &&
    error.code === null &&
    (error.status === 404 || error.status === 500)
  );
}

/** Tag a failed session read so callers can branch on the unavailable case. */
export function sessionUnavailableError(error: IntensiveError): IntensiveError {
  return {
    ...error,
    code: IntensiveErrorCode.SESSION_UNAVAILABLE,
    message: SESSION_UNAVAILABLE_MESSAGE,
  };
}

/**
 * Decide whether an authoritative resume phase proves the command landed.
 * Terminal commands also need the session status when it is known, because
 * COMPLETED and ABANDONED both derive the TERMINAL phase.
 */
export function isCommandConfirmed(
  command: IntensiveCommand,
  phase: ResumePhase | null,
  sessionStatus?: string,
): boolean {
  if (!phase) {
    return false;
  }

  switch (command) {
    case "PAUSE":
      return phase === "PAUSED";
    case "ABANDON":
      return (
        phase === "TERMINAL" &&
        (sessionStatus === undefined || sessionStatus === "ABANDONED")
      );
    case "COMPLETE":
      return (
        phase === "TERMINAL" &&
        (sessionStatus === undefined || sessionStatus === "COMPLETED")
      );
    case "COMPLETE_BLOCK":
      // The backend moves the block ACTIVE -> ON_BREAK while the session
      // stays ACTIVE, which derives exactly the BREAK phase. A block still
      // ACTIVE proves the command never landed.
      return phase === "BREAK";
    case "END_BREAK":
    case "SKIP_BREAK":
      return phase === "ACTIVE" || phase === "READY";
    default:
      return false;
  }
}

export interface VisibleIntensiveErrorInput {
  view: string;
  commandFailure: IntensiveCommandFailure | null;
  hookError: string | null;
}

export interface VisibleIntensiveError {
  message: string;
  /** Non-null when the user can retry the exact command that failed. */
  command: IntensiveCommand | null;
}

/**
 * Choose the error to render outside CONFIG. CONFIG already owns its own alert,
 * so returning `null` there keeps a single local surface per error.
 */
export function selectVisibleIntensiveError({
  view,
  commandFailure,
  hookError,
}: VisibleIntensiveErrorInput): VisibleIntensiveError | null {
  if (view === "CONFIG") {
    return null;
  }

  if (commandFailure) {
    return { message: commandFailure.message, command: commandFailure.command };
  }

  if (hookError) {
    return { message: hookError, command: null };
  }

  return null;
}
