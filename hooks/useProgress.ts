import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../src/config";

const API_BASE = API_URL || "http://localhost:3000/api";

// Configurar instancia de axios
const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ProgressData {
  totalTopics: number;
  totalCards: number;
  pendingReviews: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
}

export const useProgress = () => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/users/dashboard`);
      setProgressData(data.dashboard.stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error loading progress data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progressData,
    loading,
    error,
    refetchProgress: fetchProgress,
  };
};
