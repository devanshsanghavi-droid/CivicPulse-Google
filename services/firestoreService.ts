// Firestore service — shared cloud database for all users
// Replaces localStorage-based mockApi for issues, comments, and upvotes
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, setDoc,
  query, where, onSnapshot, Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { Issue, Comment, Upvote, IssueStatus, IssuePhoto, LoginRecord, UserRecord, UserRole, BanType } from '../types';
import { TRENDING_WEIGHT_UPVOTES, TRENDING_RECENCY_DAYS } from '../constants';

// Shared trending score calculation
export const calculateTrendingScore = (issue: Issue): number => {
  const daysSince = (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return issue.upvoteCount * TRENDING_WEIGHT_UPVOTES + Math.max(0, TRENDING_RECENCY_DAYS - daysSince);
};

export const firestoreService = {

  // ─── Photo Upload ──────────────────────────────────────────────
  uploadPhoto: async (file: File): Promise<string> => {
    const fileName = `issues/${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // ─── Issues ────────────────────────────────────────────────────
  getIssues: async (
    sort: string = 'trending',
    categoryId?: string,
    status?: string
  ): Promise<Issue[]> => {
    const snapshot = await getDocs(collection(db, 'issues'));
    let issues: Issue[] = snapshot.docs
      .map(d => ({ ...d.data(), id: d.id } as Issue))
      .filter(i => !i.hidden);

    if (categoryId) issues = issues.filter(i => i.categoryId === categoryId);
    if (status) issues = issues.filter(i => i.status === status);

    switch (sort) {
      case 'trending':
        return issues.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
      case 'newest':
        return issues.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'upvoted':
        return issues.sort((a, b) => b.upvoteCount - a.upvoteCount);
      default:
        return issues;
    }
  },

  getIssue: async (id: string): Promise<Issue | undefined> => {
    const snap = await getDoc(doc(db, 'issues', id));
    if (snap.exists()) return { ...snap.data(), id: snap.id } as Issue;
    return undefined;
  },

  createIssue: async (data: Partial<Issue>): Promise<Issue> => {
    const issueData = {
      createdBy: data.createdBy!,
      creatorName: data.creatorName || 'Resident',
      creatorPhotoURL: data.creatorPhotoURL || '',
      title: data.title!,
      description: data.description!,
      categoryId: data.categoryId!,
      status: 'open' as IssueStatus,
      latitude: data.latitude!,
      longitude: data.longitude!,
      address: data.address || 'Unknown Address',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hidden: false,
      upvoteCount: 0,
      photos: data.photos || []
    };
    const docRef = await addDoc(collection(db, 'issues'), issueData);
    return { ...issueData, id: docRef.id } as Issue;
  },

  updateIssueStatus: async (
    id: string,
    status: IssueStatus,
    note?: string
  ): Promise<void> => {
    await updateDoc(doc(db, 'issues', id), {
      status,
      ...(note ? { statusNote: note } : {}),
      updatedAt: new Date().toISOString()
    });
  },

  deleteIssue: async (id: string, deletedByName?: string): Promise<void> => {
    await updateDoc(doc(db, 'issues', id), {
      hidden: true,
      deletedAt: new Date().toISOString(),
      deletedByName: deletedByName || 'Admin',
      updatedAt: new Date().toISOString()
    });
  },

  getDeletedIssues: async (): Promise<Issue[]> => {
    const snapshot = await getDocs(collection(db, 'issues'));
    return snapshot.docs
      .map(d => ({ ...d.data(), id: d.id } as Issue))
      .filter(i => i.hidden)
      .sort((a, b) => new Date(b.deletedAt || b.updatedAt).getTime() - new Date(a.deletedAt || a.updatedAt).getTime());
  },

  restoreIssue: async (id: string): Promise<void> => {
    await updateDoc(doc(db, 'issues', id), {
      hidden: false,
      deletedAt: '',
      deletedByName: '',
      updatedAt: new Date().toISOString()
    });
  },

  getIssuesByUser: async (userId: string): Promise<Issue[]> => {
    const q = query(collection(db, 'issues'), where('createdBy', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(d => ({ ...d.data(), id: d.id } as Issue))
      .filter(i => !i.hidden)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getCommentsByUser: async (userId: string): Promise<Comment[]> => {
    const q = query(collection(db, 'comments'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(d => ({ ...d.data(), id: d.id } as Comment))
      .filter(c => !c.hidden)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // ─── Upvotes ───────────────────────────────────────────────────
  toggleUpvote: async (issueId: string, userId: string): Promise<void> => {
    const q = query(
      collection(db, 'upvotes'),
      where('issueId', '==', issueId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    const issueRef = doc(db, 'issues', issueId);
    const issueSnap = await getDoc(issueRef);
    if (!issueSnap.exists()) return;

    const currentCount = issueSnap.data().upvoteCount || 0;

    if (!snapshot.empty) {
      // Already upvoted → remove
      for (const d of snapshot.docs) await deleteDoc(d.ref);
      await updateDoc(issueRef, { upvoteCount: Math.max(0, currentCount - 1) });
    } else {
      // New upvote
      await addDoc(collection(db, 'upvotes'), { issueId, userId });
      await updateDoc(issueRef, { upvoteCount: currentCount + 1 });
    }
  },

  hasUpvoted: async (issueId: string, userId: string): Promise<boolean> => {
    const q = query(
      collection(db, 'upvotes'),
      where('issueId', '==', issueId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  // ─── Comments ──────────────────────────────────────────────────
  getComments: async (issueId: string): Promise<Comment[]> => {
    const q = query(
      collection(db, 'comments'),
      where('issueId', '==', issueId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(d => ({ ...d.data(), id: d.id } as Comment))
      .filter(c => !c.hidden)
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  addComment: async (
    issueId: string,
    userId: string,
    userName: string,
    body: string,
    userPhotoURL?: string
  ): Promise<Comment> => {
    const commentData = {
      issueId,
      userId,
      userName,
      userPhotoURL: userPhotoURL || '',
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hidden: false
    };
    const docRef = await addDoc(collection(db, 'comments'), commentData);
    return { ...commentData, id: docRef.id } as Comment;
  },

  deleteComment: async (id: string, deletedByName?: string): Promise<void> => {
    await updateDoc(doc(db, 'comments', id), {
      hidden: true,
      deletedAt: new Date().toISOString(),
      deletedByName: deletedByName || 'Admin',
      updatedAt: new Date().toISOString()
    });
  },

  getDeletedComments: async (): Promise<Comment[]> => {
    const snapshot = await getDocs(collection(db, 'comments'));
    return snapshot.docs
      .map(d => ({ ...d.data(), id: d.id } as Comment))
      .filter(c => c.hidden)
      .sort((a, b) => new Date(b.deletedAt || b.updatedAt).getTime() - new Date(a.deletedAt || a.updatedAt).getTime());
  },

  restoreComment: async (id: string): Promise<void> => {
    await updateDoc(doc(db, 'comments', id), {
      hidden: false,
      deletedAt: '',
      deletedByName: '',
      updatedAt: new Date().toISOString()
    });
  },

  // ─── User Stats ────────────────────────────────────────────────
  getUserStats: async (
    userId: string
  ): Promise<{ reportCount: number; upvoteCount: number }> => {
    const q = query(collection(db, 'issues'), where('createdBy', '==', userId));
    const snapshot = await getDocs(q);
    const issues = snapshot.docs.map(d => d.data());
    return {
      reportCount: issues.length,
      upvoteCount: issues.reduce((acc, i) => acc + (i.upvoteCount || 0), 0)
    };
  },

  // ─── Real-time listener (for live feed) ────────────────────────
  subscribeToIssues: (callback: (issues: Issue[]) => void): Unsubscribe => {
    return onSnapshot(collection(db, 'issues'), (snapshot) => {
      const issues = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id } as Issue))
        .filter(i => !i.hidden);
      callback(issues);
    });
  },

  // ─── Login Tracking (for admin dashboard) ──────────────────────
  logLogin: async (data: Omit<LoginRecord, 'id'>): Promise<void> => {
    await addDoc(collection(db, 'logins'), data);
  },

  getLoginHistory: async (limit: number = 50): Promise<LoginRecord[]> => {
    const snapshot = await getDocs(collection(db, 'logins'));
    return snapshot.docs
      .map(d => ({ ...d.data(), id: d.id } as LoginRecord))
      .sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime())
      .slice(0, limit);
  },

  // ─── User Management (ban, promote, etc.) ───────────────────────
  upsertUserRecord: async (data: Omit<UserRecord, 'id'>& { id: string }): Promise<void> => {
    const userRef = doc(db, 'users', data.id);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      // Only update lastLoginAt + name/photo, preserve role & ban status
      await updateDoc(userRef, {
        name: data.name,
        photoURL: data.photoURL || '',
        lastLoginAt: data.lastLoginAt
      });
    } else {
      // Brand new user — default role: resident, no ban
      await setDoc(userRef, {
        email: data.email,
        name: data.name,
        photoURL: data.photoURL || '',
        role: 'resident' as UserRole,
        banType: 'none' as BanType,
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt
      });
    }
  },

  getUserRecord: async (userId: string): Promise<UserRecord | null> => {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) return { ...snap.data(), id: snap.id } as UserRecord;
    return null;
  },

  getUserRecordByEmail: async (email: string): Promise<UserRecord | null> => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { ...d.data(), id: d.id } as UserRecord;
  },

  setUserRole: async (userId: string, role: UserRole): Promise<void> => {
    await updateDoc(doc(db, 'users', userId), { role });
  },

  /**
   * Ban a user. For temporary bans, pass durationHours.
   * For permanent bans, omit durationHours.
   */
  banUser: async (userId: string, banType: BanType, reason?: string, durationHours?: number): Promise<void> => {
    const now = new Date();
    const updates: Record<string, any> = {
      banType,
      bannedAt: now.toISOString(),
      banReason: reason || ''
    };
    if (banType === 'temporary' && durationHours) {
      const expiry = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
      updates.bannedUntil = expiry.toISOString();
    } else if (banType === 'permanent') {
      updates.bannedUntil = '';
    }
    await updateDoc(doc(db, 'users', userId), updates);
  },

  unbanUser: async (userId: string): Promise<void> => {
    await updateDoc(doc(db, 'users', userId), {
      banType: 'none',
      bannedAt: '',
      bannedUntil: '',
      banReason: ''
    });
  },

  /**
   * Check if a user is currently banned. Handles expired temporary bans automatically.
   * Returns { banned: true, reason, expiresAt } or { banned: false }
   */
  checkBanStatus: async (userId: string): Promise<{ banned: boolean; reason?: string; expiresAt?: string; type?: BanType }> => {
    const userRec = await firestoreService.getUserRecord(userId);
    if (!userRec || userRec.banType === 'none') return { banned: false };

    if (userRec.banType === 'permanent') {
      return { banned: true, reason: userRec.banReason, type: 'permanent' };
    }

    if (userRec.banType === 'temporary' && userRec.bannedUntil) {
      const expiryDate = new Date(userRec.bannedUntil);
      if (expiryDate > new Date()) {
        return { banned: true, reason: userRec.banReason, expiresAt: userRec.bannedUntil, type: 'temporary' };
      } else {
        // Ban expired, auto-unban
        await firestoreService.unbanUser(userId);
        return { banned: false };
      }
    }

    return { banned: false };
  },

  getAllUserRecords: async (): Promise<UserRecord[]> => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as UserRecord));
  },

  /**
   * Get all currently banned users (temporary + permanent).
   * Auto-unbans expired temporary bans before returning.
   */
  getBannedUsers: async (): Promise<UserRecord[]> => {
    const q = query(collection(db, 'users'), where('banType', 'in', ['temporary', 'permanent']));
    const snapshot = await getDocs(q);
    const bannedUsers: UserRecord[] = [];
    const now = new Date();

    for (const d of snapshot.docs) {
      const rec = { ...d.data(), id: d.id } as UserRecord;
      // Auto-unban expired temp bans
      if (rec.banType === 'temporary' && rec.bannedUntil && new Date(rec.bannedUntil) <= now) {
        await firestoreService.unbanUser(rec.id);
        continue;
      }
      bannedUsers.push(rec);
    }
    return bannedUsers;
  }
};
