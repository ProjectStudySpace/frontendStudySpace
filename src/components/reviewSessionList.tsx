import React from "react";
import { useTranslation } from "react-i18next";
import { ReviewSessionListProps } from "../types/reviews";
import ReviewSessionCard from "./reviewSessionCard";
import { BookOpen } from "lucide-react";

const ReviewSessionList: React.FC<ReviewSessionListProps> = ({
  sessions,
  onSessionsUpdate,
  upcomingPagination,
  onUpcomingPageChange,
  pendingPagination,
  onPendingPageChange,
}) => {
  const { t } = useTranslation();
  const groupedSessions = {
    pending: sessions.filter((s) => s.type === "pending"),
    upcoming: sessions.filter((s) => s.type === "upcoming"),
    completed: sessions.filter((s) => s.type === "completed"),
  };

  return (
    <div className="space-y-6">
      {groupedSessions.pending.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("sessions.pendingToday")} (
              {pendingPagination
                ? pendingPagination.totalItems
                : groupedSessions.pending.length}
              )
            </h2>
          </div>
          <div className="grid gap-4">
            {groupedSessions.pending.map((session) => (
              <ReviewSessionCard
                key={session.id}
                session={session}
                onSessionUpdated={onSessionsUpdate}
              />
            ))}
          </div>
          {pendingPagination &&
            onPendingPageChange &&
            pendingPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() =>
                    onPendingPageChange(pendingPagination.currentPage - 1)
                  }
                  disabled={pendingPagination.currentPage <= 1}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
                >
                  {t("common.previous")}
                </button>
                <span className="text-gray-600 dark:text-gray-400">
                  {t("common.page")} {pendingPagination.currentPage}{" "}
                  {t("common.of")} {pendingPagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    onPendingPageChange(pendingPagination.currentPage + 1)
                  }
                  disabled={
                    pendingPagination.currentPage >=
                    pendingPagination.totalPages
                  }
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
                >
                  {t("common.next")}
                </button>
              </div>
            )}
        </section>
      )}

      {groupedSessions.upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("sessions.upcomingSessions")} (
              {upcomingPagination
                ? upcomingPagination.totalItems
                : groupedSessions.upcoming.length}
              )
            </h2>
          </div>
          <div className="grid gap-4">
            {groupedSessions.upcoming.map((session) => (
              <ReviewSessionCard
                key={session.id}
                session={session}
                onSessionUpdated={onSessionsUpdate}
              />
            ))}
          </div>
          {upcomingPagination &&
            onUpcomingPageChange &&
            upcomingPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() =>
                    onUpcomingPageChange(upcomingPagination.currentPage - 1)
                  }
                  disabled={upcomingPagination.currentPage <= 1}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
                >
                  {t("common.previous")}
                </button>
                <span className="text-gray-600 dark:text-gray-400">
                  {t("common.page")} {upcomingPagination.currentPage}{" "}
                  {t("common.of")} {upcomingPagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    onUpcomingPageChange(upcomingPagination.currentPage + 1)
                  }
                  disabled={
                    upcomingPagination.currentPage >=
                    upcomingPagination.totalPages
                  }
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
                >
                  {t("common.next")}
                </button>
              </div>
            )}
        </section>
      )}

      {groupedSessions.completed.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("sessions.completedSessions")} (
              {groupedSessions.completed.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {groupedSessions.completed.map((session) => (
              <ReviewSessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {t("sessions.noSessions")}
          </p>
          <p className="text-gray-400 dark:text-gray-500">
            {t("sessions.createCards")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSessionList;
