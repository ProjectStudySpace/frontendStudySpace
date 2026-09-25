/**
 * Google redirect outcomes reported to /topics through query parameters.
 *
 * The backend sends the calendar connection result as `google_auth` (+
 * `reason` or sync counts) and the account link result as `google_linked` or
 * `error`. Each consumer reads and cleans only the parameters it owns.
 */

export type RedirectTone = "success" | "info" | "error";

export interface RedirectNotice {
  tone: RedirectTone;
  titleKey: string;
  messageKey: string;
}

export interface CalendarConnectRedirect extends RedirectNotice {
  sync?: { synced: number; total: number } | null;
}

export const CALENDAR_CONNECT_PARAMS = ["google_auth", "synced", "total", "reason", "message"];
export const ACCOUNT_LINK_PARAMS = ["google_linked", "error"];

const CALENDAR = "components.googleCalendarAuth.redirect";
const LINK = "auth.googleLink";

const CALENDAR_ERROR_REASONS = new Set([
  "invalid_state",
  "missing_params",
  "invalid_token",
  "callback_failed",
]);

const LINK_ERROR_CODES = new Set([
  "invalid_state",
  "already_linked",
  "link_failed",
  "google_denied",
  "invalid_params",
  "link_init_failed",
]);

const toCount = (value: string | null): number | null => {
  const parsed = value === null ? NaN : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export function readCalendarConnectRedirect(search: string): CalendarConnectRedirect | null {
  const params = new URLSearchParams(search);
  const outcome = params.get("google_auth");

  if (outcome === "success") {
    const synced = toCount(params.get("synced"));
    const total = toCount(params.get("total"));
    return {
      tone: "success",
      titleKey: `${CALENDAR}.successTitle`,
      messageKey: `${CALENDAR}.successMessage`,
      sync: synced !== null && total !== null ? { synced, total } : null,
    };
  }

  if (outcome === "cancelled") {
    return {
      tone: "info",
      titleKey: `${CALENDAR}.cancelledTitle`,
      messageKey: `${CALENDAR}.cancelledMessage`,
    };
  }

  if (outcome === "error") {
    const reason = params.get("reason") ?? "";
    return {
      tone: "error",
      titleKey: `${CALENDAR}.errorTitle`,
      messageKey: `${CALENDAR}.errors.${CALENDAR_ERROR_REASONS.has(reason) ? reason : "unknown"}`,
    };
  }

  return null;
}

export function readAccountLinkRedirect(search: string): RedirectNotice | null {
  const params = new URLSearchParams(search);

  if (params.get("google_linked") === "success") {
    return {
      tone: "success",
      titleKey: `${LINK}.successTitle`,
      messageKey: `${LINK}.successMessage`,
    };
  }

  const code = params.get("error");
  if (code === null) return null;

  return {
    // Declining on Google's consent screen is a user choice, not a failure.
    tone: code === "google_denied" ? "info" : "error",
    titleKey: `${LINK}.errorTitle`,
    messageKey: `${LINK}.errors.${LINK_ERROR_CODES.has(code) ? code : "unknown"}`,
  };
}

/** Removes the given parameters from the current URL, keeping the rest. */
export function removeSearchParams(keys: string[]): void {
  const params = new URLSearchParams(window.location.search);
  keys.forEach((key) => params.delete(key));
  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
  );
}
