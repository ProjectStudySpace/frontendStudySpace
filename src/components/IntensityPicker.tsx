/**
 * Componente IntensityPicker - Fase 2
 * Selector de intensidad de sesión intensiva
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Zap, Target, Flame, Check } from "lucide-react";
import {
  IntensityPickerProps,
  StudyIntensity,
  INTENSITY_CONFIG,
} from "../types/intensiveSessions";

const IntensityPicker: React.FC<IntensityPickerProps> = ({
  selectedIntensity,
  onSelect,
  disabled = false,
}) => {
  const { t } = useTranslation();

  // Configuración visual para cada nivel de intensidad
  const getIntensityConfig = (intensity: StudyIntensity) => {
    const config = INTENSITY_CONFIG[intensity];

    switch (intensity) {
      case StudyIntensity.RELAXED:
        return {
          icon: Zap,
          color: "emerald",
          gradient:
            "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
          borderColor: "border-emerald-200 dark:border-emerald-700",
          selectedBorder:
            "border-emerald-500 ring-2 ring-emerald-500 ring-offset-2",
          textColor: "text-emerald-700 dark:text-emerald-400",
          hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
          iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
          checkBg: "bg-emerald-500",
        };
      case StudyIntensity.NORMAL:
        return {
          icon: Target,
          color: "blue",
          gradient:
            "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
          borderColor: "border-blue-200 dark:border-blue-700",
          selectedBorder: "border-blue-500 ring-2 ring-blue-500 ring-offset-2",
          textColor: "text-blue-700 dark:text-blue-400",
          hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
          iconBg: "bg-blue-100 dark:bg-blue-900/50",
          checkBg: "bg-blue-500",
        };
      case StudyIntensity.INTENSIVE:
        return {
          icon: Flame,
          color: "orange",
          gradient:
            "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
          borderColor: "border-orange-200 dark:border-orange-700",
          selectedBorder:
            "border-orange-500 ring-2 ring-orange-500 ring-offset-2",
          textColor: "text-orange-700 dark:text-orange-400",
          hoverBg: "hover:bg-orange-50 dark:hover:bg-orange-900/30",
          iconBg: "bg-orange-100 dark:bg-orange-900/50",
          checkBg: "bg-orange-500",
        };
      default:
        return {
          icon: Target,
          color: "blue",
          gradient: "from-gray-50 to-gray-100",
          borderColor: "border-gray-200",
          selectedBorder: "border-gray-500 ring-2 ring-gray-500 ring-offset-2",
          textColor: "text-gray-700",
          hoverBg: "hover:bg-gray-50",
          iconBg: "bg-gray-100 dark:bg-gray-800",
          checkBg: "bg-gray-500",
        };
    }
  };

  const intensities = [
    StudyIntensity.RELAXED,
    StudyIntensity.NORMAL,
    StudyIntensity.INTENSIVE,
  ];

  // Obtener nombre traducible
  const getIntensityLabel = (intensity: StudyIntensity): string => {
    switch (intensity) {
      case StudyIntensity.RELAXED:
        return t("intensiveStudy.intensity.relaxed", "Relajado");
      case StudyIntensity.NORMAL:
        return t("intensiveStudy.intensity.normal", "Normal");
      case StudyIntensity.INTENSIVE:
        return t("intensiveStudy.intensity.intensive", "Intensivo");
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("intensiveStudy.selectIntensity", "Seleccionar intensidad")}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {intensities.map((intensity) => {
          const config = getIntensityConfig(intensity);
          const intensityConfig = INTENSITY_CONFIG[intensity];
          const Icon = config.icon;
          const isSelected = selectedIntensity === intensity;

          return (
            <button
              key={intensity}
              onClick={() => !disabled && onSelect(intensity)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                ${config.gradient}
                ${config.borderColor}
                ${isSelected ? config.selectedBorder : config.hoverBg}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
              `}
            >
              {/* Icono */}
              <div className={`p-3 rounded-full ${config.iconBg} mb-3`}>
                <Icon className={`w-8 h-8 ${config.textColor}`} />
              </div>

              {/* Nombre */}
              <span className={`font-semibold text-lg ${config.textColor}`}>
                {getIntensityLabel(intensity)}
              </span>

              {/* Descripción */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                {intensityConfig.description}
              </p>

              {/* Stats */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("intensiveStudy.pomodoros", "Pomodoros")}:
                  </span>
                  <span className={`font-medium ${config.textColor}`}>
                    {intensityConfig.maxPomodoros}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("intensiveStudy.reviewFrequency", "Repasos")}:
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 text-xs">
                    {intensityConfig.reviewFrequency}
                  </span>
                </div>
              </div>

              {/* Indicador de selección */}
              {isSelected && (
                <div
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full ${config.checkBg} flex items-center justify-center`}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IntensityPicker;
