import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import server_url from '../api';
import { 
  User, Mail, Lock, Heart, Percent, ArrowRight, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [charities, setCharities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    selectedCharity: '', charityPercentage: 10
  });

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await axios.get(`${server_url}/api/charities`);
        setCharities(res.data);
      } catch (err) {
        setError("Charity list could not be loaded.");
      }
    };
    fetchCharities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password too short');
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedCharity) return setError('Please select a charity to support');
    
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${server_url}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        selectedCharity: formData.selectedCharity,
        charityPercentage: formData.charityPercentage
      });

      localStorage.setItem('token', res.data.token);
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="w-full max-w-xl">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl">
          <div className="flex justify-center gap-2 mb-10">
            <div className={`h-2 w-12 rounded-full ${step === 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`h-2 w-12 rounded-full ${step === 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-3">{step === 1 ? 'Create Account' : 'Choose Your Cause'}</h1>
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </div>

          <form onSubmit={step === 1 ? nextStep : handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input name="name" required value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none" placeholder="Full Name" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none" placeholder="Email Address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none" placeholder="Password" />
                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none" placeholder="Confirm" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2">
                    Next Step <ArrowRight size={20} />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-3">
                    {charities.length === 0 ? (
                      <div className="text-center p-10 border border-dashed border-slate-700 rounded-3xl text-slate-500">
                        <Heart className="mx-auto mb-2 opacity-20" size={48} />
                        <p>No charities found. Please contact admin to populate the database.</p>
                      </div>
                    ) : (
                      charities.map(c => (
                        <label key={c._id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${formData.selectedCharity === c._id ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="selectedCharity" value={c._id} onChange={handleChange} className="hidden" />
                            <span className="font-bold">{c.name}</span>
                          </div>
                          {formData.selectedCharity === c._id && <CheckCircle2 className="text-emerald-500" size={20} />}
                        </label>
                      ))
                    )}
                  </div>
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">Contribution Level</span>
                      <span className="text-2xl font-black text-emerald-400">{formData.charityPercentage}%</span>
                    </div>
                    <input type="range" min="10" max="100" step="5" name="charityPercentage" value={formData.charityPercentage} onChange={handleChange} className="w-full h-2 bg-slate-800 rounded-lg appearance-none accent-emerald-500" />
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-2xl">Back</button>
                    <button type="submit" disabled={isSubmitting || charities.length === 0} className="flex-[2] py-4 bg-emerald-500 disabled:bg-slate-800 text-slate-950 font-black rounded-2xl flex items-center justify-center">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Complete Registration'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Register;