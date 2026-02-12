/**
 * Hook para gestionar Gamificación - Fase 2
 * XP, Badges, Leaderboard y estadísticas
 */
import { useState, useCallback } from "react";
import { useAuth } from "../src/context/AuthContext";
import { api, deduplicateRequest } from "../src/utils/axiosConfig";
import {
  GamificationStats,
  UserBadge,
  LeaderboardEntry,
  LeaderboardResponse,
  XpTransaction,
} from "../src/types/gamification";

interface UseGamificationReturn {
  // Estado
  stats: GamificationStats | null;
  badges: UserBadge[];
  leaderboard: LeaderboardEntry[];
  userPosition: number | null;
  recentTransactions: XpTransaction[];
  loading: boolean;
  error: string | null;

  // Funciones
  fetchStats: () => Promise<GamificationStats | null>;
  fetchBadges: () => Promise<UserBadge[]>;
  fetchLeaderboard: (
    limit?: number,
    offset?: number,
  ) => Promise<LeaderboardEntry[]>;
  fetchUserPosition: () => Promise<number | null>;
  fetchRecentTransactions: (limit?: number) => Promise<XpTransaction[]>;

  // Utilidades
  clearError: () => void;
  resetState: () => void;
}

export const useGamification = (): UseGamificationReturn => {
  const { user } = useAuth();

  // Estado
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<XpTransaction[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener estadísticas de gamificación del usuario
   */
  const fetchStats =
    useCallback(async (): Promise<GamificationStats | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const requestKey = "gamification-stats";
        const response = await deduplicateRequest(requestKey, () =>
          api.get<GamificationStats>("/gamification/stats"),
        );

        if (response.data) {
          setStats(response.data);
          setBadges(response.data.badges || []);
          setRecentTransactions(response.data.recentTransactions || []);
          return response.data;
        }
        return null;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al obtener estadísticas";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    }, [user]);

  /**
   * Obtener badges del usuario
   */
  const fetchBadges = useCallback(async (): Promise<UserBadge[]> => {
    if (!user) {
      setError("Usuario no autenticado");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const requestKey = "gamification-badges";
      const response = await deduplicateRequest(requestKey, () =>
        api.get<{ badges: UserBadge[] }>("/gamification/badges"),
      );

      const badgesData = response.data?.badges || [];
      setBadges(badgesData);
      return badgesData;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al obtener badges";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Obtener leaderboard
   */
  const fetchLeaderboard = useCallback(
    async (
      limit: number = 10,
      offset: number = 0,
    ): Promise<LeaderboardEntry[]> => {
      if (!user) {
        setError("Usuario no autenticado");
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const requestKey = `gamification-leaderboard-${limit}-${offset}`;
        const response = await deduplicateRequest(requestKey, () =>
          api.get<LeaderboardResponse>("/gamification/leaderboard", {
            params: { limit, offset },
          }),
        );

        if (response.data) {
          setLeaderboard(response.data.entries || []);
          if (response.data.userPosition !== undefined) {
            setUserPosition(response.data.userPosition);
          }
          return response.data.entries || [];
        }
        return [];
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al obtener leaderboard";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Obtener posición del usuario en el leaderboard
   */
  const fetchUserPosition = useCallback(async (): Promise<number | null> => {
    if (!user) {
      setError("Usuario no autenticado");
      return null;
    }

    try {
      const response = await api.get<{ position: number }>(
        "/gamification/leaderboard/position",
      );

      if (response.data) {
        setUserPosition(response.data.position);
        return response.data.position;
      }
      return null;
    } catch (err: any) {
      // No mostrar error si falla la posición, es información secundaria
      console.warn("Error al obtener posición:", err.message);
      return null;
    }
  }, [user]);

  /**
   * Obtener transacciones recientes de XP
   */
  const fetchRecentTransactions = useCallback(
    async (limit: number = 10): Promise<XpTransaction[]> => {
      if (!user) {
        setError("Usuario no autenticado");
        return [];
      }

      try {
        const response = await api.get<{ transactions: XpTransaction[] }>(
          "/gamification/transactions",
          { params: { limit } },
        );

        const transactions = response.data?.transactions || [];
        setRecentTransactions(transactions);
        return transactions;
      } catch (err: any) {
        console.warn("Error al obtener transacciones:", err.message);
        return [];
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
    setStats(null);
    setBadges([]);
    setLeaderboard([]);
    setUserPosition(null);
    setRecentTransactions([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // Estado
    stats,
    badges,
    leaderboard,
    userPosition,
    recentTransactions,
    loading,
    error,

    // Funciones
    fetchStats,
    fetchBadges,
    fetchLeaderboard,
    fetchUserPosition,
    fetchRecentTransactions,

    // Utilidades
    clearError,
    resetState,
  };
};

export default useGamification;
