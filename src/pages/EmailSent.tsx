import React, { useState, useEffect } from "react";
import { Button, Typography, Alert } from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const EmailSent: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const { resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Get email and language from navigation state
  const { email, language } = location.state || {};

  useEffect(() => {
    // If no email in state, redirect to register
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      await resendVerification(email);
      // Success message is shown by the function
    } catch (error) {
      console.error("Error resending verification:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Email Icon */}
          <div className="mx-auto h-16 w-16 text-blue-500 mb-4">📧</div>

          {/* Title */}
          <Typography
            component="h1"
            variant="h4"
            className="text-gray-900 font-bold mb-2"
          >
            {language === "es" ? "¡Revisa tu correo!" : "Check your email!"}
          </Typography>

          {/* Subtitle */}
          <Typography variant="body1" className="text-gray-600 mb-4">
            {language === "es"
              ? "Te hemos enviado un correo de verificación a:"
              : "We sent a verification email to:"}
          </Typography>

          {/* Email Display */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <Typography variant="h6" className="text-gray-900 font-mono">
              {email}
            </Typography>
          </div>

          {/* Instructions */}
          <Typography variant="body2" className="text-gray-600 mb-6">
            {language === "es"
              ? "Haz clic en el enlace del correo para verificar tu cuenta y comenzar a usar MemoPal."
              : "Click the link in the email to verify your account and start using MemoPal."}
          </Typography>

          {/* Spam Notice */}
          <Alert severity="info" className="mb-6">
            {language === "es"
              ? "Revisa tu carpeta de spam si no lo ves en tu bandeja de entrada."
              : "Check your spam folder if you don't see it in your inbox."}
          </Alert>

          {/* Resend Button */}
          <div className="mb-6">
            <Button
              variant="outlined"
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full"
            >
              {isResending
                ? language === "es"
                  ? "Enviando..."
                  : "Sending..."
                : language === "es"
                ? "Reenviar email de verificación"
                : "Resend verification email"}
            </Button>
          </div>

          {/* Back to Login Link */}
          <Typography variant="body2" className="text-gray-600">
            {language === "es"
              ? "¿Ya verificaste tu cuenta?"
              : "Already verified your account?"}{" "}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              {language === "es" ? "Ir al inicio de sesión" : "Go to login"}
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default EmailSent;
