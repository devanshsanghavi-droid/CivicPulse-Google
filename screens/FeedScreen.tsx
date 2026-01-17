
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
            placeholder="Search issues..." 
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setFilterCat(undefined)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${!filterCat ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${filterCat === cat.id ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{issues.length} issues found</span>
          <select 
            className="bg-transparent font-medium text-blue-600"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="trending">🔥 Trending</option>
            <option value="newest">✨ Newest</option>
            <option value="upvoted">👍 Most Upvoted</option>
          </select>
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
            className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="aspect-[4/3] relative">
              <img src={issue.photos[0]?.url} alt={issue.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <StatusBadge status={issue.status} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] text-blue-600 font-bold uppercase">
                  {CATEGORIES.find(c => c.id === issue.categoryId)?.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-lg leading-tight mb-1">{issue.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">{issue.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm">👍 {issue.upvoteCount}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  📍 {issue.address?.split(',')[0]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {issues.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">🍃</div>
          <p>No issues found. Try a different search or filter.</p>
        </div>
      )}
    </div>
  );
}
