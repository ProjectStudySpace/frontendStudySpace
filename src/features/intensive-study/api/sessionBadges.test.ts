/**
 * Badges are awarded after the session commit and are not part of the
 * completion response, so the results view reads the user's badges and keeps
 * the ones earned since the session started. The session is already complete:
 * a failed badge read must never break the results view.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../utils/axiosConfig";
import { loadSessionBadges } from "./sessionBadges";
import { installSettlingAdapter, type TestResponse } from "./testAxios";

const STARTED_AT = "2026-08-05T10:00:00.000Z";

function badge(id: number, badgeType: string, earnedAt: string) {
  return { id, userId: 10, badgeType, topicId: null, metadata: null, earnedAt };
}

let badgesResponse: TestResponse;
let calls: string[];

describe("loadSessionBadges", () => {
  beforeEach(() => {
    calls = [];
    badgesResponse = { status: 200, data: { badges: [] } };
    installSettlingAdapter(api, (config) => {
      calls.push(`${config.method}:${config.url}`);
      return badgesResponse;
    });
  });

  afterEach(() => {
    delete api.defaults.adapter;
  });

  it("keeps only the badges earned since the session started", async () => {
    badgesResponse = {
      status: 200,
      data: {
        badges: [
          badge(3, "NIGHT_OWL", "2026-08-05T11:00:00.000Z"),
          badge(2, "POMODORO_NOVICE", STARTED_AT),
          badge(1, "EARLY_BIRD", "2026-08-01T07:00:00.000Z"),
        ],
      },
    };

    const badges = await loadSessionBadges({
      badgeEvaluation: { status: "completed", retryable: false },
      sessionStartedAt: STARTED_AT,
    });

    expect(badges.map((b) => b.badgeType)).toEqual([
      "NIGHT_OWL",
      "POMODORO_NOVICE",
    ]);
    expect(calls).toEqual(["get:/gamification/badges"]);
  });

  it("does not read badges while their evaluation is still pending", async () => {
    const badges = await loadSessionBadges({
      badgeEvaluation: { status: "pending_reconciliation", retryable: true },
      sessionStartedAt: STARTED_AT,
    });

    expect(badges).toEqual([]);
    expect(calls).toEqual([]);
  });

  it("does not read badges for a reconciled completion or an unstarted session", async () => {
    expect(
      await loadSessionBadges({ badgeEvaluation: null, sessionStartedAt: STARTED_AT }),
    ).toEqual([]);
    expect(
      await loadSessionBadges({
        badgeEvaluation: { status: "completed", retryable: false },
        sessionStartedAt: null,
      }),
    ).toEqual([]);
    expect(calls).toEqual([]);
  });

  it("resolves to no badges when the badge read fails", async () => {
    badgesResponse = { status: 500, data: { error: "boom" } };

    await expect(
      loadSessionBadges({
        badgeEvaluation: { status: "completed", retryable: false },
        sessionStartedAt: STARTED_AT,
      }),
    ).resolves.toEqual([]);
  });

  it("resolves to no badges when the payload is malformed", async () => {
    badgesResponse = { status: 200, data: { badges: "nope" } };

    await expect(
      loadSessionBadges({
        badgeEvaluation: { status: "completed", retryable: false },
        sessionStartedAt: STARTED_AT,
      }),
    ).resolves.toEqual([]);
  });
});
