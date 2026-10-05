import { readFileSync } from 'fs';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const APP_NAME = 'vartola';

function serviceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as Record<string, string>;
  }
  const file = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!file) return null;
  return JSON.parse(readFileSync(file, 'utf8')) as Record<string, string>;
}

function firebaseApp(): App | null {
  const account = serviceAccount();
  if (!account) return null;
  const existing = getApps().find((item) => item.name === APP_NAME);
  if (existing) return existing;
  return initializeApp({
    credential: cert(account),
    projectId: process.env.FIREBASE_PROJECT_ID || 'assetfi-uae',
  }, APP_NAME);
}

export function firebaseDb(): Firestore | null {
  const app = firebaseApp();
  if (!app) return null;
  return getFirestore(app, process.env.FIRESTORE_DATABASE_ID || 'vartola-ops');
}
