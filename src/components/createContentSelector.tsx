import React from "react";
import { FileText, BookOpen, X } from "lucide-react";

interface CreateContentSelectorProps {
  onSelectCard: () => void;
  onSelectNote: () => void;
  onClose: () => void;
}

export const CreateContentSelector: React.FC<CreateContentSelectorProps> = ({
  onSelectCard,
  onSelectNote,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fadeIn">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <h3 className="text-2xl font-bold text-white pr-10">
            ¿Qué quieres crear?
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            Elige el tipo de contenido para tu estudio
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Tarjeta de Estudio */}
          <button
            onClick={onSelectCard}
            className="w-full group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-6 border-2 border-gray-200 group-hover:border-indigo-400 rounded-xl transition-all duration-200 hover:shadow-lg">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-500 group-hover:to-purple-600 flex items-center justify-center transition-all duration-300 shadow-sm">
                  <FileText 
                    size={28} 
                    className="text-indigo-600 group-hover:text-white transition-colors" 
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                    Tarjeta de Estudio
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Formato pregunta-respuesta ideal para <strong>repaso activo</strong> y memorización. 
                    Perfecta para conceptos, definiciones y preguntas de examen.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 font-medium">
                    <span className="bg-indigo-50 px-2 py-1 rounded">Repaso rápido</span>
                    <span className="bg-indigo-50 px-2 py-1 rounded">Con imágenes</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Nota/Apunte */}
          <button
            onClick={onSelectNote}
            className="w-full group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-6 border-2 border-gray-200 group-hover:border-blue-400 rounded-xl transition-all duration-200 hover:shadow-lg">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-green-100 group-hover:from-blue-500 group-hover:to-green-500 flex items-center justify-center transition-all duration-300 shadow-sm">
                  <BookOpen 
                    size={28} 
                    className="text-blue-600 group-hover:text-white transition-colors" 
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    Nota de Estudio
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Formato de <strong>libro abierto</strong> con dos páginas para contenido extenso. 
                    Ideal para apuntes detallados, resúmenes y teoría completa.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-medium">
                    <span className="bg-blue-50 px-2 py-1 rounded">Contenido extenso</span>
                    <span className="bg-blue-50 px-2 py-1 rounded">2 páginas</span>
                    <span className="bg-blue-50 px-2 py-1 rounded">Con imágenes</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition-all rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};