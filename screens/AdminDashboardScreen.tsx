
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
    const topIssues = [...issues].sort((a, b) => b.upvoteCount - a.upvoteCount).slice(0, 10);
    const summary = await geminiService.generateWeeklySummary(topIssues);
    setDigestSummary(summary);
    setIsGenerating(false);
  };

  const handleSendDigest = () => {
    alert(`Digest successfully processed for dissemination.\n\nRecipients: ${recipientEmail}\nSubject: ${customTitle}\n\nContent:\n${digestSummary}`);
    setDigestSummary('');
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-black tracking-tight text-gray-900">Admin Operations</h2>
        <div className="flex gap-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          {(['issues', 'digest', 'reports'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white shadow-sm text-blue-600 border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'issues' && (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {issues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Incident Description</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">Workflow State</th>
                    <th className="px-8 py-5">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {issues.map(issue => (
                    <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-900 text-base mb-0.5">{issue.title}</div>
                        <div className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">{issue.address}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-medium text-gray-600">{issue.categoryId}</span>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                           issue.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' : 
                           issue.status === 'acknowledged' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
                         }`}>
                           {issue.status}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusChange(issue.id, 'acknowledged')}
                            className="text-[10px] bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 transition-all"
                          >
                            Ack
                          </button>
                          <button 
                            onClick={() => handleStatusChange(issue.id, 'resolved')}
                            className="text-[10px] bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all"
                          >
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-100 mb-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Zero incidents to display</p>
            </div>
          )}
        </div>
      )}

      {tab === 'digest' && (
        <div className="space-y-8">
          <div className="bg-blue-600 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
               </svg>
             </div>
             <h3 className="text-3xl font-black mb-3 tracking-tight">Analytical Briefing</h3>
             <p className="text-blue-100 text-lg mb-8 max-w-lg leading-relaxed font-medium">Synthesize high-priority community concerns into a structured briefing for municipal leadership.</p>
             <button 
               onClick={handleGenerateDigest}
               disabled={isGenerating || issues.length === 0}
               className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-3"
             >
               {isGenerating ? (
                 <>
                   <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Synthesizing Data...
                 </>
               ) : (
                 <>
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                   </svg>
                   Initialize Intelligence Report
                 </>
               )}
             </button>
             {issues.length === 0 && <p className="mt-4 text-xs text-blue-200 font-bold uppercase tracking-widest">Insufficient activity data available</p>}
          </div>

          {digestSummary && (
            <div className="bg-white border-2 border-blue-600 p-8 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-gray-900">Communication Review</h4>
              </div>
              
              <div className="grid gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Stakeholders</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-3 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-300 outline-none transition-all"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="E.g. executive@city.gov"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Subject Header</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-3 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-300 outline-none transition-all"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Executive Summary</label>
                  <textarea 
                    rows={10}
                    className="w-full px-5 py-5 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-medium leading-relaxed focus:bg-white focus:border-blue-300 outline-none transition-all"
                    value={digestSummary}
                    onChange={e => setDigestSummary(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button 
                  onClick={handleSendDigest}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                  Confirm & Disseminate Briefing
                </button>
                <button 
                  onClick={() => setDigestSummary('')}
                  className="px-8 py-4 border border-gray-200 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="text-center py-32 bg-white border border-gray-100 border-dashed rounded-3xl flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-100 mb-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6.203c-.099.32-.155.657-.155 1.008 0 5.488 3.99 10.06 9.33 10.815a11.963 11.963 0 0 0 9.33-10.815c0-.351-.056-.688-.155-1.008a11.959 11.959 0 0 1-8.402-4.239Z" />
          </svg>
          <p className="text-sm font-black uppercase tracking-widest text-gray-400">Moderation Queue Empty</p>
        </div>
      )}
    </div>
  );
}
