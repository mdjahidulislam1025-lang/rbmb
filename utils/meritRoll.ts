import { ExamMark, SchoolStudent } from '../types';
import { calculateGrade } from './security';

export interface MeritRankEntry {
  studentId: string;
  studentName: string;
  previousRoll: string;
  newRoll: string;
  changed: boolean;
  subjectsCount: number;
  failCount: number;
  totalObtained: number;
  totalPossible: number;
  gpa: string;
  gpaValue: number;
  percentage: number;
}

export function isYearFinalExamTerm(term?: string | null): boolean {
  if (!term) return false;
  return /annual|year\s*final|final\s*exam|বার্ষিক/i.test(term.trim());
}

export function formatMeritRoll(position: number): string {
  const safe = Math.max(1, Math.floor(position));
  return safe < 100 ? String(safe).padStart(2, '0') : String(safe);
}

export function computeClassMeritRanking(
  studentsInClass: SchoolStudent[],
  termMarks: ExamMark[]
): MeritRankEntry[] {
  const entries = studentsInClass.map((st) => {
    const myMarks = termMarks.filter((m) =>
      m.studentId ? m.studentId === st.id : m.roll.trim() === st.roll.trim()
    );
    const subjectsCount = myMarks.length;
    let totalObtained = 0;
    let totalPossible = 0;
    let sumGpa = 0;
    let failCount = 0;

    myMarks.forEach((m) => {
      const obtained = Number(m.obtainedMarks) || 0;
      const total = Number(m.totalMarks) || 100;
      totalObtained += obtained;
      totalPossible += total;
      const res = calculateGrade(obtained, total);
      sumGpa += res.gpa;
      if (res.grade === 'F') failCount += 1;
    });

    const gpaValue =
      subjectsCount === 0 || failCount > 0 ? 0 : Number((sumGpa / subjectsCount).toFixed(2));
    const percentage =
      totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 1000) / 10 : 0;

    return {
      studentId: st.id,
      studentName: st.name,
      previousRoll: st.roll,
      subjectsCount,
      failCount,
      totalObtained: Math.round(totalObtained * 100) / 100,
      totalPossible,
      gpa: gpaValue.toFixed(2),
      gpaValue,
      percentage,
    };
  });

  // Sort: students with marks > no marks -> fewer fails -> higher GPA -> higher total marks -> higher percentage -> previous roll
  entries.sort((a, b) => {
    const aHas = a.subjectsCount > 0 ? 1 : 0;
    const bHas = b.subjectsCount > 0 ? 1 : 0;
    if (aHas !== bHas) return bHas - aHas;

    if (a.failCount !== b.failCount) return a.failCount - b.failCount;
    if (a.gpaValue !== b.gpaValue) return b.gpaValue - a.gpaValue;
    if (a.totalObtained !== b.totalObtained) return b.totalObtained - a.totalObtained;
    if (a.percentage !== b.percentage) return b.percentage - a.percentage;
    return a.previousRoll.localeCompare(b.previousRoll, undefined, { numeric: true });
  });

  return entries.map((entry, idx) => {
    const newRoll = formatMeritRoll(idx + 1);
    return {
      ...entry,
      newRoll,
      changed: entry.previousRoll.trim() !== newRoll,
    };
  });
}
