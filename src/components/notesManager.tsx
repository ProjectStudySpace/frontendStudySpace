import React, { useState, useEffect, useCallback } from "react";
import { Note, NotesManagerProps, CreateNoteData, UpdateNoteData } from "../types/notes";
import { useNotes } from "../../hooks/useNotes";
import { NoteList } from "./noteList";
import { NoteForm } from "./noteForm";
import { Search } from "lucide-react";

export const NotesManager: React.FC<NotesManagerProps> = ({ topicId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const {
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
  } = useNotes();
  
  const [localError, setLocalError] = useState<string | null>(null);

  // Cargar notas inicial o buscar
  const loadNotes = useCallback(async (page: number, searchQuery: string) => {
    try {
      if (searchQuery.trim() && searchQuery.length >= 2) {
        await searchNotes(searchQuery, page);
      } else if (!searchQuery.trim()) {
        changePage(page);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }, [searchNotes, changePage]);

  // Efecto para cargar notas cuando cambia el tema
  useEffect(() => {
    if (topicId) {
      setSearchTerm("");
      setDebouncedTerm("");
      setIsSearching(false);
      setShowForm(false);
      setEditingNote(undefined);
      setInitialLoadDone(false);
      setLocalError(null);
      
      fetchNotesByTopic(topicId)
        .then(() => {
          setInitialLoadDone(true);
          setLocalError(null); // Limpiar error en carga exitosa
        })
        .catch((err) => {
          console.error("Error fetching notes:", err);
          setInitialLoadDone(true);
          // Solo establecer error si es un error real, no cuando simplemente está vacío
          if (err && err.message && !err.message.toLowerCase().includes('no notes')) {
            setLocalError(err.message);
          }
        });
    }
  }, [topicId]);

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para búsqueda (solo cuando hay un término válido)
  useEffect(() => {
    const trimmedTerm = debouncedTerm.trim();
    
    if (!topicId || !initialLoadDone) return;

    if (trimmedTerm === "") {
      // Sin búsqueda, recargar solo si ya habíamos buscado antes
      if (isSearching) {
        setIsSearching(false);
        fetchNotesByTopic(topicId).catch((error) =>
          console.error("Error fetching notes:", error)
        );
      }
    } else if (trimmedTerm.length >= 2) {
      // Buscar con el término
      setIsSearching(true);
      loadNotes(1, trimmedTerm);
    } else if (trimmedTerm.length === 1) {
      // Término muy corto, limpiar resultados
      clearNotes();
    }
  }, [debouncedTerm, topicId, initialLoadDone, isSearching]);

  const handlePageChange = (page: number) => {
    loadNotes(page, debouncedTerm);
  };

  const handleCreateNote = () => {
    setEditingNote(undefined);
    setShowForm(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleSubmit = async (noteData: CreateNoteData | UpdateNoteData) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData as UpdateNoteData);
      } else {
        // Para crear, construir con todos los campos
        const createData: CreateNoteData = {
          title: (noteData as any).title,
          leftContent: (noteData as any).leftContent || "",
          rightContent: (noteData as any).rightContent || "",
          topicId,
          leftImage: noteData.leftImage,
          rightImage: noteData.rightImage,
        };
        await addNote(createData);
      }
      setShowForm(false);
      setEditingNote(undefined);
      
      // Recargar las notas después de crear/editar
      if (debouncedTerm.trim()) {
        await loadNotes(pagination.currentPage, debouncedTerm);
      } else {
        await fetchNotesByTopic(topicId);
      }
    } catch (error) {
      console.error("Error al guardar nota:", error);
      throw error; // Re-lanzar para que el form lo maneje
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNote(noteId);
      
      // Recargar si estamos buscando
      if (debouncedTerm.trim()) {
        await loadNotes(pagination.currentPage, debouncedTerm);
      }
    } catch (error) {
      console.error("Error al eliminar nota:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNote(undefined);
  };

  // No mostrar el loading spinner, dejar que NoteList maneje el estado vacío
  // if (loading && notes.length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center py-16">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
  //       <p className="text-gray-600">Cargando notas...</p>
  //     </div>
  //   );
  // }

  // Solo mostrar error si es un error real (no cuando está vacío)
  if (localError && initialLoadDone) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium mb-3">Error al cargar notas</p>
        <p className="text-red-600 text-sm mb-4">{localError}</p>
        <button
          onClick={() => {
            setLocalError(null);
            fetchNotesByTopic(topicId)
              .then(() => setLocalError(null))
              .catch((err) => setLocalError(err.message));
          }}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors border border-red-300"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar en notas por título o contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <p className="text-xs text-gray-500 mt-1 ml-10">
                  Escribe al menos 2 caracteres para buscar
                </p>
              )}
              {isSearching && (
                <p className="text-xs text-indigo-600 mt-1 ml-10">
                  Buscando "{debouncedTerm}"...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {showForm ? (
        <NoteForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingNote}
          isEditing={!!editingNote}
        />
      ) : (
        <NoteList
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          topicId={topicId}
          pagination={pagination}
          onPageChange={handlePageChange}
          onCreateNote={handleCreateNote}
        />
      )}
    </div>
  );
};