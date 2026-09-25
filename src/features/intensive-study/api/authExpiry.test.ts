import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { api, beginAuthenticatedGeneration, invalidateAuthGeneration, resetAuthExpiryStateForTests, getAuthExpiryStateForTests } from "../../../utils/axiosConfig";
import { AuthProvider, useAuth } from "../../../context/AuthContext";
import GoogleCallback from "../../../pages/GoogleCallback";
import { installSettlingAdapter } from "./testAxios";
const doubles = vi.hoisted(() => ({ showSuccess: vi.fn(), showError: vi.fn(), navigate: vi.fn(), searchParams: new URLSearchParams() }));
vi.mock("../../../context/NotificationContext", () => ({ useNotification: () => ({ showSuccess: doubles.showSuccess, showError: doubles.showError }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }), initReactI18next: { type: "3rdParty", init: () => undefined } }));
vi.mock("react-router-dom", () => ({ useNavigate: () => doubles.navigate, useSearchParams: () => [doubles.searchParams] }));

function httpFailure(config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosError {
  const response = { data, status, statusText: String(status), headers: {}, config, request: {} } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, "ERR_BAD_RESPONSE", config, {}, response);
}
function deferred() { let resolve!: () => void; return { promise: new Promise<void>((done) => (resolve = done)), resolve }; }
function notificationCount() { return document.getElementById("notification-container")?.children.length ?? 0; }
function install401(data: unknown = { error: "Unauthorized" }) { installSettlingAdapter(api, () => ({ status: 401, data })); }
function gatedProfileFailure(message: string) {
  const started = deferred(), released = deferred(), finished = deferred();
  installSettlingAdapter(api, async (config) => {
    if (config.url === "/users/profile") { started.resolve(); await released.promise; finished.resolve(); return { status: 503, data: { error: message } }; }
    if (config.url === "/users/login") return { status: 200, data: { token: "new-token", user: { id: "new-user" } } };
    return { status: 200, data: { ok: true } };
  });
  return { started, released, finished };
}

type AuthValue = ReturnType<typeof useAuth>;
const AuthProbe: React.FC<{ onValue: (value: AuthValue) => void }> = ({ onValue }) => { onValue(useAuth()); return null; };
async function mountAuthProvider(): Promise<{ root: Root; auth: () => AuthValue }> {
  let current!: AuthValue;
  const root = createRoot(document.body.appendChild(document.createElement("div")));
  await act(async () => root.render(React.createElement(AuthProvider, null, React.createElement(AuthProbe, { onValue: (value) => (current = value) }))));
  return { root, auth: () => current };
}
async function withAuth(run: (auth: () => AuthValue) => Promise<void>) {
  const mounted = await mountAuthProvider();
  try { await run(mounted.auth); } finally { await act(async () => mounted.root.unmount()); }
}
async function mountGoogleCallback() {
  const root = createRoot(document.body.appendChild(document.createElement("div")));
  await act(async () => root.render(React.createElement(GoogleCallback)));
  return root;
}
async function flushReact() { await act(async () => { await Promise.resolve(); await Promise.resolve(); }); }
async function expectNoExpiry(request: () => Promise<unknown>, token: string | null) {
  await expect(request()).rejects.toBeTruthy();
  expect(localStorage.getItem("token")).toBe(token);
  expect(notificationCount()).toBe(0);
  await vi.advanceTimersByTimeAsync(4000);
  expect(window.location.href).toBe("http://localhost/topics");
}
async function expectExpiry(request: () => Promise<unknown>) {
  await expect(request()).rejects.toBeTruthy();
  expect(localStorage.getItem("token")).toBeNull();
  expect(notificationCount()).toBe(1);
  await vi.advanceTimersByTimeAsync(4000);
  expect(window.location.href).toBe("/login");
}

