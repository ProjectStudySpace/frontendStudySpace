import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CardItemProps } from "../types/cards";

import { ImageModal } from "./ImageModal";
import { BookOpen, Edit2, Trash2 } from "lucide-react";

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [showAnswer, setShowAnswer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt?: string;
  } | null>(null);

  const topicColor = card.topic?.color || "#60A5FA";

  // Obtener imágenes por tipo
  const questionImages =
    card.images?.filter((img) => img.imageType === "question") || [];
  const answerImages =
    card.images?.filter((img) => img.imageType === "answer") || [];

  const handleDelete = async () => {
    if (window.confirm(t("reviews.deleteConfirm"))) {
      setIsDeleting(true);
      try {
        await onDelete(card.id);
      } catch (error) {
        console.error("Error al eliminar tarjeta:", error);
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
        {/* Encabezado con color del tema */}
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
                {card.topic?.name || t("content.noTopic")}
              </h4>
            </div>
            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(card)}
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

        {/* Contenido principal */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Pregunta - Centrada */}
          <div className="mb-3 text-center">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {card.question}
            </h3>

            {/* Imágenes de pregunta - Centradas */}
            {questionImages.length > 0 && (
              <div className="mt-3 flex gap-2 justify-center flex-wrap">
                {questionImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.imageUrl}
                    alt={img.altText || "Imagen de pregunta"}
                    className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImageClick(img.imageUrl, img.altText)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Respuesta - NO centrada */}
          {showAnswer && (
            <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm flex-1 overflow-auto">
              <p className="whitespace-pre-wrap mb-2">{card.answer}</p>

              {/* Imágenes de respuesta - Centradas */}
              {answerImages.length > 0 && (
                <div className="mt-3 flex gap-2 justify-center flex-wrap">
                  {answerImages.map((img) => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt={img.altText || "Imagen de respuesta"}
                      className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        handleImageClick(img.imageUrl, img.altText)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botón Ver respuesta - Discreto, abajo a la derecha */}
          <div className="mt-auto pt-3 flex justify-end">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm"
            >
              {showAnswer ? t("reviews.hide") : t("reviews.viewAnswer")}
            </button>
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
