import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, CheckSquare, Users, Settings, LogOut, BarChart3 } from 'lucide-react';
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
    { name: 'Candidates', path: '/admin/candidates', icon: Users },
    { name: 'Modules', path: '/admin/modules', icon: BookOpen },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = userRole === 'admin' ? adminNav : candidateNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex w-64 flex-col flex-shrink-0" style={{ background: '#1E3A8A' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <img src="/logo.png" alt="Autonex" className="h-8 brightness-0 invert" />
      </div>

      {/* Role Badge */}
      <div className="px-5 pt-5 pb-2">
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(14,165,233,0.15)', color: '#7dd3fc' }}>
          {userRole === 'admin' ? '🛡️ Admin Panel' : '👤 Candidate'}
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
                    : 'text-blue-200 hover:text-white hover:bg-white/8'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' } : {}}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
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
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #3B82F6)', color: '#fff' }}>
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">{userName}</span>
              <span className="text-xs text-blue-300 capitalize">{userRole}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-blue-300 hover:text-white transition-colors cursor-pointer">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
