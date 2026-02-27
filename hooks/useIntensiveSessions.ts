/**
 * Hook para gestionar Sesiones Intensivas - Fase 2
 * Comunica con los endpoints de sesiones, Pomodoro y tarjetas
 */
import { useState, useCallback } from "react";
import { useAuth } from "../src/context/AuthContext";
import { api, deduplicateRequest } from "../src/utils/axiosConfig";
import {
  IntensiveStudySession,
  IntensiveSessionDetail,
  CreateIntensiveSessionData,
  AbandonInfo,
  PomodoroBlock,
  IntensiveSessionCard,
  StudyIntensity,
  CardDifficulty,
  SessionStatus,
} from "../src/types/intensiveSessions";

interface UseIntensiveSessionsReturn {
  // Estado
  sessions: IntensiveStudySession[];
  currentSession: IntensiveSessionDetail | null;
  currentPomodoro: PomodoroBlock | null;
  currentCard: IntensiveSessionCard | null;
  loading: boolean;
  error: string | null;

  // Funciones de sesión
  createSession: (
    topicId: number,
    intensity: StudyIntensity,
  ) => Promise<IntensiveStudySession | null>;
  fetchSessions: () => Promise<IntensiveStudySession[]>;
  fetchSessionDetail: (id: number) => Promise<IntensiveSessionDetail | null>;
  startSession: (id: number) => Promise<IntensiveSessionDetail | null>;
  pauseSession: (id: number) => Promise<IntensiveSessionDetail | null>;
  abandonSession: (id: number) => Promise<IntensiveStudySession | null>;
  getAbandonInfo: (id: number) => Promise<AbandonInfo | null>;
  completeSession: (id: number) => Promise<IntensiveSessionDetail | null>;
  getActiveSession: () => Promise<IntensiveStudySession | null>;

  // Funciones de Pomodoro
  startPomodoro: (sessionId: number) => Promise<PomodoroBlock | null>;
  completePomodoro: (
    sessionId: number,
    blockId: number,
  ) => Promise<PomodoroBlock | null>;
  endBreak: (
    sessionId: number,
    blockId: number,
  ) => Promise<PomodoroBlock | null>;
  skipBreak: (
    sessionId: number,
    blockId: number,
  ) => Promise<PomodoroBlock | null>;

  // Funciones de tarjetas
  getNextCard: (sessionId: number) => Promise<IntensiveSessionCard | null>;
  completeCard: (
    sessionId: number,
    cardId: number,
    difficulty: CardDifficulty,
  ) => Promise<IntensiveSessionCard | null>;

  // Utilidades
  clearError: () => void;
  resetState: () => void;
}

