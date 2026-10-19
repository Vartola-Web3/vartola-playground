'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-20 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[#0A4934]">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#102019]">This page could not load</h1>
        <p className="mt-3 text-sm text-[#52635C]">Try again. If it keeps happening, use the contact form and we will look into it.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="rounded-full bg-[#15C77A] px-5 py-3 text-sm font-semibold text-white">Try again</button>
          <Link href="/" className="rounded-full border border-[#DCE6E1] px-5 py-3 text-sm text-[#102019]">Back home</Link>
          <Link href="/contact" className="rounded-full border border-[#DCE6E1] px-5 py-3 text-sm text-[#102019]">Contact</Link>
        </div>
      </div>
    </div>
  );
}
