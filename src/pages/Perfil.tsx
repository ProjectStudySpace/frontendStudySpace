import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, TrendingUp, Calendar, Trash2, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../context/AuthContext";
import { ToggleSwitch } from "../components/toggleSwitch";
import { ConfirmationModal } from "../components/confirmationModal";
import { PasswordChangeModal } from "../components/passwordChangeModal";
import { api } from "../utils/axiosConfig";
import { API_URL } from "../config";

const Perfil = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: authUser, logout } = useAuth();
  const { profileData, loading, deleteAccount } = useProfile();

  // States for Google Calendar
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [checkingCalendar, setCheckingCalendar] = useState(true);

  // Modal states
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
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
      alert(t("profile.disconnectSuccess"));
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      alert(t("profile.disconnectError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelDisconnect = () => {
    setShowDisconnectModal(false);
    // Revert toggle to ON state (since user cancelled disconnect)
    setIsCalendarConnected(true);
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      setIsProcessing(true);
      
      console.log("Attempting password change...");
      
      const response = await api.put("/users/update-password", {
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      console.log("Password change response:", response);
      
      // Check for explicit success indicators in response
      const isSuccess = response.data && (
        response.data.success === true || 
        response.data.message?.includes('success') ||
        response.status === 200
      );
      
      if (isSuccess) {
        alert("¡Contraseña cambiada exitosamente! Serás redirigido al login.");
        setShowPasswordChangeModal(false);
        
        // Logout user after successful password change for security
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 1500);
      } else {
        // If no explicit success indicator, treat as failure
        throw new Error("Password change failed - server returned no success confirmation");
      }
      
    } catch (error: any) {
      console.error("Error changing password:", error);
      
      // Extract error message from backend response
      let errorMessage = "Error al cambiar la contraseña";
      
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error status:", error.response.status);
        
        // Handle different response formats
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data && typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
        
        // Handle specific status codes
        if (error.response.status === 401) {
          errorMessage = "La contraseña actual es incorrecta";
        } else if (error.response.status === 400) {
          errorMessage = "Los datos proporcionados no son válidos";
        } else if (error.response.status === 409) {
          errorMessage = "La nueva contraseña no cumple con los requisitos";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async (password?: string) => {
    if (!password) return;

    try {
      setIsProcessing(true);
      await deleteAccount({ password });
      alert(t("profile.deleteSuccess"));
      
      // Call auth logout to properly clear the authentication state
      // Instead of manually manipulating localStorage
      await logout();
      
      // Navigate to landing page
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(error.message || t("profile.deleteError"));
    } finally {
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  if (loading || checkingCalendar) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">{t("profile.loading")}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="flex items-center gap-6">
          {/* Avatar - Placeholder for future implementation */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {authUser?.name 
              ? authUser.name[0]?.toUpperCase()
              : profileData?.user?.name
                ? profileData.user.name[0]?.toUpperCase()
                : profileData?.user?.email?.[0]?.toUpperCase() || 
                  authUser?.email?.[0]?.toUpperCase() || 
                  "U"}
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {authUser?.name 
                ? authUser.name 
                : profileData?.user?.name 
                  ? profileData.user.name
                  : t("profile.user")
              }
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <User size={18} />
              {authUser?.email || profileData?.user?.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("profile.memberSince")}{" "}
              {profileData?.user?.createdAt
                ? new Date(profileData.user.createdAt).toLocaleDateString(
                    "es-ES",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30">
            <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("profile.statistics")}
          </h2>
        </div>

        {/* Placeholder for future statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {t("stats.activeTopics")}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profileData?.stats?.totalTopics || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {t("stats.totalCards")}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profileData?.stats?.totalCards || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {t("stats.currentStreak")}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profileData?.stats?.currentStreak || 0} {t("stats.days")}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 italic">
          {t("profile.moreStatsSoon")}
        </p>
      </div>

      {/* Google Calendar Connection Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
            <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("profile.googleCalendar")}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Google Calendar Toggle */}
          <ToggleSwitch
            checked={isCalendarConnected}
            onChange={(checked) => {
              if (checked) {
                // User wants to connect - redirect to Google OAuth
                const token = localStorage.getItem("token");
                if (!token) {
                  alert(t("auth.invalidCredentials"));
                  return;
                }

                const url = `${API_URL}/auth/google/connect?token=${encodeURIComponent(token)}`;
                window.location.href = url;
              } else {
                // User wants to disconnect - show confirmation modal
                setShowDisconnectModal(true);
              }
            }}
            label={t("profile.connectCalendar")}
            disabled={false}
          />

          {!isCalendarConnected && (
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">
              {t("profile.noCalendarConnected")}
            </p>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
            <Lock size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("profile.changePassword")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("profile.changePasswordDescription")}
            </p>
          </div>
          <button
            onClick={() => setShowPasswordChangeModal(true)}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Lock size={18} />
            {t("profile.changePassword")}
          </button>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <Trash2 size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("profile.deleteAccountTitle")}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Delete Account Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors border border-red-300 dark:border-red-700"
          >
            {t("profile.deleteAccount")}
          </button>
        </div>
      </div>

      {/* Disconnect Calendar Modal */}
      <ConfirmationModal
        isOpen={showDisconnectModal}
        onClose={handleCancelDisconnect}
        onConfirm={handleDisconnectCalendar}
        title={t("profile.disconnectCalendar")}
        message={t("profile.disconnectCalendarMessage")}
        confirmText={t("profile.disconnectCalendar")}
        cancelText={t("common.cancel")}
        isLoading={isProcessing}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title={t("profile.deleteAccount")}
        message={t("profile.deleteConfirmMessage")}
        confirmText={t("profile.deleteAccount")}
        cancelText={t("common.cancel")}
        requirePassword={true}
        isDangerous={true}
        isLoading={isProcessing}
      />

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        onConfirm={handlePasswordChange}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default Perfil;
