/**
 * Google redirect outcomes that land on /topics.
 *
 * The calendar connection and the account link flows each report their
 * result through query parameters; every outcome must reach the user and
 * each consumer must clean only the parameters it owns.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../../utils/axiosConfig";
import {
  readAccountLinkRedirect,
  readCalendarConnectRedirect,
} from "../../../utils/googleRedirects";
import { GoogleCalendarAuth } from "../../../components/googleCalendarAuth";
import { useGoogleAccountLinkRedirect } from "../../../hooks/useGoogleAccountLinkRedirect";
import { installSettlingAdapter } from "../api/testAxios";

const doubles = vi.hoisted(() => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showWarning: vi.fn(),
}));

vi.mock("../../../context/NotificationContext", () => ({
  useNotification: () => doubles,
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

const CALENDAR = "components.googleCalendarAuth.redirect";
const LINK = "auth.googleLink";

describe("calendar connection redirect mapping", () => {
  it.each(["invalid_state", "missing_params", "invalid_token", "callback_failed"])(
    "maps the %s reason to its own message",
    (reason) => {
      expect(
        readCalendarConnectRedirect(`?google_auth=error&reason=${reason}`),
      ).toEqual({
        tone: "error",
        titleKey: `${CALENDAR}.errorTitle`,
        messageKey: `${CALENDAR}.errors.${reason}`,
      });
    },
  );

  it("falls back to a generic message for an unknown or missing reason", () => {
    const generic = {
      tone: "error",
      titleKey: `${CALENDAR}.errorTitle`,
      messageKey: `${CALENDAR}.errors.unknown`,
    };
    expect(readCalendarConnectRedirect("?google_auth=error&reason=other")).toEqual(generic);
    expect(readCalendarConnectRedirect("?google_auth=error")).toEqual(generic);
  });

  it("reports a cancelled connection as information", () => {
    expect(readCalendarConnectRedirect("?google_auth=cancelled")).toEqual({
      tone: "info",
      titleKey: `${CALENDAR}.cancelledTitle`,
      messageKey: `${CALENDAR}.cancelledMessage`,
    });
  });

  it("carries the sync counts on success", () => {
    expect(
      readCalendarConnectRedirect("?google_auth=success&synced=3&total=5"),
    ).toEqual({
      tone: "success",
      titleKey: `${CALENDAR}.successTitle`,
      messageKey: `${CALENDAR}.successMessage`,
      sync: { synced: 3, total: 5 },
    });
    expect(readCalendarConnectRedirect("?google_auth=success")).toMatchObject({
      sync: null,
    });
  });

  it("ignores URLs without a calendar outcome", () => {
    expect(readCalendarConnectRedirect("?topic=4")).toBeNull();
    expect(readCalendarConnectRedirect("?error=link_failed")).toBeNull();
  });
});

describe("account link redirect mapping", () => {
  it.each([
    "invalid_state",
    "already_linked",
    "link_failed",
    "invalid_params",
    "link_init_failed",
  ])("maps the %s error to its own message", (code) => {
    expect(readAccountLinkRedirect(`?error=${code}`)).toEqual({
      tone: "error",
      titleKey: `${LINK}.errorTitle`,
      messageKey: `${LINK}.errors.${code}`,
    });
  });

  it("reports a denied link as information", () => {
    expect(readAccountLinkRedirect("?error=google_denied")).toEqual({
      tone: "info",
      titleKey: `${LINK}.errorTitle`,
      messageKey: `${LINK}.errors.google_denied`,
    });
  });

  it("maps success and unknown codes, and ignores unrelated URLs", () => {
    expect(readAccountLinkRedirect("?google_linked=success")).toEqual({
      tone: "success",
      titleKey: `${LINK}.successTitle`,
      messageKey: `${LINK}.successMessage`,
    });
    expect(readAccountLinkRedirect("?error=other")).toMatchObject({
      messageKey: `${LINK}.errors.unknown`,
    });
    expect(readAccountLinkRedirect("?google_auth=success")).toBeNull();
  });
});

async function mount(element: React.ReactElement): Promise<Root> {
  const root = createRoot(document.body.appendChild(document.createElement("div")));
  await act(async () => root.render(element));
  return root;
}

const LinkProbe: React.FC = () => {
  useGoogleAccountLinkRedirect();
  return null;
};

describe("redirect consumers on /topics", () => {
  let root: Root | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    // Unmocked HTTP fails closed.
    installSettlingAdapter(api, () => ({ status: 599, data: null }));
  });

  afterEach(async () => {
    if (root) await act(async () => root!.unmount());
    root = null;
    document.body.innerHTML = "";
    delete api.defaults.adapter;
    window.history.replaceState({}, "", "/");
  });

  it("tells the user to retry when the connection request could not be verified", async () => {
    window.history.replaceState({}, "", "/topics?google_auth=error&reason=invalid_state&topic=5");
    root = await mount(React.createElement(GoogleCalendarAuth));

    expect(doubles.showError).toHaveBeenCalledTimes(1);
    expect(doubles.showError).toHaveBeenCalledWith(
      `${CALENDAR}.errorTitle`,
      `${CALENDAR}.errors.invalid_state`,
    );
    expect(window.location.search).toBe("?topic=5");
  });

  it("reports a cancelled calendar connection", async () => {
    window.history.replaceState({}, "", "/topics?google_auth=cancelled");
    root = await mount(React.createElement(GoogleCalendarAuth));

    expect(doubles.showInfo).toHaveBeenCalledWith(
      `${CALENDAR}.cancelledTitle`,
      `${CALENDAR}.cancelledMessage`,
    );
    expect(doubles.showError).not.toHaveBeenCalled();
    expect(window.location.search).toBe("");
  });

  it("reports an account link error and cleans only its own parameters", async () => {
    window.history.replaceState({}, "", "/topics?error=already_linked&topic=2");
    root = await mount(React.createElement(LinkProbe));

    expect(doubles.showError).toHaveBeenCalledWith(
      `${LINK}.errorTitle`,
      `${LINK}.errors.already_linked`,
    );
    expect(window.location.search).toBe("?topic=2");
  });

  it("confirms a linked Google account once", async () => {
    window.history.replaceState({}, "", "/topics?google_linked=success");
    root = await mount(React.createElement(LinkProbe));

    expect(doubles.showSuccess).toHaveBeenCalledTimes(1);
    expect(doubles.showSuccess).toHaveBeenCalledWith(
      `${LINK}.successTitle`,
      `${LINK}.successMessage`,
    );
    expect(window.location.search).toBe("");
  });

  it("leaves calendar parameters for the calendar consumer", async () => {
    window.history.replaceState({}, "", "/topics?google_auth=cancelled");
    root = await mount(React.createElement(LinkProbe));

    expect(doubles.showSuccess).not.toHaveBeenCalled();
    expect(doubles.showError).not.toHaveBeenCalled();
    expect(window.location.search).toBe("?google_auth=cancelled");
  });
});
