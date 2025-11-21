/**
 * Utilidades para el manejo de fechas y zonas horarias
 */

import i18n from "../i18n/config";

/**
 * Obtiene el locale basado en el idioma actual de i18n
 */
function getCurrentLocale(): string {
  const language = i18n.language || "es";
  return language === "es" ? "es-ES" : "en-US";
}

/**
 * Obtiene la zona horaria del navegador del usuario
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Formatea una fecha UTC para mostrarla en la zona horaria del usuario
 * El formato visual se adapta al idioma seleccionado (es-ES o en-US)
 */
export function formatDateForUser(
  utcDate: string,
  userTimezone: string
): string {
  try {
    const locale = getCurrentLocale();
    return new Intl.DateTimeFormat(locale, {
      timeZone: userTimezone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(utcDate));
  } catch (error) {
    console.warn(
      "Error formateando fecha con zona horaria, usando UTC como fallback:",
      error
    );
    // Fallback a UTC si hay error con la zona horaria
    const locale = getCurrentLocale();
    return new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(utcDate));
  }
}

/**
 * Formatea solo la fecha (sin hora) en la zona horaria del usuario
 * El formato visual se adapta al idioma seleccionado (es-ES o en-US)
 */
export function formatDateOnlyForUser(
  utcDate: string,
  userTimezone: string
): string {
  try {
    const locale = getCurrentLocale();
    return new Intl.DateTimeFormat(locale, {
      timeZone: userTimezone,
      dateStyle: "medium",
    }).format(new Date(utcDate));
  } catch (error) {
    console.warn(
      "Error formateando fecha con zona horaria, usando UTC como fallback:",
      error
    );
    const locale = getCurrentLocale();
    return new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      dateStyle: "medium",
    }).format(new Date(utcDate));
  }
}

/**
 * Formatea solo la hora en la zona horaria del usuario
 * El formato visual se adapta al idioma seleccionado (es-ES o en-US)
 */
export function formatTimeOnlyForUser(
  utcDate: string,
  userTimezone: string
): string {
  try {
    const locale = getCurrentLocale();
    return new Intl.DateTimeFormat(locale, {
      timeZone: userTimezone,
      timeStyle: "short",
    }).format(new Date(utcDate));
  } catch (error) {
    console.warn(
      "Error formateando hora con zona horaria, usando UTC como fallback:",
      error
    );
    const locale = getCurrentLocale();
    return new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      timeStyle: "short",
    }).format(new Date(utcDate));
  }
}

/**
 * Obtiene la zona horaria del usuario desde localStorage con fallback
 */
export function getStoredUserTimezone(): string {
  return localStorage.getItem("userTimezone") || getUserTimezone();
}
