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

export interface Task {
  id: string;
  title: string;
  description: string;
  module: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'graded';
  dueDate: string;
  score?: number;
  feedback?: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  email: string;
  bio: string;
  expertise: string[];
  meetingsCompleted: number;
  nextMeeting?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit: number;
  status: 'not_started' | 'in_progress' | 'passed' | 'failed';
  bestScore?: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'system' | 'task' | 'mentor' | 'quiz';
  read: boolean;
  time: string;
}

/* ────────────────── Admin Candidate ────────────────── */
export interface Candidate {
  id: string;
  name: string;
  email: string;
  department: string;
  startDate: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  mentor: string;
  modulesCompleted: number;
  totalModules: number;
}

/* ───────────────────────── Store ───────────────────────── */
interface AppState {
  userRole: 'candidate' | 'admin';
  userName: string;
  userEmail: string;
  isLoggedIn: boolean;
  modules: Module[];
  tasks: Task[];
  mentors: Mentor[];
  team: TeamMember[];
  quizzes: Quiz[];
  notifications: Notification[];
  candidates: Candidate[];
  overallProgress: number;

  login: (role: 'candidate' | 'admin', name: string, email: string) => void;
  logout: () => void;
  setRole: (role: 'candidate' | 'admin') => void;
  completeLesson: (moduleId: string, lessonId: string) => void;
  submitTask: (taskId: string) => void;
  markNotificationRead: (id: string) => void;
}

/* ──────────────────── Mock Data ──────────────────── */

const mockLessonsM1: Lesson[] = [
  { id: 'l1', title: 'Our Story: From Startup to Scale', type: 'video', duration: '12 min', completed: true },
  { id: 'l2', title: 'Core Values & Mission Statement', type: 'document', duration: '8 min', completed: true },
  { id: 'l3', title: 'Organizational Structure', type: 'text', duration: '5 min', completed: true },
  { id: 'l4', title: 'Employee Handbook Overview', type: 'document', duration: '15 min', completed: true },
];

const mockLessonsM2: Lesson[] = [
  { id: 'l5', title: 'Information Security Basics', type: 'video', duration: '20 min', completed: true },
  { id: 'l6', title: 'Password & Access Policies', type: 'document', duration: '10 min', completed: true },
  { id: 'l7', title: 'Data Classification Standards', type: 'text', duration: '8 min', completed: true },
  { id: 'l8', title: 'Incident Response Procedure', type: 'video', duration: '15 min', completed: false },
  { id: 'l9', title: 'GDPR & Privacy Compliance', type: 'document', duration: '12 min', completed: false },
  { id: 'l10', title: 'Security Quiz Preparation', type: 'text', duration: '5 min', completed: false },
];

const mockLessonsM3: Lesson[] = [
  { id: 'l11', title: 'Git & GitHub Workflow', type: 'video', duration: '25 min', completed: false },
  { id: 'l12', title: 'Jira Board & Sprint Process', type: 'video', duration: '15 min', completed: false },
  { id: 'l13', title: 'Internal CLI Tools Guide', type: 'document', duration: '20 min', completed: false },
  { id: 'l14', title: 'Code Review Best Practices', type: 'text', duration: '10 min', completed: false },
  { id: 'l15', title: 'CI/CD Pipeline Overview', type: 'video', duration: '18 min', completed: false },
];

const mockLessonsM4: Lesson[] = [
  { id: 'l16', title: 'Meet Your Mentor Introduction', type: 'text', duration: '5 min', completed: false },
  { id: 'l17', title: 'Setting 30-60-90 Day Goals', type: 'document', duration: '15 min', completed: false },
];

const mockModules: Module[] = [
  { id: 'm1', title: 'Welcome to the Company', description: 'Company history, culture, and our core values.', status: 'completed', progress: 100, totalLessons: 4, completedLessons: 4, icon: 'building', lessons: mockLessonsM1 },
  { id: 'm2', title: 'Security & Compliance (SOC2)', description: 'Mandatory IT security training and best practices.', status: 'in_progress', progress: 50, totalLessons: 6, completedLessons: 3, icon: 'shield', lessons: mockLessonsM2 },
  { id: 'm3', title: 'Your Department Tools', description: 'Introduction to GitHub, Jira, and internal CLI tools.', status: 'locked', progress: 0, totalLessons: 5, completedLessons: 0, icon: 'code', lessons: mockLessonsM3 },
  { id: 'm4', title: 'Meet Your Mentor', description: 'Schedule a 1-on-1 and define your 30-day goals.', status: 'locked', progress: 0, totalLessons: 2, completedLessons: 0, icon: 'users', lessons: mockLessonsM4 },
];

