import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Container,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";

const Landing: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; left: number; top: number; size: number }>
  >([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const sparkleInterval = setInterval(() => {
      createSparkle();
    }, 2000);

    return () => clearInterval(sparkleInterval);
  }, []);

  const createSparkle = () => {
    const newSparkle = {
      id: Date.now(),
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 20 + 15,
    };

    setSparkles((prev) => [...prev, newSparkle]);

    setTimeout(() => {
      setSparkles((prev) =>
        prev.filter((sparkle) => sparkle.id !== newSparkle.id)
      );
    }, 2000);
  };

  const closeModal = () => {
    setShowModal(false);
    if (isAuthenticated) {
      navigate("/topics");
    } else {
      navigate("/login");
    }
  };

  const startExperience = () => {
    console.log("¡Iniciando experiencia Study Space!");
    if (isAuthenticated) {
      navigate("/topics");
    } else {
      navigate("/login");
    }
  };

  if (!showModal) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: 4,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 3,
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ¡Bienvenido a Study Space!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Tu espacio personalizado de aprendizaje te está esperando.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={startExperience}
              sx={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              {isAuthenticated
                ? "Ir al Dashboard"
                : "¡Comenzar mi experiencia!"}
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              borderRadius: "50%",
              opacity: 0.1,
              background: "white",
              animation: "float 6s ease-in-out infinite",
              width:
                index === 0
                  ? "120px"
                  : index === 1
                  ? "80px"
                  : index === 2
                  ? "60px"
                  : "100px",
              height:
                index === 0
                  ? "120px"
                  : index === 1
                  ? "80px"
                  : index === 2
                  ? "60px"
                  : "100px",
              top:
                index === 0
                  ? "10%"
                  : index === 1
                  ? "20%"
                  : index === 2
                  ? "20%"
                  : "15%",
              left:
                index === 0
                  ? "10%"
                  : index === 1
                  ? "85%"
                  : index === 2
                  ? "20%"
                  : "90%",
              right: index === 1 ? "15%" : undefined,
              bottom: index === 2 ? "20%" : index === 3 ? "15%" : undefined,
              animationDelay: `${index * 0.5}s`,
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
                "50%": { transform: "translateY(-20px) rotate(180deg)" },
              },
            }}
          />
        ))}
      </Box>

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <Box
          key={sparkle.id}
          sx={{
            position: "absolute",
            left: `${sparkle.left}vw`,
            top: `${sparkle.top}vh`,
            fontSize: `${sparkle.size}px`,
            animation: "sparkle 2s linear infinite",
            pointerEvents: "none",
            zIndex: 1,
            "@keyframes sparkle": {
              "0%, 100%": {
                opacity: 0,
                transform: "scale(0)",
              },
              "50%": {
                opacity: 1,
                transform: "scale(1)",
              },
            },
          }}
        >
          ✨
        </Box>
      ))}

      {/* Welcome Modal */}
      <Paper
        elevation={24}
        sx={{
          p: 4,
          maxWidth: 480,
          width: "90%",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          position: "relative",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          animation: "slideUp 0.8s ease-out",
          zIndex: 10,
          "@keyframes slideUp": {
            from: {
              opacity: 0,
              transform: "translateY(30px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        <IconButton
          onClick={closeModal}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(102, 126, 234, 0.1)",
            "&:hover": {
              background: "rgba(102, 126, 234, 0.2)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ mb: 3, position: "relative", display: "inline-block" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              mb: 1,
              mx: "auto",
              animation: "bounce 2s ease-in-out infinite",
              "@keyframes bounce": {
                "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
                "40%": { transform: "translateY(-10px)" },
                "60%": { transform: "translateY(-5px)" },
              },
            }}
          >
            📚
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: -20,
              right: -30,
              fontSize: "24px",
              animation: "floatAround 4s ease-in-out infinite",
              animationDelay: "0.5s",
              "@keyframes floatAround": {
                "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
                "50%": { transform: "translateY(-15px) rotate(10deg)" },
              },
            }}
          >
            📖
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: -10,
              left: -40,
              fontSize: "20px",
              animation: "floatAround 4s ease-in-out infinite",
              animationDelay: "1.5s",
              "@keyframes floatAround": {
                "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
                "50%": { transform: "translateY(-15px) rotate(10deg)" },
              },
            }}
          >
            ⭐
          </Box>
        </Box>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          ¡Bienvenido a Study Space!
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          Tu espacio personalizado de aprendizaje te está esperando. Descubre
          una nueva forma de estudiar y alcanzar tus metas académicas.
        </Typography>

        <Box
          sx={{
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
            borderRadius: 2,
            p: 2,
            mb: 3,
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "white",
                fontWeight: 600,
              }}
            >
              SS
            </Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Study Space Team</strong> te invita a unirte:
            </Typography>
          </Box>

          <Box
            sx={{
              background: "rgba(102, 126, 234, 0.1)",
              borderRadius: 1.5,
              p: 1.5,
              color: "text.secondary",
              fontStyle: "italic",
              borderLeft: "4px solid #667eea",
            }}
          >
            "¡Hola! Estamos emocionados de tenerte aquí. Prepárate para una
            experiencia de estudio increíble 🎓"
          </Box>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={startExperience}
          sx={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            border: "none",
            px: 3,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: 2,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
            textTransform: "none",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 30px rgba(102, 126, 234, 0.4)",
            },
          }}
        >
          ¡Comenzar mi experiencia! 🚀
        </Button>
      </Paper>
    </Box>
  );
};

export default Landing;
