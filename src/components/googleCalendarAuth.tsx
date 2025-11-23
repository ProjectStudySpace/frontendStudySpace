import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import {
  GoogleCalendarAuthProps,
  GoogleCalendarSyncInfo,
} from "../types/googleCalendar";

const API_BASE = API_URL || "http://localhost:3000/api";

// Configurar instancia de axios
const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const GoogleCalendarAuth: React.FC<GoogleCalendarAuthProps> = ({
  onAuthComplete,
}) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncInfo, setSyncInfo] = useState<GoogleCalendarSyncInfo | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [user]);

  useEffect(() => {
    // Detectar si viene del callback de Google
    const params = new URLSearchParams(window.location.search);
    const googleAuth = params.get("google_auth");
    const synced = params.get("synced");
    const total = params.get("total");
    const message = params.get("message");

    if (googleAuth === "success") {
      setIsAuthenticated(true);

      // Mostrar información de sincronización si existe
      if (synced && total) {
        setSyncInfo({
          synced: parseInt(synced),
          total: parseInt(total),
          message: message ? decodeURIComponent(message) : "",
        });

        // Ocultar mensaje de sincronización después de 10 segundos
        setTimeout(() => {
          setSyncInfo(null);
        }, 10000);
      }

      // Limpiar URL
      window.history.replaceState({}, "", window.location.pathname);
      onAuthComplete?.();
    } else if (googleAuth === "error") {
      alert(t("components.googleCalendarAuth.connectionError"));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [onAuthComplete]);

  const checkAuthStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/google/status");

      if (data) {
        setIsAuthenticated(data.authenticated);
      }
    } catch (error) {
      console.error("Error verificando estado de Google Calendar:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = () => {
    if (!user?.id) {
      console.error("No hay usuario autenticado");
      return;
    }

    // Redirigir al endpoint protegido que inicia OAuth
    const token = localStorage.getItem("token");
    console.log("Token en localStorage:", token ? "SÍ EXISTE" : "NO EXISTE");

    if (!token) {
      alert(t("auth.invalidCredentials"));
      return;
    }
    // Guardar el token en sessionStorage para que persista durante la redirección
    const url = `${API_URL}/auth/google/connect?token=${encodeURIComponent(
      token
    )}`;
    console.log("URL completa:", url);

    window.location.href = url;
  };

  const handleDisconnectGoogle = async () => {
    try {
      setIsLoading(true);

      const { data } = await api.post("/auth/google/disconnect");

      if (data) {
        setIsAuthenticated(false);
        setSyncInfo(null);
        alert(t("profile.disconnectSuccess"));
      }
    } catch (error) {
      console.error("Error desconectando Google Calendar:", error);
      alert(t("profile.disconnectError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            {t("components.googleCalendarAuth.verifyingConnection")}
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-3">
        {/* Mensaje de éxito */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-500 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              {t("components.googleCalendarAuth.connected")}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              {t("components.googleCalendarAuth.autoSyncMessage")}
            </p>
            <button
              onClick={handleDisconnectGoogle}
              className="mt-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 font-medium py-2 px-4 rounded-lg transition-colors text-sm border border-red-300 dark:border-red-700"
            >
              {t("components.googleCalendarAuth.disconnectCalendar")}
            </button>
          </div>
        </div>

        {/* Información de sincronización si existe */}
        {syncInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  {t("components.googleCalendarAuth.syncCompleted")}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {syncInfo.synced} {t("common.of")} {syncInfo.total}{" "}
                  {t("components.googleCalendarAuth.syncMessage")}
                </p>
                {syncInfo.message && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {syncInfo.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            className="w-12 h-12 text-indigo-500 dark:text-indigo-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm2 4h10v2H7v-2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t("components.googleCalendarAuth.connectTitle")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t("components.googleCalendarAuth.connectDescription")}
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-green-500 dark:text-green-400">✓</span>{" "}
              {t("components.googleCalendarAuth.autoSync")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 dark:text-green-400">✓</span>{" "}
              {t("components.googleCalendarAuth.studyReminders")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 dark:text-green-400">✓</span>{" "}
              {t("components.googleCalendarAuth.integratedTimeManagement")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500 dark:text-blue-400">ℹ️</span>{" "}
              {t("components.googleCalendarAuth.pendingSessionsSync")}
            </li>
          </ul>
          <button
            onClick={handleConnectGoogle}
            className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            {t("components.googleCalendarAuth.connectWithGoogle")}
          </button>
        </div>
      </div>
    </div>
  );
};
