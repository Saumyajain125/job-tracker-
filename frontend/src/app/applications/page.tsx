'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMyApplications } from '@/lib/api';
import type { Application, Job } from '@/lib/types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading applications...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">My Applications</h1>
      <div className="mt-6 space-y-4">
        {applications.map((app) => {
          const job = app.job as Job;
          return (
            <div
              key={app._id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/jobs/${job._id}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {job.title}
                </Link>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize">
                  {app.status.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {job.company || 'Company'} · {job.location}
              </p>
            </div>
          );
        })}
        {applications.length === 0 && (
          <p className="text-slate-500">No applications yet.</p>
        )}
      </div>
    </div>
  );
}
