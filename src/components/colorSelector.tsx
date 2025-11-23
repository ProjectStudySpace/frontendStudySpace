import React from "react";
import { useTranslation } from "react-i18next";
import { PastelColor } from "../types/colors";

interface ColorSelectorProps {
  selectedColor: PastelColor;
  onColorSelect: (color: PastelColor) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColor,
  onColorSelect,
  isOpen,
  onToggle,
  onClose,
}) => {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t("components.colorSelector.themeColor")}
      </label>

      {/* Botón para mostrar/ocultar selector */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div
          className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: selectedColor.value }}
        />
        <span
          className="flex-1 text-left font-medium text-gray-900 dark:text-white"
        >
          {selectedColor.name}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Selector desplegable */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div className="fixed inset-0 z-10" onClick={onClose} />

          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-3 grid grid-cols-4 gap-3">
              {[
                {
                  id: "dark-blue",
                  name: t("components.colorSelector.colors.darkBlue"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#1D4ED8" : "#93C5FD",
                  textColor: "#1E3A8A",
                },
                {
                  id: "light-blue",
                  name: t("components.colorSelector.colors.lightBlue"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#60A5FA" : "#BFDBFE",
                  textColor: "#1E40AF",
                },
                {
                  id: "dark-green",
                  name: t("components.colorSelector.colors.darkGreen"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#10B981" : "#86EFAC",
                  textColor: "#166534",
                },
                {
                  id: "light-green",
                  name: t("components.colorSelector.colors.lightGreen"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#34D399" : "#BBF7D0",
                  textColor: "#15803D",
                },
                {
                  id: "dark-purple",
                  name: t("components.colorSelector.colors.darkPurple"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#7C2D92" : "#D8B4FE",
                  textColor: "#7E22CE",
                },
                {
                  id: "light-purple",
                  name: t("components.colorSelector.colors.lightPurple"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#A78BFA" : "#E9D5FF",
                  textColor: "#9333EA",
                },
                {
                  id: "yellow",
                  name: t("components.colorSelector.colors.yellow"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#F59E0B" : "#FDE68A",
                  textColor: "#92400E",
                },
                {
                  id: "orange",
                  name: t("components.colorSelector.colors.orange"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#F97316" : "#FDBA74",
                  textColor: "#9A3412",
                },
                {
                  id: "turquoise",
                  name: t("components.colorSelector.colors.turquoise"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#14B8A6" : "#99F6E4",
                  textColor: "#0F766E",
                },
                {
                  id: "gray",
                  name: t("components.colorSelector.colors.gray"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#6B7280" : "#D1D5DB",
                  textColor: "#374151",
                },
                {
                  id: "brown",
                  name: t("components.colorSelector.colors.brown"),
                  value: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#D97706" : "#FED7AA",
                  textColor: "#92400E",
                },
              ].map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onColorSelect(color)}
                  className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={color.name}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs font-medium truncate max-w-full text-white dark:text-gray-100">
                    {color.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
