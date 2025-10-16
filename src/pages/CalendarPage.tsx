import React from "react";
import CalendarWidget from "../components/calendarWidget";

const CalendarPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Calendario de Estudio
            </h1>
            <p className="text-gray-600">
              Visualiza todas tus sesiones de estudio programadas
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <CalendarWidget className="text-base" />
      </div>
    </div>
  );
};
export default CalendarPage;
