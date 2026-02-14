/**
 * Componente XpDisplay - Muestra los puntos de experiencia del usuario
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, TrendingUp, Flame, Award } from "lucide-react";

interface XpDisplayProps {
  totalXp: number;
  level: number;
  streak?: number;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "inline";
}

const XpDisplay: React.FC<XpDisplayProps> = ({
  totalXp,
  level,
  streak = 0,
  showDetails = true,
  size = "md",
  variant = "default",
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: {
      container: "p-2",
      icon: 16,
      xp: "text-lg",
      label: "text-xs",
      stats: "text-xs",
    },
    md: {
      container: "p-3",
      icon: 20,
      xp: "text-2xl",
      label: "text-sm",
      stats: "text-sm",
    },
    lg: {
      container: "p-4",
      icon: 24,
      xp: "text-3xl",
      label: "text-base",
      stats: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  // Format XP with suffix for large numbers
  const formatXp = (xp: number) => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    }
    if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toLocaleString();
  };

  // Card variant - shows as a card with more details
  if (variant === "card") {
    return (
      <div
        className={`
          ${sizes.container}
          bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white
        `}
      >
        <div className="flex items-center justify-between">
          {/* XP Info */}
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={sizes.icon} className="text-yellow-300" />
              <span className={`${sizes.xp} font-bold`}>
                {formatXp(totalXp)} XP
              </span>
            </div>
            <p className={`${sizes.label} text-indigo-100 mt-1`}>
              {t("gamification.totalXp")}
            </p>
          </div>

          {/* Level Badge */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Award size={sizes.icon} className="text-yellow-300" />
              <span className={`${sizes.xp} font-bold`}>
                {t("gamification.level")} {level}
              </span>
            </div>
            <p className={`${sizes.label} text-indigo-100 mt-1`}>
              {t("gamification.currentLevel")}
            </p>
          </div>
        </div>

        {showDetails && streak > 0 && (
          <div className="mt-3 pt-3 border-t border-indigo-400/30">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-300" />
              <span className={`${sizes.stats}`}>
                🔥 {streak} {t("gamification.daysStreak")}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Inline variant - minimal display
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-1">
        <Sparkles size={sizes.icon} className="text-indigo-500" />
        <span
          className={`${sizes.xp} font-bold text-indigo-600 dark:text-indigo-400`}
        >
          {formatXp(totalXp)}
        </span>
        <span className={`${sizes.label} text-gray-500`}>XP</span>
      </div>
    );
  }

  // Default variant - compact card
  return (
    <div
      className={`
        ${sizes.container}
        bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700
        flex items-center gap-4
      `}
    >
      {/* XP */}
      <div className="flex items-center gap-2">
        <Sparkles size={sizes.icon} className="text-indigo-500" />
        <div>
          <p
            className={`${sizes.xp} font-bold text-gray-900 dark:text-gray-100`}
          >
            {formatXp(totalXp)}
          </p>
          <p className={`${sizes.label} text-gray-500 dark:text-gray-400`}>
            XP
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />

      {/* Level */}
      <div className="flex items-center gap-2">
        <Award size={sizes.icon} className="text-yellow-500" />
        <div>
          <p
            className={`${sizes.xp} font-bold text-gray-900 dark:text-gray-100`}
          >
            {level}
          </p>
          <p className={`${sizes.label} text-gray-500 dark:text-gray-400`}>
            {t("gamification.level")}
          </p>
        </div>
      </div>

      {/* Streak (optional) */}
      {showDetails && streak > 0 && (
        <>
          <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <Flame size={sizes.icon} className="text-orange-500" />
            <div>
              <p
                className={`${sizes.xp} font-bold text-gray-900 dark:text-gray-100`}
              >
                {streak}
              </p>
              <p className={`${sizes.label} text-gray-500 dark:text-gray-400`}>
                {t("gamification.streak")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default XpDisplay;
