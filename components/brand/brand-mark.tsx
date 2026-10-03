import Link from 'next/link';

export function BrandMark({
  href = '/',
  tone = 'dark',
  wordmark = true,
}: {
  href?: string;
  tone?: 'dark' | 'light';
  wordmark?: boolean;
}) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <img src="/brand/vartola-logo.png" alt="" className="h-8 w-8 rounded-lg" />
      {wordmark && (
        <span className={`text-sm font-semibold tracking-tight ${tone === 'light' ? 'text-[#0A4934]' : 'text-[#70FFB8]'}`}>
          Vartola
        </span>
      )}
    </Link>
  );
}
