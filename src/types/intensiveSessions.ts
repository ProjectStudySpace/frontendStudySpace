/**
 * Tipos y modelos para Sesiones Intensivas - Fase 2
 * Basado en los modelos y enums del backend de MemoPal
 */

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
 * Estado de la sesión intensiva
 */
export enum SessionStatus {
  CREATED = "CREATED",
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
}

/**
 * Estado del bloque Pomodoro
 */
export enum PomodoroStatus {
  IN_PROGRESS = "IN_PROGRESS",
  BREAK = "BREAK",
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
  completedAt?: string;
  breakStartedAt?: string;
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
