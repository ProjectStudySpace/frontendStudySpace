/**
 * Rules that decide whether an intensive command really landed and whether its
 * failure must be shown to the user.
 *
 * A command that was rejected or lost must never move the local lifecycle, and
 * its error must be actionable outside the CONFIG view.
 */
import { describe, expect, it } from "vitest";
import type { IntensiveError } from "../api/errors";
import {
  isAmbiguousFailure,
  isCommandConfirmed,
  isSessionUnavailable,
  isUnconfirmedCommandFailure,
  isUnconfirmedStartFailure,
  selectVisibleIntensiveError,
  sessionUnavailableError,
  type IntensiveCommand,
} from "./mutationOutcome";

function error(overrides: Partial<IntensiveError> = {}): IntensiveError {
  return {
    kind: "business",
    message: "Command rejected",
    status: 409,
    code: null,
    path: null,
    method: null,
    raw: null,
    ...overrides,
  };
}

describe("isAmbiguousFailure", () => {
  it("treats a network failure as ambiguous because the command may have landed", () => {
    expect(isAmbiguousFailure(error({ kind: "network", status: null }))).toBe(
      true,
    );
  });

  it("treats an unknown failure as ambiguous", () => {
    expect(isAmbiguousFailure(error({ kind: "unknown", status: null }))).toBe(
      true,
    );
  });

  it("treats an HTTP business failure as a confirmed rejection", () => {
    expect(isAmbiguousFailure(error({ kind: "business", status: 409 }))).toBe(
      false,
    );
  });

  it("treats an auth failure as a confirmed rejection", () => {
    expect(isAmbiguousFailure(error({ kind: "auth", status: 401 }))).toBe(false);
  });
});

describe("isUnconfirmedCommandFailure", () => {
  it("treats a 5xx on a completion command as unconfirmed because the backend may have committed it", () => {
    // A lost completion claim answers 500 with no code: the commit may have landed.
    expect(
      isUnconfirmedCommandFailure("COMPLETE", error({ kind: "business", status: 500 })),
    ).toBe(true);
    expect(
      isUnconfirmedCommandFailure(
        "COMPLETE_BLOCK",
        error({ kind: "business", status: 503 }),
      ),
    ).toBe(true);
  });

  it("keeps a 4xx on a completion command as a confirmed rejection", () => {
    expect(
      isUnconfirmedCommandFailure("COMPLETE", error({ kind: "business", status: 409 })),
    ).toBe(false);
  });

  it("keeps a 5xx on a non-completion command as a confirmed rejection", () => {
    for (const command of ["PAUSE", "ABANDON", "END_BREAK", "SKIP_BREAK"] as const) {
      expect(
        isUnconfirmedCommandFailure(command, error({ kind: "business", status: 500 })),
      ).toBe(false);
    }
  });

  it("still treats a response-less failure as unconfirmed for every command", () => {
    expect(
      isUnconfirmedCommandFailure("PAUSE", error({ kind: "network", status: null })),
    ).toBe(true);
  });

  it("reconciles a coded lost completion claim on both completion commands", () => {
    const lost = error({ status: 409, code: "COMPLETION_UNCONFIRMED" });
    expect(isUnconfirmedCommandFailure("COMPLETE", lost)).toBe(true);
    expect(isUnconfirmedCommandFailure("COMPLETE_BLOCK", lost)).toBe(true);
  });

  it("reloads the authoritative state when the completion target is no longer active", () => {
    // The target may already be in the state the command wanted to reach.
    expect(
      isUnconfirmedCommandFailure(
        "COMPLETE",
        error({ status: 409, code: "SESSION_NOT_ACTIVE" }),
      ),
    ).toBe(true);
    expect(
      isUnconfirmedCommandFailure(
        "COMPLETE_BLOCK",
        error({ status: 409, code: "BLOCK_NOT_ACTIVE" }),
      ),
    ).toBe(true);
  });

  it("keeps business rule codes and codes of other commands as confirmed rejections", () => {
    expect(
      isUnconfirmedCommandFailure("COMPLETE", error({ code: "PENDING_CARDS" })),
    ).toBe(false);
    expect(
      isUnconfirmedCommandFailure("COMPLETE", error({ code: "BLOCK_NOT_ACTIVE" })),
    ).toBe(false);
    expect(
      isUnconfirmedCommandFailure(
        "COMPLETE_BLOCK",
        error({ code: "SESSION_NOT_ACTIVE" }),
      ),
    ).toBe(false);
    for (const command of ["PAUSE", "ABANDON", "END_BREAK", "SKIP_BREAK"] as const) {
      expect(
        isUnconfirmedCommandFailure(
          command,
          error({ code: "COMPLETION_UNCONFIRMED" }),
        ),
      ).toBe(false);
    }
  });
});

