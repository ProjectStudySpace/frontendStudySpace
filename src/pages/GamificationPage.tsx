/**
 * Página de Gamificación - Muestra estadísticas, badges, leaderboard y más
 */
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGamification } from "../../hooks/useGamification";
import {
  BadgeCard,
  LevelProgressBar,
  LeaderboardTable,
  XpDisplay,
  ActiveMultipliers,
} from "../components/gamification";
import {
  GamificationStats,
  LeaderboardEntry,
  ActiveMultiplier,
} from "../types/gamification";
import {
  Trophy,
  Award,
  Flame,
  Target,
  Zap,
  Clock,
  RefreshCw,
} from "lucide-react";

const GamificationPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    stats,
    badges,
    leaderboard,
    userPosition,
    recentTransactions,
    loading,
    error,
    fetchStats,
    fetchBadges,
    fetchLeaderboard,
  } = useGamification();

  const [activeMultipliers, setActiveMultipliers] = useState<
    ActiveMultiplier[]
  >([]);
  const [isLoadingMultipliers, setIsLoadingMultipliers] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStats(), fetchBadges(), fetchLeaderboard(10, 0)]);
      // Fetch active multipliers (mock for now - would come from API)
      setActiveMultipliers(getMockMultipliers());
    };
    loadData();
  }, []);

  // Mock function for active multipliers - would be replaced with actual API call
  const getMockMultipliers = (): ActiveMultiplier[] => {
    if (!stats) return [];
    const multipliers: ActiveMultiplier[] = [];

    // Streak multiplier
    if (stats.currentStreak >= 7) {
      multipliers.push({
        name: t("gamification.multipliers.streakBonus"),
        type: "STREAK" as any,
        value:
          stats.currentStreak >= 30
            ? 1.5
            : stats.currentStreak >= 100
              ? 2.0
              : 1.25,
        description: `${stats.currentStreak} ${t("gamification.days")}`,
      });
    }

    return multipliers;
  };

  // Loading state
  if (loading && !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Trophy size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          {t("gamification.noData")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Trophy className="text-yellow-500" size={32} />
          {t("gamification.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("gamification.subtitle")}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total XP */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-indigo-500" size={20} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("gamification.totalXp")}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalXp.toLocaleString()}
          </p>
        </div>

        {/* Level */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-yellow-500" size={20} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("gamification.level")}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.level}
          </p>
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-orange-500" size={20} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("gamification.streak")}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.currentStreak}{" "}
            <span className="text-sm font-normal">
              {t("gamification.days")}
            </span>
          </p>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-purple-500" size={20} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("gamification.badges.title")}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.badges.length}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Level Progress & Badges */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <LevelProgressBar
            level={stats.level}
            progressPercent={stats.progressPercent}
            xpForNext={stats.nextLevelXp}
            currentXp={stats.currentLevelXp}
            totalXp={stats.totalXp}
            size="lg"
          />

          {/* Badges Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Award className="text-purple-500" size={24} />
              {t("gamification.yourBadges")}
            </h2>

            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} size="md" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Award size={48} className="mx-auto mb-2 opacity-50" />
                <p>{t("gamification.noBadges")}</p>
                <p className="text-sm mt-1">{t("gamification.earnBadges")}</p>
              </div>
            )}
          </div>

          {/* Activity Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Clock className="text-blue-500" size={24} />
              {t("gamification.activityStats")}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-4 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("gamification.pomodorosCompleted")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.pomodorosCompleted}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("gamification.sessionsCompleted")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.sessionsCompleted}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("gamification.longestStreak")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.longestStreak}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Leaderboard & Multipliers */}
        <div className="space-y-6">
          {/* Active Multipliers */}
          <ActiveMultipliers multipliers={activeMultipliers} size="md" />

          {/* Leaderboard */}
          <LeaderboardTable
            entries={leaderboard}
            userPosition={userPosition}
            loading={loading}
          />

          {/* Recent Activity */}
          {recentTransactions && recentTransactions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t("gamification.recentActivity")}
              </h3>

              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.amount > 0
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600"
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <Zap size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t(`gamification.transactionTypes.${transaction.type}`)}
                      </span>
                    </div>
                    <span
                      className={`font-medium ${
                        transaction.amount > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
