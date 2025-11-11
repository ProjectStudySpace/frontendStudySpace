import React, { useState, useEffect, useRef } from "react";
import { CardFormProps } from "../types/cards";
import { ImagePreview } from "./imagePreview";
import { Image as ImageIcon } from "lucide-react";

export const CardForm: React.FC<CardFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
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
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5MB");
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
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5MB");
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
      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-2xl mx-auto space-y-4"
    >
      {/* Pregunta */}
      <div className="mb-4">
        <label
          htmlFor="question"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Pregunta:
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
          placeholder="Escribe tu pregunta aquí..."
        />

        {/* Botón para agregar imagen a pregunta */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => questionImageInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <ImageIcon size={16} />
            {questionImage || existingQuestionImageUrl
              ? "Cambiar imagen"
              : "Agregar imagen"}
          </button>
          <input
            ref={questionImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleQuestionImageChange}
            className="hidden"
          />
          <span className="text-xs text-gray-500">Opcional - Máximo 5MB</span>
        </div>

        {/* Preview de imagen de pregunta */}
        {(questionImage || existingQuestionImageUrl) && (
          <div className="mt-3">
            <ImagePreview
              file={questionImage}
              existingUrl={existingQuestionImageUrl}
              onRemove={removeQuestionImage}
              label="Imagen de pregunta"
            />
          </div>
        )}
      </div>

      {/* Respuesta */}
      <div className="mb-6">
        <label
          htmlFor="answer"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Respuesta:
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
          placeholder="Escribe tu respuesta aquí..."
        />

        {/* Botón para agregar imagen a respuesta */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => answerImageInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
          >
            <ImageIcon size={16} />
            {answerImage || existingAnswerImageUrl
              ? "Cambiar imagen"
              : "Agregar imagen"}
          </button>
          <input
            ref={answerImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleAnswerImageChange}
            className="hidden"
          />
          <span className="text-xs text-gray-500">Opcional - Máximo 5MB</span>
        </div>

        {/* Preview de imagen de respuesta */}
        {(answerImage || existingAnswerImageUrl) && (
          <div className="mt-3">
            <ImagePreview
              file={answerImage}
              existingUrl={existingAnswerImageUrl}
              onRemove={removeAnswerImage}
              label="Imagen de respuesta"
            />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}{" "}
          Tarjeta
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
