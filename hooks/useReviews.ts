import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
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

const api = axios.create({
  baseURL: API_BASE,
});

//interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    pageSize: 5,
  });
  const [pendingPagination, setPendingPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 5,
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

  const fetchPendingReviews = async (page: number = 1, limit: number = 5) => {
    try {
      const { data } = await api.get(`/reviews/pending`, {
        params: { page, limit },
      });
      setPendingReviews(data.pendingReviews || []);
      const pag = data.pagination || {};
      setPendingPagination({
        currentPage: pag.page || page,
        totalPages:
          pag.totalPages || Math.ceil((pag.total || 0) / (pag.limit || limit)),
        totalItems: pag.total || 0,
        pageSize: pag.limit || limit,
      });
      if (!data) throw new Error("Error de carga de revisiones de hoy");
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
    limit: number = 5
  ) => {
    try {
      const { data } = await api.get(`/reviews/upcoming`, {
        params: { days, page, limit },
      });
      setUpcomingReviews(data.upcomingReviews || []);
      const pag = data.pagination || {};
      setUpcomingPagination({
        currentPage: pag.page || page,
        totalPages:
          pag.totalPages || Math.ceil((pag.total || 0) / (pag.limit || limit)),
        totalItems: pag.total || 0,
        pageSize: pag.limit || limit,
      });

      if (!data)
        throw new Error("Error de carga de revisiones de los próximos días");
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
      const { data } = await api.get(`/reviews/upcoming`, {
        params: { days: 30 },
      });
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
      const { data: result } = await api.post(`/reviews/complete`, {
        scheduledReviewId,
        difficultyRating,
      });

      if (!result) throw new Error("Error al completar la revisión");

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
      const { data: result } = await api.put(
        `/reviews/reschedule/${reviewId}`,
        {
          newDate,
        }
      );

      if (!result) {
        const errorText = await result.text();
        throw new Error(`Error reprogramando la revisión: ${errorText}`);
      }

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
    // Usar el total real de la paginación, no solo los elementos de la página actual
    return upcomingPagination.totalItems || 0;
  }, [upcomingPagination.totalItems]);

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

  // Contador total de pendientes (no paginado)
  const totalPendingCount = useMemo(() => {
    return pendingPagination.totalItems || 0;
  }, [pendingPagination.totalItems]);

  return {
    pendingReviews,
    upcomingReviews,
    allUpcomingReviews,
    upcomingPagination,
    pendingPagination,
    totalPendingCount, // Total real de pendientes
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
