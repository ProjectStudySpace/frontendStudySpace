import React from 'react';
import ProgressSection from '../components/progressSection';

const ProgressPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Progreso</h1>
        <p className="text-gray-600">
          Seguimiento de tu aprendizaje y estadísticas de estudio
        </p>
      </div>

      <ProgressSection />
    </div>
  );
};

export default ProgressPage;
