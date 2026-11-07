/**
 * The achievements panel on /progress reads `GET /gamification/stats` and
 * renders the level/XP/streak summary plus the full backend badge catalog:
 * earned badges highlighted with their date, locked ones dimmed with their
 * requirement, retired badges only when earned, and TOPIC_MASTERY listing
 * every mastered topic. A failed read shows a retry, never a crash.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../../utils/axiosConfig";
import {
  installSettlingAdapter,
  type TestResponse,
} from "../../intensive-study/api/testAxios";
import {
  BADGE_CONFIG,
  BadgeType,
  type GamificationStats,
  type UserBadge,
} from "../../../types/gamification";
import AchievementsPanel from "./AchievementsPanel";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

function badge(
  id: number,
  badgeType: BadgeType,
  overrides: Partial<UserBadge> = {},
): UserBadge {
  return {
    id,
    userId: 10,
    badgeType,
    earnedAt: "2026-10-20T12:00:00.000Z",
    topicId: null,
    metadata: null,
    ...overrides,
  };
}

function stats(overrides: Partial<GamificationStats> = {}): GamificationStats {
  return {
    totalXp: 1234,
    todayXp: 15,
    weekXp: 300,
    level: 4,
    levelProgress: 40,
    xpToNextLevel: 321,
    xpForCurrentLevel: 1000,
    currentStreak: 6,
    longestStreak: 17,
    lastStudyDate: "2026-10-28T00:00:00.000Z",
    pomodorosCompleted: 30,
    sessionsCompleted: 8,
    sessionsAbandoned: 1,
    completionRate: 89,
    badges: [],
    badgeCount: 0,
    recentXp: [],
    ...overrides,
  };
}

let root: Root | null = null;
let container: HTMLDivElement;
let calls: string[];
let responses: TestResponse[];

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(React.createElement(AchievementsPanel));
  });
  await flush();
}

function respondWith(...next: TestResponse[]) {
  responses = next;
}

function badgeCard(type: BadgeType): HTMLElement | null {
  return container.querySelector(`[data-badge="${type}"]`);
}

function summaryValue(name: string): string | undefined {
  return (
    container.querySelector(`[data-summary="${name}"]`)?.textContent ??
    undefined
  );
}

describe("AchievementsPanel", () => {
  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    document.body.innerHTML = "";
    calls = [];
    responses = [{ status: 200, data: stats() }];
    installSettlingAdapter(api, (config) => {
      calls.push(`${config.method}:${config.url}`);
      return responses.length > 1 ? responses.shift()! : responses[0];
    });
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
      root = null;
    }
    delete api.defaults.adapter;
    document.body.innerHTML = "";
  });

  it("reads the stats endpoint and shows level, XP progress and streaks", async () => {
    await render();

    expect(calls).toEqual(["get:/gamification/stats"]);
    expect(summaryValue("level")).toBe("4");
    expect(summaryValue("totalXp")).toContain("1,234");
    expect(summaryValue("xpToNextLevel")).toContain("321");
    expect(summaryValue("currentStreak")).toBe("6");
    expect(summaryValue("longestStreak")).toBe("17");
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute("aria-valuenow")).toBe("40");
  });

  it("renders every active catalog badge in enum order, earned ones highlighted with their date", async () => {
    respondWith({
      status: 200,
      data: stats({
        badges: [badge(1, BadgeType.STREAK_ON_FIRE)],
        badgeCount: 1,
      }),
    });
    await render();

    const rendered = Array.from(
      container.querySelectorAll<HTMLElement>("[data-badge]"),
    ).map((el) => el.dataset.badge);
    const expected = Object.values(BadgeType).filter(
      (type) => !BADGE_CONFIG[type].retired,
    );
    expect(rendered).toEqual(expected);

    const earned = badgeCard(BadgeType.STREAK_ON_FIRE);
    expect(earned?.dataset.state).toBe("earned");
    expect(earned?.textContent).toContain(
      "gamification.badges.streakOnFire.name",
    );
    expect(earned?.textContent).toContain("gamification.badges.earned");
    expect(earned?.textContent).toContain(
      new Date("2026-10-20T12:00:00.000Z").toLocaleDateString("en"),
    );
  });

  it("renders locked badges dimmed with their requirement description", async () => {
    await render();

    const locked = badgeCard(BadgeType.PERFECTIONIST);
    expect(locked?.dataset.state).toBe("locked");
    expect(locked?.className).toContain("opacity-");
    expect(locked?.textContent).toContain(
      "gamification.badges.perfectionist.description",
    );
    expect(locked?.textContent).toContain("gamification.badges.locked");
  });

  it("hides the retired NIGHT_OWL badge when it was never earned", async () => {
    await render();

    expect(badgeCard(BadgeType.NIGHT_OWL)).toBeNull();
  });

  it("shows the retired NIGHT_OWL badge when it was earned", async () => {
    respondWith({
      status: 200,
      data: stats({ badges: [badge(2, BadgeType.NIGHT_OWL)], badgeCount: 1 }),
    });
    await render();

    const owl = badgeCard(BadgeType.NIGHT_OWL);
    expect(owl?.dataset.state).toBe("earned");
    const order = Array.from(
      container.querySelectorAll<HTMLElement>("[data-badge]"),
    ).map((el) => el.dataset.badge);
    expect(order.indexOf(BadgeType.NIGHT_OWL)).toBe(
      order.indexOf(BadgeType.EARLY_BIRD) + 1,
    );
  });

  it("lists every mastered topic under one earned TOPIC_MASTERY badge", async () => {
    respondWith({
      status: 200,
      data: stats({
        badges: [
          badge(3, BadgeType.TOPIC_MASTERY, {
            topicId: 7,
            metadata: { topicName: "Biology" },
          }),
          badge(4, BadgeType.TOPIC_MASTERY, {
            topicId: 8,
            metadata: { topicName: "Chemistry" },
          }),
        ],
        badgeCount: 2,
      }),
    });
    await render();

    expect(
      container.querySelectorAll(`[data-badge="${BadgeType.TOPIC_MASTERY}"]`),
    ).toHaveLength(1);
    const mastery = badgeCard(BadgeType.TOPIC_MASTERY);
    expect(mastery?.dataset.state).toBe("earned");
    expect(mastery?.textContent).toContain("Biology");
    expect(mastery?.textContent).toContain("Chemistry");
  });

  it("shows an error with a retry that reads the stats again", async () => {
    respondWith(
      { status: 500, data: { error: "boom" } },
      { status: 200, data: stats() },
    );
    await render();

    expect(container.textContent).toContain(
      "gamification.achievements.loadError",
    );
    expect(container.querySelector("[data-badge]")).toBeNull();

    const retry = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "gamification.achievements.retry",
    );
    expect(retry).toBeDefined();
    await act(async () => {
      retry?.click();
    });
    await flush();

    expect(calls).toEqual([
      "get:/gamification/stats",
      "get:/gamification/stats",
    ]);
    expect(summaryValue("level")).toBe("4");
  });

  it("shows a loading indicator until the stats arrive", async () => {
    let release: (response: TestResponse) => void = () => {};
    installSettlingAdapter(
      api,
      () => new Promise<TestResponse>((resolve) => (release = resolve)),
    );
    await render();

    expect(
      container.querySelector('[role="status"]')?.getAttribute("aria-label"),
    ).toBe("gamification.achievements.loading");
    expect(container.querySelector("[data-badge]")).toBeNull();

    await act(async () => release({ status: 200, data: stats() }));
    await flush();

    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(summaryValue("level")).toBe("4");
  });

  it("treats a malformed stats payload as an error instead of crashing", async () => {
    respondWith({ status: 200, data: { totalXp: 5 } });
    await render();

    expect(container.textContent).toContain(
      "gamification.achievements.loadError",
    );
  });
});
