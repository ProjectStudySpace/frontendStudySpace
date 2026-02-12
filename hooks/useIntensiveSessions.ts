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
    topicId: string,
    intensity: StudyIntensity,
  ) => Promise<IntensiveStudySession | null>;
  fetchSessions: () => Promise<IntensiveStudySession[]>;
  fetchSessionDetail: (id: string) => Promise<IntensiveSessionDetail | null>;
  startSession: (id: string) => Promise<IntensiveSessionDetail | null>;
  pauseSession: (id: string) => Promise<IntensiveSessionDetail | null>;
  abandonSession: (id: string) => Promise<IntensiveStudySession | null>;
  getAbandonInfo: (id: string) => Promise<AbandonInfo | null>;
  completeSession: (id: string) => Promise<IntensiveSessionDetail | null>;

  // Funciones de Pomodoro
  startPomodoro: (sessionId: string) => Promise<PomodoroBlock | null>;
  completePomodoro: (
    sessionId: string,
    blockId: string,
  ) => Promise<PomodoroBlock | null>;
  endBreak: (
    sessionId: string,
    blockId: string,
  ) => Promise<PomodoroBlock | null>;
  skipBreak: (
    sessionId: string,
    blockId: string,
  ) => Promise<PomodoroBlock | null>;

  // Funciones de tarjetas
  getNextCard: (sessionId: string) => Promise<IntensiveSessionCard | null>;
  completeCard: (
    sessionId: string,
    cardId: string,
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
      topicId: string,
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
        const response = await api.post<IntensiveStudySession>(
          "/intensive-sessions",
          data,
        );

        if (response.data) {
          setSessions((prev) => [response.data, ...prev]);
          return response.data;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Error al crear sesión";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

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
    async (id: string): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<IntensiveSessionDetail>(
          `/intensive-sessions/${id}`,
        );

        if (response.data) {
          setCurrentSession(response.data);
          return response.data;
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
    async (id: string): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<IntensiveSessionDetail>(
          `/intensive-sessions/${id}/start`,
        );

        if (response.data) {
          setCurrentSession(response.data);
          // Actualizar en la lista también
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: response.data.status } : s,
            ),
          );
          return response.data;
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
    async (id: string): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<IntensiveSessionDetail>(
          `/intensive-sessions/${id}/pause`,
        );

        if (response.data) {
          setCurrentSession(response.data);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: response.data.status } : s,
            ),
          );
          return response.data;
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
    async (id: string): Promise<AbandonInfo | null> => {
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
    async (id: string): Promise<IntensiveStudySession | null> => {
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
    async (id: string): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<IntensiveSessionDetail>(
          `/intensive-sessions/${id}/complete`,
        );

        if (response.data) {
          setCurrentSession(response.data);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: response.data.status } : s,
            ),
          );
          return response.data;
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
    async (sessionId: string): Promise<PomodoroBlock | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<PomodoroBlock>(
          `/intensive-sessions/${sessionId}/pomodoro/start`,
        );

        if (response.data) {
          setCurrentPomodoro(response.data);
          return response.data;
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
      sessionId: string,
      blockId: string,
    ): Promise<PomodoroBlock | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<PomodoroBlock>(
          `/intensive-sessions/${sessionId}/pomodoro/${blockId}/complete`,
        );

        if (response.data) {
          setCurrentPomodoro(response.data);
          return response.data;
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
      sessionId: string,
      blockId: string,
    ): Promise<PomodoroBlock | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<PomodoroBlock>(
          `/intensive-sessions/${sessionId}/pomodoro/${blockId}/end-break`,
        );

        if (response.data) {
          setCurrentPomodoro(response.data);
          return response.data;
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
      sessionId: string,
      blockId: string,
    ): Promise<PomodoroBlock | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<PomodoroBlock>(
          `/intensive-sessions/${sessionId}/pomodoro/${blockId}/skip-break`,
        );

        if (response.data) {
          setCurrentPomodoro(response.data);
          return response.data;
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
    async (sessionId: string): Promise<IntensiveSessionCard | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      try {
        const response = await api.get<IntensiveSessionCard>(
          `/intensive-sessions/${sessionId}/cards/next`,
        );

        if (response.data) {
          setCurrentCard(response.data);
          return response.data;
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
      sessionId: string,
      cardId: string,
      difficulty: CardDifficulty,
    ): Promise<IntensiveSessionCard | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      try {
        const response = await api.post<IntensiveSessionCard>(
          `/intensive-sessions/${sessionId}/cards/${cardId}/complete`,
          { difficulty },
        );

        if (response.data) {
          setCurrentCard(null);
          return response.data;
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
