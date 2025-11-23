import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CardItemProps } from "../types/cards";

import { ImageModal } from "./ImageModal";

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
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-700 text-center uppercase tracking-wide">
            {card.topic?.name || t("content.noTopic")}
          </h4>
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

          {/* Botón Ver respuesta - Centrado */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              {showAnswer ? t("reviews.hide") : t("reviews.viewAnswer")}
            </button>
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

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end mt-auto">
            <button
              onClick={() => onEdit(card)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t("common.edit")}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isDeleting ? t("cards.deleting") : t("common.delete")}
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