const mockTasks: Task[] = [
  { id: 't1', title: 'Complete Employee Profile', description: 'Fill out your full employee profile including emergency contacts, dietary preferences, and equipment needs.', module: 'Welcome to the Company', status: 'graded', dueDate: '2026-03-20', score: 95, feedback: 'Excellent! All fields completed accurately.' },
  { id: 't2', title: 'Security Assessment Quiz', description: 'Complete the SOC2 security awareness quiz with a passing score of 80% or higher.', module: 'Security & Compliance', status: 'pending', dueDate: '2026-04-01' },
  { id: 't3', title: 'Setup Development Environment', description: 'Follow the dev setup guide to install all required tools: Node.js, Docker, VS Code extensions, and clone the main repository.', module: 'Your Department Tools', status: 'in_progress', dueDate: '2026-04-05' },
  { id: 't4', title: 'First Code Review Submission', description: 'Submit a pull request with at least one bug fix or feature from the "good first issues" board.', module: 'Your Department Tools', status: 'pending', dueDate: '2026-04-10' },
  { id: 't5', title: 'Mentor Meeting Summary', description: 'Write a summary of your first mentor meeting including key takeaways and 30-day goals.', module: 'Meet Your Mentor', status: 'pending', dueDate: '2026-04-15' },
];

const mockMentors: Mentor[] = [
  { id: 'mn1', name: 'Sarah Chen', role: 'Staff Engineer', department: 'Platform Engineering', avatar: 'SC', email: 'sarah.chen@company.com', bio: '10+ years building distributed systems. Previously at Google and Stripe. Passionate about mentoring junior engineers and fostering growth mindsets.', expertise: ['System Design', 'Node.js', 'Kubernetes', 'Architecture'], meetingsCompleted: 2, nextMeeting: '2026-04-02 10:00 AM' },
  { id: 'mn2', name: 'Marcus Williams', role: 'Engineering Manager', department: 'Product Engineering', avatar: 'MW', email: 'marcus.w@company.com', bio: 'Leading the product engineering team. Expert in agile methodologies and career growth planning. Believes in servant leadership.', expertise: ['Team Leadership', 'Agile', 'Career Growth', 'React'], meetingsCompleted: 0, nextMeeting: undefined },
];

const mockTeam: TeamMember[] = [
  { id: 'tm1', name: 'Sarah Chen', role: 'Staff Engineer', department: 'Platform Engineering', avatar: 'SC' },
  { id: 'tm2', name: 'Marcus Williams', role: 'Engineering Manager', department: 'Product Engineering', avatar: 'MW' },
  { id: 'tm3', name: 'Priya Patel', role: 'Senior Designer', department: 'Product Design', avatar: 'PP' },
  { id: 'tm4', name: 'James Kim', role: 'DevOps Lead', department: 'Infrastructure', avatar: 'JK' },
  { id: 'tm5', name: 'Emily Rodriguez', role: 'Product Manager', department: 'Product', avatar: 'ER' },
  { id: 'tm6', name: 'David Okafor', role: 'Backend Engineer', department: 'Platform Engineering', avatar: 'DO' },
  { id: 'tm7', name: 'Lisa Chang', role: 'QA Lead', department: 'Quality Assurance', avatar: 'LC' },
  { id: 'tm8', name: 'Tom Anderson', role: 'Frontend Engineer', department: 'Product Engineering', avatar: 'TA' },
];

const mockQuizzes: Quiz[] = [
  { id: 'q1', moduleId: 'm1', title: 'Company Knowledge Check', questions: [
    { id: 'qq1', question: 'What year was the company founded?', options: ['2015', '2018', '2020', '2022'], correctIndex: 1 },
    { id: 'qq2', question: 'Which of the following is one of our core values?', options: ['Move fast, break things', 'Customer obsession', 'Profit first', 'Compete aggressively'], correctIndex: 1 },
    { id: 'qq3', question: 'How many offices does the company have globally?', options: ['2', '4', '6', '8'], correctIndex: 1 },
  ], passingScore: 70, timeLimit: 10, status: 'passed', bestScore: 100 },
  { id: 'q2', moduleId: 'm2', title: 'Security Awareness Assessment', questions: [
    { id: 'qq4', question: 'What is the minimum password length required?', options: ['8 chars', '10 chars', '12 chars', '16 chars'], correctIndex: 2 },
    { id: 'qq5', question: 'How should you report a security incident?', options: ['Email your manager', 'Post on Slack', 'Use the Security Hotline portal', 'Ignore it'], correctIndex: 2 },
    { id: 'qq6', question: 'Which data classification requires encryption at rest?', options: ['Public', 'Internal', 'Confidential', 'All of the above'], correctIndex: 3 },
    { id: 'qq7', question: 'Multi-factor authentication is required for:', options: ['VPN only', 'Email only', 'All internal systems', 'None'], correctIndex: 2 },
  ], passingScore: 80, timeLimit: 15, status: 'not_started' },
];

