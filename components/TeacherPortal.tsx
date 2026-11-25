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
  Lock,
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  LogOut,
  User as UserIcon,
  GraduationCap,
  Wallet,
  FileText,
} from 'lucide-react';
import { useApp } from '../App';
import { heroCampusImg } from '../src/assets/media';
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
  Teacher,
} from '../types';
import { calculateGrade, isSafeHttpUrl } from '../utils/security';
import { getDhakaTodayISO, getDhakaNoticeStamp, formatDhakaClock } from '../utils/dhakaTime';
import { exportCsv } from '../utils/exportUtils';
import { compressImageFile } from '../utils/imageUtils';
import { FeeReceiptModal } from './FeeReceiptModal';
import { StudentIdAdmitCard, CardMode } from './StudentIdAdmitCard';
import { StudentCertificateModal } from './StudentCertificateModal';
import { TeacherIdCardModal } from './TeacherIdCardModal';
import { ClassTeacherAssignmentPanel } from './ClassTeacherAssignmentPanel';
import {
  isHeadTeacherUser,
  resolveTeacherAssignedClass,
  resolveTeacherTeachingClasses,
  resolveTeacherAllowedSubjects,
  isSubjectMatched,
  SCHOOL_CLASS_IDS,
  CLASS_9_10_GROUPS,
  Class910GroupId,
  getNctbSubjectsForClass,
  getSubjectDisplayLabel,
  normalizeClassGroup,
} from '../utils/teacherRole';
import { computeClassMeritRanking, isYearFinalExamTerm } from '../utils/meritRoll';

const { useState, useEffect, useMemo, useRef } = React;

type TeacherTab =
  | 'overview'
  | 'attendance'
  | 'homework'
  | 'marks'
  | 'fees'
  | 'notices'
  | 'materials'
  | 'classes'
  | 'class-teachers'
  | 'online-exams'
  | 'parent-messages'
  | 'my-leave'
  | 'student-leaves';

