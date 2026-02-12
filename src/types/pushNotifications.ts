/**
 * Tipos y modelos para Push Notifications - Fase 2
 * Manejo de suscripciones push y notificaciones del navegador
 */

// ==================== INTERFACES ====================

/**
 * Datos de suscripción push (formato estándar Web Push)
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Respuesta del servidor con la clave pública VAPID
 */
export interface VapidKeyResponse {
  publicKey: string;
}

/**
 * Estado de permisos de notificación
 */
export type NotificationPermissionStatus = "granted" | "denied" | "default";

/**
 * Estado de la suscripción push
 */
export interface PushSubscriptionStatus {
  isSubscribed: boolean;
  permission: NotificationPermissionStatus;
  isSupported: boolean;
}

/**
 * Payload de notificación push recibida
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    type?:
      | "intraday_review"
      | "session_reminder"
      | "streak_warning"
      | "general";
    reviewId?: string;
    sessionId?: string;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Tipos de notificaciones que puede enviar el backend
 */
export enum NotificationType {
  INTRADAY_REVIEW = "intraday_review",
  SESSION_REMINDER = "session_reminder",
  STREAK_WARNING = "streak_warning",
  BADGE_EARNED = "badge_earned",
  LEVEL_UP = "level_up",
  DAILY_GOAL = "daily_goal",
}

/**
 * Configuración de notificaciones del usuario
 */
export interface NotificationPreferences {
  enabled: boolean;
  intradayReviews: boolean;
  sessionReminders: boolean;
  streakWarnings: boolean;
  badgeNotifications: boolean;
  levelUpNotifications: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
}

/**
 * Respuesta al suscribirse a notificaciones
 */
export interface SubscribeResponse {
  success: boolean;
  message: string;
}

/**
 * Respuesta al desuscribirse de notificaciones
 */
export interface UnsubscribeResponse {
  success: boolean;
  message: string;
}

// ==================== CONSTANTES ====================

/**
 * Configuración de notificaciones por defecto
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
  intradayReviews: true,
  sessionReminders: true,
  streakWarnings: true,
  badgeNotifications: true,
  levelUpNotifications: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
};

/**
 * Mensajes de error para notificaciones
 */
export const NOTIFICATION_ERRORS = {
  NOT_SUPPORTED: "pushNotifications.errors.notSupported",
  PERMISSION_DENIED: "pushNotifications.errors.permissionDenied",
  SUBSCRIPTION_FAILED: "pushNotifications.errors.subscriptionFailed",
  UNSUBSCRIPTION_FAILED: "pushNotifications.errors.unsubscriptionFailed",
  SERVICE_WORKER_FAILED: "pushNotifications.errors.serviceWorkerFailed",
} as const;

/**
 * Mensajes de éxito para notificaciones
 */
export const NOTIFICATION_SUCCESS = {
  SUBSCRIBED: "pushNotifications.success.subscribed",
  UNSUBSCRIBED: "pushNotifications.success.unsubscribed",
  PERMISSION_GRANTED: "pushNotifications.success.permissionGranted",
} as const;
