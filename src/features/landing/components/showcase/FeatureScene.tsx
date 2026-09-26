import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, RevealItem } from "../Reveal";
import { getRevealVariants, scaleIn } from "../../motion/presets";

export type SceneTone = "light" | "tint" | "dark";

/** `wide` gives the illustration three fifths of the row, from `lg` up. */
export type SceneLayout = "split" | "wide";

interface FeatureSceneProps {
  id: string;
  /** 1-based position, shown as the eyebrow counter. */
  index: number;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** Illustration on the left on wide screens. */
  reverse?: boolean;
  tone?: SceneTone;
  layout?: SceneLayout;
  children: React.ReactNode;
}

const TONES: Record<
  SceneTone,
  { section: string; eyebrow: string; title: string; body: string; rule: string }
> = {
  light: {
    section: "bg-white",
    eyebrow: "text-indigo-600",
    title: "text-gray-900",
    body: "text-gray-600",
    rule: "bg-gray-200",
  },
  tint: {
    section: "bg-slate-50",
    eyebrow: "text-indigo-600",
    title: "text-gray-900",
    body: "text-gray-600",
    rule: "bg-gray-200",
  },
  dark: {
    section: "bg-slate-950",
    eyebrow: "text-indigo-300",
    title: "text-white",
    body: "text-slate-300",
    rule: "bg-white/10",
  },
};

const LAYOUTS: Record<
  SceneLayout,
  { grid: string; text: string; stage: string; textLast: string; stageFirst: string }
> = {
  split: {
    grid: "md:grid-cols-2 gap-10 md:gap-16",
    text: "",
    stage: "",
    textLast: "md:order-2",
    stageFirst: "md:order-1",
  },
  wide: {
    grid: "lg:grid-cols-5 gap-10 lg:gap-14",
    text: "lg:col-span-2",
    stage: "lg:col-span-3",
    textLast: "lg:order-2",
    stageFirst: "lg:order-1",
  },
};

/**
 * One chapter of the feature story: eyebrow counter, headline, short body and
 * a few points beside a living illustration. Sides alternate between scenes.
 */
export const FeatureScene: React.FC<FeatureSceneProps> = ({
  id,
  index,
  eyebrow,
  title,
  body,
  points,
  reverse = false,
  tone = "light",
  layout = "split",
  children,
}) => {
  const reducedMotion = useReducedMotion() ?? false;
  const colors = TONES[tone];
  const grid = LAYOUTS[layout];
  const stageVariants = reducedMotion
    ? getRevealVariants(true)
    : scaleIn({ from: 0.94, duration: 0.9, delay: 0.1 });

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-20 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 ${colors.section}`}
    >
      <div className={`max-w-6xl mx-auto grid items-center ${grid.grid}`}>
        <Reveal
          stagger={0.08}
          amount={0.3}
          className={`${grid.text} ${reverse ? grid.textLast : ""}`}
        >
          <RevealItem className="flex items-center gap-3 mb-5">
            <span
              className={`font-mono text-xs sm:text-sm tabular-nums ${colors.eyebrow}`}
            >
              {String(index).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className={`h-px w-10 ${colors.rule}`} />
            <span
              className={`text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] ${colors.eyebrow}`}
            >
              {eyebrow}
            </span>
          </RevealItem>
          <RevealItem
            as="h3"
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-5 ${colors.title}`}
          >
            <span id={`${id}-title`}>{title}</span>
          </RevealItem>
          <RevealItem
            as="p"
            className={`text-base sm:text-lg leading-relaxed mb-8 max-w-xl ${colors.body}`}
          >
            {body}
          </RevealItem>
          <Reveal as="ul" stagger={0.07} className="space-y-3">
            {points.map((point) => (
              <RevealItem
                as="li"
                key={point}
                distance={10}
                className={`flex gap-3 text-sm sm:text-base ${colors.body}`}
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500"
                />
                {point}
              </RevealItem>
            ))}
          </Reveal>
        </Reveal>

        <motion.div
          className={`min-w-0 ${grid.stage} ${reverse ? grid.stageFirst : ""}`}
          variants={stageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
};
