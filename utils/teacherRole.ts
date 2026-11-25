import { SchoolSettings, StudyGroup, Teacher } from '../types';

export const SCHOOL_CLASS_IDS = ['6', '7', '8', '9', '10'] as const;
export type SchoolClassId = (typeof SCHOOL_CLASS_IDS)[number];

export type Class910GroupId = 'Science' | 'Humanities' | 'Business Studies';
export type SubjectCategory = 'common' | 'science' | 'humanities' | 'business';

export interface CanonicalSubjectMeta {
  id: string;
  code: string;
  bn: string;
  en: string;
  category: SubjectCategory;
  totalMarks?: number;
}

export interface ClassGroupMeta {
  id: Class910GroupId;
  bn: string;
  en: string;
}

export const CLASS_9_10_GROUPS: ClassGroupMeta[] = [
  { id: 'Science', bn: 'বিজ্ঞান বিভাগ (Science)', en: 'Science' },
  { id: 'Humanities', bn: 'মানবিক বিভাগ (Humanities)', en: 'Humanities' },
  { id: 'Business Studies', bn: 'ব্যবসায় শিক্ষা বিভাগ (Business Studies)', en: 'Business Studies' },
];

export const CANONICAL_SUBJECTS: CanonicalSubjectMeta[] = [
  // Common / Class 6-8 & 9-10 Compulsory
  { id: 'Bangla', code: '101', bn: 'বাংলা (৬ষ্ঠ–৮ম)', en: 'Bangla (6–8)', category: 'common', totalMarks: 100 },
  { id: 'Bangla 1st Paper', code: '101', bn: 'বাংলা ১ম পত্র (৯ম–১০ম)', en: 'Bangla 1st Paper (9–10)', category: 'common', totalMarks: 100 },
  { id: 'Bangla 2nd Paper', code: '102', bn: 'বাংলা ২য় পত্র (৯ম–১০ম)', en: 'Bangla 2nd Paper (9–10)', category: 'common', totalMarks: 100 },
  { id: 'English', code: '107', bn: 'ইংরেজি (৬ষ্ঠ–৮ম)', en: 'English (6–8)', category: 'common', totalMarks: 100 },
  { id: 'English 1st Paper', code: '107', bn: 'ইংরেজি ১ম পত্র (৯ম–১০ম)', en: 'English 1st Paper (9–10)', category: 'common', totalMarks: 100 },
  { id: 'English 2nd Paper', code: '108', bn: 'ইংরেজি ২য় পত্র (৯ম–১০ম)', en: 'English 2nd Paper (9–10)', category: 'common', totalMarks: 100 },
  { id: 'Mathematics', code: '109', bn: 'গণিত / সাধারণ গণিত', en: 'Mathematics', category: 'common', totalMarks: 100 },
  { id: 'Science', code: '127', bn: 'বিজ্ঞান / সাধারণ বিজ্ঞান', en: 'Science', category: 'common', totalMarks: 100 },
  { id: 'Bangladesh & Global Studies', code: '150', bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'Bangladesh & Global Studies', category: 'common', totalMarks: 100 },
  { id: 'ICT', code: '154', bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT', category: 'common', totalMarks: 50 },
  { id: 'Religion & Moral Education', code: '111', bn: 'ধর্ম ও নৈতিক শিক্ষা', en: 'Religion & Moral Education', category: 'common', totalMarks: 100 },
  { id: 'Agriculture Studies', code: '134', bn: 'কৃষিশিক্ষা', en: 'Agriculture Studies', category: 'common', totalMarks: 100 },
  { id: 'Home Science', code: '151', bn: 'গার্হস্থ্য বিজ্ঞান', en: 'Home Science', category: 'common', totalMarks: 100 },
  { id: 'Physical Education & Health', code: '147', bn: 'শারীরিক শিক্ষা ও স্বাস্থ্য', en: 'Physical Education & Health', category: 'common', totalMarks: 50 },
  { id: 'Arts & Crafts', code: '148', bn: 'চারু ও কারুকলা (৬ষ্ঠ–৮ম)', en: 'Arts & Crafts (6–8)', category: 'common', totalMarks: 50 },
  { id: 'Career Education', code: '156', bn: 'ক্যারিয়ার শিক্ষা (৯ম–১০ম)', en: 'Career Education (9–10)', category: 'common', totalMarks: 50 },

  // Science Group (9-10)
  { id: 'Physics', code: '136', bn: 'পদার্থবিজ্ঞান (বিজ্ঞান)', en: 'Physics', category: 'science', totalMarks: 100 },
  { id: 'Chemistry', code: '137', bn: 'রসায়ন (বিজ্ঞান)', en: 'Chemistry', category: 'science', totalMarks: 100 },
  { id: 'Biology', code: '138', bn: 'জীববিজ্ঞান (বিজ্ঞান)', en: 'Biology', category: 'science', totalMarks: 100 },
  { id: 'Higher Mathematics', code: '126', bn: 'উচ্চতর গণিত (বিজ্ঞান)', en: 'Higher Mathematics', category: 'science', totalMarks: 100 },

  // Humanities Group (9-10)
  { id: 'History of Bangladesh & World Civilization', code: '153', bn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (মানবিক)', en: 'History of Bangladesh & World Civilization', category: 'humanities', totalMarks: 100 },
  { id: 'Geography & Environment', code: '110', bn: 'ভূগোল ও পরিবেশ (মানবিক)', en: 'Geography & Environment', category: 'humanities', totalMarks: 100 },
  { id: 'Civics & Citizenship', code: '140', bn: 'পৌরনীতি ও নাগরিকতা (মানবিক)', en: 'Civics & Citizenship', category: 'humanities', totalMarks: 100 },
  { id: 'Economics', code: '141', bn: 'অর্থনীতি (মানবিক)', en: 'Economics', category: 'humanities', totalMarks: 100 },

  // Business Studies Group (9-10)
  { id: 'Accounting', code: '146', bn: 'হিসাববিজ্ঞান (ব্যবসায় শিক্ষা)', en: 'Accounting', category: 'business', totalMarks: 100 },
  { id: 'Finance & Banking', code: '152', bn: 'ফিন্যান্স ও ব্যাংকিং (ব্যবসায় শিক্ষা)', en: 'Finance & Banking', category: 'business', totalMarks: 100 },
  { id: 'Business Entrepreneurship', code: '143', bn: 'ব্যবসায় উদ্যোগ (ব্যবসায় শিক্ষা)', en: 'Business Entrepreneurship', category: 'business', totalMarks: 100 },
];

export interface NctbSubjectEntry {
  id: string;
  code: string;
  bn: string;
  en: string;
  group: StudyGroup;
  totalMarks: number;
}

// Class 6, 7, 8 — Identical NCTB approved subjects
export const NCTB_JUNIOR_SUBJECTS: NctbSubjectEntry[] = [
  { id: 'Bangla', code: '101', bn: 'বাংলা', en: 'Bangla', group: 'Common', totalMarks: 100 },
  { id: 'English', code: '107', bn: 'ইংরেজি', en: 'English', group: 'Common', totalMarks: 100 },
  { id: 'Mathematics', code: '109', bn: 'গণিত', en: 'Mathematics', group: 'Common', totalMarks: 100 },
  { id: 'Science', code: '127', bn: 'বিজ্ঞান', en: 'Science', group: 'Common', totalMarks: 100 },
  { id: 'Bangladesh & Global Studies', code: '150', bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'Bangladesh & Global Studies', group: 'Common', totalMarks: 100 },
  { id: 'ICT', code: '154', bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT', group: 'Common', totalMarks: 50 },
  { id: 'Religion & Moral Education', code: '111', bn: 'ধর্ম ও নৈতিক শিক্ষা', en: 'Religion & Moral Education', group: 'Common', totalMarks: 100 },
  { id: 'Agriculture Studies', code: '134', bn: 'কৃষিশিক্ষা', en: 'Agriculture Studies', group: 'Common', totalMarks: 100 },
  { id: 'Home Science', code: '151', bn: 'গার্হস্থ্য বিজ্ঞান', en: 'Home Science', group: 'Common', totalMarks: 100 },
  { id: 'Physical Education & Health', code: '147', bn: 'শারীরিক শিক্ষা ও স্বাস্থ্য', en: 'Physical Education & Health', group: 'Common', totalMarks: 50 },
  { id: 'Arts & Crafts', code: '148', bn: 'চারু ও কারুকলা', en: 'Arts & Crafts', group: 'Common', totalMarks: 50 },
];

// Class 9 & 10 — Group-wise NCTB SSC subjects
export const NCTB_SECONDARY_COMMON_SUBJECTS: NctbSubjectEntry[] = [
  { id: 'Bangla 1st Paper', code: '101', bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper', group: 'Common', totalMarks: 100 },
  { id: 'Bangla 2nd Paper', code: '102', bn: 'বাংলা ২য় পত্র', en: 'Bangla 2nd Paper', group: 'Common', totalMarks: 100 },
  { id: 'English 1st Paper', code: '107', bn: 'ইংরেজি ১ম পত্র', en: 'English 1st Paper', group: 'Common', totalMarks: 100 },
  { id: 'English 2nd Paper', code: '108', bn: 'ইংরেজি ২য় পত্র', en: 'English 2nd Paper', group: 'Common', totalMarks: 100 },
  { id: 'Mathematics', code: '109', bn: 'সাধারণ গণিত', en: 'Mathematics', group: 'Common', totalMarks: 100 },
  { id: 'ICT', code: '154', bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT', group: 'Common', totalMarks: 50 },
  { id: 'Religion & Moral Education', code: '111', bn: 'ধর্ম ও নৈতিক শিক্ষা', en: 'Religion & Moral Education', group: 'Common', totalMarks: 100 },
  { id: 'Physical Education & Health', code: '147', bn: 'শারীরিক শিক্ষা, স্বাস্থ্য বিজ্ঞান ও খেলাধুলা', en: 'Physical Education & Health', group: 'Common', totalMarks: 50 },
  { id: 'Career Education', code: '156', bn: 'ক্যারিয়ার শিক্ষা', en: 'Career Education', group: 'Common', totalMarks: 50 },
];

export const NCTB_SECONDARY_GROUP_SUBJECTS: Record<Class910GroupId, NctbSubjectEntry[]> = {
  Science: [
    { id: 'Physics', code: '136', bn: 'পদার্থবিজ্ঞান', en: 'Physics', group: 'Science', totalMarks: 100 },
    { id: 'Chemistry', code: '137', bn: 'রসায়ন', en: 'Chemistry', group: 'Science', totalMarks: 100 },
    { id: 'Biology', code: '138', bn: 'জীববিজ্ঞান', en: 'Biology', group: 'Science', totalMarks: 100 },
    { id: 'Higher Mathematics', code: '126', bn: 'উচ্চতর গণিত (৪র্থ বিষয়)', en: 'Higher Mathematics (Optional)', group: 'Science', totalMarks: 100 },
    { id: 'Bangladesh & Global Studies', code: '150', bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'Bangladesh & Global Studies', group: 'Science', totalMarks: 100 },
    { id: 'Agriculture Studies', code: '134', bn: 'কৃষিশিক্ষা (৪র্থ বিষয়)', en: 'Agriculture Studies (Optional)', group: 'Science', totalMarks: 100 },
    { id: 'Home Science', code: '151', bn: 'গার্হস্থ্য বিজ্ঞান (৪র্থ বিষয়)', en: 'Home Science (Optional)', group: 'Science', totalMarks: 100 },
  ],
  Humanities: [
    { id: 'History of Bangladesh & World Civilization', code: '153', bn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', en: 'History of Bangladesh & World Civilization', group: 'Humanities', totalMarks: 100 },
    { id: 'Geography & Environment', code: '110', bn: 'ভূগোল ও পরিবেশ', en: 'Geography & Environment', group: 'Humanities', totalMarks: 100 },
    { id: 'Civics & Citizenship', code: '140', bn: 'পৌরনীতি ও নাগরিকতা', en: 'Civics & Citizenship', group: 'Humanities', totalMarks: 100 },
    { id: 'Economics', code: '141', bn: 'অর্থনীতি', en: 'Economics', group: 'Humanities', totalMarks: 100 },
    { id: 'Science', code: '127', bn: 'সাধারণ বিজ্ঞান', en: 'General Science', group: 'Humanities', totalMarks: 100 },
    { id: 'Agriculture Studies', code: '134', bn: 'কৃষিশিক্ষা (৪র্থ বিষয়)', en: 'Agriculture Studies (Optional)', group: 'Humanities', totalMarks: 100 },
    { id: 'Home Science', code: '151', bn: 'গার্হস্থ্য বিজ্ঞান (৪র্থ বিষয়)', en: 'Home Science (Optional)', group: 'Humanities', totalMarks: 100 },
  ],
  'Business Studies': [
    { id: 'Accounting', code: '146', bn: 'হিসাববিজ্ঞান', en: 'Accounting', group: 'Business Studies', totalMarks: 100 },
    { id: 'Finance & Banking', code: '152', bn: 'ফিন্যান্স ও ব্যাংকিং', en: 'Finance & Banking', group: 'Business Studies', totalMarks: 100 },
    { id: 'Business Entrepreneurship', code: '143', bn: 'ব্যবসায় উদ্যোগ', en: 'Business Entrepreneurship', group: 'Business Studies', totalMarks: 100 },
    { id: 'Science', code: '127', bn: 'সাধারণ বিজ্ঞান', en: 'General Science', group: 'Business Studies', totalMarks: 100 },
    { id: 'Agriculture Studies', code: '134', bn: 'কৃষিশিক্ষা (৪র্থ বিষয়)', en: 'Agriculture Studies (Optional)', group: 'Business Studies', totalMarks: 100 },
    { id: 'Home Science', code: '151', bn: 'গার্হস্থ্য বিজ্ঞান (৪র্থ বিষয়)', en: 'Home Science (Optional)', group: 'Business Studies', totalMarks: 100 },
  ],
};

export function normalizeClassGroup(raw?: string | null): Class910GroupId | null {
  const norm = (raw || '').trim().toLowerCase();
  if (!norm) return null;
  if (/science|বিজ্ঞান/.test(norm)) return 'Science';
  if (/humanities|arts|মানবিক/.test(norm)) return 'Humanities';
  if (/business|commerce|ব্যবসায়|ব্যবসা|কমার্স/.test(norm)) return 'Business Studies';
  return null;
}

export function getNctbSubjectsForClass(
  classId: string,
  group?: Class910GroupId | 'Common' | 'all' | string | null
): NctbSubjectEntry[] {
  const cid = String(classId || '').trim();
  if (cid === '6' || cid === '7' || cid === '8') {
    return NCTB_JUNIOR_SUBJECTS;
  }
  if (cid === '9' || cid === '10') {
    if (group === 'Common') {
      return NCTB_SECONDARY_COMMON_SUBJECTS;
    }
    const normalizedGroup = normalizeClassGroup(group || '');
    if (normalizedGroup) {
      return [
        ...NCTB_SECONDARY_COMMON_SUBJECTS,
        ...NCTB_SECONDARY_GROUP_SUBJECTS[normalizedGroup],
      ];
    }
    // All groups combined, deduplicating shared elective IDs while keeping group specificity clean
    const seen = new Set<string>();
    const combined: NctbSubjectEntry[] = [];
    [
      ...NCTB_SECONDARY_COMMON_SUBJECTS,
      ...NCTB_SECONDARY_GROUP_SUBJECTS.Science,
      ...NCTB_SECONDARY_GROUP_SUBJECTS.Humanities,
      ...NCTB_SECONDARY_GROUP_SUBJECTS['Business Studies'],
    ].forEach((item) => {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    });
    return combined;
  }
  return NCTB_JUNIOR_SUBJECTS;
}

export function getNctbSubjectIdsForClass(
  classId: string,
  group?: Class910GroupId | 'Common' | 'all' | string | null
): string[] {
  return getNctbSubjectsForClass(classId, group).map((s) => s.id);
}

export function getSubjectDisplayLabel(subjectId: string, lang: 'bn' | 'en'): string {
  const idLower = (subjectId || '').trim().toLowerCase();
  if (!idLower) return '';
  const allEntries = [
    ...NCTB_JUNIOR_SUBJECTS,
    ...NCTB_SECONDARY_COMMON_SUBJECTS,
    ...NCTB_SECONDARY_GROUP_SUBJECTS.Science,
    ...NCTB_SECONDARY_GROUP_SUBJECTS.Humanities,
    ...NCTB_SECONDARY_GROUP_SUBJECTS['Business Studies'],
  ];
  const found =
    allEntries.find((e) => e.id.toLowerCase() === idLower) ||
    CANONICAL_SUBJECTS.find((e) => e.id.toLowerCase() === idLower);
  if (found) {
    return lang === 'bn' ? found.bn : found.en;
  }
  return subjectId;
}

export function inferSubjectStudyGroup(
  classId: string,
  code?: string,
  nameEn?: string,
  explicitGroup?: StudyGroup | 'All'
): StudyGroup {
  if (classId === '6' || classId === '7' || classId === '8') {
    return 'Common';
  }
  if (explicitGroup && explicitGroup !== 'All') {
    return explicitGroup;
  }
  const normCode = (code || '').trim();
  const normName = (nameEn || '').trim().toLowerCase();

  if (
    NCTB_SECONDARY_COMMON_SUBJECTS.some(
      (s) => s.code === normCode || s.id.toLowerCase() === normName || s.en.toLowerCase() === normName
    )
  ) {
    return 'Common';
  }
  if (
    NCTB_SECONDARY_GROUP_SUBJECTS.Science.some(
      (s) =>
        (s.code === normCode && normCode !== '134' && normCode !== '151') ||
        s.id.toLowerCase() === normName ||
        s.en.toLowerCase() === normName
    )
  ) {
    return 'Science';
  }
  if (
    NCTB_SECONDARY_GROUP_SUBJECTS.Humanities.some(
      (s) =>
        (s.code === normCode && normCode !== '134' && normCode !== '151' && normCode !== '127') ||
        s.id.toLowerCase() === normName ||
        s.en.toLowerCase() === normName
    )
  ) {
    return 'Humanities';
  }
  if (
    NCTB_SECONDARY_GROUP_SUBJECTS['Business Studies'].some(
      (s) =>
        (s.code === normCode && normCode !== '134' && normCode !== '151' && normCode !== '127') ||
        s.id.toLowerCase() === normName ||
        s.en.toLowerCase() === normName
    )
  ) {
    return 'Business Studies';
  }
  if (normCode === '127' || /science|বিজ্ঞান/.test(normName)) {
    return 'Humanities';
  }
  if (/bangla|english|math|ict|religion|career|physical/.test(normName)) {
    return 'Common';
  }
  return 'Common';
}

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

  if (/bangla|বাংলা/.test(raw)) {
    matched.add('Bangla');
    matched.add('Bangla 1st Paper');
    matched.add('Bangla 2nd Paper');
  }
  if (/english|ইংরেজি/.test(raw)) {
    matched.add('English');
    matched.add('English 1st Paper');
    matched.add('English 2nd Paper');
  }
  if (/higher\s*math|উচ্চতর\s*গণিত/.test(raw)) {
    matched.add('Higher Mathematics');
  }
  const withoutHigher = raw.replace(/higher\s*math(?:ematics)?|উচ্চতর\s*গণিত/g, '');
  if (/general\s*math|সাধারণ\s*গণিত|math|mathematics|গণিত/.test(withoutHigher)) {
    matched.add('Mathematics');
  }
  if (/physics|পদার্থ/.test(raw)) matched.add('Physics');
  if (/chemistry|রসায়ন|রসায়ন/.test(raw)) matched.add('Chemistry');
  if (/biology|জীববিজ্ঞান|জীব বিজ্ঞান/.test(raw)) matched.add('Biology');
  if (/home\s*science|গার্হস্থ্য/.test(raw)) matched.add('Home Science');
  if (/agriculture|কৃষি/.test(raw)) matched.add('Agriculture Studies');
  if (/science|বিজ্ঞান/.test(raw) && !/home\s*science|গার্হস্থ্য/.test(raw)) {
    matched.add('Science');
  }
  if (/\bict\b|তথ্য ও যোগাযোগ|ডিজিটাল প্রযুক্তি|আইসিটি|computer/.test(raw)) matched.add('ICT');
  if (/bangladesh\s*&\s*global|bgs|বাংলাদেশ ও বিশ্বপরিচয়|ইতিহাস ও সামাজিক/.test(raw)) {
    matched.add('Bangladesh & Global Studies');
  }
  if (/religion|islam|hindu|moral|ধর্ম|ইসলাম/.test(raw)) {
    matched.add('Religion & Moral Education');
  }
  if (/physical|স্বাস্থ্য|শারীরিক/.test(raw)) matched.add('Physical Education & Health');
  if (/arts|crafts|চারু/.test(raw)) matched.add('Arts & Crafts');
  if (/career|ক্যারিয়ার/.test(raw)) matched.add('Career Education');
  if (/history|ইতিহাস|সভ্যতা/.test(raw)) matched.add('History of Bangladesh & World Civilization');
  if (/geography|ভূগোল/.test(raw)) matched.add('Geography & Environment');
  if (/civics|পৌরনীতি/.test(raw)) matched.add('Civics & Citizenship');
  if (/economics|অর্থনীতি/.test(raw)) matched.add('Economics');
  if (/accounting|হিসাববিজ্ঞান/.test(raw)) matched.add('Accounting');
  if (/finance|banking|ফিন্যান্স|ব্যাংকিং/.test(raw)) matched.add('Finance & Banking');
  if (/entrepreneurship|ব্যবসায় উদ্যোগ|ব্যবসা উদ্যোগ|commerce/.test(raw)) {
    matched.add('Business Entrepreneurship');
  }

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
    // Allow Bangla / English parent subjects to unlock 1st & 2nd paper in Classes 9-10
    if (a === 'bangla' && (target === 'bangla 1st paper' || target === 'bangla 2nd paper')) return true;
    if ((a === 'bangla 1st paper' || a === 'bangla 2nd paper') && target === 'bangla') return true;
    if (a === 'english' && (target === 'english 1st paper' || target === 'english 2nd paper')) return true;
    if ((a === 'english 1st paper' || a === 'english 2nd paper') && target === 'english') return true;
    // Allow Mathematics <-> General Math equivalence
    if (
      (a === 'mathematics' && target === 'general math') ||
      (a === 'general math' && target === 'mathematics')
    ) {
      return true;
    }
    if (
      (a === 'science' && target === 'general science') ||
      (a === 'general science' && target === 'science')
    ) {
      return true;
    }
    if (
      (a === 'physical education & health' && target === 'physical education & sports') ||
      (a === 'physical education & sports' && target === 'physical education & health')
    ) {
      return true;
    }
    return false;
  });
}
