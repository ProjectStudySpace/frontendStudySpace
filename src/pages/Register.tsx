import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Container, Alert } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserTimezone } from "../utils/dateUtils";
import { useTranslation } from "react-i18next";
import "./Register.css";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userTimezone, setUserTimezone] = useState("");
  const { register } = useAuth();
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
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      setSuccess(t("auth.accountCreated"));
      setTimeout(() => navigate("/login"), 2000);
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
