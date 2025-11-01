import React from 'react';
import { Topic, TopicCardProps } from '../types/topics';

export const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-0 mb-4 border-2 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      style={{ borderColor: topic.color }}
    >
      {/* Encabezado con gradiente de color */}
      <div 
        className="p-6 text-center rounded-t-lg"
        style={{ 
          background: `linear-gradient(135deg, ${topic.color}20, ${topic.color}40)`,
          borderBottom: `2px solid ${topic.color}30`
        }}
        onClick={() => onSelect(topic.id)}
      >
        <h3 className="text-2xl font-bold text-gray-900">
          {topic.name}
        </h3>
      </div>

      {/* Contenido principal */}
      <div className="p-6 bg-white">
        {/* Descripción */}
        {topic.description && (
          <div 
            className="mb-6 p-4 rounded-lg border-2 text-gray-700 text-left bg-white"
            style={{ borderColor: topic.color }}
            onClick={() => onSelect(topic.id)}
          >
            {topic.description}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 justify-end border-t border-gray-200 pt-4">
          <button 
            onClick={() => onSelect(topic.id)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Tarjetas
          </button>
          <button 
            onClick={() => onEdit(topic)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Editar
          </button>
          <button 
            onClick={() => onDelete(topic.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};