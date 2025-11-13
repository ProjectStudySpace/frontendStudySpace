export interface Note {
    id: number;
    title?: string;
    leftContent: string;
    rightContent: string;
    leftImage?: File | null;
    rightImage?: File | null;
    leftImageUrl?: string;
    rightImageUrl?: string;
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
    leftImage?: File;
    rightImage?: File;
    topicId: number;
  }
  
  export interface UpdateNoteData {
    title?: string;
    leftContent?: string;
    rightContent?: string;
    leftImage?: File;
    rightImage?: File;
  }
  
  export interface NoteFormProps {
    onSubmit: (data: CreateNoteData | UpdateNoteData) => Promise<void>;
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
  }