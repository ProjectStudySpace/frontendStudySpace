/**
 * Componente ActiveMultipliers - Muestra los multiplicadores de XP activos
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { ActiveMultiplier } from "../../types/gamification";
import { Zap, Flame, Star, Clock, Target } from "lucide-react";

interface ActiveMultipliersProps {
  multipliers: ActiveMultiplier[];
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

const getMultiplierIcon = (type: string) => {
  switch (type) {
    case "STREAK":
      return Flame;
    case "INTENSIVE_SESSION":
      return Zap;
    case "FIRST_SESSION_DAY":
      return Star;
    case "PERFECT_POMODORO":
      return Target;
    default:
      return Clock;
  }
};

const getMultiplierColor = (type: string) => {
  switch (type) {
    case "STREAK":
      return {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-800",
        icon: "text-orange-500",
      };
    case "INTENSIVE_SESSION":
      return {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
        icon: "text-purple-500",
      };
    case "FIRST_SESSION_DAY":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-600 dark:text-yellow-400",
        border: "border-yellow-200 dark:border-yellow-800",
        icon: "text-yellow-500",
      };
    case "PERFECT_POMODORO":
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
        icon: "text-green-500",
      };
    default:
      return {
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        text: "text-indigo-600 dark:text-indigo-400",
        border: "border-indigo-200 dark:border-indigo-800",
        icon: "text-indigo-500",
      };
  }
};

const getMultiplierDescription = (type: string, t: (key: string) => string) => {
  switch (type) {
    case "STREAK":
      return t("gamification.multipliers.streak");
    case "INTENSIVE_SESSION":
      return t("gamification.multipliers.intensive");
    case "FIRST_SESSION_DAY":
      return t("gamification.multipliers.firstSession");
    case "PERFECT_POMODORO":
      return t("gamification.multipliers.perfectPomodoro");
    default:
      return type;
  }
};

const ActiveMultipliers: React.FC<ActiveMultipliersProps> = ({
  multipliers,
  showDetails = true,
  size = "md",
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: {
      container: "p-2",
      icon: 16,
      multiplier: "text-sm",
      value: "text-lg",
    },
    md: {
      container: "p-3",
      icon: 20,
      multiplier: "text-sm",
      value: "text-xl",
    },
    lg: {
      container: "p-4",
      icon: 24,
      multiplier: "text-base",
      value: "text-2xl",
    },
  };

  const sizes = sizeClasses[size];

  // Calculate total multiplier
  const totalMultiplier =
    multipliers.reduce((acc, m) => acc + (m.value - 1), 0) + 1;

  if (!multipliers || multipliers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t("gamification.activeMultipliers")}
        </h4>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {t("gamification.noActiveMultipliers")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Zap size={18} className="text-yellow-500" />
          {t("gamification.activeMultipliers")}
        </h4>

        {/* Total Multiplier Badge */}
        <div className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
          <span className="text-sm font-bold text-white">
            x{totalMultiplier.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Multipliers List */}
      <div
        className={`grid grid-cols-1 ${showDetails ? "sm:grid-cols-2" : ""} gap-2`}
      >
        {multipliers.map((multiplier, index) => {
          const IconComponent = getMultiplierIcon(multiplier.type);
          const colors = getMultiplierColor(multiplier.type);
          const description = getMultiplierDescription(multiplier.type, t);

          return (
            <div
              key={index}
              className={`
                ${sizes.container}
                ${colors.bg} ${colors.border}
                border rounded-lg flex items-center gap-3
              `}
            >
              {/* Icon */}
              <div className={`${colors.icon}`}>
                <IconComponent size={sizes.icon} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`${sizes.multiplier} font-medium ${colors.text} truncate`}
                >
                  {multiplier.name || description}
                </p>
                {showDetails && multiplier.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {multiplier.description}
                  </p>
                )}
              </div>

              {/* Value */}
              <div className={`${sizes.value} font-bold ${colors.text}`}>
                x{multiplier.value.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total XP Bonus */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("gamification.totalBonus")}: +
            {((totalMultiplier - 1) * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveMultipliers;
