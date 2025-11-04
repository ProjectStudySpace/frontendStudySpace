import React from 'react';
import { CardListProps } from '../types/cards';
import { CardItem } from './cardItem';

export const CardList: React.FC<CardListProps> = ({
  cards,
  onEdit,
  onDelete,
  topicId,
  pagination,
  onPageChange,
  onCreateCard
}) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-4">No hay tarjetas creadas en este tema.</p>
        {onCreateCard && (
          <button
            onClick={onCreateCard}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Crear primera tarjeta
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="text-lg font-bold text-gray-900 mb-4">
        <h3>Tarjetas del tema ({pagination ? pagination.totalItems : cards.length})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map(card => (
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
              <span className="text-3xl text-indigo-600 group-hover:text-white transition-colors">+</span>
            </div>
            <span className="text-gray-600 group-hover:text-indigo-600 font-medium transition-colors">
              Nueva tarjeta
            </span>
          </button>
        )}
      </div>
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-600 transition-colors"
          >
            Anterior
          </button>
          <span className="text-gray-600">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-600 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
