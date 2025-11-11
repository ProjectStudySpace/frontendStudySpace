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
import { GoogleCalendarAuth } from "./googleCalendarAuth";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const Layout = () => {
  const { logout, user, getDashboard } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any | null>(null);

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
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/topics", icon: BookOpen, label: "Mis temas" },
    { to: "/study-sessions", icon: GraduationCap, label: "Sesiones de repaso" },
    { to: "/calendar", icon: Calendar, label: "Calendario" },
    { to: "/progress", icon: TrendingUp, label: "Progreso" },
  ];

  const userLinks = [
    { to: "/profile", icon: User, label: "Perfil" },
    { to: "/settings", icon: Settings, label: "Configuración" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="lg:hidden bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              className="p-2 text-gray-600 rounded-xl transition-colors hover:bg-gray-100 active:scale-95"
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
          <button className="relative p-2 text-gray-600 rounded-xl transition-colors hover:bg-gray-100">
            <Bell size={20} />
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </button>
        </div>
      </header>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile - Slide from left */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del menú */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link
              to="/topics"
              className="flex items-center gap-3"
              onClick={handleLinkClick}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Study Space
              </h1>
            </Link>
            <button
              className="p-2 text-gray-600 rounded-xl transition-colors hover:bg-gray-100 active:scale-95"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.email?.[0]?.toUpperCase() || "E"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">¡Hola! 👋</p>
                <p className="text-sm text-gray-600 truncate max-w-[200px]">
                  {user?.email || "Estudiante"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-gray-700 font-medium hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                    onClick={handleLinkClick}
                    title={link.label}
                  >
                    <Icon size={22} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              {/* Separador visual */}
              <div className="h-px bg-gray-200 my-2 mx-4"></div>
              
              {/* Secciones de usuario */}
              {userLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-gray-700 font-medium hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
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
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                🔥 Racha de {dashboardData?.stats?.currentStreak || 0} días
              </p>
              <p className="text-xs text-gray-600">
                ¡Sigue así para mantener tu progreso!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors active:scale-95"
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop - Static */}
      <div className="hidden lg:block lg:fixed lg:top-0 lg:left-0 lg:bottom-0 lg:w-16 bg-white border-r border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-center p-4 border-b border-gray-200 flex-shrink-0">
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
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="flex items-center justify-center p-3 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 hover:text-indigo-600 transition-colors flex-shrink-0"
                  title={link.label}
                >
                  <Icon size={24} />
                </Link>
              );
            })}
            
            {/* Separador visual */}
            <div className="h-px bg-gray-200 mx-2 my-1"></div>
            
            {/* Secciones de usuario */}
            {userLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="flex items-center justify-center p-3 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 hover:text-indigo-600 transition-colors flex-shrink-0"
                  title={link.label}
                >
                  <Icon size={24} />
                </Link>
              );
            })}
          </nav>

          {/* Logout button at bottom */}
          <div className="p-2 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 py-2.5 rounded-lg text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Header Desktop */}
      <header className="hidden lg:block bg-white shadow-sm fixed top-0 left-16 right-0 z-20">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 gap-3 flex items-center">
            ¡Bienvenido de vuelta! 👋
          </h2>
          <button className="relative p-2 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell size={24} />
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="lg:ml-16 lg:pt-20">
        <div className="p-4 lg:p-8">
          {/* Welcome message mobile */}
          <div className="lg:hidden mb-6 bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-900">
              ¡Bienvenido de vuelta! 👋
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {user?.email || "Estudiante"}
            </p>
          </div>

          {/* Google Calendar Auth - Aparece en todas las páginas */}
          <div className="mb-6">
            <GoogleCalendarAuth
              onAuthComplete={() => {
                console.log("Google Calendar conectado exitosamente");
              }}
            />
          </div>

          {/* Aquí se renderizan las páginas */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;