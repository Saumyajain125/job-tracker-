'use client';

import { FormEvent, useEffect, useState } from 'react';
import { JobCard } from '@/components/JobCard';
import { getJobs } from '@/lib/api';
import type { Job } from '@/lib/types';

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async (params?: Record<string, string>) => {
    setLoading(true);
    setError('');
    try {
      const result = await getJobs(params);
      setJobs(result.data);
    } catch {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (title) params.title = title;
    if (location) params.location = location;
    if (skills) params.skills = skills;
    loadJobs(params);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Open Jobs</h1>
      <form
        onSubmit={onSearch}
        className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Skills"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      {loading && <p className="mt-6 text-slate-500">Loading jobs...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      <div className="mt-6 grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
        {!loading && jobs.length === 0 && (
          <p className="text-slate-500">No jobs found.</p>
        )}
      </div>
    </div>
  );
}
