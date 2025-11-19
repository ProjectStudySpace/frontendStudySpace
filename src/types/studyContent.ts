import { Card } from "./cards";
import { Note } from "./notes";

export type StudyContentType = 'card' | 'note';

export interface StudyContentBase {
  id: number;
  topic: {
    id: number;
    name: string;
    color: string;
  };
  contentType: StudyContentType;
  createdAt?: string;
  updatedAt?: string;
}

// Tarjeta de estudio con tipo
export interface StudyCard extends Card {
  contentType: 'card';
}

// Nota con tipo  
export interface StudyNote extends Note {
  contentType: 'note';
}

// Tipo unión para todo el contenido de estudio
export type StudyContent = StudyCard | StudyNote;

// Helper functions para type guards
export function isCard(content: StudyContent): content is StudyCard {
  return content.contentType === 'card';
}

export function isNote(content: StudyContent): content is StudyNote {
  return content.contentType === 'note';
}

// Función para obtener el título/descripción del contenido
export function getContentPreview(content: StudyContent): string {
  if (isCard(content)) {
    return content.question;
  } else {
    return content.title || "Nota sin título";
  }
}

// Función para obtener imágenes del contenido
export function getContentImages(content: StudyContent): Array<{url: string, alt?: string}> {
  const images: Array<{url: string, alt?: string}> = [];
  
  if (isCard(content)) {
    // Imágenes de tarjetas
    if (content.images) {
      content.images.forEach(img => {
        images.push({
          url: img.imageUrl,
          alt: img.altText
        });
      });
    }
  } else {
    // Imágenes de notas
    if (content.leftImageUrl) {
      images.push({
        url: content.leftImageUrl,
        alt: "Imagen página izquierda"
      });
    }
    if (content.rightImageUrl) {
      images.push({
        url: content.rightImageUrl,
        alt: "Imagen página derecha"
      });
    }
  }
  
  return images;
}