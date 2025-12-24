import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import AnimatedArrow from './OnboardingArrow';

const OnboardingTour: React.FC = () => {
  const { t } = useTranslation();
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    prevStep,
    endTour,
    disableGuide,
    isPageGuideActive,
  } = useOnboarding();

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if we're on desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Calculate positions based on target element
  const calculatePositions = useCallback(() => {
    if (!isActive || !isMounted) return;

    const currentStepData = steps[currentStep];
    const targetElement = document.getElementById(currentStepData.targetId);

    // Get tooltip dimensions after render
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? Math.min(tooltipEl.offsetWidth, 320) : 320;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 180;
    const sidebarWidth = 64; // Width of desktop sidebar

    // On mobile, always position tooltip in center of screen
    if (!isDesktop) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setTooltipPosition({
        top: centerY - tooltipHeight / 2,
        left: centerX - tooltipWidth / 2,
      });
      setTargetRect(null);
      // Hide arrow by setting all positions to 0
      setArrowPosition({ startX: 0, startY: 0, endX: 0, endY: 0 });
      return;
    }

    if (!targetElement) {
      // Fallback: position tooltip in center of main content area
      const centerX = (sidebarWidth + window.innerWidth) / 2;
      const centerY = window.innerHeight / 2;
      setTooltipPosition({
        top: centerY - tooltipHeight / 2,
        left: centerX - tooltipWidth / 2,
      });
      setTargetRect(null);
      // Hide arrow by setting all positions to 0
      setArrowPosition({ startX: 0, startY: 0, endX: 0, endY: 0 });
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    setTargetRect(targetRect);

    let top = 0;
    let left = 0;

    // Calculate position based on step position preference
    switch (currentStepData.position) {
      case 'right':
        // Position to the right of the sidebar
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = sidebarWidth + 30;
        break;
      case 'bottom':
        // Position below the target
        top = targetRect.bottom + 20;
        left = Math.min(
          targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          window.innerWidth - tooltipWidth - 16
        );
        left = Math.max(sidebarWidth + 16, left);
        break;
      case 'top':
        // Position above the target
        top = targetRect.top - tooltipHeight - 20;
        left = Math.min(
          targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          window.innerWidth - tooltipWidth - 16
        );
        left = Math.max(sidebarWidth + 16, left);
        break;
      case 'left':
        // Position to the left of the target (for right-side items)
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - 30;
        break;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
    left = Math.max(sidebarWidth + 16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    setTooltipPosition({ top, left });

    // Calculate arrow position (from tooltip to target)
    // Arrow points FROM tooltip TO target
    setArrowPosition({
      startX: left + (currentStepData.position === 'right' ? 0 : tooltipWidth / 2),
      startY: top + (currentStepData.position === 'top' ? tooltipHeight : currentStepData.position === 'bottom' ? 0 : tooltipHeight / 2),
      endX: targetRect.left + (currentStepData.position === 'left' ? targetRect.width : targetRect.width / 2),
      endY: targetRect.top + (currentStepData.position === 'top' ? targetRect.height : currentStepData.position === 'bottom' ? 0 : targetRect.height / 2),
    });
  }, [isActive, currentStep, steps, isMounted, isDesktop]);

  // Set mounted state after initial render
  useEffect(() => {
    if (isActive) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsMounted(true);
        calculatePositions();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isActive, calculatePositions]);

  // Recalculate on step change
  useEffect(() => {
    if (isActive && isMounted) {
      calculatePositions();
    }
  }, [isActive, currentStep, isMounted, calculatePositions]);

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
        endTour();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, endTour]);

  // Hide main tour overlay when page guide is active
  const shouldShowOverlay = isActive && !isPageGuideActive;

  if (!isActive || isPageGuideActive) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300" />

      {/* Spotlight effect around target - only on desktop */}
      {targetRect && isDesktop && (
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

      {/* Animated Arrow */}
      <AnimatedArrow
        startX={arrowPosition.startX}
        startY={arrowPosition.startY}
        endX={arrowPosition.endX}
        endY={arrowPosition.endY}
        delay={200}
      />

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
                onClick={endTour}
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
                    onClick={prevStep}
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
                    onClick={disableGuide}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors underline"
                  >
                    {t('guide.actions.disableGuide')}
                  </button>
                )}
                <button
                  onClick={nextStep}
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

export default OnboardingTour;
