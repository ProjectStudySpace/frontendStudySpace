import React, { useState, useEffect } from "react";
import { ReviewSession, ReviewSessionCardProps } from "../types/reviews";
import { Calendar, Clock, BookOpen, Edit, Info } from "lucide-react";
import { useReviews } from "../../hooks/useReviews";
import { formatDateForUser, formatTimeOnlyForUser } from "../utils/dateUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReviewSessionCard: React.FC<ReviewSessionCardProps> = ({
  session,
  onSessionUpdated,
}) => {
  const { rescheduleReview, userTimezone } = useReviews();
  const [currentSession, setCurrentSession] = useState(session);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentSession(session);
  }, [session]);

  const lightenColor = (color: string, percent: number = 40) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  };

  const topicColor = session.card.topic?.color || '#93C5FD';
  const lighterColor = lightenColor(topicColor, 40);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      times.push(timeString);
    }
    return times;
  };

  const getAvailableTimes = () => {
    const allTimes = generateTimeOptions();

    if (!selectedDate) {
      return allTimes;
    }

    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (!isToday) {
      return allTimes;
    }

    const currentHour = today.getHours();
    return allTimes.filter((time) => {
      const hour = parseInt(time.split(":")[0]);
      return hour > currentHour;
    });
  };

  const getStatusConfig = (type: string) => {
    switch (type) {
      case "pending":
        return {
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          label: "Pendiente",
        };
      case "upcoming":
        return {
          color: "orange",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-700",
          label: "Programada",
        };
      case "completed":
        return {
          color: "green",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          label: "Completada",
        };
      default:
        return {
          color: "gray",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
          label: "Desconocido",
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
        return "Fácil";
      case 2:
        return "Medio";
      case 3:
        return "Difícil";
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

      if (onSessionUpdated) {
        onSessionUpdated();
      }
    } catch (error) {
      console.error("Error reprogramando:", error);
    } finally {
      setLoading(false);
    }
  };

  const status = getStatusConfig(currentSession.type);

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-0 border-l-4 hover:shadow-md transition-all duration-200"
      style={{ borderLeftColor: lighterColor }}
    >
      {/* Encabezado con nombre del tema */}
      <div 
        className="p-4 text-center rounded-t-lg"
        style={{ 
          background: `linear-gradient(135deg, ${lighterColor}20, ${lighterColor}40)`,
          borderBottom: `2px solid ${lighterColor}30`
        }}
      >
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
          {currentSession.card.topic.name}
        </h4>
      </div>

      {/* Contenido principal */}
      <div className="p-4 bg-white">
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

            {/* Pregunta */}
            <h3 className="font-semibold text-gray-900 text-lg mb-3 text-center">
              {currentSession.card.question}
            </h3>
            
            {/* Respuesta */}
            <div 
              className="p-3 rounded-lg border text-gray-700 text-left bg-white mb-3"
              style={{ borderColor: lighterColor }}
            >
              <p className="text-gray-600">{currentSession.card.answer}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{formatDate(currentSession.dueDate)}</span>
          </div>

          {currentSession.type === "completed" && currentSession.completedAt && (
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>
                Completada:{" "}
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
              <span className="text-sm font-medium text-gray-700">
                Dificultad:
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDifficultyColor(
                  currentSession.difficultyRating
                )}-100 text-${getDifficultyColor(
                  currentSession.difficultyRating
                )}-700`}
              >
                {getDifficultyText(currentSession.difficultyRating)}
              </span>
            </div>
          )}

        {currentSession.intervalDays && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen size={16} />
            <span>Intervalo: {currentSession.intervalDays} días</span>
          </div>
        )}

        {currentSession.type === "upcoming" && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowReschedule(true)}
              className="flex items-center justify-center gap-1 flex-1 text-xs bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
            >
              <Edit size={14} />
              Reprogramar
            </button>
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center justify-center gap-1 flex-1 text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Info size={14} />
              Ver detalles
            </button>
          </div>
        )}

        {showReschedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reprogramar sesión
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar fecha
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholderText="Selecciona una fecha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar hora
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    {loading ? "Reprogramando..." : "Confirmar"}
                  </button>
                  <button
                    onClick={() => setShowReschedule(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles de la Sesión
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tema:</span>
                  <span className="font-medium">
                    {currentSession.card.topic.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha programada:</span>
                  <span className="font-medium">
                    {formatDate(currentSession.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-medium">
                    {formatTime(currentSession.dueDate)}
                  </span>
                </div>
                {currentSession.intervalDays && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intervalo actual:</span>
                    <span className="font-medium">
                      {currentSession.intervalDays} días
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <p className="text-gray-600 mb-2">Pregunta:</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                    {currentSession.card.question}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSessionCard;