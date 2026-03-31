import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/me', {
        headers: { 'x-auth-token': token }
      });
      const userData = await res.json();

      if (userData.role !== 'admin') {
        logout();
        setError('Access Denied: Administrative privileges required.');
        setIsSubmitting(false);
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError('Authentication failed. Please check your admin credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-10 rounded-[3rem] shadow-2xl shadow-indigo-500/10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black mb-3 text-white uppercase tracking-tighter">Admin Access</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Internal Management Systems</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold uppercase tracking-tight">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold"
                  placeholder="Admin Email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold"
                  placeholder="Access Key"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 uppercase text-xs tracking-widest"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Verify Identity <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-slate-700 text-[10px] uppercase font-black tracking-[0.2em]">
          Secured by RSA-4096 / End-to-End Encryption
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;