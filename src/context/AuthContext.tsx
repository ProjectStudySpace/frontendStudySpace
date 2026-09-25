import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";
import { getUserTimezone } from "../utils/dateUtils";
import {
  api,
  beginAuthenticatedGeneration,
  clearAuthCredentialsIfOwner,
  getAuthGenerationIdentity,
  invalidateAuthGeneration,
  isAuthGenerationOwner,
} from "../utils/axiosConfig";
import { User } from "../types";
import { useNotification } from "./NotificationContext";
import { useTranslation } from "react-i18next";
import { API_URL } from "../config";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthDegraded: boolean;
  retrySession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    language?: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  getDashboard: () => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  loginWithGoogle: () => void;
  registerWithGoogle: () => void;
  handleGoogleCallback: () => Promise<void>;
}

// Helper function to get Google error message
const getGoogleErrorMessage = (
  errorCode: string,
  t: (key: string) => string
): string => {
  const errorMessages: Record<string, string> = {
    init_failed: t("auth.googleErrors.init_failed"),
    google_denied: t("auth.googleErrors.google_denied"),
    invalid_params: t("auth.googleErrors.invalid_params"),
    invalid_state: t("auth.googleErrors.invalid_state"),
    callback_failed: t("auth.googleErrors.callback_failed"),
  };
  return errorMessages[errorCode] || t("auth.googleAuthError");
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

//props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDegraded, setIsAuthDegraded] = useState(false);
  const isAuthenticated = !!user;
  const { showSuccess, showError } = useNotification();
  const { t, i18n } = useTranslation();

  const checkSession = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setIsAuthDegraded(false);

    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      setUser(null);
      return;
    }

    const generation = beginAuthenticatedGeneration();
    const identity = getAuthGenerationIdentity(generation);

    try {
      const { data } = await api.get("/users/profile");

      if (data?.user && isAuthGenerationOwner(identity)) {
        setUser(data.user);
        setIsAuthDegraded(false);
        // Persistir zona horaria en localStorage si viene del backend
        if (data.user?.timezone) {
          localStorage.setItem("userTimezone", data.user.timezone);
        }
      } else if (!data?.user && isAuthGenerationOwner(identity)) {
        // Token inválido o expirado
        if (clearAuthCredentialsIfOwner(identity)) {
          setUser(null);
        }
        setIsAuthDegraded(false);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // A 401 is authoritative: the token is no longer valid.
        if (clearAuthCredentialsIfOwner(identity)) {
          setUser(null);
          setIsAuthDegraded(false);
        }
      } else if (isAuthGenerationOwner(identity)) {
        // Network, timeout, and server failures are ambiguous during bootstrap.
        // Keep the credential so the caller can retry without logging in again.
        console.warn("Session bootstrap degraded; credentials are preserved", error.code);
        setIsAuthDegraded(true);
      }
    } finally {
      if (isAuthGenerationOwner(identity)) {
        setIsLoading(false);
      }
    }
  }, []);

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const retrySession = useCallback(async (): Promise<void> => {
    await checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const { data } = await api.post("/users/login", {
        email,
        password,
        timezone: userTimezone,
      });

      // Check if the response indicates successful authentication
      if (!data || !data.user || !data.token) {
        showError("Error de inicio de sesión", "Credenciales inválidas");
        return false;
      }

      localStorage.setItem("token", data.token);
      beginAuthenticatedGeneration();
      setIsAuthDegraded(false);
      setUser(data.user);
      // Persistir zona horaria en localStorage
      if (data.user?.userTimezone) {
        localStorage.setItem("userTimezone", data.user.userTimezone);
      }

      showSuccess("¡Bienvenido!", "Has iniciado sesión correctamente");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error response:", error.response);

      // Handle 401 error specifically for invalid credentials
      if (error.response?.status === 401) {
        const errorMessage =
          error.response.data?.message || "Credenciales inválidas";
        showError("Error de inicio de sesión", errorMessage);
        return false;
      }

      // Handle 403 error for unverified email
      if (error.response?.status === 403) {
        const errorMessage = error.response.data?.error || "";
        if (
          errorMessage.includes("not verified") ||
          errorMessage.includes("verificado")
        ) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }
      }

      // Handle other network/server errors
      showError(
        "Error de inicio de sesión",
        "No se pudo conectar con el servidor"
      );
      return false;
    }
  };

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      language?: string
    ): Promise<any> => {
      try {
        const userTimezone = getUserTimezone();

        const { data } = await api.post("/users/register", {
          name,
          email,
          password,
          timezone: userTimezone,
          language: language || "en",
        });

        if (!data) {
          showError("Error al crear cuenta", "No se pudo procesar el registro");
          return null;
        }

        // Registration successful, return full response (no token anymore)
        showSuccess(
          "¡Cuenta creada!",
          "Revisa tu correo para verificar tu cuenta."
        );
        return data;
      } catch (error) {
        console.error(error);
        showError(
          "Error al crear cuenta",
          "No se pudo conectar con el servidor"
        );
        return null;
      }
    },
    [showError, showSuccess]
  );

  const getDashboard = async (): Promise<any> => {
    try {
      const { data } = await api.get("/users/dashboard");

      if (!data) return null;

      return data.dashboard;
    } catch (error: any) {
      // Enhanced error handling for network issues
      if (
        error.code === "ERR_INSUFFICIENT_RESOURCES" ||
        error.code === "ERR_NETWORK"
      ) {
        console.warn("Network resource error, will retry automatically");
        // Don't show error to user as retry logic will handle it
        return null;
      } else if (error.code === "ECONNABORTED") {
        console.warn("Request timeout for dashboard");
        return null;
      } else {
        console.error("Dashboard error:", error);
      }
      return null;
    }
  };

  const verifyEmail = useCallback(
    async (token: string): Promise<any> => {
      try {
        const { data } = await api.get(`/users/verify-email?token=${token}`);

        if (data) {
          // Save token and set user
          localStorage.setItem("token", data.token);
          beginAuthenticatedGeneration();
          setIsAuthDegraded(false);
          setUser(data.user);
          if (data.user?.userTimezone) {
            localStorage.setItem("userTimezone", data.user.userTimezone);
          }
          showSuccess(
            "¡Correo verificado!",
            "Tu cuenta ha sido activada correctamente."
          );
          return data;
        }
        return null;
      } catch (error: any) {
        console.error(error);
        const errorMessage =
          error.response?.data?.error || "Error al verificar el correo";
        throw new Error(errorMessage);
      }
    },
    [showSuccess]
  );

  const resendVerification = useCallback(
    async (email: string): Promise<any> => {
      try {
        const { data } = await api.post("/users/resend-verification", {
          email,
        });

        if (data) {
          showSuccess(
            "Email enviado",
            "Revisa tu bandeja de entrada para el email de verificación."
          );
          return data;
        }
        return null;
      } catch (error: any) {
        console.error(error);
        const errorMessage =
          error.response?.data?.error || "Error al reenviar el email";
        throw new Error(errorMessage);
      }
    },
    [showSuccess]
  );

  const logout = async (): Promise<void> => {
    const logoutIdentity = getAuthGenerationIdentity();
    // Stop expiry ownership before the request, but leave the captured token in
    // localStorage so the logout endpoint receives its intended credential.
    invalidateAuthGeneration(logoutIdentity);

    try {
      await api.get("/users/logout");
      if (isAuthGenerationOwner(logoutIdentity)) {
        showSuccess("Sesión cerrada", "Has cerrado sesión correctamente");
      }
    } catch (error) {
      // Ignorar errores del servidor (404, etc.) - el logout local es suficiente
      if (isAuthGenerationOwner(logoutIdentity)) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Endpoint no existe, continuar con logout local
          showSuccess("Sesión cerrada", "Has cerrado sesión correctamente");
        } else {
          console.error("Error durante logout:", error);
          showSuccess("Sesión cerrada", "Has cerrado sesión correctamente");
        }
      }
    } finally {
      if (clearAuthCredentialsIfOwner(logoutIdentity)) {
        setIsAuthDegraded(false);
        setUser(null);
      }
    }
  };

  // Google OAuth functions
  const loginWithGoogle = useCallback(() => {
    const language = i18n.language || "en";
    const timezone = getUserTimezone();

    const params = new URLSearchParams({
      language,
      timezone,
    });

    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google/login?${params.toString()}`;
  }, [i18n.language]);

  const registerWithGoogle = useCallback(() => {
    // Same as loginWithGoogle - backend handles both cases
    loginWithGoogle();
  }, [loginWithGoogle]);

  const handleGoogleCallback = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuth = urlParams.get("google_auth");
    const isNewUser = urlParams.get("new_user") === "true";
    const wasLinked = urlParams.get("linked") === "true";
    const error = urlParams.get("error");
    const token = urlParams.get("token");

    // Only a sign-in token or a sign-in error belongs to this handler; the
    // calendar connection outcome on /topics is read by its own consumer.
    if (!error && !(googleAuth === "success" && token)) {
      return;
    }

    //limpiar parametros de la url
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error) {
      showError(t("auth.googleAuthError"), getGoogleErrorMessage(error, t));
      return;
    }

    if (googleAuth === "success" && token) {
      localStorage.setItem("token", token);
      const generation = beginAuthenticatedGeneration();
      setIsAuthDegraded(false);
      const identity = getAuthGenerationIdentity(generation);
      try {
        const { data } = await api.get("/users/profile");
        if (!isAuthGenerationOwner(identity)) {
          return;
        }

        if (data?.user) {
          setUser(data.user);
          if (data.user?.timezone) {
            localStorage.setItem("userTimezone", data.user.timezone);
          }

          if (isNewUser) {
            showSuccess(t("auth.accountCreated"), t("auth.googleAuthSuccess"));
          } else if (wasLinked) {
            showSuccess(t("auth.accountLinked"), t("auth.googleAuthSuccess"));
          } else {
            showSuccess(t("auth.welcomeBack"), t("auth.googleAuthSuccess"));
          }
        } else if (clearAuthCredentialsIfOwner(identity)) {
          showError(
            t("auth.googleAuthError"),
            t("auth.googleErrors.callback_failed")
          );
        }
      } catch (err) {
        console.error("Error fetching user profile after Google auth:", err);
        if (clearAuthCredentialsIfOwner(identity)) {
          showError(
            t("auth.googleAuthError"),
            t("auth.googleErrors.callback_failed")
          );
        }
      }
    }
  }, [showSuccess, showError, t]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAuthDegraded,
        retrySession,
        login,
        register,
        logout,
        getDashboard,
        verifyEmail,
        resendVerification,
        loginWithGoogle,
        registerWithGoogle,
        handleGoogleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
