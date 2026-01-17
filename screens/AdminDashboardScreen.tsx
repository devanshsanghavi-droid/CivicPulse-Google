
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { geminiService } from '../services/geminiService';
import { Issue, IssueStatus } from '../types';

export default function AdminDashboardScreen() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tab, setTab] = useState<'issues' | 'digest' | 'reports'>('issues');
  const [digestSummary, setDigestSummary] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('cityissues@losaltos.gov');
  const [customTitle, setCustomTitle] = useState('Weekly CivicPulse Infrastructure Briefing');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIssues(mockApi.getIssues('newest'));
  }, []);

  const handleStatusChange = (id: string, status: IssueStatus) => {
    const note = window.prompt("Add a public status note (optional):");
    mockApi.updateIssueStatus(id, status, note || undefined);
    setIssues(mockApi.getIssues('newest'));
  };

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    // Take top 10 issues for the briefing
    const topIssues = [...issues].sort((a, b) => b.upvoteCount - a.upvoteCount).slice(0, 10);
    const summary = await geminiService.generateWeeklySummary(topIssues);
    setDigestSummary(summary);
    setIsGenerating(false);
  };

  const handleSendDigest = () => {
    alert(`Digest sent!\n\nTo: ${recipientEmail}\nSubject: ${customTitle}\n\nMessage:\n${digestSummary}`);
    setDigestSummary('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['issues', 'digest', 'reports'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${tab === t ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'issues' && (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          {issues.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {issues.map(issue => (
                  <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{issue.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{issue.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs">{issue.categoryId}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                         issue.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                         issue.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {issue.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusChange(issue.id, 'acknowledged')}
                          className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded border border-yellow-100 font-medium"
                        >
                          Ack
                        </button>
                        <button 
                          onClick={() => handleStatusChange(issue.id, 'resolved')}
                          className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100 font-medium"
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-400">
              No issues reported yet.
            </div>
          )}
        </div>
      )}

      {tab === 'digest' && (
        <div className="space-y-6">
          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl">
             <h3 className="text-xl font-bold mb-2">Weekly City Digest</h3>
             <p className="text-blue-100 text-sm mb-6">Create a summary of the top-priority issues to share with council members or city departments.</p>
             <button 
               onClick={handleGenerateDigest}
               disabled={isGenerating || issues.length === 0}
               className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
             >
               {isGenerating ? 'Analyzing Trends...' : '✨ Generate Smart Briefing'}
             </button>
             {issues.length === 0 && <p className="mt-2 text-xs text-blue-200 italic">No issues available to summarize.</p>}
          </div>

          {digestSummary && (
            <div className="bg-white border-2 border-blue-500 p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <h4 className="font-bold text-lg">Customize & Send Digest</h4>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Recipient Email(s)</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border rounded-xl text-sm"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="E.g. manager@city.gov, council@city.gov"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subject</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border rounded-xl text-sm"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Briefing Message</label>
                  <textarea 
                    rows={8}
                    className="w-full px-4 py-3 border rounded-xl text-sm leading-relaxed"
                    value={digestSummary}
                    onChange={e => setDigestSummary(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSendDigest}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Send Briefing to All Recipients
                </button>
                <button 
                  onClick={() => setDigestSummary('')}
                  className="px-6 py-3 border rounded-xl font-bold text-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="text-center py-20 bg-white border rounded-2xl border-dashed">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-gray-400">All caught up! No active content reports.</p>
        </div>
      )}
    </div>
  );
}
