export interface CardImage {
  id: number;
  cardId: number;
  imageUrl: string;
  imageType: "question" | "answer";
  order: number;
  altText?: string;
  createdAt: Date;
}

export interface Card {
  id: number;
  question: string;
  answer: string;
  topicId: number;
  topic?: {
    id: number;
    name: string;
    color: string;
    description?: string;
    createdAt?: string;
  };
  images?: CardImage[]; // NUEVO
  createdAt: Date;
  updatedAt: Date;
}

export interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: number) => void;
}

export interface CardFormProps {
  onSubmit: (card: {
    question: string;
    answer: string;
    questionImage?: File; // NUEVO
    answerImage?: File; // NUEVO
  }) => void;
  onCancel: () => void;
  initialData?: {
    question: string;
    answer: string;
    questionImageUrl?: string; // NUEVO - para edición
    answerImageUrl?: string; // NUEVO - para edición
  };
  isEditing?: boolean;
}

export interface CardListProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (cardId: number) => void;
  topicId: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onPageChange?: (page: number) => void;
  onCreateCard?: () => void;
}

export interface CardsManagerProps {
  topicId: number;
}

// Actualizar CreateCardData para incluir FormData
export type CreateCardData = {
  topicId: number;
  question: string;
  answer: string;
  questionImage?: File;
  answerImage?: File;
};

export type UpdateCardData = Partial<Omit<CreateCardData, "topicId">>;
