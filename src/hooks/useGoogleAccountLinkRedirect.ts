import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../context/NotificationContext";
import {
  ACCOUNT_LINK_PARAMS,
  readAccountLinkRedirect,
  removeSearchParams,
} from "../utils/googleRedirects";

/**
 * Reports the Google account link outcome that the backend appends to
 * /topics, then removes only the link parameters from the URL.
 */
export function useGoogleAccountLinkRedirect(): void {
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    const notice = readAccountLinkRedirect(window.location.search);
    if (!notice) return;

    const show = { success: showSuccess, info: showInfo, error: showError }[notice.tone];
    show(t(notice.titleKey), t(notice.messageKey));
    removeSearchParams(ACCOUNT_LINK_PARAMS);
    // Runs once on mount: the redirect is a one-time event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

