import { useState, useCallback } from "react";
import { Topic, CreateTopicData, UpdateTopicData } from "../src/types/topics";
import { useAuth } from "../src/context/AuthContext";
import { api, deduplicateRequest } from "../src/utils/axiosConfig";

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

  const fetchUserTopics = useCallback(
    async (page: number = 1, limit: number = 10): Promise<Topic[]> => {
      if (!user) throw new Error("Usuario no autenticado");

      setLoading(true);
      setError(null);

      try {
        // Use request deduplication to prevent multiple identical requests
        const requestKey = `topics-${page}-${limit}`;
        const { data } = await deduplicateRequest(requestKey, () =>
          api.get(`/topics`, {
            params: { page, limit },
          })
        );

        if (!data) {
          throw new Error("No se recibieron datos del servidor");
        }

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
        // Handle specific network errors
        if (err.code === 'ERR_INSUFFICIENT_RESOURCES' || err.code === 'ERR_NETWORK') {
          setError("Error de conexión. Verifica tu internet e inténtalo de nuevo.");
        } else if (err.code === 'ECONNABORTED') {
          setError("La solicitud tardó demasiado. Inténtalo de nuevo.");
        } else {
          setError(err.message || "Error desconocido al obtener temas");
        }
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const addTopic = async (
    topicData: CreateTopicData
  ): Promise<Topic | null> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/topics`, topicData);

      if (!data) {
        const msg = await data.text();
        throw new Error(`Error al crear tema: ${msg}`);
      }

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

      if (!data) {
        const msg = await data.text();
        throw new Error(`Error al actualizar tema: ${msg}`);
      }

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
      const { data } = await api.delete(`/topics/${id}`);

      if (!data) {
        const msg = await data.text();
        throw new Error(`Error al eliminar tema: ${msg}`);
      }

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

      if (!data) {
        const msg = await data.text();
        throw new Error(`Error al obtener tema: ${msg}`);
      }

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
