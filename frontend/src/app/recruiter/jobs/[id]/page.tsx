'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  closeJob,
  getJob,
  getJobApplications,
  updateApplicationStatus,
} from '@/lib/api';
import type { Application, ApplicationStatus, Job, User } from '@/lib/types';

const STATUSES: ApplicationStatus[] = [
  'applied',
  'under_review',
  'interview',
  'hired',
  'rejected',
];

export default function RecruiterJobPage() {
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJob(id), getJobApplications(id)])
      .then(([jobData, apps]) => {
        setJob(jobData);
        setApplications(apps);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const refresh = async () => {
    const [jobData, apps] = await Promise.all([
      getJob(id),
      getJobApplications(id),
    ]);
    setJob(jobData);
    setApplications(apps);
  };

  const onStatusChange = async (appId: string, status: ApplicationStatus) => {
    await updateApplicationStatus(appId, status);
    refresh();
  };

  const onCloseJob = async () => {
    await closeJob(id);
    refresh();
  };

  if (loading) return <p>Loading...</p>;
  if (!job) return <p>Job not found</p>;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="mt-1 text-slate-600 capitalize">{job.status}</p>
        </div>
        {job.status === 'open' && (
          <button
            onClick={onCloseJob}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Close Job
          </button>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Applicants</h2>
      <div className="mt-4 space-y-4">
        {applications.map((app) => {
          const applicant = app.applicant as User;
          return (
            <div
              key={app._id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{applicant.name}</p>
                  <p className="text-sm text-slate-600">{applicant.email}</p>
                </div>
                <select
                  value={app.status}
                  onChange={(e) =>
                    onStatusChange(app._id, e.target.value as ApplicationStatus)
                  }
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm capitalize"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              {app.coverLetter && (
                <p className="mt-3 text-sm text-slate-600">{app.coverLetter}</p>
              )}
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
