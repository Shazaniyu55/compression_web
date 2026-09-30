'use client';

import { formatBytes } from '@/lib/format';
import { useUsageQuery } from '@/store/api';

export function UsageStrip() {
  const { data } = useUsageQuery();

  const items = [
    { label: 'Data in this month', value: formatBytes(data?.bytesIn ?? 0) },
    { label: 'Data out', value: formatBytes(data?.bytesOut ?? 0) },
    { label: 'Encode time', value: `${Math.round(data?.encodeSeconds ?? 0)}s` },
    { label: 'Jobs', value: String(data?.jobs ?? 0) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-edge bg-surface px-4 py-3">
          <p className="text-xs text-mut">{it.label}</p>
          <p className="mt-1 font-mono text-lg">{it.value}</p>
        </div>
      ))}
    </div>
  );
}
