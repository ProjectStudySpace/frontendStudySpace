import React, { useState } from "react";
import { Settings as SettingsIcon, Eye, Moon, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../components/toggleSwitch";

const Settings = () => {
  const { t } = useTranslation();
  // Estados para los toggles (de momento solo visuales)
  const [showStartGuide, setShowStartGuide] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [blockExternalApps, setBlockExternalApps] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t("settings.title")}
      </h1>

      {/* Sección: Mostrar guía de inicio */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <Eye size={20} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
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
          <p className="text-sm text-gray-500 ml-4">
            {t("settings.startGuideDescription")}
          </p>
        </div>
      </div>

      {/* Sección: Activar modo oscuro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100">
            <Moon size={20} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("settings.darkMode")}
          </h2>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={darkMode}
            onChange={(checked) => {
              setDarkMode(checked);
              // TODO: Implementar funcionalidad más adelante
              console.log("Modo oscuro:", checked);
            }}
            label={t("settings.darkModeLabel")}
            disabled={false}
          />
          <p className="text-sm text-gray-500 ml-4">
            {t("settings.darkModeDescription")}
          </p>
        </div>
      </div>

      {/* Sección: Bloquear aplicaciones externas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <Shield size={20} className="text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
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
          <p className="text-sm text-gray-500 ml-4">
            {t("settings.blockAppsDescription")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
