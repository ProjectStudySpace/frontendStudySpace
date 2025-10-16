import React, { useState } from 'react';
import { CardItemProps } from '../types/cards';

export const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      setIsDeleting(true);
      try {
        await onDelete(card.id);
      } catch (error) {
        console.error('Error al eliminar tarjeta:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{card.question}</h3>
        <button 
          onClick={() => setShowAnswer(!showAnswer)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors mb-3 cursor-pointer w-full sm:w-auto"
        >
          {showAnswer ? 'Ocultar' : 'Mostrar'} respuesta
        </button>
        {showAnswer && (
          <div className="transition-all duration-300 max-h-96 p-3 bg-purple-50 rounded border border-purple-200 text-gray-700 overflow-hidden">
            <p>{card.answer}</p>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end flex-wrap">
        <button 
          onClick={() => onEdit(card)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Editar
        </button>
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:bg-red-300"
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  );
};