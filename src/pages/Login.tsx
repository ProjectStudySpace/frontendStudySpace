import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Container, Alert } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserTimezone } from "../utils/dateUtils";
import { useTranslation } from "react-i18next";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userTimezone, setUserTimezone] = useState("");
  const [showUnverifiedMessage, setShowUnverifiedMessage] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Capturar zona horaria del navegador al cargar el componente
    const timezone = getUserTimezone();
    setUserTimezone(timezone);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowUnverifiedMessage(false);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/topics");
      } else {
        setError(t("auth.invalidCredentials"));
      }
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
        <Typography className="test-credentials">
          {t("auth.testCredentials")}
        </Typography>
        <Typography className="mt-4">
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
  );
};

export default Login;
