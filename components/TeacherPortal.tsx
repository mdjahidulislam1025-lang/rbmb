import * as React from 'react';
import {
  ClipboardCheck,
  BookOpenCheck,
  Award,
  Bell,
  School,
  CalendarPlus,
  UserCheck,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Save,
  Search,
  Cloud,
  CloudOff,
  Check,
  X,
  BookOpen,
  Trophy,
  MessageSquare,
  Send,
  Receipt,
  Download,
  Megaphone,
  IdCard,
  ClipboardList,
  FileBadge2,
  Camera,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useApp } from '../App';
import { CLASSES, CLASS_SUBJECTS, EXAM_TERMS } from '../constants';
import {
  AttendanceStatus,
  ExamMark,
  FeeCategory,
  FeeRecord,
  HomeworkItem,
  LibraryCategory,
  ExamQuestion,
  PaymentMethod,
  SchoolStudent,
} from '../types';
import { calculateGrade, isSafeHttpUrl } from '../utils/security';
import { exportCsv } from '../utils/exportUtils';
import { compressImageFile } from '../utils/imageUtils';
import { FeeReceiptModal } from './FeeReceiptModal';
import { StudentIdAdmitCard, CardMode } from './StudentIdAdmitCard';
import { StudentCertificateModal } from './StudentCertificateModal';

const { useState, useEffect, useMemo } = React;

type TeacherTab =
  | 'attendance'
  | 'homework'
  | 'marks'
  | 'fees'
  | 'notices'
  | 'materials'
  | 'classes'
  | 'online-exams'
  | 'parent-messages'
  | 'my-leave'
  | 'student-leaves';

