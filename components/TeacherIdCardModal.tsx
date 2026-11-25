import * as React from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  IdCard,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  BookOpen,
  SlidersHorizontal,
  Users,
  Save,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../App';
import { SchoolSettings, Teacher } from '../types';
import { compressImageFile } from '../utils/imageUtils';

const { useState, useEffect, useRef } = React;

export interface TeacherCardProfile {
  id: string;
  teacherCode: string;
  nameEn: string;
  nameBn: string;
  designationEn: string;
  designationBn: string;
  subjectEn: string;
  subjectBn: string;
  qualificationEn: string;
  qualificationBn: string;
  phone: string;
  bloodGroup: string;
  photoUrl?: string;
  issueDate: string;
  validUpto: string;
}

export interface TeacherProfileSavePayload {
  id: string;
  teacherCode: string;
  phone: string;
  bloodGroup: string;
  issueDate: string;
  validUpto: string;
  photo?: string;
}

export interface TeacherIdCardModalProps {
  open: boolean;
  onClose: () => void;
  teacher: Teacher;
  teacherIndex?: number;
  allTeachers?: Teacher[];
  phoneOverride?: string;
  onSavePhoto?: (teacherId: string, photoDataUrl: string) => void;
  onSaveProfile?: (updates: TeacherProfileSavePayload) => void;
}

export function getTeacherIdCode(teacherId: string, index = 0): string {
  const numericTail = /^t-(\d+)$/.exec((teacherId || '').trim());
  if (numericTail) {
    return `RBMB-TCH-${numericTail[1].padStart(3, '0')}`;
  }
  const safeNum = Math.max(1, index + 1);
  return `RBMB-TCH-${String(safeNum).padStart(3, '0')}`;
}

function formatDisplayDate(raw?: string): string {
  if (!raw || !raw.trim()) return '15-01-2026';
  const trimmed = raw.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
  }
  return trimmed;
}

const ExecutiveCrestSvg: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="goldCrestRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="50%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#fef3c7" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="56" fill="#0f172a" stroke="url(#goldCrestRing)" strokeWidth="3.5" />
    <circle cx="60" cy="60" r="48" fill="none" stroke="#d97706" strokeOpacity="0.65" strokeWidth="1" strokeDasharray="3 2.5" />
    <path
      d="M27 83 C18 67, 19 46, 32 31 M93 83 C102 67, 101 46, 88 31"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M39 36 H81 V64 C81 78, 60 88, 60 88 C60 88, 39 78, 39 64 Z"
      fill="#064e3b"
      stroke="#fbbf24"
      strokeWidth="2"
    />
    <path
      d="M44 64 Q52 59 60 64 Q68 59 76 64 V75 Q68 70 60 75 Q52 70 44 75 Z"
      fill="#fefce8"
      stroke="#d97706"
      strokeWidth="1.4"
    />
    <rect x="58.2" y="45" width="3.6" height="16" rx="1.5" fill="#fbbf24" />
    <path d="M60 35 C63 40, 64 44, 60 47 C56 44, 57 40, 60 35 Z" fill="#f97316" />
  </svg>
);

const OfficialSignatureSvg: React.FC<{ className?: string }> = ({ className = 'w-24 h-7' }) => (
  <svg viewBox="0 0 180 54" className={className} aria-hidden="true">
    <path
      d="M14 38 C22 14, 40 12, 34 32 C28 46, 12 36, 30 28 C46 21, 56 38, 66 26 C72 19, 75 35, 86 28 C95 22, 102 36, 118 24 C126 18, 134 34, 152 25"
      fill="none"
      stroke="#0f172a"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M18 44 Q88 39 162 42" fill="none" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const QrVerificationStamp: React.FC<{
  payload: string;
  caption: string;
  sizeClass?: string;
}> = ({ payload, caption, sizeClass = 'w-[68px] h-[68px]' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
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
    <div className="flex flex-col items-center shrink-0">
      <div className="p-1.5 bg-white border border-amber-600/60 shadow-sm rounded-lg relative">
        <span className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-slate-900" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-slate-900" />
        <span className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-slate-900" />
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-slate-900" />
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={caption}
            className={`${sizeClass} block object-contain rounded-[2px]`}
          />
        ) : (
          <div className={`${sizeClass} bg-slate-100 rounded flex items-center justify-center text-[9px] text-slate-400`}>
            QR
          </div>
        )}
      </div>
      <span className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-800 whitespace-nowrap">
        {caption}
      </span>
    </div>
  );
};

