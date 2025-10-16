import React from 'react';
import { useProgress } from '../../hooks/useProgress';
import { TrendingUp, Target, BookOpen, Clock } from 'lucide-react';

const ProgressSection: React.FC = () => {
  const { progressData, loading, error } = useProgress();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          Error loading progress: {error}
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          No progress data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Progreso de Aprendizaje</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-200">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total de Temas</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.totalTopics}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-200">
              <Target size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total de Cartas</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.totalCards}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-200">
              <Clock size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Revisiones Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.pendingReviews}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-200">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Completadas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.completedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-200">
              <Clock size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Racha Actual</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.currentStreak}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-200">
              <Target size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Racha Más Larga</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.longestStreak}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;
