import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { api, isHttpSuccess } from "../../../utils/axiosConfig";
import {
  installSettlingAdapter,
  responseLessFailure,
} from "./testAxios";

describe("strict transport contracts", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  afterEach(() => {
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
