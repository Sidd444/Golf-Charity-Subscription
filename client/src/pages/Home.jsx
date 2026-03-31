import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import server_url from '../api';
import { 
  Trophy, 
  Heart, 
  Target, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

const Home = () => {
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    axios.get(`${server_url}/api/charities`).then(res => setCharities(res.data));
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-600/20 to-transparent blur-3xl -z-10" />

      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <span className="inline-block py-1 px-4 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold mb-6 border border-emerald-500/20">
            A New Era of Purposeful Play
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Play for Sport.<br />Win for <span className="text-emerald-500">Change.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-10 leading-relaxed">
            The modern subscription platform where your golf performance fuels global impact. 
            Track scores, enter elite prize draws, and support world-class charities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20">
              Start Your Subscription <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl border border-slate-700 transition-all">
              Member Login
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-black mb-12 text-center">Explore Our <span className="text-emerald-500">Charity Partners</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {charities.map((c) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-colors group">
              <div className="mb-6 p-4 bg-slate-800 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                <Heart className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{c.name}</h3>
              <p className="text-slate-400 leading-relaxed">{c.description || "Committed to driving positive change through community support and transparency."}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900/30 border-y border-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Understand the <br /><span className="text-indigo-400">Draw Mechanics.</span></h2>
              <div className="space-y-6">
                {[
                  { icon: <Zap size={20} />, text: "Enter your latest 5 Stableford scores monthly." },
                  { icon: <ShieldCheck size={20} />, text: "Automated lottery engine matches 3, 4, or 5 numbers." },
                  { icon: <Globe size={20} />, text: "Jackpots roll over to the next month if unclaimed." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-300">
                    <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-full">{item.icon}</div>
                    <span className="text-lg">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-3xl blur opacity-20" />
              <div className="relative bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="h-40 w-full bg-indigo-600/20 rounded-xl border border-indigo-500/20 flex items-center justify-center">
                  <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm text-center">Algorithm Powered<br/>Draw Engine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;