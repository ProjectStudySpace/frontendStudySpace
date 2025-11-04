import React from "react";
import { Topic, TopicCardProps } from "../types/topics";

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 flex flex-col min-h-[200px]">
      {/* Encabezado con color */}
      <div
        className="p-1 cursor-pointer"
        style={{
          backgroundColor: `${topic.color}20`,
        }}
        onClick={() => onSelect(topic.id)}
      >
        <h3 className="text-lg font-bold text-gray-900 text-center">
          {topic.name}
        </h3>
      </div>

      {/* Contenido principal */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Descripción */}
        {topic.description && (
          <div
            className="mb-4 flex-1 cursor-pointer"
            onClick={() => onSelect(topic.id)}
          >
            <p className="text-gray-600 text-sm line-clamp-3">
              {topic.description}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 justify-end mt-auto">
          <button
            onClick={() => onSelect(topic.id)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Ver Tarjetas
          </button>
          <button
            onClick={() => onEdit(topic)}
            className="bg-transparent border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6] px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(topic.id)}
            className="bg-transparent text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEE2E2] px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
