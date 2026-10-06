// Quality evidence recorded from real runs and updated by hand when they are repeated. It is not computed live and
// the proof page says so. Never edit these numbers without re-running the commands named next to them.
export const QUALITY_STATUS = {
  recordedOn: '2026-10-06',
  applicationTests: { command: 'npm test', passed: 141, failed: 0 },
  contractTests: { command: 'cargo test (contracts/soroban)', passed: 44, failed: 0 },
  lintErrors: 0,
  lintCommand: 'npm run lint',
  build: 'PASSING' as 'PASSING' | 'FAILING' | 'NOT RECORDED',
  buildCommand: 'npm run build',
};
