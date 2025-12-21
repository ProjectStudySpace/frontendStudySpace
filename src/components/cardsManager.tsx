import React, { useState, useEffect, useCallback } from "react";
import { Card, CardsManagerProps } from "../types/cards";
import { useCards } from "../../hooks/useCards";
import { useNotification } from "../context/NotificationContext";
import { CardList } from "./cardList";
import { CardForm } from "./cardForm";
import { useDynamicPagination } from "../../hooks/useDynamicPagination";
import { Search } from "lucide-react";

export const CardsManager: React.FC<CardsManagerProps> = ({ topicId, openFormInitially = false }) => {
  const [showForm, setShowForm] = useState(openFormInitially);
  const [editingCard, setEditingCard] = useState<Card | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchPagination, setSearchPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10, // valor por defecto, se actualizará con dynamicPageSize
  });
  const [isSearching, setIsSearching] = useState(false);
  
  // Dynamic pagination for cards
  const { pageSize: dynamicPageSize } = useDynamicPagination({
    cols: { mobile: 1, md: 2, lg: 3, xl: 4 },
    mobileLimit: 4, // 3 cards + 1 button
    rows: 2,
  });
  
  const {
    cards,
    allCards,
    loading,
    error,
    pagination,
    fetchCardsByTopic,
    changePage,
    addCard,
    updateCard,
    deleteCard,
  } = useCards();

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (topicId) {
      setSearchTerm("");
      setCurrentPage(1);
      setIsSearching(false);
      fetchCardsByTopic(topicId, 1, dynamicPageSize).catch((error) =>
        console.error("Error fetching cards:", error)
      );
    }
  }, [topicId, dynamicPageSize]);
  
  // Filtrar todas las tarjetas y calcular paginación de resultados filtrados
  useEffect(() => {
    if (searchTerm.trim()) {
      // Con búsqueda: mostrar indicador de búsqueda
      setIsSearching(true);
      
      // Simular un pequeño delay para mostrar el indicador
      const timer = setTimeout(() => {
        const filtered = allCards.filter((card: Card) =>
          card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setCurrentPage(1);
        const start = 0;
        const end = dynamicPageSize;
        setFilteredCards(filtered.slice(start, end));
        setSearchPagination({
          currentPage: 1,
          totalPages: Math.ceil(filtered.length / dynamicPageSize),
          totalItems: filtered.length,
          pageSize: dynamicPageSize,
        });
        setIsSearching(false);
      }, 200);
      
      return () => clearTimeout(timer);
    } else {
      // Sin búsqueda: mostrar todas las tarjetas paginadas
      setIsSearching(false);
      const start = (currentPage - 1) * dynamicPageSize;
      const end = start + dynamicPageSize;
      setFilteredCards(allCards.slice(start, end));
      setSearchPagination({
        currentPage,
        totalPages: Math.ceil(allCards.length / dynamicPageSize),
        totalItems: allCards.length,
        pageSize: dynamicPageSize,
      });
    }
  }, [allCards, searchTerm, currentPage, dynamicPageSize]);

  // Open form when openFormInitially changes to true
  useEffect(() => {
    if (openFormInitially) {
      setShowForm(true);
    }
  }, [openFormInitially]);

  const handlePageChange = (page: number) => {
    if (searchTerm.trim()) {
      // Con búsqueda activa: paginar sobre resultados filtrados
      const filtered = allCards.filter((card: Card) =>
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const start = (page - 1) * dynamicPageSize;
      const end = start + dynamicPageSize;
      setFilteredCards(filtered.slice(start, end));
      setSearchPagination(prev => ({
        ...prev,
        currentPage: page,
      }));
    } else {
      // Sin búsqueda: usar cambio de página normal
      changePage(page, dynamicPageSize);
      setSearchPagination(prev => ({
        ...prev,
        currentPage: page,
      }));
    }
    setCurrentPage(page);
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
        showSuccess("Tarjeta actualizada", "La tarjeta se ha actualizado correctamente");
      } else {
        await addCard({ ...cardData, topicId, type: "flashcard" });
        showSuccess("Tarjeta creada", "La tarjeta se ha creado correctamente");
      }
      setShowForm(false);
      setEditingCard(undefined);
    } catch (error) {
      console.error("Error al guardar tarjeta:", error);
      showError("Error al guardar", "No se pudo guardar la tarjeta. Inténtalo de nuevo.");
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      await deleteCard(cardId);
      showSuccess("Tarjeta eliminada", "La tarjeta se ha eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar tarjeta:", error);
      showError("Error al eliminar", "No se pudo eliminar la tarjeta. Inténtalo de nuevo.");
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Buscar en tarjetas por pregunta o respuesta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchTerm.length > 0 && searchTerm.length < 2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-10">
                    Mínimo 2 caracteres para buscar
                  </p>
                )}
                {isSearching && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 ml-10">
                    Buscando "{searchTerm}"...
                  </p>
                )}
                {searchTerm.trim() && !isSearching && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-10">
                    {searchPagination.totalItems} resultado{searchPagination.totalItems !== 1 ? 's' : ''} encontrado{searchPagination.totalItems !== 1 ? 's' : ''}
                  </p>
                )}
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
          pagination={searchTerm.trim() ? searchPagination : pagination}
          onPageChange={handlePageChange}
          onCreateCard={handleCreateCard}
        />
      )}
    </div>
  );
};
