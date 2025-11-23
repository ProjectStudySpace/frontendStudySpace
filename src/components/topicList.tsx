import React from "react";
import { useTranslation } from "react-i18next";
import { TopicListProps } from "../types/topics";
import { TopicCard } from "./topicCard";

export const TopicList: React.FC<TopicListProps> = ({
  topics,
  onEdit,
  onDelete,
  onViewCards,
  pagination,
  onPageChange,
}) => {
  const { t } = useTranslation();
  if (topics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t("components.topicList.noTopics")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="text-lg font-bold text-gray-900 mb-4">
        <h3>
          {t("components.topicList.yourSubjects")} (
          {pagination ? pagination.totalItems : topics.length})
        </h3>
      </div>
      <div className="space-y-4">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={() => onViewCards?.(topic.id)}
          />
        ))}
      </div>
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {t("common.previous")}
          </button>
          <span>
            {t("common.page")} {pagination.currentPage} {t("common.of")}{" "}
            {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
};
