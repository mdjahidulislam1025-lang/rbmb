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
} from 'lucide-react';
import { useApp } from '../App';
import { CLASSES, CLASS_SUBJECTS, EXAM_TERMS } from '../constants';
import { AttendanceStatus, ExamMark, HomeworkItem, LibraryCategory, SchoolStudent } from '../types';
import { calculateGrade, isSafeHttpUrl } from '../utils/security';

const { useState, useEffect, useMemo } = React;

type TeacherTab =
  | 'attendance'
  | 'homework'
  | 'marks'
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
    teacherLeaves,
    submitTeacherLeave,
    deleteTeacherLeave,
    studentLeaves,
    updateStudentLeaveStatus,
    deleteStudentLeave,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TeacherTab>('attendance');
  const [toast, setToast] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

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
  const [studentForm, setStudentForm] = useState({ roll: '', name: '', section: 'A', guardianMobile: '' });
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
    setStudentForm({ roll: '', name: '', section: 'A', guardianMobile: '' });
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
  const handleCreateMcqExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcqForm.titleEn.trim() || !mcqForm.question.trim()) return;
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
      questions: [
        {
          id: 'q1',
          question: mcqForm.question.trim(),
          options: [mcqForm.opt0.trim(), mcqForm.opt1.trim(), mcqForm.opt2.trim(), mcqForm.opt3.trim()],
          correctIndex: mcqForm.correctIndex,
          explanation: mcqForm.explanation.trim(),
        },
      ],
    });
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

  const tabs: { id: TeacherTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'attendance', label: lang === 'bn' ? 'হাজিরা' : 'Attendance', icon: ClipboardCheck },
    { id: 'homework', label: lang === 'bn' ? 'হোমওয়ার্ক ও মূল্যায়ন' : 'Assignments', icon: BookOpenCheck },
    { id: 'marks', label: lang === 'bn' ? 'নম্বর এন্ট্রি' : 'Marks Entry', icon: Award },
    { id: 'notices', label: lang === 'bn' ? 'নোটিশ প্রকাশ' : 'Notices', icon: Bell },
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
            onClick={signInWithGoogle}
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
            <button
              onClick={handleSaveAttendance}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {lang === 'bn' ? 'হাজিরা সেভ করুন' : 'Save Attendance'}
            </button>
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
            <button onClick={handleSaveMarksBulk} className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5">
              <Save className="w-4 h-4" />
              {lang === 'bn' ? 'নম্বর প্রকাশ করুন' : 'Publish Marks'}
            </button>
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

      {/* 4. Notices Publish & View */}
      {activeTab === 'notices' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={handlePublishNotice} className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 h-fit">
            <h4 className="font-extrabold text-base">{lang === 'bn' ? 'নতুন নোটিশ প্রকাশ করুন' : 'Publish School Notice'}</h4>
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

          <div className="lg:col-span-7 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={noticeSearch} onChange={(e) => setNoticeSearch(e.target.value)} placeholder={lang === 'bn' ? 'নোটিশ খুঁজুন...' : 'Search notices...'} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm" />
            </div>
            {notices
              .filter((n) => !noticeSearch.trim() || t(n.title).toLowerCase().includes(noticeSearch.trim().toLowerCase()))
              .map((n) => (
                <div key={n.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{n.category}</span>
                    <span>{n.date}</span>
                  </div>
                  <h5 className="font-bold text-sm mt-1">{t(n.title)}</h5>
                  <p className="text-xs text-slate-500 mt-1">{t(n.description)}</p>
                </div>
              ))}
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
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-base">{lang === 'bn' ? 'শিক্ষার্থী তালিকা ও পরিচালনা' : 'Student Roster Management'}</h4>
              <select value={manageClassId} onChange={(e) => setManageClassId(e.target.value as '6' | '7' | '8' | '9' | '10')} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {CLASSES.map((c) => <option key={c.classId} value={c.classId}>Class {c.classId}</option>)}
              </select>
            </div>
            <form onSubmit={handleSaveStudent} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input required placeholder="Roll" value={studentForm.roll} onChange={(e) => setStudentForm((p) => ({ ...p, roll: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <input required placeholder="Student Name" value={studentForm.name} onChange={(e) => setStudentForm((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <input required placeholder="Section" value={studentForm.section} onChange={(e) => setStudentForm((p) => ({ ...p, section: e.target.value }))} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1">
                <Plus className="w-3.5 h-3.5" /> {editingStudent ? 'Save' : 'Add'}
              </button>
            </form>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.filter((s) => s.classId === manageClassId).map((st) => (
                <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                  <span><b>#{st.roll}</b> {st.name} ({st.section})</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingStudent(st); setStudentForm({ roll: st.roll, name: st.name, section: st.section, guardianMobile: st.guardianMobile }); }} className="p-1.5 text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteStudent(st.id)} className="p-1.5 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
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
        </div>
      )}

      {/* 7. Create Online MCQ Exam */}
      {activeTab === 'online-exams' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={handleCreateMcqExam} className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-extrabold text-base">{lang === 'bn' ? 'অনলাইন MCQ পরীক্ষা তৈরি করুন' : 'Create Online MCQ Quiz'}</h4>
            <div className="grid grid-cols-2 gap-3">
              <input value={mcqForm.titleBn} onChange={(e) => setMcqForm((p) => ({ ...p, titleBn: e.target.value }))} placeholder="শিরোনাম (বাংলা)" className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <input required value={mcqForm.titleEn} onChange={(e) => setMcqForm((p) => ({ ...p, titleEn: e.target.value }))} placeholder="Title (English)" className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select value={mcqForm.classId} onChange={(e) => setMcqForm((p) => ({ ...p, classId: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {['6', '7', '8', '9', '10'].map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <input value={mcqForm.subject} onChange={(e) => setMcqForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <select value={mcqForm.mode} onChange={(e) => setMcqForm((p) => ({ ...p, mode: e.target.value as 'exam' | 'practice' }))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <option value="exam">Timed Exam</option>
                <option value="practice">Practice</option>
              </select>
            </div>
            <input required value={mcqForm.question} onChange={(e) => setMcqForm((p) => ({ ...p, question: e.target.value }))} placeholder="Question text..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold" />
            <div className="grid grid-cols-2 gap-2">
              <input required value={mcqForm.opt0} onChange={(e) => setMcqForm((p) => ({ ...p, opt0: e.target.value }))} placeholder="Option A" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              <input required value={mcqForm.opt1} onChange={(e) => setMcqForm((p) => ({ ...p, opt1: e.target.value }))} placeholder="Option B" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              <input required value={mcqForm.opt2} onChange={(e) => setMcqForm((p) => ({ ...p, opt2: e.target.value }))} placeholder="Option C" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              <input required value={mcqForm.opt3} onChange={(e) => setMcqForm((p) => ({ ...p, opt3: e.target.value }))} placeholder="Option D" className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
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
            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
              {lang === 'bn' ? 'পরীক্ষা প্রকাশ করুন' : 'Publish MCQ Quiz'}
            </button>
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
    </div>
  );
};
