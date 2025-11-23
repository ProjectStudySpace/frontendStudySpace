import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarSessions } from "../../hooks/useCalendarSessions";
import { CalendarWidgetProps } from "../types/calendarWidget";

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { sessions, loading } = useCalendarSessions();

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      hasSession: boolean;
    }> = [];

    // Días del mes anterior
    const daysFromPrevMonth = startDay === 0 ? 6 : startDay - 1;
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, -i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        hasSession: false,
      });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);

      // Normalizar fecha a medianoche en zona horaria local
      const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const hasSession = sessions.some((session) => {
        // Parsear la fecha de la sesión
        const sessionDate = new Date(session.dueDate);
        // Normalizar a medianoche en zona horaria local
        const sessionDateOnly = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate()
        );

        // Comparar fechas normalizadas
        return dateOnly.getTime() === sessionDateOnly.getTime();
      });

      days.push({
        date,
        isCurrentMonth: true,
        hasSession,
      });
    }

    // Días del siguiente mes
    const totalCells = 42;
    while (days.length < totalCells) {
      const nextDate = new Date(
        year,
        month + 1,
        days.length - lastDay.getDate() - daysFromPrevMonth + 1
      );
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        hasSession: false,
      });
    }

    return days;
  }, [currentDate, sessions]);

  const monthNames = [
    t("calendarWidget.months.january"),
    t("calendarWidget.months.february"),
    t("calendarWidget.months.march"),
    t("calendarWidget.months.april"),
    t("calendarWidget.months.may"),
    t("calendarWidget.months.june"),
    t("calendarWidget.months.july"),
    t("calendarWidget.months.august"),
    t("calendarWidget.months.september"),
    t("calendarWidget.months.october"),
    t("calendarWidget.months.november"),
    t("calendarWidget.months.december"),
  ];

  const dayNames = [
    t("calendarWidget.days.monday"),
    t("calendarWidget.days.tuesday"),
    t("calendarWidget.days.wednesday"),
    t("calendarWidget.days.thursday"),
    t("calendarWidget.days.friday"),
    t("calendarWidget.days.saturday"),
    t("calendarWidget.days.sunday"),
  ];

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 ${className}`}
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t("calendarWidget.title")}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-medium w-20 text-center text-gray-900 dark:text-gray-100">
            {monthNames[currentDate.getMonth()].substring(0, 3)}{" "}
            {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth("next")}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`
                h-6 text-xs flex items-center justify-center rounded
                ${day.isCurrentMonth ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"}
                ${
                  isToday
                    ? "bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700"
                    : day.hasSession
                    ? "border border-orange-400 dark:border-orange-500"
                    : ""
                }
                ${!day.isCurrentMonth ? "bg-gray-50 dark:bg-gray-900" : ""}
                relative
              `}
            >
              {day.date.getDate()}
              {day.hasSession && (
                <div className="absolute bottom-1 w-1 h-0.5 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("calendarWidget.session")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
