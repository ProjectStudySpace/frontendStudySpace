import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';
import { DifficultySelectorProps } from '../types/difficultySelector'

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onSelect,
}) => {
  const difficulties = [
    {
      level: 1,
      label: 'Fácil',
      icon: Smile,
      bgColor: 'bg-green-500 hover:bg-green-600',
      borderColor: 'border-green-200',
      description: 'Lo recordé fácilmente',
    },
    {
      level: 2,
      label: 'Medio',
      icon: Meh,
      bgColor: 'bg-orange-500 hover:bg-orange-600',
      borderColor: 'border-orange-200',
      description: 'Me costó un poco',
    },
    {
      level: 3,
      label: 'Difícil',
      icon: Frown,
      bgColor: 'bg-red-500 hover:bg-red-600',
      borderColor: 'border-red-200',
      description: 'No lo recordé bien',
    },
  ];

  return (
    <div className="w-full px-1 sm:px-2 py-2 flex flex-col items-center justify-center">
      <h3 className="text-center text-gray-900 font-semibold text-sm xs:text-base sm:text-lg mb-3 xs:mb-4 leading-tight px-1">
        ¿Qué tan bien recordaste esto?
      </h3>

      <div className="flex flex-col xs:flex-row justify-center items-stretch gap-1.5 xs:gap-2 sm:gap-3 w-full max-w-xs xs:max-w-none mx-auto">
        {difficulties.map(({ level, label, icon: Icon, bgColor, borderColor, description }) => (
          <button
            key={level}
            onClick={() => onSelect(level as 1 | 2 | 3)}
            disabled={selectedDifficulty !== null}
            className={`
              flex-1 flex flex-col items-center justify-center text-center
              min-w-0 min-h-[70px] xs:min-h-[80px] sm:min-h-[90px] md:min-h-[100px]
              rounded-lg text-white font-semibold border
              ${bgColor} ${borderColor}
              shadow-sm hover:shadow-md transition-all duration-200 
              hover:scale-105 active:scale-95
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
              px-1.5 py-2 xs:px-2 xs:py-2.5 sm:px-3 sm:py-3
            `}
          >
            <div className="flex flex-col items-center justify-center gap-0.5 xs:gap-1 sm:gap-1.5 w-full">
              <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
              <div className="text-xs font-medium leading-tight whitespace-nowrap truncate w-full px-0.5">
                {label}
              </div>
              <div className="text-[10px] xs:text-xs leading-tight line-clamp-2 max-h-[2.4em] overflow-hidden px-0.5">
                {description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;