import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  User as UserIcon,
  Lock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
  ShieldAlert,
  Camera,
  Trash2,
  BookOpen,
  CheckCircle,
  PlusCircle,
  Save,
  Users,
  Image as ImageIcon,
  Upload,
  Download,
  UserPlus,
  Pencil,
  Cloud,
  CloudOff,
  MessageSquare,
  Calendar,
  Trophy,
  X,
} from 'lucide-react';
import { TRANSLATIONS, EXAM_TERMS } from '../constants';
import { useApp } from '../App';
import { Notice, Teacher, GalleryItem, EBook, UserRole } from '../types';
import { compressImageFile } from '../utils/imageUtils';
import { TeacherPortal } from '../components/TeacherPortal';
import { StudentPortal } from '../components/StudentPortal';
import { ParentPortal } from '../components/ParentPortal';

const { useState, useEffect, useRef } = React;
const { useLocation, Link, useNavigate } = RouterDom;

type ManagementTab =
  | 'notices'
  | 'teachers'
  | 'ebooks'
  | 'gallery'
  | 'subjects'
  | 'exam-routines'
  | 'online-exams'
  | 'admissions'
  | 'alumni'
  | 'parent-messages'
  | 'parent-links'
  | 'messages'
  | 'leaves'
  | 'users'
  | 'audit-logs'
  | 'system';

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolPhotoInputRef = useRef<HTMLInputElement>(null);
  const headPhotoInputRef = useRef<HTMLInputElement>(null);

  const {
    lang,
    t,
    user,
    firebaseUser,
    isCloudAdmin,
    cloudUsers,
    updateCloudUserRole,
    signInWithGoogle,
    signInWithEmail,
    resendVerificationEmail,
    refreshAuthSession,
    resetPassword,
    login,
    verifyLocalCredentials,
    logout,
    getUsers,
    updateUser,
    deleteUser,
    register,
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
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
    subjects,
    addSubject,
    deleteSubject,
    examRoutines,
    addExamRoutine,
    deleteExamRoutine,
    onlineExams,
    deleteOnlineExam,
    admissions,
    updateAdmissionStatus,
    deleteAdmission,
    alumni,
    updateAlumniStatus,
    deleteAlumniProfile,
    parentMessages,
    replyParentMessage,
    parentLinks,
    reviewParentStudentLink,
    deleteParentStudentLink,
    contactMessages,
    markContactMessageRead,
    deleteContactMessage,
    teacherLeaves,
    updateTeacherLeaveStatus,
    deleteTeacherLeave,
    auditLogs,
    settings,
    updateSettings,
    exportDatabase,
    importDatabase,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'parent' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const [dashboardView, setDashboardView] = useState<'main' | 'admin-management' | 'teacher-portal'>('main');
  const [managementTab, setManagementTab] = useState<ManagementTab>('notices');
  const [leaveRemarks, setLeaveRemarks] = useState<Record<string, string>>({});
  const [adminReplyDrafts, setAdminReplyDrafts] = useState<Record<string, string>>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [dbFeedback, setDbFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [tempImage, setTempImage] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingItem, setEditingItem] = useState<any>(null);

  const [newSubject, setNewSubject] = useState({ code: '101', nameBn: '', nameEn: '', classId: '9', totalMarks: 100 });
  const [newExamRoutine, setNewExamRoutine] = useState({
    examTerm: EXAM_TERMS[1].id,
    classId: '9',
    subject: 'Bangla',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 01:00 PM',
    room: 'Room 101',
  });

  const [systemForm, setSystemForm] = useState({
    nameBn: settings.name.bn,
    nameEn: settings.name.en,
    eiin: settings.eiin,
    phone: settings.phone,
    email: settings.email,
    locBn: settings.location.bn,
    locEn: settings.location.en,
    schoolPhoto: settings.schoolPhoto || '',
    headNameBn: settings.headTeacherName?.bn || '',
    headNameEn: settings.headTeacherName?.en || '',
    headMsgBn: settings.headTeacherMessage?.bn || '',
    headMsgEn: settings.headTeacherMessage?.en || '',
    headPhoto: settings.headTeacherPhoto || '',
    latitude: String(settings.latitude ?? 23.2248),
    longitude: String(settings.longitude ?? 91.3185),
  });

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/teacher')) setActiveTab('teacher');
    else if (path.includes('/parent')) setActiveTab('parent');
    else if (path.includes('/admin')) setActiveTab('admin');
    else setActiveTab('student');
  }, [location.pathname]);

  useEffect(() => {
    setSystemForm({
      nameBn: settings.name.bn,
      nameEn: settings.name.en,
      eiin: settings.eiin,
      phone: settings.phone,
      email: settings.email,
      locBn: settings.location.bn,
      locEn: settings.location.en,
      schoolPhoto: settings.schoolPhoto || '',
      headNameBn: settings.headTeacherName?.bn || '',
      headNameEn: settings.headTeacherName?.en || '',
      headMsgBn: settings.headTeacherMessage?.bn || '',
      headMsgEn: settings.headTeacherMessage?.en || '',
      headPhoto: settings.headTeacherPhoto || '',
      latitude: String(settings.latitude ?? 23.2248),
      longitude: String(settings.longitude ?? 91.3185),
    });
  }, [settings]);

  const handleQuickLogin = (role: 'teacher' | 'parent' | 'student') => {
    setActiveTab(role);
    setError('');
    setAuthNotice('');
    setNeedsVerification(false);
    setUserId(`${role}01`);
    setPassword('123456');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setAuthNotice('');
    setNeedsVerification(false);

    const identifier = userId.trim();

    if (identifier.includes('@')) {
      const res = await signInWithEmail(identifier, password);
      setIsSubmitting(false);
      if (res.ok) {
        navigate('/dashboard');
      } else {
        if (res.needsVerification) setNeedsVerification(true);
        setError(
          res.error ||
            (lang === 'bn' ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' : 'Invalid email or password.')
        );
      }
      return;
    }

    if (activeTab === 'admin') {
      setIsSubmitting(false);
      setError(
        lang === 'bn'
          ? 'অ্যাডমিন পোর্টালে প্রবেশ করতে Google ক্লাউড লগইন অথবা ভেরিফায়েড ইমেইল-পাসওয়ার্ড ব্যবহার করুন।'
          : 'Admin access requires Google Cloud Sign-In or a verified Firebase email/password.'
      );
      return;
    }

    const matched = await verifyLocalCredentials(identifier, password, activeTab);
    setIsSubmitting(false);

    if (matched) {
      login(matched);
      navigate('/dashboard');
    } else {
      setError(
        lang === 'bn'
          ? 'ভুল আইডি বা পাসওয়ার্ড অথবা ভুল রোল ট্যাব!'
          : 'Invalid ID/password for the selected portal role.'
      );
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setAuthNotice('');
    const email = userId.trim();
    if (!email.includes('@')) {
      setError(
        lang === 'bn'
          ? 'পাসওয়ার্ড রিসেট করতে প্রথমে উপরের ঘরে আপনার নিবন্ধিত ইমেইল লিখুন।'
          : 'Enter your registered email address in the input box above first.'
      );
      return;
    }
    const res = await resetPassword(email);
    if (res.ok) {
      setAuthNotice(
        lang === 'bn'
          ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।'
          : 'Password reset link has been sent to your email.'
      );
    } else {
      setError(res.error || (lang === 'bn' ? 'রিসেট ইমেইল পাঠানো যায়নি।' : 'Failed to send password reset email.'));
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setAuthNotice('');
    setIsSubmitting(true);
    const ok = await signInWithGoogle();
    setIsSubmitting(false);
    if (ok) navigate('/dashboard');
    else setError(lang === 'bn' ? 'Google লগইন সম্পন্ন হয়নি।' : 'Google Sign-In failed or cancelled.');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const compressed = await compressImageFile(file, 500, 0.75);
      await updateUser({ ...user, photo: compressed });
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setModalError('');
    setTempImage('');
    setIsAddModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setModalError('');
    setTempImage(item.photo || item.coverUrl || item.url || '');
    setIsAddModalOpen(true);
  };

  const handleAddOrUpdateModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = e.currentTarget as any;
    const isEdit = !!editingItem;
    const id = isEdit ? editingItem.id : `item-${Date.now()}`;

    try {
      if (managementTab === 'notices') {
        const data: Notice = {
          id,
          title: { bn: f.titleBn.value, en: f.titleEn.value },
          description: { bn: f.descBn.value, en: f.descEn.value },
          category: f.category.value,
          date: f.date.value,
          isPublic: true,
        };
        isEdit ? updateNotice(data) : addNotice(data);
      } else if (managementTab === 'teachers') {
        const data: Teacher = {
          id,
          name: { bn: f.nameBn.value, en: f.nameEn.value },
          designation: { bn: f.desigBn.value, en: f.desigEn.value },
          subject: { bn: f.subBn.value, en: f.subEn.value },
          qualification: { bn: f.qualBn.value, en: f.qualEn.value },
          photo: tempImage || editingItem?.photo || '',
          isPublic: true,
        };
        isEdit ? updateTeacher(data) : addTeacher(data);
      } else if (managementTab === 'ebooks') {
        const data: EBook = {
          id,
          title: { bn: f.titleBn.value, en: f.titleEn.value },
          classId: f.classId.value,
          className: { bn: `${f.classId.value}ম শ্রেণী`, en: `Class ${f.classId.value}` },
          subject: f.subject.value,
          category: f.bookCat.value,
          coverUrl: tempImage || editingItem?.coverUrl || '',
          downloadUrl: f.downloadUrl.value.trim() || '#',
          isPublic: true,
        };
        isEdit ? updateEbook(data) : addEbook(data);
      } else if (managementTab === 'gallery') {
        const data: GalleryItem = {
          id,
          caption: { bn: f.capBn.value, en: f.capEn.value },
          url: tempImage || editingItem?.url || '',
          category: f.galCat.value,
          mediaType: 'image',
          isPublic: true,
        };
        if (!data.url) {
          setModalError(lang === 'bn' ? 'দয়া করে একটি ছবি আপলোড করুন।' : 'Please upload an image.');
          return;
        }
        isEdit ? updateGalleryItem(data) : addGalleryItem(data);
      } else if (managementTab === 'users') {
        const nextRole = f.userRole.value as UserRole;
        const passVal = f.userPass.value.trim();
        if (isEdit) {
          await updateUser({
            ...editingItem,
            name: f.userName.value,
            email: f.userEmail.value,
            role: nextRole,
            ...(passVal ? { password: passVal } : {}),
            photo: tempImage || editingItem.photo,
          });
        } else {
          const ok = await register({
            name: f.userName.value,
            userId: f.userId.value.trim(),
            email: f.userEmail.value,
            password: passVal || '123456',
            role: nextRole,
            photo: tempImage || '',
          });
          if (!ok) {
            setModalError(lang === 'bn' ? 'এই ইউজার আইডি ইতিমধ্যে ব্যবহৃত হয়েছে!' : 'User ID already exists!');
            return;
          }
        }
      }
      setIsAddModalOpen(false);
      setEditingItem(null);
      setTempImage('');
    } catch {
      setModalError(lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে!' : 'Failed to save record.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: { bn: systemForm.nameBn, en: systemForm.nameEn },
      eiin: systemForm.eiin,
      phone: systemForm.phone,
      email: systemForm.email,
      location: { bn: systemForm.locBn, en: systemForm.locEn },
      schoolPhoto: systemForm.schoolPhoto,
      headTeacherName: { bn: systemForm.headNameBn, en: systemForm.headNameEn },
      headTeacherMessage: { bn: systemForm.headMsgBn, en: systemForm.headMsgEn },
      headTeacherPhoto: systemForm.headPhoto,
      latitude: Number(systemForm.latitude) || 23.2248,
      longitude: Number(systemForm.longitude) || 91.3185,
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  if (user) {
    const allUsers = getUsers();
    const adminTabs: { id: ManagementTab; label: string }[] = [
      { id: 'notices', label: lang === 'bn' ? 'নোটিশ' : 'Notices' },
      { id: 'teachers', label: lang === 'bn' ? 'শিক্ষক' : 'Teachers' },
      { id: 'ebooks', label: lang === 'bn' ? 'লাইব্রেরি' : 'Library' },
      { id: 'gallery', label: lang === 'bn' ? 'গ্যালারি' : 'Gallery' },
      { id: 'subjects', label: lang === 'bn' ? 'বিষয়সমূহ' : 'Subjects' },
      { id: 'exam-routines', label: lang === 'bn' ? 'পরীক্ষার রুটিন' : 'Exam Routine' },
      { id: 'online-exams', label: lang === 'bn' ? 'MCQ পরীক্ষা' : 'MCQ Exams' },
      { id: 'admissions', label: lang === 'bn' ? 'ভর্তি' : 'Admissions' },
      { id: 'alumni', label: lang === 'bn' ? 'অ্যালামনাই' : 'Alumni' },
      { id: 'parent-messages', label: lang === 'bn' ? 'অভিভাবক বার্তা' : 'Parent Msgs' },
      { id: 'parent-links', label: lang === 'bn' ? 'অভিভাবক লিংক' : 'Parent Links' },
      { id: 'messages', label: lang === 'bn' ? 'যোগাযোগ' : 'Messages' },
      { id: 'leaves', label: lang === 'bn' ? 'শিক্ষক ছুটি' : 'Leaves' },
      { id: 'users', label: lang === 'bn' ? 'ইউজার' : 'Users' },
      { id: 'audit-logs', label: lang === 'bn' ? 'অডিট লগ' : 'Audit Logs' },
      { id: 'system', label: lang === 'bn' ? 'সেটিংস' : 'System' },
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[70vh]">
          {/* Header */}
          <div className="bg-emerald-700 p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40 flex items-center justify-center">
                  {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10" />}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-white text-emerald-700 p-1.5 rounded-xl shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black">{user.name}</h1>
                <p className="opacity-80 font-bold uppercase tracking-widest text-xs mt-1">
                  {user.role} Portal • ID: {user.userId}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {lang === 'bn' ? 'লগআউট' : 'Logout'}
            </button>
          </div>

          <div className="p-6 md:p-8">
            {user.role === 'teacher' ? (
              <TeacherPortal />
            ) : user.role === 'parent' ? (
              <ParentPortal />
            ) : user.role === 'student' ? (
              <StudentPortal />
            ) : dashboardView === 'teacher-portal' ? (
              <div className="space-y-6">
                <button
                  onClick={() => setDashboardView('main')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  ← {lang === 'bn' ? 'অ্যাডমিন হোমে ফিরুন' : 'Back to Admin Home'}
                </button>
                <TeacherPortal />
              </div>
            ) : dashboardView === 'main' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                  onClick={() => setDashboardView('admin-management')}
                  className="bg-slate-900 dark:bg-slate-800 text-white p-7 rounded-3xl shadow-lg hover:bg-emerald-800 transition-all text-left space-y-4"
                >
                  <Settings className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-xl font-black">{lang === 'bn' ? 'স্কুল ম্যানেজমেন্ট সিস্টেম' : 'School Management System'}</h3>
                  <p className="text-slate-300 text-xs">
                    {lang === 'bn' ? 'শিক্ষার্থী, শিক্ষক, বিষয়, ফলাফল, নোটিশ, লাইব্রেরি, ভর্তি ও অ্যালামনাই নিয়ন্ত্রণ।' : 'Manage students, teachers, subjects, routines, notices, library, admissions & alumni.'}
                  </p>
                </button>

                <button
                  onClick={() => setDashboardView('teacher-portal')}
                  className="bg-purple-700 text-white p-7 rounded-3xl shadow-lg hover:bg-purple-800 transition-all text-left space-y-4"
                >
                  <GraduationCap className="w-8 h-8 text-yellow-300" />
                  <h3 className="text-xl font-black">{lang === 'bn' ? 'টিচার ও একাডেমিক পোর্টাল' : 'Academic & Teacher Workspace'}</h3>
                  <p className="text-purple-100 text-xs">
                    {lang === 'bn' ? 'হাজিরা, হোমওয়ার্ক মূল্যায়ন, পরীক্ষার নম্বর এন্ট্রি ও MCQ কুইজ তৈরি।' : 'Manage attendance, homework grading, exam marks & online MCQ quizzes.'}
                  </p>
                </button>

                <div className="bg-slate-50 dark:bg-slate-800/70 p-7 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
                    {isCloudAdmin ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4 text-amber-500" />}
                    {isCloudAdmin ? 'Cloud Admin Synced' : 'Local Admin Session'}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isCloudAdmin
                      ? lang === 'bn'
                        ? 'আপনার Google অ্যাকাউন্ট সরাসরি Firestore ডাটাবেজের সাথে যুক্ত।'
                        : 'Your verified Google account is synced with Firestore.'
                      : lang === 'bn'
                      ? 'ক্লাউড সিঙ্কের জন্য Google Sign-In ব্যবহার করুন।'
                      : 'Sign in with Google Admin to sync across devices.'}
                  </p>
                  {!isCloudAdmin && (
                    <button onClick={handleGoogleAuth} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
                      Connect Google Admin
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button onClick={exportDatabase} className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Backup
                    </button>
                    <label className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Restore
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const ok = importDatabase(String(ev.target?.result || ''));
                            setDbFeedback({ ok, msg: ok ? 'Database restored!' : 'Invalid backup file' });
                          };
                          reader.readAsText(file);
                        }}
                      />
                    </label>
                  </div>
                  {dbFeedback && <p className="text-xs font-bold text-emerald-600">{dbFeedback.msg}</p>}
                </div>
              </div>
            ) : (
              /* Admin Management Workspace */
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setDashboardView('main')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                  >
                    ← {lang === 'bn' ? 'অ্যাডমিন হোম' : 'Admin Home'}
                  </button>
                  {['notices', 'teachers', 'ebooks', 'gallery', 'users'].includes(managementTab) && (
                    <button
                      onClick={openAddModal}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      {lang === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}
                    </button>
                  )}
                </div>

                {/* Tab strip */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                  {adminTabs.map((tb) => (
                    <button
                      key={tb.id}
                      onClick={() => setManagementTab(tb.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        managementTab === tb.id
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                          : 'text-slate-500 dark:text-slate-300 hover:text-slate-800'
                      }`}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>

                {managementTab === 'notices' && (
                  <div className="space-y-2.5">
                    {notices.map((n) => (
                      <div key={n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">{n.category} • {n.date}</span>
                          <p className="font-bold text-sm">{t(n.title)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditModal(n)} className="p-2 text-blue-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteNotice(n.id)} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'teachers' && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachers.map((tc) => (
                      <div key={tc.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center overflow-hidden shrink-0">
                            {tc.photo ? <img src={tc.photo} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-emerald-700" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{t(tc.name)}</p>
                            <p className="text-xs text-slate-500 truncate">{t(tc.designation)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEditModal(tc)} className="p-1.5 text-blue-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteTeacher(tc.id)} className="p-1.5 text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'ebooks' && (
                  <div className="space-y-2.5">
                    {ebooks.map((eb) => (
                      <div key={eb.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Class {eb.classId} • {eb.category || eb.subject}</span>
                          <p className="font-bold text-sm">{t(eb.title)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditModal(eb)} className="p-2 text-blue-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteEbook(eb.id)} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'gallery' && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gallery.map((g) => (
                      <div key={g.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                        <img src={g.url} alt="" className="w-full h-36 object-cover rounded-xl" />
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-xs font-bold truncate">{t(g.caption)}</p>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => openEditModal(g)} className="p-1 text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteGalleryItem(g.id)} className="p-1 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'subjects' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <input value={newSubject.code} onChange={(e) => setNewSubject((p) => ({ ...p, code: e.target.value }))} placeholder="Code" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <input value={newSubject.nameBn} onChange={(e) => setNewSubject((p) => ({ ...p, nameBn: e.target.value }))} placeholder="বিষয়ের নাম (বাংলা)" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <input value={newSubject.nameEn} onChange={(e) => setNewSubject((p) => ({ ...p, nameEn: e.target.value }))} placeholder="Subject Name (EN)" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <select value={newSubject.classId} onChange={(e) => setNewSubject((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                        {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                      </select>
                      <button
                        onClick={() => {
                          if (!newSubject.nameEn.trim() && !newSubject.nameBn.trim()) return;
                          addSubject({
                            id: `sub-${Date.now()}`,
                            code: newSubject.code,
                            name: { bn: newSubject.nameBn || newSubject.nameEn, en: newSubject.nameEn || newSubject.nameBn },
                            classId: newSubject.classId,
                            totalMarks: Number(newSubject.totalMarks) || 100,
                            isPublic: true,
                          });
                          setNewSubject((p) => ({ ...p, nameBn: '', nameEn: '' }));
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                      >
                        Add Subject
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subjects.map((s) => (
                        <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
                          <span><b>[{s.code}]</b> {t(s.name)} — Class {s.classId} ({s.totalMarks}m)</span>
                          <button onClick={() => deleteSubject(s.id)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {managementTab === 'exam-routines' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      <select value={newExamRoutine.classId} onChange={(e) => setNewExamRoutine((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                        {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                      </select>
                      <input value={newExamRoutine.subject} onChange={(e) => setNewExamRoutine((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <input type="date" value={newExamRoutine.date} onChange={(e) => setNewExamRoutine((p) => ({ ...p, date: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <input value={newExamRoutine.time} onChange={(e) => setNewExamRoutine((p) => ({ ...p, time: e.target.value }))} placeholder="Time" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <input value={newExamRoutine.room} onChange={(e) => setNewExamRoutine((p) => ({ ...p, room: e.target.value }))} placeholder="Room" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <button onClick={() => addExamRoutine({ id: `er-${Date.now()}`, ...newExamRoutine, isPublic: true })} className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold">Add Date</button>
                    </div>
                    <div className="space-y-2">
                      {examRoutines.map((r) => (
                        <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
                          <span><b>Class {r.classId}</b> • {r.subject} • {r.date} ({r.time}) {r.room}</span>
                          <button onClick={() => deleteExamRoutine(r.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {managementTab === 'online-exams' && (
                  <div className="space-y-2.5">
                    {onlineExams.map((ex) => (
                      <div key={ex.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Class {ex.classId} • {ex.subject} • {ex.questions.length} MCQ</span>
                          <p className="font-bold text-sm">{t(ex.title)}</p>
                        </div>
                        <button onClick={() => deleteOnlineExam(ex.id)} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'admissions' && (
                  <div className="space-y-3">
                    {admissions.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">No admission applications yet.</p>
                    ) : admissions.map((a) => (
                      <div key={a.appId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-wrap justify-between items-center gap-3 text-xs">
                        <div>
                          <p className="font-extrabold text-sm">{a.studentName} ({a.appId})</p>
                          <p className="text-slate-500">Class {a.targetClass} • Guardian: {a.guardianMobile} • Status: <b className="uppercase">{a.status}</b></p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => updateAdmissionStatus(a.appId, 'approved')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Approve</button>
                          <button onClick={() => updateAdmissionStatus(a.appId, 'rejected')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold">Reject</button>
                          <button onClick={() => deleteAdmission(a.appId)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'alumni' && (
                  <div className="space-y-3">
                    {alumni.map((al) => (
                      <div key={al.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-wrap justify-between items-center gap-3 text-xs">
                        <div>
                          <p className="font-extrabold text-sm">{al.name} (Batch {al.batchYear})</p>
                          <p className="text-slate-500">{al.currentRole} • {al.organization} • Status: <b className="uppercase">{al.status}</b></p>
                        </div>
                        <div className="flex gap-1.5">
                          {al.status === 'pending' && (
                            <button onClick={() => updateAlumniStatus(al.id, 'approved')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Approve</button>
                          )}
                          <button onClick={() => deleteAlumniProfile(al.id)} className="p-1.5 text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'parent-messages' && (
                  <div className="space-y-3">
                    {parentMessages.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">No guardian messages yet.</p>
                    ) : parentMessages.map((pm) => (
                      <div key={pm.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>{pm.parentName} (Class {pm.classId}, Roll {pm.roll}) → {pm.teacherName}</span>
                          <span className="uppercase text-emerald-700 dark:text-emerald-400">{pm.status}</span>
                        </div>
                        <p className="text-sm">{pm.message}</p>
                        {!pm.reply && (
                          <div className="flex gap-2">
                            <input
                              value={adminReplyDrafts[pm.id] || ''}
                              onChange={(e) => setAdminReplyDrafts((p) => ({ ...p, [pm.id]: e.target.value }))}
                              placeholder="Reply..."
                              className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                            />
                            <button
                              onClick={() => replyParentMessage(pm.id, adminReplyDrafts[pm.id] || '', user.name)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'messages' && (
                  <div className="space-y-3">
                    {contactMessages.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">No contact messages yet.</p>
                    ) : contactMessages.map((m) => (
                      <div key={m.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-start gap-3 text-xs">
                        <div>
                          <p className="font-bold text-sm">{m.name} ({m.mobile}) — {m.date || ''}</p>
                          <p className="text-slate-600 dark:text-slate-300 mt-1">{m.message}</p>
                        </div>
                        <div className="flex gap-1">
                          {m.status === 'unread' && (
                            <button onClick={() => markContactMessageRead(m.id)} className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold">Read</button>
                          )}
                          <button onClick={() => deleteContactMessage(m.id)} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'leaves' && (
                  <div className="space-y-3">
                    {teacherLeaves.map((tl) => (
                      <div key={tl.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>{tl.teacherName} • {tl.leaveType} ({tl.startDate} → {tl.endDate})</span>
                          <span className="uppercase">{tl.status}</span>
                        </div>
                        <p className="text-sm">{tl.reason}</p>
                        <div className="flex gap-2">
                          <input value={leaveRemarks[tl.id] || ''} onChange={(e) => setLeaveRemarks((p) => ({ ...p, [tl.id]: e.target.value }))} placeholder="Remark..." className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
                          <button onClick={() => updateTeacherLeaveStatus(tl.id, 'approved', leaveRemarks[tl.id])} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Approve</button>
                          <button onClick={() => updateTeacherLeaveStatus(tl.id, 'rejected', leaveRemarks[tl.id])} className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold">Reject</button>
                          <button onClick={() => deleteTeacherLeave(tl.id)} className="p-1.5 text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'parent-links' && (
                  <div className="space-y-3">
                    {parentLinks.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">
                        {lang === 'bn' ? 'কোনো অভিভাবক-শিক্ষার্থী লিংক আবেদন নেই।' : 'No parent-student verification requests yet.'}
                      </p>
                    ) : parentLinks.map((pl) => (
                      <div key={pl.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-wrap justify-between items-center gap-3 text-xs">
                        <div>
                          <p className="font-extrabold text-sm">
                            {pl.parentName} ({pl.relationship}) → Class {pl.classId}, Roll {pl.roll}
                          </p>
                          <p className="text-slate-500">
                            {pl.parentEmail} {pl.studentName ? `• Matched: ${pl.studentName}` : ''} • Status:{' '}
                            <b className="uppercase">{pl.status}</b>
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {pl.status !== 'approved' && (
                            <button
                              onClick={() => reviewParentStudentLink(pl.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {pl.status !== 'rejected' && (
                            <button
                              onClick={() => reviewParentStudentLink(pl.id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => deleteParentStudentLink(pl.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {managementTab === 'users' && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allUsers.map((u) => (
                        <div key={u.userId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <p className="font-extrabold text-sm">{u.name}</p>
                            <p className="text-slate-500">ID: {u.userId} • Role: <b className="uppercase">{u.role}</b></p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEditModal(u)} className="p-1.5 text-blue-600"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => deleteUser(u.userId)} className="p-1.5 text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {isCloudAdmin && cloudUsers.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-extrabold uppercase text-slate-400">Cloud Firebase Users</p>
                        {cloudUsers.map((cu) => (
                          <div key={cu.uid} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                            <span><b>{cu.name}</b> ({cu.email})</span>
                            <select
                              value={cu.role}
                              onChange={(e) => updateCloudUserRole(cu.uid, e.target.value as 'student' | 'teacher' | 'parent' | 'admin')}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                            >
                              <option value="student">student</option>
                              <option value="parent">parent</option>
                              <option value="teacher">teacher</option>
                              <option value="admin">admin</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {managementTab === 'audit-logs' && (
                  <div className="space-y-3">
                    {auditLogs.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">
                        {lang === 'bn' ? 'কোনো অডিট লগ পাওয়া যায়নি।' : 'No audit logs recorded yet.'}
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-500">
                            <tr>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Action</th>
                              <th className="px-4 py-3">Actor</th>
                              <th className="px-4 py-3">Target</th>
                              <th className="px-4 py-3">Summary</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {auditLogs.map((log) => (
                              <tr key={log.id} className="bg-white dark:bg-slate-900">
                                <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{log.createdDate}</td>
                                <td className="px-4 py-3 font-black uppercase text-emerald-700 dark:text-emerald-400">{log.action}</td>
                                <td className="px-4 py-3 font-semibold">{log.actorName} ({log.actorRole})</td>
                                <td className="px-4 py-3 text-slate-500">{log.targetCollection}</td>
                                <td className="px-4 py-3">{log.summary}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {managementTab === 'system' && (
                  <form onSubmit={handleSaveSettings} className="grid sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl">
                    <input value={systemForm.nameBn} onChange={(e) => setSystemForm((p) => ({ ...p, nameBn: e.target.value }))} placeholder="School Name (BN)" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <input value={systemForm.nameEn} onChange={(e) => setSystemForm((p) => ({ ...p, nameEn: e.target.value }))} placeholder="School Name (EN)" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <input value={systemForm.eiin} onChange={(e) => setSystemForm((p) => ({ ...p, eiin: e.target.value }))} placeholder="EIIN" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <input value={systemForm.phone} onChange={(e) => setSystemForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <input value={systemForm.email} onChange={(e) => setSystemForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <input value={systemForm.locBn} onChange={(e) => setSystemForm((p) => ({ ...p, locBn: e.target.value }))} placeholder="Location (BN)" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <input value={systemForm.locEn} onChange={(e) => setSystemForm((p) => ({ ...p, locEn: e.target.value }))} placeholder="Location (EN)" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={systemForm.latitude} onChange={(e) => setSystemForm((p) => ({ ...p, latitude: e.target.value }))} placeholder="Latitude" className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                      <input value={systemForm.longitude} onChange={(e) => setSystemForm((p) => ({ ...p, longitude: e.target.value }))} placeholder="Longitude" className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    </div>
                    <input value={systemForm.headNameBn} onChange={(e) => setSystemForm((p) => ({ ...p, headNameBn: e.target.value }))} placeholder="Head Teacher Name (BN)" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <input value={systemForm.headNameEn} onChange={(e) => setSystemForm((p) => ({ ...p, headNameEn: e.target.value }))} placeholder="Head Teacher Name (EN)" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <textarea rows={2} value={systemForm.headMsgBn} onChange={(e) => setSystemForm((p) => ({ ...p, headMsgBn: e.target.value }))} placeholder="Head Teacher Message (BN)" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                    <textarea rows={2} value={systemForm.headMsgEn} onChange={(e) => setSystemForm((p) => ({ ...p, headMsgEn: e.target.value }))} placeholder="Head Teacher Message (EN)" className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />

                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => schoolPhotoInputRef.current?.click()} className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                        {lang === 'bn' ? 'ক্যাম্পাস ছবি বদলান' : 'Change Campus Photo'}
                      </button>
                      <button type="button" onClick={() => headPhotoInputRef.current?.click()} className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                        {lang === 'bn' ? 'প্রধান শিক্ষকের ছবি' : 'Head Teacher Photo'}
                      </button>
                      <input
                        ref={schoolPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const compressed = await compressImageFile(f, 1000, 0.75);
                            setSystemForm((p) => ({ ...p, schoolPhoto: compressed }));
                          }
                        }}
                      />
                      <input
                        ref={headPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const compressed = await compressImageFile(f, 600, 0.75);
                            setSystemForm((p) => ({ ...p, headPhoto: compressed }));
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="submit" className="px-6 py-3 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Settings
                      </button>
                      {showSaveSuccess && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved!</span>}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <form onSubmit={handleAddOrUpdateModal} className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-lg">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                <button type="button" onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              {modalError && <p className="text-xs font-bold text-red-600">{modalError}</p>}

              {managementTab === 'notices' && (
                <>
                  <input required name="titleBn" defaultValue={editingItem?.title?.bn || ''} placeholder="Title (BN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="titleEn" defaultValue={editingItem?.title?.en || ''} placeholder="Title (EN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <select name="category" defaultValue={editingItem?.category || 'General'} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      <option value="General">General</option><option value="Admission">Admission</option><option value="Exam">Exam</option><option value="Holiday">Holiday</option>
                    </select>
                    <input required type="date" name="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                  </div>
                  <textarea required rows={3} name="descBn" defaultValue={editingItem?.description?.bn || ''} placeholder="Description (BN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <textarea required rows={3} name="descEn" defaultValue={editingItem?.description?.en || ''} placeholder="Description (EN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                </>
              )}

              {managementTab === 'teachers' && (
                <>
                  <input required name="nameBn" defaultValue={editingItem?.name?.bn || ''} placeholder="Name (BN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="nameEn" defaultValue={editingItem?.name?.en || ''} placeholder="Name (EN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="desigBn" defaultValue={editingItem?.designation?.bn || ''} placeholder="Designation (BN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="desigEn" defaultValue={editingItem?.designation?.en || ''} placeholder="Designation (EN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="subBn" defaultValue={editingItem?.subject?.bn || ''} placeholder="Subject (BN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="subEn" defaultValue={editingItem?.subject?.en || ''} placeholder="Subject (EN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="qualBn" defaultValue={editingItem?.qualification?.bn || ''} placeholder="Qualification (BN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="qualEn" defaultValue={editingItem?.qualification?.en || ''} placeholder="Qualification (EN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setTempImage(await compressImageFile(f, 500, 0.75)); }} className="text-xs" />
                </>
              )}

              {managementTab === 'ebooks' && (
                <>
                  <input required name="titleBn" defaultValue={editingItem?.title?.bn || ''} placeholder="Title (BN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="titleEn" defaultValue={editingItem?.title?.en || ''} placeholder="Title (EN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <select name="classId" defaultValue={editingItem?.classId || '9'} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <select name="bookCat" defaultValue={editingItem?.category || 'Textbook'} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      {['Textbook', 'StudyMaterial', 'Notes', 'ChapterPDF', 'BoardQuestion', 'ModelTest', 'Practical', 'MathSolution', 'EnglishGrammar', 'ICT'].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <input required name="subject" defaultValue={editingItem?.subject || 'Mathematics'} placeholder="Subject" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input name="downloadUrl" defaultValue={editingItem?.downloadUrl || '#'} placeholder="Resource / PDF URL" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                </>
              )}

              {managementTab === 'gallery' && (
                <>
                  <input required name="capBn" defaultValue={editingItem?.caption?.bn || ''} placeholder="Caption (BN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input required name="capEn" defaultValue={editingItem?.caption?.en || ''} placeholder="Caption (EN)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <select name="galCat" defaultValue={editingItem?.category || 'Campus'} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    {['Campus', 'Sports', 'Cultural', 'Lab', 'Tour'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setTempImage(await compressImageFile(f, 900, 0.78)); }} className="text-xs" />
                </>
              )}

              {managementTab === 'users' && (
                <>
                  <input required name="userName" defaultValue={editingItem?.name || ''} placeholder="Full Name" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  {!editingItem && <input required name="userId" placeholder="User ID" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />}
                  <input name="userEmail" defaultValue={editingItem?.email || ''} placeholder="Email" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input name="userPass" type="password" placeholder={editingItem ? 'New Password (optional)' : 'Password'} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <select name="userRole" defaultValue={editingItem?.role || 'student'} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </>
              )}

              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 text-white text-xs font-bold">Save</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex p-3.5 rounded-2xl bg-emerald-700 text-white shadow-lg mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {lang === 'bn' ? 'পোর্টাল লগইন' : 'School Portal Login'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn' ? 'আপনার পোর্টাল নির্বাচন করে প্রবেশ করুন' : 'Choose your portal role to continue'}
          </p>
        </div>

        {/* 4 Role Tabs: Student, Parent, Teacher, Admin */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800 p-1 mx-6 rounded-2xl">
          {(['student', 'parent', 'teacher', 'admin'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setActiveTab(role);
                setError('');
              }}
              className={`py-2.5 rounded-xl text-[11px] font-extrabold transition-all ${
                activeTab === role
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              {role === 'student'
                ? t(TRANSLATIONS.login.studentTab)
                : role === 'parent'
                ? t(TRANSLATIONS.login.parentTab)
                : role === 'teacher'
                ? t(TRANSLATIONS.login.teacherTab)
                : t(TRANSLATIONS.login.adminTab)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold space-y-2">
              <p>{error}</p>
              {(needsVerification || (firebaseUser && !firebaseUser.emailVerified)) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await resendVerificationEmail();
                      setAuthNotice(ok ? (lang === 'bn' ? 'ইমেইল পুনরায় পাঠানো হয়েছে।' : 'Verification email resent.') : '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-[11px] font-bold"
                  >
                    {lang === 'bn' ? 'পুনরায় ইমেইল পাঠান' : 'Resend Verification'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await refreshAuthSession();
                      if (ok) navigate('/dashboard');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-bold"
                  >
                    {lang === 'bn' ? 'স্ট্যাটাস রিফ্রেশ করুন' : 'Refresh Status'}
                  </button>
                </div>
              )}
            </div>
          )}

          {authNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              {authNotice}
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              {lang === 'bn'
                ? 'নিরাপত্তার জন্য অ্যাডমিন পোর্টাল শুধুমাত্র অনুমোদিত Google Cloud Sign-In অথবা ভেরিফায়েড ইমেইল-পাসওয়ার্ডের মাধ্যমে প্রবেশযোগ্য।'
                : 'For security, Admin portal requires Google Cloud Sign-In or a verified Admin Firebase email.'}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500">
              {lang === 'bn' ? 'ইমেইল অথবা ইউজার আইডি' : 'Email or User ID'}
            </label>
            <div className="relative mt-1">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={activeTab === 'admin' ? 'admin@school.edu' : `name@email.com or ${activeTab}01`}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            {lang === 'bn' ? 'প্রবেশ করুন' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {lang === 'bn' ? 'Google দিয়ে ক্লাউড লগইন' : 'Continue with Google Cloud'}
          </button>

          {/* Non-admin Preview Helpers */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-bold uppercase text-center text-slate-400">
              {lang === 'bn' ? 'প্রিভিউ পোর্টাল আইডি' : 'Preview Non-Admin IDs'}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['student', 'parent', 'teacher'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickLogin(r)}
                  className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-[10px] font-extrabold capitalize text-slate-700 dark:text-slate-300"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 pt-2">
            {lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলতে চান?' : 'Need an account?'}{' '}
            <Link to="/register" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
              {lang === 'bn' ? 'নিবন্ধন করুন' : 'Register Here'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
