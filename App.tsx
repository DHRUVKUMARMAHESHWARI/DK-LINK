
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LinksVault from './pages/LinksVault';
import PasswordVault from './pages/PasswordVault';
import SmartCalendar from './pages/SmartCalendar';
import AiAssistant from './pages/AiAssistant';
import { View, User, LinkItem, PasswordItem, CalendarEvent } from './types';
import { X, Loader2, Lock, UserPlus, LogIn } from 'lucide-react';
import { api } from './services/api';

// Toast Component
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center animate-in slide-in-from-bottom-5 z-[100]">
    <span>{message}</span>
    <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white">
      <X size={16} />
    </button>
  </div>
);

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // App Data State
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Search State
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Persistence Check
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch Data on User Change
  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_active_user', JSON.stringify(user));
      loadUserData();
    } else {
      localStorage.removeItem('nexus_active_user');
      setLinks([]);
      setPasswords([]);
      setEvents([]);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      const [fetchedLinks, fetchedPasswords, fetchedEvents] = await Promise.all([
        api.getLinks(user.id),
        api.getPasswords(user.id),
        api.getEvents(user.id)
      ]);
      setLinks(fetchedLinks);
      setPasswords(fetchedPasswords);
      setEvents(fetchedEvents);
    } catch (error) {
      showToast("Failed to load data from vault");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsAuthLoading(true);
    try {
      let authUser;
      if (authMode === 'register') {
        if (!name) throw new Error("Name is required");
        authUser = await api.register(email, password, name);
        showToast("Account created successfully!");
      } else {
        authUser = await api.login(email, password);
        showToast(`Welcome back, ${authUser.name}`);
      }
      setUser(authUser);
    } catch (error: any) {
      showToast(error.message || "Authentication failed");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setEmail('');
    setPassword('');
    setName('');
  };

  // Global Search Handler
  const handleGlobalSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    
    const matchedLinks = links.filter(l => l.title.toLowerCase().includes(q) || l.tags.some(t => t.includes(q))).map(l => ({...l, type: 'link'}));
    const matchedPasswords = passwords.filter(p => p.site.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)).map(p => ({...p, type: 'password'}));
    const matchedEvents = events.filter(e => e.title.toLowerCase().includes(q)).map(e => ({...e, type: 'event'}));

    setSearchResults([...matchedLinks, ...matchedPasswords, ...matchedEvents]);
  };

  // Data Actions
  const addLink = async (link: LinkItem) => {
    if (!user) return;
    const linkWithUser = { ...link, userId: user.id };
    await api.addLink(linkWithUser);
    setLinks(prev => [linkWithUser, ...prev]);
    showToast('Link saved to vault');
  };
  
  const deleteLink = async (id: string) => {
    if (!user) return;
    await api.deleteLink(id, user.id);
    setLinks(prev => prev.filter(l => l.id !== id));
    showToast('Link removed');
  };

  const addPassword = async (pass: PasswordItem) => {
    if (!user) return;
    const passWithUser = { ...pass, userId: user.id };
    await api.addPassword(passWithUser);
    setPasswords(prev => [passWithUser, ...prev]);
    showToast('Password securely saved');
  };

  const deletePassword = async (id: string) => {
    if (!user) return;
    await api.deletePassword(id, user.id);
    setPasswords(prev => prev.filter(p => p.id !== id));
    showToast('Password entry deleted');
  };

  const addEvent = async (event: CalendarEvent) => {
    if (!user) return;
    const eventWithUser = { ...event, userId: user.id };
    await api.addEvent(eventWithUser);
    setEvents(prev => [eventWithUser, ...prev]);
    showToast('Event added to calendar');
  };

  const toggleEvent = async (id: string) => {
    if (!user) return;
    const event = events.find(e => e.id === id);
    if (event) {
      const updated = { ...event, completed: !event.completed };
      await api.updateEvent(updated);
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    await api.deleteEvent(id, user.id);
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Event removed');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
               <Lock size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Nexus Hub</h1>
            <p className="text-slate-500">Your AI-Powered Digital Command Center</p>
          </div>
          
          <div className="flex mb-6 bg-white/50 p-1 rounded-xl">
            <button 
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div className="animate-in slide-in-from-top-2 fade-in">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 rounded-xl bg-white/50 border border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
               <input 
                type="email" 
                required 
                className="w-full p-3 rounded-xl bg-white/50 border border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
               <input 
                type="password" 
                required 
                className="w-full p-3 rounded-xl bg-white/50 border border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 flex justify-center items-center"
            >
              {isAuthLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {authMode === 'login' ? <LogIn size={18} className="mr-2" /> : <UserPlus size={18} className="mr-2" />}
                  {authMode === 'login' ? 'Enter Hub' : 'Create Account'}
                </>
              )}
            </button>
          </form>
          <p className="text-center mt-6 text-xs text-slate-400">
            Secure LocalStorage Encryption • Powered by Gemini AI
          </p>
        </div>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      user={user} 
      onLogout={handleLogout}
      onSearch={handleGlobalSearch}
      searchResults={searchResults}
    >
      {isLoadingData ? (
        <div className="flex items-center justify-center h-[60vh]">
           <div className="flex flex-col items-center">
             <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Decrypting Vault...</p>
           </div>
        </div>
      ) : (
        <>
          {currentView === 'dashboard' && (
            <Dashboard 
              links={links} 
              passwords={passwords} 
              events={events} 
              onChangeView={setCurrentView} 
            />
          )}
          {currentView === 'links' && (
            <LinksVault 
              links={links} 
              addLink={addLink} 
              deleteLink={deleteLink} 
            />
          )}
          {currentView === 'passwords' && (
            <PasswordVault 
              passwords={passwords} 
              addPassword={addPassword} 
              deletePassword={deletePassword} 
            />
          )}
          {currentView === 'calendar' && (
            <SmartCalendar 
              events={events} 
              addEvent={addEvent} 
              toggleEvent={toggleEvent}
              deleteEvent={deleteEvent} 
            />
          )}
          {currentView === 'assistant' && (
            <AiAssistant 
              contextData={{ links, passwords, events }} 
            />
          )}
        </>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </Layout>
  );
};

export default App;
