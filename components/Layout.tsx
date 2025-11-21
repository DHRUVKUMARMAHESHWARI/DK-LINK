
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
  Settings,
  Command
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
    className={`flex items-center w-full p-3 mb-2 rounded-xl transition-all duration-300 font-medium relative overflow-hidden group ${
      active 
        ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100' 
        : 'hover:bg-white/50 text-slate-600 hover:text-slate-900'
    }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
    <Icon size={20} className={`mr-3 transition-transform group-hover:scale-110 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
    <span className="relative z-10">{label}</span>
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
    <div className="flex h-[100dvh] overflow-hidden relative bg-[#f8fafc]">
      {/* Dynamic Background Accents */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/20 blur-[120px]"></div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm md:hidden transition-opacity" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[70] w-72 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col h-full p-4 shrink-0
      `}>
        <div className="glass-panel h-full rounded-[2rem] flex flex-col p-6 shadow-2xl md:shadow-none border border-white/60 bg-white/60 backdrop-blur-2xl relative overflow-hidden">
          <div className="flex items-center mb-10 px-2 relative z-10">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-indigo-500/30 shrink-0">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-slate-800">Nexus Hub</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Personal OS</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar relative z-10">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Menu</div>
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

          <div className="mt-auto pt-6 border-t border-slate-200/60 relative z-10">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Account</div>
            <div className="flex items-center p-3 mb-3 bg-white/50 border border-white rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-400 to-purple-400 mr-3 flex-shrink-0 shadow-sm"></div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">Local Storage</p>
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
              className="flex items-center w-full p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold group"
            >
              <div className="p-1.5 bg-slate-100 group-hover:bg-red-100 rounded-lg mr-3 transition-colors">
                 <LogOut size={16} />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full z-10">
        {/* Header */}
        <header className="min-h-[80px] flex items-center justify-between px-4 md:px-8 py-4 z-30 gap-4 shrink-0">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2.5 text-slate-600 glass-panel rounded-xl active:scale-95 transition-transform shrink-0 shadow-sm"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-md md:mx-4 relative min-w-0">
            <div className="relative w-full group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300 pointer-events-none">
                 <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search vault..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-12 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm hover:shadow focus:shadow-lg focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                onFocus={() => searchQuery && setShowResults(true)}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 bg-white/50 px-1.5 py-0.5 rounded border border-slate-200">/</span>
              </div>
            </div>
            
            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-3 glass-panel rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 border border-white/60">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center text-slate-400">
                    <Search size={24} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">No matching results.</p>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Best Matches</div>
                    {searchResults.map((result, idx) => (
                      <button 
                        key={idx} 
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50/50 flex items-center justify-between group border-b border-slate-50 last:border-0 transition-colors"
                        onClick={() => handleResultClick(
                          result.type === 'link' ? 'links' : 
                          result.type === 'password' ? 'passwords' : 'calendar'
                        )}
                      >
                        <div className="flex items-center overflow-hidden">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${
                             result.type === 'link' ? 'bg-blue-100 text-blue-600' :
                             result.type === 'password' ? 'bg-emerald-100 text-emerald-600' : 'bg-pink-100 text-pink-600'
                           }`}>
                             {result.type === 'link' ? <LinkIcon size={14} /> : result.type === 'password' ? <Lock size={14} /> : <Calendar size={14} />}
                           </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{result.title || result.site}</p>
                            <p className="text-xs text-slate-500 capitalize mt-0.5 font-medium">{result.type}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-indigo-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="relative p-3 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all glass-panel border-0 shadow-sm hover:shadow">
              <Bell size={20} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
             <button className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all glass-panel border-0 shadow-sm hover:shadow hidden sm:block">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 z-0 scroll-smooth w-full">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
