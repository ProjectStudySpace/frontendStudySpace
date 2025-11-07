import { useState } from "react";
import axios from "axios";
import { Topic, CreateTopicData, UpdateTopicData } from "../src/types/topics";
import { useAuth } from "../src/context/AuthContext";
import { API_URL } from "../src/config";

// Usando variable de entorno para producción o desarrollo
const API_BASE_URL = API_URL || "http://localhost:4000/api";

// Configurar instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const { user } = useAuth();

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("No se encontró token. Por favor inicia sesión.");
    return token;
  };

  const fetchUserTopics = async (
    page: number = 1,
    limit: number = 10
  ): Promise<Topic[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/topics`, {
        params: { page, limit }
      });
      setTopics(data.topics || []);
      const pag = data.pagination || {};
      setPagination({
        currentPage: pag.page || page,
        totalPages:
          pag.totalPages || Math.ceil((pag.total || 0) / (pag.limit || limit)),
        totalItems: pag.total || 0,
        pageSize: pag.limit || limit,
      });
      return data.topics || [];
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addTopic = async (
    topicData: CreateTopicData
  ): Promise<Topic | null> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/topics`, topicData);
      const newTopic: Topic = data.topic;
      setTopics((prev) => [...prev, newTopic]);
      return newTopic;
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTopic = async (
    id: number,
    updates: UpdateTopicData
  ): Promise<Topic | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/topics/${id}`, updates);
      const updatedTopic: Topic = data.topic;
      setTopics((prev) =>
        prev.map((topic) => (topic.id === id ? updatedTopic : topic))
      );
      return updatedTopic;
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTopic = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/topics/${id}`);

      setTopics((prev) => prev.filter((topic) => topic.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTopicById = async (id: number): Promise<Topic | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/topics/${id}`);
      return data.topic || null;
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    topics,
    loading,
    error,
    pagination,
    fetchUserTopics,
    addTopic,
    updateTopic,
    deleteTopic,
    getTopicById,
  };
};
