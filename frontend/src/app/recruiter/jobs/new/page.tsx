'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJob } from '@/lib/api';

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [company, setCompany] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const job = await createJob({
        title,
        description,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        location,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        company: company || undefined,
        employmentType: employmentType || undefined,
      });
      router.push(`/recruiter/jobs/${job._id}`);
    } catch {
      setError('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Post a Job</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          rows={6}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Skills (comma-separated)"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="Min salary"
            required
            min={0}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="Max salary"
            required
            min={0}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company (optional)"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          placeholder="Employment type (optional)"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Job'}
        </button>
      </form>
    </div>
  );
}