const ExecutivePortraitFrame: React.FC<{
  photoUrl?: string;
  name: string;
}> = ({ photoUrl, name }) => {
  const initials = (name || 'T')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className="relative p-1 bg-white border border-amber-600/50 rounded-xl shadow-md shrink-0">
      <span className="absolute -top-[3px] -left-[3px] w-3 h-3 border-t-2 border-l-2 border-amber-500 rounded-tl" />
      <span className="absolute -top-[3px] -right-[3px] w-3 h-3 border-t-2 border-r-2 border-amber-500 rounded-tr" />
      <span className="absolute -bottom-[3px] -left-[3px] w-3 h-3 border-b-2 border-l-2 border-amber-500 rounded-bl" />
      <span className="absolute -bottom-[3px] -right-[3px] w-3 h-3 border-b-2 border-r-2 border-amber-500 rounded-br" />
      <div className="w-24 sm:w-[106px] aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center relative">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-black text-base tracking-wider">
              {initials || 'FC'}
            </div>
            <span className="mt-2 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-300">
              Faculty Photo
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

function getSchoolMeta(settings: SchoolSettings, cardLang: 'en' | 'bn') {
  const rawBn = settings.name?.bn || 'রাণীর বাজার মাধ্যমিক বিদ্যালয়';
  const rawEn = settings.name?.en || 'রাণীর বাজার মাধ্যমিক বিদ্যালয়';
  const schoolName =
    cardLang === 'bn'
      ? rawBn
      : rawEn;
  const locationText =
    cardLang === 'bn'
      ? settings.location?.bn || 'রাণীর বাজার, চৌদ্দগ্রাম, কুমিল্লা'
      : settings.location?.en || 'Rani Bazar, Chauddagram, Cumilla';
  const signatureLabel = cardLang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher';
  const website = 'www.rbmb12.vercel.app';
  return { schoolName, locationText, signatureLabel, website };
}

const TeacherIdCardPairDocument: React.FC<{
  profile: TeacherCardProfile;
  cardLang: 'en' | 'bn';
  settings: SchoolSettings;
}> = ({ profile, cardLang, settings }) => {
  const { schoolName, locationText, signatureLabel, website } = getSchoolMeta(settings, cardLang);
  const nameText = cardLang === 'bn' ? profile.nameBn : profile.nameEn;
  const desigText = cardLang === 'bn' ? profile.designationBn : profile.designationEn;
  const subjectText = cardLang === 'bn' ? profile.subjectBn : profile.subjectEn;
  const qualText = cardLang === 'bn' ? profile.qualificationBn : profile.qualificationEn;

  const qrPayload = [
    'RBMB-FACULTY-VERIFY',
    `ID:${profile.teacherCode}`,
    `Name:${profile.nameEn}`,
    `Designation:${profile.designationEn}`,
    `Department:${profile.subjectEn}`,
    `Phone:${profile.phone}`,
    `Valid:${profile.validUpto}`,
    `EIIN:${settings.eiin}`,
  ].join('|');

  const backDirectives =
    cardLang === 'bn'
      ? [
          'এই ফ্যাকাল্টি পরিচয়পত্রটি বিদ্যালয় কর্তৃপক্ষের নিবন্ধিত সম্পত্তি।',
          'প্রাতিষ্ঠানিক দায়িত্ব পালন ও পরীক্ষার হলে কার্ডটি দৃশ্যমান রাখুন।',
          'কার্ডটি হারিয়ে গেলে অবিলম্বে প্রধান শিক্ষকের কার্যালয়ে অবহিত করুন।',
          'এই পরিচয়পত্রটি সম্পূর্ণভাবে অ-হস্তান্তরযোগ্য।',
        ]
      : [
          'This Executive Faculty Credential remains school property.',
          'Display visibly during campus supervision and examinations.',
          'Report lost or damaged credentials immediately to the office.',
          'Strictly non-transferable · Authorized Faculty Only.',
        ];

  return (
    <div className="max-w-[550px] mx-auto space-y-7 font-sans" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      {/* ============================================================
          FRONT SIDE — Architectural Slate-Forest & Champagne Gold
         ============================================================ */}
      <div className="print-card-avoid-break bg-[#fcfcfa] text-slate-900 rounded-2xl border border-slate-300 shadow-xl overflow-hidden relative">
        {/* Subtle Architectural Filigree Watermark */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.045]"
          viewBox="0 0 550 340"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="rbmbArchGrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 14 0 L 28 14 L 14 28 L 0 14 Z" fill="none" stroke="#0f172a" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="550" height="340" fill="url(#rbmbArchGrid)" />
        </svg>

        {/* Executive Angular Header */}
        <div className="relative bg-gradient-to-r from-[#0f172a] via-[#062e26] to-[#0f172a] text-white px-5 pt-3.5 pb-4 border-b-2 border-[#d97706]">
          {/* Fine vertical architectural gold accent hairlines */}
          <div className="absolute right-0 top-0 bottom-0 w-24 opacity-20 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <line x1="20" y1="0" x2="100" y2="100" stroke="#fbbf24" strokeWidth="1" />
              <line x1="45" y1="0" x2="100" y2="70" stroke="#fbbf24" strokeWidth="1" />
              <line x1="70" y1="0" x2="100" y2="40" stroke="#fbbf24" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <ExecutiveCrestSvg className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  {cardLang === 'bn' ? 'অফিসিয়াল ফ্যাকাল্টি আইডেন্টিটি' : 'Executive Faculty Credential'}
                </p>
                <h3 className="text-sm sm:text-[16px] font-black tracking-tight leading-snug text-white truncate">
                  {schoolName}
                </h3>
                <p className="text-[11px] font-medium text-slate-300 truncate">{locationText}</p>
              </div>
            </div>

            <div className="shrink-0 text-right border border-amber-500/60 bg-slate-950/60 px-2.5 py-1.5 rounded-lg">
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-amber-300">EIIN</p>
              <p className="text-xs font-black tracking-wider text-white tabular-nums">{settings.eiin}</p>
            </div>
          </div>
        </div>

        {/* Sub-Ribbon Classification Bar */}
        <div className="relative z-10 bg-slate-900 text-amber-200 px-5 py-1.5 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.18em] border-b border-slate-200">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {cardLang === 'bn' ? 'শিক্ষক ও অনুষদ পরিচয়পত্র' : 'TEACHER / FACULTY ID CARD'}
          </span>
          <span className="tabular-nums text-white font-black tracking-wider">{profile.teacherCode}</span>
        </div>

        {/* Front Card Body */}
        <div className="relative z-10 px-5 py-4 flex items-center gap-4">
          <ExecutivePortraitFrame photoUrl={profile.photoUrl} name={nameText} />

          <div className="flex-1 min-w-0">
            <div className="pb-2 mb-2 border-b border-slate-200">
              <h4 className="text-base sm:text-[17px] font-black text-slate-950 leading-tight truncate">
                {nameText}
              </h4>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#064e3b] mt-0.5 truncate">
                {desigText}
              </p>
            </div>

            <table className="w-full border-collapse text-[11px] sm:text-xs">
              <tbody>
                {[
                  [cardLang === 'bn' ? 'ফ্যাকাল্টি আইডি' : 'Faculty ID', profile.teacherCode, true],
                  [cardLang === 'bn' ? 'বিভাগ / বিষয়' : 'Department', subjectText, false],
                  [cardLang === 'bn' ? 'যোগ্যতা' : 'Qualification', qualText, false],
                  [cardLang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group', profile.bloodGroup || '—', false],
                  [cardLang === 'bn' ? 'মোবাইল' : 'Contact', profile.phone, true],
                ].map(([label, val, accent], idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-[2.5px] pr-2 font-bold text-slate-500 whitespace-nowrap w-[88px]">
                      {label}
                    </td>
                    <td className="py-[2.5px] pr-1.5 text-slate-400 font-bold w-2">:</td>
                    <td
                      className={`py-[2.5px] tabular-nums truncate max-w-[165px] ${
                        accent ? 'font-black text-slate-950' : 'font-semibold text-slate-800'
                      }`}
                    >
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <QrVerificationStamp
            payload={qrPayload}
            caption={cardLang === 'bn' ? 'যাচাই করুন' : 'VERIFY'}
            sizeClass="w-[66px] h-[66px]"
          />
        </div>

        {/* Front Architectural Footer */}
        <div className="relative z-10 flex items-stretch border-t border-amber-600/40 bg-white">
          <div className="bg-gradient-to-r from-[#0f172a] to-[#062e26] text-white px-5 py-2.5 flex-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] font-bold tabular-nums">
            <span>
              <span className="text-amber-300 uppercase text-[9px] tracking-widest mr-1.5">
                {cardLang === 'bn' ? 'ইস্যু:' : 'ISSUED:'}
              </span>
              {formatDisplayDate(profile.issueDate)}
            </span>
            <span>
              <span className="text-amber-300 uppercase text-[9px] tracking-widest mr-1.5">
                {cardLang === 'bn' ? 'মেয়াদ:' : 'VALID UPTO:'}
              </span>
              {formatDisplayDate(profile.validUpto)}
            </span>
          </div>
          <div className="bg-[#fcfcfa] px-5 py-1.5 flex flex-col items-center justify-center border-l border-amber-600/30 min-w-[155px]">
            <OfficialSignatureSvg className="w-20 h-5" />
            <div className="w-28 border-t border-slate-700 pt-0.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-900">
              {signatureLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BACK SIDE — Institutional Directives & Campus Registry
         ============================================================ */}
      <div className="print-card-avoid-break bg-[#fcfcfa] text-slate-900 rounded-2xl border border-slate-300 shadow-xl overflow-hidden relative">
        {/* Top Slate-Forest Strip */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#062e26] to-[#0f172a] text-white px-5 py-3 border-b-2 border-[#d97706] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ExecutiveCrestSvg className="w-11 h-11 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-[15px] font-black leading-tight truncate">{schoolName}</h3>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-300">
                {cardLang === 'bn' ? 'শিক্ষক নিবন্ধন ও পরিচয়পত্র নির্দেশিকা' : 'Official Faculty Registry · Campus Security'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black tracking-wider tabular-nums px-2.5 py-1 border border-amber-500/50 rounded bg-slate-950/60 text-amber-200 shrink-0">
            {profile.teacherCode}
          </span>
        </div>

        {/* Two-Column Crisp Information Grid */}
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-12 gap-5 relative z-10">
          <div className="sm:col-span-7 space-y-2.5">
            <div className="border-b border-slate-200 pb-1 flex items-center justify-between">
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#064e3b]">
                {cardLang === 'bn' ? 'গুরুত্বপূর্ণ নির্দেশনাবলি' : 'Faculty Directives'}
              </h4>
            </div>
            <ul className="space-y-1.5 text-[11px] sm:text-xs font-medium text-slate-800">
              {backDirectives.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-4 h-4 rounded bg-slate-900 text-amber-300 text-[9px] font-black flex items-center justify-center shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-5 space-y-2.5 sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="border-b border-slate-200 pb-1">
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#064e3b]">
                {cardLang === 'bn' ? 'কার্যালয় ও যোগাযোগ' : 'Campus Administration'}
              </h4>
            </div>
            <ul className="space-y-1.5 text-[11px] sm:text-xs font-semibold text-slate-800">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{locationText}</span>
              </li>
              <li className="flex items-center gap-2 tabular-nums">
                <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{settings.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{website}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Back Footer */}
        <div className="flex items-stretch border-t border-amber-600/40 bg-white">
          <div className="bg-gradient-to-r from-[#0f172a] to-[#062e26] text-white px-5 py-2.5 flex-1 flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-black tracking-wide">
              শিক্ষাই আলো, শিক্ষাই শক্তি
            </span>
          </div>
          <div className="bg-[#fcfcfa] px-5 py-1.5 flex flex-col items-center justify-center border-l border-amber-600/30 min-w-[155px]">
            <OfficialSignatureSvg className="w-20 h-5" />
            <div className="w-28 border-t border-slate-700 pt-0.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-900">
              {signatureLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TeacherIdCardModal: React.FC<TeacherIdCardModalProps> = ({
  open,
  onClose,
  teacher,
  teacherIndex = 0,
  allTeachers,
  phoneOverride,
  onSavePhoto,
  onSaveProfile,
}) => {
  const { lang, settings } = useApp();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [cardLang, setCardLang] = useState<'en' | 'bn'>('en');
  const [showCustomize, setShowCustomize] = useState(false);
  const [printAllMode, setPrintAllMode] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teacher.id);
  const [savedToast, setSavedToast] = useState(false);

  const buildProfile = (tc: Teacher, idx: number): TeacherCardProfile => ({
    id: tc.id,
    teacherCode: tc.teacherCode || getTeacherIdCode(tc.id, idx),
    nameEn: tc.name.en || tc.name.bn,
    nameBn: tc.name.bn || tc.name.en,
    designationEn: tc.designation.en || tc.designation.bn,
    designationBn: tc.designation.bn || tc.designation.en,
    subjectEn: tc.subject.en || tc.subject.bn,
    subjectBn: tc.subject.bn || tc.subject.en,
    qualificationEn: tc.qualification.en || tc.qualification.bn,
    qualificationBn: tc.qualification.bn || tc.qualification.en,
    phone: tc.phone || phoneOverride || settings.phone,
    bloodGroup: tc.bloodGroup || '',
    photoUrl: tc.photo || '',
    issueDate: tc.cardIssueDate || '2026-01-15',
    validUpto: tc.cardValidUpto || '2026-12-31',
  });

  const [profile, setProfile] = useState<TeacherCardProfile>(() => buildProfile(teacher, teacherIndex));

  useEffect(() => {
    setPrintAllMode(false);
    setSelectedTeacherId(teacher.id);
    setProfile(buildProfile(teacher, teacherIndex));
    setSavedToast(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    teacher.id,
    teacher.photo,
    teacher.teacherCode,
    teacher.phone,
    teacher.bloodGroup,
    teacher.cardIssueDate,
    teacher.cardValidUpto,
    teacherIndex,
    phoneOverride,
  ]);

  const handleSelectTeacher = (id: string) => {
    setSelectedTeacherId(id);
    if (!allTeachers) return;
    const idx = allTeachers.findIndex((t) => t.id === id);
    if (idx === -1) return;
    setProfile(buildProfile(allTeachers[idx], idx));
  };

  const triggerSavedToast = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2600);
  };

  const handleSaveCardDetails = () => {
    if (onSaveProfile) {
      onSaveProfile({
        id: profile.id,
        teacherCode: profile.teacherCode.trim() || getTeacherIdCode(profile.id, teacherIndex),
        phone: profile.phone.trim(),
        bloodGroup: profile.bloodGroup.trim(),
        issueDate: profile.issueDate.trim() || '2026-01-15',
        validUpto: profile.validUpto.trim() || '2026-12-31',
        photo: profile.photoUrl || undefined,
      });
      triggerSavedToast();
    } else if (onSavePhoto && profile.photoUrl) {
      onSavePhoto(profile.id, profile.photoUrl);
      triggerSavedToast();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 450, 0.8, 420000);
      setProfile((prev) => {
        const next = { ...prev, photoUrl: compressed };
        if (onSaveProfile) {
          onSaveProfile({
            id: next.id,
            teacherCode: next.teacherCode,
            phone: next.phone,
            bloodGroup: next.bloodGroup,
            issueDate: next.issueDate,
            validUpto: next.validUpto,
            photo: compressed,
          });
          triggerSavedToast();
        } else if (onSavePhoto) {
          onSavePhoto(next.id, compressed);
          triggerSavedToast();
        }
        return next;
      });
    } catch {
      // ignore read failure gracefully
    } finally {
      e.target.value = '';
    }
  };

  if (!open) return null;

  const renderList: TeacherCardProfile[] =
    printAllMode && allTeachers && allTeachers.length > 0
      ? allTeachers.map((tc, i) => buildProfile(tc, i))
      : [profile];

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm no-print" onClick={onClose} />

      <div className="relative bg-slate-100 dark:bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Toolbar — strictly Teacher ID Card (Front & Back) only */}
        <div className="no-print flex flex-col gap-3 px-4 sm:px-6 py-3.5 bg-white dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/60 text-amber-200 text-xs font-bold">
              <IdCard className="w-4 h-4 text-amber-400" />
              <span>
                {lang === 'bn'
                  ? 'শিক্ষক আইডি কার্ড (Front & Back)'
                  : 'Teacher ID Card (Front & Back)'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {savedToast && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                  <Check className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'সংরক্ষিত!' : 'Saved!'}
                </span>
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
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
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
                    ? 'bg-slate-900 border-amber-500 text-amber-200'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'তথ্য সম্পাদনা' : 'Edit Info'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/60 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
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

          {/* Faculty Switcher & Batch Print All Teachers */}
          {allTeachers && allTeachers.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <select
                  value={selectedTeacherId}
                  disabled={printAllMode}
                  onChange={(e) => handleSelectTeacher(e.target.value)}
                  className="flex-1 max-w-sm px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-50"
                >
                  {allTeachers.map((tc, idx) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.teacherCode || getTeacherIdCode(tc.id, idx)} · {tc.name.en || tc.name.bn} ({tc.designation.en})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setPrintAllMode((p) => !p)}
                className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 whitespace-nowrap border transition-colors ${
                  printAllMode
                    ? 'bg-slate-900 text-amber-200 border-amber-500'
                    : 'bg-slate-50 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                {printAllMode
                  ? lang === 'bn'
                    ? 'একক শিক্ষক দেখুন'
                    : 'Single Teacher View'
                  : lang === 'bn'
                  ? `সকল শিক্ষকের আইডি কার্ড (${allTeachers.length})`
                  : `All Teachers ID Cards (${allTeachers.length})`}
              </button>
            </div>
          )}

          {/* Edit & Save Faculty Metadata */}
          {showCustomize && (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'শিক্ষক আইডি' : 'Faculty ID'}
                </label>
                <input
                  value={profile.teacherCode}
                  onChange={(e) => setProfile((p) => ({ ...p, teacherCode: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Phone'}
                </label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                </label>
                <input
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile((p) => ({ ...p, bloodGroup: e.target.value }))}
                  placeholder="e.g. O+"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'ইস্যু তারিখ' : 'Issue Date'}
                </label>
                <input
                  type="date"
                  value={profile.issueDate}
                  onChange={(e) => setProfile((p) => ({ ...p, issueDate: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'মেয়াদ উত্তীর্ণ' : 'Valid Upto'}
                </label>
                <input
                  type="date"
                  value={profile.validUpto}
                  onChange={(e) => setProfile((p) => ({ ...p, validUpto: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>
              {(onSaveProfile || onSavePhoto) && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSaveCardDetails}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/70 text-amber-200 font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    {savedToast
                      ? lang === 'bn'
                        ? 'সংরক্ষিত!'
                        : 'Saved!'
                      : lang === 'bn'
                      ? 'তথ্য সেভ'
                      : 'Save Info'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Printable Document */}
        <div
          id="printable-id-admit-card"
          className="p-4 sm:p-8 print:p-0 overflow-y-auto print:overflow-visible flex-1 bg-slate-100 dark:bg-slate-950/60 print:bg-white"
        >
          <div className="space-y-6 print:space-y-4">
            {renderList.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className={idx < renderList.length - 1 ? 'print-page-break' : undefined}
              >
                <TeacherIdCardPairDocument
                  profile={item}
                  cardLang={cardLang}
                  settings={settings}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
