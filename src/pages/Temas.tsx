import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  FileText,
  TrendingUp,
  Flame,
  Plus,
  ChevronDown,
  Play,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { TopicsManager } from "../components/topicsManager";
import { CardsManager } from "../components/cardsManager";
import { NotesManager } from "../components/notesManager";
import { useStreak } from "../../hooks/useStreaks";
import { useReviews } from "../../hooks/useReviews";
import { useReviewsByTopic } from "../../hooks/useReviewsByTopic";

import { getStoredUserTimezone, formatDateForUser } from "../utils/dateUtils";
import { TopicCard } from "../components/topicCard";
import { useTopics } from "../../hooks/useTopics";
import { Topic, CreateTopicData } from "../types/topics";
import { TopicForm } from "../components/topicForm";
import { GoogleCalendarAuth } from "../components/googleCalendarAuth";
import { useDynamicPagination } from "../../hooks/useDynamicPagination";
import StudySession from "../components/studySession";
import { useNotification } from "../context/NotificationContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedTopicId = searchParams.get("topic")
    ? parseInt(searchParams.get("topic")!)
    : null;
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>("");
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTopics, setRefreshTopics] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showContentDropdown, setShowContentDropdown] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showStudySession, setShowStudySession] = useState(false);
  const [currentSession, setCurrentSession] = useState<number>(0);
  const [showTopicStudySession, setShowTopicStudySession] = useState(false);
  const [currentTopicSession, setCurrentTopicSession] = useState<number>(0);
  const [topicSessionType, setTopicSessionType] = useState<
    "FLASHCARD" | "EXPLANATION"
  >("FLASHCARD");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic pagination for topics
  const { pageSize } = useDynamicPagination({
    cols: { mobile: 1, md: 2, lg: 3, xl: 4 },
    mobileLimit: 5, // 4 topics + 1 button
    rows: 2,
  });

  const { getDashboard, handleGoogleCallback } = useAuth();
  const { streakData, loading: streakLoading } = useStreak();
  const { totalPendingCount, pendingReviews, completeReview } = useReviews();
  const {
    fetchPendingFlashcardsByTopic,
    fetchPendingExplanationsByTopic,
    pendingReviews: topicPendingReviews,
    topicInfo,
    counts,
    loading: topicLoading,
    completeReview: completeTopicReview,
  } = useReviewsByTopic();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    // Obtener zona horaria del usuario
    const timezone = getStoredUserTimezone();
    setUserTimezone(timezone);
  }, []);

  // Handle Google OAuth callback on dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("google_auth") === "success") {
      handleGoogleCallback();
    }
  }, [handleGoogleCallback]);

  const {
    topics,
    loading,
    pagination,
    fetchUserTopics,
    deleteTopic,
    updateTopic,
    addTopic,
  } = useTopics();

  useEffect(() => {
    const fetchDashboard = async () => {
      const data = await getDashboard();
      setDashboardData(data);
    };
    fetchDashboard();
    fetchUserTopics(currentPage, pageSize);
  }, [
    getDashboard,
    fetchUserTopics,
    refreshTopics,
    currentPage,
    pageSize,
    setDashboardData,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowContentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowContentDropdown]);

  // Reset form flags when topic changes
  useEffect(() => {
    setShowCardForm(false);
    setShowNoteForm(false);
  }, [selectedTopicId, setShowCardForm, setShowNoteForm]);

  // Clear topic review state when topic changes
  useEffect(() => {
    if (!selectedTopicId) {
      setShowTopicStudySession(false);
      setCurrentTopicSession(0);
    }
  }, [selectedTopicId]);

  //funcion para calcular el progreso promedio
  const calculateProgress = () => {
    if (!dashboardData?.stats) return 0;

    const pendingToday = streakData?.pendingToday ?? 0;
    let completedToday = 0;
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (dashboardData.recentActivity) {
      completedToday = dashboardData.recentActivity.filter((activity: any) => {
        const completeDate = new Date(activity.completedAt);
        // Si hay zona horaria del usuario, convertir la fecha completada a zona horaria local
        if (userTimezone) {
          try {
            const userDate = new Date(
              formatDateForUser(activity.completedAt, userTimezone)
            );
            return userDate >= startOfToday;
          } catch (error) {
            console.warn("Error convirtiendo fecha con zona horaria:", error);
            return completeDate >= startOfToday;
          }
        }
        return completeDate >= startOfToday;
      }).length;
    }
    const totalToday = completedToday + pendingToday;

    if (totalToday === 0) return 100;

    return Math.round((completedToday / totalToday) * 100);
  };

  const filteredTopics = topics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (window.confirm(t("topics.deleteConfirm"))) {
      try {
        await deleteTopic(topicId);
        setRefreshTopics((prev) => prev + 1);
        showSuccess("Tema eliminado", "El tema se ha eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar materia:", error);
        showError(
          "Error al eliminar",
          "No se pudo eliminar el tema. Inténtalo de nuevo."
        );
      }
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setShowTopicForm(true);
  };

  const handleSelectTopic = (topicId: number) => {
    navigate(`/topics?topic=${topicId}`);
  };

  const handleBackToTopics = () => {
    navigate("/topics");
  };

  const handleStartReview = () => {
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

  const handleStartTopicReview = async (type: "FLASHCARD" | "EXPLANATION") => {
    if (!selectedTopicId) return;

    setTopicSessionType(type);
    setCurrentTopicSession(0);
    setShowTopicStudySession(true);

    try {
      // Load reviews specific to the topic and type
      let reviews;
      if (type === "FLASHCARD") {
        reviews = await fetchPendingFlashcardsByTopic(selectedTopicId);
      } else {
        reviews = await fetchPendingExplanationsByTopic(selectedTopicId);
      }

      if (!reviews || reviews.length === 0) {
        setShowTopicStudySession(false);
        showError(
          "No hay repasos pendientes",
          type === "FLASHCARD"
            ? "No hay tarjetas pendientes de repaso para este tema"
            : "No hay notas pendientes de repaso para este tema"
        );
      }
    } catch (error) {
      console.error("Error loading topic reviews:", error);
      setShowTopicStudySession(false);
      showError(
        "Error al cargar",
        "No se pudieron cargar los repasos del tema. Inténtalo de nuevo."
      );
    }
  };

  const handleCompleteTopicReview = async (difficulty: 1 | 2 | 3) => {
    const currentReview = topicPendingReviews[currentTopicSession];
    const totalReviews = topicPendingReviews.length;

    try {
      await completeTopicReview(currentReview.id, difficulty);

      // ✅ NUEVO: Manejar progresión automática y finalización de sesión
      if (currentTopicSession >= totalReviews - 1) {
        // Era la última tarjeta
        showSuccess(
          "¡Sesión completada!",
          `Has completado todas las ${
            topicSessionType === "FLASHCARD" ? "tarjetas" : "notas"
          } de repaso`
        );
        handleExitTopicStudySession();
      } else {
        // Hay más tarjetas, avanzar a la siguiente
        setCurrentTopicSession((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error completing topic review:", error);
      showError(
        "Error al completar",
        "No se pudo completar la revisión. Inténtalo de nuevo."
      );
    }
  };

  const handleExitTopicStudySession = () => {
    setShowTopicStudySession(false);
    setCurrentTopicSession(0);
    setTopicSessionType("FLASHCARD");
  };

  const handleTopicNext = () => {
    if (currentTopicSession < topicPendingReviews.length - 1) {
      setCurrentTopicSession((prev) => prev + 1);
    }
  };

  const handleTopicPrevious = () => {
    if (currentTopicSession > 0) {
      setCurrentTopicSession((prev) => prev - 1);
    }
  };

  // Show topic-specific study session if active
  if (
    showTopicStudySession &&
    selectedTopicId &&
    topicPendingReviews.length > 0 &&
    currentTopicSession < topicPendingReviews.length
  ) {
    const currentReview = topicPendingReviews[currentTopicSession];

    return (
      <StudySession
        review={currentReview}
        currentCard={currentTopicSession + 1}
        totalCards={topicPendingReviews.length}
        topicName={topicInfo?.name}
        onComplete={handleCompleteTopicReview}
        onExit={handleExitTopicStudySession}
        onNext={handleTopicNext}
        onPrevious={handleTopicPrevious}
        canGoNext={currentTopicSession < topicPendingReviews.length - 1}
        canGoPrevious={currentTopicSession > 0}
      />
    );
  }

  // Show loading state if loading topic reviews
  if (showTopicStudySession && selectedTopicId && topicLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Cargando repasos del tema...
        </span>
      </div>
    );
  }

  // Show general study session if active
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

  // Vista de tema seleccionado
  if (selectedTopicId) {
    return (
      <div>
        {/* Botón volver a materias */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={handleBackToTopics}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            ← {t("topics.backToTopics")}
          </button>
        </div>

        {/* Título centrado con botón de repaso */}
        <div className="text-center mb-6 md:mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t("topics.studyContent")}
            </h1>
          </div>
        </div>

        {/* Dropdown para nuevo contenido */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowContentDropdown(!showContentDropdown)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow"
            >
              <Plus size={20} />
              <span>{t("content.newContent")}</span>
              <ChevronDown
                size={20}
                className={`transition-transform ${
                  showContentDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {showContentDropdown && (
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                {/* Tarjeta de Estudio */}
                <button
                  onClick={() => {
                    setShowContentDropdown(false);
                    setShowCardForm(true);
                  }}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative p-4 border-b border-gray-200 dark:border-gray-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-700 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 group-hover:from-indigo-500 group-hover:to-purple-600 flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0">
                        <FileText
                          size={24}
                          className="text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                          {t("cards.studyCard")}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {t("cards.studyCardDescription")}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          <span className="bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
                            {t("cards.quickReview")}
                          </span>
                          <span className="bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
                            {t("cards.withImages")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Nota/Apunte */}
                <button
                  onClick={() => {
                    setShowContentDropdown(false);
                    setShowNoteForm(true);
                  }}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative p-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/50 dark:to-green-900/50 group-hover:from-blue-500 group-hover:to-green-500 flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0">
                        <BookOpen
                          size={24}
                          className="text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                          {t("notes.studyNote")}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {t("notes.studyNoteDescription")}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          <span className="bg-blue-50 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                            {t("notes.extensiveContent")}
                          </span>
                          <span className="bg-blue-50 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                            {t("notes.twoPages")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Tarjetas */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t("cards.title")}
              </h2>
            </div>
            <button
              onClick={() => handleStartTopicReview("FLASHCARD")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <Play size={16} />
              <span>{t("cards.startTopicReview")}</span>
            </button>
          </div>
          <CardsManager
            topicId={selectedTopicId}
            openFormInitially={showCardForm}
          />
        </div>

        {/* Separador visual */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

        {/* Sección de Notas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t("notes.title")}
              </h2>
            </div>
            <button
              onClick={() => handleStartTopicReview("EXPLANATION")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <Play size={16} />
              <span>{t("notes.startTopicReview")}</span>
            </button>
          </div>
          <NotesManager
            topicId={selectedTopicId}
            openFormInitially={showNoteForm}
          />
        </div>
      </div>
    );
  }

  // Vista principal (lista de temas)
  return (
    <div>
      {/* Google Calendar Auth */}
      <div className="mb-6">
        <GoogleCalendarAuth
          onAuthComplete={() => {
            console.log("Google Calendar conectado exitosamente");
          }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <BookOpen
                size={24}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                {t("stats.activeTopics")}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardData?.stats?.totalTopics}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-900/30">
              <FileText
                size={24}
                className="text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                {t("stats.totalCards")}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardData?.stats?.totalCards}
              </p>
            </div>
          </div>
        </div>
        {/* Racha */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
              <Flame
                size={24}
                className="text-orange-600 dark:text-orange-400"
              />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                {t("stats.currentStreak")}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {streakLoading ? "..." : streakData?.currentStreak || 0}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("stats.days")}
                </span>
              </div>
              {streakData && streakData.longestStreak > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t("stats.longestStreak")}: {streakData.longestStreak}{" "}
                  {t("stats.days")}
                </p>
              )}
              {streakData?.wasAutoReset && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {t("stats.streakReset")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progreso Promedio */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
              <TrendingUp
                size={24}
                className="text-orange-600 dark:text-orange-400"
              />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                {t("stats.averageProgress")}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {calculateProgress()}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        {showTopicForm ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingTopic ? t("topics.edit") : t("topics.new")}
              </h2>
              <button
                onClick={() => {
                  setShowTopicForm(false);
                  setEditingTopic(null);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <TopicForm
              onSubmit={async (topicData) => {
                try {
                  if (editingTopic) {
                    await updateTopic(editingTopic.id, topicData);
                    showSuccess(
                      "Tema actualizado",
                      "El tema se ha actualizado correctamente"
                    );
                  } else {
                    await addTopic(topicData as CreateTopicData);
                    showSuccess(
                      "Tema creado",
                      "El tema se ha creado correctamente"
                    );
                  }
                  setShowTopicForm(false);
                  setEditingTopic(null);
                  setRefreshTopics((prev) => prev + 1);
                } catch (error) {
                  console.error("Error al guardar materia:", error);
                  showError(
                    "Error al guardar",
                    "No se pudo guardar el tema. Inténtalo de nuevo."
                  );
                }
              }}
              onCancel={() => {
                setShowTopicForm(false);
                setEditingTopic(null);
              }}
              initialData={editingTopic || undefined}
              isEditing={!!editingTopic}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t("topics.title")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("topics.subtitle")}
                </p>
              </div>

              {/* Botón Iniciar Repaso */}
              {/* {totalPendingCount > 0 && (
                <button
                  onClick={handleStartReview}
                  className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl justify-center self-start md:self-center"
                >
                  <Play size={20} />
                  <span className="sm:hidden">
                    {t("reviews.startReviewShort")} ({totalPendingCount})
                  </span>
                  <span className="hidden sm:inline">
                    {t("reviews.startReview")} ({totalPendingCount})
                  </span>
                </button>
              )} */}
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={t("topics.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Lista de materias en formato tarjeta */}
            {loading ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                {t("common.loadingTopics")}
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BookOpen
                  size={48}
                  className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                />
                <p className="text-lg mb-2">{t("topics.noTopics")}</p>
                <p className="text-sm mb-4">{t("topics.noTopicsSubtitle")}</p>
                <button
                  onClick={() => setShowTopicForm(true)}
                  className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  {t("topics.createFirst")}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTopics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onSelect={handleSelectTopic}
                      onEdit={handleEditTopic}
                      onDelete={handleDeleteTopic}
                    />
                  ))}
                  {/* Botón + al final */}
                  <button
                    onClick={() => {
                      setEditingTopic(null);
                      setShowTopicForm(true);
                    }}
                    className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 group-hover:bg-indigo-500 flex items-center justify-center mb-3 transition-colors">
                      <span className="text-3xl text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors">
                        +
                      </span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium transition-colors">
                      {t("topics.create")}
                    </span>
                  </button>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage <= 1}
                      className="px-4 py-2 bg-indigo-500 dark:bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed"
                    >
                      {t("common.previous")}
                    </button>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("common.page")} {pagination.currentPage}{" "}
                      {t("common.of")} {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-4 py-2 bg-indigo-500 dark:bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed"
                    >
                      {t("common.next")}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
