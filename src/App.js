import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDataStore } from './store/dataStore';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import EmployeeDetailScreen from './screens/EmployeeDetailScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import TasksScreen from './screens/TasksScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import VideoMeetScreen from './screens/VideoMeetScreen';
import TeamDirectoryScreen from './screens/TeamDirectoryScreen';
import Sidebar from './components/ui/Sidebar';
import CommandPalette from './components/ui/CommandPalette';
import ToastContainer from './components/ui/ToastContainer';
import './styles/index.css';

function ProtectedRoute({ children }) {
  const currentUserId = useDataStore((state) => state.currentUserId);

  if (!currentUserId) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function MainLayout({ children }) {
  const location = useLocation();
  const isLogin = location.pathname === '/';
  
  return (
    <>
      <ToastContainer />
      {!isLogin && <Sidebar />}
      {!isLogin && <CommandPalette />}
      <div className={`relative z-10 transition-all duration-300 ${!isLogin ? 'md:pl-[240px]' : ''}`}>
        {children}
      </div>
    </>
  );
}

function App() {
  const initializeFromSupabase = useDataStore((state) => state.initializeFromSupabase);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    initializeFromSupabase();
  }, [initializeFromSupabase]);

  return (
    <Router>
      <div className="relative min-h-screen bg-background overflow-x-hidden">
        {/* Global Animated Background Blobs */}
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-blob mix-blend-multiply pointer-events-none z-0"></div>
        <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply pointer-events-none z-0"></div>

        <MainLayout>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksScreen /></ProtectedRoute>} />
            <Route path="/employee/:employeeId" element={<ProtectedRoute><EmployeeDetailScreen /></ProtectedRoute>} />
            <Route path="/create-task" element={<ProtectedRoute><CreateTaskScreen /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanelScreen /></ProtectedRoute>} />
            <Route path="/video-meet" element={<ProtectedRoute><VideoMeetScreen /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><TeamDirectoryScreen /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </div>
    </Router>
  );
}

export default App;
