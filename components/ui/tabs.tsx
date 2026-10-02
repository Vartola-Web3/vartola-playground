'use client';

import { useState } from 'react';

export function Tabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap ${
              tab.id === current?.id ? 'bg-[#0B1F4D] text-white' : 'text-[#475569] hover:bg-[#F7F9FC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{current?.content}</div>
    </div>
  );
}
