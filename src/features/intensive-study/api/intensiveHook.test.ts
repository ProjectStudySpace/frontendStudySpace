import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, resetAuthExpiryStateForTests } from "../../../utils/axiosConfig";
import { useIntensiveSessions } from "../../../../hooks/useIntensiveSessions";
import { installSettlingAdapter, responseLessFailure } from "./testAxios";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 10, email: "student@example.test" } }),
}));

type HookState = ReturnType<typeof useIntensiveSessions>;

let latest: HookState | null = null;
let root: Root | null = null;

function Probe() {
  latest = useIntensiveSessions();
  return null;
}

async function renderHookProbe() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(React.createElement(Probe));
  });
  await vi.waitFor(() => expect(latest).not.toBeNull());
}

describe("useIntensiveSessions corrective production seams", () => {
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    latest = null;
    localStorage.clear();
    document.body.innerHTML = "";
    resetAuthExpiryStateForTests();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
      root = null;
    }
    delete api.defaults.adapter;
    resetAuthExpiryStateForTests();
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("renders the backend error field through the production hook catch", async () => {
    installSettlingAdapter(api, () => ({
      status: 400,
      data: {
        error: "Aún tienes 2 tarjetas pendientes",
        path: "/api/intensive-sessions/1/complete",
        method: "POST",
      },
    }));
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["completeSession"]>> | undefined;
    await act(async () => {
      result = await latest?.completeSession(1);
    });

    // The command reports an explicit failure instead of an ambiguous `null`.
    expect(result?.status).toBe("failed");
    expect(latest?.error).toBe("Aún tienes 2 tarjetas pendientes");
    expect(document.getElementById("notification-container")).toBeNull();
  });

  it("uses the backend error message for an HTTP Pomodoro-start conflict", async () => {
    const calls: string[] = [];
    installSettlingAdapter(api, (config) => {
      calls.push(`${config.method}:${config.url}`);
      return {
        status: 409,
        data: {
          error: "Ya hay un bloque activo",
          path: "/api/intensive-sessions/1/pomodoro/start",
          method: "POST",
        },
      };
    });
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["startPomodoro"]>> | undefined;
    await act(async () => {
      result = await latest?.startPomodoro(1);
    });

    expect(result?.status).toBe("failed");
    expect(latest?.error).toBe("Ya hay un bloque activo");
    expect(calls).toEqual(["post:/intensive-sessions/1/pomodoro/start"]);
  });

  it("reconciles one response-lost Pomodoro start with authoritative detail", async () => {
    const calls: Array<{ method: string | undefined; url: string | undefined }> = [];
    api.defaults.adapter = async (config) => {
      calls.push({ method: config.method, url: config.url });
      if (config.method === "post") {
        config.retryCount = 3;
        throw responseLessFailure(config, "response lost after commit");
      }
      return {
        data: {
          session: {
            id: 1,
            status: "ACTIVE",
            pomodoroBlocks: [{ id: 101, status: "ACTIVE" }],
          },
          activeBlock: {
            id: 101,
            sessionId: 1,
            status: "ACTIVE",
            blockNumber: 1,
            durationMinutes: 25,
          },
        },
        status: 200,
        statusText: "200",
        headers: {},
        config,
        request: {},
      };
    };
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["startPomodoro"]>> | undefined;
    await act(async () => {
      result = await latest?.startPomodoro(1);
    });

    expect(result?.status).toBe("success");
    if (result?.status !== "success") throw new Error("expected success");
    expect(result.data.id).toBe(101);
    expect(latest?.currentPomodoro?.id).toBe(101);
    expect(latest?.error).toBeNull();
    expect(calls).toEqual([
      { method: "post", url: "/intensive-sessions/1/pomodoro/start" },
      { method: "get", url: "/intensive-sessions/1" },
    ]);
  });

  it("reports the original ambiguous failure when authoritative detail has no active block", async () => {
    const calls: string[] = [];
    api.defaults.adapter = async (config) => {
      calls.push(`${config.method}:${config.url}`);
      if (config.method === "post") {
        config.retryCount = 3;
        throw responseLessFailure(config, "start outcome unknown");
      }
      return {
        data: {
          session: { id: 1, status: "ACTIVE", pomodoroBlocks: [] },
          activeBlock: null,
        },
        status: 200,
        statusText: "200",
        headers: {},
        config,
        request: {},
      };
    };
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["startPomodoro"]>> | undefined;
    await act(async () => {
      result = await latest?.startPomodoro(1);
    });

    expect(result?.status).toBe("failed");
    expect(latest?.currentPomodoro).toBeNull();
    expect(latest?.error).toBe("start outcome unknown");
    expect(calls).toEqual([
      "post:/intensive-sessions/1/pomodoro/start",
      "get:/intensive-sessions/1",
    ]);
  });

  it("reconciles a START_UNCONFIRMED conflict like a lost response", async () => {
    const calls: string[] = [];
    installSettlingAdapter(api, (config) => {
      calls.push(`${config.method}:${config.url}`);
      if (config.method === "post") {
        return {
          status: 409,
          data: { error: "Inicio sin confirmar", code: "START_UNCONFIRMED" },
        };
      }
      return {
        status: 200,
        data: {
          session: { id: 1, status: "ACTIVE", pomodoroBlocks: [] },
          activeBlock: { id: 101, sessionId: 1, status: "ACTIVE", blockNumber: 1 },
        },
      };
    });
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["startPomodoro"]>> | undefined;
    await act(async () => {
      result = await latest?.startPomodoro(1);
    });

    expect(result?.status).toBe("success");
    if (result?.status !== "success") throw new Error("expected success");
    expect(result.data.id).toBe(101);
    // The reconciled snapshot lets the page adopt the authoritative phase.
    expect(result.snapshot?.phase).toBe("ACTIVE");
    expect(latest?.currentPomodoro?.id).toBe(101);
    expect(latest?.error).toBeNull();
    expect(calls).toEqual([
      "post:/intensive-sessions/1/pomodoro/start",
      "get:/intensive-sessions/1",
    ]);
  });

  it("reports an unavailable session when an unconfirmed start cannot be read back", async () => {
    const calls: string[] = [];
    installSettlingAdapter(api, (config) => {
      calls.push(`${config.method}:${config.url}`);
      if (config.method === "post") {
        return {
          status: 409,
          data: { error: "Inicio sin confirmar", code: "START_UNCONFIRMED" },
        };
      }
      return { status: 500, data: { error: "Sesión no encontrada" } };
    });
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["startPomodoro"]>> | undefined;
    await act(async () => {
      result = await latest?.startPomodoro(1);
    });

    expect(result?.status).toBe("failed");
    if (result?.status !== "failed") throw new Error("expected failure");
    expect(result.error.code).toBe("SESSION_UNAVAILABLE");
    expect(latest?.error).toBe("La sesión ya no está disponible.");
    expect(calls).toEqual([
      "post:/intensive-sessions/1/pomodoro/start",
      "get:/intensive-sessions/1",
    ]);
  });

  it("does not reconcile a definitive start conflict in the hook", async () => {
    const calls: string[] = [];
    installSettlingAdapter(api, (config) => {
      calls.push(`${config.method}:${config.url}`);
      return {
        status: 409,
        data: { error: "Ya hay un bloque activo", code: "BLOCK_ALREADY_ACTIVE" },
      };
    });
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["startPomodoro"]>> | undefined;
    await act(async () => {
      result = await latest?.startPomodoro(1);
    });

    // The code reaches the caller so the page can pick the recovery path.
    expect(result?.status).toBe("failed");
    if (result?.status !== "failed") throw new Error("expected failure");
    expect(result.error.code).toBe("BLOCK_ALREADY_ACTIVE");
    expect(latest?.error).toBe("Ya hay un bloque activo");
    expect(calls).toEqual(["post:/intensive-sessions/1/pomodoro/start"]);
  });

  it("reports a start acknowledgement without a block as a failure", async () => {
    installSettlingAdapter(api, () => ({ status: 200, data: {} }));
    await renderHookProbe();

    let result: Awaited<ReturnType<HookState["startPomodoro"]>> | undefined;
    await act(async () => {
      result = await latest?.startPomodoro(1);
    });

    expect(result?.status).toBe("failed");
    expect(latest?.currentPomodoro).toBeNull();
  });

  describe("reloadSession", () => {
    it("adopts the authoritative session and reports its snapshot", async () => {
      const calls: string[] = [];
      installSettlingAdapter(api, (config) => {
        calls.push(`${config.method}:${config.url}`);
        return {
          status: 200,
          data: {
            session: { id: 1, userId: 10, status: "PAUSED", pomodoroBlocks: [] },
            activeBlock: null,
          },
        };
      });
      await renderHookProbe();

      let result: Awaited<ReturnType<HookState["reloadSession"]>> | undefined;
      await act(async () => {
        result = await latest?.reloadSession(1);
      });

      expect(result?.status).toBe("found");
      if (result?.status !== "found") throw new Error("expected found");
      expect(result.snapshot.phase).toBe("PAUSED");
      expect(latest?.currentSession?.status).toBe("PAUSED");
      expect(calls).toEqual(["get:/intensive-sessions/1"]);
    });

    it("tags a session the backend no longer returns as unavailable", async () => {
      installSettlingAdapter(api, () => ({
        status: 500,
        data: { error: "Sesión no encontrada" },
      }));
      await renderHookProbe();

      let result: Awaited<ReturnType<HookState["reloadSession"]>> | undefined;
      await act(async () => {
        result = await latest?.reloadSession(1);
      });

      expect(result?.status).toBe("unavailable");
      if (result?.status !== "unavailable") throw new Error("expected unavailable");
      expect(result.error.code).toBe("SESSION_UNAVAILABLE");
      expect(latest?.error).toBe("La sesión ya no está disponible.");
    });

    it("reports a failed read as retryable, not as an unavailable session", async () => {
      installSettlingAdapter(api, () => ({
        status: 503,
        data: { error: "Servicio no disponible" },
      }));
      await renderHookProbe();

      let result: Awaited<ReturnType<HookState["reloadSession"]>> | undefined;
      await act(async () => {
        result = await latest?.reloadSession(1);
      });

      expect(result?.status).toBe("failed");
      if (result?.status !== "failed") throw new Error("expected failed");
      expect(result.error.message).toBe("Servicio no disponible");
      expect(latest?.error).toBe("Servicio no disponible");
    });
  });
});
