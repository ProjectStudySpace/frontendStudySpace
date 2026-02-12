/**
 * Hook para gestionar Repasos Intradía - Fase 2
 * Repasos programados automáticamente tras sesiones intensivas
 */
import { useState, useCallback } from "react";
import { useAuth } from "../src/context/AuthContext";
import { api, deduplicateRequest } from "../src/utils/axiosConfig";
import {
  IntradayReview,
  IntradayReviewCard,
  IntradayReviewList,
  CompleteIntradayReviewResponse,
  IntradayReviewStatus,
} from "../src/types/intradayReviews";

interface UseIntradayReviewsReturn {
  // Estado
  reviews: IntradayReview[];
  currentReviewCards: IntradayReviewCard[];
  currentReview: IntradayReview | null;
  totalPending: number;
  totalCompleted: number;
  totalMissed: number;
  loading: boolean;
  error: string | null;

  // Funciones
  fetchPendingReviews: () => Promise<IntradayReview[]>;
  fetchReviewCards: (reviewId: string) => Promise<IntradayReviewCard[]>;
  completeReview: (
    reviewId: string,
  ) => Promise<CompleteIntradayReviewResponse | null>;
  startReview: (reviewId: string) => Promise<IntradayReview | null>;

  // Utilidades
  clearError: () => void;
  resetState: () => void;
}

export const useIntradayReviews = (): UseIntradayReviewsReturn => {
  const { user } = useAuth();

  // Estado
  const [reviews, setReviews] = useState<IntradayReview[]>([]);
  const [currentReviewCards, setCurrentReviewCards] = useState<
    IntradayReviewCard[]
  >([]);
  const [currentReview, setCurrentReview] = useState<IntradayReview | null>(
    null,
  );
  const [totalPending, setTotalPending] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalMissed, setTotalMissed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todos los repasos intradía pendientes
   */
  const fetchPendingReviews = useCallback(async (): Promise<
    IntradayReview[]
  > => {
    if (!user) {
      setError("Usuario no autenticado");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const requestKey = "intraday-reviews-list";
      const response = await deduplicateRequest(requestKey, () =>
        api.get<IntradayReviewList>("/intraday-reviews"),
      );

      const data = response.data;
      if (data) {
        setReviews(data.reviews || []);
        setTotalPending(data.totalPending || 0);
        setTotalCompleted(data.totalCompleted || 0);
        setTotalMissed(data.totalMissed || 0);
        return data.reviews || [];
      }
      return [];
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al obtener repasos";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Obtener las tarjetas de un repaso específico
   */
  const fetchReviewCards = useCallback(
    async (reviewId: string): Promise<IntradayReviewCard[]> => {
      if (!user) {
        setError("Usuario no autenticado");
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<{ cards: IntradayReviewCard[] }>(
          `/intraday-reviews/${reviewId}/cards`,
        );

        const cards = response.data?.cards || [];
        setCurrentReviewCards(cards);
        return cards;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al obtener tarjetas";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Iniciar un repaso (establecer como current)
   */
  const startReview = useCallback(
    async (reviewId: string): Promise<IntradayReview | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      // Buscar en la lista local primero
      const review = reviews.find((r) => r.id === reviewId);
      if (review) {
        setCurrentReview(review);
        return review;
      }

      // Si no está en la lista, obtener del servidor
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<IntradayReview>(
          `/intraday-reviews/${reviewId}`,
        );

        if (response.data) {
          setCurrentReview(response.data);
          return response.data;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al obtener repaso";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, reviews],
  );

  /**
   * Completar un repaso intradía
   */
  const completeReview = useCallback(
    async (
      reviewId: string,
    ): Promise<CompleteIntradayReviewResponse | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<CompleteIntradayReviewResponse>(
          `/intraday-reviews/${reviewId}/complete`,
        );

        if (response.data) {
          // Actualizar estado local
          setCurrentReview(null);
          setCurrentReviewCards([]);
          setTotalPending((prev) => Math.max(0, prev - 1));
          setTotalCompleted((prev) => prev + 1);

          // Actualizar el review en la lista
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    status: IntradayReviewStatus.COMPLETED,
                    completedAt: new Date().toISOString(),
                  }
                : r,
            ),
          );

          return response.data;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al completar repaso";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Resetear estado
   */
  const resetState = useCallback(() => {
    setReviews([]);
    setCurrentReviewCards([]);
    setCurrentReview(null);
    setTotalPending(0);
    setTotalCompleted(0);
    setTotalMissed(0);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // Estado
    reviews,
    currentReviewCards,
    currentReview,
    totalPending,
    totalCompleted,
    totalMissed,
    loading,
    error,

    // Funciones
    fetchPendingReviews,
    fetchReviewCards,
    completeReview,
    startReview,

    // Utilidades
    clearError,
    resetState,
  };
};

export default useIntradayReviews;
