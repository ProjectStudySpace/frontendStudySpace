import { isAxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { api, type AuthRequestMeta } from "../../../utils/axiosConfig";

export type IntensiveErrorKind = "business" | "auth" | "network" | "unknown";

export type IntensiveError = {
  kind: IntensiveErrorKind;
  message: string;
  status: number | null;
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

function readEnvelope(data: unknown): {
  error?: string;
  message?: string;
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
