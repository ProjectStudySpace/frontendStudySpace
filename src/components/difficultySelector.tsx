import React from 'react';
import { DifficultySelectorProps } from '../types/difficultySelector'

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onSelect,
}) => {
  const difficulties = [
    {
      level: 1,
      label: 'Fácil',
      bgColor: 'bg-green-100 hover:bg-green-200',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
    },
    {
      level: 2,
      label: 'Medio',
      bgColor: 'bg-orange-100 hover:bg-orange-200',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300',
    },
    {
      level: 3,
      label: 'Difícil',
      bgColor: 'bg-red-100 hover:bg-red-200',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
    },
  ];

  return (
    <div className="w-full py-4">
      <h3 className="text-center text-gray-700 font-medium text-sm mb-3">
        ¿Qué tan bien lo recordaste?
      </h3>

      <div className="flex flex-col sm:flex-row justify-center items-stretch gap-2 sm:gap-3 max-w-md mx-auto">
        {difficulties.map(({ level, label, bgColor, textColor, borderColor }) => (
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
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;