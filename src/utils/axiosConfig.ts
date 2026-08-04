import axios, {
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { API_URL } from "../config";
import i18n from "../i18n/config";

export function isHttpSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

export type AuthRequestMeta = {
  authGeneration: number;
  hadCredentials: boolean;
  identityCaptured?: boolean;
};

export type AuthGenerationIdentity = {
  generation: number;
  token: string | null;
};

declare module "axios" {
  export interface AxiosRequestConfig {
    authMeta?: AuthRequestMeta;
    retryCount?: number;
  }

  export interface InternalAxiosRequestConfig {
    authMeta?: AuthRequestMeta;
    retryCount?: number;
  }
}

type AuthExpiryState = {
  currentGeneration: number;
  authenticated: boolean;
  handledGeneration: number | null;
  redirectTimer: ReturnType<typeof setTimeout> | null;
};

let authExpiryState: AuthExpiryState = {
  currentGeneration: 0,
  authenticated: false,
  handledGeneration: null,
  redirectTimer: null,
};

function clearRedirectTimer(): void {
  if (authExpiryState.redirectTimer != null) {
    clearTimeout(authExpiryState.redirectTimer);
    authExpiryState.redirectTimer = null;
  }
}

/** Start a new authenticated generation after accepted credentials are installed. */
export function beginAuthenticatedGeneration(): number {
  clearRedirectTimer();
  authExpiryState.currentGeneration += 1;
  authExpiryState.authenticated = true;
  authExpiryState.handledGeneration = null;
  return authExpiryState.currentGeneration;
}

export function getAuthGenerationIdentity(
  generation = authExpiryState.currentGeneration,
): AuthGenerationIdentity {
  return {
    generation,
    token: localStorage.getItem("token"),
  };
}

/**
 * Check whether an async auth operation still owns the current credentials.
 * A missing token is also accepted for the same generation because the 401
 * coordinator may have already removed the captured credential locally.
 */
export function isAuthGenerationOwner(
  identity: AuthGenerationIdentity,
): boolean {
  if (identity.generation !== authExpiryState.currentGeneration) {
    return false;
  }

  const currentToken = localStorage.getItem("token");
  return currentToken === identity.token || currentToken === null;
}

/** Invalidate the current generation on logout or failed credential validation. */
export function invalidateAuthGeneration(
  identity?: AuthGenerationIdentity,
): boolean {
  if (identity && !isAuthGenerationOwner(identity)) {
    return false;
  }

  clearRedirectTimer();
  authExpiryState.authenticated = false;
  return true;
}

/** Remove credentials only while the async operation still owns them. */
export function clearAuthCredentialsIfOwner(
  identity: AuthGenerationIdentity,
): boolean {
  if (!invalidateAuthGeneration(identity)) {
    return false;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("userTimezone");
  return true;
}

export function getAuthExpiryStateForTests(): Readonly<AuthExpiryState> {
  return {
    currentGeneration: authExpiryState.currentGeneration,
    authenticated: authExpiryState.authenticated,
    handledGeneration: authExpiryState.handledGeneration,
    redirectTimer: authExpiryState.redirectTimer,
  };
}

export function resetAuthExpiryStateForTests(): void {
  clearRedirectTimer();
  authExpiryState = {
    currentGeneration: 0,
    authenticated: false,
    handledGeneration: null,
    redirectTimer: null,
  };
}

function handleSessionExpiredOnce(
  requestGeneration: number,
  hadCredentials: boolean,
): boolean {
  if (!hadCredentials) {
    return false;
  }
  if (!authExpiryState.authenticated) {
    return false;
  }
  if (requestGeneration !== authExpiryState.currentGeneration) {
    return false;
  }
  if (authExpiryState.handledGeneration === requestGeneration) {
    return false;
  }

  authExpiryState.handledGeneration = requestGeneration;

  localStorage.removeItem("token");
  localStorage.removeItem("userTimezone");

  const title = i18n.t("auth.sessionExpired.title");
  const message = i18n.t("auth.sessionExpired.message");
  showErrorGlobal(title, message);

  authExpiryState.redirectTimer = setTimeout(() => {
    authExpiryState.redirectTimer = null;
    window.location.href = "/login";
  }, 4000);

  return true;
}

// Create a cancellation token source for request management
const createCancelToken = () => axios.CancelToken.source();

// Create request queue for throttling
const requestQueue = new Map<string, Promise<any>>();
const pendingRequests = new Set<string>();

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryCondition: (error: AxiosError) => {
    return (
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_INSUFFICIENT_RESOURCES" ||
      error.code === "ECONNABORTED" ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
};

const IDEMPOTENT_METHODS = new Set(["get", "head", "options", "put", "delete"]);

function isIdempotentRequest(config: AxiosRequestConfig): boolean {
  return IDEMPOTENT_METHODS.has((config.method || "get").toLowerCase());
}

// Create axios instance with optimized configuration
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  maxRedirects: 5,
  validateStatus: isHttpSuccess,
});

type RequestConfigWithMeta = InternalAxiosRequestConfig & {
  authMeta?: AuthRequestMeta;
  retryCount?: number;
};

// Request interceptor for token, auth generation stamp, and request management
api.interceptors.request.use(
  (config) => {
    const typed = config as RequestConfigWithMeta;

    // Capture request identity exactly once. A retry keeps the original
    // generation and Authorization header even if a later login has occurred.
    if (typed.authMeta?.identityCaptured !== true) {
      const token = localStorage.getItem("token");
      if (token) {
        typed.headers.Authorization = `Bearer ${token}`;
      }
      typed.authMeta = {
        authGeneration: authExpiryState.currentGeneration,
        hadCredentials: Boolean(token),
        identityCaptured: true,
      };
    }

    // Ensure Content-Type is set for POST/PUT/PATCH requests with data
    if (
      typed.data &&
      (typed.method === "post" ||
        typed.method === "put" ||
        typed.method === "patch")
    ) {
      if (!typed.headers["Content-Type"]) {
        typed.headers["Content-Type"] = "application/json";
      }
    }

    return typed;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for retry logic and error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Retry logic for transient errors
    const config = error.config as AxiosRequestConfig | undefined;
    if (!config) {
      return Promise.reject(error);
    }
    config.retryCount = config.retryCount || 0;

    if (
      RETRY_CONFIG.retryCondition(error) &&
      isIdempotentRequest(config) &&
      config.retryCount < RETRY_CONFIG.maxRetries &&
      !error.response // Only retry response-less failures for idempotent methods
    ) {
      config.retryCount++;

      // Exponential backoff
      const delay =
        RETRY_CONFIG.retryDelay * Math.pow(2, config.retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(
        `Retrying request (${config.retryCount}/${RETRY_CONFIG.maxRetries}):`,
        config.url,
      );
      return api(config);
    }

    return Promise.reject(error);
  },
);

// Utility function to cancel all pending requests
export const cancelAllRequests = () => {
  pendingRequests.clear();
  requestQueue.clear();
};

// Utility function for request deduplication
export const deduplicateRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>,
): Promise<T> => {
  if (requestQueue.has(key)) {
    return requestQueue.get(key)!;
  }

  const promise = requestFn().finally(() => {
    requestQueue.delete(key);
  });

  requestQueue.set(key, promise);
  return promise;
};

// Función para manejar sesión expirada


// Función auxiliar para mostrar errores globalmente sin depender del contexto de React
const showErrorGlobal = (title: string, description: string) => {
  // Buscar el container de notificaciones existente o crear uno nuevo
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className = "fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full";
    document.body.appendChild(container);
  }

  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className =
    "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 animate-in slide-in-from-right-full duration-300";

  notification.innerHTML = `
    <svg class="w-5 h-5 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-medium text-red-800 dark:text-red-200">${title}</h4>
      <p class="text-sm mt-1 text-red-700 dark:text-red-300 opacity-90">${description}</p>
    </div>
    <button class="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-red-500 dark:text-red-400 transition-colors" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  container.appendChild(notification);

  // Auto-remover después de 6 segundos (errores duran más tiempo)
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 6000);
};

// Interceptor para manejar respuestas y errores globalmente
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
        const config = error.config as RequestConfigWithMeta | undefined;
        const url = config?.url || "";
        const isPasswordChange =
          url.includes("/users/update-password") || url.includes("update-password");
        const isAccountDelete = url.includes("/users/delete");
        const isLogin = url.includes("/users/login");
        const authMeta = config?.authMeta;
        const responseData = error.response?.data;
        const responseMessage =
          responseData && typeof responseData === "object"
            ? String(
                (responseData as { error?: unknown; message?: unknown }).error ??
                  (responseData as { message?: unknown }).message ??
                  "",
              ).toLowerCase()
            : "";
        const isCredentialConfirmationFailure =
          error.response?.status === 401 &&
          ((isPasswordChange && responseMessage.includes("current password is incorrect")) ||
            (isAccountDelete && responseMessage.includes("invalid password")));

        // Login and wrong-confirmation 401s belong to their local forms. This
        // exemption must run before global session-expiry side effects.
        if (error.response?.status === 401 && (isLogin || isCredentialConfirmationFailure)) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401) {
          handleSessionExpiredOnce(
            authMeta?.authGeneration ?? -1,
            authMeta?.hadCredentials === true,
          );
          return Promise.reject(error);
        }

        // Solo manejar errores de red o servidor, no errores de validación del cliente
    if (error.response && !isPasswordChange && !isLogin) {
      const status = error.response.status;
      const message =
        error.response.data && typeof error.response.data === "object"
          ? (error.response.data as any).message
          : error.message;

      // Mostrar notificación de error según el código de estado
      switch (status) {
        case 400:
          if (
            message?.includes("validation") ||
            message?.includes("required")
          ) {
            showErrorGlobal(
              "Datos inválidos",
              "Por favor, revisa los datos ingresados",
            );
          } else {
            showErrorGlobal(
              "Solicitud inválida",
              "No se pudo procesar la solicitud",
            );
          }
          break;

        case 403:
          showErrorGlobal(
            "Acceso denegado",
            "No tienes permisos para realizar esta acción",
          );
          break;
        case 404:
          showErrorGlobal("No encontrado", "El recurso solicitado no existe");
          break;
        case 500:
          showErrorGlobal(
            "Error del servidor",
            "Hubo un problema en el servidor. Inténtalo más tarde",
          );
          break;
        default:
          if (status >= 400 && status < 500) {
            showErrorGlobal(
              "Error del cliente",
              "No se pudo completar la solicitud",
            );
          } else if (status >= 500) {
            showErrorGlobal(
              "Error del servidor",
              "Hubo un problema en el servidor",
            );
          } else {
            showErrorGlobal(
              "Error de conexión",
              message || "No se pudo conectar con el servidor",
            );
          }
      }
    } else if (error.request && !isPasswordChange && !isLogin) {
      // Error de red
      showErrorGlobal(
        "Error de conexión",
        "No se pudo conectar con el servidor. Verifica tu conexión a internet",
      );
    } else if (!error.request && !isPasswordChange && !isLogin) {
      // Error en la configuración de la solicitud
      console.error("Error de configuración:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
