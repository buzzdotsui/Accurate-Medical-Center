/**
 * One-time script to create the initial SUPER_ADMIN user via Better Auth API.
 * Run with: npx tsx scripts/create-admin.ts
 *
 * Required environment variables (no hardcoded credentials):
 * - ADMIN_EMAIL    — email for the initial SUPER_ADMIN account
 * - ADMIN_PASSWORD — password (min 8 chars; never commit real values)
 * - DATABASE_URL   — PostgreSQL connection used to elevate the role
 *                    (or set PGHOST/PGUSER/PGPASSWORD/PGDATABASE)
 *
 * Optional:
 * - BASE_URL       — defaults to http://localhost:3000
 *
 * The password is never printed to stdout.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME || 'System Administrator';

async function main() {
  if (!email || !password) {
    console.error('Missing required environment variables: ADMIN_EMAIL and ADMIN_PASSWORD.');
    console.error('Example: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  console.log('Creating admin user via Better Auth API...');

  const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: BASE_URL,
    },
    body: JSON.stringify({ email, password, name: adminName }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    // If user already exists, that's fine
    if (body?.code === 'USER_ALREADY_EXISTS' || res.status === 422) {
      console.log(`✅ Admin user already exists: ${email}`);
    } else {
      console.error('❌ Failed:', res.status, JSON.stringify(body));
      process.exit(1);
    }
  } else {
    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log(`   Email:    ${email}`);
    console.log('   (password not shown)');
  }

  // Elevate role to SUPER_ADMIN using DATABASE_URL (no hardcoded DB credentials).
  if (!process.env.DATABASE_URL && !process.env.PGDATABASE) {
    console.error('❌ DATABASE_URL (or PGDATABASE/PG*) is required to set the SUPER_ADMIN role.');
    process.exit(1);
  }

  const { Pool } = await import('pg');
  const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool();

  await pool.query(`UPDATE users SET role = 'SUPER_ADMIN' WHERE email = $1`, [email]);
  console.log('✅ Role updated to SUPER_ADMIN');
  console.log('');
  console.log(`👉 Visit ${BASE_URL}/login to sign in.`);
  await pool.end();
}

main().catch((e) => {
  console.error('❌ Unexpected error:', e.message);
  process.exit(1);
});
