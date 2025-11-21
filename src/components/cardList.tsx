import React from "react";
import { useTranslation } from "react-i18next";
import { CardListProps } from "../types/cards";
import { CardItem } from "./cardItem";

export const CardList: React.FC<CardListProps> = ({
  cards,
  onEdit,
  onDelete,
  topicId,
  pagination,
  onPageChange,
  onCreateCard,
}) => {
  const { t } = useTranslation();
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-4">{t("components.cardList.noCards")}</p>
        {onCreateCard && (
          <button
            onClick={onCreateCard}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {t("components.cardList.createFirstCard")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="text-lg font-bold text-gray-900 mb-4">
        <h3>
          {t("components.cardList.topicCards")} (
          {pagination ? pagination.totalItems : cards.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {/* Botón + al final */}
        {onCreateCard && (
          <button
            onClick={onCreateCard}
            className="bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-500 flex items-center justify-center mb-3 transition-colors">
              <span className="text-3xl text-indigo-600 group-hover:text-white transition-colors">
                +
              </span>
            </div>
            <span className="text-gray-600 group-hover:text-indigo-600 font-medium transition-colors">
              {t("components.cardList.newCard")}
            </span>
          </button>
        )}
      </div>
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
          >
            {t("common.previous")}
          </button>
          <span className="text-gray-600">
            {t("common.page")} {pagination.currentPage} {t("common.of")}{" "}
            {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
          >
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
};
