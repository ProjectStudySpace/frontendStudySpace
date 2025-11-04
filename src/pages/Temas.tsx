import { useState, useEffect } from "react";
import { BookOpen, FileText, TrendingUp, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { TopicsManager } from "../components/topicsManager";
import { CardsManager } from "../components/cardsManager";
import { useStreak } from "../../hooks/useStreaks";
import { getStoredUserTimezone, formatDateForUser } from "../utils/dateUtils";
import { TopicCard } from "../components/topicCard";
import { useTopics } from "../../hooks/useTopics";
import { Topic, CreateTopicData } from "../types/topics";
import { TopicForm } from "../components/topicForm";

const Dashboard = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>("");
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTopics, setRefreshTopics] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { getDashboard } = useAuth();
  const { streakData, loading: streakLoading } = useStreak();

  useEffect(() => {
    // Obtener zona horaria del usuario
    const timezone = getStoredUserTimezone();
    setUserTimezone(timezone);
  }, []);
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
  }, [refreshTopics, currentPage]);

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
    if (window.confirm("¿Estás seguro de que quieres eliminar esta materia?")) {
      try {
        await deleteTopic(topicId);
        setRefreshTopics((prev) => prev + 1);
      } catch (error) {
        console.error("Error al eliminar materia:", error);
      }
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setShowTopicForm(true);
  };

  if (selectedTopicId) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedTopicId(null)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            ← Volver a materias
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de tarjetas
          </h1>
        </div>
        <CardsManager topicId={selectedTopicId} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Materias activas</p>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardData?.stats?.totalTopics}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
              <FileText size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Tarjetas totales</p>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardData?.stats?.totalCards}
              </p>
            </div>
          </div>
        </div>
        {/* Racha */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100">
              <Flame size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-sm mb-1">Racha actual</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {streakLoading ? "..." : streakData?.currentStreak || 0}
                </p>
                <span className="text-sm text-gray-500">días</span>
              </div>
              {streakData && streakData.longestStreak > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Récord: {streakData.longestStreak} días
                </p>
              )}
              {streakData?.wasAutoReset && (
                <p className="text-xs text-orange-600 mt-1">
                  Reiniciada por inactividad
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progreso Promedio */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Progreso promedio</p>
              <p className="text-3xl font-bold text-gray-900">
                {calculateProgress()}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tus materias de estudio
            </h2>
            <p className="text-gray-600">
              Gestiona tus materias y accede a sus tarjetas de estudio
            </p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar materias por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Lista de materias en formato tarjeta */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Cargando materias...
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No hay materias creadas</p>
            <p className="text-sm mb-4">
              Crea tu primera materia para comenzar a organizar tu estudio
            </p>
            <button
              onClick={() => setShowTopicForm(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Crea la primera materia
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onSelect={setSelectedTopicId}
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
                className="bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-500 flex items-center justify-center mb-3 transition-colors">
                  <span className="text-3xl text-indigo-600 group-hover:text-white transition-colors">
                    +
                  </span>
                </div>
                <span className="text-gray-600 group-hover:text-indigo-600 font-medium transition-colors">
                  Nueva materia
                </span>
              </button>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-gray-600">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para formulario de materia */}
      {showTopicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTopic ? "Editar Materia" : "Nueva Materia"}
              </h3>
              <button
                onClick={() => {
                  setShowTopicForm(false);
                  setEditingTopic(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <TopicForm
              onSubmit={async (topicData) => {
                try {
                  if (editingTopic) {
                    await updateTopic(editingTopic.id, topicData);
                  } else {
                    await addTopic(topicData as CreateTopicData);
                  }
                  setShowTopicForm(false);
                  setEditingTopic(null);
                  setRefreshTopics((prev) => prev + 1);
                } catch (error) {
                  console.error("Error al guardar materia:", error);
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
        </div>
      )}
    </div>
  );
};

export default Dashboard;
