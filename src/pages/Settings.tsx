import { useState, useEffect } from "react";
import { Settings as Eye, Moon, Shield, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../components/toggleSwitch";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../config";

const Settings = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  // Estados para los toggles (de momento solo visuales)
  const [showStartGuide, setShowStartGuide] = useState(false);
  const [blockExternalApps, setBlockExternalApps] = useState(false);

  // Google Calendar integration state
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState<
    boolean | null
  >(null);
  const [isGoogleCalendarLoading, setIsGoogleCalendarLoading] = useState(true);

  // Configure axios instance for API calls
  const API_BASE = API_URL || "http://localhost:3000/api";
  const api = axios.create({
    baseURL: API_BASE,
  });

  // Add auth token interceptor
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Check Google Calendar authentication status on component mount
  useEffect(() => {
    checkGoogleCalendarStatus();
  }, [user]);

  // Check Google Calendar connection status
  const checkGoogleCalendarStatus = async () => {
    if (!user) {
      setIsGoogleCalendarLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/google/status");
      if (data) {
        setIsGoogleCalendarConnected(data.authenticated);
      }
    } catch (error) {
      console.error("Error verificando estado de Google Calendar:", error);
      setIsGoogleCalendarConnected(false);
    } finally {
      setIsGoogleCalendarLoading(false);
    }
  };

  // Handle Google Calendar toggle
  const handleGoogleCalendarToggle = async (checked: boolean) => {
    if (!user?.id) {
      console.error("No hay usuario autenticado");
      return;
    }

    setIsGoogleCalendarLoading(true);

    try {
      if (checked) {
        // Connect to Google Calendar - redirect to OAuth
        const token = localStorage.getItem("token");
        if (!token) {
          alert(t("auth.invalidCredentials"));
          setIsGoogleCalendarLoading(false);
          return;
        }

        const url = `${API_URL}/auth/google/connect?token=${encodeURIComponent(
          token
        )}`;
        window.location.href = url;
      } else {
        // Disconnect from Google Calendar - API call
        const { data } = await api.post("/auth/google/disconnect");
        if (data) {
          setIsGoogleCalendarConnected(false);
          alert(t("settings.googleCalendarDisconnected"));
        }
      }
    } catch (error) {
      console.error("Error con Google Calendar:", error);
      alert(t("settings.googleCalendarError"));
      // Revert the toggle on error
      setIsGoogleCalendarConnected(!checked);
    } finally {
      setIsGoogleCalendarLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        {t("settings.title")}
      </h1>

      {/* Sección: Mostrar guía de inicio */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900">
            <Eye size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("settings.startGuide")}
          </h2>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={showStartGuide}
            onChange={(checked) => {
              setShowStartGuide(checked);
              // TODO: Implementar funcionalidad más adelante
              console.log("Mostrar guía de inicio:", checked);
            }}
            label={t("settings.startGuideLabel")}
            disabled={false}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">
            {t("settings.startGuideDescription")}
          </p>
        </div>
      </div>

      {/* Sección: Activar modo oscuro */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900">
            <Moon size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("settings.darkMode")}
          </h2>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={isDarkMode}
            onChange={() => {
              toggleDarkMode();
              console.log("Modo oscuro:", !isDarkMode);
            }}
            label={t("settings.darkModeLabel")}
            disabled={false}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">
            {t("settings.darkModeDescription")}
          </p>
        </div>
      </div>

      {/* Sección: Google Calendar Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("settings.googleCalendar")}
          </h2>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={isGoogleCalendarConnected === true}
            onChange={handleGoogleCalendarToggle}
            label={t("settings.googleCalendarLabel")}
            disabled={
              isGoogleCalendarLoading || isGoogleCalendarConnected === null
            }
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">
            {t("settings.googleCalendarDescription")}
          </p>

          {/* Status indicator */}
          {isGoogleCalendarLoading ? (
            <div className="ml-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>
                {t("components.googleCalendarAuth.verifyingConnection")}
              </span>
            </div>
          ) : isGoogleCalendarConnected ? (
            <div className="ml-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t("components.googleCalendarAuth.connected")}</span>
            </div>
          ) : (
            <div className="ml-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>{t("components.googleCalendarAuth.connectTitle")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sección: Bloquear aplicaciones externas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900">
            <Shield
              size={20}
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("settings.blockApps")}
          </h2>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={blockExternalApps}
            onChange={(checked) => {
              setBlockExternalApps(checked);
              // TODO: Implementar funcionalidad más adelante
              console.log("Bloquear aplicaciones externas:", checked);
            }}
            label={t("settings.blockAppsLabel")}
            disabled={false}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">
            {t("settings.blockAppsDescription")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
