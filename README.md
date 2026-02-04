# 🏥 Bitácora Médica - Frontend

> **Gestión integral de pacientes y sesiones terapéuticas con soporte multiplataforma.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg?logo=tailwind-css) ![Capacitor](https://img.shields.io/badge/Capacitor-Mobile-1199EE.svg?logo=capacitor)

Una aplicación moderna y robusta diseñada para profesionales de la salud, permitiendo el seguimiento detallado de pacientes, registro de sesiones, gestión documental y colaboración en tiempo real.

---

## ✨ Características Principales

- **🔐 Autenticación Segura**: Integración con Supabase y Google OAuth para un acceso rápido y seguro.
- **📊 Dashboard Interactivo**: Visualización de métricas clave, pacientes activos y gráficas de rendimiento mensual.
- **👥 Gestión de Pacientes**: Expedientes completos con información personal, historial médico y consentimiento informado digital.
- **📝 Registro de Sesiones**: Wizard intuitivo para documentar intervenciones, logros y planes de tratamiento.
- **📁 Repositorio Digital**: Carga y visualización segura de exámenes, informes y documentos (PDF e imágenes).
- **🤖 Asistente IA**: Chatbot integrado conectado a n8n para soporte y consultas rápidas sobre expedientes.
- **📱 Multiplataforma**: Experiencia nativa en iOS y Android gracias a **Capacitor**, además de la versión Web/PWA.
- **🌙 Modo Oscuro**: Interfaz adaptable con soporte completo para temas claro y oscuro.

## 🛠️ Tecnologías

Este proyecto está construido con un stack moderno enfocado en rendimiento y experiencia de usuario:

### Core
- **[React 19](https://react.dev/)**: Librería principal de UI.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipado estático para mayor seguridad.
- **[Vite](https://vitejs.dev/)**: Build tool de última generación y servidor de desarrollo.

### Estado y Datos
- **[Zustand](https://docs.pmnd.rs/zustand)**: Gestión de estado global ligero (Auth, UI).
- **[TanStack Query (React Query)](https://tanstack.com/query)**: Gestión de estado asíncrono y caché de servidor.
- **[Axios](https://axios-http.com/)**: Cliente HTTP con interceptores para manejo de tokens.

### UI & UX
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de estilos utility-first.
- **[Lucide React](https://lucide.dev/)**: Iconografía moderna y consistente.
- **[Recharts](https://recharts.org/)**: Gráficos de datos para el dashboard.
- **[React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)**: Manejo de formularios y validación de esquemas.

### Móvil
- **[Capacitor](https://capacitorjs.com/)**: Runtime para desplegar la app web en iOS y Android nativo.

---

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- npm o pnpm

### 1. Clonar el repositorio
```bash
git clone https://github.com/GalahadDev/Bitacora-Medica-Frontend
cd bitacora-medica-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto basándote en el ejemplo:

```env
VITE_API_URL=http://localhost:8080/api
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_key
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 📱 Desarrollo Móvil (iOS / Android)

Este proyecto usa Capacitor para generar aplicaciones nativas.

### Sincronizar cambios web con nativo
Cada vez que hagas un build de la app web, debes sincronizar:

```bash
npm run build
npx cap sync
```

### Ejecutar en Android
```bash
npx cap open android
```
Esto abrirá Android Studio. Desde ahí puedes ejecutar la app en un emulador o dispositivo físico.

### Ejecutar en iOS (Requiere macOS)
```bash
npx cap open ios
```
Esto abrirá Xcode.

---

## 📂 Estructura del Proyecto

```bash
src/
├── components/       # Componentes reutilizables (UI, Layouts, Features)
├── hooks/            # Custom Hooks (useImageUpload, etc.)
├── layouts/          # Layouts principales (DashboardLayout, AuthLayout)
├── lib/              # Configuraciones (API, Supabase, Utils)
├── pages/            # Vistas principales (Rutas)
├── router/           # Configuración de rutas (React Router)
├── store/            # Stores globales (Zustand)
└── types/            # Definiciones de tipos TypeScript
```
