import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  AlertTitle,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/axiosConfig";
import "./Login.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsGoogleAccount(false);
    setIsRateLimited(false);

    if (!email) {
      setError(t("auth.invalidCredentials"));
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post("/users/forgot-password", { email });

      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        if (status === 400) {
          if (message.includes("Google") || message.includes("google")) {
            setIsGoogleAccount(true);
          } else {
            setError(message || t("auth.invalidCredentials"));
          }
        } else if (status === 429) {
          setIsRateLimited(true);
        } else {
          setError(message || t("auth.invalidCredentials"));
        }
      } else {
        setError(t("auth.invalidCredentials"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        {!success && !isGoogleAccount && !isRateLimited ? (
          <>
            <Typography className="welcome-message" component="h1" gutterBottom>
              {t("auth.forgotPasswordTitle")}
            </Typography>
            <Typography className="subtitle" gutterBottom>
              {t("auth.forgotPasswordSubtitle")}
            </Typography>

            {error && (
              <Alert className="error-alert" severity="error">
                {error}
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
              <Button
                type="submit"
                fullWidth
                className="MuiButton-root"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} className="mr-2" />
                    {t("auth.sendingResetLink")}
                  </>
                ) : (
                  t("auth.sendResetLink")
                )}
              </Button>
            </form>
          </>
        ) : success ? (
          <>
            <Typography className="welcome-message" component="h1" gutterBottom>
              {t("auth.resetLinkSent")}
            </Typography>
            <Alert className="error-alert" severity="success">
              <AlertTitle>{t("auth.resetLinkSent")}</AlertTitle>
              {t("auth.resetLinkSentMessage")}
            </Alert>
          </>
        ) : isGoogleAccount ? (
          <>
            <Typography className="welcome-message" component="h1" gutterBottom>
              {t("auth.googleAccountError")}
            </Typography>
            <Alert className="error-alert" severity="warning">
              <AlertTitle>{t("auth.googleAccountError")}</AlertTitle>
              {t("auth.googleAccountErrorMessage")}
            </Alert>
          </>
        ) : isRateLimited ? (
          <>
            <Typography className="welcome-message" component="h1" gutterBottom>
              {t("auth.tooManyRequests")}
            </Typography>
            <Alert className="error-alert" severity="warning">
              <AlertTitle>{t("auth.tooManyRequests")}</AlertTitle>
              {t("auth.tooManyRequestsMessage")}
            </Alert>
          </>
        ) : null}

        <div className="mt-6">
          <Button
            onClick={handleBackToLogin}
            className="text-blue-500 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            ← {t("auth.backToLogin")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