describe("isUnconfirmedStartFailure", () => {
  it("reconciles a start whose outcome the backend could not confirm", () => {
    expect(
      isUnconfirmedStartFailure(error({ status: 409, code: "START_UNCONFIRMED" })),
    ).toBe(true);
  });

  it("reconciles a response-less start", () => {
    expect(
      isUnconfirmedStartFailure(error({ kind: "network", status: null })),
    ).toBe(true);
  });

  it("leaves other start conflicts and server errors to the caller", () => {
    for (const code of ["BLOCK_ALREADY_ACTIVE", "NO_CARDS_AVAILABLE", null]) {
      expect(isUnconfirmedStartFailure(error({ status: 409, code }))).toBe(false);
    }
    expect(isUnconfirmedStartFailure(error({ status: 500 }))).toBe(false);
  });
});

describe("isSessionUnavailable", () => {
  it("treats an uncoded 500 or a 404 from the session GET as an unavailable session", () => {
    expect(isSessionUnavailable(error({ status: 500 }))).toBe(true);
    expect(isSessionUnavailable(error({ status: 404 }))).toBe(true);
  });

  it("keeps gateway errors, coded errors and lost responses as a failed read", () => {
    expect(isSessionUnavailable(error({ status: 503 }))).toBe(false);
    expect(isSessionUnavailable(error({ status: 500, code: "X" }))).toBe(false);
    expect(
      isSessionUnavailable(error({ kind: "network", status: null })),
    ).toBe(false);
    expect(isSessionUnavailable(error({ kind: "auth", status: 401 }))).toBe(
      false,
    );
  });

  it("builds a coded unavailable error the caller can branch on", () => {
    const unavailable = sessionUnavailableError(error({ status: 500 }));
    expect(unavailable.code).toBe("SESSION_UNAVAILABLE");
    expect(unavailable.message).toBe("La sesión ya no está disponible.");
    expect(unavailable.status).toBe(500);
  });
});

