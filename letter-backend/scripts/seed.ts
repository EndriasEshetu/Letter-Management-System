/**
 * Seed script — provisions demo data so the frontend works end-to-end.
 *
 *  - Creates 3 Supabase Auth users (admin / manager / employee, password: Sita@2026)
 *  - Seeds departments, users, sample documents (with placeholder PDFs in Storage),
 *    one pending approval, comments, notifications and activity.
 *
 * Idempotent: safe to run multiple times.
 *
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_DB_URL) {
  console.error('Missing Supabase env vars. Copy .env.example to .env and fill them in.');
  process.exit(1);
}

const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
const DEMO_PASSWORD = 'Sita@2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const pool = new Pool({ connectionString: SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });

/* ─── Minimal valid PDF placeholder ─────────────────────── */

function buildPlaceholderPdf(title: string): Buffer {
  const stream = `BT /F1 16 Tf 72 720 Td (${title.replace(/[()\\]/g, '')}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];

  let body = '';
  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(body));
    body += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(body);
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(`%PDF-1.4\n${body}${xref}`);
}

/* ─── Helpers ───────────────────────────────────────────── */

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === bucket)) {
    await supabase.storage.createBucket(bucket, { public: false });
    console.log(`[seed] created storage bucket "${bucket}"`);
  }
}

async function upsertAuthUser(email: string, fullName: string): Promise<string> {
  const { data: existing } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing?.users.find((u) => u.email?.toLowerCase() === email);
  if (found) return found.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  console.log(`[seed] created auth user ${email}`);
  return data.user.id;
}

async function upsertDepartment(name: string, code: string, description: string): Promise<number> {
  const { rows } = await pool.query('SELECT id FROM departments WHERE code = $1', [code]);
  if (rows.length > 0) return rows[0].id as number;
  const inserted = await pool.query(
    'INSERT INTO departments (name, code, description) VALUES ($1,$2,$3) RETURNING id',
    [name, code, description]
  );
  return (inserted.rows[0] as { id: number }).id;
}

async function upsertUser(authUid: string, profile: {
  full_name: string; email: string; role: string; departmentId: number; jobTitle: string;
}): Promise<number> {
  const { rows } = await pool.query('SELECT id FROM users WHERE auth_uid = $1', [authUid]);
  if (rows.length > 0) return rows[0].id as number;
  const inserted = await pool.query(
    `INSERT INTO users (auth_uid, full_name, email, role, department_id, job_title)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [authUid, profile.full_name, profile.email, profile.role, profile.departmentId, profile.jobTitle]
  );
  return (inserted.rows[0] as { id: number }).id;
}

