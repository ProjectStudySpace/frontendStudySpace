/**
 * Hook para el Timer Pomodoro - Fase 2
 * Temporizador visual para sesiones intensivas
 * NOTA: El timer es visual/UX solamente. El backend es la fuente de verdad del estado.
 *
 * Soporta sincronización con backend usando timestamps UTC:
 * - calculateRemainingTime(): calcula tiempo restante basado en startedAt y duration del backend
 * - syncWithBackend(): sincroniza el timer con los valores del backend
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { POMODORO_CONFIG } from "../src/types/intensiveSessions";

type TimerPhase = "WORK" | "SHORT_BREAK" | "LONG_BREAK";

/**
 * An atomic phase change. Everything the next phase needs travels with the
 * transition, so it never depends on state that has not flushed yet.
 */
export interface TimerTransition {
  phase: TimerPhase;
  /** Total duration of the phase in seconds. Defaults to the phase config. */
  durationSeconds?: number;
  /** Backend UTC anchor; the remaining time is derived from it when present. */
  startedAt?: string | null;
  /** Start counting down right away. Defaults to `true`. */
  autoStart?: boolean;
}

interface UsePomodoroTimerReturn {
  // Estado
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  phase: TimerPhase;
  blockNumber: number;
  progress: number;
  /** Monotonic counter raised once each time a running phase reaches zero. */
  completionTick: number;

  // Funciones
  start: () => void;
  pause: () => void;
  reset: () => void;
  setPhase: (phase: TimerPhase, duration?: number) => void;
  setBlockNumber: (block: number) => void;
  setTimeRemaining: (seconds: number) => void;
  /** Apply a phase change atomically. Returns the remaining seconds applied. */
  transitionTo: (transition: TimerTransition) => number;

  // Nuevas funciones para sincronización con backend
  calculateRemainingTime: (startedAt: string, duration: number) => number;
  syncWithBackend: (startedAt: string, duration: number) => void;

  // Constantes
  WORK_DURATION: number;
  SHORT_BREAK_DURATION: number;
  LONG_BREAK_DURATION: number;
  BLOCKS_UNTIL_LONG_BREAK: number;
}

/** Configured duration of a phase, in seconds. */
const durationForPhase = (phase: TimerPhase): number => {
  switch (phase) {
    case "SHORT_BREAK":
      return POMODORO_CONFIG.SHORT_BREAK_DURATION;
    case "LONG_BREAK":
      return POMODORO_CONFIG.LONG_BREAK_DURATION;
    case "WORK":
    default:
      return POMODORO_CONFIG.WORK_DURATION;
  }
};

/** Remaining seconds of a phase, clamped to a non-negative value. */
const remainingFor = (
  durationSeconds: number,
  startedAt?: string | null,
): number => {
  if (!startedAt) {
    return Math.max(0, durationSeconds);
  }
  const startEpoch = Date.parse(startedAt);
  if (!Number.isFinite(startEpoch)) {
    return Math.max(0, durationSeconds);
  }
  const elapsed = Math.floor((Date.now() - startEpoch) / 1000);
  return Math.max(0, Math.min(durationSeconds, durationSeconds - elapsed));
};

export const usePomodoroTimer = (): UsePomodoroTimerReturn => {
  // Estado
  const [timeRemaining, setTimeRemaining] = useState(
    POMODORO_CONFIG.WORK_DURATION,
  );
  const [totalTime, setTotalTime] = useState(POMODORO_CONFIG.WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhaseState] = useState<TimerPhase>("WORK");
  const [blockNumber, setBlockNumber] = useState(1);
  // Señal de expiración natural: sólo se incrementa al llegar a cero contando.
  const [completionTick, setCompletionTick] = useState(0);

  // Ref para el intervalo
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Ref para evitar que onComplete se llame múltiples veces
  const hasCompletedRef = useRef(false);
  // Ref para almacenar el startedAt del backend
  const backendStartedAtRef = useRef<string | null>(null);
  // Último tiempo restante conocido, para que start() no lea un valor obsoleto
  const timeRemainingRef = useRef(timeRemaining);
  timeRemainingRef.current = timeRemaining;

  // Calcular progreso (0-100)
  const progress =
    totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  // Efecto del timer
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);

  // Expiración natural: sólo cuenta si el timer estaba corriendo y llegó a cero.
  // Hidratar un bloque ya vencido deja isRunning en false y no emite señal, así
  // que el backend sigue siendo la única fuente de las transiciones.
  useEffect(() => {
    if (timeRemaining > 0) {
      hasCompletedRef.current = false;
      return;
    }
    if (!isRunning || hasCompletedRef.current) {
      return;
    }
    hasCompletedRef.current = true;
    setIsRunning(false);
    setCompletionTick((tick) => tick + 1);
  }, [isRunning, timeRemaining]);

  /**
   * Calcula el tiempo restante basado en el timestamp UTC del backend
   * @param startedAt - Timestamp UTC cuando inició el Pomodoro (ISO string)
   * @param duration - Duración total en segundos
   * @returns Tiempo restante en segundos
   */
  const calculateRemainingTime = useCallback(
    (startedAt: string, duration: number): number => {
      try {
        const startTime = new Date(startedAt).getTime(); // UTC milliseconds
        const endTime = startTime + duration * 1000; // UTC milliseconds
        const now = Date.now(); // UTC milliseconds
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        return remaining;
      } catch (error) {
        console.warn("Error calculating remaining time:", error);
        return duration; // Fallback to full duration
      }
    },
    [],
  );

  /**
   * Sincroniza el timer con los valores del backend
   * Usa el timestamp UTC del backend para calcular el tiempo restante exacto
   * @param startedAt - Timestamp UTC cuando inició el Pomodoro (ISO string)
   * @param duration - Duración total en segundos
   */
  const syncWithBackend = useCallback(
    (startedAt: string, duration: number) => {
      backendStartedAtRef.current = startedAt;
      const remaining = calculateRemainingTime(startedAt, duration);
      setTimeRemaining(remaining);
      setTotalTime(duration);
    },
    [calculateRemainingTime],
  );

  /**
   * Iniciar el timer
   */
  const start = useCallback(() => {
    // Se lee el ref y no el estado: tras un setPhase/sync en el mismo tick el
    // valor del render todavía es el anterior.
    if (timeRemainingRef.current > 0) {
      setIsRunning(true);
      hasCompletedRef.current = false;
    }
  }, []);

  /**
   * Pausar el timer
   */
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    hasCompletedRef.current = false;
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
   * Cambio de fase atómico.
   *
   * Calcula fase, duración y tiempo restante a partir de la propia transición,
   * de modo que arrancar la siguiente fase nunca depende de un estado que aún
   * no se ha propagado. Un bloque ya vencido queda en cero y pausado, sin
   * inventar una transición.
   *
   * @returns el tiempo restante aplicado, en segundos
   */
  const transitionTo = useCallback(
    ({
      phase: nextPhase,
      durationSeconds,
      startedAt,
      autoStart = true,
    }: TimerTransition): number => {
      const duration =
        durationSeconds !== undefined && Number.isFinite(durationSeconds)
          ? Math.max(0, Math.floor(durationSeconds))
          : durationForPhase(nextPhase);
      const remaining = remainingFor(duration, startedAt);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      backendStartedAtRef.current = startedAt ?? null;
      hasCompletedRef.current = false;
      timeRemainingRef.current = remaining;

      setPhaseState(nextPhase);
      setTotalTime(duration);
      setTimeRemaining(remaining);
      setIsRunning(autoStart && remaining > 0);

      return remaining;
    },
    [],
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
    completionTick,

    // Funciones
    start,
    pause,
    reset,
    setPhase,
    setBlockNumber,
    setTimeRemaining,
    transitionTo,

    // Funciones de sincronización
    calculateRemainingTime,
    syncWithBackend,

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
