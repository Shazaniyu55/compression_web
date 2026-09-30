import { formatBytes } from '@/lib/format';

/**
 * The signature element: original vs compressed size as two bars.
 * Bar length IS the data - the whole product in one glance.
 */
export function SavingsBar({ inBytes, outBytes }: { inBytes: number; outBytes: number }) {
  const ratio = inBytes > 0 ? Math.max(0.02, Math.min(1, outBytes / inBytes)) : 1;
  const saved = inBytes > 0 ? Math.round((1 - outBytes / inBytes) * 100) : 0;

  return (
    <div className="w-full max-w-[260px]">
      <div className="flex flex-col gap-1">
        <div className="h-1.5 w-full rounded-full bg-raise" title={`Original ${formatBytes(inBytes)}`} />
        <div
          className="h-1.5 rounded-full bg-mint transition-[width] duration-500"
          style={{ width: `${ratio * 100}%` }}
          title={`Compressed ${formatBytes(outBytes)}`}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-xs">
        <span className="text-mut">{formatBytes(inBytes)} → {formatBytes(outBytes)}</span>
        <span className="text-mint">−{saved}%</span>
      </div>
    </div>
  );
}
