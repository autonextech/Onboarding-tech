import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export default function Sidebar() {
  const { userName, userRole, logout } = useStore();
  const navigate = useNavigate();

  const candidateNav = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard', end: true },
    { name: 'Modules', path: '/modules', icon: 'layers' },
    { name: 'Mentorship', path: '/mentorship', icon: 'group' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard', end: true },
    { name: 'Candidates', path: '/admin/candidates', icon: 'group' },
    { name: 'Team', path: '/admin/team', icon: 'groups' },
    { name: 'Modules', path: '/admin/modules', icon: 'layers' },
    { name: 'Analytics', path: '/admin/analytics', icon: 'insights' },
    { name: 'Reports', path: '/admin/reports', icon: 'analytics' },
  ];

  const navItems = userRole === 'admin' ? adminNav : candidateNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-72 left-0 top-0 bg-primary py-8 px-6 space-y-4 z-50 flex-shrink-0">
      <div className="mb-10 px-2">
        <img src="/logo.png" alt="Autonex" className="h-8 brightness-0 invert" />
        <p className="text-blue-100/60 text-[10px] uppercase tracking-widest font-bold mt-1">
          {userRole === 'admin' ? 'Executive Portal' : 'Onboarding Phase 1'}
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg group transition-all ${
                isActive 
                ? 'bg-white/10 backdrop-blur-md text-white font-semibold scale-[0.98]' 
                : 'text-blue-100/70 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-lg" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                <span className="label-md uppercase tracking-widest text-xs font-medium font-body">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 mt-6 border-t border-white/10 space-y-1">
        {userRole === 'admin' && (
          <NavLink to="/settings" className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-lg group transition-all ${
              isActive ? 'bg-white/10 backdrop-blur-md text-white font-semibold scale-[0.98]' : 'text-blue-100/70 hover:bg-white/5'
            }`
          }>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-lg" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
                <span className="label-md uppercase tracking-widest text-xs font-medium font-body">Settings</span>
              </>
            )}
          </NavLink>
        )}
        
        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-blue-100/70 hover:bg-white/5 transition-all rounded-lg cursor-pointer">
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="label-md uppercase tracking-widest text-xs font-medium font-body">Sign Out</span>
        </button>
      </div>

      {/* User profile chunk */}
      <div className="mt-4 px-2 flex items-center gap-3 pt-6 border-t border-white/10">
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 text-white font-bold text-xs uppercase">
          {userName ? userName.substring(0,2) : 'EX'}
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-xs leading-tight font-body">{userName || 'Executive'}</span>
          <span className="text-blue-100/50 text-[10px] uppercase tracking-widest font-body">{userRole}</span>
        </div>
      </div>
    </aside>
  );
}
