import React, { useState } from 'react';
import { CardItemProps } from '../types/cards';
import { getLighterColor } from '../types/colors';

export const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const topicColor = card.topic?.color || '#93C5FD';
  const lighterColor = getLighterColor(topicColor);

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
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 flex flex-col min-h-[200px]"
    >
      {/* Encabezado con color del tema */}
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: `${lighterColor}30`,
        }}
      >
        <h4 className="text-xs font-semibold text-gray-700 text-center uppercase tracking-wide">
          {card.topic?.name || 'Sin tema'}
        </h4>
      </div>
  
      {/* Contenido principal */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Pregunta */}
        <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-3">
          {card.question}
        </h3>
        
        {/* Botón de mostrar respuesta */}
        <div className="flex justify-center mb-3">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            {showAnswer ? 'Ocultar' : 'Ver respuesta'}
          </button>
        </div>
        
        {/* Respuesta */}
        {showAnswer && (
          <div className="mb-3 p-3 rounded-lg bg-gray-50 text-gray-700 text-sm flex-1 overflow-auto">
            <p className="whitespace-pre-wrap line-clamp-4">{card.answer}</p>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex gap-2 justify-end mt-auto">
          <button
            onClick={() => onEdit(card)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};