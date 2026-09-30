'use client';

import { DragEvent, useMemo, useRef, useState } from 'react';
import { formatBytes } from '@/lib/format';
import { putWithProgress } from '@/lib/upload';
import {
  useCompleteUploadMutation,
  useCreateJobMutation,
  useCreateUploadMutation,
  usePresetsQuery,
} from '@/store/api';

type Phase = 'idle' | 'uploading' | 'finalizing' | 'queued' | 'error';

function suggestPreset(mime: string, presets: string[]): string {
  if (mime.startsWith('video/')) return presets.find((p) => p === 'video-web-1080p') ?? presets[0];
  if (mime.startsWith('image/')) return presets.find((p) => p === 'image-web') ?? presets[0];
  return presets.find((p) => p === 'file-max') ?? presets[0];
}

export function UploadCard() {
  const { data: presets } = usePresetsQuery();
  const presetNames = useMemo(() => presets?.map((p) => p.name) ?? [], [presets]);

  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [createUpload] = useCreateUploadMutation();
  const [completeUpload] = useCompleteUploadMutation();
  const [createJob] = useCreateJobMutation();

  function pick(f: File) {
    setFile(f);
    setPhase('idle');
    setError(null);
    if (presetNames.length) setPreset(suggestPreset(f.type, presetNames));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pick(f);
  }

  async function compress() {
    if (!file || !preset) return;
    setError(null);
    try {
      setPhase('uploading');
      setPct(0);
      const { fileId, uploadUrl } = await createUpload({
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      }).unwrap();

      await putWithProgress(uploadUrl, file, setPct); // straight to storage - API never sees the bytes

      setPhase('finalizing');
      await completeUpload(fileId).unwrap();
      await createJob({ fileId, preset }).unwrap();

      setPhase('queued');
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: any) {
      setPhase('error');
      setError(err?.data?.message ?? err?.message ?? 'Upload failed - try again');
    }
  }

  const busy = phase === 'uploading' || phase === 'finalizing';

  return (
    <section className="rounded-xl border border-edge bg-surface p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-mut">New job</h2>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-sm transition-colors ${
          dragging ? 'border-amber bg-amber/5' : 'border-edge hover:border-mut'
        }`}
      >
        {file ? (
          <>
            <span className="max-w-full truncate font-medium">{file.name}</span>
            <span className="font-mono text-xs text-mut">{formatBytes(file.size)}</span>
          </>
        ) : (
          <>
            <span className="text-mut">Drop a file here, or click to choose</span>
            <span className="font-mono text-xs text-mut/70">video · image · anything</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
      />

      <label className="mb-1 mt-4 block text-sm text-mut" htmlFor="preset">Preset</label>
      <select
        id="preset"
        value={preset}
        onChange={(e) => setPreset(e.target.value)}
        className="w-full rounded-lg border border-edge bg-ink px-3 py-2 font-mono text-sm focus:border-amber"
      >
        <option value="" disabled>Choose a preset</option>
        {presets?.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name} → .{p.outputExtension}
          </option>
        ))}
      </select>

      {phase === 'uploading' && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-raise">
            <div className="h-full bg-amber transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 font-mono text-xs text-mut">Uploading… {pct}%</p>
        </div>
      )}
      {phase === 'finalizing' && <p className="mt-4 font-mono text-xs text-mut">Verifying upload…</p>}
      {phase === 'queued' && <p className="mt-4 font-mono text-xs text-mint">Job queued - watch it below.</p>}
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <button
        onClick={compress}
        disabled={!file || !preset || busy}
        className="mt-4 w-full rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber/90 disabled:opacity-40"
      >
        {busy ? 'Working…' : 'Compress'}
      </button>
    </section>
  );
}
