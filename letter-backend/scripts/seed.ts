/**
 * Seed script — provisions demo data so the frontend works end-to-end.
 *
 *  - Creates 3 users directly in the `users` table (admin / manager / employee, password: Sita@2026)
 *  - Seeds departments, sample documents (with placeholder PDFs written to disk),
 *    one pending approval, comments, notifications and activity.
 *
 * Idempotent: safe to run multiple times.
 *
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { DATABASE_URL, DB_SSL, UPLOADS_DIR } = process.env;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const dbSsl = DB_SSL === 'true';
const uploadsDir = UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
const DEMO_PASSWORD = 'Sita@2026';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: dbSsl ? { rejectUnauthorized: false } : false,
});

/* ─── Minimal valid PDF placeholder ─────────────────────── */

function buildPlaceholderPdf(title: string): Buffer {
  const stream = `BT /F1 16 Tf 72 720 Td (${title.replace(/[()\\]/g, '')}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
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

async function upsertDepartment(name: string, code: string, description: string): Promise<number> {
  const { rows } = await pool.query('SELECT id FROM departments WHERE code = $1', [code]);
  if (rows.length > 0) return rows[0].id as number;
  const inserted = await pool.query(
    'INSERT INTO departments (name, code, description) VALUES ($1,$2,$3) RETURNING id',
    [name, code, description]
  );
  return (inserted.rows[0] as { id: number }).id;
}

async function upsertUser(profile: {
  full_name: string;
  email: string;
  role: string;
  departmentId: number;
  jobTitle: string;
}): Promise<number> {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [profile.email]);
  if (rows.length > 0) {
    console.log(`[seed] user ${profile.email} already exists, skipping`);
    return rows[0].id as number;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const inserted = await pool.query(
    `INSERT INTO users (full_name, email, role, department_id, job_title, password_hash, status, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE',true) RETURNING id`,
    [profile.full_name, profile.email, profile.role, profile.departmentId, profile.jobTitle, passwordHash]
  );
  console.log(`[seed] created user ${profile.email}`);
  return (inserted.rows[0] as { id: number }).id;
}

