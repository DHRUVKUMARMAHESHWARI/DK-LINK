
import React, { useState } from 'react';
import { LinkItem, Category } from '../types';
import { analyzeLink } from '../services/geminiService';
import { ExternalLink, Trash2, Tag, Folder, Plus, Loader2, Search, AlertTriangle } from 'lucide-react';

interface LinksVaultProps {
  links: LinkItem[];
  addLink: (link: LinkItem) => void;
  deleteLink: (id: string) => void;
}

const LinksVault: React.FC<LinksVaultProps> = ({ links, addLink, deleteLink }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Delete Confirmation State
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    setIsAnalyzing(true);
    // Call the improved Gemini service
    const analysis = await analyzeLink(newUrl);
    
    const newItem: LinkItem = {
      id: Date.now().toString(),
      userId: '', // Placeholder, overwritten by App.tsx
      url: newUrl,
      title: analysis.suggestedTitle,
      category: analysis.category,
      tags: analysis.tags,
      clicks: 0,
      createdAt: Date.now(),
    };

    addLink(newItem);
    setIsAnalyzing(false);
    setShowAddModal(false);
    setNewUrl('');
  };

  const confirmDelete = () => {
    if (linkToDelete) {
      deleteLink(linkToDelete);
      setLinkToDelete(null);
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(filter.toLowerCase()) || link.tags.some(t => t.includes(filter.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Links Vault</h2>
          <p className="text-slate-500 text-sm">AI-organized collection of your digital resources.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center shadow-lg shadow-indigo-500/30 transition-all"
        >
          <Plus size={18} className="mr-2" />
          Add Smart Link
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search by title or tag..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass-input rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {['All', ...Object.values(Category)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                ? 'bg-slate-800 text-white' 
                : 'bg-white/40 text-slate-600 hover:bg-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
        {filteredLinks.map(link => (
          <div key={link.id} className="glass-panel p-4 rounded-xl hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-2">
              <div className={`text-xs px-2 py-1 rounded-md font-medium
                ${link.category === Category.WORK ? 'bg-blue-100 text-blue-600' : 
                  link.category === Category.ENTERTAINMENT ? 'bg-purple-100 text-purple-600' : 
                  'bg-slate-100 text-slate-600'}`
              }>
                {link.category}
              </div>
              <button onClick={() => setLinkToDelete(link.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            
            <h3 className="font-bold text-slate-800 mb-1 truncate pr-4">{link.title}</h3>
            <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-indigo-500 truncate block mb-4 flex items-center">
              {link.url} <ExternalLink size={10} className="ml-1" />
            </a>

            <div className="flex flex-wrap gap-2 mt-auto">
              {link.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-white/50 px-2 py-1 rounded-full text-slate-500 border border-white flex items-center">
                  <Tag size={8} className="mr-1" /> {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        {filteredLinks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
            <Folder size={48} className="mb-4 opacity-50" />
            <p>No links found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Resource</h3>
              <form onSubmit={handleAddLink}>
                <label className="block text-sm font-medium text-slate-700 mb-2">Website URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://..." 
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-indigo-500 mb-6"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isAnalyzing}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center disabled:opacity-70"
                  >
                    {isAnalyzing ? <><Loader2 size={18} className="animate-spin mr-2" /> Analyzing...</> : 'Auto-Categorize & Save'}
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-slate-50 px-6 py-3 text-xs text-slate-500 border-t border-slate-100">
              Powered by Gemini. The URL will be sent to Google for analysis.
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {linkToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Link?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to remove this link? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setLinkToDelete(null)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinksVault;
