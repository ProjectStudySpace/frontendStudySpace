import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { User } from "../types";
import { API_URL } from "../config";

// Configurar instancia de axios
const api = axios.create({
  baseURL: API_URL || "http://localhost:3000/api",
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getDashboard: () => Promise<any>;
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

        const { data } = await api.get(`/users/profile`);
        setUser(data.user);
        // Persistir zona horaria en localStorage si viene del backend
        if (data.user?.userTimezone) {
          localStorage.setItem("userTimezone", data.user.userTimezone);
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        localStorage.removeItem("token");
        setUser(null);
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
      const { data } = await api.post(`/users/login`, {
        email,
        password,
        timezone: userTimezone
      });
      setUser(data.user);
      localStorage.setItem("token", data.token);
      // Persistir zona horaria en localStorage
      if (data.user?.userTimezone) {
        localStorage.setItem("userTimezone", data.user.userTimezone);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await api.post(`/users/register`, {
        name,
        email,
        password,
        timezone: userTimezone
      });

      // Registration successful, but do not auto-login
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const getDashboard = async (): Promise<any> => {
    try {
      const { data } = await api.get(`/users/dashboard`);
      return data.dashboard;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post(`/users/logout`);
    } catch (error) {
      // Ignorar errores del servidor (404, etc.) - el logout local es suficiente
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Endpoint no existe, continuar con logout local
      } else {
        console.error("Error durante logout:", error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
