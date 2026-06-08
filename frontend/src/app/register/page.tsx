'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';
import { setAuth } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('job_seeker');
  const [company, setCompany] = useState('');
  const [headline, setHeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await register({
        name,
        email,
        password,
        role,
        company: company || undefined,
        headline: headline || undefined,
      });
      setAuth(data.accessToken, data.user);
      router.push(role === 'recruiter' ? '/recruiter' : '/');
      router.refresh();
    } catch {
      setError('Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="job_seeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>
        {role === 'recruiter' && (
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        )}
        {role === 'job_seeker' && (
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Headline"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
