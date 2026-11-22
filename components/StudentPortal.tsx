import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
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
} from 'lucide-react';
import { useApp } from '../App';
import { FeeRecord } from '../types';
import { calculateOverallGpa, isSafeHttpUrl } from '../utils/security';
import { exportCsv } from '../utils/exportUtils';
import { AcademicReportCard } from './AcademicReportCard';
import { FeeReceiptModal } from './FeeReceiptModal';
import { StudentIdAdmitCard } from './StudentIdAdmitCard';

const { useState, useMemo, useEffect } = React;
const { Link } = RouterDom;

type StudentTab = 'homework' | 'marks' | 'progress' | 'attendance' | 'fees' | 'materials' | 'leave' | 'notices';

export const StudentPortal: React.FC = () => {
  const {
    lang,
    t,
    user,
    firebaseUser,
    notices,
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<StudentTab>('homework');
  const [selectedClassId, setSelectedClassId] = useState<string>(user?.linkedChildClass || '9');
  const [selectedRoll, setSelectedRoll] = useState<string>(user?.linkedChildRoll || '01');
  const [toast, setToast] = useState<string | null>(null);
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<FeeRecord | null>(null);
  const [idCardOpen, setIdCardOpen] = useState(false);

  useEffect(() => {
    if (user?.linkedChildClass) setSelectedClassId(user.linkedChildClass);
    if (user?.linkedChildRoll) setSelectedRoll(user.linkedChildRoll);
  }, [user?.linkedChildClass, user?.linkedChildRoll]);

  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);
  const [submissionAnswer, setSubmissionAnswer] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
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
    () => students.find((s) => s.classId === selectedClassId && s.roll === selectedRoll.trim()),
    [students, selectedClassId, selectedRoll]
  );

  const classHomeworks = useMemo(
    () => homeworkList.filter((h) => h.classId === selectedClassId),
    [homeworkList, selectedClassId]
  );

  const myMarks = useMemo(
    () => examMarks.filter((m) => m.classId === selectedClassId && (m.roll === selectedRoll.trim() || !selectedRoll.trim())),
    [examMarks, selectedClassId, selectedRoll]
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
        const st = matchedStudent ? sheet.records[matchedStudent.id] : undefined;
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
    return { totalBilled, totalPaid, totalDue };
  }, [myFees]);

  const targetedAlerts = useMemo(
    () =>
      portalNotifications.filter(
        (n) =>
          (n.targetRole === 'all' || n.targetRole === 'student') &&
          (!n.classId || n.classId === 'all' || n.classId === selectedClassId)
      ),
    [portalNotifications, selectedClassId]
  );

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

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Profile Selector & Quick Links */}
      <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              {lang === 'bn' ? 'শ্রেণী' : 'Class'}
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm"
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
              className="w-24 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm"
            />
          </div>
          {matchedStudent && (
            <div className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
              {firebaseUser && <ShieldCheck className="w-4 h-4" />}
              {matchedStudent.name} ({matchedStudent.section})
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setIdCardOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center gap-1.5 whitespace-nowrap"
          >
            <IdCard className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            {lang === 'bn' ? 'আইডি ও প্রবেশপত্র' : 'ID & Admit Card'}
          </button>
          <Link
            to="/exams"
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 whitespace-nowrap"
          >
            <Trophy className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'অনলাইন MCQ পরীক্ষা' : 'MCQ Exams'}
          </Link>
          <Link
            to="/routine"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ক্লাস ও পরীক্ষার রুটিন' : 'Routines'}
          </Link>
          <Link
            to="/ebooks"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center gap-1.5 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Digital Library'}
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'উপস্থিতি' : 'Attendance'}</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{attendancePct}%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'বর্তমান জিপিএ' : 'Current GPA'}</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{gpaSummary.gpa}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'অ্যাসাইনমেন্ট' : 'Homework'}</p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">{classHomeworks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'স্টাডি নোটস' : 'Study Materials'}</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{classMaterials.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto border border-slate-200 dark:border-slate-700 gap-1">
        {[
          { id: 'homework', label: lang === 'bn' ? 'অ্যাসাইনমেন্ট ও জমা' : 'Assignments', icon: BookOpenCheck },
          { id: 'marks', label: lang === 'bn' ? 'ফলাফল' : 'Exam Results', icon: Award },
          { id: 'progress', label: lang === 'bn' ? 'পড়াশোনার অগ্রগতি' : 'Academic Progress', icon: TrendingUp },
          { id: 'attendance', label: lang === 'bn' ? 'উপস্থিতি' : 'Attendance', icon: ClipboardCheck },
          { id: 'fees', label: lang === 'bn' ? 'ফি ও রশিদ' : 'Fees & Receipts', icon: Receipt },
          { id: 'materials', label: lang === 'bn' ? 'বই ও নোটস' : 'Study Materials', icon: FileText },
          { id: 'leave', label: lang === 'bn' ? 'ছুটির আবেদন' : 'Apply Leave', icon: CalendarPlus },
          { id: 'notices', label: lang === 'bn' ? 'নোটিশ' : 'Notices', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudentTab)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

      {/* Homework + Online Assignment Submission */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          {classHomeworks.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-slate-400 font-bold text-sm">
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
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
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
                      <td className="px-6 py-4 font-bold">
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
            <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
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
                      <span>
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
                  <p className="font-bold text-sm">{a.date}</p>
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
                          <p className="text-xs text-slate-400">{f.category}{f.billingMonth ? ` · ${f.billingMonth}` : ''}</p>
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

      {/* Study Materials */}
      {activeTab === 'materials' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classMaterials.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 p-10 text-center bg-slate-50 dark:bg-slate-800 rounded-3xl text-slate-400 font-bold text-sm">
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

      {/* Leave */}
      {activeTab === 'leave' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={handleLeaveSubmit} className="lg:col-span-5 bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-extrabold">{lang === 'bn' ? 'শিক্ষকের নিকট ছুটির আবেদন' : 'Submit Leave Request'}</h4>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as 'Sick' | 'Family' | 'Emergency' | 'Other' })}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm"
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
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm"
              />
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm"
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
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
            />
            <button type="submit" className="w-full bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-800">
              {lang === 'bn' ? 'আবেদন পাঠান' : 'Submit'}
            </button>
          </form>
          <div className="lg:col-span-7 space-y-3">
            {myLeaves.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 dark:bg-slate-800 rounded-3xl text-slate-400 font-bold text-sm">
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
                        <button onClick={() => deleteStudentLeave(lv.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
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
            {notices.map((n) => (
              <div key={n.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{n.category}</span>
                  <span className="tabular-nums">{n.date}</span>
                </div>
                <h4 className="font-extrabold text-base">{t(n.title)}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t(n.description)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
        studentName={matchedStudent?.name || user?.name || 'Student'}
        classId={selectedClassId}
        roll={selectedRoll.trim() || '01'}
        section={matchedStudent?.section || 'A'}
        guardianMobile={matchedStudent?.guardianMobile}
      />
    </div>
  );
};
