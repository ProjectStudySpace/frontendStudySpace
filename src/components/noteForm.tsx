import React, { useState, useEffect, useRef } from "react";
import { NoteFormProps } from "../types/notes";
import { ImagePreview } from "./imagePreview";
import { Image as ImageIcon, BookOpen, X } from "lucide-react";

export const NoteForm: React.FC<NoteFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [leftContent, setLeftContent] = useState(initialData?.leftContent || "");
  const [rightContent, setRightContent] = useState(initialData?.rightContent || "");
  const [leftImage, setLeftImage] = useState<File | undefined>();
  const [rightImage, setRightImage] = useState<File | undefined>();
  const [existingLeftImageUrl, setExistingLeftImageUrl] = useState<string | undefined>(
    initialData?.leftImageUrl
  );
  const [existingRightImageUrl, setExistingRightImageUrl] = useState<string | undefined>(
    initialData?.rightImageUrl
  );
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
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5MB");
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
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5MB");
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
      alert("Al menos una página debe tener contenido");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim() || undefined,
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
      alert("Error al guardar la nota. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 max-w-6xl mx-auto"
    >
      {/* Header del formulario */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
            <BookOpen className="text-indigo-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Editar Nota" : "Nueva Nota"}
            </h2>
            <p className="text-sm text-gray-500">
              Formato de libro abierto con dos páginas
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>
      </div>

      {/* Título opcional */}
      <div className="mb-6">
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Título <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 text-base"
          placeholder="Ej: Introducción a las Integrales (opcional)"
          maxLength={200}
        />
        <p className="mt-1 text-xs text-gray-500">
          {title.length}/200 caracteres
        </p>
      </div>

      {/* Contenido en dos columnas (libro abierto) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Página izquierda */}
        <div className="bg-gradient-to-br from-blue-50/30 to-white p-5 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <label
              htmlFor="leftContent"
              className="block text-sm font-semibold text-blue-700"
            >
              Página Izquierda
            </label>
          </div>
          
          <textarea
            id="leftContent"
            value={leftContent}
            onChange={(e) => setLeftContent(e.target.value)}
            rows={14}
            disabled={isSubmitting}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 resize-none text-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            placeholder="Escribe aquí el contenido de la página izquierda...&#10;&#10;Puedes escribir varias líneas y todo el texto que necesites."
          />

          {/* Imagen página izquierda - opcional */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => leftImageInputRef.current?.click()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon size={16} />
              {leftImage || existingLeftImageUrl
                ? "Cambiar imagen"
                : "Agregar imagen"}
            </button>
            <input
              ref={leftImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleLeftImageChange}
              disabled={isSubmitting}
              className="hidden"
            />
            <span className="text-xs text-gray-500">Opcional - Máx. 5MB</span>
          </div>

          {/* Preview imagen izquierda */}
          {(leftImage || existingLeftImageUrl) && (
            <div className="mt-3">
              <ImagePreview
                file={leftImage}
                existingUrl={existingLeftImageUrl}
                onRemove={removeLeftImage}
                label="Imagen página izquierda"
              />
            </div>
          )}
        </div>

        {/* Página derecha */}
        <div className="bg-gradient-to-bl from-green-50/30 to-white p-5 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <label
              htmlFor="rightContent"
              className="block text-sm font-semibold text-green-700"
            >
              Página Derecha
            </label>
          </div>
          
          <textarea
            id="rightContent"
            value={rightContent}
            onChange={(e) => setRightContent(e.target.value)}
            rows={14}
            disabled={isSubmitting}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 resize-none text-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            placeholder="Escribe aquí el contenido de la página derecha...&#10;&#10;Puedes escribir varias líneas y todo el texto que necesites."
          />

          {/* Imagen página derecha - opcional */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => rightImageInputRef.current?.click()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon size={16} />
              {rightImage || existingRightImageUrl
                ? "Cambiar imagen"
                : "Agregar imagen"}
            </button>
            <input
              ref={rightImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleRightImageChange}
              disabled={isSubmitting}
              className="hidden"
            />
            <span className="text-xs text-gray-500">Opcional - Máx. 5MB</span>
          </div>

          {/* Preview imagen derecha */}
          {(rightImage || existingRightImageUrl) && (
            <div className="mt-3">
              <ImagePreview
                file={rightImage}
                existingUrl={existingRightImageUrl}
                onRemove={removeRightImage}
                label="Imagen página derecha"
              />
            </div>
          )}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> El título y las imágenes son opcionales. Al menos una de las dos páginas debe tener contenido.
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </span>
          ) : (
            <span>{isEditing ? "Actualizar" : "Crear"} Nota</span>
          )}
        </button>
      </div>
    </form>
  );
};