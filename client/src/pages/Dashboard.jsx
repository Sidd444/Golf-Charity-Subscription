import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import server_url from '../api';
import { CreditCard, Award, Heart, Settings, Upload, Edit3, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user, loadUser } = useContext(AuthContext);
  const [tab, setTab] = useState('overview');
  const [score, setScore] = useState('');
  const [editScore, setEditScore] = useState({ id: '', value: '' });
  const [charities, setCharities] = useState([]);
  const [profile, setProfile] = useState({ name: '', charityId: '', percentage: 10 });
  const [file, setFile] = useState(null);
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, charityId: user.selectedCharity?._id, percentage: user.charityPercentage });
    }
    axios.get(`${server_url}/api/charities`).then(res => setCharities(res.data));
    axios.get(`${server_url}/api/draws/latest`).then(res => setLatestDraw(res.data));
  }, [user]);

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubscribe = async (plan) => {
    await axios.post(`${server_url}/api/users/subscribe/mock`, { plan });
    loadUser();
  };

  const handleUpdateProfile = async () => {
    await axios.put(`${server_url}/api/users/profile`, profile);
    alert("Impact Settings Updated");
    loadUser();
  };

  const submitScore = async () => {
    const val = parseInt(score);
    if (val < 1 || val > 45) return alert("Valid Stableford range is 1-45");
    await axios.post(`${server_url}/api/users/score`, { score: val });
    setScore('');
    loadUser();
  };

  const handleEditScore = async () => {
    const val = parseInt(editScore.value);
    if (val < 1 || val > 45) return alert("Valid Stableford range is 1-45");
    await axios.put(`${server_url}/api/users/score/${editScore.id}`, { value: val });
    setEditScore({ id: '', value: '' });
    loadUser();
  };

  const handleUploadProof = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('proof', file);
    await axios.post(`${server_url}/api/users/upload-proof`, formData);
    alert("Score screenshot submitted for verification");
    setFile(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <div className="flex flex-wrap gap-4 mb-12 overflow-x-auto pb-4">
        {['overview', 'scores', 'charity', 'participation', 'winnings'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-8 py-3 rounded-2xl font-black capitalize whitespace-nowrap transition ${tab === t ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">Subscription</h2>
            <p className={`text-3xl font-black ${user?.subscriptionStatus === 'active' ? 'text-emerald-400' : 'text-rose-500'}`}>{user?.subscriptionStatus?.toUpperCase()}</p>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{user?.subscriptionPlan || 'No active'} plan</p>
            {user?.subscriptionStatus !== 'active' && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button onClick={() => handleSubscribe('monthly')} className="py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest">Monthly $20</button>
                <button onClick={() => handleSubscribe('yearly')} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Yearly $200</button>
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-slate-800/50">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Next Renewal: {user?.renewalDate ? new Date(user.renewalDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col justify-center items-center text-center">
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mb-4"><Award size={40} /></div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Total Winnings</h2>
            <p className="text-5xl font-black text-white mt-2">${user?.totalWinnings || 0}</p>
          </div>
        </div>
      )}

      {tab === 'scores' && (
        <div className="space-y-8">
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">Log Score (1-45)</h2>
            <div className="flex gap-4">
              <input type="number" min="1" max="45" value={score} onChange={e => setScore(e.target.value)} placeholder="Stableford Score" className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex-1 outline-none focus:border-emerald-500 font-bold" />
              <button onClick={submitScore} className="bg-emerald-500 text-slate-950 px-10 rounded-2xl font-black uppercase text-xs tracking-widest">Submit</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {user?.scores.slice().reverse().map(s => (
              <div key={s._id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center relative group">
                <p className="text-4xl font-black text-white">{s.value}</p>
                <p className="text-[10px] text-slate-600 mt-2 font-black uppercase tracking-tighter">{new Date(s.date).toLocaleDateString()}</p>
                <button onClick={() => setEditScore({ id: s._id, value: s.value })} className="absolute top-4 right-4 text-slate-700 hover:text-emerald-500 transition-opacity opacity-0 group-hover:opacity-100"><Edit3 size={16}/></button>
              </div>
            ))}
          </div>
          {editScore.id && (
            <div className="bg-indigo-600/10 border border-indigo-500/30 p-8 rounded-3xl flex items-center gap-6">
              <p className="font-black uppercase text-xs text-indigo-400 tracking-widest">Edit Entry:</p>
              <input type="number" min="1" max="45" value={editScore.value} onChange={e => setEditScore({...editScore, value: e.target.value})} className="bg-slate-950 border border-slate-800 p-3 rounded-xl w-24 outline-none font-bold" />
              <button onClick={handleEditScore} className="bg-indigo-500 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Save</button>
              <button onClick={() => setEditScore({ id: '', value: '' })} className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Cancel</button>
            </div>
          )}
        </div>
      )}

      {tab === 'charity' && (
        <div className="max-w-2xl bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 space-y-8">
          <div>
            <label className="text-xs font-black uppercase text-slate-500 tracking-widest block mb-6">Select Partner</label>
            <div className="space-y-3">
              {charities.map(c => (
                <button key={c._id} onClick={() => setProfile({...profile, charityId: c._id})} className={`w-full flex items-center justify-between p-5 rounded-2xl border transition ${profile.charityId === c._id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                  <span className="font-black text-sm uppercase tracking-tight">{c.name}</span>
                  {profile.charityId === c._id && <CheckCircle className="text-emerald-500" size={20} />}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Percentage</label>
              <span className="text-3xl font-black text-emerald-400">{profile.percentage}%</span>
            </div>
            <input type="range" min="10" max="100" step="5" value={profile.percentage} onChange={e => setProfile({...profile, percentage: e.target.value})} className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-black uppercase"><span>Min 10%</span><span>Max 100%</span></div>
          </div>
          <button onClick={handleUpdateProfile} className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/10 transition active:scale-95 uppercase text-xs tracking-widest">Save Settings</button>
        </div>
      )}

      {tab === 'participation' && (
        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 uppercase tracking-tight"><Clock className="text-indigo-500" /> Active Pools</h2>
          {latestDraw ? (
            <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-black text-xl mb-1 text-white uppercase tracking-tighter">Prize Draw Cycle</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Status: {latestDraw.status}</p>
                <p className="text-[10px] text-indigo-400 font-black uppercase mt-2 tracking-widest">{latestDraw.logicType} Logic</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-emerald-400">${latestDraw.totalPool.toLocaleString()}</p>
                <p className="text-[10px] text-slate-600 font-black tracking-widest uppercase">Live Pool</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-950/50 rounded-3xl border border-slate-800 border-dashed"><p className="text-slate-500 font-black italic uppercase text-[10px] tracking-widest">Awaiting next draw cycle initialization</p></div>
          )}
        </div>
      )}

      {tab === 'winnings' && (
        <div className="max-w-2xl bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-tight">Verification</h2>
          <p className="text-slate-500 text-[10px] mb-10 leading-relaxed uppercase font-black tracking-widest">Upload platform screenshots to verify performance and initiate payout status.</p>
          <div className="space-y-8">
            <div className="p-12 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center bg-slate-950/50 relative overflow-hidden">
              <input type="file" id="proof" onChange={e => setFile(e.target.files[0])} className="hidden" />
              <label htmlFor="proof" className="cursor-pointer flex flex-col items-center z-10 text-center">
                <Upload className="text-emerald-500 mb-4" size={48} />
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">{file ? file.name : 'Select Screenshot'}</span>
              </label>
            </div>
            <button onClick={handleUploadProof} disabled={!file} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase text-[10px] tracking-widest">Submit Request</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;