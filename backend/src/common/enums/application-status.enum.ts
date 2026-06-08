export enum ApplicationStatus {
  APPLIED = 'applied',
  UNDER_REVIEW = 'under_review',
  INTERVIEW = 'interview',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

export const APPLICATION_STATUS_PIPELINE = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.HIRED,
  ApplicationStatus.REJECTED,
] as const;
