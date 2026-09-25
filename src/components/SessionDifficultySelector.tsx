/**
 * Componente SessionDifficultySelector - Fase 2
 * Selector de dificultad para tarjetas en sesiones intensivas
 * Nota: Usa EASY/MEDIUM/HARD (diferente del sistema SM-2 1/2/3)
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Check, Smile, Meh, Frown } from "lucide-react";
import { CardDifficulty } from "../types/intensiveSessions";

interface SessionDifficultySelectorProps {
  onSelect: (difficulty: CardDifficulty) => void;
  selectedDifficulty?: CardDifficulty | null;
  disabled?: boolean;
}

// Configuración de dificultades
const DIFFICULTY_CONFIG = {
  [CardDifficulty.EASY]: {
    icon: Smile,
    label: "easy",
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-700",
    selectedBorder: "border-green-500 ring-2 ring-green-500 ring-offset-2",
    textColor: "text-green-700 dark:text-green-400",
    hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/30",
    xpBonus: "+5 XP",
    description: "Recordé claramente",
    checkBg: "bg-green-500",
  },
  [CardDifficulty.MEDIUM]: {
    icon: Meh,
    label: "medium",
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    borderColor: "border-yellow-200 dark:border-yellow-700",
    selectedBorder: "border-yellow-500 ring-2 ring-yellow-500 ring-offset-2",
    textColor: "text-yellow-700 dark:text-yellow-400",
    hoverBg: "hover:bg-yellow-50 dark:hover:bg-yellow-900/30",
    xpBonus: "+10 XP",
    description: "Necesité recordar",
    checkBg: "bg-yellow-500",
  },
  [CardDifficulty.HARD]: {
    icon: Frown,
    label: "hard",
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-red-200 dark:border-red-700",
    selectedBorder: "border-red-500 ring-2 ring-red-500 ring-offset-2",
    textColor: "text-red-700 dark:text-red-400",
    hoverBg: "hover:bg-red-50 dark:hover:bg-red-900/30",
    xpBonus: "+15 XP",
    description: "No lo recordé",
    checkBg: "bg-red-500",
  },
};

const SessionDifficultySelector: React.FC<SessionDifficultySelectorProps> = ({
  onSelect,
  selectedDifficulty = null,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const difficulties = [
    CardDifficulty.EASY,
    CardDifficulty.MEDIUM,
    CardDifficulty.HARD,
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("intensiveStudy.howWasIt", "¿Qué tan difícil te pareció?")}
      </label>

      <div className="flex flex-wrap justify-center gap-3">
        {difficulties.map((difficulty) => {
          const config = DIFFICULTY_CONFIG[difficulty];
          const Icon = config.icon;
          const isSelected = selectedDifficulty === difficulty;

          return (
            <button
              key={difficulty}
              onClick={() => !disabled && onSelect(difficulty)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 min-w-[120px]
                ${config.bgColor}
                ${config.borderColor}
                ${isSelected ? config.selectedBorder : config.hoverBg}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
              `}
            >
              {/* Icono */}
              <Icon className={`w-10 h-10 mb-2 ${config.textColor}`} />

              {/* Label */}
              <span className={`font-semibold ${config.textColor}`}>
                {t(
                  `intensiveStudy.difficulty.${config.label}`,
                  difficulty === CardDifficulty.EASY
                    ? "Fácil"
                    : difficulty === CardDifficulty.MEDIUM
                      ? "Medio"
                      : "Difícil",
                )}
              </span>

              {/* XP Bonus */}
              <span className={`text-xs font-medium mt-1 ${config.textColor}`}>
                {config.xpBonus}
              </span>

              {/* Descripción breve */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {config.description}
              </p>

              {/* Indicador de selección */}
              {isSelected && (
                <div
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${config.checkBg} flex items-center justify-center`}
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

export default SessionDifficultySelector;
