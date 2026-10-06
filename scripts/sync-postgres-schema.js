// Brings a hosted PostgreSQL database up to date with prisma/schema.prisma during the Vercel build.
// It only applies changes Prisma considers safe: adding tables, columns and indexes. Anything that would drop
// data makes `prisma db push` refuse (no --accept-data-loss), and in that case the step reports it and the
// build continues, so a schema problem never blocks a deploy silently or destroys data.
const { spawnSync } = require('child_process');

const url = process.env.DATABASE_URL || '';
if (!(url.startsWith('postgres://') || url.startsWith('postgresql://'))) {
  console.log('sync-postgres-schema: DATABASE_URL is not PostgreSQL, nothing to do.');
  process.exit(0);
}

const schema = 'prisma/schema.postgres.prisma';
const diff = spawnSync('npx', ['prisma', 'migrate', 'diff', '--from-url', url, '--to-schema-datamodel', schema, '--script'], { encoding: 'utf8', shell: true });
const script = (diff.stdout || '').trim();
console.log('sync-postgres-schema: planned changes:');
console.log(script || '(none)');
if (diff.status !== 0) console.log('sync-postgres-schema: diff step reported:', (diff.stderr || '').trim().slice(0, 600));
if (/\bDROP\s+(TABLE|COLUMN)\b/i.test(script)) {
  console.log('sync-postgres-schema: the plan contains a DROP, so nothing was applied. Review the plan above.');
  process.exit(0);
}
// Only skip the push when the diff ran and found nothing. If the diff itself failed, db push still decides safely.
if (diff.status === 0 && (!script || /^-- This is an empty migration/i.test(script))) process.exit(0);

const push = spawnSync('npx', ['prisma', 'db', 'push', `--schema=${schema}`, '--skip-generate'], { stdio: 'inherit', shell: true });
if (push.status !== 0) console.log('sync-postgres-schema: db push did not complete. The deploy continues; check the output above.');
process.exit(0);
