/**
 * Tipos y modelos para Sesiones Intensivas - Fase 2
 * Basado en los modelos y enums del backend de MemoPal
 */

import type { IntradayReview } from "./intradayReviews";

// ==================== ENUMS ====================

/**
 * Nivel de intensidad de la sesión
 */
export enum StudyIntensity {
  RELAXED = "RELAXED",
  NORMAL = "NORMAL",
  INTENSIVE = "INTENSIVE",
}

/**
 * Canonical intensive session lifecycle.
 * Mirrors the backend `IntensiveSessionStatus` enum:
 * CONFIGURING -> ACTIVE <-> PAUSED, then COMPLETED or ABANDONED.
 */
export enum SessionStatus {
  CONFIGURING = "CONFIGURING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
}

/**
 * Canonical Pomodoro block lifecycle.
 * Mirrors the backend `PomodoroStatus` enum:
 * PENDING -> ACTIVE -> ON_BREAK -> COMPLETED, with ABANDONED terminal.
 */
export enum PomodoroStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  ON_BREAK = "ON_BREAK",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
}

/**
 * Dificultad de la tarjeta en sesión intensiva
 * Nota: Diferente del sistema SM-2 (1/2/3) usado en sesiones normales
 */
export enum CardDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

/**
 * Tipo de descanso en Pomodoro
 */
export enum BreakType {
  SHORT = "SHORT",
  LONG = "LONG",
}

// ==================== INTERFACES ====================

/**
 * Información básica del tema (incluida en la sesión)
 */
