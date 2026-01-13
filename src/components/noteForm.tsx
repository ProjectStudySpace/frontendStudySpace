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
  // leftContent = question = título de la nota
  const [leftContent, setLeftContent] = useState(initialData?.leftContent || "");
  // rightContent = answer = contenido de la nota
  const [rightContent, setRightContent] = useState(initialData?.rightContent || "");
  const [leftImages, setLeftImages] = useState<File[]>([]);
  const [rightImages, setRightImages] = useState<File[]>([]);
  const [existingLeftImageUrl, setExistingLeftImageUrl] = useState<
    string | undefined
  >(initialData?.leftImageUrl);
  const [existingRightImageUrl, setExistingRightImageUrl] = useState<
    string | undefined
  >(initialData?.rightImageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leftImageInputRef = useRef<HTMLInputElement>(null);
  const rightImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setLeftContent(initialData.leftContent || "");
      setRightContent(initialData.rightContent || "");
      setExistingLeftImageUrl(initialData.leftImageUrl);
      setExistingRightImageUrl(initialData.rightImageUrl);
    }
  }, [initialData]);

  // Calculate total images count
  const getTotalImagesCount = () => {
    let count = 0;
    if (existingLeftImageUrl) count++;
    if (existingRightImageUrl) count++;
    count += leftImages.length;
    count += rightImages.length;
    return count;
  };

  const canAddMoreImages = getTotalImagesCount() < MAX_IMAGES;

  const handleLeftImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFilesArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - getTotalImagesCount();

    if (remainingSlots <= 0) {
      alert(t("forms.maxImagesReached", { max: MAX_IMAGES }));
      if (leftImageInputRef.current) leftImageInputRef.current.value = "";
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
      setLeftImages((prev) => [...prev, ...validFiles]);
    }

    if (leftImageInputRef.current) {
      leftImageInputRef.current.value = "";
    }
  };

  const handleRightImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFilesArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - getTotalImagesCount();

    if (remainingSlots <= 0) {
      alert(t("forms.maxImagesReached", { max: MAX_IMAGES }));
      if (rightImageInputRef.current) rightImageInputRef.current.value = "";
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
      setRightImages((prev) => [...prev, ...validFiles]);
    }

    if (rightImageInputRef.current) {
      rightImageInputRef.current.value = "";
    }
  };

  const removeLeftImage = (index: number) => {
    setLeftImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeRightImage = (index: number) => {
    setRightImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingLeftImage = () => {
    setExistingLeftImageUrl(undefined);
  };

  const removeExistingRightImage = () => {
    setExistingRightImageUrl(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leftContent.trim()) {
      alert(t("forms.titleRequired"));
      return;
    }

    if (!rightContent.trim()) {
      alert(t("forms.contentRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        leftContent: leftContent.trim(),
        rightContent: rightContent.trim(),
        leftImages: leftImages,
        rightImages: rightImages,
      });
      if (!isEditing) {
        setLeftContent("");
        setRightContent("");
        setLeftImages([]);
        setRightImages([]);
        setExistingLeftImageUrl(undefined);
        setExistingRightImageUrl(undefined);
        if (leftImageInputRef.current) leftImageInputRef.current.value = "";
        if (rightImageInputRef.current) rightImageInputRef.current.value = "";
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
        {/* Título obligatorio - se mapea a leftContent (question) */}
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
            value={leftContent}
            onChange={(e) => setLeftContent(e.target.value)}
            disabled={isSubmitting}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 text-base"
            placeholder={t("forms.titlePlaceholder")}
            maxLength={200}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {leftContent.length}/200 {t("forms.characters")}
          </p>
        </div>

        {/* Image counter */}
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getTotalImagesCount()}/{MAX_IMAGES} {t("forms.images")}
          </span>
        </div>

        {/* Contenido - se mapea a rightContent (answer) */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            {t("forms.contentLabel")} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={rightContent}
            onChange={(e) => setRightContent(e.target.value)}
            rows={16}
            disabled={isSubmitting}
            required
            className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 resize-none text-lg leading-relaxed"
            placeholder={t("forms.contentPlaceholder")}
          />
        </div>

        {/* Imagen del título - Botón azul con placeholder */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => leftImageInputRef.current?.click()}
            disabled={!canAddMoreImages || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon size={18} />
            {t("forms.addImage")}
          </button>
          <input
            ref={leftImageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleLeftImageChange}
            disabled={!canAddMoreImages || isSubmitting}
            className="hidden"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("forms.optional")} - {t("forms.maxSize")}
          </span>
        </div>

        {/* Preview imagen existente del título */}
        {existingLeftImageUrl && (
          <div>
            <ImagePreview
              existingUrl={existingLeftImageUrl}
              onRemove={removeExistingLeftImage}
              label={t("forms.image")}
            />
          </div>
        )}

        {/* Preview imagen nueva del título */}
        {leftImages.length > 0 && (
          <div className="space-y-2">
            {leftImages.map((file, index) => (
              <ImagePreview
                key={index}
                file={file}
                onRemove={() => removeLeftImage(index)}
                label={`${t("forms.image")} ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Imagen del contenido - Botón azul con placeholder */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => rightImageInputRef.current?.click()}
            disabled={!canAddMoreImages || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon size={18} />
            {t("forms.addImage")}
          </button>
          <input
            ref={rightImageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleRightImageChange}
            disabled={!canAddMoreImages || isSubmitting}
            className="hidden"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("forms.optional")} - {t("forms.maxSize")}
          </span>
        </div>

        {/* Preview imagen existente del contenido */}
        {existingRightImageUrl && (
          <div>
            <ImagePreview
              existingUrl={existingRightImageUrl}
              onRemove={removeExistingRightImage}
              label={t("forms.image")}
            />
          </div>
        )}

        {/* Preview imagen nueva del contenido */}
        {rightImages.length > 0 && (
          <div className="space-y-2">
            {rightImages.map((file, index) => (
              <ImagePreview
                key={index}
                file={file}
                onRemove={() => removeRightImage(index)}
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
