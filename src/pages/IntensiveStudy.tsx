/**
 * Página IntensiveStudy - Fase 2
 * Página principal de sesiones intensivas con 5 vistas:
 * 1. Configuración - Seleccionar tema e intensidad
 * 2. Sesión Activa - Timer Pomodoro + tarjetas
 * 3. Descanso - Timer de descanso
 * 4. Pausa - Estado pausado
 * 5. Resultados - Resumen post-sesión
 *
 * IMPLEMENTACIÓN: Timer sincronizado con backend usando timestamps UTC
 */
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

import { useIntensiveSessions } from "../../hooks/useIntensiveSessions";
import { useTopics } from "../../hooks/useTopics";
import { usePomodoroTimer } from "../../hooks/usePomodoroTimer";

import PomodoroTimer from "../components/PomodoroTimer";
import IntensityPicker from "../components/IntensityPicker";
import SessionDifficultySelector from "../components/SessionDifficultySelector";
import SessionResultsSummary from "../components/SessionResultsSummary";

import {
  StudyIntensity,
  SessionStatus,
  CardDifficulty,
  POMODORO_CONFIG,
  IntensiveSessionDetail,
  IntensiveSessionCard,
  AbandonInfo,
} from "../types/intensiveSessions";
import { IntradayReview } from "../types/intradayReviews";
import { UserBadge } from "../types/gamification";

// Tipo de vista interna
type SessionView =
  | "CONFIG"
  | "READY"
  | "ACTIVE"
  | "BREAK"
  | "PAUSED"
  | "RESULTS";

