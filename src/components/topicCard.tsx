import React from "react";
import { TopicCardProps } from "../types/topics";
import { useTranslation } from "react-i18next";

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col min-h-[200px]">
      {/* Encabezado con color */}
      <div
        className="p-1 cursor-pointer"
        style={{
          backgroundColor:
            typeof window !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? `${topic.color}`
              : `${topic.color}80`,
        }}
        onClick={() => onSelect(topic.id)}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-800 text-center">
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
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
              {topic.description}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 justify-end mt-auto">
          <button
            onClick={() => onSelect(topic.id)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
          >
            {t("topics.viewCards")}
          </button>
          <button
            onClick={() => onEdit(topic)}
            className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t("common.edit")}
          </button>
          <button
            onClick={() => onDelete(topic.id)}
            className="bg-transparent text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};
