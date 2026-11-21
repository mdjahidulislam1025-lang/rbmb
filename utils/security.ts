import { ExamMark } from '../types';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSaltHex(length = 16): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return toHex(arr);
  }
  let out = '';
  for (let i = 0; i < length * 2; i++) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
}

function fallbackDigest(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

export async function hashPassword(plain: string, providedSalt?: string): Promise<string> {
  const salt = providedSalt || generateSaltHex(16);
  const payload = `${salt}:${plain}`;
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const encoded = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return `rbhs_v1:${salt}:${toHex(new Uint8Array(digest))}`;
  }
  return `rbhs_fb:${salt}:${fallbackDigest(payload)}`;
}

export async function verifyPassword(plain: string, stored: string | undefined): Promise<boolean> {
  if (!stored) return false;
  if (stored.startsWith('rbhs_v1:') || stored.startsWith('rbhs_fb:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const recomputed = await hashPassword(plain, salt);
    if (recomputed === stored) return true;
    // Fallback digest comparison if subtle crypto was unavailable during seeding
    if (stored.startsWith('rbhs_fb:')) {
      return `rbhs_fb:${salt}:${fallbackDigest(`${salt}:${plain}`)}` === stored;
    }
    return false;
  }
  return plain === stored;
}

export function isSafeHttpUrl(rawUrl: string | undefined | null): boolean {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function calculateGrade(obtained: number, total: number): { grade: string; gpa: number } {
  const pct = total > 0 ? (obtained / total) * 100 : 0;
  if (pct >= 80) return { grade: 'A+', gpa: 5.0 };
  if (pct >= 70) return { grade: 'A', gpa: 4.0 };
  if (pct >= 60) return { grade: 'A-', gpa: 3.5 };
  if (pct >= 50) return { grade: 'B', gpa: 3.0 };
  if (pct >= 40) return { grade: 'C', gpa: 2.0 };
  if (pct >= 33) return { grade: 'D', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
}

export function calculateOverallGpa(marks: ExamMark[]): { gpa: string; averagePct: number; passedAll: boolean } {
  if (!marks || marks.length === 0) {
    return { gpa: '0.00', averagePct: 0, passedAll: false };
  }
  let sumGpa = 0;
  let sumPct = 0;
  let hasFail = false;
  for (const m of marks) {
    const { grade, gpa } = calculateGrade(m.obtainedMarks, m.totalMarks);
    const pct = m.totalMarks > 0 ? (m.obtainedMarks / m.totalMarks) * 100 : 0;
    sumGpa += gpa;
    sumPct += pct;
    if (grade === 'F') hasFail = true;
  }
  const avgPct = Math.round((sumPct / marks.length) * 10) / 10;
  if (hasFail) return { gpa: '0.00', averagePct: avgPct, passedAll: false };
  return {
    gpa: (sumGpa / marks.length).toFixed(2),
    averagePct: avgPct,
    passedAll: true,
  };
}
