import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider as CustomThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import "./i18n/config"; // ⭐ Importar configuración de i18n
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Temas from "./pages/Temas";
import Register from "./pages/Register";
import EmailSent from "./pages/EmailSent";
import VerifyEmail from "./pages/VerifyEmail";
import StudySessions from "./pages/StudySessions";
import CalendarPage from "./pages/CalendarPage";
import ProgressPage from "./pages/ProgressPage";
import Perfil from "./pages/Perfil";
import Settings from "./pages/Settings";
import Layout from "./components/layout";

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
      <Route path="/email-sent" element={<EmailSent />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      {/* Rutas protegidas */}{" "}
      {/* ELIMINADO !!!! study-sections por duplicado (el usado: /study-sessions) */}
      {isAuthenticated && (
        <Route element={<Layout />}>
          <Route path="/topics" element={<Temas />} />
          <Route path="/study-sessions" element={<StudySessions />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<Perfil />} />
          <Route path="/settings" element={<Settings />} />
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
    <CustomThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </CustomThemeProvider>
  );
};

export default App;
