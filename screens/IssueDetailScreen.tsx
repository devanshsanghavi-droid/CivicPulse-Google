
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';
import { Issue, Comment } from '../types';
import { CATEGORIES } from '../constants';

export default function IssueDetailScreen({ id }: { id: string }) {
  const { user, setScreen } = useApp();
  const [issue, setIssue] = useState<Issue | undefined>(mockApi.getIssue(id));
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    if (id) {
      setIssue(mockApi.getIssue(id));
      setComments(mockApi.getComments(id));
      if (user) setHasUpvoted(mockApi.hasUpvoted(id, user.id));
    }
  }, [id, user]);

  const handleUpvote = () => {
    if (!user) return setScreen('login');
    mockApi.toggleUpvote(id, user.id);
    setIssue(mockApi.getIssue(id));
    setHasUpvoted(mockApi.hasUpvoted(id, user.id));
  };

  const handleComment = () => {
    if (!user || !newComment.trim()) return;
    mockApi.addComment(id, user.id, user.name, newComment.trim());
    setComments(mockApi.getComments(id));
    setNewComment('');
  };

  if (!issue) return <div className="p-10 text-center font-bold text-gray-400">Record Not Found</div>;

  return (
    <div className="pb-24 max-w-2xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-3xl md:my-8 md:shadow-sm overflow-hidden border border-gray-100">
      <div className="relative">
        <button 
          onClick={() => setScreen('feed')}
          className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <img src={issue.photos[0]?.url} className="w-full aspect-[16/9] object-cover" alt={issue.title} />
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 block">
              {CATEGORIES.find(c => c.id === issue.categoryId)?.name}
            </span>
            <h1 className="text-3xl font-black leading-tight text-gray-900 tracking-tight">{issue.title}</h1>
          </div>
          <div className="text-right ml-4">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-2 ${
              issue.status === 'resolved' ? 'bg-green-100 text-green-700 border border-green-200' : 
              issue.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {issue.status}
            </span>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {new Date(issue.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed text-lg">{issue.description}</p>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Reported Location</div>
              <div className="text-sm font-bold text-gray-900">{issue.address || 'Standard City Corridor'}</div>
            </div>
          </div>
          <button 
            onClick={() => setScreen('map')}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline px-2 py-1"
          >
            Expand Map
          </button>
        </div>

        {issue.statusNote && (
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6.203c-.099.32-.155.657-.155 1.008 0 5.488 3.99 10.06 9.33 10.815a11.963 11.963 0 0 0 9.33-10.815c0-.351-.056-.688-.155-1.008a11.959 11.959 0 0 1-8.402-4.239Z" />
              </svg>
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Official City Response</h4>
            </div>
            <p className="text-sm text-blue-800 font-medium leading-relaxed">{issue.statusNote}</p>
          </div>
        )}

        <div className="border-t border-gray-100 pt-8">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Activity Logs ({comments.length})</h3>
          
          <div className="space-y-6 mb-10">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl flex-1 text-sm border border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="font-black text-gray-900">{comment.userName}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{comment.body}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <p className="text-xs font-bold uppercase tracking-widest">No participant discussions yet</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-4 bg-white/95 border border-gray-100 rounded-2xl p-2 shadow-xl backdrop-blur flex gap-2">
            <input 
              placeholder="Contribute information..." 
              className="flex-1 px-4 py-3 outline-none text-sm bg-transparent"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button 
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar (Mobile Only Style or Unified) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 px-6 py-4 flex items-center justify-between z-50 md:sticky md:bottom-0 md:border-none md:bg-gray-50 md:px-8">
        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Community Priority</div>
            <div className="text-xl font-black text-gray-900 tracking-tight">{issue.upvoteCount} Endorsements</div>
          </div>
        </div>
        <button 
          onClick={handleUpvote}
          className={`px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            hasUpvoted 
            ? 'bg-green-600 text-white border border-green-700 shadow-md' 
            : 'bg-blue-600 text-white border border-blue-700 shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {hasUpvoted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Verified
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
              </svg>
              Upvote
            </>
          )}
        </button>
      </div>
    </div>
  );
}
