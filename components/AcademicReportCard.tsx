import * as React from 'react';
import { Printer, Download, X, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { ExamMark } from '../types';
import { calculateGrade, calculateOverallGpa } from '../utils/security';
import { exportCsv } from '../utils/exportUtils';

const { useState, useMemo } = React;

interface AcademicReportCardProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  classId: string;
  roll: string;
  section?: string;
  marks: ExamMark[];
  attendancePct?: number;
}

export const AcademicReportCard: React.FC<AcademicReportCardProps> = ({
  open,
  onClose,
  studentName,
  classId,
  roll,
  section = 'A',
  marks,
  attendancePct,
}) => {
  const { lang, t, settings } = useApp();
  const terms = useMemo(() => Array.from(new Set(marks.map((m) => m.examTerm))), [marks]);
  const [selectedTerm, setSelectedTerm] = useState<string>('all');

  const filteredMarks = useMemo(
    () => (selectedTerm === 'all' ? marks : marks.filter((m) => m.examTerm === selectedTerm)),
    [marks, selectedTerm]
  );

  const summary = useMemo(() => calculateOverallGpa(filteredMarks), [filteredMarks]);
  const totalObtained = useMemo(() => filteredMarks.reduce((acc, m) => acc + m.obtainedMarks, 0), [filteredMarks]);
  const totalFull = useMemo(() => filteredMarks.reduce((acc, m) => acc + m.totalMarks, 0), [filteredMarks]);

  if (!open) return null;

  const handleExportCsv = () => {
    exportCsv(
      `RBMB-Report-Card-Class${classId}-Roll${roll}`,
      ['Term', 'Subject', 'Obtained Marks', 'Total Marks', 'Percentage', 'Grade', 'Grade Point'],
      filteredMarks.map((m) => {
        const pct = m.totalMarks > 0 ? Math.round((m.obtainedMarks / m.totalMarks) * 100) : 0;
        const { gpa } = calculateGrade(m.obtainedMarks, m.totalMarks);
        return [m.examTerm, m.subject, m.obtainedMarks, m.totalMarks, `${pct}%`, m.grade, gpa.toFixed(2)];
      })
    );
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm no-print" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Action Toolbar (Hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              {lang === 'bn' ? 'অফিসিয়াল একাডেমিক মার্কশিট' : 'Official Academic Transcript'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {terms.length > 0 && (
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="all">{lang === 'bn' ? 'সকল পরীক্ষা' : 'All Terms'}</option>
                {terms.map((tm) => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredMarks.length === 0}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
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

        {/* Printable Report Card Surface */}
        <div id="printable-report-card" className="p-6 sm:p-8 print:p-2 space-y-6 bg-white dark:bg-slate-900 print:bg-white text-slate-900 dark:text-slate-100 print:text-slate-900">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              {settings.shortName || 'রাণীর বাজার মাধ্যমিক বিদ্যালয়'}
            </p>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t(settings.name)}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {t(settings.location)} · EIIN: {settings.eiin} · {settings.phone}
            </p>
            <div className="pt-2">
              <span className="inline-block border border-slate-900 dark:border-slate-600 px-4 py-1 text-xs font-extrabold uppercase tracking-widest">
                {lang === 'bn' ? 'একাডেমিক ট্রান্সক্রিপ্ট / প্রগতি পত্র ২০২৬' : 'ACADEMIC PROGRESS TRANSCRIPT 2026'}
              </span>
            </div>
          </div>

          {/* Student Identification Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name'}</p>
              <p className="font-extrabold text-sm mt-0.5">{studentName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'শ্রেণী ও শাখা' : 'Class & Section'}</p>
              <p className="font-extrabold text-sm mt-0.5 tabular-nums">
                Class {classId} · {section}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'রোল নম্বর' : 'Roll Number'}</p>
              <p className="font-extrabold text-sm mt-0.5 font-mono-code tabular-nums">#{roll}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'পরীক্ষার টার্ম' : 'Examination'}</p>
              <p className="font-extrabold text-sm mt-0.5">
                {selectedTerm === 'all' ? (lang === 'bn' ? 'সকল প্রকাশিত পরীক্ষা' : 'Consolidated') : selectedTerm}
              </p>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          {filteredMarks.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 font-semibold">
              {lang === 'bn' ? 'এই টার্মে এখনো কোনো নম্বর প্রকাশিত হয়নি।' : 'No published marks found for the selected term.'}
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                    <th className="px-4 py-3">{lang === 'bn' ? 'পরীক্ষা' : 'Term'}</th>
                    <th className="px-4 py-3 text-right tabular-nums">{lang === 'bn' ? 'পূর্ণ নম্বর' : 'Full Marks'}</th>
                    <th className="px-4 py-3 text-right tabular-nums">{lang === 'bn' ? 'প্রাপ্ত নম্বর' : 'Obtained'}</th>
                    <th className="px-4 py-3 text-right tabular-nums">%</th>
                    <th className="px-4 py-3 text-center">{lang === 'bn' ? 'গ্রেড' : 'Grade'}</th>
                    <th className="px-4 py-3 text-right tabular-nums">{lang === 'bn' ? 'পয়েন্ট' : 'GP'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredMarks.map((m) => {
                    const pct = m.totalMarks > 0 ? Math.round((m.obtainedMarks / m.totalMarks) * 100) : 0;
                    const { gpa } = calculateGrade(m.obtainedMarks, m.totalMarks);
                    return (
                      <tr key={m.id}>
                        <td className="px-4 py-3 font-bold">{m.subject}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{m.examTerm}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{m.totalMarks}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">{m.obtainedMarks}</td>
                        <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 tabular-nums">{pct}%</td>
                        <td className="px-4 py-3 text-center font-extrabold">{m.grade}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">{gpa.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/60 border-t-2 border-slate-300 dark:border-slate-700 font-extrabold text-xs sm:text-sm">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 uppercase">
                      {lang === 'bn' ? 'মোট ও চূড়ান্ত ফলাফল' : 'Total & Consolidated Standing'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalFull}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalObtained}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{summary.averagePct}%</td>
                    <td className="px-4 py-3 text-center">
                      {summary.passedAll ? (lang === 'bn' ? 'উত্তীর্ণ' : 'PASS') : (lang === 'bn' ? 'অকৃতকার্য' : 'FAIL')}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 tabular-nums">
                      GPA {summary.gpa}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Consolidated Summary Metrics + Grading Scale */}
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'সামগ্রিক জিপিএ (GPA)' : 'Cumulative GPA'}</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{summary.gpa} / 5.00</p>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                {summary.passedAll ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {lang === 'bn' ? 'সকল বিষয়ে কৃতকার্য' : 'Passed all subjects'}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    {lang === 'bn' ? 'পুনর্মূল্যায়ন / উন্নতি প্রয়োজন' : 'Improvement needed'}
                  </>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'উপস্থিতি ও গড় নম্বর' : 'Attendance & Mean'}</p>
              <p className="text-2xl font-black tabular-nums">
                {typeof attendancePct === 'number' ? `${attendancePct}%` : `${summary.averagePct}%`}
              </p>
              <p className="text-slate-500 dark:text-slate-400 tabular-nums">
                {lang === 'bn' ? `গড় প্রাপ্তি: ${summary.averagePct}%` : `Average Score: ${summary.averagePct}%`}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'গ্রেডিং স্কেল' : 'Grading Scale'}</p>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 tabular-nums">
                80–100: A+ (5.0) · 70–79: A (4.0) · 60–69: A- (3.5) · 50–59: B (3.0) · 40–49: C (2.0) · 33–39: D (1.0) · &lt;33: F (0.0)
              </p>
            </div>
          </div>

          {/* Official Signature Block */}
          <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs">
            <div className="border-t border-slate-400 dark:border-slate-600 pt-2">
              <p className="font-bold">{lang === 'bn' ? 'শ্রেণী শিক্ষক' : 'Class Teacher'}</p>
            </div>
            <div className="border-t border-slate-400 dark:border-slate-600 pt-2">
              <p className="font-bold">{lang === 'bn' ? 'অভিভাবকের স্বাক্ষর' : 'Guardian Signature'}</p>
            </div>
            <div className="border-t border-slate-400 dark:border-slate-600 pt-2">
              <p className="font-bold">{lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher'}</p>
              <p className="text-[10px] text-slate-500">{t(settings.headTeacherName || { bn: 'মোঃ আব্দুল করিম', en: 'Md. Abdul Karim' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
