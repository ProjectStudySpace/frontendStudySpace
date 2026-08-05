import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, resetAuthExpiryStateForTests } from "../../../utils/axiosConfig";
import { useIntensiveSessions } from "../../../../hooks/useIntensiveSessions";
import { installSettlingAdapter } from "./testAxios";

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

    let result: unknown;
    await act(async () => {
      result = await latest?.completeSession(1);
    });

    expect(result).toBeNull();
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

    expect(result).toBeNull();
    expect(latest?.error).toBe("Ya hay un bloque activo");
    expect(calls).toEqual(["post:/intensive-sessions/1/pomodoro/start"]);
  });
});
