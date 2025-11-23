import { useState } from "react";
import { Note, CreateNoteData, UpdateNoteData } from "../src/types/notes";
import { useAuth } from "../src/context/AuthContext";
import { API_URL } from "../src/config";

const API_BASE_URL = API_URL || "http://localhost:3000/api";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 5,
  });
  const { user } = useAuth();

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("No se encontró token. Por favor inicia sesión.");
    return token;
  };

  const fetchNotesByTopic = async (topicId: number, page: number = 1, pageSize: number = 5): Promise<Note[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/cards/topic/${topicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener notas");

      const data = await response.json();
      const cardsArray: any[] = data.cards || [];
      
      // Filtrar solo las cards de tipo "explanation" (notas) y mapear campos
      const notesArray: Note[] = cardsArray
        .filter(card => card.type && card.type.toUpperCase() === "EXPLANATION")
        .map(card => ({
          id: card.id,
          title: card.question || "", // Use question as title since no title field in API
          leftContent: card.question || "",
          rightContent: card.answer || "",
          type: card.type,
          topicId: card.topicId || topicId,
          leftImageUrl: card.images?.find((img: any) => img.imageType === "question")?.imageUrl,
          rightImageUrl: card.images?.find((img: any) => img.imageType === "answer")?.imageUrl,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
          topic: card.topic,
        }));

      const notesWithTopic: Note[] = notesArray.map((note) => ({
        ...note,
        topic: {
          id: note.topic?.id || topicId,
          name: note.topic?.name || "Materia",
          color: note.topic?.color || "#93C5FD",
          description: note.topic?.description || "",
        },
      }));

      setAllNotes(notesWithTopic);
      const totalPages = Math.ceil(notesWithTopic.length / pageSize);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setPagination({
        currentPage: page,
        totalPages,
        totalItems: notesWithTopic.length,
        pageSize,
      });
      setNotes(notesWithTopic.slice(start, end));
      return notesWithTopic;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setNotes([]);
      setAllNotes([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchNotes = async (
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Note[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/cards/search?search=${encodeURIComponent(
          searchTerm
        )}&page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al buscar notas");

      const data = await response.json();
      const cardsArray: any[] = data.cards || [];
      
      // Filtrar solo las cards de tipo "explanation" (notas) y mapear campos
      const notesArray: Note[] = cardsArray
        .filter(card => card.type && card.type.toUpperCase() === "EXPLANATION")
        .map(card => ({
          id: card.id,
          title: card.question || "", // Use question as title since no title field in API
          leftContent: card.question || "",
          rightContent: card.answer || "",
          type: card.type,
          topicId: card.topicId,
          leftImageUrl: card.images?.find((img: any) => img.imageType === "question")?.imageUrl,
          rightImageUrl: card.images?.find((img: any) => img.imageType === "answer")?.imageUrl,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
          topic: card.topic,
        }));
      
      setNotes(notesArray);
      const pag = data.pagination || {};
      setPagination({
        currentPage: pag.page || page,
        totalPages:
          pag.totalPages || Math.ceil((pag.total || 0) / (pag.limit || limit)),
        totalItems: pag.total || 0,
        pageSize: pag.limit || limit,
      });
      return notesArray;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setNotes([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (noteData: CreateNoteData): Promise<Note> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const token = getToken();

      const formData = new FormData();
      // Mapear campos de nota a los campos que espera el backend
      formData.append("question", noteData.leftContent);
      formData.append("answer", noteData.rightContent);
      formData.append("type", (noteData.type || "explanation").toUpperCase());
      formData.append("topicId", noteData.topicId.toString());

      // Mapear imágenes de nota a los campos que espera el backend
      if (noteData.leftImage) {
        formData.append("questionImage", noteData.leftImage);
      }
      if (noteData.rightImage) {
        formData.append("answerImage", noteData.rightImage);
      }

      const response = await fetch(`${API_BASE_URL}/cards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al crear nota");

      const data = await response.json();
      // Mapear la respuesta del backend al formato de nota del frontend
      const card = data.card;
      const mappedNote: Note = {
        id: card.id,
        title: card.question || "", // Use question as title since no title field in API
        leftContent: card.question || "",
        rightContent: card.answer || "",
        type: card.type,
        topicId: card.topicId,
        leftImageUrl: card.images?.find((img: any) => img.imageType === "question")?.imageUrl,
        rightImageUrl: card.images?.find((img: any) => img.imageType === "answer")?.imageUrl,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        topic: card.topic,
      };
      
      setAllNotes((prev) => [...prev, mappedNote]);
      setNotes((prev) => [...prev, mappedNote]);

      const newTotal = allNotes.length + 1;
      const newTotalPages = Math.ceil(newTotal / pagination.pageSize);
      setPagination((prev) => ({
        ...prev,
        totalItems: newTotal,
        totalPages: newTotalPages,
      }));
      return mappedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (
    id: number,
    updates: UpdateNoteData
  ): Promise<Note> => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();

      const formData = new FormData();
      // Mapear campos de nota a los campos que espera el backend
      if (updates.leftContent !== undefined) formData.append("question", updates.leftContent);
      if (updates.rightContent !== undefined) formData.append("answer", updates.rightContent);
      // Siempre enviar el type en mayúsculas para asegurar consistencia
      formData.append("type", "EXPLANATION");

      // Mapear imágenes de nota a los campos que espera el backend
      if (updates.leftImage) {
        formData.append("questionImage", updates.leftImage);
      }
      if (updates.rightImage) {
        formData.append("answerImage", updates.rightImage);
      }

      const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al actualizar nota");

      const data = await response.json();
      // Mapear la respuesta del backend al formato de nota del frontend
      const card = data.card;
      const mappedNote: Note = {
        id: card.id,
        title: card.question || "", // Use question as title since no title field in API
        leftContent: card.question || "",
        rightContent: card.answer || "",
        type: card.type,
        topicId: card.topicId,
        leftImageUrl: card.images?.find((img: any) => img.imageType === "question")?.imageUrl,
        rightImageUrl: card.images?.find((img: any) => img.imageType === "answer")?.imageUrl,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        topic: card.topic,
      };
      
      setAllNotes((prev) =>
        prev.map((note) => (note.id === id ? mappedNote : note))
      );
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? mappedNote : note))
      );
      return mappedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al eliminar nota");

      // Actualizar allNotes primero
      const updatedAllNotes = allNotes.filter((note) => note.id !== id);
      setAllNotes(updatedAllNotes);
      
      const newTotal = updatedAllNotes.length;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / pagination.pageSize));
      
      setPagination((prev) => {
        const currentPage = prev.currentPage > newTotalPages ? newTotalPages : prev.currentPage;
        return {
          ...prev,
          currentPage,
          totalItems: newTotal,
          totalPages: newTotalPages,
        };
      });

      // Actualizar la página actual con los datos correctos
      const start = (Math.min(pagination.currentPage, newTotalPages) - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      setNotes(updatedAllNotes.slice(start, end));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePage = (page: number, pageSize?: number) => {
    const currentPageSize = pageSize || pagination.pageSize;
    const start = (page - 1) * currentPageSize;
    const end = start + currentPageSize;
    setNotes(allNotes.slice(start, end));
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
      pageSize: currentPageSize,
      totalPages: Math.ceil(allNotes.length / currentPageSize)
    }));
  };

  const clearNotes = () => {
    setNotes([]);
    setAllNotes([]);
  };

  return {
    notes,
    loading,
    error,
    pagination,
    fetchNotesByTopic,
    searchNotes,
    changePage,
    addNote,
    updateNote,
    deleteNote,
    clearNotes,
  };
};