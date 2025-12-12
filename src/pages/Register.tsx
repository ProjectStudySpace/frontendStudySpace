import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Container, Alert } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import "./Register.css";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [language, setLanguage] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Detectar idioma del navegador
    const browserLang = navigator.language.startsWith("es") ? "es" : "en";
    setLanguage(browserLang);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    const result = await register(name, email, password, language);
    if (result) {
      setSuccess(t("auth.accountCreated"));
      // Redirect to email-sent page with state
      setTimeout(() => {
        navigate("/email-sent", {
          state: {
            email: email,
            language: language,
          },
        });
      }, 2000);
    } else {
      setError(t("auth.accountCreationError"));
    }
  };

  return (
    <div className="register-container">
      <div className="login-form-container">
        <Typography className="welcome-message" component="h1" gutterBottom>
          {t("auth.createAccount")}
        </Typography>
        <Typography className="subtitle" gutterBottom>
          {t("auth.registerToAccess")}
        </Typography>

        {error && (
          <Alert className="error-alert" severity="error">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="error-alert" severity="success">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label={t("auth.fullName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label={t("auth.confirmPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            variant="outlined"
          />
          <Button type="submit" fullWidth className="MuiButton-root">
            {t("auth.register")}
          </Button>
        </form>

        <Typography className="test-credentials">
          {t("auth.hasAccount")}{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {t("auth.loginHere")}
          </Link>
        </Typography>
      </div>
    </div>
  );
};

export default Register;
