import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  Award,
  TrendingUp,
  Bell,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Clock,
  XCircle,
  Receipt,
  Printer,
  Download,
  Megaphone,
  IdCard,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '../App';
import { FeeRecord, SchoolStudent } from '../types';
import { calculateOverallGpa, phonesMatch, buildStudentRegistrationNo } from '../utils/security';
import { getDhakaTodayISO, getDhakaYear, formatDhakaClock } from '../utils/dhakaTime';
import { exportCsv } from '../utils/exportUtils';
import { AcademicReportCard } from './AcademicReportCard';
import { FeeReceiptModal } from './FeeReceiptModal';
import { StudentIdAdmitCard } from './StudentIdAdmitCard';

const { useState, useMemo } = React;
const { Link } = RouterDom;

type ParentTab = 'overview' | 'results' | 'attendance' | 'fees' | 'routine' | 'notices' | 'holidays' | 'messages';

export const ParentPortal: React.FC = () => {
  const {
    lang,
    t,
    user,
    firebaseUser,
    updateUser,
    students,
    attendanceRecords,
    studentAttendance,
    examMarks,
    examRoutines,
    notices,
    holidays,
    teachers,
    parentMessages,
    sendParentMessage,
    parentLinks,
    requestParentStudentLink,
    feeRecords,
    portalNotifications,
    updateStudent,
  } = useApp();
  const activeYear = getDhakaYear();

  const [activeTab, setActiveTab] = useState<ParentTab>('overview');
  const [verifyPhoneInput, setVerifyPhoneInput] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string>('');
  const [relationship, setRelationship] = useState<'Father' | 'Mother' | 'Guardian'>(user?.relationship || 'Father');
  const [isRequestingLink, setIsRequestingLink] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<FeeRecord | null>(null);
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  const openCardModal = () => {
    setIdCardOpen(true);
  };

  const [msgForm, setMsgForm] = useState({
    teacherId: teachers[0]?.id || '',
    subject: '',
    message: '',
  });

  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  // Resolve ALL children verified for this parent account (by ID list, primary link, or exact guardian mobile)
  const linkedChildren = useMemo(() => {
    if (!user) return [] as SchoolStudent[];
    const result: SchoolStudent[] = [];
    const seen = new Set<string>();
    const addIfNew = (st?: SchoolStudent) => {
      if (st && !seen.has(st.id)) {
        seen.add(st.id);
        result.push(st);
      }
    };

    if (user.linkedStudentId) {
      addIfNew(students.find((s) => s.id === user.linkedStudentId));
    }
    if (Array.isArray(user.linkedStudentIds)) {
      user.linkedStudentIds.forEach((sid) => {
        addIfNew(students.find((s) => s.id === sid));
      });
    }
    if (user.linkedChildClass && user.linkedChildRoll) {
      addIfNew(
        students.find(
          (s) => s.classId === user.linkedChildClass && s.roll.trim() === (user.linkedChildRoll || '').trim()
        )
      );
    }
    if (user.phone) {
      students.forEach((s) => {
        if (phonesMatch(user.phone, s.guardianMobile)) {
          addIfNew(s);
        }
      });
    }
    return result;
  }, [students, user]);

  const matchedChild = useMemo(() => {
    if (linkedChildren.length === 0) return undefined;
    if (selectedChildId) {
      const picked = linkedChildren.find((c) => c.id === selectedChildId);
      if (picked) return picked;
    }
    return linkedChildren[0];
  }, [linkedChildren, selectedChildId]);

  const childClass = matchedChild?.classId || user?.linkedChildClass || '';
  const childRoll = matchedChild?.roll || user?.linkedChildRoll || '';
  const hasBoundStudent = Boolean(childClass && childRoll);

  const childRegNo = useMemo(() => {
    if (!hasBoundStudent) return '';
    return matchedChild?.registrationNo || buildStudentRegistrationNo(childClass, childRoll, matchedChild?.session || '2026');
  }, [hasBoundStudent, matchedChild, childClass, childRoll]);

  const currentLinkRequest = useMemo(() => {
    if (!hasBoundStudent) return null;
    return parentLinks.find((l) => l.classId === childClass && l.roll.trim() === childRoll.trim()) || null;
  }, [parentLinks, hasBoundStudent, childClass, childRoll]);

  // One-time verification only if an unlinked Google-authenticated parent hasn't bound any children yet
  const handleVerifyStudentPhoneOnce = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    if (!user || hasBoundStudent) return;
    const matchedList = students.filter((s) => phonesMatch(verifyPhoneInput, s.guardianMobile));
    if (matchedList.length === 0) {
      setVerifyError(
        lang === 'bn'
          ? 'এই মোবাইল নম্বরের সাথে কোনো নিবন্ধিত শিক্ষার্থীর তথ্য মেলেনি।'
          : 'No registered student found matching this mobile number.'
      );
      return;
    }
    const primary = matchedList[0];
    await updateUser({
      ...user,
      phone: verifyPhoneInput.trim(),
      relationship,
      linkedStudentId: primary.id,
      linkedStudentIds: matchedList.map((s) => s.id),
      linkedChildClass: primary.classId,
      linkedChildRoll: primary.roll,
      linkedChildName: primary.name,
    });
    setSelectedChildId(primary.id);
    if (firebaseUser) {
      for (const child of matchedList) {
        await requestParentStudentLink({
          classId: child.classId,
          roll: child.roll,
          relationship,
        });
      }
    }
    notify(
      lang === 'bn'
        ? matchedList.length > 1
          ? `এই নম্বরে থাকা ${matchedList.length} জন শিক্ষার্থীর প্রোফাইল যাচাই ও সংযুক্ত হয়েছে!`
          : 'সন্তানের প্রোফাইল যাচাই ও সংযুক্ত হয়েছে!'
        : matchedList.length > 1
        ? `${matchedList.length} linked children verified and connected!`
        : 'Child profile verified and locked!'
    );
  };

  const handleRequestVerifiedLink = async () => {
    if (!firebaseUser || !hasBoundStudent) return;
    setIsRequestingLink(true);
    const ok = await requestParentStudentLink({
      classId: childClass,
      roll: childRoll.trim(),
      relationship,
    });
    setIsRequestingLink(false);
    if (ok) {
      notify(
        lang === 'bn'
          ? 'যাচাইয়ের জন্য আবেদন পাঠানো হয়েছে! শিক্ষক অনুমোদন করলে তথ্য দেখতে পাবেন।'
          : 'Verification request submitted! Data unlocks once approved by a teacher.'
      );
    } else {
      notify(lang === 'bn' ? 'আবেদন পাঠানো যায়নি।' : 'Could not submit verification request.');
    }
  };

  const childMarks = useMemo(
    () => (hasBoundStudent ? examMarks.filter((m) => m.classId === childClass && m.roll.trim() === childRoll.trim()) : []),
    [hasBoundStudent, examMarks, childClass, childRoll]
  );

  const gpaStats = useMemo(() => calculateOverallGpa(childMarks), [childMarks]);

  const childAttendance = useMemo(() => {
    if (!hasBoundStudent) return [];
    const byDate = new Map<string, { id: string; date: string; status: string; teacherName: string }>();
    studentAttendance
      .filter((sa) => sa.classId === childClass && sa.roll.trim() === childRoll.trim())
      .forEach((sa) => {
        byDate.set(sa.date, {
          id: sa.id,
          date: sa.date,
          status: sa.status,
          teacherName: sa.teacherName,
        });
      });

    attendanceRecords
      .filter((r) => r.classId === childClass)
      .forEach((sheet) => {
        const st = matchedChild ? sheet.records[matchedChild.id] : undefined;
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
  }, [hasBoundStudent, studentAttendance, attendanceRecords, childClass, childRoll, matchedChild]);

  const attendancePct = useMemo(() => {
    if (childAttendance.length === 0) return 0;
    const presentOrLate = childAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    return Math.round((presentOrLate / childAttendance.length) * 100);
  }, [childAttendance]);

  const childExamRoutine = useMemo(
    () => (hasBoundStudent ? examRoutines.filter((r) => r.classId === childClass) : []),
    [hasBoundStudent, examRoutines, childClass]
  );

  const myMessages = useMemo(
    () =>
      hasBoundStudent
        ? parentMessages.filter(
            (m) =>
              (m.classId === childClass && m.roll.trim() === childRoll.trim()) ||
              (user?.userId && m.ownerUid === user.userId)
          )
        : [],
    [hasBoundStudent, parentMessages, childClass, childRoll, user]
  );

  const childFees = useMemo(
    () =>
      hasBoundStudent
        ? feeRecords
            .filter((f) => f.classId === childClass && f.roll.trim() === childRoll.trim())
            .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
        : [],
    [hasBoundStudent, feeRecords, childClass, childRoll]
  );

  const childFeeSummary = useMemo(() => {
    const billed = childFees.reduce((s, f) => s + f.amount, 0);
    const paid = childFees.reduce((s, f) => s + f.paidAmount, 0);
    const due = childFees.reduce((s, f) => (f.status === 'waived' ? s : s + Math.max(0, f.amount - f.paidAmount)), 0);
    return { billed, paid, due };
  }, [childFees]);

  const guardianAlerts = useMemo(
    () =>
      portalNotifications.filter(
        (n) =>
          (n.targetRole === 'all' || n.targetRole === 'parent') &&
          (!n.classId || n.classId === 'all' || (hasBoundStudent && n.classId === childClass))
      ),
    [portalNotifications, hasBoundStudent, childClass]
  );

  const selectedTeacherObj = useMemo(
    () => teachers.find((tc) => tc.id === msgForm.teacherId) || teachers[0],
    [teachers, msgForm.teacherId]
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasBoundStudent || !msgForm.subject.trim() || !msgForm.message.trim()) return;
    sendParentMessage({
      id: `pm-${Date.now()}`,
      parentName: user?.name || 'Guardian',
      studentName: matchedChild?.name || user?.linkedChildName || `Roll ${childRoll}`,
      classId: childClass,
      roll: childRoll.trim(),
      teacherId: selectedTeacherObj?.id,
      teacherCode: selectedTeacherObj?.teacherCode,
      teacherName: selectedTeacherObj ? t(selectedTeacherObj.name) : 'Md. Abdul Karim',
      subject: msgForm.subject.trim(),
      message: msgForm.message.trim(),
      status: 'open',
      createdDate: getDhakaTodayISO(),
    });
    setMsgForm((prev) => ({ ...prev, subject: '', message: '' }));
    notify(
      lang === 'bn'
        ? 'শুধুমাত্র নির্বাচিত শিক্ষকের নিকট বার্তা পাঠানো হয়েছে!'
        : 'Private message sent exclusively to the selected teacher!'
    );
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Strictly Isolated Single-Student Header */}
      {!hasBoundStudent ? (
        <form
          onSubmit={handleVerifyStudentPhoneOnce}
          className="bg-amber-50 dark:bg-amber-950/40 p-6 rounded-3xl border border-amber-200 dark:border-amber-800 space-y-4"
        >
          <div className="space-y-1">
            <h3 className="text-base font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              {lang === 'bn' ? 'সন্তানের নিবন্ধিত মোবাইল নম্বর দিয়ে যাচাই করুন' : "Verify with Student's Registered Mobile Number"}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {lang === 'bn'
                ? 'অন্য কোনো শিক্ষার্থীর তথ্য সুরক্ষার জন্য শুধুমাত্র শিক্ষার্থীর দেওয়া মোবাইল নম্বর দিয়ে একবার সংযুক্ত হতে হবে।'
                : "To protect student privacy, enter the exact mobile number registered by your child to view only your child's information."}
            </p>
          </div>
          {verifyError && (
            <p className="text-xs font-bold text-red-600 dark:text-red-300">{verifyError}</p>
          )}
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                {lang === 'bn' ? 'সম্পর্ক' : 'Relationship'}
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as 'Father' | 'Mother' | 'Guardian')}
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              >
                <option value="Father">{lang === 'bn' ? 'পিতা' : 'Father'}</option>
                <option value="Mother">{lang === 'bn' ? 'মাতা' : 'Mother'}</option>
                <option value="Guardian">{lang === 'bn' ? 'অভিভাবক' : 'Guardian'}</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                {lang === 'bn' ? 'শিক্ষার্থীর মোবাইল নম্বর' : 'Student Mobile Number'}
              </label>
              <input
                required
                type="tel"
                value={verifyPhoneInput}
                onChange={(e) => setVerifyPhoneInput(e.target.value)}
                placeholder="01712-667788"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold"
            >
              {lang === 'bn' ? 'যাচাই ও সংযুক্ত করুন' : 'Verify & Link Child'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                {matchedChild?.photo ? (
                  <img src={matchedChild.photo} alt={matchedChild.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {matchedChild?.name || user?.linkedChildName || `Roll ${childRoll}`}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold">
                    {lang === 'bn' ? `${childClass}ম শ্রেণী` : `Class ${childClass}`} ·{' '}
                    {lang === 'bn' ? `রোল ${childRoll}` : `Roll ${childRoll}`}
                    {matchedChild?.section ? ` (${matchedChild.section})` : ''}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'রেজিস্ট্রেশন নং:' : 'Reg No:'}{' '}
                  <span className="font-bold text-slate-700 dark:text-slate-200">{childRegNo}</span>
                  {(matchedChild?.guardianMobile || user?.phone) && (
                    <> · 📱 {matchedChild?.guardianMobile || user?.phone}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={openCardModal}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <IdCard className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                {lang === 'bn' ? 'আইডি কার্ড' : 'ID Card'}
              </button>
              <Link
                to="/routine"
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                {lang === 'bn' ? 'ক্লাস রুটিন' : 'Class Routine'}
              </Link>
            </div>
          </div>

          {linkedChildren.length > 1 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {lang === 'bn'
                  ? `এই মোবাইল নম্বরে নিবন্ধিত আপনার সন্তানেরা (${linkedChildren.length} জন) — প্রোফাইল পরিবর্তন করুন:`
                  : `Your Linked Children on This Number (${linkedChildren.length}) — Switch Profile:`}
              </p>
              <div className="flex flex-wrap gap-2">
                {linkedChildren.map((child) => {
                  const isActiveChild = matchedChild?.id === child.id;
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => setSelectedChildId(child.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        isActiveChild
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <span>{child.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          isActiveChild
                            ? 'bg-emerald-800/80 text-emerald-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {lang === 'bn' ? `${child.classId}ম · রোল ${child.roll}` : `C${child.classId} · #${child.roll}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {firebaseUser && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
              {currentLinkRequest ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg uppercase ${
                    currentLinkRequest.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : currentLinkRequest.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {currentLinkRequest.status === 'approved' ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : currentLinkRequest.status === 'rejected' ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  {lang === 'bn'
                    ? currentLinkRequest.status === 'approved'
                      ? 'ভেরিফায়েড সংযোগ সক্রিয়'
                      : currentLinkRequest.status === 'rejected'
                      ? 'লিংক আবেদন বাতিল হয়েছে'
                      : 'শিক্ষকের অনুমোদনের অপেক্ষায়'
                    : `Link Status: ${currentLinkRequest.status}`}
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-slate-500 dark:text-slate-400">
                    {lang === 'bn'
                      ? 'ক্লাউডে ফলাফল ও হাজিরার পূর্ণ অ্যাক্সেস পেতে ভেরিফায়েড লিংক অনুরোধ পাঠান:'
                      : 'Submit a cloud verification request for private marks & attendance:'}
                  </span>
                  <button
                    type="button"
                    disabled={isRequestingLink}
                    onClick={handleRequestVerifiedLink}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold"
                  >
                    {lang === 'bn' ? 'ভেরিফায়েড লিংক অনুরোধ' : 'Request Verified Link'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">{lang === 'bn' ? 'উপস্থিতির হার' : 'Attendance Rate'}</p>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{attendancePct}%</p>
          <p className="text-xs text-slate-500 mt-1">
            {childAttendance.length} {lang === 'bn' ? 'দিনের রেকর্ড' : 'days recorded'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">{lang === 'bn' ? 'বর্তমান জিপিএ' : 'Overall GPA'}</p>
          <p className="text-3xl font-black text-blue-700 dark:text-blue-400 mt-1">{gpaStats.gpa}</p>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' ? `গড় নম্বর: ${gpaStats.averagePct}%` : `Avg Score: ${gpaStats.averagePct}%`}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">{lang === 'bn' ? 'আসন্ন পরীক্ষা' : 'Upcoming Exams'}</p>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{childExamRoutine.length}</p>
          <p className="text-xs text-slate-500 mt-1">{lang === 'bn' ? 'নির্ধারিত সময়সূচি' : 'Scheduled papers'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">{lang === 'bn' ? 'শিক্ষকের বার্তা' : 'Teacher Replies'}</p>
          <p className="text-3xl font-black text-purple-700 dark:text-purple-400 mt-1">{myMessages.length}</p>
          <p className="text-xs text-slate-500 mt-1">
            {myMessages.filter((m) => m.status === 'replied').length} {lang === 'bn' ? 'টি উত্তরিত' : 'replied'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto gap-1 border border-slate-200 dark:border-slate-700">
        {[
          { id: 'overview', label: lang === 'bn' ? 'অগ্রগতি' : 'Academic Progress', icon: TrendingUp },
          { id: 'results', label: lang === 'bn' ? 'পরীক্ষার ফলাফল' : 'Exam Results', icon: Award },
          { id: 'attendance', label: lang === 'bn' ? 'উপস্থিতি' : 'Attendance', icon: ClipboardCheck },
          { id: 'fees', label: lang === 'bn' ? 'বেতন ও ফি রশিদ' : 'Fees & Receipts', icon: Receipt },
          { id: 'routine', label: lang === 'bn' ? 'পরীক্ষার সময়সূচি' : 'Exam Schedule', icon: Calendar },
          { id: 'holidays', label: lang === 'bn' ? `ছুটির তালিকা (${activeYear})` : `NCTB Holidays (${activeYear})`, icon: CalendarDays },
          { id: 'notices', label: lang === 'bn' ? 'জরুরি ঘোষণা ও নোটিশ' : 'Notices', icon: Bell },
          { id: 'messages', label: lang === 'bn' ? 'শিক্ষক যোগাযোগ' : 'Message Teacher', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ParentTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-300 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview / Academic Progress */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'বিষয়ভিত্তিক পড়াশোনার অগ্রগতি' : 'Subject-wise Learning Progress'}
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              GPA {gpaStats.gpa}
            </span>
          </div>
          {childMarks.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              {lang === 'bn'
                ? 'এখনো পরীক্ষার ফলাফল প্রকাশিত হয়নি অথবা অভিভাবক লিংক অনুমোদনের অপেক্ষায় রয়েছে।'
                : 'No published marks available yet (or awaiting teacher link verification).'}
            </p>
          ) : (
            <div className="space-y-4">
              {childMarks.map((m) => {
                const pct = m.totalMarks > 0 ? Math.round((m.obtainedMarks / m.totalMarks) * 100) : 0;
                return (
                  <div key={m.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">
                        {m.subject} ({m.examTerm})
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {m.obtainedMarks}/{m.totalMarks} ({pct}%) — {m.grade}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 80 ? 'bg-emerald-600' : pct >= 60 ? 'bg-blue-600' : pct >= 33 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="font-extrabold text-sm">{lang === 'bn' ? 'সন্তানের ফলাফল ও প্রগতি পত্র' : 'Child Academic Transcript'}</h4>
              <p className="text-xs text-slate-500 tabular-nums">GPA {gpaStats.gpa} · {childMarks.length} {lang === 'bn' ? 'টি বিষয়' : 'subjects'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={childMarks.length === 0}
                onClick={() =>
                  exportCsv(
                    `RBMB-Child-Marks-Class${childClass}-Roll${childRoll}`,
                    ['Term', 'Subject', 'Obtained', 'Total', 'Grade'],
                    childMarks.map((m) => [m.examTerm, m.subject, m.obtainedMarks, m.totalMarks, m.grade])
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                type="button"
                onClick={() => setReportCardOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'রিপোর্ট কার্ড প্রিন্ট' : 'Print Report Card'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {childMarks.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-bold text-sm">
                {lang === 'bn' ? 'প্রকাশিত ফলাফল পাওয়া যায়নি।' : 'No published exam results found for this student.'}
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">{lang === 'bn' ? 'পরীক্ষা' : 'Term'}</th>
                    <th className="px-6 py-4">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                    <th className="px-6 py-4">{lang === 'bn' ? 'প্রাপ্ত নম্বর' : 'Marks'}</th>
                    <th className="px-6 py-4 text-right">{lang === 'bn' ? 'গ্রেড' : 'Grade'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {childMarks.map((m) => (
                    <tr key={m.id}>
                      <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{m.examTerm}</td>
                      <td className="px-6 py-4 font-bold">{m.subject}</td>
                      <td className="px-6 py-4 font-semibold tabular-nums">
                        {m.obtainedMarks} / {m.totalMarks}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          {childAttendance.length === 0 ? (
            <p className="text-center text-slate-400 font-bold py-6 text-sm">
              {lang === 'bn' ? 'উপস্থিতির কোনো রেকর্ড এখনো পাওয়া যায়নি।' : 'No attendance records found.'}
            </p>
          ) : (
            childAttendance.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70">
                <div>
                  <p className="font-bold text-sm">{a.date}</p>
                  <p className="text-xs text-slate-400">{a.teacherName}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase ${
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

      {activeTab === 'fees' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'মোট বিল' : 'Total Billed'}</p>
              <p className="text-2xl font-black mt-1 tabular-nums">৳{childFeeSummary.billed.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'পরিশোধিত' : 'Total Paid'}</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">৳{childFeeSummary.paid.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'বকেয়া' : 'Balance Due'}</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">৳{childFeeSummary.due.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {childFees.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-bold text-sm">
                {lang === 'bn' ? 'কোনো ফি রেকর্ড এখনো পাওয়া যায়নি।' : 'No fee records found for this student.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'বিবরণ' : 'Fee Particular'}</th>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'শেষ তারিখ' : 'Due Date'}</th>
                      <th className="px-5 py-3.5 text-right tabular-nums">{lang === 'bn' ? 'ধার্যকৃত' : 'Amount'}</th>
                      <th className="px-5 py-3.5 text-right tabular-nums">{lang === 'bn' ? 'পরিশোধিত' : 'Paid'}</th>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                      <th className="px-5 py-3.5 text-right">{lang === 'bn' ? 'রশিদ' : 'Receipt'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {childFees.map((f) => (
                      <tr key={f.id}>
                        <td className="px-5 py-3.5">
                          <p className="font-bold">{f.title}</p>
                          <p className="text-xs text-slate-400">{f.category}{f.billingMonth ? ` · ${f.billingMonth}` : ''}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs tabular-nums text-slate-500">{f.dueDate}</td>
                        <td className="px-5 py-3.5 text-right font-bold tabular-nums">৳{f.amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">৳{f.paidAmount.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${f.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : f.status === 'partial' ? 'bg-blue-100 text-blue-700' : f.status === 'waived' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'}`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveReceipt(f)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-700 hover:text-white text-xs font-bold inline-flex items-center gap-1"
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

      {activeTab === 'routine' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {childExamRoutine.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-bold text-sm">
              {lang === 'bn' ? 'এই শ্রেণীর পরীক্ষার সময়সূচি এখনো প্রকাশিত হয়নি।' : 'No exam schedule published for this class yet.'}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="px-6 py-4">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                  <th className="px-6 py-4">{lang === 'bn' ? 'সময়' : 'Time'}</th>
                  <th className="px-6 py-4">{lang === 'bn' ? 'কক্ষ' : 'Room'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {childExamRoutine.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 font-bold">{r.date}</td>
                    <td className="px-6 py-4 font-extrabold text-emerald-700 dark:text-emerald-400">{r.subject}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{r.time}</td>
                    <td className="px-6 py-4 text-xs font-bold">{r.room || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                {lang === 'bn'
                  ? `NCTB নির্ধারিত সরকারি ও বিদ্যালয় ছুটির তালিকা (${activeYear})`
                  : `NCTB Official Annual Holiday Calendar (${activeYear})`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'প্রতি নতুন শিক্ষাবর্ষে স্বয়ংক্রিয়ভাবে NCTB ছুটির তালিকা যুক্ত ও হালনাগাদ হয়।'
                  : 'Automatically synced and updated every new academic year according to NCTB schedule.'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              {formatDhakaClock(lang)}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">{h.date}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase text-[10px]">
                    {h.type}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t(h.title)}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t(h.duration)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="space-y-4">
          {guardianAlerts.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                {lang === 'bn' ? 'অভিভাবকদের জন্য বিশেষ ঘোষণা' : 'Guardian & Class Alerts'}
              </p>
              {guardianAlerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-5 rounded-2xl border space-y-1 ${
                    al.priority === 'urgent'
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
                      {al.priority === 'urgent' ? (lang === 'bn' ? 'জরুরি ঘোষণা' : 'Urgent') : (lang === 'bn' ? 'অভিভাবক বার্তা' : 'Notice')}
                      {al.classId && al.classId !== 'all' ? ` · Class ${al.classId}` : ''}
                    </span>
                    <span className="tabular-nums">{al.createdDate} · {al.senderName}</span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{al.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{al.message}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{n.category}</span>
                  <span className="tabular-nums">{n.date}</span>
                </div>
                <h4 className="font-bold text-base">{t(n.title)}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t(n.description)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSendMessage}
            className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit"
          >
            <h4 className="font-extrabold text-base">{lang === 'bn' ? 'শিক্ষকের সাথে যোগাযোগ করুন' : 'Message a Teacher'}</h4>
            <div>
              <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'শিক্ষক নির্বাচন করুন' : 'Select Teacher'}</label>
              <select
                value={msgForm.teacherId || teachers[0]?.id || ''}
                onChange={(e) => setMsgForm((p) => ({ ...p, teacherId: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              >
                {teachers.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {t(tc.name)} — {t(tc.subject)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'bn'
                  ? 'এই বার্তা শুধুমাত্র নির্বাচিত শিক্ষকই দেখতে ও উত্তর দিতে পারবেন।'
                  : 'Private: Only the selected teacher can view and reply to this message.'}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'বিষয়' : 'Subject'}</label>
              <input
                required
                value={msgForm.subject}
                onChange={(e) => setMsgForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder={lang === 'bn' ? 'যেমন: পড়াশোনার অগ্রগতি বা অনুপস্থিতি' : 'e.g. Math performance or leave update'}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'বার্তা' : 'Message'}</label>
              <textarea
                required
                rows={4}
                value={msgForm.message}
                onChange={(e) => setMsgForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {myMessages.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm font-bold">
                {lang === 'bn' ? 'কোনো বার্তা এখনো পাঠানো হয়নি।' : 'No messages sent yet.'}
              </div>
            ) : (
              myMessages.map((m) => (
                <div key={m.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                      To: {m.teacherName} • {m.subject}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg font-bold uppercase ${
                        m.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{m.message}</p>
                  {m.reply && (
                    <div className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">
                        {lang === 'bn' ? 'শিক্ষকের উত্তর:' : 'Teacher Reply:'} ({m.repliedBy || m.teacherName})
                      </p>
                      <p className="text-slate-700 dark:text-slate-200">{m.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <AcademicReportCard
        open={reportCardOpen}
        onClose={() => setReportCardOpen(false)}
        studentName={matchedChild?.name || user?.linkedChildName || `Student #${childRoll}`}
        classId={childClass}
        roll={childRoll.trim() || '01'}
        section={matchedChild?.section || 'A'}
        marks={childMarks}
        attendancePct={attendancePct}
      />
      <FeeReceiptModal fee={activeReceipt} onClose={() => setActiveReceipt(null)} />
      <StudentIdAdmitCard
        open={idCardOpen}
        onClose={() => setIdCardOpen(false)}
        studentName={matchedChild?.name || user?.linkedChildName || `Student #${childRoll}`}
        classId={childClass}
        roll={childRoll.trim() || '01'}
        section={matchedChild?.section || 'A'}
        guardianMobile={matchedChild?.guardianMobile || user?.phone}
        guardianName={matchedChild?.guardianName || user?.name}
        photoUrl={matchedChild?.photo}
        registrationDate={matchedChild?.registrationDate}
        session={matchedChild?.session}
        cardIssueDate={matchedChild?.cardIssueDate}
        cardValidUpto={matchedChild?.cardValidUpto}
        initialMode="id"
        allowedModes={['id']}
        onSaveStudentDetails={(updates) => {
          if (matchedChild) {
            updateStudent({
              ...matchedChild,
              guardianName: updates.guardianName ?? matchedChild.guardianName,
              guardianMobile: updates.guardianMobile ?? matchedChild.guardianMobile,
              photo: updates.photo ?? matchedChild.photo,
              registrationDate: updates.registrationDate ?? matchedChild.registrationDate,
              session: updates.session ?? matchedChild.session,
              cardIssueDate: updates.cardIssueDate ?? matchedChild.cardIssueDate,
              cardValidUpto: updates.cardValidUpto ?? matchedChild.cardValidUpto,
            });
          }
          if (user && updates.guardianMobile) {
            void updateUser({ ...user, phone: updates.guardianMobile });
          }
          notify(lang === 'bn' ? 'শিক্ষার্থীর কার্ডের তথ্য ও ছবি সংরক্ষিত হয়েছে!' : 'Child card details saved!');
        }}
      />
    </div>
  );
};

export default ParentPortal;
