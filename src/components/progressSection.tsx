import React from "react";
import { useTranslation } from "react-i18next";
import { useProgress } from "../../hooks/useProgress";
import { TrendingUp, Target, BookOpen, Clock } from "lucide-react";

const ProgressSection: React.FC = () => {
  const { t } = useTranslation();
  const { progressData, loading, error } = useProgress();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          {t("progressStats.errorLoading")}: {error}
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          {t("progressStats.noData")}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {t("progress.learning")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-200">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("progressStats.totalTopics")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.totalTopics}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-200">
              <Target size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("progressStats.totalCards")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.totalCards}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-200">
              <Clock size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("progressStats.pendingReviews")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.pendingReviews}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-200">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("progressStats.completedToday")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.completedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-200">
              <Clock size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("progressStats.currentStreak")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.currentStreak}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-200">
              <Target size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("progressStats.longestStreak")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
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
