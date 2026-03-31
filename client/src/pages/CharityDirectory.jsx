import React, { useState, useEffect } from 'react';
import axios from 'axios';
import server_url from '../api';
import { Search, Filter, Heart, Globe, Calendar } from 'lucide-react';

const CharityDirectory = () => {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      axios.get(`${server_url}/api/charities?search=${search}`).then(res => setCharities(res.data));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">Charity Directory</h1>
        <p className="text-slate-400">Explore our partners and find the cause you want to champion.</p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Search by charity name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {charities.map(c => (
          <div key={c._id} className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="h-48 bg-slate-800 relative">
              {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold text-4xl">{c.name[0]}</div>}
              <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 p-2 rounded-xl"><Heart size={18} /></div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3">{c.name}</h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-3">{c.description || "Leading the charge in creating sustainable impact through transparency and community focus."}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <Calendar size={14} className="text-indigo-400" /> Upcoming: Annual Golf Day
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <Globe size={14} className="text-indigo-400" /> {c.website || "globalpartner.org"}
                </div>
              </div>

              <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharityDirectory;