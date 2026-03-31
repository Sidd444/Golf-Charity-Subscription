import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  Trophy
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: user?.role === 'user' },
    { name: 'Admin', path: '/admin', icon: ShieldCheck, show: user?.role === 'admin' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
              <Trophy className="text-slate-950" size={22} />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">
              GOLF<span className="text-emerald-500">CHARITY</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.filter(link => link.show).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-bold transition-colors uppercase tracking-widest ${
                  isActive(link.path) ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            ))}

            {!user ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-emerald-500/10 uppercase"
                >
                  Join
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6 border-l border-slate-800 pl-6 ml-2">
                <div className="text-right">
                  <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">
                    {user.role}
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[51] md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-slate-800 p-8 z-[52] md:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-10">
                  <span className="font-black text-white tracking-widest uppercase">Menu</span>
                  <button onClick={() => setIsOpen(false)} className="text-slate-400"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                  {navLinks.filter(link => link.show).map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 text-lg font-bold uppercase tracking-widest ${
                        isActive(link.path) ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      <link.icon size={22} />
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-800">
                  {!user ? (
                    <div className="flex flex-col gap-4">
                      <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-4 bg-slate-800 text-center rounded-2xl font-bold uppercase text-xs">Login</Link>
                      <Link to="/register" onClick={() => setIsOpen(false)} className="w-full py-4 bg-emerald-500 text-slate-950 text-center rounded-2xl font-black uppercase text-xs">Join Now</Link>
                    </div>
                  ) : (
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-rose-500/10 text-rose-400 rounded-2xl font-bold uppercase text-xs tracking-widest">
                      <LogOut size={20} /> Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;