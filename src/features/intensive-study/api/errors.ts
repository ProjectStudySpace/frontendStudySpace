import { isAxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { api, type AuthRequestMeta } from "../../../utils/axiosConfig";

export type IntensiveErrorKind = "business" | "auth" | "network" | "unknown";

/**
 * Machine-readable codes the backend sends as HTTP 409 for intensive-study
 * conflicts. Branch on these, never on the human-readable `error` text.
 * `SESSION_UNAVAILABLE` is the only client-side code: the authoritative GET
 * could not return the session, so there is nothing to reconcile against.
 */
export const IntensiveErrorCode = {
  START_UNCONFIRMED: "START_UNCONFIRMED",
  COMPLETION_UNCONFIRMED: "COMPLETION_UNCONFIRMED",
  SESSION_NOT_ACTIVE: "SESSION_NOT_ACTIVE",
  BLOCK_ALREADY_ACTIVE: "BLOCK_ALREADY_ACTIVE",
  BLOCK_ON_BREAK: "BLOCK_ON_BREAK",
  BLOCK_NOT_ACTIVE: "BLOCK_NOT_ACTIVE",
  NO_PENDING_BLOCKS: "NO_PENDING_BLOCKS",
  NO_CARDS_AVAILABLE: "NO_CARDS_AVAILABLE",
  PENDING_CARDS: "PENDING_CARDS",
  SESSION_UNAVAILABLE: "SESSION_UNAVAILABLE",
} as const;

export type IntensiveErrorCode =
  (typeof IntensiveErrorCode)[keyof typeof IntensiveErrorCode];

export type IntensiveError = {
  kind: IntensiveErrorKind;
  message: string;
  status: number | null;
  /**
   * Code from the error envelope, or null when none was sent. Kept as a plain
   * string so a code added by the backend later is preserved, not dropped.
   */
  code: string | null;
  path: string | null;
  method: string | null;
  raw: unknown;
};

type ConfigWithAuthMeta = AxiosRequestConfig & {
  authMeta?: AuthRequestMeta;
};

/**
 * Mark a request so non-401 failures are rendered locally by intensive-study
 * without a duplicate global notification toast.
 */
export function withIntensiveLocalError(
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  const typed = config as ConfigWithAuthMeta;
  return {
    ...typed,
    authMeta: {
      authGeneration: typed.authMeta?.authGeneration ?? 0,
      hadCredentials: typed.authMeta?.hadCredentials ?? false,
      intensiveLocalError: true,
    },
  };
}

/**
 * Temporary production seam for the current intensive hook. Unit 3 will replace
 * this narrow wrapper with endpoint-specific clients without changing the flag.
 */
export const intensiveApi = {
  get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.get<T>(url, withIntensiveLocalError(config));
  },

  post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.post<T, AxiosResponse<T>, D>(
      url,
      data,
      withIntensiveLocalError(config),
    );
  },
};

/**
 * Build a normalized error for failures the client detects itself, such as a
 * response envelope that acknowledges the request but denies the action.
 */
export function localIntensiveError(
  kind: IntensiveErrorKind,
  message: string,
): IntensiveError {
  return {
    kind,
    message,
    status: null,
    code: null,
    path: null,
    method: null,
    raw: null,
  };
}

function readEnvelope(data: unknown): {
  error?: string;
  message?: string;
  code?: string;
  path?: string;
  method?: string;
} {
  if (!data || typeof data !== "object") {
    return {};
  }
  const record = data as Record<string, unknown>;
  return {
    error: typeof record.error === "string" ? record.error : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
    code:
      typeof record.code === "string" && record.code.length > 0
        ? record.code
        : undefined,
    path: typeof record.path === "string" ? record.path : undefined,
    method: typeof record.method === "string" ? record.method : undefined,
  };
}

/**
 * Normalize backend `{ error, path, method }` (and Axios failures) for local UI.
 * Does not perform credential clearing or navigation.
 */
export function intensiveErrorMessage(error: unknown, fallback: string): string {
  const normalized = normalizeIntensiveError(error);
  return normalized.message === "Unexpected error" ? fallback : normalized.message;
}

export function normalizeIntensiveError(error: unknown): IntensiveError {
  const fallback: IntensiveError = {
    kind: "unknown",
    message: "Unexpected error",
    status: null,
    code: null,
    path: null,
    method: null,
    raw: error,
  };

  if (!error || typeof error !== "object") {
    return fallback;
  }

  if (!isAxiosError(error)) {
    return fallback;
  }

  const err = error as {
    isAxiosError?: boolean;
    message?: string;
    response?: {
      status?: number;
      data?: unknown;
    };
    request?: unknown;
    config?: { url?: string };
  };

  const status = err.response?.status ?? null;
  const envelope = readEnvelope(err.response?.data);
  const message =
    envelope.error ||
    envelope.message ||
    (typeof err.message === "string" ? err.message : fallback.message);

  if (status === 401) {
    return {
      kind: "auth",
      message,
      status,
      code: envelope.code ?? null,
      path: envelope.path ?? err.config?.url ?? null,
      method: envelope.method ?? null,
      raw: error,
    };
  }

  if (err.response) {
    return {
      kind: "business",
      message,
      status,
      code: envelope.code ?? null,
      path: envelope.path ?? err.config?.url ?? null,
      method: envelope.method ?? null,
      raw: error,
    };
  }

  if (err.request) {
    return {
      kind: "network",
      message: message || "Network error",
      status: null,
      code: null,
      path: err.config?.url ?? null,
      method: null,
      raw: error,
    };
  }

  return {
    ...fallback,
    message,
  };
}
