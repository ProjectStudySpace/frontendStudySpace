import React, { useState, useEffect } from 'react';
import { CardFormProps } from '../types/cards';

export const CardForm: React.FC<CardFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [question, setQuestion] = useState(initialData?.question || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question);
      setAnswer(initialData.answer);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      setIsSubmitting(true);
      try {
        await onSubmit({ question, answer });
        if (!isEditing) {
          setQuestion('');
          setAnswer('');
        }
      } catch (error) {
        console.error('Error al guardar tarjeta:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-md mx-auto space-y-4">
      <div className="mb-4">
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">Pregunta:</label>
        <textarea
          id="question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={3}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">Respuesta:</label>
        <textarea
          id="answer"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={3}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:bg-purple-300">
          {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')} Tarjeta
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
};