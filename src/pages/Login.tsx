import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Container, Alert } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserTimezone } from "../utils/dateUtils";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userTimezone, setUserTimezone] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

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
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <Typography className="welcome-message" component="h1" gutterBottom>
          Bienvenido, por favor inicia sesión
        </Typography>
        <Typography className="subtitle" gutterBottom>
          Accede a tu cuenta para continuar
        </Typography>
        {error && (
          <Alert className="error-alert" severity="error">
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth className="MuiButton-root">
            Iniciar Sesión
          </Button>
        </form>
        <Typography className="test-credentials">
          correo: test@test.com / Contraseña: 123 para probar
        </Typography>
        <Typography className="mt-4">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Regístrate aquí
          </Link>
        </Typography>
      </div>
    </div>
  );
};

export default Login;
