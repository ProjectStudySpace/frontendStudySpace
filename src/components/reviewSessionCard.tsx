import React, { useState, useEffect } from "react";
import { ReviewSession, ReviewSessionCardProps } from "../types/reviews";
import { Calendar, Clock, BookOpen, Edit, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useReviews } from "../../hooks/useReviews";
import { useNotification } from "../context/NotificationContext";
import { formatDateForUser, formatTimeOnlyForUser } from "../utils/dateUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReviewSessionCard: React.FC<ReviewSessionCardProps> = ({
  session,
  onSessionUpdated,
}) => {
  const { t } = useTranslation();
  const { rescheduleReview, userTimezone } = useReviews();
  const { showSuccess, showError } = useNotification();
  const [currentSession, setCurrentSession] = useState(session);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentSession(session);
  }, [session]);

  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      times.push(timeString);
    }
    return times;
  };

  const getStatusConfig = (type: string) => {
    switch (type) {
      case "pending":
        return {
          color: "red",
          bgColor: "bg-red-50 dark:bg-red-900/30",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-700 dark:text-red-400",
          label: t("reviews.status.pending"),
        };
      case "upcoming":
        return {
          color: "orange",
          bgColor: "bg-orange-50 dark:bg-orange-900/30",
          borderColor: "border-orange-200 dark:border-orange-800",
          textColor: "text-orange-700 dark:text-orange-400",
          label: t("reviews.status.upcoming"),
        };
      case "completed":
        return {
          color: "green",
          bgColor: "bg-green-50 dark:bg-green-900/30",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-700 dark:text-green-400",
          label: t("reviews.status.completed"),
        };
      default:
        return {
          color: "gray",
          bgColor: "bg-gray-50 dark:bg-gray-700",
          borderColor: "border-gray-200 dark:border-gray-600",
          textColor: "text-gray-700 dark:text-gray-300",
          label: t("reviews.status.unknown"),
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (userTimezone) {
      return formatDateForUser(dateString, userTimezone);
    }
    // Fallback a formato local si no hay zona horaria
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    if (userTimezone) {
      return formatTimeOnlyForUser(dateString, userTimezone);
    }
    // Fallback a formato local si no hay zona horaria
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDifficultyText = (rating?: number) => {
    if (!rating) return "";

    switch (rating) {
      case 1:
        return t("difficulty.easy");
      case 2:
        return t("difficulty.medium");
      case 3:
        return t("difficulty.hard");
      default:
        return "";
    }
  };

  const getDifficultyColor = (rating?: number) => {
    if (!rating) return "gray";

    switch (rating) {
      case 1:
        return "green";
      case 2:
        return "orange";
      case 3:
        return "red";
      default:
        return "gray";
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate) return;

    const dateWithTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":");
    dateWithTime.setHours(parseInt(hours), parseInt(minutes));

    setLoading(true);
    try {
      const result = await rescheduleReview(
        currentSession.id,
        dateWithTime.toISOString()
      );

      setCurrentSession((prev) => ({
        ...prev,
        dueDate: result.review.dueDate,
      }));

      setShowReschedule(false);

      // Mostrar notificación de éxito
      showSuccess("Sesión reprogramada", "La sesión de estudio ha sido reprogramada correctamente");

      if (onSessionUpdated) {
        onSessionUpdated();
      }
    } catch (error) {
      console.error("Error reprogramando:", error);
      showError("Error al reprogramar", "No se pudo reprogramar la sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const status = getStatusConfig(currentSession.type);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${status.borderColor}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full bg-${status.color}-500`}
            ></div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
            >
              {status.label}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
            {currentSession.card.topic.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
            {currentSession.card.question}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>{formatDate(currentSession.dueDate)}</span>
        </div>

        {currentSession.type === "completed" && currentSession.completedAt && (
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>
              {t("reviews.completed")}:{" "}
              {userTimezone
                ? formatDateForUser(currentSession.completedAt, userTimezone)
                : new Date(currentSession.completedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {currentSession.type === "completed" &&
        currentSession.difficultyRating && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("reviews.difficulty")}:
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDifficultyColor(
                currentSession.difficultyRating
              )}-100 dark:bg-${getDifficultyColor(
                currentSession.difficultyRating
              )}-900/30 text-${getDifficultyColor(
                currentSession.difficultyRating
              )}-700 dark:text-${getDifficultyColor(
                currentSession.difficultyRating
              )}-400`}
            >
              {getDifficultyText(currentSession.difficultyRating)}
            </span>
          </div>
        )}

      {currentSession.intervalDays && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <BookOpen size={16} />
          <span>
            {t("reviews.interval")}: {currentSession.intervalDays}{" "}
            {t("stats.days")}
          </span>
        </div>
      )}

      {currentSession.type === "upcoming" && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowReschedule(true)}
            className="flex items-center justify-center gap-1 flex-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors font-medium"
          >
            <Edit size={14} />
            {t("reviews.reschedule")}
          </button>
          <button
            onClick={() => setShowDetails(true)}
            className="flex items-center justify-center gap-1 flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <Info size={14} />
            {t("reviews.viewDetails")}
          </button>
        </div>
      )}

      {showReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("reviews.rescheduleSession")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("reviews.selectDate")}
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholderText={t("reviews.selectDatePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("reviews.selectTime")}
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {getAvailableTimes().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReschedule}
                  disabled={loading || !selectedDate}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t("reviews.rescheduling") : t("common.confirm")}
                </button>
                <button
                  onClick={() => setShowReschedule(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("reviews.sessionDetails")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("reviews.topic")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {currentSession.card.topic.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("reviews.scheduledDate")}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(currentSession.dueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("reviews.time")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatTime(currentSession.dueDate)}
                </span>
              </div>
              {currentSession.intervalDays && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("reviews.currentInterval")}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {currentSession.intervalDays} {t("stats.days")}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <p className="text-gray-600 dark:text-gray-400 mb-2">{t("reviews.question")}:</p>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {currentSession.card.question}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              {t("reviews.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSessionCard;