const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Mentor Meeting Scheduled', body: 'Your next meeting with Sarah Chen is on April 2nd at 10:00 AM.', type: 'mentor', read: false, time: '2 hours ago' },
  { id: 'n2', title: 'Task Graded', body: 'Your "Complete Employee Profile" task scored 95/100!', type: 'task', read: false, time: '5 hours ago' },
  { id: 'n3', title: 'New Module Available', body: 'Security & Compliance module is now ready for you.', type: 'system', read: true, time: '1 day ago' },
  { id: 'n4', title: 'Quiz Passed!', body: 'Congratulations! You passed the Company Knowledge Check with 100%.', type: 'quiz', read: true, time: '2 days ago' },
];

const mockCandidates: Candidate[] = [
  { id: 'c1', name: 'Alex Sterling', email: 'alex.s@company.com', department: 'Engineering', startDate: '2026-03-15', progress: 35, status: 'active', mentor: 'Sarah Chen', modulesCompleted: 1, totalModules: 4 },
  { id: 'c2', name: 'Maya Johnson', email: 'maya.j@company.com', department: 'Design', startDate: '2026-03-10', progress: 72, status: 'active', mentor: 'Priya Patel', modulesCompleted: 3, totalModules: 4 },
  { id: 'c3', name: 'Ryan Park', email: 'ryan.p@company.com', department: 'Engineering', startDate: '2026-03-01', progress: 100, status: 'completed', mentor: 'Marcus Williams', modulesCompleted: 4, totalModules: 4 },
  { id: 'c4', name: 'Sophia Torres', email: 'sophia.t@company.com', department: 'Product', startDate: '2026-03-20', progress: 15, status: 'active', mentor: 'Emily Rodriguez', modulesCompleted: 0, totalModules: 4 },
  { id: 'c5', name: 'Jake Morrison', email: 'jake.m@company.com', department: 'Engineering', startDate: '2026-02-28', progress: 88, status: 'active', mentor: 'Sarah Chen', modulesCompleted: 3, totalModules: 4 },
  { id: 'c6', name: 'Aisha Khan', email: 'aisha.k@company.com', department: 'Data Science', startDate: '2026-03-05', progress: 50, status: 'paused', mentor: 'David Okafor', modulesCompleted: 2, totalModules: 4 },
];

/* ──────────────────── Store ──────────────────── */
export const useStore = create<AppState>((set) => ({
  userRole: 'candidate',
  userName: 'Alex Sterling',
  userEmail: 'alex.s@company.com',
  isLoggedIn: false,
  modules: mockModules,
  tasks: mockTasks,
  mentors: mockMentors,
  team: mockTeam,
  quizzes: mockQuizzes,
  notifications: mockNotifications,
  candidates: mockCandidates,
  overallProgress: 35,

  login: (role, name, email) => set({ isLoggedIn: true, userRole: role, userName: name, userEmail: email }),
  logout: () => set({ isLoggedIn: false }),
  setRole: (role) => set({ userRole: role }),

  completeLesson: (moduleId, lessonId) => set((state) => {
    const newModules = state.modules.map(m => {
      if (m.id !== moduleId) return m;
      const newLessons = m.lessons.map(l => l.id === lessonId ? { ...l, completed: true } : l);
      const completedLessons = newLessons.filter(l => l.completed).length;
      const progress = Math.round((completedLessons / m.totalLessons) * 100);
      return { ...m, lessons: newLessons, completedLessons, progress, status: completedLessons === m.totalLessons ? 'completed' as const : 'in_progress' as const };
    });
    // Unlock logic
    const m2 = newModules.find(x => x.id === 'm2');
    if (m2?.status === 'completed') {
      const m3 = newModules.find(x => x.id === 'm3');
      if (m3 && m3.status === 'locked') m3.status = 'in_progress';
    }
    const m3 = newModules.find(x => x.id === 'm3');
    if (m3?.status === 'completed') {
      const m4 = newModules.find(x => x.id === 'm4');
      if (m4 && m4.status === 'locked') m4.status = 'in_progress';
    }
    const totalPossible = newModules.reduce((a, m) => a + m.totalLessons, 0);
    const totalDone = newModules.reduce((a, m) => a + m.completedLessons, 0);
    return { modules: newModules, overallProgress: Math.round((totalDone / totalPossible) * 100) };
  }),

  submitTask: (taskId) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'submitted' as const } : t)
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
}));
