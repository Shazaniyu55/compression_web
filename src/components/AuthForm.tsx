'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useLoginMutation, useRegisterMutation } from '@/store/api';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { Logo } from './Logo';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const busy = loginState.isLoading || registerState.isLoading;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const fn = mode === 'login' ? login : register;
      const res = await fn({ email, password }).unwrap();
      dispatch(setCredentials({ token: res.accessToken, email }));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.data?.message ?? 'Something went wrong - try again');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Logo />
          {/* Compression motif: a file getting smaller */}
          <div className="flex w-40 flex-col gap-1" aria-hidden>
            <div className="h-1.5 w-full rounded-full bg-raise" />
            <div className="h-1.5 w-2/3 rounded-full bg-raise" />
            <div className="h-1.5 w-1/3 rounded-full bg-amber" />
          </div>
        </div>

        <form onSubmit={submit} className="rounded-xl border border-edge bg-surface p-6">
          <h1 className="mb-5 text-lg font-semibold">
            {mode === 'login' ? 'Sign in' : 'Create your account'}
          </h1>

          <label className="mb-1 block text-sm text-mut" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-edge bg-ink px-3 py-2 text-sm focus:border-amber"
            placeholder="you@company.com"
          />

          <label className="mb-1 block text-sm text-mut" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full rounded-lg border border-edge bg-ink px-3 py-2 text-sm focus:border-amber"
            placeholder="At least 8 characters"
          />

          {error && <p className="mb-4 text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber/90 disabled:opacity-50"
          >
            {busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-mut">
          {mode === 'login' ? (
            <>New here? <Link href="/register" className="text-amber hover:underline">Create an account</Link></>
          ) : (
            <>Already have an account? <Link href="/login" className="text-amber hover:underline">Sign in</Link></>
          )}
        </p>
      </div>
    </main>
  );
}
