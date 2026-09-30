'use client';

import { useEffect } from 'react';
import { formatDate } from '@/lib/format';
import { getSocket } from '@/lib/socket';
import type { JobEvent } from '@/lib/types';
import { api, useFilesQuery, useJobsQuery, useLazyJobDownloadQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SavingsBar } from './SavingsBar';
import { StatusPill } from './StatusPill';

export function JobsTable() {
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();
  // 15s polling as a fallback; the WebSocket does the real-time work.
  const { data: jobs, isLoading } = useJobsQuery(undefined, { pollingInterval: 15000 });
  const { data: files } = useFilesQuery();
  const [getDownload] = useLazyJobDownloadQuery();

  const fileName = (id: string) => files?.find((f) => f.id === id)?.originalName ?? '…';

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);

    const onProgress = (e: JobEvent) => {
      dispatch(
        api.util.updateQueryData('jobs', undefined, (draft) => {
          const job = draft.find((j) => j.id === e.jobId);
          if (job) {
            job.status = 'processing';
            job.progress = e.progress ?? job.progress;
          }
        }),
      );
    };
    const onSettled = () => {
      dispatch(api.util.invalidateTags(['Jobs', 'Usage']));
    };

    socket.on('job.progress', onProgress);
    socket.on('job.completed', onSettled);
    socket.on('job.failed', onSettled);
    return () => {
      socket.off('job.progress', onProgress);
      socket.off('job.completed', onSettled);
      socket.off('job.failed', onSettled);
    };
  }, [token, dispatch]);

  async function download(jobId: string) {
    const res = await getDownload(jobId, false).unwrap();
    window.open(res.url, '_blank', 'noopener');
  }

  return (
    <section className="rounded-xl border border-edge bg-surface">
      <div className="border-b border-edge px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-mut">Jobs</h2>
      </div>

      {isLoading && <p className="px-5 py-8 text-sm text-mut">Loading jobs…</p>}

      {!isLoading && !jobs?.length && (
        <p className="px-5 py-10 text-center text-sm text-mut">
          No jobs yet. Upload a file to start compressing.
        </p>
      )}

      <ul className="divide-y divide-edge">
        {jobs?.map((job) => (
          <li key={job.id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium">{fileName(job.fileId)}</span>
                <StatusPill status={job.status} />
              </div>
              <p className="mt-0.5 font-mono text-xs text-mut">
                {job.preset} · {formatDate(job.createdAt)}
              </p>

              {job.status === 'processing' && (
                <div className="mt-2 flex max-w-[260px] items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raise">
                    <div className="h-full bg-amber transition-[width] duration-300" style={{ width: `${job.progress}%` }} />
                  </div>
                  <span className="font-mono text-xs text-amber">{job.progress}%</span>
                </div>
              )}

              {job.status === 'completed' && job.inputSizeBytes != null && job.outputSizeBytes != null && (
                <div className="mt-2">
                  <SavingsBar inBytes={job.inputSizeBytes} outBytes={job.outputSizeBytes} />
                </div>
              )}

              {job.status === 'failed' && (
                <p className="mt-1 max-w-md truncate text-xs text-danger" title={job.error ?? ''}>
                  {job.error ?? 'Compression failed'}
                </p>
              )}
            </div>

            {job.status === 'completed' && (
              <button
                onClick={() => download(job.id)}
                className="justify-self-start rounded-lg border border-edge px-3 py-1.5 text-sm hover:border-mint hover:text-mint sm:justify-self-end"
              >
                Download
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
