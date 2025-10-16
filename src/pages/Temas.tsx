import { useState, useEffect } from "react";
import { BookOpen, FileText, TrendingUp, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { TopicsManager } from "../components/topicsManager";
import { CardsManager } from "../components/cardsManager";
import { useStreak } from "../../hooks/useStreaks";

const Dashboard = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<any | null>(null);

  const { getDashboard } = useAuth();
  const { streakData, loading: streakLoading } = useStreak();

  useEffect(() => {
    const fetchDashboard = async () => {
      const data = await getDashboard();
      setDashboardData(data);
    };
    fetchDashboard();
  }, []);

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
        return completeDate >= startOfToday;
      }).length;
    }
    const totalToday = completedToday + pendingToday;

    if (totalToday === 0) return 100;

    return Math.round((completedToday / totalToday) * 100);
  };

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
              <p className="text-gray-600 text-sm mb-1">Temas Activos</p>
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
              <p className="text-gray-600 text-sm mb-1">Tarjetas Total</p>
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
              <p className="text-gray-600 text-sm mb-1">Racha Actual</p>
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
              <p className="text-gray-600 text-sm mb-1">Progreso Promedio</p>
              <p className="text-3xl font-bold text-gray-900">
                {calculateProgress()}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Manager */}
      <TopicsManager
        onSelectTopic={setSelectedTopicId}
        selectedTopicId={selectedTopicId}
      />

      {/* Cards Manager */}
      {selectedTopicId && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <CardsManager topicId={selectedTopicId} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
