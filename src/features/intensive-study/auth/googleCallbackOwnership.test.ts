/**
 * AuthContext's Google callback handler owns only the sign-in parameters.
 *
 * It runs on /topics as well, so it must not wipe the calendar connection
 * outcome before the calendar consumer reads it, and it must persist the
 * timezone field the profile endpoint actually returns.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, resetAuthExpiryStateForTests } from "../../../utils/axiosConfig";
import { AuthProvider, useAuth } from "../../../context/AuthContext";
import { installSettlingAdapter } from "../api/testAxios";

const doubles = vi.hoisted(() => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock("../../../context/NotificationContext", () => ({
  useNotification: () => doubles,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
  initReactI18next: { type: "3rdParty", init: () => undefined },
}));

type AuthValue = ReturnType<typeof useAuth>;
const AuthProbe: React.FC<{ onValue: (value: AuthValue) => void }> = ({ onValue }) => {
  onValue(useAuth());
  return null;
};

async function withAuth(run: (auth: () => AuthValue) => Promise<void>) {
  let current!: AuthValue;
  const root: Root = createRoot(document.body.appendChild(document.createElement("div")));
  await act(async () =>
    root.render(
      React.createElement(AuthProvider, null,
        React.createElement(AuthProbe, { onValue: (value) => (current = value) })),
    ),
  );
  try {
    await run(() => current);
  } finally {
    await act(async () => root.unmount());
  }
}

function serveProfile(user: Record<string, unknown>) {
  installSettlingAdapter(api, (config) =>
    config.url === "/users/profile"
      ? { status: 200, data: { user } }
      : { status: 599, data: null },
  );
}

describe("AuthContext Google callback parameter ownership", () => {
  beforeEach(() => {
    resetAuthExpiryStateForTests();
    localStorage.clear();
    vi.clearAllMocks();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    // Unmocked HTTP fails closed.
    installSettlingAdapter(api, () => ({ status: 599, data: null }));
  });

  afterEach(() => {
    resetAuthExpiryStateForTests();
    localStorage.clear();
    document.body.innerHTML = "";
    delete api.defaults.adapter;
    window.history.replaceState({}, "", "/");
  });

  it("leaves a calendar connection outcome in place for its consumer", async () => {
    window.history.replaceState({}, "", "/topics?google_auth=success&synced=1&total=2");
    await withAuth(async (auth) => {
      await act(async () => auth().handleGoogleCallback());
    });

    expect(window.location.search).toBe("?google_auth=success&synced=1&total=2");
    expect(doubles.showSuccess).not.toHaveBeenCalled();
    expect(doubles.showError).not.toHaveBeenCalled();
  });

  it("stores the profile timezone after a Google sign-in", async () => {
    window.history.replaceState({}, "", "/topics?google_auth=success&token=signed-in");
    serveProfile({ id: 1, timezone: "Europe/Madrid" });
    await withAuth(async (auth) => {
      await act(async () => auth().handleGoogleCallback());
    });

    expect(localStorage.getItem("token")).toBe("signed-in");
    expect(localStorage.getItem("userTimezone")).toBe("Europe/Madrid");
    expect(window.location.search).toBe("");
  });

  it("stores the profile timezone when restoring a session", async () => {
    localStorage.setItem("token", "stored");
    serveProfile({ id: 1, timezone: "America/Bogota" });
    await withAuth(async (auth) => {
      expect(auth().isAuthenticated).toBe(true);
    });

    expect(localStorage.getItem("userTimezone")).toBe("America/Bogota");
  });
});
