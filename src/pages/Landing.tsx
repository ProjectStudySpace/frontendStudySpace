import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Calendar,
  TrendingUp,
  Zap,
  Check,
  ArrowRight,
  Star,
  Users,
  BookOpen,
  Clock,
  Sparkles,
  Target,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const Landing: React.FC = () => {
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Desktop layout - Una sola fila */}
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
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t("landing.nav.features")}
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t("landing.nav.howItWorks")}
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t("landing.nav.pricing")}
              </a>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector />
              {!isAuthenticated ? (
                <button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 whitespace-nowrap"
                >
                  {t("landing.nav.login")}
                </button>
              ) : (
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 whitespace-nowrap"
                >
                  {t("landing.hero.goToDashboard")}
                </button>
              )}
            </div>
          </div>

          {/* Mobile/Tablet layout - Dos filas */}
          <div className="lg:hidden">
            {/* Primera fila: Logo y botones */}
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
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
                  >
                    {t("landing.nav.login")}
                  </button>
                ) : (
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
                  >
                    Dashboard
                  </button>
                )}
              </div>
            </div>

            {/* Segunda fila: Enlaces de navegación */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 py-2 sm:py-3 border-t border-gray-200/50">
              <a
                href="#features"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t("landing.nav.features")}
              </a>
              <a
                href="#how-it-works"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t("landing.nav.howItWorks")}
              </a>
              <a
                href="#pricing"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t("landing.nav.pricing")}
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left column - Text content */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-50 border border-indigo-100">
                <Sparkles size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium text-indigo-600">
                  {t("landing.hero.badge")}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t("landing.hero.title")}{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  {t("landing.hero.titleHighlight")}
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                {t("landing.hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {t("landing.hero.cta")}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5"
                  />
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all"
                >
                  {t("landing.hero.ctaSecondary")}
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 sm:gap-8 pt-4 flex-wrap">
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
              </div>
            </div>

            {/* Right column - Visual */}
            <div className="relative mt-8 lg:mt-0">
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 mb-3 sm:mb-4">
              <Sparkles size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                {t("landing.features.badge")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              {t("landing.features.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: Brain,
                title: t("landing.features.spacedRepetition.title"),
                description: t("landing.features.spacedRepetition.description"),
                color: "from-indigo-500 to-purple-600",
              },
              {
                icon: Calendar,
                title: t("landing.features.calendarIntegration.title"),
                description: t(
                  "landing.features.calendarIntegration.description"
                ),
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: TrendingUp,
                title: t("landing.features.progressTracking.title"),
                description: t("landing.features.progressTracking.description"),
                color: "from-green-500 to-emerald-600",
              },
              {
                icon: Zap,
                title: t("landing.features.streakSystem.title"),
                description: t("landing.features.streakSystem.description"),
                color: "from-orange-500 to-red-600",
              },
              {
                icon: BookOpen,
                title: t("landing.features.topicOrganization.title"),
                description: t(
                  "landing.features.topicOrganization.description"
                ),
                color: "from-purple-500 to-pink-600",
              },
              {
                icon: Target,
                title: t("landing.features.selfAssessment.title"),
                description: t("landing.features.selfAssessment.description"),
                color: "from-yellow-500 to-orange-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={24} className="text-white sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "1",
                title: t("landing.howItWorks.step1.title"),
                description: t("landing.howItWorks.step1.description"),
                icon: BookOpen,
              },
              {
                step: "2",
                title: t("landing.howItWorks.step2.title"),
                description: t("landing.howItWorks.step2.description"),
                icon: Calendar,
              },
              {
                step: "3",
                title: t("landing.howItWorks.step3.title"),
                description: t("landing.howItWorks.step3.description"),
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white shadow-md flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <item.icon size={24} className="text-indigo-600 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 px-2">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight size={32} className="text-indigo-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {t("landing.pricing.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: t("landing.pricing.free.name"),
                price: t("landing.pricing.free.price"),
                description: t("landing.pricing.free.description"),
                features: [
                  t("landing.pricing.free.features.cards"),
                  t("landing.pricing.free.features.topics"),
                  t("landing.pricing.free.features.basicSpaced"),
                  t("landing.pricing.free.features.mobileAccess"),
                  t("landing.pricing.free.features.basicStats"),
                ],
                cta: t("landing.pricing.free.cta"),
                highlighted: false,
              },
              {
                name: t("landing.pricing.pro.name"),
                price: t("landing.pricing.pro.price"),
                description: t("landing.pricing.pro.description"),
                features: [
                  t("landing.pricing.pro.features.unlimitedCards"),
                  t("landing.pricing.pro.features.unlimitedTopics"),
                  t("landing.pricing.pro.features.advancedSpaced"),
                  t("landing.pricing.pro.features.calendarIntegration"),
                  t("landing.pricing.pro.features.advancedStats"),
                  t("landing.pricing.pro.features.prioritySupport"),
                  t("landing.pricing.pro.features.noAds"),
                ],
                cta: t("landing.pricing.pro.cta"),
                highlighted: true,
              },
              {
                name: t("landing.pricing.team.name"),
                price: t("landing.pricing.team.price"),
                description: t("landing.pricing.team.description"),
                features: [
                  t("landing.pricing.team.features.allPro"),
                  t("landing.pricing.team.features.members"),
                  t("landing.pricing.team.features.sharedCards"),
                  t("landing.pricing.team.features.collaborativeBoards"),
                  t("landing.pricing.team.features.teamManagement"),
                  t("landing.pricing.team.features.groupAnalytics"),
                ],
                cta: t("landing.pricing.team.cta"),
                highlighted: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl sm:scale-105"
                    : "bg-white border-2 border-gray-200"
                } ${index === 1 ? "sm:col-span-2 md:col-span-1" : ""}`}
              >
                <div className="text-center mb-4 sm:mb-6">
                  <h3
                    className={`text-xl sm:text-2xl font-bold mb-2 ${
                      plan.highlighted ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                      plan.highlighted ? "text-indigo-100" : "text-gray-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-3xl sm:text-4xl md:text-5xl font-bold ${
                        plan.highlighted ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm sm:text-base ${
                        plan.highlighted ? "text-indigo-100" : "text-gray-600"
                      }`}
                    >
                      {t("landing.pricing.free.perMonth")}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "bg-white/20" : "bg-green-100"
                        }`}
                      >
                        <Check
                          size={12}
                          className={`sm:w-3.5 sm:h-3.5 ${
                            plan.highlighted ? "text-white" : "text-green-600"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs sm:text-sm md:text-base ${
                          plan.highlighted ? "text-indigo-50" : "text-gray-700"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className={`w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            {t("landing.cta.title")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-6 sm:mb-8 px-4">
            {t("landing.cta.subtitle")}
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
          >
            {t("landing.cta.button")}
            <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Brain size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white">MemoPal</span>
              </div>
              <p className="text-xs sm:text-sm">{t("landing.footer.tagline")}</p>
            </div>

            <div>
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
            </div>

            <div>
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
            </div>

            <div>
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
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-gray-700 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>{t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-delayed {
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
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
};

export default Landing;
