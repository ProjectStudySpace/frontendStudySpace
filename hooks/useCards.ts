import { useState } from "react";
import { Card, CreateCardData, UpdateCardData } from "../src/types/cards";
import { useAuth } from "../src/context/AuthContext";
import { api } from "../src/utils/axiosConfig";

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const { user } = useAuth();

  const fetchCardsByTopic = async (
    topicId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Card[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    setCurrentTopicId(topicId);
    try {
      const { data } = await api.get(`/cards/topic/${topicId}`, {
        params: { page, limit: pageSize, type: "FLASHCARD" },
      });

      if (!data) throw new Error("Error al obtener tarjetas");

      const cardsArray: Card[] = data.cards || [];

      //agregar informacion del topic a cada card
      const cardsWithTopic: Card[] = cardsArray.map((card) => ({
        ...card,
        topic: {
          id: card.topic?.id || topicId,
          name: card.topic?.name || "Materia",
          color: card.topic?.color || "#93C5FD",
          description: card.topic?.description || "",
        },
      }));

      setCards(cardsWithTopic);

      //usar metadata de paginacion del backend

      const pag = data.pagination || {};
      setPagination({
        currentPage: pag.currentPage || page,
        totalPages:
          pag.totalPages ||
          Math.ceil((pag.total || 0) / (pag.pageSize || pageSize)),
        totalItems: pag.totalItems || 0,
        pageSize: pag.pageSize || pageSize,
      });

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
    limit: number = 10,
    topicId?: number
  ): Promise<Card[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        search: searchTerm,
        page,
        limit,
        type: "FLASHCARD",
      };

      if (topicId) {
        params.topicId = topicId;
      }

      const { data } = await api.get(`/cards/search`, { params });
      if (!data) throw new Error("Error al buscar tarjetas");

      const cardsArray: Card[] = data.cards || [];

      setCards(cardsArray);

      //usar metadata de paginacion del backend
      const pag = data.pagination || {};
      setPagination({
        currentPage: pag.page || page,
        totalPages: pag.totalPages || Math.ceil((pag.total || 0) / limit),
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
      formData.append("type", (cardData.type || "flashcard").toUpperCase());
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

      //la nueca card aparece primero (order by createdAt desc)
      //insertamos al incio y remosvemos extras si hay mas del pageSize
      setCards((prev) => {
        const updated = [newCard.card, ...prev];
        return updated.slice(0, pagination.pageSize);
      });

      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        totalPages: Math.ceil((prev.totalItems + 1) / prev.pageSize),
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
    ///marcado-----> aqui debe resolverse la tarjeta tipo carrusel
    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      if (updates.question) formData.append("question", updates.question);
      if (updates.answer) formData.append("answer", updates.answer);
      if (updates.type) formData.append("type", updates.type.toUpperCase());

      // Agregar imágenes si existen
      if (updates.questionImage) {
        formData.append("questionImage", updates.questionImage);
      }
      if (updates.answerImage) {
        formData.append("answerImage", updates.answerImage);
      }

      const { data: updatedCard } = await api.put(`/cards/${id}`, formData);

      if (!updatedCard) throw new Error("Error al actualizar tarjeta");

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

      const newTotal = pagination.totalItems - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(newTotal / pagination.pageSize)
      );
      const currentCardsCount = cards.length;

      //caso 1 la paginacion queda vacia y no es la primera -> ir a pagaina anterior
      if (currentCardsCount === 1 && pagination.currentPage > 1) {
        await fetchCardsByTopic(
          currentTopicId!,
          pagination.currentPage - 1,
          pagination.pageSize
        );
      }
      //caso 2 hay mas cards en otras paginas > traer una para llenar el hueco
      else if (currentCardsCount === 1 && newTotal > 0) {
        await fetchCardsByTopic(
          currentTopicId!,
          pagination.currentPage,
          pagination.pageSize
        );
      }
      //caso 3 quedan cards en la pagina actual -> solo remover localmente
      else {
        setCards((prev) => prev.filter((card) => card.id !== id));
        setPagination((prev) => ({
          ...prev,
          totalItems: newTotal,
          totalPages: newTotalPages,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePage = async (page: number, pageSize?: number) => {
    if (currentTopicId === null) {
      console.warn("No se ha seleccionado un tema para cambiar de página.");
      return;
    }

    const size = pageSize || pagination.pageSize;
    await fetchCardsByTopic(currentTopicId, page, size);
  };

  const clearCards = () => {
    setCards([]);
    setAllCards([]);
  };

  return {
    cards,
    allCards,
    loading,
    error,
    pagination,
    currentTopicId,
    fetchCardsByTopic,
    searchCards,
    changePage,
    addCard,
    updateCard,
    deleteCard,
    clearCards,
  };
};
