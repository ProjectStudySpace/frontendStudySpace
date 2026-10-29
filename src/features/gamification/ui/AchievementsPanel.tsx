import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  CircleCheck,
  Flame,
  Layers,
  Moon,
  Shield,
  Sunrise,
  Timer,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { GamificationStats } from "../../../types/gamification";
import { fetchGamificationStats } from "../api/gamificationStats";
import { buildAchievements, type AchievementEntry } from "../model/achievements";

const ICONS: Record<string, LucideIcon> = {
  timer: Timer,
  flame: Flame,
  zap: Zap,
  sunrise: Sunrise,
  moon: Moon,
  shield: Shield,
  "check-circle": CircleCheck,
  layers: Layers,
};

const CARD =
  "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; stats: GamificationStats };

const SummaryTile: React.FC<{
  label: string;
  name: string;
  value: React.ReactNode;
  children?: React.ReactNode;
}> = ({ label, name, value, children }) => (
  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
    <p className="text-gray-600 dark:text-gray-300 text-sm">{label}</p>
    <p
      className="text-2xl font-bold text-gray-900 dark:text-gray-100"
      data-summary={name}
    >
      {value}
    </p>
    {children}
  </div>
);

const BadgeCard: React.FC<{ entry: AchievementEntry; language: string }> = ({
  entry,
  language,
}) => {
  const { t } = useTranslation();
  const Icon = ICONS[entry.config.icon] ?? Award;
  return (
    <li
      data-badge={entry.type}
      data-state={entry.earned ? "earned" : "locked"}
      className={
        entry.earned
          ? "p-4 rounded-xl border-2 bg-white dark:bg-gray-800 shadow-sm"
          : "p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 opacity-60 grayscale"
      }
      style={entry.earned ? { borderColor: entry.config.color } : undefined}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${entry.config.color}26` }}
        >
          <Icon size={20} style={{ color: entry.config.color }} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {t(entry.config.nameKey)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {entry.earned
              ? `${t("gamification.badges.earned")} · ${new Date(
                  entry.earnedAt as string,
                ).toLocaleDateString(language)}`
              : t("gamification.badges.locked")}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {t(entry.config.descriptionKey)}
      </p>
      {entry.topicNames.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t("gamification.achievements.masteredTopics")}
          </p>
          <ul className="flex flex-wrap gap-1 mt-1">
            {entry.topicNames.map((name) => (
              <li
                key={name}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

/** Level, XP and streak summary plus the full badge catalog for /progress. */
const AchievementsPanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async (isActive: () => boolean = () => true) => {
    setState({ status: "loading" });
    try {
      const stats = await fetchGamificationStats();
      if (isActive()) setState({ status: "ready", stats });
    } catch {
      if (isActive()) setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    let active = true;
    void load(() => active);
    return () => {
      active = false;
    };
  }, [load]);

  const achievements = useMemo(
    () => (state.status === "ready" ? buildAchievements(state.stats.badges) : []),
    [state],
  );

  const language = i18n.language;
  const number = (value: number) => value.toLocaleString(language);

  return (
    <section className={`${CARD} mt-6`} aria-labelledby="achievements-title">
      <h2
        id="achievements-title"
        className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2"
      >
        <Trophy size={22} className="text-amber-500" aria-hidden />
        {t("gamification.achievements.title")}
      </h2>

      {state.status === "loading" && (
        <div
          className="flex justify-center items-center h-32"
          role="status"
          aria-label={t("gamification.achievements.loading")}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {state.status === "error" && (
        <div className="text-center py-6">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {t("gamification.achievements.loadError")}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {t("gamification.achievements.retry")}
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryTile
              label={t("gamification.level")}
              name="level"
              value={state.stats.level}
            />
            <SummaryTile
              label={t("gamification.totalXp")}
              name="totalXp"
              value={number(state.stats.totalXp)}
            >
              <div
                className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                role="progressbar"
                aria-label={t("gamification.xp.progress")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(state.stats.levelProgress)}
              >
                <div
                  className="h-full bg-indigo-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, state.stats.levelProgress))}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t("gamification.achievements.xpToNextLevel")}:{" "}
                <span data-summary="xpToNextLevel">
                  {number(state.stats.xpToNextLevel)}
                </span>
              </p>
            </SummaryTile>
            <SummaryTile
              label={t("gamification.achievements.currentStreak")}
              name="currentStreak"
              value={state.stats.currentStreak}
            />
            <SummaryTile
              label={t("gamification.longestStreak")}
              name="longestStreak"
              value={state.stats.longestStreak}
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t("gamification.badges.title")}
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((entry) => (
              <BadgeCard key={entry.type} entry={entry} language={language} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default AchievementsPanel;
