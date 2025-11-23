import React from "react";
import { useTranslation } from "react-i18next";
import { DifficultySelectorProps } from "../types/difficultySelector";

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onSelect,
}) => {
  const { t } = useTranslation();
  const difficulties = [
    {
      level: 1,
      label: t("difficulty.easy"),
      bgColor: "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50",
      textColor: "text-green-700 dark:text-green-400",
      borderColor: "border-green-300 dark:border-green-700",
    },
    {
      level: 2,
      label: t("difficulty.medium"),
      bgColor: "bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50",
      textColor: "text-orange-700 dark:text-orange-400",
      borderColor: "border-orange-300 dark:border-orange-700",
    },
    {
      level: 3,
      label: t("difficulty.hard"),
      bgColor: "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50",
      textColor: "text-red-700 dark:text-red-400",
      borderColor: "border-red-300 dark:border-red-700",
    },
  ];

  return (
    <div className="w-full py-4">
      <h3 className="text-center text-gray-700 dark:text-gray-300 font-medium text-sm mb-3">
        {t("components.difficultySelector.howWellRemembered")}
      </h3>

      <div className="flex flex-col sm:flex-row justify-center items-stretch gap-2 sm:gap-3 max-w-md mx-auto">
        {difficulties.map(
          ({ level, label, bgColor, textColor, borderColor }) => (
            <button
              key={level}
              onClick={() => onSelect(level as 1 | 2 | 3)}
              disabled={selectedDifficulty !== null}
              className={`
              flex-1 px-4 py-3 rounded-lg font-medium text-sm
              border ${borderColor} ${bgColor} ${textColor}
              transition-all duration-200
              hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              min-h-[44px]
            `}
            >
              {label}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default DifficultySelector;
