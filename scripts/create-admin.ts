/**
 * One-time script to create the initial SUPER_ADMIN user via Better Auth API.
 * Run with: npx tsx scripts/create-admin.ts
 *
 * This uses the running Next.js server's Better Auth endpoint.
 */

const BASE_URL = 'http://localhost:3000';
const email = 'admin@accuratemedical.com';
const password = 'Admin123!';
const adminName = 'System Administrator';

async function main() {
  console.log('Creating admin user via Better Auth API...');

  const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': BASE_URL,
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
    return;
  }

  console.log('');
  console.log('✅ Admin user created successfully!');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log('');

  // Now update role to SUPER_ADMIN in the database
  const { Pool } = await import('pg');
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'user',
    password: 'password',
    database: 'accurate_medical',
  });

  await pool.query(`UPDATE users SET role = 'SUPER_ADMIN' WHERE email = $1`, [email]);
  console.log(`✅ Role updated to SUPER_ADMIN`);
  console.log('');
  console.log('👉 Visit http://localhost:3000/login to sign in.');
  await pool.end();
}

main().catch((e) => {
  console.error('❌ Unexpected error:', e.message);
  process.exit(1);
});
