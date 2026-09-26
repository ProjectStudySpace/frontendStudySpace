import React, { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading";
import { Reveal, RevealItem } from "../Reveal";
import { EASE_OUT_EXPO } from "../../motion/presets";
import { stepForProgress, stepLocalProgress } from "../../motion/story";
import { STEP_VISUALS } from "./StepVisuals";

const STEPS = ["step1", "step2", "step3"] as const;
const STAGE_TINTS = [
  "from-indigo-50 via-white to-purple-50",
  "from-amber-50 via-white to-indigo-50",
  "from-pink-50 via-white to-indigo-50",
];

const stepNumber = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Wide screens: a tall track with a pinned stage. Scroll progress picks the
 * active step, fills the timeline and swaps the stage visual.
 */
const PinnedStory: React.FC = () => {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });
  const local = useTransform(smooth, (v) => stepLocalProgress(v, STEPS.length));

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = stepForProgress(v, STEPS.length);
    setActive((current) => (current === next ? current : next));
  });

  const Visual = STEP_VISUALS[active];

  return (
    <div ref={trackRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-16 px-8">
          <div className="relative">
            <div aria-hidden="true" className="absolute left-[1.1rem] top-3 bottom-3 w-0.5 rounded-full bg-indigo-100">
              <motion.div
                className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"
                style={{ scaleY: smooth }}
              />
            </div>
            <ol className="relative space-y-12 pl-16">
              {STEPS.map((key, index) => {
                const isActive = index === active;
                const reached = index <= active;
                return (
                  <li key={key} className="relative" aria-current={isActive ? "step" : undefined}>
                    <motion.span
                      aria-hidden="true"
                      className="absolute -left-16 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white font-mono text-xs font-semibold"
                      animate={{
                        borderColor: reached ? "#7c3aed" : "#e0e7ff",
                        color: reached ? "#6d28d9" : "#a5b4fc",
                        scale: isActive ? 1.15 : 1,
                      }}
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    >
                      {stepNumber(index)}
                    </motion.span>
                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0.35, x: isActive ? 0 : -6 }}
                      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                    >
                      <h3 className="mb-2 text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
                        {t(`landing.howItWorks.${key}.title`)}
                      </h3>
                      <p className="max-w-md text-base lg:text-lg leading-relaxed text-gray-600">
                        {t(`landing.howItWorks.${key}.description`)}
                      </p>
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div
            aria-hidden="true"
            className={`relative flex h-[min(70vh,36rem)] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br p-8 transition-colors duration-700 ${STAGE_TINTS[active]}`}
          >
            <span className="pointer-events-none absolute -right-4 -top-10 select-none font-mono text-[10rem] font-bold leading-none text-indigo-500/10">
              {stepNumber(active)}
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="relative flex w-full justify-center"
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.04, y: -24 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              >
                <Visual />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-x-8 bottom-6 flex items-center gap-3 text-xs font-medium text-gray-500">
              <span className="tabular-nums">
                {t("landing.howItWorks.stepOf", { current: active + 1, total: STEPS.length })}
              </span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-indigo-100">
                <motion.span
                  className="block h-full origin-left rounded-full bg-indigo-500"
                  style={{ scaleX: local }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Mounts its visual only once scrolled into view, so its story plays then. */
const InViewVisual: React.FC<{ index: number }> = ({ index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const Visual = STEP_VISUALS[index];
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`flex min-h-[22rem] items-center justify-center rounded-3xl border border-indigo-100 bg-gradient-to-br p-5 ${STAGE_TINTS[index]}`}
    >
      {inView && <Visual />}
    </div>
  );
};

/** Small screens and reduced motion: stacked steps, each revealed in view. */
const StackedStory: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ol className="mx-auto max-w-xl space-y-16 px-4 sm:px-6">
      {STEPS.map((key, index) => (
        <li key={key}>
          <Reveal stagger={0.08} amount={0.3}>
            <RevealItem className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-purple-500 font-mono text-xs font-semibold text-purple-700">
                {stepNumber(index)}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
            </RevealItem>
            <RevealItem as="h3" className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
              {t(`landing.howItWorks.${key}.title`)}
            </RevealItem>
            <RevealItem as="p" className="mb-6 text-base leading-relaxed text-gray-600">
              {t(`landing.howItWorks.${key}.description`)}
            </RevealItem>
          </Reveal>
          <InViewVisual index={index} />
        </li>
      ))}
    </ol>
  );
};

export const HowItWorksStory: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section id="how-it-works" className="scroll-mt-16 bg-white pt-16 sm:pt-20 md:pt-28 pb-16 md:pb-8">
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <SectionHeading
          title={t("landing.howItWorks.title")}
          subtitle={t("landing.howItWorks.subtitle")}
        />
      </div>
      {reducedMotion ? (
        <StackedStory />
      ) : (
        <>
          <div className="md:hidden">
            <StackedStory />
          </div>
          <div className="hidden md:block">
            <PinnedStory />
          </div>
        </>
      )}
    </section>
  );
};
