import React, { useState, useEffect } from 'react';
import axios from 'axios';
import server_url from '../api';
import { 
  Users, Trophy, Heart, BarChart3, Settings, Play, 
  CheckCircle, XCircle, Trash2, Shield, 
  Zap, DollarSign, Activity, Loader2, Plus,
  Menu, X, Wallet, TrendingUp, Eye, Edit3, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({ users: [], draws: [], charities: [], proofs: [], stats: {} });
  const [drawLogic, setDrawLogic] = useState('random');
  const [newCharity, setNewCharity] = useState({ name: '', description: '' });
  const [editingUser, setEditingUser] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const [u, d, c, p, s] = await Promise.all([
        axios.get(`${server_url}/api/admin/users`, config),
        axios.get(`${server_url}/api/draws/history`, config),
        axios.get(`${server_url}/api/charities`, config),
        axios.get(`${server_url}/api/admin/proofs`, config),
        axios.get(`${server_url}/api/admin/stats`, config)
      ]);
      setData({ users: u.data, draws: d.data, charities: c.data, proofs: p.data, stats: s.data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimulate = async () => {
    try {
      const res = await axios.post(`${server_url}/api/draws/simulate`, { logicType: drawLogic });
      alert(`Simulation Complete. Winning Numbers: ${res.data.winningNumbers.join(', ')}`);
      fetchData();
    } catch (err) { alert("Simulation failed"); }
  };

  const handlePublish = async (id) => {
    try {
      await axios.post(`${server_url}/api/draws/publish/${id}`);
      fetchData();
    } catch (err) { alert("Publish failed"); }
  };

  const handleAddCharity = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${server_url}/api/charities`, newCharity);
      setNewCharity({ name: '', description: '' });
      fetchData();
    } catch (err) { alert("Add charity failed"); }
  };

  const handleVerify = async (proof, action) => {
    try {
      if (proof.status !== 'pending') return alert("Already processed");
      const prizeValue = action === 'approve' ? prompt("Enter prize amount to award:", "500") : "0";
      if (action === 'approve' && !prizeValue) return;
      await axios.put(`${server_url}/api/admin/verify-winner/${proof._id}`, { 
        action, 
        prize: parseFloat(prizeValue),
        drawId: proof.drawId 
      });
      fetchData();
    } catch (err) { alert("Verification failed"); }
  };

  const handleUserUpdate = async () => {
    try {
        await axios.put(`${server_url}/api/admin/user/${editingUser._id}`, editingUser);
        setEditingUser(null);
        fetchData();
        alert("User updated successfully");
    } catch (err) { alert("Update failed"); }
  };

  const markPayoutComplete = async (drawId, userId) => {
    try {
        await axios.put(`${server_url}/api/admin/payout-complete`, { drawId, winnerId: userId });
        fetchData();
    } catch (err) { alert("Payout update failed"); }
  };

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'draws', label: 'Draws', icon: Trophy },
    { id: 'winners', label: 'Winners List', icon: Wallet },
    { id: 'charities', label: 'Charity', icon: Heart },
    { id: 'verification', label: 'Proofs', icon: Shield }
  ];

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
      <Loader2 className="text-emerald-500 animate-spin mb-4" size={48} />
      <p className="text-emerald-500 font-black uppercase text-xs tracking-widest">Loading Admin Environment</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-200">
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center sticky top-0 z-50">
        <h2 className="text-emerald-500 font-black tracking-tighter">ADMIN SUITE</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className={`fixed lg:sticky top-0 left-0 z-40 w-72 h-screen bg-slate-900 border-r border-slate-800 p-8 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden lg:block mb-12">
          <h2 className="text-emerald-500 font-black text-2xl tracking-tighter">ADMIN SUITE</h2>
          <div className="h-1 w-12 bg-emerald-500 mt-2 rounded-full" />
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map(t => (
            <button 
              key={t.id} 
              onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-xs transition-all uppercase tracking-widest ${activeTab === t.id ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <h1 className="text-4xl lg:text-5xl font-black">Analytics & Reports</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', val: data.stats.totalUsers, icon: Activity, col: 'text-blue-400' },
                  { label: 'Active Subs', val: data.stats.activeUsers, icon: Zap, col: 'text-emerald-400' },
                  { label: 'Total Prize Pool', val: `$${data.stats.totalPrizePool?.toLocaleString()}`, icon: DollarSign, col: 'text-indigo-400' },
                  { label: 'Charity Totals', val: `$${data.stats.charityTotal?.toLocaleString()}`, icon: Heart, col: 'text-rose-400' }
                ].map((s, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
                    <s.icon className={`${s.col} mb-4`} size={24} />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                    <p className="text-3xl lg:text-4xl font-black mt-1">{s.val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Historical Draw Statistics</h2>
                <div className="space-y-4">
                    {data.stats.drawStats?.map((st, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border-b border-slate-800">
                            <span className="text-slate-400 font-bold">{new Date(st.date).toLocaleDateString()}</span>
                            <span className="text-white font-black">${st.pool.toLocaleString()}</span>
                            <span className="text-emerald-500 font-black">{st.winners} Winners</span>
                        </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <h1 className="text-4xl lg:text-5xl font-black">User Management</h1>
              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <tr><th className="p-8">Subscriber</th><th className="p-8">Subscription</th><th className="p-8">Scores</th><th className="p-8">Edit</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.users.map(u => (
                      <tr key={u._id} className="hover:bg-slate-800/30 transition">
                        <td className="p-8"><p className="font-black text-white">{u.name}</p><p className="text-xs text-slate-500 font-bold">{u.email}</p></td>
                        <td className="p-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.subscriptionStatus === 'active' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500/10 text-rose-500'}`}>{u.subscriptionStatus}</span>
                        </td>
                        <td className="p-8">
                          <div className="flex gap-1.5">{u.scores.map((s, i) => <span key={i} className="w-8 h-8 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-black text-indigo-400">{s.value}</span>)}</div>
                        </td>
                        <td className="p-8">
                          <button onClick={() => setEditingUser(u)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition"><Edit3 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {editingUser && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 relative">
                          <button onClick={() => setEditingUser(null)} className="absolute top-8 right-8 text-slate-500"><X /></button>
                          <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Edit User Profile</h2>
                          <div className="space-y-6">
                              <div>
                                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
                                  <input value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Subscription</label>
                                      <select value={editingUser.subscriptionStatus} onChange={(e) => setEditingUser({...editingUser, subscriptionStatus: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none">
                                          <option value="active">Active</option>
                                          <option value="inactive">Inactive</option>
                                          <option value="lapsed">Lapsed</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Plan</label>
                                      <select value={editingUser.subscriptionPlan} onChange={(e) => setEditingUser({...editingUser, subscriptionPlan: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none">
                                          <option value="monthly">Monthly</option>
                                          <option value="yearly">Yearly</option>
                                          <option value="none">None</option>
                                      </select>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Edit Scores (1-45)</label>
                                  <div className="flex gap-2">
                                      {editingUser.scores.map((s, idx) => (
                                          <input key={idx} type="number" value={s.value} onChange={(e) => {
                                              let newScores = [...editingUser.scores];
                                              newScores[idx].value = parseInt(e.target.value);
                                              setEditingUser({...editingUser, scores: newScores});
                                          }} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none text-center" />
                                      ))}
                                  </div>
                              </div>
                              <button onClick={handleUserUpdate} className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 uppercase text-sm tracking-widest"><Save size={20}/> Save All Changes</button>
                          </div>
                      </div>
                  </div>
              )}
            </motion.div>
          )}

          {activeTab === 'winners' && (
            <motion.div key="winners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <h1 className="text-4xl lg:text-5xl font-black">Winners & Payouts</h1>
              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <tr><th className="p-8">Winner</th><th className="p-8">Prize</th><th className="p-8">Type</th><th className="p-8">Draw Date</th><th className="p-8">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.draws.flatMap(d => d.winners.map(w => ({...w, drawId: d._id, drawDate: d.drawDate}))).map((win, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition">
                        <td className="p-8 font-black text-white">{data.users.find(u => u._id === win.userId)?.name || 'Unknown User'}</td>
                        <td className="p-8 text-emerald-400 font-black">${win.prize?.toLocaleString()}</td>
                        <td className="p-8"><span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold uppercase">{win.matchType}-Match</span></td>
                        <td className="p-8 text-slate-500 font-bold">{new Date(win.drawDate).toLocaleDateString()}</td>
                        <td className="p-8">
                            <button onClick={() => markPayoutComplete(win.drawId, win.userId)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${win.verified ? 'bg-emerald-500 text-slate-950 cursor-default' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                                {win.verified ? 'Completed' : 'Mark Paid'}
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'draws' && (
            <motion.div key="draws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <h1 className="text-4xl lg:text-5xl font-black">Draw System</h1>
                <div className="flex gap-4 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                  <select value={drawLogic} onChange={(e) => setDrawLogic(e.target.value)} className="bg-transparent px-4 font-black text-[10px] uppercase outline-none"><option value="random">Random</option><option value="algorithmic">Algo</option></select>
                  <button onClick={handleSimulate} className="bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20">Run Simulation</button>
                </div>
              </div>
              <div className="space-y-6">
                {data.draws.map(d => (
                  <div key={d._id} className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                      <div className="flex gap-2 mb-6"><span className={`px-4 py-1 text-[10px] font-black rounded-lg uppercase ${d.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>{d.status}</span><span className="px-4 py-1 bg-slate-950 text-slate-600 text-[10px] font-black rounded-lg uppercase">{new Date(d.drawDate).toLocaleDateString()}</span></div>
                      <div className="flex gap-3">{d.winningNumbers.map(n => <span key={n} className="w-14 h-14 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-500/10">{n}</span>)}</div>
                      <p className="mt-4 text-xs font-black uppercase text-slate-500">Jackpot Rollover: <span className="text-emerald-500 font-black">${d.jackpotRollover?.toLocaleString() || 0}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl lg:text-5xl font-black text-white mb-6">${d.totalPool.toLocaleString()}</p>
                      {d.status === 'simulated' && <button onClick={() => handlePublish(d._id)} className="bg-indigo-600 px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-600/20">Publish Results</button>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'charities' && (
            <motion.div key="charities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <h1 className="text-4xl lg:text-5xl font-black">Charity Partners</h1>
              <form onSubmit={handleAddCharity} className="bg-slate-900 p-8 lg:p-10 rounded-[3rem] border border-slate-800 flex flex-col md:flex-row gap-6">
                <input required value={newCharity.name} onChange={e => setNewCharity({...newCharity, name: e.target.value})} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none flex-1 font-bold" placeholder="Charity Name..." />
                <button type="submit" className="bg-emerald-500 text-slate-950 font-black px-12 py-5 md:py-0 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 uppercase text-xs"><Plus size={20} /> Add Partner</button>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {data.charities.map(c => (
                  <div key={c._id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mb-6 text-emerald-500"><Heart size={32} /></div>
                    <h3 className="text-2xl font-black mb-2">{c.name}</h3>
                    <button onClick={async () => { await axios.delete(`${server_url}/api/charities/${c._id}`); fetchData(); }} className="mt-8 text-slate-600 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-500/10"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'verification' && (
            <motion.div key="verification" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <h1 className="text-4xl lg:text-5xl font-black">Verification Queue</h1>
              <div className="grid grid-cols-1 gap-6">
                {data.proofs.map(p => (
                  <div key={p._id} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden group relative">
                        <img src={`${server_url}/uploads/${p.proofImage}`} className="w-full h-full object-cover" alt="Proof" />
                        <button onClick={() => window.open(`${server_url}/uploads/${p.proofImage}`)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Eye className="text-white"/></button>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="font-black text-2xl text-white">{p.userId?.name || 'Unknown'}</p>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{p.userId?.email || 'N/A'}</p>
                        <div className="mt-3 flex gap-2 justify-center md:justify-start">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${p.status === 'approved' ? 'bg-emerald-500 text-slate-950' : p.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'}`}>{p.status}</span>
                        </div>
                      </div>
                    </div>
                    {p.status === 'pending' ? (
                        <div className="flex gap-4 w-full md:w-auto">
                            <button onClick={() => handleVerify(p, 'approve')} className="flex-1 md:flex-none p-6 bg-emerald-500 text-slate-950 rounded-3xl font-black shadow-lg shadow-emerald-500/10"><CheckCircle size={24} className="mx-auto"/></button>
                            <button onClick={() => handleVerify(p, 'reject')} className="flex-1 md:flex-none p-6 bg-rose-500/10 text-rose-500 rounded-3xl font-black"><XCircle size={24} className="mx-auto"/></button>
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-800 text-slate-500 rounded-3xl font-black uppercase text-xs tracking-widest">Action Locked</div>
                    )}
                  </div>
                ))}
                {data.proofs.length === 0 && <div className="text-center py-40 bg-slate-900/50 rounded-[3rem] border border-slate-800 border-dashed text-slate-600 font-black tracking-widest uppercase text-xs">Queue Clear</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
export default AdminDashboard;