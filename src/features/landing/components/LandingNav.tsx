import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Brain } from "lucide-react";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { EASE_OUT_EXPO } from "../motion/presets";

interface LandingNavProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onGetStarted: () => void;
}

const SECTION_LINKS = [
  { href: "#features", labelKey: "landing.nav.features" },
  { href: "#how-it-works", labelKey: "landing.nav.howItWorks" },
  { href: "#pricing", labelKey: "landing.nav.pricing" },
] as const;

/** Underline that grows from the left on hover and keyboard focus. */
const UNDERLINE =
  "relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-indigo-500 after:to-purple-600 after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none";

export const LandingNav: React.FC<LandingNavProps> = ({
  isAuthenticated,
  onLogin,
  onGetStarted,
}) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-gray-200/60"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Desktop layout - single row */}
        <div className="hidden lg:flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <Brain size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              MemoPal
            </span>
          </div>

          <div className="flex items-center gap-8">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-gray-600 hover:text-gray-900 font-medium transition-colors ${UNDERLINE}`}
              >
                {t(link.labelKey)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            {!isAuthenticated ? (
              <button
                onClick={onLogin}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-[0.97] whitespace-nowrap"
              >
                {t("landing.nav.login")}
              </button>
            ) : (
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-[0.97] whitespace-nowrap"
              >
                {t("landing.hero.goToDashboard")}
              </button>
            )}
          </div>
        </div>

        {/* Mobile/Tablet layout - two rows */}
        <div className="lg:hidden">
          {/* First row: logo and actions */}
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                MemoPal
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="scale-90 sm:scale-100">
                <LanguageSelector />
              </div>
              {!isAuthenticated ? (
                <button
                  onClick={onLogin}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-[0.97] whitespace-nowrap"
                >
                  {t("landing.nav.login")}
                </button>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-[0.97] whitespace-nowrap"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Second row: section links */}
          <div
            className={`flex items-center justify-center gap-4 sm:gap-6 py-2 sm:py-3 border-t transition-colors duration-300 ${
              isScrolled ? "border-gray-200/50" : "border-gray-200/30"
            }`}
          >
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors ${UNDERLINE}`}
              >
                {t(link.labelKey)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
