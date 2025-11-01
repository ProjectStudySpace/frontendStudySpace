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
      className="bg-white rounded-lg shadow-sm p-0 mb-4 border-2 hover:shadow-md transition-shadow duration-200"
      style={{ borderColor: lighterColor }}
    >
      {/* Encabezado con nombre del tema */}
      <div 
        className="p-4 text-center rounded-t-lg"
        style={{ 
          background: `linear-gradient(135deg, ${lighterColor}20, ${lighterColor}40)`,
          borderBottom: `2px solid ${lighterColor}30`
        }}
      >
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
          {card.topic?.name || 'Sin tema'}
        </h4>
      </div>

      {/* Contenido principal */}
      <div className="p-4 bg-white">
        <div className="mb-3">
          {/* Pregunta */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
            {card.question}
          </h3>
          
          <button 
            onClick={() => setShowAnswer(!showAnswer)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors mb-3 cursor-pointer w-full sm:w-auto"
          >
            {showAnswer ? 'Ocultar' : 'Mostrar'} respuesta
          </button>
          
          {/* Respuesta */}
          {showAnswer && (
            <div 
              className="transition-all duration-300 max-h-96 p-3 rounded border-2 text-gray-700 overflow-hidden text-left bg-white"
              style={{ borderColor: lighterColor }}
            >
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
    </div>
  );
};