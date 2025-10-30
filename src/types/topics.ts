export interface Topic {
  id: number;
  name: string;
  cards: number;
  lastStudied: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  description: string;
  color: string; // nuevo campo que indica categoría/dificultad
}

// Para crear un topic ahora enviamos color en lugar de difficulty
export type CreateTopicData = Pick<Topic, 'name' | 'description' | 'color'>;
export type UpdateTopicData = Partial<CreateTopicData>;

export interface TopicItemProps {
  topic: Topic;
  onEdit: (topic: Topic) => void;
  onDelete: (topicId: number) => void;
  onViewCards?: (topicId: number) => void;
}

export interface TopicFormProps {
  onSubmit: (topic: CreateTopicData | UpdateTopicData) => Promise<void>;
  onCancel: () => void;
  initialData?: Topic;
  isEditing?: boolean;
}

export interface TopicListProps {
  topics: Topic[];
  onEdit: (topic: Topic) => void;
  onDelete: (topicId: number) => void;
  onViewCards?: (topicId: number) => void;  // para navegar a las tarjetas del tema
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onPageChange?: (page: number) => void;
}

export interface TopicsManagerProps {
  onSelectTopic?: (topicId: number | null) => void; 
  onTopicsChange?: (topics: Topic[]) => void;
  selectedTopicId?: number | null;
  initialTopic?: Topic | null;
}

export interface TopicCardProps {
  topic: Topic;
  onSelect: (topicId: number) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topicId: number) => void;
}