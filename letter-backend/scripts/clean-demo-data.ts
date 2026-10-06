import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { DATABASE_URL, DB_SSL, UPLOADS_DIR } = process.env;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const uploadsDir = UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');

async function runCleanup() {
  console.log('[cleanup] Starting demo data removal...');

  // 1. Delete admin tasks
  await pool.query('DELETE FROM admin_tasks');
  console.log('[cleanup] Cleared admin_tasks');

  // 2. Delete comments
  await pool.query('DELETE FROM comments');
  console.log('[cleanup] Cleared comments');

  // 3. Delete approval activities and approvals
  await pool.query('DELETE FROM approval_activities').catch(() => {});
  await pool.query('DELETE FROM approvals');
  console.log('[cleanup] Cleared approvals');

  // 4. Delete document versions and documents
  await pool.query('DELETE FROM document_versions');
  await pool.query('DELETE FROM documents');
  console.log('[cleanup] Cleared documents and versions');

  // 5. Delete notifications
  await pool.query('DELETE FROM notifications');
  console.log('[cleanup] Cleared notifications');

  // 6. Delete audit logs referencing letters
  await pool.query("DELETE FROM audit_logs WHERE entity_type IN ('LETTER', 'DOCUMENT')").catch(() => {});
  console.log('[cleanup] Cleared letter audit logs');

  // 7. Synchronize department managers based on users with DEPARTMENT_MANAGER role:
  // Find users with role DEPARTMENT_MANAGER
  const { rows: mgrs } = await pool.query(
    "SELECT id, full_name, email, department_id FROM users WHERE role = 'DEPARTMENT_MANAGER' AND is_active = true ORDER BY id DESC"
  );
  console.log('[cleanup] Found active DEPARTMENT_MANAGER users:', mgrs);

  // Clear all department managers first to avoid stale references
  await pool.query('UPDATE departments SET manager_id = NULL');

  // Assign the newest department manager for each department
  const assignedDepts = new Set<number>();
  for (const m of mgrs) {
    if (m.department_id && !assignedDepts.has(Number(m.department_id))) {
      await pool.query('UPDATE departments SET manager_id = $1 WHERE id = $2', [m.id, m.department_id]);
      assignedDepts.add(Number(m.department_id));
      console.log(`[cleanup] Assigned user ${m.full_name} (id: ${m.id}) as manager for dept ${m.department_id}`);
    } else if (m.department_id) {
      // Demote older manager for the same department to EMPLOYEE
      await pool.query("UPDATE users SET role = 'EMPLOYEE' WHERE id = $1", [m.id]);
      console.log(`[cleanup] Demoted prior manager ${m.full_name} (id: ${m.id}) to EMPLOYEE for dept ${m.department_id}`);
    }
  }

  // 8. Clean up uploaded seed/demo files from uploads/documents
  const docsPath = path.join(uploadsDir, 'documents');
  if (fs.existsSync(docsPath)) {
    const files = fs.readdirSync(docsPath);
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(docsPath, file));
        console.log(`[cleanup] Deleted upload: ${file}`);
      } catch (err: any) {
        console.warn(`[cleanup] Failed to delete ${file}:`, err.message);
      }
    }
  }

  // 9. Verify current departments
  const { rows: depts } = await pool.query(
    `SELECT d.id, d.name, d.manager_id, u.full_name AS manager_name
       FROM departments d
       LEFT JOIN users u ON u.id = d.manager_id
      ORDER BY d.id`
  );
  console.log('[cleanup] Final departments state:', depts);

  console.log('[cleanup] Demo data cleanup completed successfully.');
  await pool.end();
}

runCleanup().catch((err) => {
  console.error('[cleanup] Failed:', err);
  process.exit(1);
});
