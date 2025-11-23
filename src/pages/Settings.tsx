import React, { useState } from "react";
import { Settings as SettingsIcon, Eye, Moon, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../components/toggleSwitch";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  // Estados para los toggles (de momento solo visuales)
  const [showStartGuide, setShowStartGuide] = useState(false);
  const [blockExternalApps, setBlockExternalApps] = useState(false);

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

      {/* Sección: Bloquear aplicaciones externas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900">
            <Shield size={20} className="text-purple-600 dark:text-purple-400" />
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
