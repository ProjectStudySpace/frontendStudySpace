import type { UserBadge } from "../../../types/gamification";
import type { SessionBadgeEvaluation } from "../../../types/intensiveSessions";
import { intensiveApi } from "./errors";

export interface LoadSessionBadgesInput {
  /** Badge outcome of the completion; null when completion was reconciled. */
  badgeEvaluation: SessionBadgeEvaluation | null;
  /** Backend `startedAt` of the completed session. */
  sessionStartedAt: string | null | undefined;
}

/**
 * Badges earned during a completed session.
 *
 * The completion response does not list awarded badges, so the user's badges
 * are read from `GET /gamification/badges` and kept when earned at or after
 * the session start. Badges are only read once their evaluation completed.
 * The session is already committed, so any failure resolves to no badges.
 */
export async function loadSessionBadges({
  badgeEvaluation,
  sessionStartedAt,
}: LoadSessionBadgesInput): Promise<UserBadge[]> {
  if (badgeEvaluation?.status !== "completed" || !sessionStartedAt) return [];
  const since = Date.parse(sessionStartedAt);
  if (Number.isNaN(since)) return [];

  try {
    const response = await intensiveApi.get<{ badges?: unknown }>(
      "/gamification/badges",
    );
    const badges = response.data?.badges;
    if (!Array.isArray(badges)) return [];
    return badges.filter(
      (badge): badge is UserBadge =>
        typeof badge?.badgeType === "string" &&
        Date.parse(badge.earnedAt) >= since,
    );
  } catch {
    return [];
  }
}