export const TeacherPortal: React.FC = () => {
  const {
    lang,
    t,
    user,
    isCloudTeacher,
    signInWithGoogle,
    notices,
    addNotice,
    ebooks,
    addEbook,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    attendanceRecords,
    saveAttendance,
    homeworkList,
    addHomework,
    updateHomework,
    deleteHomework,
    assignmentSubmissions,
    gradeAssignmentSubmission,
    examMarks,
    saveExamMarksBulk,
    deleteExamMark,
    onlineExams,
    addOnlineExam,
    deleteOnlineExam,
    examRoutines,
    addExamRoutine,
    deleteExamRoutine,
    parentMessages,
    replyParentMessage,
    parentLinks,
    reviewParentStudentLink,
    teacherLeaves,
    submitTeacherLeave,
    deleteTeacherLeave,
    studentLeaves,
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
    classRoutines,
    saveClassRoutine,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TeacherTab>('attendance');
  const [toast, setToast] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<FeeRecord | null>(null);
  const [idCardStudent, setIdCardStudent] = useState<SchoolStudent | null>(null);
  const [idCardMode, setIdCardMode] = useState<CardMode>('admit');
  const [certStudent, setCertStudent] = useState<SchoolStudent | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const openStudentCard = (st: SchoolStudent, mode: CardMode) => {
    setIdCardMode(mode);
    setIdCardStudent(st);
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // --- 1. Attendance ---
  const [attClassId, setAttClassId] = useState<string>('9');
  const [attDate, setAttDate] = useState<string>(todayStr);
  const [attDraft, setAttDraft] = useState<Record<string, AttendanceStatus>>({});

  const attClassStudents = useMemo(
    () => students.filter((s) => s.classId === attClassId).sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true })),
    [students, attClassId]
  );

  useEffect(() => {
    const existingId = `${attDate}_${attClassId}`;
    const existing = attendanceRecords.find((r) => r.id === existingId);
    if (existing) {
      setAttDraft({ ...existing.records });
    } else {
      const initial: Record<string, AttendanceStatus> = {};
      attClassStudents.forEach((s) => {
        initial[s.id] = 'present';
      });
      setAttDraft(initial);
    }
  }, [attDate, attClassId, attendanceRecords, attClassStudents]);

  const handleSaveAttendance = () => {
    saveAttendance({
      id: `${attDate}_${attClassId}`,
      date: attDate,
      classId: attClassId,
      teacherName: user?.name || 'Teacher',
      records: attDraft,
      isPublished: true,
    });
    notify(lang === 'bn' ? 'হাজিরা সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Attendance saved successfully!');
  };

  // --- 2. Homework & Grading Submissions ---
  const [hwFilterClass, setHwFilterClass] = useState<string>('all');
  const [hwEditing, setHwEditing] = useState<HomeworkItem | null>(null);
  const [hwForm, setHwForm] = useState({
    classId: '9',
    subject: CLASS_SUBJECTS['9'][0],
    title: '',
    description: '',
    dueDate: todayStr,
  });
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, { marks: string; feedback: string }>>({});

  const handleHwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwForm.title.trim() || !hwForm.description.trim()) return;
    if (hwEditing) {
      updateHomework({
        ...hwEditing,
        ...hwForm,
        title: hwForm.title.trim(),
        description: hwForm.description.trim(),
        assignedBy: user?.name || 'Teacher',
      });
      setHwEditing(null);
      notify(lang === 'bn' ? 'হোমওয়ার্ক আপডেট হয়েছে!' : 'Homework updated!');
    } else {
      addHomework({
        id: `hw-${Date.now()}`,
        ...hwForm,
        title: hwForm.title.trim(),
        description: hwForm.description.trim(),
        assignedBy: user?.name || 'Teacher',
        createdDate: todayStr,
        isPublic: true,
      });
      notify(lang === 'bn' ? 'নতুন হোমওয়ার্ক দেওয়া হয়েছে!' : 'Homework assigned!');
    }
    setHwForm((prev) => ({ ...prev, title: '', description: '' }));
  };

  // --- 3. Exam Marks ---
  const [markClassId, setMarkClassId] = useState<string>('9');
  const [markTerm, setMarkTerm] = useState<string>(EXAM_TERMS[1].id);
  const [markSubject, setMarkSubject] = useState<string>(CLASS_SUBJECTS['9'][0]);
  const [markTotal, setMarkTotal] = useState<number>(100);
  const [marksDraft, setMarksDraft] = useState<Record<string, string>>({});

  const markClassStudents = useMemo(
    () => students.filter((s) => s.classId === markClassId).sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true })),
    [students, markClassId]
  );

  useEffect(() => {
    const subs = CLASS_SUBJECTS[markClassId] || ['Bangla'];
    if (!subs.includes(markSubject)) setMarkSubject(subs[0]);
  }, [markClassId, markSubject]);

  useEffect(() => {
    const draft: Record<string, string> = {};
    markClassStudents.forEach((st) => {
      const existing = examMarks.find(
        (m) => m.classId === markClassId && m.examTerm === markTerm && m.subject === markSubject && m.studentId === st.id
      );
      draft[st.id] = existing ? String(existing.obtainedMarks) : '';
    });
    setMarksDraft(draft);
  }, [markClassId, markTerm, markSubject, examMarks, markClassStudents]);

  const handleSaveMarksBulk = () => {
    const toSave: ExamMark[] = [];
    markClassStudents.forEach((st) => {
      const raw = marksDraft[st.id];
      if (raw !== undefined && raw !== '') {
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) return;
        const safeTotal = Math.max(1, Math.min(1000, markTotal));
        const num = Math.max(0, Math.min(safeTotal, parsed));
        const safeId = `mk_${markTerm.replace(/[^a-zA-Z0-9]/g, '')}_${markClassId}_${markSubject.replace(/[^a-zA-Z0-9]/g, 's')}_${st.id}`.slice(0, 120);
        toSave.push({
          id: safeId,
          examTerm: markTerm,
          classId: markClassId,
          subject: markSubject,
          studentId: st.id,
          studentName: st.name,
          roll: st.roll,
          totalMarks: safeTotal,
          obtainedMarks: num,
          grade: calculateGrade(num, safeTotal).grade,
          enteredBy: user?.name || 'Teacher',
          isPublished: true,
        });
      }
    });
    if (toSave.length === 0) {
      notify(lang === 'bn' ? 'অন্তত একজন শিক্ষার্থীর নম্বর লিখুন!' : 'Enter marks for at least one student.');
      return;
    }
    saveExamMarksBulk(toSave);
    notify(lang === 'bn' ? `${toSave.length} জন শিক্ষার্থীর নম্বর সেভ হয়েছে!` : `Saved marks for ${toSave.length} students!`);
  };

  // --- 4. Notices (View + Publish) ---
  const [noticeSearch, setNoticeSearch] = useState('');
  const [newNotice, setNewNotice] = useState({
    titleBn: '',
    titleEn: '',
    category: 'General' as 'General' | 'Admission' | 'Exam' | 'Holiday',
    descBn: '',
    descEn: '',
  });
  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.titleBn.trim() && !newNotice.titleEn.trim()) return;
    addNotice({
      id: `not-${Date.now()}`,
      title: { bn: newNotice.titleBn.trim() || newNotice.titleEn.trim(), en: newNotice.titleEn.trim() || newNotice.titleBn.trim() },
      date: todayStr,
      category: newNotice.category,
      description: { bn: newNotice.descBn.trim() || newNotice.descEn.trim(), en: newNotice.descEn.trim() || newNotice.descBn.trim() },
      isPublic: true,
    });
    setNewNotice({ titleBn: '', titleEn: '', category: 'General', descBn: '', descEn: '' });
    notify(lang === 'bn' ? 'নতুন নোটিশ প্রকাশিত হয়েছে!' : 'Notice published!');
  };

  // --- 5. Upload Study Material ---
  const [matForm, setMatForm] = useState({
    titleBn: '',
    titleEn: '',
    classId: '9',
    subject: 'Mathematics',
    category: 'Notes' as LibraryCategory,
    descBn: '',
    descEn: '',
    downloadUrl: '#',
  });
  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matForm.titleBn.trim() && !matForm.titleEn.trim()) return;
    if (matForm.downloadUrl !== '#' && !isSafeHttpUrl(matForm.downloadUrl)) {
      notify(lang === 'bn' ? 'বৈধ http/https ডাউনলোড লিংক দিন।' : 'Enter a valid http/https URL.');
      return;
    }
    addEbook({
      id: `eb-${Date.now()}`,
      title: { bn: matForm.titleBn.trim() || matForm.titleEn.trim(), en: matForm.titleEn.trim() || matForm.titleBn.trim() },
      classId: matForm.classId,
      className: { bn: `${matForm.classId}ম শ্রেণী`, en: `Class ${matForm.classId}` },
      subject: matForm.subject.trim(),
      category: matForm.category,
      description: { bn: matForm.descBn.trim(), en: matForm.descEn.trim() },
      coverUrl: '',
      downloadUrl: matForm.downloadUrl.trim() || '#',
      isPublic: true,
    });
    setMatForm((p) => ({ ...p, titleBn: '', titleEn: '', descBn: '', descEn: '', downloadUrl: '#' }));
    notify(lang === 'bn' ? 'স্টাডি ম্যাটেরিয়াল লাইব্রেরিতে যুক্ত হয়েছে!' : 'Study material uploaded to Digital Library!');
  };

  // --- 6. Class & Exam Routine Management ---
  const [manageClassId, setManageClassId] = useState<'6' | '7' | '8' | '9' | '10'>('9');
  const [editingStudent, setEditingStudent] = useState<SchoolStudent | null>(null);
  const [studentForm, setStudentForm] = useState({
    roll: '',
    name: '',
    section: 'A',
    guardianMobile: '',
    guardianName: '',
    photo: '',
    registrationDate: '2026-01-15',
  });
  const [routineForm, setRoutineForm] = useState({
    examTerm: EXAM_TERMS[1].id,
    classId: '9',
    subject: 'Mathematics',
    date: todayStr,
    time: '10:00 AM - 01:00 PM',
    room: 'Room 101',
  });

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.roll.trim() || !studentForm.name.trim()) return;
    if (editingStudent) {
      updateStudent({ ...editingStudent, ...studentForm, classId: manageClassId });
      setEditingStudent(null);
    } else {
      addStudent({ id: `st-${manageClassId}-${Date.now()}`, classId: manageClassId, ...studentForm });
    }
    setStudentForm({
      roll: '',
      name: '',
      section: 'A',
      guardianMobile: '',
      guardianName: '',
      photo: '',
      registrationDate: '2026-01-15',
    });
    notify(lang === 'bn' ? 'শিক্ষার্থীর তথ্য সংরক্ষণ হয়েছে!' : 'Student record saved!');
  };

  // --- 7. Online MCQ Exam Creator ---
  const [mcqForm, setMcqForm] = useState({
    titleBn: '',
    titleEn: '',
    classId: '9',
    subject: 'Mathematics',
    chapter: 'Chapter 1',
    durationMinutes: 10,
    mode: 'exam' as 'exam' | 'practice',
    question: '',
    opt0: '',
    opt1: '',
    opt2: '',
    opt3: '',
    correctIndex: 0,
    explanation: '',
  });
  const [draftMcqQuestions, setDraftMcqQuestions] = useState<ExamQuestion[]>([]);
  const [aiGeneratingMcq, setAiGeneratingMcq] = useState(false);
  const [aiMcqError, setAiMcqError] = useState<string | null>(null);

  const handleGenerateAiMcqs = async () => {
    setAiGeneratingMcq(true);
    setAiMcqError(null);
    try {
      const res = await fetch('/api/ai-study-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate_mcq',
          classId: mcqForm.classId,
          subject: mcqForm.subject.trim() || 'General Science',
          topic: mcqForm.chapter.trim(),
          lang,
          count: 4,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiMcqError(
          data?.error ||
            (lang === 'bn' ? 'AI প্রশ্ন তৈরি করতে ব্যর্থ হয়েছে।' : 'Failed to generate AI MCQ draft.')
        );
        return;
      }
      if (Array.isArray(data?.questions)) {
        setDraftMcqQuestions((prev) => [...prev, ...data.questions]);
        notify(
          lang === 'bn'
            ? `${data.questions.length}টি MCQ প্রশ্ন ড্রাফটে যুক্ত হয়েছে!`
            : `Added ${data.questions.length} AI questions to quiz draft!`
        );
      }
    } catch {
      setAiMcqError(lang === 'bn' ? 'সার্ভারে সংযোগ করা যায়নি।' : 'Could not reach AI generator service.');
    } finally {
      setAiGeneratingMcq(false);
    }
  };

  const handleAddDraftQuestion = () => {
    if (!mcqForm.question.trim()) return;
    setDraftMcqQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question: mcqForm.question.trim(),
        options: [mcqForm.opt0.trim(), mcqForm.opt1.trim(), mcqForm.opt2.trim(), mcqForm.opt3.trim()],
        correctIndex: mcqForm.correctIndex,
        explanation: mcqForm.explanation.trim(),
      },
    ]);
    setMcqForm((p) => ({ ...p, question: '', opt0: '', opt1: '', opt2: '', opt3: '', explanation: '' }));
  };

  const handleCreateMcqExam = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedQuestions: ExamQuestion[] = [...draftMcqQuestions];
    if (mcqForm.question.trim() && mcqForm.opt0.trim() && mcqForm.opt1.trim()) {
      combinedQuestions.push({
        id: `q-${Date.now()}`,
        question: mcqForm.question.trim(),
        options: [mcqForm.opt0.trim(), mcqForm.opt1.trim(), mcqForm.opt2.trim(), mcqForm.opt3.trim()],
        correctIndex: mcqForm.correctIndex,
        explanation: mcqForm.explanation.trim(),
      });
    }
    if (!mcqForm.titleEn.trim() || combinedQuestions.length === 0) return;
    addOnlineExam({
      id: `exam-${Date.now()}`,
      title: { bn: mcqForm.titleBn.trim() || mcqForm.titleEn.trim(), en: mcqForm.titleEn.trim() },
      classId: mcqForm.classId,
      subject: mcqForm.subject.trim(),
      chapter: mcqForm.chapter.trim(),
      durationMinutes: Math.max(1, Number(mcqForm.durationMinutes) || 10),
      mode: mcqForm.mode,
      createdBy: user?.name || 'Teacher',
      date: todayStr,
      isPublic: true,
      questions: combinedQuestions,
    });
    setDraftMcqQuestions([]);
    setMcqForm((p) => ({ ...p, titleBn: '', titleEn: '', question: '', opt0: '', opt1: '', opt2: '', opt3: '', explanation: '' }));
    notify(lang === 'bn' ? 'অনলাইন MCQ পরীক্ষা তৈরি হয়েছে!' : 'Online MCQ exam published!');
  };

  // --- 8. Parent Messages Reply ---
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // --- 9 & 10. Teacher Leave & Student Leave Review ---
  const [myLeaveForm, setMyLeaveForm] = useState({
    leaveType: 'Casual' as 'Casual' | 'Sick' | 'Earned' | 'Emergency',
    startDate: todayStr,
    endDate: todayStr,
    reason: '',
  });
  const [studentRemarks, setStudentRemarks] = useState<Record<string, string>>({});

  // --- 11. Fee & Payment Ledger ---
  const [feeMode, setFeeMode] = useState<'bulk' | 'single'>('bulk');
  const [feeClassFilter, setFeeClassFilter] = useState<string>('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('all');
  const [bulkFeeForm, setBulkFeeForm] = useState({
    classId: '9',
    title: 'Monthly Tuition Fee',
    category: 'Tuition' as FeeCategory,
    billingMonth: 'November 2026',
    amount: 500,
    dueDate: todayStr,
  });
  const [singleFeeForm, setSingleFeeForm] = useState({
    studentId: '',
    title: 'Exam Fee',
    category: 'Exam' as FeeCategory,
    billingMonth: 'Annual 2026',
    amount: 600,
    dueDate: todayStr,
  });
  const [payMethods, setPayMethods] = useState<Record<string, PaymentMethod>>({});
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});

  const filteredFees = useMemo(() => {
    return feeRecords.filter((f) => {
      if (feeClassFilter !== 'all' && f.classId !== feeClassFilter) return false;
      if (feeStatusFilter !== 'all' && f.status !== feeStatusFilter) return false;
      return true;
    });
  }, [feeRecords, feeClassFilter, feeStatusFilter]);

  const feeStats = useMemo(() => {
    const billed = filteredFees.reduce((s, f) => s + f.amount, 0);
    const paid = filteredFees.reduce((s, f) => s + f.paidAmount, 0);
    const due = filteredFees.reduce((s, f) => (f.status === 'waived' ? s : s + Math.max(0, f.amount - f.paidAmount)), 0);
    return { billed, paid, due };
  }, [filteredFees]);

  // --- 12. Targeted Portal Broadcast ---
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetRole: 'all' as 'all' | 'student' | 'parent',
    classId: 'all',
    priority: 'normal' as 'normal' | 'urgent',
  });

  // --- 13. Class Routine Editor (Phase 4) ---
  const [routineDayIdx, setRoutineDayIdx] = useState<number>(0);
  const [newPeriodForm, setNewPeriodForm] = useState({
    time: '01:45 PM',
    subjectBn: '',
    subjectEn: '',
    teacherBn: '',
    teacherEn: '',
  });

  const activeClassRoutine = useMemo(
    () => classRoutines.find((r) => r.classId === manageClassId) || classRoutines[0],
    [classRoutines, manageClassId]
  );

  const tabs: { id: TeacherTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'attendance', label: lang === 'bn' ? 'হাজিরা' : 'Attendance', icon: ClipboardCheck },
    { id: 'homework', label: lang === 'bn' ? 'হোমওয়ার্ক ও মূল্যায়ন' : 'Assignments', icon: BookOpenCheck },
    { id: 'marks', label: lang === 'bn' ? 'নম্বর এন্ট্রি' : 'Marks Entry', icon: Award },
    { id: 'fees', label: lang === 'bn' ? 'ফি ও বকেয়া' : 'Fee Ledger', icon: Receipt },
    { id: 'notices', label: lang === 'bn' ? 'নোটিশ ও ঘোষণা' : 'Notices & Alerts', icon: Bell },
    { id: 'materials', label: lang === 'bn' ? 'স্টাডি নোটস' : 'Study Materials', icon: BookOpen },
    { id: 'classes', label: lang === 'bn' ? 'শ্রেণী ও রুটিন' : 'Classes & Routines', icon: School },
    { id: 'online-exams', label: lang === 'bn' ? 'MCQ পরীক্ষা তৈরি' : 'Create MCQ Exam', icon: Trophy },
    { id: 'parent-messages', label: lang === 'bn' ? 'অভিভাবক বার্তা' : 'Parent Messages', icon: MessageSquare },
    { id: 'my-leave', label: lang === 'bn' ? 'নিজের ছুটি' : 'My Leave', icon: CalendarPlus },
    { id: 'student-leaves', label: lang === 'bn' ? 'শিক্ষার্থীর ছুটি' : 'Student Leaves', icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Cloud Sync Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border ${
          isCloudTeacher
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}
      >
        <div className="flex items-center gap-3 text-xs font-bold">
          {isCloudTeacher ? <Cloud className="w-5 h-5 text-emerald-600" /> : <CloudOff className="w-5 h-5 text-amber-600" />}
          <span>
            {isCloudTeacher
              ? lang === 'bn'
                ? 'ক্লাউড সিঙ্ক সক্রিয় — সকল তথ্য ফায়ারবেজে সংরক্ষিত হচ্ছে।'
                : 'Cloud sync active — all changes persist to Firebase.'
              : lang === 'bn'
              ? 'লোকাল মোড সক্রিয় — ক্লাউডে সেভ করতে Google দিয়ে যুক্ত হতে পারেন।'
              : 'Local storage mode — connect Google to sync to cloud.'}
          </span>
        </div>
        {!isCloudTeacher && (
          <button
            onClick={() => void signInWithGoogle()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Google Sync
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto border border-slate-200 dark:border-slate-700 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-300 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{lang === 'bn' ? 'শ্রেণী' : 'Class'}</label>
                <select
                  value={attClassId}
                  onChange={(e) => setAttClassId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                >
                  {['6', '7', '8', '9', '10'].map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{lang === 'bn' ? 'তারিখ' : 'Date'}</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  exportCsv(
                    `attendance_class_${attClassId}_${attDate}`,
                    ['Date', 'Class', 'Roll', 'Student Name', 'Status'],
                    attClassStudents.map((st) => [attDate, attClassId, st.roll, st.name, attDraft[st.id] || 'present'])
                  );
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                {lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {lang === 'bn' ? 'হাজিরা সেভ করুন' : 'Save Attendance'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attClassStudents.map((st) => {
              const cur = attDraft[st.id] || 'present';
              return (
                <div key={st.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm">#{st.roll} — {st.name}</span>
                    <span className="ml-2 text-xs text-slate-400">({st.section})</span>
                  </div>
                  <div className="flex gap-1.5">
                    {(['present', 'absent', 'late'] as AttendanceStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => setAttDraft((p) => ({ ...p, [st.id]: status }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                          cur === status
                            ? status === 'present'
                              ? 'bg-emerald-600 text-white'
                              : status === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Homework + Submission Grading */}
      {activeTab === 'homework' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={handleHwSubmit} className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
            <h4 className="font-extrabold text-base">{hwEditing ? (lang === 'bn' ? 'হোমওয়ার্ক সম্পাদনা' : 'Edit Assignment') : (lang === 'bn' ? 'নতুন হোমওয়ার্ক দিন' : 'Assign Homework')}</h4>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={hwForm.classId}
                onChange={(e) => {
                  const cid = e.target.value;
                  setHwForm((p) => ({ ...p, classId: cid, subject: (CLASS_SUBJECTS[cid] || ['Bangla'])[0] }));
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              >
                {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <select
                value={hwForm.subject}
                onChange={(e) => setHwForm((p) => ({ ...p, subject: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              >
                {(CLASS_SUBJECTS[hwForm.classId] || ['Bangla']).map((sub) => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            <input
              required
              value={hwForm.title}
              onChange={(e) => setHwForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={lang === 'bn' ? 'অ্যাসাইনমেন্টের শিরোনাম' : 'Assignment Title'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
            />
            <textarea
              required
              rows={3}
              value={hwForm.description}
              onChange={(e) => setHwForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={lang === 'bn' ? 'বিস্তারিত নির্দেশনা' : 'Instructions'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
            <input
              type="date"
              required
              value={hwForm.dueDate}
              onChange={(e) => setHwForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
            />
            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
              {hwEditing ? (lang === 'bn' ? 'আপডেট করুন' : 'Update') : (lang === 'bn' ? 'হোমওয়ার্ক প্রকাশ করুন' : 'Publish Assignment')}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm">{lang === 'bn' ? 'চলমান হোমওয়ার্ক' : 'Active Assignments'}</h4>
              <select
                value={hwFilterClass}
                onChange={(e) => setHwFilterClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <option value="all">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>
                {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            {homeworkList
              .filter((h) => hwFilterClass === 'all' || h.classId === hwFilterClass)
              .map((hw) => (
                <div key={hw.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Class {hw.classId} • {hw.subject} • Due {hw.dueDate}</p>
                    <h5 className="font-bold text-sm mt-0.5">{hw.title}</h5>
                    <p className="text-xs text-slate-500 mt-1">{hw.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 h-fit">
                    <button onClick={() => { setHwEditing(hw); setHwForm({ classId: hw.classId, subject: hw.subject, title: hw.title, description: hw.description, dueDate: hw.dueDate }); }} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteHomework(hw.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-slate-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

            {/* Student Submissions to Grade */}
            {assignmentSubmissions.length > 0 && (
              <div className="pt-4 space-y-3">
                <h4 className="font-extrabold text-sm">{lang === 'bn' ? 'জমাকৃত অ্যাসাইনমেন্ট মূল্যায়ন' : 'Submitted Assignments to Grade'}</h4>
                {assignmentSubmissions.map((sub) => {
                  const draft = gradeDrafts[sub.id] || { marks: String(sub.marks ?? ''), feedback: sub.feedback ?? '' };
                  return (
                    <div key={sub.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{sub.studentName} (Class {sub.classId}, Roll {sub.roll}) — {sub.subject}</span>
                        <span className="uppercase text-emerald-700 dark:text-emerald-400">{sub.status}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{sub.answerText}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Marks"
                          value={draft.marks}
                          onChange={(e) => setGradeDrafts((p) => ({ ...p, [sub.id]: { ...draft, marks: e.target.value } }))}
                          className="w-24 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                        />
                        <input
                          type="text"
                          placeholder={lang === 'bn' ? 'মন্তব্য...' : 'Feedback...'}
                          value={draft.feedback}
                          onChange={(e) => setGradeDrafts((p) => ({ ...p, [sub.id]: { ...draft, feedback: e.target.value } }))}
                          className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          onClick={() => {
                            gradeAssignmentSubmission(sub.id, Number(draft.marks) || 0, draft.feedback);
                            notify(lang === 'bn' ? 'মূল্যায়ন সেভ হয়েছে!' : 'Graded!');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold"
                        >
                          {lang === 'bn' ? 'গ্রেড দিন' : 'Save Grade'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Exam Marks Entry */}
      {activeTab === 'marks' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Term</label>
              <select value={markTerm} onChange={(e) => setMarkTerm(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {EXAM_TERMS.map((term) => <option key={term.id} value={term.id}>{t(term)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Class</label>
              <select value={markClassId} onChange={(e) => setMarkClassId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject</label>
              <select value={markSubject} onChange={(e) => setMarkSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {(CLASS_SUBJECTS[markClassId] || ['Bangla']).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Full Marks</label>
              <input type="number" min={10} max={200} value={markTotal} onChange={(e) => setMarkTotal(Number(e.target.value) || 100)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveMarksBulk} className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5">
                <Save className="w-4 h-4" />
                {lang === 'bn' ? 'নম্বর প্রকাশ' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const classMarks = examMarks.filter((m) => m.classId === markClassId && m.examTerm === markTerm);
                  exportCsv(
                    `marks_class_${markClassId}_${markTerm}`,
                    ['Term', 'Class', 'Roll', 'Student Name', 'Subject', 'Obtained', 'Total', 'Grade'],
                    classMarks.map((m) => [m.examTerm, m.classId, m.roll, m.studentName, m.subject, m.obtainedMarks, m.totalMarks, m.grade])
                  );
                }}
                title={lang === 'bn' ? 'CSV ডাউনলোড' : 'Export Class Marks CSV'}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center justify-center"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {markClassStudents.map((st) => {
              const val = marksDraft[st.id] ?? '';
              const g = val !== '' ? calculateGrade(Number(val) || 0, markTotal).grade : '-';
              return (
                <div key={st.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm">#{st.roll} — {st.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={markTotal}
                      value={val}
                      onChange={(e) => setMarksDraft((p) => ({ ...p, [st.id]: e.target.value }))}
                      placeholder={`/ ${markTotal}`}
                      className="w-24 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                    />
                    <span className="w-10 text-center text-xs font-black text-emerald-700 dark:text-emerald-400">{g}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {examMarks.filter((m) => m.classId === markClassId).length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 mb-2">{lang === 'bn' ? 'প্রকাশিত নম্বর তালিকা' : 'Recent Saved Marks'}</p>
              <div className="flex flex-wrap gap-2">
                {examMarks.filter((m) => m.classId === markClassId && m.examTerm === markTerm && m.subject === markSubject).map((m) => (
                  <span key={m.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                    #{m.roll}: {m.obtainedMarks} ({m.grade})
                    <button onClick={() => deleteExamMark(m.id)} className="text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3B. Fee & Payment Ledger */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'মোট নির্ধারিত ফি' : 'Total Billed'}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">৳{feeStats.billed.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'আদায়কৃত টাকা' : 'Collected'}</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">৳{feeStats.paid.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'মোট বকেয়া' : 'Pending Due'}</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums mt-1">৳{feeStats.due.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Create Fee Form */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFeeMode('bulk')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${feeMode === 'bulk' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-slate-500'}`}
                >
                  {lang === 'bn' ? 'শ্রেণীভিত্তিক ফি' : 'Bulk Class Fee'}
                </button>
                <button
                  type="button"
                  onClick={() => setFeeMode('single')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${feeMode === 'single' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-slate-500'}`}
                >
                  {lang === 'bn' ? 'একক শিক্ষার্থী' : 'Individual Fee'}
                </button>
              </div>

              {feeMode === 'bulk' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const count = addBulkClassFees({
                      classId: bulkFeeForm.classId,
                      title: bulkFeeForm.title.trim(),
                      category: bulkFeeForm.category,
                      billingMonth: bulkFeeForm.billingMonth.trim(),
                      amount: Math.max(0, Number(bulkFeeForm.amount) || 0),
                      dueDate: bulkFeeForm.dueDate,
                    });
                    notify(lang === 'bn' ? `${count} জন শিক্ষার্থীর জন্য ফি যুক্ত হয়েছে!` : `Generated fee invoices for ${count} students!`);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <select value={bulkFeeForm.classId} onChange={(e) => setBulkFeeForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <select value={bulkFeeForm.category} onChange={(e) => setBulkFeeForm((p) => ({ ...p, category: e.target.value as FeeCategory }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      {['Tuition', 'Exam', 'Admission', 'Library', 'Lab', 'Sports', 'Other'].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <input required value={bulkFeeForm.title} onChange={(e) => setBulkFeeForm((p) => ({ ...p, title: e.target.value }))} placeholder="Fee Title (e.g. Monthly Tuition)" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <input value={bulkFeeForm.billingMonth} onChange={(e) => setBulkFeeForm((p) => ({ ...p, billingMonth: e.target.value }))} placeholder="Month / Term" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" min={0} max={500000} required value={bulkFeeForm.amount} onChange={(e) => setBulkFeeForm((p) => ({ ...p, amount: Number(e.target.value) || 0 }))} placeholder="Amount (BDT)" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums" />
                    <input type="date" required value={bulkFeeForm.dueDate} onChange={(e) => setBulkFeeForm((p) => ({ ...p, dueDate: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                    {lang === 'bn' ? 'সকল শিক্ষার্থীর ফি তৈরি করুন' : 'Generate Class Invoices'}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const st = students.find((s) => s.id === singleFeeForm.studentId) || students[0];
                    if (!st) return;
                    addFeeRecord({
                      id: `fee-${Date.now()}`,
                      studentId: st.id,
                      studentName: st.name,
                      classId: st.classId,
                      roll: st.roll,
                      title: singleFeeForm.title.trim(),
                      category: singleFeeForm.category,
                      billingMonth: singleFeeForm.billingMonth.trim(),
                      amount: Math.max(0, Number(singleFeeForm.amount) || 0),
                      paidAmount: 0,
                      dueDate: singleFeeForm.dueDate,
                      status: 'pending',
                      recordedBy: user?.name || 'Teacher',
                    });
                    notify(lang === 'bn' ? 'শিক্ষার্থীর ফি যুক্ত হয়েছে!' : 'Fee invoice created!');
                  }}
                  className="space-y-3"
                >
                  <select value={singleFeeForm.studentId || students[0]?.id || ''} onChange={(e) => setSingleFeeForm((p) => ({ ...p, studentId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>Class {st.classId} · #{st.roll} {st.name}</option>
                    ))}
                  </select>
                  <select value={singleFeeForm.category} onChange={(e) => setSingleFeeForm((p) => ({ ...p, category: e.target.value as FeeCategory }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    {['Tuition', 'Exam', 'Admission', 'Library', 'Lab', 'Sports', 'Other'].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input required value={singleFeeForm.title} onChange={(e) => setSingleFeeForm((p) => ({ ...p, title: e.target.value }))} placeholder="Fee Title" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" min={0} max={500000} required value={singleFeeForm.amount} onChange={(e) => setSingleFeeForm((p) => ({ ...p, amount: Number(e.target.value) || 0 }))} placeholder="Amount" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums" />
                    <input type="date" required value={singleFeeForm.dueDate} onChange={(e) => setSingleFeeForm((p) => ({ ...p, dueDate: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                    {lang === 'bn' ? 'ইনভয়েস যুক্ত করুন' : 'Create Invoice'}
                  </button>
                </form>
              )}
            </div>

            {/* Fee Ledger List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <select value={feeClassFilter} onChange={(e) => setFeeClassFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <option value="all">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>
                    {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                  <select value={feeStatusFilter} onChange={(e) => setFeeStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
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
                      filteredFees.map((f) => [f.id, f.classId, f.roll, f.studentName, f.title, f.category, f.amount, f.paidAmount, f.status, f.paymentMethod || '', f.receiptNo || '', f.dueDate])
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'ফি CSV এক্সপোর্ট' : 'Export Fee CSV'}
                </button>
              </div>

              {filteredFees.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 font-bold text-sm">
                  {lang === 'bn' ? 'কোনো ফি রেকর্ড পাওয়া যায়নি।' : 'No matching fee records found.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFees.map((f) => {
                    const method = payMethods[f.id] || 'Cash';
                    const amtInput = payAmounts[f.id] ?? String(f.amount);
                    return (
                      <div key={f.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                              Class {f.classId} · Roll #{f.roll} · {f.category} · Due {f.dueDate}
                            </p>
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                              {f.studentName} — {f.title}
                            </h5>
                          </div>
                          <div className="text-right tabular-nums">
                            <p className="text-sm font-black">
                              ৳{f.paidAmount.toLocaleString()} / ৳{f.amount.toLocaleString()}
                            </p>
                            <p className={`text-[11px] font-extrabold uppercase ${f.status === 'paid' ? 'text-emerald-700 dark:text-emerald-400' : f.status === 'waived' ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'}`}>
                              {f.status} {f.receiptNo ? `· ${f.receiptNo}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {f.status !== 'paid' && f.status !== 'waived' && (
                            <>
                              <input
                                type="number"
                                min={0}
                                max={f.amount}
                                value={amtInput}
                                onChange={(e) => setPayAmounts((p) => ({ ...p, [f.id]: e.target.value }))}
                                className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums"
                              />
                              <select
                                value={method}
                                onChange={(e) => setPayMethods((p) => ({ ...p, [f.id]: e.target.value as PaymentMethod }))}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
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
                                  notify(lang === 'bn' ? 'পেমেন্ট সেভ ও রশিদ তৈরি হয়েছে!' : 'Payment recorded!');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                              >
                                {lang === 'bn' ? 'জমা নিন' : 'Record Paid'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  markFeeWaived(f.id);
                                  notify(lang === 'bn' ? 'ফি মওকুফ করা হয়েছে।' : 'Marked as waived.');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                              >
                                {lang === 'bn' ? 'মওকুফ' : 'Waive'}
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveReceipt(f)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-700 hover:text-white text-xs font-bold inline-flex items-center gap-1 ml-auto"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            {lang === 'bn' ? 'রশিদ প্রিন্ট' : 'Voucher'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFeeRecord(f.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Notices + Targeted Portal Broadcasts */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-12 gap-6">
            <form onSubmit={handlePublishNotice} className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 h-fit">
              <h4 className="font-extrabold text-base">{lang === 'bn' ? 'নতুন নোটিশ প্রকাশ করুন' : 'Publish Public School Notice'}</h4>
              <input required value={newNotice.titleBn} onChange={(e) => setNewNotice((p) => ({ ...p, titleBn: e.target.value }))} placeholder="শিরোনাম (বাংলা)" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <input value={newNotice.titleEn} onChange={(e) => setNewNotice((p) => ({ ...p, titleEn: e.target.value }))} placeholder="Title (English)" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <select value={newNotice.category} onChange={(e) => setNewNotice((p) => ({ ...p, category: e.target.value as 'General' | 'Admission' | 'Exam' | 'Holiday' }))} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold">
                <option value="General">General</option>
                <option value="Exam">Exam</option>
                <option value="Admission">Admission</option>
                <option value="Holiday">Holiday</option>
              </select>
              <textarea required rows={3} value={newNotice.descBn} onChange={(e) => setNewNotice((p) => ({ ...p, descBn: e.target.value }))} placeholder="বিবরণ (বাংলা)" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <textarea rows={2} value={newNotice.descEn} onChange={(e) => setNewNotice((p) => ({ ...p, descEn: e.target.value }))} placeholder="Description (English)" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                {lang === 'bn' ? 'নোটিশ প্রকাশ করুন' : 'Publish Notice'}
              </button>
            </form>

            {/* Targeted Portal Alert Broadcast Composer */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;
                await addPortalNotification({
                  id: `pn-${Date.now()}`,
                  title: broadcastForm.title.trim(),
                  message: broadcastForm.message.trim(),
                  targetRole: broadcastForm.targetRole,
                  classId: broadcastForm.classId,
                  priority: broadcastForm.priority,
                  senderName: user?.name || 'Teacher',
                  createdDate: todayStr,
                });
                setBroadcastForm((p) => ({ ...p, title: '', message: '' }));
                notify(lang === 'bn' ? 'টার্গেটেড পোর্টাল ঘোষণা পাঠানো হয়েছে!' : 'Targeted portal alert sent!');
              }}
              className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 h-fit"
            >
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h4 className="font-extrabold text-base">{lang === 'bn' ? 'টার্গেটেড পোর্টাল ঘোষণা (শিক্ষার্থী/অভিভাবক)' : 'Send Targeted Student / Parent Alert'}</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select value={broadcastForm.targetRole} onChange={(e) => setBroadcastForm((p) => ({ ...p, targetRole: e.target.value as 'all' | 'student' | 'parent' }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <option value="all">{lang === 'bn' ? 'সবাই' : 'All Portals'}</option>
                  <option value="student">{lang === 'bn' ? 'শুধু শিক্ষার্থী' : 'Students Only'}</option>
                  <option value="parent">{lang === 'bn' ? 'শুধু অভিভাবক' : 'Parents Only'}</option>
                </select>
                <select value={broadcastForm.classId} onChange={(e) => setBroadcastForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <option value="all">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>
                  {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select value={broadcastForm.priority} onChange={(e) => setBroadcastForm((p) => ({ ...p, priority: e.target.value as 'normal' | 'urgent' }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <option value="normal">{lang === 'bn' ? 'সাধারণ' : 'Normal'}</option>
                  <option value="urgent">{lang === 'bn' ? 'জরুরি' : 'Urgent'}</option>
                </select>
              </div>
              <input required value={broadcastForm.title} onChange={(e) => setBroadcastForm((p) => ({ ...p, title: e.target.value }))} placeholder={lang === 'bn' ? 'ঘোষণার শিরোনাম' : 'Alert Title'} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <textarea required rows={2} value={broadcastForm.message} onChange={(e) => setBroadcastForm((p) => ({ ...p, message: e.target.value }))} placeholder={lang === 'bn' ? 'বিস্তারিত বার্তা লিখুন...' : 'Alert message...'} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                {lang === 'bn' ? 'পোর্টাল ঘোষণা পাঠান' : 'Send Portal Alert'}
              </button>

              {portalNotifications.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-52 overflow-y-auto">
                  {portalNotifications.slice(0, 6).map((pn) => (
                    <div key={pn.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-start justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                          {pn.targetRole} · Class {pn.classId || 'all'} · {pn.priority} · {pn.createdDate}
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">{pn.title}</p>
                      </div>
                      <button type="button" onClick={() => deletePortalNotification(pn.id)} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={noticeSearch} onChange={(e) => setNoticeSearch(e.target.value)} placeholder={lang === 'bn' ? 'নোটিশ খুঁজুন...' : 'Search notices...'} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {notices
                .filter((n) => !noticeSearch.trim() || t(n.title).toLowerCase().includes(noticeSearch.trim().toLowerCase()))
                .map((n) => (
                  <div key={n.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{n.category}</span>
                      <span className="tabular-nums">{n.date}</span>
                    </div>
                    <h5 className="font-bold text-sm mt-1">{t(n.title)}</h5>
                    <p className="text-xs text-slate-500 mt-1">{t(n.description)}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Study Material Upload */}
      {activeTab === 'materials' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={handleUploadMaterial} className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 h-fit">
            <h4 className="font-extrabold text-base">{lang === 'bn' ? 'স্টাডি ম্যাটেরিয়াল / নোটস আপলোড' : 'Upload Study Material'}</h4>
            <input required value={matForm.titleBn} onChange={(e) => setMatForm((p) => ({ ...p, titleBn: e.target.value }))} placeholder="বই বা নোটের নাম (বাংলা)" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            <input value={matForm.titleEn} onChange={(e) => setMatForm((p) => ({ ...p, titleEn: e.target.value }))} placeholder="Resource Title (English)" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <select value={matForm.classId} onChange={(e) => setMatForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <select value={matForm.category} onChange={(e) => setMatForm((p) => ({ ...p, category: e.target.value as LibraryCategory }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {['Notes', 'StudyMaterial', 'ChapterPDF', 'BoardQuestion', 'ModelTest', 'Practical', 'MathSolution', 'EnglishGrammar', 'ICT', 'Textbook'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <input value={matForm.subject} onChange={(e) => setMatForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            <textarea rows={2} value={matForm.descEn} onChange={(e) => setMatForm((p) => ({ ...p, descEn: e.target.value, descBn: e.target.value }))} placeholder={lang === 'bn' ? 'সংক্ষিপ্ত বর্ণনা' : 'Short summary'} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            <input value={matForm.downloadUrl} onChange={(e) => setMatForm((p) => ({ ...p, downloadUrl: e.target.value }))} placeholder="PDF / Resource URL (or #)" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
              {lang === 'bn' ? 'লাইব্রেরিতে যুক্ত করুন' : 'Upload to Library'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {ebooks.slice(0, 8).map((eb) => (
              <div key={eb.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Class {eb.classId} • {eb.category || eb.subject}
                  </span>
                  <h5 className="font-bold text-sm mt-1">{t(eb.title)}</h5>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{eb.subject}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Classes & Exam Routines */}
      {activeTab === 'classes' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-extrabold text-base">{lang === 'bn' ? 'শিক্ষার্থী তালিকা ও কার্ড' : 'Student Roster & Cards'}</h4>
              <div className="flex items-center gap-2">
                <select value={manageClassId} onChange={(e) => setManageClassId(e.target.value as '6' | '7' | '8' | '9' | '10')} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  {CLASSES.map((c) => <option key={c.classId} value={c.classId}>Class {c.classId}</option>)}
                </select>
                {students.some((s) => s.classId === manageClassId) && (
                  <button
                    type="button"
                    onClick={() => {
                      const list = students.filter((s) => s.classId === manageClassId);
                      if (list[0]) openStudentCard(list[0], 'admit');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'সব কার্ড দেখুন' : 'Class Cards'}
                  </button>
                )}
              </div>
            </div>
            <form onSubmit={handleSaveStudent} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <input required placeholder="Roll" value={studentForm.roll} onChange={(e) => setStudentForm((p) => ({ ...p, roll: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <input required placeholder="Student Name" value={studentForm.name} onChange={(e) => setStudentForm((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <input required placeholder="Section" value={studentForm.section} onChange={(e) => setStudentForm((p) => ({ ...p, section: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <input placeholder={lang === 'bn' ? 'অভিভাবকের নাম' : 'Guardian Name'} value={studentForm.guardianName} onChange={(e) => setStudentForm((p) => ({ ...p, guardianName: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <input placeholder={lang === 'bn' ? 'অভিভাবকের মোবাইল' : 'Guardian Mobile'} value={studentForm.guardianMobile} onChange={(e) => setStudentForm((p) => ({ ...p, guardianMobile: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <div className="flex gap-1.5">
                <label className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{studentForm.photo ? 'OK' : 'Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const compressed = await compressImageFile(f, 360, 0.8);
                        setStudentForm((p) => ({ ...p, photo: compressed }));
                      }
                    }}
                  />
                </label>
                <button type="submit" className="flex-1 px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> {editingStudent ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.filter((s) => s.classId === manageClassId).map((st) => (
                <div key={st.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span><b>#{st.roll}</b> {st.name} ({st.section})</span>
                  <div className="flex flex-wrap items-center gap-1">
                    <button type="button" onClick={() => openStudentCard(st, 'admit')} title={lang === 'bn' ? 'অ্যাডমিট কার্ড' : 'Admit Card'} className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold inline-flex items-center gap-1"><ClipboardList className="w-3 h-3" /> Admit</button>
                    <button type="button" onClick={() => openStudentCard(st, 'reg')} title={lang === 'bn' ? 'রেজিস্ট্রেশন কার্ড' : 'Registration Card'} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold inline-flex items-center gap-1"><FileBadge2 className="w-3 h-3" /> Reg</button>
                    <button type="button" onClick={() => openStudentCard(st, 'id')} title={lang === 'bn' ? 'আইডি কার্ড' : 'ID Card'} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold inline-flex items-center gap-1"><IdCard className="w-3 h-3" /> ID</button>
                    <button type="button" onClick={() => setCertStudent(st)} title={lang === 'bn' ? 'প্রত্যয়নপত্র ও সনদ' : 'Certificate'} className="p-1.5 text-purple-700 dark:text-purple-400"><Award className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => { setEditingStudent(st); setStudentForm({ roll: st.roll, name: st.name, section: st.section, guardianMobile: st.guardianMobile, guardianName: st.guardianName || '', photo: st.photo || '', registrationDate: st.registrationDate || '2026-01-15' }); }} className="p-1.5 text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => deleteStudent(st.id)} className="p-1.5 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-base">{lang === 'bn' ? 'পরীক্ষার রুটিন যুক্ত করুন' : 'Exam Routine Schedule'}</h4>
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <select value={routineForm.classId} onChange={(e) => setRoutineForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <input value={routineForm.subject} onChange={(e) => setRoutineForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={routineForm.date} onChange={(e) => setRoutineForm((p) => ({ ...p, date: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                <input value={routineForm.room} onChange={(e) => setRoutineForm((p) => ({ ...p, room: e.target.value }))} placeholder="Room" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
              <button
                onClick={() => {
                  addExamRoutine({ id: `er-${Date.now()}`, ...routineForm, isPublic: true });
                  notify(lang === 'bn' ? 'পরীক্ষার রুটিন যুক্ত হয়েছে!' : 'Exam routine item added!');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
              >
                {lang === 'bn' ? 'রুটিন যুক্ত করুন' : 'Add Exam Date'}
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {examRoutines.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <span><b>C{r.classId}</b> {r.subject} — {r.date}</span>
                  <button onClick={() => deleteExamRoutine(r.id)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Class Routine Editor (Phase 4) */}
          {activeClassRoutine && (
            <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <h4 className="font-extrabold text-base">
                    {lang === 'bn' ? `সাপ্তাহিক ক্লাস রুটিন ব্যবস্থাপনা — Class ${manageClassId}` : `Weekly Class Routine Editor — Class ${manageClassId}`}
                  </h4>
                </div>
                <select
                  value={routineDayIdx}
                  onChange={(e) => setRoutineDayIdx(Number(e.target.value))}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  {activeClassRoutine.schedule.map((d, idx) => (
                    <option key={idx} value={idx}>{t(d.day)}</option>
                  ))}
                </select>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newPeriodForm.subjectEn.trim() && !newPeriodForm.subjectBn.trim()) return;
                  const nextSchedule = activeClassRoutine.schedule.map((d, idx) =>
                    idx === routineDayIdx
                      ? {
                          ...d,
                          periods: [
                            ...d.periods,
                            {
                              time: newPeriodForm.time.trim() || '01:45 PM',
                              subject: {
                                bn: newPeriodForm.subjectBn.trim() || newPeriodForm.subjectEn.trim(),
                                en: newPeriodForm.subjectEn.trim() || newPeriodForm.subjectBn.trim(),
                              },
                              teacher: {
                                bn: newPeriodForm.teacherBn.trim() || user?.name || 'শিক্ষক',
                                en: newPeriodForm.teacherEn.trim() || user?.name || 'Teacher',
                              },
                            },
                          ],
                        }
                      : d
                  );
                  saveClassRoutine({ ...activeClassRoutine, schedule: nextSchedule });
                  setNewPeriodForm((p) => ({ ...p, subjectBn: '', subjectEn: '', teacherBn: '', teacherEn: '' }));
                  notify(lang === 'bn' ? 'ক্লাস পিরিয়ড যুক্ত হয়েছে!' : 'Class period added to live timetable!');
                }}
                className="grid grid-cols-2 sm:grid-cols-5 gap-2"
              >
                <input required value={newPeriodForm.time} onChange={(e) => setNewPeriodForm((p) => ({ ...p, time: e.target.value }))} placeholder="Time (e.g. 01:45 PM)" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                <input required value={newPeriodForm.subjectEn} onChange={(e) => setNewPeriodForm((p) => ({ ...p, subjectEn: e.target.value }))} placeholder="Subject (EN)" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                <input value={newPeriodForm.subjectBn} onChange={(e) => setNewPeriodForm((p) => ({ ...p, subjectBn: e.target.value }))} placeholder="বিষয় (বাংলা)" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                <input value={newPeriodForm.teacherEn} onChange={(e) => setNewPeriodForm((p) => ({ ...p, teacherEn: e.target.value, teacherBn: e.target.value }))} placeholder="Teacher Name" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> {lang === 'bn' ? 'পিরিয়ড যোগ' : 'Add Period'}
                </button>
              </form>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(activeClassRoutine.schedule[routineDayIdx]?.periods || []).map((pr, pIdx) => (
                  <div key={pIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{pr.time}</p>
                      <p className="font-extrabold truncate">{t(pr.subject)}</p>
                      <p className="text-slate-500 truncate">{t(pr.teacher)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextSchedule = activeClassRoutine.schedule.map((d, idx) =>
                          idx === routineDayIdx ? { ...d, periods: d.periods.filter((_, i) => i !== pIdx) } : d
                        );
                        saveClassRoutine({ ...activeClassRoutine, schedule: nextSchedule });
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

          {/* Pending Parent-Student Verification Requests */}
          {parentLinks.length > 0 && (
            <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base">
                  {lang === 'bn' ? 'অভিভাবক-শিক্ষার্থী লিংক যাচাই' : 'Parent-Student Link Verification'}
                </h4>
                <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black">
                  {parentLinks.filter((l) => l.status === 'pending').length} {lang === 'bn' ? 'টি অপেক্ষমাণ' : 'Pending'}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {parentLinks.map((pl) => (
                  <div key={pl.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-wrap justify-between items-center gap-3 text-xs">
                    <div>
                      <p className="font-extrabold text-sm">
                        {pl.parentName} ({pl.relationship}) → Class {pl.classId}, Roll {pl.roll}
                      </p>
                      <p className="text-slate-500">
                        {pl.parentEmail} {pl.studentName ? `• ${pl.studentName}` : ''} •{' '}
                        <b className="uppercase">{pl.status}</b>
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {pl.status !== 'approved' && (
                        <button
                          onClick={() => {
                            reviewParentStudentLink(pl.id, 'approved');
                            notify(lang === 'bn' ? 'অভিভাবক লিংক অনুমোদিত!' : 'Parent link approved!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {pl.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            reviewParentStudentLink(pl.id, 'rejected');
                            notify(lang === 'bn' ? 'অভিভাবক লিংক বাতিল!' : 'Parent link rejected!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Create Online MCQ Exam (with AI Question Draft Generator) */}
      {activeTab === 'online-exams' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={handleCreateMcqExam} className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-extrabold text-base">{lang === 'bn' ? 'অনলাইন MCQ পরীক্ষা তৈরি করুন' : 'Create Online MCQ Quiz'}</h4>
              <button
                type="button"
                disabled={aiGeneratingMcq}
                onClick={handleGenerateAiMcqs}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {aiGeneratingMcq ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {aiGeneratingMcq
                  ? lang === 'bn'
                    ? 'তৈরি হচ্ছে...'
                    : 'Generating...'
                  : lang === 'bn'
                  ? 'AI দিয়ে ৪টি প্রশ্ন তৈরি'
                  : 'AI Generate 4 MCQs'}
              </button>
            </div>
            {aiMcqError && (
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-xl">
                {aiMcqError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <input value={mcqForm.titleBn} onChange={(e) => setMcqForm((p) => ({ ...p, titleBn: e.target.value }))} placeholder="শিরোনাম (বাংলা)" className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <input required value={mcqForm.titleEn} onChange={(e) => setMcqForm((p) => ({ ...p, titleEn: e.target.value }))} placeholder="Title (English)" className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select value={mcqForm.classId} onChange={(e) => setMcqForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <input value={mcqForm.subject} onChange={(e) => setMcqForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <input value={mcqForm.chapter} onChange={(e) => setMcqForm((p) => ({ ...p, chapter: e.target.value }))} placeholder="Chapter / Topic" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={mcqForm.mode} onChange={(e) => setMcqForm((p) => ({ ...p, mode: e.target.value as 'exam' | 'practice' }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <option value="exam">Timed Exam</option>
                <option value="practice">Practice</option>
              </select>
              <input type="number" min={1} max={180} value={mcqForm.durationMinutes} onChange={(e) => setMcqForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))} placeholder="Minutes" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums" />
            </div>

            {draftMcqQuestions.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 max-h-52 overflow-y-auto">
                <p className="text-[11px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
                  {lang === 'bn' ? `প্রস্তুতকৃত প্রশ্ন (${draftMcqQuestions.length}টি)` : `Draft Questions (${draftMcqQuestions.length})`}
                </p>
                {draftMcqQuestions.map((dq, dIdx) => (
                  <div key={dq.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold truncate">Q{dIdx + 1}. {dq.question}</p>
                      <p className="text-[11px] text-slate-400 truncate">Ans: {dq.options[dq.correctIndex]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraftMcqQuestions((prev) => prev.filter((item) => item.id !== dq.id))}
                      className="text-red-500 p-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input required={draftMcqQuestions.length === 0} value={mcqForm.question} onChange={(e) => setMcqForm((p) => ({ ...p, question: e.target.value }))} placeholder={draftMcqQuestions.length > 0 ? 'Add another manual question (optional)...' : 'Question text...'} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold" />
            <div className="grid grid-cols-2 gap-2">
              <input required={draftMcqQuestions.length === 0 || Boolean(mcqForm.question.trim())} value={mcqForm.opt0} onChange={(e) => setMcqForm((p) => ({ ...p, opt0: e.target.value }))} placeholder="Option A" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              <input required={draftMcqQuestions.length === 0 || Boolean(mcqForm.question.trim())} value={mcqForm.opt1} onChange={(e) => setMcqForm((p) => ({ ...p, opt1: e.target.value }))} placeholder="Option B" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              <input required={draftMcqQuestions.length === 0} value={mcqForm.opt2} onChange={(e) => setMcqForm((p) => ({ ...p, opt2: e.target.value }))} placeholder="Option C" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              <input required={draftMcqQuestions.length === 0} value={mcqForm.opt3} onChange={(e) => setMcqForm((p) => ({ ...p, opt3: e.target.value }))} placeholder="Option D" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={mcqForm.correctIndex} onChange={(e) => setMcqForm((p) => ({ ...p, correctIndex: Number(e.target.value) }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <option value={0}>Correct: Option A</option>
                <option value={1}>Correct: Option B</option>
                <option value={2}>Correct: Option C</option>
                <option value={3}>Correct: Option D</option>
              </select>
              <input value={mcqForm.explanation} onChange={(e) => setMcqForm((p) => ({ ...p, explanation: e.target.value }))} placeholder="Explanation (optional)" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
            </div>
            <div className="flex gap-2">
              {mcqForm.question.trim() && (
                <button
                  type="button"
                  onClick={handleAddDraftQuestion}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> {lang === 'bn' ? 'ড্রাফটে যোগ' : 'Add to List'}
                </button>
              )}
              <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                {lang === 'bn'
                  ? `পরীক্ষা প্রকাশ করুন (${draftMcqQuestions.length + (mcqForm.question.trim() ? 1 : 0)} প্রশ্ন)`
                  : `Publish MCQ Quiz (${draftMcqQuestions.length + (mcqForm.question.trim() ? 1 : 0)} MCQs)`}
              </button>
            </div>
          </form>

          <div className="lg:col-span-6 space-y-3">
            {onlineExams.map((ex) => (
              <div key={ex.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                    Class {ex.classId} • {ex.subject} • {ex.questions.length} MCQ
                  </span>
                  <h5 className="font-bold text-sm mt-0.5">{t(ex.title)}</h5>
                </div>
                <button onClick={() => deleteOnlineExam(ex.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Parent Messages */}
      {activeTab === 'parent-messages' && (
        <div className="space-y-3">
          {parentMessages.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-sm">
              {lang === 'bn' ? 'অভিভাবকদের কোনো বার্তা নেই।' : 'No guardian messages yet.'}
            </div>
          ) : (
            parentMessages.map((pm) => (
              <div key={pm.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex flex-wrap justify-between text-xs font-bold">
                  <span>{pm.parentName} — {pm.studentName} (C{pm.classId}, Roll {pm.roll})</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{pm.subject}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">{pm.message}</p>
                {pm.reply ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Replied: {pm.reply}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={replyDrafts[pm.id] || ''}
                      onChange={(e) => setReplyDrafts((p) => ({ ...p, [pm.id]: e.target.value }))}
                      placeholder={lang === 'bn' ? 'অভিভাবককে উত্তর লিখুন...' : 'Write reply...'}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                    <button
                      onClick={() => {
                        const text = replyDrafts[pm.id] || '';
                        if (!text.trim()) return;
                        replyParentMessage(pm.id, text, user?.name || 'Teacher');
                        notify(lang === 'bn' ? 'উত্তর পাঠানো হয়েছে!' : 'Reply sent!');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> {lang === 'bn' ? 'উত্তর দিন' : 'Reply'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 9. My Leave */}
      {activeTab === 'my-leave' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!myLeaveForm.reason.trim()) return;
              submitTeacherLeave({
                id: `tl-${Date.now()}`,
                teacherId: user?.userId || 'teacher01',
                teacherName: user?.name || 'Teacher',
                leaveType: myLeaveForm.leaveType,
                startDate: myLeaveForm.startDate,
                endDate: myLeaveForm.endDate,
                reason: myLeaveForm.reason.trim(),
                status: 'pending',
                submittedDate: todayStr,
              });
              setMyLeaveForm({ leaveType: 'Casual', startDate: todayStr, endDate: todayStr, reason: '' });
              notify(lang === 'bn' ? 'ছুটির আবেদন প্রধান শিক্ষকের নিকট পাঠানো হয়েছে!' : 'Leave application submitted!');
            }}
            className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h4 className="font-extrabold text-base">{lang === 'bn' ? 'নিজের ছুটির আবেদন' : 'Apply for Teacher Leave'}</h4>
            <select value={myLeaveForm.leaveType} onChange={(e) => setMyLeaveForm((p) => ({ ...p, leaveType: e.target.value as 'Casual' | 'Sick' | 'Earned' | 'Emergency' }))} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold">
              <option value="Casual">Casual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Earned">Earned Leave</option>
              <option value="Emergency">Emergency Leave</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={myLeaveForm.startDate} onChange={(e) => setMyLeaveForm((p) => ({ ...p, startDate: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <input type="date" value={myLeaveForm.endDate} onChange={(e) => setMyLeaveForm((p) => ({ ...p, endDate: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <textarea required rows={3} value={myLeaveForm.reason} onChange={(e) => setMyLeaveForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Reason..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 text-white text-xs font-bold">Submit Application</button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {teacherLeaves.map((tl) => (
              <div key={tl.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">{tl.leaveType} ({tl.startDate} → {tl.endDate})</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg font-black uppercase ${tl.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : tl.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{tl.status}</span>
                    {tl.status === 'pending' && <button onClick={() => deleteTeacherLeave(tl.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{tl.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. Student Leave Approval */}
      {activeTab === 'student-leaves' && (
        <div className="space-y-3">
          {studentLeaves.map((sl) => (
            <div key={sl.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                <span className="font-extrabold text-sm">{sl.studentName} — Class {sl.classId} (Roll {sl.roll})</span>
                <span className={`px-2.5 py-1 rounded-lg font-black uppercase ${sl.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : sl.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{sl.status}</span>
              </div>
              <p className="text-xs text-slate-400 font-bold">{sl.leaveType} • {sl.startDate} → {sl.endDate}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{sl.reason}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <input
                  value={studentRemarks[sl.id] || ''}
                  onChange={(e) => setStudentRemarks((p) => ({ ...p, [sl.id]: e.target.value }))}
                  placeholder={lang === 'bn' ? 'মন্তব্য (ঐচ্ছিক)' : 'Remark (optional)'}
                  className="flex-1 min-w-[180px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  onClick={() => updateStudentLeaveStatus(sl.id, 'approved', user?.name || 'Teacher', studentRemarks[sl.id])}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => updateStudentLeaveStatus(sl.id, 'rejected', user?.name || 'Teacher', studentRemarks[sl.id])}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button onClick={() => deleteStudentLeave(sl.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FeeReceiptModal fee={activeReceipt} onClose={() => setActiveReceipt(null)} />
      {idCardStudent && (
        <StudentIdAdmitCard
          open={Boolean(idCardStudent)}
          onClose={() => setIdCardStudent(null)}
          studentName={idCardStudent.name}
          classId={idCardStudent.classId}
          roll={idCardStudent.roll}
          section={idCardStudent.section}
          guardianMobile={idCardStudent.guardianMobile}
          guardianName={idCardStudent.guardianName}
          photoUrl={idCardStudent.photo}
          registrationDate={idCardStudent.registrationDate}
          session={idCardStudent.session}
          initialMode={idCardMode}
          rosterStudents={students.filter((s) => s.classId === idCardStudent.classId)}
          onSaveStudentDetails={(updates) => {
            const target =
              students.find((s) => s.classId === updates.classId && s.roll === updates.roll) ||
              idCardStudent;
            updateStudent({
              ...target,
              guardianName: updates.guardianName ?? target.guardianName,
              guardianMobile: updates.guardianMobile ?? target.guardianMobile,
              photo: updates.photo ?? target.photo,
              registrationDate: updates.registrationDate ?? target.registrationDate,
              session: updates.session ?? target.session,
            });
            notify(lang === 'bn' ? 'কার্ডের তথ্য ও ছবি সংরক্ষিত হয়েছে!' : 'Card details saved to student record!');
          }}
        />
      )}
      {certStudent && (
        <StudentCertificateModal
          open={Boolean(certStudent)}
          onClose={() => setCertStudent(null)}
          studentName={certStudent.name}
          classId={certStudent.classId}
          roll={certStudent.roll}
          section={certStudent.section}
        />
      )}
    </div>
  );
};
