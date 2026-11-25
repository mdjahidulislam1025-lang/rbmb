import * as React from 'react';
import { Award, GraduationCap, Printer, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../App';

const { useState } = React;

type CertificateType = 'studentship' | 'character' | 'testimonial';

interface StudentCertificateModalProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  classId: string;
  roll: string;
  section?: string;
  gpa?: string;
  attendancePct?: number;
}

export const StudentCertificateModal: React.FC<StudentCertificateModalProps> = ({
  open,
  onClose,
  studentName,
  classId,
  roll,
  section = 'A',
  gpa,
  attendancePct,
}) => {
  const { lang, t, settings } = useApp();
  const [certType, setCertType] = useState<CertificateType>('studentship');
  const [sessionYear, setSessionYear] = useState('2026');
  const [fatherNameDraft, setFatherNameDraft] = useState('');

  if (!open) return null;

  const issueDate = new Date().toISOString().split('T')[0];
  const serialNo = `RBMB-CERT-${sessionYear}-C${classId}-R${roll.trim().padStart(2, '0')}`;
  const headTeacherName = t(settings.headTeacherName) || (lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher');

  const certHeadingBn =
    certType === 'studentship'
      ? 'অধ্যয়ন সনদপত্র (STUDENTSHIP CERTIFICATE)'
      : certType === 'character'
      ? 'চারিত্রিক সনদপত্র (CHARACTER CERTIFICATE)'
      : 'একাডেমিক প্রশংসাপত্র (TESTIMONIAL)';

  const certHeadingEn =
    certType === 'studentship'
      ? 'OFFICIAL STUDENTSHIP CERTIFICATE'
      : certType === 'character'
      ? 'OFFICIAL CHARACTER CERTIFICATE'
      : 'ACADEMIC TESTIMONIAL';

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm no-print" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Controls Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-lg">
            {(
              [
                { id: 'studentship', bn: 'অধ্যয়ন সনদ', en: 'Studentship' },
                { id: 'character', bn: 'চারিত্রিক সনদ', en: 'Character' },
                { id: 'testimonial', bn: 'প্রশংসাপত্র', en: 'Testimonial' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCertType(opt.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                  certType === opt.id
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {lang === 'bn' ? opt.bn : opt.en}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              maxLength={40}
              value={fatherNameDraft}
              onChange={(e) => setFatherNameDraft(e.target.value)}
              placeholder={lang === 'bn' ? 'পিতার নাম (ঐচ্ছিক)' : "Father's name (optional)"}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold w-40"
            />
            <select
              value={sessionYear}
              onChange={(e) => setSessionYear(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              {['2024', '2025', '2026'].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
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

        {/* Printable Formal A4 Certificate */}
        <div
          id="printable-certificate"
          className="p-6 sm:p-10 print:p-2 bg-white dark:bg-slate-950 print:bg-white text-slate-900 dark:text-slate-100 print:text-slate-900"
        >
          <div className="border-4 border-double border-emerald-800 dark:border-emerald-700 p-6 sm:p-8 space-y-6">
            {/* School Header */}
            <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-5 space-y-1.5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-800 text-white mb-1">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                {settings.shortName || 'রাণীর বাজার মাধ্যমিক বিদ্যালয়'} · Est. 1958
              </p>
              <h2 className="text-2xl font-black tracking-tight">{t(settings.name)}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                {t(settings.location)} · EIIN: {settings.eiin} · {settings.phone}
              </p>
              <div className="pt-3">
                <span className="inline-flex items-center gap-1.5 border-2 border-slate-900 dark:border-slate-500 px-4 py-1 text-xs font-black uppercase tracking-widest">
                  <Award className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  {lang === 'bn' ? certHeadingBn : certHeadingEn}
                </span>
              </div>
            </div>

            {/* Meta Line */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code font-bold text-slate-600 dark:text-slate-400 tabular-nums">
              <span>Ref No: {serialNo}</span>
              <span>Issue Date: {issueDate}</span>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
              {lang === 'bn' ? (
                <>
                  <p>
                    এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,{' '}
                    <strong className="underline decoration-emerald-600 underline-offset-4">{studentName}</strong>
                    {fatherNameDraft.trim() ? (
                      <>
                        , পিতা: <strong>{fatherNameDraft.trim()}</strong>
                      </>
                    ) : null}
                    , অত্র বিদ্যালয়ের{' '}
                    <strong>
                      {classId}ম শ্রেণী (শাখা: {section}, রোল নম্বর: #{roll})
                    </strong>
                    -এর {sessionYear} শিক্ষাবর্ষের একজন নিয়মিত শিক্ষার্থী।
                  </p>
                  {certType === 'studentship' && (
                    <p>
                      বিদ্যালয়ের ভর্তি রেজিস্টার ও হালনাগাদ ডিজিটাল নথি অনুযায়ী তিনি বর্তমানে অত্র প্রতিষ্ঠানে
                      নিয়মিত অধ্যয়নরত আছেন। তাঁর জন্ম-সাল, শ্রেণী ও রোল নম্বর বিদ্যালয়ের রেকর্ড অনুযায়ী সঠিক।
                    </p>
                  )}
                  {certType === 'character' && (
                    <p>
                      আমার জানামতে এবং বিদ্যালয়ের শৃঙ্খলা নথি অনুযায়ী তাঁর নৈতিক চরিত্র, আচরণ ও বিদ্যালয়ের নিয়ম-শৃঙ্খলা
                      অনুসরণের মান অত্যন্ত সন্তোষজনক। তিনি কোনো রাষ্ট্রবিরোধী বা শৃঙ্খলা পরিপন্থী কর্মকাণ্ডে জড়িত নন।
                    </p>
                  )}
                  {certType === 'testimonial' && (
                    <p>
                      অধ্যয়নকালে তিনি একাডেমিক ও সহশিক্ষা কার্যক্রমে নিয়মিত অংশগ্রহণ করেছেন।
                      {gpa ? ` প্রকাশিত একাডেমিক রেকর্ড অনুযায়ী তাঁর অর্জিত জিপিএ ${gpa}` : ''}
                      {typeof attendancePct === 'number' && attendancePct > 0
                        ? ` এবং ক্লাস উপস্থিতির হার ${attendancePct}%`
                        : ''}
                      । আমরা তাঁর উজ্জ্বল ভবিষ্যৎ ও সর্বাঙ্গীণ সাফল্য কামনা করি।
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>
                    This is to certify that{' '}
                    <strong className="underline decoration-emerald-600 underline-offset-4">{studentName}</strong>
                    {fatherNameDraft.trim() ? (
                      <>
                        , son/daughter of <strong>{fatherNameDraft.trim()}</strong>
                      </>
                    ) : null}
                    , is a bonafide regular student of <strong>Class {classId}</strong> (Section:{' '}
                    <strong>{section}</strong>, Roll No: <strong>#{roll}</strong>) for the academic session{' '}
                    <strong>{sessionYear}</strong> at {t(settings.name)}.
                  </p>
                  {certType === 'studentship' && (
                    <p>
                      As per the official Admission Register and verified digital campus ledger, the student is
                      actively enrolled and pursuing secondary studies under the Board of Intermediate &amp; Secondary
                      Education, Cumilla curriculum.
                    </p>
                  )}
                  {certType === 'character' && (
                    <p>
                      During the period of study at this institution, his/her moral character, conduct, and discipline
                      have been found exemplary. To the best of our knowledge, he/she bears a good moral character and
                      has never been involved in any activity subversive of discipline.
                    </p>
                  )}
                  {certType === 'testimonial' && (
                    <p>
                      The student has demonstrated commendable academic dedication and co-curricular participation.
                      {gpa ? ` Recorded academic standing reflects GPA ${gpa}` : ''}
                      {typeof attendancePct === 'number' && attendancePct > 0
                        ? ` with ${attendancePct}% documented attendance`
                        : ''}
                      . We wish every success in all future academic pursuits.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Verification Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {lang === 'bn' ? 'শ্রেণী ও রোল' : 'Class & Roll'}
                </p>
                <p className="font-bold tabular-nums mt-0.5">
                  Class {classId} · #{roll}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {lang === 'bn' ? 'শিক্ষাবর্ষ' : 'Session'}
                </p>
                <p className="font-bold tabular-nums mt-0.5">{sessionYear}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {lang === 'bn' ? 'একাডেমিক অবস্থা' : 'Academic Standing'}
                </p>
                <p className="font-bold tabular-nums mt-0.5">{gpa ? `GPA ${gpa}` : 'Regular'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {lang === 'bn' ? 'যাচাই অবস্থা' : 'Registry Check'}
                </p>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </p>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs">
              <div className="pt-4 border-t border-slate-400 dark:border-slate-600">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'শ্রেণী শিক্ষক / অফিস সহায়ক' : 'Class Teacher / Office Clerk'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Prepared &amp; Verified</p>
              </div>
              <div className="pt-4 border-t border-slate-400 dark:border-slate-600">
                <p className="font-black text-slate-900 dark:text-white">{headTeacherName}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                  {lang === 'bn' ? 'প্রধান শিক্ষক ও সীলমোহর' : 'Head Teacher & Official Seal'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCertificateModal;
