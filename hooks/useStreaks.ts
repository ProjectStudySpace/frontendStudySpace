import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../src/config";

const api = axios.create({
  baseURL: API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
      const { data } = await api.get(`/streak/status`);

      if (!data) {
        throw new Error("Error al obtener datos de racha");
      }

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
