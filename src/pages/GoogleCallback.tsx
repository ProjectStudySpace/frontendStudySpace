import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../utils/axiosConfig";
import { useNotification } from "../context/NotificationContext";
import { useTranslation } from "react-i18next";

/**
 * Componente dedicado para manejar el callback de Google OAuth.
 * Esta ruta debe ser PÚBLICA (accesible sin autenticación).
 *
 * Flujo:
 * 1. Google redirige aquí con ?google_auth=success&token=...
 * 2. Guardamos el token en localStorage
 * 3. Verificamos que funciona llamando /users/profile
 * 4. Redirigimos a /topics o /login según el resultado
 */
const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const processedRef = useRef(false);

  useEffect(() => {
    // Evitar procesamiento doble en StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    const processCallback = async () => {
      const googleAuth = searchParams.get("google_auth");
      const token = searchParams.get("token");
      const error = searchParams.get("error");
      const isNewUser = searchParams.get("new_user") === "true";
      const wasLinked = searchParams.get("linked") === "true";

      // Si hay error, mostrar y redirigir a login
      if (error) {
        setStatus("error");
        showError(
          t("auth.googleAuthError"),
          t(`auth.googleErrors.${error}`) || t("auth.googleAuthError")
        );
        setTimeout(() => navigate("/login", { replace: true }), 2000);
        return;
      }

      // Si no hay token válido, redirigir a login
      if (googleAuth !== "success" || !token) {
        setStatus("error");
        showError(
          t("auth.googleAuthError"),
          t("auth.googleErrors.invalid_params")
        );
        setTimeout(() => navigate("/login", { replace: true }), 2000);
        return;
      }

      try {
        // 1. Guardar token en localStorage
        localStorage.setItem("token", token);

        // 2. Set new user flag for onboarding if this is a new user
        if (isNewUser) {
          localStorage.setItem("memopal_new_user", "true");
        }

        // 3. Verificar que el token funciona obteniendo el perfil
        const { data } = await api.get("/users/profile");

        if (data?.user) {
          // 3. Guardar timezone si existe
          if (data.user.timezone) {
            localStorage.setItem("userTimezone", data.user.timezone);
          }

          setStatus("success");

          // 4. Mostrar mensaje de éxito
          if (isNewUser) {
            showSuccess(t("auth.accountCreated"), t("auth.googleAuthSuccess"));
          } else if (wasLinked) {
            showSuccess(t("auth.accountLinked"), t("auth.googleAuthSuccess"));
          } else {
            showSuccess(t("auth.welcomeBack"), t("auth.googleAuthSuccess"));
          }

          // 5. Redirigir a topics - usar window.location para forzar recarga completa
          // Esto asegura que AuthContext se reinicialice con el token
          window.location.href = "/topics";
        } else {
          throw new Error("No user data received");
        }
      } catch (err) {
        console.error("Error processing Google callback:", err);

        // Limpiar token inválido
        localStorage.removeItem("token");
        localStorage.removeItem("userTimezone");

        setStatus("error");
        showError(
          t("auth.googleAuthError"),
          t("auth.googleErrors.callback_failed")
        );
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    processCallback();
  }, [searchParams, navigate, showSuccess, showError, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {t("auth.processingAuth") || "Procesando autenticación..."}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t("auth.pleaseWait") || "Por favor espera un momento"}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {t("auth.authSuccess") || "¡Autenticación exitosa!"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t("auth.redirecting") || "Redirigiendo..."}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {t("auth.authError") || "Error de autenticación"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t("auth.redirectingToLogin") || "Redirigiendo al login..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
