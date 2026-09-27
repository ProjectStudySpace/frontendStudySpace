/**
 * Registration rejects a null, empty or non-IANA timezone with a 400, so the
 * browser timezone must always resolve to a usable IANA name.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { getUserTimezone } from "../../../utils/dateUtils";

function browserTimezone(timeZone: unknown) {
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
    timeZone,
  } as unknown as Intl.ResolvedDateTimeFormatOptions);
}

describe("getUserTimezone", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the browser timezone when it is a valid IANA name", () => {
    browserTimezone("America/Bogota");

    expect(getUserTimezone()).toBe("America/Bogota");
  });

  for (const unusable of [undefined, null, "", "   ", "Not/AZone"]) {
    it(`falls back to UTC when the browser reports ${JSON.stringify(unusable)}`, () => {
      browserTimezone(unusable);

      expect(getUserTimezone()).toBe("UTC");
    });
  }

  it("falls back to UTC when Intl cannot resolve options at all", () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(
      () => {
        throw new Error("Intl unavailable");
      },
    );

    expect(getUserTimezone()).toBe("UTC");
  });
});
