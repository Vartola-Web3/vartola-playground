export type AppMode = 'DEMO' | 'ALPHA';

export function appMode(): AppMode {
  return process.env.APP_MODE === 'ALPHA' ? 'ALPHA' : 'DEMO';
}

export function isAlphaMode() {
  return appMode() === 'ALPHA';
}
