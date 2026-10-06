// "Why on-chain?" matrix. It compares a private database alone with what Soroban and Stellar add for each function.
// It does not claim blockchain solves every trust problem: off-chain legal agreements, asset reality, KYC and
// servicing still depend on people, contracts and regulated partners.

export const NECESSITY: { fn: string; database: string; chain: string }[] = [
  { fn: 'Investor authorization', database: 'A row says the investor agreed; the operator can edit it.', chain: 'The investor signs with their own key. The contract rejects any action without that signature.' },
  { fn: 'Facility state', database: 'State is whatever the operator last wrote.', chain: 'State transitions are enforced by contract code and every change emits an event anyone can read.' },
  { fn: 'Participation position', database: 'A balance in a table.', chain: 'Units are issued by the contract, are non-transferable, and are checked against funding by the contract.' },
  { fn: 'Escrow', database: 'A ledger line the operator controls.', chain: 'Funds sit in contract state; release needs attested conditions and a role that cannot also authorize.' },
  { fn: 'Capital release', database: 'A button an administrator or a compromised session can press.', chain: 'Eight conditions attested by their own roles, one authorizer, a different payer, a daily limit, and a pause switch.' },
  { fn: 'Repayment', database: 'An entry the operator records.', chain: 'Split by one deterministic waterfall and recorded with a transaction anyone can verify.' },
  { fn: 'Distribution', database: 'A job that runs on a server.', chain: 'Deterministic by Participation Units, cumulative per holder, and reproducible from public events.' },
  { fn: 'Settlement', database: 'A status change.', chain: 'Settlement terms are quoted by operations and executed once; the contract refuses a second close.' },
  { fn: 'Recovery', database: 'A note and a number.', chain: 'Recovery cannot distribute more than the realised proceeds and follows the same waterfall.' },
  { fn: 'Attestation', database: 'The operator can silently rewrite a score or document record.', chain: 'Only hashes are anchored, so a later change to a risk score or document is detectable.' },
  { fn: 'Reconciliation', database: 'Compares a database with itself.', chain: 'Compares the application with an independent source of truth and reports mismatches instead of hiding them.' },
];

export const NECESSITY_CAVEATS = [
  'Blockchain does not make an SME creditworthy, an asset real, or a document true. Those still need underwriting, inspection and verified documents.',
  'On-chain records are only as honest as the roles that attest them; that is why roles are separate and the evidence is hashed, not hidden.',
  'Legal title, security over the asset and client-money handling are off-chain and regulatory matters.',
];
