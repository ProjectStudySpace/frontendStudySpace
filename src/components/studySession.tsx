import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const isNote = review.card.contentType === "note" ||
                 review.card.type === "EXPLANATION";

  // Extraer título y contenido izquierdo del question para notas
  const { noteTitle, noteLeftContent, noteRightContent } = useMemo(() => {
    if (isNote) {
      // Normalizar saltos de línea (Windows usa \r\n, Unix usa \n)
      const normalizedQuestion = (review.card.question || "").replace(/\r\n/g, '\n');
      // Buscar doble salto de línea para separar título de contenido izquierdo
      const questionParts = normalizedQuestion.split('\n\n');
      const title = questionParts.length > 1 ? questionParts[0].trim() : normalizedQuestion.trim();
      const leftContent = questionParts.length > 1 ? questionParts.slice(1).join('\n\n').trim() : "";
      const rightContent = review.card.answer || "";
      return { noteTitle: title, noteLeftContent: leftContent, noteRightContent: rightContent };
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
        <div className="bg-white dark:bg-gray-800 shadow-lg w-full h-full overflow-y-auto border-gray-200 dark:border-gray-700 flex flex-col lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] lg:mx-auto lg:my-4 lg:h-auto lg:max-h-[calc(100vh-2rem)] lg:rounded-xl lg:border">
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
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  {isNote && review.card.title ? review.card.title : t("studySession.title")}
                </h2>
                <p className="text-xl sm:text-2xl font-bold mb-2">
                  {review.card.topic.name}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-white text-opacity-90">
                  <BookOpen size={16} className="sm:w-5 sm:h-5" />
                  <span>
                    {t("studySession.card")} {currentCard}{" "}
                    {t("studySession.of")} {totalCards}
                  </span>
                </div>
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
                {/* Mostrar solo el título encima del botón "Ver respuesta" */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4 sm:p-6 border border-indigo-200 dark:border-indigo-800 mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-indigo-800 dark:text-indigo-200 uppercase tracking-wide mb-2 text-center">
                    {t("studySession.noteTitle")}
                  </h3>
                  <p className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed text-center font-semibold">
                    {noteTitle}
                  </p>
                </div>

                {showAnswer ? (
                  <>
                    {/* Diseño de libro abierto - dos páginas */}
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Página izquierda */}
                      <div className="flex-1 bg-gradient-to-br from-blue-50/30 to-white dark:from-blue-900/10 dark:to-gray-800 rounded-xl p-4 sm:p-6 border border-indigo-200 dark:border-indigo-800 overflow-y-auto max-h-[50vh] lg:max-h-[60vh]">
                        <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {noteLeftContent}
                        </div>
                        {questionImages.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-800 flex gap-2 justify-center flex-wrap">
                            {questionImages.map((img) => (
                              <img
                                key={img.id}
                                src={img.imageUrl}
                                alt={img.altText || "Imagen"}
                                className="max-w-full max-h-40 object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                onClick={() =>
                                  handleImageClick(img.imageUrl, img.altText)
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Página derecha */}
                      <div className="flex-1 bg-gradient-to-bl from-green-50/30 to-white dark:from-green-900/10 dark:to-gray-800 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800 overflow-y-auto max-h-[50vh] lg:max-h-[60vh]">
                        <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {noteRightContent}
                        </div>
                        {answerImages.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-green-100 dark:border-green-800 flex gap-2 justify-center flex-wrap">
                            {answerImages.map((img) => (
                              <img
                                key={img.id}
                                src={img.imageUrl}
                                alt={img.altText || "Imagen"}
                                className="max-w-full max-h-40 object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                onClick={() =>
                                  handleImageClick(img.imageUrl, img.altText)
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
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
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">
                  {t("studySession.previous")}
                </span>
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentCard} / {totalCards}
              </span>

              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700"
              >
                <span className="hidden sm:inline">
                  {t("studySession.next")}
                </span>
                <ChevronRight size={20} />
              </button>
            </div>
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
