import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpenCheck,
  Award,
  ClipboardCheck,
  Bell,
  CalendarPlus,
  CheckCircle2,
  Calendar,
  Trash2,
  BookOpen,
  Trophy,
  TrendingUp,
  Send,
  FileText,
  ShieldCheck,
  Receipt,
  Printer,
  Download,
  Megaphone,
  IdCard,
  ClipboardList,
  FileBadge2,
  Sparkles,
  Loader2,
  AlertCircle,
  Lock,
  Search,
  LogOut,
  Camera,
  Menu,
  X,
  Clock,
  GraduationCap,
  Wallet,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../App';
import {
  CLASS_9_10_GROUPS,
  Class910GroupId,
  getNctbSubjectsForClass,
  normalizeClassGroup,
} from '../utils/teacherRole';
import { buildNctbClassSyllabus } from '../utils/nctbSyllabus';
import { downloadSyllabusPdf } from '../utils/syllabusPdf';
import { generateLocalStudyLesson, generateLocalMcqQuestions } from '../utils/localSchoolAi';
import { FeeRecord, ExamQuestion, Holiday, StudyGroup } from '../types';
import { calculateOverallGpa, isSafeHttpUrl, buildStudentRegistrationNo, normalizeStudentRegistrationNo } from '../utils/security';
import { exportCsv } from '../utils/exportUtils';
import { compressImageFile } from '../utils/imageUtils';
import {
  getDhakaTodayISO,
  getDhakaYear,
  extractIsoDate,
  formatNoticeDateBadge,
  formatDhakaClock,
} from '../utils/dhakaTime';
import { heroCampusImg } from '../src/assets/media';
import { AcademicReportCard } from './AcademicReportCard';
import { FeeReceiptModal } from './FeeReceiptModal';
import { StudentIdAdmitCard, CardMode } from './StudentIdAdmitCard';
import { StudentCertificateModal } from './StudentCertificateModal';

const { useState, useMemo, useEffect, useRef } = React;
const { Link } = RouterDom;

type StudentTab =
  | 'dashboard'
  | 'syllabus'
  | 'homework'
  | 'marks'
  | 'progress'
  | 'attendance'
  | 'fees'
  | 'materials'
  | 'ai-tutor'
  | 'leave'
  | 'notices'
  | 'holidays';

