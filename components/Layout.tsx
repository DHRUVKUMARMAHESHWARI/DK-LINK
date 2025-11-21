
import React, { useState } from 'react';
import { View, User } from '../types';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Lock, 
  Calendar, 
  Bot, 
  LogOut, 
  Menu, 
  Search,
  Bell,
  ArrowRight,
  Database,
  Trash
} from 'lucide-react';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onSearch: (query: string) => void;
  searchResults: any[];
  onClearCache?: () => void;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 mb-2 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-white/80 text-indigo-600 shadow-md' 
        : 'hover:bg-white/40 text-slate-600 hover:text-slate-800'
    }`}
  >
    <Icon size={20} className="mr-3" />
    <span className="font-medium">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onNavigate, 
  children, 
  user, 
  onLogout,
  onSearch,
  searchResults,
  onClearCache
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onSearch(q);
    setShowResults(!!q);
  };

  const handleResultClick = (view: View) => {
    onNavigate(view);
    setShowResults(false);
    setSearchQuery('');
    setMobileMenuOpen(false); // Close menu if open
  };

  const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'links', label: 'Links Vault', icon: LinkIcon },
    { id: 'passwords', label: 'Password Vault', icon: Lock },
    { id: 'calendar', label: 'Smart Dates', icon: Calendar },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <div className="flex h-[100dvh] overflow-hidden relative bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-100">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[70] w-72 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col h-full p-4 shrink-0
      `}>
        <div className="glass-panel h-full rounded-3xl flex flex-col p-6 shadow-2xl md:shadow-none border border-white/50">
          <div className="flex items-center mb-8 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-indigo-500/30 shrink-0">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-800">Nexus Hub</h1>
              <p className="text-xs text-slate-500 font-medium">Local AI Assistant</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            {navItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200/50">
            <div className="flex items-center p-3 mb-3 bg-white/40 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 mr-3 flex-shrink-0"></div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">Local Account</p>
              </div>
              
              {onClearCache && (
                <button 
                  onClick={onClearCache}
                  title="Clear AI Cache"
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                >
                  <Database size={14} />
                </button>
              )}
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center w-full p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={18} className="mr-3" />
              Disconnect Vault
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Header */}
        <header className="min-h-[80px] flex items-center justify-between px-4 md:px-8 py-4 z-30 gap-3 md:gap-4 shrink-0">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2.5 text-slate-600 glass-panel rounded-xl active:scale-95 transition-transform shrink-0"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-md md:mx-4 relative min-w-0">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none transition-all shadow-sm focus:shadow-md focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                onFocus={() => searchQuery && setShowResults(true)}
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-slate-400 text-center">No results found.</div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result, idx) => (
                      <button 
                        key={idx} 
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center justify-between group border-b border-slate-100 last:border-0"
                        onClick={() => handleResultClick(
                          result.type === 'link' ? 'links' : 
                          result.type === 'password' ? 'passwords' : 'calendar'
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-slate-800 truncate">{result.title || result.site}</p>
                          <p className="text-xs text-slate-500 capitalize mt-0.5">{result.type}</p>
                        </div>
                        <ArrowRight size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="relative p-2.5 text-slate-600 hover:bg-white/60 rounded-full transition-colors glass-panel border-0">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 z-0 scroll-smooth w-full">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
