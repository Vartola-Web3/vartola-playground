import { createHash } from 'crypto';
import type { SandboxState } from './state';

// A downloadable evidence pack built only from the session state. The fingerprint is reproducible: replaying
// the same actions from the same seed produces the same timeline and the same hash.

export type EvidencePack = {
  scenarioKey: string;
  generatedAtPhase: SandboxState['phase'];
  clock: string;
  facility: SandboxState['facility'];
  investors: Array<{ id: string; units: number; principalReturned: number; incomeReceived: number; recoveryReceived: number }>;
  reserveBalance: number;
  distributions: SandboxState['distributions'];
  recovery: SandboxState['recovery'];
  timeline: SandboxState['timeline'];
  ledger: SandboxState['ledger'];
  fingerprint: string;
};

export function buildEvidence(state: SandboxState): EvidencePack {
  const body = {
    scenarioKey: state.scenarioKey,
    generatedAtPhase: state.phase,
    clock: state.clock,
    facility: state.facility,
    investors: state.investors.map((row) => ({
      id: row.id,
      units: row.units,
      principalReturned: row.principalReturned,
      incomeReceived: row.incomeReceived,
      recoveryReceived: row.recoveryReceived,
    })),
    reserveBalance: state.reserveBalance,
    distributions: state.distributions,
    recovery: state.recovery,
    timeline: state.timeline,
    ledger: state.ledger,
  };
  const fingerprint = createHash('sha256').update(JSON.stringify(body)).digest('hex');
  return { ...body, fingerprint };
}