describe("isCommandConfirmed", () => {
  it("confirms a pause only when the authoritative session is paused", () => {
    expect(isCommandConfirmed("PAUSE", "PAUSED")).toBe(true);
    expect(isCommandConfirmed("PAUSE", "ACTIVE")).toBe(false);
    expect(isCommandConfirmed("PAUSE", "BREAK")).toBe(false);
  });

  it("confirms abandon and complete only on a terminal session", () => {
    for (const command of ["ABANDON", "COMPLETE"] as const) {
      expect(isCommandConfirmed(command, "TERMINAL")).toBe(true);
      expect(isCommandConfirmed(command, "ACTIVE")).toBe(false);
      expect(isCommandConfirmed(command, "PAUSED")).toBe(false);
    }
  });

  it("confirms break commands only once the break is no longer running", () => {
    for (const command of ["END_BREAK", "SKIP_BREAK"] as const) {
      expect(isCommandConfirmed(command, "ACTIVE")).toBe(true);
      expect(isCommandConfirmed(command, "READY")).toBe(true);
      expect(isCommandConfirmed(command, "BREAK")).toBe(false);
      expect(isCommandConfirmed(command, "TERMINAL")).toBe(false);
    }
  });

  it("confirms a terminal command only for its own terminal status", () => {
    // An abandoned session is TERMINAL too, but it was never completed.
    expect(isCommandConfirmed("COMPLETE", "TERMINAL", "COMPLETED")).toBe(true);
    expect(isCommandConfirmed("COMPLETE", "TERMINAL", "ABANDONED")).toBe(false);
    expect(isCommandConfirmed("ABANDON", "TERMINAL", "ABANDONED")).toBe(true);
    expect(isCommandConfirmed("ABANDON", "TERMINAL", "COMPLETED")).toBe(false);
  });

  it("never confirms a command without an authoritative phase", () => {
    const commands: IntensiveCommand[] = [
      "PAUSE",
      "ABANDON",
      "COMPLETE",
      "COMPLETE_BLOCK",
      "END_BREAK",
      "SKIP_BREAK",
    ];
    for (const command of commands) {
      expect(isCommandConfirmed(command, null)).toBe(false);
    }
  });

  it("confirms COMPLETE_BLOCK only when the authoritative phase is BREAK", () => {
    expect(isCommandConfirmed("COMPLETE_BLOCK", "BREAK")).toBe(true);
    expect(isCommandConfirmed("COMPLETE_BLOCK", "ACTIVE")).toBe(false);
    expect(isCommandConfirmed("COMPLETE_BLOCK", "PAUSED")).toBe(false);
    expect(isCommandConfirmed("COMPLETE_BLOCK", "READY")).toBe(false);
    expect(isCommandConfirmed("COMPLETE_BLOCK", "TERMINAL")).toBe(false);
    expect(isCommandConfirmed("COMPLETE_BLOCK", null)).toBe(false);
  });
});

describe("selectVisibleIntensiveError", () => {
  const failure = { command: "PAUSE" as IntensiveCommand, message: "Sin red" };

  it("hides the banner in CONFIG so the existing config alert is not duplicated", () => {
    expect(
      selectVisibleIntensiveError({
        view: "CONFIG",
        commandFailure: failure,
        hookError: "Sin red",
      }),
    ).toBeNull();
  });

  it("surfaces a failed command in every actionable view", () => {
    for (const view of ["READY", "ACTIVE", "BREAK", "PAUSED"] as const) {
      expect(
        selectVisibleIntensiveError({
          view,
          commandFailure: failure,
          hookError: null,
        }),
      ).toEqual({ message: "Sin red", command: "PAUSE" });
    }
  });

  it("surfaces a terminal command failure in the results view", () => {
    expect(
      selectVisibleIntensiveError({
        view: "RESULTS",
        commandFailure: { command: "COMPLETE", message: "Sesión no completada" },
        hookError: null,
      }),
    ).toEqual({ message: "Sesión no completada", command: "COMPLETE" });
  });

  it("falls back to the hook error when no command failed", () => {
    expect(
      selectVisibleIntensiveError({
        view: "ACTIVE",
        commandFailure: null,
        hookError: "Error al obtener tarjeta",
      }),
    ).toEqual({ message: "Error al obtener tarjeta", command: null });
  });

  it("prefers the retryable command failure over the generic hook error", () => {
    expect(
      selectVisibleIntensiveError({
        view: "BREAK",
        commandFailure: { command: "END_BREAK", message: "Descanso no cerrado" },
        hookError: "Error al terminar descanso",
      }),
    ).toEqual({ message: "Descanso no cerrado", command: "END_BREAK" });
  });

  it("reports nothing when there is no error at all", () => {
    expect(
      selectVisibleIntensiveError({
        view: "ACTIVE",
        commandFailure: null,
        hookError: null,
      }),
    ).toBeNull();
  });
});
