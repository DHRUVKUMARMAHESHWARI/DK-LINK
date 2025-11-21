import React, { useState } from 'react';
import { PasswordItem, Category } from '../types';
import { Copy, Eye, EyeOff, ShieldAlert, ShieldCheck, Plus, Trash2, Key, Check } from 'lucide-react';

interface PasswordVaultProps {
  passwords: PasswordItem[];
  addPassword: (p: PasswordItem) => void;
  deletePassword: (id: string) => void;
}

const PasswordVault: React.FC<PasswordVaultProps> = ({ passwords, addPassword, deletePassword }) => {
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form state
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const checkStrength = (pass: string): 'Weak' | 'Medium' | 'Strong' => {
    if (pass.length < 8) return 'Weak';
    if (pass.length < 12) return 'Medium';
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) return 'Strong';
    return 'Medium';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addPassword({
      id: Date.now().toString(),
      userId: '', // Placeholder, overwritten by App.tsx
      site,
      username,
      password,
      category: Category.PERSONAL, // Simplified for demo
      strength: checkStrength(password),
      lastUpdated: Date.now()
    });
    setShowModal(false);
    setSite(''); setUsername(''); setPassword('');
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Password Vault</h2>
          <p className="text-slate-500 text-sm">Zero-knowledge encryption design (Simulated).</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center shadow-lg shadow-emerald-500/30 transition-all"
        >
          <Plus size={18} className="mr-2" />
          New Entry
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-semibold">Site / App</th>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Password</th>
              <th className="p-4 font-semibold">Strength</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {passwords.map(item => (
              <tr key={item.id} className="hover:bg-white/40 transition-colors">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center mr-3 font-bold text-slate-600">
                      {item.site.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-800">{item.site}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600 text-sm font-mono">{item.username}</td>
                <td className="p-4">
                  <div className="flex items-center">
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm mr-2 w-32 truncate">
                      {revealedId === item.id ? item.password : '••••••••••••'}
                    </span>
                    <button 
                      onClick={() => setRevealedId(revealedId === item.id ? null : item.id)}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      {revealedId === item.id ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                    ${item.strength === 'Strong' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                      item.strength === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                      'bg-red-50 text-red-600 border-red-200'}`}>
                    {item.strength === 'Strong' ? <ShieldCheck size={12} className="mr-1" /> : <ShieldAlert size={12} className="mr-1" />}
                    {item.strength}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => copyToClipboard(item.id, item.password)} 
                    className={`mr-3 transition-colors ${copiedId === item.id ? 'text-emerald-500' : 'text-slate-400 hover:text-indigo-600'}`}
                    title="Copy Password"
                  >
                    {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => deletePassword(item.id)} className="text-slate-400 hover:text-red-500" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {passwords.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <Key size={48} className="mx-auto mb-2 opacity-30" />
            <p>No passwords saved yet.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Secure Credential</h3>
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Website Name</label>
                  <input 
                    type="text" required value={site} onChange={e => setSite(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Username / Email</label>
                  <input 
                    type="text" required value={username} onChange={e => setUsername(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" required value={password} onChange={e => setPassword(e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-500 font-mono"
                    />
                    <button 
                      type="button" onClick={generatePassword}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 rounded-lg text-xs font-medium"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Save Securely</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordVault;