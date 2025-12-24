import { useEffect } from "react";
import SpacedRepetitionDashboard from "../components/spacedRepetitionDashboard";
import { useReviews } from "../../hooks/useReviews";
import { useOnboarding } from "../context/OnboardingContext";
import OnboardingPageGuide from "../components/OnboardingPageGuide";

const StudySessions = () => {
  const { fetchAllReviews, pendingReviews, upcomingReviews } = useReviews();
  const {
    isPageGuideActive,
    currentPageGuideStep,
    pageGuideSteps,
    startPageGuide,
    endPageGuide,
    nextPageGuideStep,
    prevPageGuideStep,
    isPageGuideCompleted,
  } = useOnboarding();

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const upcomingCount =
    upcomingReviews && typeof upcomingReviews === "object"
      ? Object.values(upcomingReviews).reduce((total, dateGroup) => {
          return total + (Array.isArray(dateGroup) ? dateGroup.length : 0);
        }, 0)
      : 0;

  // Start page guide when component mounts if guide is active
  useEffect(() => {
    // Check if we should start the page guide (user navigated from study-sessions step)
    // The context will handle this automatically when nextStep is called
  }, []);

  const currentStep = pageGuideSteps[currentPageGuideStep];
  const isFirstStep = currentPageGuideStep === 0;
  const isLastStep = currentPageGuideStep === pageGuideSteps.length - 1;

  return (
    <div className="max-w-7xl mx-auto">
      <SpacedRepetitionDashboard />
      
      {/* Page Guide Component */}
      {isPageGuideActive && currentStep && (
        <OnboardingPageGuide
          steps={pageGuideSteps}
          isActive={isPageGuideActive}
          onComplete={endPageGuide}
          onNext={nextPageGuideStep}
          onPrev={prevPageGuideStep}
          currentStep={currentPageGuideStep}
          totalSteps={pageGuideSteps.length}
          isLastStep={isLastStep}
          isFirstStep={isFirstStep}
        />
      )}
    </div>
  );
};

export default StudySessions;
