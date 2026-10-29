/**
 * Tipos y modelos para Gamificación - Fase 2
 * Sistema de XP, badges, leaderboard y multiplicadores
 */

// ==================== ENUMS ====================

/**
 * Badge types. Mirrors the backend `BadgeType` Prisma enum (same order).
 */
export enum BadgeType {
  // Pomodoros completed
  POMODORO_NOVICE = "POMODORO_NOVICE",
  POMODORO_FOCUSED = "POMODORO_FOCUSED",
  POMODORO_MASTER = "POMODORO_MASTER",
  POMODORO_LEGEND = "POMODORO_LEGEND",

  // Daily study streak (spaced reviews or intensive sessions)
  STREAK_ON_FIRE = "STREAK_ON_FIRE",
  STREAK_UNSTOPPABLE = "STREAK_UNSTOPPABLE",
  STREAK_LEGEND = "STREAK_LEGEND",

  // Total XP
  XP_BEGINNER = "XP_BEGINNER",
  XP_INTERMEDIATE = "XP_INTERMEDIATE",
  XP_ADVANCED = "XP_ADVANCED",
  XP_EXPERT = "XP_EXPERT",

  // Special badges (10 completed sessions each, hours in the user's timezone)
  EARLY_BIRD = "EARLY_BIRD", // completed before 08:00
  NIGHT_OWL = "NIGHT_OWL", // retired: no longer awarded, earned ones are kept
  NEVER_GIVE_UP = "NEVER_GIVE_UP", // any completed session

  // Spaced repetition
  PERFECTIONIST = "PERFECTIONIST", // 7 days in a row with no overdue reviews
  TOPIC_MASTERY = "TOPIC_MASTERY", // every card of a topic at a 30-day interval
}

/**
 * Tipos de transacciones de XP.
 * Mirrors the backend `XpTransactionType` Prisma enum.
 */
export enum XpTransactionType {
  CARD_COMPLETE = "CARD_COMPLETE",
  POMODORO_COMPLETE = "POMODORO_COMPLETE",
  SESSION_COMPLETE = "SESSION_COMPLETE",
  ALL_SESSIONS_COMPLETE = "ALL_SESSIONS_COMPLETE",
  LONG_BREAK_COMPLETE = "LONG_BREAK_COMPLETE",
  BADGE_EARNED = "BADGE_EARNED",
  STREAK_BONUS = "STREAK_BONUS",
  ABANDON_PENALTY = "ABANDON_PENALTY",
}

/**
 * Tipos de multiplicadores de XP
 */
export enum XpMultiplierType {
  STREAK = "STREAK",
  INTENSIVE_SESSION = "INTENSIVE_SESSION",
  FIRST_SESSION_DAY = "FIRST_SESSION_DAY",
  PERFECT_POMODORO = "PERFECT_POMODORO",
}

// ==================== INTERFACES ====================

/**
 * Metadata para un badge
 */
export interface BadgeMetadata {
  icon: string;
  nameKey: string;
  descriptionKey: string;
  color: string;
  requirement?: number;
  /** No longer awarded by the backend; shown only when already earned. */
  retired?: boolean;
}

/**
 * Badge ganado por el usuario.
 * Mirrors the backend `UserBadge` row served by `GET /gamification/badges`.
 */
export interface UserBadge {
  id: number;
  userId: number;
  badgeType: BadgeType;
  earnedAt: string;
  topicId?: number | null;
  /** Backend-defined JSON; not the client's visual `BadgeMetadata`. */
  metadata?: Record<string, unknown> | null;
}

/**
 * Transacción de XP.
 * Mirrors the backend `XpTransaction` row.
 */
export interface XpTransaction {
  id: number;
  userId: number;
  amount: number;
  type: XpTransactionType;
  /** Prisma `Decimal(3, 2)`, serialized as a string such as "1.25". */
  multiplier: string;
  finalAmount: number;
  description: string | null;
  sessionId: number | null;
  pomodoroId: number | null;
  cardId: number | null;
  badgeType: BadgeType | null;
  createdAt: string;
}

/**
 * Información de nivel
 */
export interface LevelInfo {
  level: number;
  xpRequired: number;
  xpForNext: number;
  title: string;
  progressPercent: number;
}

