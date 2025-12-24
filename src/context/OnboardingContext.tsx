import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  targetId: string;
  route: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  disableGuide: () => void;
  resetGuide: () => void;
  isGuideDisabled: boolean;
  totalSteps: number;
  currentStepId: string | null;
}

const ONBOARDING_STORAGE_KEY = 'memopal_onboarding_status';

interface OnboardingStorage {
  hasSeenTour: boolean;
  disabledAt: number | null;
  version: string;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGuideDisabled, setIsGuideDisabled] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);

  // Initialize steps with translations - memoized to prevent recreation on every render
  const steps = React.useMemo<OnboardingStep[]>(
    () => [
      {
        id: 'welcome',
        targetId: 'nav-topics',
        route: '/topics',
        title: t('guide.welcome.title'),
        description: t('guide.welcome.description'),
        position: 'bottom',
      },
      {
        id: 'topics',
        targetId: 'nav-topics',
        route: '/topics',
        title: t('guide.topics.title'),
        description: t('guide.topics.description'),
        position: 'right',
      },
      {
        id: 'study-sessions',
        targetId: 'nav-study-sessions',
        route: '/study-sessions',
        title: t('guide.studySessions.title'),
        description: t('guide.studySessions.description'),
        position: 'right',
      },
      {
        id: 'calendar',
        targetId: 'nav-calendar',
        route: '/calendar',
        title: t('guide.calendar.title'),
        description: t('guide.calendar.description'),
        position: 'right',
      },
      {
        id: 'progress',
        targetId: 'nav-progress',
        route: '/progress',
        title: t('guide.progress.title'),
        description: t('guide.progress.description'),
        position: 'right',
      },
      {
        id: 'profile',
        targetId: 'nav-profile',
        route: '/profile',
        title: t('guide.profile.title'),
        description: t('guide.profile.description'),
        position: 'bottom',
      },
      {
        id: 'settings',
        targetId: 'nav-settings',
        route: '/settings',
        title: t('guide.settings.title'),
        description: t('guide.settings.description'),
        position: 'bottom',
      },
      {
        id: 'finish',
        targetId: 'nav-topics',
        route: '/topics',
        title: t('guide.finish.title'),
        description: t('guide.finish.description'),
        position: 'bottom',
      },
    ],
    [t]
  );

  const totalSteps = steps.length;

  // Check if guide is disabled on mount
  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: OnboardingStorage = JSON.parse(stored);
        if (parsed.disabledAt !== null) {
          setIsGuideDisabled(true);
        }
      } catch (e) {
        console.error('Error parsing onboarding status:', e);
      }
    }
  }, []);

  const startTour = useCallback(() => {
    if (!isGuideDisabled) {
      setIsActive(true);
      setCurrentStep(0);
      setCurrentStepId(steps[0]?.id || null);
    }
  }, [isGuideDisabled, steps]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setCurrentStepId(null);
    // Mark as seen
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const parsed: OnboardingStorage = stored ? JSON.parse(stored) : { hasSeenTour: false, disabledAt: null, version: '1.0' };
    parsed.hasSeenTour = true;
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(parsed));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setCurrentStepId(steps[next]?.id || null);
      // Navigate to the next step's route
      navigate(steps[next].route);
    } else {
      endTour();
    }
  }, [currentStep, totalSteps, endTour, navigate, steps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setCurrentStepId(steps[prev]?.id || null);
      // Navigate to the previous step's route
      navigate(steps[prev].route);
    }
  }, [currentStep, navigate, steps]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
      setCurrentStepId(steps[step]?.id || null);
      // Navigate to the route for this step
      navigate(steps[step].route);
    }
  }, [totalSteps, navigate, steps]);

  const disableGuide = useCallback(() => {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const parsed: OnboardingStorage = stored ? JSON.parse(stored) : { hasSeenTour: false, disabledAt: null, version: '1.0' };
    parsed.disabledAt = Date.now();
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(parsed));
    setIsGuideDisabled(true);
    endTour();
  }, [endTour]);

  const resetGuide = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsGuideDisabled(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
        disableGuide,
        resetGuide,
        isGuideDisabled,
        totalSteps,
        currentStepId,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
