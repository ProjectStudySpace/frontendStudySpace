import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  TopicFormProps,
  CreateTopicData,
  UpdateTopicData,
} from "../types/topics";
import { useColorSelector } from "../../hooks/useColor";
import { ColorSelector } from "./colorSelector";
import { PastelColor } from "../types/colors";

const getDefaultColor = () => "#93C5FD";

export const TopicForm: React.FC<TopicFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorSelector = useColorSelector(initialData?.color);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = {
        name,
        description: description || undefined,
        color: colorSelector.selectedColor.value,
      };

      await onSubmit(formData);

      if (!isEditing) {
        setName("");
        setDescription("");
      }
    } catch (error) {
      console.error("Error al guardar tema:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-purple-300 dark:border-purple-700 max-w-md mx-auto space-y-4"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("forms.topicName")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("forms.description")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Selector de color */}
      <div className="mb-6">
        <ColorSelector
          selectedColor={colorSelector.selectedColor}
          onColorSelect={colorSelector.selectColor}
          isOpen={colorSelector.isOpen}
          onToggle={colorSelector.toggleColorPicker}
          onClose={colorSelector.closeColorPicker}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("forms.selectColor")}</p>
      </div>

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
              {isEditing ? "" : t("forms.topic")}
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