export const StudentPortal: React.FC = () => {
  const {
    lang,
    t,
    user,
    firebaseUser,
    logout,
    settings,
    notices,
    holidays,
    students,
    attendanceRecords,
    studentAttendance,
    homeworkList,
    assignmentSubmissions,
    submitAssignment,
    examMarks,
    examRoutines,
    ebooks,
    studentLeaves,
    submitStudentLeave,
    deleteStudentLeave,
    feeRecords,
    portalNotifications,
    subjects,
    onlineExams,
    updateStudent,
    updateUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>(user?.linkedChildClass || '9');
  const [selectedRoll, setSelectedRoll] = useState<string>(user?.linkedChildRoll || '01');
  const [syllabusGroupFilter, setSyllabusGroupFilter] = useState<'All' | StudyGroup>('All');
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [downloadingSyllabus, setDownloadingSyllabus] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<FeeRecord | null>(null);
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [idCardMode, setIdCardMode] = useState<CardMode>('id');
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [holidayFilter, setHolidayFilter] = useState<'All' | 'National' | 'Religious' | 'Seasonal'>('All');
  const [nowTick, setNowTick] = useState<Date>(() => new Date());

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => getDhakaTodayISO(nowTick), [nowTick]);
  const activeYear = useMemo(() => getDhakaYear(nowTick), [nowTick]);
  const dhakaClockText = useMemo(() => formatDhakaClock(lang, nowTick), [lang, nowTick]);

  const openCardModal = (mode: CardMode) => {
    setIdCardMode(mode);
    setIdCardOpen(true);
  };

  // AI Study Lab state
  const [studyMode, setStudyMode] = useState<'explain' | 'generate_mcq'>('explain');
  const [studyGroup, setStudyGroup] = useState<'all' | Class910GroupId>('all');
  const [studySubject, setStudySubject] = useState<string>('Mathematics');
  const [studyTopic, setStudyTopic] = useState('');
  const [studyQuestion, setStudyQuestion] = useState('');
  const [studyLoading, setStudyLoading] = useState(false);
  const [studyError, setStudyError] = useState<string | null>(null);
  const [studyExplanation, setStudyExplanation] = useState<string | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<ExamQuestion[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);

  const studySubjectOptions = useMemo(
    () =>
      getNctbSubjectsForClass(
        selectedClassId,
        selectedClassId === '9' || selectedClassId === '10' ? studyGroup : 'all'
      ),
    [selectedClassId, studyGroup]
  );

  useEffect(() => {
    const subs = studySubjectOptions.map((s) => s.id);
    if (subs.length > 0 && !subs.includes(studySubject)) {
      setStudySubject(subs[0]);
    }
  }, [studySubjectOptions, studySubject]);

  useEffect(() => {
    if (user?.linkedChildClass) setSelectedClassId(user.linkedChildClass);
    if (user?.linkedChildRoll) setSelectedRoll(user.linkedChildRoll);
  }, [user?.linkedChildClass, user?.linkedChildRoll]);

  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);
  const [submissionAnswer, setSubmissionAnswer] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Sick' as 'Sick' | 'Family' | 'Emergency' | 'Other',
    startDate: todayStr,
    endDate: todayStr,
    reason: '',
  });

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const matchedStudent = useMemo(
    () =>
      (user?.linkedStudentId
        ? students.find((s) => s.id === user.linkedStudentId)
        : undefined) ||
      students.find((s) => s.classId === selectedClassId && s.roll.trim() === selectedRoll.trim()),
    [students, user?.linkedStudentId, selectedClassId, selectedRoll]
  );

  useEffect(() => {
    if (matchedStudent?.roll && matchedStudent.roll !== selectedRoll) {
      setSelectedRoll(matchedStudent.roll);
    }
    const detected = normalizeClassGroup(matchedStudent?.section || user?.section);
    if ((selectedClassId === '9' || selectedClassId === '10') && detected) {
      setStudyGroup(detected);
    } else if (selectedClassId !== '9' && selectedClassId !== '10') {
      setStudyGroup('all');
    }
  }, [matchedStudent?.roll, matchedStudent?.section, user?.section, selectedClassId]);

  const studentRegNo = normalizeStudentRegistrationNo(
    user?.registrationNo || matchedStudent?.registrationNo,
    selectedClassId,
    selectedRoll,
    matchedStudent?.session || String(activeYear)
  ) || buildStudentRegistrationNo(selectedClassId, selectedRoll, matchedStudent?.session || String(activeYear));

  const studentPhoto = matchedStudent?.photo || user?.photo || '';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 500, 0.75);
      if (matchedStudent) {
        updateStudent({ ...matchedStudent, photo: compressed });
      }
      if (user) {
        await updateUser({ ...user, photo: compressed });
      }
      notify(lang === 'bn' ? 'প্রোফাইল ছবি আপডেট হয়েছে!' : 'Profile photo updated!');
    } catch {
      notify(lang === 'bn' ? 'ছবি আপলোড করা যায়নি।' : 'Failed to update profile photo.');
    } finally {
      e.target.value = '';
    }
  };

  const classHomeworks = useMemo(
    () => homeworkList.filter((h) => h.classId === selectedClassId),
    [homeworkList, selectedClassId]
  );

  const mySubmittedCount = useMemo(
    () =>
      classHomeworks.filter((hw) =>
        assignmentSubmissions.some(
          (s) => s.homeworkId === hw.id && (s.roll === selectedRoll.trim() || s.studentName === user?.name)
        )
      ).length,
    [classHomeworks, assignmentSubmissions, selectedRoll, user?.name]
  );

  const myMarks = useMemo(
    () =>
      examMarks.filter((m) => {
        if (m.classId !== selectedClassId) return false;
        if (matchedStudent && m.studentId) {
          return m.studentId === matchedStudent.id;
        }
        return m.roll.trim() === selectedRoll.trim() || !selectedRoll.trim();
      }),
    [examMarks, selectedClassId, selectedRoll, matchedStudent]
  );

  const gpaSummary = useMemo(() => calculateOverallGpa(myMarks), [myMarks]);

  const myAttendance = useMemo(() => {
    const byDate = new Map<string, { id: string; date: string; status: string; teacherName: string }>();
    studentAttendance
      .filter((sa) => sa.classId === selectedClassId && sa.roll === selectedRoll.trim())
      .forEach((sa) => {
        byDate.set(sa.date, {
          id: sa.id,
          date: sa.date,
          status: sa.status,
          teacherName: sa.teacherName,
        });
      });

    attendanceRecords
      .filter((r) => r.classId === selectedClassId)
      .forEach((sheet) => {
        const st = matchedStudent ? sheet.records?.[matchedStudent.id] : undefined;
        if (st && !byDate.has(sheet.date)) {
          byDate.set(sheet.date, {
            id: sheet.id,
            date: sheet.date,
            status: st,
            teacherName: sheet.teacherName,
          });
        }
      });

    return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [studentAttendance, attendanceRecords, selectedClassId, selectedRoll, matchedStudent]);

  const attendancePct = useMemo(() => {
    if (myAttendance.length === 0) return 0;
    const present = myAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    return Math.round((present / myAttendance.length) * 100);
  }, [myAttendance]);

  const classMaterials = useMemo(
    () => ebooks.filter((b) => b.classId === selectedClassId),
    [ebooks, selectedClassId]
  );

  const classExamRoutine = useMemo(
    () => examRoutines.filter((r) => r.classId === selectedClassId),
    [examRoutines, selectedClassId]
  );

  const myLeaves = useMemo(
    () =>
      studentLeaves.filter(
        (l) =>
          l.classId === selectedClassId &&
          (l.roll === selectedRoll.trim() || l.studentName === user?.name || l.ownerUid === user?.userId)
      ),
    [studentLeaves, selectedClassId, selectedRoll, user]
  );

  const myFees = useMemo(
    () =>
      feeRecords
        .filter((f) => f.classId === selectedClassId && f.roll.trim() === selectedRoll.trim())
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [feeRecords, selectedClassId, selectedRoll]
  );

  const feeSummary = useMemo(() => {
    const totalBilled = myFees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = myFees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalDue = myFees.reduce((sum, f) => (f.status === 'waived' ? sum : sum + Math.max(0, f.amount - f.paidAmount)), 0);
    const clearedCount = myFees.filter((f) => f.status === 'paid' || f.status === 'waived').length;
    return { totalBilled, totalPaid, totalDue, clearedCount };
  }, [myFees]);

  const isPaymentComplete = feeSummary.totalDue <= 0;
  const isAdminApproved = Boolean(matchedStudent?.admitCardApproved);
  const canDownloadAdmitCard = Boolean(matchedStudent) && isPaymentComplete && isAdminApproved;

  const handleAdmitCardClick = () => {
    if (!matchedStudent) {
      notify(lang === 'bn' ? 'শিক্ষার্থীর প্রোফাইল পাওয়া যায়নি।' : 'Student profile not found.');
      return;
    }
    if (!isPaymentComplete) {
      notify(
        lang === 'bn'
          ? `অ্যাডমিট কার্ড পেতে আপনার বকেয়া ফি ৳${feeSummary.totalDue.toLocaleString()} সম্পূর্ণ পরিশোধ করতে হবে।`
          : `Complete your remaining fee payment (৳${feeSummary.totalDue.toLocaleString()}) to unlock your Admit Card.`
      );
      setActiveTab('fees');
      return;
    }
    if (!isAdminApproved) {
      notify(
        lang === 'bn'
          ? 'ফি পরিশোধিত রয়েছে। পরীক্ষার জন্য অ্যাডমিনের অনুমোদনের পর এখান থেকে অ্যাডমিট কার্ড প্রিন্ট করতে পারবেন।'
          : 'Fees are cleared. Your Admit Card will unlock once approved by Admin for the exam.'
      );
      return;
    }
    openCardModal('admit');
  };

  const targetedAlerts = useMemo(
    () =>
      portalNotifications.filter(
        (n) =>
          (n.targetRole === 'all' || n.targetRole === 'student') &&
          (!n.classId || n.classId === 'all' || n.classId === selectedClassId)
      ),
    [portalNotifications, selectedClassId]
  );

  const activeYearHolidays = useMemo(() => {
    const list = holidays
      .filter((h) => {
        const iso = extractIsoDate(h.date);
        return !iso || iso.startsWith(`${activeYear}-`);
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    return list.length > 0 ? list : [...holidays].sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, activeYear]);

  const filteredHolidays = useMemo(() => {
    if (holidayFilter === 'All') return activeYearHolidays;
    return activeYearHolidays.filter((h) => h.type === holidayFilter);
  }, [activeYearHolidays, holidayFilter]);

  const upcomingHolidays = useMemo(() => {
    const future = activeYearHolidays.filter((h) => extractIsoDate(h.date) >= todayStr);
    return (future.length > 0 ? future : activeYearHolidays).slice(0, 4);
  }, [activeYearHolidays, todayStr]);

  const quickSearchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{ label: string; category: string; tab: StudentTab }> = [];

    classHomeworks.forEach((hw) => {
      if (hw.title.toLowerCase().includes(q) || hw.subject.toLowerCase().includes(q)) {
        results.push({ label: `${hw.subject}: ${hw.title}`, category: lang === 'bn' ? 'অ্যাসাইনমেন্ট' : 'Assignment', tab: 'homework' });
      }
    });
    notices.forEach((n) => {
      const title = t(n.title);
      if (title.toLowerCase().includes(q)) {
        results.push({ label: title, category: lang === 'bn' ? 'নোটিশ' : 'Notice', tab: 'notices' });
      }
    });
    activeYearHolidays.forEach((h) => {
      const title = t(h.title);
      if (title.toLowerCase().includes(q) || h.date.includes(q)) {
        results.push({ label: `${title} (${h.date})`, category: lang === 'bn' ? 'ছুটি' : 'Holiday', tab: 'holidays' });
      }
    });
    classMaterials.forEach((eb) => {
      const title = t(eb.title);
      if (title.toLowerCase().includes(q) || eb.subject.toLowerCase().includes(q)) {
        results.push({ label: title, category: lang === 'bn' ? 'স্টাডি ম্যাটেরিয়াল' : 'Material', tab: 'materials' });
      }
    });
    return results.slice(0, 6);
  }, [searchQuery, classHomeworks, notices, activeYearHolidays, classMaterials, t, lang]);

  const handleAssignmentSubmit = (e: React.FormEvent, hwId: string, subject: string) => {
    e.preventDefault();
    if (!submissionAnswer.trim()) return;
    if (submissionLink.trim() && !isSafeHttpUrl(submissionLink.trim())) {
      notify(lang === 'bn' ? 'দয়া করে বৈধ http/https লিংক দিন।' : 'Please enter a valid http/https URL.');
      return;
    }
    submitAssignment({
      id: `sub-${Date.now()}`,
      homeworkId: hwId,
      classId: selectedClassId,
      subject,
      studentId: matchedStudent?.id || user?.userId || 'student01',
      studentName: matchedStudent?.name || user?.name || 'Student',
      roll: selectedRoll.trim() || '01',
      answerText: submissionAnswer.trim(),
      ...(submissionLink.trim() ? { attachmentUrl: submissionLink.trim() } : {}),
      status: 'submitted',
      submittedDate: todayStr,
    });
    setSubmittingHwId(null);
    setSubmissionAnswer('');
    setSubmissionLink('');
    notify(lang === 'bn' ? 'অ্যাসাইনমেন্ট সফলভাবে জমা হয়েছে!' : 'Assignment submitted successfully!');
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) return;
    submitStudentLeave({
      id: `sl-${Date.now()}`,
      studentId: matchedStudent?.id || user?.userId || 'student01',
      studentName: matchedStudent?.name || user?.name || 'Student',
      roll: selectedRoll.trim() || '01',
      classId: selectedClassId,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason.trim(),
      status: 'pending',
      submittedDate: todayStr,
    });
    setLeaveForm({ leaveType: 'Sick', startDate: todayStr, endDate: todayStr, reason: '' });
    notify(lang === 'bn' ? 'ছুটির আবেদন শিক্ষকের কাছে পাঠানো হয়েছে!' : 'Leave application sent to teacher!');
  };

  const handleRunStudyLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studyMode === 'explain' && !studyTopic.trim() && !studyQuestion.trim()) {
      setStudyError(lang === 'bn' ? 'অধ্যায় বা প্রশ্ন লিখুন।' : 'Please enter a topic or question.');
      return;
    }
    setStudyLoading(true);
    setStudyError(null);
    if (studyMode === 'explain') {
      setStudyExplanation(null);
    } else {
      setPracticeQuestions([]);
      setPracticeAnswers({});
      setPracticeSubmitted(false);
    }

    const applyLocalFallback = () => {
      if (studyMode === 'explain') {
        setStudyExplanation(
          generateLocalStudyLesson({
            classId: selectedClassId,
            subject: studySubject,
            topic: studyTopic.trim(),
            question: studyQuestion.trim(),
            lang,
          })
        );
      } else {
        setPracticeQuestions(
          generateLocalMcqQuestions({
            classId: selectedClassId,
            subject: studySubject,
            topic: studyTopic.trim(),
            lang,
            count: 4,
            existingExams: onlineExams,
          })
        );
      }
    };

    try {
      const res = await fetch('/api/ai-study-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: studyMode,
          classId: selectedClassId,
          subject: studySubject,
          topic: studyTopic.trim(),
          question: studyQuestion.trim(),
          lang,
          count: 4,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        applyLocalFallback();
        return;
      }
      if (studyMode === 'explain') {
        if (typeof data?.reply === 'string' && data.reply.trim()) {
          setStudyExplanation(data.reply);
        } else {
          applyLocalFallback();
        }
      } else if (Array.isArray(data?.questions) && data.questions.length > 0) {
        setPracticeQuestions(data.questions);
      } else {
        applyLocalFallback();
      }
    } catch {
      applyLocalFallback();
    } finally {
      setStudyLoading(false);
    }
  };

  const navItems: Array<{
    id: StudentTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeTone?: 'amber' | 'emerald';
  }> = [
    { id: 'dashboard', label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { id: 'syllabus', label: lang === 'bn' ? 'NCTB সিলেবাস' : 'NCTB Syllabus', icon: BookOpen },
    {
      id: 'homework',
      label: lang === 'bn' ? 'অ্যাসাইনমেন্ট' : 'Assignments',
      icon: BookOpenCheck,
      badge: classHomeworks.length > 0 ? classHomeworks.length : undefined,
      badgeTone: 'emerald',
    },
    { id: 'marks', label: lang === 'bn' ? 'পরীক্ষার ফলাফল' : 'Exam Results', icon: Award },
    { id: 'progress', label: lang === 'bn' ? 'পড়াশোনার অগ্রগতি' : 'Academic Progress', icon: TrendingUp },
    { id: 'attendance', label: lang === 'bn' ? 'উপস্থিতি' : 'Attendance', icon: ClipboardCheck },
    {
      id: 'fees',
      label: lang === 'bn' ? 'ফি ও রশিদ' : 'Payments & Fees',
      icon: Receipt,
      badge: feeSummary.totalDue > 0 ? `৳${feeSummary.totalDue.toLocaleString()}` : undefined,
      badgeTone: 'amber',
    },
    { id: 'materials', label: lang === 'bn' ? 'বই ও নোটস' : 'Study Materials', icon: FileText },
    { id: 'ai-tutor', label: lang === 'bn' ? 'AI স্টাডি ল্যাব' : 'AI Study Lab', icon: Sparkles },
    { id: 'leave', label: lang === 'bn' ? 'ছুটির আবেদন' : 'Apply Leave', icon: CalendarPlus },
    {
      id: 'notices',
      label: lang === 'bn' ? 'নোটিশ ও বার্তা' : 'Notifications',
      icon: Bell,
      badge: targetedAlerts.length + notices.length > 0 ? targetedAlerts.length + notices.length : undefined,
      badgeTone: 'emerald',
    },
    {
      id: 'holidays',
      label: lang === 'bn' ? `ছুটির তালিকা (${activeYear})` : `NCTB Holidays (${activeYear})`,
      icon: CalendarDays,
    },
  ];

  // Live 6-step automated student journey
  const journeySteps = [
    {
      title: lang === 'bn' ? 'নিবন্ধন' : 'Registration',
      statusText: lang === 'bn' ? 'সম্পন্ন' : 'Completed',
      done: true,
      icon: CheckCircle2,
      tone: 'bg-emerald-600 text-white',
    },
    {
      title: lang === 'bn' ? 'শ্রেণী তালিকা' : 'Enrollment',
      statusText: matchedStudent
        ? lang === 'bn'
          ? `শ্রেণী ${selectedClassId} · রোল ${selectedRoll}`
          : `Class ${selectedClassId} · Roll ${selectedRoll}`
        : lang === 'bn'
        ? 'প্রোফাইল যাচাই'
        : 'Pending Match',
      done: Boolean(matchedStudent),
      icon: GraduationCap,
      tone: matchedStudent ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500',
    },
    {
      title: lang === 'bn' ? 'ফি পরিশোধ' : 'Fee Payment',
      statusText: isPaymentComplete
        ? lang === 'bn'
          ? 'যাচাইকৃত'
          : 'Verified'
        : lang === 'bn'
        ? `বকেয়া ৳${feeSummary.totalDue.toLocaleString()}`
        : `Due ৳${feeSummary.totalDue.toLocaleString()}`,
      done: isPaymentComplete,
      icon: Wallet,
      tone: isPaymentComplete ? 'bg-amber-500 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    },
    {
      title: lang === 'bn' ? 'অ্যাডমিন অনুমোদন' : 'Admin Approval',
      statusText: isAdminApproved
        ? lang === 'bn'
          ? 'অনুমোদিত'
          : 'Approved'
        : lang === 'bn'
        ? 'অপেক্ষমাণ'
        : 'Pending',
      done: isAdminApproved,
      icon: ShieldCheck,
      tone: isAdminApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500',
    },
    {
      title: lang === 'bn' ? 'ডকুমেন্টস' : 'Documents',
      statusText: canDownloadAdmitCard
        ? lang === 'bn'
          ? 'সকল কার্ড প্রস্তুত'
          : 'All Unlocked'
        : lang === 'bn'
        ? 'আইডি ও রেজি প্রস্তুত'
        : 'ID & Reg Ready',
      done: Boolean(matchedStudent),
      icon: FileBadge2,
      tone: canDownloadAdmitCard ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
    },
    {
      title: lang === 'bn' ? 'পরীক্ষার প্রস্তুতি' : 'Exam Ready',
      statusText: canDownloadAdmitCard
        ? lang === 'bn'
          ? 'অ্যাডমিট উন্মুক্ত'
          : 'Admit Ready!'
        : myMarks.length > 0
        ? lang === 'bn'
          ? `${myMarks.length} বিষয় প্রকাশিত`
          : `${myMarks.length} Marks Published`
        : lang === 'bn'
        ? 'চলমান'
        : 'In Progress',
      done: canDownloadAdmitCard,
      icon: Trophy,
      tone: canDownloadAdmitCard ? 'bg-yellow-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-500',
    },
  ];

  const isHolidayUpcoming = (h: Holiday) => {
    const iso = extractIsoDate(h.date);
    return iso >= todayStr;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 flex flex-col lg:flex-row">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Mobile Sidebar Drawer Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[130] lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-emerald-950 text-white flex flex-col h-full shadow-2xl overflow-y-auto">
            <div className="p-5 border-b border-emerald-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-xs truncate">{t(settings.name)}</p>
                  <p className="text-[10px] text-emerald-300 font-bold">EIIN {settings.eiin} · Student</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg hover:bg-emerald-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-emerald-700 text-white shadow-md'
                        : 'text-emerald-100/80 hover:bg-emerald-900/70 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                          item.badgeTone === 'amber' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/30 text-emerald-100'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 m-3 rounded-2xl bg-emerald-900/60 border border-emerald-800/80 text-center space-y-1">
              <GraduationCap className="w-6 h-6 text-yellow-300 mx-auto" />
              <p className="text-xs font-black text-white">{t(settings.name)}</p>
              <p className="text-[10px] text-emerald-200/80">Smart Education · Brighter Future</p>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Left Forest-Green Sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-68 shrink-0 bg-emerald-950 text-white flex-col justify-between border-r border-emerald-900">
        <div>
          <div className="p-5 border-b border-emerald-900/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-600/40 flex items-center justify-center shrink-0 shadow-sm">
              <GraduationCap className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-xs leading-snug line-clamp-2 text-white">{t(settings.name)}</p>
              <p className="text-[10px] font-bold text-emerald-300 mt-0.5">
                {lang === 'bn' ? 'শিক্ষার্থী পোর্টাল' : 'Student Portal'} · EIIN {settings.eiin}
              </p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'text-emerald-100/80 hover:bg-emerald-900/70 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                        item.badgeTone === 'amber' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/30 text-emerald-100'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 m-3 rounded-2xl bg-emerald-900/60 border border-emerald-800/70 text-center space-y-1.5">
          <GraduationCap className="w-7 h-7 text-yellow-300 mx-auto" />
          <p className="text-xs font-black text-white">{t(settings.name)}</p>
          <p className="text-[10px] text-emerald-200/80">
            {lang === 'bn' ? 'স্মার্ট শিক্ষা, উজ্জ্বল ভবিষ্যৎ' : 'Smart Education · Brighter Future'}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-md relative">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'bn' ? 'অ্যাসাইনমেন্ট, নোটিশ বা ছুটি খুঁজুন...' : 'Search homework, notices, holidays...'}
                  className="w-full pl-9 pr-8 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {quickSearchMatches.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                    {quickSearchMatches.map((item, idx) => (
                      <button
                        key={`${item.tab}-${idx}`}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.tab);
                          setSearchQuery('');
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.label}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live GMT+6 Dhaka Clock */}
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>{dhakaClockText}</span>
              </div>

              {/* Notifications Bell */}
              <button
                type="button"
                onClick={() => setActiveTab('notices')}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-colors"
                title={lang === 'bn' ? 'নোটিশ ও ঘোষণা' : 'Notifications'}
              >
                <Bell className="w-4 h-4" />
                {targetedAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center tabular-nums">
                    {targetedAlerts.length}
                  </span>
                )}
              </button>

              {/* Profile & Avatar Upload */}
              <div className="flex items-center gap-2.5 pl-1">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center">
                    {studentPhoto ? (
                      <img src={studentPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    title={lang === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Upload Photo'}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow flex items-center justify-center text-emerald-700 dark:text-emerald-400"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white max-w-[140px] truncate">
                    {matchedStudent?.name || user?.name || 'Student'}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {studentRegNo}
                  </p>
                </div>
              </div>

              {user?.role === 'student' && (
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable Canvas */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Admin/Teacher Preview Selector (never editable by logged-in students) */}
          {(!user || user.role !== 'student') && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    {lang === 'bn' ? 'শ্রেণী' : 'Class'}
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    {['6', '7', '8', '9', '10'].map((c) => (
                      <option key={c} value={c}>
                        {lang === 'bn' ? `${c}ম শ্রেণী` : `Class ${c}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    {lang === 'bn' ? 'রোল নম্বর' : 'Roll No'}
                  </label>
                  <input
                    maxLength={20}
                    value={selectedRoll}
                    onChange={(e) => setSelectedRoll(e.target.value)}
                    placeholder="01"
                    className="w-24 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  />
                </div>
                {matchedStudent && (
                  <div className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
                    {firebaseUser && <ShieldCheck className="w-4 h-4" />}
                    {matchedStudent.name} ({matchedStudent.section})
                  </div>
                )}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                {dhakaClockText}
              </div>
            </div>
          )}

          {/* DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Campus Hero Welcome Banner */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-emerald-900/20 min-h-[180px] flex items-center">
                <img
                  src={settings.schoolPhoto || heroCampusImg}
                  alt="Campus"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/92 via-emerald-900/80 to-emerald-800/60" />
                <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 border border-emerald-400/30 text-[11px] font-extrabold tracking-wide">
                      <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
                      <span>
                        {lang === 'bn'
                          ? `${selectedClassId}ম শ্রেণী · রোল ${selectedRoll}${matchedStudent?.section ? ` · ${matchedStudent.section}` : ''}`
                          : `Class ${selectedClassId} · Roll ${selectedRoll}${matchedStudent?.section ? ` · ${matchedStudent.section}` : ''}`}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {lang === 'bn'
                        ? `${t(settings.name)} — ডিজিটাল ক্যাম্পাস`
                        : `Welcome to ${t(settings.name)}`}
                    </h1>
                    <p className="text-xs sm:text-sm text-emerald-100/90 font-semibold">
                      {lang === 'bn'
                        ? `স্বাগতম, ${matchedStudent?.name || user?.name || 'শিক্ষার্থী'}! আপনার পড়াশোনা, ফলাফল, ফি ও পরীক্ষার অ্যাডমিট কার্ড একসাথে এখানে।`
                        : `Welcome back, ${matchedStudent?.name || user?.name || 'Student'}! Your complete educational journey, fees, results, and official cards in one place.`}
                    </p>
                    <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-bold">
                      <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white">
                        Smart • Secure • Automated
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/15 text-emerald-50 tabular-nums">
                        Reg: {studentRegNo}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block text-right shrink-0">
                    <p className="text-base font-black text-yellow-300 italic leading-snug">
                      Together Towards a
                      <br />
                      Better Tomorrow
                    </p>
                    <div className="h-0.5 w-28 bg-yellow-400/80 ml-auto mt-1.5 rounded-full" />
                  </div>
                </div>
              </div>

              {/* 4 Live-Data KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'উপস্থিতির হার' : 'Attendance Rate'}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{attendancePct}%</p>
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {myAttendance.length} {lang === 'bn' ? 'দিন রেকর্ডকৃত' : 'days recorded'}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'বর্তমান জিপিএ' : 'Current GPA'}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{gpaSummary.gpa}</p>
                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                      {myMarks.length} {lang === 'bn' ? 'বিষয়ে নম্বর প্রকাশিত' : 'subjects graded'}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'বেতন ও ফি স্ট্যাটাস' : 'Fee Status'}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      {isPaymentComplete ? (lang === 'bn' ? 'পরিশোধিত' : 'Cleared') : `৳${feeSummary.totalDue.toLocaleString()}`}
                    </p>
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                      {feeSummary.clearedCount}/{myFees.length} {lang === 'bn' ? 'টি রশিদ পরিশোধিত' : 'invoices cleared'}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <BookOpenCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'হোমওয়ার্ক ও নোটস' : 'Assignments & Notes'}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{classHomeworks.length}</p>
                    <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 tabular-nums">
                      {mySubmittedCount} {lang === 'bn' ? 'টি জমা' : 'submitted'} · {classMaterials.length} {lang === 'bn' ? 'নোটস' : 'notes'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 6-Step Automated Workflow */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {lang === 'bn'
                        ? 'আপনার সম্পূর্ণ শিক্ষাজীবন যাত্রা – অটোমেটেড ওয়ার্কফ্লো'
                        : 'Your Complete Journey – Automated Workflow'}
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {lang === 'bn' ? 'রিয়েল-টাইম পোর্টাল স্ট্যাটাস' : 'Live Portal Status'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {journeySteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.title}
                        className="relative p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-center space-y-2"
                      >
                        <div className="flex items-center justify-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${step.tone}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {lang === 'bn' ? `ধাপ ${index + 1}` : `Step ${index + 1}`}
                          </p>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">{step.title}</p>
                          <p
                            className={`text-[11px] font-bold ${
                              step.done ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {step.statusText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Official Documents + Examination Admit Card */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'আপনার অফিশিয়াল ডকুমেন্ট ও কার্ডসমূহ' : 'Your Official Documents & Cards'}
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    {lang === 'bn' ? 'প্রিন্ট ও পিডিএফ প্রস্তুত' : 'Print & PDF Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <IdCard className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'স্টুডেন্ট আইডি কার্ড' : 'Student ID Card'}
                    </p>
                    <button
                      type="button"
                      onClick={() => openCardModal('id')}
                      className="w-full py-2 px-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold whitespace-nowrap"
                    >
                      {lang === 'bn' ? 'দেখুন / প্রিন্ট' : 'View / Download'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <FileBadge2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'রেজিস্ট্রেশন কার্ড' : 'Registration Card'}
                    </p>
                    <button
                      type="button"
                      onClick={() => openCardModal('reg')}
                      className="w-full py-2 px-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold whitespace-nowrap"
                    >
                      {lang === 'bn' ? 'দেখুন / প্রিন্ট' : 'View / Download'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'একাডেমিক মার্কশিট' : 'Academic Report Card'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setReportCardOpen(true)}
                      className="w-full py-2 px-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold whitespace-nowrap"
                    >
                      {lang === 'bn' ? 'দেখুন / ডাউনলোড' : 'View / Download'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'প্রত্যয়নপত্র ও সনদ' : 'Certificates'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCertificateOpen(true)}
                      className="w-full py-2 px-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold whitespace-nowrap"
                    >
                      {lang === 'bn' ? 'দেখুন / প্রিন্ট' : 'View / Download'}
                    </button>
                  </div>

                  {/* Examination Admit Card — Gated on Paid + Admin Approved */}
                  <div
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                      canDownloadAdmitCard
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700'
                        : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          canDownloadAdmitCard
                            ? 'bg-emerald-700 text-white'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {canDownloadAdmitCard ? <ClipboardList className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          {lang === 'bn' ? 'পরীক্ষার অ্যাডমিট কার্ড' : 'Examination Admit Card'}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                          {canDownloadAdmitCard
                            ? matchedStudent?.admitCardTerm || (lang === 'bn' ? 'প্রিন্টের জন্য প্রস্তুত' : 'Ready to print')
                            : !isPaymentComplete
                            ? lang === 'bn'
                              ? `বকেয়া ৳${feeSummary.totalDue.toLocaleString()} পরিশোধ প্রয়োজন`
                              : `Clear fee due ৳${feeSummary.totalDue.toLocaleString()} first`
                            : lang === 'bn'
                            ? 'অ্যাডমিন অনুমোদনের অপেক্ষায়'
                            : 'Awaiting Admin Approval'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAdmitCardClick}
                      className={`w-full py-2 px-3 rounded-full text-[11px] font-bold whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
                        canDownloadAdmitCard
                          ? 'bg-emerald-900 hover:bg-emerald-950 text-white'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {canDownloadAdmitCard ? (
                        <>
                          <Printer className="w-3.5 h-3.5" />
                          {lang === 'bn' ? 'অ্যাডমিট প্রিন্ট' : 'View Admit Card'}
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          {!isPaymentComplete
                            ? lang === 'bn'
                              ? 'বকেয়া ফি দেখুন'
                              : 'Check Fee Due'
                            : lang === 'bn'
                            ? 'অপেক্ষমাণ'
                            : 'Approval Pending'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'দ্রুত কার্যক্রম' : 'Quick Actions'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('homework')}
                    className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 hover:border-sky-400 text-left flex items-center gap-2.5 transition-all"
                  >
                    <BookOpenCheck className="w-5 h-5 text-sky-600 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {lang === 'bn' ? 'হোমওয়ার্ক ও জমা' : 'Assignments'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 text-left flex items-center gap-2.5 transition-all"
                  >
                    <Receipt className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {lang === 'bn' ? 'ফি ও রশিদ' : 'Fees & Receipts'}
                    </span>
                  </button>
                  <Link
                    to="/exams"
                    className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:border-purple-400 text-left flex items-center gap-2.5 transition-all"
                  >
                    <Trophy className="w-5 h-5 text-purple-600 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {lang === 'bn' ? 'অনলাইন MCQ পরীক্ষা' : 'MCQ Exams'}
                    </span>
                  </Link>
                  <Link
                    to="/routine"
                    className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:border-amber-400 text-left flex items-center gap-2.5 transition-all"
                  >
                    <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {lang === 'bn' ? 'ক্লাস ও পরীক্ষার রুটিন' : 'Class & Exam Routine'}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveTab('syllabus')}
                    className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 hover:border-teal-400 text-left flex items-center gap-2.5 transition-all"
                  >
                    <BookOpen className="w-5 h-5 text-teal-600 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {lang === 'bn' ? `${selectedClassId}ম শ্রেণী NCTB সিলেবাস` : `Class ${selectedClassId} Syllabus`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Bottom 2-Column Preview: Notices + Upcoming NCTB Holidays */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {lang === 'bn' ? 'সাম্প্রতিক নোটিশ ও ঘোষণা' : 'Notifications & Notices'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('notices')}
                      className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline"
                    >
                      {lang === 'bn' ? 'সব দেখুন' : 'See All'} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {targetedAlerts.slice(0, 2).map((al) => (
                      <div
                        key={al.id}
                        className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase">
                          <span>{al.priority === 'urgent' ? (lang === 'bn' ? 'জরুরি' : 'Urgent') : (lang === 'bn' ? 'ঘোষণা' : 'Alert')}</span>
                          <span className="tabular-nums">{al.createdDate}</span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">{al.title}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{al.message}</p>
                      </div>
                    ))}
                    {notices.slice(0, 3).map((n) => {
                      const badge = formatNoticeDateBadge(n.date, lang);
                      return (
                        <div
                          key={n.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{t(n.title)}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                              {badge.dayLabel} {badge.monthLabel} {badge.yearLabel}
                              {badge.timeLabel ? ` · ${badge.timeLabel}` : ''}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                            {n.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {lang === 'bn' ? `এনসিটিবি ছুটির তালিকা (${activeYear})` : `NCTB Holiday Schedule (${activeYear})`}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('holidays')}
                      className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline"
                    >
                      {lang === 'bn' ? 'পূর্ণ তালিকা' : 'Full List'} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {upcomingHolidays.map((h) => {
                      const badge = formatNoticeDateBadge(h.date, lang);
                      return (
                        <div
                          key={h.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold uppercase leading-none">{badge.monthLabel}</span>
                              <span className="text-sm font-black tabular-nums leading-tight">{badge.dayLabel}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{t(h.title)}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                {t(h.duration)} · {h.type}
                              </p>
                            </div>
                          </div>
                          {isHolidayUpcoming(h) && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black shrink-0">
                              {lang === 'bn' ? 'আসন্ন' : 'Upcoming'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Homework + Online Assignment Submission */}
          {activeTab === 'homework' && (
            <div className="space-y-4">
              {classHomeworks.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-sm">
                  {lang === 'bn' ? 'এই শ্রেণীতে কোনো হোমওয়ার্ক নেই।' : 'No assignments for this class yet.'}
                </div>
              ) : (
                classHomeworks.map((hw) => {
                  const mySub = assignmentSubmissions.find(
                    (s) => s.homeworkId === hw.id && (s.roll === selectedRoll.trim() || s.studentName === user?.name)
                  );
                  const isOpen = submittingHwId === hw.id;
                  return (
                    <div
                      key={hw.id}
                      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-extrabold">
                          {hw.subject}
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                          {lang === 'bn' ? `জমার শেষ তারিখ: ${hw.dueDate}` : `Due: ${hw.dueDate}`}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{hw.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{hw.description}</p>

                      {mySub ? (
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-800 dark:text-emerald-300 uppercase">
                              {mySub.status === 'graded'
                                ? lang === 'bn'
                                  ? 'মূল্যায়ন সম্পন্ন'
                                  : 'Graded'
                                : lang === 'bn'
                                ? 'জমা দেওয়া হয়েছে'
                                : 'Submitted'}{' '}
                              ({mySub.submittedDate})
                            </span>
                            {typeof mySub.marks === 'number' && (
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white font-black">
                                {lang === 'bn' ? `নম্বর: ${mySub.marks}` : `Marks: ${mySub.marks}`}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 dark:text-slate-200">{mySub.answerText}</p>
                          {mySub.feedback && (
                            <p className="font-bold text-emerald-700 dark:text-emerald-400">
                              {lang === 'bn' ? 'শিক্ষকের মন্তব্য:' : 'Teacher Feedback:'} {mySub.feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          {!isOpen ? (
                            <button
                              type="button"
                              onClick={() => setSubmittingHwId(hw.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {lang === 'bn' ? 'উত্তর জমা দিন' : 'Submit Assignment'}
                            </button>
                          ) : (
                            <form
                              onSubmit={(e) => handleAssignmentSubmit(e, hw.id, hw.subject)}
                              className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-3 border border-slate-200 dark:border-slate-700"
                            >
                              <textarea
                                required
                                rows={3}
                                value={submissionAnswer}
                                onChange={(e) => setSubmissionAnswer(e.target.value)}
                                placeholder={lang === 'bn' ? 'আপনার উত্তর বা কাজের বিবরণ লিখুন...' : 'Write your assignment answer here...'}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
                              />
                              <input
                                type="url"
                                value={submissionLink}
                                onChange={(e) => setSubmissionLink(e.target.value)}
                                placeholder={lang === 'bn' ? 'গুগল ড্রাইভ / ছবির লিংক (ঐচ্ছিক)' : 'Drive / document link (optional)'}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
                              />
                              <div className="flex gap-2">
                                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold">
                                  {lang === 'bn' ? 'জমা নিশ্চিত করুন' : 'Confirm Submit'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSubmittingHwId(null)}
                                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                                >
                                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Exam Results */}
          {activeTab === 'marks' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'প্রকাশিত পরীক্ষার ফলাফল ও ট্রান্সক্রিপ্ট' : 'Published Marks & Official Transcript'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    GPA {gpaSummary.gpa} · {myMarks.length} {lang === 'bn' ? 'টি বিষয়' : 'subjects'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={myMarks.length === 0}
                    onClick={() =>
                      exportCsv(
                        `RBMB-Marks-Class${selectedClassId}-Roll${selectedRoll}`,
                        ['Term', 'Subject', 'Obtained', 'Total', 'Grade'],
                        myMarks.map((m) => [m.examTerm, m.subject, m.obtainedMarks, m.totalMarks, m.grade])
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'CSV ডাউনলোড' : 'Export CSV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportCardOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'মার্কশিট প্রিন্ট / PDF' : 'Print Report Card'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {myMarks.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 font-bold text-sm">
                    {lang === 'bn' ? 'এখনো পরীক্ষার নম্বর প্রকাশ করা হয়নি।' : 'No published exam marks yet.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-4">{lang === 'bn' ? 'পরীক্ষা' : 'Exam'}</th>
                          <th className="px-6 py-4">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                          <th className="px-6 py-4">{lang === 'bn' ? 'নম্বর' : 'Marks'}</th>
                          <th className="px-6 py-4 text-right">{lang === 'bn' ? 'গ্রেড' : 'Grade'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {myMarks.map((m) => (
                          <tr key={m.id}>
                            <td className="px-6 py-4 text-xs font-bold text-slate-500">{m.examTerm}</td>
                            <td className="px-6 py-4 font-extrabold">{m.subject}</td>
                            <td className="px-6 py-4 font-bold tabular-nums">
                              {m.obtainedMarks} / {m.totalMarks}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                                {m.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {classExamRoutine.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-extrabold text-sm mb-3">{lang === 'bn' ? 'আসন্ন পরীক্ষার রুটিন' : 'Upcoming Exam Schedule'}</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classExamRoutine.map((er) => (
                      <div key={er.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                        <p className="font-extrabold text-emerald-700 dark:text-emerald-400">{er.subject}</p>
                        <p className="font-bold">{er.date} • {er.time}</p>
                        <p className="text-slate-500">{er.examTerm} {er.room ? `(${er.room})` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Academic Progress */}
          {activeTab === 'progress' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base">{lang === 'bn' ? 'বিষয়ভিত্তিক একাডেমিক অগ্রগতি' : 'Academic Subject Mastery'}</h4>
                <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 tabular-nums">
                  GPA {gpaSummary.gpa} ({gpaSummary.averagePct}%)
                </span>
              </div>
              {myMarks.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  {lang === 'bn' ? 'নম্বর প্রকাশিত হলে বিষয়ভিত্তিক গ্রাফ দেখা যাবে।' : 'Progress bars appear once exam marks are published.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {myMarks.map((m) => {
                    const pct = m.totalMarks > 0 ? Math.round((m.obtainedMarks / m.totalMarks) * 100) : 0;
                    return (
                      <div key={m.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{m.subject}</span>
                          <span className="tabular-nums">
                            {m.obtainedMarks}/{m.totalMarks} ({pct}%) — {m.grade}
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Attendance */}
          {activeTab === 'attendance' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              {myAttendance.length === 0 ? (
                <p className="text-center text-slate-400 font-bold py-6 text-sm">
                  {lang === 'bn' ? 'হাজিরার তথ্য পাওয়া যায়নি।' : 'No attendance records found for this roll.'}
                </p>
              ) : (
                myAttendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="font-bold text-sm tabular-nums">{a.date}</p>
                      <p className="text-xs text-slate-400 font-semibold">{a.teacherName}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                        a.status === 'present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : a.status === 'absent'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Fees & Receipts */}
          {activeTab === 'fees' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'মোট নির্ধারিত ফি' : 'Total Billed'}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">৳{feeSummary.totalBilled.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'মোট পরিশোধিত' : 'Total Paid'}</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">৳{feeSummary.totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'বকেয়া পরিমাণ' : 'Balance Due'}</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">৳{feeSummary.totalDue.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {myFees.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 font-bold text-sm">
                    {lang === 'bn' ? 'কোনো বেতন বা ফি রেকর্ড পাওয়া যায়নি।' : 'No fee invoices recorded for this student yet.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-5 py-3.5">{lang === 'bn' ? 'ফি-এর বিবরণ' : 'Particular'}</th>
                          <th className="px-5 py-3.5">{lang === 'bn' ? 'শেষ তারিখ' : 'Due Date'}</th>
                          <th className="px-5 py-3.5 text-right tabular-nums">{lang === 'bn' ? 'ধার্যকৃত' : 'Amount'}</th>
                          <th className="px-5 py-3.5 text-right tabular-nums">{lang === 'bn' ? 'পরিশোধিত' : 'Paid'}</th>
                          <th className="px-5 py-3.5">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                          <th className="px-5 py-3.5 text-right">{lang === 'bn' ? 'রশিদ' : 'Receipt'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {myFees.map((f) => (
                          <tr key={f.id}>
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-slate-900 dark:text-white">{f.title}</p>
                              <p className="text-xs text-slate-400">
                                {f.category}
                                {f.billingMonth ? ` · ${f.billingMonth}` : ''}
                              </p>
                            </td>
                            <td className="px-5 py-3.5 text-xs font-semibold tabular-nums text-slate-500">{f.dueDate}</td>
                            <td className="px-5 py-3.5 text-right font-bold tabular-nums">৳{f.amount.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">৳{f.paidAmount.toLocaleString()}</td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                  f.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : f.status === 'partial'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : f.status === 'waived'
                                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {f.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => setActiveReceipt(f)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-700 hover:text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                {lang === 'bn' ? 'রশিদ' : 'Voucher'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Class-Locked NCTB Syllabus */}
          {activeTab === 'syllabus' && (() => {
            const classSyllabus = buildNctbClassSyllabus(selectedClassId, subjects);
            if (!classSyllabus) return null;
            const isSecondary = selectedClassId === '9' || selectedClassId === '10';
            const q = syllabusSearch.trim().toLowerCase();
            const visibleSubjects = classSyllabus.subjects.filter((sub) => {
              if (isSecondary && syllabusGroupFilter !== 'All') {
                if (syllabusGroupFilter === 'Common' && sub.group !== 'Common') return false;
                if (syllabusGroupFilter !== 'Common' && sub.group !== 'Common' && sub.group !== syllabusGroupFilter) {
                  return false;
                }
              }
              if (!q) return true;
              return (
                t(sub.name).toLowerCase().includes(q) ||
                t(sub.chaptersOutline).toLowerCase().includes(q) ||
                sub.code.includes(q) ||
                sub.chapters.some(
                  (ch) =>
                    t(ch.chapterTitle).toLowerCase().includes(q) ||
                    t(ch.topics).toLowerCase().includes(q)
                )
              );
            });

            const handleDownloadMySyllabus = async () => {
              if (downloadingSyllabus) return;
              const groupLabel = isSecondary
                ? syllabusGroupFilter === 'All'
                  ? lang === 'bn'
                    ? 'সকল বিভাগ'
                    : 'All Groups'
                  : syllabusGroupFilter === 'Science'
                  ? lang === 'bn'
                    ? 'বিজ্ঞান'
                    : 'Science'
                  : syllabusGroupFilter === 'Humanities'
                  ? lang === 'bn'
                    ? 'মানবিক'
                    : 'Humanities'
                  : syllabusGroupFilter === 'Business Studies'
                  ? lang === 'bn'
                    ? 'ব্যবসায় শিক্ষা'
                    : 'Business'
                  : lang === 'bn'
                  ? 'আবশ্যিক'
                  : 'Common'
                : undefined;

              setDownloadingSyllabus(true);
              try {
                await downloadSyllabusPdf({
                  schoolName: t(settings.name),
                  eiin: settings.eiin,
                  location: t(settings.location),
                  className: t(classSyllabus.className),
                  classId: selectedClassId,
                  year: String(activeYear),
                  lang,
                  groupLabel,
                  studentInfo: {
                    name: matchedStudent?.name || user?.name || 'Student',
                    roll: selectedRoll,
                  },
                  portalUrl: classSyllabus.nctbPortalUrl,
                  subjects: visibleSubjects,
                  translate: t,
                });
              } finally {
                setDownloadingSyllabus(false);
              }
            };

            return (
              <div className="space-y-5">
                <div className="bg-emerald-900 text-white rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-extrabold">
                      <Lock className="w-3 h-3 text-yellow-300" />
                      <span>
                        {lang === 'bn'
                          ? `শুধুমাত্র আপনার শ্রেণীর (${selectedClassId}ম শ্রেণী) সকল বিষয়ের সিলেবাস`
                          : `Locked to Your Class: Class ${selectedClassId} Only`}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black">
                      {t(classSyllabus.className)} — {lang === 'bn' ? 'NCTB পূর্ণাঙ্গ সিলেবাস' : 'Official NCTB Syllabus'}
                    </h3>
                    <p className="text-xs text-emerald-100/90 font-medium">
                      {lang === 'bn'
                        ? `মোট ${classSyllabus.subjects.length}টি অনুমোদিত বিষয় (অন্যান্য শ্রেণীর সিলেবাস লুকানো রয়েছে)।`
                        : `Showing all ${classSyllabus.subjects.length} NCTB subjects for your class (other classes are hidden).`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={downloadingSyllabus}
                      onClick={handleDownloadMySyllabus}
                      className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 disabled:opacity-70 disabled:cursor-wait text-xs font-black flex items-center gap-1.5"
                    >
                      {downloadingSyllabus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {downloadingSyllabus
                        ? lang === 'bn'
                          ? 'PDF তৈরি হচ্ছে...'
                          : 'Generating PDF...'
                        : lang === 'bn'
                        ? 'সিলেবাস ডাউনলোড'
                        : 'Download Syllabus'}
                    </button>
                    <a
                      href={classSyllabus.nctbPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 border border-emerald-500/40"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {lang === 'bn' ? 'NCTB বই দেখুন' : 'NCTB Textbooks'}
                    </a>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={syllabusSearch}
                      onChange={(e) => setSyllabusSearch(e.target.value)}
                      placeholder={lang === 'bn' ? 'আপনার শ্রেণীর বিষয় বা কোড খুঁজুন...' : 'Search subject or code...'}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  {isSecondary && (
                    <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {(
                        [
                          { id: 'All', bn: 'সকল বিষয়', en: 'All' },
                          { id: 'Common', bn: 'আবশ্যিক', en: 'Common' },
                          { id: 'Science', bn: 'বিজ্ঞান', en: 'Science' },
                          { id: 'Humanities', bn: 'মানবিক', en: 'Humanities' },
                          { id: 'Business Studies', bn: 'ব্যবসায় শিক্ষা', en: 'Business' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSyllabusGroupFilter(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            syllabusGroupFilter === tab.id
                              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {lang === 'bn' ? tab.bn : tab.en}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {visibleSubjects.map((sub, idx) => (
                    <div
                      key={`${sub.code}-${sub.group}-${idx}`}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                              {t(sub.name)}
                            </h4>
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 pl-6 mt-0.5">
                            {t(sub.marksBreakdown)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black tabular-nums">
                            {sub.totalMarks} {lang === 'bn' ? 'নম্বর' : 'Marks'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono tabular-nums">
                            #{sub.code}
                          </span>
                        </div>
                      </div>

                      {sub.chapters && sub.chapters.length > 0 && (
                        <div className="pl-4 space-y-2">
                          {sub.chapters.map((ch, chIdx) => (
                            <div
                              key={chIdx}
                              className="pl-3 border-l-2 border-emerald-500/40 bg-slate-50/70 dark:bg-slate-800/40 rounded-r-xl py-1.5 pr-2.5 space-y-0.5"
                            >
                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                                {t(ch.chapterTitle)}
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                {lang === 'bn' ? 'পাঠ্য টপিক: ' : 'Topics: '}
                                {t(ch.topics)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {isSecondary && (
                        <div className="pl-6">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                            {sub.group}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Study Materials */}
          {activeTab === 'materials' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classMaterials.length === 0 ? (
                <div className="sm:col-span-2 lg:col-span-3 p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-sm">
                  {lang === 'bn' ? 'এই শ্রেণীর জন্য এখনো নোটস যুক্ত হয়নি।' : 'No study materials uploaded for this class yet.'}
                </div>
              ) : (
                classMaterials.map((eb) => (
                  <div key={eb.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {eb.category || eb.subject}
                      </span>
                      <h4 className="font-extrabold text-sm mt-2">{t(eb.title)}</h4>
                      {eb.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t(eb.description)}</p>}
                    </div>
                    <Link
                      to="/ebooks"
                      className="text-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-700 hover:text-white text-xs font-bold transition-colors"
                    >
                      {lang === 'bn' ? 'লাইব্রেরিতে খুলুন' : 'Open in Library'}
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* AI Study Lab */}
          {activeTab === 'ai-tutor' && (
            <div className="grid lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleRunStudyLab}
                className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <h4 className="font-extrabold text-base">
                      {lang === 'bn' ? 'NCTB স্টাডি ও অনুশীলন ল্যাব' : 'NCTB AI Study Lab'}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                    Class {selectedClassId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setStudyMode('explain');
                      setStudyError(null);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      studyMode === 'explain'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'bn' ? 'টপিক ব্যাখ্যা' : 'Topic Explainer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudyMode('generate_mcq');
                      setStudyError(null);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      studyMode === 'generate_mcq'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'bn' ? 'অনুশীলন MCQ কুইজ' : 'Practice MCQ Quiz'}
                  </button>
                </div>

                {(selectedClassId === '9' || selectedClassId === '10') && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      {lang === 'bn' ? 'বিভাগ (Group)' : 'Group'}
                    </label>
                    <select
                      value={studyGroup}
                      onChange={(e) => setStudyGroup(e.target.value as 'all' | Class910GroupId)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                    >
                      <option value="all">{lang === 'bn' ? 'সকল বিভাগ (NCTB)' : 'All Groups (NCTB)'}</option>
                      {CLASS_9_10_GROUPS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {lang === 'bn' ? g.bn : g.en}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    {lang === 'bn' ? 'বিষয় (NCTB)' : 'Subject (NCTB)'}
                  </label>
                  <select
                    value={studySubject}
                    onChange={(e) => setStudySubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  >
                    {studySubjectOptions.map((sub) => (
                      <option key={`${sub.id}-${sub.group}`} value={sub.id}>
                        [{sub.code}] {lang === 'bn' ? sub.bn : sub.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    {lang === 'bn' ? 'অধ্যায় বা টপিক' : 'Chapter or Topic'}
                  </label>
                  <input
                    value={studyTopic}
                    onChange={(e) => setStudyTopic(e.target.value)}
                    placeholder={
                      lang === 'bn'
                        ? 'যেমন: পিথাগোরাসের উপপাদ্য / আলোর প্রতিসরণ / Tense'
                        : 'e.g. Pythagoras Theorem, Photosynthesis, Tense'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                {studyMode === 'explain' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      {lang === 'bn' ? 'আপনার প্রশ্ন (ঐচ্ছিক)' : 'Specific Question (optional)'}
                    </label>
                    <textarea
                      rows={3}
                      value={studyQuestion}
                      onChange={(e) => setStudyQuestion(e.target.value)}
                      placeholder={
                        lang === 'bn'
                          ? 'উদাহরণসহ সহজ ভাষায় বুঝিয়ে দিন...'
                          : 'Ask any syllabus question or request a step-by-step worked example...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={studyLoading}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {studyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {studyLoading
                    ? lang === 'bn'
                      ? 'প্রস্তুত হচ্ছে...'
                      : 'Generating...'
                    : studyMode === 'explain'
                    ? lang === 'bn'
                      ? 'ব্যাখ্যা দেখুন'
                      : 'Explain Topic'
                    : lang === 'bn'
                    ? '৪টি অনুশীলন MCQ তৈরি করুন'
                    : 'Generate 4 Practice MCQs'}
                </button>
              </form>

              <div className="lg:col-span-7 space-y-4">
                {studyError && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{studyError}</span>
                  </div>
                )}

                {studyMode === 'explain' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[260px]">
                    {studyExplanation ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
                            Class {selectedClassId} · {studySubject}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {lang === 'bn' ? 'এআই টিউটর নোট' : 'Tutor Breakdown'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {studyExplanation}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-2 text-slate-400">
                        <Sparkles className="w-8 h-8 text-emerald-600/60" />
                        <p className="text-sm font-bold">
                          {lang === 'bn'
                            ? 'বাম পাশে বিষয় ও অধ্যায় লিখে ব্যাখ্যা বা উদাহরণ অনুরোধ করুন।'
                            : 'Enter any chapter or syllabus question on the left to see a structured explanation.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {studyMode === 'generate_mcq' && (
                  <div className="space-y-3">
                    {practiceQuestions.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2 text-slate-400">
                        <Trophy className="w-8 h-8 mx-auto text-emerald-600/60" />
                        <p className="text-sm font-bold">
                          {lang === 'bn'
                            ? 'আপনার শ্রেণীর যেকোনো অধ্যায়ের উপর তাৎক্ষণিক ৪টি MCQ অনুশীলন কুইজ তৈরি করুন।'
                            : 'Generate an interactive 4-question practice quiz for any NCTB chapter.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {practiceQuestions.map((q, idx) => {
                          const chosen = practiceAnswers[q.id];
                          return (
                            <div
                              key={q.id}
                              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                            >
                              <p className="font-bold text-sm text-slate-900 dark:text-white">
                                <span className="text-emerald-700 dark:text-emerald-400 tabular-nums mr-1.5">
                                  Q{idx + 1}.
                                </span>
                                {q.question}
                              </p>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = chosen === oIdx;
                                  const isCorrect = q.correctIndex === oIdx;
                                  let cls =
                                    'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200';
                                  if (practiceSubmitted) {
                                    if (isCorrect) {
                                      cls =
                                        'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300';
                                    } else if (isSelected) {
                                      cls =
                                        'bg-red-50 dark:bg-red-950/60 border-red-400 text-red-700 dark:text-red-300';
                                    }
                                  } else if (isSelected) {
                                    cls = 'bg-emerald-700 border-emerald-700 text-white';
                                  }
                                  return (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      disabled={practiceSubmitted}
                                      onClick={() => setPracticeAnswers((p) => ({ ...p, [q.id]: oIdx }))}
                                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-colors ${cls}`}
                                    >
                                      {String.fromCharCode(65 + oIdx)}. {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              {practiceSubmitted && q.explanation && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                  <strong>{lang === 'bn' ? 'ব্যাখ্যা:' : 'Explanation:'}</strong> {q.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                          {practiceSubmitted ? (
                            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                              {lang === 'bn' ? 'আপনার স্কোর:' : 'Your Score:'}{' '}
                              {practiceQuestions.filter((q) => practiceAnswers[q.id] === q.correctIndex).length} /{' '}
                              {practiceQuestions.length}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 font-semibold">
                              {lang === 'bn'
                                ? 'উত্তর নির্বাচন করে নিচে ফলাফল যাচাই করুন।'
                                : 'Select answers above then check your score.'}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => setPracticeSubmitted(true)}
                            disabled={practiceSubmitted}
                            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-40"
                          >
                            {lang === 'bn' ? 'উত্তর যাচাই করুন' : 'Check Answers'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leave */}
          {activeTab === 'leave' && (
            <div className="grid lg:grid-cols-12 gap-6">
              <form onSubmit={handleLeaveSubmit} className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-extrabold">{lang === 'bn' ? 'শিক্ষকের নিকট ছুটির আবেদন' : 'Submit Leave Request'}</h4>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as 'Sick' | 'Family' | 'Emergency' | 'Other' })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                >
                  <option value="Sick">{lang === 'bn' ? 'অসুস্থতা' : 'Sick'}</option>
                  <option value="Family">{lang === 'bn' ? 'পারিবারিক প্রয়োজন' : 'Family'}</option>
                  <option value="Emergency">{lang === 'bn' ? 'জরুরি' : 'Emergency'}</option>
                  <option value="Other">{lang === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                  />
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  minLength={2}
                  maxLength={1500}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder={lang === 'bn' ? 'ছুটির কারণ লিখুন...' : 'Reason...'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
                <button type="submit" className="w-full bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-800">
                  {lang === 'bn' ? 'আবেদন পাঠান' : 'Submit'}
                </button>
              </form>
              <div className="lg:col-span-7 space-y-3">
                {myLeaves.length === 0 ? (
                  <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-sm">
                    {lang === 'bn' ? 'কোনো ছুটির আবেদন নেই।' : 'No leave requests submitted.'}
                  </div>
                ) : (
                  myLeaves.map((lv) => (
                    <div key={lv.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">
                          {lv.leaveType} ({lv.startDate} → {lv.endDate})
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                              lv.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : lv.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {lv.status}
                          </span>
                          {lv.status === 'pending' && (
                            <button type="button" onClick={() => deleteStudentLeave(lv.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{lv.reason}</p>
                      {lv.teacherRemark && (
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {lang === 'bn' ? 'শিক্ষকের মন্তব্য:' : 'Teacher Remark:'} {lv.teacherRemark}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Notices & Targeted Class Alerts */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              {targetedAlerts.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    {lang === 'bn' ? 'শ্রেণী ও পোর্টাল ঘোষণা' : 'Targeted Portal Alerts'}
                  </p>
                  {targetedAlerts.map((al) => (
                    <div
                      key={al.id}
                      className={`p-5 rounded-2xl border space-y-1 ${
                        al.priority === 'urgent'
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
                          {al.priority === 'urgent' ? (lang === 'bn' ? 'জরুরি ঘোষণা' : 'Urgent') : (lang === 'bn' ? 'পোর্টাল বার্তা' : 'Announcement')}
                          {al.classId && al.classId !== 'all' ? ` · Class ${al.classId}` : ''}
                        </span>
                        <span className="tabular-nums">{al.createdDate} · {al.senderName}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{al.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{al.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {notices.map((n) => {
                  const badge = formatNoticeDateBadge(n.date, lang);
                  return (
                    <div key={n.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{n.category}</span>
                        <span className="tabular-nums font-semibold">
                          {badge.dayLabel} {badge.monthLabel} {badge.yearLabel}
                          {badge.timeLabel ? ` · ${badge.timeLabel}` : ''}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base">{t(n.title)}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{t(n.description)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auto-Synced Yearly NCTB Holidays Tab */}
          {activeTab === 'holidays' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {lang === 'bn'
                      ? `এনসিটিবি নির্ধারিত বার্ষিক ছুটির তালিকা (${activeYear})`
                      : `NCTB Prescribed Holiday Calendar (${activeYear})`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'bn'
                      ? 'প্রতি নতুন শিক্ষাবর্ষ শুরু হওয়ার সাথে সাথে NCTB ছুটির তালিকা স্বয়ংক্রিয়ভাবে যুক্ত হয়।'
                      : 'Automatically updated each new academic year based on NCTB schedule (GMT+6).'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['All', 'National', 'Religious', 'Seasonal'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setHolidayFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        holidayFilter === cat
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {filteredHolidays.map((h) => {
                  const badge = formatNoticeDateBadge(h.date, lang);
                  const upcoming = isHolidayUpcoming(h);
                  return (
                    <div
                      key={h.id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold uppercase leading-none">{badge.monthLabel}</span>
                          <span className="text-base font-black tabular-nums leading-tight">{badge.dayLabel}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{t(h.title)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tabular-nums">
                            {h.date} · {t(h.duration)} · {h.type}
                          </p>
                        </div>
                      </div>
                      {upcoming && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black shrink-0">
                          {lang === 'bn' ? 'আসন্ন' : 'Upcoming'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Preserved Modals */}
      <AcademicReportCard
        open={reportCardOpen}
        onClose={() => setReportCardOpen(false)}
        studentName={matchedStudent?.name || user?.name || 'Student'}
        classId={selectedClassId}
        roll={selectedRoll.trim() || '01'}
        section={matchedStudent?.section || 'A'}
        marks={myMarks}
        attendancePct={attendancePct}
      />
      <FeeReceiptModal fee={activeReceipt} onClose={() => setActiveReceipt(null)} />
      <StudentIdAdmitCard
        open={idCardOpen}
        onClose={() => setIdCardOpen(false)}
        studentName={matchedStudent?.name || user?.name || `Student #${selectedRoll.trim() || '01'}`}
        classId={selectedClassId}
        roll={selectedRoll.trim() || '01'}
        section={matchedStudent?.section || 'A'}
        guardianMobile={matchedStudent?.guardianMobile || user?.phone}
        guardianName={matchedStudent?.guardianName}
        photoUrl={matchedStudent?.photo || user?.photo}
        registrationDate={matchedStudent?.registrationDate}
        session={matchedStudent?.session}
        cardIssueDate={matchedStudent?.cardIssueDate}
        cardValidUpto={matchedStudent?.cardValidUpto}
        initialMode={idCardMode}
        allowedModes={canDownloadAdmitCard ? ['admit', 'reg', 'id'] : ['reg', 'id']}
        onSaveStudentDetails={(updates) => {
          if (matchedStudent) {
            updateStudent({
              ...matchedStudent,
              guardianName: updates.guardianName ?? matchedStudent.guardianName,
              guardianMobile: updates.guardianMobile ?? matchedStudent.guardianMobile,
              photo: updates.photo ?? matchedStudent.photo,
              registrationDate: updates.registrationDate ?? matchedStudent.registrationDate,
              session: updates.session ?? matchedStudent.session,
              cardIssueDate: updates.cardIssueDate ?? matchedStudent.cardIssueDate,
              cardValidUpto: updates.cardValidUpto ?? matchedStudent.cardValidUpto,
            });
          }
          if (user) {
            void updateUser({
              ...user,
              ...(updates.photo ? { photo: updates.photo } : {}),
              ...(updates.guardianMobile ? { phone: updates.guardianMobile } : {}),
            });
          }
          notify(lang === 'bn' ? 'কার্ডের তথ্য ও ছবি সংরক্ষিত হয়েছে!' : 'Card photo & details saved!');
        }}
      />
      <StudentCertificateModal
        open={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        studentName={matchedStudent?.name || user?.name || 'Student'}
        classId={selectedClassId}
        roll={selectedRoll.trim() || '01'}
        section={matchedStudent?.section || 'A'}
        gpa={gpaSummary.gpa}
        attendancePct={attendancePct}
      />
    </div>
  );
};
