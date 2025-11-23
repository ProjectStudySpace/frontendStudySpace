import React from "react";
import { useTranslation } from "react-i18next";
import CalendarWidget from "../components/calendarWidget";

const CalendarPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t("calendar.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t("calendar.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <CalendarWidget className="text-base" />
      </div>
    </div>
  );
};
export default CalendarPage;
