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
import { sanitizeFirestoreId, clampImageString } from './utils/imageUtils';
import {
  hashPassword,
  verifyPassword,
  normalizePhoneDigits,
  phonesMatch,
  buildStudentRegistrationNo,
} from './utils/security';
import {
  safeLocalGet,
  safeLocalSet,
  loadAllIdbKeys,
  getDirtyKeys,
  markDirtyKey,
  clearDirtyKey,
} from './utils/storage';
import {
  getDhakaTodayISO,
  getDhakaYear,
  getDhakaNoticeStamp,
  attachDhakaTimeToDate,
} from './utils/dhakaTime';
import { mergeNctbHolidaysForActiveYear } from './utils/nctbHolidays';
import { isHeadTeacherUser, findMatchingTeacher } from './utils/teacherRole';

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
  phone?: string;
  designation?: string;
  subject?: string;
  qualification?: string;
  bloodGroup?: string;
  assignedClass?: string;
  registrationNo?: string;
  guardianName?: string;
  section?: string;
  session?: string;
  relationship?: 'Father' | 'Mother' | 'Guardian';
  linkedStudentId?: string;
  linkedStudentIds?: string[];
  linkedChildClass?: string;
  linkedChildRoll?: string;
  linkedChildName?: string;
}

export interface SelfRegistrationPayload {
  role: 'student' | 'teacher' | 'parent';
  name: string;
  password: string;
  phone: string;
  email?: string;
  photo?: string;
  bloodGroup?: string;
  classId?: string;
  section?: string;
  roll?: string;
  session?: string;
  guardianName?: string;
  nameBn?: string;
  designation?: string;
  subject?: string;
  qualification?: string;
  assignedClass?: string;
  relationship?: 'Father' | 'Mother' | 'Guardian';
}

export interface SelfRegistrationResult {
  ok: boolean;
  error?: string;
  user?: AuthUser;
  registrationNo?: string;
  teacherCode?: string;
  matchedStudentName?: string;
  matchedStudentClass?: string;
  matchedStudentRoll?: string;
  matchedStudents?: Array<{ name: string; classId: string; roll: string }>;
}

const DEFAULT_DEMO_PASSWORDS: Record<string, string> = {
  headteacher: '123456',
  teacher01: '123456',
  student01: '123456',
  parent01: '123456',
};

