import { stellarReviewUrl } from '@/lib/stellar/explorer';

function hashFromReview(reviewUrl?: string | null) {
  const hash = reviewUrl?.split('/tx/')[1]?.split(/[?#]/)[0];
  return hash && /^[a-f0-9]{64}$/i.test(hash) ? hash : null;
}

export function TestnetAddress({ hash, reviewUrl }: { hash?: string | null; reviewUrl?: string | null }) {
  const value = hash && /^[a-f0-9]{64}$/i.test(hash) ? hash : hashFromReview(reviewUrl);
  const href = stellarReviewUrl(value) || (reviewUrl && value ? reviewUrl : null);
  if (!value || !href) {
    return <span className="text-xs text-[#708078]">Testnet address pending</span>;
  }
  return (
    <a
      className="inline-flex max-w-full flex-wrap items-center gap-2 font-mono text-xs font-medium text-[#0A4934] underline underline-offset-2"
      href={href}
      target="_blank"
      rel="noreferrer"
      title={value}
    >
      <span className="rounded-full bg-[#EAF9F1] px-2 py-0.5 font-sans text-[10px] font-semibold tracking-wide text-[#0A4934] no-underline">Testnet</span>
      <span className="break-all">{value}</span>
    </a>
  );
}
