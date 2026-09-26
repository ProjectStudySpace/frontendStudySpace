import React from "react";
import { useTranslation } from "react-i18next";
import { Brain } from "lucide-react";
import { Reveal, RevealItem } from "./Reveal";

export const LandingFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Reveal
          stagger={0.08}
          amount={0.1}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8"
        >
          <RevealItem distance={16} className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">MemoPal</span>
            </div>
            <p className="text-xs sm:text-sm">{t("landing.footer.tagline")}</p>
          </RevealItem>

          <RevealItem distance={16}>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              {t("landing.footer.product")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  {t("landing.footer.features")}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  {t("landing.footer.pricing")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t("landing.footer.roadmap")}
                </a>
              </li>
            </ul>
          </RevealItem>

          <RevealItem distance={16}>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              {t("landing.footer.resources")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  {t("landing.footer.blog")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t("landing.footer.guides")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t("landing.footer.support")}
                </a>
              </li>
            </ul>
          </RevealItem>

          <RevealItem distance={16}>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              {t("landing.footer.legal")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="/privacy" className="hover:text-white transition">
                  {t("landing.footer.privacy")}
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition">
                  {t("landing.footer.terms")}
                </a>
              </li>
            </ul>
          </RevealItem>
        </Reveal>

        <div className="border-t border-gray-800 dark:border-gray-700 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
          <p>{t("landing.footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};
