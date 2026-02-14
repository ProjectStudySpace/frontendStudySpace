/**
 * Componente BadgeCard - Muestra un badge de gamificación
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { UserBadge, BADGE_CONFIG } from "../../types/gamification";
import { Award, Flame, Layers, Timer, Zap, Sunrise } from "lucide-react";

interface BadgeCardProps {
  badge: UserBadge;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case "timer":
      return Timer;
    case "zap":
      return Zap;
    case "flame":
      return Flame;
    case "layers":
      return Layers;
    case "sunrise":
      return Sunrise;
    default:
      return Award;
  }
};

const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  showDetails = true,
  size = "md",
}) => {
  const { t } = useTranslation();
  const badgeConfig = BADGE_CONFIG[badge.badgeType];
  const IconComponent = getBadgeIcon(badgeConfig?.icon || "award");

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  return (
    <div className="flex flex-col items-center">
      {/* Badge Icon */}
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full flex items-center justify-center 
          border-4 shadow-lg transition-all duration-300 hover:scale-110
          bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
        `}
        style={{
          borderColor: badgeConfig?.color || "#6366f1",
          boxShadow: `0 4px 14px ${badgeConfig?.color || "#6366f1"}40`,
        }}
      >
        <IconComponent
          size={iconSizes[size]}
          style={{ color: badgeConfig?.color || "#6366f1" }}
        />
      </div>

      {showDetails && (
        <div className="mt-3 text-center">
          {/* Badge Name */}
          <h4
            className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base"
            style={{ color: badgeConfig?.color || "#6366f1" }}
          >
            {t(badgeConfig?.nameKey || "gamification.badges.unknown.name")}
          </h4>

          {/* Badge Description */}
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-[120px]">
            {t(
              badgeConfig?.descriptionKey ||
                "gamification.badges.unknown.description",
            )}
          </p>

          {/* Earned Date */}
          {badge.earnedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {new Date(badge.earnedAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
