import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ArrowDown } from "lucide-react";
import { Reveal, RevealItem } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { FeatureScene, type SceneTone } from "./FeatureScene";
import { RetentionCurve } from "./RetentionCurve";
import { FlashcardDemo } from "./FlashcardDemo";
import { RichContentDemo } from "./RichContentDemo";
import { TopicStacks } from "./TopicStacks";
import { CalendarReminders } from "./CalendarReminders";
import { ProgressStreaks } from "./ProgressStreaks";
import { FocusSession } from "./FocusSession";

type SceneKey =
  | "spacedRepetition"
  | "selfAssessment"
  | "richContent"
  | "topicOrganization"
  | "calendarIntegration"
  | "progressTracking"
  | "intensiveStudy";

interface Scene {
  key: SceneKey;
  tone: SceneTone;
  Illustration: React.FC;
}

const SCENES: Scene[] = [
  { key: "spacedRepetition", tone: "light", Illustration: RetentionCurve },
  { key: "selfAssessment", tone: "tint", Illustration: FlashcardDemo },
  { key: "richContent", tone: "light", Illustration: RichContentDemo },
  { key: "topicOrganization", tone: "tint", Illustration: TopicStacks },
  { key: "calendarIntegration", tone: "light", Illustration: CalendarReminders },
  { key: "progressTracking", tone: "dark", Illustration: ProgressStreaks },
  { key: "intensiveStudy", tone: "light", Illustration: FocusSession },
];

const POINTS = ["point1", "point2", "point3"] as const;

const sceneId = (key: SceneKey) => `feature-${key}`;

/**
 * The feature story: a compact index of chapters that anchor-scroll to one
 * scene per feature, each with its own living illustration.
 */
export const FeatureShowcase: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div id="features" className="scroll-mt-16">
      <section className="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-28 pb-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            badge={t("landing.features.badge")}
            title={t("landing.features.title")}
            subtitle={t("landing.features.subtitle")}
          />
          <Reveal
            as="ul"
            stagger={0.06}
            className="flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {SCENES.map((scene, index) => (
              <RevealItem as="li" key={scene.key} distance={12}>
                <motion.a
                  href={`#${sceneId(scene.key)}`}
                  initial="rest"
                  whileHover="hover"
                  className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
                >
                  <span className="font-mono text-xs text-indigo-500 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {t(`landing.showcase.${scene.key}.eyebrow`)}
                  <motion.span
                    aria-hidden="true"
                    className="inline-flex text-gray-400 group-hover:text-indigo-500"
                    variants={
                      reducedMotion
                        ? undefined
                        : { rest: { y: 0 }, hover: { y: 2 } }
                    }
                  >
                    <ArrowDown size={14} />
                  </motion.span>
                </motion.a>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      {SCENES.map(({ key, tone, Illustration }, index) => (
        <FeatureScene
          key={key}
          id={sceneId(key)}
          index={index + 1}
          tone={tone}
          reverse={index % 2 === 1}
          eyebrow={t(`landing.showcase.${key}.eyebrow`)}
          title={t(`landing.showcase.${key}.title`)}
          body={t(`landing.showcase.${key}.body`)}
          points={POINTS.map((point) => t(`landing.showcase.${key}.${point}`))}
        >
          <Illustration />
        </FeatureScene>
      ))}
    </div>
  );
};
