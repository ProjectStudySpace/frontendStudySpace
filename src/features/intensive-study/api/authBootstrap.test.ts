import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, resetAuthExpiryStateForTests } from "../../../utils/axiosConfig";
import { AuthProvider, useAuth } from "../../../context/AuthContext";
import {
  installSettlingAdapter,
  responseLessFailure,
} from "./testAxios";

const doubles = vi.hoisted(() => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock("../../../context/NotificationContext", () => ({
  useNotification: () => ({
    showSuccess: doubles.showSuccess,
    showError: doubles.showError,
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
  initReactI18next: { type: "3rdParty", init: () => undefined },
}));

type AuthValue = ReturnType<typeof useAuth>;
type BootstrapAuthValue = AuthValue & {
  isAuthDegraded: boolean;
  retrySession: () => Promise<void>;
};

const AuthProbe: React.FC<{
  onValue: (value: BootstrapAuthValue) => void;
}> = ({ onValue }) => {
  onValue(useAuth() as BootstrapAuthValue);
  return null;
};

async function mountAuthProvider(): Promise<{
  root: Root;
  auth: () => BootstrapAuthValue;
}> {
  let current!: BootstrapAuthValue;
  const root = createRoot(
    document.body.appendChild(document.createElement("div")),
  );

  await act(async () => {
    root.render(
      React.createElement(
        AuthProvider,
        null,
        React.createElement(AuthProbe, {
          onValue: (value) => (current = value),
        }),
      ),
    );
  });

  return { root, auth: () => current };
}

async function flushReact(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function flushTransientRetries(): Promise<void> {
  await act(async () => {
    await vi.runAllTimersAsync();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function withAuth(
  run: (auth: () => BootstrapAuthValue) => Promise<void>,
): Promise<void> {
  const mounted = await mountAuthProvider();
  try {
    await run(mounted.auth);
  } finally {
    await act(async () => mounted.root.unmount());
  }
}

describe("auth bootstrap resilience", () => {
  beforeEach(() => {
    resetAuthExpiryStateForTests();
    localStorage.clear();
    document.body.innerHTML = "";
    vi.clearAllMocks();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
  });

  afterEach(() => {
    resetAuthExpiryStateForTests();
    localStorage.clear();
    document.body.innerHTML = "";
    delete api.defaults.adapter;
    vi.useRealTimers();
  });

  it.each([
    ["network", "ERR_NETWORK"],
    ["timeout", "ECONNABORTED"],
  ])(
    "preserves credentials and exposes degraded state for %s bootstrap failures",
    async (_label, code) => {
      localStorage.setItem("token", "bootstrap-token");
      installSettlingAdapter(api, async (config) => {
        if (config.url === "/users/profile") {
          return Promise.reject(
            responseLessFailure(config, "bootstrap unavailable", code),
          );
        }
        return { status: 200, data: { ok: true } };
      });

      await withAuth(async (auth) => {
        await flushTransientRetries();

        expect(auth().isLoading).toBe(false);
        expect(auth().isAuthDegraded).toBe(true);
        expect(localStorage.getItem("token")).toBe("bootstrap-token");
        expect(auth().retrySession).toEqual(expect.any(Function));
      });
    },
  );

  it("preserves credentials and exposes degraded state for an ambiguous 5xx bootstrap failure", async () => {
    localStorage.setItem("token", "bootstrap-token");
    installSettlingAdapter(api, (config) => {
      if (config.url === "/users/profile") {
        return { status: 503, data: { error: "temporarily unavailable" } };
      }
      return { status: 200, data: { ok: true } };
    });

    await withAuth(async (auth) => {
      await flushReact();

      expect(auth().isLoading).toBe(false);
      expect(auth().isAuthDegraded).toBe(true);
      expect(localStorage.getItem("token")).toBe("bootstrap-token");
    });
  });

  it("retries a degraded bootstrap without replacing the F-02 credential identity", async () => {
    localStorage.setItem("token", "bootstrap-token");
    let profileAttempts = 0;
    installSettlingAdapter(api, (config) => {
      if (config.url === "/users/profile") {
        profileAttempts += 1;
        if (profileAttempts <= 4) {
          return Promise.reject(
            responseLessFailure(config, "bootstrap unavailable"),
          );
        }
        return {
          status: 200,
          data: { user: { id: "recovered-user", userTimezone: "UTC" } },
        };
      }
      return { status: 200, data: { ok: true } };
    });

    await withAuth(async (auth) => {
      await flushTransientRetries();
      expect(auth().isAuthDegraded).toBe(true);
      expect(localStorage.getItem("token")).toBe("bootstrap-token");

      await act(async () => auth().retrySession());
      await flushReact();

      expect(profileAttempts).toBe(5);
      expect(auth().user?.id).toBe("recovered-user");
      expect(auth().isAuthenticated).toBe(true);
      expect(auth().isAuthDegraded).toBe(false);
      expect(auth().isLoading).toBe(false);
      expect(localStorage.getItem("token")).toBe("bootstrap-token");
    });
  });

  it("invalidates credentials on an authoritative bootstrap 401", async () => {
    localStorage.setItem("token", "expired-token");
    installSettlingAdapter(api, (config) => {
      if (config.url === "/users/profile") {
        return { status: 401, data: { error: "Unauthorized" } };
      }
      return { status: 200, data: { ok: true } };
    });

    await withAuth(async (auth) => {
      await flushReact();

      expect(auth().user).toBeNull();
      expect(auth().isAuthDegraded).toBe(false);
      expect(localStorage.getItem("token")).toBeNull();
      expect(auth().retrySession).toEqual(expect.any(Function));
    });
  });
});
