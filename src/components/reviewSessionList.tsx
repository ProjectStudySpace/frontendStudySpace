import React from "react";
import { ReviewSession, ReviewSessionListProps } from "../types/reviews";
import ReviewSessionCard from "./reviewSessionCard";
import { BookOpen } from "lucide-react";

const ReviewSessionList: React.FC<ReviewSessionListProps> = ({
  sessions,
  onSessionsUpdate,
  upcomingPagination,
  onUpcomingPageChange,
}) => {
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
            <h2 className="text-xl font-semibold text-gray-900">
              Pendientes para Hoy ({groupedSessions.pending.length})
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
        </section>
      )}

      {groupedSessions.upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              Próximas Sesiones (
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
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() =>
                    onUpcomingPageChange(upcomingPagination.currentPage - 1)
                  }
                  disabled={upcomingPagination.currentPage <= 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                  Anterior
                </button>
                <span>
                  Página {upcomingPagination.currentPage} de{" "}
                  {upcomingPagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    onUpcomingPageChange(upcomingPagination.currentPage + 1)
                  }
                  disabled={
                    upcomingPagination.currentPage >=
                    upcomingPagination.totalPages
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                  Siguiente
                </button>
              </div>
            )}
        </section>
      )}

      {groupedSessions.completed.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              Sesiones Completadas ({groupedSessions.completed.length})
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
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-2">
            No hay sesiones de estudio programadas.
          </p>
          <p className="text-gray-400">Crea algunas tarjetas para comenzar.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewSessionList;
