import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ScheduledReview,
  UpcomingReviews,
  UpcomingReviewsArray,
  ReviewSession,
  UpcomingReviewItem,
} from "../src/types/reviews";
import { API_URL } from "../src/config";
import { reviewsUpdateEvent } from "./reviewsUpdateEvent";
import { getStoredUserTimezone } from "../src/utils/dateUtils";

const API_BASE = API_URL || "http://localhost:3000/api";

export const useReviews = () => {
  const [pendingReviews, setPendingReviews] = useState<ScheduledReview[]>([]);
  const [upcomingReviews, setUpcomingReviews] = useState<UpcomingReviewsArray>(
    []
  );
  const [allUpcomingReviews, setAllUpcomingReviews] = useState<UpcomingReviews>(
    {}
  );
  const [upcomingPagination, setUpcomingPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>("");

  const fetchAllReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchPendingReviews(),
        fetchUpcomingReviews(7),
        fetchAllUpcomingReviews(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error de carga de revisiones"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/reviews/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Error de carga de revisiones de hoy");
      const data = await response.json();
      setPendingReviews(data.pendingReviews || []);
      // Procesar userTimezone de la respuesta
      if (data.userTimezone) {
        setUserTimezone(data.userTimezone);
        localStorage.setItem("userTimezone", data.userTimezone);
      }
    } catch (err) {
      setPendingReviews([]);
      throw err;
    }
  };

  const fetchUpcomingReviews = async (
    days: number = 7,
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/reviews/upcoming?days=${days}&page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        throw new Error("Error de carga de revisiones de los próximos días");
      const data = await response.json();
      setUpcomingReviews(data.upcomingReviews || []);
      const pag = data.pagination || {};
      setUpcomingPagination({
        currentPage: pag.page || page,
        totalPages:
          pag.totalPages || Math.ceil((pag.total || 0) / (pag.limit || limit)),
        totalItems: pag.total || 0,
        pageSize: pag.limit || limit,
      });
      // Procesar userTimezone de la respuesta
      if (data.userTimezone) {
        setUserTimezone(data.userTimezone);
        localStorage.setItem("userTimezone", data.userTimezone);
      }
    } catch (err) {
      setUpcomingReviews([]);
      throw err;
    }
  };

  const fetchAllUpcomingReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/reviews/upcoming?days=30`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok)
        throw new Error("Error de carga de todas las revisiones futuras");
      const data = await response.json();
      setAllUpcomingReviews(data.upcomingReviews || {});
    } catch (err) {
      setAllUpcomingReviews({});
      throw err;
    }
  };

  const completeReview = async (
    scheduledReviewId: number,
    difficultyRating: 1 | 2 | 3
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/reviews/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledReviewId,
          difficultyRating,
        }),
      });

      if (!response.ok) throw new Error("Error al completar la revisión");

      const result = await response.json();

      await fetchAllReviews();

      // Evento global de reviewsUpdateEvent - unión de hooks
      // para sincronización del widget del calendario (sin refresh)
      reviewsUpdateEvent.notify();

      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al completar la revisión"
      );
      throw err;
    }
  };

  const rescheduleReview = async (reviewId: number, newDate: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/reviews/reschedule/${reviewId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newDate }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error reprogramando la revisión: ${errorText}`);
      }

      const result = await response.json();

      await fetchAllReviews();

      // Evento global de reviewsUpdateEvent - unión de hooks
      // para sincronización del widget del calendario (sin refresh)
      reviewsUpdateEvent.notify();

      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error reprogramando la revisión"
      );
      throw err;
    }
  };

  const getGroupedSessions = (): ReviewSession[] => {
    const sessions: ReviewSession[] = [];

    if (Array.isArray(pendingReviews)) {
      pendingReviews.forEach((review) => {
        sessions.push({
          id: review.id,
          type: "pending",
          dueDate: review.dueDate,
          card: review.card,
          intervalDays: review.intervalDays,
        });
      });
    }

    if (Array.isArray(upcomingReviews)) {
      upcomingReviews.forEach((review: UpcomingReviewItem) => {
        sessions.push({
          id: review.id,
          type: "upcoming",
          dueDate: review.dueDate,
          card: review.card,
          intervalDays: review.intervalDays,
        });
      });
    }

    return sessions.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  };

  const upcoming7DaysCount = useMemo(() => {
    return Array.isArray(upcomingReviews) ? upcomingReviews.length : 0;
  }, [upcomingReviews]);

  const totalUpcomingCount = useMemo(() => {
    if (!allUpcomingReviews || typeof allUpcomingReviews !== "object") return 0;
    return Object.values(allUpcomingReviews).reduce((total, dateGroup) => {
      return total + (Array.isArray(dateGroup) ? dateGroup.length : 0);
    }, 0);
  }, [allUpcomingReviews]);

  useEffect(() => {
    fetchAllReviews();
    // Inicializar zona horaria desde localStorage si existe
    const storedTimezone = getStoredUserTimezone();
    if (storedTimezone) {
      setUserTimezone(storedTimezone);
    }
  }, [fetchAllReviews]);

  return {
    pendingReviews,
    upcomingReviews,
    allUpcomingReviews,
    upcomingPagination,
    upcoming7DaysCount,
    totalUpcomingCount,
    loading,
    error,
    userTimezone,
    fetchAllReviews,
    fetchPendingReviews,
    fetchUpcomingReviews,
    fetchAllUpcomingReviews,
    completeReview,
    rescheduleReview,
    getGroupedSessions,
  };
};
