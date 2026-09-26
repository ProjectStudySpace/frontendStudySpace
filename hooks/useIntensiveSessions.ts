/**
 * Hook para gestionar Sesiones Intensivas - Fase 2
 * Comunica con los endpoints de sesiones, Pomodoro y tarjetas
 */
import { useState, useCallback } from "react";
import { useAuth } from "../src/context/AuthContext";
import { deduplicateRequest } from "../src/utils/axiosConfig";
import {
  intensiveApi as api,
  intensiveErrorMessage,
  localIntensiveError,
  normalizeIntensiveError,
  type IntensiveError,
} from "../src/features/intensive-study/api/errors";
import {
  IntensiveStudySession,
  IntensiveSessionDetail,
  CreateIntensiveSessionData,
  AbandonInfo,
  PomodoroBlock,
  IntensiveSessionCard,
  StudyIntensity,
  CardDifficulty,
  IntensiveResumeSnapshot,
  PomodoroCompletionResult,
  SessionCompletionResult,
} from "../src/types/intensiveSessions";
import {
  buildResumeSnapshot,
  isResumableSession,
} from "../src/features/intensive-study/state/resume";
import {
  isCommandConfirmed,
  isSessionUnavailable,
  isUnconfirmedCommandFailure,
  isUnconfirmedStartFailure,
  SESSION_UNAVAILABLE_MESSAGE,
  sessionUnavailableError,
  type IntensiveCommand,
  type IntensiveMutationOutcome,
  type IntensiveSessionReload,
} from "../src/features/intensive-study/state/mutationOutcome";

/**
 * Result of re-reading the authoritative session. `unavailable` means the
 * backend answered that the session cannot be returned (missing or not owned),
 * which is a definitive answer; `unconfirmed` means the read itself failed or
 * was unusable, so the command outcome is still unknown.
 */
type SessionReconciliation =
  | { status: "found"; payload: any; snapshot: IntensiveResumeSnapshot | null }
  | { status: "unavailable"; error: IntensiveError }
  | { status: "unconfirmed" };

interface GetNextCardResult {
  card: IntensiveSessionCard | null;
  blockComplete: boolean;
  block: PomodoroBlock | null;
  sessionComplete: boolean;
}

interface UseIntensiveSessionsReturn {
  // Estado
  sessions: IntensiveStudySession[];
  currentSession: IntensiveSessionDetail | null;
  currentPomodoro: PomodoroBlock | null;
  currentCard: IntensiveSessionCard | null;
  loading: boolean;
  error: string | null;

  // Funciones de sesión
  createSession: (
    topicId: number,
    intensity: StudyIntensity,
  ) => Promise<IntensiveStudySession | null>;
  fetchSessions: () => Promise<IntensiveStudySession[]>;
  fetchSessionDetail: (id: number) => Promise<IntensiveSessionDetail | null>;
  startSession: (id: number) => Promise<IntensiveSessionDetail | null>;
  pauseSession: (
    id: number,
  ) => Promise<IntensiveMutationOutcome<IntensiveSessionDetail>>;
  abandonSession: (
    id: number,
  ) => Promise<IntensiveMutationOutcome<IntensiveStudySession>>;
  getAbandonInfo: (id: number) => Promise<AbandonInfo | null>;
  completeSession: (
    id: number,
  ) => Promise<IntensiveMutationOutcome<SessionCompletionResult>>;
  retryCompleteSession: (
    id: number,
  ) => Promise<IntensiveMutationOutcome<SessionCompletionResult>>;
  retryAbandonSession: (
    id: number,
  ) => Promise<IntensiveMutationOutcome<IntensiveStudySession>>;
  getActiveSession: () => Promise<IntensiveStudySession | null>;
  rehydrateSession: (id: number) => Promise<IntensiveResumeSnapshot | null>;
  reloadSession: (id: number) => Promise<IntensiveSessionReload>;
  resumeFromPause: (
    sessionId: number,
  ) => Promise<IntensiveResumeSnapshot | null>;

  // Funciones de Pomodoro
  startPomodoro: (
    sessionId: number,
  ) => Promise<IntensiveMutationOutcome<PomodoroBlock>>;
  completePomodoro: (
    sessionId: number,
    blockId: number,
  ) => Promise<IntensiveMutationOutcome<PomodoroCompletionResult>>;
  endBreak: (
    sessionId: number,
    blockId: number,
  ) => Promise<IntensiveMutationOutcome<PomodoroBlock | null>>;
  skipBreak: (
    sessionId: number,
    blockId: number,
  ) => Promise<IntensiveMutationOutcome<PomodoroBlock | null>>;

  // Funciones de tarjetas
  getNextCard: (sessionId: number) => Promise<GetNextCardResult>;
  completeCard: (
    sessionId: number,
    cardId: number,
    difficulty: CardDifficulty,
  ) => Promise<IntensiveSessionCard | null>;

  // Utilidades
  clearError: () => void;
  resetState: () => void;
}

/**
 * The break endpoints answer `{ success, message }` and carry no block, so a
 * `success: false` acknowledgement is a business rejection, not a result.
 */
function readBreakAck(
  payload: any,
  fallbackMessage: string,
): IntensiveMutationOutcome<PomodoroBlock | null> {
  if (!payload?.success) {
    return {
      status: "failed",
      error: localIntensiveError(
        "business",
        payload?.message || payload?.error || fallbackMessage,
      ),
    };
  }

  return { status: "success", data: payload.block ?? null, snapshot: null };
}

export const useIntensiveSessions = (): UseIntensiveSessionsReturn => {
  const { user } = useAuth();

  // Estado principal
  const [sessions, setSessions] = useState<IntensiveStudySession[]>([]);
  const [currentSession, setCurrentSession] =
    useState<IntensiveSessionDetail | null>(null);
  const [currentPomodoro, setCurrentPomodoro] = useState<PomodoroBlock | null>(
    null,
  );
  const [currentCard, setCurrentCard] = useState<IntensiveSessionCard | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== FUNCIONES DE SESIÓN ====================

  /**
   * Crear una nueva sesión intensiva
   */
  const createSession = useCallback(
    async (
      topicId: number,
      intensity: StudyIntensity,
    ): Promise<IntensiveStudySession | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const data: CreateIntensiveSessionData = { topicId, intensity };

        const response = await api.post<any>("/intensive-sessions", data);

        if (response.data) {
          const apiResponse = response.data;
          const session = apiResponse.session;
          setSessions((prev) => [session, ...prev]);
          return session;
        }
        return null;
      } catch (err: any) {
        const errorMessage = intensiveErrorMessage(err, "Error al crear sesión");

        // Detectar error de sesión activa existente
        const isActiveSessionError =
          errorMessage.toLowerCase().includes("sesión activa") ||
          errorMessage.toLowerCase().includes("active session");

        if (isActiveSessionError) {
          const activeSessionError = new Error(errorMessage);
          (activeSessionError as any).code = "ACTIVE_SESSION_EXISTS";
          (activeSessionError as any).status = err.response?.status;
          throw activeSessionError;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Obtener la sesión activa actual del usuario
   */
  const getActiveSession =
    useCallback(async (): Promise<IntensiveStudySession | null> => {
      if (!user) return null;

      try {
        const response = await api.get<{ sessions: IntensiveStudySession[] }>(
          "/intensive-sessions",
        );
        const sessionsData = response.data?.sessions || [];

        // Only canonical ACTIVE/PAUSED sessions are live; CONFIGURING and
        // terminal sessions are not resumable.
        const activeSession = sessionsData.find((s) =>
          isResumableSession(s.status),
        );

        return activeSession || null;
      } catch (err) {
        console.error(
          "Error getting active session:",
          intensiveErrorMessage(err, "Error al obtener sesión activa"),
        );
        return null;
      }
    }, [user]);

  /**
   * Obtener todas las sesiones del usuario
   */
  const fetchSessions = useCallback(async (): Promise<
    IntensiveStudySession[]
  > => {
    if (!user) {
      setError("Usuario no autenticado");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const requestKey = "intensive-sessions-list";
      const response = await deduplicateRequest(requestKey, () =>
        api.get<{ sessions: IntensiveStudySession[] }>("/intensive-sessions"),
      );

      const sessionsData = response.data?.sessions || [];
      setSessions(sessionsData);
      return sessionsData;
    } catch (err: any) {
      const errorMessage = intensiveErrorMessage(err, "Error al obtener sesiones");
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Obtener detalle de una sesión específica
   */
  const fetchSessionDetail = useCallback(
    async (id: number): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<any>(`/intensive-sessions/${id}`);

        if (response.data) {
          const apiResponse = response.data;
          const sessionDetail = apiResponse.session;
          setCurrentSession(sessionDetail);
          return sessionDetail;
        }
        return null;
      } catch (err: any) {
        const errorMessage = intensiveErrorMessage(err, "Error al obtener sesión");
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Iniciar una sesión
   */
  const startSession = useCallback(
    async (id: number): Promise<IntensiveSessionDetail | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(`/intensive-sessions/${id}/start`);

        if (response.data) {
          const apiResponse = response.data;
          const sessionDetail = apiResponse.session;
          setCurrentSession(sessionDetail);
          // Actualizar en la lista también
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: sessionDetail.status } : s,
            ),
          );
          return sessionDetail;
        }
        return null;
      } catch (err: any) {
        const errorMessage = intensiveErrorMessage(err, "Error al iniciar sesión");
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // ============ COMANDOS DE CICLO DE VIDA (no idempotentes) ============

  /**
   * Re-read the authoritative session after an ambiguous command. Only a GET is
   * issued: a non-idempotent POST is never replayed.
   */
  const reconcileSession = useCallback(
    async (sessionId: number): Promise<SessionReconciliation> => {
      try {
        const response = await api.get<any>(`/intensive-sessions/${sessionId}`);
        const payload = response.data;

        return {
          status: "found",
          payload,
          snapshot: buildResumeSnapshot({
            session: payload?.session || null,
            activeBlock: payload?.activeBlock || null,
            card: null,
            userId: user?.id ?? null,
          }),
        };
      } catch (err) {
        const normalized = normalizeIntensiveError(err);
        if (isSessionUnavailable(normalized)) {
          return {
            status: "unavailable",
            error: sessionUnavailableError(normalized),
          };
        }
        console.warn(
          "Could not reconcile ambiguous intensive command:",
          intensiveErrorMessage(err, "Error al reconciliar la sesión"),
        );
        return { status: "unconfirmed" };
      }
    },
    [user],
  );

  /** Adopt a reconciled snapshot that proved the command landed. */
  const adoptSnapshot = useCallback((snapshot: IntensiveResumeSnapshot) => {
    setCurrentSession(snapshot.session);
    setCurrentPomodoro(snapshot.block);
    setCurrentCard(snapshot.card);
    setError(null);
  }, []);

  /** Report an unavailable session without replaying or guessing. */
  const reportUnavailable = useCallback(
    <T,>(command: string, error: IntensiveError): IntensiveMutationOutcome<T> => {
      console.error(`Intensive session unavailable [${command}]`);
      setError(error.message);
      return { status: "failed", error };
    },
    [],
  );

  /**
   * Run a lifecycle command and report a discriminated outcome.
   *
   * A rejected command never advances local state. A failure without an HTTP
   * response may still have been applied, so it is resolved against the
   * authoritative session before being reported as a failure.
   */
  const runCommand = useCallback(
    async <T,>({
      command,
      sessionId,
      fallbackMessage,
      send,
      fromSnapshot,
    }: {
      command: IntensiveCommand;
      sessionId: number;
      fallbackMessage: string;
      send: () => Promise<IntensiveMutationOutcome<T>>;
      fromSnapshot: (snapshot: IntensiveResumeSnapshot) => T;
    }): Promise<IntensiveMutationOutcome<T>> => {
      if (!user) {
        const message = "Usuario no autenticado";
        setError(message);
        return { status: "failed", error: localIntensiveError("auth", message) };
      }

      setLoading(true);
      setError(null);

      try {
        const outcome = await send();
        if (outcome.status === "failed") {
          console.error(
            `Intensive command rejected [${command}]:`,
            outcome.error.message,
          );
          setError(outcome.error.message);
        }
        return outcome;
      } catch (err) {
        const normalized = normalizeIntensiveError(err);
        const failure = {
          ...normalized,
          message: intensiveErrorMessage(err, fallbackMessage),
        };

        if (isUnconfirmedCommandFailure(command, failure)) {
          const reconciliation = await reconcileSession(sessionId);
          if (reconciliation.status === "unavailable") {
            return reportUnavailable<T>(command, reconciliation.error);
          }

          const snapshot =
            reconciliation.status === "found" ? reconciliation.snapshot : null;
          if (
            snapshot &&
            isCommandConfirmed(command, snapshot.phase, snapshot.session.status)
          ) {
            // The command did land: adopt the authoritative state instead of
            // sending the request again.
            adoptSnapshot(snapshot);
            return { status: "success", data: fromSnapshot(snapshot), snapshot };
          }

          if (!snapshot) {
            // Reconciliation is unavailable, so "failed" would be a guess: the
            // command may have landed. Say exactly that and let the reconcile-first
            // retry paths resolve it against the authoritative session.
            const message =
              "No se pudo confirmar el estado de la sesión. Reintenta para verificar.";
            console.error(
              `Intensive command unconfirmed [${command}]:`,
              failure.message,
            );
            setError(message);
            return { status: "failed", error: { ...failure, message } };
          }
        }

        console.error(`Intensive command failed [${command}]:`, failure.message);
        setError(failure.message);
        return { status: "failed", error: failure };
      } finally {
        setLoading(false);
      }
    },
    [user, reconcileSession, adoptSnapshot, reportUnavailable],
  );

  /**
   * Pausar una sesión
   */
  const pauseSession = useCallback(
    (id: number): Promise<IntensiveMutationOutcome<IntensiveSessionDetail>> =>
      runCommand({
        command: "PAUSE",
        sessionId: id,
        fallbackMessage: "Error al pausar sesión",
        fromSnapshot: (snapshot) => snapshot.session,
        send: async () => {
          const response = await api.post<any>(
            `/intensive-sessions/${id}/pause`,
          );
          const sessionDetail = response.data?.session;

          if (!sessionDetail) {
            return {
              status: "failed",
              error: localIntensiveError("business", "Error al pausar sesión"),
            };
          }

          setCurrentSession(sessionDetail);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: sessionDetail.status } : s,
            ),
          );
          return { status: "success", data: sessionDetail, snapshot: null };
        },
      }),
    [runCommand],
  );

  /**
   * Obtener información de abandono (penalización)
   */
  const getAbandonInfo = useCallback(
    async (id: number): Promise<AbandonInfo | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      try {
        const response = await api.get<AbandonInfo>(
          `/intensive-sessions/${id}/abandon-info`,
        );
        return response.data || null;
      } catch (err: any) {
        const errorMessage = intensiveErrorMessage(err, "Error al obtener info de abandono");
        setError(errorMessage);
        return null;
      }
    },
    [user],
  );

  /**
   * Abandonar una sesión
   */
  const abandonSession = useCallback(
    (id: number): Promise<IntensiveMutationOutcome<IntensiveStudySession>> =>
      runCommand({
        command: "ABANDON",
        sessionId: id,
        fallbackMessage: "Error al abandonar sesión",
        fromSnapshot: (snapshot) => snapshot.session,
        send: async () => {
          const response = await api.post<IntensiveStudySession>(
            `/intensive-sessions/${id}/abandon`,
          );

          if (!response.data) {
            return {
              status: "failed",
              error: localIntensiveError(
                "business",
                "Error al abandonar sesión",
              ),
            };
          }

          setCurrentSession(null);
          setCurrentPomodoro(null);
          setCurrentCard(null);
          setSessions((prev) =>
            prev.map((s) => (s.id === id ? response.data : s)),
          );
          return { status: "success", data: response.data, snapshot: null };
        },
      }),
    [runCommand],
  );

  /**
   * Completar una sesión
   */
  const completeSession = useCallback(
    (id: number): Promise<IntensiveMutationOutcome<SessionCompletionResult>> =>
      runCommand({
        command: "COMPLETE",
        sessionId: id,
        fallbackMessage: "Error al completar sesión",
        fromSnapshot: (snapshot) => ({
          session: snapshot.session,
          summary: null,
          badgeEvaluation: null,
        }),
        send: async () => {
          const response = await api.post<any>(
            `/intensive-sessions/${id}/complete`,
          );
          const row = response.data?.session;

          if (!row) {
            return {
              status: "failed",
              error: localIntensiveError(
                "business",
                "Error al completar sesión",
              ),
            };
          }

          // The backend answers a bare session row, so keep the relations
          // already known locally instead of dropping them. Results are read
          // from `summary`, never recounted from these relations.
          const session: IntensiveSessionDetail = {
            pomodoroBlocks: [],
            sessionCards: [],
            ...row,
          };
          setCurrentSession((prev) =>
            prev?.id === id ? { ...prev, ...row } : session,
          );
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: session.status } : s,
            ),
          );
          return {
            status: "success",
            data: {
              session,
              summary: response.data?.summary ?? null,
              badgeEvaluation: response.data?.badgeEvaluation ?? null,
            },
            snapshot: null,
          };
        },
      }),
    [runCommand],
  );

  /**
   * Retry a terminal command without ever replaying a landed POST (RES-203).
   * Reconciles with an authoritative GET first; the non-idempotent command is
   * re-sent only when the backend does not already report the session TERMINAL.
   */
  const retryCompleteSession = useCallback(
    async (
      id: number,
    ): Promise<IntensiveMutationOutcome<SessionCompletionResult>> => {
      const reconciliation = await reconcileSession(id);
      if (reconciliation.status === "unavailable") {
        // Replaying against a session that cannot be read cannot succeed.
        return reportUnavailable("COMPLETE", reconciliation.error);
      }
      const snapshot =
        reconciliation.status === "found" ? reconciliation.snapshot : null;
      if (
        snapshot &&
        isCommandConfirmed("COMPLETE", snapshot.phase, snapshot.session.status)
      ) {
        // The original command landed: adopt the authoritative state instead
        // of earning a rejection the user cannot act on.
        adoptSnapshot(snapshot);
        return {
          status: "success",
          data: { session: snapshot.session, summary: null, badgeEvaluation: null },
          snapshot,
        };
      }
      return completeSession(id);
    },
    [reconcileSession, completeSession, adoptSnapshot, reportUnavailable],
  );

  /** Same reconcile-first contract for ABANDON. */
  const retryAbandonSession = useCallback(
    async (
      id: number,
    ): Promise<IntensiveMutationOutcome<IntensiveStudySession>> => {
      const reconciliation = await reconcileSession(id);
      if (reconciliation.status === "unavailable") {
        return reportUnavailable("ABANDON", reconciliation.error);
      }
      const snapshot =
        reconciliation.status === "found" ? reconciliation.snapshot : null;
      if (
        snapshot &&
        isCommandConfirmed("ABANDON", snapshot.phase, snapshot.session.status)
      ) {
        adoptSnapshot(snapshot);
        return { status: "success", data: snapshot.session, snapshot };
      }
      return abandonSession(id);
    },
    [reconcileSession, abandonSession, adoptSnapshot, reportUnavailable],
  );

  // ==================== FUNCIONES DE POMODORO ====================

  /**
   * Iniciar un bloque Pomodoro
   */
  const startPomodoro = useCallback(
    async (sessionId: number): Promise<IntensiveMutationOutcome<PomodoroBlock>> => {
      if (!user) {
        const message = "Usuario no autenticado";
        setError(message);
        return { status: "failed", error: localIntensiveError("auth", message) };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<any>(
          `/intensive-sessions/${sessionId}/pomodoro/start`,
        );

        const block: PomodoroBlock | undefined = response.data?.block;
        if (block) {
          setCurrentPomodoro(block);
          return { status: "success", data: block, snapshot: null };
        }

        const message = "Error al iniciar Pomodoro";
        setError(message);
        return {
          status: "failed",
          error: localIntensiveError("business", message),
        };
      } catch (err: any) {
        const failure: IntensiveError = {
          ...normalizeIntensiveError(err),
          message: intensiveErrorMessage(err, "Error al iniciar Pomodoro"),
        };

        // A lost response or START_UNCONFIRMED may hide a start that landed:
        // read it back instead of replaying the POST. Other start conflicts
        // are definitive answers returned with their code to the caller.
        if (isUnconfirmedStartFailure(failure)) {
          const reconciliation = await reconcileSession(sessionId);
          if (reconciliation.status === "unavailable") {
            setError(reconciliation.error.message);
            return { status: "failed", error: reconciliation.error };
          }

          if (reconciliation.status === "found") {
            const payload = reconciliation.payload;
            const activeBlock =
              payload?.activeBlock ||
              payload?.session?.pomodoroBlocks?.find(
                (block: { status?: string }) =>
                  block.status === "ACTIVE" || block.status === "ON_BREAK",
              );

            if (activeBlock) {
              if (payload?.session) {
                setCurrentSession(payload.session);
              }
              setCurrentPomodoro(activeBlock);
              // The snapshot carries the authoritative phase, so the caller
              // adopts it instead of assuming a fresh work block.
              return {
                status: "success",
                data: activeBlock,
                snapshot: reconciliation.snapshot,
              };
            }
          }
        }

        setError(failure.message);
        return { status: "failed", error: failure };
      } finally {
        setLoading(false);
      }
    },
    [user, reconcileSession],
  );

  /**
   * Completar un bloque Pomodoro
   */
  const completePomodoro = useCallback(
    (
      sessionId: number,
      blockId: number,
    ): Promise<IntensiveMutationOutcome<PomodoroCompletionResult>> =>
      runCommand({
        command: "COMPLETE_BLOCK",
        sessionId,
        fallbackMessage: "Error al completar Pomodoro",
        fromSnapshot: (snapshot) => ({
          block: snapshot.block,
          breakDuration: null,
          breakEndsAt: null,
          isLongBreak: null,
          xpAwarded: null,
          badgeEvaluation: null,
        }),
        send: async () => {
          const response = await api.post<any>(
            `/intensive-sessions/${sessionId}/pomodoro/${blockId}/complete`,
          );
          const block = response.data?.block;

          if (!block) {
            return {
              status: "failed",
              error: localIntensiveError(
                "business",
                "Error al completar Pomodoro",
              ),
            };
          }

          const payload = response.data;
          setCurrentPomodoro(block);
          return {
            status: "success",
            data: {
              block,
              breakDuration: payload.breakDuration ?? null,
              breakEndsAt: payload.breakEndsAt ?? null,
              isLongBreak: payload.isLongBreak ?? null,
              xpAwarded: payload.xpAwarded ?? null,
              badgeEvaluation: payload.badgeEvaluation ?? null,
            },
            snapshot: null,
          };
        },
      }),
    [runCommand],
  );

  /**
   * Terminar descanso
   */
  const endBreak = useCallback(
    (
      sessionId: number,
      blockId: number,
    ): Promise<IntensiveMutationOutcome<PomodoroBlock | null>> =>
      runCommand({
        command: "END_BREAK",
        sessionId,
        fallbackMessage: "Error al terminar descanso",
        fromSnapshot: (snapshot) => snapshot.block,
        send: async () => {
          const response = await api.post<any>(
            `/intensive-sessions/${sessionId}/pomodoro/${blockId}/end-break`,
          );
          return readBreakAck(response.data, "Error al terminar descanso");
        },
      }),
    [runCommand],
  );

  /**
   * Saltar descanso
   */
  const skipBreak = useCallback(
    (
      sessionId: number,
      blockId: number,
    ): Promise<IntensiveMutationOutcome<PomodoroBlock | null>> =>
      runCommand({
        command: "SKIP_BREAK",
        sessionId,
        fallbackMessage: "Error al saltar descanso",
        fromSnapshot: (snapshot) => snapshot.block,
        send: async () => {
          const response = await api.post<any>(
            `/intensive-sessions/${sessionId}/pomodoro/${blockId}/skip-break`,
          );
          return readBreakAck(response.data, "Error al saltar descanso");
        },
      }),
    [runCommand],
  );

  // ==================== FUNCIONES DE TARJETAS ====================

  /**
   * Obtener la siguiente tarjeta
   * Retorna información sobre la tarjeta y si el bloque/sesión está completo
   */
  const getNextCard = useCallback(
    async (sessionId: number): Promise<GetNextCardResult> => {
      if (!user) {
        setError("Usuario no autenticado");
        return {
          card: null,
          blockComplete: false,
          block: null,
          sessionComplete: false,
        };
      }

      try {
        const response = await api.get<any>(
          `/intensive-sessions/${sessionId}/cards/next`,
        );

        if (response.data) {
          const apiResponse = response.data;

          // Si no hay más tarjetas, el backend retorna { card: null, blockComplete: true }
          if (apiResponse.card === null || apiResponse.blockComplete === true) {
            setCurrentCard(null);
            return {
              card: null,
              blockComplete: apiResponse.blockComplete === true,
              block: apiResponse.block || null,
              sessionComplete: apiResponse.sessionComplete === true,
            };
          }

          // El backend retorna los campos de la tarjeta directamente:
          // { sessionCardId, cardId, question, answer, images, blockComplete, ... }
          // Mapear al formato IntensiveSessionCard
          const sessionCard: IntensiveSessionCard = {
            id: apiResponse.sessionCardId || apiResponse.id,
            sessionId: sessionId,
            cardId: apiResponse.cardId,
            difficulty: apiResponse.difficulty,
            completed: apiResponse.completed || false,
            completedAt: apiResponse.completedAt,
            order: apiResponse.order || 0,
            // El backend retorna los datos de la tarjeta directamente, no anidados
            card: {
              id: apiResponse.cardId,
              question: apiResponse.question || "",
              answer: apiResponse.answer || "",
              topicId: apiResponse.topicId || 0,
            },
            createdAt: apiResponse.createdAt || new Date().toISOString(),
            updatedAt: apiResponse.updatedAt || new Date().toISOString(),
          };

          setCurrentCard(sessionCard);
          return {
            card: sessionCard,
            blockComplete: false,
            block: apiResponse.block || null,
            sessionComplete: false,
          };
        }
        // No hay más tarjetas
        setCurrentCard(null);
        return {
          card: null,
          blockComplete: true,
          block: null,
          sessionComplete: false,
        };
      } catch (err: any) {
        // 404 significa que no hay más tarjetas
        if (err.response?.status === 404) {
          setCurrentCard(null);
          return {
            card: null,
            blockComplete: true,
            block: null,
            sessionComplete: false,
          };
        }
        const errorMessage = intensiveErrorMessage(err, "Error al obtener tarjeta");
        setError(errorMessage);
        return {
          card: null,
          blockComplete: false,
          block: null,
          sessionComplete: false,
        };
      }
    },
    [user],
  );

  /**
   * Completar una tarjeta con dificultad
   */
  const completeCard = useCallback(
    async (
      sessionId: number,
      cardId: number,
      difficulty: CardDifficulty,
    ): Promise<IntensiveSessionCard | null> => {
      if (!user) {
        setError("Usuario no autenticado");
        return null;
      }

      try {
        const response = await api.post<any>(
          `/intensive-sessions/${sessionId}/cards/${cardId}/complete`,
          { difficulty },
        );

        if (response.data) {
          const apiResponse = response.data;
          const card = apiResponse.card;
          setCurrentCard(null);
          return card;
        }
        return null;
      } catch (err: any) {
        const errorMessage = intensiveErrorMessage(err, "Error al completar tarjeta");
        setError(errorMessage);
        return null;
      }
    },
    [user],
  );

  // ==================== REANUDACIÓN ====================

  /**
   * Reload a session from authoritative backend data before the UI renders
   * any actionable view: session detail, current Pomodoro block, assigned card,
   * derived phase and absolute timer boundaries.
   *
   * `unavailable` means the backend cannot return a session this user owns, a
   * definitive answer; `failed` means the read itself failed and may be retried.
   * Local state is only replaced on `found`.
   */
  const reloadSession = useCallback(
    async (sessionId: number): Promise<IntensiveSessionReload> => {
      if (!user) {
        const message = "Usuario no autenticado";
        setError(message);
        return { status: "failed", error: localIntensiveError("auth", message) };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<any>(`/intensive-sessions/${sessionId}`);
        const payload = response.data;
        const session = payload?.session || null;

        const hydrated = buildResumeSnapshot({
          session,
          activeBlock: payload?.activeBlock || null,
          card: null,
          userId: user.id ?? null,
        });

        // The assigned card is only meaningful while a work block is running.
        let card: IntensiveSessionCard | null = null;
        if (hydrated?.phase === "ACTIVE") {
          const nextCard = await getNextCard(sessionId);
          card = nextCard.card;
        }

        const snapshot =
          hydrated &&
          buildResumeSnapshot({
            session,
            activeBlock: payload?.activeBlock || null,
            card,
            userId: user.id ?? null,
          });

        if (!snapshot) {
          // Missing or owned by someone else: not a session this user can use.
          const error = sessionUnavailableError(
            localIntensiveError("business", SESSION_UNAVAILABLE_MESSAGE),
          );
          setError(error.message);
          return { status: "unavailable", error };
        }

        setCurrentSession(snapshot.session);
        setCurrentPomodoro(snapshot.block);
        setCurrentCard(snapshot.card);

        return { status: "found", snapshot };
      } catch (err: any) {
        const normalized = normalizeIntensiveError(err);
        if (isSessionUnavailable(normalized)) {
          const error = sessionUnavailableError(normalized);
          setError(error.message);
          return { status: "unavailable", error };
        }

        const error = {
          ...normalized,
          message: intensiveErrorMessage(err, "Error al reanudar sesión"),
        };
        setError(error.message);
        return { status: "failed", error };
      } finally {
        setLoading(false);
      }
    },
    [user, getNextCard],
  );

  /**
   * Rehydrate a session from authoritative backend data. Returns `null` when
   * the session cannot be trusted and leaves local state untouched.
   */
  const rehydrateSession = useCallback(
    async (sessionId: number): Promise<IntensiveResumeSnapshot | null> => {
      const reload = await reloadSession(sessionId);
      return reload.status === "found" ? reload.snapshot : null;
    },
    [reloadSession],
  );

  /**
   * Resume from the paused view without ever replaying a landed start.
   * Reconciles with an authoritative GET first; the non-idempotent POST /start
   * is issued only when the backend still reports the session as PAUSED.
   */
  const resumeFromPause = useCallback(
    async (sessionId: number): Promise<IntensiveResumeSnapshot | null> => {
      const current = await rehydrateSession(sessionId); // authoritative GET
      if (!current) return null;
      if (current.phase !== "PAUSED") return current; // already live: nothing to start
      const started = await startSession(sessionId); // POST, genuinely PAUSED only
      if (!started) return null;
      return rehydrateSession(sessionId); // ack is not a state source: re-GET
    },
    [rehydrateSession, startSession],
  );

  // ==================== UTILIDADES ====================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setSessions([]);
    setCurrentSession(null);
    setCurrentPomodoro(null);
    setCurrentCard(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // Estado
    sessions,
    currentSession,
    currentPomodoro,
    currentCard,
    loading,
    error,

    // Funciones de sesión
    createSession,
    fetchSessions,
    fetchSessionDetail,
    startSession,
    pauseSession,
    abandonSession,
    getAbandonInfo,
    completeSession,
    retryCompleteSession,
    retryAbandonSession,
    getActiveSession,
    rehydrateSession,
    reloadSession,
    resumeFromPause,

    // Funciones de Pomodoro
    startPomodoro,
    completePomodoro,
    endBreak,
    skipBreak,

    // Funciones de tarjetas
    getNextCard,
    completeCard,

    // Utilidades
    clearError,
    resetState,
  };
};

export default useIntensiveSessions;
