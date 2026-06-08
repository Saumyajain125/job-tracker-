'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getRecruiterJobs, getRecruiterStats } from '@/lib/api';
import type { Job } from '@/lib/types';

export default function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRecruiterJobs(), getRecruiterStats()])
      .then(([jobsData, statsData]) => {
        setJobs(jobsData);
        setStats(statsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <Link
          href="/recruiter/jobs/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Post Job
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total Jobs</p>
          <p className="text-2xl font-bold">{stats.totalJobs}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Open Jobs</p>
          <p className="text-2xl font-bold">{stats.openJobs}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Applications</p>
          <p className="text-2xl font-bold">{stats.totalApplications}</p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Your Jobs</h2>
        {jobs.map((job) => (
          <Link
            key={job._id}
            href={`/recruiter/jobs/${job._id}`}
            className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{job.title}</span>
              <span className="text-sm capitalize text-slate-500">{job.status}</span>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && (
          <p className="text-slate-500">No jobs posted yet.</p>
        )}
      </div>
    </div>
  );
}
