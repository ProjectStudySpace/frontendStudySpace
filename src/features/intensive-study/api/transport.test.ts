import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import type {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  api,
  isHttpSuccess,
  beginAuthenticatedGeneration,
  resetAuthExpiryStateForTests,
} from "../../../utils/axiosConfig";
import {
  intensiveApi,
  normalizeIntensiveError,
  withIntensiveLocalError,
} from "./errors";
import {
  installSettlingAdapter,
  responseLessFailure,
} from "./testAxios";

describe("strict transport contracts", () => {
  beforeEach(() => {
    resetAuthExpiryStateForTests();
    localStorage.clear();
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  afterEach(() => {
    resetAuthExpiryStateForTests();
    localStorage.clear();
    document.body.innerHTML = "";
    vi.useRealTimers();
    delete api.defaults.adapter;
  });

  it("accepts only HTTP 2xx statuses", () => {
    expect(isHttpSuccess(200)).toBe(true);
    expect(isHttpSuccess(204)).toBe(true);
    expect(isHttpSuccess(199)).toBe(false);
    expect(isHttpSuccess(300)).toBe(false);
    expect(isHttpSuccess(500)).toBe(false);
  });

  it("resolves a 2xx response even when its payload looks like a failure", async () => {
    installSettlingAdapter(api, () => ({
      status: 200,
      data: { success: false, error: "payload-only failure" },
    }));

    await expect(api.get("/api/intensive-sessions/1")).resolves.toMatchObject({
      status: 200,
      data: { success: false, error: "payload-only failure" },
    });
  });

  it("rejects a non-2xx business response instead of resolving its payload", async () => {
    installSettlingAdapter(api, () => ({
      status: 409,
      data: {
        success: true,
        error: "Ya hay un bloque activo",
        path: "/api/intensive-sessions/1/pomodoro/start",
        method: "POST",
      },
    }));

    await expect(api.post("/api/intensive-sessions/1/pomodoro/start")).rejects.toMatchObject({
      response: {
        status: 409,
        data: { success: true, error: "Ya hay un bloque activo" },
      },
    });
  });

  it("rejects non-2xx server responses", async () => {
    installSettlingAdapter(api, () => ({
      status: 503,
      data: { error: "temporarily unavailable" },
    }));

    await expect(api.get("/api/health")).rejects.toMatchObject({
      response: { status: 503 },
    });
  });

  it("rejects a response-less error without request config", async () => {
    api.defaults.adapter = async () => {
      throw new AxiosError("missing request config", "ERR_NETWORK");
    };

    await expect(api.get("/api/no-config")).rejects.toMatchObject({
      message: "missing request config",
    });
  });

  it("retries a response-less idempotent GET and reuses its request config", async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const retryCounts: Array<number | undefined> = [];

    api.defaults.adapter = async (config) => {
      attempts += 1;
      retryCounts.push((config as InternalAxiosRequestConfig).retryCount);
      if (attempts === 1) {
        throw responseLessFailure(
          config as InternalAxiosRequestConfig,
          "response lost",
        );
      }
      return {
        data: { ok: true },
        status: 200,
        statusText: "200",
        headers: {},
        config,
        request: {},
      };
    };

    const request = api.get("/api/intensive-sessions/1");
    await vi.runAllTimersAsync();

    await expect(request).resolves.toMatchObject({ status: 200, data: { ok: true } });
    expect(attempts).toBe(2);
    expect(retryCounts).toEqual([undefined, 1]);
  });

  it("does not retry a response-less unsafe POST", async () => {
    vi.useFakeTimers();
    let attempts = 0;

    api.defaults.adapter = async (config) => {
      attempts += 1;
      throw responseLessFailure(
        config as InternalAxiosRequestConfig,
        "response lost",
      );
    };

    const request = api
      .post("/api/intensive-sessions/1/pomodoro/start")
      .catch((error) => error);
    await vi.runAllTimersAsync();

    await expect(request).resolves.toMatchObject({ code: "ERR_NETWORK" });
    expect(attempts).toBe(1);
  });

  it("retries a response-less idempotent DELETE", async () => {
    vi.useFakeTimers();
    let attempts = 0;

    api.defaults.adapter = async (config) => {
      attempts += 1;
      if (attempts === 1) {
        throw responseLessFailure(
          config as InternalAxiosRequestConfig,
          "timeout",
          "ECONNABORTED",
        );
      }
      return {
        data: undefined,
        status: 204,
        statusText: "204",
        headers: {},
        config,
        request: {},
      };
    };

    const request = api.delete("/api/intensive-sessions/1");
    await vi.runAllTimersAsync();

    await expect(request).resolves.toMatchObject({ status: 204 });
    expect(attempts).toBe(2);
  });

  it("preserves the original credential identity through an idempotent retry", async () => {
    vi.useFakeTimers();
    localStorage.setItem("token", "token-a");
    const generationA = beginAuthenticatedGeneration();
    const attempts: Array<{
      generation: number | undefined;
      authorization: string | undefined;
    }> = [];
    let generationB = 0;

    api.defaults.adapter = async (config) => {
      attempts.push({
        generation: config.authMeta?.authGeneration,
        authorization: config.headers.Authorization?.toString(),
      });
      if (attempts.length === 1) {
        localStorage.setItem("token", "token-b");
        generationB = beginAuthenticatedGeneration();
        throw responseLessFailure(
          config as InternalAxiosRequestConfig,
          "temporary network failure",
        );
      }
      return {
        data: { ok: true },
        status: 200,
        statusText: "200",
        headers: {},
        config,
        request: {},
      };
    };

    const retriedRequest = api.get("/users/profile");
    await vi.runAllTimersAsync();
    await expect(retriedRequest).resolves.toMatchObject({ status: 200 });

    expect(attempts.slice(0, 2)).toEqual([
      { generation: generationA, authorization: "Bearer token-a" },
      { generation: generationA, authorization: "Bearer token-a" },
    ]);

    await api.get("/users/dashboard");
    expect(attempts[2]).toEqual({
      generation: generationB,
      authorization: "Bearer token-b",
    });
  });

  it("does not show a global notification for intensive local business errors", async () => {
    installSettlingAdapter(api, () => ({
      status: 409,
      data: {
        error: "Ya hay un bloque activo",
        path: "/api/intensive-sessions/1/pomodoro/start",
        method: "POST",
      },
    }));

    await expect(
      api.post(
        "/api/intensive-sessions/1/pomodoro/start",
        undefined,
        withIntensiveLocalError({} as AxiosRequestConfig),
      ),
    ).rejects.toBeTruthy();

    expect(document.getElementById("notification-container")).toBeNull();
  });

  it("keeps a production intensive GET 404 local without a global notification", async () => {
    installSettlingAdapter(api, () => ({
      status: 404,
      data: {
        error: "Sesión intensiva no encontrada",
        path: "/api/intensive-sessions/999",
        method: "GET",
      },
    }));

    const failure = await intensiveApi
      .get("/intensive-sessions/999")
      .catch((error) => error);
    const normalized = normalizeIntensiveError(failure);

    expect(normalized).toMatchObject({
      kind: "business",
      message: "Sesión intensiva no encontrada",
      status: 404,
      path: "/api/intensive-sessions/999",
      method: "GET",
    });
    expect(document.getElementById("notification-container")).toBeNull();
  });

  it("keeps a production intensive POST business error local", async () => {
    installSettlingAdapter(api, () => ({
      status: 409,
      data: {
        error: "Ya hay un bloque activo",
        path: "/api/intensive-sessions/1/pomodoro/start",
        method: "POST",
      },
    }));

    const failure = await intensiveApi
      .post("/intensive-sessions/1/pomodoro/start")
      .catch((error) => error);
    const normalized = normalizeIntensiveError(failure);

    expect(normalized).toMatchObject({
      kind: "business",
      message: "Ya hay un bloque activo",
      status: 409,
      method: "POST",
    });
    expect(document.getElementById("notification-container")).toBeNull();
  });

  it("still shows a global notification for ordinary non-login client errors", async () => {
    installSettlingAdapter(api, () => ({
      status: 404,
      data: { message: "missing" },
    }));

    await expect(api.get("/api/topics/999")).rejects.toBeTruthy();
    const container = document.getElementById("notification-container");
    expect(container).not.toBeNull();
    expect(container?.textContent || "").toMatch(/No encontrado|not found|Error/i);
  });

  it("normalizes backend intensive error envelopes without inventing success", () => {
    const normalized = normalizeIntensiveError({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          error: "Aún tienes 2 tarjetas pendientes",
          path: "/api/intensive-sessions/1/complete",
          method: "POST",
        },
      },
      config: { url: "/api/intensive-sessions/1/complete" },
      message: "Request failed",
    });

    expect(normalized.kind).toBe("business");
    expect(normalized.message).toContain("2 tarjetas pendientes");
    expect(normalized.status).toBe(400);
    expect(normalized.path).toBe("/api/intensive-sessions/1/complete");
    expect(normalized.method).toBe("POST");
  });

  it("classifies 401 intensive failures as auth errors for local rendering", () => {
    const normalized = normalizeIntensiveError({
      isAxiosError: true,
      response: {
        status: 401,
        data: {
          error: "Unauthorized",
          path: "/api/intensive-sessions/1",
          method: "GET",
        },
      },
      config: { url: "/api/intensive-sessions/1" },
      message: "Unauthorized",
    });

    expect(normalized.kind).toBe("auth");
    expect(normalized.status).toBe(401);
  });

  it("keeps arbitrary response-shaped non-Axios values unknown", () => {
    const responseShapedValue = {
      response: {
        status: 409,
        data: { error: "not an Axios failure" },
      },
      message: "arbitrary object",
    };

    const normalized = normalizeIntensiveError(responseShapedValue);
    expect(normalized).toMatchObject({
      kind: "unknown",
      message: "Unexpected error",
      status: null,
      path: null,
      method: null,
    });
    expect(normalized.raw).toBe(responseShapedValue);
  });

  it("preserves the intensive marker across a response-less GET retry", async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const markers: Array<boolean | undefined> = [];
    const urls: Array<string | undefined> = [];
    const retryCounts: Array<number | undefined> = [];

    installSettlingAdapter(api, (config) => {
      attempts += 1;
      markers.push(config.authMeta?.intensiveLocalError);
      urls.push(config.url);
      retryCounts.push(config.retryCount);

      if (attempts === 1) {
        throw responseLessFailure(
          config,
          "response lost",
        );
      }

      return {
        status: 409,
        data: {
          error: "Ya hay un bloque activo",
          path: "/api/intensive-sessions/1",
          method: "GET",
        },
      };
    });

    const failurePromise = intensiveApi
      .get("/intensive-sessions/1")
      .catch((error) => error);
    await vi.runAllTimersAsync();
    const failure = await failurePromise;
    const normalized = normalizeIntensiveError(failure);

    expect(attempts).toBe(2);
    expect(markers).toEqual([true, true]);
    expect(urls).toEqual(["/intensive-sessions/1", "/intensive-sessions/1"]);
    expect(retryCounts).toEqual([undefined, 1]);
    expect(failure.config?.authMeta?.intensiveLocalError).toBe(true);
    expect(failure.response?.status).toBe(409);
    expect(normalized).toMatchObject({
      kind: "business",
      message: "Ya hay un bloque activo",
      status: 409,
      path: "/api/intensive-sessions/1",
      method: "GET",
    });
    expect(document.getElementById("notification-container")).toBeNull();
  });


  it("stamps auth generation metadata on outgoing authenticated requests", async () => {
    localStorage.setItem("token", "tok-a");
    const generation = beginAuthenticatedGeneration();
    let seen: AxiosRequestConfig | undefined;

    installSettlingAdapter(api, (config) => {
      seen = config;
      return { status: 200, data: { ok: true } };
    });

    await api.get("/users/profile");
    expect(generation).toBeGreaterThan(0);
    expect((seen as any).authMeta).toEqual({
      authGeneration: generation,
      hadCredentials: true,
      identityCaptured: true,
    });
    expect((seen as any).headers?.Authorization || (seen as any).headers?.authorization).toMatch(/Bearer tok-a/);
  });

  it("stamps unauthenticated requests without inventing credentials", async () => {
    let seen: AxiosRequestConfig | undefined;

    installSettlingAdapter(api, (config) => {
      seen = config;
      return { status: 200, data: { ok: true } };
    });

    await api.get("/users/profile");

    expect((seen as any).authMeta).toEqual({
      authGeneration: 0,
      hadCredentials: false,
      identityCaptured: true,
    });
    expect((seen as any).headers?.Authorization || (seen as any).headers?.authorization).toBeUndefined();
  });

  it("does not retry an idempotent request when an HTTP response exists", async () => {
    let attempts = 0;
    installSettlingAdapter(api, () => {
      attempts += 1;
      return { status: 503, data: { error: "server failure" } };
    });

    await expect(api.get("/api/health")).rejects.toMatchObject({
      response: { status: 503 },
    });
    expect(attempts).toBe(1);
  });
});
