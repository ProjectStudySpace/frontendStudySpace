import { useState, useEffect, useCallback } from "react";
import { StudySessionCalendar } from "../src/types/reviews";
import { API_URL } from "../src/config";
import { reviewsUpdateEvent } from "./reviewsUpdateEvent";

const API_BASE = API_URL || "http://localhost:3000/api";

export const useCalendarSessions = () => {
  const [sessions, setSessions] = useState<StudySessionCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchCalendarSessions = useCallback(async (days: number = 30) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const allSessions: StudySessionCalendar[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${API_BASE}/reviews/upcoming?days=${days}&page=${page}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          break;
        }

        const data = await response.json();

        if (data.upcomingReviews && Array.isArray(data.upcomingReviews)) {
          data.upcomingReviews.forEach((session: any) => {
            allSessions.push({
              id: session.id,
              dueDate: session.dueDate,
              card: session.card,
              intervalDays: session.intervalDays,
            });
          });
        } else if (
          data.upcomingReviews &&
          typeof data.upcomingReviews === "object"
        ) {
          Object.values(data.upcomingReviews).forEach((dateGroup: any) => {
            if (Array.isArray(dateGroup)) {
              dateGroup.forEach((session: any) => {
                allSessions.push({
                  id: session.id,
                  dueDate: session.dueDate,
                  card: session.card,
                  intervalDays: session.intervalDays,
                });
              });
            }
          });
        }

        if (data.pagination && page < data.pagination.totalPages) {
          page++;
        } else {
          hasMore = false;
        }
      }

      setSessions(allSessions);
      return allSessions;
    } catch (err) {
      setSessions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSessions = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    fetchCalendarSessions();
  }, [fetchCalendarSessions, refreshTrigger]);

  // Para la actualización del widget del calendario sin refresh
  useEffect(() => {
    const handleReviewsUpdate = () => {
      refreshSessions();
    };

    // ESCUCHADOR del evento
    reviewsUpdateEvent.addListener(handleReviewsUpdate);

    return () => {
      reviewsUpdateEvent.removeListener(handleReviewsUpdate);
    };
  }, [refreshSessions]);

  return {
    sessions,
    loading,
    refreshSessions,
  };
};
