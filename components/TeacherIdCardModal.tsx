import * as React from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  IdCard,
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

export interface TeacherIdCardModalProps {
  open: boolean;
  onClose: () => void;
  teacher: Teacher;
  teacherIndex?: number;
  allTeachers?: Teacher[];
  phoneOverride?: string;
  onSavePhoto?: (teacherId: string, photoDataUrl: string) => void;
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

const RBMBCrestSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#065f46" strokeWidth="4" />
    <circle cx="60" cy="60" r="47" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3 2" />
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
    <path
      d="M39 36 H81 V64 C81 78, 60 88, 60 88 C60 88, 39 78, 39 64 Z"
      fill="#ecfdf5"
      stroke="#065f46"
      strokeWidth="2.5"
    />
    <path
      d="M44 64 Q52 59 60 64 Q68 59 76 64 V75 Q68 70 60 75 Q52 70 44 75 Z"
      fill="#ffffff"
      stroke="#0284c7"
      strokeWidth="2"
    />
    <rect x="58" y="45" width="4" height="17" rx="1.5" fill="#b45309" />
    <path d="M60 33 C65 39, 64 45, 60 46 C56 45, 55 39, 60 33 Z" fill="#f97316" />
    <path d="M60 37 C62.5 40, 62 44, 60 44.5 C58 44, 57.5 40, 60 37 Z" fill="#facc15" />
    <path d="M32 92 Q60 101 88 92 L85 99 Q60 108 35 99 Z" fill="#065f46" />
    <text x="60" y="99" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800" letterSpacing="0.8">
      RBMB · EST 1958
    </text>
  </svg>
);

