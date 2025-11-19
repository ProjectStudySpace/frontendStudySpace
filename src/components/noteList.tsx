import React from "react";
import { NoteListProps } from "../types/notes";
import { NoteItem } from "./noteItem";
import { BookOpen, Plus } from "lucide-react";

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  onEdit,
  onDelete,
  topicId,
  pagination,
  onPageChange,
  onCreateNote,
}) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={40} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No hay notas en este tema
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera nota para comenzar a estudiar con el formato de libro abierto
          </p>
          {onCreateNote && (
            <button
              onClick={onCreateNote}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Crear primera nota
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Notas del tema
              </h3>
              <p className="text-sm text-gray-600">
                {pagination ? pagination.totalItems : notes.length} nota{(pagination ? pagination.totalItems : notes.length) !== 1 ? 's' : ''} en total
              </p>
            </div>
          </div>
          
          {onCreateNote && (
            <button
              onClick={onCreateNote}
              className="hidden sm:flex items-center gap-2 bg-white hover:bg-gray-50 text-indigo-600 font-medium py-2 px-4 rounded-lg transition-all border border-indigo-200 shadow-sm hover:shadow"
            >
              <Plus size={18} />
              Nueva nota
            </button>
          )}
        </div>
      </div>
      
      {/* Grid de notas */}
      <div className="grid grid-cols-1 gap-6">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Botón flotante para móviles */}
      {onCreateNote && (
        <button
          onClick={onCreateNote}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all transform hover:scale-110 z-40"
          aria-label="Nueva nota"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Botón de crear nota en escritorio (al final de la lista) */}
      {onCreateNote && (
        <button
          onClick={onCreateNote}
          className="hidden sm:flex bg-gradient-to-br from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border-2 border-dashed border-indigo-300 hover:border-indigo-400 rounded-2xl p-8 transition-all duration-200 flex-col items-center justify-center group w-full"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200 flex items-center justify-center mb-4 transition-all">
            <Plus size={32} className="text-indigo-600 group-hover:text-indigo-700 transition-colors" />
          </div>
          <span className="text-indigo-700 group-hover:text-indigo-800 font-semibold text-lg transition-colors">
            Crear nueva nota
          </span>
          <span className="text-gray-500 text-sm mt-1">
            Formato de libro abierto
          </span>
        </button>
      )}

      {/* Paginación */}
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 sm:gap-4 mt-8 pb-4">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
          >
            <span className="hidden sm:inline">Anterior</span>
            <span className="sm:hidden">‹</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              Página
            </span>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold">
              {pagination.currentPage}
            </span>
            <span className="text-sm text-gray-600 font-medium">
              de {pagination.totalPages}
            </span>
          </div>
          
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span className="sm:hidden">›</span>
          </button>
        </div>
      )}
    </div>
  );
};