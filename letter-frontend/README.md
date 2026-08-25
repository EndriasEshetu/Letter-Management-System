# Letter Management System — Frontend

Frontend application for the **Sidama Innovation and Technology Agency (SITA)** Letter Management System.

## Project Context & Purpose

The Letter Management System (LMS) is a centralized digital solution designed for SITA to manage the complete lifecycle of official letters across departments. The system supports registration, routing, review, approval, dispatch, tracking, and archival of incoming, outgoing, and internal correspondence under role-based governance (`ADMIN`, `DEPARTMENT_MANAGER`, `EMPLOYEE`).

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
- @react-pdf-viewer/core & @react-pdf-viewer/default-layout (for letter attachment preview)
```

---

## Folder Structure

```text
letter-frontend/
├── public/
├── src/
│   ├── assets/              # Static assets and images
│   ├── components/          # Reusable React UI components
│   │   ├── common/          # Buttons, modals, cards, badges
│   │   ├── layout/          # AppShell, headers, sidebars
│   │   ├── letters/         # Letter registration modal, timelines, info panel
│   │   ├── approvals/       # Letter approval request cards, dialogs
│   │   ├── notifications/   # System alert badges & toasts
│   │   └── users/           # User management tables
│   ├── pages/               # Application view routes
│   │   ├── auth/            # Login & authentication pages
│   │   ├── dashboard/       # Role-based dashboards
│   │   ├── letters/         # Letter repository, details, preview
│   │   ├── approvals/       # Workflow approval queue
│   │   ├── users/           # User administration
│   │   ├── departments/     # Department management
│   │   ├── archives/        # Letter archiving
│   │   └── audit/           # Audit logs & history
│   │       └── LandingPage.tsx
│   ├── context/             # React context providers (AuthContext, etc.)
│   ├── services/            # API services (letterService, approvalService, dashboardService)
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript interfaces & types (letter.ts, approval.ts)
│   ├── routes/              # Routing configuration (AppRoutes.tsx, navigation.ts)
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

## Installation & Running Locally

### 1. Install Dependencies

```bash
cd letter-frontend
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
