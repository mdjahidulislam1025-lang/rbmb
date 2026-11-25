import * as React from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  IdCard,
  ClipboardList,
  FileBadge2,
  Camera,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Globe,
  BookOpen,
  SlidersHorizontal,
  Users,
  Save,
} from 'lucide-react';
import { useApp } from '../App';
import { EXAM_TERMS } from '../constants';
import { ExamRoutineItem, SchoolSettings, SchoolStudent } from '../types';
import { compressImageFile } from '../utils/imageUtils';

const { useState, useMemo, useEffect, useRef } = React;

export type CardMode = 'admit' | 'reg' | 'id';

export interface StudentCardData {
  id?: string;
  studentName: string;
  classId: string;
  roll: string;
  section: string;
  guardianName: string;
  guardianMobile: string;
  photoUrl?: string;
  session: string;
  registrationDate: string;
  issueDate: string;
  validUpto: string;
}

export interface StudentIdAdmitCardProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  classId: string;
  roll: string;
  section?: string;
  guardianMobile?: string;
  guardianName?: string;
  photoUrl?: string;
  registrationDate?: string;
  session?: string;
  cardIssueDate?: string;
  cardValidUpto?: string;
  initialMode?: CardMode;
  allowedModes?: CardMode[];
  rosterStudents?: SchoolStudent[];
  onSaveStudentDetails?: (updates: {
    classId: string;
    roll: string;
    guardianName?: string;
    guardianMobile?: string;
    photo?: string;
    registrationDate?: string;
    session?: string;
    cardIssueDate?: string;
    cardValidUpto?: string;
  }) => void;
}

const CLASS_LABELS: Record<string, { en: string; bn: string }> = {
  '6': { en: 'Six (6)', bn: '৬ষ্ঠ শ্রেণী (Class 6)' },
  '7': { en: 'Seven (7)', bn: '৭ম শ্রেণী (Class 7)' },
  '8': { en: 'Eight (8)', bn: '৮ম শ্রেণী (Class 8)' },
  '9': { en: 'Nine (9)', bn: '৯ম শ্রেণী (Class 9)' },
  '10': { en: 'Ten (10)', bn: '১০ম শ্রেণী (Class 10)' },
};

export function getStudentCardCodes(classId: string, roll: string, session = '2026') {
  const cleanSession = (session || '2026').replace(/[^0-9]/g, '').slice(0, 4) || '2026';
  const cleanClassDigits = String(classId || '6').replace(/[^0-9]/g, '').padStart(2, '0');
  const rawRoll = String(roll || '01').trim();
  const numericRoll = rawRoll.replace(/[^0-9]/g, '');
  const paddedRollDisplay = numericRoll ? numericRoll.padStart(3, '0') : rawRoll || '001';
  const serialRoll = numericRoll ? numericRoll.padStart(2, '0') : '01';
  const serialCode = `${cleanClassDigits}${serialRoll}`;

  return {
    studentId: `RBMB-${cleanSession}-${serialCode}`,
    registrationNo: `RBMB-REG-${cleanSession}-${serialCode}`,
    admitCardNo: `AC-${cleanSession}-${serialCode}`,
    paddedRollDisplay,
  };
}

export function formatDisplayDate(raw?: string): string {
  if (!raw || !raw.trim()) return '15-01-2026';
  const trimmed = raw.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
  }
  return trimmed;
}

const RBMBCrestSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#065f46" strokeWidth="4" />
    <circle cx="60" cy="60" r="47" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Laurel leaves */}
    <path
      d="M28 84 C18 68, 19 46, 32 31 M92 84 C102 68, 101 46, 88 31"
      fill="none"
      stroke="#15803d"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M27 72 l-6 -4 M25 60 l-7 -2 M27 48 l-6 1 M93 72 l6 -4 M95 60 l7 -2 M93 48 l6 1"
      stroke="#15803d"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Shield inner */}
    <path
      d="M39 36 H81 V64 C81 78, 60 88, 60 88 C60 88, 39 78, 39 64 Z"
      fill="#ecfdf5"
      stroke="#065f46"
      strokeWidth="2.5"
    />
    {/* Open book */}
    <path
      d="M44 64 Q52 59 60 64 Q68 59 76 64 V75 Q68 70 60 75 Q52 70 44 75 Z"
      fill="#ffffff"
      stroke="#0284c7"
      strokeWidth="2"
    />
    {/* Torch & Flame */}
    <rect x="58" y="45" width="4" height="17" rx="1.5" fill="#b45309" />
    <path d="M60 33 C65 39, 64 45, 60 46 C56 45, 55 39, 60 33 Z" fill="#f97316" />
    <path d="M60 37 C62.5 40, 62 44, 60 44.5 C58 44, 57.5 40, 60 37 Z" fill="#facc15" />
    {/* Bottom ribbon */}
    <path d="M32 92 Q60 101 88 92 L85 99 Q60 108 35 99 Z" fill="#065f46" />
    <text x="60" y="99" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800" letterSpacing="0.8">
      RBMB · EST 1958
    </text>
  </svg>
);

