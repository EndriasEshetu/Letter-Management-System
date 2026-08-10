# Smart E-Office Document Management System — Frontend

Frontend application for the **Sidama Innovation and Technology Agency (SITA)** Smart E-Office Document Management System.

## Project Context & Purpose

The Smart E-Office Document Management System is designed for SITA to streamline electronic document workflows, official approvals, archival, and administrative operations across departments with role-based governance (`ADMIN`, `DEPARTMENT_MANAGER`, `EMPLOYEE`).

---

## Approved Technology Stack

```text
Frontend:
- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- React Router v7
- Axios
- @react-pdf-viewer/core & @react-pdf-viewer/default-layout (prepared for document preview)
```

---

## Current Status: Phase 1 — Project Setup & Foundation

Phase 1 establishes the scalable project architecture, design tokens, environment configuration, routing shell, and centralized API client.

### Key Deliverables Completed in Phase 1:
- [x] React 19 + TypeScript + Vite architecture initialization
- [x] Tailwind CSS v4 styling system with SITA agency branding palette
- [x] Centralized Axios HTTP client instance (`src/services/api.ts`)
- [x] Environment variable configuration (`.env` and `.env.example`)
- [x] Scalable feature-based directory architecture
- [x] React Router setup with route definitions for Phase 2+
- [x] PDF viewer dependencies installed for future phase integration
- [x] Clean landing application shell with responsive layout

---

## Folder Structure

```text
smart-eoffice-frontend/
├── public/
├── src/
│   ├── assets/              # Static assets and images
│   ├── components/          # Reusable React UI components
│   │   ├── common/          # Buttons, modals, cards, badges
│   │   ├── layout/          # AppShell, headers, sidebars
│   │   ├── documents/       # Document lists, upload forms
│   │   ├── workflows/       # Approval actions and timeline
│   │   ├── notifications/   # System alert badges & toasts
│   │   └── users/           # User management tables
│   ├── pages/               # Application view routes
│   │   ├── auth/            # Login & authentication pages
│   │   ├── dashboard/       # Role-based dashboards
│   │   ├── documents/       # Document repository & details
│   │   ├── approvals/       # Workflow approval requests
│   │   ├── users/           # User administration
│   │   ├── departments/     # Department management
│   │   ├── archives/        # Document archiving
│   │   └── audit/           # Audit logs & history
│   │       └── LandingPage.tsx
│   ├── context/             # React context providers (AuthContext, etc.)
│   ├── services/            # API services and Axios configuration
│   │   └── api.ts
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript interfaces & types
│   ├── routes/              # Routing configuration
│   │   └── AppRoutes.tsx
│   ├── App.tsx              # Application root
│   ├── main.tsx             # Entry point
│   └── index.css            # Global Tailwind & theme CSS
├── .env                     # Local environment variables
├── .env.example             # Environment variable template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Environment Variable Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Refer to `.env.example` for the required configuration keys.

---

## Installation & Running Locally

### 1. Install Dependencies

```bash
cd smart-eoffice-frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### 3. Build for Production

```bash
npm run build
```

The compiled production bundle will be output to the `dist/` directory.

### 4. Preview Production Build

```bash
npm run preview
```

---

## Future Implementation Roadmap

- **Phase 2**: Authentication & User Management (JWT, Login, AuthContext, Protected Routes)
- **Phase 3**: Core Document Management (Upload, Metadata, Search, PDF Preview)
- **Phase 4**: Approval Workflows (Multi-stage approvals, Routing, Digital signatures)
- **Phase 5**: Audit Logging, System Notifications, and Testing
- **Phase 6**: Production Deployment & Operational Documentation
