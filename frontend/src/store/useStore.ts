import { create } from 'zustand';

/* ───────────────────────── Types ───────────────────────── */
export interface Module {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'in_progress' | 'completed';
  progress: number;
  totalLessons: number;
  completedLessons: number;
  icon: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document' | 'text';
  duration: string;
  completed: boolean;
}

/* ───────────────────────── Store ───────────────────────── */
interface AppState {
  userRole: 'candidate' | 'admin' | 'mentor';
  userName: string;
  userEmail: string;
  userId: string | null;
  token: string | null;
  isLoggedIn: boolean;
  overallProgress: number;

  login: (token: string, user: { id: string; name: string; email: string; role: string }) => void;
  logout: () => void;
  setRole: (role: 'candidate' | 'admin' | 'mentor') => void;
}

// Restore user session from localStorage
const storedUser = (() => {
  try {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
})();

export const useStore = create<AppState>((set) => ({
  userRole: storedUser?.role?.toLowerCase() || 'candidate',
  userName: storedUser?.name || '',
  userEmail: storedUser?.email || '',
  userId: storedUser?.id || null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: !!localStorage.getItem('token') && !!storedUser,
  overallProgress: 0,

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ 
      isLoggedIn: true, 
      token,
      userId: user.id,
      userRole: user.role.toLowerCase() as 'candidate' | 'admin' | 'mentor', 
      userName: user.name, 
      userEmail: user.email 
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ isLoggedIn: false, token: null, userId: null, userName: '', userEmail: '', userRole: 'candidate' });
  },
  setRole: (role) => set({ userRole: role }),
}));
