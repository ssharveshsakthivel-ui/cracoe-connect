import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import TaskItem from '../components/TaskItem';
import { ArrowLeft, Mail, Briefcase, Check, X, Shield } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import { motion } from 'framer-motion';

export default function EmployeeDetailScreen() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const getUser = useDataStore((state) => state.getUser);
  const getTasksForUser = useDataStore((state) => state.getTasksForUser);

  const employee = getUser(employeeId);
  const employeeTasks = getTasksForUser(employeeId);

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Employee Not Found</h2>
          <p className="text-slate-400 mb-6">The employee you're looking for does not exist.</p>
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

  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <header className="flex items-center mb-8 gap-4">
          <button 
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all backdrop-blur-sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white"><GradientText>Employee Profile</GradientText></h1>
            <p className="text-slate-400">View details and permissions</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1 space-y-6">
            <GlassCard className="flex flex-col items-center text-center p-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary/20 mb-4">
                {employee.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{employee.name}</h2>
              <div className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-6">
                {employee.designation}
              </div>

              <div className="w-full space-y-3 text-left border-t border-white/10 pt-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="p-2 bg-white/5 rounded-lg"><Mail size={16} /></div>
                  <span className="text-sm truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="p-2 bg-white/5 rounded-lg"><Briefcase size={16} /></div>
                  <span className="text-sm">{employee.designation}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield size={18} className="text-purple-400" />
                Permissions
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {Object.entries(employee.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-xs text-slate-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className={`p-1 rounded-md ${value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {value ? <Check size={14} /> : <X size={14} />}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Tasks */}
          <div className="md:col-span-2">
            <GlassCard className="h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Assigned Tasks</h3>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-slate-300 font-medium">
                  {employeeTasks.length} {employeeTasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
              </div>

              {employeeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-black/20 text-slate-500">
                  <p>No tasks currently assigned.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeeTasks.map((task) => (
                    <motion.div 
                      whileHover={{ scale: 1.01 }} 
                      key={task.id} 
                      className="transition-all"
                    >
                      <TaskItem task={task} />
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
