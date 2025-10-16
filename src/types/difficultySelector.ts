export interface DifficultySelectorProps {
  selectedDifficulty: 1 | 2 | 3 | null;
  onSelect: (difficulty: 1 | 2 | 3) => void;
}