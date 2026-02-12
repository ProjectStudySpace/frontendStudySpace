/**
 * Hook para el Timer Pomodoro - Fase 2
 * Temporizador visual para sesiones intensivas
 * NOTA: El timer es visual/UX solamente. El backend es la fuente de verdad del estado.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { POMODORO_CONFIG } from "../src/types/intensiveSessions";

type TimerPhase = "WORK" | "SHORT_BREAK" | "LONG_BREAK";

interface UsePomodoroTimerReturn {
  // Estado
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  phase: TimerPhase;
  blockNumber: number;
  progress: number;

  // Funciones
  start: () => void;
  pause: () => void;
  reset: () => void;
  setPhase: (phase: TimerPhase, duration?: number) => void;
  setBlockNumber: (block: number) => void;
  setTimeRemaining: (seconds: number) => void;

  // Constantes
  WORK_DURATION: number;
  SHORT_BREAK_DURATION: number;
  LONG_BREAK_DURATION: number;
  BLOCKS_UNTIL_LONG_BREAK: number;
}

export const usePomodoroTimer = (): UsePomodoroTimerReturn => {
  // Estado
  const [timeRemaining, setTimeRemaining] = useState(
    POMODORO_CONFIG.WORK_DURATION,
  );
  const [totalTime, setTotalTime] = useState(POMODORO_CONFIG.WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhaseState] = useState<TimerPhase>("WORK");
  const [blockNumber, setBlockNumber] = useState(1);

  // Ref para el intervalo
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calcular progreso (0-100)
  const progress =
    totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  // Efecto del timer
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // El componente padre debe manejar onComplete y sincronizar con backend
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);

  /**
   * Iniciar el timer
   */
  const start = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [timeRemaining]);

  /**
   * Pausar el timer
   */
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Resetear el timer a su duración inicial según la fase actual
   */
  const reset = useCallback(() => {
    pause();
    switch (phase) {
      case "WORK":
        setTimeRemaining(POMODORO_CONFIG.WORK_DURATION);
        setTotalTime(POMODORO_CONFIG.WORK_DURATION);
        break;
      case "SHORT_BREAK":
        setTimeRemaining(POMODORO_CONFIG.SHORT_BREAK_DURATION);
        setTotalTime(POMODORO_CONFIG.SHORT_BREAK_DURATION);
        break;
      case "LONG_BREAK":
        setTimeRemaining(POMODORO_CONFIG.LONG_BREAK_DURATION);
        setTotalTime(POMODORO_CONFIG.LONG_BREAK_DURATION);
        break;
    }
  }, [phase, pause]);

  /**
   * Cambiar la fase del timer
   */
  const setPhase = useCallback(
    (newPhase: TimerPhase, duration?: number) => {
      pause();
      setPhaseState(newPhase);

      let durationTime: number;
      if (duration !== undefined) {
        durationTime = duration;
      } else {
        switch (newPhase) {
          case "WORK":
            durationTime = POMODORO_CONFIG.WORK_DURATION;
            break;
          case "SHORT_BREAK":
            durationTime = POMODORO_CONFIG.SHORT_BREAK_DURATION;
            break;
          case "LONG_BREAK":
            durationTime = POMODORO_CONFIG.LONG_BREAK_DURATION;
            break;
          default:
            durationTime = POMODORO_CONFIG.WORK_DURATION;
        }
      }

      setTimeRemaining(durationTime);
      setTotalTime(durationTime);
    },
    [pause],
  );

  /**
   * Formatear tiempo restante como MM:SS
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // Estado
    timeRemaining,
    totalTime,
    isRunning,
    phase,
    blockNumber,
    progress,

    // Funciones
    start,
    pause,
    reset,
    setPhase,
    setBlockNumber,
    setTimeRemaining,

    // Constantes
    WORK_DURATION: POMODORO_CONFIG.WORK_DURATION,
    SHORT_BREAK_DURATION: POMODORO_CONFIG.SHORT_BREAK_DURATION,
    LONG_BREAK_DURATION: POMODORO_CONFIG.LONG_BREAK_DURATION,
    BLOCKS_UNTIL_LONG_BREAK: POMODORO_CONFIG.BLOCKS_UNTIL_LONG_BREAK,
  };
};

/**
 * Función auxiliar para formatear segundos a MM:SS
 */
export const formatTimeRemaining = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Determinar el tipo de descanso basado en el número de bloque
 */
export const getBreakType = (
  blockNumber: number,
): "SHORT_BREAK" | "LONG_BREAK" => {
  return blockNumber % POMODORO_CONFIG.BLOCKS_UNTIL_LONG_BREAK === 0
    ? "LONG_BREAK"
    : "SHORT_BREAK";
};

export default usePomodoroTimer;