const OfficialSignatureSvg: React.FC<{ variant?: 'head' | 'controller'; className?: string }> = ({
  variant = 'head',
  className = 'w-24 h-8',
}) => (
  <svg viewBox="0 0 140 44" className={className} aria-hidden="true">
    {variant === 'head' ? (
      <path
        d="M14 31 C20 12, 34 9, 32 27 C31 35, 19 34, 24 23 C28 15, 42 29, 49 23 C54 18, 56 30, 64 25 C71 20, 74 28, 84 22 C93 17, 102 25, 124 21"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M18 28 C16 14, 34 8, 39 20 C42 29, 24 35, 31 24 C36 16, 48 31, 56 22 C63 15, 69 29, 77 24 C86 18, 95 26, 118 23"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const StudentPhotoFrame: React.FC<{
  photoUrl?: string;
  studentName: string;
  className?: string;
}> = ({ photoUrl, studentName, className = 'w-28 sm:w-32 aspect-[3/4]' }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  if (photoUrl && !imgError) {
    return (
      <div
        className={`${className} rounded-lg overflow-hidden border-2 border-emerald-800 bg-sky-100 shrink-0 shadow-sm`}
      >
        <img
          src={photoUrl}
          alt={studentName}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-lg overflow-hidden border-2 border-emerald-800 bg-gradient-to-b from-[#38bdf8] to-[#0284c7] shrink-0 shadow-sm flex flex-col items-center justify-end relative`}
    >
      <svg viewBox="0 0 120 155" className="w-full h-full" aria-label={studentName}>
        <defs>
          <linearGradient id="bgSkyPhoto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <rect width="120" height="155" fill="url(#bgSkyPhoto)" />
        {/* Hair & Head silhouette */}
        <circle cx="60" cy="56" r="24" fill="#fde68a" />
        <path
          d="M36 53 C36 33, 84 33, 84 53 C80 42, 68 38, 60 39 C49 38, 40 43, 36 53 Z"
          fill="#1e293b"
        />
        {/* Uniform shoulders & collar */}
        <path d="M18 155 C20 116, 40 104, 60 104 C80 104, 100 116, 102 155 Z" fill="#ffffff" />
        <path d="M47 104 L60 123 L73 104" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
        {/* School tie */}
        <polygon points="56,112 64,112 65,148 60,155 55,148" fill="#065f46" />
        <rect x="55" y="106" width="10" height="8" rx="2" fill="#064e3b" />
      </svg>
    </div>
  );
};

const QrBadge: React.FC<{
  payload: string;
  caption: string;
  sizeClass?: string;
}> = ({ payload, caption, sizeClass = 'w-20 h-20 sm:w-24 sm:h-24' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [payload]);

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={caption}
            className={`${sizeClass} object-contain block`}
          />
        ) : (
          <div
            className={`${sizeClass} bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400`}
          >
            QR
          </div>
        )}
      </div>
      <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-1.5 text-center leading-tight whitespace-nowrap">
        {caption}
      </p>
    </div>
  );
};

function getSchoolHeaderInfo(settings: SchoolSettings, cardLang: 'en' | 'bn') {
  const rawName = (cardLang === 'bn' ? settings.name?.bn : settings.name?.en) || 'রাণীর বাজার মাধ্যমিক বিদ্যালয়';
  const schoolName = rawName;
  const locationText = cardLang === 'bn' ? settings.location.bn : settings.location.en;
  const headTeacherTitle = cardLang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher';
  const headTeacherName =
    cardLang === 'bn'
      ? settings.headTeacherName?.bn || 'প্রধান শিক্ষক'
      : settings.headTeacherName?.en || 'Head Teacher';
  const website = 'www.rbmb-campus.edu.bd';
  return { schoolName, locationText, headTeacherTitle, headTeacherName, website };
}

/* ============================================================================
   1. EXAMINATION ADMIT CARD
   ============================================================================ */
const AdmitCardDocument: React.FC<{
  student: StudentCardData;
  termLabel: string;
  examRows: ExamRoutineItem[];
  matchedExactTerm: boolean;
  cardLang: 'en' | 'bn';
  settings: SchoolSettings;
}> = ({ student, termLabel, examRows, matchedExactTerm, cardLang, settings }) => {
  const codes = getStudentCardCodes(student.classId, student.roll, student.session);
  const { schoolName, locationText, headTeacherTitle } = getSchoolHeaderInfo(settings, cardLang);
  const classLabel = CLASS_LABELS[student.classId]?.[cardLang] || `Class ${student.classId}`;

  const qrPayload = [
    'RBMB EXAMINATION ADMIT CARD',
    `AdmitNo:${codes.admitCardNo}`,
    `ID:${codes.studentId}`,
    `Reg:${codes.registrationNo}`,
    `Name:${student.studentName}`,
    `Class:${student.classId}`,
    `Sec:${student.section}`,
    `Roll:${student.roll}`,
    `Term:${termLabel}`,
    `EIIN:${settings.eiin}`,
  ].join('|');

  const uniqueRooms = Array.from(
    new Set(examRows.map((r) => (r.room || 'RBMB Examination Centre').trim()).filter(Boolean))
  );
  const uniformVenue =
    uniqueRooms.length <= 1
      ? uniqueRooms[0] || (cardLang === 'bn' ? 'আরবিএমবি পরীক্ষা কেন্দ্র' : 'RBMB Examination Centre')
      : null;

  const instructions =
    cardLang === 'bn'
      ? [
          'পরীক্ষার হলে অবশ্যই এই প্রবেশপত্রটি সঙ্গে নিয়ে আসতে হবে।',
          'পরীক্ষার সকল নিয়ম-শৃঙ্খলা ও নির্দেশনা যথাযথভাবে মেনে চলতে হবে।',
          'মোবাইল ফোন, স্মার্টওয়াচ বা কোনো ইলেকট্রনিক ডিভাইস বহন সম্পূর্ণ নিষিদ্ধ।',
          'পরীক্ষা শুরুর অন্তত ৩০ মিনিট পূর্বে পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।',
          'যেকোনো প্রয়োজনে তাৎক্ষণিক বিদ্যালয় কর্তৃপক্ষের সাথে যোগাযোগ করতে হবে।',
        ]
      : [
          'Bring this Admit Card to the Examination Hall.',
          'Follow all examination rules and regulations.',
          'Mobile phone, smart watch and electronic device are not allowed.',
          'Reach the venue at least 30 minutes before the exam.',
          'In case of any problem, contact the school authority.',
        ];

  return (
    <div className="print-card-avoid-break max-w-[740px] mx-auto bg-white text-slate-900 rounded-2xl border-2 border-[#064e2b] shadow-lg overflow-hidden relative font-sans">
      {/* Top decorative corner waves */}
      <svg
        viewBox="0 0 740 42"
        className="w-full h-5 sm:h-7 block"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0 H155 Q70 10 0 40 Z" fill="#064e2b" />
        <path d="M0 36 Q68 8 148 0" fill="none" stroke="#eab308" strokeWidth="2.5" />
        <path d="M585 0 H740 V40 Q670 10 585 0 Z" fill="#064e2b" />
        <path d="M592 0 Q672 8 740 36" fill="none" stroke="#eab308" strokeWidth="2.5" />
      </svg>

      {/* School Header */}
      <div className="px-5 sm:px-8 pb-3 -mt-2 flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
        <RBMBCrestSvg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" />
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-lg sm:text-[22px] font-black text-[#064e2b] tracking-tight text-center leading-tight">
            {schoolName}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5 text-center">
            {locationText} · EIIN: {settings.eiin}
          </p>
          <div className="mt-2 px-5 py-1 rounded-full bg-[#0d7c3d] text-white text-xs sm:text-sm font-extrabold tracking-wide shadow-sm">
            {termLabel}
          </div>
        </div>
      </div>

      {/* Main Banner */}
      <div className="bg-[#064e2b] text-white text-center py-2 px-4 font-black text-base sm:text-lg tracking-wide">
        {cardLang === 'bn' ? 'পরীক্ষার প্রবেশপত্র (Examination Admit Card)' : 'Examination Admit Card'}
      </div>

      <div className="p-5 sm:px-8 sm:py-5 space-y-4">
        {/* Student Details + Photo + QR */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <StudentPhotoFrame
            photoUrl={student.photoUrl}
            studentName={student.studentName}
            className="w-28 sm:w-32 aspect-[3/4]"
          />

          <div className="flex-1 w-full text-[13px] sm:text-sm">
            <table className="w-full border-collapse">
              <tbody>
                {[
                  [cardLang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name', student.studentName, true],
                  [cardLang === 'bn' ? 'শিক্ষার্থী আইডি' : 'Student ID', codes.studentId, true],
                  [cardLang === 'bn' ? 'রেজিস্ট্রেশন নং' : 'Registration No', codes.registrationNo, false],
                  [cardLang === 'bn' ? 'রোল নম্বর' : 'Roll Number', student.roll.trim() || '01', true],
                  [cardLang === 'bn' ? 'শ্রেণী' : 'Class', classLabel, false],
                  [cardLang === 'bn' ? 'শাখা' : 'Section', student.section || 'A', false],
                  [cardLang === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Session', student.session || '2026', false],
                ].map(([label, val, bold], idx) => (
                  <tr key={idx}>
                    <td className="py-[2px] pr-2 font-semibold text-slate-800 whitespace-nowrap w-[135px] sm:w-[150px]">
                      {label}
                    </td>
                    <td className="py-[2px] pr-2 font-bold text-slate-700 w-3">:</td>
                    <td
                      className={`py-[2px] tabular-nums ${
                        bold ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-800'
                      }`}
                    >
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:border-l sm:border-emerald-700/30 sm:pl-5 flex flex-col items-center justify-center self-center">
            <QrBadge
              payload={qrPayload}
              caption={cardLang === 'bn' ? 'কার্ড যাচাই করুন' : 'Verify This Card'}
              sizeClass="w-24 h-24"
            />
          </div>
        </div>

        {/* Examination Schedule */}
        <div className="rounded-xl overflow-hidden border border-[#15803d]">
          <div className="bg-[#064e2b] text-white text-center py-1.5 font-extrabold text-xs sm:text-sm tracking-wide">
            {cardLang === 'bn' ? 'পরীক্ষার সময়সূচি (Examination Schedule)' : 'Examination Schedule'}
          </div>
          {!matchedExactTerm && examRows.length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-3 py-1 text-[11px] font-semibold text-amber-800 text-center">
              {cardLang === 'bn'
                ? 'নির্বাচিত টার্মের আলাদা রুটিন এখনো প্রকাশিত হয়নি — শ্রেণীর সর্বশেষ রুটিন প্রদর্শিত হচ্ছে।'
                : 'Displaying latest published exam dates for this class.'}
            </div>
          )}
          <table className="w-full text-xs sm:text-[13px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-emerald-700/40 text-slate-900 font-extrabold">
                <th className="py-2 px-3 text-left border-r border-emerald-700/30">
                  {cardLang === 'bn' ? 'বিষয়' : 'Subject'}
                </th>
                <th className="py-2 px-3 text-center border-r border-emerald-700/30">
                  {cardLang === 'bn' ? 'তারিখ' : 'Date'}
                </th>
                <th className="py-2 px-3 text-center border-r border-emerald-700/30">
                  {cardLang === 'bn' ? 'সময়' : 'Time'}
                </th>
                <th className="py-2 px-3 text-center">
                  {cardLang === 'bn' ? 'কেন্দ্র / কক্ষ' : 'Venue'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-700/25">
              {examRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500 font-semibold">
                    {cardLang === 'bn'
                      ? 'এই শ্রেণীর জন্য পরীক্ষার রুটিন এখনো যুক্ত করা হয়নি।'
                      : 'No examination dates scheduled yet for this class.'}
                  </td>
                </tr>
              ) : (
                examRows.map((row, index) => (
                  <tr key={row.id} className="bg-white">
                    <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-emerald-700/25">
                      {row.subject}
                    </td>
                    <td className="py-1.5 px-3 text-center font-semibold text-slate-800 tabular-nums border-r border-emerald-700/25 whitespace-nowrap">
                      {formatDisplayDate(row.date)}
                    </td>
                    <td className="py-1.5 px-3 text-center font-medium text-slate-800 tabular-nums border-r border-emerald-700/25 whitespace-nowrap">
                      {row.time}
                    </td>
                    {uniformVenue ? (
                      index === 0 ? (
                        <td
                          rowSpan={examRows.length}
                          className="py-2 px-3 text-center font-extrabold text-slate-900 align-middle bg-emerald-50/40"
                        >
                          <div>RBMB Examination</div>
                          <div>Centre</div>
                          {uniformVenue !== 'RBMB Examination Centre' && (
                            <div className="text-[11px] font-semibold text-emerald-800 mt-1">
                              ({uniformVenue})
                            </div>
                          )}
                        </td>
                      ) : null
                    ) : (
                      <td className="py-1.5 px-3 text-center font-bold text-slate-800">
                        {row.room || 'RBMB Centre'}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Important Instructions */}
        <div className="bg-[#e8f5ee] border border-[#86efac] rounded-xl px-4 py-3 text-xs text-slate-900">
          <p className="font-extrabold text-[#064e2b] mb-1.5">
            {cardLang === 'bn' ? 'গুরুত্বপূর্ণ নির্দেশনাবলি:' : 'Important Instructions:'}
          </p>
          <ol className="space-y-0.5 pl-4 list-decimal font-medium leading-snug">
            {instructions.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ol>
        </div>

        {/* Footer Signatures & Admit Card No Box */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center text-center min-w-[165px]">
            <OfficialSignatureSvg variant="controller" className="w-24 h-8" />
            <div className="w-40 border-t border-slate-700 pt-1 text-xs font-extrabold text-slate-900">
              {cardLang === 'bn' ? 'পরীক্ষা নিয়ন্ত্রক' : 'Controller of Examinations'}
            </div>
            <span className="text-[10px] font-bold text-slate-600 tracking-wider">RBMB</span>
          </div>

          <div className="px-6 py-2 rounded-xl bg-[#e8f5ee] border border-[#86efac] text-center">
            <p className="text-[11px] font-bold text-slate-700">
              {cardLang === 'bn' ? 'প্রবেশপত্র নম্বর:' : 'Admit Card No:'}
            </p>
            <p className="text-sm font-black text-[#064e2b] tabular-nums tracking-wide">
              {codes.admitCardNo}
            </p>
          </div>

          <div className="flex flex-col items-center text-center min-w-[165px]">
            <OfficialSignatureSvg variant="head" className="w-24 h-8" />
            <div className="w-40 border-t border-slate-700 pt-1 text-xs font-extrabold text-slate-900">
              {headTeacherTitle}
            </div>
            <span className="text-[10px] font-bold text-slate-600 tracking-wider">RBMB</span>
          </div>
        </div>
      </div>

      {/* Bottom Ribbon */}
      <div className="bg-[#064e2b] text-white text-center py-2 px-4 text-xs font-bold tracking-wide relative">
        <span>
          {cardLang === 'bn'
            ? 'শিক্ষা  •  শৃঙ্খলা  •  সাফল্য'
            : 'Education  •  Discipline  •  Success'}
        </span>
      </div>
    </div>
  );
};

/* ============================================================================
   2. REGISTRATION CARD (Landscape)
   ============================================================================ */
const RegistrationCardDocument: React.FC<{
  student: StudentCardData;
  cardLang: 'en' | 'bn';
  settings: SchoolSettings;
}> = ({ student, cardLang, settings }) => {
  const codes = getStudentCardCodes(student.classId, student.roll, student.session);
  const { schoolName, locationText } = getSchoolHeaderInfo(settings, cardLang);
  const classLabel = CLASS_LABELS[student.classId]?.[cardLang] || `Class ${student.classId}`;

  const qrPayload = [
    'RBMB STUDENT REGISTRATION CARD',
    `RegNo:${codes.registrationNo}`,
    `ID:${codes.studentId}`,
    `Name:${student.studentName}`,
    `Class:${student.classId}`,
    `Sec:${student.section}`,
    `Roll:${student.roll}`,
    `Session:${student.session}`,
    `Guardian:${student.guardianMobile}`,
    `EIIN:${settings.eiin}`,
  ].join('|');

  return (
    <div className="print-card-avoid-break max-w-[720px] mx-auto bg-white text-slate-900 rounded-xl border border-[#15803d] shadow-lg overflow-hidden relative font-sans">
      {/* Subtle campus backdrop watermark */}
      {settings.schoolPhoto && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07] bg-cover bg-center"
          style={{ backgroundImage: `url(${settings.schoolPhoto})` }}
        />
      )}

      <div className="relative z-10 p-5 sm:px-7 sm:pt-5 sm:pb-4 space-y-3.5">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <RBMBCrestSvg className="w-16 h-16 shrink-0" />
            <div className="text-center sm:text-left">
              <h2 className="text-base sm:text-xl font-black text-slate-950 leading-tight">
                {schoolName}
              </h2>
              <p className="text-xs font-bold text-slate-800">{locationText}</p>
              <p className="text-xs italic font-semibold text-slate-700 mt-0.5">
                {cardLang === 'bn' ? 'শেখা • বেড়ে ওঠা • উৎকর্ষতা' : 'Learn • Grow • Excel'}
              </p>
            </div>
          </div>

          <div className="bg-[#064e2b] text-white px-4 py-2 rounded-lg text-center shrink-0 shadow-sm">
            <p className="text-[11px] font-semibold opacity-95">
              {cardLang === 'bn' ? 'রেজিস্ট্রেশন নং' : 'Registration No.'}
            </p>
            <p className="text-xs sm:text-sm font-black tracking-wide tabular-nums mt-0.5">
              {codes.registrationNo}
            </p>
          </div>
        </div>

        {/* Centered Registration Card Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[1.5px] bg-[#15803d]/50" />
          <div className="px-7 py-1 rounded-full bg-[#064e2b] text-white font-black text-sm sm:text-base tracking-wide shadow-sm">
            {cardLang === 'bn' ? 'রেজিস্ট্রেশন কার্ড (Registration Card)' : 'Registration Card'}
          </div>
          <div className="flex-1 h-[1.5px] bg-[#15803d]/50" />
        </div>

        {/* Middle Photo + Details + QR */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
          <StudentPhotoFrame
            photoUrl={student.photoUrl}
            studentName={student.studentName}
            className="w-28 sm:w-32 aspect-[3/4]"
          />

          <div className="flex-1 w-full text-[13px] sm:text-sm">
            <table className="w-full border-collapse">
              <tbody>
                {[
                  [cardLang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name', student.studentName, true],
                  [cardLang === 'bn' ? 'শিক্ষার্থী আইডি' : 'Student ID', codes.studentId, true],
                  [cardLang === 'bn' ? 'শ্রেণী' : 'Class', classLabel, false],
                  [cardLang === 'bn' ? 'শাখা' : 'Section', student.section || 'A', false],
                  [cardLang === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Session', student.session || '2026', false],
                  [
                    cardLang === 'bn' ? 'রেজিস্ট্রেশনের তারিখ' : 'Date of Registration',
                    formatDisplayDate(student.registrationDate),
                    false,
                  ],
                ].map(([label, val, bold], idx) => (
                  <tr key={idx}>
                    <td className="py-1 pr-2 font-semibold text-slate-800 whitespace-nowrap w-[145px] sm:w-[160px]">
                      {label}
                    </td>
                    <td className="py-1 pr-2 font-bold text-slate-700 w-3">:</td>
                    <td
                      className={`py-1 tabular-nums ${
                        bold ? 'font-extrabold text-slate-950' : 'font-semibold text-slate-900'
                      }`}
                    >
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <QrBadge
            payload={qrPayload}
            caption={cardLang === 'bn' ? 'স্ক্যান করে যাচাই করুন' : 'Scan to Verify'}
            sizeClass="w-24 h-24"
          />
        </div>

        {/* Bottom Guardian Box + Signature */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 pt-1">
          <div className="flex-1 bg-[#e3f3e8] border border-[#bbf7d0] rounded-lg px-4 py-2.5 text-[13px] sm:text-sm">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="py-0.5 font-semibold text-slate-800 w-[135px] whitespace-nowrap">
                    {cardLang === 'bn' ? 'অভিভাবকের নাম' : 'Guardian Name'}
                  </td>
                  <td className="py-0.5 pr-2 font-bold w-3">:</td>
                  <td className="py-0.5 font-extrabold text-slate-900">
                    {student.guardianName || (cardLang === 'bn' ? 'অভিভাবক (তালিকাভুক্ত)' : 'Parent / Legal Guardian')}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 font-semibold text-slate-800 w-[135px] whitespace-nowrap">
                    {cardLang === 'bn' ? 'অভিভাবকের মোবাইল' : 'Guardian Mobile'}
                  </td>
                  <td className="py-0.5 pr-2 font-bold w-3">:</td>
                  <td className="py-0.5 font-extrabold text-slate-900 tabular-nums">
                    {student.guardianMobile || settings.phone}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center text-center min-w-[160px]">
            <OfficialSignatureSvg variant="head" className="w-24 h-8" />
            <div className="w-36 border-t border-slate-700 pt-1 text-xs font-extrabold text-slate-900">
              {cardLang === 'bn' ? 'প্রধান শিক্ষক / অধ্যক্ষ' : 'Principal / Head Teacher'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dark Green Footer */}
      <div className="relative z-10 bg-[#064e2b] text-white text-center py-2 px-4 text-xs font-bold tracking-wide">
        {cardLang === 'bn'
          ? `${schoolName} – আগামীর উজ্জ্বল ভবিষ্যতের একটি নির্ভরযোগ্য প্রতিষ্ঠান`
          : `${schoolName} – A Place for Better Tomorrow`}
      </div>
    </div>
  );
};

/* ============================================================================
   3. STUDENT ID CARD (FRONT & BACK)
   ============================================================================ */
const StudentIdCardPairDocument: React.FC<{
  student: StudentCardData;
  cardLang: 'en' | 'bn';
  settings: SchoolSettings;
}> = ({ student, cardLang, settings }) => {
  const codes = getStudentCardCodes(student.classId, student.roll, student.session);
  const { schoolName, locationText, headTeacherTitle, website } = getSchoolHeaderInfo(
    settings,
    cardLang
  );
  const classLabel = CLASS_LABELS[student.classId]?.[cardLang] || `Class ${student.classId}`;

  const qrPayload = [
    'RBMB STUDENT ID CARD',
    `ID:${codes.studentId}`,
    `Reg:${codes.registrationNo}`,
    `Name:${student.studentName}`,
    `Class:${student.classId}`,
    `Sec:${student.section}`,
    `Roll:${codes.paddedRollDisplay}`,
    `Session:${student.session}`,
    `Valid:${student.validUpto}`,
    `Phone:${student.guardianMobile}`,
    `EIIN:${settings.eiin}`,
  ].join('|');

  const idBackInstructions =
    cardLang === 'bn'
      ? [
          'এই আইডি কার্ডটি শুধুমাত্র বর্তমান শিক্ষাবর্ষের জন্য বৈধ।',
          'কার্ডটি যত্নসহকারে সংরক্ষণ করুন এবং অন্যকে ব্যবহার করতে দেবেন না।',
          'কার্ড হারিয়ে গেলে অবিলম্বে বিদ্যালয় অফিসে অবহিত করুন।',
          'এই পরিচয়পত্রটি হস্তান্তরযোগ্য নয়।',
        ]
      : [
          'This ID Card is valid for the current academic session only.',
          'Keep this card safe and do not share it.',
          'Report loss immediately to the school office.',
          'This card is not transferable.',
        ];

  return (
    <div className="max-w-[540px] mx-auto space-y-6 font-sans">
      {/* FRONT SIDE */}
      <div className="print-card-avoid-break bg-white text-slate-900 rounded-2xl border border-emerald-700/40 shadow-lg overflow-hidden relative">
        {/* Subtle campus photo watermark */}
        {settings.schoolPhoto && (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07] bg-cover bg-center"
            style={{ backgroundImage: `url(${settings.schoolPhoto})` }}
          />
        )}

        {/* Curved Top Wave Header */}
        <div className="relative">
          <svg
            viewBox="0 0 540 105"
            className="w-full h-[88px] sm:h-[98px] block"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 0 H540 V68 Q340 106 0 74 Z" fill="#65a30d" />
            <path d="M0 0 H540 V58 Q330 98 0 66 Z" fill="#064e2b" />
          </svg>
          <div className="absolute inset-0 px-5 pt-2.5 flex items-start gap-3.5 text-white">
            <RBMBCrestSvg className="w-16 h-16 sm:w-[70px] sm:h-[70px] shrink-0" />
            <div className="flex-1 text-center pr-4 pt-0.5">
              <h3 className="text-sm sm:text-[17px] font-black leading-tight">{schoolName}</h3>
              <p className="text-[11px] sm:text-xs font-semibold opacity-95 mt-0.5">{locationText}</p>
              <p className="text-[11px] italic font-medium opacity-90">
                {cardLang === 'bn' ? 'শেখা • বেড়ে ওঠা • উৎকর্ষতা' : 'Learn • Grow • Excel'}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="relative z-10 px-5 pt-1 pb-2">
          <div className="flex justify-center mb-3">
            <div className="px-7 py-1 rounded-full bg-[#064e2b] text-white font-black text-xs sm:text-sm tracking-wide shadow-sm">
              {cardLang === 'bn' ? 'শিক্ষার্থী পরিচয়পত্র (Student ID Card)' : 'Student ID Card'}
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:gap-4">
            <StudentPhotoFrame
              photoUrl={student.photoUrl}
              studentName={student.studentName}
              className="w-24 sm:w-[108px] aspect-[3/4]"
            />

            <div className="flex-1 min-w-0 text-[11px] sm:text-xs">
              <table className="w-full border-collapse">
                <tbody>
                  {[
                    [cardLang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name', student.studentName, true],
                    [cardLang === 'bn' ? 'শিক্ষার্থী আইডি' : 'Student ID', codes.studentId, true],
                    [cardLang === 'bn' ? 'রেজিঃ নং' : 'Registration No', codes.registrationNo, false],
                    [cardLang === 'bn' ? 'শ্রেণী' : 'Class', classLabel, false],
                    [cardLang === 'bn' ? 'শাখা' : 'Section', student.section || 'A', false],
                    [cardLang === 'bn' ? 'রোল নম্বর' : 'Roll Number', codes.paddedRollDisplay, true],
                    [cardLang === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Session', student.session || '2026', false],
                  ].map(([label, val, bold], idx) => (
                    <tr key={idx}>
                      <td className="py-[1.5px] pr-1.5 font-semibold text-slate-800 whitespace-nowrap w-[95px] sm:w-[105px]">
                        {label}
                      </td>
                      <td className="py-[1.5px] pr-1.5 font-bold text-slate-700 w-2">:</td>
                      <td
                        className={`py-[1.5px] tabular-nums truncate max-w-[170px] ${
                          bold ? 'font-extrabold text-slate-950' : 'font-semibold text-slate-900'
                        }`}
                      >
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <QrBadge
              payload={qrPayload}
              caption={cardLang === 'bn' ? 'যাচাই করুন' : 'Verify Me'}
              sizeClass="w-16 h-16 sm:w-[70px] sm:h-[70px]"
            />
          </div>
        </div>

        {/* Bottom Wave + Dates + Signature */}
        <div className="relative h-16 mt-1">
          <svg
            viewBox="0 0 540 72"
            className="w-full h-full block"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 10 Q180 12 370 72 H0 Z" fill="#65a30d" />
            <path d="M0 18 Q170 20 355 72 H0 Z" fill="#064e2b" />
          </svg>
          <div className="absolute inset-0 px-5 pb-2 flex items-end justify-between">
            <div className="text-white text-[11px] font-bold leading-snug tabular-nums">
              <p>
                {cardLang === 'bn' ? 'ইস্যু তারিখ:' : 'Issue Date:'} {formatDisplayDate(student.issueDate)}
              </p>
              <p>
                {cardLang === 'bn' ? 'মেয়াদ উত্তীর্ণ:' : 'Valid Upto:'} {formatDisplayDate(student.validUpto)}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <OfficialSignatureSvg variant="head" className="w-20 h-6" />
              <div className="w-28 border-t border-slate-800 pt-0.5 text-[11px] font-extrabold text-slate-900">
                {headTeacherTitle}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BACK SIDE */}
      <div className="print-card-avoid-break bg-white text-slate-900 rounded-2xl border border-emerald-700/40 shadow-lg overflow-hidden relative">
        {settings.schoolPhoto && (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06] bg-cover bg-center"
            style={{ backgroundImage: `url(${settings.schoolPhoto})` }}
          />
        )}

        {/* Top Wave Header */}
        <div className="relative">
          <svg
            viewBox="0 0 540 92"
            className="w-full h-[78px] sm:h-[84px] block"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 0 H540 V58 Q340 94 0 64 Z" fill="#65a30d" />
            <path d="M0 0 H540 V49 Q330 85 0 56 Z" fill="#064e2b" />
          </svg>
          <div className="absolute inset-0 px-5 pt-2 flex items-start gap-3.5 text-white">
            <RBMBCrestSvg className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" />
            <div className="flex-1 text-center pr-6 pt-1">
              <h3 className="text-sm sm:text-[17px] font-black leading-tight">{schoolName}</h3>
              <p className="text-[11px] italic font-medium opacity-90 mt-0.5">
                {cardLang === 'bn' ? 'শেখা • বেড়ে ওঠা • উৎকর্ষতা' : 'Learn • Grow • Excel'}
              </p>
            </div>
          </div>
        </div>

        {/* Two Columns: Instructions & Contact */}
        <div className="relative z-10 px-5 py-3 grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-7 space-y-2">
            <div className="inline-block px-4 py-1 rounded-full bg-[#064e2b] text-white text-xs font-extrabold">
              {cardLang === 'bn' ? 'গুরুত্বপূর্ণ নির্দেশনা:' : 'Important Instructions:'}
            </div>
            <ul className="space-y-1.5 text-[11px] sm:text-xs font-medium text-slate-900">
              {idBackInstructions.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0 mt-0.5" />
                  <span className="leading-snug">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-5 space-y-2">
            <div className="inline-block px-5 py-1 rounded-full bg-[#064e2b] text-white text-xs font-extrabold">
              {cardLang === 'bn' ? 'যোগাযোগ:' : 'Contact Us:'}
            </div>
            <ul className="space-y-1.5 text-[11px] sm:text-xs font-semibold text-slate-900">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#064e2b] shrink-0 mt-0.5" />
                <span className="leading-snug">{locationText}</span>
              </li>
              <li className="flex items-center gap-2 tabular-nums">
                <Phone className="w-3.5 h-3.5 text-[#064e2b] shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#064e2b] shrink-0" />
                <span className="truncate">{settings.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#064e2b] shrink-0" />
                <span>{website}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Wave + Motto + Signature */}
        <div className="relative h-16 mt-1">
          <svg
            viewBox="0 0 540 72"
            className="w-full h-full block"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 10 Q180 12 370 72 H0 Z" fill="#65a30d" />
            <path d="M0 18 Q170 20 355 72 H0 Z" fill="#064e2b" />
          </svg>
          <div className="absolute inset-0 px-5 pb-2 flex items-end justify-between">
            <div className="flex items-center gap-2.5 text-white pb-1">
              <BookOpen className="w-6 h-6 text-white shrink-0" />
              <span className="text-xs sm:text-sm font-black tracking-wide">
                শিক্ষাই আলো, শিক্ষাই শক্তি
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <OfficialSignatureSvg variant="head" className="w-20 h-6" />
              <div className="w-28 border-t border-slate-800 pt-0.5 text-[11px] font-extrabold text-slate-900">
                {headTeacherTitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   MAIN MODAL SUITE
   ============================================================================ */
export const StudentIdAdmitCard: React.FC<StudentIdAdmitCardProps> = ({
  open,
  onClose,
  studentName,
  classId,
  roll,
  section = 'A',
  guardianMobile,
  guardianName,
  photoUrl,
  registrationDate,
  session = '2026',
  cardIssueDate,
  cardValidUpto,
  initialMode = 'admit',
  allowedModes,
  rosterStudents,
  onSaveStudentDetails,
}) => {
  const { lang, t, settings, examRoutines } = useApp();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const effectiveAllowedModes: CardMode[] =
    allowedModes && allowedModes.length > 0 ? allowedModes : ['admit', 'reg', 'id'];
  const safeInitialMode: CardMode = effectiveAllowedModes.includes(initialMode as CardMode)
    ? (initialMode as CardMode)
    : effectiveAllowedModes[0];

  const [mode, setMode] = useState<CardMode>(safeInitialMode);
  const [cardLang, setCardLang] = useState<'en' | 'bn'>('en');
  const [selectedTerm, setSelectedTerm] = useState<string>(EXAM_TERMS[3]?.id || EXAM_TERMS[1].id);
  const [showCustomize, setShowCustomize] = useState(false);
  const [printAllMode, setPrintAllMode] = useState(false);
  const [activeStudentKey, setActiveStudentKey] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formOverrides, setFormOverrides] = useState<StudentCardData>({
    studentName: studentName || 'Student',
    classId: classId || '6',
    roll: roll || '01',
    section: section || 'A',
    guardianName: guardianName || '',
    guardianMobile: guardianMobile || settings.phone,
    photoUrl: photoUrl || '',
    session: session || '2026',
    registrationDate: registrationDate || '2026-01-15',
    issueDate: cardIssueDate || '2026-01-15',
    validUpto: cardValidUpto || '2026-12-31',
  });

  // Sync incoming props cleanly whenever modal opens or props change
  useEffect(() => {
    const allowed: CardMode[] =
      allowedModes && allowedModes.length > 0 ? allowedModes : ['admit', 'reg', 'id'];
    setMode(allowed.includes(initialMode as CardMode) ? (initialMode as CardMode) : allowed[0]);
    setPrintAllMode(false);
    setSaveSuccess(false);
  }, [initialMode, open, allowedModes]);

  useEffect(() => {
    const key = `${classId}__${roll}`;
    setActiveStudentKey(key);
    setFormOverrides({
      studentName: (studentName || '').trim() || `Student #${roll || '01'}`,
      classId: classId || '6',
      roll: (roll || '01').trim(),
      section: (section || 'A').trim(),
      guardianName: (guardianName || '').trim(),
      guardianMobile: (guardianMobile || settings.phone).trim(),
      photoUrl: photoUrl || '',
      session: (session || '2026').trim(),
      registrationDate: (registrationDate || '2026-01-15').trim(),
      issueDate: (cardIssueDate || '2026-01-15').trim(),
      validUpto: (cardValidUpto || '2026-12-31').trim(),
    });
  }, [
    open,
    studentName,
    classId,
    roll,
    section,
    guardianMobile,
    guardianName,
    photoUrl,
    registrationDate,
    session,
    cardIssueDate,
    cardValidUpto,
    settings.phone,
  ]);

  const handleSelectRosterStudent = (key: string) => {
    setActiveStudentKey(key);
    if (!rosterStudents) return;
    const found = rosterStudents.find((s) => `${s.classId}__${s.roll}` === key);
    if (!found) return;
    setFormOverrides((prev) => ({
      ...prev,
      id: found.id,
      studentName: found.name,
      classId: found.classId,
      roll: found.roll,
      section: found.section || 'A',
      guardianName: found.guardianName || '',
      guardianMobile: found.guardianMobile || settings.phone,
      photoUrl: found.photo || '',
      session: found.session || prev.session || '2026',
      registrationDate: found.registrationDate || prev.registrationDate || '2026-01-15',
      issueDate: found.cardIssueDate || prev.issueDate || '2026-01-15',
      validUpto: found.cardValidUpto || prev.validUpto || '2026-12-31',
    }));
  };

  const getExamScheduleForClass = useMemo(() => {
    return (targetClassId: string) => {
      const exactMatches = examRoutines
        .filter((r) => r.classId === targetClassId && r.examTerm === selectedTerm)
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      if (exactMatches.length > 0) {
        return { rows: exactMatches, matchedExactTerm: true };
      }
      const classAnyTerm = examRoutines
        .filter((r) => r.classId === targetClassId)
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      return { rows: classAnyTerm, matchedExactTerm: false };
    };
  }, [examRoutines, selectedTerm]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 450, 0.8, 420000);
      setFormOverrides((prev) => ({ ...prev, photoUrl: compressed }));
      if (onSaveStudentDetails) {
        onSaveStudentDetails({
          classId: formOverrides.classId,
          roll: formOverrides.roll,
          photo: compressed,
          guardianName: formOverrides.guardianName || undefined,
          guardianMobile: formOverrides.guardianMobile || undefined,
          registrationDate: formOverrides.registrationDate || undefined,
          session: formOverrides.session || undefined,
          cardIssueDate: formOverrides.issueDate || undefined,
          cardValidUpto: formOverrides.validUpto || undefined,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch {
      // ignore read failure gracefully
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveDetails = () => {
    if (!onSaveStudentDetails) return;
    onSaveStudentDetails({
      classId: formOverrides.classId,
      roll: formOverrides.roll,
      guardianName: formOverrides.guardianName || undefined,
      guardianMobile: formOverrides.guardianMobile || undefined,
      photo: formOverrides.photoUrl || undefined,
      registrationDate: formOverrides.registrationDate || undefined,
      session: formOverrides.session || undefined,
      cardIssueDate: formOverrides.issueDate || undefined,
      cardValidUpto: formOverrides.validUpto || undefined,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (!open) return null;

  const selectedTermObj = EXAM_TERMS.find((tm) => tm.id === selectedTerm);
  const termLabel = selectedTermObj
    ? cardLang === 'bn'
      ? selectedTermObj.bn
      : selectedTermObj.en
    : selectedTerm;

  const batchList: StudentCardData[] =
    printAllMode && rosterStudents && rosterStudents.length > 0
      ? rosterStudents.map((st) => ({
          id: st.id,
          studentName: st.name,
          classId: st.classId,
          roll: st.roll,
          section: st.section || 'A',
          guardianName: st.guardianName || '',
          guardianMobile: st.guardianMobile || settings.phone,
          photoUrl: st.photo || '',
          session: st.session || formOverrides.session || '2026',
          registrationDate: st.registrationDate || formOverrides.registrationDate || '2026-01-15',
          issueDate: st.cardIssueDate || formOverrides.issueDate,
          validUpto: st.cardValidUpto || formOverrides.validUpto,
        }))
      : [formOverrides];

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm no-print" onClick={onClose} />

      <div className="relative bg-slate-100 dark:bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Interactive Toolbar */}
        <div className="no-print flex flex-col gap-3 px-4 sm:px-6 py-3.5 bg-white dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* System Tabs filtered by allowedModes */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              {effectiveAllowedModes.includes('admit') && (
                <button
                  type="button"
                  onClick={() => setMode('admit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    mode === 'admit'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'অ্যাডমিট কার্ড' : 'Admit Card'}
                </button>
              )}
              {effectiveAllowedModes.includes('reg') && (
                <button
                  type="button"
                  onClick={() => setMode('reg')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    mode === 'reg'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <FileBadge2 className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'রেজিস্ট্রেশন কার্ড' : 'Registration Card'}
                </button>
              )}
              {effectiveAllowedModes.includes('id') && (
                <button
                  type="button"
                  onClick={() => setMode('id')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    mode === 'id'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'আইডি কার্ড (Front & Back)' : 'Student ID Card'}
                </button>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {mode === 'admit' && (
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
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
                onClick={() => setCardLang((prev) => (prev === 'en' ? 'bn' : 'en'))}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold whitespace-nowrap"
              >
                {cardLang === 'en' ? 'বাংলা কার্ড' : 'English Card'}
              </button>

              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                {lang === 'bn' ? 'ছবি দিন' : 'Photo'}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => setShowCustomize((p) => !p)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap ${
                  showCustomize
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'তথ্য সম্পাদনা' : 'Edit Info'}
              </button>

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

          {/* Roster Switcher & Batch Print Bar (Teacher / Admin) */}
          {rosterStudents && rosterStudents.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <Users className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <select
                  value={activeStudentKey}
                  disabled={printAllMode}
                  onChange={(e) => handleSelectRosterStudent(e.target.value)}
                  className="flex-1 max-w-sm px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-50"
                >
                  {rosterStudents.map((st) => (
                    <option key={st.id} value={`${st.classId}__${st.roll}`}>
                      Class {st.classId} · Roll #{st.roll} — {st.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setPrintAllMode((p) => !p)}
                className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 whitespace-nowrap border transition-colors ${
                  printAllMode
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                {printAllMode
                  ? lang === 'bn'
                    ? `একক কার্ডে ফিরুন (${rosterStudents.length} জন লোড)`
                    : `Single Student View`
                  : lang === 'bn'
                  ? `সকল শিক্ষার্থীর কার্ড একসাথে (${rosterStudents.length})`
                  : `All Class Cards (${rosterStudents.length})`}
              </button>
            </div>
          )}

          {/* Optional Card Info Customizer */}
          {showCustomize && (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'অভিভাবকের নাম' : 'Guardian Name'}
                </label>
                <input
                  value={formOverrides.guardianName}
                  onChange={(e) =>
                    setFormOverrides((p) => ({ ...p, guardianName: e.target.value }))
                  }
                  placeholder="Father / Guardian Name"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'মোবাইল' : 'Guardian Mobile'}
                </label>
                <input
                  value={formOverrides.guardianMobile}
                  onChange={(e) =>
                    setFormOverrides((p) => ({ ...p, guardianMobile: e.target.value }))
                  }
                  placeholder="017XX-XXXXXX"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'শিক্ষাবর্ষ' : 'Session'}
                </label>
                <input
                  value={formOverrides.session}
                  onChange={(e) => setFormOverrides((p) => ({ ...p, session: e.target.value }))}
                  placeholder="2026"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'রেজিঃ / ইস্যু তারিখ' : 'Reg / Issue Date'}
                </label>
                <input
                  type="date"
                  value={formOverrides.registrationDate}
                  onChange={(e) =>
                    setFormOverrides((p) => ({
                      ...p,
                      registrationDate: e.target.value,
                      issueDate: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'মেয়াদ উত্তীর্ণ' : 'Valid Upto'}
                </label>
                <input
                  type="date"
                  value={formOverrides.validUpto}
                  onChange={(e) =>
                    setFormOverrides((p) => ({ ...p, validUpto: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>
              {onSaveStudentDetails && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold inline-flex items-center justify-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saveSuccess
                      ? lang === 'bn'
                        ? 'সংরক্ষিত!'
                        : 'Saved!'
                      : lang === 'bn'
                      ? 'ডাটা সেভ'
                      : 'Save'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Printable Scroll Canvas */}
        <div
          id="printable-id-admit-card"
          className="p-4 sm:p-8 print:p-0 overflow-y-auto print:overflow-visible flex-1 bg-slate-100 dark:bg-slate-950/60 print:bg-white"
        >
          <div className="space-y-6 print:space-y-4">
            {batchList.map((studentItem, index) => {
              const schedule = getExamScheduleForClass(studentItem.classId);
              const isLast = index === batchList.length - 1;
              return (
                <div
                  key={`${studentItem.classId}-${studentItem.roll}-${index}`}
                  className={!isLast ? 'print-page-break' : undefined}
                >
                  {mode === 'admit' && (
                    <AdmitCardDocument
                      student={studentItem}
                      termLabel={termLabel}
                      examRows={schedule.rows}
                      matchedExactTerm={schedule.matchedExactTerm}
                      cardLang={cardLang}
                      settings={settings}
                    />
                  )}
                  {mode === 'reg' && (
                    <RegistrationCardDocument
                      student={studentItem}
                      cardLang={cardLang}
                      settings={settings}
                    />
                  )}
                  {mode === 'id' && (
                    <StudentIdCardPairDocument
                      student={studentItem}
                      cardLang={cardLang}
                      settings={settings}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
