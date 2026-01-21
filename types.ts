
export type UserRole = 'guest' | 'resident' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
  isBanned: boolean;
  neighborhood?: string;
  notifsEnabled?: boolean;
}

export type IssueStatus = 'open' | 'acknowledged' | 'resolved';

export interface Category {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export interface IssuePhoto {
  id: string;
  url: string;
}

export interface Issue {
  id: string;
  createdBy: string;
  creatorName: string;
  title: string;
  description: string;
  categoryId: string;
  status: IssueStatus;
  statusNote?: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
  hidden: boolean;
  upvoteCount: number;
  photos: IssuePhoto[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  hidden: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'upvote' | 'comment' | 'status_change';
  issueId: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterUserId: string;
  contentType: 'issue' | 'comment';
  contentId: string;
  reason: string;
  details?: string;
  createdAt: string;
  resolvedByAdminId?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface Upvote {
  id: string;
  issueId: string;
  userId: string;
}

export interface DigestSettings {
  enabled: boolean;
  recipientEmails: string;
  scheduleDay: string;
  scheduleTime: string;
  lookbackDays: number;
  topN: number;
}