const OfficialSignatureSvg: React.FC<{ className?: string }> = ({ className = 'w-20 h-6' }) => (
  <svg viewBox="0 0 140 44" className={className} aria-hidden="true">
    <path
      d="M14 31 C20 12, 34 9, 32 27 C31 35, 19 34, 24 23 C28 15, 42 29, 49 23 C54 18, 56 30, 64 25 C71 20, 74 28, 84 22 C93 17, 102 25, 124 21"
      fill="none"
      stroke="#0f172a"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TeacherPhotoFrame: React.FC<{
  photoUrl?: string;
  teacherName: string;
  className?: string;
}> = ({ photoUrl, teacherName, className = 'w-24 sm:w-[108px] aspect-[3/4]' }) => {
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
          alt={teacherName}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-lg overflow-hidden border-2 border-emerald-800 bg-gradient-to-b from-[#0ea5e9] to-[#0369a1] shrink-0 shadow-sm flex items-end justify-center`}
    >
      <svg viewBox="0 0 120 155" className="w-full h-full" aria-label={teacherName}>
        <rect width="120" height="155" fill="#0ea5e9" />
        <circle cx="60" cy="54" r="23" fill="#fde68a" />
        <path
          d="M37 51 C37 31, 83 31, 83 51 C78 40, 68 37, 60 38 C50 37, 41 41, 37 51 Z"
          fill="#0f172a"
        />
        {/* Formal blazer & collar */}
        <path d="M16 155 C18 114, 39 102, 60 102 C81 102, 102 114, 104 155 Z" fill="#1e293b" />
        <polygon points="48,103 60,129 72,103" fill="#ffffff" />
        <polygon points="56,109 64,109 65,146 60,154 55,146" fill="#065f46" />
      </svg>
    </div>
  );
};

const QrBadge: React.FC<{
  payload: string;
  caption: string;
  sizeClass?: string;
}> = ({ payload, caption, sizeClass = 'w-16 h-16 sm:w-[70px] sm:h-[70px]' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
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
    <div className="flex flex-col items-center justify-center shrink-0">
      <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
        {dataUrl ? (
          <img src={dataUrl} alt={caption} className={`${sizeClass} object-contain block`} />
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
  const rawName = cardLang === 'bn' ? settings.name.bn : settings.name.en;
  const hasTag = rawName.includes('RBMB') || rawName.includes('আরবিএমবি');
  const schoolName = hasTag
    ? rawName
    : `${rawName} (${cardLang === 'bn' ? 'আরবিএমবি' : 'RBMB'})`;
  const locationText = cardLang === 'bn' ? settings.location.bn : settings.location.en;
  const authorityTitle = cardLang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher';
  const website = 'www.rbmb-campus.edu.bd';
  return { schoolName, locationText, authorityTitle, website };
}

const TeacherIdCardPairDocument: React.FC<{
  profile: TeacherCardProfile;
  cardLang: 'en' | 'bn';
  settings: SchoolSettings;
}> = ({ profile, cardLang, settings }) => {
  const { schoolName, locationText, authorityTitle, website } = getSchoolHeaderInfo(
    settings,
    cardLang
  );

  const displayName = cardLang === 'bn' ? profile.nameBn : profile.nameEn;
  const displayDesig = cardLang === 'bn' ? profile.designationBn : profile.designationEn;
  const displaySubject = cardLang === 'bn' ? profile.subjectBn : profile.subjectEn;
  const displayQual = cardLang === 'bn' ? profile.qualificationBn : profile.qualificationEn;

  const isHeadTeacher =
    profile.designationEn.toLowerCase().includes('head teacher') &&
    !profile.designationEn.toLowerCase().includes('assistant');
  const signatureLabel = isHeadTeacher
    ? cardLang === 'bn'
      ? 'সভাপতি / কর্তৃপক্ষ'
      : 'School Authority'
    : authorityTitle;

  const qrPayload = [
    'RBMB TEACHER ID CARD',
    `ID:${profile.teacherCode}`,
    `Name:${profile.nameEn}`,
    `Desig:${profile.designationEn}`,
    `Subject:${profile.subjectEn}`,
    `Phone:${profile.phone}`,
    `Valid:${profile.validUpto}`,
    `EIIN:${settings.eiin}`,
  ].join('|');

  const backInstructions =
    cardLang === 'bn'
      ? [
          'এই পরিচয়পত্রটি শুধুমাত্র আরবিএমবি শিক্ষকমণ্ডলীর প্রাতিষ্ঠানিক ব্যবহারের জন্য।',
          'বিদ্যালয় প্রাঙ্গণ ও দাপ্তরিক কাজে কার্ডটি সাথে রাখার জন্য অনুরোধ করা হলো।',
          'কার্ডটি হারিয়ে গেলে দ্রুত বিদ্যালয় অফিসে অবহিত করুন।',
          'এই কার্ডটি হস্তান্তরযোগ্য নয় এবং বিদ্যালয়ের সম্পত্তি।',
        ]
      : [
          'This ID Card is officially issued for RBMB faculty use only.',
          'Please carry this card during campus hours and school duties.',
          'Report loss immediately to the school office.',
          'This card is non-transferable and property of the school.',
        ];

  return (
    <div className="max-w-[540px] mx-auto space-y-6 font-sans">
      {/* FRONT SIDE */}
      <div className="print-card-avoid-break bg-white text-slate-900 rounded-2xl border border-emerald-700/40 shadow-lg overflow-hidden relative">
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
              <p className="text-[11px] sm:text-xs font-semibold opacity-95 mt-0.5">
                {locationText}
              </p>
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
              {cardLang === 'bn' ? 'শিক্ষক পরিচয়পত্র (Teacher ID Card)' : 'Teacher ID Card'}
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:gap-4">
            <TeacherPhotoFrame
              photoUrl={profile.photoUrl}
              teacherName={displayName}
              className="w-24 sm:w-[108px] aspect-[3/4]"
            />

            <div className="flex-1 min-w-0 text-[11px] sm:text-xs">
              <table className="w-full border-collapse">
                <tbody>
                  {[
                    [cardLang === 'bn' ? 'শিক্ষকের নাম' : 'Teacher Name', displayName, true],
                    [cardLang === 'bn' ? 'শিক্ষক আইডি' : 'Teacher ID', profile.teacherCode, true],
                    [cardLang === 'bn' ? 'পদবি' : 'Designation', displayDesig, false],
                    [cardLang === 'bn' ? 'বিষয় / বিভাগ' : 'Department', displaySubject, false],
                    [cardLang === 'bn' ? 'যোগ্যতা' : 'Qualification', displayQual, false],
                    [cardLang === 'bn' ? 'মোবাইল' : 'Phone', profile.phone, false],
                    ...(profile.bloodGroup.trim()
                      ? [[cardLang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group', profile.bloodGroup, true]]
                      : [[cardLang === 'bn' ? 'ইআইআইএন' : 'School EIIN', settings.eiin, false]]),
                  ].map(([label, val, bold], idx) => (
                    <tr key={idx}>
                      <td className="py-[1.5px] pr-1.5 font-semibold text-slate-800 whitespace-nowrap w-[88px] sm:w-[98px]">
                        {label}
                      </td>
                      <td className="py-[1.5px] pr-1.5 font-bold text-slate-700 w-2">:</td>
                      <td
                        className={`py-[1.5px] tabular-nums truncate max-w-[175px] ${
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
              caption={cardLang === 'bn' ? 'যাচাই করুন' : 'Verify Faculty'}
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
                {cardLang === 'bn' ? 'ইস্যু তারিখ:' : 'Issue Date:'}{' '}
                {formatDisplayDate(profile.issueDate)}
              </p>
              <p>
                {cardLang === 'bn' ? 'মেয়াদ উত্তীর্ণ:' : 'Valid Upto:'}{' '}
                {formatDisplayDate(profile.validUpto)}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <OfficialSignatureSvg className="w-20 h-6" />
              <div className="w-28 border-t border-slate-800 pt-0.5 text-[11px] font-extrabold text-slate-900">
                {signatureLabel}
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

        <div className="relative z-10 px-5 py-3 grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-7 space-y-2">
            <div className="inline-block px-4 py-1 rounded-full bg-[#064e2b] text-white text-xs font-extrabold">
              {cardLang === 'bn' ? 'গুরুত্বপূর্ণ নির্দেশনা:' : 'Important Instructions:'}
            </div>
            <ul className="space-y-1.5 text-[11px] sm:text-xs font-medium text-slate-900">
              {backInstructions.map((line, i) => (
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
              <OfficialSignatureSvg className="w-20 h-6" />
              <div className="w-28 border-t border-slate-800 pt-0.5 text-[11px] font-extrabold text-slate-900">
                {signatureLabel}
              </div>
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
    teacherCode: getTeacherIdCode(tc.id, idx),
    nameEn: tc.name.en || tc.name.bn,
    nameBn: tc.name.bn || tc.name.en,
    designationEn: tc.designation.en || tc.designation.bn,
    designationBn: tc.designation.bn || tc.designation.en,
    subjectEn: tc.subject.en || tc.subject.bn,
    subjectBn: tc.subject.bn || tc.subject.en,
    qualificationEn: tc.qualification.en || tc.qualification.bn,
    qualificationBn: tc.qualification.bn || tc.qualification.en,
    phone: phoneOverride || settings.phone,
    bloodGroup: '',
    photoUrl: tc.photo || '',
    issueDate: '2026-01-15',
    validUpto: '2026-12-31',
  });

  const [profile, setProfile] = useState<TeacherCardProfile>(() => buildProfile(teacher, teacherIndex));

  useEffect(() => {
    setPrintAllMode(false);
    setSelectedTeacherId(teacher.id);
    setProfile(buildProfile(teacher, teacherIndex));
    setSavedToast(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, teacher.id, teacher.photo, teacherIndex, phoneOverride]);

  const handleSelectTeacher = (id: string) => {
    setSelectedTeacherId(id);
    if (!allTeachers) return;
    const idx = allTeachers.findIndex((t) => t.id === id);
    if (idx === -1) return;
    setProfile(buildProfile(allTeachers[idx], idx));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 360, 0.82);
      setProfile((prev) => ({ ...prev, photoUrl: compressed }));
      if (onSavePhoto) {
        onSavePhoto(profile.id, compressed);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
      }
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
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm no-print" onClick={onClose} />

      <div className="relative bg-slate-100 dark:bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Toolbar — strictly Teacher ID Card (Front & Back) only */}
        <div className="no-print flex flex-col gap-3 px-4 sm:px-6 py-3.5 bg-white dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold">
              <IdCard className="w-4 h-4" />
              <span>
                {lang === 'bn'
                  ? 'শিক্ষক আইডি কার্ড (Front & Back)'
                  : 'Teacher ID Card (Front & Back)'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                {savedToast ? (lang === 'bn' ? 'সেভ হয়েছে!' : 'Saved!') : lang === 'bn' ? 'ছবি দিন' : 'Photo'}
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

          {/* Faculty Switcher & Batch Print All Teachers */}
          {allTeachers && allTeachers.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <Users className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <select
                  value={selectedTeacherId}
                  disabled={printAllMode}
                  onChange={(e) => handleSelectTeacher(e.target.value)}
                  className="flex-1 max-w-sm px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-50"
                >
                  {allTeachers.map((tc, idx) => (
                    <option key={tc.id} value={tc.id}>
                      {getTeacherIdCode(tc.id, idx)} · {tc.name.en || tc.name.bn} ({tc.designation.en})
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
                    ? 'একক শিক্ষক দেখুন'
                    : 'Single Teacher View'
                  : lang === 'bn'
                  ? `সকল শিক্ষকের আইডি কার্ড (${allTeachers.length})`
                  : `All Teachers ID Cards (${allTeachers.length})`}
              </button>
            </div>
          )}

          {/* Optional Quick Edit Fields */}
          {showCustomize && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {lang === 'bn' ? 'শিক্ষক আইডি' : 'Teacher ID'}
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
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={profile.validUpto}
                    onChange={(e) => setProfile((p) => ({ ...p, validUpto: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                  {onSavePhoto && profile.photoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        onSavePhoto(profile.id, profile.photoUrl!);
                        setSavedToast(true);
                        setTimeout(() => setSavedToast(false), 2500);
                      }}
                      title={lang === 'bn' ? 'ছবি সংরক্ষণ' : 'Save Photo'}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Printable Document */}
        <div
          id="printable-id-admit-card"
          className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950/60"
        >
          <div className="space-y-8">
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
