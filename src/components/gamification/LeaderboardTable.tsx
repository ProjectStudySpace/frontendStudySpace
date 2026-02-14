/**
 * Componente LeaderboardTable - Muestra la tabla de clasificación
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { LeaderboardEntry } from "../../types/gamification";
import { Trophy, Medal, Crown, User } from "lucide-react";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  userPosition?: number | null;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  userPosition,
  loading = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}) => {
  const { t } = useTranslation();

  // Get medal icon for top 3
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown size={20} className="text-yellow-500" />;
      case 2:
        return <Medal size={20} className="text-gray-400" />;
      case 3:
        return <Medal size={20} className="text-amber-600" />;
      default:
        return (
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            {position}
          </span>
        );
    }
  };

  // Get background color for top 3
  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/30 dark:to-slate-800/30 border-gray-200 dark:border-gray-700";
      case 3:
        return "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800";
      default:
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} />
          {t("gamification.leaderboard.title")}
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t("gamification.noLeaderboardData")}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} />
          {t("gamification.leaderboard.title")}
        </h3>
        {userPosition && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t("gamification.yourPosition")}: #{userPosition}
          </p>
        )}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <div className="col-span-2 text-center">#</div>
        <div className="col-span-6">{t("gamification.user")}</div>
        <div className="col-span-2 text-center">{t("gamification.level")}</div>
        <div className="col-span-2 text-right">XP</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={`
              grid grid-cols-12 gap-4 p-4 items-center
              ${getPositionStyle(entry.position)}
              ${entry.isCurrentUser ? "ring-2 ring-indigo-500 ring-inset" : ""}
              transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50
            `}
          >
            {/* Position */}
            <div className="col-span-2 flex justify-center">
              {getPositionIcon(entry.position)}
            </div>

            {/* User Info */}
            <div className="col-span-6 flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </div>

              {/* Name */}
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {entry.isCurrentUser ? t("gamification.you") : entry.name}
                </p>
                {entry.isCurrentUser && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400">
                    ({t("gamification.you")})
                  </span>
                )}
              </div>
            </div>

            {/* Level */}
            <div className="col-span-2 text-center">
              <span className="inline-flex items-center justify-center px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                {entry.level}
              </span>
            </div>

            {/* XP */}
            <div className="col-span-2 text-right">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {entry.totalXp.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("common.loading")}
              </div>
            ) : (
              t("gamification.loadMore")
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
