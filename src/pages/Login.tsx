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
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Capturar zona horaria del navegador al cargar el componente
    const timezone = getUserTimezone();
    setUserTimezone(timezone);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/topics");
    } else {
      setError(t("auth.invalidCredentials"));
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
