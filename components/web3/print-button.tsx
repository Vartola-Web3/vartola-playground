'use client';

export function PrintButton({ label = 'Print or save as PDF' }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-full border border-[#0D7A52] px-4 py-2 text-sm font-medium text-[#0D7A52] print:hidden">
      {label}
    </button>
  );
}
