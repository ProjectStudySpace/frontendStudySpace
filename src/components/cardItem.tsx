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
      className="bg-white rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden group"
    >
      {/* Encabezado */}
      <div 
        className="px-6 py-5 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${lighterColor}30, ${lighterColor})`,
        }}
      >
        <div className="flex items-center justify-center gap-2 relative z-10">
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0 bg-white/80"
          />
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            {card.topic?.name || 'Sin tema'}
          </h4>
        </div>
      </div>
  
      {/* Contenido principal */}
      <div className="p-6 bg-white">
        <div className="mb-4">
          {/* Pregunta */}
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center leading-tight">
            {card.question}
          </h3>
          
          {/* Botón de mostrar respuesta */}
          <button 
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] mb-4 cursor-pointer group/answer"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className={`w-4 h-4 transition-transform ${showAnswer ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showAnswer ? 'Ocultar respuesta' : 'Mostrar respuesta'}
            </span>
          </button>
          
          {/* Respuesta */}
          {showAnswer && (
            <div 
              className="transition-all duration-500 transform origin-top"
              style={{ 
                animation: 'slideDown 0.3s ease-out'
              }}
            >
              <div className="p-5 rounded-xl bg-gray-50/80 text-gray-700 leading-relaxed">
                <p className="whitespace-pre-wrap">{card.answer}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-2 justify-end flex-wrap">
          <button 
            onClick={() => onEdit(card)}
            className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            Editar
          </button>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                Eliminando...
              </span>
            ) : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};