describe("auth-generation exactly-once 401 coordinator", () => {
  beforeEach(() => {
    resetAuthExpiryStateForTests(); localStorage.clear(); document.body.innerHTML = ""; vi.clearAllMocks(); doubles.searchParams = new URLSearchParams();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; vi.useFakeTimers();
    delete (window as { location?: Location }).location; (window as { location: { href: string } }).location = { href: "http://localhost/topics" };
  });
  afterEach(() => { resetAuthExpiryStateForTests(); localStorage.clear(); document.body.innerHTML = ""; delete api.defaults.adapter; vi.useRealTimers(); });

  it("runs non-login 401 side effects exactly once for concurrent same-generation responses", async () => {
    localStorage.setItem("token", "live-token"); localStorage.setItem("userTimezone", "UTC"); beginAuthenticatedGeneration();
    install401({ error: "Unauthorized", path: "/api/a", method: "GET" });
    const results = await Promise.allSettled([api.get("/api/a"), api.get("/api/b"), api.get("/users/dashboard")]);
    expect(results.every((result) => result.status === "rejected")).toBe(true); expect(localStorage.getItem("token")).toBeNull(); expect(localStorage.getItem("userTimezone")).toBeNull(); expect(notificationCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(4000); expect(window.location.href).toBe("/login");
    const state = getAuthExpiryStateForTests(); expect(state.handledGeneration).toBe(state.currentGeneration);
  });

  it.each([
    ["wrong current-password", "valid-token", () => api.put("/users/update-password", { currentPassword: "wrong" }), { error: "Current password is incorrect" }],
    ["wrong account-delete password", "valid-token", () => api.delete("/users/delete", { data: { password: "wrong" } }), { error: "Invalid password" }],
    ["login", null, () => api.post("/users/login", { email: "a", password: "b" }), { message: "Credenciales inválidas" }],
  ] as const)("keeps %s 401 local without expiring the session", async (_label, token, request, data) => {
    if (token) { localStorage.setItem("token", token); beginAuthenticatedGeneration(); }
    install401(data); await expectNoExpiry(request, token);
  });

  it("still expires a genuinely invalid token on a confirmation endpoint", async () => {
    localStorage.setItem("token", "expired-token"); beginAuthenticatedGeneration(); install401({ error: "Invalid or expired token" });
    await expectExpiry(() => api.put("/users/update-password", { currentPassword: "irrelevant" }));
  });

  it("cancels a pending expiry redirect when a new authenticated generation begins", async () => {
    localStorage.setItem("token", "old-token"); beginAuthenticatedGeneration(); install401();
    await expect(api.get("/api/x")).rejects.toBeTruthy(); localStorage.setItem("token", "new-token"); beginAuthenticatedGeneration();
    await vi.advanceTimersByTimeAsync(4000); expect(window.location.href).toBe("http://localhost/topics");
  });

  it("ignores stale-generation 401 responses after successful re-authentication", async () => {
    localStorage.setItem("token", "gen1-token"); const gen1 = beginAuthenticatedGeneration(); const gate = deferred(), started = deferred();
    api.defaults.adapter = async (config) => {
      if (config.url === "/api/stale-gen1") { started.resolve(); await gate.promise; throw httpFailure(config as InternalAxiosRequestConfig, 401, { error: "stale" }); }
      return { data: { ok: true }, status: 200, statusText: "200", headers: {}, config, request: {} };
    };
    const stale = api.get("/api/stale-gen1"); await started.promise; expect(getAuthExpiryStateForTests().currentGeneration).toBe(gen1);
    localStorage.setItem("token", "gen2-token"); const gen2 = beginAuthenticatedGeneration(); gate.resolve(); await expect(stale).rejects.toBeTruthy();
    expect(localStorage.getItem("token")).toBe("gen2-token"); expect(notificationCount()).toBe(0); await vi.advanceTimersByTimeAsync(4000); expect(window.location.href).toBe("http://localhost/topics");
    expect(getAuthExpiryStateForTests()).toMatchObject({ currentGeneration: gen2, handledGeneration: null });
  });

  it("allows a later authenticated generation to expire independently once", async () => {
    localStorage.setItem("token", "a-token"); beginAuthenticatedGeneration(); install401(); await expectExpiry(() => api.get("/api/a"));
    localStorage.setItem("token", "b-token"); beginAuthenticatedGeneration(); document.body.innerHTML = "";
    await Promise.allSettled([api.get("/api/b1"), api.get("/api/b2")]); expect(localStorage.getItem("token")).toBeNull(); expect(notificationCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(4000); expect(window.location.href).toBe("/login");
  });

  it("invalidateAuthGeneration prevents further expiry side effects for the old generation", async () => {
    localStorage.setItem("token", "tok"); const generation = beginAuthenticatedGeneration(); invalidateAuthGeneration();
    expect(getAuthExpiryStateForTests()).toMatchObject({ currentGeneration: generation, authenticated: false }); install401();
    await expectNoExpiry(() => api.get("/api/x"), "tok");
  });

  it("does not let a stale bootstrap failure clear a newer login", async () => {
    localStorage.setItem("token", "bootstrap-token"); const gate = gatedProfileFailure("bootstrap unavailable");
    await withAuth(async (auth) => {
      await gate.started.promise; await act(async () => expect(auth().login("new@example.com", "password")).resolves.toBe(true)); gate.released.resolve(); await gate.finished.promise; await flushReact();
      expect(localStorage.getItem("token")).toBe("new-token"); expect(auth().user?.id).toBe("new-user");
    });
  });

  it("does not let a stale AuthContext Google callback clear a replacement token", async () => {
    const gate = gatedProfileFailure("callback unavailable");
    await withAuth(async (auth) => {
      await flushReact(); const location = window.location as unknown as { pathname: string; search: string }; location.pathname = "/callback"; location.search = "?google_auth=success&token=context-google-token";
      const callback = auth().handleGoogleCallback(); await gate.started.promise; localStorage.setItem("token", "replacement-token"); gate.released.resolve(); await gate.finished.promise; await callback; await flushReact();
      expect(localStorage.getItem("token")).toBe("replacement-token"); expect(doubles.showError).not.toHaveBeenCalled();
    });
  });

  it("does not let a stale Google callback failure clear a replacement token", async () => {
    doubles.searchParams = new URLSearchParams("google_auth=success&token=google-token"); const gate = gatedProfileFailure("callback unavailable"); const root = await mountGoogleCallback();
    try {
      await gate.started.promise; localStorage.setItem("token", "replacement-token"); gate.released.resolve(); await gate.finished.promise; await flushReact();
      expect(localStorage.getItem("token")).toBe("replacement-token"); expect(doubles.showError).not.toHaveBeenCalled(); await vi.advanceTimersByTimeAsync(2000); expect(doubles.navigate).not.toHaveBeenCalled();
    } finally { await act(async () => root.unmount()); }
  });

  it("invalidates logout ownership before sending its credential and suppresses session expiry", async () => {
    const started = deferred(), released = deferred(); let authorization: string | undefined;
    installSettlingAdapter(api, async (config) => {
      if (config.url === "/users/login") return { status: 200, data: { token: "logout-token", user: { id: "logout-user" } } };
      if (config.url === "/users/logout") { authorization = config.headers.Authorization?.toString(); started.resolve(); await released.promise; return { status: 401, data: { error: "expired" } }; }
      return { status: 200, data: { ok: true } };
    });
    await withAuth(async (auth) => {
      await flushReact(); await act(async () => expect(auth().login("logout@example.com", "password")).resolves.toBe(true)); const logout = auth().logout(); await started.promise;
      expect(authorization).toBe("Bearer logout-token"); expect(getAuthExpiryStateForTests().authenticated).toBe(false); released.resolve(); await act(async () => logout); await flushReact();
      expect(localStorage.getItem("token")).toBeNull(); expect(auth().user).toBeNull(); expect(doubles.showSuccess).toHaveBeenCalled(); expect(notificationCount()).toBe(0); await vi.advanceTimersByTimeAsync(4000); expect(window.location.href).toBe("http://localhost/topics");
    });
  });
});
