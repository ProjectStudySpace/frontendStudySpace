import React from "react";
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
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Color del tema
      </label>

      {/* Botón para mostrar/ocultar selector */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div
          className="w-8 h-8 rounded-full border border-gray-300"
          style={{ backgroundColor: selectedColor.value }}
        />
        <span
          className="flex-1 text-left font-medium"
          style={{ color: selectedColor.textColor }}
        >
          {selectedColor.name}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
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

          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-3 grid grid-cols-4 gap-3">
              {[
                {
                  id: "dark-blue",
                  name: "Azul oscuro",
                  value: "#93C5FD",
                  textColor: "#1E3A8A",
                },
                {
                  id: "light-blue",
                  name: "Azul claro",
                  value: "#BFDBFE",
                  textColor: "#1E40AF",
                },
                {
                  id: "dark-green",
                  name: "Verde oscuro",
                  value: "#86EFAC",
                  textColor: "#166534",
                },
                {
                  id: "light-green",
                  name: "Verde claro",
                  value: "#BBF7D0",
                  textColor: "#15803D",
                },
                {
                  id: "dark-purple",
                  name: "Morado oscuro",
                  value: "#D8B4FE",
                  textColor: "#7E22CE",
                },
                {
                  id: "light-purple",
                  name: "Morado claro",
                  value: "#E9D5FF",
                  textColor: "#9333EA",
                },
                {
                  id: "yellow",
                  name: "Amarillo",
                  value: "#FDE68A",
                  textColor: "#92400E",
                },
                {
                  id: "orange",
                  name: "Naranja",
                  value: "#FDBA74",
                  textColor: "#9A3412",
                },
                {
                  id: "turquoise",
                  name: "Turquesa",
                  value: "#99F6E4",
                  textColor: "#0F766E",
                },
                {
                  id: "gray",
                  name: "Gris",
                  value: "#D1D5DB",
                  textColor: "#374151",
                },
                {
                  id: "brown",
                  name: "Marrón",
                  value: "#FED7AA",
                  textColor: "#92400E",
                },
              ].map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onColorSelect(color)}
                  className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title={color.name}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <span
                    className="text-xs font-medium truncate max-w-full"
                    style={{ color: color.textColor }}
                  >
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
