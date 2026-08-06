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
  selectVisibleIntensiveError,
  type IntensiveCommand,
} from "./mutationOutcome";

function error(overrides: Partial<IntensiveError> = {}): IntensiveError {
  return {
    kind: "business",
    message: "Command rejected",
    status: 409,
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

  it("never confirms a command without an authoritative phase", () => {
    const commands: IntensiveCommand[] = [
      "PAUSE",
      "ABANDON",
      "COMPLETE",
      "END_BREAK",
      "SKIP_BREAK",
    ];
    for (const command of commands) {
      expect(isCommandConfirmed(command, null)).toBe(false);
    }
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
