/**
 * Componente LevelProgressBar - Muestra la barra de progreso de nivel
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { getLevelTitle } from "../../types/gamification";
import { Star, Trophy } from "lucide-react";

interface LevelProgressBarProps {
  level: number;
  progressPercent: number;
  xpForNext: number;
  currentXp?: number;
  title?: string;
  totalXp?: number;
  showXpDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  level,
  progressPercent,
  xpForNext,
  currentXp = 0,
  title,
  totalXp,
  showXpDetails = true,
  size = "md",
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: {
      container: "p-3",
      icon: 20,
      level: "text-lg",
      title: "text-xs",
      bar: "h-2",
      xp: "text-xs",
    },
    md: {
      container: "p-4",
      icon: 24,
      level: "text-2xl",
      title: "text-sm",
      bar: "h-3",
      xp: "text-sm",
    },
    lg: {
      container: "p-6",
      icon: 32,
      level: "text-3xl",
      title: "text-base",
      bar: "h-4",
      xp: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  // Get level title or use provided
  const levelTitle = title || getLevelTitle(level);

  // Generate level color based on level number
  const getLevelColor = (lvl: number) => {
    if (lvl >= 90) return "from-yellow-400 to-amber-600"; // Leyenda - Gold
    if (lvl >= 70) return "from-purple-400 to-indigo-600"; // Maestro - Purple
    if (lvl >= 50) return "from-blue-400 to-cyan-500"; // Experto - Blue
    if (lvl >= 30) return "from-green-400 to-emerald-500"; // Avanzado - Green
    if (lvl >= 15) return "from-orange-400 to-red-500"; // Intermedio - Orange
    return "from-gray-400 to-slate-600"; // Novato/Aprendiz - Gray
  };

  return (
    <div
      className={`
        ${sizes.container}
        bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700
      `}
    >
      {/* Header with Level and Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div
            className={`
              w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
              rounded-full flex items-center justify-center
              bg-gradient-to-br ${getLevelColor(level)}
              shadow-lg
            `}
          >
            <Trophy size={sizes.icon} className="text-white" />
          </div>

          {/* Level Number and Title */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`${sizes.level} font-bold text-gray-900 dark:text-gray-100`}
              >
                {t("gamification.level")} {level}
              </span>
              {level >= 50 && (
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <p className={`${sizes.title} text-gray-600 dark:text-gray-400`}>
              {levelTitle}
            </p>
          </div>
        </div>

        {/* Total XP (optional) */}
        {totalXp !== undefined && (
          <div className="text-right">
            <p
              className={`${sizes.xp} font-bold text-indigo-600 dark:text-indigo-400`}
            >
              {totalXp.toLocaleString()} XP
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("gamification.totalXp")}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div
          className={`
            ${sizes.bar}
            w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden
          `}
        >
          {/* Progress Fill */}
          <div
            className={`
              ${sizes.bar}
              rounded-full bg-gradient-to-r ${getLevelColor(level)}
              transition-all duration-500 ease-out
            `}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>

        {/* Progress Text */}
        {showXpDetails && (
          <div className="flex justify-between mt-2">
            <span className={`${sizes.xp} text-gray-600 dark:text-gray-400`}>
              {currentXp.toLocaleString()} / {xpForNext.toLocaleString()} XP
            </span>
            <span
              className={`${sizes.xp} font-medium text-indigo-600 dark:text-indigo-400`}
            >
              {progressPercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Next Level Preview */}
      {level < 100 && showXpDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Star size={12} className="text-indigo-400" />
            {t("gamification.nextLevel")}: {getLevelTitle(level + 1)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LevelProgressBar;
