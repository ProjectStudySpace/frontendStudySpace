import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";
import { api } from "../utils/axiosConfig";
import { User } from "../types";
import { useNotification } from "./NotificationContext";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
}

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
  const isAuthenticated = !!user;
  const { showSuccess, showError } = useNotification();

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsLoading(false);
          setUser(null);
          return;
        }

        const { data } = await api.get("/users/profile");

        if (data) {
          setUser(data.user);
          // Persistir zona horaria en localStorage si viene del backend
          if (data.user?.userTimezone) {
            localStorage.setItem("userTimezone", data.user.userTimezone);
          }
        } else {
          // Token inválido o expirado
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error: any) {
        // Handle network errors gracefully during session check
        if (error.code === 'ERR_INSUFFICIENT_RESOURCES' || error.code === 'ERR_NETWORK') {
          console.warn('Network error during session check, user will need to login again');
          localStorage.removeItem("token");
          setUser(null);
        } else if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("userTimezone");
          setUser(null);
        } else {
          console.error("Error verificando sesión:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  //funcion para obtener token

  const getToken = (): string => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No se encontró token. Inicia sesión.");
    return token;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("Attempting login with email:", email);
      
      const { data, status } = await api.post("/users/login", {
        email,
        password,
        timezone: userTimezone,
      });

      console.log("Login response:", { data, status });

      if (!data) {
        showError("Error de inicio de sesión", "Credenciales inválidas");
        return false;
      }

      setUser(data.user);
      localStorage.setItem("token", data.token);
      // Persistir zona horaria en localStorage
      if (data.user?.userTimezone) {
        localStorage.setItem("userTimezone", data.user.userTimezone);
      }

      showSuccess("¡Bienvenido!", "Has iniciado sesión correctamente");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error response:", error.response);

      // Handle 401 error specifically
      if (error.response?.status === 401) {
        const errorMessage = error.response.data?.message || "Credenciales inválidas";
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
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
      if (error.code === 'ERR_INSUFFICIENT_RESOURCES' || error.code === 'ERR_NETWORK') {
        console.warn('Network resource error, will retry automatically');
        // Don't show error to user as retry logic will handle it
        return null;
      } else if (error.code === 'ECONNABORTED') {
        console.warn('Request timeout for dashboard');
        return null;
      } else {
        console.error('Dashboard error:', error);
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
          setUser(data.user);
          localStorage.setItem("token", data.token);
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
    try {
      await api.get("/users/logout");
      showSuccess("Sesión cerrada", "Has cerrado sesión correctamente");
    } catch (error) {
      // Ignorar errores del servidor (404, etc.) - el logout local es suficiente
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Endpoint no existe, continuar con logout local
        showSuccess("Sesión cerrada", "Has cerrado sesión correctamente");
      } else {
        console.error("Error durante logout:", error);
        showSuccess("Sesión cerrada", "Has cerrado sesión correctamente");
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userTimezone");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        getDashboard,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
