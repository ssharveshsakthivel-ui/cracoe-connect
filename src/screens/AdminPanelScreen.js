import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { ArrowLeft, Lock, Unlock, ShieldAlert, UserPlus, Trash2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import { motion } from 'framer-motion';

export default function AdminPanelScreen() {
  const navigate = useNavigate();
  const getCurrentUser = useDataStore((state) => state.getCurrentUser);
  const users = useDataStore((state) => state.users);
  const updateUserPermission = useDataStore((state) => state.updateUserPermission);
  const getUser = useDataStore((state) => state.getUser);
  const addUser = useDataStore((state) => state.addUser);
  const removeUser = useDataStore((state) => state.removeUser);

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    designation: 'Developer',
    email: '',
  });
  const [userError, setUserError] = useState('');

  const canViewAdmin = useDataStore((state) => state.canViewAdmin);

  if (!canViewAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center p-8 max-w-md w-full border-red-500/20">
          <ShieldAlert size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">The Admin Panel is strictly restricted to the CEO.</p>
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

  const handlePermissionToggle = (userId, permissionKey) => {
    const user = getUser(userId);
    const currentValue = user.permissions[permissionKey];
    updateUserPermission(userId, permissionKey, !currentValue);
  };

  const permissionLabels = {
    canAssignTasks: 'Can Assign Tasks',
    canViewAdmin: 'Can View Admin',
    canManageTeam: 'Can Manage Team',
    canViewAllTasks: 'Can View All Tasks',
    canEditAllTasks: 'Can Edit All Tasks',
    canAnnounce: 'Can Announce',
    canSchedule: 'Can Schedule',
    canViewMeetingMinutes: 'Can View Meeting Minutes',
    canManageMeetingMinutes: 'Can Manage Meeting Minutes',
  };

  const buildPermissions = (designation) => {
    if (designation === 'CEO') {
      return { canAssignTasks: true, canViewAdmin: true, canManageTeam: true, canViewAllTasks: true, canEditAllTasks: true, canAnnounce: true, canSchedule: true, canViewMeetingMinutes: true, canManageMeetingMinutes: true };
    }
    if (['COO', 'CTO', 'CFO'].includes(designation)) {
      return { canAssignTasks: true, canViewAdmin: false, canManageTeam: true, canViewAllTasks: true, canEditAllTasks: true, canAnnounce: true, canSchedule: true, canViewMeetingMinutes: true, canManageMeetingMinutes: true };
    }
    if (['Manager', 'Marketing Lead'].includes(designation)) {
      return { canAssignTasks: true, canViewAdmin: false, canManageTeam: true, canViewAllTasks: true, canEditAllTasks: false, canAnnounce: true, canSchedule: true, canViewMeetingMinutes: false, canManageMeetingMinutes: false };
    }
    return { canAssignTasks: false, canViewAdmin: false, canManageTeam: false, canViewAllTasks: false, canEditAllTasks: false, canAnnounce: false, canSchedule: false, canViewMeetingMinutes: false, canManageMeetingMinutes: false };
  };

  const handleAddUser = () => {
    setUserError('');
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.password.trim() || !newUser.email.trim()) {
      setUserError('All fields are required.');
      return;
    }
    const exists = users.some((u) => u.username.toLowerCase() === newUser.username.toLowerCase());
    if (exists) {
      setUserError('Username already exists.');
      return;
    }

    const user = {
      id: `user_${Date.now()}`,
      name: newUser.name.trim(),
      username: newUser.username.trim().toLowerCase(),
      password: newUser.password.trim(),
      designation: newUser.designation,
      email: newUser.email.trim(),
      permissions: buildPermissions(newUser.designation),
    };

    addUser(user);
    setNewUser({ name: '', username: '', password: '', designation: 'Developer', email: '' });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="flex items-center mb-8 gap-4">
        <button 
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all backdrop-blur-sm"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white"><GradientText>Admin Panel</GradientText></h1>
          <p className="text-slate-400">Permission & Team Management</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Col - Add User */}
        <GlassCard className="lg:col-span-1 p-6 border-t-4 border-t-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <UserPlus size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Add Employee</h2>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <select
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
              value={newUser.designation}
              onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
            >
              <option className="bg-slate-900">CEO</option>
              <option className="bg-slate-900">COO</option>
              <option className="bg-slate-900">CTO</option>
              <option className="bg-slate-900">CFO</option>
              <option className="bg-slate-900">Manager</option>
              <option className="bg-slate-900">Marketing Lead</option>
              <option className="bg-slate-900">Developer</option>
            </select>
            
            {userError && (
              <div className="text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
                {userError}
              </div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all mt-4" 
              onClick={handleAddUser}
            >
              Add Employee
            </motion.button>
          </div>
        </GlassCard>

        {/* Right Col - Permissions list */}
        <div className="lg:col-span-2 space-y-4 h-[80vh] overflow-y-auto custom-scrollbar pr-2">
          {users.map((user) => (
            <GlassCard key={user.id} className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                    <p className="text-sm text-slate-400">{user.designation} • {user.email}</p>
                  </div>
                </div>
                {user.designation !== 'CEO' && (
                  <button
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                    onClick={() => removeUser(user.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {Object.entries(permissionLabels).map(([key, label]) => {
                  const isGranted = user.permissions[key];
                  return (
                    <button
                      key={key}
                      onClick={() => handlePermissionToggle(user.id, key)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-medium ${
                        isGranted 
                          ? 'bg-primary/10 border-primary/30 text-white hover:bg-primary/20' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span>{label}</span>
                      <div className={`p-1 rounded-md ${isGranted ? 'bg-primary text-white shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-black/40 text-slate-500'}`}>
                        {isGranted ? <Unlock size={14} /> : <Lock size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
