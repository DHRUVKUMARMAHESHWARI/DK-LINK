import React, { useEffect, useState } from 'react';
import { LinkItem, PasswordItem, CalendarEvent } from '../types';
import { getProductivityTip } from '../services/geminiService';
import { ArrowUpRight, Shield, Clock, Plus, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';

interface DashboardProps {
  links: LinkItem[];
  passwords: PasswordItem[];
  events: CalendarEvent[];
  onChangeView: (view: any) => void;
}

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="glass-panel p-5 rounded-2xl flex items-start justify-between relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${color}`}></div>
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-slate-700`}>
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

  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b'];

  const upcomingEvents = events
    .filter(e => !e.completed && new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const weakPasswords = passwords.filter(p => p.strength === 'Weak').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome & Tip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Good Morning, User</h2>
          <p className="text-slate-500">Here is what's happening in your digital life today.</p>
        </div>
        <div className="glass-panel py-2 px-4 rounded-full text-sm flex items-center max-w-md">
          <span className="mr-2 text-xl">💡</span>
          <p className="truncate text-slate-600">{tip}</p>
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
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Vault Distribution</h3>
            <button onClick={() => onChangeView('links')} className="text-xs text-indigo-600 font-medium hover:underline">Manage Links</button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.2)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Upcoming & Quick Actions */}
        <div className="flex flex-col gap-6">
          {/* Upcoming */}
          <div className="glass-panel p-6 rounded-2xl flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">Up Next</h3>
              <button onClick={() => onChangeView('calendar')} className="p-1 hover:bg-slate-200 rounded-full"><Plus size={16} /></button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No upcoming events.</p>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center p-3 bg-white/40 rounded-xl border border-white/50">
                    <div className={`w-2 h-10 rounded-full mr-3 ${
                      event.type === 'Deadline' ? 'bg-red-400' : 
                      event.type === 'Meeting' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">{event.title}</h4>
                      <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="font-bold text-lg text-slate-800 mb-4">Recent Activity</h3>
             <div className="space-y-2">
               {links.slice(0, 3).map(link => (
                 <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 hover:bg-white/50 rounded-lg group transition-colors">
                    <div className="flex items-center truncate">
                      <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-2">
                        {link.title.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-600 truncate max-w-[150px]">{link.title}</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-400 opacity-0 group-hover:opacity-100" />
                 </a>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;