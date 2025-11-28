# POLÍTICA DE PRIVACIDAD PARA MEMOPAL

**Última actualización:** 24/11/2025

**Responsable:** los propietarios de la plataforma MemoPal

**Correo de contacto:** support@memopal.app

**Jurisdicción:** Bogotá, Colombia

---

## 1. INFORMACIÓN QUE RECOPILAMOS

En MemoPal, nos comprometemos a minimizar la recopilación de datos y solo procesamos la información estrictamente necesaria para proporcionar el servicio de repaso espaciado. Nuestra plataforma está diseñada para estudiantes de secundaria, bachillerato, educación superior (grados técnicos, tecnológicos y universitarios), y profesionales de distintos campos que deseen organizar y repasar sus materiales de estudio.

### 1.1. Token JWT (Autenticación)

**Qué recopilamos:**
- Identificador de sesión con expiración de 48 horas

**Para qué lo usamos:**
- Autenticación del usuario y funcionamiento técnico esencial de la aplicación

**Base legal:**
- Ejecución de un contrato (Ley 1581 de 2012). Necesario para el servicio solicitado.

### 1.2. Datos de Registro

**Qué recopilamos:**
- Email
- Nombre de usuario opcional
- Contraseña cifrada con bcrypt
- Idioma preferido
- Zona horaria

**Para qué lo usamos:**
- Crear y gestionar la cuenta de usuario
- Envío de correos de verificación y comunicaciones esenciales del servicio

**Base legal:**
- Consentimiento explícito del usuario o ejecución de un contrato

### 1.3. Datos de Uso

**Qué recopilamos:**
- Progreso de estudio
- Resultados
- Tarjetas creadas
- Temas de estudio
- Historial de repasos
- Rachas de estudio

**Para qué lo usamos:**
- Proporcionar la funcionalidad principal de repaso espaciado
- Mostrar estadísticas de aprendizaje
- Gestionar el sistema de rachas

**Base legal:**
- Ejecución de un contrato

### 1.4. Tokens de Google Calendar

**Qué recopilamos:**
- Google Access Token y Refresh Token, almacenados de forma segura

**Para qué lo usamos:**
- Integración con Google Calendar para crear eventos de estudio programados

**Base legal:**
- Consentimiento explícito del usuario (OAuth 2.0)

### 1.5. Token de Verificación de Email

**Qué recopilamos:**
- Token temporal que expira en 24 horas

**Para qué lo usamos:**
- Verificar la autenticidad del correo electrónico del usuario

**Base legal:**
- Necesidad técnica y de seguridad del servicio

### 1.6. Imágenes en Tarjetas de Estudio

**Qué recopilamos:**
- Imágenes almacenadas en Cloudflare R2 CDN, optimizadas con Sharp

**Para qué lo usamos:**
- Permitir al usuario agregar contenido visual a sus materiales de estudio

**Base legal:**
- Ejecución de un contrato

### 1.7. Uso de Inteligencia Artificial

MemoPal puede utilizar servicios de inteligencia artificial de terceros para mejorar la experiencia de estudio del usuario, incluyendo funcionalidades como:

- Análisis de documentos educativos subidos por el usuario
- Generación automática de tarjetas de estudio basadas en contenido proporcionado
- Creación de resúmenes y notas personalizadas según parámetros del estudiante

**IMPORTANTE SOBRE EL PROCESAMIENTO CON IA:**

- El usuario sube documentos de forma VOLUNTARIA para estas funcionalidades
- Los documentos se envían temporalmente a los servidores del proveedor de IA para su procesamiento
- El contenido se procesa ÚNICAMENTE para generar el resultado solicitado por el usuario
- Los proveedores de IA utilizados NO emplean el contenido del usuario para entrenar sus modelos
- Los documentos originales NO se almacenan permanentemente en los servicios de terceros
- Solo el contenido generado (tarjetas, notas, resúmenes) se guarda en la cuenta del usuario en MemoPal

**Servicios de IA que pueden ser utilizados:**

- Google Gemini API: Para procesamiento de lenguaje natural y análisis de contenido educativo
- Políticas del proveedor: https://ai.google.dev/gemini-api/terms

El usuario mantiene control total sobre qué documentos procesa con IA y puede optar por NO utilizar estas funcionalidades en cualquier momento.

---

### ACLARACIÓN IMPORTANTE

Nuestra aplicación **NO recopila** de forma proactiva:

- Dirección IP completa
- Información detallada del dispositivo
- Datos de localización precisa (GPS)
- Cookies analíticas, de marketing o de terceros
- Datos de navegación más allá de los estrictamente necesarios

### COOKIES TÉCNICAS

La aplicación utiliza únicamente:

- Cookie httpOnly con el token JWT (expiración: 48 horas)
- Configuración: secure en producción, sameSite='lax'
- Propósito exclusivo: autenticación de sesión

---

## 2. FINALIDAD Y BASE LEGAL DEL TRATAMIENTO

Utilizamos sus datos exclusivamente para:

### 2.1. Servicios Principales

