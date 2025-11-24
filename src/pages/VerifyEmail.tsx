import React, { useState, useEffect } from "react";
import { Button, Typography, Alert, CircularProgress } from "@mui/material";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

type VerificationStatus = "verifying" | "success" | "error";

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasVerified, setHasVerified] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      // Prevent multiple verification attempts
      if (hasVerified) return;

      if (!token) {
        setStatus("error");
        setErrorMessage("Token de verificación no encontrado en la URL");
        return;
      }

      setHasVerified(true);

      try {
        await verifyEmail(token);
        setStatus("success");

        // Auto-redirect to topics after 1 second
        setTimeout(() => {
          navigate("/topics");
        }, 1000);
      } catch (error: any) {
        setStatus("error");
        const message =
          error.message || "Error al verificar el correo electrónico";

        // Handle specific error messages
        if (message.includes("Invalid") || message.includes("inválido")) {
          setErrorMessage(
            "El enlace de verificación es inválido o ha expirado."
          );
        } else if (
          message.includes("expired") ||
          message.includes("expirado")
        ) {
          setErrorMessage(
            "El enlace de verificación ha expirado. Solicita uno nuevo."
          );
        } else if (
          message.includes("already verified") ||
          message.includes("ya verificado")
        ) {
          setErrorMessage(
            "Este correo electrónico ya ha sido verificado. Puedes iniciar sesión."
          );
        } else {
          setErrorMessage(message);
        }
      }
    };

    verifyToken();
  }, [token, verifyEmail, navigate, hasVerified]);

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center">
            <CircularProgress size={48} className="mb-4" />
            <Typography
              component="h1"
              variant="h5"
              className="text-gray-900 mb-2"
            >
              Verificando tu correo...
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Por favor espera un momento mientras verificamos tu cuenta.
            </Typography>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <Typography
              component="h1"
              variant="h5"
              className="text-gray-900 mb-2"
            >
              ¡Correo verificado exitosamente!
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-4">
              Tu cuenta ha sido activada. Redirigiendo a tu dashboard...
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Si no eres redirigido automáticamente,{" "}
              <Link to="/topics" className="text-blue-500 hover:text-blue-700">
                haz clic aquí
              </Link>
            </Typography>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <Typography
              component="h1"
              variant="h5"
              className="text-gray-900 mb-2"
            >
              Error de verificación
            </Typography>
            <Alert severity="error" className="mb-6 text-left">
              {errorMessage}
            </Alert>

            <div className="space-y-3">
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Ir al inicio de sesión
              </Button>

              {(errorMessage.includes("expirado") ||
                errorMessage.includes("expired")) && (
                <Button
                  variant="outlined"
                  onClick={() => navigate("/email-sent")}
                  className="w-full"
                >
                  Solicitar nuevo email de verificación
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">{renderContent()}</div>
    </div>
  );
};

export default VerifyEmail;
