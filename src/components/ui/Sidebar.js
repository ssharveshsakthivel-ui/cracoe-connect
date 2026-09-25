import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Video, 
  Shield, 
  Menu,
  LogOut,
  Search,
  CheckSquare,
  Users,
  X
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useDataStore((state) => state.logout);
  const setCommandPaletteOpen = useDataStore((state) => state.setCommandPaletteOpen);
  const canViewAdmin = useDataStore((state) => state.canViewAdmin);

  // Don't show sidebar on login screen
  if (location.pathname === '/') return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/video-meet', label: 'Video Meet', icon: Video },
    { path: '/team', label: 'Team Directory', icon: Users },
    ...(canViewAdmin() ? [{ path: '/admin', label: 'Admin Panel', icon: Shield }] : [])
  ];

  return (
    <motion.aside 
      initial={{ width: 240, opacity: 0, x: -20 }}
      animate={{ width: collapsed ? 80 : 240, opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col pt-8 pb-6 px-4"
    >
      <div className="flex items-center justify-between mb-10 px-2">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-600 shadow-lg shadow-primary/30 flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <span className="text-white font-bold text-lg tracking-wide">Cracoe</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <div className="mb-6 px-2">
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors group"
        >
          <Search size={18} className="group-hover:text-primary transition-colors" />
          {!collapsed && (
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm">Search</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono">⌘K</span>
            </div>
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden text-sm"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/10 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-400/20"
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap overflow-hidden text-sm"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
