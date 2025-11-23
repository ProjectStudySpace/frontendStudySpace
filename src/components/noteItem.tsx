import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NoteItemProps } from "../types/notes";

import { ImageModal } from "./ImageModal";
import { BookOpen } from "lucide-react";

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt?: string;
  } | null>(null);

  const topicColor = note.topic?.color || "#60A5FA";

  const handleDelete = async () => {
    if (window.confirm(t("reviews.deleteNoteConfirm"))) {
      setIsDeleting(true);
      try {
        await onDelete(note.id);
      } catch (error) {
        console.error("Error al eliminar nota:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleImageClick = (imageUrl: string, altText?: string) => {
    setSelectedImage({ url: imageUrl, alt: altText });
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Encabezado con color del tema */}
        <div
          className="px-4 py-3"
          style={{
            backgroundColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? `${topicColor}` 
              : `${topicColor}80`,
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <BookOpen size={16} className="text-gray-700 dark:text-gray-700" />
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-700 uppercase tracking-wide">
              {note.topic?.name || t("content.noTopic")}
            </h4>
          </div>
        </div>

        {/* Título opcional */}
        {note.title && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
              {note.title}
            </h3>
          </div>
        )}

        {/* Contenido - Diseño de libro abierto */}
        <div className="flex-1 flex min-h-[400px] max-h-[500px]">
          {/* Página izquierda */}
          <div className="flex-1 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gradient-to-br from-blue-50/30 to-white dark:from-blue-900/10 dark:to-gray-800">
            <div className="mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                {t("content.leftPage")}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
              {note.leftContent ? (
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {note.leftContent}
                </p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  {t("content.noContent")}
                </p>
              )}
            </div>

            {/* Imagen página izquierda */}
            {note.leftImageUrl && (
              <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-800 flex justify-center">
                <img
                  src={note.leftImageUrl}
                  alt="Imagen página izquierda"
                  className="max-w-full max-h-40 object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                  onClick={() =>
                    handleImageClick(
                      note.leftImageUrl!,
                      "Imagen página izquierda"
                    )
                  }
                />
              </div>
            )}
          </div>

          {/* Página derecha */}
          <div className="flex-1 p-6 flex flex-col bg-gradient-to-bl from-green-50/30 to-white dark:from-green-900/10 dark:to-gray-800">
            <div className="mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                {t("content.rightPage")}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
              {note.rightContent ? (
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {note.rightContent}
                </p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  {t("content.noContent")}
                </p>
              )}
            </div>

            {/* Imagen página derecha */}
            {note.rightImageUrl && (
              <div className="mt-4 pt-4 border-t border-green-100 dark:border-green-800 flex justify-center">
                <img
                  src={note.rightImageUrl}
                  alt="Imagen página derecha"
                  className="max-w-full max-h-40 object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                  onClick={() =>
                    handleImageClick(
                      note.rightImageUrl!,
                      "Imagen página derecha"
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={() => onEdit(note)}
            className="bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t("common.edit")}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isDeleting ? t("notes.deleting") : t("common.delete")}
          </button>
        </div>
      </div>

      {/* Modal de imagen */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          altText={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};
