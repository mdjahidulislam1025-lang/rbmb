import { SchoolSettings, Teacher } from '../types';

export const SCHOOL_CLASS_IDS = ['6', '7', '8', '9', '10'] as const;
export type SchoolClassId = (typeof SCHOOL_CLASS_IDS)[number];

export interface CanonicalSubjectMeta {
  id: string;
  bn: string;
  en: string;
}

export const CANONICAL_SUBJECTS: CanonicalSubjectMeta[] = [
  { id: 'Bangla', bn: 'বাংলা', en: 'Bangla' },
  { id: 'English', bn: 'ইংরেজি', en: 'English' },
  { id: 'Mathematics', bn: 'গণিত (৬ষ্ঠ–৯ম)', en: 'Mathematics (6–9)' },
  { id: 'General Math', bn: 'সাধারণ গণিত (১০ম)', en: 'General Math (10)' },
  { id: 'Science', bn: 'বিজ্ঞান (৬ষ্ঠ–৮ম)', en: 'Science (6–8)' },
  { id: 'Physics', bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
  { id: 'Chemistry', bn: 'রসায়ন', en: 'Chemistry' },
  { id: 'Biology', bn: 'জীববিজ্ঞান', en: 'Biology' },
  { id: 'ICT', bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT' },
];

export interface TeacherMatchTarget {
  userId?: string;
  name?: string;
  phone?: string;
  designation?: string;
  subject?: string;
  assignedClass?: string;
  teachingClasses?: string[];
  teachingSubjects?: string[];
  role?: string | null;
}

export function isHeadTeacherDesignation(text?: string): boolean {
  if (!text) return false;
  const norm = text.trim().toLowerCase();
  if (!norm) return false;
  // Explicitly exclude Assistant Head / Vice Principal roles
  if (/সহকারী\s*প্রধান|assistant\s*head|vice\s*principal/.test(norm)) {
    return false;
  }
  return /প্রধান\s*শিক্ষক|head\s*teacher|headmaster|headmistress|principal/.test(norm);
}

export function findMatchingTeacher(
  teachers: Teacher[],
  target?: TeacherMatchTarget | null
): Teacher | undefined {
  if (!target) return undefined;
  const uid = (target.userId || '').trim().toLowerCase();
  const uName = (target.name || '').trim().toLowerCase();
  const uPhoneDigits = (target.phone || '').replace(/\D/g, '').slice(-10);

  return teachers.find((tc) => {
    if (
      uid &&
      (tc.id.toLowerCase() === uid ||
        tc.id.toLowerCase() === `tc-${uid}` ||
        (tc.teacherCode || '').toLowerCase() === uid)
    ) {
      return true;
    }
    if (uPhoneDigits.length >= 6) {
      const tDigits = (tc.phone || '').replace(/\D/g, '').slice(-10);
      if (tDigits && tDigits === uPhoneDigits) return true;
    }
    if (
      uName &&
      (tc.name.en.trim().toLowerCase() === uName || tc.name.bn.trim().toLowerCase() === uName)
    ) {
      return true;
    }
    return false;
  });
}

export function isHeadTeacherUser(
  user: TeacherMatchTarget | null | undefined,
  teachers: Teacher[],
  settings?: SchoolSettings
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;

  if ((user.userId || '').trim().toLowerCase() === 'headteacher') return true;
  if (isHeadTeacherDesignation(user.designation)) return true;

  const matched = findMatchingTeacher(teachers, user);
  if (
    matched &&
    (isHeadTeacherDesignation(matched.designation?.bn) ||
      isHeadTeacherDesignation(matched.designation?.en))
  ) {
    return true;
  }

  const uName = (user.name || '').trim().toLowerCase();
  if (uName && settings?.headTeacherName) {
    const hBn = (settings.headTeacherName.bn || '').trim().toLowerCase();
    const hEn = (settings.headTeacherName.en || '').trim().toLowerCase();
    if ((hBn && uName === hBn) || (hEn && uName === hEn)) {
      return true;
    }
  }

  return false;
}

export function normalizeTeachingClasses(classes?: string[] | null): SchoolClassId[] {
  if (!Array.isArray(classes)) return [];
  const validSet = new Set<SchoolClassId>();
  classes.forEach((c) => {
    const clean = String(c || '').trim() as SchoolClassId;
    if ((SCHOOL_CLASS_IDS as readonly string[]).includes(clean)) {
      validSet.add(clean);
    }
  });
  return SCHOOL_CLASS_IDS.filter((cid) => validSet.has(cid));
}

export function normalizeTeachingSubjects(subjects?: string[] | null): string[] {
  if (!Array.isArray(subjects)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  subjects.forEach((s) => {
    const clean = String(s || '').trim().slice(0, 64);
    if (!clean) return;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(clean);
    }
  });
  return out;
}

export function inferCanonicalSubjectsFromText(subjectText?: string): string[] {
  const raw = (subjectText || '').trim().toLowerCase();
  if (!raw) return [];
  const matched = new Set<string>();

  if (/bangla|বাংলা/.test(raw)) matched.add('Bangla');
  if (/english|ইংরেজি/.test(raw)) matched.add('English');
  if (/general\s*math|সাধারণ\s*গণিত/.test(raw)) {
    matched.add('General Math');
    matched.add('Mathematics');
  } else if (/math|mathematics|গণিত/.test(raw)) {
    matched.add('Mathematics');
    matched.add('General Math');
  }
  if (/physics|পদার্থ/.test(raw)) matched.add('Physics');
  if (/chemistry|রসায়ন|রসায়ন/.test(raw)) matched.add('Chemistry');
  if (/biology|জীববিজ্ঞান|জীব বিজ্ঞান/.test(raw)) matched.add('Biology');
  if (/science|বিজ্ঞান/.test(raw)) {
    // Only auto-add Science if not exclusively Physics/Chemistry/Biology OR include Science alongside them
    matched.add('Science');
  }
  if (/\bict\b|তথ্য ও যোগাযোগ|আইসিটি|computer/.test(raw)) matched.add('ICT');

  return Array.from(matched);
}

export function resolveTeacherAssignedClass(
  matchedTeacher?: Teacher | null,
  user?: TeacherMatchTarget | null
): string {
  const raw =
    matchedTeacher && matchedTeacher.assignedClass !== undefined
      ? matchedTeacher.assignedClass
      : user?.assignedClass || '';
  const clean = (raw || '').trim();
  return (SCHOOL_CLASS_IDS as readonly string[]).includes(clean) ? clean : '';
}

export function resolveTeacherTeachingClasses(
  matchedTeacher?: Teacher | null,
  user?: TeacherMatchTarget | null
): SchoolClassId[] {
  const assigned = resolveTeacherAssignedClass(matchedTeacher, user);

  let base: SchoolClassId[];
  if (matchedTeacher && matchedTeacher.teachingClasses !== undefined) {
    base = normalizeTeachingClasses(matchedTeacher.teachingClasses);
  } else if (user && user.teachingClasses !== undefined) {
    base = normalizeTeachingClasses(user.teachingClasses);
  } else {
    // Default: teachers can take classes across all classes until Admin / Head Teacher narrows them
    base = [...SCHOOL_CLASS_IDS];
  }

  if (assigned && !base.includes(assigned as SchoolClassId)) {
    base = SCHOOL_CLASS_IDS.filter((c) => c === assigned || base.includes(c));
  }
  return base;
}

export function resolveTeacherAllowedSubjects(
  matchedTeacher?: Teacher | null,
  user?: TeacherMatchTarget | null
): string[] {
  if (matchedTeacher && Array.isArray(matchedTeacher.teachingSubjects)) {
    return normalizeTeachingSubjects(matchedTeacher.teachingSubjects);
  }
  if (user && Array.isArray(user.teachingSubjects)) {
    return normalizeTeachingSubjects(user.teachingSubjects);
  }
  const combinedText = [
    matchedTeacher?.subject?.en,
    matchedTeacher?.subject?.bn,
    user?.subject,
  ]
    .filter(Boolean)
    .join(' | ');
  return inferCanonicalSubjectsFromText(combinedText);
}

export function isSubjectMatched(subject: string, allowedSubjects: string[]): boolean {
  const target = (subject || '').trim().toLowerCase();
  if (!target) return false;
  return allowedSubjects.some((allowed) => {
    const a = allowed.trim().toLowerCase();
    if (!a) return false;
    if (a === target) return true;
    // Allow Mathematics <-> General Math equivalence if user has either from text/legacy
    if (
      (a === 'mathematics' && target === 'general math') ||
      (a === 'general math' && target === 'mathematics')
    ) {
      return true;
    }
    return false;
  });
}