const IntensiveStudy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Hooks
  const {
    sessions,
    currentSession,
    currentPomodoro,
    currentCard,
    loading,
    error,
    createSession,
    fetchSessions,
    fetchSessionDetail,
    startSession,
    pauseSession,
    abandonSession,
    getAbandonInfo,
    completeSession,
    getActiveSession,
    startPomodoro,
    completePomodoro,
    endBreak,
    skipBreak,
    getNextCard,
    completeCard,
    clearError,
  } = useIntensiveSessions();

  const {
    topics,
    fetchUserTopics: fetchTopics,
    loading: loadingTopics,
  } = useTopics();

  const pomodoroTimer = usePomodoroTimer();

  // Estado local
  const [currentView, setCurrentView] = useState<SessionView>("CONFIG");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedIntensity, setSelectedIntensity] =
    useState<StudyIntensity | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<CardDifficulty | null>(null);
  const [abandonInfo, setAbandonInfo] = useState<AbandonInfo | null>(null);
  const [sessionResults, setSessionResults] =
    useState<IntensiveSessionDetail | null>(null);
  const [newBadges, setNewBadges] = useState<UserBadge[]>([]);
  const [intradayReviews, setIntradayReviews] = useState<IntradayReview[]>([]);
  const [activeSessionError, setActiveSessionError] = useState<string | null>(
    null,
  );

  // Cargar temas al montar
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Obtener sesiones previas al montar
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Verificar si hay sesión activa al montar
  useEffect(() => {
    const checkActiveSession = async () => {
      const active = await getActiveSession();
      if (active) {
        setActiveSessionError(
          t(
            "intensiveStudy.activeSessionExists",
            "Ya tienes una sesión activa. Continúa o abandónala primero.",
          ),
        );
      }
    };
    checkActiveSession();
  }, [getActiveSession, t]);

  // ==================== FUNCIONES DE SINCRONIZACIÓN ====================

  // Sincronizar timer con backend (para pausas y resume)
  // Usa el timestamp UTC del backend para calcular tiempo restante exacto
  const syncTimerWithBackend = useCallback(() => {
    if (currentPomodoro && currentPomodoro.startedAt) {
      const duration = currentPomodoro.breakStartedAt
        ? currentPomodoro.breakDuration
        : currentPomodoro.duration;

      if (duration) {
        pomodoroTimer.syncWithBackend(
          currentPomodoro.breakStartedAt || currentPomodoro.startedAt,
          duration,
        );
      }
    }
  }, [currentPomodoro, pomodoroTimer]);

  // Manejar timer cuando llega a cero
  useEffect(() => {
    if (pomodoroTimer.timeRemaining === 0 && currentView === "ACTIVE") {
      handlePomodoroComplete();
    } else if (pomodoroTimer.timeRemaining === 0 && currentView === "BREAK") {
      handleBreakEnd();
    }
  }, [pomodoroTimer.timeRemaining, currentView]);

  // Efecto para sincronización periódica con backend
  // Sincroniza cada 30 segundos para mantener el timer preciso
  useEffect(() => {
    let syncInterval: NodeJS.Timeout | null = null;

    if (
      (currentView === "ACTIVE" || currentView === "BREAK") &&
      currentPomodoro
    ) {
      // Sincronizar cada 30 segundos
      syncInterval = setInterval(() => {
        syncTimerWithBackend();
      }, 30000);
    }

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [currentView, currentPomodoro, syncTimerWithBackend]);

  // ==================== FUNCIONES DE MANEJO ====================

  // Crear y empezar sesión
  const handleCreateSession = async () => {
    if (!selectedTopicId || !selectedIntensity) return;

    setActiveSessionError(null);

    try {
      // Crear sesión
      const newSession = await createSession(
        selectedTopicId,
        selectedIntensity,
      );
      if (newSession) {
        // Iniciar sesión (cambia estado a ACTIVE)
        const startedSession = await startSession(newSession.id);
        if (startedSession) {
          // Obtener detalle de la sesión
          await fetchSessionDetail(startedSession.id);

          // Configurar timer en 0, pausado - esperando a que inicie el Pomodoro
          pomodoroTimer.reset();
          pomodoroTimer.setPhase("WORK");

          // Cambiar a vista READY (sesión lista, esperando iniciar Pomodoro)
          setCurrentView("READY");
        }
      }
    } catch (err: any) {
      // Manejar error específico de sesión activa existente
      if (err.code === "ACTIVE_SESSION_EXISTS") {
        setActiveSessionError(err.message);
      } else {
        console.error("Error creating session:", err);
      }
    }
  };

  // Iniciar primer bloque Pomodoro
  const handleStartFirstPomodoro = async () => {
    if (!currentSession) return;

    try {
      // Iniciar primer Pomodoro
      const pomodoro = await startPomodoro(currentSession.id);

      if (pomodoro) {
        // Obtener primera tarjeta
        const result = await getNextCard(currentSession.id);

        // Iniciar timer con duración del backend (sincronizado con UTC)
        if (pomodoro.startedAt && pomodoro.durationMinutes) {
          pomodoroTimer.syncWithBackend(
            pomodoro.startedAt,
            pomodoro.durationMinutes * 60, // Convertir minutos a segundos
          );
          pomodoroTimer.start();
        } else {
          // Fallback: usar valores por defecto
          pomodoroTimer.setPhase("WORK");
          pomodoroTimer.start();
        }

        setCurrentView("ACTIVE");
      }
    } catch (err) {
      console.error("Error starting first pomodoro:", err);
    }
  };

  // Pausar sesión
  const handlePause = async () => {
    if (!currentSession) return;

    try {
      await pauseSession(currentSession.id);
      pomodoroTimer.pause();
      setCurrentView("PAUSED");
    } catch (err) {
      console.error("Error pausing session:", err);
    }
  };

  // Reanudar sesión
  const handleResume = async () => {
    if (!currentSession) return;

    try {
      const resumed = await startSession(currentSession.id);
      if (resumed) {
        // Sincronizar timer con backend al reanudar
        syncTimerWithBackend();
        pomodoroTimer.start();
        setCurrentView("ACTIVE");
      }
    } catch (err) {
      console.error("Error resuming session:", err);
    }
  };

  // Abandonar sesión
  const handleAbandon = async () => {
    if (!currentSession) return;

    try {
      const info = await getAbandonInfo(currentSession.id);
      setAbandonInfo(info);

      // Confirmar abandono
      if (
        window.confirm(
          info?.message ||
            t(
              "intensiveStudy.confirmAbandon",
              "¿Estás seguro de abandonar la sesión? Perderás XP.",
            ),
        )
      ) {
        await abandonSession(currentSession.id);
        setCurrentView("RESULTS");
      }
    } catch (err) {
      console.error("Error abandoning session:", err);
    }
  };

  // Completar Pomodoro
  const handlePomodoroComplete = async () => {
    if (!currentSession || !currentPomodoro) return;

    try {
      pomodoroTimer.pause();

      // Determinar tipo de descanso
      const isLongBreak =
        pomodoroTimer.blockNumber % POMODORO_CONFIG.BLOCKS_UNTIL_LONG_BREAK ===
        0;
      const nextPhase = isLongBreak ? "LONG_BREAK" : "SHORT_BREAK";

      // Completar Pomodoro en backend
      await completePomodoro(currentPomodoro.sessionId, currentPomodoro.id);

      // Iniciar descanso
      pomodoroTimer.setPhase(nextPhase);
      pomodoroTimer.start();

      setCurrentView("BREAK");
    } catch (err) {
      console.error("Error completing pomodoro:", err);
    }
  };

  // Terminar descanso
  const handleBreakEnd = async () => {
    if (!currentSession || !currentPomodoro) return;

    try {
      pomodoroTimer.pause();

      // Terminar descanso en backend
      await endBreak(currentSession.id, currentPomodoro.id);

      // Incrementar bloque
      pomodoroTimer.setBlockNumber(pomodoroTimer.blockNumber + 1);

      // Iniciar siguiente Pomodoro
      const nextPomodoro = await startPomodoro(currentSession.id);

      if (nextPomodoro) {
        // Sincronizar con la duración del nuevo Pomodoro del backend
        // Usar durationMinutes y convertir a segundos
        if (nextPomodoro.startedAt && nextPomodoro.durationMinutes) {
          pomodoroTimer.syncWithBackend(
            nextPomodoro.startedAt,
            nextPomodoro.durationMinutes * 60, // Convertir minutos a segundos
          );
        } else {
          pomodoroTimer.setPhase("WORK");
        }
        pomodoroTimer.start();

        // Cargar la primera tarjeta del nuevo bloque
        await getNextCard(currentSession.id);

        setCurrentView("ACTIVE");
      }
    } catch (err) {
      console.error("Error ending break:", err);
    }
  };

  // Saltar descanso
  const handleSkipBreak = async () => {
    if (!currentSession || !currentPomodoro) return;

    try {
      await skipBreak(currentSession.id, currentPomodoro.id);
      pomodoroTimer.setBlockNumber(pomodoroTimer.blockNumber + 1);

      const nextPomodoro = await startPomodoro(currentSession.id);
      if (nextPomodoro) {
        // Sincronizar con la duración del nuevo Pomodoro del backend
        // Usar durationMinutes y convertir a segundos
        if (nextPomodoro.startedAt && nextPomodoro.durationMinutes) {
          pomodoroTimer.syncWithBackend(
            nextPomodoro.startedAt,
            nextPomodoro.durationMinutes * 60, // Convertir minutos a segundos
          );
        } else {
          pomodoroTimer.setPhase("WORK");
        }
        pomodoroTimer.start();

        // Cargar la primera tarjeta del nuevo bloque
        await getNextCard(currentSession.id);

        setCurrentView("ACTIVE");
      }
    } catch (err) {
      console.error("Error skipping break:", err);
    }
  };

  // Completar tarjeta
  const handleCardComplete = async () => {
    if (!currentSession || !currentCard || !selectedDifficulty) return;

    try {
      await completeCard(
        currentSession.id,
        currentCard.cardId,
        selectedDifficulty,
      );
      setShowAnswer(false);
      setSelectedDifficulty(null);

      // Obtener siguiente tarjeta
      const result = await getNextCard(currentSession.id);

      if (!result.card) {
        // No hay más tarjetas en este bloque
        if (result.sessionComplete) {
          // La sesión está completa (todos los bloques terminados)
          await handleSessionComplete();
        } else if (result.blockComplete && currentPomodoro) {
          // El bloque actual está completo, pasar a descanso
          // Completar el Pomodoro actual y mostrar vista de descanso
          await handlePomodoroComplete();
        }
        // Si no es ni blockComplete ni sessionComplete, esperar al timer
      }
    } catch (err) {
      console.error("Error completing card:", err);
    }
  };

  // Completar sesión
  const handleSessionComplete = async () => {
    if (!currentSession) return;

    try {
      pomodoroTimer.pause();

      const completed = await completeSession(currentSession.id);
      if (completed) {
        setSessionResults(completed);
        // Aquí normalmente vendrían los nuevos badges del backend
        setNewBadges([]);
        setCurrentView("RESULTS");
      }
    } catch (err) {
      console.error("Error completing session:", err);
    }
  };

  // Volver a configuración
  const handleBackToConfig = () => {
    setCurrentView("CONFIG");
    setSelectedTopicId(null);
    setSelectedIntensity(null);
    setShowAnswer(false);
    setSelectedDifficulty(null);
    pomodoroTimer.reset();
    clearError();
  };

  // Calcular progreso
  const getProgress = () => {
    if (!currentSession) return 0;
    const completed =
      currentSession.sessionCards?.filter((c) => c.completed).length || 0;
    const total = currentSession.totalCards || 1;
    return (completed / total) * 100;
  };

  // ==================== RENDERIZADO DE VISTAS ====================

  // Vista de configuración
  const renderConfigView = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t("intensiveStudy.configureSession", "Configurar Sesión Intensiva")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t(
            "intensiveStudy.configureDesc",
            "Elige un tema y la intensidad para comenzar",
          )}
        </p>
      </div>

      {/* Alerta de sesión activa existente */}
      {activeSessionError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-500 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {t(
                  "intensiveStudy.activeSessionTitle",
                  "Sesión Activa Existente",
                )}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {activeSessionError}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const active = await getActiveSession();
                      if (active) {
                        const detail = await fetchSessionDetail(active.id);
                        if (detail) {
                          setCurrentView("ACTIVE");
                        }
                      } else {
                        // Si no hay sesión activa, limpiar el error
                        setActiveSessionError(null);
                      }
                    } catch (err) {
                      console.error("Error continuing session:", err);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800/50 rounded hover:bg-amber-200 dark:hover:bg-amber-700/50 transition-colors"
                >
                  {t("intensiveStudy.continueSession", "Continuar Sesión")}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const active = await getActiveSession();
                      if (active) {
                        if (
                          window.confirm(
                            t(
                              "intensiveStudy.confirmAbandon",
                              "¿Estás seguro de abandonar la sesión? Perderás XP.",
                            ),
                          )
                        ) {
                          await abandonSession(active.id);
                          setActiveSessionError(null);
                          await fetchSessions();
                        }
                      } else {
                        // Si no hay sesión activa, limpiar el error
                        setActiveSessionError(null);
                      }
                    } catch (err) {
                      console.error("Error abandoning session:", err);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/50 rounded hover:bg-red-200 dark:hover:bg-red-700/50 transition-colors"
                >
                  {t("intensiveStudy.abandonSession", "Abandonar")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selector de tema */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("intensiveStudy.selectTopic", "Seleccionar tema")}
        </label>
        <select
          value={selectedTopicId ?? ""}
          onChange={(e) =>
            setSelectedTopicId(e.target.value ? Number(e.target.value) : null)
          }
          disabled={loadingTopics}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">
            {t("intensiveStudy.chooseTopic", "Elige un tema...")}
          </option>
          {topics.map((topic) => (
            <option key={topic.id} value={String(topic.id)}>
              {topic.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de intensidad */}
      <IntensityPicker
        selectedIntensity={selectedIntensity}
        onSelect={setSelectedIntensity}
        disabled={loading}
      />

      {/* Botón de iniciar */}
      <div className="flex justify-center">
        <button
          onClick={handleCreateSession}
          disabled={!selectedTopicId || !selectedIntensity || loading}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all
            ${
              selectedTopicId && selectedIntensity && !loading
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          <Play className="w-5 h-5" />
          {t("intensiveStudy.startSession", "Iniciar Sesión")}
        </button>
      </div>

      {error && (
        <p className="text-center text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );

  // Vista de sesión lista (esperando iniciar Pomodoro)
  const renderReadyView = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t("intensiveStudy.sessionReady", "Sesión Lista")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t(
            "intensiveStudy.readyDesc",
            "Tu sesión está activa y lista para comenzar",
          )}
        </p>
      </div>

      {/* Timer en 0, pausado */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <PomodoroTimer
          timeRemaining={0}
          totalTime={25 * 60} // 25 minutos por defecto
          phase="WORK"
          blockNumber={1}
          totalBlocks={currentSession?.totalPomodoros || 4}
          isPaused={true}
        />
      </div>

      {/* Información de la sesión */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-6">
        <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-4">
          {t("intensiveStudy.sessionInfo", "Información de la sesión")}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              {t("intensiveStudy.topic", "Tema")}
            </p>
            <p className="font-medium text-indigo-800 dark:text-indigo-200">
              {currentSession?.topic?.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              {t("intensiveStudy.intensity", "Intensidad")}
            </p>
            <p className="font-medium text-indigo-800 dark:text-indigo-200 capitalize">
              {currentSession?.intensity?.toLowerCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              {t("intensiveStudy.totalCards", "Total de tarjetas")}
            </p>
            <p className="font-medium text-indigo-800 dark:text-indigo-200">
              {currentSession?.totalCards}
            </p>
          </div>
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              {t("intensiveStudy.pomodoros", "Pomodoros")}
            </p>
            <p className="font-medium text-indigo-800 dark:text-indigo-200">
              {currentSession?.totalPomodoros}
            </p>
          </div>
        </div>
      </div>

      {/* Botón para iniciar Pomodoro */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleStartFirstPomodoro}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors"
        >
          <Play className="w-5 h-5" />
          {t("intensiveStudy.startPomodoro", "Iniciar Bloque Pomodoro")}
        </button>

        <button
          onClick={handleAbandon}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold rounded-xl transition-colors"
        >
          <Square className="w-5 h-5" />
          {t("intensiveStudy.abandonSession", "Abandonar Sesión")}
        </button>
      </div>
    </div>
  );

  // Vista de sesión activa
  const renderActiveView = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header con timer y controles */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePause}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Pause className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <PomodoroTimer
          timeRemaining={pomodoroTimer.timeRemaining}
          totalTime={pomodoroTimer.totalTime}
          phase={pomodoroTimer.phase as "WORK" | "SHORT_BREAK" | "LONG_BREAK"}
          blockNumber={pomodoroTimer.blockNumber}
          totalBlocks={currentSession?.totalPomodoros || 4}
          isPaused={!pomodoroTimer.isRunning}
        />

        <button
          onClick={handleAbandon}
          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          <X className="w-5 h-5 text-red-600" />
        </button>
      </div>

      {/* Progreso */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${getProgress()}%` }}
        />
      </div>
      {/* BLOQUE A REVISAR*/}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {currentSession?.completedCards || 0} /{" "}
        {currentSession?.totalCards || 0}{" "}
        {t("intensiveStudy.cards", "tarjetas")}
        {" • "}
        {t("intensiveStudy.pomodoro", "Pomodoro")} {pomodoroTimer.blockNumber} /{" "}
        {currentSession?.totalPomodoros || 4}
      </p>

      {/* Mensaje cuando se completaron las tarjetas del bloque pero el timer sigue */}
      {!currentCard && pomodoroTimer.timeRemaining > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                {t("intensiveStudy.blockCardsComplete", "¡Bloque completado!")}
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400 mt-1">
                {t(
                  "intensiveStudy.blockCardsCompleteDesc",
                  "Has revisado todas las tarjetas de este bloque. Esperando a que termine el tiempo.",
                )}
              </p>
            </div>
            <button
              onClick={handlePomodoroComplete}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <SkipForward className="w-5 h-5" />
              {t("intensiveStudy.goToBreak", "Ir al descanso ahora")}
            </button>
          </div>
        </div>
      )}

      {/* Tarjeta actual */}
      {currentCard && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Pregunta */}
          <div className="p-8">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-4">
              {t("intensiveStudy.question", "Pregunta")}
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-xl text-gray-800 dark:text-white whitespace-pre-wrap">
                {currentCard.card?.question}
              </p>
            </div>
          </div>

          {/* Respuesta (si se muestra) */}
          {showAnswer && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-8 bg-gray-50 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-4">
                {t("intensiveStudy.answer", "Respuesta")}
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-xl text-gray-800 dark:text-white whitespace-pre-wrap">
                  {currentCard.card?.answer}
                </p>
              </div>
            </div>
          )}

          {/* Controles de la tarjeta */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                {t("intensiveStudy.showAnswer", "Mostrar Respuesta")}
              </button>
            ) : (
              <>
                <SessionDifficultySelector
                  onSelect={setSelectedDifficulty}
                  selectedDifficulty={selectedDifficulty}
                />

                <button
                  onClick={handleCardComplete}
                  disabled={!selectedDifficulty}
                  className={`
                    w-full py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2
                    ${
                      selectedDifficulty
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  <Check className="w-5 h-5" />
                  {t("intensiveStudy.nextCard", "Siguiente Tarjeta")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Vista de descanso
  const renderBreakView = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t("intensiveStudy.takeBreak", "¡Toma un Descanso!")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("intensiveStudy.breakDesc", "Has completado un bloque de trabajo")}
        </p>
      </div>

      <PomodoroTimer
        timeRemaining={pomodoroTimer.timeRemaining}
        totalTime={pomodoroTimer.totalTime}
        phase={pomodoroTimer.phase as "WORK" | "SHORT_BREAK" | "LONG_BREAK"}
        blockNumber={pomodoroTimer.blockNumber}
        totalBlocks={currentSession?.totalPomodoros || 4}
        isPaused={!pomodoroTimer.isRunning}
        onSkipBreak={handleSkipBreak}
      />

      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t(
          "intensiveStudy.breakMotivation",
          "Tu cerebro te lo agradecerá. Usa este tiempo para estirarte o hidratarte.",
        )}
      </div>
    </div>
  );

  // Vista de pausa
  const renderPausedView = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t("intensiveStudy.sessionPaused", "Sesión Pausada")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("intensiveStudy.pausedDesc", "Tu sesión está en pausa")}
        </p>
      </div>

      {abandonInfo && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            {t("intensiveStudy.abandonPenalty", "Penalización por abandonar")}
          </h3>
          <p className="text-amber-700 dark:text-amber-300">
            {abandonInfo.message}
          </p>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200 mt-2">
            -{abandonInfo.xpToLose} XP
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleResume}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
        >
          <Play className="w-5 h-5" />
          {t("intensiveStudy.resumeSession", "Reanudar Sesión")}
        </button>

        <button
          onClick={handleAbandon}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold rounded-xl transition-colors"
        >
          <Square className="w-5 h-5" />
          {t("intensiveStudy.abandonSession", "Abandonar Sesión")}
        </button>
      </div>
    </div>
  );

  // Vista de resultados
  const renderResultsView = () => (
    <SessionResultsSummary
      session={sessionResults || (currentSession as IntensiveSessionDetail)}
      newBadges={newBadges}
      intradayReviews={intradayReviews}
      onClose={handleBackToConfig}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      {/* Botón de volver (excepto en configuración) */}
      {currentView !== "CONFIG" &&
        currentView !== "RESULTS" &&
        currentView !== "READY" && (
          <button
            onClick={() =>
              currentView === "PAUSED" ? handleResume() : handlePause()
            }
            className="fixed top-20 left-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow z-10"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Vistas */}
      {!loading && (
        <>
          {currentView === "CONFIG" && renderConfigView()}
          {currentView === "READY" && renderReadyView()}
          {currentView === "ACTIVE" && renderActiveView()}
          {currentView === "BREAK" && renderBreakView()}
          {currentView === "PAUSED" && renderPausedView()}
          {currentView === "RESULTS" && renderResultsView()}
        </>
      )}
    </div>
  );
};

export default IntensiveStudy;
