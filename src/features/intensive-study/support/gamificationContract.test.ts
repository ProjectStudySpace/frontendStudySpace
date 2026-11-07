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
  type GamificationStats,
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

describe("badge catalog", () => {
  it("matches the backend BadgeType enum", () => {
    expect(Object.values(BadgeType)).toEqual([
      "POMODORO_NOVICE",
      "POMODORO_FOCUSED",
      "POMODORO_MASTER",
      "POMODORO_LEGEND",
      "STREAK_ON_FIRE",
      "STREAK_UNSTOPPABLE",
      "STREAK_LEGEND",
      "XP_BEGINNER",
      "XP_INTERMEDIATE",
      "XP_ADVANCED",
      "XP_EXPERT",
      "EARLY_BIRD",
      "NIGHT_OWL",
      "NEVER_GIVE_UP",
      "PERFECTIONIST",
      "TOPIC_MASTERY",
    ]);
  });

  it("uses the backend thresholds as badge requirements", () => {
    const requirements = Object.fromEntries(
      Object.entries(BADGE_CONFIG).map(([type, config]) => [
        type,
        config.requirement,
      ]),
    );

    expect(requirements).toEqual({
      POMODORO_NOVICE: 5,
      POMODORO_FOCUSED: 25,
      POMODORO_MASTER: 100,
      POMODORO_LEGEND: 500,
      STREAK_ON_FIRE: 7,
      STREAK_UNSTOPPABLE: 30,
      STREAK_LEGEND: 100,
      XP_BEGINNER: 1000,
      XP_INTERMEDIATE: 10000,
      XP_ADVANCED: 50000,
      XP_EXPERT: 100000,
      EARLY_BIRD: 10,
      NIGHT_OWL: 10,
      NEVER_GIVE_UP: 10,
      PERFECTIONIST: 7,
      TOPIC_MASTERY: 30,
    });
  });

  it("marks NIGHT_OWL as retired so it is only shown when already earned", () => {
    const retired = Object.entries(BADGE_CONFIG)
      .filter(([, config]) => config.retired)
      .map(([type]) => type);

    expect(retired).toEqual(["NIGHT_OWL"]);
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

  it("states each badge requirement in its copy", () => {
    const describe = (locale: unknown, type: BadgeType) =>
      String(lookup(locale, BADGE_CONFIG[type].descriptionKey));

    for (const locale of [en, es]) {
      expect(describe(locale, BadgeType.EARLY_BIRD)).toContain("8:00");
      expect(describe(locale, BadgeType.POMODORO_LEGEND)).toContain("500");
      expect(describe(locale, BadgeType.STREAK_ON_FIRE)).toContain("7");
      expect(describe(locale, BadgeType.XP_BEGINNER)).toMatch(/1[.,]?000/);
      expect(describe(locale, BadgeType.PERFECTIONIST)).toContain("7");
      expect(describe(locale, BadgeType.TOPIC_MASTERY)).toContain("30");
    }
    expect(describe(en, BadgeType.NIGHT_OWL)).toContain("9:00");
    expect(describe(es, BadgeType.NIGHT_OWL)).toContain("21:00");
  });
});

describe("gamification stats contract", () => {
  it("types GET /api/gamification/stats with the backend fields", () => {
    // Compile-time contract: `npm run build` fails if the fields drift.
    const stats: GamificationStats = {
      totalXp: 1200,
      todayXp: 15,
      weekXp: 300,
      level: 4,
      levelProgress: 40,
      xpToNextLevel: 300,
      xpForCurrentLevel: 1000,
      currentStreak: 3,
      longestStreak: 9,
      lastStudyDate: "2026-10-28T00:00:00.000Z",
      pomodorosCompleted: 30,
      sessionsCompleted: 8,
      sessionsAbandoned: 1,
      completionRate: 89,
      badges: [],
      badgeCount: 0,
      recentXp: [],
    };

    expect(stats.levelProgress).toBe(40);
  });
});
