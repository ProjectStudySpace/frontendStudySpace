import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Temas from "./pages/Temas";
import Register from "./pages/Register";
import StudySessions from "./pages/StudySessions";
import CalendarPage from "./pages/CalendarPage";
import ProgressPage from "./pages/ProgressPage";
import Perfil from "./pages/Perfil";
import Layout from "./components/layout";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/topics" /> : <Login />} // Corregido cambio de URL
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/topics" /> : <Register />} // Corregido cambio de URL
      />
      {/* Rutas protegidas */}{" "}
      {/* ELIMINADO !!!! study-sections por duplicado (el usado: /study-sessions) */}
      {isAuthenticated && (
        <Route element={<Layout />}>
          <Route path="/topics" element={<Temas />} />
          <Route path="/study-sessions" element={<StudySessions />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<Perfil />} />
        </Route>
      )}
      {/* Redirigir a login si no está autenticado */}
      {!isAuthenticated && (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
