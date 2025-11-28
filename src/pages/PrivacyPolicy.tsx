import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/topics");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                MemoPal
              </span>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector />
              {!isAuthenticated && (
                <button
                  onClick={handleLogin}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {t("landing.nav.login")}
                </button>
              )}
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                {isAuthenticated
                  ? t("landing.hero.goToDashboard")
                  : t("landing.nav.getStarted")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            {t("common.backToHome")}
          </button>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t("privacy.title")}
          </h1>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
            <p>{t("privacy.intro")}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.collection.title")}
            </h2>
            <p>{t("privacy.collection.content")}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.usage.title")}
            </h2>
            <p>{t("privacy.usage.content")}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.protection.title")}
            </h2>
            <p>{t("privacy.protection.content")}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.cookies.title")}
            </h2>
            <p>{t("privacy.cookies.content")}</p>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500">
                {t("privacy.lastUpdated")}: November 2024
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Brain size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">MemoPal</span>
              </div>
              <p className="text-sm">{t("landing.footer.tagline")}</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {t("landing.footer.product")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/#features" className="hover:text-white transition">
                    {t("landing.footer.features")}
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="hover:text-white transition">
                    {t("landing.footer.pricing")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {t("landing.footer.resources")}
              </h4>
              <ul className="space-y-2 text-sm">
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
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {t("landing.footer.legal")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition text-white font-medium"
                  >
                    {t("landing.footer.privacy")}
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white transition">
                    {t("landing.footer.terms")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-gray-700 pt-8 text-center text-sm">
            <p>{t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
