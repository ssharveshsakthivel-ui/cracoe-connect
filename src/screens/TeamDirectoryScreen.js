import React, { useState } from 'react';
import { useDataStore } from '../store/dataStore';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Briefcase, CheckCircle2 } from 'lucide-react';

export default function TeamDirectoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const users = useDataStore((state) => state.users);
  const tasks = useDataStore((state) => state.tasks);
  const currentUser = useDataStore((state) => state.getCurrentUser());

  // Calculate task stats per user
  const getUserStats = (userId) => {
    const userTasks = tasks.filter((t) => t.assignedToId.includes(userId));
    const completed = userTasks.filter((t) => t.status === 'Completed').length;
    return {
      total: userTasks.length,
      completed
    };
  };

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white"><GradientText>Team Directory</GradientText></h1>
          <p className="text-slate-400">Discover and connect with your colleagues</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search team members..."
            className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredUsers.map((user, index) => {
            const stats = getUserStats(user.id);
            const isMe = currentUser?.id === user.id;

            return (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-6 h-full flex flex-col relative group overflow-hidden">
                  {/* Decorative background blob */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/20">
                        {user.name.charAt(0)}
                      </div>
                      {isMe && (
                        <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full border border-white/10">
                          You
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                    
                    <div className="flex items-center gap-2 text-primary-light mb-4 text-sm font-medium">
                      <Briefcase size={14} />
                      {user.designation}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 mb-6 text-sm">
                      <Mail size={14} />
                      {user.email || `${user.name.toLowerCase().replace(' ', '.')}@cracoe.com`}
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Active Tasks</p>
                        <p className="text-white font-semibold">{stats.total - stats.completed}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Completed</p>
                        <div className="flex items-center gap-1">
                          <p className="text-green-400 font-semibold">{stats.completed}</p>
                          <CheckCircle2 size={14} className="text-green-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">No team members found.</p>
        </div>
      )}
    </div>
  );
}
