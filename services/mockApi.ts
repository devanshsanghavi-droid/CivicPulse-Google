
import { Issue, Comment, User, UserRole, Upvote, Report, IssueStatus, Notification } from '../types';
import { CATEGORIES, TRENDING_RECENCY_DAYS, TRENDING_WEIGHT_UPVOTES } from '../constants';

const STORAGE_KEYS = {
  ISSUES: 'civicpulse_issues',
  COMMENTS: 'civicpulse_comments',
  USERS: 'civicpulse_users',
  UPVOTES: 'civicpulse_upvotes',
  REPORTS: 'civicpulse_reports',
  CURRENT_USER: 'civicpulse_auth',
  NOTIFS: 'civicpulse_notifs'
};

interface StoredUser extends User {
  password?: string;
}

const getStored = <T,>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStored = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const seedIssues: Issue[] = [];

export const calculateTrendingScore = (issue: Issue) => {
  const daysSince = (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return issue.upvoteCount * TRENDING_WEIGHT_UPVOTES + Math.max(0, TRENDING_RECENCY_DAYS - daysSince);
};

export const mockApi = {
  // --- Auth & Profile ---
  login: (email: string, password?: string): User | null => {
    if (email === 'notdev42@gmail.com') {
      if (password === 'devansh1234') {
        const adminUser: User = {
          id: 'admin-001',
          name: 'Devansh (Super Admin)',
          email: 'notdev42@gmail.com',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isBanned: false,
          notifsEnabled: true
        };
        setStored(STORAGE_KEYS.CURRENT_USER, adminUser);
        return adminUser;
      }
      return null;
    }

    const users = getStored<StoredUser[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email === email);
    if (user && user.password === password) {
      const { password: _, ...userSession } = user;
      setStored(STORAGE_KEYS.CURRENT_USER, userSession);
      return userSession as User;
    }
    return null;
  },

  signup: (email: string, password?: string, name?: string): User => {
    const users = getStored<StoredUser[]>(STORAGE_KEYS.USERS, []);
    let user = users.find(u => u.email === email);
    if (!user) {
      const newUser: StoredUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || email.split('@')[0],
        email,
        password,
        role: 'resident',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isBanned: false,
        notifsEnabled: true
      };
      users.push(newUser);
      setStored(STORAGE_KEYS.USERS, users);
      user = newUser;
    }
    const { password: _, ...userSession } = user;
    setStored(STORAGE_KEYS.CURRENT_USER, userSession);
    return userSession as User;
  },

  updateProfile: (userId: string, data: Partial<User>) => {
    const users = getStored<StoredUser[]>(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      setStored(STORAGE_KEYS.USERS, users);
      
      const currentUser = getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && currentUser.id === userId) {
        const updated = { ...currentUser, ...data };
        setStored(STORAGE_KEYS.CURRENT_USER, updated);
        return updated;
      }
    }
    return null;
  },

  getCurrentUser: () => getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null),
  logout: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER),

  // --- Stats ---
  getUserStats: (userId: string) => {
    const issues = getStored<Issue[]>(STORAGE_KEYS.ISSUES, []);
    const userIssues = issues.filter(i => i.createdBy === userId);
    const totalUpvotes = userIssues.reduce((acc, i) => acc + i.upvoteCount, 0);
    return {
      reportCount: userIssues.length,
      upvoteCount: totalUpvotes
    };
  },

  // --- Notifications ---
  getNotifications: (userId: string) => {
    return getStored<Notification[]>(STORAGE_KEYS.NOTIFS, []).filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationsRead: (userId: string) => {
    const notifs = getStored<Notification[]>(STORAGE_KEYS.NOTIFS, []);
    const updated = notifs.map(n => n.userId === userId ? { ...n, read: true } : n);
    setStored(STORAGE_KEYS.NOTIFS, updated);
  },

  addNotification: (userId: string, title: string, message: string, type: any, issueId: string) => {
    const notifs = getStored<Notification[]>(STORAGE_KEYS.NOTIFS, []);
    notifs.push({
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      issueId,
      read: false,
      createdAt: new Date().toISOString()
    });
    setStored(STORAGE_KEYS.NOTIFS, notifs);
  },

  // --- Issues ---
  getIssues: (sort: string = 'trending', categoryId?: string, status?: string) => {
    let issues = getStored<Issue[]>(STORAGE_KEYS.ISSUES, seedIssues);
    issues = issues.filter(i => !i.hidden);
    if (categoryId) issues = issues.filter(i => i.categoryId === categoryId);
    if (status) issues = issues.filter(i => i.status === status);
    switch (sort) {
      case 'trending': return issues.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
      case 'newest': return issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'upvoted': return issues.sort((a, b) => b.upvoteCount - a.upvoteCount);
      default: return issues;
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
      const issue = issues[idx];
      issue.status = status;
      issue.statusNote = note;
      issue.updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.ISSUES, issues);
      
      // Notify creator
      mockApi.addNotification(
        issue.createdBy,
        'Report Updated',
        `The status of your report "${issue.title}" has been updated to ${status}.`,
        'status_change',
        issue.id
      );
    }
  },

  toggleUpvote: (issueId: string, userId: string) => {
    const upvotes = getStored<Upvote[]>(STORAGE_KEYS.UPVOTES, []);
    const issues = getStored<Issue[]>(STORAGE_KEYS.ISSUES, seedIssues);
    const existing = upvotes.find(u => u.issueId === issueId && u.userId === userId);
    
    const issueIdx = issues.findIndex(i => i.id === issueId);
    if (issueIdx === -1) return;

    if (existing) {
      const filtered = upvotes.filter(u => u.id !== existing.id);
      setStored(STORAGE_KEYS.UPVOTES, filtered);
      issues[issueIdx].upvoteCount--;
    } else {
      upvotes.push({ id: Math.random().toString(36).substr(2, 9), issueId, userId });
      setStored(STORAGE_KEYS.UPVOTES, upvotes);
      issues[issueIdx].upvoteCount++;
      
      // Notify creator
      if (issues[issueIdx].createdBy !== userId) {
        mockApi.addNotification(
          issues[issueIdx].createdBy,
          'New Endorsement',
          `Your report "${issues[issueIdx].title}" received a new upvote!`,
          'upvote',
          issueId
        );
      }
    }
    setStored(STORAGE_KEYS.ISSUES, issues);
  },

  hasUpvoted: (issueId: string, userId: string) => {
    const upvotes = getStored<Upvote[]>(STORAGE_KEYS.UPVOTES, []);
    return upvotes.some(u => u.issueId === issueId && u.userId === userId);
  },

  // --- Comments ---
  // Fix: Added missing getComments method to resolve errors in IssueDetailScreen.tsx
  getComments: (issueId: string) => {
    const comments = getStored<Comment[]>(STORAGE_KEYS.COMMENTS, []);
    return comments.filter(c => c.issueId === issueId && !c.hidden).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

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

    const issues = getStored<Issue[]>(STORAGE_KEYS.ISSUES, []);
    const issue = issues.find(i => i.id === issueId);
    if (issue && issue.createdBy !== userId) {
      mockApi.addNotification(
        issue.createdBy,
        'New Comment',
        `${userName} commented on your report: "${body.substring(0, 30)}..."`,
        'comment',
        issueId
      );
    }
    return newComment;
  }
};
