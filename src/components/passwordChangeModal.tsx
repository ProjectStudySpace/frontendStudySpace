import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Lock, AlertTriangle, Check } from "lucide-react";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (currentPassword: string, newPassword: string, confirmPassword: string) => void;
  isLoading?: boolean;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword) {
      newErrors.currentPassword = t("profile.passwordChange.currentPasswordRequired");
    }

    if (!newPassword) {
      newErrors.newPassword = t("profile.passwordChange.newPasswordRequired");
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t("profile.passwordChange.passwordTooShort");
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("profile.passwordChange.confirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("profile.passwordChange.passwordsDoNotMatch");
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(currentPassword, newPassword, confirmPassword);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: t("profile.passwordChange.weak"), color: "text-red-500" };
    if (password.length < 8) return { strength: 2, label: t("profile.passwordChange.fair"), color: "text-yellow-500" };
    return { strength: 3, label: t("profile.passwordChange.strong"), color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Lock size={20} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {t("profile.passwordChange.title")}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6">{t("profile.passwordChange.message")}</p>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Current Password */}
          <div>
            <label
              htmlFor="current-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("profile.passwordChange.currentPassword")}
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setErrors(prev => ({ ...prev, currentPassword: "" }));
              }}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={t("profile.passwordChange.enterCurrentPassword")}
              autoFocus
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle size={14} />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("profile.passwordChange.newPassword")}
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors(prev => ({ ...prev, newPassword: "" }));
              }}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={t("profile.passwordChange.enterNewPassword")}
            />
            {newPassword && (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.strength === 1 ? "bg-red-500 w-1/3" :
                      passwordStrength.strength === 2 ? "bg-yellow-500 w-2/3" :
                      passwordStrength.strength === 3 ? "bg-green-500 w-full" :
                      "w-0"
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle size={14} />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("profile.passwordChange.confirmPassword")}
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors(prev => ({ ...prev, confirmPassword: "" }));
                }}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={t("profile.passwordChange.confirmNewPassword")}
              />
              {confirmPassword && newPassword === confirmPassword && newPassword.length > 0 && (
                <Check size={18} className="absolute right-3 top-2.5 text-green-500" />
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle size={14} />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("profile.passwordChange.changing")}
              </>
            ) : (
              t("profile.passwordChange.changePassword")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};