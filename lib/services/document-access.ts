import { readFile, readdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const DEMO_DIR = path.join(process.cwd(), 'public', 'demo-docs');

export async function readStoredDocument(storagePath: string, fileName: string) {
  if (storagePath.startsWith('local://demo/')) {
    const base = path.basename(fileName);
    const allowed = await readdir(DEMO_DIR).catch(() => [] as string[]);
    if (!allowed.includes(base)) return null;
    return readFile(path.join(DEMO_DIR, base));
  }

  const resolved = path.resolve(storagePath);
  const root = path.resolve(UPLOAD_DIR);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return readFile(resolved);
}
