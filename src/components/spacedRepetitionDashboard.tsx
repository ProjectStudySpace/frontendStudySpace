import React, { useState, useMemo, useCallback } from "react";
import { useReviews } from "../../hooks/useReviews";
import ReviewSessionList from "./reviewSessionList";
import StudySession from "./studySession";
import ProgressSection from "./progressSection";
import CalendarWidget from "./calendarWidget";
import { CreateContentSelector } from "./createContentSelector";
import { BookOpen, Clock, TrendingUp, Play, Plus } from "lucide-react";

const SpacedRepetitionDashboard: React.FC = () => {
  const {
    pendingReviews,
    upcoming7DaysCount,
    totalUpcomingCount,
    upcomingPagination,
    pendingPagination,
    loading,
    error,
    completeReview,
    getGroupedSessions,
    fetchAllReviews,
    fetchUpcomingReviews,
    fetchPendingReviews,
  } = useReviews();

  const [currentSession, setCurrentSession] = useState<number>(0);
  const [showStudySession, setShowStudySession] = useState(false);
  const [showContentSelector, setShowContentSelector] = useState(false);

  const handleSessionsUpdate = useCallback(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  const handleUpcomingPageChange = useCallback(
    (page: number) => {
      fetchUpcomingReviews(7, page, 5);
    },
    [fetchUpcomingReviews]
  );

  const handlePendingPageChange = useCallback(
    (page: number) => {
      fetchPendingReviews(page, 5);
    },
    [fetchPendingReviews]
  );

  const startStudySession = () => {
    if (pendingReviews.length > 0) {
      setCurrentSession(0);
      setShowStudySession(true);
    }
  };

  const handleCompleteReview = async (difficulty: 1 | 2 | 3) => {
    const currentReview = pendingReviews[currentSession];

    try {
      await completeReview(currentReview.id, difficulty);
      // No avanzar automáticamente, el usuario debe usar los botones de navegación
    } catch (error) {
      console.error("Error completando revisión:", error);
    }
  };

  const handleNext = () => {
    if (currentSession < pendingReviews.length - 1) {
      setCurrentSession((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSession > 0) {
      setCurrentSession((prev) => prev - 1);
    }
  };

  const handleExitStudySession = () => {
    setShowStudySession(false);
    setCurrentSession(0);
  };

  const handleNewContent = () => {
    setShowContentSelector(true);
  };

  const handleSelectCard = () => {
    setShowContentSelector(false);
    // Navegar a la página de temas para crear tarjeta
    window.location.href = '/topics';
  };

  const handleSelectNote = () => {
    setShowContentSelector(false);
    // Navegar a la página de temas para crear nota
    window.location.href = '/topics';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (
    showStudySession &&
    pendingReviews.length > 0 &&
    currentSession < pendingReviews.length
  ) {
    const currentReview = pendingReviews[currentSession];

    return (
      <StudySession
        review={currentReview}
        currentCard={currentSession + 1}
        totalCards={pendingReviews.length}
        onComplete={handleCompleteReview}
        onExit={handleExitStudySession}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={currentSession < pendingReviews.length - 1}
        canGoPrevious={currentSession > 0}
      />
    );
  }

  const groupedSessions = getGroupedSessions();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Sesiones de repaso
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Sistema de repaso espaciado para optimizar tu aprendizaje
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleNewContent}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-indigo-600 rounded-xl font-semibold border-2 border-indigo-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow"
            >
              <Plus size={20} />
              <span>Nuevo contenido</span>
            </button>
            
            {pendingReviews.length > 0 && (
              <button
                onClick={startStudySession}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl justify-center"
              >
                <Play size={20} />
                <span className="sm:hidden">
                  Iniciar ({pendingReviews.length})
                </span>
                <span className="hidden sm:inline">
                  Iniciar repaso ({pendingReviews.length})
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-red-100">
                <Clock size={20} className="sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <p className="text-gray-600 text-xs sm:text-sm mb-1">
                  Pendientes hoy
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {pendingReviews.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-orange-100">
                <BookOpen size={20} className="sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-xs sm:text-sm mb-1">
                  Próximos 7 días
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {upcoming7DaysCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-purple-100">
                <TrendingUp
                  size={20}
                  className="sm:w-6 sm:h-6 text-purple-600"
                />
              </div>
              <div>
                <p className="text-gray-600 text-xs sm:text-sm mb-1">
                  Próximos 30 días
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {pendingReviews.length + totalUpcomingCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProgressSection />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Calendario de sesiones de repaso programadas
            </h2>
          </div>
        </div>
        <CalendarWidget />
      </div>

      <ReviewSessionList
        sessions={groupedSessions}
        onSessionsUpdate={handleSessionsUpdate}
        upcomingPagination={upcomingPagination}
        onUpcomingPageChange={handleUpcomingPageChange}
        pendingPagination={pendingPagination}
        onPendingPageChange={handlePendingPageChange}
      />

      {/* Selector de contenido */}
      {showContentSelector && (
        <CreateContentSelector
          onSelectCard={handleSelectCard}
          onSelectNote={handleSelectNote}
          onClose={() => setShowContentSelector(false)}
        />
      )}
    </div>
  );
};

export default SpacedRepetitionDashboard;