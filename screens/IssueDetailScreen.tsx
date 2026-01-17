
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

  if (!issue) return <div className="p-10 text-center">Issue not found.</div>;

  return (
    <div className="pb-24">
      <div className="relative">
        <button 
          onClick={() => setScreen('feed')}
          className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur w-10 h-10 rounded-full shadow flex items-center justify-center font-bold"
        >
          ←
        </button>
        <img src={issue.photos[0]?.url} className="w-full aspect-video object-cover" alt={issue.title} />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-600 mb-1 block">
              {CATEGORIES.find(c => c.id === issue.categoryId)?.name}
            </span>
            <h1 className="text-2xl font-bold leading-tight">{issue.title}</h1>
          </div>
          <div className="text-right">
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg inline-block mb-1 ${
              issue.status === 'resolved' ? 'bg-green-100 text-green-700' : 
              issue.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {issue.status}
            </span>
            <div className="text-[10px] text-gray-400">Reported {new Date(issue.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-wrap">{issue.description}</p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center text-xl">📍</div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">Location</div>
              <div className="text-sm font-medium">{issue.address || 'Los Altos Area'}</div>
            </div>
          </div>
          <button className="text-xs font-bold text-blue-600 uppercase">View Map</button>
        </div>

        {issue.statusNote && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-8">
            <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">City Official Note</h4>
            <p className="text-sm text-blue-800">{issue.statusNote}</p>
          </div>
        )}

        <div className="border-t pt-8">
          <h3 className="text-lg font-bold mb-4">Comments ({comments.length})</h3>
          
          <div className="space-y-4 mb-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="bg-gray-50 p-3 rounded-2xl flex-1 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">{comment.userName}</span>
                    <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600">{comment.body}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-gray-400 text-sm py-4">No comments yet. Be the first to add context.</p>}
          </div>

          <div className="sticky bottom-4 bg-white border rounded-2xl p-2 shadow-lg flex gap-2 mx-[-8px]">
            <input 
              placeholder="Add a comment..." 
              className="flex-1 px-4 py-2 outline-none text-sm"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button 
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t px-6 py-4 flex items-center justify-between z-50 md:hidden">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs font-bold text-gray-400 uppercase">Priority</div>
            <div className="text-lg font-bold">{issue.upvoteCount} votes</div>
          </div>
        </div>
        <button 
          onClick={handleUpvote}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${
            hasUpvoted ? 'bg-green-600 text-white' : 'bg-blue-600 text-white scale-105 shadow-lg shadow-blue-200'
          }`}
        >
          {hasUpvoted ? '✓ Upvoted' : '👍 Upvote'}
        </button>
      </div>
    </div>
  );
}
