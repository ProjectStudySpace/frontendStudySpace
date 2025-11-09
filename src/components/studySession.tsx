import React, { useState } from "react";
import { ScheduledReview, StudySessionProps } from "../types/reviews";
import DifficultySelector from "./difficultySelector";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { ImageModal } from "./ImageModal";

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
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    1 | 2 | 3 | null
  >(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt?: string } | null>(null);

  const questionImages =
    review.card.images?.filter((img) => img.imageType === "question") || [];
  const answerImages =
    review.card.images?.filter((img) => img.imageType === "answer") || [];

  const handleImageClick = (imageUrl: string, altText?: string) => {
    setSelectedImage({ url: imageUrl, alt: altText });
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleDifficultySelect = (difficulty: 1 | 2 | 3) => {
    setSelectedDifficulty(difficulty);
    onComplete(difficulty);
  };

  const handleNext = () => {
    if (canGoNext) {
      setShowAnswer(false);
      setSelectedDifficulty(null);
      onNext();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setShowAnswer(false);
      setSelectedDifficulty(null);
      onPrevious();
    }
  };

  const progress = (currentCard / totalCards) * 100;

  return (
    <>
      <div className="fixed inset-0 bg-white flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full my-8 border border-gray-200 flex flex-col">
          <div className="flex-shrink-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-4 rounded-t-xl relative">
              {/* Botón cerrar en la esquina */}
              <button
                onClick={onExit}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              {/* Contenido centrado */}
              <div className="text-center text-white pr-12">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Sesión de Estudio</h2>
                
                {/* Nombre de la materia destacado */}
                <p className="text-xl sm:text-2xl font-bold mb-2">
                  {review.card.topic.name}
                </p>
                
                {/* Contador de tarjetas */}
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-white text-opacity-90">
                  <BookOpen size={16} className="sm:w-5 sm:h-5" />
                  <span>Tarjeta {currentCard} de {totalCards}</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Question - Centrada */}
            <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 border border-indigo-200">
              <h3 className="text-xs sm:text-sm font-semibold text-indigo-800 uppercase tracking-wide mb-3 text-center">
                Pregunta
              </h3>
              <p className="text-base sm:text-lg text-gray-900 whitespace-pre-wrap leading-relaxed text-center">
                {review.card.question}
              </p>
              
              {/* Imágenes de pregunta - Centradas */}
              {questionImages.length > 0 && (
                <div className="mt-4 flex gap-2 justify-center flex-wrap">
                  {questionImages.map((img) => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt={img.altText || "Imagen de pregunta"}
                      className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(img.imageUrl, img.altText)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Answer section */}
            {showAnswer ? (
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-200">
                <h3 className="text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wide mb-3">
                  Respuesta
                </h3>
                <p className="text-base sm:text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {review.card.answer}
                </p>
                
                {/* Imágenes de respuesta - Centradas */}
                {answerImages.length > 0 && (
                  <div className="mt-4 flex gap-2 justify-center flex-wrap">
                    {answerImages.map((img) => (
                      <img
                        key={img.id}
                        src={img.imageUrl}
                        alt={img.altText || "Imagen de respuesta"}
                        className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(img.imageUrl, img.altText)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleShowAnswer}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  Ver Respuesta
                </button>
              </div>
            )}

            {/* Difficulty selector */}
            {showAnswer && (
              <DifficultySelector
                selectedDifficulty={selectedDifficulty}
                onSelect={handleDifficultySelect}
              />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <span className="text-sm text-gray-600">
                {currentCard} / {totalCards}
              </span>

              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight size={20} />
              </button>
            </div>
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

export default StudySession;
