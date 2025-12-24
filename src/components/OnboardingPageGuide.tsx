import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface PageGuideStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
}

interface OnboardingPageGuideProps {
  steps: PageGuideStep[];
  isActive: boolean;
  onComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
  isLastStep: boolean;
  isFirstStep: boolean;
}

const OnboardingPageGuide: React.FC<OnboardingPageGuideProps> = ({
  steps,
  isActive,
  onComplete,
  onNext,
  onPrev,
  currentStep,
  totalSteps,
  isLastStep,
  isFirstStep,
}) => {
  const { t } = useTranslation();
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [highlightClass, setHighlightClass] = useState('');
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Get the highlight class for desktop and mobile
  const getHighlightClass = useCallback(() => {
    return 'bg-gradient-to-br from-indigo-500/25 to-purple-500/25 dark:from-indigo-500/30 dark:to-purple-500/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/50';
  }, []);

  // Calculate positions based on target element
  const calculatePositions = useCallback(() => {
    if (!isActive || !isMounted) return;

    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    // Special case: if targetId is 'centered-tooltip', always position in center
    if (currentStepData.targetId === 'centered-tooltip') {
      const sidebarWidth = 64;
      const centerX = (sidebarWidth + window.innerWidth) / 2;
      const centerY = window.innerHeight / 2;
      
      // Get tooltip dimensions
      const tooltipEl = tooltipRef.current;
      const tooltipWidth = tooltipEl ? Math.min(tooltipEl.offsetWidth, 320) : 320;
      const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 180;
      
      setTooltipPosition({
        top: centerY - tooltipHeight / 2,
        left: centerX - tooltipWidth / 2,
      });
      setTargetRect(null);
      return;
    }

    const targetElement = document.getElementById(currentStepData.targetId);

    // Get tooltip dimensions
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? Math.min(tooltipEl.offsetWidth, 320) : 320;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 180;

    // Fallback: position tooltip in center of main content area if target not found
    if (!targetElement) {
      const sidebarWidth = 64;
      const centerX = (sidebarWidth + window.innerWidth) / 2;
      const centerY = window.innerHeight / 2;
      setTooltipPosition({
        top: centerY - tooltipHeight / 2,
        left: centerX - tooltipWidth / 2,
      });
      setTargetRect(null);
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    setTargetRect(targetRect);

    // Apply highlight class to target element
    setHighlightClass(getHighlightClass());
    targetElement.classList.add(...getHighlightClass().split(' '));

    // Scroll to target element smoothly
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // Calculate center position for tooltip (same for desktop and mobile)
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;

    // Position tooltip above the component
    let top = targetRect.top - tooltipHeight - 20;
    let left = centerX - tooltipWidth / 2;

    // If tooltip would go above the viewport, position it below
    if (top < 16) {
      top = targetRect.bottom + 20;
    }

    // Ensure tooltip stays within viewport horizontally
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    setTooltipPosition({ top, left });
  }, [isActive, currentStep, steps, isMounted, getHighlightClass]);

  // Clear highlight from previous target
  const clearHighlight = useCallback(() => {
    const allTargetIds = steps.map(s => s.targetId);
    allTargetIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.remove(
          'bg-gradient-to-br',
          'from-indigo-500/25',
          'to-purple-500/25',
          'dark:from-indigo-500/30',
          'dark:to-purple-500/30',
          'text-indigo-700',
          'dark:text-indigo-300',
          'ring-1',
          'ring-indigo-500/50'
        );
      }
    });
    setHighlightClass('');
  }, [steps]);

  // Set mounted state after initial render
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setIsMounted(true);
        calculatePositions();
      }, 100);
      return () => {
        clearTimeout(timer);
        clearHighlight();
      };
    }
  }, [isActive, calculatePositions, clearHighlight]);

  // Recalculate on step change
  useEffect(() => {
    if (isActive && isMounted) {
      clearHighlight();
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        calculatePositions();
      }, 50);
      return () => clearTimeout(timer);
    }
    // Always clear highlight when unmounting or deactivating
    return () => {
      if (!isActive) {
        clearHighlight();
      }
    };
  }, [isActive, currentStep, isMounted, calculatePositions, clearHighlight]);

  // Handle window resize and scroll
  useEffect(() => {
    if (!isActive) return;

    const handleUpdate = () => {
      requestAnimationFrame(() => calculatePositions());
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isActive, calculatePositions]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onNext, onPrev, onComplete]);

  if (!isActive) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300" />

      {/* Spotlight effect around target - creates a dark overlay except for the target */}
      {targetRect && (
        <div
          className="fixed rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] dark:shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            zIndex: 45,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 animate-in fade-in zoom-in-95 duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          maxWidth: '320px',
        }}
      >
        {/* Border with gradient */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 rounded-xl p-[2px]">
          <div className="bg-white dark:bg-gray-800 rounded-[10px] p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {currentStepData.title}
                </h3>
              </div>
              <button
                onClick={onComplete}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 -mr-1 -mt-1"
                aria-label={t('guide.actions.close')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={onPrev}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    {t('guide.actions.previous')}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isLastStep && (
                  <button
                    onClick={onComplete}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors underline"
                  >
                    {t('guide.actions.disableGuide')}
                  </button>
                )}
                <button
                  onClick={onNext}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-95"
                >
                  {isLastStep ? t('guide.finish.done') : t('guide.actions.next')}
                  {!isLastStep && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingPageGuide;
