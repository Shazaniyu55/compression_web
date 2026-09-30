'use client';

import { FormEvent, useState } from 'react';
import { formatDate } from '@/lib/format';
import {
  useApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} from '@/store/api';

export default function KeysPage() {
  const { data: keys, isLoading } = useApiKeysQuery();
  const [createKey, createState] = useCreateApiKeyMutation();
  const [revokeKey] = useRevokeApiKeyMutation();
  const [name, setName] = useState('');
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function create(e: FormEvent) {
    e.preventDefault();
    const res = await createKey({ name }).unwrap();
    setRevealed(res.apiKey);
    setCopied(false);
    setName('');
  }

  async function copy() {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold">API keys</h1>
      <p className="mb-6 text-sm text-mut">
        Use a key as <span className="font-mono">Authorization: Bearer sk_live_…</span> against the API.
      </p>

      <form onSubmit={create} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Key name, e.g. production server"
          className="flex-1 rounded-lg border border-edge bg-surface px-3 py-2 text-sm focus:border-amber"
        />
        <button
          type="submit"
          disabled={createState.isLoading}
          className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-ink hover:bg-amber/90 disabled:opacity-50"
        >
          Create key
        </button>
      </form>

      {revealed && (
        <div className="mb-6 rounded-xl border border-amber/40 bg-amber/5 p-4">
          <p className="mb-2 text-sm">Copy this key now - it won&apos;t be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-ink px-3 py-2 font-mono text-xs">
              {revealed}
            </code>
            <button
              onClick={copy}
              className="rounded-lg border border-edge px-3 py-2 text-sm hover:border-amber"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-edge bg-surface">
        {isLoading && <p className="px-5 py-6 text-sm text-mut">Loading keys…</p>}
        {!isLoading && !keys?.length && (
          <p className="px-5 py-8 text-center text-sm text-mut">No keys yet. Create one to call the API.</p>
        )}
        <ul className="divide-y divide-edge">
          {keys?.map((k) => (
            <li key={k.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{k.name}</p>
                <p className="font-mono text-xs text-mut">
                  {k.prefix}… · created {formatDate(k.createdAt)}
                  {k.lastUsedAt ? ` · last used ${formatDate(k.lastUsedAt)}` : ' · never used'}
                </p>
              </div>
              <button
                onClick={() => revokeKey(k.id)}
                className="shrink-0 rounded-lg border border-edge px-3 py-1.5 text-sm text-mut hover:border-danger hover:text-danger"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
