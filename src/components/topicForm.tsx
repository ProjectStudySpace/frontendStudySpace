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

      <div className="flex gap-3 justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:bg-indigo-300 dark:disabled:bg-indigo-800"
        >
          {isSubmitting
            ? t("forms.saving")
            : isEditing
            ? t("forms.update")
            : t("forms.create")}{" "}
          {t("forms.topic")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md font-medium transition-colors"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
};