export const useIntensiveSessions = (): UseIntensiveSessionsReturn => {
  const { user } = useAuth();

  // Estado principal
  const [sessions, setSessions] = useState<IntensiveStudySession[]>([]);
  const [currentSession, setCurrentSession] =
    useState<IntensiveSessionDetail | null>(null);
  const [currentPomodoro, setCurrentPomodoro] = useState<PomodoroBlock | null>(
    null,
  );
  const [currentCard, setCurrentCard] = useState<IntensiveSessionCard | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== FUNCIONES DE SESIÓN ====================

  /**
   * Crear una nueva sesión intensiva
   */
  const createSession = useCallback(
    async (
      topicId: number,
      intensity: StudyIntensity,
    ): Promise<IntensiveStudySession | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const data: CreateIntensiveSessionData = { topicId, intensity };

        const response = await api.post<any>("/intensive-sessions", data);

        if (response.data) {
          const apiResponse = response.data;
          const session = apiResponse.session;
          setSessions((prev) => [session, ...prev]);
          return session;
        }
        return null;
      } catch (err: any) {
        const errorData = err.response?.data;
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          err.message ||
          "Error al crear sesión";

        // Detectar error de sesión activa existente
        const isActiveSessionError =
          errorMessage.toLowerCase().includes("sesión activa") ||
          errorMessage.toLowerCase().includes("active session");

        if (isActiveSessionError) {
          const activeSessionError = new Error(errorMessage);
          (activeSessionError as any).code = "ACTIVE_SESSION_EXISTS";
          (activeSessionError as any).status = err.response?.status;
          throw activeSessionError;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Obtener la sesión activa actual del usuario
   */
  const getActiveSession =
    useCallback(async (): Promise<IntensiveStudySession | null> => {
      if (!user) return null;

      try {
        const response = await api.get<{ sessions: IntensiveStudySession[] }>(
          "/intensive-sessions",
        );
        const sessionsData = response.data?.sessions || [];

        // Buscar sesión en progreso o pausada
        const activeSession = sessionsData.find(
          (s) =>
            s.status === SessionStatus.IN_PROGRESS ||
            s.status === SessionStatus.PAUSED,
        );

        return activeSession || null;
      } catch (err) {
        console.error("Error getting active session:", err);
        return null;
      }
    }, [user]);

  /**
   * Obtener todas las sesiones del usuario
   */
  const fetchSessions = useCallback(async (): Promise<
    IntensiveStudySession[]
  > => {
    if (!user) {
      setError("Usuario no autenticado");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const requestKey = "intensive-sessions-list";
      const response = await deduplicateRequest(requestKey, () =>
        api.get<{ sessions: IntensiveStudySession[] }>("/intensive-sessions"),
      );

      const sessionsData = response.data?.sessions || [];
      setSessions(sessionsData);
      return sessionsData;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al obtener sesiones";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Obtener detalle de una sesión específica
   */
  const fetchSessionDetail = useCallback(
    async (id: number): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<any>(`/intensive-sessions/${id}`);

        if (response.data) {
          const apiResponse = response.data;
          const sessionDetail = apiResponse.session;
          setCurrentSession(sessionDetail);
          return sessionDetail;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al obtener sesión";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Iniciar una sesión
   */
  const startSession = useCallback(
    async (id: number): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(`/intensive-sessions/${id}/start`);

        if (response.data) {
          const apiResponse = response.data;
          const sessionDetail = apiResponse.session;
          setCurrentSession(sessionDetail);
          // Actualizar en la lista también
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: sessionDetail.status } : s,
            ),
          );
          return sessionDetail;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al iniciar sesión";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Pausar una sesión
   */
  const pauseSession = useCallback(
    async (id: number): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(`/intensive-sessions/${id}/pause`);

        if (response.data) {
          const apiResponse = response.data;
          const sessionDetail = apiResponse.session;
          setCurrentSession(sessionDetail);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: sessionDetail.status } : s,
            ),
          );
          return sessionDetail;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al pausar sesión";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Obtener información de abandono (penalización)
   */
  const getAbandonInfo = useCallback(
    async (id: number): Promise<AbandonInfo | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      try {
        const response = await api.get<AbandonInfo>(
          `/intensive-sessions/${id}/abandon-info`,
        );
        return response.data || null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al obtener info de abandono";
        setError(errorMessage);
        return null;
      }
    },
    [user],
  );

  /**
   * Abandonar una sesión
   */
  const abandonSession = useCallback(
    async (id: number): Promise<IntensiveStudySession | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<IntensiveStudySession>(
          `/intensive-sessions/${id}/abandon`,
        );

        if (response.data) {
          setCurrentSession(null);
          setCurrentPomodoro(null);
          setCurrentCard(null);
          setSessions((prev) =>
            prev.map((s) => (s.id === id ? response.data : s)),
          );
          return response.data;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al abandonar sesión";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Completar una sesión
   */
  const completeSession = useCallback(
    async (id: number): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(
          `/intensive-sessions/${id}/complete`,
        );

        if (response.data) {
          const apiResponse = response.data;
          const session = apiResponse.session;
          setCurrentSession(session);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: session.status } : s,
            ),
          );
          return session;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al completar sesión";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // ==================== FUNCIONES DE POMODORO ====================

  /**
   * Iniciar un bloque Pomodoro
   */
  const startPomodoro = useCallback(
    async (sessionId: number): Promise<PomodoroBlock | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(
          `/intensive-sessions/${sessionId}/pomodoro/start`,
        );

        if (response.data) {
          const apiResponse = response.data;
          const block = apiResponse.block;
          setCurrentPomodoro(block);
          return block;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al iniciar Pomodoro";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Completar un bloque Pomodoro
   */
  const completePomodoro = useCallback(
    async (
      sessionId: number,
      blockId: number,
    ): Promise<PomodoroBlock | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(
          `/intensive-sessions/${sessionId}/pomodoro/${blockId}/complete`,
        );

        if (response.data) {
          const apiResponse = response.data;
          const block = apiResponse.block;
          setCurrentPomodoro(block);
          return block;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al completar Pomodoro";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Terminar descanso
   */
  const endBreak = useCallback(
    async (
      sessionId: number,
      blockId: number,
    ): Promise<PomodoroBlock | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(
          `/intensive-sessions/${sessionId}/pomodoro/${blockId}/end-break`,
        );

        if (response.data) {
          const apiResponse = response.data;
          // No hay block en la respuesta, solo success y message
          // Retornamos el objeto completo para que el componente maneje la respuesta
          return apiResponse.success ? apiResponse : null;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al terminar descanso";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Saltar descanso
   */
  const skipBreak = useCallback(
    async (
      sessionId: number,
      blockId: number,
    ): Promise<PomodoroBlock | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(
          `/intensive-sessions/${sessionId}/pomodoro/${blockId}/skip-break`,
        );

        if (response.data) {
          const apiResponse = response.data;
          // No hay block en la respuesta, solo success y message
          return apiResponse.success ? apiResponse : null;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al saltar descanso";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // ==================== FUNCIONES DE TARJETAS ====================

  /**
   * Obtener la siguiente tarjeta
   */
  const getNextCard = useCallback(
    async (sessionId: number): Promise<IntensiveSessionCard | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      try {
        const response = await api.get<any>(
          `/intensive-sessions/${sessionId}/cards/next`,
        );

        if (response.data) {
          const apiResponse = response.data;

          // Si no hay más tarjetas, el backend retorna { card: null, blockComplete: true }
          if (apiResponse.card === null || apiResponse.blockComplete === true) {
            setCurrentCard(null);
            return null;
          }

          // El backend retorna los campos de la tarjeta directamente:
          // { sessionCardId, cardId, question, answer, images, blockComplete, ... }
          // Mapear al formato IntensiveSessionCard
          const sessionCard: IntensiveSessionCard = {
            id: apiResponse.sessionCardId || apiResponse.id,
            sessionId: sessionId,
            cardId: apiResponse.cardId,
            difficulty: apiResponse.difficulty,
            completed: apiResponse.completed || false,
            completedAt: apiResponse.completedAt,
            order: apiResponse.order || 0,
            // El backend retorna los datos de la tarjeta directamente, no anidados
            card: {
              id: apiResponse.cardId,
              question: apiResponse.question || "",
              answer: apiResponse.answer || "",
              topicId: apiResponse.topicId || 0,
            },
            createdAt: apiResponse.createdAt || new Date().toISOString(),
            updatedAt: apiResponse.updatedAt || new Date().toISOString(),
          };

          setCurrentCard(sessionCard);
          return sessionCard;
        }
        // No hay más tarjetas
        setCurrentCard(null);
        return null;
      } catch (err: any) {
        // 404 significa que no hay más tarjetas
        if (err.response?.status === 404) {
          setCurrentCard(null);
          return null;
        }
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al obtener tarjeta";
        setError(errorMessage);
        return null;
      }
    },
    [user],
  );

  /**
   * Completar una tarjeta con dificultad
   */
  const completeCard = useCallback(
    async (
      sessionId: number,
      cardId: number,
      difficulty: CardDifficulty,
    ): Promise<IntensiveSessionCard | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      try {
        const response = await api.post<any>(
          `/intensive-sessions/${sessionId}/cards/${cardId}/complete`,
          { difficulty },
        );

        if (response.data) {
          const apiResponse = response.data;
          const card = apiResponse.card;
          setCurrentCard(null);
          return card;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al completar tarjeta";
        setError(errorMessage);
        return null;
      }
    },
    [user],
  );

  // ==================== UTILIDADES ====================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setSessions([]);
    setCurrentSession(null);
    setCurrentPomodoro(null);
    setCurrentCard(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // Estado
    sessions,
    currentSession,
    currentPomodoro,
    currentCard,
    loading,
    error,

    // Funciones de sesión
    createSession,
    fetchSessions,
    fetchSessionDetail,
    startSession,
    pauseSession,
    abandonSession,
    getAbandonInfo,
    completeSession,
    getActiveSession,

    // Funciones de Pomodoro
    startPomodoro,
    completePomodoro,
    endBreak,
    skipBreak,

    // Funciones de tarjetas
    getNextCard,
    completeCard,

    // Utilidades
    clearError,
    resetState,
  };
};

export default useIntensiveSessions;
