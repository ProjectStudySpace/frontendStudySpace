import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../src/config";

const API_BASE = API_URL || "http://localhost:3000/api";

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
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/users/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error(`Error fetching progress data: ${response.status}`);
      const data = await response.json();
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
