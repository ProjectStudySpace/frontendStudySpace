import React, { useState, useEffect } from "react";
import { Card, CardsManagerProps } from "../types/cards";
import { useCards } from "../../hooks/useCards";
import { CardList } from "./cardList";
import { CardForm } from "./cardForm";

export const CardsManager: React.FC<CardsManagerProps> = ({ topicId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
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
      fetchCardsByTopic(topicId).catch((error) =>
        console.error("Error fetching cards:", error)
      );
    }
  }, [topicId]);

  // Filtrar tarjetas localmente (como en Temas.tsx)
  const filteredCards = cards.filter((card) =>
    card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    changePage(page);
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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-900">Tarjetas de Estudio</h2>
        {!showForm && (
          <input
            type="text"
            placeholder="Buscar preguntas y respuestas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
      </div>

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
