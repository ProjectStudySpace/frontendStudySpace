/**
 * Tipos y modelos para Repasos Intradía - Fase 2
 * Los repasos intradía se programan automáticamente tras sesiones intensivas
 */

// ==================== ENUMS ====================

/**
 * Estado del repaso intradía
 */
export enum IntradayReviewStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  MISSED = "MISSED",
}

// ==================== INTERFACES ====================

/**
 * Información de la tarjeta para repaso intradía
 */
export interface IntradayReviewCardInfo {
  id: number;
  question: string;
  answer: string;
  topicId: number;
  topicName?: string;
}

/**
 * Repaso intradía programado
 */
export interface IntradayReview {
  id: number;
  sessionId: number;
  userId: number;
  scheduledFor: string; // ISO date string
  status: IntradayReviewStatus;
  completedAt?: string;
  notificationSent: boolean;
  cards: IntradayReviewCardInfo[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Tarjeta individual dentro de un repaso intradía
 */
export interface IntradayReviewCard {
  id: number;
  reviewId: number;
  cardId: number;
  reviewed: boolean;
  reviewedAt?: string;
  card?: IntradayReviewCardInfo;
  createdAt: string;
}

/**
 * Datos para crear un repaso intradía (normalmente automático)
 */
export interface CreateIntradayReviewData {
  sessionId: number;
  scheduledFor: string;
  cardIds: number[];
}

/**
 * Lista de repasos intradía pendientes
 */
export interface IntradayReviewList {
  reviews: IntradayReview[];
  totalPending: number;
  totalCompleted: number;
  totalMissed: number;
}

/**
 * Respuesta al completar un repaso intradía
 */
export interface CompleteIntradayReviewResponse {
  success: boolean;
  xpEarned: number;
  message: string;
}

// ==================== PROPS DE COMPONENTES ====================

/**
 * Props para el componente de tarjeta de repaso intradía
 */
export interface IntradayReviewCardProps {
  review: IntradayReview;
  onStartReview: (reviewId: number) => void;
  isExpanded?: boolean;
}

/**
 * Props para la lista de repasos intradía
 */
export interface IntradayReviewListProps {
  reviews: IntradayReview[];
  onStartReview: (reviewId: number) => void;
  loading?: boolean;
}

/**
 * Props para el componente de repaso activo
 */
export interface ActiveIntradayReviewProps {
  review: IntradayReview;
  onComplete: (reviewId: number) => void;
  onCancel: () => void;
}
