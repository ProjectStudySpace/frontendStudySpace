import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CardFormProps } from "../types/cards";
import { ImagePreview } from "./imagePreview";
import { Image as ImageIcon } from "lucide-react";

export const CardForm: React.FC<CardFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState(initialData?.question || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");
  const [questionImage, setQuestionImage] = useState<File | undefined>();
  const [answerImage, setAnswerImage] = useState<File | undefined>();
  const [existingQuestionImageUrl, setExistingQuestionImageUrl] = useState<
    string | undefined
  >(initialData?.questionImageUrl);
  const [existingAnswerImageUrl, setExistingAnswerImageUrl] = useState<
    string | undefined
  >(initialData?.answerImageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const answerImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question);
      setAnswer(initialData.answer);
      setExistingQuestionImageUrl(initialData.questionImageUrl);
      setExistingAnswerImageUrl(initialData.answerImageUrl);
    }
  }, [initialData]);

  const handleQuestionImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert(t("forms.invalidImage"));
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t("forms.imageTooLarge"));
        return;
      }
      setQuestionImage(file);
      setExistingQuestionImageUrl(undefined);
    }
  };

  const handleAnswerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert(t("forms.invalidImage"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(t("forms.imageTooLarge"));
        return;
      }
      setAnswerImage(file);
      setExistingAnswerImageUrl(undefined);
    }
  };

  const removeQuestionImage = () => {
    setQuestionImage(undefined);
    setExistingQuestionImageUrl(undefined);
    if (questionImageInputRef.current) {
      questionImageInputRef.current.value = "";
    }
  };

  const removeAnswerImage = () => {
    setAnswerImage(undefined);
    setExistingAnswerImageUrl(undefined);
    if (answerImageInputRef.current) {
      answerImageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          question,
          answer,
          questionImage,
          answerImage,
        });
        if (!isEditing) {
          setQuestion("");
          setAnswer("");
          setQuestionImage(undefined);
          setAnswerImage(undefined);
          setExistingQuestionImageUrl(undefined);
          setExistingAnswerImageUrl(undefined);
          if (questionImageInputRef.current)
            questionImageInputRef.current.value = "";
          if (answerImageInputRef.current)
            answerImageInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error al guardar tarjeta:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto space-y-4"
    >
      {/* Pregunta */}
      <div className="mb-4">
        <label
          htmlFor="question"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t("forms.questionLabel")}
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
          placeholder={t("forms.questionPlaceholder")}
        />

        {/* Botón para agregar imagen a pregunta */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => questionImageInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <ImageIcon size={16} />
            {questionImage || existingQuestionImageUrl
              ? t("forms.changeImage")
              : t("forms.addImage")}
          </button>
          <input
            ref={questionImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleQuestionImageChange}
            className="hidden"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("forms.optional")} - {t("forms.maxSize")}
          </span>
        </div>

        {/* Preview de imagen de pregunta */}
        {(questionImage || existingQuestionImageUrl) && (
          <div className="mt-3">
            <ImagePreview
              file={questionImage}
              existingUrl={existingQuestionImageUrl}
              onRemove={removeQuestionImage}
              label={t("forms.questionImage")}
            />
          </div>
        )}
      </div>

      {/* Respuesta */}
      <div className="mb-6">
        <label
          htmlFor="answer"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t("forms.answerLabel")}
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
          placeholder={t("forms.answerPlaceholder")}
        />

        {/* Botón para agregar imagen a respuesta */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => answerImageInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            <ImageIcon size={16} />
            {answerImage || existingAnswerImageUrl
              ? t("forms.changeImage")
              : t("forms.addImage")}
          </button>
          <input
            ref={answerImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleAnswerImageChange}
            className="hidden"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("forms.optional")} - {t("forms.maxSize")}
          </span>
        </div>

        {/* Preview de imagen de respuesta */}
        {(answerImage || existingAnswerImageUrl) && (
          <div className="mt-3">
            <ImagePreview
              file={answerImage}
              existingUrl={existingAnswerImageUrl}
              onRemove={removeAnswerImage}
              label={t("forms.answerImage")}
            />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 text-white rounded-lg font-medium transition-all disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("forms.saving")}
            </span>
          ) : (
            <span>
              {isEditing ? t("forms.update") : t("forms.create")}{" "}
              {isEditing ? "" : t("forms.card")}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
};
