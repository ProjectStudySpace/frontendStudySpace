import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, TrendingUp, Calendar, Trash2 } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { ToggleSwitch } from "../components/toggleSwitch";
import { ConfirmationModal } from "../components/confirmationModal";
import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Perfil = () => {
  const navigate = useNavigate();
  const { profileData, loading, deleteAccount } = useProfile();
  
  // States for Google Calendar
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [checkingCalendar, setCheckingCalendar] = useState(true);
  
  // Modal states
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check Google Calendar connection status
  React.useEffect(() => {
    const checkCalendarStatus = async () => {
      try {
        const { data } = await api.get("/auth/google/status");
        setIsCalendarConnected(data.authenticated || false);
      } catch (error) {
        console.error("Error checking calendar status:", error);
        setIsCalendarConnected(false);
      } finally {
        setCheckingCalendar(false);
      }
    };
    checkCalendarStatus();
  }, []);

  const handleDisconnectCalendar = async () => {
    try {
      setIsProcessing(true);
      await api.post("/auth/google/disconnect");
      setIsCalendarConnected(false);
      setShowDisconnectModal(false);
      alert("Google Calendar desconectado exitosamente");
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      alert("Error al desconectar Google Calendar. Por favor, intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async (password?: string) => {
    if (!password) return;

    try {
      setIsProcessing(true);
      await deleteAccount({ password });
      alert("Cuenta eliminada exitosamente");
      localStorage.removeItem("token");
      localStorage.removeItem("userTimezone");
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(error.message || "Error al eliminar la cuenta. Verifica tu contraseña.");
    } finally {
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  if (loading || checkingCalendar) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-6">
          {/* Avatar - Placeholder for future implementation */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {profileData?.user?.name?.[0]?.toUpperCase() || 
             profileData?.user?.email?.[0]?.toUpperCase() || 
             "U"}
          </div>
          
          {/* User Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profileData?.user?.name || "Usuario"}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <User size={18} />
              {profileData?.user?.email}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Miembro desde{" "}
              {profileData?.user?.createdAt
                ? new Date(profileData.user.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>
          </div>
        </div>
        
        {/* Future: Upload Avatar functionality */}
        {/* 
        <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
          Cambiar foto de perfil
        </button>
        */}
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100">
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>
        </div>
        
        {/* Placeholder for future statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Materias activas</p>
            <p className="text-3xl font-bold text-gray-900">
              {profileData?.stats?.totalTopics || 0}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Tarjetas totales</p>
            <p className="text-3xl font-bold text-gray-900">
              {profileData?.stats?.totalCards || 0}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Racha actual</p>
            <p className="text-3xl font-bold text-gray-900">
              {profileData?.stats?.currentStreak || 0} días
            </p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-4 italic">
          Más estadísticas próximamente...
        </p>
      </div>

      {/* Google Calendar Connection Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <Calendar size={20} className="text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Conexión con Google Calendar</h2>
        </div>

        <div className="space-y-4">
          {/* Google Calendar Toggle */}
          <ToggleSwitch
            checked={isCalendarConnected}
            onChange={() => {
              if (isCalendarConnected) {
                setShowDisconnectModal(true);
              }
            }}
            label="Conectar MemoPal con Google Calendar"
            disabled={false}
          />

          {!isCalendarConnected && (
            <p className="text-sm text-gray-500 ml-4">
              No hay ninguna cuenta de Google Calendar conectada
            </p>
          )}
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
            <Trash2 size={20} className="text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Eliminar usuario y datos asociados</h2>
        </div>

        <div className="space-y-4">
          {/* Delete Account Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors border border-red-300"
          >
            Eliminar cuenta de usuario
          </button>
        </div>
      </div>

      {/* Disconnect Calendar Modal */}
      <ConfirmationModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleDisconnectCalendar}
        title="Desconectar Google Calendar"
        message="¿Estás seguro de que quieres desconectar tu cuenta de Google Calendar? Las sesiones programadas dejarán de sincronizarse automáticamente."
        confirmText="Desconectar"
        cancelText="Cancelar"
        isLoading={isProcessing}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Eliminar cuenta"
        message="⚠️ Esta acción es irreversible y eliminará todos tus datos permanentemente, incluyendo materias, tarjetas, notas y sesiones de estudio. Por favor, confirma tu contraseña para continuar."
        confirmText="Eliminar mi cuenta"
        cancelText="Cancelar"
        requirePassword={true}
        isDangerous={true}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default Perfil;