
import React, { useState } from 'react';
import { LinkItem, Category } from '../types';
import { analyzeLink } from '../services/geminiService';
import { ExternalLink, Trash2, Tag, Folder, Plus, Loader2, Search, AlertTriangle, Copy, Check, Globe, Sparkles } from 'lucide-react';

interface LinksVaultProps {
  links: LinkItem[];
  addLink: (link: LinkItem) => void;
  deleteLink: (id: string) => void;
}

// Visual themes for categories
const CATEGORY_THEMES: Record<string, { bg: string, border: string, text: string, icon: string }> = {
  [Category.WORK]: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-100' },
  [Category.PERSONAL]: { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-100' },
  [Category.ENTERTAINMENT]: { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', text: 'text-pink-700', icon: 'bg-pink-100' },
  [Category.FINANCE]: { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'bg-amber-100' },
  [Category.EDUCATION]: { bg: 'from-cyan-50 to-sky-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'bg-cyan-100' },
  [Category.SOCIAL]: { bg: 'from-purple-50 to-fuchsia-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'bg-purple-100' },
  [Category.OTHER]: { bg: 'from-slate-50 to-gray-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'bg-slate-100' },
};

const LinksVault: React.FC<LinksVaultProps> = ({ links, addLink, deleteLink }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    setIsAnalyzing(true);
    const analysis = await analyzeLink(newUrl);
    
    const newItem: LinkItem = {
      id: Date.now().toString(),
      userId: '', 
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(filter.toLowerCase()) || link.tags.some(t => t.includes(filter.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-8 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Links Vault</h2>
            <p className="text-slate-500 mt-1 font-medium">Curated digital resources library</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto group relative px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center">
              <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Save Link
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Glass Control Bar */}
        <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-3 shadow-sm border border-white/60">
          <div className="relative md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Filter links..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 hover:bg-white/80 focus:bg-white rounded-xl text-sm transition-all outline-none border border-transparent focus:border-indigo-100 focus:shadow-sm"
            />
          </div>
          <div className="flex-1 overflow-x-auto no-scrollbar flex gap-2 items-center pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === 'All' 
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20 scale-105' 
                : 'bg-transparent text-slate-500 hover:bg-white/60'
              }`}
            >
              All
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
            {Object.values(Category).map(cat => {
               const theme = CATEGORY_THEMES[cat] || CATEGORY_THEMES[Category.OTHER];
               const isSelected = selectedCategory === cat;
               return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected 
                    ? `${theme.icon} ${theme.text} border-${theme.border} scale-105 shadow-sm` 
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-white/60'
                  }`}
                >
                  {cat}
                </button>
               );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-24 px-1">
        {filteredLinks.map(link => {
          const theme = CATEGORY_THEMES[link.category] || CATEGORY_THEMES[Category.OTHER];
          
          return (
            <div 
              key={link.id} 
              className={`
                relative group rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden
                bg-gradient-to-br ${theme.bg} ${theme.border} bg-white
              `}
            >
              {/* Preview Background Layer */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none">
                <img 
                  src={`https://image.thum.io/get/width/600/crop/800/noanimate/${link.url}`}
                  alt="preview bg"
                  className="w-full h-full object-cover filter blur-sm scale-110" 
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>

              {/* Floating Thumbnail Preview */}
              <div className="absolute right-4 bottom-16 w-28 h-20 rounded-lg border-2 border-white shadow-xl shadow-slate-500/20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100 z-20 overflow-hidden bg-slate-100 pointer-events-none hidden sm:block">
                <img 
                  src={`https://image.thum.io/get/width/400/crop/600/noanimate/${link.url}`}
                  alt="preview"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Card Header */}
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl ${theme.icon} flex items-center justify-center ${theme.text} shadow-sm group-hover:scale-90 transition-transform`}>
                  <Globe size={20} />
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={(e) => { e.preventDefault(); copyToClipboard(link.url, link.id); }}
                    className="p-2 rounded-lg hover:bg-white/80 text-slate-400 hover:text-indigo-600 transition-colors bg-white/40 backdrop-blur-sm"
                    title="Copy URL"
                  >
                    {copiedId === link.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                  <button 
                    onClick={() => setLinkToDelete(link.id)} 
                    className="p-2 rounded-lg hover:bg-white/80 text-slate-400 hover:text-red-500 transition-colors bg-white/40 backdrop-blur-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4 relative z-10">
                <h3 className="font-bold text-slate-800 leading-snug mb-1 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                  {link.title}
                </h3>
                <div className="flex items-center text-xs text-slate-400 font-medium truncate">
                   <span className="truncate">{new URL(link.url).hostname}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap gap-2 mb-4 min-h-[1.5rem] relative z-10">
                {link.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider font-bold bg-white/60 px-2 py-1 rounded-md text-slate-500 border border-white/40">
                    #{tag}
                  </span>
                ))}
                {link.tags.length > 3 && (
                  <span className="text-[10px] px-1 text-slate-400 py-1">+{link.tags.length - 3}</span>
                )}
              </div>

              <a 
                href={link.url} 
                target="_blank" 
                rel="noreferrer" 
                className={`
                  flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-bold transition-all relative z-10
                  bg-white border border-white/50 text-slate-600 hover:bg-slate-800 hover:text-white hover:shadow-lg
                `}
              >
                Visit Site <ExternalLink size={14} className="ml-2" />
              </a>
            </div>
          );
        })}
        
        {filteredLinks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Folder size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No links found</h3>
            <p className="text-slate-400 max-w-xs mx-auto mb-6">Your vault is empty for this filter. Add a new link to get started.</p>
            <button 
              onClick={() => { setFilter(''); setSelectedCategory('All'); }}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)} />
           
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 border border-white/50">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-2xl font-bold relative z-10">Add Resource</h3>
              <p className="text-indigo-100 text-sm relative z-10">Paste a URL and let AI organize it for you.</p>
            </div>
            
            <div className="p-6 md:p-8">
              <form onSubmit={handleAddLink}>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Website URL</label>
                <div className="relative mb-8">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-100 p-1.5 rounded-md">
                    <Globe size={16} className="text-slate-500" />
                  </div>
                  <input 
                    type="url" 
                    required
                    autoFocus
                    placeholder="https://example.com" 
                    className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-slate-800 shadow-inner"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isAnalyzing}
                    className="px-8 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none"
                  >
                    {isAnalyzing ? <><Loader2 size={18} className="animate-spin mr-2" /> Processing...</> : 'Save to Vault'}
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-slate-50/50 px-8 py-4 flex items-center gap-2 text-[11px] text-slate-400 font-medium border-t border-slate-100">
              <Sparkles size={12} className="text-indigo-400" />
              AI Analysis enabled powered by Gemini 2.5 Flash
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {linkToDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={() => setLinkToDelete(null)} />
          
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Link?</h3>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                This will permanently remove this resource from your vault. This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setLinkToDelete(null)}
                  className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 hover:-translate-y-0.5"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Helper visual: Sparkles icon for the AI note in modal */}
      <div className="hidden">
         <Sparkles />
      </div>
    </div>
  );
};

export default LinksVault;
