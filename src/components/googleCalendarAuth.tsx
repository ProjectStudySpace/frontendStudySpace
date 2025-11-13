import React, { useState, useEffect } from "react";
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
      alert(
        "Error al conectar con Google Calendar. Por favor, intenta de nuevo."
      );
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
      alert(
        "No se encontró el token de autenticación. Por favor, inicia sesión nuevamente."
      );
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
        alert("Google Calendar desconectado exitosamente");
      }
    } catch (error) {
      console.error("Error desconectando Google Calendar:", error);
      alert(
        "Error al desconectar Google Calendar. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">
            Verificando conexión con Google Calendar...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-3">
        {/* Mensaje de éxito */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-500"
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
            <h3 className="text-sm font-medium text-green-800 mb-1">
              ✅ Google Calendar conectado
            </h3>
            <p className="text-sm text-green-700">
              Tus sesiones de estudio se sincronizarán automáticamente con tu
              calendario.
            </p>
            <button
              onClick={handleDisconnectGoogle}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm border border-red-300"
            >
              Desconectar Google Calendar
            </button>
          </div>
        </div>

        {/* Información de sincronización si existe */}
        {syncInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-500"
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
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  📅 Sincronización completada
                </h4>
                <p className="text-sm text-blue-700">
                  {syncInfo.synced} de {syncInfo.total} sesiones programadas
                  fueron sincronizadas con tu calendario.
                </p>
                {syncInfo.message && (
                  <p className="text-xs text-blue-600 mt-1">
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            className="w-12 h-12 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm2 4h10v2H7v-2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            📅 Conecta tu Google Calendar
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Sincroniza tus sesiones de estudio programadas directamente en tu
            calendario de Google. Recibirás recordatorios automáticos y podrás
            gestionar tu tiempo de estudio más eficientemente.
          </p>
          <ul className="text-sm text-gray-600 mb-4 space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Sincronización
              automática de sesiones
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Recordatorios de estudio
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Gestión integrada de
              tiempo
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span> Las sesiones pendientes
              se sincronizarán automáticamente
            </li>
          </ul>
          <button
            onClick={handleConnectGoogle}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Conectar con Google
          </button>
        </div>
      </div>
    </div>
  );
};
