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
} from 'lucide-react';
import { useApp } from '../App';
import { calculateOverallGpa } from '../utils/security';

const { useState, useMemo } = React;
const { Link } = RouterDom;

type ParentTab = 'overview' | 'results' | 'attendance' | 'routine' | 'notices' | 'messages';

export const ParentPortal: React.FC = () => {
  const {
    lang,
    t,
    user,
    updateUser,
    students,
    attendanceRecords,
    examMarks,
    examRoutines,
    notices,
    teachers,
    parentMessages,
    sendParentMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ParentTab>('overview');
  const [childClass, setChildClass] = useState<string>(user?.linkedChildClass || '9');
  const [childRoll, setChildRoll] = useState<string>(user?.linkedChildRoll || '01');
  const [toast, setToast] = useState<string | null>(null);

  const [msgForm, setMsgForm] = useState({
    teacherName: teachers[0] ? t(teachers[0].name) : 'Md. Abdul Karim',
    subject: '',
    message: '',
  });

  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2800);
  };

  const matchedChild = useMemo(
    () => students.find((s) => s.classId === childClass && s.roll === childRoll.trim()),
    [students, childClass, childRoll]
  );

  const handleSaveChildLink = async () => {
    if (!user) return;
    await updateUser({
      ...user,
      linkedChildClass: childClass,
      linkedChildRoll: childRoll.trim() || '01',
      linkedChildName: matchedChild?.name || user.linkedChildName,
    });
    notify(lang === 'bn' ? 'সন্তানের তথ্য যুক্ত করা হয়েছে!' : 'Child link updated!');
  };

  const childMarks = useMemo(
    () => examMarks.filter((m) => m.classId === childClass && m.roll === childRoll.trim()),
    [examMarks, childClass, childRoll]
  );

  const gpaStats = useMemo(() => calculateOverallGpa(childMarks), [childMarks]);

  const childAttendance = useMemo(() => {
    const sheets = attendanceRecords.filter((r) => r.classId === childClass);
    return sheets
      .map((sheet) => ({
        id: sheet.id,
        date: sheet.date,
        status: matchedChild ? sheet.records[matchedChild.id] : undefined,
        teacherName: sheet.teacherName,
      }))
      .filter((x) => x.status);
  }, [attendanceRecords, childClass, matchedChild]);

  const attendancePct = useMemo(() => {
    if (childAttendance.length === 0) return 0;
    const presentOrLate = childAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    return Math.round((presentOrLate / childAttendance.length) * 100);
  }, [childAttendance]);

  const childExamRoutine = useMemo(
    () => examRoutines.filter((r) => r.classId === childClass),
    [examRoutines, childClass]
  );

  const myMessages = useMemo(
    () =>
      parentMessages.filter(
        (m) =>
          (m.classId === childClass && m.roll === childRoll.trim()) ||
          m.parentName === user?.name ||
          (user?.userId && m.ownerUid === user.userId)
      ),
    [parentMessages, childClass, childRoll, user]
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgForm.subject.trim() || !msgForm.message.trim()) return;
    sendParentMessage({
      id: `pm-${Date.now()}`,
      parentName: user?.name || 'Guardian',
      studentName: matchedChild?.name || user?.linkedChildName || `Roll ${childRoll}`,
      classId: childClass,
      roll: childRoll.trim() || '01',
      teacherName: msgForm.teacherName,
      subject: msgForm.subject.trim(),
      message: msgForm.message.trim(),
      status: 'open',
      createdDate: new Date().toISOString().split('T')[0],
    });
    setMsgForm((prev) => ({ ...prev, subject: '', message: '' }));
    notify(lang === 'bn' ? 'শিক্ষকের নিকট বার্তা পাঠানো হয়েছে!' : 'Message sent to teacher!');
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Child Selector & Link */}
      <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              {lang === 'bn' ? 'সন্তানের শ্রেণী' : 'Child Class'}
            </label>
            <select
              value={childClass}
              onChange={(e) => setChildClass(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold"
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
              value={childRoll}
              onChange={(e) => setChildRoll(e.target.value)}
              className="w-24 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold"
            />
          </div>
          <button
            onClick={handleSaveChildLink}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
          >
            {lang === 'bn' ? 'তথ্য যুক্ত করুন' : 'Link Child'}
          </button>
          {matchedChild && (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Users className="w-4 h-4" />
              {matchedChild.name} ({matchedChild.section})
            </div>
          )}
        </div>

        <div className="flex gap-2 text-xs font-bold">
          <Link
            to="/routine"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500"
          >
            {lang === 'bn' ? 'ক্লাস রুটিন' : 'Class Routine'}
          </Link>
          <Link
            to="/ebooks"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Library'}
          </Link>
        </div>
      </div>

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
          { id: 'routine', label: lang === 'bn' ? 'পরীক্ষার সময়সূচি' : 'Exam Schedule', icon: Calendar },
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
                ? 'এখনো পরীক্ষার ফলাফল প্রকাশিত হয়নি। শিক্ষক নম্বর আপলোড করলে এখানে অগ্রগতি দেখা যাবে।'
                : 'No published exam marks yet. Subject progress bars appear once teachers publish marks.'}
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
                    <td className="px-6 py-4 font-semibold">
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

      {activeTab === 'notices' && (
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{n.category}</span>
                <span>{n.date}</span>
              </div>
              <h4 className="font-bold text-base">{t(n.title)}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(n.description)}</p>
            </div>
          ))}
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
                value={msgForm.teacherName}
                onChange={(e) => setMsgForm((p) => ({ ...p, teacherName: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              >
                {teachers.map((tc) => (
                  <option key={tc.id} value={t(tc.name)}>
                    {t(tc.name)} — {t(tc.subject)}
                  </option>
                ))}
              </select>
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
    </div>
  );
};

export default ParentPortal;
