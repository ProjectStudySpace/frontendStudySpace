import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NoteFormProps } from "../types/notes";
import { ImagePreview } from "./imagePreview";
import { Image as ImageIcon, BookOpen, X } from "lucide-react";

export const NoteForm: React.FC<NoteFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || "");
  const [leftContent, setLeftContent] = useState(
    initialData?.leftContent || ""
  );
  const [rightContent, setRightContent] = useState(
    initialData?.rightContent || ""
  );
  const [leftImage, setLeftImage] = useState<File | undefined>();
  const [rightImage, setRightImage] = useState<File | undefined>();
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
      setTitle(initialData.title || "");
      setLeftContent(initialData.leftContent);
      setRightContent(initialData.rightContent);
      setExistingLeftImageUrl(initialData.leftImageUrl);
      setExistingRightImageUrl(initialData.rightImageUrl);
    }
  }, [initialData]);

  const handleLeftImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert(t("forms.invalidImage"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(t("forms.imageTooLarge"));
        return;
      }
      setLeftImage(file);
      setExistingLeftImageUrl(undefined);
    }
  };

  const handleRightImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert(t("forms.invalidImage"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(t("forms.imageTooLarge"));
        return;
      }
      setRightImage(file);
      setExistingRightImageUrl(undefined);
    }
  };

  const removeLeftImage = () => {
    setLeftImage(undefined);
    setExistingLeftImageUrl(undefined);
    if (leftImageInputRef.current) {
      leftImageInputRef.current.value = "";
    }
  };

  const removeRightImage = () => {
    setRightImage(undefined);
    setExistingRightImageUrl(undefined);
    if (rightImageInputRef.current) {
      rightImageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leftContent.trim() && !rightContent.trim()) {
      alert(t("forms.atLeastOnePage"));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        leftContent,
        rightContent,
        leftImage,
        rightImage,
      });
      if (!isEditing) {
        setTitle("");
        setLeftContent("");
        setRightContent("");
        setLeftImage(undefined);
        setRightImage(undefined);
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
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 max-w-6xl mx-auto"
    >
      {/* Header del formulario */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/50 dark:to-green-900/50 rounded-lg flex items-center justify-center">
            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? t("notes.edit") : t("notes.new")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("forms.bookFormat")}</p>
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

      {/* Título opcional */}
      <div className="mb-6">
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          {t("forms.titleLabel")}{" "}
          <span className="text-gray-400 dark:text-gray-500 font-normal">
            {t("forms.titleOptional")}
          </span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 text-base"
          placeholder={t("forms.titlePlaceholder")}
          maxLength={200}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {title.length}/200 {t("forms.characters")}
        </p>
      </div>

      {/* Contenido en dos columnas (libro abierto) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Página izquierda */}
        <div className="bg-gradient-to-br from-blue-50/30 to-white dark:from-blue-900/20 dark:to-gray-800 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            <label
              htmlFor="leftContent"
              className="block text-sm font-semibold text-blue-700 dark:text-blue-300"
            >
              {t("forms.leftPage")}
            </label>
          </div>

          <textarea
            id="leftContent"
            value={leftContent}
            onChange={(e) => setLeftContent(e.target.value)}
            rows={14}
            disabled={isSubmitting}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 resize-none text-sm scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
            placeholder={t("forms.leftPagePlaceholder")}
          />

          {/* Imagen página izquierda - opcional */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => leftImageInputRef.current?.click()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon size={16} />
              {leftImage || existingLeftImageUrl
                ? t("forms.changeImage")
                : t("forms.addImage")}
            </button>
            <input
              ref={leftImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleLeftImageChange}
              disabled={isSubmitting}
              className="hidden"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t("forms.optional")} - {t("forms.maxSize")}
            </span>
          </div>

          {/* Preview imagen izquierda */}
          {(leftImage || existingLeftImageUrl) && (
            <div className="mt-3">
              <ImagePreview
                file={leftImage}
                existingUrl={existingLeftImageUrl}
                onRemove={removeLeftImage}
                label={t("forms.leftPageImage")}
              />
            </div>
          )}
        </div>

        {/* Página derecha */}
        <div className="bg-gradient-to-bl from-green-50/30 to-white dark:from-green-900/20 dark:to-gray-800 p-5 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
            <label
              htmlFor="rightContent"
              className="block text-sm font-semibold text-green-700 dark:text-green-300"
            >
              {t("forms.rightPage")}
            </label>
          </div>

          <textarea
            id="rightContent"
            value={rightContent}
            onChange={(e) => setRightContent(e.target.value)}
            rows={14}
            disabled={isSubmitting}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 resize-none text-sm scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
            placeholder={t("forms.rightPagePlaceholder")}
          />

          {/* Imagen página derecha - opcional */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => rightImageInputRef.current?.click()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon size={16} />
              {rightImage || existingRightImageUrl
                ? t("forms.changeImage")
                : t("forms.addImage")}
            </button>
            <input
              ref={rightImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleRightImageChange}
              disabled={isSubmitting}
              className="hidden"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t("forms.optional")} - {t("forms.maxSize")}
            </span>
          </div>

          {/* Preview imagen derecha */}
          {(rightImage || existingRightImageUrl) && (
            <div className="mt-3">
              <ImagePreview
                file={rightImage}
                existingUrl={existingRightImageUrl}
                onRemove={removeRightImage}
                label={t("forms.rightPageImage")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>{t("forms.noteInfoBold")}</strong> {t("forms.noteInfo")}
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 text-white rounded-lg font-medium transition-all disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
};
