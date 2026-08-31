import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filename) {
  const envPath = resolve(__dirname, '..', filename);
  try {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // optional file
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.log('DB_VERIFY: FAIL - no database URL configured');
  process.exit(1);
}

const client = new Client({ connectionString: url });
await client.connect();

const cols = await client.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'notifications'
  ORDER BY column_name
`);

const indexes = await client.query(`
  SELECT indexname
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'notifications'
  ORDER BY indexname
`);

await client.end();

const requiredCols = ['link', 'readAt', 'resource', 'resourceId'];
const actualCols = cols.rows.map((r) => r.column_name);
const missingCols = requiredCols.filter((c) => !actualCols.includes(c));

const requiredIndexes = [
  'notifications_userId_isRead_idx',
  'notifications_userId_createdAt_idx',
];
const actualIndexes = indexes.rows.map((r) => r.indexname);
const missingIndexes = requiredIndexes.filter((i) => !actualIndexes.includes(i));

console.log(
  'DB_VERIFY: columns_present=' +
    JSON.stringify(requiredCols.filter((c) => actualCols.includes(c)))
);
console.log('DB_VERIFY: columns_missing=' + JSON.stringify(missingCols));
console.log(
  'DB_VERIFY: indexes_present=' +
    JSON.stringify(requiredIndexes.filter((i) => actualIndexes.includes(i)))
);
console.log('DB_VERIFY: indexes_missing=' + JSON.stringify(missingIndexes));
console.log(
  'DB_VERIFY: status=' +
    (missingCols.length === 0 && missingIndexes.length === 0 ? 'PASS' : 'FAIL')
);
