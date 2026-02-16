
import React, { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Issue, IssueStatus, LoginRecord, Comment } from '../types';
import { CATEGORIES, CITY_NAME } from '../constants';

// ─── User Profile Modal ───────────────────────────────────────────
function UserProfileModal({ 
  userId, email, name, photoURL, loginHistory, 
  onClose 
}: { 
  userId: string; email: string; name: string; photoURL?: string; loginHistory: LoginRecord[];
  onClose: () => void;
}) {
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const userLogins = loginHistory.filter(l => l.email === email);
  const firstSeen = userLogins.length > 0 
    ? userLogins[userLogins.length - 1].loginAt 
    : null;
  const lastSeen = userLogins.length > 0 
    ? userLogins[0].loginAt 
    : null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // We need to find issues by this user. Since userId might vary (localStorage IDs),
        // we search by creatorName or iterate all issues. But we have the userId from login records.
        const [issues, comments] = await Promise.all([
          firestoreService.getIssuesByUser(userId),
          firestoreService.getCommentsByUser(userId)
        ]);
        setUserIssues(issues);
        setUserComments(comments);
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 rounded-t-3xl flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {photoURL ? (
              <img src={photoURL} alt={name} className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">{name}</h3>
              <p className="text-sm text-gray-400 font-medium">{email}</p>
              {email.toLowerCase() === 'notdev42@gmail.com' && (
                <span className="text-[8px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 mt-1 inline-block">Super Admin</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-blue-600">{userLogins.length}</div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Logins</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-green-600">{userIssues.length}</div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Reports</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-orange-600">{userComments.length}</div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Comments</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-purple-600">{userIssues.reduce((a, i) => a + i.upvoteCount, 0)}</div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Upvotes</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex gap-6 text-xs">
            {firstSeen && (
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block mb-1">First Seen</span>
                <span className="font-bold text-gray-700">{new Date(firstSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
            {lastSeen && (
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block mb-1">Last Active</span>
                <span className="font-bold text-gray-700">{new Date(lastSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(lastSeen).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>

          {/* User's Reports */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Reports by {name.split(' ')[0]}</h4>
            {loading ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            ) : userIssues.length > 0 ? (
              <div className="space-y-3">
                {userIssues.map(issue => (
                  <div key={issue.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-4">
                    {issue.photos[0]?.url && (
                      <img src={issue.photos[0].url} alt="" className="w-16 h-12 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900 truncate">{issue.title}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${
                          issue.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' : 
                          issue.status === 'acknowledged' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>{issue.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{issue.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-medium">
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        <span>{issue.upvoteCount} upvotes</span>
                        <span>{CATEGORIES.find(c => c.id === issue.categoryId)?.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-medium py-4 text-center">No reports from this user</p>
            )}
          </div>

          {/* User's Comments */}
          {userComments.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Comments by {name.split(' ')[0]}</h4>
              <div className="space-y-2">
                {userComments.slice(0, 10).map(c => (
                  <div key={c.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm">
                    <p className="text-gray-700 leading-relaxed">{c.body}</p>
                    <span className="text-[10px] text-gray-400 font-medium mt-1 block">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
                {userComments.length > 10 && (
                  <p className="text-[10px] text-gray-400 font-bold text-center">+ {userComments.length - 10} more comments</p>
                )}
              </div>
            </div>
          )}

          {/* Login History for this user */}
          {userLogins.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Login Sessions ({userLogins.length})</h4>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {userLogins.slice(0, 20).map((l, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">
                      {new Date(l.loginAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(l.loginAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium truncate max-w-[200px]" title={l.userAgent}>
                      {l.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────
export default function AdminDashboardScreen() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tab, setTab] = useState<'issues' | 'digest' | 'details'>('issues');
  const [digestHtml, setDigestHtml] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('cityissues@losaltos.gov');
  const [customTitle, setCustomTitle] = useState('Weekly CivicPulse Infrastructure Briefing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [loadingLogins, setLoadingLogins] = useState(false);
  const [issueFilter, setIssueFilter] = useState<'all' | IssueStatus>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // User profile modal
  const [selectedUser, setSelectedUser] = useState<{ userId: string; email: string; name: string; photoURL?: string } | null>(null);

  const refreshIssues = async () => {
    try {
      setIssues(await firestoreService.getIssues('newest'));
    } catch (err) {
      console.error('Failed to load issues:', err);
    }
  };

  useEffect(() => {
    refreshIssues();
  }, []);

  useEffect(() => {
    if (tab === 'details') {
      const loadLogins = async () => {
        setLoadingLogins(true);
        try {
          setLoginHistory(await firestoreService.getLoginHistory(200));
        } catch (err) {
          console.error('Failed to load login history:', err);
        } finally {
          setLoadingLogins(false);
        }
      };
      loadLogins();
    }
  }, [tab]);

  // Derived data
  const filteredIssues = issueFilter === 'all' ? issues : issues.filter(i => i.status === issueFilter);
  const openCount = issues.filter(i => i.status === 'open').length;
  const ackCount = issues.filter(i => i.status === 'acknowledged').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const totalUpvotes = issues.reduce((a, i) => a + i.upvoteCount, 0);
  const uniqueUsers = new Set(loginHistory.map(l => l.email)).size;

  const handleStatusChange = async (id: string, status: IssueStatus) => {
    const note = window.prompt("Add a public status note (optional):");
    try {
      await firestoreService.updateIssueStatus(id, status, note || undefined);
      await refreshIssues();
    } catch (err) {
      console.error('Failed to update issue status:', err);
    }
  };

  const handleDeleteIssue = async (id: string) => {
    try {
      await firestoreService.deleteIssue(id);
      setConfirmDelete(null);
      await refreshIssues();
    } catch (err) {
      console.error('Failed to delete issue:', err);
    }
  };

  // ─── Professional Digest Generator ─────────────────────────────
  const handleGenerateDigest = () => {
    setIsGenerating(true);
    const topIssues = [...issues].sort((a, b) => b.upvoteCount - a.upvoteCount).slice(0, 10);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateRange = `${weekAgo.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} — ${now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;

    const statusColor = (s: string) => s === 'resolved' ? '#059669' : s === 'acknowledged' ? '#d97706' : '#dc2626';
    const statusBg = (s: string) => s === 'resolved' ? '#ecfdf5' : s === 'acknowledged' ? '#fffbeb' : '#fef2f2';

    const issueRows = topIssues.map((issue, idx) => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 16px 20px; vertical-align: top;">
          <div style="font-weight: 700; color: #111827; font-size: 14px; margin-bottom: 4px;">${idx + 1}. ${issue.title}</div>
          <div style="color: #6b7280; font-size: 12px; line-height: 1.5;">${issue.description.substring(0, 120)}${issue.description.length > 120 ? '...' : ''}</div>
          <div style="margin-top: 8px;">
            <span style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 9999px; background: ${statusBg(issue.status)}; color: ${statusColor(issue.status)};">${issue.status}</span>
            <span style="font-size: 11px; color: #9ca3af; margin-left: 8px;">${CATEGORIES.find(c => c.id === issue.categoryId)?.name || 'General'}</span>
          </div>
        </td>
        <td style="padding: 16px 20px; text-align: center; vertical-align: top;">
          <div style="font-size: 20px; font-weight: 800; color: #2563eb;">${issue.upvoteCount}</div>
          <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">votes</div>
        </td>
        <td style="padding: 16px 20px; text-align: right; vertical-align: top; white-space: nowrap;">
          <div style="font-size: 12px; color: #6b7280; font-weight: 500;">${new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
          <div style="font-size: 11px; color: #9ca3af;">${issue.creatorName}</div>
        </td>
      </tr>`).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center;">
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.6); margin-bottom: 12px;">City of ${CITY_NAME}</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: white; letter-spacing: -0.02em;">Weekly Infrastructure Briefing</h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.7);">${dateRange}</p>
    </div>

    <!-- Summary Cards -->
    <div style="background: white; padding: 24px 32px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; text-align: center; width: 25%;">
            <div style="font-size: 28px; font-weight: 900; color: #dc2626;">${openCount}</div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-top: 2px;">Open</div>
          </td>
          <td style="padding: 12px; text-align: center; width: 25%;">
            <div style="font-size: 28px; font-weight: 900; color: #d97706;">${ackCount}</div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-top: 2px;">In Progress</div>
          </td>
          <td style="padding: 12px; text-align: center; width: 25%;">
            <div style="font-size: 28px; font-weight: 900; color: #059669;">${resolvedCount}</div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-top: 2px;">Resolved</div>
          </td>
          <td style="padding: 12px; text-align: center; width: 25%;">
            <div style="font-size: 28px; font-weight: 900; color: #2563eb;">${totalUpvotes}</div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-top: 2px;">Votes</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Separator -->
    <div style="background: white; padding: 0 32px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0;">
    </div>

    <!-- Issues Table -->
    <div style="background: white; padding: 24px 0; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
      <div style="padding: 0 32px 16px;">
        <h2 style="margin: 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #9ca3af;">Top Priority Issues</h2>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${issueRows || '<tr><td style="padding: 32px; text-align: center; color: #9ca3af; font-size: 13px;">No issues reported this period.</td></tr>'}
      </table>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.6;">
        Generated by <strong style="color: #6b7280;">CivicPulse</strong> — Community Infrastructure Monitoring<br>
        This is an automated briefing. Please do not reply to this email.
      </p>
    </div>

  </div>
</body>
</html>`;

    setDigestHtml(html);
    setIsGenerating(false);
  };

  const handleSendDigest = () => {
    // Copy to clipboard as a fallback since we can't actually send email
    navigator.clipboard?.writeText(digestHtml).then(() => {
      alert(`Digest HTML copied to clipboard!\n\nRecipient: ${recipientEmail}\nSubject: ${customTitle}\n\nPaste this into your email client or mail service.`);
    }).catch(() => {
      alert(`Digest ready for: ${recipientEmail}\nSubject: ${customTitle}`);
    });
  };

  const tabLabels: Record<string, string> = { issues: 'Issues', digest: 'Digest', details: 'Details' };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Admin Console</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{issues.length} reports &middot; {uniqueUsers} users &middot; {loginHistory.length} sessions</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          {(['issues', 'digest', 'details'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white shadow-sm text-blue-600 border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ISSUES TAB ────────────────────────────────────────────── */}
      {tab === 'issues' && (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: issues.length, color: 'text-gray-900', filter: 'all' as const },
              { label: 'Open', value: openCount, color: 'text-red-600', filter: 'open' as const },
              { label: 'Acknowledged', value: ackCount, color: 'text-yellow-600', filter: 'acknowledged' as const },
              { label: 'Resolved', value: resolvedCount, color: 'text-green-600', filter: 'resolved' as const },
              { label: 'Total Votes', value: totalUpvotes, color: 'text-blue-600', filter: 'all' as const },
            ].map((s, i) => (
              <button
                key={i}
                onClick={() => i < 4 ? setIssueFilter(s.filter) : null}
                className={`bg-white border p-4 rounded-2xl text-center shadow-sm transition-all ${
                  i < 4 && issueFilter === s.filter ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`text-2xl font-black ${s.color} tracking-tight`}>{s.value}</div>
                <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">{s.label}</div>
              </button>
            ))}
          </div>

          {/* Issues List */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            {filteredIssues.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {filteredIssues.map(issue => (
                  <div key={issue.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Photo thumbnail */}
                      {issue.photos[0]?.url ? (
                        <img src={issue.photos[0].url} alt="" className="w-16 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                      ) : (
                        <div className="w-16 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{issue.title}</h4>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${
                            issue.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' : 
                            issue.status === 'acknowledged' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
                          }`}>{issue.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-2">{issue.description}</p>
                        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium flex-wrap">
                          <span className="flex items-center gap-1">
                            {issue.creatorPhotoURL ? (
                              <img src={issue.creatorPhotoURL} alt="" className="w-4 h-4 rounded-full object-cover" />
                            ) : null}
                            {issue.creatorName}
                          </span>
                          <span>{CATEGORIES.find(c => c.id === issue.categoryId)?.name}</span>
                          <span>{new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <span>{issue.upvoteCount} votes</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {issue.status !== 'acknowledged' && (
                          <button 
                            onClick={() => handleStatusChange(issue.id, 'acknowledged')}
                            className="text-[9px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 transition-all"
                            title="Acknowledge"
                          >
                            Ack
                          </button>
                        )}
                        {issue.status !== 'resolved' && (
                          <button 
                            onClick={() => handleStatusChange(issue.id, 'resolved')}
                            className="text-[9px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all"
                            title="Resolve"
                          >
                            Resolve
                          </button>
                        )}
                        {confirmDelete === issue.id ? (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleDeleteIssue(issue.id)}
                              className="text-[9px] bg-red-600 text-white px-2.5 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setConfirmDelete(null)}
                              className="text-[9px] bg-white border border-gray-200 text-gray-500 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmDelete(issue.id)}
                            className="text-[9px] bg-white border border-gray-200 text-gray-400 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-200 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {issueFilter === 'all' ? 'No reports yet' : `No ${issueFilter} reports`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── DIGEST TAB ────────────────────────────────────────────── */}
      {tab === 'digest' && (
        <div className="space-y-6">
          {/* Config + Generate */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-900 tracking-tight">Weekly Email Digest</h3>
                <p className="text-xs text-gray-400 font-medium">Generate a professional briefing for city leadership</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recipient Email</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-300 outline-none transition-all"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="E.g. executive@city.gov"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject Line</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-300 outline-none transition-all"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleGenerateDigest}
              disabled={isGenerating || issues.length === 0}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                  Generate Briefing
                </>
              )}
            </button>
            {issues.length === 0 && <p className="text-[10px] text-gray-400 font-bold">No reports available to include in the digest.</p>}
          </div>

          {/* Email Preview */}
          {digestHtml && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email Preview</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSendDigest}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    Copy HTML
                  </button>
                  <button 
                    onClick={() => setDigestHtml('')}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
              <div className="bg-gray-100 rounded-3xl p-6 border border-gray-200">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                  <iframe 
                    srcDoc={digestHtml}
                    className="w-full border-0"
                    style={{ height: '600px' }}
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── DETAILS TAB ───────────────────────────────────────────── */}
      {tab === 'details' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl text-center shadow-sm">
              <div className="text-3xl font-black text-blue-600 tracking-tight">{loginHistory.length}</div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Total Sessions</div>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl text-center shadow-sm">
              <div className="text-3xl font-black text-green-600 tracking-tight">{uniqueUsers}</div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Unique Users</div>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl text-center shadow-sm">
              <div className="text-3xl font-black text-purple-600 tracking-tight">{issues.length}</div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Total Reports</div>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl text-center shadow-sm">
              <div className="text-3xl font-black text-orange-600 tracking-tight">{totalUpvotes}</div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Total Votes</div>
            </div>
          </div>

          {/* Unique Users Table */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Registered Users</h3>
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              {loadingLogins ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading user data...</p>
                </div>
              ) : (() => {
                // Deduplicate users by email, picking the most recent login for each
                const userMap = new Map<string, LoginRecord>();
                loginHistory.forEach(l => {
                  const existing = userMap.get(l.email);
                  if (!existing || new Date(l.loginAt) > new Date(existing.loginAt)) {
                    userMap.set(l.email, l);
                  }
                });
                const uniqueUserList = Array.from(userMap.values())
                  .sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime());

                return uniqueUserList.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {uniqueUserList.map((user) => {
                      const loginCount = loginHistory.filter(l => l.email === user.email).length;
                      const userIssueCount = issues.filter(i => i.createdBy === user.userId).length;
                      return (
                        <button
                          key={user.email}
                          onClick={() => setSelectedUser({ userId: user.userId, email: user.email, name: user.name, photoURL: user.photoURL })}
                          className="w-full px-6 py-4 flex items-center gap-4 hover:bg-blue-50/50 transition-colors text-left group"
                        >
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-11 h-11 rounded-xl object-cover border border-gray-200 flex-shrink-0 group-hover:border-blue-300 transition-colors" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:border-blue-300 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</span>
                              {user.email.toLowerCase() === 'notdev42@gmail.com' && (
                                <span className="text-[8px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Admin</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-medium truncate block">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-center hidden md:block">
                              <div className="text-sm font-black text-gray-900">{loginCount}</div>
                              <div className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Logins</div>
                            </div>
                            <div className="text-center hidden md:block">
                              <div className="text-sm font-black text-gray-900">{userIssueCount}</div>
                              <div className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Reports</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-gray-600">
                                {new Date(user.loginAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium">
                                {new Date(user.loginAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-16 text-center flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-200 mb-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No users yet</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Recent Login Activity */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Recent Login Activity</h3>
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              {loginHistory.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                  {loginHistory.slice(0, 50).map((login) => (
                    <div key={login.id} className="px-6 py-3 flex items-center gap-3 text-xs">
                      {login.photoURL ? (
                        <img src={login.photoURL} alt="" className="w-7 h-7 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex-shrink-0" />
                      )}
                      <span className="font-bold text-gray-700 truncate flex-1">{login.name}</span>
                      <span className="text-gray-400 font-medium hidden md:inline">{login.email}</span>
                      <span className="text-gray-400 font-medium flex-shrink-0">
                        {new Date(login.loginAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {new Date(login.loginAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[9px] text-gray-300 font-medium flex-shrink-0 hidden md:inline">
                        {login.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No login activity yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── User Profile Modal ────────────────────────────────────── */}
      {selectedUser && (
        <UserProfileModal
          userId={selectedUser.userId}
          email={selectedUser.email}
          name={selectedUser.name}
          photoURL={selectedUser.photoURL}
          loginHistory={loginHistory}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
