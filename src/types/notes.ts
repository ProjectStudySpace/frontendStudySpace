export interface Note {
  id: number;
  title?: string;
  leftContent: string;
  rightContent: string;
  type: "flashcard" | "explanation";
  leftImage?: File | null;
  rightImage?: File | null;
  leftImageUrl?: string;
  rightImageUrl?: string;
  leftImageUrls?: string[];
  rightImageUrls?: string[];
  topicId: number;
  topic?: {
    id: number;
    name: string;
    color: string;
    description?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNoteData {
  title?: string;
  leftContent: string;
  rightContent: string;
  type: "flashcard" | "explanation";
  leftImages?: File[];
  rightImages?: File[];
  topicId: number;
}

export interface UpdateNoteData {
  title?: string;
  leftContent?: string;
  rightContent?: string;
  leftImages?: File[];
  rightImages?: File[];
}

export interface NoteFormProps {
  onSubmit: (data: {
    title?: string;
    leftContent?: string;
    rightContent?: string;
    leftImages?: File[];
    rightImages?: File[];
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: Note;
  isEditing?: boolean;
}

export interface NoteItemProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: number) => void;
}

export interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: number) => void;
  topicId: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onPageChange?: (page: number) => void;
  onCreateNote?: () => void;
}

export interface NotesManagerProps {
  topicId: number;
  openFormInitially?: boolean;
}
