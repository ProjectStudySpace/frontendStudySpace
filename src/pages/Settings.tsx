import React, { useState } from "react";
import { Settings as SettingsIcon, Eye, Moon, Shield } from "lucide-react";
import { ToggleSwitch } from "../components/toggleSwitch";

const Settings = () => {
  // Estados para los toggles (de momento solo visuales)
  const [showStartGuide, setShowStartGuide] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [blockExternalApps, setBlockExternalApps] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración</h1>

      {/* Sección: Mostrar guía de inicio */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <Eye size={20} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Mostrar guía de inicio</h2>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={showStartGuide}
            onChange={(checked) => {
              setShowStartGuide(checked);
              // TODO: Implementar funcionalidad más adelante
              console.log("Mostrar guía de inicio:", checked);
            }}
            label="Activar guía de inicio"
            disabled={false}
          />
          <p className="text-sm text-gray-500 ml-4">
            Muestra una guía interactiva al iniciar la aplicación para nuevos usuarios
          </p>
        </div>
      </div>

      {/* Sección: Activar modo oscuro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100">
            <Moon size={20} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Activar modo oscuro</h2>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={darkMode}
            onChange={(checked) => {
              setDarkMode(checked);
              // TODO: Implementar funcionalidad más adelante
              console.log("Modo oscuro:", checked);
            }}
            label="Modo oscuro"
            disabled={false}
          />
          <p className="text-sm text-gray-500 ml-4">
            Cambia la apariencia de la aplicación a un tema oscuro para reducir la fatiga visual
          </p>
        </div>
      </div>

      {/* Sección: Bloquear aplicaciones externas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <Shield size={20} className="text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bloquear aplicaciones externas</h2>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={blockExternalApps}
            onChange={(checked) => {
              setBlockExternalApps(checked);
              // TODO: Implementar funcionalidad más adelante
              console.log("Bloquear aplicaciones externas:", checked);
            }}
            label="Bloquear el uso de otras aplicaciones"
            disabled={false}
          />
          <p className="text-sm text-gray-500 ml-4">
            Bloquea la apertura de otras aplicaciones durante las sesiones de estudio para evitar distracciones
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;