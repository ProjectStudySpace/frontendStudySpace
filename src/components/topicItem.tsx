import React, { useState } from "react";
import { TopicItemProps } from "../types/topics";

// Inferir dificultad a partir del color
const getDifficultyFromColor = (color: string) => {
  switch (color) {
    case "#10B981": return "EASY";
    case "#F59E0B": return "MEDIUM";
    case "#EF4444": return "HARD";
    default: return "NONE";
  }
};

export const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  onEdit,
  onDelete,
  onViewCards,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el tema "${topic.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(topic.id);
      } catch (error) {
        console.error("Error al eliminar tema:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleViewCards = () => {
    if (onViewCards) onViewCards(topic.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="mb-3">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          {topic.name}
          <span
            className="inline-block px-2 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: topic.color }}
          >
            {getDifficultyFromColor(topic.color)}
          </span>
        </h3>

        {topic.description && <p className="text-gray-600 mb-2">{topic.description}</p>}

        <div className="flex justify-between text-sm text-gray-500 mt-3 border-t pt-2">
          <small>Creado: {new Date(topic.createdAt).toLocaleDateString()}</small>
        </div>
      </div>

      <div className="flex gap-2 justify-end flex-wrap">
        <button
          onClick={() => onEdit(topic)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:bg-red-300"
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </button>
        {onViewCards && (
          <button
            onClick={handleViewCards}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
          >
            Ver Tarjetas
          </button>
        )}
      </div>
    </div>
  );
};