- Proporcionar y mantener el servicio de repaso espaciado con algoritmo adaptativo
- Gestionar su cuenta de usuario y autenticación segura
- Permitirle acceder a su historial de estudio, progreso y estadísticas
- Implementar el sistema de rachas (streaks) para motivar el estudio consistente
- Gestionar temas de estudio con colores personalizables
- Almacenar y mostrar tarjetas de estudio (tipo flashcard o explicación)

### 2.2. Comunicaciones Esenciales

- Envío de correo de verificación al registrarse (usando Resend API)
- Notificaciones relacionadas con la seguridad de su cuenta
- Comunicaciones necesarias sobre cambios en el servicio

### 2.3. Integraciones Opcionales

- Sincronización con Google Calendar (solo si usted autoriza explícitamente)
- Creación automática de eventos de estudio en su calendario
- Recordatorios de sesiones programadas (15 y 5 minutos antes)

La base legal para este tratamiento es la necesidad para la **EJECUCIÓN DEL CONTRATO** de prestación de servicios que usted solicita al usar nuestra aplicación, de conformidad con la Ley 1581 de 2012 y demás normativa colombiana de protección de datos.

---

## 3. ALMACENAMIENTO Y SEGURIDAD DE LOS DATOS

### 3.1. Infraestructura

- **Base de datos:** PostgreSQL hospedada en Railway
- **Almacenamiento de imágenes:** Cloudflare R2 CDN
- **Servidor backend:** Railway (https://memopalapi-production.up.railway.app)
- **Frontend:** Cloudflare Pages (https://memopal.app)

### 3.2. Medidas de Seguridad Implementadas

- Contraseñas cifradas con bcrypt (factor de costo: 9)
- Tokens JWT con expiración de 48 horas
- Conexiones cifradas HTTPS en todas las comunicaciones
- Cookies httpOnly y secure en producción
- Tokens de Google Calendar con renovación automática
- Validación de ownership en todas las operaciones (los usuarios solo acceden a sus propios recursos)
- Middleware de autenticación en todas las rutas protegidas
- Índices de base de datos optimizados para prevenir accesos no autorizados
- Eliminación en cascada de datos relacionados para garantizar integridad

### 3.3. Optimización de Imágenes

- Todas las imágenes subidas son optimizadas automáticamente con Sharp
- Redimensionamiento máximo: 1200x1200 píxeles
- Formato de salida: JPEG con calidad 85%
- Almacenamiento en Cloudflare R2 CDN para entrega rápida y segura

---

## 4. SERVICIOS DE TERCEROS QUE UTILIZAMOS

Para proporcionar nuestro servicio, compartimos datos mínimos y necesarios con los siguientes proveedores:

### 4.1. Railway (Hospedaje)

- **Proveedor:** Railway Corp. (Estados Unidos)
- **Datos compartidos:** Toda la información almacenada en nuestra base de datos (necesario para el funcionamiento técnico)
- **Propósito:** Hospedaje de base de datos PostgreSQL y servidor backend
- **Políticas de privacidad:** https://railway.app/legal/privacy

### 4.2. Cloudflare R2 (Almacenamiento CDN)

- **Proveedor:** Cloudflare Inc. (Estados Unidos)
- **Datos compartidos:** Imágenes subidas por el usuario en tarjetas de estudio
- **Propósito:** Almacenamiento y distribución de contenido multimedia
- **Políticas de privacidad:** https://www.cloudflare.com/privacypolicy/

### 4.3. Cloudflare Pages (Hosting Frontend)

- **Proveedor:** Cloudflare Inc. (Estados Unidos)
- **Datos compartidos:** Ningún dato personal; solo archivos estáticos de la aplicación web
- **Propósito:** Hospedaje y distribución de la interfaz web de usuario
- **Políticas de privacidad:** https://www.cloudflare.com/privacypolicy/

### 4.4. Resend (Servicio de Emails)

- **Proveedor:** Resend Inc. (Estados Unidos)
- **Datos compartidos:** Dirección de email del usuario
- **Propósito:** Envío de correos de verificación de cuenta
- **Políticas de privacidad:** https://resend.com/legal/privacy-policy

### 4.5. Google Gemini API (Inteligencia Artificial)

- **Proveedor:** Google LLC (Estados Unidos)
- **Datos compartidos:** Documentos que el usuario sube voluntariamente para procesamiento con IA
- **Propósito:** Procesamiento de lenguaje natural, análisis de documentos, y generación de contenido educativo personalizado
- **Uso:** Voluntario - solo cuando el usuario activa funcionalidades de IA
- **Políticas de privacidad:** https://ai.google.dev/gemini-api/terms

### 4.6. Google Calendar API (Integración Opcional)

- **Proveedor:** Google LLC (Estados Unidos)
- **Datos compartidos:** Tokens OAuth 2.0 (Access Token y Refresh Token)
- **Propósito:** Creación automática de eventos de estudio en el calendario del usuario
- **Acceso solicitado:** Alcance limitado a `https://www.googleapis.com/auth/calendar.events`
- **Uso:** Completamente OPCIONAL - requiere autorización explícita del usuario
- **Políticas de privacidad:** https://policies.google.com/privacy

**Detalles de la integración con Google Calendar:**

- Creación automática de eventos de estudio según algoritmo de repaso espaciado
- Los eventos se crean para el día siguiente a las 9:00 AM por defecto
- Recordatorios automáticos: 15 minutos y 5 minutos antes del evento
- Color de evento: Azul (#4) para fácil identificación visual
- Gestión inteligente: actualización automática si la fecha de repaso cambia
- Eliminación automática si se elimina el conjunto de tarjetas
- El usuario puede desconectar la integración en cualquier momento desde la configuración

**IMPORTANTE:** No almacenamos credenciales de Google. Solo guardamos los tokens OAuth necesarios para la sincronización, los cuales son renovados automáticamente y pueden ser revocados por el usuario en cualquier momento.

---

## 5. TIEMPO DE CONSERVACIÓN DE LOS DATOS

### 5.1. Durante el Uso Activo del Servicio

Mientras su cuenta esté activa, conservaremos sus datos de forma indefinida para proporcionar el servicio.

### 5.2. Tras Solicitud de Eliminación de Cuenta

Cuando solicite la eliminación de su cuenta:

- Los datos personales serán eliminados de forma permanente dentro de un plazo máximo de 30 días
- El proceso de eliminación incluye:
  - Eliminación de todos los registros en la base de datos (PostgreSQL)
  - Eliminación de todas las imágenes almacenadas en Cloudflare R2
  - Eliminación de todos los eventos creados en Google Calendar (si la integración estaba activa)
  - Revocación de todos los tokens de autenticación y sesión

### 5.3. Datos con Tiempo de Expiración Automática

- **Tokens JWT:** Expiración automática a las 48 horas
- **Tokens de verificación de email:** Expiración automática a las 24 horas
- **Tokens de Google Calendar:** Renovación automática; revocados al eliminar cuenta

---

## 6. SUS DERECHOS COMO TITULAR DE DATOS

De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013, usted tiene los siguientes derechos:

### 6.1. Derecho de Acceso

Conocer, actualizar y rectificar sus datos personales almacenados en nuestra plataforma. Puede acceder a toda su información desde la configuración de su cuenta.

### 6.2. Derecho de Actualización y Rectificación

Modificar sus datos personales en cualquier momento desde la configuración de su cuenta.

### 6.3. Derecho de Eliminación

Solicitar la eliminación de su cuenta y todos los datos asociados. Esta acción es **irreversible** y eliminará permanentemente:

- Su cuenta de usuario
- Todos los temas y tarjetas de estudio creadas
- Todo el historial de repasos y estadísticas
- Todas las imágenes almacenadas
- Todos los eventos de Google Calendar creados por la aplicación (si la integración está activa)

### 6.4. Derecho de Revocación del Consentimiento

Puede revocar el consentimiento otorgado para el tratamiento de sus datos en cualquier momento mediante:

- Eliminación de su cuenta desde la configuración
- Desconexión de integraciones opcionales (Google Calendar)
- Contacto con nosotros a través de support@memopal.app

### 6.5. Presentación de Quejas

Si considera que sus derechos han sido vulnerados, puede presentar una queja ante la Superintendencia de Industria y Comercio (SIC) de Colombia.

---

## 7. MENORES DE EDAD

Nuestro servicio está dirigido a estudiantes de secundaria, bachillerato, educación superior y profesionales.

**Edad mínima para uso del servicio:** 14 años

Para usuarios menores de 14 años, requerimos el consentimiento de un padre o tutor legal. Los padres o tutores pueden contactarnos en support@memopal.app para gestionar cuentas de menores.

---

## 8. TRANSFERENCIAS INTERNACIONALES DE DATOS

Algunos de nuestros proveedores de servicios están ubicados en Estados Unidos. Al usar MemoPal, usted consiente la transferencia de sus datos a estos proveedores para los fines descritos en esta política.

Todos nuestros proveedores cumplen con estándares internacionales de protección de datos y cuentan con políticas de privacidad robustas.

---

## 9. CAMBIOS A ESTA POLÍTICA DE PRIVACIDAD

Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Los cambios significativos serán notificados a través de:

- Correo electrónico a la dirección registrada en su cuenta
- Aviso visible en la plataforma

La fecha de "Última actualización" al inicio de este documento indica cuándo se realizó la modificación más reciente.

Le recomendamos revisar periódicamente esta política para mantenerse informado sobre cómo protegemos su información.

---

## 10. CONTACTO

Para cualquier pregunta, sugerencia o ejercicio de sus derechos relacionados con la protección de sus datos personales, puede contactarnos en:

**Correo electrónico:** support@memopal.app

**Responsable:** los propietarios de la plataforma MemoPal

**Jurisdicción:** Bogotá, Colombia

Nos comprometemos a responder sus solicitudes en un plazo máximo de 15 días hábiles contados a partir de la recepción de la solicitud.

---

*Esta Política de Privacidad fue actualizada por última vez el 24 de noviembre de 2025.*
