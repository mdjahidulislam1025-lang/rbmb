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
  BarChart3,
  Receipt,
  Megaphone,
  Clock,
  RotateCcw,
  IdCard,
  ClipboardList,
  FileBadge2,
} from 'lucide-react';
import { TRANSLATIONS, EXAM_TERMS } from '../constants';
import { useApp } from '../App';
import { Notice, Teacher, GalleryItem, EBook, UserRole, FeeCategory, FeeRecord, PaymentMethod, SchoolStudent } from '../types';
import { compressImageFile } from '../utils/imageUtils';
import { exportCsv } from '../utils/exportUtils';
import { TeacherPortal } from '../components/TeacherPortal';
import { StudentPortal } from '../components/StudentPortal';
import { ParentPortal } from '../components/ParentPortal';
import { FeeReceiptModal } from '../components/FeeReceiptModal';
import { StudentIdAdmitCard, CardMode } from '../components/StudentIdAdmitCard';
import { TeacherIdCardModal } from '../components/TeacherIdCardModal';

const { useState, useEffect, useRef, useMemo } = React;
const { useLocation, Link, useNavigate } = RouterDom;

type ManagementTab =
  | 'analytics'
  | 'cards'
  | 'fees'
  | 'broadcasts'
  | 'class-routine'
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
    students,
    updateStudent,
    attendanceRecords,
    studentAttendance,
    examMarks,
    examAttempts,
    studentLeaves,
    feeRecords,
    addFeeRecord,
    addBulkClassFees,
    updateFeePayment,
    markFeeWaived,
    deleteFeeRecord,
    portalNotifications,
    addPortalNotification,
    deletePortalNotification,
    classRoutines,
    saveClassRoutine,
    resetClassRoutines,
    auditLogs,
    settings,
    updateSettings,
    exportDatabase,
    importDatabase,
    lastSyncError,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'parent' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const [dashboardView, setDashboardView] = useState<'main' | 'admin-management' | 'teacher-portal'>('main');
  const [managementTab, setManagementTab] = useState<ManagementTab>('analytics');
  const [leaveRemarks, setLeaveRemarks] = useState<Record<string, string>>({});
  const [adminReplyDrafts, setAdminReplyDrafts] = useState<Record<string, string>>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [dbFeedback, setDbFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [tempImage, setTempImage] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [adminToast, setAdminToast] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingItem, setEditingItem] = useState<any>(null);
  const [adminCardStudent, setAdminCardStudent] = useState<SchoolStudent | null>(null);
  const [adminCardMode, setAdminCardMode] = useState<CardMode>('admit');
  const [cardClassFilter, setCardClassFilter] = useState<string>('all');
  const [cardSearch, setCardSearch] = useState<string>('');
  const [adminAdmitTerm, setAdminAdmitTerm] = useState<string>(EXAM_TERMS[1]?.id || EXAM_TERMS[0]?.id || 'Half-Yearly Exam 2026');
  const [adminTeacherCard, setAdminTeacherCard] = useState<{ teacher: Teacher; index: number } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Admin Fee Ledger States
  const [adminFeeMode, setAdminFeeMode] = useState<'bulk' | 'single'>('bulk');
  const [adminBulkFee, setAdminBulkFee] = useState({
    classId: '9',
    title: 'Monthly Tuition Fee',
    category: 'Tuition' as FeeCategory,
    billingMonth: 'April 2026',
    amount: 500,
    dueDate: todayStr,
  });
  const [adminSingleFee, setAdminSingleFee] = useState({
    studentId: '',
    title: 'Exam Fee',
    category: 'Exam' as FeeCategory,
    billingMonth: 'Half Yearly 2026',
    amount: 350,
    dueDate: todayStr,
  });
  const [adminFeeClassFilter, setAdminFeeClassFilter] = useState<string>('all');
  const [adminFeeStatusFilter, setAdminFeeStatusFilter] = useState<string>('all');
  const [adminPayAmounts, setAdminPayAmounts] = useState<Record<string, string>>({});
  const [adminPayMethods, setAdminPayMethods] = useState<Record<string, PaymentMethod>>({});
  const [activeAdminReceipt, setActiveAdminReceipt] = useState<FeeRecord | null>(null);

  // Admin Broadcast State
  const [adminBroadcast, setAdminBroadcast] = useState({
    targetRole: 'all' as 'all' | 'student' | 'parent' | 'teacher',
    classId: 'all',
    priority: 'normal' as 'normal' | 'urgent',
    title: '',
    message: '',
  });

  // Admin Class Routine Editor State
  const [routineClassId, setRoutineClassId] = useState<'6' | '7' | '8' | '9' | '10'>('6');
  const [routineDayIdx, setRoutineDayIdx] = useState<number>(0);
  const [periodDraft, setPeriodDraft] = useState({
    time: '01:45 PM',
    subjectBn: '',
    subjectEn: '',
    teacherBn: '',
    teacherEn: '',
  });

  const notifyAdmin = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3000);
  };

  const analyticsSummary = useMemo(() => {
    const totalStudents = students.length;

    // Live Attendance calculation (prefer normalized studentAttendance, fall back to attendanceRecords map)
    let presentCount = 0;
    let attTotal = 0;
    if (studentAttendance.length > 0) {
      attTotal = studentAttendance.length;
      presentCount = studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    } else {
      attendanceRecords.forEach((rec) => {
        const vals = Object.values(rec.records || {});
        attTotal += vals.length;
        presentCount += vals.filter((v) => v === 'present' || v === 'late').length;
      });
    }
    const attendanceRatePct = attTotal > 0 ? Math.round((presentCount / attTotal) * 100) : 0;

    // Live Fee Financials
    const billed = feeRecords.reduce((acc, f) => acc + (f.status === 'waived' ? 0 : Number(f.amount) || 0), 0);
    const collected = feeRecords.reduce((acc, f) => acc + (Number(f.paidAmount) || 0), 0);
    const due = feeRecords.reduce(
      (acc, f) => acc + (f.status === 'waived' ? 0 : Math.max(0, (Number(f.amount) || 0) - (Number(f.paidAmount) || 0))),
      0
    );
    const feeCollectionPct = billed > 0 ? Math.round((collected / billed) * 100) : 0;

    // Pending Approvals Queue
    const pendingAdmissions = admissions.filter((a) => a.status === 'pending').length;
    const pendingParentLinks = parentLinks.filter((p) => p.status === 'pending').length;
    const pendingLeaves =
      teacherLeaves.filter((l) => l.status === 'pending').length +
      studentLeaves.filter((l) => l.status === 'pending').length;
    const pendingAlumni = alumni.filter((al) => al.status === 'pending').length;
    const pendingTotal = pendingAdmissions + pendingParentLinks + pendingLeaves + pendingAlumni;

    // Class 6-10 Live Breakdown
    const classBreakdown = ['6', '7', '8', '9', '10'].map((cid) => {
      const clsStudents = students.filter((s) => s.classId === cid);
      let clsAttTotal = 0;
      let clsAttPresent = 0;
      if (studentAttendance.length > 0) {
        const rows = studentAttendance.filter((a) => a.classId === cid);
        clsAttTotal = rows.length;
        clsAttPresent = rows.filter((a) => a.status === 'present' || a.status === 'late').length;
      } else {
        attendanceRecords
          .filter((r) => r.classId === cid)
          .forEach((r) => {
            const vals = Object.values(r.records || {});
            clsAttTotal += vals.length;
            clsAttPresent += vals.filter((v) => v === 'present' || v === 'late').length;
          });
      }
      const clsAttPct = clsAttTotal > 0 ? Math.round((clsAttPresent / clsAttTotal) * 100) : 0;

      const clsMarks = examMarks.filter((m) => m.classId === cid);
      const avgMarkPct =
        clsMarks.length > 0
          ? Math.round(
              clsMarks.reduce((acc, m) => acc + ((Number(m.totalMarks) || 100) > 0 ? (m.obtainedMarks / (m.totalMarks || 100)) * 100 : 0), 0) /
                clsMarks.length
            )
          : 0;
      const passRatePct =
        clsMarks.length > 0
          ? Math.round((clsMarks.filter((m) => m.grade !== 'F').length / clsMarks.length) * 100)
          : 0;

      const clsFees = feeRecords.filter((f) => f.classId === cid && f.status !== 'waived');
      const clsBilled = clsFees.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
      const clsPaid = clsFees.reduce((acc, f) => acc + (Number(f.paidAmount) || 0), 0);
      const clsFeePct = clsBilled > 0 ? Math.round((clsPaid / clsBilled) * 100) : 0;

      return {
        classId: cid,
        studentCount: clsStudents.length,
        attPct: clsAttPct,
        attSamples: clsAttTotal,
        avgMarkPct,
        passRatePct,
        marksCount: clsMarks.length,
        feePct: clsFeePct,
        feeBilled: clsBilled,
      };
    });

    // Online MCQ Summary
    const avgAttemptPct =
      examAttempts.length > 0
        ? Math.round(examAttempts.reduce((acc, at) => acc + (Number(at.percentage) || 0), 0) / examAttempts.length)
        : 0;

    return {
      totalStudents,
      attendanceRatePct,
      attTotal,
      billed,
      collected,
      due,
      feeCollectionPct,
      pendingTotal,
      pendingAdmissions,
      pendingParentLinks,
      pendingLeaves,
      pendingAlumni,
      classBreakdown,
      mcqCount: onlineExams.length,
      attemptCount: examAttempts.length,
      avgAttemptPct,
    };
  }, [
    students,
    studentAttendance,
    attendanceRecords,
    feeRecords,
    admissions,
    parentLinks,
    teacherLeaves,
    studentLeaves,
    alumni,
    examMarks,
    onlineExams,
    examAttempts,
  ]);

  const filteredAdminFees = useMemo(
    () =>
      feeRecords.filter(
        (f) =>
          (adminFeeClassFilter === 'all' || f.classId === adminFeeClassFilter) &&
          (adminFeeStatusFilter === 'all' || f.status === adminFeeStatusFilter)
      ),
    [feeRecords, adminFeeClassFilter, adminFeeStatusFilter]
  );

  const activeAdminRoutine = useMemo(
    () => classRoutines.find((r) => r.classId === routineClassId) || classRoutines[0],
    [classRoutines, routineClassId]
  );

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
    setUserId(role === 'student' ? 'RBMB-REG-2026-0901' : `${role}01`);
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
      if (res.ok) {
        setIsSubmitting(false);
        navigate('/dashboard');
        return;
      }
      if (!res.needsVerification && activeTab !== 'admin') {
        const localEmailMatch = await verifyLocalCredentials(identifier, password, activeTab);
        if (localEmailMatch) {
          setIsSubmitting(false);
          login(localEmailMatch);
          navigate('/dashboard');
          return;
        }
      }
      setIsSubmitting(false);
      if (res.needsVerification) setNeedsVerification(true);
      setError(
        res.error ||
          (lang === 'bn' ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' : 'Invalid email or password.')
      );
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
        activeTab === 'student'
          ? lang === 'bn'
            ? 'ভুল রেজিস্ট্রেশন নম্বর বা পাসওয়ার্ড! সঠিক রেজিস্ট্রেশন নম্বর (যেমন: RBMB-REG-2026-0901) ও পাসওয়ার্ড দিন।'
            : 'Invalid Registration Number or password for Student Portal.'
          : lang === 'bn'
          ? 'ভুল আইডি/মোবাইল বা পাসওয়ার্ড অথবা ভুল রোল ট্যাব!'
          : 'Invalid ID/mobile or password for the selected portal role.'
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
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (res.ok) {
      if (activeTab === 'admin' && !res.isAdmin) {
        setAuthNotice(
          lang === 'bn'
            ? 'আপনি Google দিয়ে লগইন করেছেন, তবে এই Gmail-এ এখনো অ্যাডমিন রোল যুক্ত নেই। অ্যাডমিন অ্যাক্সেসের জন্য mdjahidulislam1025@gmail.com দিয়ে লগইন করুন।'
            : 'Signed in with Google, but this Gmail does not have Admin privileges yet. Use mdjahidulislam1025@gmail.com for Admin access.'
        );
      }
      navigate('/dashboard');
    } else {
      setError(res.error || (lang === 'bn' ? 'Google লগইন সম্পন্ন হয়নি।' : 'Google Sign-In failed or cancelled.'));
    }
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    const ok = await updateSettings({
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
    if (ok) {
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2500);
    } else {
      setSettingsError(
        lang === 'bn'
          ? 'লোকালে সেভ হয়েছে, তবে ক্লাউড সিঙ্ক ব্যর্থ হয়েছে। আপনার ইমেজ সাইজ বা ইন্টারনেট যাচাই করুন।'
          : 'Saved locally, but cloud sync failed. Please verify connection and field limits.'
      );
    }
  };

  if (user) {
    if (location.pathname.toLowerCase().includes('/login/admin') && user.role !== 'admin') {
      return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-5">
            <div className="inline-flex p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'অ্যাডমিন প্যানেলে সুইচ করুন' : 'Switch to Admin Account'}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'bn'
                  ? `আপনি বর্তমানে "${user.name}" (${user.role}) হিসেবে লগইন করা আছেন। অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার অ্যাডমিন Gmail (mdjahidulislam1025@gmail.com) দিয়ে লগইন করুন।`
                  : `You are currently signed in as "${user.name}" (${user.role}). Sign in with your Admin Gmail (mdjahidulislam1025@gmail.com) to access the Admin Panel.`}
              </p>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold text-left">
                {error}
              </div>
            )}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleAuth}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                {lang === 'bn' ? 'Google (Gmail) দিয়ে অ্যাডমিন লগইন করুন' : 'Sign in with Google Admin Gmail'}
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setError('');
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
              >
                {lang === 'bn' ? 'লগআউট করে অ্যাডমিন লগইন পেজে যান' : 'Log out & Open Admin Login'}
              </button>
              <Link
                to="/dashboard"
                className="block w-full py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {lang === 'bn' ? 'বর্তমান ড্যাশবোর্ডে ফিরে যান' : 'Return to Current Dashboard'}
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const allUsers = getUsers();
    const adminTabs: { id: ManagementTab; label: string }[] = [
      { id: 'analytics', label: lang === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics' },
      { id: 'cards', label: lang === 'bn' ? 'অ্যাডমিট, রেজি ও আইডি' : 'Student Cards' },
      { id: 'fees', label: lang === 'bn' ? 'ফি ও হিসাব' : 'Fee Ledger' },
      { id: 'broadcasts', label: lang === 'bn' ? 'পোর্টাল ঘোষণা' : 'Broadcasts' },
      { id: 'class-routine', label: lang === 'bn' ? 'ক্লাস রুটিন' : 'Class Routine' },
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

                {adminToast && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{adminToast}</span>
                  </div>
                )}

                {managementTab === 'analytics' && (
                  <div className="space-y-6">
                    {/* 4 Core Real-Data KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span>{lang === 'bn' ? 'নিবন্ধিত শিক্ষার্থী' : 'Enrolled Students'}</span>
                          <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{analyticsSummary.totalStudents}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {lang === 'bn' ? 'শ্রেণী ৬ষ্ঠ – ১০ম' : 'Classes 6 – 10 Roster'}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span>{lang === 'bn' ? 'উপস্থিতির হার' : 'Attendance Rate'}</span>
                          <BarChart3 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {analyticsSummary.attendanceRatePct}%
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {analyticsSummary.attTotal} {lang === 'bn' ? 'টি হাজিরা এন্ট্রি' : 'recorded entries'}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span>{lang === 'bn' ? 'ফি আদায়ের হার' : 'Fee Collection'}</span>
                          <Receipt className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                          {analyticsSummary.feeCollectionPct}%
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          ৳{analyticsSummary.collected.toLocaleString()} / ৳{analyticsSummary.billed.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span>{lang === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approvals'}</span>
                          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                          {analyticsSummary.pendingTotal}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          Adm {analyticsSummary.pendingAdmissions} · Link {analyticsSummary.pendingParentLinks} · Leave {analyticsSummary.pendingLeaves} · Alumni {analyticsSummary.pendingAlumni}
                        </p>
                      </div>
                    </div>

                    {/* Class 6-10 Live Academic & Fee Breakdown */}
                    <div className="grid lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {lang === 'bn' ? 'শ্রেণীভিত্তিক একাডেমিক ও ফি সারসংক্ষেপ' : 'Class 6–10 Live Academic & Fee Breakdown'}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'রিয়েল-টাইম ডাটা' : 'Live Firestore Data'}</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                              <tr>
                                <th className="py-2.5 pr-3">Class</th>
                                <th className="py-2.5 px-3 tabular-nums">Students</th>
                                <th className="py-2.5 px-3 tabular-nums">Attendance %</th>
                                <th className="py-2.5 px-3 tabular-nums">Exam Avg %</th>
                                <th className="py-2.5 px-3 tabular-nums">Pass Rate</th>
                                <th className="py-2.5 pl-3 tabular-nums">Fee Paid %</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {analyticsSummary.classBreakdown.map((row) => (
                                <tr key={row.classId}>
                                  <td className="py-3 pr-3 font-extrabold">Class {row.classId}</td>
                                  <td className="py-3 px-3 tabular-nums font-bold">{row.studentCount}</td>
                                  <td className="py-3 px-3 tabular-nums">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div className="h-full bg-emerald-600" style={{ width: `${row.attPct}%` }} />
                                      </div>
                                      <span className="font-bold">{row.attPct}%</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 tabular-nums font-bold">{row.avgMarkPct}%</td>
                                  <td className="py-3 px-3 tabular-nums font-bold text-emerald-700 dark:text-emerald-400">{row.passRatePct}%</td>
                                  <td className="py-3 pl-3 tabular-nums font-bold">{row.feePct}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Online MCQ Summary + Quick CSV Exports */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm">{lang === 'bn' ? 'অনলাইন MCQ পরীক্ষা' : 'Online MCQ Summary'}</h4>
                            <Trophy className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center pt-1">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                              <p className="text-lg font-black tabular-nums">{analyticsSummary.mcqCount}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Exams</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                              <p className="text-lg font-black tabular-nums">{analyticsSummary.attemptCount}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Attempts</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                              <p className="text-lg font-black tabular-nums text-emerald-700 dark:text-emerald-400">{analyticsSummary.avgAttemptPct}%</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Score</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                          <h4 className="font-extrabold text-sm">{lang === 'bn' ? 'দ্রুত CSV রিপোর্ট ডাউনলোড' : 'Quick CSV Exports'}</h4>
                          <button
                            type="button"
                            onClick={() =>
                              exportCsv(
                                `all_fee_ledger_${todayStr}`,
                                ['ID', 'Class', 'Roll', 'Student Name', 'Title', 'Category', 'Amount', 'Paid', 'Status', 'Method', 'Receipt No', 'Due Date'],
                                feeRecords.map((f) => [f.id, f.classId, f.roll, f.studentName, f.title, f.category, f.amount, f.paidAmount, f.status, f.paymentMethod || '', f.receiptNo || '', f.dueDate])
                              )
                            }
                            className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-700 hover:text-white text-xs font-bold flex items-center justify-between transition-colors"
                          >
                            <span>{lang === 'bn' ? 'সম্পূর্ণ ফি লেজার CSV' : 'Export Fee Ledger CSV'}</span>
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              exportCsv(
                                `all_exam_marks_${todayStr}`,
                                ['Term', 'Class', 'Roll', 'Student Name', 'Subject', 'Obtained', 'Total', 'Grade', 'Entered By'],
                                examMarks.map((m) => [m.examTerm, m.classId, m.roll, m.studentName, m.subject, m.obtainedMarks, m.totalMarks, m.grade, m.enteredBy])
                              )
                            }
                            className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-700 hover:text-white text-xs font-bold flex items-center justify-between transition-colors"
                          >
                            <span>{lang === 'bn' ? 'সকল পরীক্ষার নম্বর CSV' : 'Export Exam Marks CSV'}</span>
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              exportCsv(
                                `audit_logs_${todayStr}`,
                                ['Date', 'Action', 'Actor', 'Email', 'Role', 'Collection', 'Target ID', 'Summary'],
                                auditLogs.map((l) => [l.createdDate, l.action, l.actorName, l.actorEmail, l.actorRole, l.targetCollection, l.targetId, l.summary])
                              )
                            }
                            className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-700 hover:text-white text-xs font-bold flex items-center justify-between transition-colors"
                          >
                            <span>{lang === 'bn' ? 'অডিট লগ CSV' : 'Export Audit Logs CSV'}</span>
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {managementTab === 'fees' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'মোট নির্ধারিত ফি' : 'Total Billed'}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">৳{analyticsSummary.billed.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'আদায়কৃত টাকা' : 'Collected'}</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">৳{analyticsSummary.collected.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'বকেয়া পরিমাণ' : 'Pending Due'}</p>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums mt-1">৳{analyticsSummary.due.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 h-fit">
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setAdminFeeMode('bulk')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${adminFeeMode === 'bulk' ? 'bg-emerald-700 text-white' : 'text-slate-500'}`}
                          >
                            {lang === 'bn' ? 'শ্রেণীভিত্তিক ফি' : 'Bulk Class Fee'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminFeeMode('single')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${adminFeeMode === 'single' ? 'bg-emerald-700 text-white' : 'text-slate-500'}`}
                          >
                            {lang === 'bn' ? 'একক শিক্ষার্থী' : 'Individual Fee'}
                          </button>
                        </div>

                        {adminFeeMode === 'bulk' ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const count = addBulkClassFees({
                                classId: adminBulkFee.classId,
                                title: adminBulkFee.title.trim(),
                                category: adminBulkFee.category,
                                billingMonth: adminBulkFee.billingMonth.trim(),
                                amount: Math.max(0, Number(adminBulkFee.amount) || 0),
                                dueDate: adminBulkFee.dueDate,
                              });
                              notifyAdmin(lang === 'bn' ? `${count} জন শিক্ষার্থীর জন্য ফি যুক্ত হয়েছে!` : `Created ${count} class invoices!`);
                            }}
                            className="space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <select value={adminBulkFee.classId} onChange={(e) => setAdminBulkFee((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                                {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                              </select>
                              <select value={adminBulkFee.category} onChange={(e) => setAdminBulkFee((p) => ({ ...p, category: e.target.value as FeeCategory }))} className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                                {['Tuition', 'Exam', 'Admission', 'Library', 'Lab', 'Sports', 'Other'].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                            </div>
                            <input required value={adminBulkFee.title} onChange={(e) => setAdminBulkFee((p) => ({ ...p, title: e.target.value }))} placeholder="Fee Title" className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                            <input value={adminBulkFee.billingMonth} onChange={(e) => setAdminBulkFee((p) => ({ ...p, billingMonth: e.target.value }))} placeholder="Billing Month / Term" className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                            <div className="grid grid-cols-2 gap-2">
                              <input type="number" min={0} max={500000} required value={adminBulkFee.amount} onChange={(e) => setAdminBulkFee((p) => ({ ...p, amount: Number(e.target.value) || 0 }))} placeholder="Amount" className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums" />
                              <input type="date" required value={adminBulkFee.dueDate} onChange={(e) => setAdminBulkFee((p) => ({ ...p, dueDate: e.target.value }))} className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                            </div>
                            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                              {lang === 'bn' ? 'শ্রেণীভিত্তিক ইনভয়েস তৈরি' : 'Generate Class Invoices'}
                            </button>
                          </form>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const st = students.find((s) => s.id === adminSingleFee.studentId) || students[0];
                              if (!st) return;
                              addFeeRecord({
                                id: `fee-${Date.now()}`,
                                studentId: st.id,
                                studentName: st.name,
                                classId: st.classId,
                                roll: st.roll,
                                title: adminSingleFee.title.trim(),
                                category: adminSingleFee.category,
                                billingMonth: adminSingleFee.billingMonth.trim(),
                                amount: Math.max(0, Number(adminSingleFee.amount) || 0),
                                paidAmount: 0,
                                dueDate: adminSingleFee.dueDate,
                                status: 'pending',
                                recordedBy: user.name,
                              });
                              notifyAdmin(lang === 'bn' ? 'শিক্ষার্থীর ফি যুক্ত হয়েছে!' : 'Individual fee invoice created!');
                            }}
                            className="space-y-3"
                          >
                            <select value={adminSingleFee.studentId || students[0]?.id || ''} onChange={(e) => setAdminSingleFee((p) => ({ ...p, studentId: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                              {students.map((st) => (
                                <option key={st.id} value={st.id}>Class {st.classId} · #{st.roll} {st.name}</option>
                              ))}
                            </select>
                            <select value={adminSingleFee.category} onChange={(e) => setAdminSingleFee((p) => ({ ...p, category: e.target.value as FeeCategory }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                              {['Tuition', 'Exam', 'Admission', 'Library', 'Lab', 'Sports', 'Other'].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <input required value={adminSingleFee.title} onChange={(e) => setAdminSingleFee((p) => ({ ...p, title: e.target.value }))} placeholder="Fee Title" className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                            <div className="grid grid-cols-2 gap-2">
                              <input type="number" min={0} max={500000} required value={adminSingleFee.amount} onChange={(e) => setAdminSingleFee((p) => ({ ...p, amount: Number(e.target.value) || 0 }))} placeholder="Amount" className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums" />
                              <input type="date" required value={adminSingleFee.dueDate} onChange={(e) => setAdminSingleFee((p) => ({ ...p, dueDate: e.target.value }))} className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                            </div>
                            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                              {lang === 'bn' ? 'একক ইনভয়েস যুক্ত' : 'Create Individual Invoice'}
                            </button>
                          </form>
                        )}
                      </div>

                      <div className="lg:col-span-8 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-2">
                            <select value={adminFeeClassFilter} onChange={(e) => setAdminFeeClassFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                              <option value="all">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>
                              {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                            <select value={adminFeeStatusFilter} onChange={(e) => setAdminFeeStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                              <option value="all">{lang === 'bn' ? 'সব অবস্থা' : 'All Status'}</option>
                              <option value="pending">Pending</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                              <option value="waived">Waived</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              exportCsv(
                                `fee_ledger_${todayStr}`,
                                ['ID', 'Class', 'Roll', 'Student Name', 'Title', 'Category', 'Amount', 'Paid', 'Status', 'Method', 'Receipt No', 'Due Date'],
                                filteredAdminFees.map((f) => [f.id, f.classId, f.roll, f.studentName, f.title, f.category, f.amount, f.paidAmount, f.status, f.paymentMethod || '', f.receiptNo || '', f.dueDate])
                              )
                            }
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Export CSV
                          </button>
                        </div>

                        {filteredAdminFees.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-8">No fee records found for the selected filter.</p>
                        ) : (
                          filteredAdminFees.map((f) => {
                            const method = adminPayMethods[f.id] || 'Cash';
                            const amtInput = adminPayAmounts[f.id] ?? String(f.amount);
                            return (
                              <div key={f.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                  <div>
                                    <p className="text-slate-500 dark:text-slate-400 tabular-nums">
                                      Class {f.classId} · Roll #{f.roll} · {f.category} · Due {f.dueDate}
                                    </p>
                                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">{f.studentName} — {f.title}</p>
                                  </div>
                                  <div className="text-right tabular-nums">
                                    <p className="font-black text-sm">৳{f.paidAmount.toLocaleString()} / ৳{f.amount.toLocaleString()}</p>
                                    <p className={`font-extrabold uppercase ${f.status === 'paid' ? 'text-emerald-700 dark:text-emerald-400' : f.status === 'waived' ? 'text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                      {f.status} {f.receiptNo ? `· ${f.receiptNo}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                  {f.status !== 'paid' && f.status !== 'waived' && (
                                    <>
                                      <input
                                        type="number"
                                        min={0}
                                        max={f.amount}
                                        value={amtInput}
                                        onChange={(e) => setAdminPayAmounts((p) => ({ ...p, [f.id]: e.target.value }))}
                                        className="w-24 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold tabular-nums"
                                      />
                                      <select
                                        value={method}
                                        onChange={(e) => setAdminPayMethods((p) => ({ ...p, [f.id]: e.target.value as PaymentMethod }))}
                                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                                      >
                                        <option value="Cash">Cash</option>
                                        <option value="bKash">bKash</option>
                                        <option value="Nagad">Nagad</option>
                                        <option value="Bank">Bank</option>
                                        <option value="Online">Online</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateFeePayment(f.id, Number(amtInput) || f.amount, method);
                                          notifyAdmin(lang === 'bn' ? 'পেমেন্ট সেভ ও রশিদ তৈরি হয়েছে!' : 'Payment recorded!');
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold"
                                      >
                                        {lang === 'bn' ? 'জমা নিন' : 'Record Paid'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          markFeeWaived(f.id);
                                          notifyAdmin(lang === 'bn' ? 'ফি মওকুফ করা হয়েছে।' : 'Marked as waived.');
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                                      >
                                        {lang === 'bn' ? 'মওকুফ' : 'Waive'}
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setActiveAdminReceipt(f)}
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-emerald-700 hover:text-white font-bold inline-flex items-center gap-1 ml-auto"
                                  >
                                    <Receipt className="w-3.5 h-3.5" /> {lang === 'bn' ? 'রশিদ প্রিন্ট' : 'Voucher'}
                                  </button>
                                  <button type="button" onClick={() => deleteFeeRecord(f.id)} className="p-1.5 text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {managementTab === 'broadcasts' && (
                  <div className="grid lg:grid-cols-12 gap-6">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!adminBroadcast.title.trim() || !adminBroadcast.message.trim()) return;
                        await addPortalNotification({
                          id: `pn-${Date.now()}`,
                          title: adminBroadcast.title.trim(),
                          message: adminBroadcast.message.trim(),
                          targetRole: adminBroadcast.targetRole,
                          classId: adminBroadcast.classId,
                          priority: adminBroadcast.priority,
                          senderName: user.name,
                          createdDate: todayStr,
                        });
                        setAdminBroadcast((p) => ({ ...p, title: '', message: '' }));
                        notifyAdmin(lang === 'bn' ? 'টার্গেটেড পোর্টাল ঘোষণা পাঠানো হয়েছে!' : 'Targeted portal broadcast sent!');
                      }}
                      className="lg:col-span-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 h-fit"
                    >
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <h4 className="font-extrabold text-sm">{lang === 'bn' ? 'টার্গেটেড পোর্টাল ঘোষণা পাঠান' : 'Send Targeted Portal Broadcast'}</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <select value={adminBroadcast.targetRole} onChange={(e) => setAdminBroadcast((p) => ({ ...p, targetRole: e.target.value as 'all' | 'student' | 'parent' | 'teacher' }))} className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <option value="all">{lang === 'bn' ? 'সব পোর্টাল' : 'All Portals'}</option>
                          <option value="student">{lang === 'bn' ? 'শিক্ষার্থী' : 'Students'}</option>
                          <option value="parent">{lang === 'bn' ? 'অভিভাবক' : 'Parents'}</option>
                          <option value="teacher">{lang === 'bn' ? 'শিক্ষক' : 'Teachers'}</option>
                        </select>
                        <select value={adminBroadcast.classId} onChange={(e) => setAdminBroadcast((p) => ({ ...p, classId: e.target.value }))} className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <option value="all">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>
                          {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                        </select>
                        <select value={adminBroadcast.priority} onChange={(e) => setAdminBroadcast((p) => ({ ...p, priority: e.target.value as 'normal' | 'urgent' }))} className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <option value="normal">Normal</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <input required value={adminBroadcast.title} onChange={(e) => setAdminBroadcast((p) => ({ ...p, title: e.target.value }))} placeholder={lang === 'bn' ? 'ঘোষণার শিরোনাম' : 'Broadcast Title'} className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                      <textarea required rows={3} value={adminBroadcast.message} onChange={(e) => setAdminBroadcast((p) => ({ ...p, message: e.target.value }))} placeholder={lang === 'bn' ? 'বিস্তারিত বার্তা লিখুন...' : 'Broadcast message...'} className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm" />
                      <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                        {lang === 'bn' ? 'ঘোষণা পাঠান' : 'Send Portal Broadcast'}
                      </button>
                    </form>

                    <div className="lg:col-span-7 space-y-2.5">
                      {portalNotifications.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No portal broadcasts published yet.</p>
                      ) : portalNotifications.map((pn) => (
                        <div key={pn.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <p className={`font-extrabold uppercase tabular-nums ${pn.priority === 'urgent' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                              {pn.targetRole} · Class {pn.classId || 'all'} · {pn.priority} · {pn.createdDate}
                            </p>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{pn.title}</p>
                            <p className="text-slate-600 dark:text-slate-300">{pn.message}</p>
                            <p className="text-[11px] text-slate-400">By {pn.senderName}</p>
                          </div>
                          <button type="button" onClick={() => deletePortalNotification(pn.id)} className="p-1.5 text-red-500 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {managementTab === 'class-routine' && activeAdminRoutine && (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <h4 className="font-extrabold text-base">
                          {lang === 'bn' ? 'সাপ্তাহিক ক্লাস রুটিন CMS' : 'Dynamic Weekly Class Routine CMS'}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={routineClassId}
                          onChange={(e) => {
                            setRoutineClassId(e.target.value as '6' | '7' | '8' | '9' | '10');
                            setRoutineDayIdx(0);
                          }}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        >
                          {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                        </select>
                        <select
                          value={routineDayIdx}
                          onChange={(e) => setRoutineDayIdx(Number(e.target.value))}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        >
                          {activeAdminRoutine.schedule.map((d, idx) => (
                            <option key={idx} value={idx}>{t(d.day)}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            resetClassRoutines();
                            notifyAdmin(lang === 'bn' ? 'সকল শ্রেণীর রুটিন ডিফল্টে রিসেট হয়েছে।' : 'All class routines reset to defaults.');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {lang === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Default Timetables'}
                        </button>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!periodDraft.subjectEn.trim() && !periodDraft.subjectBn.trim()) return;
                        const nextSchedule = activeAdminRoutine.schedule.map((d, idx) =>
                          idx === routineDayIdx
                            ? {
                                ...d,
                                periods: [
                                  ...d.periods,
                                  {
                                    time: periodDraft.time.trim() || '01:45 PM',
                                    subject: {
                                      bn: periodDraft.subjectBn.trim() || periodDraft.subjectEn.trim(),
                                      en: periodDraft.subjectEn.trim() || periodDraft.subjectBn.trim(),
                                    },
                                    teacher: {
                                      bn: periodDraft.teacherBn.trim() || periodDraft.teacherEn.trim() || 'শিক্ষক',
                                      en: periodDraft.teacherEn.trim() || periodDraft.teacherBn.trim() || 'Teacher',
                                    },
                                  },
                                ],
                              }
                            : d
                        );
                        saveClassRoutine({ ...activeAdminRoutine, schedule: nextSchedule });
                        setPeriodDraft((p) => ({ ...p, subjectBn: '', subjectEn: '', teacherBn: '', teacherEn: '' }));
                        notifyAdmin(lang === 'bn' ? 'নতুন ক্লাস পিরিয়ড যুক্ত ও প্রকাশিত হয়েছে!' : 'Class period saved to live timetable!');
                      }}
                      className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                    >
                      <input required value={periodDraft.time} onChange={(e) => setPeriodDraft((p) => ({ ...p, time: e.target.value }))} placeholder="Time (e.g. 01:45 PM)" className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums" />
                      <input required value={periodDraft.subjectEn} onChange={(e) => setPeriodDraft((p) => ({ ...p, subjectEn: e.target.value }))} placeholder="Subject (EN)" className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" />
                      <input value={periodDraft.subjectBn} onChange={(e) => setPeriodDraft((p) => ({ ...p, subjectBn: e.target.value }))} placeholder="বিষয় (বাংলা)" className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" />
                      <input value={periodDraft.teacherEn} onChange={(e) => setPeriodDraft((p) => ({ ...p, teacherEn: e.target.value, teacherBn: e.target.value }))} placeholder="Teacher Name" className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" />
                      <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1">
                        <PlusCircle className="w-3.5 h-3.5" /> {lang === 'bn' ? 'পিরিয়ড যোগ' : 'Add Period'}
                      </button>
                    </form>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(activeAdminRoutine.schedule[routineDayIdx]?.periods || []).map((pr, pIdx) => (
                        <div key={pIdx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{pr.time}</p>
                            <p className="font-extrabold truncate">{t(pr.subject)}</p>
                            <p className="text-slate-500 truncate">{t(pr.teacher)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const nextSchedule = activeAdminRoutine.schedule.map((d, idx) =>
                                idx === routineDayIdx ? { ...d, periods: d.periods.filter((_, i) => i !== pIdx) } : d
                              );
                              saveClassRoutine({ ...activeAdminRoutine, schedule: nextSchedule });
                              notifyAdmin(lang === 'bn' ? 'পিরিয়ড মুছে ফেলা হয়েছে।' : 'Period removed from schedule.');
                            }}
                            className="text-red-500 p-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  <div className="space-y-4">
                    {teachers.length > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                        <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          {lang === 'bn'
                            ? `মোট ${teachers.length} জন শিক্ষকের অফিশিয়াল আইডি কার্ড স্বয়ংক্রিয়ভাবে প্রস্তুত`
                            : `${teachers.length} Faculty ID Cards automatically ready for view & batch print`}
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdminTeacherCard({ teacher: teachers[0], index: 0 })}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <IdCard className="w-4 h-4" />
                          {lang === 'bn'
                            ? `সব শিক্ষকের আইডি কার্ড (${teachers.length})`
                            : `All Teachers ID Cards (${teachers.length})`}
                        </button>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teachers.map((tc, idx) => (
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
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setAdminTeacherCard({ teacher: tc, index: idx })}
                              title={lang === 'bn' ? 'শিক্ষক আইডি কার্ড' : 'Teacher ID Card'}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <IdCard className="w-3.5 h-3.5" /> ID
                            </button>
                            <button onClick={() => openEditModal(tc)} className="p-1.5 text-blue-600"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => deleteTeacher(tc.id)} className="p-1.5 text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 tabular-nums">
                        {auditLogs.length} {lang === 'bn' ? 'টি অডিট রেকর্ড' : 'audit records'}
                      </p>
                      {auditLogs.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            exportCsv(
                              `audit_logs_${todayStr}`,
                              ['Date', 'Action', 'Actor', 'Email', 'Role', 'Target Collection', 'Target ID', 'Summary'],
                              auditLogs.map((l) => [l.createdDate, l.action, l.actorName, l.actorEmail, l.actorRole, l.targetCollection, l.targetId, l.summary])
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {lang === 'bn' ? 'অডিট লগ CSV' : 'Export CSV'}
                        </button>
                      )}
                    </div>
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
                                <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap tabular-nums">{log.createdDate}</td>
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

                {managementTab === 'cards' && (() => {
                  const getStudentDue = (st: SchoolStudent) =>
                    feeRecords
                      .filter((f) => f.classId === st.classId && f.roll.trim() === st.roll.trim())
                      .reduce((sum, f) => (f.status === 'waived' ? sum : sum + Math.max(0, f.amount - f.paidAmount)), 0);

                  const filteredCardStudents = students.filter(
                    (st) =>
                      (cardClassFilter === 'all' || st.classId === cardClassFilter) &&
                      (!cardSearch.trim() ||
                        st.name.toLowerCase().includes(cardSearch.trim().toLowerCase()) ||
                        st.roll.toLowerCase().includes(cardSearch.trim().toLowerCase()))
                  );

                  const handleApproveAllPaid = () => {
                    let approvedCount = 0;
                    let unpaidSkipped = 0;
                    filteredCardStudents.forEach((st) => {
                      const due = getStudentDue(st);
                      if (due > 0) {
                        unpaidSkipped += 1;
                      } else if (!st.admitCardApproved) {
                        approvedCount += 1;
                        updateStudent({
                          ...st,
                          admitCardApproved: true,
                          admitCardTerm: adminAdmitTerm,
                          admitCardApprovedAt: todayStr,
                        });
                      }
                    });
                    notifyAdmin(
                      lang === 'bn'
                        ? `${approvedCount} জন পরিশোধিত শিক্ষার্থীর অ্যাডমিট কার্ড অনুমোদন হয়েছে (বকেয়া থাকায় ${unpaidSkipped} জন স্থগিত)।`
                        : `Approved ${approvedCount} paid students (${unpaidSkipped} unpaid skipped).`
                    );
                  };

                  const handleRevokeAllAdmit = () => {
                    let revokedCount = 0;
                    filteredCardStudents.forEach((st) => {
                      if (st.admitCardApproved) {
                        revokedCount += 1;
                        updateStudent({
                          ...st,
                          admitCardApproved: false,
                        });
                      }
                    });
                    notifyAdmin(
                      lang === 'bn'
                        ? `${revokedCount} জন শিক্ষার্থীর অ্যাডমিট কার্ড অনুমোদন প্রত্যাহার করা হয়েছে।`
                        : `Revoked Admit Card approval for ${revokedCount} students.`
                    );
                  };

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <select
                              value={cardClassFilter}
                              onChange={(e) => setCardClassFilter(e.target.value)}
                              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                            >
                              <option value="all">{lang === 'bn' ? 'সকল শ্রেণী (৬ষ্ঠ–১০ম)' : 'All Classes (6–10)'}</option>
                              {['6', '7', '8', '9', '10'].map((c) => (
                                <option key={c} value={c}>Class {c}</option>
                              ))}
                            </select>
                            <input
                              value={cardSearch}
                              onChange={(e) => setCardSearch(e.target.value)}
                              placeholder={lang === 'bn' ? 'নাম বা রোল দিয়ে খুঁজুন...' : 'Search by name or roll...'}
                              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold min-w-[200px]"
                            />
                            <select
                              value={adminAdmitTerm}
                              onChange={(e) => setAdminAdmitTerm(e.target.value)}
                              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                            >
                              {EXAM_TERMS.map((term) => (
                                <option key={term.id} value={term.id}>{lang === 'bn' ? term.bn : term.en}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {teachers.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setAdminTeacherCard({ teacher: teachers[0], index: 0 })}
                                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                <IdCard className="w-3.5 h-3.5" />
                                {lang === 'bn' ? `শিক্ষক আইডি কার্ড (${teachers.length})` : `Teacher ID Cards (${teachers.length})`}
                              </button>
                            )}
                            {filteredCardStudents.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminCardMode('admit');
                                  setAdminCardStudent(filteredCardStudents[0]);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                {lang === 'bn' ? `ব্যাচ প্রিভিউ (${filteredCardStudents.length})` : `Batch Preview (${filteredCardStudents.length})`}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-semibold">
                            {lang === 'bn'
                              ? 'শুধুমাত্র সম্পূর্ণ ফি পরিশোধিত শিক্ষার্থীর অ্যাডমিট কার্ড অনুমোদন করা যাবে।'
                              : 'Admit Cards can only be approved for students with zero due balance.'}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleApproveAllPaid}
                              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold inline-flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {lang === 'bn' ? 'সব পরিশোধিত অ্যাডমিট অনুমোদন' : 'Approve All Paid'}
                            </button>
                            <button
                              type="button"
                              onClick={handleRevokeAllAdmit}
                              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold inline-flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              {lang === 'bn' ? 'অনুমোদন প্রত্যাহার' : 'Revoke All'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                        {filteredCardStudents.map((st) => {
                          const due = getStudentDue(st);
                          const isPaid = due <= 0;
                          const isApproved = Boolean(st.admitCardApproved);
                          return (
                            <div key={st.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                                    #{st.roll} · {st.name}
                                  </p>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                      isPaid
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                    }`}
                                  >
                                    {isPaid
                                      ? lang === 'bn' ? 'ফি পরিশোধিত' : 'Fees Paid'
                                      : lang === 'bn' ? `বকেয়া ৳${due.toLocaleString()}` : `Due ৳${due.toLocaleString()}`}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                      isApproved && isPaid
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    }`}
                                  >
                                    {isApproved && isPaid
                                      ? lang === 'bn' ? 'অ্যাডমিট অনুমোদিত' : 'Admit Approved'
                                      : !isPaid
                                      ? lang === 'bn' ? 'বকেয়া লক' : 'Payment Locked'
                                      : lang === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'}
                                  </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-semibold tabular-nums">
                                  Class {st.classId} · Section {st.section} · Mobile: {st.guardianMobile}
                                  {st.guardianName ? ` · Guardian: ${st.guardianName}` : ''}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isApproved && !isPaid) {
                                      notifyAdmin(
                                        lang === 'bn'
                                          ? `${st.name}-এর ৳${due.toLocaleString()} ফি বকেয়া থাকায় অ্যাডমিট অনুমোদন করা যাবে না।`
                                          : `Cannot approve ${st.name}: ৳${due.toLocaleString()} fee due remains.`
                                      );
                                      return;
                                    }
                                    updateStudent({
                                      ...st,
                                      admitCardApproved: !isApproved,
                                      admitCardTerm: adminAdmitTerm,
                                      admitCardApprovedAt: todayStr,
                                    });
                                    notifyAdmin(
                                      !isApproved
                                        ? lang === 'bn'
                                          ? `${st.name}-এর অ্যাডমিট কার্ড অনুমোদন হয়েছে!`
                                          : `Admit Card approved for ${st.name}!`
                                        : lang === 'bn'
                                        ? `${st.name}-এর অ্যাডমিট কার্ড অনুমোদন প্রত্যাহার হয়েছে।`
                                        : `Admit Card revoked for ${st.name}.`
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-lg font-extrabold inline-flex items-center gap-1 ${
                                    isApproved && isPaid
                                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                      : isPaid
                                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {isApproved && isPaid ? (
                                    <>{lang === 'bn' ? 'প্রত্যাহার' : 'Revoke'}</>
                                  ) : (
                                    <>{lang === 'bn' ? 'অ্যাডমিট অনুমোদন' : 'Approve Admit'}</>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminCardMode('admit');
                                    setAdminCardStudent(st);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold inline-flex items-center gap-1"
                                >
                                  <ClipboardList className="w-3.5 h-3.5 text-emerald-700" /> Admit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminCardMode('reg');
                                    setAdminCardStudent(st);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold inline-flex items-center gap-1"
                                >
                                  <FileBadge2 className="w-3.5 h-3.5 text-emerald-700" /> Reg
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminCardMode('id');
                                    setAdminCardStudent(st);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold inline-flex items-center gap-1"
                                >
                                  <IdCard className="w-3.5 h-3.5 text-emerald-700" /> ID
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

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

                    <div className="flex flex-wrap items-center gap-3">
                      <button type="submit" className="px-6 py-3 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Settings
                      </button>
                      {showSaveSuccess && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved!</span>}
                      {(settingsError || lastSyncError) && (
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          {settingsError || lastSyncError}
                        </span>
                      )}
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

        <FeeReceiptModal fee={activeAdminReceipt} onClose={() => setActiveAdminReceipt(null)} />
        {adminCardStudent && (
          <StudentIdAdmitCard
            open={Boolean(adminCardStudent)}
            onClose={() => setAdminCardStudent(null)}
            studentName={adminCardStudent.name}
            classId={adminCardStudent.classId}
            roll={adminCardStudent.roll}
            section={adminCardStudent.section}
            guardianMobile={adminCardStudent.guardianMobile}
            guardianName={adminCardStudent.guardianName}
            photoUrl={adminCardStudent.photo}
            registrationDate={adminCardStudent.registrationDate}
            session={adminCardStudent.session}
            cardIssueDate={adminCardStudent.cardIssueDate}
            cardValidUpto={adminCardStudent.cardValidUpto}
            initialMode={adminCardMode}
            rosterStudents={students.filter(
              (s) => cardClassFilter === 'all' || s.classId === cardClassFilter
            )}
            onSaveStudentDetails={(updates) => {
              const target =
                students.find((s) => s.classId === updates.classId && s.roll === updates.roll) ||
                adminCardStudent;
              updateStudent({
                ...target,
                guardianName: updates.guardianName ?? target.guardianName,
                guardianMobile: updates.guardianMobile ?? target.guardianMobile,
                photo: updates.photo ?? target.photo,
                registrationDate: updates.registrationDate ?? target.registrationDate,
                session: updates.session ?? target.session,
                cardIssueDate: updates.cardIssueDate ?? target.cardIssueDate,
                cardValidUpto: updates.cardValidUpto ?? target.cardValidUpto,
              });
              notifyAdmin(lang === 'bn' ? 'শিক্ষার্থীর কার্ডের তথ্য সেভ হয়েছে!' : 'Student card details saved!');
            }}
          />
        )}
        {adminTeacherCard && (
          <TeacherIdCardModal
            open={Boolean(adminTeacherCard)}
            onClose={() => setAdminTeacherCard(null)}
            teacher={adminTeacherCard.teacher}
            teacherIndex={adminTeacherCard.index}
            allTeachers={teachers}
            onSaveProfile={(updates) => {
              const target = teachers.find((tc) => tc.id === updates.id);
              if (target) {
                updateTeacher({
                  ...target,
                  teacherCode: updates.teacherCode,
                  phone: updates.phone,
                  bloodGroup: updates.bloodGroup,
                  cardIssueDate: updates.issueDate,
                  cardValidUpto: updates.validUpto,
                  photo: updates.photo ?? target.photo,
                });
                notifyAdmin(lang === 'bn' ? 'শিক্ষকের আইডি কার্ডের তথ্য সেভ হয়েছে!' : 'Teacher ID Card details saved!');
              }
            }}
            onSavePhoto={(teacherId, photoDataUrl) => {
              const target = teachers.find((tc) => tc.id === teacherId);
              if (target) {
                updateTeacher({ ...target, photo: photoDataUrl });
                notifyAdmin(lang === 'bn' ? 'শিক্ষকের ছবি সেভ হয়েছে!' : 'Teacher photo saved!');
              }
            }}
          />
        )}
      </div>
    );
  }

  const isAdminLoginRoute = location.pathname.toLowerCase().includes('/login/admin');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <div className={`inline-flex p-3.5 rounded-2xl text-white shadow-lg mb-3 ${isAdminLoginRoute ? 'bg-slate-900 dark:bg-slate-700' : 'bg-emerald-700'}`}>
            {isAdminLoginRoute ? <ShieldAlert className="w-8 h-8" /> : <GraduationCap className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAdminLoginRoute
              ? lang === 'bn'
                ? 'অ্যাডমিন প্যানেল লগইন'
                : 'Admin Panel Login'
              : lang === 'bn'
              ? 'পোর্টাল লগইন'
              : 'School Portal Login'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdminLoginRoute
              ? lang === 'bn'
                ? 'অনুমোদিত অ্যাডমিনিস্ট্রেটর অ্যাকাউন্ট দিয়ে প্রবেশ করুন'
                : 'Authorized school administrator access only'
              : lang === 'bn'
              ? 'শিক্ষার্থী, অভিভাবক বা শিক্ষক পোর্টাল নির্বাচন করে প্রবেশ করুন'
              : 'Choose Student, Parent, or Teacher portal to sign in'}
          </p>
        </div>

        {/* 3 Portal Tabs: Student, Parent, Teacher (Admin hidden from portals) */}
        {!isAdminLoginRoute && (
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 mx-6 rounded-2xl">
            {(['student', 'parent', 'teacher'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setActiveTab(role);
                  setError('');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === role
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                {role === 'student'
                  ? t(TRANSLATIONS.login.studentTab)
                  : role === 'parent'
                  ? t(TRANSLATIONS.login.parentTab)
                  : t(TRANSLATIONS.login.teacherTab)}
              </button>
            ))}
          </div>
        )}

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

          {isAdminLoginRoute && (
            <>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                    {lang === 'bn' ? 'Gmail দিয়ে ১-ক্লিক অ্যাডমিন লগইন' : '1-Click Admin Sign-In with Gmail'}
                  </p>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/90 leading-relaxed">
                    {lang === 'bn'
                      ? 'অনুমোদিত অ্যাডমিন Gmail (mdjahidulislam1025@gmail.com) দিয়ে পাসওয়ার্ড ছাড়াই সরাসরি প্রবেশ করুন:'
                      : 'Sign in directly with your authorized Admin Gmail (mdjahidulislam1025@gmail.com):'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleGoogleAuth}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSubmitting
                    ? lang === 'bn'
                      ? 'লগইন হচ্ছে...'
                      : 'Signing in...'
                    : lang === 'bn'
                    ? 'Google (Gmail) দিয়ে অ্যাডমিন লগইন করুন'
                    : 'Continue with Google (Admin Gmail)'}
                </button>
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'bn' ? 'অথবা ইমেইল ও পাসওয়ার্ড' : 'Or Email & Password'}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500">
              {isAdminLoginRoute
                ? lang === 'bn'
                  ? 'অ্যাডমিন ইমেইল'
                  : 'Admin Email'
                : activeTab === 'student'
                ? lang === 'bn'
                  ? 'রেজিস্ট্রেশন নম্বর (অথবা ইউজার আইডি)'
                  : 'Registration Number (or User ID)'
                : activeTab === 'teacher'
                ? lang === 'bn'
                  ? 'শিক্ষক আইডি, মোবাইল অথবা ইমেইল'
                  : 'Teacher Code, Mobile or Email'
                : lang === 'bn'
                ? 'মোবাইল নম্বর অথবা ইমেইল'
                : 'Mobile Number or Email'}
            </label>
            <div className="relative mt-1">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={
                  isAdminLoginRoute
                    ? 'mdjahidulislam1025@gmail.com'
                    : activeTab === 'student'
                    ? 'RBMB-REG-2026-0901'
                    : activeTab === 'teacher'
                    ? 'RBMB-TCH-2026-001 or 01711...'
                    : '01712-667788 or name@email.com'
                }
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

          {!isAdminLoginRoute && (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleAuth}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {lang === 'bn' ? 'Google দিয়ে ক্লাউড লগইন' : 'Continue with Google Cloud'}
              </button>

              {/* Non-admin Preview Helpers */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-[10px] font-bold uppercase text-center text-slate-400">
                  {lang === 'bn' ? 'ডেমো পোর্টাল আইডি প্রিভিউ' : 'Demo Portal Preview'}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['student', 'parent', 'teacher'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleQuickLogin(r)}
                      className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-[10px] font-extrabold capitalize text-slate-700 dark:text-slate-300"
                    >
                      {r === 'student'
                        ? lang === 'bn'
                          ? 'শিক্ষার্থী (Reg)'
                          : 'Student'
                        : r === 'parent'
                        ? lang === 'bn'
                          ? 'অভিভাবক'
                          : 'Parent'
                        : lang === 'bn'
                        ? 'শিক্ষক'
                        : 'Teacher'}
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
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
