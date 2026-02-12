import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StudySessionProps } from "../types/reviews";
import DifficultySelector from "./difficultySelector";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageModal } from "./ImageModal";

// Tipo de imagen definido localmente
type CardImageType = {
  id: number;
  imageUrl: string;
  imageType: "question" | "answer";
  order: number;
  altText?: string;
};

// Componente de carrusel de imágenes
const ImageCarousel: React.FC<{
  images: CardImageType[];
  onImageClick: (url: string, alt?: string) => void;
  maxWidth?: string;
}> = ({ images, onImageClick, maxWidth = "280px" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <img
        src={images[0].imageUrl}
        alt={images[0].altText || "Imagen"}
        className={`w-full max-w-[${maxWidth}] h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={() => onImageClick(images[0].imageUrl, images[0].altText)}
      />
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`relative inline-block w-full max-w-[${maxWidth}]`}>
      <img
        src={images[currentIndex].imageUrl}
        alt={images[currentIndex].altText || `Imagen ${currentIndex + 1}`}
        className="w-full h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onImageClick(images[currentIndex].imageUrl, images[currentIndex].altText)}
      />
      
      {/* Flecha izquierda */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
        aria-label="Imagen anterior"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>
      
      {/* Flecha derecha */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
        aria-label="Imagen siguiente"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>
      
      {/* Indicadores de posición */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const StudySession: React.FC<StudySessionProps> = ({
  review,
  currentCard,
  totalCards,
  onComplete,
  onExit,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  topicName, // Add optional topicName prop
}) => {
  const { t } = useTranslation();
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    1 | 2 | 3 | null
  >(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt?: string;
  } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false); // State to control answer visibility

  // Check if this is a note or a card
  const isNote =
    review.card.contentType === "note" || review.card.type === "EXPLANATION";

  // Para notas: question = leftContent (título), answer = rightContent (contenido)
  const noteTitle = review.card.question || "";
  const noteContent = review.card.answer || "";

  const questionImages =
    review.card.images?.filter((img) => img.imageType === "question") || [];
  const answerImages =
    review.card.images?.filter((img) => img.imageType === "answer") || [];

  const handleImageClick = (imageUrl: string, altText?: string) => {
    setSelectedImage({ url: imageUrl, alt: altText });
  };

  const handleDifficultySelect = (difficulty: 1 | 2 | 3) => {
    setSelectedDifficulty(difficulty);
    onComplete(difficulty);
  };

  const handleNext = () => {
    if (canGoNext) {
      setSelectedDifficulty(null);
      setShowAnswer(false); // Reset showAnswer for notes
      onNext();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setSelectedDifficulty(null);
      setShowAnswer(false); // Reset showAnswer for notes
      onPrevious();
    }
  };

  const progress = (currentCard / totalCards) * 100;

  return (
    <>
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        <div className="bg-white dark:bg-gray-800 shadow-lg w-full h-full overflow-y-auto border-gray-200 dark:border-gray-700 flex flex-col lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] lg:mx-auto lg:my-4 lg:h-auto lg:max-h-[calc(100vh-2rem)] lg:rounded-xl lg:border relative">
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-4 lg:rounded-t-xl relative">
              <button
                onClick={onExit}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                aria-label={t("studySession.close")}
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              <div className="text-center text-white pr-12">
                <p className="text-lg sm:text-xl font-semibold mb-2">
                  {topicName ||
                    review.card.topic?.name ||
                    t("studySession.topic")}
                </p>
                <p className="text-sm sm:text-base text-white text-opacity-90">
                  Sesión de estudio - tarjeta {currentCard} de {totalCards}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Content display */}
            {isNote ? (
              <>
                {/* Question (title) - always visible */}
                {noteTitle && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 text-center">
                      {t("studySession.noteTitle")}
                    </p>
                    <p className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed text-center font-semibold">
                      {noteTitle}
                    </p>

                    {questionImages.length > 0 && (
                      <div className="mt-4 flex gap-2 justify-center flex-wrap">
                        {questionImages.map((img) => (
                          <img
                            key={img.id}
                            src={img.imageUrl}
                            alt={img.altText || "Imagen"}
                            className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                            onClick={() =>
                              handleImageClick(img.imageUrl, img.altText)
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Show answer button or answer content */}
                {showAnswer ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 lg:p-12 border border-gray-200 dark:border-gray-700 min-h-[300px] max-h-[60vh] lg:max-h-[65vh] overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-justify">
                        {noteContent || (
                          <span className="text-gray-400 dark:text-gray-500 italic">
                            {t("content.noContent")}
                          </span>
                        )}
                      </div>
                    </div>

                    {answerImages.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-center flex-wrap">
                        {answerImages.map((img) => (
                          <img
                            key={img.id}
                            src={img.imageUrl}
                            alt={img.altText || "Imagen"}
                            className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                            onClick={() =>
                              handleImageClick(img.imageUrl, img.altText)
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                    >
                      {t("studySession.viewAnswer")}
                    </button>
                  </div>
                )}

                {/* Difficulty selector after showing answer */}
                {showAnswer && (
                  <DifficultySelector
                    selectedDifficulty={selectedDifficulty}
                    onSelect={handleDifficultySelect}
                  />
                )}
              </>
            ) : (
              <>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 sm:p-6 border border-indigo-200 dark:border-indigo-800 max-h-[60vh] overflow-y-auto">
                  <h3 className="text-xs sm:text-sm font-semibold text-indigo-800 dark:text-indigo-200 uppercase tracking-wide mb-3 text-center">
                    {t("studySession.question")}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed text-center">
                    {review.card.question}
                  </p>

                  {/* Imágenes de pregunta - Carrusel */}
                  {questionImages.length > 0 && (
                    <div className="mt-4 flex justify-center max-w-[280px] mx-auto">
                      <ImageCarousel
                        images={questionImages}
                        onImageClick={handleImageClick}
                        maxWidth="280px"
                      />
                    </div>
                  )}
                </div>

                {/* Mostrar answer solo después de hacer click */}
                {showAnswer ? (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800 max-h-[50vh] overflow-y-auto">
                    <h3 className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200 uppercase tracking-wide mb-3 text-center">
                      {t("studySession.answer")}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed text-center">
                      {review.card.answer}
                    </p>

                    {/* Imágenes de respuesta - Carrusel */}
                    {answerImages.length > 0 && (
                      <div className="mt-4 flex justify-center max-w-[280px] mx-auto">
                        <ImageCarousel
                          images={answerImages}
                          onImageClick={handleImageClick}
                          maxWidth="280px"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                    >
                      {t("studySession.viewAnswer")}
                    </button>
                  </div>
                )}

                {/* Selector de dificultad después de mostrar answer */}
                {showAnswer && (
                  <DifficultySelector
                    selectedDifficulty={selectedDifficulty}
                    onSelect={handleDifficultySelect}
                  />
                )}
              </>
            )}

            {/* Side navigation buttons */}
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800"
              aria-label={t("studySession.previous")}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800"
              aria-label={t("studySession.next")}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

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

export default StudySession;
