import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StudySessionProps } from "../types/reviews";
import DifficultySelector from "./difficultySelector";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  topicName, // Add optional topicName prop
}) => {
  const { t } = useTranslation();
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    1 | 2 | 3 | null
  >(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt?: string;
  } | null>(null);

  // Check if this is a note or a card
  const isNote =
    review.card.contentType === "note" || review.card.type === "EXPLANATION";

  // Extraer título y contenido izquierdo del question para notas
  const { noteTitle, noteLeftContent, noteRightContent } = useMemo(() => {
    if (isNote) {
      // Normalizar saltos de línea (Windows usa \r\n, Unix usa \n)
      const normalizedQuestion = (review.card.question || "").replace(
        /\r\n/g,
        "\n"
      );
      // Buscar doble salto de línea para separar título de contenido izquierdo
      const questionParts = normalizedQuestion.split("\n\n");
      const title =
        questionParts.length > 1
          ? questionParts[0].trim()
          : normalizedQuestion.trim();
      const leftContent =
        questionParts.length > 1
          ? questionParts.slice(1).join("\n\n").trim()
          : "";
      const rightContent = review.card.answer || "";
      return {
        noteTitle: title,
        noteLeftContent: leftContent,
        noteRightContent: rightContent,
      };
    }
    return { noteTitle: "", noteLeftContent: "", noteRightContent: "" };
  }, [isNote, review.card.question, review.card.answer]);

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
                {/* Título de la nota */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 text-center">
                    {t("studySession.noteTitle")}
                  </p>
                  <p className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed text-center font-semibold">
                    {noteTitle}
                  </p>
                </div>

                {showAnswer ? (
                  <>
                    {/* Página única estilo ebook */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 lg:p-12 border border-gray-200 dark:border-gray-700 min-h-[400px] max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {/* Contenido de la nota - tamaño reducido */}
                        <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-justify">
                          {noteLeftContent}
                          {noteLeftContent && noteRightContent && "\n\n"}
                          {noteRightContent}
                        </div>
                      </div>

                      {/* Todas las imágenes */}
                      {questionImages.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-center flex-wrap">
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
                  </>
                ) : (
                  <div className="flex justify-center">
                    <button
                      onClick={handleShowAnswer}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-all"
                    >
                      {t("studySession.viewAnswer")}
                    </button>
                  </div>
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

                  {questionImages.length > 0 && (
                    <div className="mt-4 flex gap-2 justify-center flex-wrap">
                      {questionImages.map((img) => (
                        <img
                          key={img.id}
                          src={img.imageUrl}
                          alt={img.altText || "Imagen de pregunta"}
                          className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            handleImageClick(img.imageUrl, img.altText)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                {showAnswer ? (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800 max-h-[60vh] overflow-y-auto">
                    <h3 className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200 uppercase tracking-wide mb-3">
                      {t("studySession.answer")}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                      {review.card.answer}
                    </p>

                    {answerImages.length > 0 && (
                      <div className="mt-4 flex gap-2 justify-center flex-wrap">
                        {answerImages.map((img) => (
                          <img
                            key={img.id}
                            src={img.imageUrl}
                            alt={img.altText || "Imagen de respuesta"}
                            className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              handleImageClick(img.imageUrl, img.altText)
                            }
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
                      {t("studySession.viewAnswer")}
                    </button>
                  </div>
                )}
              </>
            )}

            {showAnswer && (
              <DifficultySelector
                selectedDifficulty={selectedDifficulty}
                onSelect={handleDifficultySelect}
              />
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
