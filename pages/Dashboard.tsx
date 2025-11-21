
import React, { useEffect, useState } from 'react';
import { LinkItem, PasswordItem, CalendarEvent } from '../types';
import { getProductivityTip } from '../services/geminiService';
import { ArrowUpRight, Shield, Clock, Plus, ExternalLink, Sparkles, Quote } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';

interface DashboardProps {
  links: LinkItem[];
  passwords: PasswordItem[];
  events: CalendarEvent[];
  onChangeView: (view: any) => void;
}

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="glass-panel p-5 rounded-2xl flex items-start justify-between relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${color}`}></div>
    <div className="relative z-10">
      <p className="text-slate-500 text-sm font-bold uppercase tracking-wide mb-1 opacity-80">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-2 font-medium">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-slate-700 relative z-10`}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ links, passwords, events, onChangeView }) => {
  const [tip, setTip] = useState<string>("Loading productivity insight...");
  
  useEffect(() => {
    getProductivityTip().then(setTip);
  }, []);

  // Chart Data Preparation
  const linkCategories = links.reduce((acc, link) => {
    acc[link.category] = (acc[link.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(linkCategories).map(key => ({
    name: key,
    value: linkCategories[key]
  }));

  const upcomingEvents = events
    .filter(e => !e.completed && new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const weakPasswords = passwords.filter(p => p.strength === 'Weak').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome & Tip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Good Morning.</h2>
          <p className="text-slate-500 font-medium text-lg">Here is your digital command center overview.</p>
        </div>
        
        {/* Enhanced Quote Component */}
        <div className="relative group max-w-xl w-full lg:w-auto flex-1 lg:flex-none">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>
           <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-2xl flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-2.5 rounded-xl shrink-0 shadow-lg shadow-indigo-500/30">
                 <Quote size={18} fill="currentColor" className="opacity-90" />
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="h-px w-6 bg-indigo-300/50"></span>
                   <p className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 uppercase tracking-widest">Daily Insight</p>
                 </div>
                 <p className="text-slate-700 text-sm font-medium leading-relaxed italic opacity-90">"{tip}"</p>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Links" 
          value={links.length} 
          icon={ArrowUpRight} 
          color="bg-indigo-500"
          subtext={`${links.filter(l => l.clicks > 0).length} active recently`}
        />
        <StatCard 
          title="Password Health" 
          value={`${Math.round(((passwords.length - weakPasswords) / (passwords.length || 1)) * 100)}%`} 
          icon={Shield} 
          color="bg-emerald-500"
          subtext={`${weakPasswords} weak passwords detected`}
        />
        <StatCard 
          title="Pending Tasks" 
          value={upcomingEvents.length} 
          icon={Clock} 
          color="bg-pink-500"
          subtext="Next task in 2 hours"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
        
        {/* Left Col: Link Analytics */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 flex flex-col border border-white/60 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-slate-800">Vault Analytics</h3>
            <button onClick={() => onChangeView('links')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition-colors">
              Manage Links
            </button>
          </div>
          <div className="h-64 w-full">
            {links.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} 
                    contentStyle={{
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
                      padding: '12px',
                      fontFamily: 'inherit'
                    }} 
                  />
                  <Bar dataKey="value" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>No data to visualize.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Upcoming & Quick Actions */}
        <div className="flex flex-col gap-6">
          {/* Upcoming */}
          <div className="glass-panel p-6 rounded-3xl flex-1 border border-white/60 shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-slate-800">Up Next</h3>
              <button onClick={() => onChangeView('calendar')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm">
                  <Clock size={24} className="mb-2 opacity-20" />
                  <p>No upcoming events.</p>
                </div>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center p-3 bg-white/50 rounded-2xl border border-white/50 hover:bg-white transition-colors group">
                    <div className={`w-1.5 h-10 rounded-full mr-3 ${
                      event.type === 'Deadline' ? 'bg-red-400' : 
                      event.type === 'Meeting' ? 'bg-blue-400' : 'bg-emerald-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{event.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-xl shadow-slate-200/40">
             <h3 className="font-bold text-xl text-slate-800 mb-4">Quick Access</h3>
             <div className="space-y-2">
               {links.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Recently added links appear here.</p>
               ) : (
                 links.slice(0, 3).map(link => (
                   <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 hover:bg-white/80 rounded-xl group transition-all hover:shadow-sm border border-transparent hover:border-indigo-50">
                      <div className="flex items-center truncate">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3 shrink-0 border border-indigo-100">
                          {link.title.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[140px] group-hover:text-indigo-700 transition-colors">{link.title}</span>
                      </div>
                      <ExternalLink size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                   </a>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