export interface TopicInfo {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

/**
 * Información básica de la tarjeta de estudio
 */
export interface StudyCardInfo {
  id: number;
  question: string;
  answer: string;
  topicId: number;
}

/**
 * Sesión de estudio intensiva
 */
export interface IntensiveStudySession {
  id: number;
  topicId: number;
  userId: number;
  intensity: StudyIntensity;
  status: SessionStatus;
  totalCards: number;
  completedCards: number;
  totalPomodoros: number;
  completedPomodoros: number;
  xpEarned: number;
  startedAt?: string;
  completedAt?: string;
  estimatedEndTime?: string;
  abandonedAt?: string;
  topic?: TopicInfo;
  createdAt: string;
  updatedAt: string;
}

/**
 * Bloque Pomodoro dentro de una sesión
 */
export interface PomodoroBlock {
  id: number;
  sessionId: number;
  blockNumber: number;
  status: PomodoroStatus;
  startedAt?: string;
  endsAt?: string; // absolute work boundary from the backend
  completedAt?: string;
  breakStartedAt?: string;
  breakEndsAt?: string; // absolute break boundary from the backend
  breakEndedAt?: string;
  duration?: number; // en segundos (legacy)
  durationMinutes?: number; // en minutos (del backend)
  breakDuration?: number; // en segundos (legacy)
  breakDurationMinutes?: number; // en minutos (del backend)
  breakType: BreakType;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tarjeta dentro de una sesión intensiva
 */
export interface IntensiveSessionCard {
  id: number;
  sessionId: number;
  cardId: number;
  difficulty?: CardDifficulty;
  completed: boolean;
  completedAt?: string;
  order: number;
  card?: StudyCardInfo;
  createdAt: string;
  updatedAt: string;
}

/**
 * Datos para crear una nueva sesión intensiva
 */
export interface CreateIntensiveSessionData {
  topicId: number;
  intensity: StudyIntensity;
}

/**
 * Detalle completo de una sesión intensiva
 * Incluye bloques Pomodoro y tarjetas
 */
export interface IntensiveSessionDetail extends IntensiveStudySession {
  pomodoroBlocks: PomodoroBlock[];
  sessionCards: IntensiveSessionCard[];
}

/**
 * Outcome of the best-effort intraday review scheduling that runs after the
 * session commit. Anything but `completed` means reviews may still be missing
 * or unnotified and will be reconciled by the backend later.
 */
export interface IntradayReviewScheduling {
  status: "completed" | "notification_pending" | "pending_reconciliation";
  retryable: boolean;
}

/** Outcome of the badge evaluation that runs after a block completion commit. */
export interface BadgeEvaluation {
  status: "completed" | "failed";
  retryable: boolean;
}

/** XP multiplier applied to the session completion reward. */
export interface AppliedMultiplier {
  type: string;
  value: number;
  label: string;
}

/**
 * Authoritative results computed by `POST /intensive-sessions/:id/complete`.
 * The client renders them as-is instead of recounting session relations.
 */
export interface SessionCompletionSummary {
  topicName: string;
  cardsCompleted: number;
  totalCards: number;
  cardsEasy: number;
  cardsMedium: number;
  cardsHard: number;
  pomodorosCompleted: number;
  totalDuration: number; // en minutos
  xpEarned: number;
  multiplier: number;
  appliedMultipliers: AppliedMultiplier[];
  nextReviews: IntradayReview[];
  intradayReviewScheduling: IntradayReviewScheduling;
}

/**
 * A completed session. `summary` is null when completion was confirmed by
 * reconciliation, since the authoritative GET does not carry it.
 */
/**
 * Badge outcome of a session completion. Badges are evaluated after the commit,
 * so a deferred evaluation never undoes the completion itself.
 */
export interface SessionBadgeEvaluation {
  status: "completed" | "pending_reconciliation";
  retryable: boolean;
}

/**
 * A completed session. `summary` and `badgeEvaluation` are null when completion
 * was confirmed by reconciliation instead of by the command response.
 */
export interface SessionCompletionResult {
  session: IntensiveSessionDetail;
  summary: SessionCompletionSummary | null;
  badgeEvaluation: SessionBadgeEvaluation | null;
}

/**
 * A completed Pomodoro block. Every field but `block` is null when completion
 * was confirmed by reconciliation instead of by the command response.
 */
export interface PomodoroCompletionResult {
  block: PomodoroBlock | null;
  breakDuration: number | null; // en minutos
  breakEndsAt: string | null;
  isLongBreak: boolean | null;
  xpAwarded: number | null;
  badgeEvaluation: BadgeEvaluation | null;
}

/**
 * Phase derived from authoritative backend state when a session is resumed.
 * TERMINAL covers COMPLETED and ABANDONED sessions, which are never actionable.
 */
export type ResumePhase = "READY" | "ACTIVE" | "BREAK" | "PAUSED" | "TERMINAL";

/**
 * Absolute timer boundaries owned by the backend.
 * The client only renders them; it never invents them.
 */
export interface IntensiveTimerDescriptor {
  phase: "WORK" | "SHORT_BREAK" | "LONG_BREAK";
  startedAt: string;
  endsAt: string;
  durationSeconds: number;
}

/**
 * Everything the UI needs to resume a session, hydrated from the backend
 * before any actionable view is rendered.
 */
export interface IntensiveResumeSnapshot {
  phase: ResumePhase;
  session: IntensiveSessionDetail;
  block: PomodoroBlock | null;
  card: IntensiveSessionCard | null;
  timer: IntensiveTimerDescriptor | null;
}

/**
 * Información de abandono (penalización)
 */
export interface AbandonInfo {
  xpToLose: number;
  completedCards: number;
  totalCards: number;
  message: string;
}

// ==================== PROPS DE COMPONENTES ====================

/**
 * Props para el componente de tarjeta en sesión intensiva
 */
export interface IntensiveSessionCardProps {
  card: IntensiveSessionCard;
  onDifficultySelect: (difficulty: CardDifficulty) => void;
  onComplete: (cardId: number, difficulty: CardDifficulty) => void;
  isCurrentCard: boolean;
  disabled?: boolean;
}

/**
 * Props para el componente de timer Pomodoro
 */
export interface PomodoroTimerProps {
  timeRemaining: number;
  totalTime: number;
  phase: "WORK" | "SHORT_BREAK" | "LONG_BREAK";
  blockNumber: number;
  totalBlocks: number;
  isPaused: boolean;
  onComplete?: () => void;
  onSkipBreak?: () => void;
}

/**
 * Props para el selector de intensidad
 */
export interface IntensityPickerProps {
  selectedIntensity: StudyIntensity | null;
  onSelect: (intensity: StudyIntensity) => void;
  disabled?: boolean;
}

// ==================== CONSTANTES ====================

/**
 * Configuración de tiempos Pomodoro (en segundos)
 * Debe coincidir con el backend
 */
export const POMODORO_CONFIG = {
  WORK_DURATION: 25 * 60, // 25 minutos
  SHORT_BREAK_DURATION: 5 * 60, // 5 minutos
  LONG_BREAK_DURATION: 15 * 60, // 15 minutos
  BLOCKS_UNTIL_LONG_BREAK: 4,
} as const;

/**
 * Configuración de intensidad
 */
export const INTENSITY_CONFIG = {
  [StudyIntensity.RELAXED]: {
    maxPomodoros: 2,
    description: "Sesión corta con descansos frecuentes",
    reviewFrequency: "Repasos cada 2 horas",
  },
  [StudyIntensity.NORMAL]: {
    maxPomodoros: 4,
    description: "Sesión equilibrada para estudio regular",
    reviewFrequency: "Repasos cada 1.5 horas",
  },
  [StudyIntensity.INTENSIVE]: {
    maxPomodoros: 8,
    description: "Sesión extensa para preparación intensiva",
    reviewFrequency: "Repasos cada hora",
  },
} as const;
