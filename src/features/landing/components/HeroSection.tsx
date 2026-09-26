import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { HeroBackground } from "./HeroBackground";
import {
  getRevealVariants,
  hoverLift,
  nudgeX,
  scaleIn,
  staggerContainer,
} from "../motion/presets";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const item = getRevealVariants(reducedMotion, { distance: 20, duration: 0.7 });
  const visual = reducedMotion
    ? getRevealVariants(true, { delay: 0.3 })
    : scaleIn({ from: 0.96, duration: 0.8, delay: 0.55 });
  // Primary CTA: lifts on hover, nudges its arrow, compresses on tap.
  const ctaVariants = hoverLift(2, reducedMotion);
  const arrowVariants = nudgeX(4, reducedMotion);

  return (
    <section className="relative isolate pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <HeroBackground />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left column - Text content */}
          <motion.div
            className="space-y-4 sm:space-y-6 md:space-y-8"
            variants={staggerContainer(0.09, 0.15)}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-50 border border-indigo-100"
            >
              <Sparkles size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium text-indigo-600">
                {t("landing.hero.badge")}
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              {t("landing.hero.title")}{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                {t("landing.hero.titleHighlight")}
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed"
            >
              {t("landing.hero.subtitle")}
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <motion.button
                onClick={onGetStarted}
                variants={ctaVariants}
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-shadow shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {t("landing.hero.cta")}
                <motion.span variants={arrowVariants} className="inline-flex">
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </motion.span>
              </motion.button>
              <motion.button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
                variants={ctaVariants}
                className="bg-white/80 border-2 border-gray-200 hover:border-indigo-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors"
              >
                {t("landing.hero.ctaSecondary")}
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={item}
              className="flex items-center gap-4 sm:gap-8 pt-4 flex-wrap"
            >
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-yellow-400 text-yellow-400 sm:w-4 sm:h-4"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t("landing.hero.rating")}
                </p>
              </div>
              <div className="h-8 sm:h-12 w-px bg-gray-200" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-indigo-600 sm:w-5 sm:h-5" />
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    10K+
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t("landing.hero.activeStudents")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Visual */}
          <motion.div
            className="relative mt-8 lg:mt-0"
            variants={visual}
            initial="hidden"
            animate="visible"
          >
            <div className="relative bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
              {/* Mock UI */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Brain size={20} className="text-white sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {t("landing.mockUI.studySession")}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        15 {t("landing.mockUI.pendingCards")}
                      </p>
                    </div>
                  </div>
                  <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0">
                    {t("landing.mockUI.active")}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-indigo-100">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    {t("landing.mockUI.question")}
                  </p>
                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                    <p className="text-gray-900 font-medium text-xs sm:text-sm md:text-base">
                      {t("landing.mockUI.answer")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5 sm:gap-2">
                  {[
                    t("landing.mockUI.easy"),
                    t("landing.mockUI.medium"),
                    t("landing.mockUI.hard"),
                  ].map((level, i) => (
                    <button
                      key={level}
                      className={`flex-1 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm ${
                        i === 0
                          ? "bg-green-100 text-green-700"
                          : i === 1
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <div className="hidden sm:block absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-white rounded-xl sm:rounded-2xl shadow-lg p-2 sm:p-4 animate-float">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Zap size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {t("landing.mockUI.currentStreak")}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      15 {t("stats.days")} 🔥
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-white rounded-xl sm:rounded-2xl shadow-lg p-2 sm:p-4 animate-float-delayed">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp size={16} className="text-green-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {t("landing.mockUI.progress")}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">87% 📈</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-float-delayed {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};
