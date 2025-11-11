# Study Space

Study Space es una aplicación web diseñada para ayudar a los usuarios a gestionar sus sesiones de estudio utilizando técnicas de repetición espaciada. Permite crear temas, tarjetas de memoria y programar revisiones para optimizar el aprendizaje.

## 🚀 Demo en Vivo

- **Frontend**: [https://project-study-space.vercel.app/](https://project-study-space.vercel.app/)
- **API Backend**: [https://studyspaceapi-production.up.railway.app/](https://studyspaceapi-production.up.railway.app/)

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework**: React 18 con TypeScript
- **Herramienta de Construcción**: Parcel
- **Estilos**: Tailwind CSS
- **Enrutamiento**: React Router DOM
- **Gestión de Estado**: API de Contexto de React
- **Iconos**: Lucide React
- **Componentes UI**: Material-UI (MUI) para algunos componentes
- **Cliente HTTP**: Fetch API

### Backend
- **Framework**: Node.js con Express.js
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT
- **Despliegue**: Railway

## 🏗️ Arquitectura

La aplicación sigue una arquitectura cliente-servidor:

### Arquitectura del Frontend
- **Componentes**: Componentes UI reutilizables organizados por funcionalidad
- **Páginas**: Componentes basados en rutas para diferentes vistas
- **Hooks**: Hooks personalizados para obtención de datos y gestión de estado
- **Contexto**: Gestión de estado global para autenticación
- **Tipos**: Interfaces de TypeScript para seguridad de tipos
- **Utilidades**: Funciones auxiliares y configuraciones

### Patrones de Diseño Utilizados
- **Hooks Personalizados**: Para encapsular lógica de obtención de datos (ej. `useCards`, `useReviews`)
- **Proveedor de Contexto**: Para estado global de autenticación
- **Composición de Componentes**: Construir UIs complejas desde componentes más pequeños
- **Separación de Responsabilidades**: Separación clara entre UI, lógica de negocio y capas de datos
- **Patrón Observer**: Actualizaciones impulsadas por eventos para sesiones de revisión
- **Patrón de Paginación**: Implementado para conjuntos de datos grandes (tarjetas, revisiones)

### Características Principales
- Autenticación y autorización de usuarios
- Gestión de temas con operaciones CRUD
- Creación y gestión de tarjetas de memoria
- Algoritmo de repetición espaciada para programar revisiones
- Integración con calendario para planificación de sesiones
- Seguimiento de progreso y estadísticas
- Sistema de rachas para seguimiento diario de estudio

### 🔐 Autenticación

La aplicación utiliza un sistema de autenticación basado en JWT tokens almacenados en localStorage. El flujo es:

1. *Registro/Login*: Usuario ingresa credenciales
2. *Verificación*: Token se valida en cada request a la API
3. *Protección de rutas*: Rutas protegidas requieren autenticación
4. *Logout*: Token se elimina del storage

*AuthContext.tsx*: Proporciona estado global de autenticación y funciones como login(), register(), logout(), getDashboard().


## Componentes Principales

### Layout (layout.tsx)

Componente que envuelve todas las páginas protegidas. Incluye:

- *Sidebar*: Navegación principal (mobile y desktop)
- *Header*: Información del usuario y notificaciones
- *Responsive Design*: Adaptable a móviles y desktop
- *Google Calendar Auth*: Integración en todas las páginas

### TopicsManager (topicsManager.tsx)

Gestiona la creación, edición y eliminación de temas de estudio:

- Lista de temas con estadísticas
- Formulario para crear/editar temas
- Integración con CardsManager para mostrar tarjetas por tema

### CardsManager (cardsManager.tsx)

Interfaz para gestionar tarjetas de estudio dentro de un tema:

- *Lista de tarjetas*: Muestra todas las tarjetas del tema seleccionado
- *Búsqueda*: Filtrar tarjetas por pregunta/respuesta
- *CRUD operations*: Crear, leer, actualizar, eliminar tarjetas
- *CardForm*: Formulario modal para crear/editar tarjetas

### SpacedRepetitionDashboard (spacedRepetitionDashboard.tsx)

Dashboard principal para sesiones de estudio:

- *Estadísticas*: Tarjetas pendientes, próximas revisiones
- *ReviewSessionCard*: Componente para revisar tarjetas individuales
- *Algoritmo de repetición*: Basado en dificultad y tiempo transcurrido

### CalendarWidget (calendarWidget.tsx)

Visualización de sesiones programadas:

- *Calendario interactivo*: Muestra fechas con sesiones
- *Eventos*: Sesiones de repaso programadas
- *Integración Google Calendar*: Sincronización opcional

## Páginas

### Landing (Landing.tsx)

Página pública de bienvenida con información sobre la aplicación.

### Login/Register (Login.tsx, Register.tsx)

Formularios de autenticación con validación y manejo de errores.

### Temas (Temas.tsx)

Dashboard principal que combina:

- *Estadísticas del usuario*: Temas activos, tarjetas totales, racha actual
- *TopicsManager*: Para gestionar temas
- *CardsManager*: Para gestionar tarjetas (cuando se selecciona un tema)

### StudySessions (StudySessions.tsx)

Página dedicada a sesiones de estudio:

- *Calendario de sesiones*: Visualización de revisiones programadas
- *SpacedRepetitionDashboard*: Interfaz para realizar revisiones

### CalendarPage (CalendarPage.tsx)

Vista dedicada del calendario con todas las sesiones programadas.


## Hooks Personalizados

### useCards (hooks/useCards.ts)

Maneja todas las operaciones CRUD para tarjetas:

- fetchCardsByTopic(): Obtener tarjetas por tema
- searchCards(): Buscar tarjetas por término
- addCard(), updateCard(), deleteCard(): Operaciones CRUD
- Manejo de loading y errores

### useTopics (hooks/useTopics.ts)

Similar a useCards pero para temas de estudio.

### useReviews (hooks/useReviews.ts)

Gestiona las sesiones de repaso y el algoritmo de repetición espaciada:

- fetchAllReviews(): Obtener todas las revisiones pendientes/proximas
- submitReview(): Enviar resultado de una revisión
- Cálculo de próximos intervalos basado en dificultad

### useCalendarSessions (hooks/useCalendarSessions.ts)

Maneja la integración con Google Calendar para sesiones de estudio.

## Integración con API

La aplicación se conecta a una API REST backend desplegada en Railway. Las principales rutas y endpoints utilizados incluyen:

### Autenticación
- `POST /auth/login` - Inicio de sesión de usuario
- `POST /auth/register` - Registro de nuevo usuario

### Temas (Topics)
- `GET /topics` - Obtener todos los temas del usuario
- `POST /topics` - Crear nuevo tema
- `PUT /topics/:id` - Actualizar tema
- `DELETE /topics/:id` - Eliminar tema

### Tarjetas (Cards)
- `GET /cards/topic/:topicId` - Obtener tarjetas de un tema (sin paginación)
- `POST /cards` - Crear nueva tarjeta
- `PUT /cards/:id` - Actualizar tarjeta
- `DELETE /cards/:id` - Eliminar tarjeta
- `GET /cards/search` - Buscar tarjetas con paginación

### Revisiones (Reviews)
- `GET /reviews/upcoming` - Obtener revisiones próximas con paginación
- `POST /reviews/:cardId/complete` - Marcar revisión como completada
- `GET /reviews/pending` - Obtener revisiones pendientes

### Progreso y Estadísticas
- `GET /progress/dashboard` - Obtener datos del dashboard
- `GET /progress/streaks` - Obtener información de rachas

### Calendario
- `GET /reviews/upcoming?days=30` - Obtener sesiones para el calendario

Todas las rutas protegidas requieren autenticación mediante JWT token en el header `Authorization: Bearer <token>`.


## 🚀 Primeros Pasos

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/StudySpaceProject/projectStudySpace.git
cd projectStudySpace
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura la URL de la API del backend en `src/config.ts` (ya está configurada por defecto):
```typescript
export const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://studyspaceapi-production.up.railway.app/api";
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador y navega a `http://localhost:5173`

### Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa del build de producción
- `npm run lint` - Ejecutar ESLint

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes UI reutilizables
│   ├── calendarWidget.tsx
│   ├── cardForm.tsx
│   ├── cardList.tsx
│   ├── cardsManager.tsx
│   ├── layout.tsx
│   ├── progressSection.tsx
│   ├── reviewSessionCard.tsx
│   ├── reviewSessionList.tsx
│   ├── spacedRepetitionDashboard.tsx
│   ├── studySession.tsx
│   ├── topicForm.tsx
│   ├── topicItem.tsx
│   ├── topicList.tsx
│   └── topicsManager.tsx
├── context/             # Proveedores de contexto de React
│   └── AuthContext.tsx
├── data/                # Datos estáticos y funcionalidades
│   └── functionalities.ts
├── hooks/               # Hooks personalizados de React
│   ├── reviewsUpdateEvent.ts
│   ├── useCalendarSessions.ts
│   ├── useCards.ts
│   ├── useProgress.ts
│   ├── useReviews.ts
│   ├── useStreaks.ts
│   └── useTopics.ts
├── pages/               # Componentes de página
│   ├── CalendarPage.tsx
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── ProgressPage.tsx
│   ├── Register.tsx
│   ├── StudySessions.tsx
│   └── Temas.tsx
├── types/               # Definiciones de tipos TypeScript
│   ├── calendarWidget.ts
│   ├── cards.ts
│   ├── difficultySelector.ts
│   ├── googleCalendar.ts
│   ├── index.ts
│   ├── pagination.ts
│   ├── reviews.ts
│   └── topics.ts
├── App.tsx             # Componente principal de la aplicación
├── config.ts           # Archivo de configuración
├── index.tsx           # Punto de entrada de la aplicación
└── main.tsx            # Renderizado raíz de React
```


## 📊 Características

- **Dashboard**: Resumen del progreso de estudio y estadísticas
- **Gestión de Temas**: Crear, editar y eliminar temas de estudio
- **Tarjetas de Memoria**: Crear y gestionar tarjetas de memoria dentro de temas
- **Sesiones de Revisión**: Programación de revisiones basada en repetición espaciada
- **Integración con Calendario**: Ver y planificar sesiones de estudio
- **Seguimiento de Progreso**: Monitorear el progreso de aprendizaje con el tiempo
- **Sistema de Rachas**: Seguimiento de rachas diarias de estudio
- **build2**
