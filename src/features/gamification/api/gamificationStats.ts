import type { GamificationStats } from "../../../types/gamification";
import { api } from "../../../utils/axiosConfig";

/** Signals a stats payload that does not match `GamificationStats`. */
export class MalformedStatsError extends Error {
  constructor() {
    super("Malformed gamification stats payload");
    this.name = "MalformedStatsError";
  }
}

function isGamificationStats(value: unknown): value is GamificationStats {
  if (!value || typeof value !== "object") return false;
  const stats = value as Record<string, unknown>;
  return (
    typeof stats.level === "number" &&
    typeof stats.totalXp === "number" &&
    typeof stats.levelProgress === "number" &&
    typeof stats.xpToNextLevel === "number" &&
    typeof stats.currentStreak === "number" &&
    typeof stats.longestStreak === "number" &&
    Array.isArray(stats.badges)
  );
}

/** Reads the signed-in user's XP, level, streak and badges. */
export async function fetchGamificationStats(): Promise<GamificationStats> {
  const response = await api.get<unknown>("/gamification/stats");
  if (!isGamificationStats(response.data)) throw new MalformedStatsError();
  return response.data;
}
