import React, { useEffect } from "react";
import SpacedRepetitionDashboard from "../components/spacedRepetitionDashboard";
import { useReviews } from "../../hooks/useReviews";
import CalendarWidget from "../components/calendarWidget";
import { BookOpen, TrendingUp, Clock } from "lucide-react";

const StudySessions = () => {
  const { fetchAllReviews, pendingReviews, upcomingReviews } = useReviews();

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const upcomingCount =
    upcomingReviews && typeof upcomingReviews === "object"
      ? Object.values(upcomingReviews).reduce((total, dateGroup) => {
          return total + (Array.isArray(dateGroup) ? dateGroup.length : 0);
        }, 0)
      : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Calendario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Calendario de sesiones de repaso programadas
            </h1>
          </div>
        </div>
        <CalendarWidget />
      </div>

      {/* Contadores */}
      <SpacedRepetitionDashboard />
    </div>
  );
};

export default StudySessions;