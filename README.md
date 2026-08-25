# ✉️ Letter Management System (LMS)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E.svg)](https://supabase.com/)

A modern, enterprise-grade **Letter Management System** built for the **Sidama Innovation and Technology Agency (SITA)**. This system digitizes official letter registration, routing, tracking, review, approval, dispatch, and archival operations across organization directorates.

---

## 📑 Table of Contents

- [Overview & Purpose](#-overview--purpose)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Demo Credentials](#-demo-credentials)
- [Repository Structure](#-repository-structure)
- [Installation & Quickstart](#-installation--quickstart)
- [API Overview](#-api-overview)

---

## 🎯 Overview & Purpose

The **Letter Management System (LMS)** provides SITA with an end-to-end digital correspondence platform. Key objectives include:

- **Centralized Letter Registry**: Register incoming, outgoing, and internal letters with unique reference and registration numbers.
- **Auditable Letter Lifecycle**: Track letters through 14 distinct status stages from `REGISTERED` to `DISPATCHED` and `ARCHIVED`.
- **Hierarchical Sign-Offs**: Support structured approval processes managed by department directors and unit heads.
- **Tracking & Due Dates**: Monitor pending letter actions, response deadlines, and sender/recipient metadata.
- **Attachment Management**: Attach original scans, annexes, and supporting documentation with binary storage.
- **Governance & Auditability**: Maintain full audit logs of every registration, view, approval, dispatch, and archival action.

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│             Letter Management System Single-Page App              │
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
│  - Users, Depts, Letters       │  │  - `letters` Bucket          │
│  - Approvals, Comments, Logs   │  │  - Attachment Storage        │
└────────────────────────────────┘  └──────────────────────────────┘
```

---

## 🛠️ Tech Stack

### **Frontend** (`letter-frontend`)
- **Core Framework**: React 19, TypeScript, Vite 6
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 (Custom SITA Agency palette: Sage `#526A55`, Charcoal `#292A27`, Warm Off-White `#F5F3ED`, Amber `#C48D3F`, Muted Red `#8B3232`)
- **Icons & UI**: Lucide React
- **Document Viewing**: `@react-pdf-viewer/core`, `@react-pdf-viewer/default-layout`, `pdfjs-dist`
- **HTTP Client**: Axios (with global JWT request interceptors and error handlers)

### **Backend** (`letter-backend`)
- **Runtime**: Node.js, TypeScript (`tsx`)
- **Server Framework**: Express 4
- **Database Client**: `pg` (PostgreSQL connection pooler)
- **BaaS Platform**: Supabase (PostgreSQL, Supabase Auth GoTrue, Supabase Storage)

---

## ✨ Key Features

### ✉️ 1. Letter Registration & Repository
- **Letter Metadata**: Reference number, registration number, subject, description, letter type (`INCOMING`, `OUTGOING`, `INTERNAL`, `MEMORANDUM`, etc.), category, department, sender, recipient, date received/sent, response required flag, and confidentiality levels.
- **Letter Attachments**: Attachment history, file uploads, and stream download options.
- **In-Browser Attachment Preview**: Built-in PDF reader for attached letter documents.
- **Search & Filtering**: Search by subject, reference number, sender, or recipient; filter by letter type, department, and status.

### ⏱️ 2. Approval & Sign-Off Engine
- **Review Queue**: Centralized queue for Department Managers to view pending letters requiring sign-off.
- **Decision Handling**:
  - ✅ **Approve**: Progresses letter to `APPROVED`.
  - ❌ **Reject**: Rejects letter with compulsory feedback reason.
  - 🔄 **Request Changes**: Sends letter back to author with revision feedback (`RETURNED` / `CHANGES_REQUESTED`).
- **Priority Indicators**: High-priority and urgent flagging for time-critical correspondence.

### 💬 3. Collaboration & Discussion
- **Letter Discussion**: Threaded discussion per letter for internal notes and revision feedback.
- **System Alerts**: User notifications for letter assignments, status changes, and approaching response deadlines.

### 👥 4. User & Department Administration
- **User Management (Admin)**: Create system users, assign roles (`ADMIN`, `DEPARTMENT_MANAGER`, `EMPLOYEE`), link departments, and toggle status (`ACTIVE`/`INACTIVE`).
- **Department Management (Admin)**: Manage organizational directorates, view correspondence metrics, and assign unit managers.

### 📊 5. Audit Logging & System Analytics
- **System Audit Logs (Admin)**: Immutable log of authentication attempts, letter access, sign-off actions, and administrative changes.
- **Analytical Dashboards**: Role-specific dashboards displaying letter volumes, pending actions, response compliance, and activity feeds.

---

## 🔐 Role-Based Access Control (RBAC)

| Feature / Action | EMPLOYEE / OFFICER | DEPARTMENT_MANAGER | ADMIN |
|---|:---:|:---:|:---:|
| View Accessible Letters | ✅ | ✅ | ✅ |
| Register Incoming/Outgoing/Internal Letters | ✅ | ✅ | ✅ |
| Submit Letters for Approval | ✅ | ✅ | ✅ |
| Add Notes & Discussion Comments | ✅ | ✅ | ✅ |
| Review & Approve / Reject Queue | ❌ | ✅ | ✅ |
| View System Approval Metrics | ❌ | ✅ | ✅ |
| Manage Users & Roles | ❌ | ❌ | ✅ |
| Manage Directorates & Managers | ❌ | ❌ | ✅ |
| Restore Letters from Archive | ❌ | ❌ | ✅ |
| View System Audit Logs | ❌ | ❌ | ✅ |

---

## 🔑 Demo Credentials

| Role | Email | Password | Primary Scope |
|---|---|---|---|
| **Admin** | `admin@sita.gov.et` | `Sita@2026` | Full System Control, Users, Depts & Audit |
| **Department Manager** | `manager@sita.gov.et` | `Sita@2026` | Approvals Queue, Department Letters |
| **Employee / Officer** | `employee@sita.gov.et` | `Sita@2026` | Register, Submit & Track Personal/Assigned Letters |

---

## 📁 Repository Structure

```text
Letter-Management-System/
├── README.md                      # Primary project documentation (this file)
│
├── letter-backend/                # Express REST API & Supabase Integration
│   ├── package.json
│   ├── tsconfig.json
│   └── src/                       # Backend source code
│
└── letter-frontend/               # React 19 Single-Page Application
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css              # Global styles & Tailwind CSS setup
        ├── assets/                # Logos and graphics
        ├── components/
        │   ├── common/            # Buttons, modals, cards, badges
        │   ├── layout/            # AppShell, Navbar, Sidebar
        │   ├── letters/           # Letter registration modal, timelines, info panel
        │   ├── approvals/         # Approval request cards, dialogs
        │   └── workflows/         # Workflow timeline wrappers
        ├── pages/
        │   ├── LandingPage.tsx    # SITA LMS portal
        │   ├── auth/              # Login view
        │   ├── dashboard/         # Role-based dashboards
        │   ├── letters/           # Repository, Details, Preview
        │   ├── approvals/         # Approval Queue
        │   ├── archives/          # Letter Archive
        │   └── audit/             # Audit Logs
        ├── routes/                # AppRoutes, navigation.ts
        ├── services/              # letterService, approvalService, dashboardService
        └── types/                 # letter.ts, approval.ts, auth.ts
```

---

## 🚀 Installation & Quickstart

### Step 1: Install Frontend Dependencies

```bash
cd letter-frontend
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The application will start at **`http://localhost:5173`**.

---

## 📄 License & Ownership

Developed for the **Sidama Innovation and Technology Agency (SITA)**. All rights reserved.
