import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import LoginUnified from './pages/LoginUnified';
import AdminLoginUnified from './pages/admin/AdminLoginUnified';
import CandidateDashboard from './pages/CandidateDashboard';
import ModulesPage from './pages/ModulesPage';
import ModuleViewPage from './pages/ModuleViewPage';
import TasksPage from './pages/TasksPage';
import MentorshipPage from './pages/MentorshipPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminModulesBuilder from './pages/AdminModulesBuilder';
import AdminModulesList from './pages/AdminModulesList';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminReportsPage from './pages/AdminReportsPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9' }}>
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// Candidate/Mentor route guard — only CANDIDATE and MENTOR can access
function CandidateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userRole } = useStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (userRole === 'admin') return <Navigate to="/admin" replace />;
  return <AppLayout>{children}</AppLayout>;
}

// Admin route guard — only ADMIN can access
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userRole } = useStore();
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (userRole !== 'admin') return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Pages */}
        <Route path="/login" element={<LoginUnified />} />
        <Route path="/admin/login" element={<AdminLoginUnified />} />

        {/* Candidate & Mentor Routes */}
        <Route path="/dashboard" element={<CandidateRoute><CandidateDashboard /></CandidateRoute>} />
        <Route path="/modules" element={<CandidateRoute><ModulesPage /></CandidateRoute>} />
        <Route path="/module/:moduleId" element={<CandidateRoute><ModuleViewPage /></CandidateRoute>} />
        <Route path="/tasks" element={<CandidateRoute><TasksPage /></CandidateRoute>} />
        <Route path="/mentorship" element={<CandidateRoute><MentorshipPage /></CandidateRoute>} />
        <Route path="/settings" element={<CandidateRoute><SettingsPage /></CandidateRoute>} />

        {/* Admin-Only Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/candidates" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/modules" element={<AdminRoute><AdminModulesList /></AdminRoute>} />
        <Route path="/admin/modules/new" element={<AdminRoute><AdminModulesBuilder /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