const SEEDED_USER_TEMPLATES: Omit<AuthUser, 'passwordHash'>[] = [
  {
    userId: 'headteacher',
    name: 'মোঃ আব্দুল করিম',
    role: 'teacher',
    email: 'headteacher@rbhs.edu',
    phone: '+880 1711-000001',
    designation: 'প্রধান শিক্ষক',
    subject: 'ইংরেজি ও প্রশাসন',
    qualification: 'এম.এ, বি.এড (ঢাকা বিশ্ববিদ্যালয়)',
  },
  {
    userId: 'teacher01',
    name: 'মোসাঃ ফাতেমা বেগম',
    role: 'teacher',
    email: 'teacher01@rbhs.edu',
    phone: '01711-000102',
    designation: 'সিনিয়র সহকারী শিক্ষক',
    subject: 'Science & Mathematics',
    assignedClass: '9',
  },
  {
    userId: 'student01',
    name: 'আরিয়ান করিম (Aryan Karim)',
    role: 'student',
    email: 'student01@rbhs.edu',
    phone: '01712-667788',
    registrationNo: 'RBMB-REG-2026-0901',
    section: 'Science',
    session: '2026',
    guardianName: 'মোঃ করিম উদ্দিন',
    linkedStudentId: 'st-9-1',
    linkedChildClass: '9',
    linkedChildRoll: '01',
    linkedChildName: 'আরিয়ান করিম (Aryan Karim)',
  },
  {
    userId: 'parent01',
    name: 'মোঃ করিম উদ্দিন (অভিভাবক)',
    role: 'parent',
    email: 'parent01@rbhs.edu',
    phone: '01712-667788',
    relationship: 'Father',
    linkedStudentId: 'st-9-1',
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
  updateCloudUserRole: (
    uid: string,
    role: BaseUserRole,
    assignedClass?: string,
    designation?: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string; code?: string; isAdmin?: boolean }>;
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
  selfRegisterAccount: (payload: SelfRegistrationPayload) => Promise<SelfRegistrationResult>;
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
  addClassTeacherByAdmin: (payload: {
    nameBn: string;
    nameEn?: string;
    designationBn: string;
    designationEn?: string;
    subjectBn: string;
    subjectEn?: string;
    qualificationBn?: string;
    qualificationEn?: string;
    phone?: string;
    email?: string;
    bloodGroup?: string;
    assignedClass?: string;
    teacherCode?: string;
    password?: string;
    photo?: string;
  }) => Promise<{ ok: boolean; teacher?: Teacher; teacherCode?: string; error?: string }>;
  assignClassTeacher: (params: {
    teacherId?: string;
    userId?: string;
    cloudUid?: string;
    classId: string;
    exclusiveForClass?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
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
  submitAlumniProfile: (profile: AlumniProfile) => Promise<void>;
  updateAlumniStatus: (id: string, status: 'pending' | 'approved') => Promise<void>;
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
  updateSettings: (newSettings: SchoolSettings) => Promise<boolean>;
  exportDatabase: () => void;
  importDatabase: (jsonData: string) => boolean;
  dbStatus: 'synced' | 'syncing' | 'error';
  lastSyncError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const safeLoc = (val?: { bn?: string; en?: string }, fallbackBn = 'তথ্য', fallbackEn = 'Info', maxLen = 300) => {
  const rawBn = (val?.bn || '').trim();
  const rawEn = (val?.en || '').trim();
  const bn = (rawBn || rawEn || fallbackBn).slice(0, maxLen);
  const en = (rawEn || rawBn || fallbackEn).slice(0, maxLen);
  return { bn, en };
};

const stripPlaintextPassword = (u: AuthUser): AuthUser => {
  const { password: _pw, ...rest } = u;
  return rest;
};

const LEGACY_SCHOOL_NAME_BN = [
  'রাণীর বাজার মডেল উচ্চ বিদ্যালয়',
  'রাণীর বাজার মডেল উচ্চ বিদ্যালয়',
  'রাণীর বাজার মডেল হাই স্কুল',
];
const LEGACY_SCHOOL_NAME_EN = [
  'Rani Bazar Model High School',
  'Ranir Bazar Model High School',
];

const normalizeSchoolSettings = (raw?: Partial<SchoolSettings> | null): SchoolSettings => {
  const base = { ...INITIAL_SETTINGS, ...(raw || {}) };
  const rawBn = (base.name?.bn || '').trim();
  const rawEn = (base.name?.en || '').trim();
  const nextBn =
    !rawBn || LEGACY_SCHOOL_NAME_BN.some((legacy) => rawBn.includes(legacy) || rawBn.includes('মডেল উচ্চ') || rawBn.includes('মডেল হাই'))
      ? SCHOOL_NAME.bn
      : rawBn;
  const nextEn =
    !rawEn || LEGACY_SCHOOL_NAME_EN.some((legacy) => rawEn.toLowerCase().includes(legacy.toLowerCase()) || rawEn.toLowerCase().includes('model high'))
      ? SCHOOL_NAME.en
      : rawEn;

  const headMsgBn = (base.headTeacherMessage?.bn || '').replace(/রাণীর বাজার মডেল উচ্চ বিদ্যালয়/g, SCHOOL_NAME.bn);
  const headMsgEn = (base.headTeacherMessage?.en || '').replace(/Rani Bazar Model High School/gi, SCHOOL_NAME.en);

  return {
    ...base,
    name: { bn: nextBn, en: nextEn },
    headTeacherMessage: base.headTeacherMessage
      ? { bn: headMsgBn, en: headMsgEn }
      : INITIAL_SETTINGS.headTeacherMessage,
    schoolPhoto:
      base.schoolPhoto && !base.schoolPhoto.includes('unsplash.com') && !base.schoolPhoto.includes('picsum.photos')
        ? base.schoolPhoto
        : INITIAL_SETTINGS.schoolPhoto,
    headTeacherPhoto:
      base.headTeacherPhoto && !base.headTeacherPhoto.includes('unsplash.com') && !base.headTeacherPhoto.includes('picsum.photos')
        ? base.headTeacherPhoto
        : INITIAL_SETTINGS.headTeacherPhoto,
  };
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
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const cloudRoleRef = useRef({ isCloudAdmin: false, isCloudTeacher: false });

  const [notices, setNotices] = useState<Notice[]>(() => safeLocalGet('db_notices', INITIAL_NOTICES));
  const [newsList, setNewsList] = useState<NewsArticle[]>(() => safeLocalGet('db_news', INITIAL_NEWS));
  const [eventsList, setEventsList] = useState<CampusEvent[]>(() => safeLocalGet('db_events', INITIAL_EVENTS));
  const [teachers, setTeachers] = useState<Teacher[]>(() => safeLocalGet('db_teachers', TEACHERS));
  const [ebooks, setEbooks] = useState<EBook[]>(() => safeLocalGet('db_ebooks', INITIAL_EBOOKS));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => safeLocalGet('db_gallery', INITIAL_GALLERY));
  const [holidays, setHolidays] = useState<Holiday[]>(() =>
    mergeNctbHolidaysForActiveYear(safeLocalGet('db_holidays', HOLIDAYS_2026), getDhakaYear())
  );
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
    return normalizeSchoolSettings(saved);
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
        const tmpl = SEEDED_USER_TEMPLATES.find((tItem) => tItem.userId.toLowerCase() === u.userId.toLowerCase());
        const mergedSeeded = tmpl ? { ...tmpl, ...u } : u;
        migrated.push({ ...stripPlaintextPassword(mergedSeeded), ...(nextHash ? { passwordHash: nextHash } : {}) });
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

  const effectiveHolidays = useMemo(
    () => mergeNctbHolidaysForActiveYear(holidays, getDhakaYear()),
    [holidays]
  );

  // Keep latest state ref for initial cloud seeding when admin connects
  const latestStateRef = useRef({
    notices,
    newsList,
    eventsList,
    teachers,
    ebooks,
    gallery,
    holidays: effectiveHolidays,
    settings,
    onlineExams,
    examRoutines,
    subjects,
    alumni,
    classRoutines,
    students,
    homeworkList,
    studentLeaves,
    feeRecords,
    portalNotifications,
  });
  useEffect(() => {
    latestStateRef.current = {
      notices,
      newsList,
      eventsList,
      teachers,
      ebooks,
      gallery,
      holidays: effectiveHolidays,
      settings,
      onlineExams,
      examRoutines,
      subjects,
      alumni,
      classRoutines,
      students,
      homeworkList,
      studentLeaves,
      feeRecords,
      portalNotifications,
    };
  }, [
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
    classRoutines,
    students,
    homeworkList,
    studentLeaves,
    feeRecords,
    portalNotifications,
  ]);

  useEffect(() => {
    cloudRoleRef.current = { isCloudAdmin, isCloudTeacher };
  }, [isCloudAdmin, isCloudTeacher]);

  // Hydrate durable IndexedDB cache on mount (recovers uploaded photos & datasets that exceeded 5MB localStorage)
  useEffect(() => {
    let cancelled = false;
    const hydrateFromIdb = async () => {
      const idbData = await loadAllIdbKeys([
        'school_settings',
        'db_notices',
        'db_news',
        'db_events',
        'db_teachers',
        'db_ebooks',
        'db_gallery',
        'db_holidays',
        'admission_applications',
        'contact_messages',
        'db_students',
        'db_attendance',
        'db_student_attendance',
        'db_homework',
        'db_assignment_submissions',
        'db_exam_marks',
        'db_online_exams',
        'db_exam_attempts',
        'db_exam_routines',
        'db_class_routines',
        'db_subjects',
        'db_parent_messages',
        'db_parent_links',
        'db_alumni',
        'db_teacher_leaves',
        'db_student_leaves',
        'db_fee_records',
        'db_portal_notifications',
        'db_audit_logs',
        'registered_users',
      ]);
      if (cancelled) return;
      if (idbData.school_settings) setSettings((prev) => normalizeSchoolSettings({ ...prev, ...(idbData.school_settings as SchoolSettings) }));
      if (Array.isArray(idbData.db_notices)) setNotices(idbData.db_notices as Notice[]);
      if (Array.isArray(idbData.db_news)) setNewsList(idbData.db_news as NewsArticle[]);
      if (Array.isArray(idbData.db_events)) setEventsList(idbData.db_events as CampusEvent[]);
      if (Array.isArray(idbData.db_teachers)) setTeachers(idbData.db_teachers as Teacher[]);
      if (Array.isArray(idbData.db_ebooks)) setEbooks(idbData.db_ebooks as EBook[]);
      if (Array.isArray(idbData.db_gallery)) setGallery(idbData.db_gallery as GalleryItem[]);
      if (Array.isArray(idbData.db_holidays)) setHolidays(idbData.db_holidays as Holiday[]);
      if (Array.isArray(idbData.admission_applications)) setAdmissions(idbData.admission_applications as AdmissionApplication[]);
      if (Array.isArray(idbData.contact_messages)) setContactMessages(idbData.contact_messages as ContactMessage[]);
      if (Array.isArray(idbData.db_students)) setStudents(idbData.db_students as SchoolStudent[]);
      if (Array.isArray(idbData.db_attendance)) setAttendanceRecords(idbData.db_attendance as AttendanceRecord[]);
      if (Array.isArray(idbData.db_student_attendance)) setStudentAttendance(idbData.db_student_attendance as StudentAttendanceRecord[]);
      if (Array.isArray(idbData.db_homework)) setHomeworkList(idbData.db_homework as HomeworkItem[]);
      if (Array.isArray(idbData.db_assignment_submissions)) setAssignmentSubmissions(idbData.db_assignment_submissions as AssignmentSubmission[]);
      if (Array.isArray(idbData.db_exam_marks)) setExamMarks(idbData.db_exam_marks as ExamMark[]);
      if (Array.isArray(idbData.db_online_exams)) setOnlineExams(idbData.db_online_exams as OnlineExamType[]);
      if (Array.isArray(idbData.db_exam_attempts)) setExamAttempts(idbData.db_exam_attempts as ExamAttempt[]);
      if (Array.isArray(idbData.db_exam_routines)) setExamRoutines(idbData.db_exam_routines as ExamRoutineItem[]);
      if (Array.isArray(idbData.db_class_routines)) setClassRoutines(idbData.db_class_routines as ClassRoutine[]);
      if (Array.isArray(idbData.db_subjects)) setSubjects(idbData.db_subjects as SchoolSubject[]);
      if (Array.isArray(idbData.db_parent_messages)) setParentMessages(idbData.db_parent_messages as ParentMessage[]);
      if (Array.isArray(idbData.db_parent_links)) setParentLinks(idbData.db_parent_links as ParentStudentLink[]);
      if (Array.isArray(idbData.db_alumni)) setAlumni(idbData.db_alumni as AlumniProfile[]);
      if (Array.isArray(idbData.db_teacher_leaves)) setTeacherLeaves(idbData.db_teacher_leaves as TeacherLeave[]);
      if (Array.isArray(idbData.db_student_leaves)) setStudentLeaves(idbData.db_student_leaves as StudentLeave[]);
      if (Array.isArray(idbData.db_fee_records)) setFeeRecords(idbData.db_fee_records as FeeRecord[]);
      if (Array.isArray(idbData.db_portal_notifications)) setPortalNotifications(idbData.db_portal_notifications as PortalNotification[]);
      if (Array.isArray(idbData.db_audit_logs)) setAuditLogs(idbData.db_audit_logs as AuditLog[]);
      if (Array.isArray(idbData.registered_users) && idbData.registered_users.length > 0) {
        setRegisteredUsers(
          (idbData.registered_users as AuthUser[])
            .filter((u) => u && u.role !== 'admin' && u.userId !== 'admin')
            .map(stripPlaintextPassword)
        );
      }
    };
    hydrateFromIdb();

    const savedUser = safeLocalGet<AuthUser | null>('school_user', null);
    if (savedUser && savedUser.role !== 'admin') {
      setUser(stripPlaintextPassword(savedUser));
    } else if (savedUser?.role === 'admin' && !auth.currentUser) {
      localStorage.removeItem('school_user');
    }
    testFirestoreConnection();
    return () => {
      cancelled = true;
    };
  }, []);

  const syncFirebaseUserSession = async (fbUser: FirebaseUser | null): Promise<AuthUser | null> => {
    const seq = ++authSeqRef.current;
    setResolvedUid(null);

    if (!fbUser) {
      setFirebaseUser(null);
      setIsCloudAdmin(false);
      setIsCloudTeacher(false);
      setCloudUsers([]);
      return null;
    }

    const isVerified = fbUser.emailVerified === true;
    if (!isVerified) {
      setIsCloudAdmin(false);
      setIsCloudTeacher(false);
      setCloudUsers([]);
      setFirebaseUser(fbUser);
      setResolvedUid(fbUser.uid);
      return null;
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

    if (authSeqRef.current !== seq) return null;

    let resolvedRole: BaseUserRole = adminStatus ? 'admin' : 'student';
    let extraChild: Partial<AuthUser> = {};
    let syncedName = fbUser.displayName || fbUser.email || 'User';
    let syncedPhoto = fbUser.photoURL || '';

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
        syncedName = safeName;
        syncedPhoto = safePhoto;
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
        syncedName = pendingProfile?.name || d.name || syncedName;
        syncedPhoto = pendingProfile?.photo || d.photo || syncedPhoto;
        extraChild = {
          ...(d.phone ? { phone: d.phone } : {}),
          ...(d.designation ? { designation: d.designation } : {}),
          ...(d.assignedClass ? { assignedClass: d.assignedClass } : {}),
          ...(d.registrationNo ? { registrationNo: d.registrationNo } : {}),
          ...(d.linkedStudentId ? { linkedStudentId: d.linkedStudentId } : {}),
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
    } catch (err) {
      console.warn('User profile Firestore sync fallback active:', err);
    }

    if (authSeqRef.current !== seq) return null;

    const syncedAuthUser: AuthUser = {
      role: resolvedRole,
      name: syncedName,
      userId: fbUser.uid,
      email: fbUser.email || '',
      photo: syncedPhoto,
      ...extraChild,
    };

    setUser(syncedAuthUser);
    safeLocalSet('school_user', syncedAuthUser);
    setIsCloudAdmin(adminStatus);
    setIsCloudTeacher(adminStatus || resolvedRole === 'teacher');
    setFirebaseUser(fbUser);
    setResolvedUid(fbUser.uid);
    return syncedAuthUser;
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
    const msg = err instanceof Error ? err.message : String(err);
    setLastSyncError(`${path}: ${msg}`);
    try {
      handleFirestoreError(err, op, path);
    } catch {
      // Logged inside handleFirestoreError
    }
  };

  // Seed each Firestore collection if currently empty (in safe <=12 doc chunks so single failures or 1MB limits never abort other collections)
  useEffect(() => {
    if (!isCloudAdmin || !firebaseUser || resolvedUid !== firebaseUser.uid) return;
    let cancelled = false;

    const commitOpsChunked = async (
      ops: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }>
    ) => {
      for (let i = 0; i < ops.length; i += 10) {
        if (cancelled) return;
        const chunk = ops.slice(i, i + 10);
        const b = writeBatch(db);
        chunk.forEach((op) => b.set(op.ref, op.data));
        await b.commit();
      }
    };

    const seedCloudIfEmpty = async () => {
      try {
        const cur = latestStateRef.current;
        setDbStatus('syncing');

        const settingsRef = doc(db, 'settings', 'main');
        const settingsSnap = await getDoc(settingsRef);
        if (!cancelled && !settingsSnap.exists()) {
          const sPhoto = clampImageString(cur.settings.schoolPhoto);
          const hPhoto = clampImageString(cur.settings.headTeacherPhoto);
          await setDoc(settingsRef, {
            name: safeLoc(cur.settings.name, SCHOOL_NAME.bn, SCHOOL_NAME.en, 200),
            shortName: (cur.settings.shortName || INITIAL_SETTINGS.shortName || 'RBMB Digital Campus').slice(0, 100),
            tagline: safeLoc(cur.settings.tagline, CAMPUS_TAGLINE.bn, CAMPUS_TAGLINE.en, 300),
            eiin: (cur.settings.eiin || INITIAL_SETTINGS.eiin).slice(0, 32),
            phone: (cur.settings.phone || INITIAL_SETTINGS.phone).slice(0, 40),
            email: (cur.settings.email && cur.settings.email.length >= 3 ? cur.settings.email : INITIAL_SETTINGS.email).slice(0, 150),
            location: safeLoc(cur.settings.location, INITIAL_SETTINGS.location.bn, INITIAL_SETTINGS.location.en, 300),
            ...(sPhoto ? { schoolPhoto: sPhoto } : {}),
            ...(cur.settings.headTeacherName ? { headTeacherName: safeLoc(cur.settings.headTeacherName, 'প্রধান শিক্ষক', 'Head Teacher', 200) } : {}),
            ...(cur.settings.headTeacherMessage ? { headTeacherMessage: safeLoc(cur.settings.headTeacherMessage, 'স্বাগতম।', 'Welcome.', 2500) } : {}),
            ...(hPhoto ? { headTeacherPhoto: hPhoto } : {}),
            latitude: cur.settings.latitude ?? INITIAL_SETTINGS.latitude,
            longitude: cur.settings.longitude ?? INITIAL_SETTINGS.longitude,
            updatedAt: serverTimestamp(),
          });
        }

        const checkEmpty = async (colName: string) => {
          const snap = await getDocs(query(collection(db, colName), limit(1)));
          return snap.empty;
        };

        if (!cancelled && (await checkEmpty('notices'))) {
          await commitOpsChunked(
            cur.notices.map((n) => {
              const id = sanitizeFirestoreId(n.id);
              return {
                ref: doc(db, 'notices', id),
                data: {
                  id,
                  title: safeLoc(n.title, 'নোটিশ', 'Notice', 300),
                  date: (n.date && n.date.length >= 4 ? n.date : '2026-01-01').slice(0, 32),
                  category: n.category || 'General',
                  description: safeLoc(n.description, 'বিস্তারিত', 'Details', 5000),
                  ...(n.pdfUrl ? { pdfUrl: n.pdfUrl.slice(0, 2000) } : {}),
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('news'))) {
          await commitOpsChunked(
            cur.newsList.map((item) => {
              const id = sanitizeFirestoreId(item.id);
              const img = clampImageString(item.imageUrl);
              return {
                ref: doc(db, 'news', id),
                data: {
                  id,
                  title: safeLoc(item.title, 'সংবাদ', 'News', 300),
                  summary: safeLoc(item.summary, 'সারসংক্ষেপ', 'Summary', 600),
                  content: safeLoc(item.content, 'বিস্তারিত সংবাদ', 'News content', 5000),
                  category: item.category || 'Academic',
                  date: (item.date && item.date.length >= 4 ? item.date : '2026-01-01').slice(0, 32),
                  ...(img ? { imageUrl: img } : {}),
                  ...(item.author ? { author: item.author.slice(0, 150) } : {}),
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('events'))) {
          await commitOpsChunked(
            cur.eventsList.map((ev) => {
              const id = sanitizeFirestoreId(ev.id);
              return {
                ref: doc(db, 'events', id),
                data: {
                  id,
                  title: safeLoc(ev.title, 'অনুষ্ঠান', 'Event', 300),
                  description: safeLoc(ev.description, 'বিস্তারিত', 'Details', 3000),
                  date: (ev.date && ev.date.length >= 4 ? ev.date : '2026-01-01').slice(0, 32),
                  time: (ev.time || '10:00 AM').slice(0, 64),
                  location: safeLoc(ev.location, 'বিদ্যালয় প্রাঙ্গণ', 'Campus', 300),
                  category: ev.category || 'Academic',
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('teachers'))) {
          await commitOpsChunked(
            cur.teachers.map((teach) => {
              const id = sanitizeFirestoreId(teach.id);
              return {
                ref: doc(db, 'teachers', id),
                data: {
                  id,
                  name: safeLoc(teach.name, 'শিক্ষক', 'Teacher', 200),
                  designation: safeLoc(teach.designation, 'সহকারী শিক্ষক', 'Assistant Teacher', 200),
                  subject: safeLoc(teach.subject, 'সাধারণ', 'General', 200),
                  qualification: safeLoc(teach.qualification, 'স্নাতকোত্তর', 'Graduate', 300),
                  photo: clampImageString(teach.photo),
                  ...(teach.teacherCode ? { teacherCode: teach.teacherCode.slice(0, 40) } : {}),
                  ...(teach.phone ? { phone: teach.phone.slice(0, 40) } : {}),
                  ...(teach.bloodGroup ? { bloodGroup: teach.bloodGroup.slice(0, 16) } : {}),
                  ...(teach.cardIssueDate ? { cardIssueDate: teach.cardIssueDate.slice(0, 32) } : {}),
                  ...(teach.cardValidUpto ? { cardValidUpto: teach.cardValidUpto.slice(0, 32) } : {}),
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('ebooks'))) {
          await commitOpsChunked(
            cur.ebooks.map((eb) => {
              const id = sanitizeFirestoreId(eb.id);
              return {
                ref: doc(db, 'ebooks', id),
                data: {
                  id,
                  title: safeLoc(eb.title, 'বই', 'Book', 300),
                  classId: (eb.classId || '6').slice(0, 16),
                  className: safeLoc(eb.className, 'শ্রেণী', 'Class', 100),
                  subject: (eb.subject || 'General').slice(0, 120),
                  ...(eb.category ? { category: eb.category.slice(0, 40) } : {}),
                  ...(eb.description ? { description: safeLoc(eb.description, 'বইয়ের বিবরণ', 'Book description', 1500) } : {}),
                  coverUrl: clampImageString(eb.coverUrl),
                  downloadUrl: (eb.downloadUrl || '#').slice(0, 2000),
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('gallery'))) {
          await commitOpsChunked(
            cur.gallery
              .filter((g) => clampImageString(g.url).length > 0)
              .map((g) => {
                const id = sanitizeFirestoreId(g.id);
                return {
                  ref: doc(db, 'gallery', id),
                  data: {
                    id,
                    url: clampImageString(g.url),
                    caption: safeLoc(g.caption, 'ক্যাম্পাস ছবি', 'Campus photo', 400),
                    ...(g.mediaType ? { mediaType: g.mediaType } : {}),
                    ...(g.videoUrl ? { videoUrl: g.videoUrl.slice(0, 2000) } : {}),
                    ...(g.category ? { category: g.category.slice(0, 32) } : {}),
                    isPublic: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  },
                };
              })
          );
        }

        if (!cancelled && (await checkEmpty('holidays'))) {
          await commitOpsChunked(
            cur.holidays.map((h) => {
              const id = sanitizeFirestoreId(h.id);
              return {
                ref: doc(db, 'holidays', id),
                data: {
                  id,
                  title: safeLoc(h.title, 'ছুটি', 'Holiday', 300),
                  date: (h.date && h.date.length >= 4 ? h.date : '2026-01-01').slice(0, 32),
                  duration: safeLoc(h.duration, '১ দিন', '1 Day', 100),
                  type: h.type || 'National',
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('onlineExams'))) {
          await commitOpsChunked(
            cur.onlineExams.map((ex) => {
              const id = sanitizeFirestoreId(ex.id);
              return {
                ref: doc(db, 'onlineExams', id),
                data: {
                  id,
                  title: safeLoc(ex.title, 'পরীক্ষা', 'Exam', 300),
                  classId: ex.classId,
                  subject: (ex.subject || 'General').slice(0, 120),
                  chapter: (ex.chapter || 'Chapter 1').slice(0, 200),
                  durationMinutes: ex.durationMinutes,
                  mode: ex.mode,
                  questions: ex.questions,
                  createdBy: (ex.createdBy || 'Teacher').slice(0, 150),
                  date: (ex.date || '2026-01-01').slice(0, 32),
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('examRoutines'))) {
          await commitOpsChunked(
            cur.examRoutines.map((er) => {
              const id = sanitizeFirestoreId(er.id);
              return {
                ref: doc(db, 'examRoutines', id),
                data: {
                  id,
                  examTerm: (er.examTerm || 'Half Yearly').slice(0, 100),
                  classId: er.classId,
                  subject: (er.subject || 'Subject').slice(0, 120),
                  date: (er.date || '2026-01-01').slice(0, 32),
                  time: (er.time || '10:00 AM').slice(0, 64),
                  ...(er.room ? { room: er.room.slice(0, 64) } : {}),
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('subjects'))) {
          await commitOpsChunked(
            cur.subjects.map((s) => {
              const id = sanitizeFirestoreId(s.id);
              return {
                ref: doc(db, 'subjects', id),
                data: {
                  id,
                  code: (s.code || '101').slice(0, 16),
                  name: safeLoc(s.name, 'বিষয়', 'Subject', 200),
                  classId: s.classId,
                  totalMarks: s.totalMarks,
                  ...(s.teacherName ? { teacherName: s.teacherName.slice(0, 150) } : {}),
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('classRoutines'))) {
          await commitOpsChunked(
            cur.classRoutines.map((cr) => {
              const id = sanitizeFirestoreId(cr.classId);
              return {
                ref: doc(db, 'classRoutines', id),
                data: {
                  classId: id,
                  className: safeLoc(cr.className, `শ্রেণী ${id}`, `Class ${id}`, 100),
                  schedule: cr.schedule,
                  isPublic: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('students'))) {
          await commitOpsChunked(
            cur.students.map((st) => {
              const id = sanitizeFirestoreId(st.id);
              const photo = clampImageString(st.photo);
              return {
                ref: doc(db, 'students', id),
                data: {
                  id,
                  roll: (st.roll || '01').slice(0, 20),
                  name: (st.name || 'Student').slice(0, 150),
                  classId: st.classId,
                  section: (st.section || 'A').slice(0, 40),
                  guardianMobile: (st.guardianMobile && st.guardianMobile.length >= 6 ? st.guardianMobile : '01700000000').slice(0, 30),
                  ...(st.guardianName ? { guardianName: st.guardianName.slice(0, 150) } : {}),
                  ...(photo ? { photo } : {}),
                  ...(st.registrationNo ? { registrationNo: st.registrationNo.slice(0, 64) } : {}),
                  ...(st.registrationDate ? { registrationDate: st.registrationDate.slice(0, 32) } : {}),
                  ...(st.session ? { session: st.session.slice(0, 16) } : {}),
                  ...(st.cardIssueDate ? { cardIssueDate: st.cardIssueDate.slice(0, 32) } : {}),
                  ...(st.cardValidUpto ? { cardValidUpto: st.cardValidUpto.slice(0, 32) } : {}),
                  ...(st.bloodGroup ? { bloodGroup: st.bloodGroup.slice(0, 16) } : {}),
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('homework'))) {
          await commitOpsChunked(
            cur.homeworkList.map((hw) => {
              const id = sanitizeFirestoreId(hw.id);
              return {
                ref: doc(db, 'homework', id),
                data: {
                  id,
                  title: (hw.title || 'Homework').slice(0, 300),
                  subject: (hw.subject || 'Subject').slice(0, 120),
                  classId: hw.classId,
                  description: (hw.description || 'Details').slice(0, 3000),
                  dueDate: (hw.dueDate || '2026-12-31').slice(0, 32),
                  assignedBy: (hw.assignedBy || 'Teacher').slice(0, 150),
                  createdDate: (hw.createdDate || '2026-01-01').slice(0, 32),
                  isPublic: hw.isPublic ?? true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('alumni'))) {
          await commitOpsChunked(
            cur.alumni.map((al) => {
              const id = sanitizeFirestoreId(al.id);
              return {
                ref: doc(db, 'alumni', id),
                data: {
                  id,
                  name: (al.name || 'Alumni').slice(0, 150),
                  batchYear: (al.batchYear && al.batchYear.length >= 4 ? al.batchYear : '2020').slice(0, 16),
                  currentRole: (al.currentRole || 'Graduate').slice(0, 150),
                  organization: (al.organization || 'RBMB').slice(0, 200),
                  ...(al.city ? { city: al.city.slice(0, 100) } : {}),
                  message: (al.message || 'Proud alumni').slice(0, 1000),
                  status: al.status,
                  isPublic: al.status === 'approved',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled && (await checkEmpty('portal_notifications'))) {
          await commitOpsChunked(
            cur.portalNotifications.map((pn) => {
              const id = sanitizeFirestoreId(pn.id);
              return {
                ref: doc(db, 'portal_notifications', id),
                data: {
                  id,
                  title: (pn.title || 'Alert').slice(0, 250),
                  message: (pn.message || 'Announcement').slice(0, 2000),
                  targetRole: pn.targetRole,
                  classId: pn.classId || 'all',
                  priority: pn.priority || 'normal',
                  senderName: (pn.senderName || 'Administration').slice(0, 150),
                  createdDate: (pn.createdDate || '2026-01-01').slice(0, 32),
                  createdAt: serverTimestamp(),
                },
              };
            })
          );
        }

        if (!cancelled) setDbStatus('synced');
      } catch (err) {
        safeListenerError(err, OperationType.WRITE, 'initial-seed');
      }
    };

    seedCloudIfEmpty();
    return () => {
      cancelled = true;
    };
  }, [isCloudAdmin, firebaseUser, resolvedUid]);

  const shouldDeferSnapshotToLocal = (storageKey: string) => {
    return !cloudRoleRef.current.isCloudAdmin && !cloudRoleRef.current.isCloudTeacher && getDirtyKeys().has(storageKey);
  };

  // Real-time Firestore Listeners for Public School Data
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          if (shouldDeferSnapshotToLocal('school_settings')) return;
          const d = snap.data();
          const nextSettings = normalizeSchoolSettings({
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
          });
          setSettings(nextSettings);
          safeLocalSet('school_settings', nextSettings);
        }
      },
      (err) => console.warn('Settings listener warning:', err)
    );

    const unsubNotices = onSnapshot(
      query(collection(db, 'notices'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_notices')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_news')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_events')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_teachers')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_ebooks')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_gallery')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_holidays')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_homework')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_online_exams')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_exam_routines')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_subjects')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_class_routines')) {
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_alumni')) {
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

      const parentMsgsSource = isCloudAdmin
        ? collection(db, 'parentMessages')
        : query(collection(db, 'parentMessages'), where('recipientUid', '==', firebaseUser.uid));

      const unsubParentMsgs = onSnapshot(
        parentMsgsSource,
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
        if (items.length > 0) {
          setStudents(items);
        }
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
        if (!snap.empty && !shouldDeferSnapshotToLocal('db_portal_notifications')) {
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

  const persistLocal = (key: string, data: unknown, trackDirty = true) => {
    setDbStatus('syncing');
    if (trackDirty) markDirtyKey(key);
    safeLocalSet(key, data);
    setTimeout(() => setDbStatus((cur) => (cur === 'error' ? 'error' : 'synced')), 300);
  };

  const signInWithGoogle = async (): Promise<{ ok: boolean; error?: string; code?: string; isAdmin?: boolean }> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const synced = await syncFirebaseUserSession(cred.user);
      return { ok: true, isAdmin: synced?.role === 'admin' };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const rawMsg = err instanceof Error ? err.message : '';
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      console.error('Google Sign-In failed:', code, rawMsg, err);

      if (code === 'auth/unauthorized-domain') {
        return {
          ok: false,
          code,
          error:
            lang === 'bn'
              ? `এই ডোমেইন (${host}) Firebase Console > Authentication > Settings > Authorized domains-এ যুক্ত নেই। অনুগ্রহ করে "${host}" যুক্ত করুন।`
              : `Domain "${host}" is not authorized in Firebase Console > Authentication > Settings > Authorized domains. Please add "${host}".`,
        };
      }
      if (code === 'auth/popup-blocked') {
        return {
          ok: false,
          code,
          error:
            lang === 'bn'
              ? 'ব্রাউজার বা প্রিভিউ iframe Google পপ-আপ ব্লক করেছে। পপ-আপ Allow করুন অথবা প্রিভিউয়ের "Open in new tab" দিয়ে খুলে লগইন করুন।'
              : 'Browser blocked the Google Sign-In popup. Allow popups or open the app in a new tab to sign in.',
        };
      }
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return {
          ok: false,
          code,
          error:
            lang === 'bn'
              ? 'Google লগইন পপ-আপ সম্পূর্ণ হওয়ার আগেই বন্ধ হয়ে গেছে। আবার চেষ্টা করুন।'
              : 'Google Sign-In popup was closed before finishing. Please try again.',
        };
      }
      if (code === 'auth/operation-not-allowed') {
        return {
          ok: false,
          code,
          error:
            lang === 'bn'
              ? 'Firebase Console > Authentication > Sign-in method-এ Google প্রোভাইডার চালু নেই। অনুগ্রহ করে Google Sign-In এনাবল করুন।'
              : 'Google Sign-In provider is not enabled in Firebase Console > Authentication > Sign-in method.',
        };
      }
      if (code === 'auth/network-request-failed') {
        return {
          ok: false,
          code,
          error:
            lang === 'bn'
              ? 'ইন্টারনেট বা Firebase সার্ভারের সাথে সংযোগ পাওয়া যাচ্ছে না।'
              : 'Network error while connecting to Google Auth. Check your connection.',
        };
      }
      return {
        ok: false,
        code,
        error:
          lang === 'bn'
            ? `Google লগইন ব্যর্থ হয়েছে${code ? ` (${code})` : ''}।`
            : `Google Sign-In failed${code ? ` (${code})` : ''}.`,
      };
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string; needsVerification?: boolean }> => {
    const cleanEmail = email.trim();
    const isBootstrapEmail = cleanEmail.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
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
        if (isBootstrapEmail) {
          return {
            ok: false,
            error:
              lang === 'bn'
                ? 'এই Gmail অ্যাকাউন্টটি Google Sign-In দিয়ে যুক্ত — পাসওয়ার্ড ছাড়াই সরাসরি উপরের "Google দিয়ে অ্যাডমিন লগইন" বাটনে ক্লিক করে প্রবেশ করুন।'
                : 'This Gmail uses Google Sign-In — click the "Continue with Google (Admin Gmail)" button above to sign in directly without a password.',
          };
        }
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
              ? 'Email/Password লগইন চালু নেই। সরাসরি "Google দিয়ে লগইন" বাটন ব্যবহার করুন।'
              : 'Email/Password sign-in is disabled. Please use the Google Sign-In button.',
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
    identifier: string,
    password: string,
    role: BaseUserRole
  ): Promise<AuthUser | null> => {
    // Admin access must strictly authenticate via verified Firebase Auth
    if (role === 'admin') return null;
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) return null;

    const found = registeredUsers.find((u) => {
      if (u.role !== role) return false;
      if (u.userId.trim().toLowerCase() === cleanId) return true;
      if (u.email && u.email.trim().toLowerCase() === cleanId) return true;
      if (u.registrationNo && u.registrationNo.trim().toLowerCase() === cleanId) return true;
      if (
        role === 'student' &&
        u.linkedChildClass &&
        u.linkedChildRoll &&
        buildStudentRegistrationNo(u.linkedChildClass, u.linkedChildRoll, u.session || '2026').toLowerCase() === cleanId
      ) {
        return true;
      }
      if ((role === 'teacher' || role === 'parent') && u.phone && phonesMatch(u.phone, identifier)) {
        return true;
      }
      return false;
    });

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

  const selfRegisterAccount = async (payload: SelfRegistrationPayload): Promise<SelfRegistrationResult> => {
    const cleanName = payload.name.trim();
    const cleanPhone = payload.phone.trim();
    const cleanEmail = (payload.email || '').trim();
    const cleanPassword = payload.password;
    const todayStr = getDhakaTodayISO();

    if (!cleanName) {
      return { ok: false, error: lang === 'bn' ? 'অনুগ্রহ করে সম্পূর্ণ নাম লিখুন।' : 'Please enter your full name.' };
    }
    if (normalizePhoneDigits(cleanPhone).length < 6) {
      return { ok: false, error: lang === 'bn' ? 'সঠিক মোবাইল নম্বর দিন (কমপক্ষে ৬ সংখ্যা)।' : 'Please enter a valid mobile number.' };
    }
    if (cleanPassword.length < 6) {
      return { ok: false, error: lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.' };
    }
    if (cleanEmail && !cleanEmail.includes('@')) {
      return { ok: false, error: lang === 'bn' ? 'সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid email address.' };
    }
    if (
      cleanEmail &&
      registeredUsers.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail.toLowerCase())
    ) {
      return {
        ok: false,
        error: lang === 'bn' ? 'এই ইমেইল ঠিকানা দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে!' : 'An account with this email already exists!',
      };
    }

    const passwordHash = await hashPassword(cleanPassword);
    const safePhoto = payload.photo ? clampImageString(payload.photo) : '';

    if (payload.role === 'student') {
      const classId = (['6', '7', '8', '9', '10'].includes(payload.classId || '') ? payload.classId : '9') as string;
      const rawRoll = (payload.roll || '').trim();
      if (!rawRoll) {
        return { ok: false, error: lang === 'bn' ? 'শিক্ষার্থীর রোল নম্বর দিন।' : 'Please enter roll number.' };
      }
      const cleanRoll = /^\d+$/.test(rawRoll) ? rawRoll.padStart(2, '0') : rawRoll;
      const cleanSession = (payload.session || '2026').replace(/[^0-9]/g, '').slice(0, 4) || '2026';
      const cleanSection = (payload.section || 'A').trim() || 'A';
      const registrationNo = buildStudentRegistrationNo(classId, cleanRoll, cleanSession);

      const alreadyClaimed = registeredUsers.some(
        (u) =>
          u.role === 'student' &&
          ((u.registrationNo || '').toLowerCase() === registrationNo.toLowerCase() ||
            u.userId.toLowerCase() === registrationNo.toLowerCase() ||
            (u.linkedChildClass === classId && (u.linkedChildRoll || '').trim() === cleanRoll))
      );
      if (alreadyClaimed) {
        return {
          ok: false,
          error:
            lang === 'bn'
              ? `শ্রেণী ${classId}, রোল ${cleanRoll} (${registrationNo}) দিয়ে ইতিমধ্যে একটি শিক্ষার্থী অ্যাকাউন্ট নিবন্ধিত আছে।`
              : `A student account for Class ${classId}, Roll ${cleanRoll} (${registrationNo}) is already registered.`,
        };
      }

      const existingStudent = students.find(
        (s) => s.classId === classId && s.roll.trim() === cleanRoll
      );
      const studentId = existingStudent?.id || sanitizeFirestoreId(`st-${classId}-${cleanRoll}-${Date.now().toString(36)}`);
      const nextStudent: SchoolStudent = {
        ...(existingStudent || {}),
        id: studentId,
        roll: cleanRoll,
        name: cleanName,
        classId,
        section: cleanSection,
        guardianName: (payload.guardianName || '').trim() || existingStudent?.guardianName,
        guardianMobile: cleanPhone,
        photo: safePhoto || existingStudent?.photo,
        registrationNo,
        registrationDate: existingStudent?.registrationDate || todayStr,
        session: cleanSession,
        cardIssueDate: existingStudent?.cardIssueDate || todayStr,
        cardValidUpto: existingStudent?.cardValidUpto || `${cleanSession}-12-31`,
        bloodGroup: payload.bloodGroup || existingStudent?.bloodGroup,
      };

      const nextStudents = existingStudent
        ? students.map((s) => (s.id === existingStudent.id ? nextStudent : s))
        : [...students, nextStudent];
      setStudents(nextStudents);
      persistLocal('db_students', nextStudents);

      const newAuthUser: AuthUser = {
        userId: registrationNo,
        registrationNo,
        role: 'student',
        name: cleanName,
        email: cleanEmail || undefined,
        phone: cleanPhone,
        photo: safePhoto || undefined,
        bloodGroup: payload.bloodGroup || undefined,
        guardianName: (payload.guardianName || '').trim() || undefined,
        section: cleanSection,
        session: cleanSession,
        linkedStudentId: studentId,
        linkedChildClass: classId,
        linkedChildRoll: cleanRoll,
        linkedChildName: cleanName,
        passwordHash,
      };
      const nextUsers = [...registeredUsers, newAuthUser];
      setRegisteredUsers(nextUsers);
      persistLocal('registered_users', nextUsers);

      return {
        ok: true,
        user: stripPlaintextPassword(newAuthUser),
        registrationNo,
        matchedStudentName: cleanName,
        matchedStudentClass: classId,
        matchedStudentRoll: cleanRoll,
      };
    }

    if (payload.role === 'teacher') {
      const cleanDesig = (payload.designation || '').trim() || 'সহকারী শিক্ষক';
      const cleanSubject = (payload.subject || '').trim() || 'General';
      const cleanQual = (payload.qualification || '').trim() || 'Graduate';
      const cleanNameBn = (payload.nameBn || '').trim() || cleanName;

      if (
        registeredUsers.some(
          (u) => u.role === 'teacher' && u.phone && phonesMatch(u.phone, cleanPhone)
        )
      ) {
        return {
          ok: false,
          error:
            lang === 'bn'
              ? 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একজন শিক্ষক নিবন্ধিত আছেন।'
              : 'A teacher account with this mobile number already exists.',
        };
      }

      const year = getDhakaYear();
      const serial = String(teachers.length + 1).padStart(3, '0');
      const teacherCode = `RBMB-TCH-${year}-${serial}`;
      const cleanAssignedClass = ['6', '7', '8', '9', '10'].includes(payload.assignedClass || '')
        ? payload.assignedClass
        : undefined;

      const existingTeacher = teachers.find(
        (tc) =>
          (tc.phone && phonesMatch(tc.phone, cleanPhone)) ||
          tc.name.en.trim().toLowerCase() === cleanName.toLowerCase() ||
          tc.name.bn.trim().toLowerCase() === cleanNameBn.toLowerCase()
      );
      const teacherId =
        existingTeacher?.id || sanitizeFirestoreId(`tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`);

      const nextTeacher: Teacher = {
        ...(existingTeacher || {}),
        id: teacherId,
        teacherCode: existingTeacher?.teacherCode || teacherCode,
        name: { bn: cleanNameBn, en: cleanName },
        designation: { bn: cleanDesig, en: cleanDesig },
        subject: { bn: cleanSubject, en: cleanSubject },
        qualification: { bn: cleanQual, en: cleanQual },
        phone: cleanPhone,
        bloodGroup: payload.bloodGroup || existingTeacher?.bloodGroup,
        assignedClass: cleanAssignedClass || existingTeacher?.assignedClass,
        photo: safePhoto || existingTeacher?.photo || '',
        cardIssueDate: existingTeacher?.cardIssueDate || todayStr,
        cardValidUpto: existingTeacher?.cardValidUpto || `${year + 3}-12-31`,
        isPublic: true,
      };

      const nextTeachers = existingTeacher
        ? teachers.map((tc) => (tc.id === existingTeacher.id ? nextTeacher : tc))
        : [...teachers, nextTeacher];
      setTeachers(nextTeachers);
      persistLocal('db_teachers', nextTeachers);

      const finalCode = nextTeacher.teacherCode || teacherCode;
      const newAuthUser: AuthUser = {
        userId: finalCode,
        role: 'teacher',
        name: cleanNameBn,
        email: cleanEmail || undefined,
        phone: cleanPhone,
        designation: cleanDesig,
        subject: cleanSubject,
        qualification: cleanQual,
        bloodGroup: payload.bloodGroup || undefined,
        assignedClass: nextTeacher.assignedClass,
        photo: safePhoto || undefined,
        passwordHash,
      };
      const nextUsers = [...registeredUsers, newAuthUser];
      setRegisteredUsers(nextUsers);
      persistLocal('registered_users', nextUsers);

      return {
        ok: true,
        user: stripPlaintextPassword(newAuthUser),
        teacherCode: finalCode,
      };
    }

    // Parent registration: verify against ALL students sharing the student's registered mobile number
    const matchedStudentMap = new Map<string, SchoolStudent>();
    students.forEach((s) => {
      if (phonesMatch(cleanPhone, s.guardianMobile)) {
        matchedStudentMap.set(s.id, s);
      }
    });
    registeredUsers.forEach((u) => {
      if (u.role === 'student' && u.phone && phonesMatch(cleanPhone, u.phone)) {
        const existingRec = students.find(
          (s) =>
            s.id === u.linkedStudentId ||
            (s.classId === u.linkedChildClass && s.roll.trim() === (u.linkedChildRoll || '').trim())
        );
        if (existingRec) {
          matchedStudentMap.set(existingRec.id, existingRec);
        } else {
          const synthId = u.linkedStudentId || sanitizeFirestoreId(`st-${u.linkedChildClass || '9'}-${u.linkedChildRoll || '01'}`);
          if (!matchedStudentMap.has(synthId)) {
            matchedStudentMap.set(synthId, {
              id: synthId,
              name: u.name,
              classId: u.linkedChildClass || '9',
              roll: u.linkedChildRoll || '01',
              section: u.section || 'A',
              guardianMobile: cleanPhone,
              registrationNo: u.registrationNo,
            });
          }
        }
      }
    });

    const matchedList = Array.from(matchedStudentMap.values());
    const primaryChild = matchedList[0];

    if (!primaryChild) {
      return {
        ok: false,
        error:
          lang === 'bn'
            ? 'এই মোবাইল নম্বরের সাথে কোনো নিবন্ধিত শিক্ষার্থীর তথ্য মেলেনি। শিক্ষার্থী নিবন্ধনের সময় যে মোবাইল নম্বর দিয়েছে, ঠিক সেই নম্বরটি দিন।'
            : 'No registered student found with this mobile number. Please enter the exact mobile number submitted by your child.',
      };
    }

    const parentWithSamePhone = registeredUsers.find(
      (u) => u.role === 'parent' && u.phone && phonesMatch(u.phone, cleanPhone)
    );
    if (parentWithSamePhone && !cleanEmail) {
      return {
        ok: false,
        error:
          lang === 'bn'
            ? 'এই মোবাইল নম্বরে ইতিমধ্যে একটি অভিভাবক অ্যাকাউন্ট রয়েছে। নতুন অ্যাকাউন্ট খুলতে একটি ইমেইল ঠিকানা যুক্ত করুন অথবা বর্তমান অ্যাকাউন্ট দিয়ে লগইন করুন।'
            : 'A parent account with this mobile number already exists. Add a unique email address or sign in with your existing parent account.',
      };
    }

    const parentUserId = cleanEmail || `PRN-${normalizePhoneDigits(cleanPhone).slice(-10)}-${Date.now().toString(36).slice(-4)}`;
    const newAuthUser: AuthUser = {
      userId: parentUserId,
      role: 'parent',
      name: cleanName,
      email: cleanEmail || undefined,
      phone: cleanPhone,
      relationship: payload.relationship || 'Guardian',
      photo: safePhoto || undefined,
      linkedStudentId: primaryChild.id,
      linkedStudentIds: matchedList.map((s) => s.id),
      linkedChildClass: primaryChild.classId,
      linkedChildRoll: primaryChild.roll,
      linkedChildName: primaryChild.name,
      passwordHash,
    };
    const nextUsers = [...registeredUsers, newAuthUser];
    setRegisteredUsers(nextUsers);
    persistLocal('registered_users', nextUsers);

    return {
      ok: true,
      user: stripPlaintextPassword(newAuthUser),
      matchedStudentName: primaryChild.name,
      matchedStudentClass: primaryChild.classId,
      matchedStudentRoll: primaryChild.roll,
      matchedStudents: matchedList.map((s) => ({
        name: s.name,
        classId: s.classId,
        roll: s.roll,
      })),
    };
  };

  const updateUser = async (updatedUser: AuthUser) => {
    let nextHash = updatedUser.passwordHash;
    if (updatedUser.password && updatedUser.password.trim().length > 0) {
      nextHash = await hashPassword(updatedUser.password.trim());
    }
    const cleanInput = stripPlaintextPassword({
      ...updatedUser,
      photo: updatedUser.photo ? clampImageString(updatedUser.photo) : updatedUser.photo,
    });
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
        setDbStatus('syncing');
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        const profilePayload = {
          name: (cleanInput.name || 'User').slice(0, 150),
          email: (cleanInput.email || firebaseUser.email || 'user@rbhs.edu').slice(0, 150),
          ...(cleanInput.photo ? { photo: clampImageString(cleanInput.photo) } : {}),
          ...(cleanInput.phone ? { phone: cleanInput.phone.slice(0, 40) } : {}),
          ...(isCloudAdmin && cleanInput.designation ? { designation: cleanInput.designation.slice(0, 150) } : {}),
          ...(isCloudAdmin && cleanInput.assignedClass !== undefined ? { assignedClass: cleanInput.assignedClass.slice(0, 16) } : {}),
          ...(cleanInput.relationship ? { relationship: cleanInput.relationship } : {}),
          ...(cleanInput.linkedStudentId ? { linkedStudentId: cleanInput.linkedStudentId.slice(0, 128) } : {}),
          ...(cleanInput.linkedStudentIds && cleanInput.linkedStudentIds.length > 0
            ? { linkedStudentIds: cleanInput.linkedStudentIds.slice(0, 15).map((sid) => sid.slice(0, 128)) }
            : {}),
          ...(cleanInput.linkedChildClass ? { linkedChildClass: cleanInput.linkedChildClass.slice(0, 16) } : {}),
          ...(cleanInput.linkedChildRoll ? { linkedChildRoll: cleanInput.linkedChildRoll.slice(0, 20) } : {}),
          ...(cleanInput.linkedChildName ? { linkedChildName: cleanInput.linkedChildName.slice(0, 150) } : {}),
          updatedAt: serverTimestamp(),
        };
        if (snap.exists()) {
          await updateDoc(userRef, profilePayload);
        } else {
          await setDoc(userRef, {
            uid: sanitizeFirestoreId(firebaseUser.uid),
            role: (cleanInput.role || 'student') as BaseUserRole,
            ...profilePayload,
            createdAt: serverTimestamp(),
          });
        }
        setDbStatus('synced');
        setLastSyncError(null);
      } catch (err) {
        safeListenerError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
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
    const restoredStudents = safeLocalGet<SchoolStudent[]>('db_students', INITIAL_STUDENTS);
    setStudents(restoredStudents.length > 0 ? restoredStudents : INITIAL_STUDENTS);
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
      createdDate: getDhakaTodayISO(),
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

  const updateCloudUserRole = async (
    uid: string,
    role: BaseUserRole,
    assignedClass?: string,
    designation?: string
  ) => {
    if (!isCloudAdmin) return;
    const safeUid = sanitizeFirestoreId(uid);
    const targetUser = cloudUsers.find((cu) => cu.uid === uid || cu.uid === safeUid);
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'users', safeUid), {
        role,
        ...(assignedClass !== undefined ? { assignedClass: assignedClass.slice(0, 16) } : {}),
        ...(designation !== undefined ? { designation: designation.slice(0, 150) } : {}),
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
        `Updated user ${targetUser?.email || safeUid} role to ${role}${assignedClass ? ` (Class ${assignedClass})` : ''}${designation ? ` • ${designation}` : ''}`
      );
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const STORAGE_KEY_BY_COL: Record<string, string> = {
    notices: 'db_notices',
    news: 'db_news',
    events: 'db_events',
    teachers: 'db_teachers',
    ebooks: 'db_ebooks',
    gallery: 'db_gallery',
    holidays: 'db_holidays',
    students: 'db_students',
    attendance: 'db_attendance',
    homework: 'db_homework',
    examMarks: 'db_exam_marks',
    onlineExams: 'db_online_exams',
    examRoutines: 'db_exam_routines',
    classRoutines: 'db_class_routines',
    subjects: 'db_subjects',
    alumni: 'db_alumni',
    teacherLeaves: 'db_teacher_leaves',
    studentLeaves: 'db_student_leaves',
    fee_records: 'db_fee_records',
    portal_notifications: 'db_portal_notifications',
  };

  // Cloud + Local CRUD helpers
  const syncDocUpsert = async (
    collectionName: string,
    id: string,
    payload: Record<string, unknown>,
    isUpdate: boolean,
    allowTeacher = false
  ): Promise<boolean> => {
    if (allowTeacher ? !isCloudTeacher : !isCloudAdmin) return false;
    setDbStatus('syncing');
    const docRef = doc(db, collectionName, id);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
      } else {
        await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      if (STORAGE_KEY_BY_COL[collectionName]) clearDirtyKey(STORAGE_KEY_BY_COL[collectionName]);
      setLastSyncError(null);
      setDbStatus('synced');
      return true;
    } catch (err) {
      safeListenerError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, `${collectionName}/${id}`);
      return false;
    }
  };

  const syncDocDelete = async (collectionName: string, id: string, allowTeacher = false): Promise<boolean> => {
    if (allowTeacher ? !isCloudTeacher : !isCloudAdmin) return false;
    setDbStatus('syncing');
    try {
      await deleteDoc(doc(db, collectionName, id));
      if (STORAGE_KEY_BY_COL[collectionName]) clearDirtyKey(STORAGE_KEY_BY_COL[collectionName]);
      setLastSyncError(null);
      setDbStatus('synced');
      return true;
    } catch (err) {
      safeListenerError(err, OperationType.DELETE, `${collectionName}/${id}`);
      return false;
    }
  };

  // Notices (Teacher + Admin can publish/edit — always auto-stamped with Asia/Dhaka GMT+6 date & time)
  const addNotice = (n: Notice) => {
    const id = sanitizeFirestoreId(n.id);
    const stampedDate =
      n.date && /GMT\+6/i.test(n.date)
        ? n.date.slice(0, 32)
        : n.date && n.date.length >= 4
        ? attachDhakaTimeToDate(n.date)
        : getDhakaNoticeStamp();
    const item = { ...n, id, date: stampedDate };
    const updated = [item, ...notices];
    setNotices(updated);
    persistLocal('db_notices', updated);
    void syncDocUpsert(
      'notices',
      id,
      {
        id,
        title: safeLoc(n.title, 'নোটিশ', 'Notice', 300),
        date: stampedDate,
        category: n.category || 'General',
        description: safeLoc(n.description, 'বিস্তারিত', 'Details', 5000),
        ...(n.pdfUrl ? { pdfUrl: n.pdfUrl.slice(0, 2000) } : {}),
        isPublic: true,
      },
      false,
      true
    );
  };

  const updateNotice = (n: Notice) => {
    const id = sanitizeFirestoreId(n.id);
    const stampedDate =
      n.date && /GMT\+6/i.test(n.date)
        ? n.date.slice(0, 32)
        : attachDhakaTimeToDate(n.date);
    const updated = notices.map((i) => (i.id === n.id ? { ...n, id, date: stampedDate } : i));
    setNotices(updated);
    persistLocal('db_notices', updated);
    void syncDocUpsert(
      'notices',
      id,
      {
        id,
        title: safeLoc(n.title, 'নোটিশ', 'Notice', 300),
        date: stampedDate,
        category: n.category || 'General',
        description: safeLoc(n.description, 'বিস্তারিত', 'Details', 5000),
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
    void syncDocDelete('notices', sanitizeFirestoreId(id));
  };

  // News Articles (Teacher + Admin can publish/edit)
  const addNews = (item: NewsArticle) => {
    const id = sanitizeFirestoreId(item.id);
    const img = clampImageString(item.imageUrl);
    const clean = { ...item, id, ...(img ? { imageUrl: img } : {}), isPublic: true };
    const updated = [clean, ...newsList];
    setNewsList(updated);
    persistLocal('db_news', updated);
    void syncDocUpsert(
      'news',
      id,
      {
        id,
        title: safeLoc(clean.title, 'সংবাদ', 'News', 300),
        summary: safeLoc(clean.summary, 'সারসংক্ষেপ', 'Summary', 600),
        content: safeLoc(clean.content, 'বিস্তারিত সংবাদ', 'News content', 5000),
        category: clean.category || 'Academic',
        date: (clean.date && clean.date.length >= 4 ? clean.date : getDhakaTodayISO()).slice(0, 32),
        ...(img ? { imageUrl: img } : {}),
        ...(clean.author ? { author: clean.author.slice(0, 150) } : {}),
        isPublic: true,
      },
      false,
      true
    );
  };

  const updateNews = (item: NewsArticle) => {
    const id = sanitizeFirestoreId(item.id);
    const img = clampImageString(item.imageUrl);
    const clean = { ...item, id, ...(img ? { imageUrl: img } : {}), isPublic: true };
    const updated = newsList.map((i) => (i.id === item.id ? clean : i));
    setNewsList(updated);
    persistLocal('db_news', updated);
    void syncDocUpsert(
      'news',
      id,
      {
        id,
        title: safeLoc(clean.title, 'সংবাদ', 'News', 300),
        summary: safeLoc(clean.summary, 'সারসংক্ষেপ', 'Summary', 600),
        content: safeLoc(clean.content, 'বিস্তারিত সংবাদ', 'News content', 5000),
        category: clean.category || 'Academic',
        date: (clean.date && clean.date.length >= 4 ? clean.date : getDhakaTodayISO()).slice(0, 32),
        ...(img ? { imageUrl: img } : {}),
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
    void syncDocDelete('news', sanitizeFirestoreId(id));
  };

  // Campus Events (Teacher + Admin can publish/edit)
  const addEvent = (ev: CampusEvent) => {
    const id = sanitizeFirestoreId(ev.id);
    const clean = { ...ev, id, isPublic: true };
    const updated = [clean, ...eventsList];
    setEventsList(updated);
    persistLocal('db_events', updated);
    void syncDocUpsert(
      'events',
      id,
      {
        id,
        title: safeLoc(clean.title, 'অনুষ্ঠান', 'Event', 300),
        description: safeLoc(clean.description, 'বিস্তারিত', 'Details', 3000),
        date: (clean.date && clean.date.length >= 4 ? clean.date : getDhakaTodayISO()).slice(0, 32),
        time: (clean.time || '10:00 AM').slice(0, 64),
        location: safeLoc(clean.location, 'বিদ্যালয় প্রাঙ্গণ', 'Campus', 300),
        category: clean.category || 'Academic',
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
    void syncDocUpsert(
      'events',
      id,
      {
        id,
        title: safeLoc(clean.title, 'অনুষ্ঠান', 'Event', 300),
        description: safeLoc(clean.description, 'বিস্তারিত', 'Details', 3000),
        date: (clean.date && clean.date.length >= 4 ? clean.date : getDhakaTodayISO()).slice(0, 32),
        time: (clean.time || '10:00 AM').slice(0, 64),
        location: safeLoc(clean.location, 'বিদ্যালয় প্রাঙ্গণ', 'Campus', 300),
        category: clean.category || 'Academic',
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
    void syncDocDelete('events', sanitizeFirestoreId(id));
  };

  // Teachers
  const addTeacher = (teach: Teacher) => {
    const id = sanitizeFirestoreId(teach.id);
    const safePhoto = clampImageString(teach.photo);
    const item: Teacher = { ...teach, id, photo: safePhoto };
    const updated = [...teachers, item];
    setTeachers(updated);
    persistLocal('db_teachers', updated);
    void syncDocUpsert(
      'teachers',
      id,
      {
        id,
        name: safeLoc(item.name, 'শিক্ষক', 'Teacher', 200),
        designation: safeLoc(item.designation, 'সহকারী শিক্ষক', 'Assistant Teacher', 200),
        subject: safeLoc(item.subject, 'সাধারণ', 'General', 200),
        qualification: safeLoc(item.qualification, 'স্নাতকোত্তর', 'Graduate', 300),
        photo: safePhoto,
        ...(item.teacherCode ? { teacherCode: item.teacherCode.trim().slice(0, 40) } : {}),
        ...(item.phone ? { phone: item.phone.trim().slice(0, 40) } : {}),
        ...(item.bloodGroup ? { bloodGroup: item.bloodGroup.trim().slice(0, 16) } : {}),
        ...(item.assignedClass ? { assignedClass: item.assignedClass.trim().slice(0, 16) } : {}),
        ...(item.cardIssueDate ? { cardIssueDate: item.cardIssueDate.trim().slice(0, 32) } : {}),
        ...(item.cardValidUpto ? { cardValidUpto: item.cardValidUpto.trim().slice(0, 32) } : {}),
        isPublic: true,
      },
      false
    );
  };

  const updateTeacher = (teach: Teacher) => {
    const id = sanitizeFirestoreId(teach.id);
    const existingTeacher = teachers.find((i) => i.id === teach.id || i.id === id);
    const merged: Teacher = {
      ...(existingTeacher || teach),
      ...teach,
      id,
      photo: clampImageString(teach.photo ?? existingTeacher?.photo ?? ''),
    };
    const existsInList = Boolean(existingTeacher);
    const updated = existsInList
      ? teachers.map((i) => (i.id === teach.id || i.id === id ? merged : i))
      : [...teachers, merged];
    setTeachers(updated);
    persistLocal('db_teachers', updated);

    if (isCloudAdmin) {
      void syncDocUpsert(
        'teachers',
        id,
        {
          id,
          name: safeLoc(merged.name, 'শিক্ষক', 'Teacher', 200),
          designation: safeLoc(merged.designation, 'সহকারী শিক্ষক', 'Assistant Teacher', 200),
          subject: safeLoc(merged.subject, 'সাধারণ', 'General', 200),
          qualification: safeLoc(merged.qualification, 'স্নাতকোত্তর', 'Graduate', 300),
          photo: merged.photo,
          ...(merged.teacherCode ? { teacherCode: merged.teacherCode.trim().slice(0, 40) } : {}),
          ...(merged.phone ? { phone: merged.phone.trim().slice(0, 40) } : {}),
          ...(merged.bloodGroup ? { bloodGroup: merged.bloodGroup.trim().slice(0, 16) } : {}),
          ...('assignedClass' in teach
            ? { assignedClass: (teach.assignedClass || '').trim().slice(0, 16) }
            : merged.assignedClass !== undefined
            ? { assignedClass: merged.assignedClass.trim().slice(0, 16) }
            : {}),
          ...(merged.cardIssueDate ? { cardIssueDate: merged.cardIssueDate.trim().slice(0, 32) } : {}),
          ...(merged.cardValidUpto ? { cardValidUpto: merged.cardValidUpto.trim().slice(0, 32) } : {}),
          isPublic: true,
        },
        true
      );
    } else if (isCloudTeacher) {
      // Teachers can update card metadata fields permitted by security rules on existing teacher docs
      (async () => {
        try {
          const tRef = doc(db, 'teachers', id);
          const snap = await getDoc(tRef);
          if (snap.exists()) {
            setDbStatus('syncing');
            await updateDoc(tRef, {
              photo: merged.photo,
              ...(merged.teacherCode ? { teacherCode: merged.teacherCode.trim().slice(0, 40) } : {}),
              ...(merged.phone ? { phone: merged.phone.trim().slice(0, 40) } : {}),
              ...(merged.bloodGroup ? { bloodGroup: merged.bloodGroup.trim().slice(0, 16) } : {}),
              ...(merged.cardIssueDate ? { cardIssueDate: merged.cardIssueDate.trim().slice(0, 32) } : {}),
              ...(merged.cardValidUpto ? { cardValidUpto: merged.cardValidUpto.trim().slice(0, 32) } : {}),
              updatedAt: serverTimestamp(),
            });
            clearDirtyKey('db_teachers');
            setDbStatus('synced');
          }
        } catch (err) {
          safeListenerError(err, OperationType.UPDATE, `teachers/${id}`);
        }
      })();
    }
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter((tc) => tc.id !== id);
    setTeachers(updated);
    persistLocal('db_teachers', updated);
    void syncDocDelete('teachers', sanitizeFirestoreId(id));
  };

  const addClassTeacherByAdmin: AppContextType['addClassTeacherByAdmin'] = async (payload) => {
    const canManage = user?.role === 'admin' || isCloudAdmin;
    if (!canManage) {
      return {
        ok: false,
        error: lang === 'bn' ? 'শুধুমাত্র অ্যাডমিন নতুন শ্রেণী শিক্ষক যোগ করতে পারবেন।' : 'Only Admin can add a new Class Teacher.',
      };
    }

    const nameBn = payload.nameBn.trim() || payload.nameEn?.trim() || '';
    const nameEn = payload.nameEn?.trim() || nameBn;
    if (!nameBn) {
      return {
        ok: false,
        error: lang === 'bn' ? 'শিক্ষকের নাম লিখুন।' : 'Please enter teacher name.',
      };
    }

    const year = getDhakaYear();
    const todayIso = getDhakaTodayISO();
    const serial = String(teachers.length + 1).padStart(3, '0');
    const cleanCode = (payload.teacherCode || '').trim() || `RBMB-TCH-${year}-${serial}`;
    const teacherId = sanitizeFirestoreId(`tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`);
    const cleanClass = ['6', '7', '8', '9', '10'].includes((payload.assignedClass || '').trim())
      ? (payload.assignedClass || '').trim()
      : '';
    const safePhoto = clampImageString(payload.photo || '');
    const cleanDesigBn = payload.designationBn.trim() || 'সহকারী শিক্ষক';
    const cleanDesigEn = payload.designationEn?.trim() || cleanDesigBn;
    const cleanSubBn = payload.subjectBn.trim() || 'সাধারণ';
    const cleanSubEn = payload.subjectEn?.trim() || cleanSubBn;
    const cleanQualBn = payload.qualificationBn?.trim() || 'স্নাতকোত্তর';
    const cleanQualEn = payload.qualificationEn?.trim() || cleanQualBn;
    const cleanPhone = (payload.phone || '').trim();
    const cleanEmail = (payload.email || '').trim();
    const cleanBlood = (payload.bloodGroup || '').trim();

    const newTeacher: Teacher = {
      id: teacherId,
      teacherCode: cleanCode,
      name: { bn: nameBn, en: nameEn },
      designation: { bn: cleanDesigBn, en: cleanDesigEn },
      subject: { bn: cleanSubBn, en: cleanSubEn },
      qualification: { bn: cleanQualBn, en: cleanQualEn },
      phone: cleanPhone || undefined,
      bloodGroup: cleanBlood || undefined,
      assignedClass: cleanClass || undefined,
      photo: safePhoto,
      cardIssueDate: todayIso,
      cardValidUpto: `${year + 3}-12-31`,
      isPublic: true,
    };

    const nextTeachers = [...teachers, newTeacher];
    setTeachers(nextTeachers);
    persistLocal('db_teachers', nextTeachers);

    void syncDocUpsert(
      'teachers',
      teacherId,
      {
        id: teacherId,
        teacherCode: cleanCode.slice(0, 40),
        name: safeLoc(newTeacher.name, 'শিক্ষক', 'Teacher', 200),
        designation: safeLoc(newTeacher.designation, 'সহকারী শিক্ষক', 'Assistant Teacher', 200),
        subject: safeLoc(newTeacher.subject, 'সাধারণ', 'General', 200),
        qualification: safeLoc(newTeacher.qualification, 'স্নাতকোত্তর', 'Graduate', 300),
        photo: safePhoto,
        ...(cleanPhone ? { phone: cleanPhone.slice(0, 40) } : {}),
        ...(cleanBlood ? { bloodGroup: cleanBlood.slice(0, 16) } : {}),
        assignedClass: cleanClass,
        cardIssueDate: todayIso,
        cardValidUpto: `${year + 3}-12-31`,
        isPublic: true,
      },
      false
    );

    const rawPassword = (payload.password || '').trim() || '123456';
    const passwordHash = await hashPassword(rawPassword);
    const alreadyUserIdx = registeredUsers.findIndex(
      (u) =>
        u.userId.toLowerCase() === cleanCode.toLowerCase() ||
        (cleanPhone && u.phone && phonesMatch(u.phone, cleanPhone) && u.role === 'teacher') ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail.toLowerCase())
    );

    const newAuthUser: AuthUser = {
      userId: alreadyUserIdx !== -1 ? registeredUsers[alreadyUserIdx].userId : cleanCode,
      role: 'teacher',
      name: nameBn,
      email: cleanEmail || `${cleanCode.toLowerCase()}@rbhs.edu`,
      phone: cleanPhone || undefined,
      designation: cleanDesigBn,
      subject: cleanSubBn,
      qualification: cleanQualBn,
      bloodGroup: cleanBlood || undefined,
      assignedClass: cleanClass || undefined,
      photo: safePhoto || undefined,
      passwordHash,
    };

    const nextUsers =
      alreadyUserIdx !== -1
        ? registeredUsers.map((u, idx) => (idx === alreadyUserIdx ? { ...u, ...newAuthUser } : u))
        : [...registeredUsers, newAuthUser];
    setRegisteredUsers(nextUsers);
    persistLocal('registered_users', nextUsers);

    void logAuditEvent(
      'ROLE_CHANGED',
      'teachers',
      teacherId,
      `Added teacher ${nameBn} (${cleanCode})${cleanClass ? ` as Class ${cleanClass} teacher` : ''}`
    );

    return { ok: true, teacher: newTeacher, teacherCode: cleanCode };
  };

  const assignClassTeacher: AppContextType['assignClassTeacher'] = async ({
    teacherId,
    userId,
    cloudUid,
    classId,
    exclusiveForClass = false,
  }) => {
    const canAssign =
      user?.role === 'admin' || isCloudAdmin || isHeadTeacherUser(user, teachers, settings);
    if (!canAssign) {
      return {
        ok: false,
        error:
          lang === 'bn'
            ? 'শুধুমাত্র অ্যাডমিন এবং প্রধান শিক্ষক শ্রেণী শিক্ষক নির্ধারণ করতে পারবেন।'
            : 'Only Admin and Head Teacher can assign Class Teachers.',
      };
    }

    const cleanClass = ['6', '7', '8', '9', '10'].includes(classId.trim()) ? classId.trim() : '';

    // 1. Identify target teacher profile & account records
    const localAuthMatch = registeredUsers.find(
      (u) =>
        u.role === 'teacher' &&
        ((userId && u.userId.toLowerCase() === userId.toLowerCase()) ||
          (cloudUid && u.userId === cloudUid))
    );
    const cloudMatch = cloudUsers.find(
      (cu) => cu.role === 'teacher' && ((cloudUid && cu.uid === cloudUid) || (userId && cu.uid === userId))
    );

    let matchedTeacher =
      (teacherId ? teachers.find((tc) => tc.id === teacherId) : undefined) ||
      findMatchingTeacher(teachers, {
        userId: userId || cloudUid || localAuthMatch?.userId,
        name: localAuthMatch?.name || cloudMatch?.name,
        phone: localAuthMatch?.phone || cloudMatch?.phone,
      });

    let workingTeachers = [...teachers];

    // Auto-create Teacher directory profile when assigning a self-registered / cloud teacher user
    if (!matchedTeacher && (localAuthMatch || cloudMatch)) {
      const srcName = localAuthMatch?.name || cloudMatch?.name || 'Teacher';
      const newTid = sanitizeFirestoreId(
        `tc-${(cloudMatch?.uid || localAuthMatch?.userId || Date.now().toString(36)).slice(0, 60)}`
      );
      const year = getDhakaYear();
      const createdTeacher: Teacher = {
        id: newTid,
        teacherCode:
          localAuthMatch?.userId?.startsWith('RBMB-')
            ? localAuthMatch.userId
            : `RBMB-TCH-${year}-${String(workingTeachers.length + 1).padStart(3, '0')}`,
        name: { bn: srcName, en: srcName },
        designation: {
          bn: localAuthMatch?.designation || cloudMatch?.designation || 'সহকারী শিক্ষক',
          en: localAuthMatch?.designation || cloudMatch?.designation || 'Assistant Teacher',
        },
        subject: {
          bn: localAuthMatch?.subject || cloudMatch?.subject || 'সাধারণ',
          en: localAuthMatch?.subject || cloudMatch?.subject || 'General',
        },
        qualification: {
          bn: localAuthMatch?.qualification || cloudMatch?.qualification || 'স্নাতকোত্তর',
          en: localAuthMatch?.qualification || cloudMatch?.qualification || 'Graduate',
        },
        phone: localAuthMatch?.phone || cloudMatch?.phone,
        bloodGroup: localAuthMatch?.bloodGroup || cloudMatch?.bloodGroup,
        assignedClass: cleanClass,
        photo: localAuthMatch?.photo || cloudMatch?.photo || '',
        cardIssueDate: getDhakaTodayISO(),
        cardValidUpto: `${year + 3}-12-31`,
        isPublic: true,
      };
      matchedTeacher = createdTeacher;
      workingTeachers = [...workingTeachers, createdTeacher];
      if (isCloudAdmin) {
        void syncDocUpsert(
          'teachers',
          newTid,
          {
            id: newTid,
            teacherCode: createdTeacher.teacherCode,
            name: safeLoc(createdTeacher.name, 'শিক্ষক', 'Teacher', 200),
            designation: safeLoc(createdTeacher.designation, 'সহকারী শিক্ষক', 'Assistant Teacher', 200),
            subject: safeLoc(createdTeacher.subject, 'সাধারণ', 'General', 200),
            qualification: safeLoc(createdTeacher.qualification, 'স্নাতকোত্তর', 'Graduate', 300),
            photo: createdTeacher.photo,
            ...(createdTeacher.phone ? { phone: createdTeacher.phone.slice(0, 40) } : {}),
            ...(createdTeacher.bloodGroup ? { bloodGroup: createdTeacher.bloodGroup.slice(0, 16) } : {}),
            assignedClass: cleanClass,
            cardIssueDate: createdTeacher.cardIssueDate,
            cardValidUpto: createdTeacher.cardValidUpto,
            isPublic: true,
          },
          false
        );
      }
    }

    const clearedTeacherIds = new Set<string>();
    const clearedTeacherNames = new Set<string>();

    // Update target & optionally clear previous Class Teacher(s) of cleanClass when picking exclusively
    workingTeachers = workingTeachers.map((tc) => {
      if (matchedTeacher && tc.id === matchedTeacher.id) {
        return { ...tc, assignedClass: cleanClass };
      }
      if (exclusiveForClass && cleanClass && tc.assignedClass === cleanClass) {
        clearedTeacherIds.add(tc.id);
        clearedTeacherNames.add(tc.name.bn.trim().toLowerCase());
        clearedTeacherNames.add(tc.name.en.trim().toLowerCase());
        return { ...tc, assignedClass: '' };
      }
      return tc;
    });

    setTeachers(workingTeachers);
    persistLocal('db_teachers', workingTeachers);

    // Sync teacher updates to Firestore
    const teachersToSync: Teacher[] = [];
    if (matchedTeacher) {
      const updatedTarget = workingTeachers.find((tc) => tc.id === matchedTeacher!.id);
      if (updatedTarget) teachersToSync.push(updatedTarget);
    }
    clearedTeacherIds.forEach((cid) => {
      const prevTc = workingTeachers.find((tc) => tc.id === cid);
      if (prevTc) teachersToSync.push(prevTc);
    });

    for (const tc of teachersToSync) {
      const safeTid = sanitizeFirestoreId(tc.id);
      const nextAssigned = (tc.assignedClass || '').trim().slice(0, 16);
      if (isCloudAdmin) {
        void syncDocUpsert(
          'teachers',
          safeTid,
          {
            id: safeTid,
            name: safeLoc(tc.name, 'শিক্ষক', 'Teacher', 200),
            designation: safeLoc(tc.designation, 'সহকারী শিক্ষক', 'Assistant Teacher', 200),
            subject: safeLoc(tc.subject, 'সাধারণ', 'General', 200),
            qualification: safeLoc(tc.qualification, 'স্নাতকোত্তর', 'Graduate', 300),
            photo: clampImageString(tc.photo || ''),
            ...(tc.teacherCode ? { teacherCode: tc.teacherCode.trim().slice(0, 40) } : {}),
            ...(tc.phone ? { phone: tc.phone.trim().slice(0, 40) } : {}),
            ...(tc.bloodGroup ? { bloodGroup: tc.bloodGroup.trim().slice(0, 16) } : {}),
            assignedClass: nextAssigned,
            ...(tc.cardIssueDate ? { cardIssueDate: tc.cardIssueDate.trim().slice(0, 32) } : {}),
            ...(tc.cardValidUpto ? { cardValidUpto: tc.cardValidUpto.trim().slice(0, 32) } : {}),
            isPublic: true,
          },
          true
        );
      } else if (isCloudTeacher && firebaseUser?.emailVerified) {
        // Head Teacher cloud update of assignedClass on teachers/{id}
        try {
          const tRef = doc(db, 'teachers', safeTid);
          const snap = await getDoc(tRef);
          if (snap.exists()) {
            await updateDoc(tRef, {
              assignedClass: nextAssigned,
              updatedAt: serverTimestamp(),
            });
            clearDirtyKey('db_teachers');
          }
        } catch (err) {
          safeListenerError(err, OperationType.UPDATE, `teachers/${safeTid}`);
        }
      }
    }

    // Helper to check if an AuthUser matches the target or cleared teachers
    const matchesTargetUser = (u: {
      userId?: string;
      name?: string;
      phone?: string;
      role?: string | null;
    }) => {
      if (u.role !== 'teacher') return false;
      if (userId && u.userId?.toLowerCase() === userId.toLowerCase()) return true;
      if (cloudUid && u.userId === cloudUid) return true;
      if (!matchedTeacher) return false;
      const found = findMatchingTeacher([matchedTeacher], u);
      return Boolean(found);
    };

    const matchesClearedUser = (u: {
      userId?: string;
      name?: string;
      phone?: string;
      role?: string | null;
      assignedClass?: string;
    }) => {
      if (u.role !== 'teacher' || !exclusiveForClass || !cleanClass) return false;
      if (u.assignedClass !== cleanClass) return false;
      if (matchesTargetUser(u)) return false;
      const uName = (u.name || '').trim().toLowerCase();
      if (clearedTeacherNames.has(uName)) return true;
      return clearedTeacherIds.size > 0 || true;
    };

    // Sync local registered_users
    const nextRegUsers = registeredUsers.map((u) => {
      if (matchesTargetUser(u)) {
        return { ...u, assignedClass: cleanClass || undefined };
      }
      if (matchesClearedUser(u)) {
        return { ...u, assignedClass: undefined };
      }
      return u;
    });
    setRegisteredUsers(nextRegUsers);
    persistLocal('registered_users', nextRegUsers);

    // Sync active session if affected
    if (user && user.role === 'teacher') {
      if (matchesTargetUser(user)) {
        const nextSession: AuthUser = { ...user, assignedClass: cleanClass || undefined };
        setUser(nextSession);
        safeLocalSet('school_user', nextSession);
      } else if (matchesClearedUser(user)) {
        const nextSession: AuthUser = { ...user, assignedClass: undefined };
        setUser(nextSession);
        safeLocalSet('school_user', nextSession);
      }
    }

    // Sync cloud users if Admin
    if (isCloudAdmin) {
      for (const cu of cloudUsers) {
        if (cu.role !== 'teacher') continue;
        if (
          (cloudUid && cu.uid === cloudUid) ||
          (matchedTeacher && findMatchingTeacher([matchedTeacher], { userId: cu.uid, name: cu.name, phone: cu.phone, role: cu.role }))
        ) {
          await updateDoc(doc(db, 'users', sanitizeFirestoreId(cu.uid)), {
            assignedClass: cleanClass,
            updatedAt: serverTimestamp(),
          }).catch(() => {});
        } else if (exclusiveForClass && cleanClass && cu.assignedClass === cleanClass) {
          await updateDoc(doc(db, 'users', sanitizeFirestoreId(cu.uid)), {
            assignedClass: '',
            updatedAt: serverTimestamp(),
          }).catch(() => {});
        }
      }
    }

    const displayName =
      (matchedTeacher ? t(matchedTeacher.name) : '') ||
      localAuthMatch?.name ||
      cloudMatch?.name ||
      userId ||
      'Teacher';
    void logAuditEvent(
      'ROLE_CHANGED',
      'teachers',
      matchedTeacher?.id || userId || cloudUid || 'teacher',
      cleanClass
        ? `Assigned ${displayName} as Class ${cleanClass} Class Teacher`
        : `Unassigned Class Teacher role from ${displayName}`
    );

    return { ok: true };
  };

  // E-Books / Digital Library (Teacher + Admin can add/update)
  const addEbook = (b: EBook) => {
    const id = sanitizeFirestoreId(b.id);
    const safeCover = clampImageString(b.coverUrl);
    const item = { ...b, id, coverUrl: safeCover };
    const updated = [item, ...ebooks];
    setEbooks(updated);
    persistLocal('db_ebooks', updated);
    void syncDocUpsert(
      'ebooks',
      id,
      {
        id,
        title: safeLoc(b.title, 'বই', 'Book', 300),
        classId: (b.classId || '6').slice(0, 16),
        className: safeLoc(b.className, 'শ্রেণী', 'Class', 100),
        subject: (b.subject || 'General').slice(0, 120),
        ...(b.category ? { category: b.category.slice(0, 40) } : {}),
        ...(b.description ? { description: safeLoc(b.description, 'বইয়ের বিবরণ', 'Book description', 1500) } : {}),
        coverUrl: safeCover,
        downloadUrl: (b.downloadUrl || '#').slice(0, 2000),
        isPublic: true,
      },
      false,
      true
    );
  };

  const updateEbook = (b: EBook) => {
    const id = sanitizeFirestoreId(b.id);
    const safeCover = clampImageString(b.coverUrl);
    const updated = ebooks.map((i) => (i.id === b.id ? { ...b, id, coverUrl: safeCover } : i));
    setEbooks(updated);
    persistLocal('db_ebooks', updated);
    void syncDocUpsert(
      'ebooks',
      id,
      {
        id,
        title: safeLoc(b.title, 'বই', 'Book', 300),
        classId: (b.classId || '6').slice(0, 16),
        className: safeLoc(b.className, 'শ্রেণী', 'Class', 100),
        subject: (b.subject || 'General').slice(0, 120),
        ...(b.category ? { category: b.category.slice(0, 40) } : {}),
        ...(b.description ? { description: safeLoc(b.description, 'বইয়ের বিবরণ', 'Book description', 1500) } : {}),
        coverUrl: safeCover,
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
    void syncDocDelete('ebooks', sanitizeFirestoreId(id));
  };

  // Gallery
  const addGalleryItem = (i: GalleryItem) => {
    const id = sanitizeFirestoreId(i.id);
    const safeUrl = clampImageString(i.url) || 'https://placehold.co/800x600?text=RBMB';
    const item = { ...i, id, url: safeUrl };
    const updated = [item, ...gallery];
    setGallery(updated);
    persistLocal('db_gallery', updated);
    void syncDocUpsert(
      'gallery',
      id,
      {
        id,
        url: safeUrl,
        caption: safeLoc(i.caption, 'ক্যাম্পাস ছবি', 'Campus photo', 400),
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
    const safeUrl = clampImageString(i.url) || 'https://placehold.co/800x600?text=RBMB';
    const updated = gallery.map((item) => (item.id === i.id ? { ...i, id, url: safeUrl } : item));
    setGallery(updated);
    persistLocal('db_gallery', updated);
    void syncDocUpsert(
      'gallery',
      id,
      {
        id,
        url: safeUrl,
        caption: safeLoc(i.caption, 'ক্যাম্পাস ছবি', 'Campus photo', 400),
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
    void syncDocDelete('gallery', sanitizeFirestoreId(id));
  };

  // Holidays
  const addHoliday = (h: Holiday) => {
    const id = sanitizeFirestoreId(h.id);
    const item = { ...h, id };
    const updated = [...holidays, item];
    setHolidays(updated);
    persistLocal('db_holidays', updated);
    void syncDocUpsert(
      'holidays',
      id,
      {
        id,
        title: safeLoc(h.title, 'ছুটি', 'Holiday', 300),
        date: (h.date && h.date.length >= 4 ? h.date : getDhakaTodayISO()).slice(0, 32),
        duration: safeLoc(h.duration, '১ দিন', '1 Day', 100),
        type: h.type || 'National',
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
    void syncDocUpsert(
      'holidays',
      id,
      {
        id,
        title: safeLoc(h.title, 'ছুটি', 'Holiday', 300),
        date: (h.date && h.date.length >= 4 ? h.date : getDhakaTodayISO()).slice(0, 32),
        duration: safeLoc(h.duration, '১ দিন', '1 Day', 100),
        type: h.type || 'National',
        isPublic: true,
      },
      true
    );
  };

  const deleteHoliday = (id: string) => {
    const updated = holidays.filter((h) => h.id !== id);
    setHolidays(updated);
    persistLocal('db_holidays', updated);
    void syncDocDelete('holidays', sanitizeFirestoreId(id));
  };

  // School & Head Teacher Settings
  const updateSettings = async (newSettings: SchoolSettings): Promise<boolean> => {
    const sPhoto = clampImageString(newSettings.schoolPhoto) || INITIAL_SETTINGS.schoolPhoto;
    const hPhoto = clampImageString(newSettings.headTeacherPhoto) || INITIAL_SETTINGS.headTeacherPhoto;
    const cleaned: SchoolSettings = {
      ...newSettings,
      name: safeLoc(newSettings.name, SCHOOL_NAME.bn, SCHOOL_NAME.en, 200),
      eiin: (newSettings.eiin || INITIAL_SETTINGS.eiin).trim().slice(0, 32),
      phone: (newSettings.phone || INITIAL_SETTINGS.phone).trim().slice(0, 40),
      email: (newSettings.email && newSettings.email.trim().length >= 3 ? newSettings.email.trim() : INITIAL_SETTINGS.email).slice(0, 150),
      location: safeLoc(newSettings.location, INITIAL_SETTINGS.location.bn, INITIAL_SETTINGS.location.en, 300),
      schoolPhoto: sPhoto,
      headTeacherPhoto: hPhoto,
      ...(newSettings.headTeacherName
        ? { headTeacherName: safeLoc(newSettings.headTeacherName, 'প্রধান শিক্ষক', 'Head Teacher', 200) }
        : {}),
      ...(newSettings.headTeacherMessage
        ? { headTeacherMessage: safeLoc(newSettings.headTeacherMessage, 'স্বাগতম।', 'Welcome.', 2500) }
        : {}),
    };
    setSettings(cleaned);
    persistLocal('school_settings', cleaned);
    if (isCloudAdmin) {
      setDbStatus('syncing');
      try {
        await setDoc(doc(db, 'settings', 'main'), {
          name: cleaned.name,
          ...(cleaned.shortName ? { shortName: cleaned.shortName.slice(0, 100) } : {}),
          ...(cleaned.tagline ? { tagline: safeLoc(cleaned.tagline, CAMPUS_TAGLINE.bn, CAMPUS_TAGLINE.en, 300) } : {}),
          eiin: cleaned.eiin,
          phone: cleaned.phone,
          email: cleaned.email,
          location: cleaned.location,
          ...(cleaned.schoolPhoto ? { schoolPhoto: cleaned.schoolPhoto } : {}),
          ...(cleaned.headTeacherName ? { headTeacherName: cleaned.headTeacherName } : {}),
          ...(cleaned.headTeacherMessage ? { headTeacherMessage: cleaned.headTeacherMessage } : {}),
          ...(cleaned.headTeacherPhoto ? { headTeacherPhoto: cleaned.headTeacherPhoto } : {}),
          ...(typeof cleaned.latitude === 'number' ? { latitude: cleaned.latitude } : {}),
          ...(typeof cleaned.longitude === 'number' ? { longitude: cleaned.longitude } : {}),
          updatedAt: serverTimestamp(),
        });
        clearDirtyKey('school_settings');
        setLastSyncError(null);
        setDbStatus('synced');
        void logAuditEvent('SETTINGS_UPDATED', 'settings', 'main', 'Updated campus settings & profile');
        return true;
      } catch (err) {
        safeListenerError(err, OperationType.WRITE, 'settings/main');
        return false;
      }
    }
    return true;
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
    const targetApp = admissions.find((a) => a.appId === appId || a.appId === cleanId);
    const updated = admissions.map((a) => (a.appId === appId ? { ...a, status } : a));
    setAdmissions(updated);
    persistLocal('admission_applications', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      const batch = writeBatch(db);
      const admRef = doc(db, 'admissions', cleanId);
      const admSnap = await getDoc(admRef);
      if (admSnap.exists()) {
        batch.update(admRef, { status, updatedAt: serverTimestamp() });
      } else if (targetApp) {
        batch.set(admRef, {
          appId: cleanId,
          studentName: (targetApp.studentName || 'Applicant').slice(0, 150),
          fatherName: (targetApp.fatherName || 'Father').slice(0, 150),
          motherName: (targetApp.motherName || 'Mother').slice(0, 150),
          guardianMobile: (targetApp.guardianMobile && targetApp.guardianMobile.length >= 6 ? targetApp.guardianMobile : '01700000000').slice(0, 30),
          targetClass: (targetApp.targetClass || '6').slice(0, 40),
          targetGroup: (targetApp.targetGroup || 'General').slice(0, 40),
          birthDate: (targetApp.birthDate && targetApp.birthDate.length >= 4 ? targetApp.birthDate : '2012-01-01').slice(0, 32),
          address: (targetApp.address && targetApp.address.length >= 2 ? targetApp.address : 'Rani Bazar').slice(0, 400),
          status,
          submittedDate: (targetApp.submittedDate || new Date().toLocaleDateString()).slice(0, 40),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      const statusRef = doc(db, 'admission_status', cleanId);
      const statusSnap = await getDoc(statusRef);
      if (statusSnap.exists()) {
        batch.update(statusRef, { status, updatedAt: serverTimestamp() });
      }
      await batch.commit();
      await logAuditEvent(
        'ADMISSION_STATUS_UPDATED',
        'admissions',
        cleanId,
        `Updated admission ${cleanId} status to ${status}`
      );
      clearDirtyKey('admission_applications');
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
      date: msg.date || getDhakaTodayISO(),
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
    const cleanId = sanitizeFirestoreId(id);
    const targetMsg = contactMessages.find((m) => m.id === id || m.id === cleanId);
    const updated = contactMessages.map((m) => (m.id === id ? { ...m, status: 'read' as const } : m));
    setContactMessages(updated);
    persistLocal('contact_messages', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      const msgRef = doc(db, 'contactMessages', cleanId);
      const snap = await getDoc(msgRef);
      if (snap.exists()) {
        await updateDoc(msgRef, { status: 'read' });
      } else if (targetMsg) {
        await setDoc(msgRef, {
          id: cleanId,
          name: (targetMsg.name || 'Visitor').slice(0, 150),
          mobile: (targetMsg.mobile && targetMsg.mobile.length >= 6 ? targetMsg.mobile : '01700000000').slice(0, 30),
          email: (targetMsg.email || '').slice(0, 150),
          message: (targetMsg.message || 'Message').slice(0, 2000),
          status: 'read',
          createdAt: serverTimestamp(),
        });
      }
      clearDirtyKey('contact_messages');
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
    const safePhoto = clampImageString(student.photo);
    const allowedUids = resolveAllowedUids(student.classId, student.roll, student);
    const clean: SchoolStudent = {
      ...student,
      id,
      guardianMobile,
      ...(safePhoto ? { photo: safePhoto } : {}),
      ...(allowedUids.length > 0 ? { allowedUids } : {}),
    };
    const updated = [...students, clean];
    setStudents(updated);
    persistLocal('db_students', updated);
    void syncDocUpsert(
      'students',
      id,
      {
        id,
        roll: clean.roll.slice(0, 20),
        name: clean.name.slice(0, 150),
        classId: clean.classId,
        section: clean.section.slice(0, 40),
        guardianMobile: clean.guardianMobile.slice(0, 30),
        ...(clean.guardianName ? { guardianName: clean.guardianName.trim().slice(0, 150) } : {}),
        ...(safePhoto ? { photo: safePhoto } : {}),
        ...(clean.registrationNo ? { registrationNo: clean.registrationNo.trim().slice(0, 64) } : {}),
        ...(clean.registrationDate ? { registrationDate: clean.registrationDate.trim().slice(0, 32) } : {}),
        ...(clean.session ? { session: clean.session.trim().slice(0, 16) } : {}),
        ...(clean.cardIssueDate ? { cardIssueDate: clean.cardIssueDate.trim().slice(0, 32) } : {}),
        ...(clean.cardValidUpto ? { cardValidUpto: clean.cardValidUpto.trim().slice(0, 32) } : {}),
        ...(clean.bloodGroup ? { bloodGroup: clean.bloodGroup.trim().slice(0, 16) } : {}),
        ...(clean.admitCardApproved !== undefined ? { admitCardApproved: Boolean(clean.admitCardApproved) } : {}),
        ...(clean.admitCardTerm ? { admitCardTerm: clean.admitCardTerm.trim().slice(0, 100) } : {}),
        ...(clean.admitCardApprovedAt ? { admitCardApprovedAt: clean.admitCardApprovedAt.trim().slice(0, 40) } : {}),
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
    const safePhoto = clampImageString(student.photo);
    const allowedUids = resolveAllowedUids(student.classId, student.roll, student);
    const clean: SchoolStudent = {
      ...student,
      id,
      guardianMobile,
      ...(safePhoto ? { photo: safePhoto } : {}),
      ...(allowedUids.length > 0 ? { allowedUids } : {}),
    };
    const updated = students.map((s) => (s.id === student.id ? clean : s));
    setStudents(updated);
    persistLocal('db_students', updated);
    void syncDocUpsert(
      'students',
      id,
      {
        id,
        roll: clean.roll.slice(0, 20),
        name: clean.name.slice(0, 150),
        classId: clean.classId,
        section: clean.section.slice(0, 40),
        guardianMobile: clean.guardianMobile.slice(0, 30),
        ...(clean.guardianName ? { guardianName: clean.guardianName.trim().slice(0, 150) } : {}),
        ...(safePhoto ? { photo: safePhoto } : {}),
        ...(clean.registrationNo ? { registrationNo: clean.registrationNo.trim().slice(0, 64) } : {}),
        ...(clean.registrationDate ? { registrationDate: clean.registrationDate.trim().slice(0, 32) } : {}),
        ...(clean.session ? { session: clean.session.trim().slice(0, 16) } : {}),
        ...(clean.cardIssueDate ? { cardIssueDate: clean.cardIssueDate.trim().slice(0, 32) } : {}),
        ...(clean.cardValidUpto ? { cardValidUpto: clean.cardValidUpto.trim().slice(0, 32) } : {}),
        ...(clean.bloodGroup ? { bloodGroup: clean.bloodGroup.trim().slice(0, 16) } : {}),
        ...(clean.admitCardApproved !== undefined ? { admitCardApproved: Boolean(clean.admitCardApproved) } : {}),
        ...(clean.admitCardTerm ? { admitCardTerm: clean.admitCardTerm.trim().slice(0, 100) } : {}),
        ...(clean.admitCardApprovedAt ? { admitCardApprovedAt: clean.admitCardApprovedAt.trim().slice(0, 40) } : {}),
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
    void syncDocDelete('students', sanitizeFirestoreId(id), true);
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
        createdDate: (clean.createdDate || getDhakaTodayISO()).slice(0, 32),
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
        createdDate: (clean.createdDate || getDhakaTodayISO()).slice(0, 32),
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
    const cleanId = sanitizeFirestoreId(id);
    const targetSub = assignmentSubmissions.find((s) => s.id === id || s.id === cleanId);
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
      const subRef = doc(db, 'assignmentSubmissions', cleanId);
      const snap = await getDoc(subRef);
      if (snap.exists()) {
        await updateDoc(subRef, {
          status: 'graded',
          marks: cleanMarks,
          feedback: cleanFeedback.slice(0, 1000),
          updatedAt: serverTimestamp(),
        });
      } else if (targetSub) {
        await setDoc(subRef, {
          id: cleanId,
          homeworkId: sanitizeFirestoreId(targetSub.homeworkId),
          classId: targetSub.classId,
          subject: (targetSub.subject || 'Subject').slice(0, 120),
          studentId: targetSub.studentId.slice(0, 128),
          studentName: (targetSub.studentName || 'Student').slice(0, 150),
          roll: (targetSub.roll || '01').slice(0, 20),
          answerText: (targetSub.answerText || 'Answer').slice(0, 4000),
          status: 'graded',
          marks: cleanMarks,
          feedback: cleanFeedback.slice(0, 1000),
          submittedDate: (targetSub.submittedDate || getDhakaTodayISO()).slice(0, 32),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
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
    void syncDocUpsert(
      'subjects',
      id,
      {
        id,
        code: (clean.code || '101').slice(0, 16),
        name: safeLoc(clean.name, 'বিষয়', 'Subject', 200),
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
    void syncDocDelete('subjects', sanitizeFirestoreId(id));
  };

  // Parent-Teacher Messages & Verified Parent-Student Link Workflow
  const sendParentMessage = (msg: ParentMessage) => {
    const id = sanitizeFirestoreId(msg.id);
    const targetTeacherObj =
      teachers.find((tc) => tc.id === msg.teacherId) ||
      teachers.find(
        (tc) =>
          tc.name.en.trim().toLowerCase() === msg.teacherName.trim().toLowerCase() ||
          tc.name.bn.trim().toLowerCase() === msg.teacherName.trim().toLowerCase()
      );
    const matchedCloudTeacher = cloudUsers.find(
      (cu) =>
        cu.role === 'teacher' &&
        ((targetTeacherObj?.phone && cu.phone && phonesMatch(cu.phone, targetTeacherObj.phone)) ||
          (targetTeacherObj &&
            (cu.name.trim().toLowerCase() === targetTeacherObj.name.en.trim().toLowerCase() ||
              cu.name.trim().toLowerCase() === targetTeacherObj.name.bn.trim().toLowerCase())) ||
          cu.name.trim().toLowerCase() === msg.teacherName.trim().toLowerCase())
    );
    const matchedLocalTeacher = registeredUsers.find(
      (ru) =>
        ru.role === 'teacher' &&
        ((msg.teacherCode && ru.userId.toLowerCase() === msg.teacherCode.toLowerCase()) ||
          (targetTeacherObj?.teacherCode && ru.userId.toLowerCase() === targetTeacherObj.teacherCode.toLowerCase()) ||
          (targetTeacherObj?.phone && ru.phone && phonesMatch(ru.phone, targetTeacherObj.phone)) ||
          (targetTeacherObj &&
            (ru.name.trim().toLowerCase() === targetTeacherObj.name.en.trim().toLowerCase() ||
              ru.name.trim().toLowerCase() === targetTeacherObj.name.bn.trim().toLowerCase())) ||
          ru.name.trim().toLowerCase() === msg.teacherName.trim().toLowerCase())
    );
    const resolvedRecipientUid =
      msg.recipientUid || matchedCloudTeacher?.uid || matchedLocalTeacher?.userId;

    const clean: ParentMessage = {
      ...msg,
      id,
      teacherId: msg.teacherId || targetTeacherObj?.id,
      teacherCode: msg.teacherCode || targetTeacherObj?.teacherCode,
      ...(resolvedRecipientUid ? { recipientUid: resolvedRecipientUid } : {}),
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
        ...(clean.teacherId ? { teacherId: clean.teacherId.slice(0, 128) } : {}),
        ...(clean.teacherCode ? { teacherCode: clean.teacherCode.slice(0, 40) } : {}),
        ...(matchedCloudTeacher?.uid ? { recipientUid: sanitizeFirestoreId(matchedCloudTeacher.uid) } : {}),
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
    const cleanId = sanitizeFirestoreId(id);
    const targetMsg = parentMessages.find((m) => m.id === id || m.id === cleanId);
    const cleanReply = reply.trim();
    const updated = parentMessages.map((m) =>
      m.id === id ? { ...m, reply: cleanReply, repliedBy, status: 'replied' as const } : m
    );
    setParentMessages(updated);
    persistLocal('db_parent_messages', updated);
    if (!isCloudTeacher) return;
    try {
      setDbStatus('syncing');
      const ref = doc(db, 'parentMessages', cleanId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, {
          reply: cleanReply.slice(0, 2000),
          repliedBy: repliedBy.slice(0, 150),
          status: 'replied',
          updatedAt: serverTimestamp(),
        });
      } else if (targetMsg) {
        await setDoc(ref, {
          id: cleanId,
          parentName: (targetMsg.parentName || 'Parent').slice(0, 150),
          studentName: (targetMsg.studentName || 'Student').slice(0, 150),
          classId: targetMsg.classId,
          roll: (targetMsg.roll || '01').slice(0, 20),
          teacherName: (targetMsg.teacherName || 'Teacher').slice(0, 150),
          ...(targetMsg.teacherId ? { teacherId: targetMsg.teacherId.slice(0, 128) } : {}),
          ...(targetMsg.teacherCode ? { teacherCode: targetMsg.teacherCode.slice(0, 40) } : {}),
          ...(targetMsg.recipientUid ? { recipientUid: sanitizeFirestoreId(targetMsg.recipientUid) } : {}),
          subject: (targetMsg.subject || 'Inquiry').slice(0, 200),
          message: (targetMsg.message || 'Message').slice(0, 2000),
          reply: cleanReply.slice(0, 2000),
          repliedBy: repliedBy.slice(0, 150),
          status: 'replied',
          createdDate: (targetMsg.createdDate || getDhakaTodayISO()).slice(0, 32),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
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
      submittedDate: getDhakaTodayISO(),
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
  const submitAlumniProfile = async (profile: AlumniProfile): Promise<void> => {
    const id = sanitizeFirestoreId(profile.id);
    const safeBatch =
      profile.batchYear && profile.batchYear.trim().length >= 4
        ? profile.batchYear.trim().slice(0, 16)
        : '2020';
    const clean: AlumniProfile = {
      ...profile,
      id,
      batchYear: safeBatch,
      status: 'pending',
      isPublic: false,
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [clean, ...alumni];
    setAlumni(updated);
    persistLocal('db_alumni', updated);
    setDbStatus('syncing');
    try {
      await setDoc(doc(db, 'alumni', id), {
        id,
        name: clean.name.slice(0, 150),
        batchYear: safeBatch,
        currentRole: clean.currentRole.slice(0, 150),
        organization: clean.organization.slice(0, 200),
        ...(clean.city ? { city: clean.city.slice(0, 100) } : {}),
        message: clean.message.slice(0, 1000),
        status: 'pending',
        isPublic: false,
        ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setDbStatus('synced');
      setLastSyncError(null);
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, OperationType.CREATE, `alumni/${id}`);
    }
  };

  const updateAlumniStatus = async (id: string, status: 'pending' | 'approved') => {
    const cleanId = sanitizeFirestoreId(id);
    const targetAl = alumni.find((a) => a.id === id || a.id === cleanId);
    const isPublic = status === 'approved';
    const updated = alumni.map((a) => (a.id === id ? { ...a, status, isPublic } : a));
    setAlumni(updated);
    persistLocal('db_alumni', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      const ref = doc(db, 'alumni', cleanId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { status, isPublic, updatedAt: serverTimestamp() });
      } else if (targetAl) {
        await setDoc(ref, {
          id: cleanId,
          name: (targetAl.name || 'Alumni').slice(0, 150),
          batchYear: (targetAl.batchYear && targetAl.batchYear.length >= 4 ? targetAl.batchYear : '2020').slice(0, 16),
          currentRole: (targetAl.currentRole || 'Graduate').slice(0, 150),
          organization: (targetAl.organization || 'RBMB').slice(0, 200),
          ...(targetAl.city ? { city: targetAl.city.slice(0, 100) } : {}),
          message: (targetAl.message || 'Proud alumni').slice(0, 1000),
          status,
          isPublic,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await logAuditEvent('ALUMNI_REVIEWED', 'alumni', id, `Marked alumni ${id} as ${status}`);
      clearDirtyKey('db_alumni');
      setDbStatus('synced');
    } catch (err) {
      safeListenerError(err, OperationType.UPDATE, `alumni/${id}`);
    }
  };

  const deleteAlumniProfile = (id: string) => {
    const updated = alumni.filter((a) => a.id !== id);
    setAlumni(updated);
    persistLocal('db_alumni', updated);
    void syncDocDelete('alumni', sanitizeFirestoreId(id));
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
        .then(() => {
          clearDirtyKey('db_teacher_leaves');
          setDbStatus('synced');
        })
        .catch((err) => safeListenerError(err, OperationType.CREATE, `teacherLeaves/${id}`));
    }
  };

  const updateTeacherLeaveStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    adminRemark?: string
  ) => {
    const cleanId = sanitizeFirestoreId(id);
    const targetLeave = teacherLeaves.find((l) => l.id === id || l.id === cleanId);
    const cleanRemark = adminRemark?.trim();
    const updated = teacherLeaves.map((l) =>
      l.id === id ? { ...l, status, ...(cleanRemark !== undefined ? { adminRemark: cleanRemark } : {}) } : l
    );
    setTeacherLeaves(updated);
    persistLocal('db_teacher_leaves', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      const ref = doc(db, 'teacherLeaves', cleanId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, {
          status,
          ...(cleanRemark ? { adminRemark: cleanRemark.slice(0, 500) } : {}),
          updatedAt: serverTimestamp(),
        });
      } else if (targetLeave) {
        await setDoc(ref, {
          id: cleanId,
          teacherId: (targetLeave.teacherId || 'teacher').slice(0, 128),
          teacherName: (targetLeave.teacherName || 'Teacher').slice(0, 150),
          leaveType: targetLeave.leaveType || 'Casual',
          startDate: (targetLeave.startDate || '2026-01-01').slice(0, 32),
          endDate: (targetLeave.endDate || '2026-01-01').slice(0, 32),
          reason: (targetLeave.reason || 'Leave request').slice(0, 1500),
          status,
          ...(cleanRemark ? { adminRemark: cleanRemark.slice(0, 500) } : {}),
          submittedDate: (targetLeave.submittedDate || getDhakaTodayISO()).slice(0, 32),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await logAuditEvent('TEACHER_LEAVE_REVIEWED', 'teacherLeaves', id, `Teacher leave ${id} -> ${status}`);
      clearDirtyKey('db_teacher_leaves');
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
          submittedDate: (targetLeave.submittedDate || getDhakaTodayISO()).slice(0, 32),
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
        ? { paidDate: getDhakaTodayISO() }
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
    const nextPaidDate = getDhakaTodayISO();
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
      createdDate: (notif.createdDate || getDhakaTodayISO()).slice(0, 32),
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
      holidays: effectiveHolidays,
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
    a.download = `rbhs_school_backup_${getDhakaTodayISO()}.json`;
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
Available Features: Online Admission (/admission), Online MCQ Exams (/exams), Digital Library (/ebooks), Class & Exam Routine (/routine), Alumni (/alumni), Student/Teacher/Parent Portals (/login/student).`;

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
        selfRegisterAccount,
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
        addClassTeacherByAdmin,
        assignClassTeacher,
        ebooks,
        addEbook,
        updateEbook,
        deleteEbook,
        gallery,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        holidays: effectiveHolidays,
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
        lastSyncError,
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
