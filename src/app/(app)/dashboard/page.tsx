'use client';

import { JobsTable } from '@/components/JobsTable';
import { UploadCard } from '@/components/UploadCard';
import { UsageStrip } from '@/components/UsageStrip';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
      <UsageStrip />
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_1fr]">
        <UploadCard />
        <JobsTable />
      </div>
    </div>
  );
}