/**
 * Estadísticas de gamificación del usuario.
 * Mirrors `GET /api/gamification/stats`.
 */
export interface GamificationStats {
  totalXp: number;
  todayXp: number;
  weekXp: number;
  level: number;
  /** Progress through the current level, 0-100. */
  levelProgress: number;
  xpToNextLevel: number;
  xpForCurrentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  pomodorosCompleted: number;
  sessionsCompleted: number;
  sessionsAbandoned: number;
  /** Completed sessions over completed plus abandoned, 0-100. */
  completionRate: number;
  badges: UserBadge[];
  badgeCount: number;
  /** The 20 latest XP transactions. */
  recentXp: XpTransaction[];
}

/**
 * Entrada del leaderboard
 */
export interface LeaderboardEntry {
  userId: number;
  name: string;
  avatar?: string;
  totalXp: number;
  level: number;
  position: number;
  isCurrentUser?: boolean;
}

/**
 * Respuesta paginada del leaderboard
 */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  userPosition?: number;
  hasMore: boolean;
}

/**
 * Multiplicador de XP activo
 */
export interface ActiveMultiplier {
  name: string;
  type: XpMultiplierType;
  value: number;
  description?: string;
}

/**
 * Datos para mostrar multiplicadores activos
 */
export interface ActiveMultipliersData {
  multipliers: ActiveMultiplier[];
  total: number;
}

// ==================== CONFIGURACIÓN ====================

/**
 * Configuración de badges
 * Mapea cada tipo de badge a su información visual
 */
export const BADGE_CONFIG: Record<BadgeType, BadgeMetadata> = {
  // Pomodoros completed
  [BadgeType.POMODORO_NOVICE]: {
    icon: "timer",
    nameKey: "gamification.badges.pomodoroNovice.name",
    descriptionKey: "gamification.badges.pomodoroNovice.description",
    color: "#6366f1",
    requirement: 5,
  },
  [BadgeType.POMODORO_FOCUSED]: {
    icon: "timer",
    nameKey: "gamification.badges.pomodoroFocused.name",
    descriptionKey: "gamification.badges.pomodoroFocused.description",
    color: "#8b5cf6",
    requirement: 25,
  },
  [BadgeType.POMODORO_MASTER]: {
    icon: "timer",
    nameKey: "gamification.badges.pomodoroMaster.name",
    descriptionKey: "gamification.badges.pomodoroMaster.description",
    color: "#a855f7",
    requirement: 100,
  },
  [BadgeType.POMODORO_LEGEND]: {
    icon: "timer",
    nameKey: "gamification.badges.pomodoroLegend.name",
    descriptionKey: "gamification.badges.pomodoroLegend.description",
    color: "#c026d3",
    requirement: 500,
  },

  // Daily study streak
  [BadgeType.STREAK_ON_FIRE]: {
    icon: "flame",
    nameKey: "gamification.badges.streakOnFire.name",
    descriptionKey: "gamification.badges.streakOnFire.description",
    color: "#ef4444",
    requirement: 7,
  },
  [BadgeType.STREAK_UNSTOPPABLE]: {
    icon: "flame",
    nameKey: "gamification.badges.streakUnstoppable.name",
    descriptionKey: "gamification.badges.streakUnstoppable.description",
    color: "#f97316",
    requirement: 30,
  },
  [BadgeType.STREAK_LEGEND]: {
    icon: "flame",
    nameKey: "gamification.badges.streakLegend.name",
    descriptionKey: "gamification.badges.streakLegend.description",
    color: "#eab308",
    requirement: 100,
  },

  // Total XP
  [BadgeType.XP_BEGINNER]: {
    icon: "zap",
    nameKey: "gamification.badges.xpBeginner.name",
    descriptionKey: "gamification.badges.xpBeginner.description",
    color: "#22c55e",
    requirement: 1000,
  },
  [BadgeType.XP_INTERMEDIATE]: {
    icon: "zap",
    nameKey: "gamification.badges.xpIntermediate.name",
    descriptionKey: "gamification.badges.xpIntermediate.description",
    color: "#14b8a6",
    requirement: 10000,
  },
  [BadgeType.XP_ADVANCED]: {
    icon: "zap",
    nameKey: "gamification.badges.xpAdvanced.name",
    descriptionKey: "gamification.badges.xpAdvanced.description",
    color: "#0ea5e9",
    requirement: 50000,
  },
  [BadgeType.XP_EXPERT]: {
    icon: "zap",
    nameKey: "gamification.badges.xpExpert.name",
    descriptionKey: "gamification.badges.xpExpert.description",
    color: "#f59e0b",
    requirement: 100000,
  },

  // Special badges
  [BadgeType.EARLY_BIRD]: {
    icon: "sunrise",
    nameKey: "gamification.badges.earlyBird.name",
    descriptionKey: "gamification.badges.earlyBird.description",
    color: "#fbbf24",
    requirement: 10,
  },
  [BadgeType.NIGHT_OWL]: {
    icon: "moon",
    nameKey: "gamification.badges.nightOwl.name",
    descriptionKey: "gamification.badges.nightOwl.description",
    color: "#4f46e5",
    requirement: 10,
    retired: true,
  },
  [BadgeType.NEVER_GIVE_UP]: {
    icon: "shield",
    nameKey: "gamification.badges.neverGiveUp.name",
    descriptionKey: "gamification.badges.neverGiveUp.description",
    color: "#dc2626",
    requirement: 10,
  },

  // Spaced repetition
  [BadgeType.PERFECTIONIST]: {
    icon: "check-circle",
    nameKey: "gamification.badges.perfectionist.name",
    descriptionKey: "gamification.badges.perfectionist.description",
    color: "#10b981",
    requirement: 7,
  },
  [BadgeType.TOPIC_MASTERY]: {
    icon: "layers",
    nameKey: "gamification.badges.topicMastery.name",
    descriptionKey: "gamification.badges.topicMastery.description",
    color: "#3b82f6",
    requirement: 30,
  },
};

