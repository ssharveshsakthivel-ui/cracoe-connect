import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LogOut,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Send,
  Plus,
  Search,
  Bell,
  BarChart2,
  MoreVertical,
  Briefcase
} from 'lucide-react';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  
  const currentUserId = useDataStore((state) => state.currentUserId);
  const getCurrentUser = useDataStore((state) => state.getCurrentUser);
  const getUser = useDataStore((state) => state.getUser);
  const getTaskStatistics = useDataStore((state) => state.getTaskStatistics);
  const searchAll = useDataStore((state) => state.searchAll);
  const logout = useDataStore((state) => state.logout);
  const users = useDataStore((state) => state.users);
  const meetings = useDataStore((state) => state.meetings);
  const tasks = useDataStore((state) => state.tasks);
  const messages = useDataStore((state) => state.messages);
  const sendMessage = useDataStore((state) => state.sendMessage);
  
  const supabaseLoading = useDataStore((state) => state.supabaseLoading);

  const currentUser = getCurrentUser();
  const stats = getTaskStatistics();
  
  const systemMessageTypes = new Set([
    'meeting_host', 'meeting_lobby', 'meeting_request', 
    'meeting_approved', 'meeting_denied', 'meeting_recording',
  ]);
  const visibleMessages = messages.filter((msg) => !systemMessageTypes.has(msg.type)).slice(-10);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchAll(query);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
    }
  };

  const SkeletonBlock = ({ className }) => (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`}></div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white"><GradientText>Cracoe Connect</GradientText></h1>
          <p className="text-slate-400 mt-1 font-medium">
            {supabaseLoading ? <SkeletonBlock className="h-4 w-48" /> : `Good morning, ${currentUser?.name}`}
          </p>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors relative border border-white/10 hidden md:block">
            <Bell size={20} className="text-slate-300" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          </button>

          <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 hidden md:flex">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{currentUser?.name}</p>
              <p className="text-xs text-slate-400">{currentUser?.designation}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Box Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Top Stats Cards */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-5 flex items-center space-x-4 border-l-4 border-l-green-500 hover:bg-white/10 transition-all cursor-pointer">
            <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-white mt-1">
                {supabaseLoading ? <SkeletonBlock className="h-8 w-16" /> : stats.completed}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center space-x-4 border-l-4 border-l-yellow-500 hover:bg-white/10 transition-all cursor-pointer">
            <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-white mt-1">
                {supabaseLoading ? <SkeletonBlock className="h-8 w-16" /> : stats.pending}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center space-x-4 border-l-4 border-l-blue-500 hover:bg-white/10 transition-all cursor-pointer">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold text-white mt-1">
                {supabaseLoading ? <SkeletonBlock className="h-8 w-16" /> : stats.inProgress}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center space-x-4 border-l-4 border-l-purple-500 hover:bg-white/10 transition-all cursor-pointer">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Size</p>
              <p className="text-2xl font-bold text-white mt-1">
                {supabaseLoading ? <SkeletonBlock className="h-8 w-16" /> : users.length}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Large Chart / Analytics Bento Box */}
        <GlassCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 size={18} className="text-primary" />
              Activity Overview
            </h3>
            <button className="text-slate-400 hover:text-white"><MoreVertical size={18} /></button>
          </div>
          <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/20 min-h-[300px]">
             {supabaseLoading ? (
               <SkeletonBlock className="w-full h-full" />
             ) : (
               <div className="text-center text-slate-500">
                 <BarChart2 size={48} className="mx-auto mb-3 opacity-20" />
                 <p className="text-sm font-medium">Chart Visualization Placeholder</p>
                 <p className="text-xs mt-1">Analytics will populate here</p>
               </div>
             )}
          </div>
        </GlassCard>

        {/* Medium Bento Box - Upcoming Meetings */}
        <GlassCard className="col-span-1 lg:col-span-1 p-6 max-h-[400px] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" />
              Upcoming Meetings
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {supabaseLoading ? (
               Array(3).fill(0).map((_, i) => (
                 <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 h-20">
                    <SkeletonBlock className="h-4 w-3/4 mb-2" />
                    <SkeletonBlock className="h-3 w-1/2" />
                 </div>
               ))
            ) : meetings.length === 0 ? (
              <div className="text-slate-500 text-center py-8 text-sm">No upcoming meetings</div>
            ) : meetings.map(meeting => (
              <div key={meeting.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-sm truncate">{meeting.title}</h4>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shrink-0">{meeting.time}</span>
                </div>
                <p className="text-xs text-slate-400">{meeting.date}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Medium Bento Box - Team Chat */}
        <GlassCard className="col-span-1 lg:col-span-1 p-0 flex flex-col h-[400px]">
          <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send size={18} className="text-green-400" />
              Quick Chat
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
            {supabaseLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className={`flex ${i%2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <SkeletonBlock className={`h-12 w-3/4 ${i%2 === 0 ? 'rounded-l-2xl rounded-tr-2xl' : 'rounded-r-2xl rounded-tl-2xl'}`} />
                </div>
              ))
            ) : (
              visibleMessages.map((msg) => {
                const isMe = msg.fromId === currentUserId;
                const sender = getUser(msg.fromId);
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${isMe ? 'bg-primary text-white rounded-l-2xl rounded-tr-2xl' : 'bg-white/10 text-slate-200 rounded-r-2xl rounded-tl-2xl'} p-3 text-sm`}>
                      {!isMe && <p className="text-[10px] text-slate-400 font-bold mb-1">{sender?.name}</p>}
                      <p>{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-3 bg-black/20 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:bg-white/10 transition-colors"
                placeholder="Message team..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                className="p-2 bg-primary hover:bg-primary-light rounded-xl text-white transition-colors flex items-center justify-center shrink-0"
                onClick={handleSendMessage}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Wide Bento Box - Leaderboard / Top Members */}
        <GlassCard className="col-span-1 md:col-span-3 lg:col-span-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase size={18} className="text-yellow-400" />
              Team Directory
            </h3>
            <button className="text-sm font-semibold text-primary hover:text-primary-light" onClick={() => navigate('/admin')}>View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supabaseLoading ? (
              Array(4).fill(0).map((_, i) => (
                <SkeletonBlock key={i} className="h-20 w-full" />
              ))
            ) : (
              users.slice(0, 4).map(user => (
                <div key={user.id} onClick={() => navigate(`/employee/${user.id}`)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-bold text-white shadow-inner group-hover:scale-105 transition-transform">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{user.designation}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
