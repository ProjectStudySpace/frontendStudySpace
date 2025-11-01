import { useState, useCallback } from 'react';
import { PastelColor, PASTEL_COLORS } from '../src/types/colors';

export const useColorSelector = (initialColor?: string) => {
  const [selectedColor, setSelectedColor] = useState<PastelColor>(
    initialColor 
      ? PASTEL_COLORS.find(color => color.value === initialColor) || PASTEL_COLORS[0]
      : PASTEL_COLORS[0]
  );

  const [isOpen, setIsOpen] = useState(false);

  const selectColor = useCallback((color: PastelColor) => {
    setSelectedColor(color);
    setIsOpen(false);
  }, []);

  const toggleColorPicker = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeColorPicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    selectedColor,
    isOpen,
    selectColor,
    toggleColorPicker,
    closeColorPicker,
    colors: PASTEL_COLORS
  };
};