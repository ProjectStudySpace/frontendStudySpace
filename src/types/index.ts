export interface User {
  id: string;
  email: string;
  name: string;
  userTimezone?: string;
}

export interface StudyTheme {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Flashcard {
  id: string;
  themeId: string;
  question: string;
  answer: string;
}

export interface StudySession {
  id: string;
  themeId: string;
  flashcards: Flashcard[];
  startTime: Date;
  endTime?: Date;
}
