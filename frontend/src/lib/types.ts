export type UserRole = 'job_seeker' | 'recruiter';

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'interview'
  | 'hired'
  | 'rejected';

export type JobStatus = 'open' | 'closed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  headline?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  salaryMin: number;
  salaryMax: number;
  status: JobStatus;
  company?: string;
  employmentType?: string;
  recruiter?: User | string;
  createdAt?: string;
}

export interface Application {
  _id: string;
  job: Job | string;
  applicant: User | string;
  status: ApplicationStatus;
  coverLetter?: string;
  createdAt?: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

export interface PaginatedJobs {
  data: Job[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
