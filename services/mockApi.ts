
import { Issue, Comment, User, UserRole, Upvote, Report, IssueStatus } from '../types';
import { CATEGORIES, TRENDING_RECENCY_DAYS, TRENDING_WEIGHT_UPVOTES } from '../constants';

// Storage keys
const STORAGE_KEYS = {
  ISSUES: 'civicpulse_issues',
  COMMENTS: 'civicpulse_comments',
  USERS: 'civicpulse_users',
  UPVOTES: 'civicpulse_upvotes',
  REPORTS: 'civicpulse_reports',
  CURRENT_USER: 'civicpulse_auth',
};

// Initial state helpers
const getStored = <T,>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStored = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Clean slate: empty seed issues
const seedIssues: Issue[] = [];

// Helper to calculate trending score
export const calculateTrendingScore = (issue: Issue) => {
  const daysSince = (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return issue.upvoteCount * TRENDING_WEIGHT_UPVOTES + Math.max(0, TRENDING_RECENCY_DAYS - daysSince);
};

export const mockApi = {
  // --- Auth ---
  login: (email: string, password?: string): User | null => {
    // Hardcoded check for the primary admin account
    if (email === 'notdev42@gmail.com') {
      if (password === 'devansh1234') {
        const adminUser: User = {
          id: 'admin-001',
          name: 'Devansh (Super Admin)',
          email: 'notdev42@gmail.com',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isBanned: false
        };
        setStored(STORAGE_KEYS.CURRENT_USER, adminUser);
        return adminUser;
      } else {
        return null; // Invalid password for super admin
      }
    }

    // Generic login for all other users - strictly Resident role
    const users = getStored<User[]>(STORAGE_KEYS.USERS, []);
    let user = users.find(u => u.email === email);
    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        role: 'resident', // Forced resident role for all other emails
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isBanned: false
      };
      users.push(user);
      setStored(STORAGE_KEYS.USERS, users);
    }
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },
  getCurrentUser: () => getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null),
  logout: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER),

  // --- Issues ---
  getIssues: (sort: string = 'trending', categoryId?: string, status?: string) => {
    let issues = getStored<Issue[]>(STORAGE_KEYS.ISSUES, seedIssues);
    issues = issues.filter(i => !i.hidden);

    if (categoryId) issues = issues.filter(i => i.categoryId === categoryId);
    if (status) issues = issues.filter(i => i.status === status);

    switch (sort) {
      case 'trending':
        return issues.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
      case 'newest':
        return issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'upvoted':
        return issues.sort((a, b) => b.upvoteCount - a.upvoteCount);
      default:
        return issues;
    }
  },
  getIssue: (id: string) => getStored<Issue[]>(STORAGE_KEYS.ISSUES, seedIssues).find(i => i.id === id),
  createIssue: (data: Partial<Issue>) => {
    const issues = getStored<Issue[]>(STORAGE_KEYS.ISSUES, seedIssues);
    const newIssue: Issue = {
      id: Math.random().toString(36).substr(2, 9),
      createdBy: data.createdBy!,
      creatorName: data.creatorName || 'Resident',
      title: data.title!,
      description: data.description!,
      categoryId: data.categoryId!,
      status: 'open',
      latitude: data.latitude!,
      longitude: data.longitude!,
      address: data.address || 'Unknown Address',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hidden: false,
      upvoteCount: 0,
      photos: data.photos || []
    };
    issues.push(newIssue);
    setStored(STORAGE_KEYS.ISSUES, issues);
    return newIssue;
  },
  updateIssueStatus: (id: string, status: IssueStatus, note?: string) => {
    const issues = getStored<Issue[]>(STORAGE_KEYS.ISSUES, seedIssues);
    const idx = issues.findIndex(i => i.id === id);
    if (idx !== -1) {
      issues[idx].status = status;
      issues[idx].statusNote = note;
      issues[idx].updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.ISSUES, issues);
    }
  },

  // --- Upvotes ---
  toggleUpvote: (issueId: string, userId: string) => {
    const upvotes = getStored<Upvote[]>(STORAGE_KEYS.UPVOTES, []);
    const issues = getStored<Issue[]>(STORAGE_KEYS.ISSUES, seedIssues);
    const existing = upvotes.find(u => u.issueId === issueId && u.userId === userId);
    
    if (existing) {
      const filtered = upvotes.filter(u => u.id !== existing.id);
      setStored(STORAGE_KEYS.UPVOTES, filtered);
      const issueIdx = issues.findIndex(i => i.id === issueId);
      if (issueIdx !== -1) issues[issueIdx].upvoteCount--;
    } else {
      upvotes.push({ id: Math.random().toString(36).substr(2, 9), issueId, userId });
      setStored(STORAGE_KEYS.UPVOTES, upvotes);
      const issueIdx = issues.findIndex(i => i.id === issueId);
      if (issueIdx !== -1) issues[issueIdx].upvoteCount++;
    }
    setStored(STORAGE_KEYS.ISSUES, issues);
  },
  hasUpvoted: (issueId: string, userId: string) => {
    const upvotes = getStored<Upvote[]>(STORAGE_KEYS.UPVOTES, []);
    return upvotes.some(u => u.issueId === issueId && u.userId === userId);
  },

  // --- Comments ---
  getComments: (issueId: string) => getStored<Comment[]>(STORAGE_KEYS.COMMENTS, []).filter(c => c.issueId === issueId && !c.hidden),
  addComment: (issueId: string, userId: string, userName: string, body: string) => {
    const comments = getStored<Comment[]>(STORAGE_KEYS.COMMENTS, []);
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      issueId,
      userId,
      userName,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hidden: false
    };
    comments.push(newComment);
    setStored(STORAGE_KEYS.COMMENTS, comments);
    return newComment;
  },

  // --- Moderation ---
  reportContent: (data: Partial<Report>) => {
    const reports = getStored<Report[]>(STORAGE_KEYS.REPORTS, []);
    reports.push({
      id: Math.random().toString(36).substr(2, 9),
      reporterUserId: data.reporterUserId!,
      contentType: data.contentType!,
      contentId: data.contentId!,
      reason: data.reason!,
      details: data.details,
      createdAt: new Date().toISOString()
    });
    setStored(STORAGE_KEYS.REPORTS, reports);
  }
};
