import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NoteFormProps } from "../types/notes";
import { ImagePreview } from "./imagePreview";
import { Image as ImageIcon, BookOpen, X } from "lucide-react";

const MAX_IMAGES = 10; // Backend limit per request

export const NoteForm: React.FC<NoteFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(
    initialData?.leftContent || initialData?.rightContent || ""
  );
  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<
    string | undefined
  >(initialData?.leftImageUrl || initialData?.rightImageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.leftContent || initialData.rightContent || "");
      setExistingImageUrl(initialData.leftImageUrl || initialData.rightImageUrl);
    }
  }, [initialData]);

  // Calculate total images count
  const getTotalImagesCount = () => {
    let count = 0;
    if (existingImageUrl) count++;
    count += images.length;
    return count;
  };

  const canAddMoreImages = getTotalImagesCount() < MAX_IMAGES;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFilesArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - getTotalImagesCount();

    if (remainingSlots <= 0) {
      alert(t("forms.maxImagesReached", { max: MAX_IMAGES }));
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < Math.min(newFilesArray.length, remainingSlots); i++) {
      const file = newFilesArray[i];

      if (!file.type.startsWith("image/")) {
        alert(t("forms.invalidImage"));
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(t("forms.imageTooLarge"));
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = () => {
    setExistingImageUrl(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert(t("forms.titleRequired"));
      return;
    }

    if (!content.trim()) {
      alert(t("forms.contentRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim() || undefined,
        leftContent: content,
        rightContent: "",
        leftImages: images,
        rightImages: [],
      });
      if (!isEditing) {
        setTitle("");
        setContent("");
        setImages([]);
        setExistingImageUrl(undefined);
        if (imageInputRef.current) imageInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error al guardar nota:", error);
      alert(t("forms.errorSaving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Header del formulario */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <BookOpen
              className="text-blue-600 dark:text-blue-400"
              size={20}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? t("notes.edit") : t("notes.new")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("forms.ebookFormat")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:cursor-not-allowed"
          aria-label={t("studySession.close")}
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Título obligatorio */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            {t("forms.titleLabel")} <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 text-base"
            placeholder={t("forms.titlePlaceholder")}
            maxLength={200}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {title.length}/200 {t("forms.characters")}
          </p>
        </div>

        {/* Image counter */}
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getTotalImagesCount()}/{MAX_IMAGES} {t("forms.images")}
          </span>
        </div>

        {/* Contenido - Página única estilo ebook */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            {t("forms.contentLabel")} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            disabled={isSubmitting}
            required
            className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 resize-none text-lg leading-relaxed"
            placeholder={t("forms.contentPlaceholder")}
          />
        </div>

        {/* Imagen - Botón azul con placeholder */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={!canAddMoreImages || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon size={18} />
            {t("forms.addImage")}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={!canAddMoreImages || isSubmitting}
            className="hidden"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("forms.optional")} - {t("forms.maxSize")}
          </span>
        </div>

        {/* Preview imagen existente */}
        {existingImageUrl && (
          <div>
            <ImagePreview
              existingUrl={existingImageUrl}
              onRemove={removeExistingImage}
              label={t("forms.image")}
            />
          </div>
        )}

        {/* Preview imagen nueva */}
        {images.length > 0 && (
          <div className="space-y-2">
            {images.map((file, index) => (
              <ImagePreview
                key={index}
                file={file}
                onRemove={() => removeImage(index)}
                label={`${t("forms.image")} ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("forms.saving")}
            </span>
          ) : (
            <span>
              {isEditing ? t("forms.update") : t("forms.create")}{" "}
              {isEditing ? "" : t("forms.note")}
            </span>
          )}
        </button>
      </div>
    </form>
  );
};
