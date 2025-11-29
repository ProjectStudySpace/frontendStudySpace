import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { API_URL } from '../config';

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
      error.code === 'ERR_NETWORK' ||
      error.code === 'ERR_INSUFFICIENT_RESOURCES' ||
      error.code === 'ECONNABORTED' ||
      (error.response?.status && error.response.status >= 500)
    );
  }
};

// Create axios instance with optimized configuration
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  maxRedirects: 5,
  validateStatus: (status) => status < 500, // Don't treat 5xx as errors for retry logic
});

// Request interceptor for token and request management
api.interceptors.request.use(
  (config) => {
    // Add cancellation token
    config.cancelToken = createCancelToken().token;
    
    // Add auth token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Request deduplication
    const requestKey = `${config.method?.toUpperCase()}-${config.url}-${JSON.stringify(config.params)}`;
    if (pendingRequests.has(requestKey)) {
      throw new axios.Cancel('Duplicate request prevented');
    }
    
    pendingRequests.add(requestKey);
    (config as any).requestKey = requestKey;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for cleanup and error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Clean up request tracking
    const requestKey = (response.config as any).requestKey;
    if (requestKey) {
      pendingRequests.delete(requestKey);
      requestQueue.delete(requestKey);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Clean up request tracking
    const requestKey = (error.config as any)?.requestKey;
    if (requestKey) {
      pendingRequests.delete(requestKey);
      requestQueue.delete(requestKey);
    }
    
    // Handle cancellation gracefully
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    // Retry logic for transient errors
    const config = error.config as AxiosRequestConfig & { retryCount?: number };
    config.retryCount = config.retryCount || 0;
    
    if (
      RETRY_CONFIG.retryCondition(error) &&
      config.retryCount < RETRY_CONFIG.maxRetries &&
      !error.response // Only retry for network errors, not HTTP errors
    ) {
      config.retryCount++;
      
      // Exponential backoff
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, config.retryCount - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retrying request (${config.retryCount}/${RETRY_CONFIG.maxRetries}):`, config.url);
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

// Utility function to cancel all pending requests
export const cancelAllRequests = () => {
  pendingRequests.clear();
  requestQueue.clear();
};

// Utility function for request deduplication
export const deduplicateRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  if (requestQueue.has(key)) {
    return requestQueue.get(key)!;
  }
  
  const promise = requestFn()
    .finally(() => {
      requestQueue.delete(key);
    });
    
  requestQueue.set(key, promise);
  return promise;
};

// Función auxiliar para mostrar errores globalmente sin depender del contexto de React
const showErrorGlobal = (title: string, description: string) => {
  // Buscar el container de notificaciones existente o crear uno nuevo
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full';
    document.body.appendChild(container);
  }

  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = 'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 animate-in slide-in-from-right-full duration-300';
  
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
    // Solo manejar errores de red o servidor, no errores de validación del cliente
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data && typeof error.response.data === 'object' 
        ? (error.response.data as any).message 
        : error.message;

      // Mostrar notificación de error según el código de estado
      switch (status) {
        case 400:
          if (message?.includes('validation') || message?.includes('required')) {
            showErrorGlobal("Datos inválidos", "Por favor, revisa los datos ingresados");
          } else {
            showErrorGlobal("Solicitud inválida", "No se pudo procesar la solicitud");
          }
          break;
        case 401:
          showErrorGlobal("No autorizado", "Tu sesión ha expirado. Por favor, inicia sesión nuevamente");
          // Limpiar token inválido
          localStorage.removeItem("token");
          localStorage.removeItem("userTimezone");
          break;
        case 403:
          showErrorGlobal("Acceso denegado", "No tienes permisos para realizar esta acción");
          break;
        case 404:
          showErrorGlobal("No encontrado", "El recurso solicitado no existe");
          break;
        case 500:
          showErrorGlobal("Error del servidor", "Hubo un problema en el servidor. Inténtalo más tarde");
          break;
        default:
          if (status >= 400 && status < 500) {
            showErrorGlobal("Error del cliente", "No se pudo completar la solicitud");
          } else if (status >= 500) {
            showErrorGlobal("Error del servidor", "Hubo un problema en el servidor");
          } else {
            showErrorGlobal("Error de conexión", message || "No se pudo conectar con el servidor");
          }
      }
    } else if (error.request) {
      // Error de red
      showErrorGlobal("Error de conexión", "No se pudo conectar con el servidor. Verifica tu conexión a internet");
    } else {
      // Error en la configuración de la solicitud
      console.error("Error de configuración:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;