import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import TaskItem from '../components/TaskItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Kanban, List } from 'lucide-react';

export default function TasksScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  
  const tasks = useDataStore((state) => state.tasks);
  const currentUser = useDataStore((state) => state.getCurrentUser());
  const canManageTasks = useDataStore((state) => state.canManageTasks());
  const canViewAllTasks = useDataStore((state) => state.canViewAllTasks());
  const updateTaskStatus = useDataStore((state) => state.updateTaskStatus);

  // Determine which tasks to show based on permissions
  const visibleTasks = canViewAllTasks 
    ? tasks 
    : tasks.filter(t => t.assignedToId.includes(currentUser?.id) || t.createdBy === currentUser?.id);

  // Apply filters
  const filteredTasks = visibleTasks.filter(task => {
    return task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Kanban Columns
  const columns = [
    { id: 'Pending', title: 'Pending', color: 'border-yellow-500/50' },
    { id: 'In Progress', title: 'In Progress', color: 'border-blue-500/50' },
    { id: 'Completed', title: 'Completed', color: 'border-green-500/50' }
  ];

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white"><GradientText>Tasks</GradientText></h1>
          <p className="text-slate-400">Drag and drop tasks across your board</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center bg-black/20 border border-white/10 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Kanban size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {canManageTasks && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 px-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all flex items-center gap-2 shrink-0"
              onClick={() => navigate('/create-task')}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Task</span>
            </motion.button>
          )}
        </div>
      </header>

      {viewMode === 'list' ? (
        <GlassCard className="p-6 min-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredTasks.map(task => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <TaskItem task={task} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 min-h-[70vh] overflow-x-auto pb-4 custom-scrollbar">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className="flex-1 min-w-[300px] flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className={`mb-4 pb-2 border-b-2 ${col.color}`}>
                  <h3 className="font-bold text-white flex justify-between items-center">
                    {col.title}
                    <span className="text-xs bg-black/40 px-2 py-1 rounded-full text-slate-400">{colTasks.length}</span>
                  </h3>
                </div>
                
                <div className="flex-1 rounded-2xl bg-black/10 border border-white/5 p-3 space-y-4 shadow-inner min-h-[200px]">
                  <AnimatePresence>
                    {colTasks.map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="cursor-grab active:cursor-grabbing transform transition-transform hover:scale-[1.02]"
                      >
                        <TaskItem task={task} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {colTasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-slate-500 text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
