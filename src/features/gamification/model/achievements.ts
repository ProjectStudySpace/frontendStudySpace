import {
  BADGE_CONFIG,
  BadgeType,
  type BadgeMetadata,
  type UserBadge,
} from "../../../types/gamification";

export interface AchievementEntry {
  type: BadgeType;
  config: BadgeMetadata;
  earned: boolean;
  /** Earliest award date; null while locked. */
  earnedAt: string | null;
  /** Mastered topic names, for badges earned once per topic. */
  topicNames: string[];
}

function topicName(badge: UserBadge): string | null {
  const name = badge.metadata?.topicName;
  return typeof name === "string" && name.trim() ? name : null;
}

/**
 * The badge catalog in `BadgeType` order, merged with the user's awards.
 *
 * Retired badges appear only when earned. A badge awarded several times (one
 * TOPIC_MASTERY per topic) collapses into one entry listing its topics.
 */
export function buildAchievements(badges: UserBadge[]): AchievementEntry[] {
  const byType = new Map<string, UserBadge[]>();
  for (const badge of badges) {
    const list = byType.get(badge.badgeType) ?? [];
    list.push(badge);
    byType.set(badge.badgeType, list);
  }

  return Object.values(BadgeType).flatMap((type) => {
    const config = BADGE_CONFIG[type];
    const awards = byType.get(type) ?? [];
    const earned = awards.length > 0;
    if (config.retired && !earned) return [];

    const earnedAt = earned
      ? awards
          .map((badge) => badge.earnedAt)
          .reduce((first, date) =>
            Date.parse(date) < Date.parse(first) ? date : first,
          )
      : null;
    const topicNames = Array.from(
      new Set(
        awards.map(topicName).filter((name): name is string => name !== null),
      ),
    );

    return [{ type, config, earned, earnedAt, topicNames }];
  });
}
