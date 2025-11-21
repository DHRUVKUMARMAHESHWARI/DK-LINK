
import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { parseNaturalLanguageEvent } from '../services/geminiService';
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, Clock, Sparkles, Loader2, AlertTriangle } from 'lucide-react';

interface SmartCalendarProps {
  events: CalendarEvent[];
  addEvent: (e: CalendarEvent) => void;
  toggleEvent: (id: string) => void;
  deleteEvent: (id: string) => void;
}

const SmartCalendar: React.FC<SmartCalendarProps> = ({ events, addEvent, toggleEvent, deleteEvent }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('Reminder');
  
  // Delete Confirmation State
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  // AI Quick Add State
  const [aiInput, setAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({
      id: Date.now().toString(),
      userId: '', // Placeholder, overwritten by App.tsx
      title,
      date: new Date(date).toISOString(),
      type,
      completed: false
    });
    setShowModal(false);
    setTitle(''); setDate('');
  };

  const handleAiQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsAiProcessing(true);
    const result = await parseNaturalLanguageEvent(aiInput);
    
    if (result && result.title && result.date && result.type) {
      addEvent({
        id: Date.now().toString(),
        userId: '', // Placeholder, overwritten by App.tsx
        title: result.title,
        date: result.date,
        type: result.type as any,
        completed: false
      });
      setAiInput('');
    } else {
      alert("Could not understand the event. Please try again or use manual add.");
    }
    setIsAiProcessing(false);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete);
      setEventToDelete(null);
    }
  };

  // Group by Date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Smart Dates & Tasks</h2>
          <p className="text-slate-500 text-sm">Your timeline, organized by priority.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30 transition-all"
        >
          <Plus size={18} className="mr-2" />
          Add Event
        </button>
      </div>

      {/* AI Quick Add Bar */}
      <div className="glass-panel p-2 mb-8 rounded-xl flex items-center shadow-sm">
        <Sparkles className="text-indigo-500 ml-3 mr-2 shrink-0" size={20} />
        <form onSubmit={handleAiQuickAdd} className="flex-1 flex">
          <input 
            type="text" 
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask AI: 'Lunch tomorrow 1pm'..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm p-2 text-slate-700 placeholder:text-slate-400 min-w-0"
            disabled={isAiProcessing}
          />
          <button 
            type="submit"
            disabled={isAiProcessing || !aiInput}
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 md:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap ml-2"
          >
            {isAiProcessing ? <Loader2 size={14} className="animate-spin" /> : 'Auto-Create'}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-8 py-4">
          {sortedEvents.length === 0 && (
            <div className="ml-6 text-slate-400 italic text-sm">No upcoming events. Enjoy your free time!</div>
          )}
          
          {sortedEvents.map((event) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date() && !event.completed;
            
            return (
              <div key={event.id} className="relative ml-5 md:ml-6 group">
                {/* Timeline Dot */}
                <div className={`absolute -left-[29px] md:-left-[39px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10
                  ${event.completed ? 'bg-slate-300' : 
                    event.type === 'Deadline' ? 'bg-red-500' : 
                    event.type === 'Meeting' ? 'bg-blue-500' : 'bg-green-500'}`} 
                />
                
                <div className={`glass-panel p-3 md:p-4 rounded-xl flex items-center justify-between transition-all
                  ${event.completed ? 'opacity-50 grayscale' : ''}
                  ${isPast ? 'border-red-200 bg-red-50/50' : ''}
                `}>
                  <div className="flex items-center flex-1 min-w-0">
                    <button onClick={() => toggleEvent(event.id)} className="mr-3 md:mr-4 text-slate-400 hover:text-emerald-500 transition-colors shrink-0">
                      {event.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-semibold text-slate-800 text-sm md:text-base truncate ${event.completed ? 'line-through' : ''}`}>{event.title}</h4>
                      <div className="flex flex-wrap items-center text-xs text-slate-500 mt-1 gap-x-3 gap-y-1">
                        <span className="flex items-center"><CalendarIcon size={12} className="mr-1" /> {eventDate.toLocaleDateString()}</span>
                        <span className="flex items-center"><Clock size={12} className="mr-1" /> {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider
                          ${event.type === 'Deadline' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setEventToDelete(event.id)}
                    className="text-slate-300 hover:text-red-400 p-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="md:hidden"><AlertTriangle size={16} /></span>
                    <span className="hidden md:inline">Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Event</h3>
            <form onSubmit={handleAdd}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date & Time</label>
                  <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                    <option value="Meeting">Meeting</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg">Add to Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Event?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to remove this event from your schedule?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setEventToDelete(null)}
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

export default SmartCalendar;
