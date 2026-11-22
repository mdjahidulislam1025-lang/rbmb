import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import Navbar from './components/Navbar';
import NoticeTicker from './components/NoticeTicker';
import Home from './pages/Home';
import NoticeBoard from './pages/NoticeBoard';
import Teachers from './pages/Teachers';
import Admission from './pages/Admission';
import Login from './pages/Login';
import Register from './pages/Register';
import Holidays from './pages/Holidays';
import Syllabus from './pages/Syllabus';
import Routine from './pages/Routine';
import EBookLibrary from './pages/EBookLibrary';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AcademicCalendar from './pages/AcademicCalendar';
import OnlineExam from './pages/OnlineExam';
import Alumni from './pages/Alumni';
import {
  X,
  Send,
  Bot,
  Sparkles,
  Search,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bell,
  Trophy,
  Users,
  Calendar,
} from 'lucide-react';
import {
  CAMPUS_BRAND,
  SCHOOL_NAME,
  CAMPUS_TAGLINE,
  INITIAL_SETTINGS,
  INITIAL_EBOOKS,
  INITIAL_NOTICES,
  INITIAL_NEWS,
  INITIAL_EVENTS,
  TEACHERS,
  INITIAL_GALLERY,
  HOLIDAYS_2026,
  INITIAL_STUDENTS,
  INITIAL_HOMEWORK,
  INITIAL_STUDENT_LEAVES,
  INITIAL_ONLINE_EXAMS,
  INITIAL_EXAM_ROUTINES,
  INITIAL_SUBJECTS,
  INITIAL_ALUMNI,
  INITIAL_FEE_RECORDS,
  INITIAL_PORTAL_NOTIFICATIONS,
  CLASS_ROUTINES,
} from './constants';
import {
  Language,
  ThemeMode,
  UserRole as BaseUserRole,
  SchoolSettings,
  ClassRoutine,
  Notice,
  NewsArticle,
  CampusEvent,
  Teacher,
  GalleryItem,
  Holiday,
  EBook,
  AdmissionApplication,
  ContactMessage,
  SchoolStudent,
  AttendanceRecord,
  HomeworkItem,
  AssignmentSubmission,
  ExamMark,
  OnlineExam as OnlineExamType,
  ExamAttempt,
  ExamRoutineItem,
  SchoolSubject,
  ParentMessage,
  AlumniProfile,
  TeacherLeave,
  StudentLeave,
  CloudUserProfile,
  StudentAttendanceRecord,
  ParentStudentLink,
  AdmissionStatusProjection,
  AuditLog,
  AuditAction,
  FeeCategory,
  FeeRecord,
  PaymentMethod,
  PortalNotification,
} from './types';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
  testFirestoreConnection,
} from './firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { sanitizeFirestoreId } from './utils/imageUtils';
import { hashPassword, verifyPassword } from './utils/security';

const { useState, createContext, useContext, useEffect, useRef, useMemo } = React;
const { HashRouter: Router, Routes, Route, Link, useNavigate } = RouterDom;

export type UserRole = BaseUserRole | null;

export interface AuthUser {
  role: UserRole;
  name: string;
  userId: string;
  email?: string;
  password?: string;
  passwordHash?: string;
  photo?: string;
  linkedChildClass?: string;
  linkedChildRoll?: string;
  linkedChildName?: string;
}

const DEFAULT_DEMO_PASSWORDS: Record<string, string> = {
  teacher01: '123456',
  student01: '123456',
  parent01: '123456',
};

const SEEDED_USER_TEMPLATES: Omit<AuthUser, 'passwordHash'>[] = [
  {
    userId: 'teacher01',
    name: 'মোসাঃ ফাতেমা বেগম',
    role: 'teacher',
    email: 'teacher01@rbhs.edu',
  },
  {
    userId: 'student01',
    name: 'আরিয়ান করিম (Aryan Karim)',
    role: 'student',
    email: 'student01@rbhs.edu',
    linkedChildClass: '9',
    linkedChildRoll: '01',
  },
  {
    userId: 'parent01',
    name: 'মোঃ করিম উদ্দিন (অভিভাবক)',
    role: 'parent',
    email: 'parent01@rbhs.edu',
    linkedChildClass: '9',
    linkedChildRoll: '01',
    linkedChildName: 'আরিয়ান করিম (Aryan Karim)',
  },
];

const BOOTSTRAPPED_ADMIN_EMAIL = 'mdjahidulislam1025@gmail.com';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type { CloudUserProfile, SchoolSettings };

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  largeText: boolean;
  toggleLargeText: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isCloudAdmin: boolean;
  isCloudTeacher: boolean;
  cloudUsers: CloudUserProfile[];
  updateCloudUserRole: (uid: string, role: BaseUserRole) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string; needsVerification?: boolean }>;
  registerWithEmail: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'parent';
    photo?: string;
    linkedChildClass?: string;
    linkedChildRoll?: string;
  }) => Promise<{ ok: boolean; error?: string; needsVerification?: boolean }>;
  resendVerificationEmail: () => Promise<boolean>;
  refreshAuthSession: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logoutGoogle: () => Promise<void>;
  login: (authUser: AuthUser) => void;
  verifyLocalCredentials: (userId: string, password: string, role: BaseUserRole) => Promise<AuthUser | null>;
  register: (newUser: AuthUser) => Promise<boolean>;
  updateUser: (updatedUser: AuthUser) => Promise<void>;
  deleteUser: (userId: string) => void;
  logout: () => void;
  t: (obj: unknown) => string;
  getUsers: () => AuthUser[];
  notices: Notice[];
  addNotice: (notice: Notice) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;
  newsList: NewsArticle[];
  addNews: (news: NewsArticle) => void;
  updateNews: (news: NewsArticle) => void;
  deleteNews: (id: string) => void;
  eventsList: CampusEvent[];
  addEvent: (evt: CampusEvent) => void;
  updateEvent: (evt: CampusEvent) => void;
  deleteEvent: (id: string) => void;
  teachers: Teacher[];
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  ebooks: EBook[];
  addEbook: (ebook: EBook) => void;
  updateEbook: (ebook: EBook) => void;
  deleteEbook: (id: string) => void;
  gallery: GalleryItem[];
  addGalleryItem: (item: GalleryItem) => void;
  updateGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;
  holidays: Holiday[];
  addHoliday: (holiday: Holiday) => void;
  updateHoliday: (holiday: Holiday) => void;
  deleteHoliday: (id: string) => void;
  admissions: AdmissionApplication[];
  addAdmission: (app: AdmissionApplication) => Promise<void>;
  updateAdmissionStatus: (appId: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  deleteAdmission: (appId: string) => Promise<void>;
  lookupAdmissionStatus: (appId: string, mobileLast4?: string) => Promise<AdmissionStatusProjection | null>;
  contactMessages: ContactMessage[];
  addContactMessage: (msg: ContactMessage) => Promise<void>;
  markContactMessageRead: (id: string) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
  students: SchoolStudent[];
  addStudent: (student: SchoolStudent) => void;
  updateStudent: (student: SchoolStudent) => void;
  deleteStudent: (id: string) => void;
  attendanceRecords: AttendanceRecord[];
  studentAttendance: StudentAttendanceRecord[];
  saveAttendance: (record: AttendanceRecord) => void;
  homeworkList: HomeworkItem[];
  addHomework: (hw: HomeworkItem) => void;
  updateHomework: (hw: HomeworkItem) => void;
  deleteHomework: (id: string) => void;
  assignmentSubmissions: AssignmentSubmission[];
  submitAssignment: (sub: AssignmentSubmission) => void;
  gradeAssignmentSubmission: (id: string, marks: number, feedback: string) => void;
  examMarks: ExamMark[];
  saveExamMark: (mark: ExamMark) => void;
  saveExamMarksBulk: (marks: ExamMark[]) => void;
  deleteExamMark: (id: string) => void;
  onlineExams: OnlineExamType[];
  addOnlineExam: (exam: OnlineExamType) => void;
  updateOnlineExam: (exam: OnlineExamType) => void;
  deleteOnlineExam: (id: string) => void;
  examAttempts: ExamAttempt[];
  submitExamAttempt: (attempt: ExamAttempt) => void;
  examRoutines: ExamRoutineItem[];
  addExamRoutine: (item: ExamRoutineItem) => void;
  deleteExamRoutine: (id: string) => void;
  classRoutines: ClassRoutine[];
  saveClassRoutine: (routine: ClassRoutine) => void;
  resetClassRoutines: () => void;
  subjects: SchoolSubject[];
  addSubject: (sub: SchoolSubject) => void;
  deleteSubject: (id: string) => void;
  parentMessages: ParentMessage[];
  sendParentMessage: (msg: ParentMessage) => void;
  replyParentMessage: (id: string, reply: string, repliedBy: string) => void;
  parentLinks: ParentStudentLink[];
  requestParentStudentLink: (payload: { classId: string; roll: string; relationship: 'Father' | 'Mother' | 'Guardian' }) => Promise<boolean>;
  reviewParentStudentLink: (linkId: string, status: 'approved' | 'rejected') => Promise<void>;
  deleteParentStudentLink: (linkId: string) => Promise<void>;
  alumni: AlumniProfile[];
  submitAlumniProfile: (profile: AlumniProfile) => void;
  updateAlumniStatus: (id: string, status: 'pending' | 'approved') => void;
  deleteAlumniProfile: (id: string) => void;
  teacherLeaves: TeacherLeave[];
  submitTeacherLeave: (leave: TeacherLeave) => void;
  updateTeacherLeaveStatus: (id: string, status: 'pending' | 'approved' | 'rejected', adminRemark?: string) => void;
  deleteTeacherLeave: (id: string) => void;
  studentLeaves: StudentLeave[];
  submitStudentLeave: (leave: StudentLeave) => void;
  updateStudentLeaveStatus: (id: string, status: 'pending' | 'approved' | 'rejected', reviewedBy: string, teacherRemark?: string) => void;
  deleteStudentLeave: (id: string) => void;
  feeRecords: FeeRecord[];
  addFeeRecord: (fee: FeeRecord) => void;
  addBulkClassFees: (payload: {
    classId: string;
    title: string;
    category: FeeCategory;
    billingMonth?: string;
    amount: number;
    dueDate: string;
  }) => number;
  updateFeePayment: (id: string, paidAmount: number, paymentMethod: PaymentMethod, receiptNo?: string) => Promise<void>;
  markFeeWaived: (id: string) => Promise<void>;
  deleteFeeRecord: (id: string) => void;
  portalNotifications: PortalNotification[];
  addPortalNotification: (notif: PortalNotification) => Promise<void>;
  deletePortalNotification: (id: string) => void;
  auditLogs: AuditLog[];
  settings: SchoolSettings;
  updateSettings: (newSettings: SchoolSettings) => void;
  exportDatabase: () => void;
  importDatabase: (jsonData: string) => boolean;
  dbStatus: 'synced' | 'syncing' | 'error';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const safeLocalGet = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
};

const safeLocalSet = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`localStorage write skipped for ${key}:`, e);
  }
};

const stripPlaintextPassword = (u: AuthUser): AuthUser => {
  const { password: _pw, ...rest } = u;
  return rest;
};

// Global Quick Search Modal rendered inside Router context
const GlobalSearchModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { lang, t, notices, newsList, eventsList, ebooks, onlineExams, teachers, holidays } = useApp();
  const navigate = useNavigate();
  const [queryText, setQueryText] = useState('');

  useEffect(() => {
    if (!open) setQueryText('');
  }, [open]);

  const results = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const quickPages = [
      { label: lang === 'bn' ? 'অনলাইন পরীক্ষা (MCQ)' : 'Online Examination', path: '/exams', badge: 'Learning' },
      { label: lang === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Digital Library', path: '/ebooks', badge: 'Library' },
      { label: lang === 'bn' ? 'নোটিশ, সংবাদ ও ইভেন্ট' : 'Notice, News & Events', path: '/notices', badge: 'Updates' },
      { label: lang === 'bn' ? 'অনলাইন ভর্তি আবেদন ও স্ট্যাটাস' : 'Online Admission & Status', path: '/admission', badge: 'Admission' },
      { label: lang === 'bn' ? 'ক্লাস ও পরীক্ষার রুটিন' : 'Class & Exam Routine', path: '/routine', badge: 'Academics' },
      { label: lang === 'bn' ? 'অ্যালামনাই নেটওয়ার্ক' : 'Alumni Network', path: '/alumni', badge: 'Community' },
      { label: lang === 'bn' ? 'শিক্ষার্থী / শিক্ষক / অভিভাবক পোর্টাল' : 'Student, Teacher & Parent Portals', path: '/login/student', badge: 'Portals' },
    ];

    if (!q) {
      return {
        pages: quickPages,
        notices: notices.slice(0, 3),
        news: newsList.slice(0, 2),
        events: eventsList.slice(0, 2),
        ebooks: ebooks.slice(0, 3),
        exams: onlineExams.slice(0, 2),
        teachers: [],
        holidays: [],
      };
    }

    return {
      pages: quickPages.filter((p) => p.label.toLowerCase().includes(q) || p.badge.toLowerCase().includes(q)),
      notices: notices.filter((n) => t(n.title).toLowerCase().includes(q) || t(n.description).toLowerCase().includes(q)).slice(0, 4),
      news: newsList.filter((item) => t(item.title).toLowerCase().includes(q) || t(item.summary).toLowerCase().includes(q)).slice(0, 3),
      events: eventsList.filter((ev) => t(ev.title).toLowerCase().includes(q) || t(ev.description).toLowerCase().includes(q)).slice(0, 3),
      ebooks: ebooks.filter((b) => t(b.title).toLowerCase().includes(q) || b.subject.toLowerCase().includes(q) || b.classId.includes(q)).slice(0, 4),
      exams: onlineExams.filter((ex) => t(ex.title).toLowerCase().includes(q) || ex.subject.toLowerCase().includes(q)).slice(0, 4),
      teachers: teachers.filter((tc) => t(tc.name).toLowerCase().includes(q) || t(tc.subject).toLowerCase().includes(q)).slice(0, 4),
      holidays: holidays.filter((h) => t(h.title).toLowerCase().includes(q)).slice(0, 3),
    };
  }, [queryText, lang, t, notices, newsList, eventsList, ebooks, onlineExams, teachers, holidays]);

  if (!open) return null;

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            autoFocus
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'নোটিশ, বই, অনলাইন পরীক্ষা, শিক্ষক বা পেজ খুঁজুন... (Ctrl+K)'
                : 'Search notices, library books, MCQ exams, teachers, or pages...'
            }
            className="w-full bg-transparent outline-none text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {results.pages.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'bn' ? 'দ্রুত নেভিগেশন' : 'Quick Destinations'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.pages.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => go(p.path)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-left transition-colors group"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                      {p.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.news.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'bn' ? 'ক্যাম্পাস সংবাদ' : 'Campus News'}
              </p>
              <div className="space-y-1.5">
                {results.news.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => go('/news')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-3">{t(item.title)}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{item.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.events.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'bn' ? 'আসন্ন ইভেন্ট' : 'Upcoming Events'}
              </p>
              <div className="space-y-1.5">
                {results.events.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => go('/events')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-3">{t(ev.title)}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{ev.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.notices.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> {lang === 'bn' ? 'নোটিশ' : 'Notices'}
              </p>
              <div className="space-y-1.5">
                {results.notices.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => go('/notices')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-3">{t(n.title)}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{n.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.ebooks.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> {lang === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Digital Library'}
              </p>
              <div className="space-y-1.5">
                {results.ebooks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => go('/ebooks')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-3">{t(b.title)}</span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">{b.subject}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.exams.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> {lang === 'bn' ? 'অনলাইন পরীক্ষা' : 'Online Exams'}
              </p>
              <div className="space-y-1.5">
                {results.exams.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => go('/exams')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-3">{t(ex.title)}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">Class {ex.classId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.teachers.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {lang === 'bn' ? 'শিক্ষকমণ্ডলী' : 'Teachers'}
              </p>
              <div className="space-y-1.5">
                {results.teachers.map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => go('/teachers')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-3">{t(tc.name)}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{t(tc.subject)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.holidays.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {lang === 'bn' ? 'ছুটির তালিকা' : 'Holidays'}
              </p>
              <div className="space-y-1.5">
                {results.holidays.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => go('/holidays')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-3">{t(h.title)}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{h.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => safeLocalGet<Language>('school_lang', 'bn'));
  const [theme, setTheme] = useState<ThemeMode>(() => safeLocalGet<ThemeMode>('school_theme', 'light'));
  const [largeText, setLargeText] = useState<boolean>(() => safeLocalGet<boolean>('school_large_text', false));
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState<boolean>(false);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [resolvedUid, setResolvedUid] = useState<string | null>(null);
  const [isCloudAdmin, setIsCloudAdmin] = useState(false);
  const [isCloudTeacher, setIsCloudTeacher] = useState(false);
  const [cloudUsers, setCloudUsers] = useState<CloudUserProfile[]>([]);
  const authSeqRef = useRef(0);

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [dbStatus, setDbStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [notices, setNotices] = useState<Notice[]>(() => safeLocalGet('db_notices', INITIAL_NOTICES));
  const [newsList, setNewsList] = useState<NewsArticle[]>(() => safeLocalGet('db_news', INITIAL_NEWS));
  const [eventsList, setEventsList] = useState<CampusEvent[]>(() => safeLocalGet('db_events', INITIAL_EVENTS));
  const [teachers, setTeachers] = useState<Teacher[]>(() => safeLocalGet('db_teachers', TEACHERS));
  const [ebooks, setEbooks] = useState<EBook[]>(() => safeLocalGet('db_ebooks', INITIAL_EBOOKS));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => safeLocalGet('db_gallery', INITIAL_GALLERY));
  const [holidays, setHolidays] = useState<Holiday[]>(() => safeLocalGet('db_holidays', HOLIDAYS_2026));
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(() => safeLocalGet('admission_applications', []));
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => safeLocalGet('contact_messages', []));
  const [students, setStudents] = useState<SchoolStudent[]>(() => safeLocalGet('db_students', INITIAL_STUDENTS));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => safeLocalGet('db_attendance', []));
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRecord[]>(() => safeLocalGet('db_student_attendance', []));
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(() => safeLocalGet('db_homework', INITIAL_HOMEWORK));
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => safeLocalGet('db_assignment_submissions', []));
  const [examMarks, setExamMarks] = useState<ExamMark[]>(() => safeLocalGet('db_exam_marks', []));
  const [onlineExams, setOnlineExams] = useState<OnlineExamType[]>(() => safeLocalGet('db_online_exams', INITIAL_ONLINE_EXAMS));
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>(() => safeLocalGet('db_exam_attempts', []));
  const [examRoutines, setExamRoutines] = useState<ExamRoutineItem[]>(() => safeLocalGet('db_exam_routines', INITIAL_EXAM_ROUTINES));
  const [classRoutines, setClassRoutines] = useState<ClassRoutine[]>(() => safeLocalGet('db_class_routines', CLASS_ROUTINES));
  const [subjects, setSubjects] = useState<SchoolSubject[]>(() => safeLocalGet('db_subjects', INITIAL_SUBJECTS));
  const [parentMessages, setParentMessages] = useState<ParentMessage[]>(() => safeLocalGet('db_parent_messages', []));
  const [parentLinks, setParentLinks] = useState<ParentStudentLink[]>(() => safeLocalGet('db_parent_links', []));
  const [alumni, setAlumni] = useState<AlumniProfile[]>(() => safeLocalGet('db_alumni', INITIAL_ALUMNI));
  const [teacherLeaves, setTeacherLeaves] = useState<TeacherLeave[]>(() => safeLocalGet('db_teacher_leaves', []));
  const [studentLeaves, setStudentLeaves] = useState<StudentLeave[]>(() => safeLocalGet('db_student_leaves', INITIAL_STUDENT_LEAVES));
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(() => safeLocalGet('db_fee_records', INITIAL_FEE_RECORDS));
  const [portalNotifications, setPortalNotifications] = useState<PortalNotification[]>(() => safeLocalGet('db_portal_notifications', INITIAL_PORTAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => safeLocalGet('db_audit_logs', []));

  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>(() => {
    const saved = safeLocalGet<AuthUser[]>('registered_users', []);
    return saved.filter((u) => u && u.role !== 'admin' && u.userId !== 'admin').map(stripPlaintextPassword);
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = safeLocalGet<SchoolSettings>('school_settings', INITIAL_SETTINGS);
    return {
      ...INITIAL_SETTINGS,
      ...saved,
      schoolPhoto:
        saved.schoolPhoto && !saved.schoolPhoto.includes('unsplash.com') && !saved.schoolPhoto.includes('picsum.photos')
          ? saved.schoolPhoto
          : INITIAL_SETTINGS.schoolPhoto,
      headTeacherPhoto:
        saved.headTeacherPhoto && !saved.headTeacherPhoto.includes('unsplash.com') && !saved.headTeacherPhoto.includes('picsum.photos')
          ? saved.headTeacherPhoto
          : INITIAL_SETTINGS.headTeacherPhoto,
    };
  });

  // Theme, Large Text, Lang & Keyboard Shortcuts (Ctrl+K / Cmd+K)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    safeLocalSet('school_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (largeText) {
      root.classList.add('text-scale-lg');
    } else {
      root.classList.remove('text-scale-lg');
    }
    safeLocalSet('school_large_text', largeText);
  }, [largeText]);

  useEffect(() => {
    safeLocalSet('school_lang', lang);
  }, [lang]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    const onQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('gmp-quota-exceeded', onQuota);
    };
  }, []);

  // Initialize & migrate local users cleanly to salted hashes (no plaintext stored, no local admin backdoor)
  useEffect(() => {
    let cancelled = false;
    const bootstrapUsers = async () => {
      const rawSaved = safeLocalGet<AuthUser[]>('registered_users', []);
      const migrated: AuthUser[] = [];
      for (const u of rawSaved) {
        if (!u || !u.userId || u.role === 'admin' || u.userId.toLowerCase() === 'admin') continue;
        let nextHash = u.passwordHash;
        if (!nextHash && u.password) {
          nextHash = await hashPassword(u.password);
        } else if (!nextHash && DEFAULT_DEMO_PASSWORDS[u.userId]) {
          nextHash = await hashPassword(DEFAULT_DEMO_PASSWORDS[u.userId]);
        }
        migrated.push({ ...stripPlaintextPassword(u), ...(nextHash ? { passwordHash: nextHash } : {}) });
      }
      for (const tmpl of SEEDED_USER_TEMPLATES) {
        if (!migrated.some((u) => u.userId.toLowerCase() === tmpl.userId.toLowerCase())) {
          const passwordHash = await hashPassword(DEFAULT_DEMO_PASSWORDS[tmpl.userId]);
          migrated.push({ ...tmpl, passwordHash });
        }
      }
      if (!cancelled) {
        setRegisteredUsers(migrated);
        safeLocalSet('registered_users', migrated);
      }
    };
    bootstrapUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep latest state ref for initial cloud seeding when admin connects
  const latestStateRef = useRef({
    notices,
    newsList,
    eventsList,
    teachers,
    ebooks,
    gallery,
    holidays,
    settings,
    onlineExams,
    examRoutines,
    subjects,
    alumni,
  });
  useEffect(() => {
    latestStateRef.current = {
      notices,
      newsList,
      eventsList,
      teachers,
      ebooks,
      gallery,
      holidays,
      settings,
      onlineExams,
      examRoutines,
      subjects,
      alumni,
    };
  }, [notices, newsList, eventsList, teachers, ebooks, gallery, holidays, settings, onlineExams, examRoutines, subjects, alumni]);

  useEffect(() => {
    const savedUser = safeLocalGet<AuthUser | null>('school_user', null);
    if (savedUser && savedUser.role !== 'admin') {
      setUser(stripPlaintextPassword(savedUser));
    } else if (savedUser?.role === 'admin') {
      localStorage.removeItem('school_user');
    }
    testFirestoreConnection();
  }, []);

  const syncFirebaseUserSession = async (fbUser: FirebaseUser | null) => {
    const seq = ++authSeqRef.current;
    setResolvedUid(null);

    if (!fbUser) {
      setFirebaseUser(null);
      setIsCloudAdmin(false);
      setIsCloudTeacher(false);
      setCloudUsers([]);
      return;
    }

    const isVerified = fbUser.emailVerified === true;
    if (!isVerified) {
      setIsCloudAdmin(false);
      setIsCloudTeacher(false);
      setCloudUsers([]);
      setFirebaseUser(fbUser);
      setResolvedUid(fbUser.uid);
      return;
    }

    const isBootstrap = fbUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
    let adminStatus = isBootstrap;

    if (!adminStatus) {
      try {
        const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
        adminStatus = adminSnap.exists();
      } catch {
        adminStatus = false;
      }
    }

    if (authSeqRef.current !== seq) return;

    let resolvedRole: BaseUserRole = adminStatus ? 'admin' : 'student';
    let extraChild: Partial<AuthUser> = {};

    const pendingKey = `pending_profile_${fbUser.uid}`;
    const pendingProfile = safeLocalGet<{
      name?: string;
      role?: 'student' | 'parent';
      photo?: string;
      linkedChildClass?: string;
      linkedChildRoll?: string;
    } | null>(pendingKey, null);

    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const initialRole: BaseUserRole = adminStatus
          ? 'admin'
          : pendingProfile?.role === 'parent'
          ? 'parent'
          : 'student';
        resolvedRole = initialRole;
        const safeName = (pendingProfile?.name || fbUser.displayName || fbUser.email || 'User').slice(0, 150);
        const safePhoto = (pendingProfile?.photo || fbUser.photoURL || '').slice(0, 600000);
        await setDoc(userRef, {
          uid: sanitizeFirestoreId(fbUser.uid),
          name: safeName,
          email: (fbUser.email || 'user@rbhs.edu').slice(0, 150),
          role: resolvedRole,
          ...(safePhoto ? { photo: safePhoto } : {}),
          ...(pendingProfile?.linkedChildClass ? { linkedChildClass: pendingProfile.linkedChildClass.slice(0, 16) } : {}),
          ...(pendingProfile?.linkedChildRoll ? { linkedChildRoll: pendingProfile.linkedChildRoll.slice(0, 20) } : {}),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        if (pendingProfile) {
          extraChild = {
            ...(pendingProfile.linkedChildClass ? { linkedChildClass: pendingProfile.linkedChildClass } : {}),
            ...(pendingProfile.linkedChildRoll ? { linkedChildRoll: pendingProfile.linkedChildRoll } : {}),
          };
          localStorage.removeItem(pendingKey);
        }
      } else {
        const d = userSnap.data();
        const docRole = d.role as BaseUserRole;
        resolvedRole = adminStatus ? 'admin' : (docRole || 'student');
        extraChild = {
          ...(d.linkedChildClass ? { linkedChildClass: d.linkedChildClass } : {}),
          ...(d.linkedChildRoll ? { linkedChildRoll: d.linkedChildRoll } : {}),
          ...(d.linkedChildName ? { linkedChildName: d.linkedChildName } : {}),
        };
        if (adminStatus && docRole !== 'admin') {
          await updateDoc(userRef, {
            role: 'admin',
            updatedAt: serverTimestamp(),
          });
        }
        if (pendingProfile) localStorage.removeItem(pendingKey);
      }

      if (authSeqRef.current !== seq) return;

      const userSnapAfter = userSnap.exists() ? userSnap.data() : null;
      const syncedAuthUser: AuthUser = {
        role: resolvedRole,
        name: pendingProfile?.name || userSnapAfter?.name || fbUser.displayName || fbUser.email || 'User',
        userId: fbUser.uid,
        email: fbUser.email || '',
        photo: pendingProfile?.photo || userSnapAfter?.photo || fbUser.photoURL || '',
        ...extraChild,
      };
      setUser(syncedAuthUser);
      safeLocalSet('school_user', syncedAuthUser);
    } catch (err) {
      console.warn('User profile sync skipped:', err);
    }

    if (authSeqRef.current !== seq) return;

    setIsCloudAdmin(adminStatus);
    setIsCloudTeacher(adminStatus || resolvedRole === 'teacher');
    setFirebaseUser(fbUser);
    setResolvedUid(fbUser.uid);
  };

  // Firebase Authentication & Admin/Teacher/Parent Role Detection
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      syncFirebaseUserSession(fbUser);
    });

    return () => unsubAuth();
  }, []);

  const safeListenerError = (err: unknown, op: OperationType, path: string) => {
    setDbStatus('error');
    try {
      handleFirestoreError(err, op, path);
    } catch {
      // Logged inside handleFirestoreError
    }
  };

  // Seed Firestore once if Cloud Admin signs in and cloud collections are still empty
  useEffect(() => {
    if (!isCloudAdmin || !firebaseUser || resolvedUid !== firebaseUser.uid) return;
    let cancelled = false;

    const seedCloudIfEmpty = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'main');
        const settingsSnap = await getDoc(settingsRef);
        if (cancelled || settingsSnap.exists()) return;

        setDbStatus('syncing');
        const cur = latestStateRef.current;
        const batch = writeBatch(db);

        batch.set(settingsRef, {
          name: { bn: (cur.settings.name?.bn || SCHOOL_NAME.bn).slice(0, 200), en: (cur.settings.name?.en || SCHOOL_NAME.en).slice(0, 200) },
          shortName: (cur.settings.shortName || INITIAL_SETTINGS.shortName || 'RBMB Digital Campus').slice(0, 100),
          tagline: {
            bn: (cur.settings.tagline?.bn || CAMPUS_TAGLINE.bn).slice(0, 300),
            en: (cur.settings.tagline?.en || CAMPUS_TAGLINE.en).slice(0, 300),
          },
          eiin: (cur.settings.eiin || INITIAL_SETTINGS.eiin).slice(0, 32),
          phone: (cur.settings.phone || INITIAL_SETTINGS.phone).slice(0, 40),
          email: (cur.settings.email && cur.settings.email.length >= 3 ? cur.settings.email : INITIAL_SETTINGS.email).slice(0, 150),
          location: { bn: (cur.settings.location?.bn || INITIAL_SETTINGS.location.bn).slice(0, 300), en: (cur.settings.location?.en || INITIAL_SETTINGS.location.en).slice(0, 300) },
          ...(cur.settings.schoolPhoto ? { schoolPhoto: cur.settings.schoolPhoto.slice(0, 600000) } : {}),
          ...(cur.settings.headTeacherName ? { headTeacherName: { bn: cur.settings.headTeacherName.bn.slice(0, 200), en: cur.settings.headTeacherName.en.slice(0, 200) } } : {}),
          ...(cur.settings.headTeacherMessage ? { headTeacherMessage: { bn: cur.settings.headTeacherMessage.bn.slice(0, 2500), en: cur.settings.headTeacherMessage.en.slice(0, 2500) } } : {}),
          ...(cur.settings.headTeacherPhoto ? { headTeacherPhoto: cur.settings.headTeacherPhoto.slice(0, 600000) } : {}),
          latitude: cur.settings.latitude ?? INITIAL_SETTINGS.latitude,
          longitude: cur.settings.longitude ?? INITIAL_SETTINGS.longitude,
          updatedAt: serverTimestamp(),
        });

        cur.notices.forEach((n) => {
          const id = sanitizeFirestoreId(n.id);
          batch.set(doc(db, 'notices', id), {
            id,
            title: { bn: (n.title?.bn || 'Notice').slice(0, 300), en: (n.title?.en || 'Notice').slice(0, 300) },
            date: (n.date && n.date.length >= 4 ? n.date : '2026-01-01').slice(0, 32),
            category: n.category || 'General',
            description: { bn: (n.description?.bn || '').slice(0, 5000), en: (n.description?.en || '').slice(0, 5000) },
            ...(n.pdfUrl ? { pdfUrl: n.pdfUrl.slice(0, 2000) } : {}),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.newsList.forEach((item) => {
          const id = sanitizeFirestoreId(item.id);
          batch.set(doc(db, 'news', id), {
            id,
            title: { bn: (item.title?.bn || 'News').slice(0, 300), en: (item.title?.en || 'News').slice(0, 300) },
            summary: { bn: (item.summary?.bn || '').slice(0, 600), en: (item.summary?.en || '').slice(0, 600) },
            content: { bn: (item.content?.bn || '').slice(0, 5000), en: (item.content?.en || '').slice(0, 5000) },
            category: item.category || 'Academic',
            date: (item.date && item.date.length >= 4 ? item.date : '2026-01-01').slice(0, 32),
            ...(item.imageUrl ? { imageUrl: item.imageUrl.slice(0, 600000) } : {}),
            ...(item.author ? { author: item.author.slice(0, 150) } : {}),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.eventsList.forEach((ev) => {
          const id = sanitizeFirestoreId(ev.id);
          batch.set(doc(db, 'events', id), {
            id,
            title: { bn: (ev.title?.bn || 'Event').slice(0, 300), en: (ev.title?.en || 'Event').slice(0, 300) },
            description: { bn: (ev.description?.bn || '').slice(0, 3000), en: (ev.description?.en || '').slice(0, 3000) },
            date: (ev.date && ev.date.length >= 4 ? ev.date : '2026-01-01').slice(0, 32),
            time: (ev.time || '10:00 AM').slice(0, 64),
            location: { bn: (ev.location?.bn || 'Campus').slice(0, 300), en: (ev.location?.en || 'Campus').slice(0, 300) },
            category: ev.category || 'Academic',
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.teachers.forEach((teach) => {
          const id = sanitizeFirestoreId(teach.id);
          batch.set(doc(db, 'teachers', id), {
            id,
            name: { bn: (teach.name?.bn || 'Teacher').slice(0, 200), en: (teach.name?.en || 'Teacher').slice(0, 200) },
            designation: { bn: (teach.designation?.bn || '').slice(0, 200), en: (teach.designation?.en || '').slice(0, 200) },
            subject: { bn: (teach.subject?.bn || '').slice(0, 200), en: (teach.subject?.en || '').slice(0, 200) },
            qualification: { bn: (teach.qualification?.bn || '').slice(0, 300), en: (teach.qualification?.en || '').slice(0, 300) },
            photo: (teach.photo || '').slice(0, 600000),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.ebooks.forEach((eb) => {
          const id = sanitizeFirestoreId(eb.id);
          batch.set(doc(db, 'ebooks', id), {
            id,
            title: { bn: (eb.title?.bn || 'Book').slice(0, 300), en: (eb.title?.en || 'Book').slice(0, 300) },
            classId: (eb.classId || '6').slice(0, 16),
            className: { bn: (eb.className?.bn || 'Class').slice(0, 100), en: (eb.className?.en || 'Class').slice(0, 100) },
            subject: (eb.subject || 'General').slice(0, 120),
            ...(eb.category ? { category: eb.category.slice(0, 40) } : {}),
            ...(eb.description ? { description: { bn: eb.description.bn.slice(0, 1500), en: eb.description.en.slice(0, 1500) } } : {}),
            coverUrl: (eb.coverUrl || '').slice(0, 600000),
            downloadUrl: (eb.downloadUrl || '#').slice(0, 2000),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.gallery.forEach((g) => {
          const id = sanitizeFirestoreId(g.id);
          batch.set(doc(db, 'gallery', id), {
            id,
            url: (g.url || '').slice(0, 600000),
            caption: { bn: (g.caption?.bn || '').slice(0, 400), en: (g.caption?.en || '').slice(0, 400) },
            ...(g.mediaType ? { mediaType: g.mediaType } : {}),
            ...(g.videoUrl ? { videoUrl: g.videoUrl.slice(0, 2000) } : {}),
            ...(g.category ? { category: g.category.slice(0, 32) } : {}),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.holidays.forEach((h) => {
          const id = sanitizeFirestoreId(h.id);
          batch.set(doc(db, 'holidays', id), {
            id,
            title: { bn: (h.title?.bn || 'Holiday').slice(0, 300), en: (h.title?.en || 'Holiday').slice(0, 300) },
            date: (h.date && h.date.length >= 4 ? h.date : '2026-01-01').slice(0, 32),
            duration: { bn: (h.duration?.bn || '১ দিন').slice(0, 100), en: (h.duration?.en || '1 Day').slice(0, 100) },
            type: h.type || 'National',
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.onlineExams.forEach((ex) => {
          const id = sanitizeFirestoreId(ex.id);
          batch.set(doc(db, 'onlineExams', id), {
            id,
            title: { bn: (ex.title?.bn || 'Exam').slice(0, 300), en: (ex.title?.en || 'Exam').slice(0, 300) },
            classId: ex.classId,
            subject: ex.subject.slice(0, 120),
            chapter: ex.chapter.slice(0, 200),
            durationMinutes: ex.durationMinutes,
            mode: ex.mode,
            questions: ex.questions,
            createdBy: ex.createdBy.slice(0, 150),
            date: ex.date.slice(0, 32),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.examRoutines.forEach((er) => {
          const id = sanitizeFirestoreId(er.id);
          batch.set(doc(db, 'examRoutines', id), {
            id,
            examTerm: er.examTerm.slice(0, 100),
            classId: er.classId,
            subject: er.subject.slice(0, 120),
            date: er.date.slice(0, 32),
            time: er.time.slice(0, 64),
            ...(er.room ? { room: er.room.slice(0, 64) } : {}),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.subjects.forEach((s) => {
          const id = sanitizeFirestoreId(s.id);
          batch.set(doc(db, 'subjects', id), {
            id,
            code: s.code.slice(0, 16),
            name: { bn: s.name.bn.slice(0, 200), en: s.name.en.slice(0, 200) },
            classId: s.classId,
            totalMarks: s.totalMarks,
            ...(s.teacherName ? { teacherName: s.teacherName.slice(0, 150) } : {}),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        cur.alumni.forEach((al) => {
          const id = sanitizeFirestoreId(al.id);
          batch.set(doc(db, 'alumni', id), {
            id,
            name: al.name.slice(0, 150),
            batchYear: al.batchYear.slice(0, 16),
            currentRole: al.currentRole.slice(0, 150),
            organization: al.organization.slice(0, 200),
            ...(al.city ? { city: al.city.slice(0, 100) } : {}),
            message: al.message.slice(0, 1000),
            status: al.status,
            isPublic: al.status === 'approved',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();
        setDbStatus('synced');
      } catch (err) {
        safeListenerError(err, OperationType.WRITE, 'initial-seed');
      }
    };

    seedCloudIfEmpty();
    return () => {
      cancelled = true;
    };
  }, [isCloudAdmin, firebaseUser, resolvedUid]);

  // Real-time Firestore Listeners for Public School Data
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          const nextSettings: SchoolSettings = {
            name: d.name || INITIAL_SETTINGS.name,
            shortName: d.shortName || INITIAL_SETTINGS.shortName,
            tagline: d.tagline || INITIAL_SETTINGS.tagline,
            eiin: d.eiin || INITIAL_SETTINGS.eiin,
            phone: d.phone || INITIAL_SETTINGS.phone,
            email: d.email || INITIAL_SETTINGS.email,
            location: d.location || INITIAL_SETTINGS.location,
            schoolPhoto: d.schoolPhoto || INITIAL_SETTINGS.schoolPhoto,
            headTeacherName: d.headTeacherName || INITIAL_SETTINGS.headTeacherName,
            headTeacherMessage: d.headTeacherMessage || INITIAL_SETTINGS.headTeacherMessage,
            headTeacherPhoto: d.headTeacherPhoto || INITIAL_SETTINGS.headTeacherPhoto,
            latitude: typeof d.latitude === 'number' ? d.latitude : INITIAL_SETTINGS.latitude,
            longitude: typeof d.longitude === 'number' ? d.longitude : INITIAL_SETTINGS.longitude,
          };
          setSettings(nextSettings);
          safeLocalSet('school_settings', nextSettings);
        }
      },
      (err) => console.warn('Settings listener warning:', err)
    );

    const unsubNotices = onSnapshot(
      query(collection(db, 'notices'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as Notice);
          items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setNotices(items);
          safeLocalSet('db_notices', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'notices')
    );

    const unsubNews = onSnapshot(
      query(collection(db, 'news'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as NewsArticle);
          items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setNewsList(items);
          safeLocalSet('db_news', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'news')
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as CampusEvent);
          items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
          setEventsList(items);
          safeLocalSet('db_events', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'events')
    );

    const unsubTeachers = onSnapshot(
      query(collection(db, 'teachers'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as Teacher);
          setTeachers(items);
          safeLocalSet('db_teachers', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'teachers')
    );

    const unsubEbooks = onSnapshot(
      query(collection(db, 'ebooks'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as EBook);
          setEbooks(items);
          safeLocalSet('db_ebooks', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'ebooks')
    );

    const unsubGallery = onSnapshot(
      query(collection(db, 'gallery'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as GalleryItem);
          setGallery(items);
          safeLocalSet('db_gallery', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'gallery')
    );

    const unsubHolidays = onSnapshot(
      query(collection(db, 'holidays'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as Holiday);
          items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
          setHolidays(items);
          safeLocalSet('db_holidays', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'holidays')
    );

    const unsubHomework = onSnapshot(
      query(collection(db, 'homework'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as HomeworkItem);
          items.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
          setHomeworkList(items);
          safeLocalSet('db_homework', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'homework')
    );

    const unsubOnlineExams = onSnapshot(
      query(collection(db, 'onlineExams'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as OnlineExamType);
          setOnlineExams(items);
          safeLocalSet('db_online_exams', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'onlineExams')
    );

    const unsubExamRoutines = onSnapshot(
      query(collection(db, 'examRoutines'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as ExamRoutineItem);
          items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
          setExamRoutines(items);
          safeLocalSet('db_exam_routines', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'examRoutines')
    );

    const unsubSubjects = onSnapshot(
      query(collection(db, 'subjects'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as SchoolSubject);
          setSubjects(items);
          safeLocalSet('db_subjects', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'subjects')
    );

    const unsubClassRoutines = onSnapshot(
      query(collection(db, 'classRoutines'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const byId = new Map<string, ClassRoutine>();
          CLASS_ROUTINES.forEach((cr) => byId.set(cr.classId, cr));
          snap.docs.forEach((d) => {
            const cr = d.data() as ClassRoutine;
            if (cr?.classId) byId.set(cr.classId, cr);
          });
          const merged = Array.from(byId.values()).sort((a, b) => Number(a.classId) - Number(b.classId));
          setClassRoutines(merged);
          safeLocalSet('db_class_routines', merged);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'classRoutines')
    );

    return () => {
      unsubSettings();
      unsubNotices();
      unsubNews();
      unsubEvents();
      unsubTeachers();
      unsubEbooks();
      unsubGallery();
      unsubHolidays();
      unsubHomework();
      unsubOnlineExams();
      unsubExamRoutines();
      unsubSubjects();
      unsubClassRoutines();
    };
  }, []);

  // Alumni listener (public approved for guests/non-admins, all for admin)
  useEffect(() => {
    const qRef = isCloudAdmin
      ? collection(db, 'alumni')
      : query(collection(db, 'alumni'), where('isPublic', '==', true), where('status', '==', 'approved'));

    const unsubAlumni = onSnapshot(
      qRef,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as AlumniProfile);
          setAlumni(items);
          safeLocalSet('db_alumni', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'alumni')
    );

    return () => unsubAlumni();
  }, [isCloudAdmin]);

  // Real-time Admin-only listeners
  useEffect(() => {
    if (!isCloudAdmin || !firebaseUser || resolvedUid !== firebaseUser.uid) return;

    const unsubAdmissions = onSnapshot(
      collection(db, 'admissions'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as AdmissionApplication);
        setAdmissions(items);
        safeLocalSet('admission_applications', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'admissions')
    );

    const unsubMessages = onSnapshot(
      collection(db, 'contactMessages'),
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: data.id,
            name: data.name,
            mobile: data.mobile,
            email: data.email || '',
            message: data.message,
            status: data.status,
            date: data.date || '',
          } as ContactMessage;
        });
        setContactMessages(items);
        safeLocalSet('contact_messages', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'contactMessages')
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as CloudUserProfile);
        setCloudUsers(items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'users')
    );

    const unsubAllTeacherLeaves = onSnapshot(
      collection(db, 'teacherLeaves'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as TeacherLeave);
        items.sort((a, b) => (b.submittedDate || '').localeCompare(a.submittedDate || ''));
        setTeacherLeaves(items);
        safeLocalSet('db_teacher_leaves', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'teacherLeaves')
    );

    const unsubAuditLogs = onSnapshot(
      query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'), limit(100)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as AuditLog);
        setAuditLogs(items);
        safeLocalSet('db_audit_logs', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'audit_logs')
    );

    return () => {
      unsubAdmissions();
      unsubMessages();
      unsubUsers();
      unsubAllTeacherLeaves();
      unsubAuditLogs();
    };
  }, [isCloudAdmin, firebaseUser, resolvedUid]);

  // Real-time Teacher / Student / Parent listeners
  useEffect(() => {
    if (!firebaseUser?.emailVerified || resolvedUid !== firebaseUser.uid) return;

    if (isCloudTeacher) {
      const unsubStudents = onSnapshot(
        collection(db, 'students'),
        (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map((d) => d.data() as SchoolStudent);
            setStudents(items);
            safeLocalSet('db_students', items);
          }
        },
        (err) => safeListenerError(err, OperationType.LIST, 'students')
      );

      const unsubAttendance = onSnapshot(
        collection(db, 'attendance'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as AttendanceRecord);
          setAttendanceRecords(items);
          safeLocalSet('db_attendance', items);
        },
        (err) => safeListenerError(err, OperationType.LIST, 'attendance')
      );

      const unsubStudentAttendance = onSnapshot(
        collection(db, 'studentAttendance'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as StudentAttendanceRecord);
          setStudentAttendance(items);
          safeLocalSet('db_student_attendance', items);
        },
        (err) => safeListenerError(err, OperationType.LIST, 'studentAttendance')
      );

      const unsubMarks = onSnapshot(
        collection(db, 'examMarks'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as ExamMark);
          setExamMarks(items);
          safeLocalSet('db_exam_marks', items);
        },
        (err) => safeListenerError(err, OperationType.LIST, 'examMarks')
      );

      const unsubSubmissions = onSnapshot(
        collection(db, 'assignmentSubmissions'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as AssignmentSubmission);
          setAssignmentSubmissions(items);
          safeLocalSet('db_assignment_submissions', items);
        },
        (err) => safeListenerError(err, OperationType.LIST, 'assignmentSubmissions')
      );

      const unsubAttempts = onSnapshot(
        collection(db, 'examAttempts'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as ExamAttempt);
          setExamAttempts(items);
          safeLocalSet('db_exam_attempts', items);
        },
        (err) => safeListenerError(err, OperationType.LIST, 'examAttempts')
      );

      const unsubParentMsgs = onSnapshot(
        collection(db, 'parentMessages'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as ParentMessage);
          setParentMessages(items);
          safeLocalSet('db_parent_messages', items);
        },
        (err) => safeListenerError(err, OperationType.LIST, 'parentMessages')
      );

      const unsubParentLinks = onSnapshot(
        collection(db, 'parent_student_links'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as ParentStudentLink);
          items.sort((a, b) => (b.submittedDate || '').localeCompare(a.submittedDate || ''));
          setParentLinks(items);
          safeLocalSet('db_parent_links', items);
        },
        (err) => safeListenerError(err, OperationType.LIST, 'parent_student_links')
      );

      const unsubStudentLeaves = onSnapshot(
        collection(db, 'studentLeaves'),
        (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map((d) => d.data() as StudentLeave);
            items.sort((a, b) => (b.submittedDate || '').localeCompare(a.submittedDate || ''));
            setStudentLeaves(items);
            safeLocalSet('db_student_leaves', items);
          }
        },
        (err) => safeListenerError(err, OperationType.LIST, 'studentLeaves')
      );

      const unsubFeeRecords = onSnapshot(
        collection(db, 'fee_records'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as FeeRecord);
          items.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
          setFeeRecords(items);
          safeLocalSet('db_fee_records', items);
        },
        (err) => safeListenerError(err, OperationType.LIST, 'fee_records')
      );

      const unsubPortalNotifications = onSnapshot(
        collection(db, 'portal_notifications'),
        (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map((d) => d.data() as PortalNotification);
            items.sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
            setPortalNotifications(items);
            safeLocalSet('db_portal_notifications', items);
          }
        },
        (err) => safeListenerError(err, OperationType.LIST, 'portal_notifications')
      );

      let unsubOwnTeacherLeaves = () => {};
      if (!isCloudAdmin) {
        unsubOwnTeacherLeaves = onSnapshot(
          query(collection(db, 'teacherLeaves'), where('ownerUid', '==', firebaseUser.uid)),
          (snap) => {
            const items = snap.docs.map((d) => d.data() as TeacherLeave);
            setTeacherLeaves(items);
            safeLocalSet('db_teacher_leaves', items);
          },
          (err) => safeListenerError(err, OperationType.LIST, 'teacherLeaves')
        );
      }

      return () => {
        unsubStudents();
        unsubAttendance();
        unsubStudentAttendance();
        unsubMarks();
        unsubSubmissions();
        unsubAttempts();
        unsubParentMsgs();
        unsubParentLinks();
        unsubStudentLeaves();
        unsubFeeRecords();
        unsubPortalNotifications();
        unsubOwnTeacherLeaves();
      };
    }

    // Signed-in Student / Parent listeners (Strict Zero-Trust per-student isolation via allowedUids & ownerUid)
    const unsubMyStudents = onSnapshot(
      query(collection(db, 'students'), where('allowedUids', 'array-contains', firebaseUser.uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as SchoolStudent);
        setStudents(items);
        safeLocalSet('db_students', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'students')
    );

    const unsubMyAttendance = onSnapshot(
      query(
        collection(db, 'studentAttendance'),
        where('allowedUids', 'array-contains', firebaseUser.uid),
        where('isPublished', '==', true)
      ),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as StudentAttendanceRecord);
        items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setStudentAttendance(items);
        safeLocalSet('db_student_attendance', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'studentAttendance')
    );

    const unsubPubMarks = onSnapshot(
      query(
        collection(db, 'examMarks'),
        where('allowedUids', 'array-contains', firebaseUser.uid),
        where('isPublished', '==', true)
      ),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as ExamMark);
        setExamMarks(items);
        safeLocalSet('db_exam_marks', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'examMarks')
    );

    const unsubMyParentLinks = onSnapshot(
      query(collection(db, 'parent_student_links'), where('parentUid', '==', firebaseUser.uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as ParentStudentLink);
        items.sort((a, b) => (b.submittedDate || '').localeCompare(a.submittedDate || ''));
        setParentLinks(items);
        safeLocalSet('db_parent_links', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'parent_student_links')
    );

    const unsubOwnLeaves = onSnapshot(
      query(collection(db, 'studentLeaves'), where('ownerUid', '==', firebaseUser.uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as StudentLeave);
        setStudentLeaves(items);
        safeLocalSet('db_student_leaves', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'studentLeaves')
    );

    const unsubOwnSubmissions = onSnapshot(
      query(collection(db, 'assignmentSubmissions'), where('ownerUid', '==', firebaseUser.uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as AssignmentSubmission);
        setAssignmentSubmissions(items);
        safeLocalSet('db_assignment_submissions', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'assignmentSubmissions')
    );

    const unsubOwnAttempts = onSnapshot(
      query(collection(db, 'examAttempts'), where('ownerUid', '==', firebaseUser.uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as ExamAttempt);
        setExamAttempts(items);
        safeLocalSet('db_exam_attempts', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'examAttempts')
    );

    const unsubOwnParentMsgs = onSnapshot(
      query(collection(db, 'parentMessages'), where('ownerUid', '==', firebaseUser.uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as ParentMessage);
        setParentMessages(items);
        safeLocalSet('db_parent_messages', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'parentMessages')
    );

    const unsubOwnFeeRecords = onSnapshot(
      query(collection(db, 'fee_records'), where('allowedUids', 'array-contains', firebaseUser.uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as FeeRecord);
        items.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
        setFeeRecords(items);
        safeLocalSet('db_fee_records', items);
      },
      (err) => safeListenerError(err, OperationType.LIST, 'fee_records')
    );

    const unsubPortalAlerts = onSnapshot(
      collection(db, 'portal_notifications'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as PortalNotification);
          items.sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
          setPortalNotifications(items);
          safeLocalSet('db_portal_notifications', items);
        }
      },
      (err) => safeListenerError(err, OperationType.LIST, 'portal_notifications')
    );

    return () => {
      unsubMyStudents();
      unsubMyAttendance();
      unsubPubMarks();
      unsubMyParentLinks();
      unsubOwnLeaves();
      unsubOwnSubmissions();
      unsubOwnAttempts();
      unsubOwnParentMsgs();
      unsubOwnFeeRecords();
      unsubPortalAlerts();
    };
  }, [firebaseUser, resolvedUid, isCloudTeacher, isCloudAdmin]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const persistLocal = (key: string, data: unknown) => {
    setDbStatus('syncing');
    safeLocalSet(key, data);
    setTimeout(() => setDbStatus('synced'), 300);
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      return false;
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string; needsVerification?: boolean }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await cred.user.reload();
      if (!cred.user.emailVerified) {
        setFirebaseUser(cred.user);
        return {
          ok: false,
          needsVerification: true,
          error:
            lang === 'bn'
              ? 'লগইন সম্পন্ন করতে আপনার ইমেইল ভেরিফাই করুন।'
              : 'Please verify your email address before accessing your portal.',
        };
      }
      await syncFirebaseUserSession(cred.user);
      return { ok: true };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        return {
          ok: false,
          error: lang === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড।' : 'Invalid email or password.',
        };
      }
      if (code === 'auth/operation-not-allowed') {
        return {
          ok: false,
          error:
            lang === 'bn'
              ? 'Firebase Console-এ Email/Password লগইন সক্রিয় করুন।'
              : 'Email/Password sign-in is disabled in Firebase Console.',
        };
      }
      return {
        ok: false,
        error: lang === 'bn' ? 'ইমেইল দিয়ে লগইন করা যায়নি।' : 'Email sign-in failed. Please try again.',
      };
    }
  };

  const registerWithEmail = async (payload: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'parent';
    photo?: string;
    linkedChildClass?: string;
    linkedChildRoll?: string;
  }): Promise<{ ok: boolean; error?: string; needsVerification?: boolean }> => {
    const cleanEmail = payload.email.trim();
    const cleanName = payload.name.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: lang === 'bn' ? 'সঠিক ইমেইল দিন।' : 'Please enter a valid email address.' };
    }
    if (payload.password.length < 6) {
      return {
        ok: false,
        error: lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.',
      };
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, payload.password);
      await updateProfile(cred.user, { displayName: cleanName.slice(0, 150) });
      safeLocalSet(`pending_profile_${cred.user.uid}`, {
        name: cleanName.slice(0, 150),
        role: payload.role === 'parent' ? 'parent' : 'student',
        ...(payload.photo ? { photo: payload.photo.slice(0, 600000) } : {}),
        ...(payload.linkedChildClass ? { linkedChildClass: payload.linkedChildClass.slice(0, 16) } : {}),
        ...(payload.linkedChildRoll ? { linkedChildRoll: payload.linkedChildRoll.slice(0, 20) } : {}),
      });
      await sendEmailVerification(cred.user);
      setFirebaseUser(cred.user);
      return { ok: true, needsVerification: true };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/email-already-in-use') {
        return {
          ok: false,
          error: lang === 'bn' ? 'এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট রয়েছে!' : 'An account with this email already exists.',
        };
      }
      if (code === 'auth/weak-password') {
        return {
          ok: false,
          error: lang === 'bn' ? 'পাসওয়ার্ডটি আরও শক্তিশালী করুন (কমপক্ষে ৬ অক্ষর)।' : 'Password should be at least 6 characters.',
        };
      }
      if (code === 'auth/operation-not-allowed') {
        return {
          ok: false,
          error:
            lang === 'bn'
              ? 'Firebase Console থেকে Email/Password পদ্ধতি চালু করুন।'
              : 'Email/Password authentication is not enabled in Firebase Console yet.',
        };
      }
      return {
        ok: false,
        error: lang === 'bn' ? 'নিবন্ধন সম্পন্ন করা যায়নি।' : 'Registration failed. Please try again.',
      };
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    try {
      if (!auth.currentUser) return false;
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (err) {
      console.error('Resend verification failed:', err);
      return false;
    }
  };

  const refreshAuthSession = async (): Promise<boolean> => {
    try {
      if (!auth.currentUser) return false;
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        await syncFirebaseUserSession(auth.currentUser);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Refresh auth failed:', err);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return {
        ok: false,
        error: lang === 'bn' ? 'রিসেট লিংক পেতে ইমেইল লিখুন।' : 'Enter your registered email address first.',
      };
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: lang === 'bn' ? 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো যায়নি।' : 'Could not send password reset email.',
      };
    }
  };

  const logoutGoogle = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Google Sign-Out failed:', err);
    }
  };

  const login = (authUser: AuthUser) => {
    if (authUser.role === 'admin') return;
    const clean = stripPlaintextPassword(authUser);
    setUser(clean);
    safeLocalSet('school_user', clean);
  };

  const verifyLocalCredentials = async (
    userId: string,
    password: string,
    role: BaseUserRole
  ): Promise<AuthUser | null> => {
    // Admin access must strictly authenticate via verified Firebase Auth
    if (role === 'admin') return null;
    const found = registeredUsers.find(
      (u) => u.userId.toLowerCase() === userId.trim().toLowerCase() && u.role === role
    );
    if (!found) return null;
    const valid = await verifyPassword(password, found.passwordHash || found.password);
    if (!valid) return null;
    return stripPlaintextPassword(found);
  };

  const register = async (newUser: AuthUser): Promise<boolean> => {
    if (newUser.role === 'admin' || newUser.userId.trim().toLowerCase() === 'admin') {
      return false;
    }
    if (registeredUsers.some((u) => u.userId.toLowerCase() === newUser.userId.trim().toLowerCase())) {
      return false;
    }
    const passwordHash = newUser.passwordHash || (newUser.password ? await hashPassword(newUser.password) : await hashPassword('123456'));
    const safeUser: AuthUser = {
      ...stripPlaintextPassword(newUser),
      userId: newUser.userId.trim(),
      passwordHash,
    };
    const updated = [...registeredUsers, safeUser];
    setRegisteredUsers(updated);
    persistLocal('registered_users', updated);
    return true;
  };

  const updateUser = async (updatedUser: AuthUser) => {
    let nextHash = updatedUser.passwordHash;
    if (updatedUser.password && updatedUser.password.trim().length > 0) {
      nextHash = await hashPassword(updatedUser.password.trim());
    }
    const cleanInput = stripPlaintextPassword(updatedUser);
    const updated = registeredUsers.map((u) => {
      if (u.userId !== cleanInput.userId) return u;
      return {
        ...u,
        ...cleanInput,
        passwordHash: nextHash || u.passwordHash,
      };
    });
    setRegisteredUsers(updated);
    persistLocal('registered_users', updated);

    if (user?.userId === cleanInput.userId) {
      const mergedSession: AuthUser = { ...user, ...cleanInput };
      setUser(mergedSession);
      safeLocalSet('school_user', mergedSession);
    }

    if (firebaseUser?.emailVerified && firebaseUser.uid === cleanInput.userId) {
      try {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          name: cleanInput.name.slice(0, 150),
          email: (cleanInput.email || firebaseUser.email || 'user@rbhs.edu').slice(0, 150),
          ...(cleanInput.photo ? { photo: cleanInput.photo.slice(0, 600000) } : {}),
          ...(cleanInput.linkedChildClass ? { linkedChildClass: cleanInput.linkedChildClass.slice(0, 16) } : {}),
          ...(cleanInput.linkedChildRoll ? { linkedChildRoll: cleanInput.linkedChildRoll.slice(0, 20) } : {}),
          ...(cleanInput.linkedChildName ? { linkedChildName: cleanInput.linkedChildName.slice(0, 150) } : {}),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Cloud profile update skipped:', err);
      }
    }
  };

  const deleteUser = (userId: string) => {
    if (userId === 'admin') return;
    const updated = registeredUsers.filter((u) => u.userId !== userId);
    setRegisteredUsers(updated);
    persistLocal('registered_users', updated);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_user');
    if (firebaseUser) {
      logoutGoogle();
    }
  };

  const logAuditEvent = async (
    action: AuditAction,
    targetCollection: string,
    targetId: string,
    summary: string
  ) => {
    const id = sanitizeFirestoreId(`aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    const entry: AuditLog = {
      id,
      actorUid: sanitizeFirestoreId(firebaseUser?.uid || user?.userId || 'system'),
      actorName: (user?.name || firebaseUser?.displayName || 'Staff').slice(0, 150),
      actorEmail: (firebaseUser?.email || user?.email || 'staff@rbhs.edu').slice(0, 150),
      actorRole: (user?.role || (isCloudAdmin ? 'admin' : 'teacher')) as BaseUserRole,
      action,
      targetCollection: targetCollection.slice(0, 64),
      targetId: sanitizeFirestoreId(targetId).slice(0, 128),
      summary: summary.slice(0, 500),
      createdDate: new Date().toISOString().split('T')[0],
    };

    const nextLocal = [entry, ...auditLogs].slice(0, 100);
    setAuditLogs(nextLocal);
    safeLocalSet('db_audit_logs', nextLocal);

    if (isCloudTeacher && firebaseUser?.emailVerified) {
      try {
        await setDoc(doc(db, 'audit_logs', id), {
          id,
          actorUid: sanitizeFirestoreId(firebaseUser.uid),
          actorName: entry.actorName,
          actorEmail: entry.actorEmail,
          actorRole: entry.actorRole,
          action: entry.action,
          targetCollection: entry.targetCollection,
          targetId: entry.targetId,
          summary: entry.summary,
          createdDate: entry.createdDate,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Audit log write skipped:', err);
      }
    }
  };

  const updateCloudUserRole = async (uid: string, role: BaseUserRole) => {
    if (!isCloudAdmin) return;
    const safeUid = sanitizeFirestoreId(uid);
    const targetUser = cloudUsers.find((cu) => cu.uid === uid || cu.uid === safeUid);
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'users', safeUid), {
        role,
        updatedAt: serverTimestamp(),
      });

      const isBootstrappedCaller =
        firebaseUser?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
      if (isBootstrappedCaller) {
        if (role === 'admin') {
          await setDoc(doc(db, 'admins', safeUid), {
            uid: safeUid,
            email: (targetUser?.email || 'admin@rbhs.edu').slice(0, 150),
            grantedAt: serverTimestamp(),
          });
        } else if (targetUser?.email?.toLowerCase() !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
          await deleteDoc(doc(db, 'admins', safeUid)).catch(() => {});
        }
      }

      await logAuditEvent(
        'ROLE_CHANGED',
        'users',
        safeUid,
        `Updated user ${targetUser?.email || safeUid} role to ${role}`
      );
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  // Cloud + Local CRUD helpers
  const syncDocUpsert = async (
    collectionName: string,
    id: string,
    payload: Record<string, unknown>,
    isUpdate: boolean,
    allowTeacher = false
  ) => {
    if (allowTeacher ? !isCloudTeacher : !isCloudAdmin) return;
    setDbStatus('syncing');
    const docRef = doc(db, collectionName, id);
    try {
      if (isUpdate) {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
      } else {
        await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, `${collectionName}/${id}`);
    }
  };

  const syncDocDelete = async (collectionName: string, id: string, allowTeacher = false) => {
    if (allowTeacher ? !isCloudTeacher : !isCloudAdmin) return;
    setDbStatus('syncing');
    try {
      await deleteDoc(doc(db, collectionName, id));
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  // Notices (Teacher + Admin can publish/edit)
  const addNotice = (n: Notice) => {
    const id = sanitizeFirestoreId(n.id);
    const item = { ...n, id };
    const updated = [item, ...notices];
    setNotices(updated);
    persistLocal('db_notices', updated);
    syncDocUpsert(
      'notices',
      id,
      {
        id,
        title: { bn: n.title.bn.slice(0, 300), en: n.title.en.slice(0, 300) },
        date: n.date.slice(0, 32),
        category: n.category,
        description: { bn: n.description.bn.slice(0, 5000), en: n.description.en.slice(0, 5000) },
        ...(n.pdfUrl ? { pdfUrl: n.pdfUrl.slice(0, 2000) } : {}),
        isPublic: true,
      },
      false,
      true
    );
  };

  const updateNotice = (n: Notice) => {
    const id = sanitizeFirestoreId(n.id);
    const updated = notices.map((i) => (i.id === n.id ? { ...n, id } : i));
    setNotices(updated);
    persistLocal('db_notices', updated);
    syncDocUpsert(
      'notices',
      id,
      {
        id,
        title: { bn: n.title.bn.slice(0, 300), en: n.title.en.slice(0, 300) },
        date: n.date.slice(0, 32),
        category: n.category,
        description: { bn: n.description.bn.slice(0, 5000), en: n.description.en.slice(0, 5000) },
        ...(n.pdfUrl ? { pdfUrl: n.pdfUrl.slice(0, 2000) } : {}),
        isPublic: true,
      },
      true,
      true
    );
  };

  const deleteNotice = (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    setNotices(updated);
    persistLocal('db_notices', updated);
    syncDocDelete('notices', sanitizeFirestoreId(id));
  };

  // News Articles (Teacher + Admin can publish/edit)
  const addNews = (item: NewsArticle) => {
    const id = sanitizeFirestoreId(item.id);
    const clean = { ...item, id, isPublic: true };
    const updated = [clean, ...newsList];
    setNewsList(updated);
    persistLocal('db_news', updated);
    syncDocUpsert(
      'news',
      id,
      {
        id,
        title: { bn: clean.title.bn.slice(0, 300), en: clean.title.en.slice(0, 300) },
        summary: { bn: clean.summary.bn.slice(0, 600), en: clean.summary.en.slice(0, 600) },
        content: { bn: clean.content.bn.slice(0, 5000), en: clean.content.en.slice(0, 5000) },
        category: clean.category,
        date: clean.date.slice(0, 32),
        ...(clean.imageUrl ? { imageUrl: clean.imageUrl.slice(0, 600000) } : {}),
        ...(clean.author ? { author: clean.author.slice(0, 150) } : {}),
        isPublic: true,
      },
      false,
      true
    );
  };

  const updateNews = (item: NewsArticle) => {
    const id = sanitizeFirestoreId(item.id);
    const clean = { ...item, id, isPublic: true };
    const updated = newsList.map((i) => (i.id === item.id ? clean : i));
    setNewsList(updated);
    persistLocal('db_news', updated);
    syncDocUpsert(
      'news',
      id,
      {
        id,
        title: { bn: clean.title.bn.slice(0, 300), en: clean.title.en.slice(0, 300) },
        summary: { bn: clean.summary.bn.slice(0, 600), en: clean.summary.en.slice(0, 600) },
        content: { bn: clean.content.bn.slice(0, 5000), en: clean.content.en.slice(0, 5000) },
        category: clean.category,
        date: clean.date.slice(0, 32),
        ...(clean.imageUrl ? { imageUrl: clean.imageUrl.slice(0, 600000) } : {}),
        ...(clean.author ? { author: clean.author.slice(0, 150) } : {}),
        isPublic: true,
      },
      true,
      true
    );
  };

  const deleteNews = (id: string) => {
    const updated = newsList.filter((i) => i.id !== id);
    setNewsList(updated);
    persistLocal('db_news', updated);
    syncDocDelete('news', sanitizeFirestoreId(id));
  };

  // Campus Events (Teacher + Admin can publish/edit)
  const addEvent = (ev: CampusEvent) => {
    const id = sanitizeFirestoreId(ev.id);
    const clean = { ...ev, id, isPublic: true };
    const updated = [clean, ...eventsList];
    setEventsList(updated);
    persistLocal('db_events', updated);
    syncDocUpsert(
      'events',
      id,
      {
        id,
        title: { bn: clean.title.bn.slice(0, 300), en: clean.title.en.slice(0, 300) },
        description: { bn: clean.description.bn.slice(0, 3000), en: clean.description.en.slice(0, 3000) },
        date: clean.date.slice(0, 32),
        time: clean.time.slice(0, 64),
        location: { bn: clean.location.bn.slice(0, 300), en: clean.location.en.slice(0, 300) },
        category: clean.category,
        isPublic: true,
      },
      false,
      true
    );
  };

  const updateEvent = (ev: CampusEvent) => {
    const id = sanitizeFirestoreId(ev.id);
    const clean = { ...ev, id, isPublic: true };
    const updated = eventsList.map((i) => (i.id === ev.id ? clean : i));
    setEventsList(updated);
    persistLocal('db_events', updated);
    syncDocUpsert(
      'events',
      id,
      {
        id,
        title: { bn: clean.title.bn.slice(0, 300), en: clean.title.en.slice(0, 300) },
        description: { bn: clean.description.bn.slice(0, 3000), en: clean.description.en.slice(0, 3000) },
        date: clean.date.slice(0, 32),
        time: clean.time.slice(0, 64),
        location: { bn: clean.location.bn.slice(0, 300), en: clean.location.en.slice(0, 300) },
        category: clean.category,
        isPublic: true,
      },
      true,
      true
    );
  };

  const deleteEvent = (id: string) => {
    const updated = eventsList.filter((i) => i.id !== id);
    setEventsList(updated);
    persistLocal('db_events', updated);
    syncDocDelete('events', sanitizeFirestoreId(id));
  };

  // Teachers
  const addTeacher = (teach: Teacher) => {
    const id = sanitizeFirestoreId(teach.id);
    const item = { ...teach, id };
    const updated = [...teachers, item];
    setTeachers(updated);
    persistLocal('db_teachers', updated);
    syncDocUpsert(
      'teachers',
      id,
      {
        id,
        name: { bn: teach.name.bn.slice(0, 200), en: teach.name.en.slice(0, 200) },
        designation: { bn: teach.designation.bn.slice(0, 200), en: teach.designation.en.slice(0, 200) },
        subject: { bn: teach.subject.bn.slice(0, 200), en: teach.subject.en.slice(0, 200) },
        qualification: { bn: teach.qualification.bn.slice(0, 300), en: teach.qualification.en.slice(0, 300) },
        photo: (teach.photo || '').slice(0, 600000),
        isPublic: true,
      },
      false
    );
  };

  const updateTeacher = (teach: Teacher) => {
    const id = sanitizeFirestoreId(teach.id);
    const updated = teachers.map((i) => (i.id === teach.id ? { ...teach, id } : i));
    setTeachers(updated);
    persistLocal('db_teachers', updated);
    syncDocUpsert(
      'teachers',
      id,
      {
        id,
        name: { bn: teach.name.bn.slice(0, 200), en: teach.name.en.slice(0, 200) },
        designation: { bn: teach.designation.bn.slice(0, 200), en: teach.designation.en.slice(0, 200) },
        subject: { bn: teach.subject.bn.slice(0, 200), en: teach.subject.en.slice(0, 200) },
        qualification: { bn: teach.qualification.bn.slice(0, 300), en: teach.qualification.en.slice(0, 300) },
        photo: (teach.photo || '').slice(0, 600000),
        isPublic: true,
      },
      true
    );
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter((tc) => tc.id !== id);
    setTeachers(updated);
    persistLocal('db_teachers', updated);
    syncDocDelete('teachers', sanitizeFirestoreId(id));
  };

  // E-Books / Digital Library (Teacher + Admin can add/update)
  const addEbook = (b: EBook) => {
    const id = sanitizeFirestoreId(b.id);
    const item = { ...b, id };
    const updated = [item, ...ebooks];
    setEbooks(updated);
    persistLocal('db_ebooks', updated);
    syncDocUpsert(
      'ebooks',
      id,
      {
        id,
        title: { bn: b.title.bn.slice(0, 300), en: b.title.en.slice(0, 300) },
        classId: b.classId.slice(0, 16),
        className: { bn: b.className.bn.slice(0, 100), en: b.className.en.slice(0, 100) },
        subject: b.subject.slice(0, 120),
        ...(b.category ? { category: b.category.slice(0, 40) } : {}),
        ...(b.description ? { description: { bn: b.description.bn.slice(0, 1500), en: b.description.en.slice(0, 1500) } } : {}),
        coverUrl: (b.coverUrl || '').slice(0, 600000),
        downloadUrl: (b.downloadUrl || '#').slice(0, 2000),
        isPublic: true,
      },
      false,
      true
    );
  };

  const updateEbook = (b: EBook) => {
    const id = sanitizeFirestoreId(b.id);
    const updated = ebooks.map((i) => (i.id === b.id ? { ...b, id } : i));
    setEbooks(updated);
    persistLocal('db_ebooks', updated);
    syncDocUpsert(
      'ebooks',
      id,
      {
        id,
        title: { bn: b.title.bn.slice(0, 300), en: b.title.en.slice(0, 300) },
        classId: b.classId.slice(0, 16),
        className: { bn: b.className.bn.slice(0, 100), en: b.className.en.slice(0, 100) },
        subject: b.subject.slice(0, 120),
        ...(b.category ? { category: b.category.slice(0, 40) } : {}),
        ...(b.description ? { description: { bn: b.description.bn.slice(0, 1500), en: b.description.en.slice(0, 1500) } } : {}),
        coverUrl: (b.coverUrl || '').slice(0, 600000),
        downloadUrl: (b.downloadUrl || '#').slice(0, 2000),
        isPublic: true,
      },
      true,
      true
    );
  };

  const deleteEbook = (id: string) => {
    const updated = ebooks.filter((b) => b.id !== id);
    setEbooks(updated);
    persistLocal('db_ebooks', updated);
    syncDocDelete('ebooks', sanitizeFirestoreId(id));
  };

  // Gallery
  const addGalleryItem = (i: GalleryItem) => {
    const id = sanitizeFirestoreId(i.id);
    const item = { ...i, id };
    const updated = [item, ...gallery];
    setGallery(updated);
    persistLocal('db_gallery', updated);
    syncDocUpsert(
      'gallery',
      id,
      {
        id,
        url: (i.url || '').slice(0, 600000),
        caption: { bn: i.caption.bn.slice(0, 400), en: i.caption.en.slice(0, 400) },
        ...(i.mediaType ? { mediaType: i.mediaType } : {}),
        ...(i.videoUrl ? { videoUrl: i.videoUrl.slice(0, 2000) } : {}),
        ...(i.category ? { category: i.category.slice(0, 32) } : {}),
        isPublic: true,
      },
      false
    );
  };

  const updateGalleryItem = (i: GalleryItem) => {
    const id = sanitizeFirestoreId(i.id);
    const updated = gallery.map((item) => (item.id === i.id ? { ...i, id } : item));
    setGallery(updated);
    persistLocal('db_gallery', updated);
    syncDocUpsert(
      'gallery',
      id,
      {
        id,
        url: (i.url || '').slice(0, 600000),
        caption: { bn: i.caption.bn.slice(0, 400), en: i.caption.en.slice(0, 400) },
        ...(i.mediaType ? { mediaType: i.mediaType } : {}),
        ...(i.videoUrl ? { videoUrl: i.videoUrl.slice(0, 2000) } : {}),
        ...(i.category ? { category: i.category.slice(0, 32) } : {}),
        isPublic: true,
      },
      true
    );
  };

  const deleteGalleryItem = (id: string) => {
    const updated = gallery.filter((i) => i.id !== id);
    setGallery(updated);
    persistLocal('db_gallery', updated);
    syncDocDelete('gallery', sanitizeFirestoreId(id));
  };

  // Holidays
  const addHoliday = (h: Holiday) => {
    const id = sanitizeFirestoreId(h.id);
    const item = { ...h, id };
    const updated = [...holidays, item];
    setHolidays(updated);
    persistLocal('db_holidays', updated);
    syncDocUpsert(
      'holidays',
      id,
      {
        id,
        title: { bn: h.title.bn.slice(0, 300), en: h.title.en.slice(0, 300) },
        date: h.date.slice(0, 32),
        duration: { bn: h.duration.bn.slice(0, 100), en: h.duration.en.slice(0, 100) },
        type: h.type,
        isPublic: true,
      },
      false
    );
  };

  const updateHoliday = (h: Holiday) => {
    const id = sanitizeFirestoreId(h.id);
    const updated = holidays.map((i) => (i.id === h.id ? { ...h, id } : i));
    setHolidays(updated);
    persistLocal('db_holidays', updated);
    syncDocUpsert(
      'holidays',
      id,
      {
        id,
        title: { bn: h.title.bn.slice(0, 300), en: h.title.en.slice(0, 300) },
        date: h.date.slice(0, 32),
        duration: { bn: h.duration.bn.slice(0, 100), en: h.duration.en.slice(0, 100) },
        type: h.type,
        isPublic: true,
      },
      true
    );
  };

  const deleteHoliday = (id: string) => {
    const updated = holidays.filter((h) => h.id !== id);
    setHolidays(updated);
    persistLocal('db_holidays', updated);
    syncDocDelete('holidays', sanitizeFirestoreId(id));
  };

  // School & Head Teacher Settings
  const updateSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    persistLocal('school_settings', newSettings);
    if (isCloudAdmin) {
      setDbStatus('syncing');
      setDoc(doc(db, 'settings', 'main'), {
        name: { bn: (newSettings.name?.bn || SCHOOL_NAME.bn).slice(0, 200), en: (newSettings.name?.en || SCHOOL_NAME.en).slice(0, 200) },
        ...(newSettings.shortName ? { shortName: newSettings.shortName.slice(0, 100) } : {}),
        ...(newSettings.tagline ? { tagline: { bn: newSettings.tagline.bn.slice(0, 300), en: newSettings.tagline.en.slice(0, 300) } } : {}),
        eiin: (newSettings.eiin || INITIAL_SETTINGS.eiin).slice(0, 32),
        phone: (newSettings.phone || INITIAL_SETTINGS.phone).slice(0, 40),
        email: (newSettings.email && newSettings.email.length >= 3 ? newSettings.email : INITIAL_SETTINGS.email).slice(0, 150),
        location: { bn: (newSettings.location?.bn || INITIAL_SETTINGS.location.bn).slice(0, 300), en: (newSettings.location?.en || INITIAL_SETTINGS.location.en).slice(0, 300) },
        ...(newSettings.schoolPhoto ? { schoolPhoto: newSettings.schoolPhoto.slice(0, 600000) } : {}),
        ...(newSettings.headTeacherName ? { headTeacherName: { bn: newSettings.headTeacherName.bn.slice(0, 200), en: newSettings.headTeacherName.en.slice(0, 200) } } : {}),
        ...(newSettings.headTeacherMessage ? { headTeacherMessage: { bn: newSettings.headTeacherMessage.bn.slice(0, 2500), en: newSettings.headTeacherMessage.en.slice(0, 2500) } } : {}),
        ...(newSettings.headTeacherPhoto ? { headTeacherPhoto: newSettings.headTeacherPhoto.slice(0, 600000) } : {}),
        ...(typeof newSettings.latitude === 'number' ? { latitude: newSettings.latitude } : {}),
        ...(typeof newSettings.longitude === 'number' ? { longitude: newSettings.longitude } : {}),
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          setDbStatus('synced');
          logAuditEvent('SETTINGS_UPDATED', 'settings', 'main', 'Updated campus settings & profile');
        })
        .catch((err) => safeListenerError(err, OperationType.WRITE, 'settings/main'));
    }
  };

  // Admissions + Public Non-PII Status Projection
  const addAdmission = async (appData: AdmissionApplication) => {
    const appId = sanitizeFirestoreId(appData.appId);
    const cleanApp: AdmissionApplication = {
      ...appData,
      appId,
      status: 'pending',
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [cleanApp, ...admissions];
    setAdmissions(updated);
    persistLocal('admission_applications', updated);

    const digitsOnly = cleanApp.guardianMobile.replace(/\D/g, '');
    const mobileLast4 = digitsOnly.length >= 4 ? digitsOnly.slice(-4) : undefined;

    try {
      setDbStatus('syncing');
      const batch = writeBatch(db);
      batch.set(doc(db, 'admissions', appId), {
        appId,
        studentName: cleanApp.studentName.slice(0, 150),
        fatherName: cleanApp.fatherName.slice(0, 150),
        motherName: cleanApp.motherName.slice(0, 150),
        guardianMobile: cleanApp.guardianMobile.slice(0, 30),
        targetClass: cleanApp.targetClass.slice(0, 40),
        targetGroup: (cleanApp.targetGroup || 'General').slice(0, 40),
        birthDate: cleanApp.birthDate.slice(0, 32),
        address: cleanApp.address.slice(0, 400),
        ...(cleanApp.prevSchool ? { prevSchool: cleanApp.prevSchool.slice(0, 200) } : {}),
        ...(cleanApp.bloodGroup ? { bloodGroup: cleanApp.bloodGroup.slice(0, 16) } : {}),
        status: 'pending',
        submittedDate: cleanApp.submittedDate.slice(0, 40),
        ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
        createdAt: serverTimestamp(),
      });
      batch.set(doc(db, 'admission_status', appId), {
        appId,
        targetClass: cleanApp.targetClass.slice(0, 40),
        targetGroup: (cleanApp.targetGroup || 'General').slice(0, 40),
        status: 'pending',
        submittedDate: cleanApp.submittedDate.slice(0, 40),
        ...(mobileLast4 ? { mobileLast4 } : {}),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      setDbStatus('synced');
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, OperationType.CREATE, `admissions/${appId}`);
    }
  };

  const updateAdmissionStatus = async (appId: string, status: 'pending' | 'approved' | 'rejected') => {
    const cleanId = sanitizeFirestoreId(appId);
    const updated = admissions.map((a) => (a.appId === appId ? { ...a, status } : a));
    setAdmissions(updated);
    persistLocal('admission_applications', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      const batch = writeBatch(db);
      batch.update(doc(db, 'admissions', cleanId), {
        status,
        updatedAt: serverTimestamp(),
      });
      const statusSnap = await getDoc(doc(db, 'admission_status', cleanId));
      if (statusSnap.exists()) {
        batch.update(doc(db, 'admission_status', cleanId), {
          status,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      await logAuditEvent(
        'ADMISSION_STATUS_UPDATED',
        'admissions',
        cleanId,
        `Updated admission ${cleanId} status to ${status}`
      );
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `admissions/${appId}`);
    }
  };

  const deleteAdmission = async (appId: string) => {
    const cleanId = sanitizeFirestoreId(appId);
    const updated = admissions.filter((a) => a.appId !== appId);
    setAdmissions(updated);
    persistLocal('admission_applications', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      await deleteDoc(doc(db, 'admissions', cleanId));
      await deleteDoc(doc(db, 'admission_status', cleanId)).catch(() => {});
      await logAuditEvent('ADMISSION_DELETED', 'admissions', cleanId, `Deleted admission ${cleanId}`);
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.DELETE, `admissions/${cleanId}`);
    }
  };

  const lookupAdmissionStatus = async (
    rawAppId: string,
    mobileLast4?: string
  ): Promise<AdmissionStatusProjection | null> => {
    const trimmed = rawAppId.trim().replace(/^#/, '');
    if (!trimmed) return null;
    const cleanId = sanitizeFirestoreId(trimmed);
    const cleanLast4 = (mobileLast4 || '').replace(/\D/g, '').slice(-4);

    try {
      const snap = await getDoc(doc(db, 'admission_status', cleanId));
      if (snap.exists()) {
        const d = snap.data() as AdmissionStatusProjection;
        if (cleanLast4 && d.mobileLast4 && d.mobileLast4 !== cleanLast4) {
          return null;
        }
        return {
          appId: d.appId,
          targetClass: d.targetClass,
          targetGroup: d.targetGroup,
          status: d.status,
          submittedDate: d.submittedDate,
        };
      }
    } catch {
      // Fall back to local cache if unavailable
    }

    const localMatch = admissions.find((a) => a.appId.toLowerCase() === trimmed.toLowerCase());
    if (!localMatch) return null;
    const localDigits = localMatch.guardianMobile.replace(/\D/g, '');
    if (cleanLast4 && localDigits.slice(-4) !== cleanLast4) {
      return null;
    }
    return {
      appId: localMatch.appId,
      targetClass: localMatch.targetClass,
      targetGroup: localMatch.targetGroup,
      status: localMatch.status,
      submittedDate: localMatch.submittedDate,
    };
  };

  // Contact Messages
  const addContactMessage = async (msg: ContactMessage) => {
    const id = sanitizeFirestoreId(msg.id);
    const cleanMsg: ContactMessage = {
      ...msg,
      id,
      status: 'unread',
      date: msg.date || new Date().toISOString().split('T')[0],
    };
    const updated = [cleanMsg, ...contactMessages];
    setContactMessages(updated);
    persistLocal('contact_messages', updated);

    try {
      setDbStatus('syncing');
      await setDoc(doc(db, 'contactMessages', id), {
        id,
        name: cleanMsg.name.slice(0, 150),
        mobile: cleanMsg.mobile.slice(0, 30),
        email: (cleanMsg.email || '').slice(0, 150),
        message: cleanMsg.message.slice(0, 2000),
        status: 'unread',
        createdAt: serverTimestamp(),
      });
      setDbStatus('synced');
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, OperationType.CREATE, `contactMessages/${id}`);
    }
  };

  const markContactMessageRead = async (id: string) => {
    const updated = contactMessages.map((m) => (m.id === id ? { ...m, status: 'read' as const } : m));
    setContactMessages(updated);
    persistLocal('contact_messages', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'contactMessages', sanitizeFirestoreId(id)), {
        status: 'read',
      });
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `contactMessages/${id}`);
    }
  };

  const deleteContactMessage = async (id: string) => {
    const updated = contactMessages.filter((m) => m.id !== id);
    setContactMessages(updated);
    persistLocal('contact_messages', updated);
    await syncDocDelete('contactMessages', sanitizeFirestoreId(id));
  };

  // Resolve & sync allowedUids for Zero-Trust private access isolation
  const resolveAllowedUids = (
    classId: string,
    roll: string,
    studentObj?: SchoolStudent,
    extraUids: string[] = []
  ): string[] => {
    const set = new Set<string>();
    (studentObj?.allowedUids || []).forEach((u) => {
      if (u && u.trim()) set.add(sanitizeFirestoreId(u.trim()));
    });
    if (studentObj?.studentUid) {
      set.add(sanitizeFirestoreId(studentObj.studentUid));
    }
    cloudUsers.forEach((cu) => {
      if (
        cu.role === 'student' &&
        cu.linkedChildClass === classId &&
        (cu.linkedChildRoll || '').trim() === roll.trim()
      ) {
        set.add(sanitizeFirestoreId(cu.uid));
      }
    });
    parentLinks.forEach((pl) => {
      if (
        pl.status === 'approved' &&
        pl.classId === classId &&
        pl.roll.trim() === roll.trim()
      ) {
        set.add(sanitizeFirestoreId(pl.parentUid));
      }
    });
    extraUids.forEach((u) => {
      if (u && u.trim()) set.add(sanitizeFirestoreId(u.trim()));
    });
    return Array.from(set).filter((u) => u.length >= 1 && u.length <= 128).slice(0, 5);
  };

  const syncStudentAccessUids = async (
    classId: string,
    roll: string,
    studentId?: string,
    extraUids: string[] = []
  ) => {
    const matched =
      (studentId ? students.find((s) => s.id === studentId) : undefined) ||
      students.find((s) => s.classId === classId && s.roll.trim() === roll.trim());
    const mergedUids = resolveAllowedUids(classId, roll, matched, extraUids);
    if (mergedUids.length === 0) return;

    setStudents((prev) => {
      const next = prev.map((s) =>
        (studentId && s.id === studentId) || (s.classId === classId && s.roll.trim() === roll.trim())
          ? { ...s, allowedUids: mergedUids }
          : s
      );
      safeLocalSet('db_students', next);
      return next;
    });
    setExamMarks((prev) => {
      const next = prev.map((m) =>
        m.classId === classId && m.roll.trim() === roll.trim() ? { ...m, allowedUids: mergedUids } : m
      );
      safeLocalSet('db_exam_marks', next);
      return next;
    });
    setStudentAttendance((prev) => {
      const next = prev.map((sa) =>
        sa.classId === classId && sa.roll.trim() === roll.trim() ? { ...sa, allowedUids: mergedUids } : sa
      );
      safeLocalSet('db_student_attendance', next);
      return next;
    });
    setFeeRecords((prev) => {
      const next = prev.map((fr) =>
        fr.classId === classId && fr.roll.trim() === roll.trim() ? { ...fr, allowedUids: mergedUids } : fr
      );
      safeLocalSet('db_fee_records', next);
      return next;
    });

    if (!isCloudTeacher) return;
    try {
      const batch = writeBatch(db);
      let ops = 0;

      const stQuery = query(
        collection(db, 'students'),
        where('classId', '==', classId),
        where('roll', '==', roll.trim())
      );
      const stSnap = await getDocs(stQuery);
      stSnap.forEach((d) => {
        batch.update(d.ref, { allowedUids: mergedUids, updatedAt: serverTimestamp() });
        ops++;
      });

      const mkQuery = query(
        collection(db, 'examMarks'),
        where('classId', '==', classId),
        where('roll', '==', roll.trim())
      );
      const mkSnap = await getDocs(mkQuery);
      mkSnap.forEach((d) => {
        batch.update(d.ref, { allowedUids: mergedUids, updatedAt: serverTimestamp() });
        ops++;
      });

      const saQuery = query(
        collection(db, 'studentAttendance'),
        where('classId', '==', classId),
        where('roll', '==', roll.trim())
      );
      const saSnap = await getDocs(saQuery);
      saSnap.forEach((d) => {
        batch.update(d.ref, { allowedUids: mergedUids, updatedAt: serverTimestamp() });
        ops++;
      });

      const frQuery = query(
        collection(db, 'fee_records'),
        where('classId', '==', classId),
        where('roll', '==', roll.trim())
      );
      const frSnap = await getDocs(frQuery);
      frSnap.forEach((d) => {
        batch.update(d.ref, { allowedUids: mergedUids, updatedAt: serverTimestamp() });
        ops++;
      });

      if (ops > 0) await batch.commit();
    } catch (err) {
      console.warn('Access UID sync skipped:', err);
    }
  };

  // Students
  const addStudent = (student: SchoolStudent) => {
    const id = sanitizeFirestoreId(student.id);
    const guardianMobile =
      student.guardianMobile && student.guardianMobile.trim().length >= 6
        ? student.guardianMobile.trim()
        : '01700000000';
    const allowedUids = resolveAllowedUids(student.classId, student.roll, student);
    const clean: SchoolStudent = {
      ...student,
      id,
      guardianMobile,
      ...(allowedUids.length > 0 ? { allowedUids } : {}),
    };
    const updated = [...students, clean];
    setStudents(updated);
    persistLocal('db_students', updated);
    syncDocUpsert(
      'students',
      id,
      {
        id,
        roll: clean.roll.slice(0, 20),
        name: clean.name.slice(0, 150),
        classId: clean.classId,
        section: clean.section.slice(0, 40),
        guardianMobile: clean.guardianMobile.slice(0, 30),
        ...(clean.studentUid ? { studentUid: sanitizeFirestoreId(clean.studentUid) } : {}),
        ...(allowedUids.length > 0 ? { allowedUids } : {}),
      },
      false,
      true
    );
  };

  const updateStudent = (student: SchoolStudent) => {
    const id = sanitizeFirestoreId(student.id);
    const guardianMobile =
      student.guardianMobile && student.guardianMobile.trim().length >= 6
        ? student.guardianMobile.trim()
        : '01700000000';
    const allowedUids = resolveAllowedUids(student.classId, student.roll, student);
    const clean: SchoolStudent = {
      ...student,
      id,
      guardianMobile,
      ...(allowedUids.length > 0 ? { allowedUids } : {}),
    };
    const updated = students.map((s) => (s.id === student.id ? clean : s));
    setStudents(updated);
    persistLocal('db_students', updated);
    syncDocUpsert(
      'students',
      id,
      {
        id,
        roll: clean.roll.slice(0, 20),
        name: clean.name.slice(0, 150),
        classId: clean.classId,
        section: clean.section.slice(0, 40),
        guardianMobile: clean.guardianMobile.slice(0, 30),
        ...(clean.studentUid ? { studentUid: sanitizeFirestoreId(clean.studentUid) } : {}),
        ...(allowedUids.length > 0 ? { allowedUids } : {}),
      },
      true,
      true
    );
  };

  const deleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    persistLocal('db_students', updated);
    syncDocDelete('students', sanitizeFirestoreId(id), true);
  };

  // Attendance (Teachers save full sheet + individual studentAttendance projections)
  const saveAttendance = (record: AttendanceRecord) => {
    const id = sanitizeFirestoreId(record.id);
    const clean: AttendanceRecord = { ...record, id, isPublished: record.isPublished ?? true };
    const exists = attendanceRecords.some((a) => a.id === id);
    const updated = exists
      ? attendanceRecords.map((a) => (a.id === id ? clean : a))
      : [clean, ...attendanceRecords];
    setAttendanceRecords(updated);
    persistLocal('db_attendance', updated);

    const classStudents = students.filter((s) => s.classId === clean.classId);
    const newPerStudent: StudentAttendanceRecord[] = [];
    classStudents.forEach((st) => {
      const stStatus = clean.records[st.id];
      if (!stStatus) return;
      const saId = sanitizeFirestoreId(`sa_${clean.date}_${st.id}`);
      const allowedUids = resolveAllowedUids(clean.classId, st.roll, st);
      newPerStudent.push({
        id: saId,
        date: clean.date.slice(0, 32),
        classId: clean.classId,
        studentId: sanitizeFirestoreId(st.id),
        studentName: st.name.slice(0, 150),
        roll: st.roll.slice(0, 20),
        status: stStatus,
        teacherName: clean.teacherName.slice(0, 150),
        ...(allowedUids.length > 0 ? { allowedUids } : {}),
        isPublished: clean.isPublished ?? true,
      });
    });

    if (newPerStudent.length > 0) {
      setStudentAttendance((prev) => {
        const filtered = prev.filter((item) => !newPerStudent.some((np) => np.id === item.id));
        const merged = [...newPerStudent, ...filtered];
        safeLocalSet('db_student_attendance', merged);
        return merged;
      });
    }

    syncDocUpsert(
      'attendance',
      id,
      {
        id,
        date: clean.date.slice(0, 32),
        classId: clean.classId,
        teacherName: clean.teacherName.slice(0, 150),
        records: clean.records,
        isPublished: clean.isPublished,
      },
      exists,
      true
    );

    if (isCloudTeacher && newPerStudent.length > 0) {
      (async () => {
        try {
          const batch = writeBatch(db);
          for (const item of newPerStudent) {
            const ref = doc(db, 'studentAttendance', item.id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              batch.update(ref, {
                status: item.status,
                teacherName: item.teacherName,
                ...(item.allowedUids ? { allowedUids: item.allowedUids } : {}),
                isPublished: item.isPublished,
                updatedAt: serverTimestamp(),
              });
            } else {
              batch.set(ref, {
                id: item.id,
                date: item.date,
                classId: item.classId,
                studentId: item.studentId,
                studentName: item.studentName,
                roll: item.roll,
                status: item.status,
                teacherName: item.teacherName,
                ...(item.allowedUids ? { allowedUids: item.allowedUids } : {}),
                isPublished: item.isPublished,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }
          await batch.commit();
        } catch (err) {
          console.warn('studentAttendance sync warning:', err);
        }
      })();
    }

    logAuditEvent(
      'ATTENDANCE_SAVED',
      'attendance',
      id,
      `Saved attendance for Class ${clean.classId} on ${clean.date} (${newPerStudent.length} students)`
    );
  };

  // Homework
  const addHomework = (hw: HomeworkItem) => {
    const id = sanitizeFirestoreId(hw.id);
    const clean: HomeworkItem = { ...hw, id, isPublic: hw.isPublic ?? true };
    const updated = [clean, ...homeworkList];
    setHomeworkList(updated);
    persistLocal('db_homework', updated);
    syncDocUpsert(
      'homework',
      id,
      {
        id,
        title: clean.title.slice(0, 300),
        subject: clean.subject.slice(0, 120),
        classId: clean.classId,
        description: clean.description.slice(0, 3000),
        dueDate: clean.dueDate.slice(0, 32),
        assignedBy: clean.assignedBy.slice(0, 150),
        createdDate: (clean.createdDate || new Date().toISOString().split('T')[0]).slice(0, 32),
        isPublic: clean.isPublic,
      },
      false,
      true
    );
  };

  const updateHomework = (hw: HomeworkItem) => {
    const id = sanitizeFirestoreId(hw.id);
    const clean: HomeworkItem = { ...hw, id, isPublic: hw.isPublic ?? true };
    const updated = homeworkList.map((h) => (h.id === hw.id ? clean : h));
    setHomeworkList(updated);
    persistLocal('db_homework', updated);
    syncDocUpsert(
      'homework',
      id,
      {
        id,
        title: clean.title.slice(0, 300),
        subject: clean.subject.slice(0, 120),
        classId: clean.classId,
        description: clean.description.slice(0, 3000),
        dueDate: clean.dueDate.slice(0, 32),
        assignedBy: clean.assignedBy.slice(0, 150),
        createdDate: (clean.createdDate || new Date().toISOString().split('T')[0]).slice(0, 32),
        isPublic: clean.isPublic,
      },
      true,
      true
    );
  };

  const deleteHomework = (id: string) => {
    const updated = homeworkList.filter((h) => h.id !== id);
    setHomeworkList(updated);
    persistLocal('db_homework', updated);
    syncDocDelete('homework', sanitizeFirestoreId(id), true);
  };

  // Assignment Submissions
  const submitAssignment = (sub: AssignmentSubmission) => {
    const id = sanitizeFirestoreId(sub.id);
    const clean: AssignmentSubmission = {
      ...sub,
      id,
      homeworkId: sanitizeFirestoreId(sub.homeworkId),
      status: 'submitted',
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [clean, ...assignmentSubmissions];
    setAssignmentSubmissions(updated);
    persistLocal('db_assignment_submissions', updated);
    if (firebaseUser?.emailVerified) {
      setDbStatus('syncing');
      setDoc(doc(db, 'assignmentSubmissions', id), {
        id,
        homeworkId: clean.homeworkId,
        classId: clean.classId,
        subject: clean.subject.slice(0, 120),
        studentId: clean.studentId.slice(0, 128),
        studentName: clean.studentName.slice(0, 150),
        roll: clean.roll.slice(0, 20),
        answerText: clean.answerText.slice(0, 4000),
        ...(clean.attachmentUrl ? { attachmentUrl: clean.attachmentUrl.slice(0, 2000) } : {}),
        status: 'submitted',
        submittedDate: clean.submittedDate.slice(0, 32),
        ownerUid: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => setDbStatus('synced'))
        .catch((err) => safeListenerError(err, OperationType.CREATE, `assignmentSubmissions/${id}`));
    }
  };

  const gradeAssignmentSubmission = async (id: string, marks: number, feedback: string) => {
    const cleanMarks = Math.max(0, Math.min(100, marks));
    const cleanFeedback = feedback.trim();
    const updated = assignmentSubmissions.map((s) =>
      s.id === id ? { ...s, status: 'graded' as const, marks: cleanMarks, feedback: cleanFeedback } : s
    );
    setAssignmentSubmissions(updated);
    persistLocal('db_assignment_submissions', updated);
    if (!isCloudTeacher) return;
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'assignmentSubmissions', sanitizeFirestoreId(id)), {
        status: 'graded',
        marks: cleanMarks,
        feedback: cleanFeedback.slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `assignmentSubmissions/${id}`);
    }
  };

  // Exam Marks
  const saveExamMark = (mark: ExamMark) => {
    const id = sanitizeFirestoreId(mark.id);
    const allowedUids = resolveAllowedUids(mark.classId, mark.roll);
    const clean: ExamMark = {
      ...mark,
      id,
      isPublished: mark.isPublished ?? true,
      ...(allowedUids.length > 0 ? { allowedUids } : {}),
    };
    const exists = examMarks.some((m) => m.id === id);
    const updated = exists ? examMarks.map((m) => (m.id === id ? clean : m)) : [clean, ...examMarks];
    setExamMarks(updated);
    persistLocal('db_exam_marks', updated);
    syncDocUpsert(
      'examMarks',
      id,
      {
        id,
        examTerm: clean.examTerm.slice(0, 100),
        classId: clean.classId,
        subject: clean.subject.slice(0, 120),
        studentId: sanitizeFirestoreId(clean.studentId),
        studentName: clean.studentName.slice(0, 150),
        roll: clean.roll.slice(0, 20),
        totalMarks: clean.totalMarks,
        obtainedMarks: clean.obtainedMarks,
        grade: clean.grade.slice(0, 8),
        enteredBy: clean.enteredBy.slice(0, 150),
        ...(allowedUids.length > 0 ? { allowedUids } : {}),
        isPublished: clean.isPublished,
      },
      exists,
      true
    );
    logAuditEvent(
      'MARKS_SAVED',
      'examMarks',
      id,
      `Saved ${clean.subject} marks (${clean.obtainedMarks}/${clean.totalMarks}) for Class ${clean.classId} Roll ${clean.roll}`
    );
  };

  const saveExamMarksBulk = (marks: ExamMark[]) => {
    let next = [...examMarks];
    marks.forEach((mark) => {
      const id = sanitizeFirestoreId(mark.id);
      const allowedUids = resolveAllowedUids(mark.classId, mark.roll);
      const clean: ExamMark = {
        ...mark,
        id,
        isPublished: mark.isPublished ?? true,
        ...(allowedUids.length > 0 ? { allowedUids } : {}),
      };
      const idx = next.findIndex((m) => m.id === id);
      if (idx >= 0) next[idx] = clean;
      else next.unshift(clean);
      syncDocUpsert(
        'examMarks',
        id,
        {
          id,
          examTerm: clean.examTerm.slice(0, 100),
          classId: clean.classId,
          subject: clean.subject.slice(0, 120),
          studentId: sanitizeFirestoreId(clean.studentId),
          studentName: clean.studentName.slice(0, 150),
          roll: clean.roll.slice(0, 20),
          totalMarks: clean.totalMarks,
          obtainedMarks: clean.obtainedMarks,
          grade: clean.grade.slice(0, 8),
          enteredBy: clean.enteredBy.slice(0, 150),
          ...(allowedUids.length > 0 ? { allowedUids } : {}),
          isPublished: clean.isPublished,
        },
        idx >= 0,
        true
      );
    });
    setExamMarks(next);
    persistLocal('db_exam_marks', next);
    if (marks.length > 0) {
      logAuditEvent(
        'MARKS_SAVED',
        'examMarks',
        marks[0].id,
        `Bulk saved ${marks.length} exam marks for Class ${marks[0].classId} (${marks[0].subject})`
      );
    }
  };

  const deleteExamMark = (id: string) => {
    const updated = examMarks.filter((m) => m.id !== id);
    setExamMarks(updated);
    persistLocal('db_exam_marks', updated);
    syncDocDelete('examMarks', sanitizeFirestoreId(id), true);
    logAuditEvent('MARKS_DELETED', 'examMarks', id, `Deleted exam mark ${id}`);
  };

  // Online MCQ Exams & Attempts
  const addOnlineExam = (exam: OnlineExamType) => {
    const id = sanitizeFirestoreId(exam.id);
    const clean: OnlineExamType = { ...exam, id, isPublic: true };
    const updated = [clean, ...onlineExams];
    setOnlineExams(updated);
    persistLocal('db_online_exams', updated);
    syncDocUpsert(
      'onlineExams',
      id,
      {
        id,
        title: { bn: clean.title.bn.slice(0, 300), en: clean.title.en.slice(0, 300) },
        classId: clean.classId,
        subject: clean.subject.slice(0, 120),
        chapter: clean.chapter.slice(0, 200),
        durationMinutes: clean.durationMinutes,
        mode: clean.mode,
        questions: clean.questions,
        createdBy: clean.createdBy.slice(0, 150),
        date: clean.date.slice(0, 32),
        isPublic: true,
      },
      false,
      true
    );
  };

  const updateOnlineExam = (exam: OnlineExamType) => {
    const id = sanitizeFirestoreId(exam.id);
    const clean: OnlineExamType = { ...exam, id, isPublic: true };
    const updated = onlineExams.map((e) => (e.id === exam.id ? clean : e));
    setOnlineExams(updated);
    persistLocal('db_online_exams', updated);
    syncDocUpsert(
      'onlineExams',
      id,
      {
        id,
        title: { bn: clean.title.bn.slice(0, 300), en: clean.title.en.slice(0, 300) },
        classId: clean.classId,
        subject: clean.subject.slice(0, 120),
        chapter: clean.chapter.slice(0, 200),
        durationMinutes: clean.durationMinutes,
        mode: clean.mode,
        questions: clean.questions,
        createdBy: clean.createdBy.slice(0, 150),
        date: clean.date.slice(0, 32),
        isPublic: true,
      },
      true,
      true
    );
  };

  const deleteOnlineExam = (id: string) => {
    const updated = onlineExams.filter((e) => e.id !== id);
    setOnlineExams(updated);
    persistLocal('db_online_exams', updated);
    syncDocDelete('onlineExams', sanitizeFirestoreId(id), true);
  };

  const submitExamAttempt = (attempt: ExamAttempt) => {
    const id = sanitizeFirestoreId(attempt.id);
    const clean: ExamAttempt = {
      ...attempt,
      id,
      examId: sanitizeFirestoreId(attempt.examId),
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [clean, ...examAttempts];
    setExamAttempts(updated);
    persistLocal('db_exam_attempts', updated);
    if (firebaseUser?.emailVerified) {
      setDbStatus('syncing');
      setDoc(doc(db, 'examAttempts', id), {
        id,
        examId: clean.examId,
        examTitle: clean.examTitle.slice(0, 300),
        subject: clean.subject.slice(0, 120),
        classId: clean.classId,
        studentId: clean.studentId.slice(0, 128),
        studentName: clean.studentName.slice(0, 150),
        roll: clean.roll.slice(0, 20),
        score: clean.score,
        totalQuestions: clean.totalQuestions,
        percentage: clean.percentage,
        answers: clean.answers,
        timeSpentSeconds: clean.timeSpentSeconds,
        submittedAt: clean.submittedAt.slice(0, 64),
        ownerUid: firebaseUser.uid,
        createdAt: serverTimestamp(),
      })
        .then(() => setDbStatus('synced'))
        .catch((err) => safeListenerError(err, OperationType.CREATE, `examAttempts/${id}`));
    }
  };

  // Exam Routines
  const addExamRoutine = (item: ExamRoutineItem) => {
    const id = sanitizeFirestoreId(item.id);
    const clean: ExamRoutineItem = { ...item, id, isPublic: true };
    const updated = [...examRoutines, clean];
    setExamRoutines(updated);
    persistLocal('db_exam_routines', updated);
    syncDocUpsert(
      'examRoutines',
      id,
      {
        id,
        examTerm: clean.examTerm.slice(0, 100),
        classId: clean.classId,
        subject: clean.subject.slice(0, 120),
        date: clean.date.slice(0, 32),
        time: clean.time.slice(0, 64),
        ...(clean.room ? { room: clean.room.slice(0, 64) } : {}),
        isPublic: true,
      },
      false,
      true
    );
  };

  const deleteExamRoutine = (id: string) => {
    const updated = examRoutines.filter((r) => r.id !== id);
    setExamRoutines(updated);
    persistLocal('db_exam_routines', updated);
    syncDocDelete('examRoutines', sanitizeFirestoreId(id), true);
  };

  // Dynamic Class Routines
  const saveClassRoutine = (routine: ClassRoutine) => {
    const cleanClassId = sanitizeFirestoreId(routine.classId);
    const exists = classRoutines.some((r) => r.classId === cleanClassId);
    const clean: ClassRoutine = { ...routine, classId: cleanClassId, isPublic: true };
    const updated = exists
      ? classRoutines.map((r) => (r.classId === cleanClassId ? clean : r))
      : [...classRoutines, clean];
    setClassRoutines(updated);
    persistLocal('db_class_routines', updated);
    syncDocUpsert(
      'classRoutines',
      cleanClassId,
      {
        classId: cleanClassId,
        className: { bn: clean.className.bn.slice(0, 100), en: clean.className.en.slice(0, 100) },
        schedule: clean.schedule,
        isPublic: true,
      },
      exists,
      true
    );
    logAuditEvent('ROUTINE_UPDATED', 'classRoutines', cleanClassId, `Updated weekly timetable for Class ${cleanClassId}`);
  };

  const resetClassRoutines = () => {
    setClassRoutines(CLASS_ROUTINES);
    persistLocal('db_class_routines', CLASS_ROUTINES);
    if (isCloudTeacher) {
      CLASS_ROUTINES.forEach((cr) => {
        syncDocUpsert(
          'classRoutines',
          cr.classId,
          {
            classId: cr.classId,
            className: cr.className,
            schedule: cr.schedule,
            isPublic: true,
          },
          true,
          true
        );
      });
    }
    logAuditEvent('ROUTINE_UPDATED', 'classRoutines', 'all', 'Reset weekly class routines to default template');
  };

  // Subjects
  const addSubject = (sub: SchoolSubject) => {
    const id = sanitizeFirestoreId(sub.id);
    const clean: SchoolSubject = { ...sub, id, isPublic: true };
    const updated = [...subjects, clean];
    setSubjects(updated);
    persistLocal('db_subjects', updated);
    syncDocUpsert(
      'subjects',
      id,
      {
        id,
        code: clean.code.slice(0, 16),
        name: { bn: clean.name.bn.slice(0, 200), en: clean.name.en.slice(0, 200) },
        classId: clean.classId,
        totalMarks: clean.totalMarks,
        ...(clean.teacherName ? { teacherName: clean.teacherName.slice(0, 150) } : {}),
        isPublic: true,
      },
      false
    );
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    persistLocal('db_subjects', updated);
    syncDocDelete('subjects', sanitizeFirestoreId(id));
  };

  // Parent-Teacher Messages & Verified Parent-Student Link Workflow
  const sendParentMessage = (msg: ParentMessage) => {
    const id = sanitizeFirestoreId(msg.id);
    const clean: ParentMessage = {
      ...msg,
      id,
      status: 'open',
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [clean, ...parentMessages];
    setParentMessages(updated);
    persistLocal('db_parent_messages', updated);
    if (firebaseUser?.emailVerified) {
      setDbStatus('syncing');
      setDoc(doc(db, 'parentMessages', id), {
        id,
        parentName: clean.parentName.slice(0, 150),
        studentName: clean.studentName.slice(0, 150),
        classId: clean.classId,
        roll: clean.roll.slice(0, 20),
        teacherName: clean.teacherName.slice(0, 150),
        subject: clean.subject.slice(0, 200),
        message: clean.message.slice(0, 2000),
        status: 'open',
        createdDate: clean.createdDate.slice(0, 32),
        ownerUid: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => setDbStatus('synced'))
        .catch((err) => safeListenerError(err, OperationType.CREATE, `parentMessages/${id}`));
    }
  };

  const replyParentMessage = async (id: string, reply: string, repliedBy: string) => {
    const cleanReply = reply.trim();
    const updated = parentMessages.map((m) =>
      m.id === id ? { ...m, reply: cleanReply, repliedBy, status: 'replied' as const } : m
    );
    setParentMessages(updated);
    persistLocal('db_parent_messages', updated);
    if (!isCloudTeacher) return;
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'parentMessages', sanitizeFirestoreId(id)), {
        reply: cleanReply.slice(0, 2000),
        repliedBy: repliedBy.slice(0, 150),
        status: 'replied',
        updatedAt: serverTimestamp(),
      });
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `parentMessages/${id}`);
    }
  };

  const requestParentStudentLink = async (payload: {
    classId: string;
    roll: string;
    relationship: 'Father' | 'Mother' | 'Guardian';
  }): Promise<boolean> => {
    const cleanRoll = payload.roll.trim();
    if (!cleanRoll) return false;
    const parentUid = sanitizeFirestoreId(firebaseUser?.uid || user?.userId || `parent_${Date.now()}`);
    const id = sanitizeFirestoreId(`psl_${parentUid}_${payload.classId}_${cleanRoll}`.slice(0, 120));
    const link: ParentStudentLink = {
      id,
      parentUid,
      parentEmail: (firebaseUser?.email || user?.email || 'parent@rbhs.edu').slice(0, 150),
      parentName: (user?.name || firebaseUser?.displayName || 'Guardian').slice(0, 150),
      classId: payload.classId,
      roll: cleanRoll.slice(0, 20),
      relationship: payload.relationship,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
    };

    const next = [link, ...parentLinks.filter((l) => l.id !== id)];
    setParentLinks(next);
    persistLocal('db_parent_links', next);

    if (firebaseUser?.emailVerified) {
      try {
        setDbStatus('syncing');
        await setDoc(doc(db, 'parent_student_links', id), {
          id,
          parentUid: firebaseUser.uid,
          parentEmail: link.parentEmail,
          parentName: link.parentName,
          classId: link.classId,
          roll: link.roll,
          relationship: link.relationship,
          status: 'pending',
          submittedDate: link.submittedDate,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setDbStatus('synced');
        return true;
      } catch (err) {
        safeListenerError(err, OperationType.CREATE, `parent_student_links/${id}`);
        return false;
      }
    }
    return true;
  };

  const reviewParentStudentLink = async (linkId: string, status: 'approved' | 'rejected') => {
    const cleanId = sanitizeFirestoreId(linkId);
    const target = parentLinks.find((l) => l.id === linkId || l.id === cleanId);
    if (!target) return;

    const matchedStudent = students.find(
      (s) => s.classId === target.classId && s.roll.trim() === target.roll.trim()
    );
    const approvedBy = (user?.name || firebaseUser?.displayName || 'Teacher').slice(0, 150);

    const updated = parentLinks.map((l) =>
      l.id === target.id
        ? {
            ...l,
            status,
            approvedBy,
            ...(matchedStudent ? { studentId: matchedStudent.id, studentName: matchedStudent.name } : {}),
          }
        : l
    );
    setParentLinks(updated);
    persistLocal('db_parent_links', updated);

    if (isCloudTeacher) {
      try {
        setDbStatus('syncing');
        await updateDoc(doc(db, 'parent_student_links', cleanId), {
          status,
          approvedBy,
          ...(matchedStudent
            ? {
                studentId: sanitizeFirestoreId(matchedStudent.id),
                studentName: matchedStudent.name.slice(0, 150),
              }
            : {}),
          updatedAt: serverTimestamp(),
        });

        if (status === 'approved') {
          await syncStudentAccessUids(target.classId, target.roll, matchedStudent?.id, [target.parentUid]);
          if (isCloudAdmin) {
            await updateDoc(doc(db, 'users', sanitizeFirestoreId(target.parentUid)), {
              role: 'parent',
              linkedChildClass: target.classId,
              linkedChildRoll: target.roll,
              ...(matchedStudent ? { linkedChildName: matchedStudent.name.slice(0, 150) } : {}),
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          }
        }
        await logAuditEvent(
          'PARENT_LINK_REVIEWED',
          'parent_student_links',
          cleanId,
          `${status.toUpperCase()} parent link for ${target.parentName} → Class ${target.classId} Roll ${target.roll}`
        );
        setDbStatus('synced');
      } catch (err) {
        safeListenerError(err, OperationType.UPDATE, `parent_student_links/${cleanId}`);
      }
    }
  };

  const deleteParentStudentLink = async (linkId: string) => {
    const cleanId = sanitizeFirestoreId(linkId);
    const updated = parentLinks.filter((l) => l.id !== linkId && l.id !== cleanId);
    setParentLinks(updated);
    persistLocal('db_parent_links', updated);
    if (firebaseUser?.emailVerified) {
      try {
        await deleteDoc(doc(db, 'parent_student_links', cleanId));
      } catch (err) {
        safeListenerError(err, OperationType.DELETE, `parent_student_links/${cleanId}`);
      }
    }
  };

  // Alumni Network
  const submitAlumniProfile = (profile: AlumniProfile) => {
    const id = sanitizeFirestoreId(profile.id);
    const clean: AlumniProfile = {
      ...profile,
      id,
      status: 'pending',
      isPublic: false,
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [clean, ...alumni];
    setAlumni(updated);
    persistLocal('db_alumni', updated);
    setDbStatus('syncing');
    setDoc(doc(db, 'alumni', id), {
      id,
      name: clean.name.slice(0, 150),
      batchYear: clean.batchYear.slice(0, 16),
      currentRole: clean.currentRole.slice(0, 150),
      organization: clean.organization.slice(0, 200),
      ...(clean.city ? { city: clean.city.slice(0, 100) } : {}),
      message: clean.message.slice(0, 1000),
      status: 'pending',
      isPublic: false,
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
      .then(() => setDbStatus('synced'))
      .catch((err) => safeListenerError(err, OperationType.CREATE, `alumni/${id}`));
  };

  const updateAlumniStatus = async (id: string, status: 'pending' | 'approved') => {
    const isPublic = status === 'approved';
    const updated = alumni.map((a) => (a.id === id ? { ...a, status, isPublic } : a));
    setAlumni(updated);
    persistLocal('db_alumni', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'alumni', sanitizeFirestoreId(id)), {
        status,
        isPublic,
        updatedAt: serverTimestamp(),
      });
      await logAuditEvent('ALUMNI_REVIEWED', 'alumni', id, `Marked alumni ${id} as ${status}`);
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `alumni/${id}`);
    }
  };

  const deleteAlumniProfile = (id: string) => {
    const updated = alumni.filter((a) => a.id !== id);
    setAlumni(updated);
    persistLocal('db_alumni', updated);
    syncDocDelete('alumni', sanitizeFirestoreId(id));
  };

  // Teacher Leaves
  const submitTeacherLeave = (leave: TeacherLeave) => {
    const id = sanitizeFirestoreId(leave.id);
    const clean: TeacherLeave = {
      ...leave,
      id,
      status: 'pending',
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [clean, ...teacherLeaves];
    setTeacherLeaves(updated);
    persistLocal('db_teacher_leaves', updated);
    if (isCloudTeacher && firebaseUser) {
      setDbStatus('syncing');
      setDoc(doc(db, 'teacherLeaves', id), {
        id,
        teacherId: clean.teacherId.slice(0, 128),
        teacherName: clean.teacherName.slice(0, 150),
        leaveType: clean.leaveType,
        startDate: clean.startDate.slice(0, 32),
        endDate: clean.endDate.slice(0, 32),
        reason: clean.reason.slice(0, 1500),
        status: 'pending',
        submittedDate: clean.submittedDate.slice(0, 32),
        ownerUid: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => setDbStatus('synced'))
        .catch((err) => safeListenerError(err, OperationType.CREATE, `teacherLeaves/${id}`));
    }
  };

  const updateTeacherLeaveStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    adminRemark?: string
  ) => {
    const cleanRemark = adminRemark?.trim();
    const updated = teacherLeaves.map((l) =>
      l.id === id ? { ...l, status, ...(cleanRemark !== undefined ? { adminRemark: cleanRemark } : {}) } : l
    );
    setTeacherLeaves(updated);
    persistLocal('db_teacher_leaves', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'teacherLeaves', sanitizeFirestoreId(id)), {
        status,
        ...(cleanRemark ? { adminRemark: cleanRemark.slice(0, 500) } : {}),
        updatedAt: serverTimestamp(),
      });
      await logAuditEvent('TEACHER_LEAVE_REVIEWED', 'teacherLeaves', id, `Teacher leave ${id} -> ${status}`);
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `teacherLeaves/${id}`);
    }
  };

  const deleteTeacherLeave = (id: string) => {
    const updated = teacherLeaves.filter((l) => l.id !== id);
    setTeacherLeaves(updated);
    persistLocal('db_teacher_leaves', updated);
    syncDocDelete('teacherLeaves', sanitizeFirestoreId(id));
  };

  // Student Leaves
  const submitStudentLeave = (leave: StudentLeave) => {
    const id = sanitizeFirestoreId(leave.id);
    const clean: StudentLeave = {
      ...leave,
      id,
      status: 'pending',
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [clean, ...studentLeaves];
    setStudentLeaves(updated);
    persistLocal('db_student_leaves', updated);
    if (firebaseUser?.emailVerified) {
      setDbStatus('syncing');
      setDoc(doc(db, 'studentLeaves', id), {
        id,
        studentId: sanitizeFirestoreId(clean.studentId),
        studentName: clean.studentName.slice(0, 150),
        roll: clean.roll.slice(0, 20),
        classId: clean.classId,
        leaveType: clean.leaveType,
        startDate: clean.startDate.slice(0, 32),
        endDate: clean.endDate.slice(0, 32),
        reason: clean.reason.slice(0, 1500),
        status: 'pending',
        submittedDate: clean.submittedDate.slice(0, 32),
        ownerUid: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => setDbStatus('synced'))
        .catch((err) => safeListenerError(err, OperationType.CREATE, `studentLeaves/${id}`));
    }
  };

  const updateStudentLeaveStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    reviewedBy: string,
    teacherRemark?: string
  ) => {
    const cleanRemark = teacherRemark?.trim();
    const targetLeave = studentLeaves.find((l) => l.id === id);
    const updated = studentLeaves.map((l) =>
      l.id === id ? { ...l, status, reviewedBy, ...(cleanRemark !== undefined ? { teacherRemark: cleanRemark } : {}) } : l
    );
    setStudentLeaves(updated);
    persistLocal('db_student_leaves', updated);
    if (!isCloudTeacher) return;
    try {
      setDbStatus('syncing');
      const docId = sanitizeFirestoreId(id);
      const leaveRef = doc(db, 'studentLeaves', docId);
      const snap = await getDoc(leaveRef);
      if (!snap.exists() && targetLeave) {
        await setDoc(leaveRef, {
          id: docId,
          studentId: sanitizeFirestoreId(targetLeave.studentId),
          studentName: targetLeave.studentName.slice(0, 150),
          roll: targetLeave.roll.slice(0, 20),
          classId: targetLeave.classId,
          leaveType: targetLeave.leaveType,
          startDate: targetLeave.startDate.slice(0, 32),
          endDate: targetLeave.endDate.slice(0, 32),
          reason: targetLeave.reason.slice(0, 1500),
          status: 'pending',
          submittedDate: (targetLeave.submittedDate || new Date().toISOString().split('T')[0]).slice(0, 32),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await updateDoc(leaveRef, {
        status,
        reviewedBy: reviewedBy.slice(0, 150),
        ...(cleanRemark ? { teacherRemark: cleanRemark.slice(0, 500) } : {}),
        updatedAt: serverTimestamp(),
      });
      await logAuditEvent('STUDENT_LEAVE_REVIEWED', 'studentLeaves', docId, `Student leave ${docId} -> ${status}`);
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `studentLeaves/${id}`);
    }
  };

  const deleteStudentLeave = (id: string) => {
    const updated = studentLeaves.filter((l) => l.id !== id);
    setStudentLeaves(updated);
    persistLocal('db_student_leaves', updated);
    syncDocDelete('studentLeaves', sanitizeFirestoreId(id), true);
  };

  // Phase 3: Fee & Payment Ledger (Zero-Trust allowedUids isolated per student/parent)
  const addFeeRecord = (fee: FeeRecord) => {
    const id = sanitizeFirestoreId(fee.id);
    const allowedUids = resolveAllowedUids(fee.classId, fee.roll);
    const safeAmount = Math.max(0, Math.min(500000, Number(fee.amount) || 0));
    const safePaid = Math.max(0, Math.min(safeAmount, Number(fee.paidAmount) || 0));
    const computedStatus: FeeRecord['status'] =
      fee.status === 'waived'
        ? 'waived'
        : safePaid >= safeAmount && safeAmount > 0
        ? 'paid'
        : safePaid > 0
        ? 'partial'
        : 'pending';
    const clean: FeeRecord = {
      ...fee,
      id,
      studentId: sanitizeFirestoreId(fee.studentId || `st-${fee.classId}-${fee.roll}`),
      amount: safeAmount,
      paidAmount: safePaid,
      status: computedStatus,
      ...(computedStatus === 'paid' && !fee.receiptNo
        ? { receiptNo: `RBMB-${Date.now().toString().slice(-6)}` }
        : {}),
      ...(computedStatus === 'paid' && !fee.paidDate
        ? { paidDate: new Date().toISOString().split('T')[0] }
        : {}),
      ...(allowedUids.length > 0 ? { allowedUids } : {}),
    };

    const updated = [clean, ...feeRecords];
    setFeeRecords(updated);
    persistLocal('db_fee_records', updated);

    syncDocUpsert(
      'fee_records',
      id,
      {
        id,
        studentId: clean.studentId,
        studentName: clean.studentName.slice(0, 150),
        classId: clean.classId,
        roll: clean.roll.slice(0, 20),
        title: clean.title.slice(0, 200),
        category: clean.category,
        ...(clean.billingMonth ? { billingMonth: clean.billingMonth.slice(0, 64) } : {}),
        amount: clean.amount,
        paidAmount: clean.paidAmount,
        dueDate: clean.dueDate.slice(0, 32),
        status: clean.status,
        ...(clean.paymentMethod ? { paymentMethod: clean.paymentMethod } : {}),
        ...(clean.receiptNo ? { receiptNo: clean.receiptNo.slice(0, 64) } : {}),
        ...(clean.paidDate ? { paidDate: clean.paidDate.slice(0, 32) } : {}),
        recordedBy: clean.recordedBy.slice(0, 150),
        ...(allowedUids.length > 0 ? { allowedUids } : {}),
      },
      false,
      true
    );

    logAuditEvent(
      'FEE_CREATED',
      'fee_records',
      id,
      `Created fee "${clean.title}" (BDT ${clean.amount}) for Class ${clean.classId} Roll ${clean.roll}`
    );
  };

  const addBulkClassFees = (payload: {
    classId: string;
    title: string;
    category: FeeCategory;
    billingMonth?: string;
    amount: number;
    dueDate: string;
  }): number => {
    const classStudents = students.filter((s) => s.classId === payload.classId);
    if (classStudents.length === 0) return 0;

    const recorder = (user?.name || firebaseUser?.displayName || 'Office').slice(0, 150);
    const safeAmount = Math.max(0, Math.min(500000, Number(payload.amount) || 0));
    const batchTs = Date.now();
    const created: FeeRecord[] = classStudents.map((st, idx) => {
      const id = sanitizeFirestoreId(`fee_${payload.classId}_${st.roll}_${batchTs}_${idx}`);
      const allowedUids = resolveAllowedUids(st.classId, st.roll, st);
      return {
        id,
        studentId: sanitizeFirestoreId(st.id),
        studentName: st.name.slice(0, 150),
        classId: st.classId,
        roll: st.roll.slice(0, 20),
        title: payload.title.slice(0, 200),
        category: payload.category,
        ...(payload.billingMonth ? { billingMonth: payload.billingMonth.slice(0, 64) } : {}),
        amount: safeAmount,
        paidAmount: 0,
        dueDate: payload.dueDate.slice(0, 32),
        status: 'pending',
        recordedBy: recorder,
        ...(allowedUids.length > 0 ? { allowedUids } : {}),
      };
    });

    const updated = [...created, ...feeRecords];
    setFeeRecords(updated);
    persistLocal('db_fee_records', updated);

    if (isCloudTeacher) {
      (async () => {
        try {
          setDbStatus('syncing');
          const batch = writeBatch(db);
          created.forEach((clean) => {
            batch.set(doc(db, 'fee_records', clean.id), {
              id: clean.id,
              studentId: clean.studentId,
              studentName: clean.studentName,
              classId: clean.classId,
              roll: clean.roll,
              title: clean.title,
              category: clean.category,
              ...(clean.billingMonth ? { billingMonth: clean.billingMonth } : {}),
              amount: clean.amount,
              paidAmount: clean.paidAmount,
              dueDate: clean.dueDate,
              status: clean.status,
              recordedBy: clean.recordedBy,
              ...(clean.allowedUids ? { allowedUids: clean.allowedUids } : {}),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          });
          await batch.commit();
          setDbStatus('synced');
        } catch (err) {
          safeListenerError(err, OperationType.WRITE, 'fee_records');
        }
      })();
    }

    logAuditEvent(
      'FEE_CREATED',
      'fee_records',
      `bulk_${payload.classId}`,
      `Generated "${payload.title}" (BDT ${safeAmount}) for ${created.length} students in Class ${payload.classId}`
    );
    return created.length;
  };

  const updateFeePayment = async (
    id: string,
    paidAmount: number,
    paymentMethod: PaymentMethod,
    receiptNo?: string
  ) => {
    const target = feeRecords.find((f) => f.id === id);
    if (!target) return;

    const safePaid = Math.max(0, Math.min(target.amount, Number(paidAmount) || 0));
    const nextStatus: FeeRecord['status'] =
      safePaid >= target.amount && target.amount > 0 ? 'paid' : safePaid > 0 ? 'partial' : 'pending';
    const nextReceipt = (receiptNo || target.receiptNo || `RBMB-${Date.now().toString().slice(-6)}`).slice(0, 64);
    const nextPaidDate = new Date().toISOString().split('T')[0];
    const recorder = (user?.name || firebaseUser?.displayName || target.recordedBy).slice(0, 150);

    const updated = feeRecords.map((f) =>
      f.id === id
        ? {
            ...f,
            paidAmount: safePaid,
            status: nextStatus,
            paymentMethod,
            receiptNo: nextReceipt,
            paidDate: nextPaidDate,
            recordedBy: recorder,
          }
        : f
    );
    setFeeRecords(updated);
    persistLocal('db_fee_records', updated);

    if (isCloudTeacher) {
      const cleanId = sanitizeFirestoreId(id);
      const allowedUids = resolveAllowedUids(target.classId, target.roll);
      await syncDocUpsert(
        'fee_records',
        cleanId,
        {
          id: cleanId,
          studentId: sanitizeFirestoreId(target.studentId),
          studentName: target.studentName.slice(0, 150),
          classId: target.classId,
          roll: target.roll.slice(0, 20),
          title: target.title.slice(0, 200),
          category: target.category,
          ...(target.billingMonth ? { billingMonth: target.billingMonth.slice(0, 64) } : {}),
          amount: target.amount,
          paidAmount: safePaid,
          dueDate: target.dueDate.slice(0, 32),
          status: nextStatus,
          paymentMethod,
          receiptNo: nextReceipt,
          paidDate: nextPaidDate,
          recordedBy: recorder,
          ...(allowedUids.length > 0 ? { allowedUids } : {}),
        },
        true,
        true
      );
    }

    await logAuditEvent(
      'FEE_UPDATED',
      'fee_records',
      id,
      `Recorded payment BDT ${safePaid} (${paymentMethod}, Receipt ${nextReceipt}) for ${target.studentName}`
    );
  };

  const markFeeWaived = async (id: string) => {
    const target = feeRecords.find((f) => f.id === id);
    if (!target) return;
    const recorder = (user?.name || firebaseUser?.displayName || target.recordedBy).slice(0, 150);
    const updated = feeRecords.map((f) =>
      f.id === id ? { ...f, status: 'waived' as const, recordedBy: recorder } : f
    );
    setFeeRecords(updated);
    persistLocal('db_fee_records', updated);

    if (isCloudTeacher) {
      const cleanId = sanitizeFirestoreId(id);
      const allowedUids = resolveAllowedUids(target.classId, target.roll);
      await syncDocUpsert(
        'fee_records',
        cleanId,
        {
          id: cleanId,
          studentId: sanitizeFirestoreId(target.studentId),
          studentName: target.studentName.slice(0, 150),
          classId: target.classId,
          roll: target.roll.slice(0, 20),
          title: target.title.slice(0, 200),
          category: target.category,
          ...(target.billingMonth ? { billingMonth: target.billingMonth.slice(0, 64) } : {}),
          amount: target.amount,
          paidAmount: target.paidAmount,
          dueDate: target.dueDate.slice(0, 32),
          status: 'waived',
          ...(target.paymentMethod ? { paymentMethod: target.paymentMethod } : {}),
          ...(target.receiptNo ? { receiptNo: target.receiptNo.slice(0, 64) } : {}),
          ...(target.paidDate ? { paidDate: target.paidDate.slice(0, 32) } : {}),
          recordedBy: recorder,
          ...(allowedUids.length > 0 ? { allowedUids } : {}),
        },
        true,
        true
      );
    }

    await logAuditEvent('FEE_UPDATED', 'fee_records', id, `Marked fee waived for ${target.studentName}`);
  };

  const deleteFeeRecord = (id: string) => {
    const updated = feeRecords.filter((f) => f.id !== id);
    setFeeRecords(updated);
    persistLocal('db_fee_records', updated);
    syncDocDelete('fee_records', sanitizeFirestoreId(id), true);
    logAuditEvent('FEE_DELETED', 'fee_records', id, `Deleted fee record ${id}`);
  };

  // Phase 3: Targeted Portal Notifications (Role & Class Broadcasts)
  const addPortalNotification = async (notif: PortalNotification) => {
    const id = sanitizeFirestoreId(notif.id);
    const clean: PortalNotification = {
      ...notif,
      id,
      classId: notif.classId || 'all',
      senderName: (notif.senderName || user?.name || 'Administration').slice(0, 150),
      createdDate: (notif.createdDate || new Date().toISOString().split('T')[0]).slice(0, 32),
    };
    const updated = [clean, ...portalNotifications];
    setPortalNotifications(updated);
    persistLocal('db_portal_notifications', updated);

    if (isCloudTeacher) {
      try {
        setDbStatus('syncing');
        await setDoc(doc(db, 'portal_notifications', id), {
          id,
          title: clean.title.slice(0, 250),
          message: clean.message.slice(0, 2000),
          targetRole: clean.targetRole,
          classId: clean.classId || 'all',
          priority: clean.priority,
          senderName: clean.senderName,
          createdDate: clean.createdDate,
          createdAt: serverTimestamp(),
        });
        setDbStatus('synced');
      } catch (err) {
        safeListenerError(err, OperationType.CREATE, `portal_notifications/${id}`);
      }
    }

    await logAuditEvent(
      'NOTIFICATION_SENT',
      'portal_notifications',
      id,
      `Sent ${clean.priority} alert "${clean.title}" to ${clean.targetRole} (Class ${clean.classId})`
    );
  };

  const deletePortalNotification = (id: string) => {
    const updated = portalNotifications.filter((n) => n.id !== id);
    setPortalNotifications(updated);
    persistLocal('db_portal_notifications', updated);
    syncDocDelete('portal_notifications', sanitizeFirestoreId(id), true);
  };

  const exportDatabase = () => {
    const data = {
      settings,
      notices,
      newsList,
      eventsList,
      teachers,
      ebooks,
      gallery,
      holidays,
      admissions,
      contactMessages,
      students,
      attendanceRecords,
      homeworkList,
      assignmentSubmissions,
      examMarks,
      onlineExams,
      examAttempts,
      examRoutines,
      classRoutines,
      subjects,
      parentMessages,
      alumni,
      teacherLeaves,
      studentLeaves,
      feeRecords,
      portalNotifications,
      users: registeredUsers.map(stripPlaintextPassword),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rbhs_school_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.settings) {
        setSettings(data.settings);
        safeLocalSet('school_settings', data.settings);
        if (isCloudAdmin) updateSettings(data.settings);
      }
      if (data.notices) {
        setNotices(data.notices);
        safeLocalSet('db_notices', data.notices);
        if (isCloudAdmin) data.notices.forEach((n: Notice) => updateNotice(n));
      }
      if (data.newsList) {
        setNewsList(data.newsList);
        safeLocalSet('db_news', data.newsList);
      }
      if (data.eventsList) {
        setEventsList(data.eventsList);
        safeLocalSet('db_events', data.eventsList);
      }
      if (data.teachers) {
        setTeachers(data.teachers);
        safeLocalSet('db_teachers', data.teachers);
        if (isCloudAdmin) data.teachers.forEach((teach: Teacher) => updateTeacher(teach));
      }
      if (data.users && Array.isArray(data.users)) {
        const cleanUsers = (data.users as AuthUser[]).map(stripPlaintextPassword);
        setRegisteredUsers(cleanUsers);
        safeLocalSet('registered_users', cleanUsers);
      }
      if (data.ebooks) {
        setEbooks(data.ebooks);
        safeLocalSet('db_ebooks', data.ebooks);
      }
      if (data.gallery) {
        setGallery(data.gallery);
        safeLocalSet('db_gallery', data.gallery);
      }
      if (data.holidays) {
        setHolidays(data.holidays);
        safeLocalSet('db_holidays', data.holidays);
      }
      if (data.admissions) {
        setAdmissions(data.admissions);
        safeLocalSet('admission_applications', data.admissions);
      }
      if (data.contactMessages) {
        setContactMessages(data.contactMessages);
        safeLocalSet('contact_messages', data.contactMessages);
      }
      if (data.students) {
        setStudents(data.students);
        safeLocalSet('db_students', data.students);
      }
      if (data.attendanceRecords) {
        setAttendanceRecords(data.attendanceRecords);
        safeLocalSet('db_attendance', data.attendanceRecords);
      }
      if (data.homeworkList) {
        setHomeworkList(data.homeworkList);
        safeLocalSet('db_homework', data.homeworkList);
      }
      if (data.assignmentSubmissions) {
        setAssignmentSubmissions(data.assignmentSubmissions);
        safeLocalSet('db_assignment_submissions', data.assignmentSubmissions);
      }
      if (data.examMarks) {
        setExamMarks(data.examMarks);
        safeLocalSet('db_exam_marks', data.examMarks);
      }
      if (data.onlineExams) {
        setOnlineExams(data.onlineExams);
        safeLocalSet('db_online_exams', data.onlineExams);
      }
      if (data.examAttempts) {
        setExamAttempts(data.examAttempts);
        safeLocalSet('db_exam_attempts', data.examAttempts);
      }
      if (data.examRoutines) {
        setExamRoutines(data.examRoutines);
        safeLocalSet('db_exam_routines', data.examRoutines);
      }
      if (data.classRoutines) {
        setClassRoutines(data.classRoutines);
        safeLocalSet('db_class_routines', data.classRoutines);
      }
      if (data.subjects) {
        setSubjects(data.subjects);
        safeLocalSet('db_subjects', data.subjects);
      }
      if (data.parentMessages) {
        setParentMessages(data.parentMessages);
        safeLocalSet('db_parent_messages', data.parentMessages);
      }
      if (data.alumni) {
        setAlumni(data.alumni);
        safeLocalSet('db_alumni', data.alumni);
      }
      if (data.teacherLeaves) {
        setTeacherLeaves(data.teacherLeaves);
        safeLocalSet('db_teacher_leaves', data.teacherLeaves);
      }
      if (data.studentLeaves) {
        setStudentLeaves(data.studentLeaves);
        safeLocalSet('db_student_leaves', data.studentLeaves);
      }
      if (data.feeRecords) {
        setFeeRecords(data.feeRecords);
        safeLocalSet('db_fee_records', data.feeRecords);
      }
      if (data.portalNotifications) {
        setPortalNotifications(data.portalNotifications);
        safeLocalSet('db_portal_notifications', data.portalNotifications);
      }
      return true;
    } catch {
      return false;
    }
  };

  const t = (obj: unknown): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const rec = obj as Record<string, string>;
    return rec[lang] || rec['bn'] || rec['en'] || '';
  };

  // Server-side AI School Assistant call
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages((p) => [...p, { role: 'user', text: msg }]);
    setIsTyping(true);

    try {
      const noticeSummaries = notices
        .slice(0, 5)
        .map((n) => `- ${t(n.title)} (${n.date}): ${t(n.description)}`)
        .join('\n');
      const context = `School: ${t(settings.name)}, EIIN: ${settings.eiin}, Address: ${t(settings.location)}, Phone: ${settings.phone}, Email: ${settings.email}.
Recent Notices:\n${noticeSummaries}
Available Features: Online Admission (/admission), Online MCQ Exams (/exams), Digital Library (/ebooks), Class & Exam Routine (/routine), Alumni (/alumni), Student/Teacher/Parent/Admin Portals (/login/student).`;

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, lang, context }),
      });

      const data = await res.json();
      if (res.ok && data?.reply) {
        setChatMessages((p) => [...p, { role: 'model', text: data.reply }]);
      } else {
        setChatMessages((p) => [
          ...p,
          {
            role: 'model',
            text:
              data?.fallback ||
              (lang === 'bn'
                ? `${t(settings.name)} হেল্পডেস্ক: ভর্তি, রুটিন, নোটিশ বা পরীক্ষা সংক্রান্ত তথ্যের জন্য ${settings.phone} নম্বরে কল করুন অথবা সংশ্লিষ্ট মেনু দেখুন।`
                : `${t(settings.name)} Helpdesk: For admissions, routines, or exam help, call ${settings.phone} or check the Notice Board.`),
          },
        ]);
      }
    } catch {
      setChatMessages((p) => [
        ...p,
        {
          role: 'model',
          text:
            lang === 'bn'
              ? `সার্ভারের সাথে সংযোগ করতে সমস্যা হয়েছে। জরুরি তথ্যের জন্য কল করুন: ${settings.phone}।`
              : `Unable to reach the AI helpdesk right now. Please contact ${settings.phone}.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        theme,
        toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
        largeText,
        toggleLargeText: () => setLargeText((prev) => !prev),
        searchOpen,
        setSearchOpen,
        user,
        firebaseUser,
        isCloudAdmin,
        isCloudTeacher,
        cloudUsers,
        updateCloudUserRole,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        resendVerificationEmail,
        refreshAuthSession,
        resetPassword,
        logoutGoogle,
        login,
        verifyLocalCredentials,
        register,
        updateUser,
        deleteUser,
        logout,
        t,
        getUsers: () => registeredUsers,
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        newsList,
        addNews,
        updateNews,
        deleteNews,
        eventsList,
        addEvent,
        updateEvent,
        deleteEvent,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        ebooks,
        addEbook,
        updateEbook,
        deleteEbook,
        gallery,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        holidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        admissions,
        addAdmission,
        updateAdmissionStatus,
        deleteAdmission,
        lookupAdmissionStatus,
        contactMessages,
        addContactMessage,
        markContactMessageRead,
        deleteContactMessage,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        attendanceRecords,
        studentAttendance,
        saveAttendance,
        homeworkList,
        addHomework,
        updateHomework,
        deleteHomework,
        assignmentSubmissions,
        submitAssignment,
        gradeAssignmentSubmission,
        examMarks,
        saveExamMark,
        saveExamMarksBulk,
        deleteExamMark,
        onlineExams,
        addOnlineExam,
        updateOnlineExam,
        deleteOnlineExam,
        examAttempts,
        submitExamAttempt,
        examRoutines,
        addExamRoutine,
        deleteExamRoutine,
        classRoutines,
        saveClassRoutine,
        resetClassRoutines,
        subjects,
        addSubject,
        deleteSubject,
        parentMessages,
        sendParentMessage,
        replyParentMessage,
        parentLinks,
        requestParentStudentLink,
        reviewParentStudentLink,
        deleteParentStudentLink,
        alumni,
        submitAlumniProfile,
        updateAlumniStatus,
        deleteAlumniProfile,
        teacherLeaves,
        submitTeacherLeave,
        updateTeacherLeaveStatus,
        deleteTeacherLeave,
        studentLeaves,
        submitStudentLeave,
        updateStudentLeaveStatus,
        deleteStudentLeave,
        feeRecords,
        addFeeRecord,
        addBulkClassFees,
        updateFeePayment,
        markFeeWaived,
        deleteFeeRecord,
        portalNotifications,
        addPortalNotification,
        deletePortalNotification,
        auditLogs,
        settings,
        updateSettings,
        exportDatabase,
        importDatabase,
        dbStatus,
      }}
    >
      <Router>
        <div
          className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${
            lang === 'bn' ? 'bangla-font' : 'font-sans'
          }`}
        >
          {mapsQuotaExceeded && (
            <div className="sticky top-0 z-[120] bg-amber-50 dark:bg-amber-950/90 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 text-amber-900 dark:text-amber-100 text-xs font-medium flex flex-wrap items-center justify-between gap-2 no-print">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? 'Google Maps ডেমো কী-এর ব্যবহারের সীমা শেষ হয়েছে। বিস্তারিত জানতে দেখুন:'
                    : 'Google Maps demo key quota limit reached.'}{' '}
                  <a
                    href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold"
                  >
                    {lang === 'bn' ? 'সমাধান নির্দেশিকা' : 'Quota Troubleshooting Guide'}
                  </a>
                </span>
              </span>
              <button
                onClick={() => setMapsQuotaExceeded(false)}
                className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200/70 dark:bg-amber-800 hover:opacity-80"
              >
                {lang === 'bn' ? 'বন্ধ' : 'Dismiss'}
              </button>
            </div>
          )}

          <Navbar />
          <NoticeTicker />
          <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/notices" element={<NoticeBoard />} />
              <Route path="/news" element={<NoticeBoard initialTab="news" />} />
              <Route path="/events" element={<NoticeBoard initialTab="events" />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/admission" element={<Admission />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/syllabus" element={<Syllabus />} />
              <Route path="/routine" element={<Routine />} />
              <Route path="/ebooks" element={<EBookLibrary />} />
              <Route path="/exams" element={<OnlineExam />} />
              <Route path="/alumni" element={<Alumni />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/calendar" element={<AcademicCalendar />} />
              <Route path="/portals" element={<Login />} />
              <Route path="/login/*" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Login />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-4 text-center no-print">
            <div className="max-w-5xl mx-auto">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
                {t(CAMPUS_BRAND)}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{t(settings.name)}</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t(settings.tagline || CAMPUS_TAGLINE)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 tabular-nums">
                {t(settings.location)} · EIIN: {settings.eiin} · {settings.phone}
              </p>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
                <Link to="/about" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'পরিচিতি' : 'About'}
                </Link>
                <Link to="/notices" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'নোটিশ ও সংবাদ' : 'Notice & News'}
                </Link>
                <Link to="/exams" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'অনলাইন পরীক্ষা' : 'Online Exam'}
                </Link>
                <Link to="/ebooks" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Digital Library'}
                </Link>
                <Link to="/admission" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'অনলাইন ভর্তি' : 'Admission'}
                </Link>
                <Link to="/alumni" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'অ্যালামনাই' : 'Alumni'}
                </Link>
                <Link to="/login/parent" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'অভিভাবক পোর্টাল' : 'Parent Portal'}
                </Link>
                <Link to="/login/admin" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}
                </Link>
                <Link to="/contact" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {lang === 'bn' ? 'যোগাযোগ' : 'Contact'}
                </Link>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-4">
                © 2026 {t(CAMPUS_BRAND)} · {t(settings.name)}। {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
              </p>

              <div className="inline-block border-t border-slate-100 dark:border-slate-800 pt-4 px-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'bn' ? 'তৈরি করেছেন: ' : 'Made by '}
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">JAHIDUL ISLAM</span>
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold tracking-wider mt-0.5 uppercase">
                  IIT, University of Dhaka
                </p>
              </div>
            </div>
          </footer>

          <OfflineIndicator />

          <button
            onClick={() => setShowChat(!showChat)}
            aria-label={lang === 'bn' ? 'এআই স্কুল অ্যাসিস্ট্যান্ট' : 'AI School Assistant'}
            className="fixed bottom-6 right-6 bg-emerald-700 hover:bg-emerald-800 text-white p-4 rounded-2xl shadow-2xl z-50 transition-all hover:scale-105 active:scale-95 no-print"
          >
            {showChat ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          </button>

          {showChat && (
            <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] md:w-[26rem] h-[34rem] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 border border-slate-200 dark:border-slate-800 flex flex-col no-print">
              <div className="bg-emerald-700 p-5 text-white flex justify-between items-center rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold block leading-none text-sm">
                      {lang === 'bn' ? 'এআই স্কুল অ্যাসিস্ট্যান্ট' : 'AI School Assistant'}
                    </span>
                    <span className="text-[10px] opacity-80 font-medium">
                      {lang === 'bn' ? 'ভর্তি, রুটিন ও পড়াশোনার সহায়তা' : 'Admissions, Routines & Study Help'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="hover:bg-white/10 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-5 space-y-3 bg-slate-50 dark:bg-slate-950/60">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8 flex flex-col items-center">
                    <Sparkles className="w-10 h-10 mb-3 text-emerald-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {lang === 'bn' ? 'আজ কীভাবে সাহায্য করতে পারি?' : 'How can I help you today?'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs">
                      {lang === 'bn'
                        ? 'ভর্তি, পরীক্ষার রুটিন, বই বা স্কুলের যেকোনো তথ্য সম্পর্কে প্রশ্ন করুন।'
                        : 'Ask about admissions, exam schedules, textbooks, or campus info.'}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {[
                        lang === 'bn' ? 'ভর্তির তথ্য ও সময়সূচি?' : 'How to apply for admission?',
                        lang === 'bn' ? 'আসন্ন পরীক্ষার রুটিন কবে?' : 'Upcoming exam dates?',
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => setChatInput(q)}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-700 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3.5 rounded-2xl shadow-sm flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 rounded-b-3xl">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white"
                  placeholder={lang === 'bn' ? 'যেকোনো প্রশ্ন লিখুন...' : 'Ask anything...'}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className={`bg-emerald-700 text-white p-3.5 rounded-xl shadow-md transition-all active:scale-95 ${
                    !chatInput.trim() || isTyping ? 'opacity-50' : 'hover:bg-emerald-800'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
