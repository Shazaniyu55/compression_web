'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { closeSocket } from '@/lib/socket';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/billing', label: 'Billing' },
  { href: '/keys', label: 'API keys' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.token);
  const email = useAppSelector((s) => s.auth.email);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !token) router.replace('/login');
  }, [mounted, token, router]);

  if (!mounted || !token) return null;

  function signOut() {
    closeSocket();
    dispatch(logout());
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <aside className="flex w-full shrink-0 flex-row items-center justify-between border-b border-edge bg-surface px-4 py-3 sm:min-h-screen sm:w-56 sm:flex-col sm:items-stretch sm:justify-start sm:border-b-0 sm:border-r sm:px-4 sm:py-6">
        <Logo />
        <nav className="flex gap-1 sm:mt-8 sm:flex-col">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm ${
                  active ? 'bg-raise text-fg' : 'text-mut hover:bg-raise/60 hover:text-fg'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sm:mt-auto sm:border-t sm:border-edge sm:pt-4">
          <p className="hidden truncate font-mono text-xs text-mut sm:block">{email}</p>
          <button
            onClick={signOut}
            className="mt-0 text-sm text-mut hover:text-fg sm:mt-2"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
