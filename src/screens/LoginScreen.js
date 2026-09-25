import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { LayoutDashboard, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import { motion } from 'framer-motion';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authenticate = useDataStore((state) => state.authenticate);
  const users = useDataStore((state) => state.users);
  const supabaseLoading = useDataStore((state) => state.supabaseLoading);
  const supabaseError = useDataStore((state) => state.supabaseError);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate small delay for animation feel
    await new Promise(r => setTimeout(r, 600));

    if (!supabaseLoading && users.length === 0) {
      setError('No users loaded. Check your Supabase connection and seeded users.');
      setLoading(false);
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    if (authenticate(username.trim(), password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  const demoCredentials = [
    { username: 'sharvesh', password: 'S@rvesh*&^2026', role: 'CEO' },
    { username: 'sivadharana', password: 'Siv@dh@r@na$^2026', role: 'COO' },
    { username: 'shridharshini', password: 'Shr!Dh@r$hini&2026', role: 'CTO' },
    { username: 'sanjay', password: 'S@nJ@y*^&2026', role: 'CFO' },
    { username: 'sakthivel', password: 'S@kth!v3l$^2026', role: 'Manager' },
  ];

  const handleDemoLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply"></div>

      <GlassCard className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 p-0 overflow-hidden min-h-[600px] z-10">
        {/* Left Side - Brand */}
        <div className="relative p-10 flex flex-col justify-between bg-black/40 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 z-0"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <LayoutDashboard size={28} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">Cracoe</span>
          </div>

          <div className="relative z-10 my-10">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Manage your<br />work with<br /><GradientText>Connect.</GradientText>
            </h1>
            <p className="text-lg text-slate-300 max-w-sm">
              Streamline your workflow, track tasks, and collaborate seamlessly with your team in one unified platform.
            </p>
          </div>

          <div className="relative z-10 text-xs text-slate-500">
            © 2026 Cracoe Connect. All rights reserved.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-10 flex flex-col justify-center bg-white/5 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">Please enter your details to sign in.</p>
          </div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleLogin} className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {(supabaseError || error) && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
                <AlertCircle size={18} />
                <span>{supabaseError || error}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.form>

          <div className="mt-8">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-3 tracking-wider text-center">Quick Demo Login</div>
            <div className="grid grid-cols-2 gap-2">
              {demoCredentials.slice(0, 4).map((cred, idx) => (
                <button
                  key={idx}
                  className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
                  onClick={() => handleDemoLogin(cred.username, cred.password)}
                >
                  <span className="block text-[10px] text-primary font-bold uppercase tracking-wider">{cred.role}</span>
                  <div className="text-xs text-slate-300 group-hover:text-white transition-colors truncate">{cred.username}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
