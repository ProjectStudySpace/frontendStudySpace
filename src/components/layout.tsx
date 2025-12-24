import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Brain,
  BookOpen,
  Calendar,
  TrendingUp,
  LogOut,
  Menu,
  X,
  GraduationCap,
  User,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";
import OnboardingTour from "./OnboardingTour";
import { OnboardingProvider, useOnboarding } from "../context/OnboardingContext";

const LayoutContent = () => {
  const { logout, user, getDashboard } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const { startTour, isGuideDisabled, currentStepId, isActive } = useOnboarding();

  // Auto-start tour on first login
  useEffect(() => {
    const onboardingStatus = localStorage.getItem('memopal_onboarding_status');
    if (!onboardingStatus && !isGuideDisabled) {
      // First time user - start the tour after a short delay
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [startTour, isGuideDisabled]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const data = await getDashboard();
      setDashboardData(data);
    };
    fetchDashboard();
  }, []);

  //cerrar menu al hacer click en un enlace
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  //prevenir scroll cuando el menu esta abierto(solo mobile)
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate after logout is complete to ensure state is updated
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      // Still navigate even if there's an error, but clear localStorage as fallback
      localStorage.removeItem("token");
      localStorage.removeItem("userTimezone");
      navigate("/", { replace: true });
    }
  };

  const navLinks = [
    { to: "/topics", icon: BookOpen, label: t("nav.topics"), id: 'nav-topics' },
    {
      to: "/study-sessions",
      icon: GraduationCap,
      label: t("nav.studySessions"),
      id: 'nav-study-sessions',
    },
    { to: "/calendar", icon: Calendar, label: t("nav.calendar"), id: 'nav-calendar' },
    { to: "/progress", icon: TrendingUp, label: t("nav.progress"), id: 'nav-progress' },
  ];

  const userLinks = [
    { to: "/profile", icon: User, label: t("nav.profile"), id: 'nav-profile' },
    { to: "/settings", icon: Settings, label: t("nav.settings"), id: 'nav-settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Mobile */}
      <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              className="p-2 text-gray-600 dark:text-gray-300 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
            <Link to="/topics" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Study Space
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button className="relative p-2 text-gray-600 dark:text-gray-300 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell size={20} />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile - Slide from left */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del menú */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Link
              to="/topics"
              className="flex items-center gap-3"
              onClick={handleLinkClick}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                MemoPal
              </h1>
            </Link>
            <button
              className="p-2 text-gray-600 dark:text-gray-300 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {user?.name 
                    ? `${t("auth.welcomeBackName")}${user.name}! 👋`
                    : t("auth.welcomeBack")
                  }
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                  {user?.email || t("landing.hero.activeStudents")}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isOnboardingActive = isActive && currentStepId === link.id;
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    id={link.id}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 font-medium active:scale-95 ${
                      isOnboardingActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                    onClick={handleLinkClick}
                    title={link.label}
                  >
                    <Icon size={22} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Separador visual */}
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2 mx-4"></div>

              {/* Secciones de usuario */}
              {userLinks.map((link) => {
                const Icon = link.icon;
                const isOnboardingActive = isActive && currentStepId === link.id;
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    id={link.id}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 font-medium active:scale-95 ${
                      isOnboardingActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                    onClick={handleLinkClick}
                    title={link.label}
                  >
                    <Icon size={22} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer del menú con Racha y Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                🔥 {t("stats.currentStreak")}:{" "}
                {dashboardData?.stats?.currentStreak || 0} {t("stats.days")}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t("stats.keepGoing")}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-95"
            >
              <LogOut size={20} />
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop - Static */}
      <div className="hidden lg:block lg:fixed lg:top-0 lg:left-0 lg:bottom-0 lg:w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Link to="/topics" className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={24} className="text-white" />
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 flex flex-col gap-2 overflow-hidden">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isOnboardingActive = isActive && currentStepId === link.id;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  id={link.id}
                  className={`flex items-center justify-center p-3 py-2.5 rounded-lg font-medium transition-colors flex-shrink-0 ${
                    isOnboardingActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                  title={link.label}
                >
                  <Icon size={24} />
                </Link>
              );
            })}

            {/* Separador visual */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 my-1"></div>

            {/* Secciones de usuario */}
            {userLinks.map((link) => {
              const Icon = link.icon;
              const isOnboardingActive = isActive && currentStepId === link.id;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  id={link.id}
                  className={`flex items-center justify-center p-3 py-2.5 rounded-lg font-medium transition-colors flex-shrink-0 ${
                    isOnboardingActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                  title={link.label}
                >
                  <Icon size={24} />
                </Link>
              );
            })}
          </nav>

          {/* Logout button at bottom */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Header Desktop */}
      <header className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-16 right-0 z-20">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 gap-3 flex items-center">
            {user?.name 
              ? `${t("auth.welcomeBackName")}${user.name}! 👋`
              : t("auth.welcomeBack")
            }
          </h2>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button className="relative p-2 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Bell size={24} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="lg:ml-16 lg:pt-20">
        <div className="p-4 lg:p-8">
          {/* Welcome message mobile */}
          <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {user?.name 
                ? `${t("auth.welcomeBackName")}${user.name}! 👋`
                : t("auth.welcomeBack")
              }
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {user?.email || "Estudiante"}
            </p>
          </div>

          {/* Aquí se renderizan las páginas */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// Layout component that wraps content with OnboardingProvider
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <OnboardingProvider>
      <LayoutContent />
      <OnboardingTour />
    </OnboardingProvider>
  );
};

export default Layout;
