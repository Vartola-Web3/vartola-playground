'use client';

import { motion } from 'framer-motion';

export function FloatingFinanceCard({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7 }}
      className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-[0_12px_40px_rgba(59,130,246,0.18)] backdrop-blur-md"
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#F8FAFC]">{value}</p>
    </motion.div>
  );
}
