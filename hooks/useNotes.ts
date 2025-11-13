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

  const fetchNotesByTopic = async (topicId: number): Promise<Note[]> => {
    if (!user) throw new Error("Usuario no autenticado");

    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/notes/topic/${topicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener notas");

      const data = await response.json();
      const notesArray: Note[] = data.notes || [];

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
      const pageSize = 5;
      const totalPages = Math.ceil(notesWithTopic.length / pageSize);
      setPagination({
        currentPage: 1,
        totalPages,
        totalItems: notesWithTopic.length,
        pageSize,
      });
      setNotes(notesWithTopic.slice(0, pageSize));
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
        `${API_BASE_URL}/notes/search?search=${encodeURIComponent(
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
      const notesArray: Note[] = data.notes || [];
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
      formData.append("title", noteData.title);
      formData.append("leftContent", noteData.leftContent);
      formData.append("rightContent", noteData.rightContent);
      formData.append("topicId", noteData.topicId.toString());

      if (noteData.leftImage) {
        formData.append("leftImage", noteData.leftImage);
      }
      if (noteData.rightImage) {
        formData.append("rightImage", noteData.rightImage);
      }

      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al crear nota");

      const newNote = await response.json();
      setAllNotes((prev) => [...prev, newNote.note]);
      setNotes((prev) => [...prev, newNote.note]);

      const newTotal = allNotes.length + 1;
      const pageSize = 5;
      const newTotalPages = Math.ceil(newTotal / pageSize);
      setPagination((prev) => ({
        ...prev,
        totalItems: newTotal,
        totalPages: newTotalPages,
      }));
      return newNote.note;
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
      // Siempre incluir todos los campos, incluso si están vacíos
      if (updates.title !== undefined) formData.append("title", updates.title);
      if (updates.leftContent !== undefined) formData.append("leftContent", updates.leftContent);
      if (updates.rightContent !== undefined) formData.append("rightContent", updates.rightContent);

      // Solo agregar imágenes si hay archivos nuevos
      if (updates.leftImage) {
        formData.append("leftImage", updates.leftImage);
      }
      if (updates.rightImage) {
        formData.append("rightImage", updates.rightImage);
      }

      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al actualizar nota");

      const updatedNote = await response.json();
      setAllNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNote.note : note))
      );
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNote.note : note))
      );
      return updatedNote.note;
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
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
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
      const pageSize = 5;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize));
      
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
      const start = (Math.min(pagination.currentPage, newTotalPages) - 1) * pageSize;
      const end = start + pageSize;
      setNotes(updatedAllNotes.slice(start, end));
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
    setNotes(allNotes.slice(start, end));
    setPagination((prev) => ({ ...prev, currentPage: page }));
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