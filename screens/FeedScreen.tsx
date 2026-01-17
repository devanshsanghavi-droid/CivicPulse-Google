
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Issue } from '../types';
import { CATEGORIES } from '../constants';
import { useApp } from '../App';

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    open: 'bg-red-100 text-red-700',
    acknowledged: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700'
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
};

export default function FeedScreen() {
  const { setScreen, setSelectedIssueId } = useApp();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sort, setSort] = useState('trending');
  const [filterCat, setFilterCat] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const data = mockApi.getIssues(sort, filterCat);
    const filtered = data.filter(i => 
      i.title.toLowerCase().includes(search.toLowerCase()) || 
      i.description.toLowerCase().includes(search.toLowerCase())
    );
    setIssues(filtered);
  }, [sort, filterCat, search]);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-gray-50/95 backdrop-blur py-2 z-10 space-y-3">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search city issues..." 
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setFilterCat(undefined)}
            className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors font-bold ${!filterCat ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border text-gray-500 hover:bg-gray-50'}`}
          >
            All Reports
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors font-bold ${filterCat === cat.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border text-gray-500 hover:bg-gray-50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-1 uppercase tracking-wider">
          <span>{issues.length} Active {issues.length === 1 ? 'Report' : 'Reports'}</span>
          <div className="flex items-center gap-1 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            <select 
              className="bg-transparent cursor-pointer outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="trending">Trending</option>
              <option value="newest">Recent</option>
              <option value="upvoted">Priority</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {issues.map(issue => (
          <div 
            key={issue.id} 
            onClick={() => {
              setSelectedIssueId(issue.id);
              setScreen('issue-detail');
            }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="aspect-[16/10] relative">
              <img src={issue.photos[0]?.url} alt={issue.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <StatusBadge status={issue.status} />
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                  {CATEGORIES.find(c => c.id === issue.categoryId)?.name}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">
                  {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h3 className="font-bold text-xl leading-snug mb-2 text-gray-900">{issue.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{issue.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-900 font-black text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                  </svg>
                  {issue.upvoteCount}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  {issue.address?.split(',')[0]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {issues.length === 0 && (
        <div className="text-center py-40 text-gray-400 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mb-4 opacity-20">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-sm font-bold uppercase tracking-widest">No matching records found</p>
        </div>
      )}
    </div>
  );
}
