/**
 * Outcome contract for the intensive commands that mutate a session lifecycle.
 *
 * `null` cannot express the difference between "the backend rejected this" and
 * "the request never reached the backend", so every command returns a
 * discriminated outcome instead. The caller may only move the local lifecycle
 * on `success`; an ambiguous failure is resolved by an authoritative GET, never
 * by replaying a non-idempotent POST.
 */
import type { IntensiveError } from "../api/errors";
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

/** Decide whether a command failure must be reconciled before it is trusted. */
export function isUnconfirmedCommandFailure(
  command: IntensiveCommand,
  error: IntensiveError,
): boolean {
  if (isAmbiguousFailure(error)) {
    return true;
  }
  return (
    COMPLETION_COMMANDS.has(command) &&
    error.status !== null &&
    error.status >= 500
  );
}

/** Decide whether an authoritative resume phase proves the command landed. */
export function isCommandConfirmed(
  command: IntensiveCommand,
  phase: ResumePhase | null,
): boolean {
  if (!phase) {
    return false;
  }

  switch (command) {
    case "PAUSE":
      return phase === "PAUSED";
    case "ABANDON":
    case "COMPLETE":
      return phase === "TERMINAL";
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
