import { useState, useEffect } from "react";
import { API_URL } from "../src/config";

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  isActiveToday: boolean;
  pendingToday: number;
  canExtendStreak: boolean;
  wasAutoReset?: boolean;
}

export const useStreak = () => {
  const [streakData, setStreakData] = useState<StreakStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/streak/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener datos de racha");
      }

      const data = await response.json();
      setStreakData(data.streak);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStreakData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  return {
    streakData,
    loading,
    error,
    refetchStreak: fetchStreak,
  };
};