async function uploadPdf(docKey: string, title: string): Promise<{ path: string; size: number }> {
  const pdf = buildPlaceholderPdf(title);
  const { error } = await supabase.storage.from(bucket).upload(docKey, pdf, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (error) throw new Error(`storage upload ${docKey}: ${error.message}`);
  return { path: docKey, size: pdf.byteLength };
}

async function seedDocument(args: {
  documentNumber: string;
  title: string;
  description: string;
  category: string;
  departmentId: number;
  departmentName: string;
  createdBy: string;
  authorId: number;
  status: string;
  storageKey: string;
}) {
  const { rows } = await pool.query('SELECT id FROM documents WHERE document_number = $1', [
    args.documentNumber,
  ]);
  if (rows.length > 0) return rows[0].id as number;

  const file = await uploadPdf(args.storageKey, args.title);
  const inserted = await pool.query(
    `INSERT INTO documents
       (document_number, title, description, category, department_id, department_name,
        created_by, author_id, status, security_level, file_name, file_size, file_type,
        storage_path, tags, version, is_new)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'INTERNAL',$10,$11,'application/pdf',$12,
             ARRAY['demo'],'v1.0',true)
     RETURNING id`,
    [
      args.documentNumber, args.title, args.description, args.category,
      args.departmentId, args.departmentName, args.createdBy, args.authorId,
      args.status, args.title + '.pdf', file.size, file.path,
    ]
  );
  const docId = (inserted.rows[0] as { id: number }).id;

  await pool.query(
    `INSERT INTO document_versions
       (document_id, version_number, uploaded_by, uploaded_by_id, file_size, file_name, storage_path, is_current)
     VALUES ($1,'v1.0',$2,$3,$4,$5,$6,true)`,
    [docId, args.createdBy, args.authorId, file.size, args.title + '.pdf', file.path]
  );
  console.log(`[seed] created document ${args.documentNumber}`);
  return docId;
}

/* ─── Main ──────────────────────────────────────────────── */

async function seed() {
  await ensureBucket();

  // Departments
  const deptFinance = await upsertDepartment('Finance & Planning', 'DEP-FIN', 'Budgeting, financial forecasting, and expenditure control');
  const deptIct = await upsertDepartment('ICT Governance', 'DEP-ICT', 'Infrastructure, systems security, and hardware management');
  await upsertDepartment('Human Resources', 'DEP-HR', 'Personnel recruitment, training, and staff welfare');
  await upsertDepartment('Legal Services', 'DEP-LGL', 'Regulatory compliance, contract review, and policy archives');
  await upsertDepartment('Public Works', 'DEP-PWK', 'Facilities management and campus infrastructure projects');

  // Auth users + profiles
  const adminUid = await upsertAuthUser('admin@sita.gov.et', 'Abebe Bikila');
  const managerUid = await upsertAuthUser('manager@sita.gov.et', 'Tariku Eshetu');
  const employeeUid = await upsertAuthUser('employee@sita.gov.et', 'Endrias Eshetu');

  const adminId = await upsertUser(adminUid, {
    full_name: 'Abebe Bikila', email: 'admin@sita.gov.et', role: 'ADMIN',
    departmentId: deptIct, jobTitle: 'System Administrator',
  });
  const managerId = await upsertUser(managerUid, {
    full_name: 'Tariku Eshetu', email: 'manager@sita.gov.et', role: 'DEPARTMENT_MANAGER',
    departmentId: deptFinance, jobTitle: 'Department Manager',
  });
  const employeeId = await upsertUser(employeeUid, {
    full_name: 'Endrias Eshetu', email: 'employee@sita.gov.et', role: 'EMPLOYEE',
    departmentId: deptFinance, jobTitle: 'Senior Finance Officer',
  });

  // Sample documents
  const pendingDoc = await seedDocument({
    documentNumber: 'DOC-2026-001',
    title: 'Q1_Financial_Report_DRAFT.pdf',
    description: 'Quarterly financial overview and budget projections for SITA departments.',
    category: 'Finance / Reports',
    departmentId: deptFinance,
    departmentName: 'Finance & Planning',
    createdBy: 'Endrias Eshetu',
    authorId: employeeId,
    status: 'PENDING_APPROVAL',
    storageKey: 'documents/seed-q1-financial-report.pdf',
  });
  const approvedDoc = await seedDocument({
    documentNumber: 'HR-2026-001',
    title: 'Employee_Handbook_2026.pdf',
    description: 'Updated HR code of conduct, leave policies, and organizational structure.',
    category: 'HR / Policies',
    departmentId: deptFinance,
    departmentName: 'Finance & Planning',
    createdBy: 'Endrias Eshetu',
    authorId: employeeId,
    status: 'APPROVED',
    storageKey: 'documents/seed-employee-handbook.pdf',
  });
  await seedDocument({
    documentNumber: 'DOC-2026-002',
    title: 'ICT_Infrastructure_Audit_Report.pdf',
    description: 'Hardware audit, server rack capacity, and fiber network routing assessment.',
    category: 'ICT / Audit',
    departmentId: deptIct,
    departmentName: 'ICT Governance',
    createdBy: 'Endrias Eshetu',
    authorId: employeeId,
    status: 'DRAFT',
    storageKey: 'documents/seed-ict-audit-report.pdf',
  });

  // Pending approval for the manager's queue
  const approvalExists = await pool.query('SELECT id FROM approvals WHERE document_id = $1', [pendingDoc]);
  if (approvalExists.rows.length === 0) {
    await pool.query(
      `INSERT INTO approvals (document_id, submitter_id, submitter_name, submitter_role, submitter_department, priority, status)
       VALUES ($1,$2,'Endrias Eshetu','Senior Finance Officer','Finance & Planning','NORMAL','PENDING')`,
      [pendingDoc, employeeId]
    );
    await pool.query(
      `INSERT INTO approval_activities (action, document_id, document_title, user_name)
       VALUES ('SUBMITTED', $1, 'Q1_Financial_Report_DRAFT.pdf', 'Endrias Eshetu')`,
      [pendingDoc]
    );
    await pool.query(
      `INSERT INTO approval_activities (action, document_id, document_title, user_name)
       VALUES ('APPROVED', $1, 'Employee_Handbook_2026.pdf', 'Tariku Eshetu')`,
      [approvedDoc]
    );
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, document_id, document_title)
       VALUES ($1, 'DOCUMENT_SUBMITTED', 'Endrias Eshetu submitted "Q1_Financial_Report_DRAFT.pdf" for approval.', $2, 'Q1_Financial_Report_DRAFT.pdf')`,
      [managerId, pendingDoc]
    );
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, document_id, document_title)
       VALUES ($1, 'DOCUMENT_APPROVED', 'Your document "Employee_Handbook_2026.pdf" was approved.', $2, 'Employee_Handbook_2026.pdf')`,
      [employeeId, approvedDoc]
    );
    console.log('[seed] created approval + activity + notifications');
  }

  // A comment on the pending document
  const commentExists = await pool.query('SELECT id FROM comments WHERE document_id = $1', [pendingDoc]);
  if (commentExists.rows.length === 0) {
    await pool.query(
      `INSERT INTO comments (document_id, author_id, author_name, author_role, author_department, message)
       VALUES ($1,$2,'Tariku Eshetu','Department Manager','Finance & Planning','Please update section 4.2 financial projections before final approval.')`,
      [pendingDoc, managerId]
    );
    console.log('[seed] created comment');
  }

  // Assign department managers
  await pool.query('UPDATE departments SET manager_id = $1 WHERE id = $2', [managerId, deptFinance]);
  await pool.query('UPDATE departments SET manager_id = $1 WHERE id = $2', [adminId, deptIct]);

  console.log('\n[seed] Done! Demo logins (password: Sita@2026):');
  console.log('  admin@sita.gov.et    (ADMIN)');
  console.log('  manager@sita.gov.et  (DEPARTMENT_MANAGER)');
  console.log('  employee@sita.gov.et (EMPLOYEE)');
  console.log(`\nSeeded sample data; run "npm run dev" to start the API on port 5000.`);

  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] failed:', err.message);
  process.exit(1);
});
