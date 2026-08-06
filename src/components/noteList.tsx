import React from "react";
import { useTranslation } from "react-i18next";
import { NoteListProps } from "../types/notes";
import { NoteItem } from "./noteItem";
import { BookOpen, Plus } from "lucide-react";

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onCreateNote,
}) => {
  const { t } = useTranslation();
  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-4">{t("components.noteList.noNotes")}</p>
        {onCreateNote && (
          <button
            onClick={onCreateNote}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {t("components.noteList.createFirstNote")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <BookOpen
            size={20}
            className="text-blue-600 dark:text-blue-400"
          />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t("components.noteList.topicNotes")} (
            {pagination ? pagination.totalItems : notes.length})
          </h3>
        </div>
        {/* Botón + para nueva nota */}
        {onCreateNote && (
          <button
            onClick={onCreateNote}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>{t("components.noteList.newNote")}</span>
          </button>
        )}
      </div>

      {/* Lista de notas - full width vertical */}
      <div className="space-y-6">
        {notes.map((note, index) => (
          <NoteItem
            key={note.id ?? `${note.createdAt}-${index}`}
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Paginación */}
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-blue-700 transition-colors disabled:cursor-not-allowed"
          >
            {t("common.previous")}
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            {t("common.page")} {pagination.currentPage} {t("common.of")}{" "}
            {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-blue-700 transition-colors disabled:cursor-not-allowed"
          >
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
};