/**
 * Configuración de niveles
 * XP requerida para cada nivel
 */
export const LEVEL_CONFIG: {
  BASE_XP: number;
  MULTIPLIER: number;
  MAX_LEVEL: number;
} = {
  BASE_XP: 100,
  MULTIPLIER: 1.5,
  MAX_LEVEL: 100,
};

/**
 * Calcula el nivel basado en XP total
 */
export function calculateLevel(totalXp: number): LevelInfo {
  let level = 1;
  let xpRequired = LEVEL_CONFIG.BASE_XP;
  let totalXpRequired = 0;

  while (
    totalXp >= totalXpRequired + xpRequired &&
    level < LEVEL_CONFIG.MAX_LEVEL
  ) {
    totalXpRequired += xpRequired;
    level++;
    xpRequired = Math.floor(
      LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.MULTIPLIER, level - 1),
    );
  }

  const currentLevelXp = totalXp - totalXpRequired;
  const progressPercent = Math.min(100, (currentLevelXp / xpRequired) * 100);

  return {
    level,
    xpRequired,
    xpForNext: xpRequired,
    title: getLevelTitle(level),
    progressPercent,
  };
}

/**
 * Obtiene el título para un nivel
 */
export function getLevelTitle(level: number): string {
  if (level >= 90) return "Leyenda";
  if (level >= 70) return "Maestro";
  if (level >= 50) return "Experto";
  if (level >= 30) return "Avanzado";
  if (level >= 15) return "Intermedio";
  if (level >= 5) return "Aprendiz";
  return "Novato";
}

/**
 * Valores de XP por acción
 */
export const XP_VALUES = {
  CARD_COMPLETE: 10,
  POMODORO_COMPLETE: 25,
  SESSION_COMPLETE: 50,
  INTRADAY_REVIEW_COMPLETE: 15,
  BADGE_BONUS: 100,
  STREAK_BONUS_PER_DAY: 5,
  PENALTY_ABANDON_PER_CARD: -5,
} as const;

/**
 * Multiplicadores de XP
 */
export const XP_MULTIPLIERS = {
  STREAK_7_DAYS: 1.25,
  STREAK_30_DAYS: 1.5,
  STREAK_100_DAYS: 2.0,
  INTENSIVE_SESSION: 1.25,
  FIRST_SESSION_DAY: 1.5,
  PERFECT_POMODORO: 1.1,
} as const;
