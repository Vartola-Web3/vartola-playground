// Server pages compute "since" windows here so the render itself stays free of impure calls.
export const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600 * 1000);
