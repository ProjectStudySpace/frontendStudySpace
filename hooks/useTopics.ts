import { useState } from "react";
import { Topic, CreateTopicData, UpdateTopicData } from "../src/types/topics";
import { useAuth } from "../src/context/AuthContext";
import { API_URL } from "../src/config";

// Usando variable de entorno para producción o desarrollo
const API_BASE_URL = API_URL || "http://localhost:4000/api";

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
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/topics?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Error al obtener temas: ${msg}`);
      }

      const data = await response.json();
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
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(topicData),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Error al crear tema: ${msg}`);
      }

      const data = await response.json();
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
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Error al actualizar tema: ${msg}`);
      }

      const data = await response.json();
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
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const msg = await response.text();
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
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Error al obtener tema: ${msg}`);
      }

      const data = await response.json();
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
