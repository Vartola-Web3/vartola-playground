// Pilot pipeline. Holds only what an admin enters. Nothing is pre-populated and every KPI starts at zero.

export const ENTITY_TYPES = ['SME', 'SUPPLIER', 'FLEET_PARTNER', 'FINANCE_PARTNER', 'CUSTODY_PAYMENT_PARTNER', 'INSURANCE_PARTNER', 'SERVICING_PARTNER'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const STAGES = ['IDENTIFIED', 'CONTACTED', 'MEETING', 'INTERESTED', 'NDA', 'PILOT_DISCUSSION', 'LOI_REQUESTED', 'LOI_SIGNED', 'PILOT_READY', 'DECLINED'] as const;
export type Stage = (typeof STAGES)[number];

export type PilotEntry = { id: string; name: string; type: EntityType; stage: Stage; prospectiveVolume: number; assetsRequested: number; onboarded: boolean; pilotFacility: boolean; notes: string };

const rank = (stage: Stage) => STAGES.indexOf(stage);

export function pilotKpis(entries: PilotEntry[]) {
  const live = entries.filter((entry) => entry.stage !== 'DECLINED');
  const smes = entries.filter((entry) => entry.type === 'SME');
  return {
    smesContacted: smes.filter((entry) => rank(entry.stage) >= rank('CONTACTED') && entry.stage !== 'DECLINED').length,
    smesInterested: smes.filter((entry) => rank(entry.stage) >= rank('INTERESTED') && entry.stage !== 'DECLINED').length,
    lois: entries.filter((entry) => entry.stage === 'LOI_SIGNED' || entry.stage === 'PILOT_READY').length,
    prospectiveVolume: live.reduce((sum, entry) => sum + (entry.prospectiveVolume || 0), 0),
    assetsRequested: live.reduce((sum, entry) => sum + (entry.assetsRequested || 0), 0),
    suppliersOnboarded: entries.filter((entry) => entry.type === 'SUPPLIER' && entry.onboarded).length,
    pilotFacilities: entries.filter((entry) => entry.pilotFacility).length,
    partnerDiscussions: entries.filter((entry) => entry.type !== 'SME' && entry.type !== 'SUPPLIER' && rank(entry.stage) >= rank('MEETING') && entry.stage !== 'DECLINED').length,
    total: entries.length,
  };
}

export function pipelineCounts(entries: PilotEntry[]) {
  return STAGES.map((stage) => ({ stage, count: entries.filter((entry) => entry.stage === stage).length }));
}

export function validateEntry(input: Partial<PilotEntry>) {
  if (!input.name || !input.name.trim()) throw new Error('A name is required');
  if (!ENTITY_TYPES.includes(input.type as EntityType)) throw new Error('Unknown entity type');
  if (!STAGES.includes(input.stage as Stage)) throw new Error('Unknown stage');
  return true;
}
