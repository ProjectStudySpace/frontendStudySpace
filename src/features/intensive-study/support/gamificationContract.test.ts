/**
 * Gamification enums must mirror the backend Prisma schema, and every value the
 * UI can render needs copy in both locales.
 */
import { describe, expect, it } from "vitest";
import en from "../../../i18n/locales/en.json";
import es from "../../../i18n/locales/es.json";
import {
  BADGE_CONFIG,
  BadgeType,
  XpTransactionType,
  type XpTransaction,
} from "../../../types/gamification";

const LOCALES = { en, es } as Record<string, unknown>;

function lookup(locale: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      locale,
    );
}

describe("XP transaction contract", () => {
  it("matches the backend XpTransactionType enum", () => {
    expect(Object.values(XpTransactionType)).toEqual([
      "CARD_COMPLETE",
      "POMODORO_COMPLETE",
      "SESSION_COMPLETE",
      "ALL_SESSIONS_COMPLETE",
      "LONG_BREAK_COMPLETE",
      "BADGE_EARNED",
      "STREAK_BONUS",
      "ABANDON_PENALTY",
    ]);
  });

  it("labels every transaction type in both locales", () => {
    for (const [name, locale] of Object.entries(LOCALES)) {
      for (const type of Object.values(XpTransactionType)) {
        expect(
          lookup(locale, `gamification.transactionTypes.${type}`),
          `${name}: ${type}`,
        ).toEqual(expect.any(String));
      }
    }
  });

  it("types a transaction with the backend columns", () => {
    // Compile-time contract: `npm run build` fails if the fields drift.
    const transaction: XpTransaction = {
      id: 1,
      userId: 10,
      amount: 50,
      type: XpTransactionType.SESSION_COMPLETE,
      multiplier: "1.25",
      finalAmount: 62,
      description: null,
      sessionId: 3,
      pomodoroId: null,
      cardId: null,
      badgeType: null,
      createdAt: "2026-08-05T11:00:00.000Z",
    };

    expect(transaction.finalAmount).toBe(62);
  });
});

describe("special badges", () => {
  it("includes the backend special badges", () => {
    expect(Object.values(BadgeType)).toEqual(
      expect.arrayContaining(["EARLY_BIRD", "NIGHT_OWL", "NEVER_GIVE_UP"]),
    );
  });

  it("requires 10 sessions for each special badge", () => {
    expect(BADGE_CONFIG[BadgeType.EARLY_BIRD].requirement).toBe(10);
    expect(BADGE_CONFIG[BadgeType.NIGHT_OWL].requirement).toBe(10);
    expect(BADGE_CONFIG[BadgeType.NEVER_GIVE_UP].requirement).toBe(10);
  });

  it("describes every configured badge in both locales", () => {
    for (const [name, locale] of Object.entries(LOCALES)) {
      for (const [type, config] of Object.entries(BADGE_CONFIG)) {
        expect(lookup(locale, config.nameKey), `${name}: ${type}`).toEqual(
          expect.any(String),
        );
        expect(lookup(locale, config.descriptionKey), `${name}: ${type}`).toEqual(
          expect.any(String),
        );
      }
    }
  });

  it("states the backend hour boundaries in the special badge copy", () => {
    const describe = (locale: unknown, type: BadgeType) =>
      String(lookup(locale, BADGE_CONFIG[type].descriptionKey));

    expect(describe(en, BadgeType.EARLY_BIRD)).toContain("8:00");
    expect(describe(es, BadgeType.EARLY_BIRD)).toContain("8:00");
    expect(describe(en, BadgeType.NIGHT_OWL)).toContain("9:00");
    expect(describe(es, BadgeType.NIGHT_OWL)).toContain("21:00");
  });
});
