# 🏢 Smart E-Office Document Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E.svg)](https://supabase.com/)

A modern, enterprise-grade **Smart E-Office Document Management System** built for the **Sidama Innovation and Technology Agency (SITA)**. This system digitizes government office operations, eliminates paper-based bottlenecks, streamlines document approval pipelines, enforces role-based access control (RBAC), and maintains strict audit logs.

---

## 📑 Table of Contents

- [Overview & Purpose](#-overview--purpose)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Demo Credentials](#-demo-credentials)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Installation & Quickstart](#-installation--quickstart)
- [Database Schema & Migrations](#-database-schema--migrations)
- [API Overview](#-api-overview)
- [Available Scripts](#-available-scripts)

---

## 🎯 Overview & Purpose

The **Smart E-Office Document Management System** provides SITA with an end-to-end digital workplace platform. Key objectives include:

- **Paperless Workflows**: Seamlessly create, submit, review, approve, and archive official agency documents electronically.
- **Hierarchical Approvals**: Support structured multi-stage approval processes managed by department leaders.
- **Version Control & History**: Maintain complete version records for every document revision with binary storage in Supabase Storage.
- **Governance & Auditability**: Track every document action, status change, and user login through system-wide audit logs.
- **In-Browser Previewing**: View PDF documents directly within the browser without requiring local desktop software.

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│              Smart E-Office Single-Page App                      │
│             (React 19 + Vite 6 + Tailwind CSS v4)                │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ HTTP / REST API (JWT Bearer)
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Express API Gateway Server                     │
│               (Node.js + TypeScript - Port 5000)                 │
│                                                                  │
│  ├─ Auth Middleware (Supabase JWT Verification)                  │
│  ├─ RBAC Authorization Guards (ADMIN, MANAGER, EMPLOYEE)        │
│  ├─ Input Validation (Zod) & Upload Parsing (Multer)             │
│  └─ Security (Helmet, CORS, Express Rate Limit)                  │
└───────────────┬────────────────────────────────┬─────────────────┘
                │ Direct SQL (pg pool)           │ Storage SDK
                ▼                                ▼
┌────────────────────────────────┐  ┌──────────────────────────────┐
│       Supabase Postgres        │  │       Supabase Storage       │
│  - Users, Depts, Documents     │  │  - `documents` Bucket        │
│  - Approvals, Comments, Logs   │  │  - Binary PDF Storage        │
└────────────────────────────────┘  └──────────────────────────────┘
```

The system operates as a monorepo containing two main packages:
1. **`smart-eoffice-frontend`**: SPA built with React 19, TypeScript, Vite, and Tailwind CSS v4.
2. **`smart-eoffice-backend`**: REST API bridge built with Express, TypeScript, PostgreSQL (`pg`), and Supabase Auth/Storage.

---

## 🛠️ Tech Stack

### **Frontend** (`smart-eoffice-frontend`)
- **Core Framework**: React 19, TypeScript, Vite 6
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 (Custom SITA Agency palette: Deep Teal, Emerald, Amber, Slate)
- **Icons & UI**: Lucide React
- **Document Viewing**: `@react-pdf-viewer/core`, `@react-pdf-viewer/default-layout`, `pdfjs-dist`
- **HTTP Client**: Axios (with global JWT request interceptors and error handlers)

### **Backend** (`smart-eoffice-backend`)
- **Runtime**: Node.js, TypeScript (`tsx`)
- **Server Framework**: Express 4
- **Database Client**: `pg` (PostgreSQL connection pooler)
- **BaaS Platform**: Supabase (PostgreSQL, Supabase Auth GoTrue, Supabase Storage)
- **Security & Utilities**: `helmet`, `cors`, `express-rate-limit`, `morgan`, `zod`, `multer`

---

## ✨ Key Features

### 📄 1. Document Management & Repository
- **Document Metadata**: Title, document number (auto-generated pattern), description, category, department, tags, and security levels (`PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`).
- **File Uploads**: Support for PDF documents with automatic metadata extraction.
- **Version Tracking**: Complete version lineage (`v1.0`, `v1.1`, `v2.0`), storage paths, and download options for previous revisions.
- **In-Browser Document Preview**: Built-in PDF reader with page controls and zoom.
- **Document Search & Filtering**: Instant search by document title/number, filtering by category, status, and department.

### ⏱️ 2. Approval Workflow Engine
- **Submission Workflow**: Draft documents can be formally submitted for departmental review (`DRAFT` → `PENDING_APPROVAL`).
- **Manager Approval Queue**: Centralized queue for Department Managers to view pending documents assigned to their department.
- **Actions & Decision Handling**:
  - ✅ **Approve**: Progresses document to `APPROVED`.
  - ❌ **Reject**: Rejects document with compulsory feedback comment.
  - 🔄 **Request Changes**: Sends document back to author with revision feedback (`CHANGES_REQUESTED`).
- **Priority Indicators**: High-priority flagging (`HIGH`, `NORMAL`) for urgent official memos.
- **Activity Stream**: Audit history of approval decisions and reviewer timestamps.

### 💬 3. Departmental Collaboration & Notifications
- **Document Comments**: Real-time threaded discussion per document for feedback and revisions.
- **Notification System**: User notifications triggered on status updates, document submissions, and review requests.
- **Notification Management**: Mark individual alerts as read or clear all.

### 👥 4. User & Department Administration
- **User Management (Admin)**: Create system users, assign roles (`ADMIN`, `DEPARTMENT_MANAGER`, `EMPLOYEE`), update job titles, link departments, and toggle active status (`ACTIVE`/`INACTIVE`).
- **Department Management (Admin)**: Add and manage organizational units, view document capacity/volume metrics, and assign Department Managers.
- **Profile Management**: Self-service profile updates and secure password change capabilities.

### 📊 5. Audit Logging & System Analytics
- **System Audit Logs (Admin)**: Immutable log of authentication attempts, document access, approval actions, and administration events.
- **Analytical Dashboards**: Metrics widgets displaying Total Documents, Pending Approvals, Approved Count, Department Distribution, and Activity Feeds.

### 🌐 6. Public Landing Portal
- Public homepage introducing the Sidama Innovation and Technology Agency (SITA), key digital transformation metrics, document verification tools, and secure portal access.

---

## 🔐 Role-Based Access Control (RBAC)

| Feature / Action | EMPLOYEE | DEPARTMENT_MANAGER | ADMIN |
|---|:---:|:---:|:---:|
| View Public & Internal Documents | ✅ | ✅ | ✅ |
| Upload & Edit Own Draft Documents | ✅ | ✅ | ✅ |
| Submit Documents for Approval | ✅ | ✅ | ✅ |
| Add Comments to Documents | ✅ | ✅ | ✅ |
| Review & Approve / Reject Queue | ❌ | ✅ | ✅ |
| View System Approval Metrics | ❌ | ✅ | ✅ |
| Manage Users & Roles | ❌ | ❌ | ✅ |
| Manage Departments & Managers | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ✅ |

---

## 🔑 Demo Credentials

After running database migrations and seed scripts (`npm run seed`), use these demo accounts to sign in:

| Role | Email | Password | Primary Scope |
|---|---|---|---|
| **Admin** | `admin@sita.gov.et` | `Sita@2026` | Full System Control, Users, Depts & Audit |
| **Department Manager** | `manager@sita.gov.et` | `Sita@2026` | Approvals Queue, Department Documents |
| **Employee** | `employee@sita.gov.et` | `Sita@2026` | Upload, Submit & Track Personal Documents |

---

## 📁 Repository Structure

```text
Smart-E-Office-Document-Management-System/
├── README.md                      # Primary project documentation (this file)
├── package-lock.json
│
├── smart-eoffice-backend/         # Express REST API & Supabase Integration
│   ├── .env.example               # Backend environment variables template
│   ├── package.json
│   ├── tsconfig.json
│   ├── scripts/
│   │   ├── migrate.ts             # Database SQL migration script
│   │   └── seed.ts                # Idempotent demo data seeder
│   ├── supabase/
│   │   └── migrations/
│   │       └── 0001_initial.sql   # DDL database schema definitions
│   └── src/
│       ├── index.ts               # Express application entry point
│       ├── config.ts              # Environment & Supabase config loader
│       ├── lib/                   # Supabase client & postgres pool
│       ├── middleware/            # JWT verification & error middleware
│       └── routes/                # API router modules
│           ├── auth.routes.ts
│           ├── users.routes.ts
│           ├── departments.routes.ts
│           ├── documents.routes.ts
│           ├── approvals.routes.ts
│           ├── comments.routes.ts
│           └── notifications.routes.ts
│
└── smart-eoffice-frontend/        # React 19 Single-Page Application
    ├── .env.example               # Frontend environment variables template
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css              # Global styles & Tailwind CSS v4 setup
        ├── assets/                # Logos and graphics
        ├── components/            # Reusable UI components
        │   ├── common/            # Buttons, modals, cards, badges
        │   ├── layout/            # AppShell, Navbar, Sidebar
        │   ├── documents/         # Upload forms, document tables
        │   └── workflows/         # Approval actions & timeline
        ├── context/               # AuthContext state management
        ├── hooks/                 # Custom React hooks
        ├── pages/                 # Routed page views
        │   ├── LandingPage.tsx    # SITA public portal
        │   ├── auth/              # Login view
        │   ├── dashboard/         # Role-based dashboards
        │   ├── documents/         # Repository & Document Details
        │   ├── approvals/         # Approval Queue page
        │   ├── users/             # User Management table
        │   ├── departments/       # Department Management
        │   ├── archives/          # Archived Documents
        │   ├── audit/             # Audit Logs viewer
        │   └── reports/           # Reports & Analytics
        ├── routes/                # AppRoutes, ProtectedRoute & RoleRoute
        ├── services/              # Centralized Axios API client
        └── types/                 # TypeScript interfaces
```

---

## ⚡ Prerequisites

Ensure you have the following installed on your developer machine:

- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **npm**: `v9.0.0` or higher
- **Supabase Account**: A free Supabase project (or local Supabase instance) with:
  - Access to API keys (`anon` key and `service_role` key)
  - Connection URI for PostgreSQL database

---

## ⚙️ Environment Configuration

### 1. Backend Configuration (`smart-eoffice-backend/.env`)

Copy `.env.example` to `.env` in `smart-eoffice-backend`:

```bash
cd smart-eoffice-backend
cp .env.example .env
```

Fill in the required configuration variables:

```env
PORT=5000
NODE_ENV=development

# Supabase API Credentials (Dashboard -> Settings -> API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Supabase Postgres Connection (Dashboard -> Settings -> Database -> Connection string)
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-region.pooler.supabase.com:6543/postgres
```

### 2. Frontend Configuration (`smart-eoffice-frontend/.env`)

Copy `.env.example` to `.env` in `smart-eoffice-frontend`:

```bash
cd smart-eoffice-frontend
cp .env.example .env
```

Configure the backend API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Quickstart

### Step 1: Install Backend Dependencies & Seed Database

```bash
cd smart-eoffice-backend

# Install dependencies
npm install

# Apply Database Schema Migrations
npm run migrate

# Seed Demo Accounts and Initial Sample Data
npm run seed
```

### Step 2: Start Backend API Server

```bash
# Run backend in development mode (hot reloading)
npm run dev
```

The REST API server will start at: **`http://localhost:5000/api`**

### Step 3: Install Frontend Dependencies & Start App

In a **new terminal window**:

```bash
cd smart-eoffice-frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```

The frontend application will start at: **`http://localhost:5173`**

---

## 🗄️ Database Schema & Migrations

The database schema is managed via SQL migrations located in `smart-eoffice-backend/supabase/migrations`.

### Primary Tables Summary

- **`departments`**: Stores organization structures, department codes, descriptions, and assigned manager IDs.
- **`users`**: Contains extended user profile details linked directly to Supabase Auth UUIDs (`auth.users`).
- **`documents`**: Main document records with titles, auto-generated numbers, category, security classifications, storage paths, and statuses (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `CHANGES_REQUESTED`, `ARCHIVED`).
- **`document_versions`**: Stores version history snapshots (`version_number`, `storage_path`, `is_current`).
- **`approvals`**: Tracks approval requests, priority (`HIGH`/`NORMAL`), reviewer notes, and decision timestamps.
- **`approval_activities`**: Timeline log of actions performed during document reviews.
- **`comments`**: Threaded feedback messages attached to documents.
- **`notifications`**: User alert notifications with read flags.

---

## 🔌 API Overview

All API endpoints are mounted under `/api`. Protected routes require a valid HTTP header: `Authorization: Bearer <token>`.

### Public Routes
- `GET  /api/health` — Health check endpoint
- `POST /api/auth/login` — Authenticate user and receive Supabase JWT token

### Authenticated Routes
- **Auth**: `GET /api/auth/me`, `POST /api/auth/change-password`
- **Documents**:
  - `GET  /api/documents` — List & search documents
  - `POST /api/documents` — Upload new document (multipart form)
  - `GET  /api/documents/:id` — Get document details
  - `GET  /api/documents/:id/download` — Stream binary PDF download
  - `POST /api/documents/:id/submit` — Submit document for approval
  - `GET  /api/documents/:id/versions` — View version history
  - `POST /api/documents/:id/versions` — Upload new version revision
  - `POST /api/documents/:id/archive` — Move document to archive
- **Approvals** (Manager/Admin):
  - `GET  /api/approvals` — Fetch approval queue
  - `GET  /api/approvals/metrics` — Aggregate approval statistics
  - `GET  /api/approvals/activity` — Approval timeline feed
  - `POST /api/approvals/:document_id/approve` — Approve document
  - `POST /api/approvals/:document_id/reject` — Reject document
  - `POST /api/approvals/:document_id/request-changes` — Request revisions
- **Comments**:
  - `GET  /api/documents/:documentId/comments` — Fetch comments
  - `POST /api/documents/:documentId/comments` — Add comment
- **Users** (Admin):
  - `GET  /api/users` — List users
  - `POST /api/users` — Create new user in Supabase Auth & DB
  - `PUT  /api/users/:id` — Update user profile & role
  - `PATCH /api/users/:id/toggle-status` — Activate / Deactivate user account
- **Departments** (Admin):
  - `GET  /api/departments` — List departments
  - `POST /api/departments` — Create department
  - `PUT  /api/departments/:id` — Update department details
  - `POST /api/departments/:id/assign-manager` — Assign department head
  - `GET  /api/system/capacity` — View department storage analytics
- **Notifications**:
  - `GET  /api/notifications` — Fetch user notifications
  - `POST /api/notifications/:id/read` — Mark notification as read
  - `POST /api/notifications/read-all` — Mark all as read

---

## 📜 Available Scripts

### Backend (`smart-eoffice-backend`)

| Command | Action |
|---|---|
| `npm run dev` | Starts server with `tsx watch` for hot-reload development |
| `npm run build` | Compiles TypeScript into distribution folder (`dist/`) |
| `npm start` | Executes compiled production bundle (`dist/src/index.js`) |
| `npm run migrate` | Executes PostgreSQL SQL schema migrations |
| `npm run seed` | Seeds database with demo accounts and initial dataset |
| `npm run typecheck` | Runs TypeScript type checking without emitting files |

### Frontend (`smart-eoffice-frontend`)

| Command | Action |
|---|---|
| `npm run dev` | Launches Vite local development server (`http://localhost:5173`) |
| `npm run build` | Runs TypeScript check and builds optimized production bundle |
| `npm run preview` | Serves production build locally for testing |

---

## 📄 License & Ownership

Developed for the **Sidama Innovation and Technology Agency (SITA)**. All rights reserved.
