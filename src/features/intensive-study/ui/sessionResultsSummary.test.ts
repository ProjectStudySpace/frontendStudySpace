/**
 * The results view renders the authoritative completion summary.
 *
 * The completion endpoint answers a bare session row, so recounting its
 * relations would always show zero cards and zero Pomodoros.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SessionResultsSummary from "../../../components/SessionResultsSummary";
import {
  IntradayReviewStatus,
  type IntradayReview,
} from "../../../types/intradayReviews";
import type {
  IntensiveSessionDetail,
  SessionCompletionSummary,
} from "../../../types/intensiveSessions";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

const BARE_SESSION = {
  id: 1,
  topicId: 7,
  userId: 10,
  intensity: "NORMAL",
  status: "COMPLETED",
  totalCards: 12,
  completedCards: 0,
  totalPomodoros: 4,
  completedPomodoros: 0,
  xpEarned: 0,
  createdAt: "2026-08-05T09:59:00.000Z",
  updatedAt: "2026-08-05T11:00:00.000Z",
  pomodoroBlocks: [],
  sessionCards: [],
} as unknown as IntensiveSessionDetail;

function review(overrides: Partial<IntradayReview> = {}): IntradayReview {
  return {
    id: 900,
    sessionId: 1,
    userId: 10,
    reviewNumber: 1,
    scheduledFor: "2026-08-05T12:00:00.000Z",
    cardCount: 5,
    status: IntradayReviewStatus.SCHEDULED,
    notificationSent: false,
    createdAt: "2026-08-05T11:00:00.000Z",
    ...overrides,
  };
}

function summary(
  overrides: Partial<SessionCompletionSummary> = {},
): SessionCompletionSummary {
  return {
    topicName: "Biology",
    cardsCompleted: 12,
    totalCards: 12,
    cardsEasy: 6,
    cardsMedium: 4,
    cardsHard: 2,
    pomodorosCompleted: 3,
    totalDuration: 80,
    xpEarned: 240,
    multiplier: 2,
    appliedMultipliers: [],
    nextReviews: [review()],
    intradayReviewScheduling: { status: "completed", retryable: false },
    ...overrides,
  };
}

let root: Root | null = null;
let container: HTMLDivElement;

async function render(props: React.ComponentProps<typeof SessionResultsSummary>) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(React.createElement(SessionResultsSummary, props));
  });
}

describe("SessionResultsSummary", () => {
  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    document.body.innerHTML = "";
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
      root = null;
    }
    document.body.innerHTML = "";
  });

  it("renders card, Pomodoro and XP totals from the summary, not the session relations", async () => {
    const result = summary();
    await render({
      session: BARE_SESSION,
      summary: result,
      intradayReviews: result.nextReviews,
    });

    const text = container.textContent ?? "";
    expect(text).toContain("12/12");
    expect(text).toContain("3/4");
    expect(text).toContain("+240");
    expect(text).toContain("Biology");
  });

  it("lists upcoming reviews with their card count", async () => {
    const result = summary({
      nextReviews: [
        review({ id: 1, cardCount: 5 }),
        review({ id: 2, cardCount: 7, status: IntradayReviewStatus.NOTIFIED }),
        review({ id: 3, cardCount: 9, status: IntradayReviewStatus.EXPIRED }),
      ],
    });
    await render({
      session: BARE_SESSION,
      summary: result,
      intradayReviews: result.nextReviews,
    });

    const text = container.textContent ?? "";
    expect(text).toContain("5 intensiveStudy.cards");
    expect(text).toContain("7 intensiveStudy.cards");
    expect(text).not.toContain("9 intensiveStudy.cards");
  });

  it("shows a non-blocking notice when review scheduling did not complete", async () => {
    await render({
      session: BARE_SESSION,
      summary: summary({
        intradayReviewScheduling: {
          status: "pending_reconciliation",
          retryable: true,
        },
      }),
    });

    const notice = container.querySelector('[role="status"]');
    expect(notice?.textContent).toBe(
      "intensiveStudy.results.reviewSchedulingPending",
    );
  });

  it("shows no scheduling notice when review scheduling completed", async () => {
    await render({ session: BARE_SESSION, summary: summary() });

    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it("still renders the totals when the summary omits review scheduling", async () => {
    // The session is already committed: a partial payload must not break the
    // results screen.
    const partial = summary();
    delete (partial as Partial<SessionCompletionSummary>).intradayReviewScheduling;
    await render({ session: BARE_SESSION, summary: partial });

    expect(container.textContent ?? "").toContain("12/12");
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});
