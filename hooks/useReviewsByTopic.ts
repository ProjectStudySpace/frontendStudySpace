import { useState, useCallback } from "react";
import { api } from "../src/utils/axiosConfig";
import { ScheduledReview, StudyCard } from "../src/types/reviews";
import { reviewsUpdateEvent } from "./reviewsUpdateEvent";
import {
  TopicInfo,
  ReviewByTopic,
  PendingByTopicResponse,
} from "../src/types/reviews";

export const useReviewsByTopic = () => {
  const [pendingReviews, setPendingReviews] = useState<ScheduledReview[]>([]);
  const [topicInfo, setTopicInfo] = useState<TopicInfo | null>(null);
  const [counts, setCounts] = useState({
    flashcards: 0,
    explanations: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>("");
  const [currentSession, setCurrentSession] = useState(0);

  // Obtener revisiones pendientes de un tema específico
  const fetchPendingByTopic = useCallback(
    async (
      topicId: number,
      options?: {
        page?: number;
        limit?: number;
        type?: "FLASHCARD" | "EXPLANATION";
      }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          page: options?.page || 1,
          limit: options?.limit || 100,
        };

        if (options?.type) {
          params.type = options.type;
        }

        const { data } = await api.get<PendingByTopicResponse>(
          `/reviews/pending/topic/${topicId}`,
          { params }
        );

        if (data) {
          // Combinar flashcards y explanations en un solo array
          const allReviews: ScheduledReview[] = [
            ...data.flashcards.map((review) => ({
              id: review.id,
              dueDate: review.dueDate,
              intervalDays: review.intervalDays,
              card: review.card,
            })),
            ...data.explanations.map((review) => ({
              id: review.id,
              dueDate: review.dueDate,
              intervalDays: review.intervalDays,
              card: review.card,
            })),
          ];

          // Ordenar por fecha más antigua primero
          allReviews.sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          );

          setPendingReviews(allReviews);
          setTopicInfo(data.topic);
          setCounts({
            flashcards: data.counts.flashcards,
            explanations: data.counts.explanations,
            total: data.counts.flashcards + data.counts.explanations,
          });

          if (data.userTimezone) {
            setUserTimezone(data.userTimezone);
            localStorage.setItem("userTimezone", data.userTimezone);
          }

          return allReviews;
        }

        return [];
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al cargar revisiones del tema";
        setError(errorMessage);
        setPendingReviews([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Obtener solo flashcards pendientes de un tema
  const fetchPendingFlashcardsByTopic = useCallback(
    async (topicId: number) => {
      return fetchPendingByTopic(topicId, { type: "FLASHCARD" });
    },
    [fetchPendingByTopic]
  );

  // Obtener solo explanations pendientes de un tema
  const fetchPendingExplanationsByTopic = useCallback(
    async (topicId: number) => {
      return fetchPendingByTopic(topicId, { type: "EXPLANATION" });
    },
    [fetchPendingByTopic]
  );

  // Completar una revisión
  const completeReview = useCallback(
    async (scheduledReviewId: number, difficultyRating: 1 | 2 | 3) => {
      try {
        const { data: result } = await api.post(`/reviews/complete`, {
          scheduledReviewId,
          difficultyRating,
        });

        if (!result) throw new Error("Error al completar la revisión");

        // Notificar a otros componentes que las revisiones se actualizaron
        reviewsUpdateEvent.notify();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al completar la revisión";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  // Navegar a la siguiente tarjeta
  const nextCard = useCallback(() => {
    if (currentSession < pendingReviews.length - 1) {
      setCurrentSession((prev) => prev + 1);
    }
  }, [currentSession, pendingReviews.length]);

  // Navegar a la tarjeta anterior
  const previousCard = useCallback(() => {
    if (currentSession > 0) {
      setCurrentSession((prev) => prev - 1);
    }
  }, [currentSession]);

  // Resetear la sesión
  const resetSession = useCallback(() => {
    setCurrentSession(0);
  }, []);

  // Limpiar el estado
  const clearReviews = useCallback(() => {
    setPendingReviews([]);
    setTopicInfo(null);
    setCounts({ flashcards: 0, explanations: 0, total: 0 });
    setCurrentSession(0);
    setError(null);
  }, []);

  // Obtener la revisión actual
  const currentReview =
    pendingReviews.length > 0 ? pendingReviews[currentSession] : null;

  return {
    // Estado
    pendingReviews,
    topicInfo,
    counts,
    loading,
    error,
    userTimezone,
    currentSession,
    currentReview,

    // Computed
    totalPendingCount: counts.total,
    canGoNext: currentSession < pendingReviews.length - 1,
    canGoPrevious: currentSession > 0,
    hasReviews: pendingReviews.length > 0,

    // Acciones
    fetchPendingByTopic,
    fetchPendingFlashcardsByTopic,
    fetchPendingExplanationsByTopic,
    completeReview,
    nextCard,
    previousCard,
    resetSession,
    clearReviews,
    setCurrentSession,
  };
};
