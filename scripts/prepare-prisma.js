const { execSync } = require('child_process');
const fs = require('fs');

const url = process.env.DATABASE_URL || '';
const postgres = url.startsWith('postgres://') || url.startsWith('postgresql://');

if (postgres) {
  const source = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const schema = source.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync('prisma/schema.postgres.prisma', schema);
  execSync('npx prisma generate --schema=prisma/schema.postgres.prisma', { stdio: 'inherit' });
} else {
  execSync('npx prisma generate', { stdio: 'inherit' });
}
