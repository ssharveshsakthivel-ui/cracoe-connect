import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  CheckSquare, 
  Shield, 
  Video, 
  LogOut, 
  User,
  Users,
  Command,
  ArrowRight
} from 'lucide-react';

export default function CommandPalette() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const logout = useDataStore((state) => state.logout);
  const currentUser = useDataStore((state) => state.getCurrentUser());
  const users = useDataStore((state) => state.users);
  const canViewAdmin = useDataStore((state) => state.canViewAdmin);
  
  const isOpen = useDataStore((state) => state.isCommandPaletteOpen);
  const setIsOpen = useDataStore((state) => state.setCommandPaletteOpen);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  if (!isOpen) return null;

  const handleAction = (action) => {
    setIsOpen(false);
    setSearch('');
    action();
  };

  const defaultActions = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'tasks', label: 'View Tasks', icon: CheckSquare, action: () => navigate('/tasks') },
    { id: 'create_task', label: 'Create Task', icon: CheckSquare, action: () => navigate('/create-task') },
    { id: 'team', label: 'Team Directory', icon: Users, action: () => navigate('/team') },
    { id: 'meet', label: 'Start Video Meet', icon: Video, action: () => navigate('/video-meet') },
    ...(canViewAdmin() ? [{ id: 'admin', label: 'Admin Panel', icon: Shield, action: () => navigate('/admin') }] : []),
    { id: 'logout', label: 'Sign Out', icon: LogOut, action: () => { logout(); navigate('/'); } }
  ];

  const userActions = users
    .filter(u => u.id !== currentUser?.id)
    .map(u => ({
      id: `user_${u.id}`,
      label: `View Profile: ${u.name}`,
      icon: User,
      action: () => navigate(`/employee/${u.id}`)
    }));

  const allActions = [...defaultActions, ...userActions];
  const filteredActions = allActions.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#0f1423] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[70vh]"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/5">
            <Search className="text-primary shrink-0" size={24} />
            <input
              autoFocus
              type="text"
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none placeholder:text-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex items-center gap-1 text-slate-500 text-xs font-mono bg-black/40 px-2 py-1 rounded">
              <Command size={12} /> K
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {filteredActions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No results found for "{search}"
              </div>
            ) : (
              <div className="space-y-1">
                {filteredActions.map((action, idx) => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.action)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/10 text-slate-300 hover:text-white transition-all group focus:outline-none focus:bg-white/10"
                    autoFocus={idx === 0}
                  >
                    <div className="p-2 rounded-lg bg-black/20 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <action.icon size={18} />
                    </div>
                    <span className="flex-1 font-medium">{action.label}</span>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-primary" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/10 bg-black/20 text-xs text-slate-500 flex justify-between items-center">
            <span>Use <strong className="text-slate-300">↑↓</strong> to navigate</span>
            <span><strong className="text-slate-300">esc</strong> to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
