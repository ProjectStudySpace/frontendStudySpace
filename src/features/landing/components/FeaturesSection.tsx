import React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Brain,
  Calendar,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { EASE_OUT_EXPO, getRevealVariants } from "../motion/presets";

interface Feature {
  icon: LucideIcon;
  key: string;
  color: string;
}

const FEATURES: Feature[] = [
  { icon: Brain, key: "spacedRepetition", color: "from-indigo-500 to-purple-600" },
  { icon: Calendar, key: "calendarIntegration", color: "from-blue-500 to-cyan-600" },
  { icon: TrendingUp, key: "progressTracking", color: "from-green-500 to-emerald-600" },
  { icon: Zap, key: "streakSystem", color: "from-orange-500 to-red-600" },
  { icon: BookOpen, key: "topicOrganization", color: "from-purple-500 to-pink-600" },
  { icon: Target, key: "selfAssessment", color: "from-yellow-500 to-orange-600" },
];

const HOVER_TRANSITION = { duration: 0.3, ease: EASE_OUT_EXPO };

/** Icon tile tilts and grows slightly while its card is hovered. */
const iconVariants = (reducedMotion: boolean): Variants => ({
  hidden: { rotate: 0, scale: 1 },
  visible: { rotate: 0, scale: 1, transition: HOVER_TRANSITION },
  hover: reducedMotion ? {} : { rotate: -6, scale: 1.08, transition: HOVER_TRANSITION },
});

export const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const cardVariants: Variants = {
    ...getRevealVariants(reducedMotion, { distance: 24 }),
    hover: reducedMotion ? {} : { y: -4, transition: HOVER_TRANSITION },
  };
  const icon = iconVariants(reducedMotion);

  return (
    <section
      id="features"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge={t("landing.features.badge")}
          title={t("landing.features.title")}
          subtitle={t("landing.features.subtitle")}
        />

        <Reveal
          stagger={0.08}
          amount={0.15}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.key}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <motion.div
                variants={icon}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4`}
              >
                <feature.icon size={24} className="text-white sm:w-7 sm:h-7" />
              </motion.div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                {t(`landing.features.${feature.key}.title`)}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t(`landing.features.${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};
