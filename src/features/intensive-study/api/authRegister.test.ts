/**
 * Registration must tell a taken email apart from a server or network failure.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, resetAuthExpiryStateForTests } from "../../../utils/axiosConfig";
import { AuthProvider, useAuth } from "../../../context/AuthContext";
import { installSettlingAdapter, responseLessFailure } from "./testAxios";

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

let root: Root | null = null;
let current: AuthValue | null = null;

const AuthProbe: React.FC = () => {
  current = useAuth();
  return null;
};

async function mountAuthProvider() {
  root = createRoot(document.body.appendChild(document.createElement("div")));
  await act(async () => {
    root?.render(
      React.createElement(AuthProvider, null, React.createElement(AuthProbe)),
    );
  });
}

describe("registration errors", () => {
  beforeEach(() => {
    resetAuthExpiryStateForTests();
    localStorage.clear();
    document.body.innerHTML = "";
    vi.clearAllMocks();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
      root = null;
    }
    current = null;
    delete api.defaults.adapter;
    resetAuthExpiryStateForTests();
    localStorage.clear();
  });

  it("reports a taken email from the EMAIL_ALREADY_EXISTS conflict", async () => {
    installSettlingAdapter(api, (config) => {
      if (config.url === "/users/register") {
        return {
          status: 409,
          data: { error: "Email already exists", code: "EMAIL_ALREADY_EXISTS" },
        };
      }
      return { status: 200, data: {} };
    });
    await mountAuthProvider();

    let result: unknown = "unset";
    await act(async () => {
      result = await current?.register("Ana", "ana@example.test", "secret123");
    });

    expect(result).toBeNull();
    expect(doubles.showError).toHaveBeenCalledWith(
      "Error al crear cuenta",
      "Ese email ya está registrado. Inicia sesión o recupera tu contraseña.",
    );
  });

  it("keeps reporting a connection problem when the request never lands", async () => {
    installSettlingAdapter(api, (config) => {
      if (config.url === "/users/register") {
        throw responseLessFailure(config, "Network Error");
      }
      return { status: 200, data: {} };
    });
    await mountAuthProvider();

    let result: unknown = "unset";
    await act(async () => {
      result = await current?.register("Ana", "ana@example.test", "secret123");
    });

    expect(result).toBeNull();
    expect(doubles.showError).toHaveBeenCalledWith(
      "Error al crear cuenta",
      "No se pudo conectar con el servidor",
    );
  });
});
