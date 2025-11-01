export interface PastelColor {
    id: string;
    name: string;
    value: string;
    textColor: string;
}

export const PASTEL_COLORS: PastelColor[] = [
    { id: 'dark-blue', name: 'Azul oscuro', value: '#93C5FD', textColor: '#1E3A8A' },
    { id: 'light-blue', name: 'Azul claro', value: '#BFDBFE', textColor: '#1E40AF' },
    { id: 'dark-green', name: 'Verde oscuro', value: '#86EFAC', textColor: '#166534' },
    { id: 'light-green', name: 'Verde claro', value: '#BBF7D0', textColor: '#15803D' },
    { id: 'red', name: 'Rojo', value: '#FCA5A5', textColor: '#991B1B' },
    { id: 'dark-purple', name: 'Morado oscuro', value: '#D8B4FE', textColor: '#7E22CE' },
    { id: 'light-purple', name: 'Morado claro', value: '#E9D5FF', textColor: '#9333EA' },
    { id: 'yellow', name: 'Amarillo', value: '#FDE68A', textColor: '#92400E' },
    { id: 'orange', name: 'Naranja', value: '#FDBA74', textColor: '#9A3412' },
    { id: 'dark-pink', name: 'Rosa oscuro', value: '#F9A8D4', textColor: '#BE185D' },
    { id: 'light-pink', name: 'Rosa claro', value: '#FBCFE8', textColor: '#DB2777' },
    { id: 'turquoise', name: 'Turquesa', value: '#99F6E4', textColor: '#0F766E' },
    { id: 'gray', name: 'Gris', value: '#D1D5DB', textColor: '#374151' },
    { id: 'brown', name: 'Marrón', value: '#FED7AA', textColor: '#92400E' }
];

// Mapeo directo de color original -> color más claro
export const COLOR_TO_LIGHTER: { [key: string]: string } = {
    '#93C5FD': '#BFDBFE',
    '#BFDBFE': '#DBEAFE',
    '#86EFAC': '#BBF7D0',
    '#BBF7D0': '#DCFCE7',
    '#FCA5A5': '#FECACA',
    '#D8B4FE': '#E9D5FF',
    '#E9D5FF': '#F3E8FF',
    '#FDE68A': '#FEF3C7',
    '#FDBA74': '#FED7AA',
    '#F9A8D4': '#FBCFE8',
    '#FBCFE8': '#FCE7F3',
    '#99F6E4': '#CCFBF1',
    '#D1D5DB': '#E5E7EB',
    '#FED7AA': '#FFEDD5',
};

export const getLighterColor = (originalColor: string): string => {
    return COLOR_TO_LIGHTER[originalColor] || '#BFDBFE';
};