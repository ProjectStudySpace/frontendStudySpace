import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NoteItemProps } from "../types/notes";

import { ImageModal } from "./ImageModal";
import { BookOpen, Edit2, Trash2 } from "lucide-react";
import { NoteBookView } from "../features/notes/bookView/NoteBookView";
import { parseNoteContent } from "../features/notes/bookView/parseNoteContent";

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt?: string;
  } | null>(null);

  const topicColor = note.topic?.color || "#60A5FA";

  // leftContent holds the note title, rightContent holds the note body.
  const displayTitle = note.leftContent || null;
  const displayContent = note.rightContent || "";

  // Figure numbers index the combined list: left images first, then right images.
  const blocks = useMemo(
    () =>
      parseNoteContent(displayContent, [
        ...(note.leftImageUrls || []),
        ...(note.rightImageUrls || []),
      ]),
    [displayContent, note.leftImageUrls, note.rightImageUrls],
  );

  const handleDelete = async () => {
    if (window.confirm(t("reviews.deleteNoteConfirm"))) {
      setIsDeleting(true);
      try {
        await onDelete(note.id);
      } catch (error) {
        console.error("Error deleting note:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleImageClick = (imageUrl: string, figureNumber: number) => {
    setSelectedImage({
      url: imageUrl,
      alt: t("components.noteBook.figureAlt", { number: figureNumber }),
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Topic header: tinted in light mode, solid in dark mode */}
        <div
          className="px-4 py-2 bg-[color-mix(in_srgb,var(--topic-color)_50%,transparent)] dark:bg-[var(--topic-color)]"
          style={{ "--topic-color": topicColor } as React.CSSProperties}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-gray-700" />
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {note.topic?.name || t("content.noTopic")}
              </h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(note)}
                className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                style={{ color: '#666' }}
                title={t("common.edit")}
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                style={{ color: '#dc2626' }}
                title={t("common.delete")}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Open-book reader */}
        <div className="px-5 py-6 md:px-10 md:py-8">
          <NoteBookView
            title={displayTitle}
            blocks={blocks}
            accentColor={topicColor}
            onImageClick={handleImageClick}
          />
        </div>
      </div>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          altText={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};
