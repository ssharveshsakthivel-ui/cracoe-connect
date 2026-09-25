import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { ArrowLeft, Plus, X, Calendar, AlertCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import { motion } from 'framer-motion';

export default function CreateTaskScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');

  const users = useDataStore((state) => state.users);
  const createTask = useDataStore((state) => state.createTask);
  const canManageTasks = useDataStore((state) => state.canManageTasks);
  const getCurrentUser = useDataStore((state) => state.getCurrentUser);

  const currentUser = getCurrentUser();

  useEffect(() => {
    const assignee = searchParams.get('assignee');
    if (assignee) {
      setSelectedUsers((prev) => (prev.includes(assignee) ? prev : [...prev, assignee]));
    }
  }, [searchParams]);

  if (!canManageTasks()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center p-8 max-w-md w-full">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">You don't have permission to create tasks.</p>
          <button 
            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </GlassCard>
      </div>
    );
  }

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length - 1) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.filter((u) => u.id !== currentUser.id).map((u) => u.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one team member');
      return;
    }

    if (!deadline) {
      setError('Deadline is required');
      return;
    }

    createTask(title, description, priority, deadline, selectedUsers);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <header className="flex items-center mb-8 gap-4">
          <button 
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all backdrop-blur-sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-white"><GradientText>Create New Task</GradientText></h1>
        </header>

        <GlassCard className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Task Title *</label>
              <input
                type="text"
                placeholder="Enter task title"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Description</label>
              <textarea
                placeholder="Enter task description"
                rows="4"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Priority *</label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option className="bg-slate-900">Low</option>
                  <option className="bg-slate-900">Medium</option>
                  <option className="bg-slate-900">High</option>
                  <option className="bg-slate-900">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Deadline *</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 ml-1">Assign to Team Members *</label>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:text-primary-light transition-colors"
                  onClick={handleSelectAll}
                >
                  {selectedUsers.length === users.length - 1 ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {users
                  .filter((u) => u.id !== currentUser.id)
                  .map((user) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={user.id}
                      type="button"
                      className={`flex items-center gap-2 py-2 px-3 rounded-full border transition-all ${
                        selectedUsers.includes(user.id) 
                          ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-300'
                      }`}
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedUsers.includes(user.id) ? 'bg-primary text-white' : 'bg-white/10 text-slate-300'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                      {selectedUsers.includes(user.id) && <X size={14} className="ml-1 text-primary-light" />}
                    </motion.button>
                  ))}
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button 
                type="button" 
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors border border-white/10"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="flex-1 py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Create Task
              </motion.button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