export interface TeacherPortalProps {
  embedded?: boolean;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ embedded = false }) => {
  const {
    lang,
    t,
    user,
    logout,
    isCloudAdmin,
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
    teachers,
    updateTeacher,
    updateUser,
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
    applyYearFinalMeritRolls,
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
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TeacherTab>(embedded ? 'attendance' : 'overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dhakaClockText, setDhakaClockText] = useState(() => formatDhakaClock(lang));
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<FeeRecord | null>(null);
  const [idCardStudent, setIdCardStudent] = useState<SchoolStudent | null>(null);
  const [idCardMode, setIdCardMode] = useState<CardMode>('admit');
  const [certStudent, setCertStudent] = useState<SchoolStudent | null>(null);
  const [teacherIdCardOpen, setTeacherIdCardOpen] = useState(false);
  const todayStr = getDhakaTodayISO();

  useEffect(() => {
    setDhakaClockText(formatDhakaClock(lang));
    const timer = setInterval(() => {
      setDhakaClockText(formatDhakaClock(lang));
    }, 30000);
    return () => clearInterval(timer);
  }, [lang]);

  const matchedTeacherIdx = useMemo(() => {
    const uid = (user?.userId || '').trim().toLowerCase();
    const uName = (user?.name || '').trim().toLowerCase();
    const uPhoneDigits = (user?.phone || '').replace(/\D/g, '').slice(-10);
    return teachers.findIndex((tc) => {
      if (uid && (tc.id.toLowerCase() === uid || tc.id.toLowerCase() === `tc-${uid}` || (tc.teacherCode || '').toLowerCase() === uid)) {
        return true;
      }
      if (uPhoneDigits.length >= 6) {
        const tDigits = (tc.phone || '').replace(/\D/g, '').slice(-10);
        if (tDigits && tDigits === uPhoneDigits) return true;
      }
      if (uName && (tc.name.en.trim().toLowerCase() === uName || tc.name.bn.trim().toLowerCase() === uName)) {
        return true;
      }
      return false;
    });
  }, [teachers, user?.userId, user?.name, user?.phone]);

  const resolvedTeacherCardProfile: Teacher = useMemo(() => {
    if (matchedTeacherIdx !== -1) {
      const matched = teachers[matchedTeacherIdx];
      return { ...matched, photo: matched.photo || user?.photo || '' };
    }
    return {
      id: user?.userId || `t-${teachers.length + 1}`,
      teacherCode: user?.userId?.startsWith('RBMB-') ? user.userId : undefined,
      name: { bn: user?.name || 'শিক্ষক', en: user?.name || 'Teacher' },
      designation: {
        bn: user?.designation || 'সহকারী শিক্ষক',
        en: user?.designation || 'Assistant Teacher',
      },
      subject: {
        bn: user?.subject || 'সাধারণ বিভাগ',
        en: user?.subject || 'Faculty Member',
      },
      qualification: {
        bn: user?.qualification || 'রাণীর বাজার মাধ্যমিক বিদ্যালয়',
        en: user?.qualification || 'রাণীর বাজার মাধ্যমিক বিদ্যালয়',
      },
      phone: user?.phone,
      bloodGroup: user?.bloodGroup,
      photo: user?.photo || '',
      isPublic: true,
    };
  }, [matchedTeacherIdx, teachers, user]);

  const matchedTeacherProfile = matchedTeacherIdx !== -1 ? teachers[matchedTeacherIdx] : undefined;
  const isAdminUser = user?.role === 'admin' || isCloudAdmin;
  const isHeadTeacher = useMemo(
    () => isAdminUser || isHeadTeacherUser(user, teachers, settings),
    [isAdminUser, user, teachers, settings]
  );

  const resolvedAssignedClass = useMemo(
    () => resolveTeacherAssignedClass(matchedTeacherProfile, user),
    [matchedTeacherProfile, user]
  );

  const accessibleClassIds = useMemo(
    () =>
      isHeadTeacher
        ? [...SCHOOL_CLASS_IDS]
        : resolveTeacherTeachingClasses(matchedTeacherProfile, user),
    [isHeadTeacher, matchedTeacherProfile, user]
  );

  const allowedSubjects = useMemo(
    () => resolveTeacherAllowedSubjects(matchedTeacherProfile, user),
    [matchedTeacherProfile, user]
  );

  const availableClassIds = accessibleClassIds as ('6' | '7' | '8' | '9' | '10')[];
  const hasAnyAssignedClass = availableClassIds.length > 0;
  const isSingleClassOnly = availableClassIds.length === 1;
  const hasAllClasses = isHeadTeacher || availableClassIds.length === SCHOOL_CLASS_IDS.length;
  const hasClassTeacherPrivilege = isAdminUser || isHeadTeacher || Boolean(resolvedAssignedClass);

  // Strict attendance policy: ONLY Admin (all classes) or the designated Class Teacher of that class can record student attendance
  const attendanceClassIds = useMemo(
    () =>
      isAdminUser
        ? ([...SCHOOL_CLASS_IDS] as ('6' | '7' | '8' | '9' | '10')[])
        : resolvedAssignedClass
        ? ([resolvedAssignedClass] as ('6' | '7' | '8' | '9' | '10')[])
        : [],
    [isAdminUser, resolvedAssignedClass]
  );

  const canTakeAttendanceInClass = (cid: string) =>
    isAdminUser || (resolvedAssignedClass !== '' && resolvedAssignedClass === cid);

  const canEnterAllSubjectsInClass = (cid: string) =>
    isAdminUser || (resolvedAssignedClass !== '' && resolvedAssignedClass === cid);

  const canEnterMarksForSubject = (cid: string, sub: string) => {
    if (!accessibleClassIds.includes(cid)) return false;
    if (canEnterAllSubjectsInClass(cid)) return true;
    return isSubjectMatched(sub, allowedSubjects);
  };

  const canManageStudentsInClass = (cid: string) =>
    isHeadTeacher || (resolvedAssignedClass !== '' && resolvedAssignedClass === cid);

  const sensitiveClassFilter = isHeadTeacher ? null : resolvedAssignedClass || '__NONE__';

  const visibleStudents = useMemo(
    () =>
      isHeadTeacher
        ? students
        : students.filter((s) => accessibleClassIds.includes(s.classId)),
    [students, isHeadTeacher, accessibleClassIds]
  );

  const visibleHomeworks = useMemo(
    () =>
      isHeadTeacher
        ? homeworkList
        : homeworkList.filter((h) => accessibleClassIds.includes(h.classId)),
    [homeworkList, isHeadTeacher, accessibleClassIds]
  );

  const visibleSubmissions = useMemo(
    () =>
      isHeadTeacher
        ? assignmentSubmissions
        : assignmentSubmissions.filter((s) => accessibleClassIds.includes(s.classId)),
    [assignmentSubmissions, isHeadTeacher, accessibleClassIds]
  );

  const visibleExamMarks = useMemo(
    () =>
      isHeadTeacher
        ? examMarks
        : examMarks.filter((m) => accessibleClassIds.includes(m.classId)),
    [examMarks, isHeadTeacher, accessibleClassIds]
  );

  const visibleExamRoutines = useMemo(
    () =>
      isHeadTeacher
        ? examRoutines
        : examRoutines.filter((r) => accessibleClassIds.includes(r.classId)),
    [examRoutines, isHeadTeacher, accessibleClassIds]
  );

  const visibleOnlineExams = useMemo(
    () =>
      isHeadTeacher
        ? onlineExams
        : onlineExams.filter((ex) => accessibleClassIds.includes(ex.classId)),
    [onlineExams, isHeadTeacher, accessibleClassIds]
  );

  const visibleFees = useMemo(
    () =>
      sensitiveClassFilter === null
        ? feeRecords
        : feeRecords.filter((f) => f.classId === sensitiveClassFilter),
    [feeRecords, sensitiveClassFilter]
  );

  const visibleParentLinks = useMemo(
    () =>
      sensitiveClassFilter === null
        ? parentLinks
        : parentLinks.filter((pl) => pl.classId === sensitiveClassFilter),
    [parentLinks, sensitiveClassFilter]
  );

  const visibleStudentLeaves = useMemo(
    () =>
      sensitiveClassFilter === null
        ? studentLeaves
        : studentLeaves.filter((sl) => sl.classId === sensitiveClassFilter),
    [studentLeaves, sensitiveClassFilter]
  );

  const visibleEbooks = useMemo(
    () =>
      isHeadTeacher
        ? ebooks
        : ebooks.filter((eb) => accessibleClassIds.includes(eb.classId)),
    [ebooks, isHeadTeacher, accessibleClassIds]
  );

  const visiblePortalNotifications = useMemo(
    () =>
      isHeadTeacher
        ? portalNotifications
        : portalNotifications.filter(
            (pn) => !pn.classId || pn.classId === 'all' || accessibleClassIds.includes(pn.classId)
          ),
    [portalNotifications, isHeadTeacher, accessibleClassIds]
  );

  const myParentMessages = useMemo(() => {
    const uid = (user?.userId || '').trim().toLowerCase();
    const tId = (resolvedTeacherCardProfile.id || '').trim().toLowerCase();
    const tCode = (resolvedTeacherCardProfile.teacherCode || '').trim().toLowerCase();
    const tNameEn = (resolvedTeacherCardProfile.name?.en || '').trim().toLowerCase();
    const tNameBn = (resolvedTeacherCardProfile.name?.bn || '').trim().toLowerCase();
    const uName = (user?.name || '').trim().toLowerCase();

    return parentMessages.filter((pm) => {
      if (pm.recipientUid && uid && pm.recipientUid.trim().toLowerCase() === uid) {
        return true;
      }
      const hasExplicitRecipient = Boolean(pm.recipientUid || pm.teacherId || pm.teacherCode);
      if (hasExplicitRecipient) {
        const matchId = Boolean(pm.teacherId && tId && pm.teacherId.trim().toLowerCase() === tId);
        const matchUserId = Boolean(pm.teacherId && uid && pm.teacherId.trim().toLowerCase() === uid);
        const matchCode = Boolean(pm.teacherCode && tCode && pm.teacherCode.trim().toLowerCase() === tCode);
        return matchId || matchUserId || matchCode;
      }
      const pmTeacher = (pm.teacherName || '').trim().toLowerCase();
      return Boolean(pmTeacher && (pmTeacher === tNameEn || pmTeacher === tNameBn || pmTeacher === uName));
    });
  }, [parentMessages, user?.userId, user?.name, resolvedTeacherCardProfile]);

  const openStudentCard = (st: SchoolStudent, mode: CardMode) => {
    setIdCardMode(mode);
    setIdCardStudent(st);
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // --- 1. Attendance ---
  const [attClassId, setAttClassId] = useState<string>(
    resolvedAssignedClass || (isAdminUser ? '9' : availableClassIds[0] || '9')
  );
  const [attDate, setAttDate] = useState<string>(todayStr);
  const [attDraft, setAttDraft] = useState<Record<string, AttendanceStatus>>({});

  const attClassStudents = useMemo(
    () => visibleStudents.filter((s) => s.classId === attClassId).sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true })),
    [visibleStudents, attClassId]
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
    if (!canTakeAttendanceInClass(attClassId)) {
      notify(
        lang === 'bn'
          ? 'শিক্ষার্থীর হাজিরা শুধুমাত্র নির্ধারিত শ্রেণী শিক্ষক বা অ্যাডমিন দিতে পারবেন।'
          : 'Only the assigned Class Teacher or Admin can submit student attendance.'
      );
      return;
    }
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
  const [markClassId, setMarkClassId] = useState<string>(availableClassIds[0] || '9');
  const [markGroup, setMarkGroup] = useState<'all' | Class910GroupId>('all');
  const [markTerm, setMarkTerm] = useState<string>(EXAM_TERMS[1].id);
  const [markSubject, setMarkSubject] = useState<string>(CLASS_SUBJECTS['9'][0]);
  const [markTotal, setMarkTotal] = useState<number>(100);
  const [markSearch, setMarkSearch] = useState<string>('');
  const [autoUpdateMeritRoll, setAutoUpdateMeritRoll] = useState<boolean>(true);
  const [quickAddStudent, setQuickAddStudent] = useState({ roll: '', name: '', section: 'A', guardianMobile: '' });
  const [marksDraft, setMarksDraft] = useState<Record<string, string>>({});
  const lastMarksKeyRef = useRef<string>('');

  const isMarkSecondaryClass = markClassId === '9' || markClassId === '10';

  const markSubjectOptions = useMemo(
    () => getNctbSubjectsForClass(markClassId, isMarkSecondaryClass ? markGroup : 'all'),
    [markClassId, isMarkSecondaryClass, markGroup]
  );

  const markClassStudents = useMemo(
    () =>
      visibleStudents
        .filter((s) => s.classId === markClassId)
        .sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true })),
    [visibleStudents, markClassId]
  );

  const filteredMarkStudents = useMemo(() => {
    const q = markSearch.trim().toLowerCase();
    return markClassStudents.filter((st) => {
      if (isMarkSecondaryClass && markGroup !== 'all') {
        const stGroup = normalizeClassGroup(st.section);
        if (stGroup && stGroup !== markGroup) return false;
      }
      if (!q) return true;
      return st.name.toLowerCase().includes(q) || st.roll.toLowerCase().includes(q) || st.section.toLowerCase().includes(q);
    });
  }, [markClassStudents, markSearch, isMarkSecondaryClass, markGroup]);

  const isCurrentYearFinal = isYearFinalExamTerm(markTerm);
  const canEditCurrentSubject = canEnterMarksForSubject(markClassId, markSubject);

  const meritPreview = useMemo(() => {
    if (!isCurrentYearFinal || markClassStudents.length === 0) return [];
    const termMarks = visibleExamMarks.filter(
      (m) => m.classId === markClassId && m.examTerm === markTerm
    );
    return computeClassMeritRanking(markClassStudents, termMarks);
  }, [isCurrentYearFinal, markClassStudents, visibleExamMarks, markClassId, markTerm]);

  useEffect(() => {
    if (!isMarkSecondaryClass && markGroup !== 'all') {
      setMarkGroup('all');
    }
  }, [isMarkSecondaryClass, markGroup]);

  useEffect(() => {
    const subs = markSubjectOptions.map((s) => s.id);
    if (subs.length === 0) return;
    if (!subs.includes(markSubject)) {
      const firstPermitted = subs.find((s) => canEnterMarksForSubject(markClassId, s)) || subs[0];
      setMarkSubject(firstPermitted);
    } else if (!canEnterMarksForSubject(markClassId, markSubject)) {
      const firstPermitted = subs.find((s) => canEnterMarksForSubject(markClassId, s));
      if (firstPermitted && firstPermitted !== markSubject) {
        setMarkSubject(firstPermitted);
      }
    }
  }, [markClassId, markSubjectOptions, resolvedAssignedClass, isAdminUser, allowedSubjects]);

  useEffect(() => {
    const activeKey = `${markClassId}__${markTerm}__${markSubject}`;
    const keyChanged = lastMarksKeyRef.current !== activeKey;
    lastMarksKeyRef.current = activeKey;

    setMarksDraft((prev) => {
      const next: Record<string, string> = {};
      markClassStudents.forEach((st) => {
        const existing = visibleExamMarks.find(
          (m) =>
            m.classId === markClassId &&
            m.examTerm === markTerm &&
            m.subject === markSubject &&
            (m.studentId ? m.studentId === st.id : m.roll.trim() === st.roll.trim())
        );
        if (!keyChanged && prev[st.id] !== undefined && prev[st.id] !== '') {
          next[st.id] = prev[st.id];
        } else {
          next[st.id] = existing ? String(existing.obtainedMarks) : '';
        }
      });
      return next;
    });
  }, [markClassId, markTerm, markSubject, visibleExamMarks, markClassStudents]);

  const handleSaveMarksBulk = () => {
    if (!canEditCurrentSubject) {
      notify(
        lang === 'bn'
          ? 'অনুমতি নেই: আপনি শুধুমাত্র আপনার নির্ধারিত বিষয়ের নম্বর এন্ট্রি দিতে পারবেন।'
          : 'Access denied: You can only enter marks for your assigned subject(s).'
      );
      return;
    }
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
    const saveRes = saveExamMarksBulk(toSave, { autoUpdateYearFinalRoll: autoUpdateMeritRoll });
    if (isCurrentYearFinal && autoUpdateMeritRoll && saveRes?.updatedRolls?.length > 0) {
      notify(
        lang === 'bn'
          ? `${toSave.length} জনের নম্বর সেভ হয়েছে এবং মেধাক্রম অনুযায়ী ${saveRes.updatedRolls.length} জন শিক্ষার্থীর রোল স্বয়ংক্রিয়ভাবে আপডেট হয়েছে!`
          : `Saved ${toSave.length} marks and auto-updated ${saveRes.updatedRolls.length} merit roll(s)!`
      );
    } else {
      notify(lang === 'bn' ? `${toSave.length} জন শিক্ষার্থীর নম্বর সেভ হয়েছে!` : `Saved marks for ${toSave.length} students!`);
    }
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
      date: getDhakaNoticeStamp(),
      category: newNotice.category,
      description: { bn: newNotice.descBn.trim() || newNotice.descEn.trim(), en: newNotice.descEn.trim() || newNotice.descBn.trim() },
      isPublic: true,
    });
    setNewNotice({ titleBn: '', titleEn: '', category: 'General', descBn: '', descEn: '' });
    notify(lang === 'bn' ? 'নতুন নোটিশ GMT+6 সময়সহ প্রকাশিত হয়েছে!' : 'Notice published with GMT+6 timestamp!');
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
  const [manageClassId, setManageClassId] = useState<'6' | '7' | '8' | '9' | '10'>(availableClassIds[0] || '9');
  const [classRosterFilter, setClassRosterFilter] = useState<'all' | '6' | '7' | '8' | '9' | '10'>('all');
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
    return visibleFees.filter((f) => {
      if (feeClassFilter !== 'all' && f.classId !== feeClassFilter) return false;
      if (feeStatusFilter !== 'all' && f.status !== feeStatusFilter) return false;
      return true;
    });
  }, [visibleFees, feeClassFilter, feeStatusFilter]);

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
    classId: isSingleClassOnly ? availableClassIds[0] : 'all',
    priority: 'normal' as 'normal' | 'urgent',
  });

  useEffect(() => {
    if (!hasAnyAssignedClass) return;
    const fallbackClass = resolvedAssignedClass && availableClassIds.includes(resolvedAssignedClass as '6' | '7' | '8' | '9' | '10')
      ? resolvedAssignedClass
      : availableClassIds[0];

    if (!isAdminUser && resolvedAssignedClass) {
      if (attClassId !== resolvedAssignedClass) {
        setAttClassId(resolvedAssignedClass);
      }
    } else if (!availableClassIds.includes(attClassId as '6' | '7' | '8' | '9' | '10')) {
      setAttClassId(fallbackClass);
    }
    if (!availableClassIds.includes(markClassId as '6' | '7' | '8' | '9' | '10')) {
      setMarkClassId(fallbackClass);
    }
    if (!availableClassIds.includes(manageClassId)) {
      setManageClassId(fallbackClass as '6' | '7' | '8' | '9' | '10');
    }
    if (hwFilterClass !== 'all' && !availableClassIds.includes(hwFilterClass as '6' | '7' | '8' | '9' | '10')) {
      setHwFilterClass('all');
    }
    if (!availableClassIds.includes(hwForm.classId as '6' | '7' | '8' | '9' | '10')) {
      setHwForm((p) => ({ ...p, classId: fallbackClass, subject: (CLASS_SUBJECTS[fallbackClass] || ['Bangla'])[0] }));
    }
    if (!availableClassIds.includes(matForm.classId as '6' | '7' | '8' | '9' | '10')) {
      setMatForm((p) => ({ ...p, classId: fallbackClass }));
    }
    if (!availableClassIds.includes(routineForm.classId as '6' | '7' | '8' | '9' | '10')) {
      setRoutineForm((p) => ({ ...p, classId: fallbackClass }));
    }
    if (!availableClassIds.includes(mcqForm.classId as '6' | '7' | '8' | '9' | '10')) {
      setMcqForm((p) => ({ ...p, classId: fallbackClass }));
    }
    if (!isHeadTeacher && resolvedAssignedClass) {
      setFeeClassFilter(resolvedAssignedClass);
      setBulkFeeForm((p) => ({ ...p, classId: resolvedAssignedClass }));
    }
    if (isSingleClassOnly) {
      setBroadcastForm((p) => ({ ...p, classId: availableClassIds[0] }));
    }
  }, [hasAnyAssignedClass, availableClassIds, resolvedAssignedClass, isHeadTeacher, isSingleClassOnly]);

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

  const tabs: {
    id: TeacherTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeTone?: 'amber' | 'emerald';
  }[] = [
    { id: 'overview', label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: lang === 'bn' ? 'হাজিরা' : 'Attendance', icon: ClipboardCheck },
    {
      id: 'homework',
      label: lang === 'bn' ? 'হোমওয়ার্ক ও মূল্যায়ন' : 'Assignments',
      icon: BookOpenCheck,
      badge: visibleHomeworks.length > 0 ? visibleHomeworks.length : undefined,
      badgeTone: 'emerald',
    },
    { id: 'marks', label: lang === 'bn' ? 'নম্বর এন্ট্রি' : 'Marks Entry', icon: Award },
    { id: 'fees', label: lang === 'bn' ? 'ফি ও বকেয়া' : 'Fee Ledger', icon: Receipt },
    { id: 'notices', label: lang === 'bn' ? 'নোটিশ ও ঘোষণা' : 'Notices & Alerts', icon: Bell },
    { id: 'materials', label: lang === 'bn' ? 'স্টাডি নোটস' : 'Study Materials', icon: BookOpen },
    { id: 'classes', label: lang === 'bn' ? 'শ্রেণী ও রুটিন' : 'Classes & Routines', icon: School },
    ...(isHeadTeacher
      ? [{ id: 'class-teachers' as TeacherTab, label: lang === 'bn' ? 'শ্রেণী শিক্ষক নির্ধারণ' : 'Class Teachers', icon: ShieldCheck }]
      : []),
    { id: 'online-exams', label: lang === 'bn' ? 'MCQ পরীক্ষা তৈরি' : 'Create MCQ Exam', icon: Trophy },
    {
      id: 'parent-messages',
      label: lang === 'bn' ? 'অভিভাবক বার্তা' : 'Parent Messages',
      icon: MessageSquare,
      badge: myParentMessages.filter((pm) => !pm.reply).length > 0 ? myParentMessages.filter((pm) => !pm.reply).length : undefined,
      badgeTone: 'amber',
    },
    { id: 'my-leave', label: lang === 'bn' ? 'নিজের ছুটি' : 'My Leave', icon: CalendarPlus },
    {
      id: 'student-leaves',
      label: lang === 'bn' ? 'শিক্ষার্থীর ছুটি' : 'Student Leaves',
      icon: UserCheck,
      badge: visibleStudentLeaves.filter((l) => l.status === 'pending').length > 0 ? visibleStudentLeaves.filter((l) => l.status === 'pending').length : undefined,
      badgeTone: 'amber',
    },
  ];

  const handleTeacherAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file, 450, 0.78);
    if (user) {
      await updateUser({ ...user, photo: compressed });
    }
    if (matchedTeacherProfile) {
      updateTeacher({ ...matchedTeacherProfile, photo: compressed });
    }
    notify(lang === 'bn' ? 'প্রোফাইল ছবি আপডেট হয়েছে!' : 'Profile photo updated!');
  };

  const quickSearchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{ label: string; category: string; tab: TeacherTab }> = [];

    tabs.forEach((tb) => {
      if (tb.label.toLowerCase().includes(q) || tb.id.toLowerCase().includes(q)) {
        results.push({ label: tb.label, category: lang === 'bn' ? 'মেনু' : 'Module', tab: tb.id });
      }
    });
    visibleStudents.forEach((st) => {
      if (st.name.toLowerCase().includes(q) || st.roll.toLowerCase().includes(q)) {
        results.push({
          label: `${st.name} (Class ${st.classId} · Roll ${st.roll})`,
          category: lang === 'bn' ? 'শিক্ষার্থী' : 'Student',
          tab: 'classes',
        });
      }
    });
    notices.forEach((n) => {
      const title = t(n.title);
      if (title.toLowerCase().includes(q)) {
        results.push({ label: title, category: lang === 'bn' ? 'নোটিশ' : 'Notice', tab: 'notices' });
      }
    });
    return results.slice(0, 7);
  }, [searchQuery, visibleStudents, notices, t, lang, isHeadTeacher]);

  const teacherAttendanceCount = useMemo(
    () =>
      attendanceRecords.filter((r) => isHeadTeacher || accessibleClassIds.includes(r.classId)).length,
    [attendanceRecords, isHeadTeacher, accessibleClassIds]
  );

  const pendingRepliesCount = useMemo(
    () => myParentMessages.filter((pm) => !pm.reply).length,
    [myParentMessages]
  );

  const pendingStudentLeaveCount = useMemo(
    () => visibleStudentLeaves.filter((sl) => sl.status === 'pending').length,
    [visibleStudentLeaves]
  );

  const teacherRoleTitle = isAdminUser
    ? lang === 'bn'
      ? 'অ্যাডমিন — সকল শ্রেণী ও বিষয়'
      : 'Admin — All Classes & Subjects'
    : isHeadTeacher
    ? lang === 'bn'
      ? 'প্রধান শিক্ষক — সকল শ্রেণী'
      : 'Head Teacher — All Classes'
    : resolvedAssignedClass
    ? lang === 'bn'
      ? `শ্রেণী শিক্ষক: ${resolvedAssignedClass}ম শ্রেণী`
      : `Class Teacher: Class ${resolvedAssignedClass}`
    : lang === 'bn'
    ? 'বিষয়ভিত্তিক শিক্ষক'
    : 'Subject Teacher';

  const teacherPhoto = resolvedTeacherCardProfile.photo || user?.photo || '';
  const teacherDisplayCode =
    resolvedTeacherCardProfile.teacherCode || user?.userId || 'TEACHER';

  const teacherBodyContent = (
    <>
      {/* Cloud Sync & Teaching Role Banner (in embedded mode or sub-tabs) */}
      {embedded && (
        <div
          className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border ${
            isCloudTeacher
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {teacherRoleTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTeacherIdCardOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-colors"
          >
            <IdCard className="w-4 h-4" />
            <span>{lang === 'bn' ? 'শিক্ষক আইডি কার্ড' : 'Teacher ID Card'}</span>
          </button>
        </div>
      )}

      {/* Embedded Tab Bar */}
      {embedded && (
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
      )}

      {/* OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
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
                  <span>{teacherRoleTitle}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {t(settings.name)}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 font-semibold">
                  {lang === 'bn'
                    ? `স্বাগতম, ${t(resolvedTeacherCardProfile.name)}! আপনার পাঠদানকৃত শ্রেণীসমূহের হাজিরা, নম্বর এন্ট্রি, হোমওয়ার্ক ও রুটিন পরিচালনা করুন।`
                    : `Welcome, ${t(resolvedTeacherCardProfile.name)}! Manage class attendance, marks entry, assignments, and schedules in one place.`}
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white">
                    Smart • Secure • Automated
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-emerald-50 tabular-nums">
                    {lang === 'bn'
                      ? `পাঠদান: ${hasAllClasses ? 'সব শ্রেণী (৬ষ্ঠ–১০ম)' : `শ্রেণী ${availableClassIds.join(', ')}`}`
                      : `Classes: ${hasAllClasses ? 'All (6–10)' : availableClassIds.join(', ')}`}
                    {allowedSubjects.length > 0 ? ` · ${allowedSubjects.join(', ')}` : ''}
                  </span>
                </div>
              </div>
              <div className="hidden md:block text-right shrink-0 space-y-2">
                <p className="text-base font-black text-yellow-300 italic leading-snug">
                  Together Towards a
                  <br />
                  Better Tomorrow
                </p>
                <div className="h-0.5 w-28 bg-yellow-400/80 ml-auto rounded-full" />
                <button
                  type="button"
                  onClick={() => setTeacherIdCardOpen(true)}
                  className="mt-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-extrabold inline-flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                >
                  <IdCard className="w-4 h-4 text-yellow-300" />
                  <span>{lang === 'bn' ? 'শিক্ষক আইডি কার্ড' : 'Teacher ID Card'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Live-Data KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'পাঠদানের শিক্ষার্থী' : 'Assigned Students'}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{visibleStudents.length}</p>
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {availableClassIds.length} {lang === 'bn' ? 'টি নির্ধারিত শ্রেণী' : 'assigned classes'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'হাজিরা রেকর্ড' : 'Attendance Logs'}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{teacherAttendanceCount}</p>
                <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                  {visibleOnlineExams.length} {lang === 'bn' ? 'টি অনলাইন কুইজ' : 'online MCQ exams'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'নম্বর ও হোমওয়ার্ক' : 'Marks & Tasks'}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{visibleExamMarks.length}</p>
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                  {visibleHomeworks.length} {lang === 'bn' ? 'হোমওয়ার্ক' : 'assignments'} · {visibleSubmissions.length} {lang === 'bn' ? 'জমা' : 'submissions'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'বার্তা ও ছুটি' : 'Messages & Leaves'}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{pendingRepliesCount + pendingStudentLeaveCount}</p>
                <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 tabular-nums">
                  {pendingRepliesCount} {lang === 'bn' ? 'অভিভাবক বার্তা' : 'parent msgs'} · {pendingStudentLeaveCount} {lang === 'bn' ? 'ছুটি' : 'leaves'}
                </p>
              </div>
            </div>
          </div>

          {/* 6-Step Teacher Academic Workflow */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'দৈনন্দিন শিক্ষক কার্যক্রম – কুইক ওয়ার্কফ্লো' : 'Daily Teaching Workflow – Quick Access'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!isCloudTeacher && (
                  <button
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold"
                  >
                    Google Sync
                  </button>
                )}
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  {isCloudTeacher
                    ? lang === 'bn' ? 'ক্লাউড সিঙ্ক সক্রিয়' : 'Cloud Sync Active'
                    : lang === 'bn' ? 'লোকাল মোড' : 'Local Mode'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(
                [
                  {
                    title: lang === 'bn' ? 'হাজিরা গ্রহণ' : 'Attendance',
                    sub: isAdminUser
                      ? lang === 'bn'
                        ? 'সকল শ্রেণী (অ্যাডমিন)'
                        : 'All Classes (Admin)'
                      : resolvedAssignedClass
                      ? lang === 'bn'
                        ? `${resolvedAssignedClass}ম শ্রেণী (শ্রেণী শিক্ষক)`
                        : `Class ${resolvedAssignedClass} (CT)`
                      : lang === 'bn'
                      ? 'শুধু শ্রেণী শিক্ষক'
                      : 'Class Teacher Only',
                    icon: ClipboardCheck,
                    tone: canTakeAttendanceInClass(attClassId) ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white',
                    onClick: () => setActiveTab('attendance'),
                  },
                  {
                    title: lang === 'bn' ? 'হোমওয়ার্ক' : 'Assignments',
                    sub: `${visibleHomeworks.length} ${lang === 'bn' ? 'টি চলমান' : 'Active'}`,
                    icon: BookOpenCheck,
                    tone: 'bg-blue-600 text-white',
                    onClick: () => setActiveTab('homework'),
                  },
                  {
                    title: lang === 'bn' ? 'নম্বর এন্ট্রি' : 'Marks Entry',
                    sub: allowedSubjects.length > 0 ? allowedSubjects[0] : (lang === 'bn' ? 'সকল বিষয়' : 'All Subjects'),
                    icon: Award,
                    tone: 'bg-amber-500 text-white',
                    onClick: () => setActiveTab('marks'),
                  },
                  {
                    title: lang === 'bn' ? 'ফি ও বকেয়া' : 'Fee Ledger',
                    sub: `${visibleFees.length} ${lang === 'bn' ? 'টি রেকর্ড' : 'Records'}`,
                    icon: Wallet,
                    tone: 'bg-teal-600 text-white',
                    onClick: () => setActiveTab('fees'),
                  },
                  {
                    title: lang === 'bn' ? 'অভিভাবক বার্তা' : 'Parent Inbox',
                    sub: `${myParentMessages.length} ${lang === 'bn' ? 'টি বার্তা' : 'Messages'}`,
                    icon: MessageSquare,
                    tone: 'bg-purple-600 text-white',
                    onClick: () => setActiveTab('parent-messages'),
                  },
                  {
                    title: lang === 'bn' ? 'শিক্ষক আইডি কার্ড' : 'Faculty ID Card',
                    sub: lang === 'bn' ? 'দেখুন ও প্রিন্ট' : 'View / Print',
                    icon: IdCard,
                    tone: 'bg-slate-800 text-white',
                    onClick: () => setTeacherIdCardOpen(true),
                  },
                ] as const
              ).map((step, idx) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={step.onClick}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-400 text-center space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${step.tone}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {lang === 'bn' ? `ধাপ ${idx + 1}` : `Step ${idx + 1}`}
                      </p>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">{step.title}</p>
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate">{step.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class-Wise Roster Quick Jump Cards */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'শ্রেণীভিত্তিক শিক্ষার্থী ও কার্যক্রম' : 'Class-Wise Students & Quick Navigation'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('classes')}
                className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {lang === 'bn' ? 'সবগুলো দেখুন →' : 'Open Class Roster →'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {availableClassIds.map((cid) => {
                const count = visibleStudents.filter((s) => s.classId === cid).length;
                const isCt = resolvedAssignedClass === cid;
                return (
                  <div
                    key={cid}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-sm text-slate-900 dark:text-white">
                          {lang === 'bn' ? `${cid}ম শ্রেণী` : `Class ${cid}`}
                        </p>
                        {isCt && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black">
                            CT
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">
                        {count} <span className="text-[11px] font-bold text-slate-400">{lang === 'bn' ? 'জন' : 'students'}</span>
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={!canTakeAttendanceInClass(cid)}
                        title={
                          !canTakeAttendanceInClass(cid)
                            ? lang === 'bn'
                              ? 'শুধুমাত্র এই শ্রেণীর শ্রেণী শিক্ষক বা অ্যাডমিন হাজিরা দিতে পারবেন'
                              : 'Only the assigned Class Teacher or Admin can take attendance'
                            : undefined
                        }
                        onClick={() => {
                          if (!canTakeAttendanceInClass(cid)) return;
                          setAttClassId(cid);
                          setActiveTab('attendance');
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold inline-flex items-center justify-center gap-1 ${
                          canTakeAttendanceInClass(cid)
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {!canTakeAttendanceInClass(cid) && <Lock className="w-3 h-3" />}
                        {lang === 'bn' ? 'হাজিরা' : 'Att.'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMarkClassId(cid);
                          setActiveTab('marks');
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-100 text-[11px] font-bold"
                      >
                        {lang === 'bn' ? 'নম্বর' : 'Marks'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 1. Attendance (Strictly Class Teacher of own class + Admin) */}
      {activeTab === 'attendance' && (() => {
        const hasAttPermission = canTakeAttendanceInClass(attClassId);
        const selectorClasses = isAdminUser
          ? SCHOOL_CLASS_IDS
          : attendanceClassIds.length > 0
          ? attendanceClassIds
          : availableClassIds;

        return (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
                {hasAttPermission ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-600" />}
                <span>
                  {isAdminUser
                    ? lang === 'bn'
                      ? 'অ্যাডমিন অ্যাক্সেস — সকল শ্রেণীর হাজিরা প্রদান অনুমোদিত'
                      : 'Admin Access — Attendance enabled for all classes'
                    : resolvedAssignedClass
                    ? lang === 'bn'
                      ? `শ্রেণী শিক্ষক (${resolvedAssignedClass}ম শ্রেণী) — শুধুমাত্র নির্ধারিত শ্রেণীর হাজিরা`
                      : `Class Teacher (Class ${resolvedAssignedClass}) — Attendance enabled for your assigned class`
                    : lang === 'bn'
                    ? 'শুধুমাত্র শ্রেণী শিক্ষক ও অ্যাডমিন হাজিরা দিতে পারবেন'
                    : 'Only Class Teacher & Admin can submit attendance'}
                </span>
              </div>
            </div>

            {!hasAttPermission && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-amber-900 dark:text-amber-200">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-black">
                    {lang === 'bn' ? 'হাজিরা প্রদানের অনুমতি নেই' : 'Attendance Submission Restricted'}
                  </p>
                  <p className="font-medium leading-relaxed">
                    {lang === 'bn'
                      ? 'একজন শিক্ষার্থীর হাজিরা শুধুমাত্র সেই শ্রেণীর নির্ধারিত শ্রেণী শিক্ষক (Class Teacher) অথবা অ্যাডমিন দিতে পারবেন। অন্য কোনো শিক্ষক হাজিরা প্রদান বা পরিবর্তন করতে পারবেন না।'
                      : 'Student attendance can only be recorded or updated by the assigned Class Teacher for that class or an Admin.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{lang === 'bn' ? 'শ্রেণী' : 'Class'}</label>
                  <select
                    value={attClassId}
                    disabled={!isAdminUser}
                    onChange={(e) => setAttClassId(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold disabled:opacity-75"
                  >
                    {selectorClasses.map((c) => (
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
                  type="button"
                  disabled={!hasAttPermission}
                  onClick={handleSaveAttendance}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 ${
                    hasAttPermission
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-75'
                  }`}
                >
                  {hasAttPermission ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
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
                          type="button"
                          disabled={!hasAttPermission}
                          onClick={() => hasAttPermission && setAttDraft((p) => ({ ...p, [st.id]: status }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
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
        );
      })()}

      {/* 2. Homework + Submission Grading */}
      {activeTab === 'homework' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={handleHwSubmit} className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
            <h4 className="font-extrabold text-base">{hwEditing ? (lang === 'bn' ? 'হোমওয়ার্ক সম্পাদনা' : 'Edit Assignment') : (lang === 'bn' ? 'নতুন হোমওয়ার্ক দিন' : 'Assign Homework')}</h4>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={hwForm.classId}
                disabled={isSingleClassOnly}
                onChange={(e) => {
                  const cid = e.target.value;
                  const firstSub = getNctbSubjectsForClass(cid)[0]?.id || 'Bangla';
                  setHwForm((p) => ({ ...p, classId: cid, subject: firstSub }));
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold disabled:opacity-75"
              >
                {availableClassIds.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <select
                value={hwForm.subject}
                onChange={(e) => setHwForm((p) => ({ ...p, subject: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              >
                {getNctbSubjectsForClass(hwForm.classId).map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {lang === 'bn' ? sub.bn : sub.en}
                    {(hwForm.classId === '9' || hwForm.classId === '10') && sub.group !== 'Common' ? ` (${sub.group})` : ''}
                  </option>
                ))}
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
              {!isSingleClassOnly && (
                <select
                  value={hwFilterClass}
                  onChange={(e) => setHwFilterClass(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  <option value="all">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>
                  {availableClassIds.map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
              )}
            </div>
            {visibleHomeworks
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
            {visibleSubmissions.length > 0 && (
              <div className="pt-4 space-y-3">
                <h4 className="font-extrabold text-sm">{lang === 'bn' ? 'জমাকৃত অ্যাসাইনমেন্ট মূল্যায়ন' : 'Submitted Assignments to Grade'}</h4>
                {visibleSubmissions.map((sub) => {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className={isMarkSecondaryClass ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                {lang === 'bn' ? 'পরীক্ষার টার্ম' : 'Term'}
              </label>
              <select
                value={markTerm}
                onChange={(e) => setMarkTerm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                {EXAM_TERMS.map((term) => <option key={term.id} value={term.id}>{t(term)}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                {lang === 'bn' ? 'শ্রেণী' : 'Class'}
              </label>
              <select
                value={markClassId}
                disabled={isSingleClassOnly}
                onChange={(e) => setMarkClassId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-75"
              >
                {availableClassIds.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            {isMarkSecondaryClass && (
              <div className="lg:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  {lang === 'bn' ? 'বিভাগ (Group)' : 'Group'}
                </label>
                <select
                  value={markGroup}
                  onChange={(e) => setMarkGroup(e.target.value as 'all' | Class910GroupId)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  <option value="all">{lang === 'bn' ? 'সকল বিভাগ' : 'All Groups'}</option>
                  {CLASS_9_10_GROUPS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {lang === 'bn' ? g.bn : g.en}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className={isMarkSecondaryClass ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                {lang === 'bn' ? 'বিষয় (NCTB)' : 'Subject (NCTB)'}
              </label>
              <select
                value={markSubject}
                onChange={(e) => {
                  const nextSub = e.target.value;
                  setMarkSubject(nextSub);
                  const found = markSubjectOptions.find((m) => m.id === nextSub);
                  if (found?.totalMarks) setMarkTotal(found.totalMarks);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                {markSubjectOptions.map((sub) => {
                  const unlocked = canEnterMarksForSubject(markClassId, sub.id);
                  return (
                    <option key={`${sub.id}-${sub.group}`} value={sub.id}>
                      [{sub.code}] {lang === 'bn' ? sub.bn : sub.en}
                      {isMarkSecondaryClass && markGroup === 'all' && sub.group !== 'Common' ? ` · ${sub.group}` : ''}
                      {unlocked ? '' : ' 🔒'}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                {lang === 'bn' ? 'পূর্ণমান' : 'Full'}
              </label>
              <input
                type="number"
                min={10}
                max={200}
                disabled={!canEditCurrentSubject}
                value={markTotal}
                onChange={(e) => setMarkTotal(Math.max(1, Number(e.target.value) || 100))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums disabled:opacity-60"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
              <button
                type="button"
                disabled={!canEditCurrentSubject}
                onClick={handleSaveMarksBulk}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>{lang === 'bn' ? 'নম্বর প্রকাশ' : 'Publish Marks'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const classMarks = visibleExamMarks.filter((m) => m.classId === markClassId && m.examTerm === markTerm);
                  exportCsv(
                    `marks_class_${markClassId}_${markTerm}`,
                    ['Term', 'Class', 'Roll', 'Student Name', 'Subject', 'Obtained', 'Total', 'Grade'],
                    classMarks.map((m) => [m.examTerm, m.classId, m.roll, m.studentName, m.subject, m.obtainedMarks, m.totalMarks, m.grade])
                  );
                }}
                title={lang === 'bn' ? 'CSV ডাউনলোড' : 'Export Class Marks CSV'}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center justify-center shrink-0"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject Permission Notice */}
          {canEnterAllSubjectsInClass(markClassId) ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isAdminUser
                  ? lang === 'bn'
                    ? 'অ্যাডমিন অনুমোদন: আপনি এই শ্রেণীর সকল বিষয়ের নম্বর এন্ট্রি দিতে পারবেন।'
                    : 'Admin Access: You can enter marks for all subjects in this class.'
                  : lang === 'bn'
                  ? `শ্রেণী শিক্ষক অনুমোদন (Class ${markClassId}): আপনি আপনার নির্ধারিত শ্রেণীর সকল বিষয়ের নম্বর এন্ট্রি দিতে পারবেন।`
                  : `Class Teacher Access (Class ${markClassId}): You can enter marks for all subjects in your assigned class.`}
              </span>
            </div>
          ) : canEditCurrentSubject ? (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-2.5 text-xs font-bold text-blue-900 dark:text-blue-200">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {lang === 'bn'
                  ? `বিষয় শিক্ষক: আপনি আপনার নির্ধারিত "${getSubjectDisplayLabel(markSubject, 'bn')}" বিষয়ের নম্বর এন্ট্রি দিতে পারবেন।`
                  : `Subject Teacher: Authorized to enter marks for your assigned subject "${markSubject}".`}
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {lang === 'bn'
                  ? `"${markSubject}" বিষয়ের নম্বর এন্ট্রি লক করা আছে। আপনি শুধুমাত্র আপনার নির্ধারিত বিষয় (${allowedSubjects.join(', ') || 'নির্ধারিত নয়'}) এর নম্বর এন্ট্রি দিতে পারবেন — সকল বিষয়ের নম্বর শুধুমাত্র অ্যাডমিন ও Class ${markClassId}-এর শ্রেণী শিক্ষক এন্ট্রি দিতে পারবেন।`
                  : `"${markSubject}" is locked. You can only enter marks for your assigned subject(s) (${allowedSubjects.join(', ') || 'None'}). All-subject entry is reserved for Admin and Class ${markClassId}'s Class Teacher.`}
              </span>
            </div>
          )}

          {/* Year Final Exam Auto Merit Roll Control */}
          {isCurrentYearFinal && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 text-xs font-bold text-purple-950 dark:text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoUpdateMeritRoll}
                  onChange={(e) => setAutoUpdateMeritRoll(e.target.checked)}
                  className="w-4 h-4 accent-purple-700 rounded"
                />
                <span>
                  {lang === 'bn'
                    ? 'বার্ষিক পরীক্ষা (Year Final Exam): নম্বর সেভ করার সাথে সাথে মেধাক্রম অনুযায়ী শিক্ষার্থীর রোল স্বয়ংক্রিয়ভাবে আপডেট হবে'
                    : 'Year Final Exam: Automatically update student Roll Numbers by merit rank whenever marks are saved'}
                </span>
              </label>
              {canEnterAllSubjectsInClass(markClassId) && markClassStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const updated = applyYearFinalMeritRolls(markClassId, markTerm);
                    notify(
                      updated.length > 0
                        ? lang === 'bn'
                          ? `মেধাক্রম অনুযায়ী ${updated.length} জন শিক্ষার্থীর রোল আপডেট হয়েছে!`
                          : `Updated ${updated.length} student roll numbers by merit!`
                        : lang === 'bn'
                        ? 'সকল শিক্ষার্থীর রোল ইতিমধ্যেই সঠিক মেধাক্রমে আছে।'
                        : 'All student rolls already match current merit ranking.'
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'এখনই মেধাক্রম রোল আপডেট' : 'Recalculate Merit Rolls'}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={markSearch}
                onChange={(e) => setMarkSearch(e.target.value)}
                placeholder={lang === 'bn' ? 'শিক্ষার্থীর নাম বা রোল লিখে খুঁজুন...' : 'Search student by name or roll...'}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
              {lang === 'bn'
                ? `${filteredMarkStudents.length} / ${markClassStudents.length} জন শিক্ষার্থী`
                : `${filteredMarkStudents.length} of ${markClassStudents.length} students`}
            </span>
          </div>

          {markClassStudents.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-dashed border-slate-300 dark:border-slate-700 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-slate-800 dark:text-white">
                  {lang === 'bn' ? `Class ${markClassId}-এ এখনো কোনো শিক্ষার্থী যুক্ত নেই` : `No students enrolled in Class ${markClassId} yet`}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'নিচ থেকে সরাসরি শিক্ষার্থী যোগ করে নম্বর এন্ট্রি শুরু করুন।' : 'Quickly add a student below to start entering marks.'}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <input
                  value={quickAddStudent.roll}
                  onChange={(e) => setQuickAddStudent((p) => ({ ...p, roll: e.target.value }))}
                  placeholder={lang === 'bn' ? 'রোল (যেমন: 01)' : 'Roll (e.g. 01)'}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
                <input
                  value={quickAddStudent.name}
                  onChange={(e) => setQuickAddStudent((p) => ({ ...p, name: e.target.value }))}
                  placeholder={lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name'}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
                <input
                  value={quickAddStudent.guardianMobile}
                  onChange={(e) => setQuickAddStudent((p) => ({ ...p, guardianMobile: e.target.value }))}
                  placeholder={lang === 'bn' ? 'অভিভাবকের মোবাইল' : 'Guardian Mobile'}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!quickAddStudent.roll.trim() || !quickAddStudent.name.trim()) return;
                    addStudent({
                      id: `st-${markClassId}-${Date.now()}`,
                      classId: markClassId,
                      roll: quickAddStudent.roll.trim(),
                      name: quickAddStudent.name.trim(),
                      section: quickAddStudent.section.trim() || 'A',
                      guardianMobile: quickAddStudent.guardianMobile.trim() || '01700000000',
                      registrationDate: todayStr,
                    });
                    setQuickAddStudent({ roll: '', name: '', section: 'A', guardianMobile: '' });
                    notify(lang === 'bn' ? 'শিক্ষার্থী যুক্ত হয়েছে! এখন নম্বর দিন।' : 'Student added! You can now enter marks.');
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> {lang === 'bn' ? 'শিক্ষার্থী যোগ' : 'Quick Add'}
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMarkStudents.map((st) => {
                const val = marksDraft[st.id] ?? '';
                const g = val !== '' ? calculateGrade(Number(val) || 0, markTotal).grade : '-';
                return (
                  <div key={st.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-sm">#{st.roll} — {st.name}</span>
                      <span className="ml-2 text-xs text-slate-400">({st.section})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={markTotal}
                        step="any"
                        disabled={!canEditCurrentSubject}
                        value={val}
                        onChange={(e) => setMarksDraft((p) => ({ ...p, [st.id]: e.target.value }))}
                        placeholder={canEditCurrentSubject ? `/ ${markTotal}` : 'Locked'}
                        className="w-24 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold tabular-nums disabled:opacity-50"
                      />
                      <span className="w-10 text-center text-xs font-black text-emerald-700 dark:text-emerald-400">{g}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Live Year Final Merit Ranking Table */}
          {isCurrentYearFinal && meritPreview.some((m) => m.subjectsCount > 0) && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-xs font-extrabold uppercase text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  {lang === 'bn'
                    ? `বার্ষিক পরীক্ষার মেধাক্রম ও রোল তালিকা — Class ${markClassId}`
                    : `Year Final Merit Ranking & Roll Order — Class ${markClassId}`}
                </h5>
                <span className="text-[11px] font-bold text-slate-500">
                  {lang === 'bn' ? 'মোট নম্বর ও GPA অনুযায়ী সাজানো' : 'Sorted by Pass/Fail, GPA & Total Marks'}
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">{lang === 'bn' ? 'মেধা রোল' : 'Merit Roll'}</th>
                      <th className="py-2.5 px-3">{lang === 'bn' ? 'শিক্ষার্থী' : 'Student'}</th>
                      <th className="py-2.5 px-3 text-center">{lang === 'bn' ? 'পূর্বের রোল' : 'Prev Roll'}</th>
                      <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'মোট নম্বর' : 'Total Marks'}</th>
                      <th className="py-2.5 px-3 text-right">GPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {meritPreview.map((entry) => (
                      <tr key={entry.studentId} className="bg-white dark:bg-slate-900">
                        <td className="py-2 px-3 font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                          #{entry.newRoll}
                        </td>
                        <td className="py-2 px-3 font-bold">
                          {entry.studentName}
                          {entry.failCount > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-black">
                              F ({entry.failCount})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center tabular-nums text-slate-500">#{entry.previousRoll}</td>
                        <td className="py-2 px-3 text-right font-bold tabular-nums">
                          {entry.totalObtained} / {entry.totalPossible}
                        </td>
                        <td className="py-2 px-3 text-right font-black tabular-nums">{entry.gpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {visibleExamMarks.filter((m) => m.classId === markClassId).length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 mb-2">{lang === 'bn' ? 'প্রকাশিত নম্বর তালিকা' : 'Recent Saved Marks'}</p>
              <div className="flex flex-wrap gap-2">
                {visibleExamMarks.filter((m) => m.classId === markClassId && m.examTerm === markTerm && m.subject === markSubject).map((m) => (
                  <span key={m.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                    #{m.roll}: {m.obtainedMarks} ({m.grade})
                    {canEditCurrentSubject && (
                      <button onClick={() => deleteExamMark(m.id)} className="text-red-500"><X className="w-3.5 h-3.5" /></button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3B. Fee & Payment Ledger */}
      {activeTab === 'fees' && !hasClassTeacherPrivilege ? (
        <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-2">
          <Lock className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="font-black text-base text-slate-900 dark:text-white">
            {lang === 'bn' ? 'ফি ও বেতন ব্যবস্থাপনা শুধুমাত্র শ্রেণী শিক্ষক ও অ্যাডমিনের জন্য' : 'Fee Ledger Reserved for Class Teachers & Admin'}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {lang === 'bn'
              ? 'কোনো শ্রেণীর শ্রেণী শিক্ষক (Class Teacher) নির্ধারিত হলে আপনি ঐ শ্রেণীর ফি ও বকেয়া পরিচালনা করতে পারবেন।'
              : 'Assign a Class Teacher role in Admin or Head Teacher settings to manage student fee ledgers for that class.'}
          </p>
        </div>
      ) : activeTab === 'fees' && (
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
                    <select value={bulkFeeForm.classId} disabled={!isHeadTeacher && Boolean(resolvedAssignedClass)} onChange={(e) => setBulkFeeForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-75">
                      {(isHeadTeacher ? availableClassIds : [resolvedAssignedClass]).map((c) => <option key={c} value={c}>Class {c}</option>)}
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
                    const st = visibleStudents.find((s) => s.id === singleFeeForm.studentId) || visibleStudents[0];
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
                  <select value={singleFeeForm.studentId || visibleStudents[0]?.id || ''} onChange={(e) => setSingleFeeForm((p) => ({ ...p, studentId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    {visibleStudents.map((st) => (
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
                  {isHeadTeacher && (
                    <select value={feeClassFilter} onChange={(e) => setFeeClassFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      <option value="all">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>
                      {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  )}
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
                <select value={broadcastForm.classId} disabled={isSingleClassOnly} onChange={(e) => setBroadcastForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-75">
                  {!isSingleClassOnly && <option value="all">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>}
                  {availableClassIds.map((c) => <option key={c} value={c}>Class {c}</option>)}
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

              {visiblePortalNotifications.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-52 overflow-y-auto">
                  {visiblePortalNotifications.slice(0, 6).map((pn) => (
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
              <select value={matForm.classId} disabled={isSingleClassOnly} onChange={(e) => setMatForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-75">
                {availableClassIds.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <select value={matForm.category} onChange={(e) => setMatForm((p) => ({ ...p, category: e.target.value as LibraryCategory }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {['Notes', 'StudyMaterial', 'ChapterPDF', 'BoardQuestion', 'ModelTest', 'Practical', 'MathSolution', 'EnglishGrammar', 'ICT', 'Textbook'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <select
              value={matForm.subject}
              onChange={(e) => setMatForm((p) => ({ ...p, subject: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
            >
              {getNctbSubjectsForClass(matForm.classId).map((sub) => (
                <option key={sub.id} value={sub.id}>
                  [{sub.code}] {lang === 'bn' ? sub.bn : sub.en}
                </option>
              ))}
            </select>
            <textarea rows={2} value={matForm.descEn} onChange={(e) => setMatForm((p) => ({ ...p, descEn: e.target.value, descBn: e.target.value }))} placeholder={lang === 'bn' ? 'সংক্ষিপ্ত বর্ণনা' : 'Short summary'} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            <input value={matForm.downloadUrl} onChange={(e) => setMatForm((p) => ({ ...p, downloadUrl: e.target.value }))} placeholder="PDF / Resource URL (or #)" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
              {lang === 'bn' ? 'লাইব্রেরিতে যুক্ত করুন' : 'Upload to Library'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {visibleEbooks.slice(0, 8).map((eb) => (
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
              <div>
                <h4 className="font-extrabold text-base">
                  {lang === 'bn' ? 'শ্রেণীভিত্তিক শিক্ষার্থী তালিকা ও কার্ড' : 'Class-wise Student Roster & Cards'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'bn'
                    ? `আপনার পাঠদানের ${availableClassIds.length}টি শ্রেণীতে মোট ${visibleStudents.length} জন শিক্ষার্থী`
                    : `${visibleStudents.length} students across ${availableClassIds.length} assigned class(es)`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select value={manageClassId} disabled={isSingleClassOnly} onChange={(e) => setManageClassId(e.target.value as '6' | '7' | '8' | '9' | '10')} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-75">
                  {availableClassIds.map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
                {visibleStudents.some((s) => s.classId === manageClassId) && (
                  <button
                    type="button"
                    onClick={() => {
                      const list = visibleStudents.filter((s) => s.classId === manageClassId);
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

            {/* Class-wise quick pills */}
            <div className="flex flex-wrap gap-1.5">
              {availableClassIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => setClassRosterFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    classRosterFilter === 'all'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {lang === 'bn' ? `সব শ্রেণী (${visibleStudents.length})` : `All Classes (${visibleStudents.length})`}
                </button>
              )}
              {availableClassIds.map((cid) => {
                const count = visibleStudents.filter((s) => s.classId === cid).length;
                const active = (availableClassIds.length === 1 ? cid : classRosterFilter) === cid;
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => {
                      setClassRosterFilter(cid);
                      setManageClassId(cid);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      active
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Class {cid} ({count})
                  </button>
                );
              })}
            </div>

            {canManageStudentsInClass(manageClassId) && (
              <form onSubmit={handleSaveStudent} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <input required placeholder="Roll" value={studentForm.roll} onChange={(e) => setStudentForm((p) => ({ ...p, roll: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                <input required placeholder="Student Name" value={studentForm.name} onChange={(e) => setStudentForm((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                {(manageClassId === '9' || manageClassId === '10') ? (
                  <select required value={studentForm.section} onChange={(e) => setStudentForm((p) => ({ ...p, section: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <option value="Science">{lang === 'bn' ? 'বিজ্ঞান (Science)' : 'Science'}</option>
                    <option value="Humanities">{lang === 'bn' ? 'মানবিক (Humanities)' : 'Humanities'}</option>
                    <option value="Business Studies">{lang === 'bn' ? 'ব্যবসায় শিক্ষা (Business Studies)' : 'Business Studies'}</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                ) : (
                  <input required placeholder="Section (A / B)" value={studentForm.section} onChange={(e) => setStudentForm((p) => ({ ...p, section: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                )}
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
            )}

            <div className="space-y-4">
              {(classRosterFilter === 'all' && availableClassIds.length > 1
                ? availableClassIds
                : [classRosterFilter === 'all' ? manageClassId : classRosterFilter]
              ).map((cid) => {
                const classStudents = visibleStudents
                  .filter((s) => s.classId === cid)
                  .sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }));
                const canEditThisClass = canManageStudentsInClass(cid);
                return (
                  <div key={cid} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs font-extrabold">
                      <span className="text-emerald-800 dark:text-emerald-300">
                        Class {cid} {resolvedAssignedClass === cid ? (lang === 'bn' ? '· শ্রেণী শিক্ষক' : '· Class Teacher') : ''}
                      </span>
                      <span className="text-slate-500 tabular-nums">{classStudents.length} {lang === 'bn' ? 'জন' : 'Students'}</span>
                    </div>
                    {classStudents.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 text-center">
                        {lang === 'bn' ? `Class ${cid}-এ কোনো শিক্ষার্থী নেই।` : `No students in Class ${cid}.`}
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 px-4">
                        {classStudents.map((st) => (
                          <div key={st.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span><b>#{st.roll}</b> {st.name} ({st.section})</span>
                            <div className="flex flex-wrap items-center gap-1">
                              <button type="button" onClick={() => openStudentCard(st, 'admit')} title={lang === 'bn' ? 'অ্যাডমিট কার্ড' : 'Admit Card'} className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold inline-flex items-center gap-1"><ClipboardList className="w-3 h-3" /> Admit</button>
                              <button type="button" onClick={() => openStudentCard(st, 'reg')} title={lang === 'bn' ? 'রেজিস্ট্রেশন কার্ড' : 'Registration Card'} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold inline-flex items-center gap-1"><FileBadge2 className="w-3 h-3" /> Reg</button>
                              <button type="button" onClick={() => openStudentCard(st, 'id')} title={lang === 'bn' ? 'আইডি কার্ড' : 'ID Card'} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold inline-flex items-center gap-1"><IdCard className="w-3 h-3" /> ID</button>
                              <button type="button" onClick={() => setCertStudent(st)} title={lang === 'bn' ? 'প্রত্যয়নপত্র ও সনদ' : 'Certificate'} className="p-1.5 text-purple-700 dark:text-purple-400"><Award className="w-3.5 h-3.5" /></button>
                              {canEditThisClass && (
                                <>
                                  <button type="button" onClick={() => { setManageClassId(cid); setEditingStudent(st); setStudentForm({ roll: st.roll, name: st.name, section: st.section, guardianMobile: st.guardianMobile, guardianName: st.guardianName || '', photo: st.photo || '', registrationDate: st.registrationDate || '2026-01-15' }); }} className="p-1.5 text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                                  <button type="button" onClick={() => deleteStudent(st.id)} className="p-1.5 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-base">{lang === 'bn' ? 'পরীক্ষার রুটিন যুক্ত করুন' : 'Exam Routine Schedule'}</h4>
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <select value={routineForm.classId} disabled={isSingleClassOnly} onChange={(e) => setRoutineForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-75">
                  {availableClassIds.map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select value={routineForm.subject} onChange={(e) => setRoutineForm((p) => ({ ...p, subject: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  {getNctbSubjectsForClass(routineForm.classId).map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {lang === 'bn' ? sub.bn : sub.en}
                    </option>
                  ))}
                </select>
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
              {visibleExamRoutines.map((r) => (
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
          {visibleParentLinks.length > 0 && (
            <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base">
                  {lang === 'bn' ? 'অভিভাবক-শিক্ষার্থী লিংক যাচাই' : 'Parent-Student Link Verification'}
                </h4>
                <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black">
                  {visibleParentLinks.filter((l) => l.status === 'pending').length} {lang === 'bn' ? 'টি অপেক্ষমাণ' : 'Pending'}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {visibleParentLinks.map((pl) => (
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
              <select value={mcqForm.classId} disabled={isSingleClassOnly} onChange={(e) => setMcqForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-75">
                {availableClassIds.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <select value={mcqForm.subject} onChange={(e) => setMcqForm((p) => ({ ...p, subject: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {getNctbSubjectsForClass(mcqForm.classId).map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {lang === 'bn' ? sub.bn : sub.en}
                  </option>
                ))}
              </select>
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
            {visibleOnlineExams.map((ex) => (
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

      {/* 8. Parent Messages (Strictly Isolated to Target Teacher) */}
      {activeTab === 'parent-messages' && (
        <div className="space-y-3">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {lang === 'bn'
              ? 'অভিভাবক কর্তৃক শুধুমাত্র আপনার নিকট পাঠানো ব্যক্তিগত বার্তাগুলো এখানে দেখা যাচ্ছে।'
              : 'Private guardian messages addressed exclusively to you are shown here.'}
          </div>
          {myParentMessages.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-sm">
              {lang === 'bn' ? 'আপনার নিকট কোনো অভিভাবক বার্তা নেই।' : 'No guardian messages directed to you yet.'}
            </div>
          ) : (
            myParentMessages.map((pm) => (
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
      {activeTab === 'student-leaves' && !hasClassTeacherPrivilege ? (
        <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-2">
          <Lock className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="font-black text-base text-slate-900 dark:text-white">
            {lang === 'bn' ? 'শিক্ষার্থীর ছুটি অনুমোদন শুধুমাত্র শ্রেণী শিক্ষক ও প্রধান শিক্ষকের জন্য' : 'Student Leave Approval Reserved for Class Teachers'}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {lang === 'bn'
              ? 'কোনো শ্রেণীর শ্রেণী শিক্ষক হিসেবে দায়িত্ব পেলে ঐ শ্রেণীর শিক্ষার্থীদের ছুটির আবেদন এখান থেকে অনুমোদন করতে পারবেন।'
              : 'Class Teachers and Head Teacher review student leave requests here.'}
          </p>
        </div>
      ) : activeTab === 'student-leaves' && (
        <div className="space-y-3">
          {visibleStudentLeaves.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-sm">
              {lang === 'bn' ? 'এই শ্রেণীর কোনো ছুটির আবেদন নেই।' : 'No student leave requests for this class.'}
            </div>
          ) : (
            visibleStudentLeaves.map((sl) => (
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
            ))
          )}
        </div>
      )}

      {/* 12. Head Teacher Class Teacher Assignment Panel */}
      {activeTab === 'class-teachers' && isHeadTeacher && (
        <ClassTeacherAssignmentPanel allowAddNew={false} onNotify={notify} />
      )}
    </>
  );

  const unassignedNoticeContent = (
    <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white">
        {lang === 'bn' ? 'আপনার জন্য এখনো কোনো পাঠদানের শ্রেণী নির্ধারিত হয়নি' : 'No Teaching Classes Assigned Yet'}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
        {lang === 'bn'
          ? 'অ্যাডমিন বা প্রধান শিক্ষক আপনার জন্য পাঠদানের শ্রেণী (সব শ্রেণী বা ১/২/৩টি নির্দিষ্ট শ্রেণী) নির্ধারণ করলে সকল শ্রেণীভিত্তিক শিক্ষার্থী ও কার্যক্রম এখানে দেখা যাবে।'
          : 'Once Admin or Head Teacher assigns your teaching classes (All or selected classes), your class-wise students and tools will appear here.'}
      </p>
      <button
        type="button"
        onClick={() => setTeacherIdCardOpen(true)}
        className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
      >
        <IdCard className="w-4 h-4" />
        <span>{lang === 'bn' ? 'আমার শিক্ষক আইডি কার্ড' : 'My Teacher ID Card'}</span>
      </button>
    </div>
  );

  const renderModals = () => (
    <>

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
          cardIssueDate={idCardStudent.cardIssueDate}
          cardValidUpto={idCardStudent.cardValidUpto}
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
              cardIssueDate: updates.cardIssueDate ?? target.cardIssueDate,
              cardValidUpto: updates.cardValidUpto ?? target.cardValidUpto,
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
      <TeacherIdCardModal
        open={teacherIdCardOpen}
        onClose={() => setTeacherIdCardOpen(false)}
        teacher={resolvedTeacherCardProfile}
        teacherIndex={matchedTeacherIdx !== -1 ? matchedTeacherIdx : teachers.length}
        allTeachers={user?.role === 'admin' ? teachers : undefined}
        phoneOverride={user?.phone}
        onSaveProfile={(updates) => {
          const target = teachers.find((tc) => tc.id === updates.id);
          if (target && (user?.role === 'admin' || matchedTeacherIdx !== -1)) {
            updateTeacher({
              ...target,
              teacherCode: updates.teacherCode,
              phone: updates.phone,
              bloodGroup: updates.bloodGroup,
              cardIssueDate: updates.issueDate,
              cardValidUpto: updates.validUpto,
              photo: updates.photo ?? target.photo,
            });
          }
          if (user && (user.userId === updates.id || matchedTeacherIdx !== -1)) {
            void updateUser({
              ...user,
              ...(updates.phone ? { phone: updates.phone } : {}),
              ...(updates.photo ? { photo: updates.photo } : {}),
            });
          }
          notify(lang === 'bn' ? 'শিক্ষকের আইডি কার্ডের তথ্য সংরক্ষিত হয়েছে!' : 'Faculty ID Card details saved!');
        }}
        onSavePhoto={(teacherId, photoDataUrl) => {
          if (user?.role === 'admin') {
            const target = teachers.find((tc) => tc.id === teacherId);
            if (target) updateTeacher({ ...target, photo: photoDataUrl });
          } else if (user) {
            void updateUser({ ...user, photo: photoDataUrl });
          }
          notify(lang === 'bn' ? 'শিক্ষকের ছবি সংরক্ষিত হয়েছে!' : 'Teacher photo saved!');
        }}
      />
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-6">
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
        )}
        {!isHeadTeacher && !hasAnyAssignedClass ? unassignedNoticeContent : teacherBodyContent}
        {renderModals()}
      </div>
    );
  }

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
                  <p className="text-[10px] text-emerald-300 font-bold">
                    EIIN {settings.eiin} · {lang === 'bn' ? 'শিক্ষক পোর্টাল' : 'Teacher'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg hover:bg-emerald-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1 flex-1">
              {tabs.map((item) => {
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
                {lang === 'bn' ? 'শিক্ষক পোর্টাল' : 'Teacher Portal'} · EIIN {settings.eiin}
              </p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {tabs.map((item) => {
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
        {/* Sticky Top Bar */}
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
                  placeholder={lang === 'bn' ? 'শিক্ষার্থী, মেনু বা নোটিশ খুঁজুন...' : 'Search students, tabs, notices...'}
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

              {/* Teacher ID Card Shortcut */}
              <button
                type="button"
                onClick={() => setTeacherIdCardOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <IdCard className="w-4 h-4" />
                <span>{lang === 'bn' ? 'আইডি কার্ড' : 'ID Card'}</span>
              </button>

              {/* Parent Messages / Alerts Bell */}
              <button
                type="button"
                onClick={() => setActiveTab(pendingRepliesCount > 0 ? 'parent-messages' : 'notices')}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-colors"
                title={lang === 'bn' ? 'বার্তা ও বিজ্ঞপ্তি' : 'Messages & Alerts'}
              >
                <Bell className="w-4 h-4" />
                {(pendingRepliesCount + pendingStudentLeaveCount) > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center tabular-nums">
                    {pendingRepliesCount + pendingStudentLeaveCount}
                  </span>
                )}
              </button>

              {/* Profile & Avatar Upload */}
              <div className="flex items-center gap-2.5 pl-1">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center">
                    {teacherPhoto ? (
                      <img src={teacherPhoto} alt="" className="w-full h-full object-cover" />
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
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleTeacherAvatarUpload} className="hidden" />
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white max-w-[140px] truncate">
                    {t(resolvedTeacherCardProfile.name)}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {teacherDisplayCode}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Scrollable Canvas */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {!isHeadTeacher && !hasAnyAssignedClass ? unassignedNoticeContent : teacherBodyContent}
        </main>
      </div>

      {renderModals()}
    </div>
  );
};
