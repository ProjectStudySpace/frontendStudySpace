export interface StudyCard {
  id: number;
  question: string;
  answer: string;
  topic: {
    id: number;
    name: string;
    color: string;
  };
}

export interface ScheduledReview {
  id: number;
  dueDate: string;
  intervalDays: number;
  card: StudyCard;
  googleEventId?: string;
}

export interface CompletedReview {
  id: number;
  completedAt: string;
  difficultyRating: 1 | 2 | 3;
  intervalDays: number;
  scheduledFor: string;
  card?: StudyCard;
}

export interface UpcomingReviewItem {
  id: number;
  dueDate: string;
  card: StudyCard;
  intervalDays: number;
}

export interface UpcomingReviews {
  [date: string]: UpcomingReviewItem[];
}

export type UpcomingReviewsArray = UpcomingReviewItem[];

export interface ReviewSession {
  id: number;
  type: "pending" | "upcoming" | "completed";
  dueDate: string;
  card: StudyCard;
  difficultyRating?: 1 | 2 | 3;
  completedAt?: string;
  intervalDays?: number;
}

export interface GroupedSessions {
  pending: ReviewSession[];
  upcoming: ReviewSession[];
  completed: ReviewSession[];
}

export interface StudySessionCalendar {
  id: number;
  dueDate: string;
  card: {
    id: number;
    question: string;
    topic: {
      id: number;
      name: string;
      color: string;
    };
  };
  intervalDays?: number;
}

export interface StudySessionProps {
  review: ScheduledReview;
  currentCard: number;
  totalCards: number;
  onComplete: (difficulty: 1 | 2 | 3) => void;
  onExit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export interface ReviewSessionListProps {
  sessions: ReviewSession[];
  onSessionsUpdate?: () => void;
  upcomingPagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onUpcomingPageChange?: (page: number) => void;
  pendingPagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onPendingPageChange?: (page: number) => void;
}

export interface ReviewSessionCardProps {
  session: ReviewSession;
  onSessionUpdated?: () => void;
}
