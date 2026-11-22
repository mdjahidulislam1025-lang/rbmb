import * as React from 'react';
import { Printer, X, IdCard, ClipboardList, GraduationCap, ShieldCheck } from 'lucide-react';
import { useApp } from '../App';
import { EXAM_TERMS } from '../constants';

const { useState, useMemo } = React;

interface StudentIdAdmitCardProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  classId: string;
  roll: string;
  section?: string;
  guardianMobile?: string;
  initialMode?: 'id' | 'admit';
}

export const StudentIdAdmitCard: React.FC<StudentIdAdmitCardProps> = ({
  open,
  onClose,
  studentName,
  classId,
  roll,
  section = 'A',
  guardianMobile,
  initialMode = 'id',
}) => {
  const { lang, t, settings, examRoutines } = useApp();
  const [mode, setMode] = useState<'id' | 'admit'>(initialMode);
  const [selectedTerm, setSelectedTerm] = useState<string>(EXAM_TERMS[1].id);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  const classExams = useMemo(
    () =>
      examRoutines
        .filter((r) => r.classId === classId && (!selectedTerm || r.examTerm === selectedTerm || examRoutines.every((x) => x.examTerm !== selectedTerm)))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [examRoutines, classId, selectedTerm]
  );

  if (!open) return null;

  const verificationCode = `RBMB-2026-C${classId}-R${roll.trim().padStart(2, '0')}`;
  const selectedTermObj = EXAM_TERMS.find((tm) => tm.id === selectedTerm);
  const termLabel = selectedTermObj ? t(selectedTermObj) : selectedTerm;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm no-print" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('id')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                mode === 'id'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <IdCard className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'আইডি কার্ড' : 'Student ID Card'}
            </button>
            <button
              type="button"
              onClick={() => setMode('admit')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                mode === 'admit'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'পরীক্ষার প্রবেশপত্র' : 'Exam Admit Card'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'admit' && (
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                {EXAM_TERMS.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {t(tm)}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div id="printable-id-admit-card" className="p-6 sm:p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {mode === 'id' ? (
            <div className="max-w-md mx-auto border-2 border-emerald-800 dark:border-emerald-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
              <div className="bg-emerald-800 text-white p-5 text-center space-y-1">
                <div className="inline-flex p-2 rounded-xl bg-white/15 mb-1">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">
                  {settings.shortName || 'RBMB Digital Campus'}
                </p>
                <h2 className="text-lg font-black leading-snug">{t(settings.name)}</h2>
                <p className="text-[11px] opacity-85 tabular-nums">
                  {t(settings.location)} · EIIN: {settings.eiin}
                </p>
              </div>

              <div className="p-6 space-y-5">
                <div className="text-center">
                  <span className="inline-block border border-slate-300 dark:border-slate-700 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-widest">
                    {lang === 'bn' ? 'শিক্ষার্থী পরিচয়পত্র · ২০২৬' : 'STUDENT IDENTITY CARD · 2026'}
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <div className="w-16 h-16 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-2xl font-black shrink-0">
                    {studentName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-base truncate">{studentName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                      Class {classId} · Section {section} · Roll #{roll}
                    </p>
                    <p className="text-[11px] font-mono-code font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                      {verificationCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-200 dark:border-slate-800 py-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      {lang === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Session'}
                    </p>
                    <p className="font-bold tabular-nums mt-0.5">2026</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      {lang === 'bn' ? 'জরুরি যোগাযোগ' : 'Emergency Phone'}
                    </p>
                    <p className="font-bold tabular-nums mt-0.5">{guardianMobile || settings.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      {lang === 'bn' ? 'মেয়াদ উত্তীর্ণ' : 'Valid Until'}
                    </p>
                    <p className="font-bold tabular-nums mt-0.5">31 Dec 2026</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      {lang === 'bn' ? 'যাচাইকৃত অবস্থা' : 'Card Status'}
                    </p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Active
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-4 text-xs">
                  <span className="border-t border-slate-400 dark:border-slate-600 px-3 pt-1 font-semibold text-slate-500">
                    {lang === 'bn' ? 'শিক্ষার্থীর স্বাক্ষর' : 'Student Signature'}
                  </span>
                  <span className="border-t border-slate-400 dark:border-slate-600 px-3 pt-1 font-bold">
                    {lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  {settings.shortName || 'RBMB Digital Campus'}
                </p>
                <h2 className="text-xl sm:text-2xl font-black">{t(settings.name)}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {t(settings.location)} · EIIN: {settings.eiin}
                </p>
                <div className="pt-2">
                  <span className="inline-block border border-slate-900 dark:border-slate-600 px-4 py-1 text-xs font-extrabold uppercase tracking-widest">
                    {lang === 'bn' ? `পরীক্ষার প্রবেশপত্র · ${termLabel}` : `EXAMINATION ADMIT CARD · ${termLabel}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs sm:text-sm">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {lang === 'bn' ? 'পরীক্ষার্থীর নাম' : 'Examinee Name'}
                  </p>
                  <p className="font-extrabold mt-0.5">{studentName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {lang === 'bn' ? 'শ্রেণী ও শাখা' : 'Class & Section'}
                  </p>
                  <p className="font-bold mt-0.5">
                    Class {classId} ({section})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {lang === 'bn' ? 'রোল নম্বর' : 'Roll Number'}
                  </p>
                  <p className="font-extrabold font-mono-code tabular-nums mt-0.5">#{roll}</p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'সময়' : 'Time'}</th>
                      <th className="px-4 py-3 text-right">{lang === 'bn' ? 'কক্ষ' : 'Room'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {classExams.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-semibold">
                          {lang === 'bn'
                            ? 'এই শ্রেণীর জন্য পরীক্ষার রুটিন এখনো প্রকাশিত হয়নি।'
                            : 'No examination dates scheduled yet for this class.'}
                        </td>
                      </tr>
                    ) : (
                      classExams.map((er) => (
                        <tr key={er.id}>
                          <td className="px-4 py-3 font-mono-code tabular-nums font-semibold">{er.date}</td>
                          <td className="px-4 py-3 font-bold">{er.subject}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{er.time}</td>
                          <td className="px-4 py-3 text-right font-semibold">{er.room || 'Hall 1'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'পরীক্ষার্থীদের প্রতি নির্দেশাবলি:' : 'Instructions for Examinees:'}
                </p>
                <p>
                  {lang === 'bn'
                    ? '১. পরীক্ষা শুরুর অন্তত ১৫ মিনিট পূর্বে প্রবেশপত্রসহ নিজ আসনে উপস্থিত থাকতে হবে।'
                    : '1. Bring this Admit Card to the examination hall at least 15 minutes before the exam starts.'}
                </p>
                <p>
                  {lang === 'bn'
                    ? '২. মোবাইল ফোন, স্মার্টওয়াচ বা কোনো অননুমোদিত কাগজপত্র পরীক্ষার কক্ষে আনা সম্পূর্ণ নিষিদ্ধ।'
                    : '2. Mobile phones, smartwatches, and unauthorized papers are strictly prohibited.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs font-bold">
                <div className="pt-6 border-t border-slate-300 dark:border-slate-700">
                  {lang === 'bn' ? 'পরীক্ষা নিয়ন্ত্রক' : 'Controller of Examinations'}
                </div>
                <div className="pt-6 border-t border-slate-300 dark:border-slate-700">
                  {lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
