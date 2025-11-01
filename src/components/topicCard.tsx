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
      className="bg-white rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      {/* Encabezado */}
      <div 
        className="p-8 text-center relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${topic.color}20, ${topic.color})`,
        }}
        onClick={() => onSelect(topic.id)}
      >

        {/* Materia */}
        <h3 className="text-2xl font-bold text-gray-900 relative z-10 mb-3">
          {topic.name}
        </h3>
      </div>
  
      {/* Contenido principal */}
      <div className="p-6 bg-white">
        {/* Descripción */}
        {topic.description && (
          <div 
            className="mb-6 p-5 rounded-xl text-gray-700 text-left bg-gray-50/70 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            onClick={() => onSelect(topic.id)}
          >
            <p className="text-gray-600 leading-relaxed">{topic.description}</p>
          </div>
        )}
  
        {/* Botones de acción */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <button 
            onClick={() => onSelect(topic.id)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-2 group/btn"
          >
            <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Tarjetas
          </button>
          <button 
            onClick={() => onEdit(topic)}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm"
          >
            Editar
          </button>
          <button 
            onClick={() => onDelete(topic.id)}
            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}