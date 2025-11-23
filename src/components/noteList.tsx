import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={40} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t("components.noteList.noNotes")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("components.noteList.createFirstNoteDescription")}
          </p>
          {onCreateNote && (
            <button
              onClick={onCreateNote}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              {t("components.noteList.createFirstNote")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
          <h3>
            {t("components.noteList.topicNotes")} (
            {pagination ? pagination.totalItems : notes.length})
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {/* Botón + al final */}
        {onCreateNote && (
          <button
            onClick={onCreateNote}
            className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-500 flex items-center justify-center mb-3 transition-colors">
              <span className="text-3xl text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors">
                +
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium transition-colors">
              {t("components.noteList.newNote")}
            </span>
          </button>
        )}
      </div>
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
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
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
          >
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
};
