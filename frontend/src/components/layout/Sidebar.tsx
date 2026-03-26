import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, CheckSquare, Users, Settings, LogOut, BarChart3, FileText } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Sidebar() {
  const { userName, userRole, logout } = useStore();
  const navigate = useNavigate();

  const candidateNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Modules', path: '/modules', icon: BookOpen },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Mentorship', path: '/mentorship', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/candidates', icon: Users },
    { name: 'Modules', path: '/admin/modules', icon: BookOpen },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = userRole === 'admin' ? adminNav : candidateNav;
  const isAdmin = userRole === 'admin';

  const handleLogout = () => {
    logout();
    // Route admin back to admin login, candidates to candidate login
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  const roleLabel = userRole === 'admin' ? '🛡️ Admin Panel' : userRole === 'mentor' ? '👥 Mentor' : '👤 Candidate';

  return (
    <aside className="hidden md:flex w-64 flex-col flex-shrink-0" style={{ background: isAdmin ? '#0D1B4C' : '#581C87' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <img src="/logo.png" alt="Autonex" className="h-8 brightness-0 invert" />
      </div>

      {/* Role Badge */}
      <div className="px-5 pt-5 pb-2">
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
          {roleLabel}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.name} to={item.path} end
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`
              }
              style={({ isActive }) => isActive ? { background: isAdmin ? 'linear-gradient(135deg, #1E40AF, #2563EB)' : 'linear-gradient(135deg, #7E22CE, #A855F7)' } : {}}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3">
        <div className="flex items-center justify-between rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full font-semibold text-sm"
              style={{ background: isAdmin ? 'linear-gradient(135deg, #2563EB, #3B82F6)' : 'linear-gradient(135deg, #A855F7, #C084FC)', color: '#fff' }}>
              {userName ? userName.split(' ').map(n => n[0]).join('') : '?'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">{userName || 'User'}</span>
              <span className="text-xs text-white/50 capitalize">{userRole}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-white/50 hover:text-white transition-colors cursor-pointer">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
