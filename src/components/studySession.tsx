import React, { useState } from 'react';
import { ScheduledReview, StudySessionProps } from '../types/reviews'
import DifficultySelector from './difficultySelector';
import { X, Clock, BookOpen, Eye } from 'lucide-react';

const StudySession: React.FC<StudySessionProps> = ({
  review,
  currentCard,
  totalCards,
  onComplete,
  onExit,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | null>(null);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleDifficultySelect = (difficulty: 1 | 2 | 3) => {
    setSelectedDifficulty(difficulty);
    onComplete(difficulty);
    setShowAnswer(false);
    setSelectedDifficulty(null);
  };

  const progress = (currentCard / totalCards) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex justify-between items-center">
            <div className="text-white">
              <h2 className="text-xl font-semibold">Sesión de Estudio</h2>
              <div className="flex items-center gap-4 text-sm opacity-90 mt-1">
                <div className="flex items-center gap-1">
                  <BookOpen size={16} />
                  <span>Tarjeta {currentCard} de {totalCards}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{review.card.topic.name}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onExit}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="w-full bg-gray-200 h-2">
            <div 
              className="bg-green-500 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                  Pregunta
                </h3>
              </div>
              <p className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">
                {review.card.question}
              </p>
            </div>

            {showAnswer ? (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                    Respuesta
                  </h3>
                </div>
                <p className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {review.card.answer}
                </p>
              </div>
            ) : (
              <button
                onClick={handleShowAnswer}
                className="w-full py-4 bg-gray-100 rounded-xl text-gray-700 font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 border border-gray-300"
              >
                <Eye size={20} />
                Mostrar Respuesta
              </button>
            )}

            {showAnswer && (
              <div className="pt-2 pb-4">
                <DifficultySelector
                  selectedDifficulty={selectedDifficulty}
                  onSelect={handleDifficultySelect}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;