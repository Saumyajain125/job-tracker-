'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAuth, getUser } from '@/lib/auth';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
  const router = useRouter();
  const user = getUser();

  const logout = () => {
    clearAuth();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-indigo-600">
          JobTrack
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-indigo-600">
            Jobs
          </Link>
          {user?.role === 'job_seeker' && (
            <Link href="/applications" className="hover:text-indigo-600">
              My Applications
            </Link>
          )}
          {user?.role === 'recruiter' && (
            <Link href="/recruiter" className="hover:text-indigo-600">
              Dashboard
            </Link>
          )}
          {user ? (
            <>
              <NotificationBell />
              <span className="text-slate-500">{user.name}</span>
              <button
                onClick={logout}
                className="rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-600">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
