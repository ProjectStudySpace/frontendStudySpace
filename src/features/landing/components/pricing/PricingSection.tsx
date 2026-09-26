import React from "react";
import { useTranslation } from "react-i18next";
import { Reveal, RevealItem } from "../Reveal";
import { EarlyAccessTrack } from "./EarlyAccessTrack";
import { ComingSoonCard, FreePlanCard } from "./PlanCards";

interface PricingSectionProps {
  onGetStarted: () => void;
}

/**
 * Pricing, told honestly: MemoPal is free during early access and new
 * experiences are on the way. A timeline shows where we are; the cards show
 * what is included today and what comes next.
 */
export const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();

  return (
    <section
      id="pricing"
      className="scroll-mt-16 bg-slate-950 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal as="header" stagger={0.08} className="mb-12 sm:mb-16 text-center">
          <RevealItem
            as="p"
            className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300"
          >
            {t("landing.pricing.eyebrow")}
          </RevealItem>
          <RevealItem
            as="h2"
            className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            {t("landing.pricing.title")}
          </RevealItem>
          <RevealItem as="p" className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300">
            {t("landing.pricing.subtitle")}
          </RevealItem>
        </Reveal>

        <div className="mb-14 sm:mb-20">
          <EarlyAccessTrack />
        </div>

        <Reveal stagger={0.12} amount={0.15} className="grid gap-8 md:grid-cols-2">
          <RevealItem distance={24}>
            <FreePlanCard onGetStarted={onGetStarted} />
          </RevealItem>
          <RevealItem distance={24}>
            <ComingSoonCard />
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
};
