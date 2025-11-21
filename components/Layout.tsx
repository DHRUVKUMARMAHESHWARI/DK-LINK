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
  ArrowRight
} from 'lucide-react';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onSearch: (query: string) => void;
  searchResults: any[];
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
  searchResults 
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
  };

  const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'links', label: 'Links Vault', icon: LinkIcon },
    { id: 'passwords', label: 'Password Vault', icon: Lock },
    { id: 'calendar', label: 'Smart Dates', icon: Calendar },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <div className="flex min-h-screen overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col h-screen p-4
      `}>
        <div className="glass-panel h-full rounded-3xl flex flex-col p-4">
          <div className="flex items-center mb-8 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-indigo-500/30">
              <Bot />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-800">Nexus Hub</h1>
              <p className="text-xs text-slate-500">AI Personal Assistant</p>
            </div>
          </div>

          <nav className="flex-1">
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

          <div className="mt-auto pt-4 border-t border-slate-200/50">
            <div className="flex items-center p-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 mr-3"></div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">Pro Member</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center w-full p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-8 pt-4 pb-2 z-30">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 glass-panel rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Universal search..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm focus:outline-none transition-all"
                onFocus={() => searchQuery && setShowResults(true)}
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-slate-400 text-center">No results found.</div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result, idx) => (
                      <button 
                        key={idx} 
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center justify-between group"
                        onClick={() => handleResultClick(
                          result.type === 'link' ? 'links' : 
                          result.type === 'password' ? 'passwords' : 'calendar'
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{result.title || result.site}</p>
                          <p className="text-xs text-slate-500 capitalize">{result.type}</p>
                        </div>
                        <ArrowRight size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 hover:bg-white/40 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 z-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;