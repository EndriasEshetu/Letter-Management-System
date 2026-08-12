-- Smart E-Office Document Management System — initial schema
-- Apply with: npm run migrate  (or paste into the Supabase SQL editor)

-- ─── Departments ─────────────────────────────────────────

create table if not exists departments (
  id          bigserial primary key,
  name        text not null unique,
  code        text not null unique,
  description text,
  manager_id  bigint,             -- references users.id (added after users exists, no FK to avoid circularity)
  created_at  timestamptz not null default now()
);

-- ─── Users ────────────────────────────────────────────────

create table if not exists users (
  id            bigserial primary key,
  auth_uid      uuid unique references auth.users (id) on delete cascade,
  full_name     text not null,
  email         text not null unique,
  phone         text,
  job_title     text,
  role          text not null default 'EMPLOYEE'
                check (role in ('ADMIN', 'DEPARTMENT_MANAGER', 'EMPLOYEE')),
  department_id bigint references departments (id),
  status        text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table departments
  add constraint departments_manager_fk
  foreign key (manager_id) references users (id)
  on delete set null;

create index if not exists idx_users_auth_uid on users (auth_uid);
create index if not exists idx_users_department on users (department_id);
create index if not exists idx_users_role on users (role);

-- ─── Documents ────────────────────────────────────────────

create table if not exists documents (
  id              bigserial primary key,
  document_number text not null unique,
  title           text not null,
  description     text,
  category        text not null,
  department_id   bigint references departments (id),
  department_name text,
  created_by      text not null,
  author_id       bigint references users (id),
  status          text not null default 'DRAFT'
                  check (status in ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'ARCHIVED')),
  security_level  text not null default 'INTERNAL'
                  check (security_level in ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
  file_name       text not null,
  file_size       bigint not null default 0,
  file_type       text not null default 'application/pdf',
  storage_path    text not null,
  tags            text[] not null default '{}',
  version         text,
  is_new          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_documents_status on documents (status);
create index if not exists idx_documents_category on documents (category);
create index if not exists idx_documents_department on documents (department_id);
create index if not exists idx_documents_created on documents (created_at desc);

-- ─── Document versions ────────────────────────────────────

create table if not exists document_versions (
  id            bigserial primary key,
  document_id   bigint not null references documents (id) on delete cascade,
  version_number text not null,
  uploaded_by   text not null,
  uploaded_by_id bigint references users (id),
  date          timestamptz not null default now(),
  file_size     bigint,
  file_name     text,
  storage_path  text not null,
  is_current    boolean not null default false
);

create index if not exists idx_versions_document on document_versions (document_id);

-- ─── Approvals ────────────────────────────────────────────

create table if not exists approvals (
  id                  bigserial primary key,
  document_id         bigint not null unique references documents (id) on delete cascade,
  submitter_id        bigint references users (id),
  submitter_name      text not null,
  submitter_role      text,
  submitter_department text,
  priority            text not null default 'NORMAL' check (priority in ('HIGH', 'NORMAL')),
  status              text not null default 'PENDING'
                      check (status in ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  submitted_at        timestamptz not null default now(),
  reviewed_at         timestamptz,
  reviewer_name       text,
  comment             text,
  page_count          integer
);

create index if not exists idx_approvals_status on approvals (status);

-- ─── Approval activity feed ───────────────────────────────

create table if not exists approval_activities (
  id             bigserial primary key,
  action         text not null check (action in ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SUBMITTED')),
  document_id    bigint references documents (id),
  document_title text,
  user_name      text,
  timestamp      timestamptz not null default now()
);

create index if not exists idx_activities_timestamp on approval_activities (timestamp desc);

-- ─── Comments ─────────────────────────────────────────────

create table if not exists comments (
  id              bigserial primary key,
  document_id     bigint not null references documents (id) on delete cascade,
  author_id       bigint references users (id),
  author_name     text not null,
  author_role     text,
  author_department text,
  message         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_comments_document on comments (document_id);

-- ─── Notifications ────────────────────────────────────────

create table if not exists notifications (
  id             bigserial primary key,
  user_id        bigint not null references users (id) on delete cascade,
  type           text not null,
  message        text not null,
  is_read        boolean not null default false,
  document_id    bigint,
  document_title text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications (user_id, created_at desc);
