/**
 * Componente PomodoroTimer - Fase 2
 * Temporizador visual circular para sesiones intensivas
 */
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, SkipForward } from "lucide-react";
import { PomodoroTimerProps } from "../types/intensiveSessions";

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  timeRemaining,
  totalTime,
  phase,
  blockNumber,
  totalBlocks,
  isPaused,
  onComplete,
  onSkipBreak,
}) => {
  const { t } = useTranslation();

  // Calcular progreso (0-100)
  const progress = useMemo(() => {
    if (totalTime === 0) return 0;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  }, [timeRemaining, totalTime]);

  // Formatear tiempo como MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Colores según la fase
  const getPhaseColor = () => {
    switch (phase) {
      case "WORK":
        return {
          bg: "bg-indigo-600",
          light: "bg-indigo-100",
          text: "text-indigo-600",
          gradient: "from-indigo-500 to-indigo-700",
          ring: "ring-indigo-500",
        };
      case "SHORT_BREAK":
        return {
          bg: "bg-emerald-600",
          light: "bg-emerald-100",
          text: "text-emerald-600",
          gradient: "from-emerald-500 to-emerald-700",
          ring: "ring-emerald-500",
        };
      case "LONG_BREAK":
        return {
          bg: "bg-blue-600",
          light: "bg-blue-100",
          text: "text-blue-600",
          gradient: "from-blue-500 to-blue-700",
          ring: "ring-blue-500",
        };
      default:
        return {
          bg: "bg-indigo-600",
          light: "bg-indigo-100",
          text: "text-indigo-600",
          gradient: "from-indigo-500 to-indigo-700",
          ring: "ring-indigo-500",
        };
    }
  };

  // Etiqueta de la fase
  const getPhaseLabel = () => {
    switch (phase) {
      case "WORK":
        return t("intensiveStudy.work", "Trabajo");
      case "SHORT_BREAK":
        return t("intensiveStudy.shortBreak", "Descanso Corto");
      case "LONG_BREAK":
        return t("intensiveStudy.longBreak", "Descanso Largo");
      default:
        return "";
    }
  };

  const colors = getPhaseColor();

  // Ref to track if onComplete has been called to prevent double-fire
  const hasCompletedRef = useRef(false);

  // Efecto para notificar cuando el timer llega a cero
  useEffect(() => {
    if (timeRemaining === 0 && onComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [timeRemaining, onComplete]);

  // Reset completion flag when timer is reset
  useEffect(() => {
    if (timeRemaining > 0) {
      hasCompletedRef.current = false;
    }
  }, [timeRemaining]);

  // Calcular el radio del círculo para el SVG
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Fase actual */}
      <div
        className={`px-4 py-2 rounded-full ${colors.light} ${colors.text} font-medium text-sm flex items-center gap-2`}
      >
        <span className={`w-2 h-2 rounded-full ${colors.bg}`}></span>
        {getPhaseLabel()}
      </div>

      {/* Timer circular */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Círculo de fondo */}
        <svg
          className="w-full h-full -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Círculo de fondo gris */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Círculo de progreso */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-linear ${colors.text}`}
          />
        </svg>

        {/* Tiempo en el centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-800 dark:text-white">
            {formatTime(timeRemaining)}
          </span>
          {isPaused && (
            <span className="text-sm text-gray-500 mt-1">
              {t("intensiveStudy.paused", "Pausado")}
            </span>
          )}
        </div>
      </div>

      {/* Bloque actual */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t("intensiveStudy.block", "Bloque")} {blockNumber}{" "}
        {t("intensiveStudy.of", "de")} {totalBlocks}
      </div>

      {/* Botón de saltar descanso (solo en descansos) */}
      {phase !== "WORK" && onSkipBreak && (
        <button
          onClick={onSkipBreak}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${colors.light} ${colors.text} hover:opacity-80 transition-opacity`}
        >
          <SkipForward size={18} />
          {t("intensiveStudy.skipBreak", "Saltar Descanso")}
        </button>
      )}
    </div>
  );
};

export default PomodoroTimer;
