import React from "react";
import { useNavigate } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { LandingNav } from "../features/landing/components/LandingNav";
import { HeroSection } from "../features/landing/components/HeroSection";
import { FeatureShowcase } from "../features/landing/components/showcase/FeatureShowcase";
import { HowItWorksSection } from "../features/landing/components/HowItWorksSection";
import { PricingSection } from "../features/landing/components/PricingSection";
import { CtaSection } from "../features/landing/components/CtaSection";
import { LandingFooter } from "../features/landing/components/LandingFooter";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/topics");
    } else {
      navigate("/register");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    // "user" honours prefers-reduced-motion for every animation on the page.
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white">
        <LandingNav
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          onGetStarted={handleGetStarted}
        />
        <HeroSection onGetStarted={handleGetStarted} />
        <FeatureShowcase />
        <HowItWorksSection />
        <PricingSection onGetStarted={handleGetStarted} />
        <CtaSection onGetStarted={handleGetStarted} />
        <LandingFooter />
      </div>
    </MotionConfig>
  );
};

export default Landing;
