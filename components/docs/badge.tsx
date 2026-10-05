import type { DocStatus } from '@/lib/docs/product';

const gate = 'border-amber-200/30 bg-amber-100/10 text-amber-100';
const lightGate = 'border-amber-300 bg-amber-50 text-amber-950';

const tone: Record<DocStatus, string> = {
  'LIVE IN ALPHA': 'border-[#35F49A]/40 bg-[#35F49A]/10 text-[#9DFFD2]',
  TESTNET: 'border-[#70FFB8]/30 bg-[#12352A] text-[#D7F8E8]',
  'INTEGRATION IN PROGRESS': 'border-[#70FFB8]/25 bg-white/5 text-[#D7F8E8]',
  'IN DEVELOPMENT': 'border-white/15 bg-white/5 text-[#D5E4DC]',
  'SECURITY GATE': gate,
  'PARTNER DEPENDENCY': gate,
  'REGULATORY GATE': gate,
  PLANNED: 'border-white/10 bg-transparent text-[#9FB8AD]',
  'MAINNET GATE': gate,
};

const lightTone: Record<DocStatus, string> = {
  'LIVE IN ALPHA': 'border-[#087A50]/30 bg-[#E7F8EF] text-[#087A50]',
  TESTNET: 'border-[#087A50]/20 bg-white text-[#0E3B2E]',
  'INTEGRATION IN PROGRESS': 'border-[#087A50]/25 bg-[#F2FBF6] text-[#0E3B2E]',
  'IN DEVELOPMENT': 'border-[#DDE7E1] bg-white text-[#3E524A]',
  'SECURITY GATE': lightGate,
  'PARTNER DEPENDENCY': lightGate,
  'REGULATORY GATE': lightGate,
  PLANNED: 'border-[#DDE7E1] bg-white text-[#52635C]',
  'MAINNET GATE': lightGate,
};

export function StatusBadge({ status, surface = 'dark' }: { status: DocStatus; surface?: 'light' | 'dark' }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${surface === 'light' ? lightTone[status] : tone[status]}`}>
      {status}
    </span>
  );
}
