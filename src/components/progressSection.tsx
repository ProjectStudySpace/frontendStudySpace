import React from "react";
import { useTranslation } from "react-i18next";
import { useProgress } from "../../hooks/useProgress";
import { TrendingUp, Target, BookOpen, Clock } from "lucide-react";

const ProgressSection: React.FC = () => {
  const { t } = useTranslation();
  const { progressData, loading, error } = useProgress();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          {t("progressStats.errorLoading")}: {error}
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {t("progressStats.noData")}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t("progress.learning")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-200 dark:bg-blue-800">
              <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("progressStats.totalTopics")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progressData.totalTopics}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-200 dark:bg-green-800">
              <Target size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("progressStats.totalCards")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progressData.totalCards}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-200 dark:bg-orange-800">
              <Clock size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("progressStats.pendingReviews")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progressData.pendingReviews}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-200 dark:bg-purple-800">
              <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("progressStats.completedToday")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progressData.completedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-200 dark:bg-red-800">
              <Clock size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("progressStats.currentStreak")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progressData.currentStreak}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-200 dark:bg-yellow-800">
              <Target size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("progressStats.longestStreak")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progressData.longestStreak}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;
