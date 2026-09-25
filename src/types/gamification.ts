/**
 * Tipos y modelos para Gamificación - Fase 2
 * Sistema de XP, badges, leaderboard y multiplicadores
 */

// ==================== ENUMS ====================

/**
 * Tipos de badges disponibles (15 tipos según backend)
 */
export enum BadgeType {
  // Pomodoro badges
  POMODORO_NOVICE = "POMODORO_NOVICE",
  POMODORO_FOCUSED = "POMODORO_FOCUSED",
  POMODORO_EXPERT = "POMODORO_EXPERT",
  POMODORO_MASTER = "POMODORO_MASTER",

  // Session badges
  SESSION_STARTER = "SESSION_STARTER",
  SESSION_REGULAR = "SESSION_REGULAR",
  SESSION_DEVOTED = "SESSION_DEVOTED",
  SESSION_LEGEND = "SESSION_LEGEND",

  // Streak badges
  STREAK_WEEK = "STREAK_WEEK",
  STREAK_MONTH = "STREAK_MONTH",
  STREAK_CHAMPION = "STREAK_CHAMPION",

  // Card badges
  CARD_COLLECTOR = "CARD_COLLECTOR",
  CARD_MASTER = "CARD_MASTER",

  // Special badge
  EARLY_BIRD = "EARLY_BIRD",
}

/**
 * Tipos de transacciones de XP
 */
export enum XpTransactionType {
  CARD_COMPLETE = "CARD_COMPLETE",
  POMODORO_COMPLETE = "POMODORO_COMPLETE",
  SESSION_COMPLETE = "SESSION_COMPLETE",
  INTRADAY_REVIEW_COMPLETE = "INTRADAY_REVIEW_COMPLETE",
  BADGE_EARNED = "BADGE_EARNED",
  STREAK_BONUS = "STREAK_BONUS",
  LEVEL_UP_BONUS = "LEVEL_UP_BONUS",
  PENALTY_ABANDON = "PENALTY_ABANDON",
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
}

/**
 * Badge ganado por el usuario
 */
export interface UserBadge {
  id: number;
  userId: number;
  badgeType: BadgeType;
  earnedAt: string;
  topicId?: number;
  metadata?: BadgeMetadata;
  createdAt: string;
}

/**
 * Transacción de XP
 */
export interface XpTransaction {
  id: number;
  userId: number;
  amount: number;
  type: XpTransactionType;
  multiplier: number;
  metadata?: Record<string, unknown>;
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
 * Estadísticas de gamificación del usuario
 */
export interface GamificationStats {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  currentStreak: number;
  longestStreak: number;
  badges: UserBadge[];
  recentTransactions: XpTransaction[];
  pomodorosCompleted: number;
  sessionsCompleted: number;
  sessionsAbandoned: number;
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
  // Pomodoro badges
  [BadgeType.POMODORO_NOVICE]: {
    icon: "timer",
    nameKey: "gamification.badges.pomodoroNovice.name",
    descriptionKey: "gamification.badges.pomodoroNovice.description",
    color: "#6366f1", // indigo
    requirement: 1,
  },
  [BadgeType.POMODORO_FOCUSED]: {
    icon: "timer",
    nameKey: "gamification.badges.pomodoroFocused.name",
    descriptionKey: "gamification.badges.pomodoroFocused.description",
    color: "#8b5cf6", // violet
    requirement: 10,
  },
  [BadgeType.POMODORO_EXPERT]: {
    icon: "timer",
    nameKey: "gamification.badges.pomodoroExpert.name",
    descriptionKey: "gamification.badges.pomodoroExpert.description",
    color: "#a855f7", // purple
    requirement: 50,
  },
  [BadgeType.POMODORO_MASTER]: {
    icon: "timer",
    nameKey: "gamification.badges.pomodoroMaster.name",
    descriptionKey: "gamification.badges.pomodoroMaster.description",
    color: "#c026d3", // fuchsia
    requirement: 100,
  },

  // Session badges
  [BadgeType.SESSION_STARTER]: {
    icon: "zap",
    nameKey: "gamification.badges.sessionStarter.name",
    descriptionKey: "gamification.badges.sessionStarter.description",
    color: "#22c55e", // green
    requirement: 1,
  },
  [BadgeType.SESSION_REGULAR]: {
    icon: "zap",
    nameKey: "gamification.badges.sessionRegular.name",
    descriptionKey: "gamification.badges.sessionRegular.description",
    color: "#14b8a6", // teal
    requirement: 10,
  },
  [BadgeType.SESSION_DEVOTED]: {
    icon: "zap",
    nameKey: "gamification.badges.sessionDevoted.name",
    descriptionKey: "gamification.badges.sessionDevoted.description",
    color: "#0ea5e9", // sky
    requirement: 25,
  },
  [BadgeType.SESSION_LEGEND]: {
    icon: "zap",
    nameKey: "gamification.badges.sessionLegend.name",
    descriptionKey: "gamification.badges.sessionLegend.description",
    color: "#f59e0b", // amber
    requirement: 50,
  },

  // Streak badges
  [BadgeType.STREAK_WEEK]: {
    icon: "flame",
    nameKey: "gamification.badges.streakWeek.name",
    descriptionKey: "gamification.badges.streakWeek.description",
    color: "#ef4444", // red
    requirement: 7,
  },
  [BadgeType.STREAK_MONTH]: {
    icon: "flame",
    nameKey: "gamification.badges.streakMonth.name",
    descriptionKey: "gamification.badges.streakMonth.description",
    color: "#f97316", // orange
    requirement: 30,
  },
  [BadgeType.STREAK_CHAMPION]: {
    icon: "flame",
    nameKey: "gamification.badges.streakChampion.name",
    descriptionKey: "gamification.badges.streakChampion.description",
    color: "#eab308", // yellow
    requirement: 100,
  },

  // Card badges
  [BadgeType.CARD_COLLECTOR]: {
    icon: "layers",
    nameKey: "gamification.badges.cardCollector.name",
    descriptionKey: "gamification.badges.cardCollector.description",
    color: "#3b82f6", // blue
    requirement: 50,
  },
  [BadgeType.CARD_MASTER]: {
    icon: "layers",
    nameKey: "gamification.badges.cardMaster.name",
    descriptionKey: "gamification.badges.cardMaster.description",
    color: "#6366f1", // indigo
    requirement: 200,
  },

  // Special badge
  [BadgeType.EARLY_BIRD]: {
    icon: "sunrise",
    nameKey: "gamification.badges.earlyBird.name",
    descriptionKey: "gamification.badges.earlyBird.description",
    color: "#fbbf24", // amber-light
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
