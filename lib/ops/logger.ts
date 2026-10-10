type Level = 'info' | 'warn' | 'error';
type Context = Record<string, unknown>;

// Structured JSON logging with a per-request id, so log lines can be correlated across a request.
// Dependency-free: it writes one JSON object per line to stdout/stderr, which any log collector can parse.
export function newRequestId(): string {
  const cryptoRef = globalThis.crypto as Crypto | undefined;
  if (cryptoRef?.randomUUID) return cryptoRef.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function emit(level: Level, message: string, context: Context = {}) {
  const line = JSON.stringify({ level, message, time: new Date().toISOString(), ...context });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, context?: Context) => emit('info', message, context),
  warn: (message: string, context?: Context) => emit('warn', message, context),
  error: (message: string, context?: Context) => emit('error', message, context),
};
