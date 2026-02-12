/**
 * Hook para gestionar Push Notifications - Fase 2
 * Manejo de suscripciones push y notificaciones del navegador
 */
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../src/context/AuthContext";
import { api } from "../src/utils/axiosConfig";
import {
  PushSubscriptionData,
  VapidKeyResponse,
  PushSubscriptionStatus,
  NotificationPermissionStatus,
  SubscribeResponse,
  UnsubscribeResponse,
} from "../src/types/pushNotifications";

interface UsePushNotificationsReturn {
  // Estado
  isSubscribed: boolean;
  isSupported: boolean;
  permission: NotificationPermissionStatus;
  loading: boolean;
  error: string | null;

  // Funciones
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  checkSubscriptionStatus: () => Promise<PushSubscriptionStatus>;

  // Utilidades
  clearError: () => void;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { user } = useAuth();

  // Estado
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermissionStatus>("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar soporte al montar
  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      // Verificar permiso actual
      const currentPermission =
        Notification.permission as NotificationPermissionStatus;
      setPermission(currentPermission);

      // Verificar si ya está suscrito
      checkSubscriptionStatus();
    }
  }, []);

  /**
   * Verificar estado de la suscripción
   */
  const checkSubscriptionStatus =
    useCallback(async (): Promise<PushSubscriptionStatus> => {
      const status: PushSubscriptionStatus = {
        isSubscribed: false,
        permission: Notification.permission as NotificationPermissionStatus,
        isSupported,
      };

      if (!isSupported || !("serviceWorker" in navigator)) {
        return status;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        status.isSubscribed = !!subscription;
        setIsSubscribed(!!subscription);
        setPermission(Notification.permission as NotificationPermissionStatus);

        return status;
      } catch (err) {
        console.error("Error checking subscription status:", err);
        return status;
      }
    }, [isSupported]);

  /**
   * Obtener clave pública VAPID del servidor
   */
  const getVapidKey = useCallback(async (): Promise<string | null> => {
    try {
      const response = await api.get<VapidKeyResponse>("/push/vapid-key");
      return response.data?.publicKey || null;
    } catch (err) {
      console.error("Error getting VAPID key:", err);
      return null;
    }
  }, []);

  /**
   * Solicitar permiso de notificaciones
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Las notificaciones push no están soportadas en este navegador");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      const newPermission = result as NotificationPermissionStatus;
      setPermission(newPermission);

      if (newPermission !== "granted") {
        setError("Permiso de notificaciones denegado");
        return false;
      }

      return true;
    } catch (err) {
      setError("Error al solicitar permiso de notificaciones");
      return false;
    }
  }, [isSupported]);

  /**
   * Registrar Service Worker
   */
  const registerServiceWorker =
    useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
      if (!("serviceWorker" in navigator)) {
        return null;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        return registration;
      } catch (err) {
        console.error("Error registering service worker:", err);
        return null;
      }
    }, []);

  /**
   * Suscribirse a notificaciones push
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError("Usuario no autenticado");
      return false;
    }

    if (!isSupported) {
      setError("Las notificaciones push no están soportadas en este navegador");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verificar/solicitar permiso
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) {
          setLoading(false);
          return false;
        }
      }

      // 2. Registrar Service Worker
      const registration = await registerServiceWorker();
      if (!registration) {
        setError("Error al registrar el Service Worker");
        setLoading(false);
        return false;
      }

      // 3. Obtener clave VAPID
      const vapidKey = await getVapidKey();
      if (!vapidKey) {
        setError("Error al obtener la clave de suscripción");
        setLoading(false);
        return false;
      }

      // 4. Crear suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
          .buffer as ArrayBuffer,
      });

      // 5. Enviar suscripción al servidor
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: arrayBufferToBase64(subscription.getKey("auth")!),
        },
      };

      const response = await api.post<SubscribeResponse>(
        "/push/subscribe",
        subscriptionData,
      );

      if (response.data?.success) {
        setIsSubscribed(true);
        setLoading(false);
        return true;
      } else {
        setError(response.data?.message || "Error al suscribirse");
        setLoading(false);
        return false;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al suscribirse a notificaciones";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [
    user,
    isSupported,
    permission,
    requestPermission,
    registerServiceWorker,
    getVapidKey,
  ]);

  /**
   * Desuscribirse de notificaciones push
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError("Usuario no autenticado");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Obtener suscripción actual
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      // 2. Cancelar suscripción en el navegador
      if (subscription) {
        await subscription.unsubscribe();
      }

      // 3. Notificar al servidor
      const response =
        await api.delete<UnsubscribeResponse>("/push/unsubscribe");

      if (response.data?.success) {
        setIsSubscribed(false);
        setLoading(false);
        return true;
      } else {
        setError(response.data?.message || "Error al desuscribirse");
        setLoading(false);
        return false;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al desuscribirse de notificaciones";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [user]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    isSubscribed,
    isSupported,
    permission,
    loading,
    error,

    // Funciones
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,

    // Utilidades
    clearError,
  };
};

// ==================== UTILIDADES ====================

/**
 * Convertir ArrayBuffer a Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convertir Base64 URL-safe a Uint8Array
 * Necesario para la clave VAPID
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

export default usePushNotifications;
