# Smart E-Office Backend

A thin Node.js + TypeScript API bridge that serves the **exact REST contract** expected by
[`smart-eoffice-frontend`](../smart-eoffice-frontend) while persisting to **Supabase**
(Postgres + Auth + Storage). The frontend requires **zero changes** — it keeps talking to
`http://localhost:5000/api` exactly as it does today.

## Architecture

```
Express (port 5000)  ──►  /api/* routes  ──►  Supabase
  ├─ JWT verification (Supabase Auth)          ├─ Postgres (pg client, connection string)
  ├─ Auth user admin ops (create users)        ├─ Auth (GoTrue: login, JWTs, password)
  └─ File streaming (Storage)                  └─ Storage (documents bucket)
```

- **Auth**: Login goes through Supabase Auth (`signInWithPassword`). The returned
  access token is a standard JWT the frontend stores in `sita_auth_token` and sends back
  as `Authorization: Bearer <token>`. The server verifies it via `auth.getUser()`.
- **Data**: `pg` pool against your Supabase Postgres (transaction pooler, SSL).
- **Files**: Uploads go to the `documents` Storage bucket; downloads are streamed back
  as raw bytes (the frontend expects a blob).

## Getting started

1. **Create a Supabase project** (free tier is fine) and grab:
   - Project URL + anon key + service_role key: Dashboard → Settings → API
   - Database connection string: Dashboard → Settings → Database → Connection string (URI, pooler)
2. **Configure** — copy `.env.example` to `.env` and fill in all values.
3. **Install & migrate**:
   ```bash
   npm install
   npm run migrate     # applies supabase/migrations/*.sql
   npm run seed        # demo users + sample documents (idempotent)
   npm run dev         # starts on http://localhost:5000/api
   ```
4. Start the frontend (`npm run dev` in `smart-eoffice-frontend`) and log in with a
   seeded account.

## Demo accounts (created by `npm run seed`)

| Email | Role | Password |
|---|---|---|
| `admin@sita.gov.et` | ADMIN | `Sita@2026` |
| `manager@sita.gov.et` | DEPARTMENT_MANAGER | `Sita@2026` |
| `employee@sita.gov.et` | EMPLOYEE | `Sita@2026` |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Run with hot reload (tsx watch) |
| `npm run build` / `npm start` | Compile and run from `dist/` |
| `npm run typecheck` | TypeScript strict check |
| `npm run migrate` | Apply pending SQL migrations |
| `npm run seed` | Seed demo data (idempotent) |

## Endpoints

All routes are mounted under `/api`. Public: `POST /auth/login`, `GET /health`.
Everything else requires `Authorization: Bearer <token>`.

- **Auth**: `POST /auth/login`, `GET /auth/me`, `POST /auth/change-password`
- **Users** (admin): `GET|POST /users`, `PUT /users/:id`, `PATCH /users/:id/toggle-status`
- **Departments**: `GET /departments`, `GET /system/capacity`, `POST /departments`,
  `PUT /departments/:id`, `POST /departments/:id/assign-manager`
- **Documents**: `GET|POST /documents` (multipart), `GET /documents/:id`,
  `GET|POST /documents/:id/versions`, `GET /documents/:id/download`,
  `POST /documents/:id/archive`, `POST /documents/:id/submit`
- **Approvals** (manager/admin): `GET /approvals`, `GET /approvals/metrics`,
  `GET /approvals/activity`, `POST /approvals/:document_id/approve|reject|request-changes`
- **Comments**: `GET|POST /documents/:documentId/comments`
- **Notifications**: `GET /notifications`, `POST /notifications/:id/read`,
  `POST /notifications/read-all`
