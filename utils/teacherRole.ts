import { SchoolSettings, Teacher } from '../types';

export interface TeacherMatchTarget {
  userId?: string;
  name?: string;
  phone?: string;
  designation?: string;
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
