export interface UserProfile {
  id: number;
  name?: string;
  email: string;
  createdAt: string;
}

export interface UserStats {
  totalTopics: number;
  totalCards: number;
  pendingReviews: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  // Fase 2 - Gamificación
  totalXp: number;
  level: number;
  pomodorosCompleted: number;
  sessionsCompleted: number;
  sessionsAbandoned: number;
}

export interface ProfileDashboard {
  user: UserProfile;
  stats: UserStats;
}

export interface DeleteAccountData {
  password: string;
}