async function savePlaceholderPdf(docKey: string, title: string): Promise<{ path: string; size: number }> {
  const pdf = buildPlaceholderPdf(title);
  const fullPath = path.join(uploadsDir, docKey);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, pdf);
  console.log(`[seed] wrote placeholder PDF to ${fullPath}`);
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

  // Letter fields
  letterType?: string;
  sender?: string;
  senderOrganization?: string;
  recipient?: string;
  recipientOrganization?: string;
  priority?: string;
  dateReceived?: Date | string;
  dateSent?: Date | string;
  dueDate?: Date | string;
  originatingDepartment?: string;
  assignedEmployee?: string;
  responseRequired?: boolean;
}) {
  const { rows } = await pool.query('SELECT id FROM documents WHERE document_number = $1', [
    args.documentNumber,
  ]);
  if (rows.length > 0) return rows[0].id as number;

  const file = await savePlaceholderPdf(args.storageKey, args.title);
  const inserted = await pool.query(
    `INSERT INTO documents
       (document_number, title, description, category, department_id, department_name,
        created_by, author_id, status, security_level, file_name, file_size, file_type,
        storage_path, tags, version, is_new,
        letter_type, sender, sender_organization, recipient, recipient_organization,
        priority, date_received, date_sent, due_date, originating_department,
        assigned_employee, response_required)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'INTERNAL',$10,$11,'application/pdf',$12,
             ARRAY['demo'],'v1.0',true,
             $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
     RETURNING id`,
    [
      args.documentNumber, args.title, args.description, args.category,
      args.departmentId, args.departmentName, args.createdBy, args.authorId,
      args.status, args.title + '.pdf', file.size, file.path,
      args.letterType || 'INCOMING',
      args.sender || null,
      args.senderOrganization || null,
      args.recipient || null,
      args.recipientOrganization || null,
      args.priority || 'NORMAL',
      args.dateReceived || null,
      args.dateSent || null,
      args.dueDate || null,
      args.originatingDepartment || null,
      args.assignedEmployee || null,
      args.responseRequired || false,
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
  // Ensure uploads directory exists
  fs.mkdirSync(path.join(uploadsDir, 'documents'), { recursive: true });

  // Departments
  const deptFinance = await upsertDepartment('Finance & Planning', 'DEP-FIN', 'Budgeting, financial forecasting, and expenditure control');
  const deptIct = await upsertDepartment('ICT Governance', 'DEP-ICT', 'Infrastructure, systems security, and hardware management');
  await upsertDepartment('Human Resources', 'DEP-HR', 'Personnel recruitment, training, and staff welfare');
  await upsertDepartment('Legal Services', 'DEP-LGL', 'Regulatory compliance, contract review, and policy archives');
  await upsertDepartment('Public Works', 'DEP-PWK', 'Facilities management and campus infrastructure projects');

  // Users with hashed passwords (no Supabase Auth)
  const adminId = await upsertUser({
    full_name: 'Abebe Bikila', email: 'admin@sita.gov.et', role: 'ADMIN',
    departmentId: deptIct, jobTitle: 'System Administrator',
  });
  const managerId = await upsertUser({
    full_name: 'Tariku Eshetu', email: 'manager@sita.gov.et', role: 'DEPARTMENT_MANAGER',
    departmentId: deptFinance, jobTitle: 'Department Manager',
  });
  const employeeId = await upsertUser({
    full_name: 'Endrias Eshetu', email: 'employee@sita.gov.et', role: 'EMPLOYEE',
    departmentId: deptFinance, jobTitle: 'Senior Finance Officer',
  });
  await upsertUser({
    full_name: 'Abebe Demissie', email: 'registry@sita.gov.et', role: 'REGISTRY_OFFICER',
    departmentId: deptIct, jobTitle: 'Senior Registry Officer',
  });

  // Sample documents
  const pendingDoc = await seedDocument({
    documentNumber: 'LMS/INC/2026/001',
    title: 'Q1_Financial_Report_DRAFT.pdf',
    description: 'Quarterly financial overview and budget projections for SITA departments.',
    category: 'Finance / Reports',
    departmentId: deptFinance,
    departmentName: 'Finance & Planning',
    createdBy: 'Endrias Eshetu',
    authorId: employeeId,
    status: 'PENDING_APPROVAL',
    storageKey: 'documents/seed-q1-financial-report.pdf',

    letterType: 'INCOMING',
    sender: 'Ato Kebede Tadesse',
    senderOrganization: 'Ministry of Finance, Ethiopia',
    recipient: 'Director General',
    recipientOrganization: 'SITA',
    priority: 'HIGH',
    dateReceived: new Date('2026-08-25T09:42:00'),
    dueDate: new Date('2026-11-01T00:00:00'),
    responseRequired: true,
  });

  const approvedDoc = await seedDocument({
    documentNumber: 'LMS/OUT/2026/089',
    title: 'Employee_Handbook_2026.pdf',
    description: 'Updated HR code of conduct, leave policies, and organizational structure.',
    category: 'HR / Policies',
    departmentId: deptFinance,
    departmentName: 'Finance & Planning',
    createdBy: 'Endrias Eshetu',
    authorId: employeeId,
    status: 'APPROVED',
    storageKey: 'documents/seed-employee-handbook.pdf',

    letterType: 'OUTGOING',
    sender: 'Director General, SITA',
    senderOrganization: 'Sidama Innovation and Technology Agency',
    recipient: 'Regional Director',
    recipientOrganization: 'Huawei Technologies East Africa',
    priority: 'NORMAL',
    dateSent: new Date('2026-08-24T16:30:00'),
  });

  await seedDocument({
    documentNumber: 'LMS/INT/2026/045',
    title: 'ICT_Infrastructure_Audit_Report.pdf',
    description: 'Hardware audit, server rack capacity, and fiber network routing assessment.',
    category: 'ICT / Audit',
    departmentId: deptIct,
    departmentName: 'ICT Governance',
    createdBy: 'Endrias Eshetu',
    authorId: employeeId,
    status: 'DRAFT',
    storageKey: 'documents/seed-ict-audit-report.pdf',

    letterType: 'MEMORANDUM',
    sender: 'HR Director',
    senderOrganization: 'SITA – Human Resources Directorate',
    recipient: 'All Department Heads',
    recipientOrganization: 'SITA',
    priority: 'NORMAL',
    dateSent: new Date('2026-08-23T10:00:00'),
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
