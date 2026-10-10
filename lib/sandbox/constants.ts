// Shared sandbox constants. Kept out of the route files because Next.js validates the exports of route
// handlers and only allows the HTTP method handlers.
export const SANDBOX_COOKIE = 'sbx_sid';
export const SANDBOX_SCENARIOS: readonly string[] = ['normal', 'early', 'late', 'default', 'supplier', 'insurance'];
