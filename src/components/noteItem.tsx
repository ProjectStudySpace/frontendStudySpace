import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NoteItemProps } from "../types/notes";

import { ImageModal } from "./ImageModal";
import { BookOpen, Edit2, Trash2 } from "lucide-react";

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

  // Convertir título vacío a null para mejor manejo
  const displayTitle = note.title && note.title.trim() ? note.title : null;

  // Combinar contenido izquierdo y derecho en una sola página de libro
  const displayContent = note.leftContent || note.rightContent ?
    [note.leftContent, note.rightContent].filter(Boolean).join("\n\n") : null;

  // Combinar todas las imágenes
  const allImages = [
    ...(note.leftImageUrls || []),
    ...(note.rightImageUrls || [])
  ];

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col min-h-[300px]">
        {/* Encabezado con color del tema - igual que tarjetas */}
        <div
          className="px-4 py-3"
          style={{
            backgroundColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? `${topicColor}` 
              : `${topicColor}80`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-gray-700 dark:text-gray-700" />
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-700 uppercase tracking-wide">
                {note.topic?.name || t("content.noTopic")}
              </h4>
            </div>
            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(note)}
                className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                style={{ color: '#666' }}
                title={t("common.edit")}
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                style={{ color: '#dc2626' }}
                title={t("common.delete")}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Página de libro - diseño limpio */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Título de la nota - negrita, centrado y más grande */}
          {displayTitle && (
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-3">
                {displayTitle}
              </h3>
              {/* Línea fina gris separadora */}
              <div className="h-px bg-gray-200 dark:bg-gray-600 w-full"></div>
            </div>
          )}

          {/* Contenido principal - mismo tamaño que tarjetas */}
          <div className="flex-1 overflow-y-auto">
            {displayContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {displayContent}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic text-sm text-center">
                {t("content.noContent")}
              </p>
            )}

            {/* Imagenes */}
            {allImages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2 justify-center">
                {allImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Imagen ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      handleImageClick(
                        url,
                        `Imagen ${index + 1}`
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
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
