import React from 'react';
import { useDataStore } from '../store/dataStore';
import GlassCard from './ui/GlassCard';
import { Mail, Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function EmployeeCard({ employee, onViewDetails, onAssignTask }) {
  const getTasksForUser = useDataStore((state) => state.getTasksForUser);
  const tasks = getTasksForUser(employee.id);

  const displayTasks = tasks.slice(0, 3);
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;

  return (
    <GlassCard className="flex flex-col h-full hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {employee.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{employee.name}</h3>
            <div className="flex items-center text-xs text-slate-400">
              <Briefcase size={12} className="mr-1" />
              {employee.designation}
            </div>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-primary border border-primary/20">
          {employee.points || 0} pts
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center text-sm text-slate-400 mb-4">
          <Mail size={14} className="mr-2 text-slate-500" />
          {employee.email}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div className="bg-white/5 rounded-lg p-2 border border-white/5">
            <span className="block text-xs text-slate-500">Total</span>
            <span className="font-bold text-white">{tasks.length}</span>
          </div>
          <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
            <span className="block text-xs text-green-400">Done</span>
            <span className="font-bold text-green-400">{completedTasks}</span>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
            <span className="block text-xs text-blue-400">WIP</span>
            <span className="font-bold text-blue-400">{inProgressTasks}</span>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/20">
            <span className="block text-xs text-yellow-400">Pend</span>
            <span className="font-bold text-yellow-400">{pendingTasks}</span>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Assigned Tasks ({displayTasks.length})</p>
          {displayTasks.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No active tasks</p>
          ) : (
            <ul className="space-y-1">
              {displayTasks.map(task => (
                <li key={task.id} className="text-sm text-slate-300 truncate flex items-center">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${task.priority === 'High' ? 'bg-red-500' :
                      task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                  {task.title}
                </li>
              ))}
            </ul>
          )}
          {tasks.length > 3 && (
            <p className="text-xs text-primary mt-2 text-center">+{tasks.length - 3} more tasks</p>
          )}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <button
          onClick={onViewDetails}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-colors border border-white/10"
        >
          View Details
        </button>
        <button
          onClick={onAssignTask}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm transition-colors shadow-lg shadow-primary/20"
        >
          Assign Task
        </button>
      </div>
    </GlassCard>
  );
}
