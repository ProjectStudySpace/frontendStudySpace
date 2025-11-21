import React, { useState, useEffect, useCallback } from "react";
import { Card, CardsManagerProps } from "../types/cards";
import { useCards } from "../../hooks/useCards";
import { CardList } from "./cardList";
import { CardForm } from "./cardForm";
import { useDynamicPagination } from "../../hooks/useDynamicPagination";
import { Search } from "lucide-react";

export const CardsManager: React.FC<CardsManagerProps> = ({ topicId, openFormInitially = false }) => {
  const [showForm, setShowForm] = useState(openFormInitially);
  const [editingCard, setEditingCard] = useState<Card | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dynamic pagination for cards
  const { pageSize: dynamicPageSize } = useDynamicPagination({
    cols: { mobile: 1, md: 2, lg: 3, xl: 4 },
    mobileLimit: 4, // 3 cards + 1 button
    rows: 2,
  });
  
  const {
    cards,
    loading,
    error,
    pagination,
    fetchCardsByTopic,
    changePage,
    addCard,
    updateCard,
    deleteCard,
  } = useCards();

  useEffect(() => {
    if (topicId) {
      setSearchTerm("");
      fetchCardsByTopic(topicId, 1, dynamicPageSize).catch((error) =>
        console.error("Error fetching cards:", error)
      );
    }
  }, [topicId, dynamicPageSize]);

  // Open form when openFormInitially changes to true
  useEffect(() => {
    if (openFormInitially) {
      setShowForm(true);
    }
  }, [openFormInitially]);

  // Filtrar tarjetas localmente (como en Temas.tsx)
  const filteredCards = cards.filter(
    (card) =>
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    changePage(page, dynamicPageSize);
  };

  const handleCreateCard = () => {
    setEditingCard(undefined);
    setShowForm(true);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleSubmit = async (cardData: {
    question: string;
    answer: string;
  }) => {
    try {
      if (editingCard) {
        await updateCard(editingCard.id, cardData);
      } else {
        await addCard({ ...cardData, topicId });
      }
      setShowForm(false);
      setEditingCard(undefined);
    } catch (error) {
      console.error("Error al guardar tarjeta:", error);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      await deleteCard(cardId);
    } catch (error) {
      console.error("Error al eliminar tarjeta:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCard(undefined);
  };

  if (loading)
    return (
      <div className="text-center py-8 text-gray-600">Cargando tarjetas...</div>
    );
  if (error)
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Search bar matching NotesManager style */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar en tarjetas por pregunta o respuesta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <CardForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingCard}
          isEditing={!!editingCard}
        />
      ) : (
        <CardList
          cards={filteredCards}
          onEdit={handleEditCard}
          onDelete={handleDeleteCard}
          topicId={topicId}
          pagination={pagination}
          onPageChange={handlePageChange}
          onCreateCard={handleCreateCard}
        />
      )}
    </div>
  );
};
