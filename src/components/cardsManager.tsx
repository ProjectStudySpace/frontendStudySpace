import React, { useState, useEffect } from "react";
import { Card, CardsManagerProps } from "../types/cards";
import { useCards } from "../../hooks/useCards";
import { CardList } from "./cardList";
import { CardForm } from "./cardForm";

export const CardsManager: React.FC<CardsManagerProps> = ({ topicId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const {
    cards,
    loading,
    error,
    pagination,
    fetchCardsByTopic,
    searchCards,
    changePage,
    addCard,
    updateCard,
    deleteCard,
    clearCards,
  } = useCards();

  const loadCards = async (page: number) => {
    if (isSearching) {
      await searchCards(debouncedTerm, page);
    } else {
      changePage(page);
    }
  };

  useEffect(() => {
    if (topicId) {
      setSearchTerm("");
      setDebouncedTerm("");
      setCurrentPage(1);
      setIsSearching(false);
      fetchCardsByTopic(topicId).catch((error) =>
        console.error("Error fetching cards:", error)
      );
    }
  }, [topicId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const trimmedTerm = debouncedTerm.trim();
    setIsSearching(trimmedTerm !== "");
    setCurrentPage(1);
    if (topicId) {
      if (trimmedTerm === "") {
        loadCards(1).catch((error) =>
          console.error("Error fetching cards:", error)
        );
      } else if (trimmedTerm.length >= 2) {
        loadCards(1).catch((error) =>
          console.error("Error searching cards:", error)
        );
      } else {
        clearCards();
      }
    }
  }, [debouncedTerm, topicId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCards(page).catch((error) =>
      console.error("Error loading cards:", error)
    );
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
        {!showForm && (
          <button
            onClick={handleCreateCard}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            + Nueva Tarjeta
          </button>
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
          cards={cards}
          onEdit={handleEditCard}
          onDelete={handleDeleteCard}
          topicId={topicId}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
