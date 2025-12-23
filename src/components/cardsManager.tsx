import React, { useState, useEffect, useCallback } from "react";
import { Card, CardsManagerProps } from "../types/cards";
import { useCards } from "../../hooks/useCards";
import { useNotification } from "../context/NotificationContext";
import { CardList } from "./cardList";
import { CardForm } from "./cardForm";
import { useDynamicPagination } from "../../hooks/useDynamicPagination";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export const CardsManager: React.FC<CardsManagerProps> = ({
  topicId,
  openFormInitially = false,
}) => {
  const [showForm, setShowForm] = useState(openFormInitially);
  const [editingCard, setEditingCard] = useState<Card | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const { t } = useTranslation();

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
    searchCards,
    changePage,
    addCard,
    updateCard,
    deleteCard,
    clearCards,
  } = useCards();

  const { showSuccess, showError } = useNotification();
  const loadCards = useCallback(
    async (page: number, searchQuery: string) => {
      try {
        if (searchQuery.trim() && searchQuery.length >= 2) {
          await searchCards(searchQuery, page, dynamicPageSize, topicId);
        } else if (!searchQuery.trim()) {
          await changePage(page, dynamicPageSize);
        }
      } catch (error) {
        console.error("Error loading cards:", error);
      }
    },
    [searchCards, changePage, topicId, dynamicPageSize]
  );

  useEffect(() => {
    if (topicId) {
      setSearchTerm("");
      setDebouncedTerm("");
      setIsSearching(false);
      setShowForm(false);
      setEditingCard(undefined);
      setInitialLoadDone(false);
      fetchCardsByTopic(topicId, 1, dynamicPageSize)
        .then(() => {
          setInitialLoadDone(true);
        })
        .catch((error) => {
          console.error("Error fetching cards:", error);
          setInitialLoadDone(true);
        });
    }
  }, [topicId, dynamicPageSize]);

  // Open form when openFormInitially changes to true
  useEffect(() => {
    if (openFormInitially) {
      setShowForm(true);
    }
  }, [openFormInitially]);

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para búsqueda
  useEffect(() => {
    const trimmedTerm = debouncedTerm.trim();

    if (!topicId || !initialLoadDone) return;

    if (trimmedTerm === "") {
      // Sin búsqueda, recargar solo si ya habíamos buscado antes
      if (isSearching) {
        setIsSearching(false);
        fetchCardsByTopic(topicId, 1, dynamicPageSize).catch((error) =>
          console.error("Error fetching cards:", error)
        );
      }
    } else if (trimmedTerm.length >= 2) {
      // Buscar con el término
      setIsSearching(true);
      loadCards(1, trimmedTerm);
    } else if (trimmedTerm.length === 1) {
      // Término muy corto, limpiar resultados
      clearCards();
    }
  }, [debouncedTerm, topicId, initialLoadDone, isSearching]);

  const handlePageChange = async (page: number) => {
    if (searchTerm.trim() && debouncedTerm.length >= 2) {
      await loadCards(page, debouncedTerm);
    } else {
      await changePage(page, dynamicPageSize);
    }
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
    //todo-------> implementar internacionalizacion de las notificaciones
    try {
      if (editingCard) {
        await updateCard(editingCard.id, cardData);
        showSuccess(
          "Tarjeta actualizada",
          "La tarjeta se ha actualizado correctamente"
        );
      } else {
        await addCard({ ...cardData, topicId, type: "flashcard" });
        showSuccess("Tarjeta creada", "La tarjeta se ha creado correctamente");
      }
      setShowForm(false);
      setEditingCard(undefined);

      if (debouncedTerm.trim()) {
        await loadCards(pagination.currentPage, debouncedTerm);
      } else {
        await fetchCardsByTopic(
          topicId,
          pagination.currentPage,
          dynamicPageSize
        );
      }
    } catch (error) {
      console.error("Error al guardar tarjeta:", error);
      showError(
        "Error al guardar",
        "No se pudo guardar la tarjeta. Inténtalo de nuevo."
      );
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      await deleteCard(cardId);
      showSuccess(
        "Tarjeta eliminada",
        "La tarjeta se ha eliminado correctamente"
      );
      if (debouncedTerm.trim()) {
        await loadCards(pagination.currentPage, debouncedTerm);
      }
    } catch (error) {
      console.error("Error al eliminar tarjeta:", error);
      showError(
        "Error al eliminar",
        "No se pudo eliminar la tarjeta. Inténtalo de nuevo."
      );
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

  if (error && initialLoadDone) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium mb-3">
          {t("components.cardsManager.errorLoading")}
        </p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => {
            fetchCardsByTopic(topicId, 1, dynamicPageSize).catch(console.error);
          }}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors border border-red-300"
        >
          {t("components.cardsManager.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      {!showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder={t("components.cardsManager.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-10">
                  {t("components.cardsManager.minCharacters")}
                </p>
              )}
              {loading && isSearching && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 ml-10">
                  {t("components.cardsManager.searching")} "{debouncedTerm}"...
                </p>
              )}
              {isSearching && !loading && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-10">
                  {pagination.totalItems}{" "}
                  {pagination.totalItems !== 1
                    ? t("components.cardsManager.resultsFound")
                    : t("components.cardsManager.resultFound")}
                </p>
              )}
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
          cards={cards}
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
