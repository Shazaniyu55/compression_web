import type { JobStatus } from '@/lib/types';

const styles: Record<JobStatus, string> = {
  queued: 'bg-raise text-mut',
  processing: 'bg-amber/15 text-amber',
  completed: 'bg-mint/15 text-mint',
  failed: 'bg-danger/15 text-danger',
};

export function StatusPill({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 font-mono text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}
