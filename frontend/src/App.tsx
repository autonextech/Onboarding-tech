import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import CandidateDashboard from './pages/CandidateDashboard';
import ModulesPage from './pages/ModulesPage';
import ModuleViewPage from './pages/ModuleViewPage';
import MentorshipPage from './pages/MentorshipPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminModulesBuilder from './pages/AdminModulesBuilder';
import AdminModulesList from './pages/AdminModulesList';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTeamPage from './pages/AdminTeamPage';
import AdminReportsPage from './pages/AdminReportsPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { userName, userRole } = useStore();
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative bg-surface">
        <header className="fixed top-0 right-0 left-0 md:left-72 z-40 bg-white/80 backdrop-blur-xl h-20 flex justify-between items-center px-6 md:px-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)] border-none transition-all">
          <div className="flex items-center gap-8">
            <h2 className="text-xl md:text-2xl font-black tracking-tighter text-blue-900 headline-font">Dashboard <span className="hidden sm:inline text-primary/60 text-lg font-bold ml-2">{userRole === 'admin' ? 'Executive Portal' : 'Phase 1'}</span></h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-primary-container bg-primary flex items-center justify-center text-white font-bold text-xs uppercase shadow-md">
              {userName ? userName.substring(0,2) : 'EX'}
            </div>
          </div>
        </header>
        <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function CleanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative bg-surface">
        {children}
      </main>
    </div>
  );
}

// Candidate/Mentor route guard — only CANDIDATE and MENTOR can access
function CandidateRoute({ children, layout = 'app' }: { children: React.ReactNode, layout?: 'app' | 'clean' }) {
  const { isLoggedIn, userRole } = useStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (userRole === 'admin') return <Navigate to="/admin" replace />;
  return layout === 'clean' ? <CleanLayout>{children}</CleanLayout> : <AppLayout>{children}</AppLayout>;
}

// Admin route guard — only ADMIN can access
function AdminRoute({ children, layout = 'app' }: { children: React.ReactNode, layout?: 'app' | 'clean' }) {
  const { isLoggedIn, userRole } = useStore();
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (userRole !== 'admin') return <Navigate to="/dashboard" replace />;
  return layout === 'clean' ? <CleanLayout>{children}</CleanLayout> : <AppLayout>{children}</AppLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Candidate & Mentor Routes */}
        <Route path="/dashboard" element={<CandidateRoute><CandidateDashboard /></CandidateRoute>} />
        <Route path="/modules" element={<CandidateRoute><ModulesPage /></CandidateRoute>} />
        <Route path="/module/:moduleId" element={<CandidateRoute layout="clean"><ModuleViewPage /></CandidateRoute>} />
        <Route path="/mentorship" element={<CandidateRoute><MentorshipPage /></CandidateRoute>} />
        <Route path="/settings" element={<CandidateRoute><SettingsPage /></CandidateRoute>} />

        {/* Admin-Only Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/candidates" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/team" element={<AdminRoute><AdminTeamPage /></AdminRoute>} />
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
