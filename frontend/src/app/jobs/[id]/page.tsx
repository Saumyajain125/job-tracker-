'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { applyToJob, getJob } from '@/lib/api';
import { getUser } from '@/lib/auth';
import type { Job } from '@/lib/types';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const user = getUser();

  const [job, setJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJob(id)
      .then(setJob)
      .catch(() => setError('Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const onApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!resume) {
      setError('Resume is required');
      return;
    }
    setError('');
    try {
      await applyToJob(id, resume, coverLetter || undefined);
      setMessage('Application submitted successfully');
    } catch {
      setError('Failed to submit application');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!job) return <p className="text-red-600">{error || 'Job not found'}</p>;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="mt-2 text-slate-600">
        {job.company || 'Company'} · {job.location}
      </p>
      <p className="mt-4 whitespace-pre-wrap text-slate-700">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700"
          >
            {skill}
          </span>
        ))}
      </div>
      <p className="mt-4 font-medium">
        ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
      </p>

      {user?.role === 'job_seeker' && job.status === 'open' && (
        <form onSubmit={onApply} className="mt-8 space-y-3 border-t border-slate-200 pt-6">
          <h2 className="font-semibold">Apply for this job</h2>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Cover letter (optional)"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            rows={4}
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            required
            className="w-full"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Submit Application
          </button>
        </form>
      )}
    </div>
  );
}
