import axios, { AxiosResponse, AxiosError } from 'axios';
import { API_URL } from '../config';

// Crear instancia de axios con configuración base
export const api = axios.create({
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