const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  try {
    await client.connect();
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log("DB_TABLES_COUNT:", res.rows.length);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}
check();
