import axios from 'axios';
import { getToken } from './auth';
import type {
  Application,
  ApplicationStatus,
  AuthResponse,
  Job,
  Notification,
  PaginatedJobs,
  User,
  UserRole,
} from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company?: string;
  headline?: string;
}) {
  const res = await api.post<AuthResponse>('/auth/register', data);
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function getProfile() {
  const res = await api.get<User>('/auth/me');
  return res.data;
}

export async function getJobs(params?: Record<string, string>) {
  const res = await api.get<PaginatedJobs>('/jobs', { params });
  return res.data;
}

export async function getJob(id: string) {
  const res = await api.get<Job>(`/jobs/${id}`);
  return res.data;
}

export async function getRecruiterJobs() {
  const res = await api.get<Job[]>('/jobs/recruiter/mine');
  return res.data;
}

export async function getRecruiterStats() {
  const res = await api.get<{
    totalJobs: number;
    openRoles: number;
    totalApplicants: number;
    conversionRate: number;
  }>('/jobs/recruiter/stats');
  return {
    totalJobs: res.data.totalJobs,
    openJobs: res.data.openRoles,
    totalApplications: res.data.totalApplicants,
  };
}

export async function createJob(data: Partial<Job>) {
  const res = await api.post<Job>('/jobs', data);
  return res.data;
}

export async function closeJob(id: string) {
  const res = await api.patch<Job>(`/jobs/${id}/close`);
  return res.data;
}

export async function applyToJob(
  jobId: string,
  file: File,
  coverLetter?: string,
) {
  const form = new FormData();
  form.append('resume', file);
  if (coverLetter) form.append('coverLetter', coverLetter);
  const res = await api.post<Application>(`/applications/jobs/${jobId}`, form);
  return res.data;
}

export async function getMyApplications() {
  const res = await api.get<Application[]>('/applications/mine');
  return res.data;
}

export async function getJobApplications(jobId: string) {
  const res = await api.get<Application[]>(`/applications/jobs/${jobId}`);
  return res.data;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
) {
  const res = await api.patch<Application>(`/applications/${id}/status`, {
    status,
  });
  return res.data;
}

export async function getNotifications() {
  const res = await api.get<Notification[]>('/notifications');
  return res.data;
}

export async function markNotificationRead(id: string) {
  const res = await api.patch<Notification>(`/notifications/${id}/read`);
  return res.data;
}
