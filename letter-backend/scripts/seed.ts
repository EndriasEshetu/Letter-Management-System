/**
 * Seed script — provisions official SITA directorates and initial system personnel.
 * All department managers and employees are managed dynamically by the Administrator.
 *
 * Initial system accounts (password: Sita@2026):
 *  - admin@sita.gov.et    (ADMIN)
 *  - registry@sita.gov.et (REGISTRY_OFFICER)
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
const DEFAULT_PASSWORD = 'Sita@2026';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: dbSsl ? { rejectUnauthorized: false } : false,
});

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
  departmentId: number | null;
  jobTitle: string;
}): Promise<number> {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [profile.email]);
  if (rows.length > 0) {
    const userId = rows[0].id as number;
    await pool.query(
      `UPDATE users
          SET password_hash = $1,
              status = 'ACTIVE',
              is_active = true,
              role = $2
        WHERE id = $3`,
      [passwordHash, profile.role, userId]
    );
    console.log(`[seed] user ${profile.email} synchronized.`);
    return userId;
  }

  const inserted = await pool.query(
    `INSERT INTO users (full_name, email, role, department_id, job_title, password_hash, status, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE',true) RETURNING id`,
    [profile.full_name, profile.email, profile.role, profile.departmentId, profile.jobTitle, passwordHash]
  );
  console.log(`[seed] created user ${profile.email}`);
  return (inserted.rows[0] as { id: number }).id;
}

/* ─── Main ──────────────────────────────────────────────── */

async function seed() {
  fs.mkdirSync(path.join(uploadsDir, 'documents'), { recursive: true });

  // 4 Official SITA Directorates
  await upsertDepartment('App Development Directorate', 'DIR-APP', 'Web & mobile application software engineering, portal development, and digital services.');
  const deptInf = await upsertDepartment('ICT Infrastructure Development Directorate', 'DIR-INF', 'Network infrastructure, data center operations, cybersecurity, and hardware systems.');
  await upsertDepartment('Science and Technology Directorate', 'DIR-SCT', 'Scientific research innovation, technology transfer, emerging tech policies, and standards.');
  await upsertDepartment('Incubation Development Directorate', 'DIR-INC', 'Tech startup incubation, innovation hub mentoring, entrepreneurship support, and grants.');

  // System Core Accounts
  await upsertUser({
    full_name: 'Abebe Bikila',
    email: 'admin@sita.gov.et',
    role: 'ADMIN',
    departmentId: deptInf,
    jobTitle: 'System Administrator & Main Admin',
  });

  // Ensure default demo manager/employee/registry accounts are removed
  await pool.query('DELETE FROM users WHERE email IN ($1, $2, $3)', [
    'manager@sita.gov.et',
    'employee@sita.gov.et',
    'registry@sita.gov.et',
  ]);

  console.log('\n[seed] Completed successfully!');
  console.log('System bootstrap account (password: Sita@2026):');
  console.log('  admin@sita.gov.et (ADMIN)');
  console.log('\nAll department managers, registry officers, and employees are added dynamically by the Admin.');

  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] failed:', err.message);
  process.exit(1);
});
