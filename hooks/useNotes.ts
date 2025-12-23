import { useState } from "react";
import { Note, CreateNoteData, UpdateNoteData } from "../src/types/notes";
import { useAuth } from "../src/context/AuthContext";
import { api, deduplicateRequest } from "../src/utils/axiosConfig";

//funcion auxiliar para mapear card del bacekend a nota del frontend
const mapCardToNote = (card: any, topicId?: number): Note => {
  const questionParts = (card.question || "").split("\n\n");
  const title =
    questionParts.length > 1
      ? questionParts[0].trim()
      : (card.question || "").trim();
  const leftContent =
    questionParts.length > 1
      ? questionParts.slice(1).join("\n\n").trim()
      : card.question || "";

  return {
    id: card.id,
    title,
    leftContent,
    rightContent: card.answer || "",
    type: card.type,
    topicId: card.topicId || topicId,
    leftImageUrl: card.images?.find((img: any) => img.imageType === "question")
      ?.imageUrl,
    rightImageUrl: card.images?.find((img: any) => img.imageType === "answer")
      ?.imageUrl,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    topic: card.topic,
  };
};

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 5,
  });
  const { user } = useAuth();

  // Helper para manejar errores de red
  const handleNetworkError = (err: any) => {
    if (
      err.code === "ERR_INSUFFICIENT_RESOURCES" ||
      err.code === "ERR_NETWORK"
    ) {
      setError("Error de conexión. Verifica tu internet e inténtalo de nuevo.");
    } else if (err.code === "ECONNABORTED") {
      setError("La solicitud tardó demasiado. Inténtalo de nuevo.");
    } else {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const fetchNotesByTopic = async (
    topicId: number,
    page: number = 1,
    pageSize: number = 5
  ): Promise<Note[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    setCurrentTopicId(topicId);
    try {
      const requestKey = `notes-topic-${topicId}-${page}-${pageSize}`;
      const { data } = await deduplicateRequest(requestKey, () =>
        api.get(`/cards/topic/${topicId}`, {
          params: { page, limit: pageSize, type: "EXPLANATION" },
        })
      );

      const cardsArray: any[] = data.cards || [];

      // Filtrar solo las cards de tipo "explanation" (notas) y mapear campos
      const notesArray: Note[] = cardsArray.map((card) =>
        mapCardToNote(card, topicId)
      );

      const notesWithTopic: Note[] = notesArray.map((note) => ({
        ...note,
        topic: {
          id: note.topic?.id || topicId,
          name: note.topic?.name || "Materia",
          color: note.topic?.color || "#93C5FD",
          description: note.topic?.description || "",
        },
      }));

      setNotes(notesWithTopic);
      const pag = data.pagination || {};
      setPagination({
        currentPage: pag.page || page,
        totalPages: pag.totalPages || Math.ceil((pag.total || 0) / pageSize),
        totalItems: pag.total || 0,
        pageSize: pag.limit || pageSize,
      });
      return notesWithTopic;
    } catch (err: any) {
      handleNetworkError(err);
      setNotes([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchNotes = async (
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
    topicId?: number
  ): Promise<Note[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const requestKey = `notes-search-${searchTerm}-${page}-${limit}-${
        topicId || "all"
      }`;
      const params: Record<string, any> = {
        search: searchTerm,
        page,
        limit,
        type: "EXPLANATION",
      };

      // Agregar filtro por tema si se proporciona
      if (topicId) {
        params.topicId = topicId;
      }

      const { data } = await deduplicateRequest(requestKey, () =>
        api.get(`/cards/search`, { params })
      );

      const cardsArray: any[] = data.cards || [];

      const notesArray: Note[] = cardsArray.map((card) =>
        mapCardToNote(card, topicId)
      );

      setNotes(notesArray);

      const pag = data.pagination || {};
      setPagination({
        currentPage: pag.page || page,
        totalPages: pag.totalPages || Math.ceil((pag.total || 0) / limit),
        totalItems: pag.total || 0,
        pageSize: pag.limit || limit,
      });
      return notesArray;
    } catch (err: any) {
      handleNetworkError(err);
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
      const formData = new FormData();
      // Mapear campos de nota a los campos que espera el backend
      // Enviar title como question (título de la nota) y leftContent como contenido adicional
      const questionWithTitle = noteData.title
        ? `${noteData.title}\n\n${noteData.leftContent || ""}`.trim()
        : noteData.leftContent || "";

      formData.append("question", questionWithTitle || "Sin título");
      formData.append("answer", noteData.rightContent || "Sin contenido");
      formData.append("type", (noteData.type || "explanation").toUpperCase());
      formData.append("topicId", noteData.topicId.toString());

      // Mapear imágenes de nota a los campos que espera el backend
      if (noteData.leftImage) {
        formData.append("questionImage", noteData.leftImage);
      }
      if (noteData.rightImage) {
        formData.append("answerImage", noteData.rightImage);
      }

      const { data } = await api.post(`/cards`, formData);

      const mappedNote = mapCardToNote(data, noteData.topicId);
      // La nueva nota aparece PRIMERA (orderBy: createdAt desc)
      //insertamos al incio y removemos la ultima si excede pageSize

      setNotes((prev) => {
        const updated = [mappedNote, ...prev];
        return updated.slice(0, pagination.pageSize);
      });

      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        totalPages: Math.ceil((prev.totalItems + 1) / prev.pageSize),
      }));
      return mappedNote;
    } catch (err: any) {
      handleNetworkError(err);
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
      const formData = new FormData();
      // Mapear campos de nota a los campos que espera el backend
      if (updates.title !== undefined || updates.leftContent !== undefined) {
        const questionWithTitle = updates.title
          ? `${updates.title}\n\n${updates.leftContent || ""}`.trim()
          : updates.leftContent || "";
        formData.append("question", questionWithTitle);
      }
      if (updates.rightContent !== undefined) {
        formData.append("answer", updates.rightContent);
      }
      // Siempre enviar el type en mayúsculas para asegurar consistencia
      formData.append("type", "EXPLANATION");

      // Mapear imágenes de nota a los campos que espera el backend
      if (updates.leftImage) {
        formData.append("questionImage", updates.leftImage);
      }
      if (updates.rightImage) {
        formData.append("answerImage", updates.rightImage);
      }

      const { data } = await api.put(`/cards/${id}`, formData);

      const mappedNote = mapCardToNote(data.card);

      //actualizar la nota en el estado
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? mappedNote : note))
      );

      return mappedNote;
    } catch (err: any) {
      handleNetworkError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/cards/${id}`);

      const newTotal = pagination.totalItems - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(newTotal / pagination.pageSize)
      );
      const currentNotesCount = notes.length;

      // Caso 1: La página queda vacía y no es la primera → ir a página anterior

      if (currentNotesCount === 1 && pagination.currentPage > 1) {
        await fetchNotesByTopic(
          currentTopicId!,
          pagination.currentPage - 1,
          pagination.pageSize
        );
      }
      // Caso 2: Hay más notas en otras páginas → traer una para llenar el hueco
      else if (currentNotesCount === 1 && newTotal > 0) {
        await fetchNotesByTopic(
          currentTopicId!,
          pagination.currentPage,
          pagination.pageSize
        );
      }
      // caso 3: quedan notas en la pagina actual -> solo eliminar localmente
      else {
        setNotes((prev) => prev.filter((note) => note.id !== id));
        setPagination((prev) => ({
          ...prev,
          totalItems: newTotal,
          totalPages: newTotalPages,
        }));
      }
    } catch (err: any) {
      handleNetworkError(err);
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
    await fetchNotesByTopic(currentTopicId, page, size);
  };

  const clearNotes = () => {
    setNotes([]);
    setCurrentTopicId(null);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 5,
    });
  };

  return {
    notes,
    loading,
    error,
    pagination,
    currentTopicId,
    fetchNotesByTopic,
    searchNotes,
    changePage,
    addNote,
    updateNote,
    deleteNote,
    clearNotes,
  };
};
