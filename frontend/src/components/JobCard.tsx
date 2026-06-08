import Link from 'next/link';
import type { Job } from '@/lib/types';

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job._id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {job.company || 'Company'} · {job.location}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {job.status}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
        {job.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {job.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700"
          >
            {skill}
          </span>
        ))}
        <span className="ml-auto text-sm font-medium text-slate-700">
          ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
