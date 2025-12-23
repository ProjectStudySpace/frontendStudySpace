import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  AlertTitle,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/axiosConfig";
import "./Login.css";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setIsInvalidToken(true);
        setIsValidating(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/validate-reset-token", {
          params: { token },
        });

        if (response.status === 200 && response.data.valid) {
          setMaskedEmail(response.data.email);
          setIsInvalidToken(false);
        } else {
          setIsInvalidToken(true);
        }
      } catch (error: any) {
        setIsInvalidToken(true);
      } finally {
        setIsValidating(false);
        setIsLoading(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 6) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    const token = searchParams.get("token");

    if (!token) {
      setError(t("auth.invalidResetTokenMessage"));
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post("/users/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });

      if (response.status === 200) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data?.message || error.message;
        setError(message);
      } else {
        setError(t("auth.invalidResetTokenMessage"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleRequestNewLink = () => {
    navigate("/forgot-password");
  };

  if (isValidating) {
    return (
      <div className="login-container">
        <div className="login-form-container">
          <Typography className="welcome-message" component="h1" gutterBottom>
            {t("auth.validatingToken")}
          </Typography>
          <div className="flex justify-center mt-8">
            <CircularProgress size={40} />
          </div>
        </div>
      </div>
    );
  }

  if (isInvalidToken) {
    return (
      <div className="login-container">
        <div className="login-form-container">
          <Typography className="welcome-message" component="h1" gutterBottom>
            {t("auth.invalidResetToken")}
          </Typography>
          <Alert className="error-alert" severity="error">
            <AlertTitle>{t("auth.invalidResetToken")}</AlertTitle>
            {t("auth.invalidResetTokenMessage")}
          </Alert>
          <div className="mt-6">
            <Button
              onClick={handleRequestNewLink}
              fullWidth
              className="MuiButton-root mb-4"
            >
              {t("auth.requestNewLink")}
            </Button>
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
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-form-container">
          <Typography className="welcome-message" component="h1" gutterBottom>
            {t("auth.passwordResetSuccess")}
          </Typography>
          <Alert className="error-alert" severity="success">
            <AlertTitle>{t("auth.passwordResetSuccess")}</AlertTitle>
            {t("auth.passwordResetSuccessMessage")}
          </Alert>
          <div className="mt-6">
            <Typography className="text-center text-gray-600">
              {t("common.loading")}...
            </Typography>
            <Button
              onClick={handleBackToLogin}
              className="text-blue-500 hover:text-blue-700 font-medium inline-flex items-center gap-1 mt-4"
            >
              ← {t("auth.backToLogin")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-form-container">
        <Typography className="welcome-message" component="h1" gutterBottom>
          {t("auth.resetPasswordTitle")}
        </Typography>
        <Typography className="subtitle" gutterBottom>
          {t("auth.resetPasswordSubtitle")} {maskedEmail && `(${maskedEmail})`}
        </Typography>

        {error && (
          <Alert className="error-alert" severity="error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label={t("auth.newPassword")}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label={t("auth.confirmNewPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
                {t("auth.resettingPassword")}
              </>
            ) : (
              t("auth.resetPassword")
            )}
          </Button>
        </form>

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

export default ResetPassword;
