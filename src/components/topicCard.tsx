import React from 'react';
import { Topic, TopicCardProps } from '../types/topics';

export const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const getDifficultyText = (color: string) => {
    switch (color) {
      case "#10B981": return "Fácil";
      case "#F59E0B": return "Medio";
      case "#EF4444": return "Difícil";
      default: return "Sin categorizar";
    }
  };

  const getDifficultyColor = (color: string) => {
    switch (color) {
      case "#10B981": return "bg-green-100 text-green-800 border-green-200";
      case "#F59E0B": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "#EF4444": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
      {/* Header con nombre y dificultad */}
      <div className="flex justify-between items-start mb-4">
        <h3 
          className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors flex-1 mr-3"
          onClick={() => onSelect(topic.id)}
        >
          {topic.name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(topic.color)}`}>
          {getDifficultyText(topic.color)}
        </span>
      </div>

      {/* Descripción */}
      {topic.description && (
        <div 
          className="mb-4 text-gray-600 line-clamp-2"
          onClick={() => onSelect(topic.id)}
        >
          {topic.description}
        </div>
      )}

      {/* Información adicional */}
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>Creado: {new Date(topic.createdAt).toLocaleDateString()}</span>
        <span 
          className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 font-medium"
          style={{ borderLeft: `3px solid ${topic.color}` }}
        >
          Materia
        </span>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 justify-end border-t pt-4">
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
  );
};