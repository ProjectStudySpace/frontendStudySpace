import React from "react";
import { X } from "lucide-react";

interface ImagePreviewProps {
  file?: File;
  existingUrl?: string;
  onRemove: () => void;
  label: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  existingUrl,
  onRemove,
  label,
}) => {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (existingUrl) {
      setPreview(existingUrl);
    } else {
      setPreview(null);
    }
  }, [file, existingUrl]);

  if (!preview) return null;

  return (
    <div className="relative">
      <div className="text-xs font-medium text-gray-700 mb-2">{label}</div>
      <div className="relative inline-block">
        <img
          src={preview}
          alt={label}
          className="max-w-full h-32 object-contain rounded-lg border border-gray-300"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
          aria-label="Eliminar imagen"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
