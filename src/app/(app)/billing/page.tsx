'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { formatBytes } from '@/lib/format';
import {
  useCancelSubscriptionMutation,
  useCheckoutMutation,
  useLazyVerifySubscriptionQuery,
  usePlansQuery,
  usePortalMutation,
} from '@/store/api';

function BillingContent() {
  const { data: plans, isLoading } = usePlansQuery();
  const [checkout] = useCheckoutMutation();
  const [portal, portalState] = usePortalMutation();
  const [cancel, cancelState] = useCancelSubscriptionMutation();
  const [verify] = useLazyVerifySubscriptionQuery();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Paystack redirects back with ?reference=... - confirm the charge
  // server-side and activate the plan (works without webhooks in dev).
  useEffect(() => {
    const reference = searchParams.get('reference') ?? searchParams.get('trxref');
    if (!reference) return;
    verify(reference)
      .unwrap()
      .then((res) =>
        setNotice(
          res.active
            ? 'Payment confirmed - your plan is now active.'
            : `Payment status: ${res.status}. If you completed payment, refresh in a moment.`,
        ),
      )
      .catch((err) => setError(err?.data?.message ?? 'Could not verify the payment'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function subscribe(planId: string) {
    setError(null);
    try {
      const res = await checkout({ planId }).unwrap();
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
    } catch (err: any) {
      setError(err?.data?.message ?? 'Could not start checkout');
    }
  }

  async function openPortal() {
    setError(null);
    try {
      const res = await portal().unwrap();
      if (res.portalUrl) window.location.href = res.portalUrl;
    } catch (err: any) {
      setError(err?.data?.message ?? 'Could not open the card update page');
    }
  }

  async function cancelSub() {
    setError(null);
    try {
      await cancel().unwrap();
      setNotice('Subscription cancelled - you are back on the free plan.');
    } catch (err: any) {
      setError(err?.data?.message ?? 'Could not cancel the subscription');
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Billing</h1>
        <div className="flex gap-2">
          <button
            onClick={openPortal}
            disabled={portalState.isLoading}
            className="rounded-lg border border-edge px-3 py-1.5 text-sm hover:border-mut disabled:opacity-50"
          >
            Update card
          </button>
          <button
            onClick={cancelSub}
            disabled={cancelState.isLoading}
            className="rounded-lg border border-edge px-3 py-1.5 text-sm text-mut hover:border-danger hover:text-danger disabled:opacity-50"
          >
            Cancel subscription
          </button>
        </div>
      </div>

      {notice && <p className="mb-4 rounded-lg border border-mint/40 bg-mint/10 px-4 py-2 text-sm text-mint">{notice}</p>}
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}
      {isLoading && <p className="text-sm text-mut">Loading plans…</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {plans?.map((plan) => {
          const paid = plan.monthlyPriceCents > 0;
          return (
            <div key={plan.id} className="flex flex-col rounded-xl border border-edge bg-surface p-5">
              <h2 className="font-mono text-sm uppercase tracking-wider text-mut">{plan.name}</h2>
              <p className="mt-2 text-2xl font-semibold">
                {paid ? `₦${(plan.monthlyPriceCents / 100).toLocaleString()}` : '₦0'}
                <span className="text-sm font-normal text-mut"> /month</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-mut">
                <li><span className="font-mono text-fg">{formatBytes(Number(plan.includedBytes))}</span> processed per month</li>
                <li>Files up to <span className="font-mono text-fg">{formatBytes(Number(plan.maxFileSizeBytes))}</span></li>
                <li>{plan.priority > 0 ? 'Priority queue' : 'Standard queue'}</li>
              </ul>
              {paid ? (
                <button
                  onClick={() => subscribe(plan.id)}
                  className="mt-5 rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-ink hover:bg-amber/90"
                >
                  Subscribe
                </button>
              ) : (
                <p className="mt-5 rounded-lg border border-edge px-4 py-2 text-center text-sm text-mut">
                  Included by default
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<p className="text-sm text-mut">Loading billing…</p>}>
      <BillingContent />
    </Suspense>
  );
}
