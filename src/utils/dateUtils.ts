/**
 * Utilidades para el manejo de fechas y zonas horarias
 */

/**
 * Obtiene la zona horaria del navegador del usuario
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Formatea una fecha UTC para mostrarla en la zona horaria del usuario
 */
export function formatDateForUser(
  utcDate: string,
  userTimezone: string
): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
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
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "UTC",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(utcDate));
  }
}

/**
 * Formatea solo la fecha (sin hora) en la zona horaria del usuario
 */
export function formatDateOnlyForUser(
  utcDate: string,
  userTimezone: string
): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: userTimezone,
      dateStyle: "medium",
    }).format(new Date(utcDate));
  } catch (error) {
    console.warn(
      "Error formateando fecha con zona horaria, usando UTC como fallback:",
      error
    );
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "UTC",
      dateStyle: "medium",
    }).format(new Date(utcDate));
  }
}

/**
 * Formatea solo la hora en la zona horaria del usuario
 */
export function formatTimeOnlyForUser(
  utcDate: string,
  userTimezone: string
): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: userTimezone,
      timeStyle: "short",
    }).format(new Date(utcDate));
  } catch (error) {
    console.warn(
      "Error formateando hora con zona horaria, usando UTC como fallback:",
      error
    );
    return new Intl.DateTimeFormat("es-ES", {
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
