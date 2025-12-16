import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Container, Alert } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserTimezone } from "../utils/dateUtils";
import { useTranslation } from "react-i18next";
import GoogleSignInButton from "../components/GoogleSignInButton";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userTimezone, setUserTimezone] = useState("");
  const [showUnverifiedMessage, setShowUnverifiedMessage] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const {
    login,
    resendVerification,
    isAuthenticated,
    loginWithGoogle,
    handleGoogleCallback,
  } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Capturar zona horaria del navegador al cargar el componente
    const timezone = getUserTimezone();
    setUserTimezone(timezone);
  }, []);

  // Handle Google OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("google_auth") || urlParams.get("error")) {
      handleGoogleCallback();
    }
  }, [handleGoogleCallback]);

  // Redirect to topics when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/topics");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowUnverifiedMessage(false);

    try {
      const success = await login(email, password);
      if (!success) {
        setError(t("auth.invalidCredentials"));
      }
      // Navigation will be handled by the useEffect above when isAuthenticated becomes true
    } catch (error: any) {
      if (error.message === "EMAIL_NOT_VERIFIED") {
        setShowUnverifiedMessage(true);
      } else {
        setError(t("auth.invalidCredentials"));
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      await resendVerification(email);
      // Success message is shown by the function
    } catch (error) {
      setError(t("auth.accountCreationError"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <Typography className="welcome-message" component="h1" gutterBottom>
          {t("auth.welcome")}
        </Typography>
        <Typography className="subtitle" gutterBottom>
          {t("auth.accessAccount")}
        </Typography>
        {error && (
          <Alert className="error-alert" severity="error">
            {error}
          </Alert>
        )}

        {showUnverifiedMessage && (
          <Alert className="error-alert" severity="warning">
            <div className="mb-2">{t("auth.emailNotVerified")}</div>
            <div className="mb-3">{t("auth.checkEmailInstructions")}</div>
            <Button
              variant="outlined"
              size="small"
              onClick={handleResendVerification}
              disabled={isResending}
              className="mt-2"
            >
              {isResending
                ? t("auth.sending")
                : t("auth.resendVerificationEmail")}
            </Button>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth className="MuiButton-root">
            {t("auth.login")}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">{t("auth.or")}</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In Button */}
        <GoogleSignInButton onClick={loginWithGoogle} variant="login" />

        <div className="mt-6">
          <Typography>
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              {t("auth.registerHere")}
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Login;
