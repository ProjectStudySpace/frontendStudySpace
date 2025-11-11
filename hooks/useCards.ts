import { useState } from "react";
import axios from "axios";
import { Card, CreateCardData, UpdateCardData } from "../src/types/cards";
import { useAuth } from "../src/context/AuthContext";
import { API_URL } from "../src/config";

const API_BASE_URL = API_URL || "http://localhost:3000/api";

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

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const { user } = useAuth();

  //funcion para obtener token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("No se encontró token. Por favor inicia sesión.");
    return token;
  };

  const fetchCardsByTopic = async (topicId: number): Promise<Card[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/cards/topic/${topicId}`);

      if (!data) throw new Error("Error al obtener tarjetas");

      const cardsArray: Card[] = data.cards || [];

      const cardsWithTopic: Card[] = cardsArray.map((card) => ({
        ...card,
        topic: {
          id: card.topic?.id || topicId,
          name: card.topic?.name || "Materia",
          color: card.topic?.color || "#93C5FD",
          description: card.topic?.description || "",
        },
      }));

      setAllCards(cardsWithTopic);
      const pageSize = 5;
      const totalPages = Math.ceil(cardsWithTopic.length / pageSize);
      setPagination({
        currentPage: 1,
        totalPages,
        totalItems: cardsWithTopic.length,
        pageSize,
      });
      setCards(cardsWithTopic.slice(0, pageSize));
      return cardsWithTopic;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setCards([]);
      setAllCards([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchCards = async (
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Card[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/cards/search`, {
        params: { search: searchTerm, page, limit },
      });
      if (!data) throw new Error("Error al buscar tarjetas");

      const cardsArray: Card[] = data.cards || [];
      setCards(cardsArray);
      const pag = data.pagination || {};
      setPagination({
        currentPage: pag.page || page,
        totalPages:
          pag.totalPages || Math.ceil((pag.total || 0) / (pag.limit || limit)),
        totalItems: pag.total || 0,
        pageSize: pag.limit || limit,
      });
      return cardsArray;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setCards([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (cardData: CreateCardData): Promise<Card> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append("question", cardData.question);
      formData.append("answer", cardData.answer);
      formData.append("topicId", cardData.topicId.toString());

      // Agregar imágenes si existen
      if (cardData.questionImage) {
        formData.append("questionImage", cardData.questionImage);
      }
      if (cardData.answerImage) {
        formData.append("answerImage", cardData.answerImage);
      }

      const { data: newCard } = await api.post(`/cards`, formData);

      if (!newCard) throw new Error("Error al crear tarjeta");

      setAllCards((prev) => [...prev, newCard.card]);
      setCards((prev) => [...prev, newCard.card]);

      const newTotal = allCards.length + 1;
      const pageSize = 5;
      const newTotalPages = Math.ceil(newTotal / pageSize);
      setPagination((prev) => ({
        ...prev,
        totalItems: newTotal,
        totalPages: newTotalPages,
      }));
      return newCard.card;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCard = async (
    id: number,
    updates: UpdateCardData
  ): Promise<Card> => {
    setLoading(true);
    setError(null);
    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      if (updates.question) formData.append("question", updates.question);
      if (updates.answer) formData.append("answer", updates.answer);

      // Agregar imágenes si existen
      if (updates.questionImage) {
        formData.append("questionImage", updates.questionImage);
      }
      if (updates.answerImage) {
        formData.append("answerImage", updates.answerImage);
      }

      const { data: updatedCard } = await api.put(`/cards/${id}`, formData);

      if (!updatedCard) throw new Error("Error al actualizar tarjeta");

      setAllCards((prev) =>
        prev.map((card) => (card.id === id ? updatedCard.card : card))
      );
      setCards((prev) =>
        prev.map((card) => (card.id === id ? updatedCard.card : card))
      );
      return updatedCard.card;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/cards/${id}`);

      setAllCards((prev) => prev.filter((card) => card.id !== id));
      setCards((prev) => prev.filter((card) => card.id !== id));
      // Update pagination
      const newTotal = allCards.length - 1;
      const pageSize = 5;
      const newTotalPages = Math.ceil(newTotal / pageSize);
      setPagination((prev) => {
        const newPag = {
          ...prev,
          totalItems: newTotal,
          totalPages: newTotalPages,
        };
        // If current page is now empty and not first, go to previous
        if (prev.currentPage > 1 && prev.currentPage > newTotalPages) {
          setTimeout(() => changePage(newTotalPages), 0); // Delay to after state update
        }
        return newPag;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePage = (page: number) => {
    const pageSize = 5;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setCards(allCards.slice(start, end));
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const clearCards = () => {
    setCards([]);
    setAllCards([]);
  };

  return {
    cards,
    loading,
    error,
    pagination,
    fetchCardsByTopic,
    searchCards,
    changePage,
    addCard,
    updateCard,
    deleteCard,
    clearCards,
  };
};
