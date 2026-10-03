export const isAdminOperator = (role?: string | null) => role === 'ADMIN' || role === 'ADMIN_REVIEWER';
export const isPlatformOwner = (role?: string | null) => role === 'ADMIN';
