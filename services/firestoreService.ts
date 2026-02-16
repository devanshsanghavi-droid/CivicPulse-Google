// Firestore service — shared cloud database for all users
// Replaces localStorage-based mockApi for issues, comments, and upvotes
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, onSnapshot, Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { Issue, Comment, Upvote, IssueStatus, IssuePhoto } from '../types';
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
    body: string
  ): Promise<Comment> => {
    const commentData = {
      issueId,
      userId,
      userName,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hidden: false
    };
    const docRef = await addDoc(collection(db, 'comments'), commentData);
    return { ...commentData, id: docRef.id } as Comment;
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
  }
};
