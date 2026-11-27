import {
  CampusEvent,
  ClassRoutine,
  EBook,
  ExamQuestion,
  ExamRoutineItem,
  Holiday,
  Language,
  NewsArticle,
  Notice,
  OnlineExam,
  SchoolSettings,
  SchoolSubject,
  Teacher,
} from '../types';
import {
  formatAdmissionDate,
  formatAdmissionFee,
  resolveAdmissionSchedule,
} from './admissionSchedule';
import { buildNctbClassSyllabus } from './nctbSyllabus';

export interface LocalAssistantInput {
  query: string;
  lang: Language;
  settings: SchoolSettings;
  notices: Notice[];
  newsList: NewsArticle[];
  eventsList: CampusEvent[];
  examRoutines: ExamRoutineItem[];
  classRoutines: ClassRoutine[];
  subjects: SchoolSubject[];
  teachers: Teacher[];
  ebooks: EBook[];
  holidays: Holiday[];
  onlineExams: OnlineExam[];
}

const loc = (val: unknown, lang: Language): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  const rec = val as Record<string, string>;
  return rec[lang] || rec.bn || rec.en || '';
};

const extractClassId = (text: string): string | null => {
  const q = text.toLowerCase();
  if (/\b10\b|১০|দশম|\bten\b|ssc/.test(q)) return '10';
  if (/\b9\b|৯|নবম|\bnine\b/.test(q)) return '9';
  if (/\b8\b|৮|অষ্টম|\beight\b|jsc/.test(q)) return '8';
  if (/\b7\b|৭|সপ্তম|\bseven\b/.test(q)) return '7';
  if (/\b6\b|৬|ষষ্ঠ|\bsix\b/.test(q)) return '6';
  return null;
};

const hasAny = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((rx) => rx.test(text));

export function buildLocalSchoolContextSummary(input: Omit<LocalAssistantInput, 'query'>): string {
  const {
    lang,
    settings,
    notices,
    examRoutines,
    classRoutines,
    teachers,
    ebooks,
    holidays,
    onlineExams,
  } = input;

  const schoolName = loc(settings.name, lang) || 'রাণীর বাজার মাধ্যমিক বিদ্যালয় (RANIR BAZAR MAIDYAMIK BIDYALAY)';
  const sched = resolveAdmissionSchedule(settings.admissionSchedule);
  const examLines = [...examRoutines]
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(0, 10)
    .map((r) => `Class ${r.classId} ${r.subject}: ${r.date} ${r.time}${r.examTerm ? ` (${r.examTerm})` : ''}`)
    .join('; ');
  const noticeLines = notices
    .slice(0, 5)
    .map((n) => `[${n.date}] ${loc(n.title, lang)}`)
    .join('; ');
  const holidayLines = holidays
    .slice(0, 5)
    .map((h) => `${h.date} ${loc(h.title, lang)}`)
    .join('; ');
  const classTeacherLines = teachers
    .filter((tc) => tc.assignedClass)
    .sort((a, b) => Number(a.assignedClass) - Number(b.assignedClass))
    .map((tc) => `Class ${tc.assignedClass}: ${loc(tc.name, lang)}`)
    .join('; ');

  return [
    `School: ${schoolName} | Est: 1958 | EIIN: ${settings.eiin} | Address: ${loc(settings.location, lang)} | Phone: ${settings.phone} | Email: ${settings.email} | Head Teacher: ${loc(settings.headTeacherName, lang)}`,
    `Admission (${sched.sessionYear}): Status=${sched.isOpen ? 'OPEN' : 'Scheduled for December'}, Start=${sched.startDate}, Deadline=${sched.deadlineDate}, Exam=${sched.examDate}, Result=${sched.resultDate}, Fee=${sched.feeAmount} BDT`,
    `Exam Dates (${examRoutines.length} routines, ${onlineExams.length} online MCQ exams): ${examLines || 'None scheduled'}`,
    `Class Routines: ${classRoutines.length} classes (6-10) | Teachers: ${teachers.length} (${classTeacherLines || 'assigned per class'}) | Digital Library E-Books: ${ebooks.length}`,
    `Latest Notices: ${noticeLines || 'None'}`,
    `Upcoming Holidays: ${holidayLines || 'None'}`,
    `Portals: /admission, /routine, /syllabus (NCTB Class 6-10 with PDF download), /exams, /ebooks, /notices, /holidays, /teachers, /login/student, /login/teacher, /login/parent`,
  ].join('\n');
}

export function generateLocalSchoolAssistantReply(input: LocalAssistantInput): string {
  const {
    query,
    lang,
    settings,
    notices,
    newsList,
    eventsList,
    examRoutines,
    classRoutines,
    subjects,
    teachers,
    ebooks,
    holidays,
    onlineExams,
  } = input;

  const qRaw = query.trim();
  const q = qRaw.toLowerCase();
  const schoolName = loc(settings.name, lang) || (lang === 'bn' ? 'রাণীর বাজার মাধ্যমিক বিদ্যালয়' : 'RANIR BAZAR MAIDYAMIK BIDYALAY');
  const classId = extractClassId(qRaw);

  // 1. Greetings
  if (
    /^(hi|hello|hey|assalamu|salam|সালাম|হ্যালো|হাই|নমস্কার|kemon|কেমন)/i.test(q) &&
    q.split(/\s+/).length <= 5
  ) {
    return lang === 'bn'
      ? `আসসালামু আলাইকুম! ${schoolName}-এর স্মার্ট অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম।\n\nআমি আপনাকে সাহায্য করতে পারি:\n• পরীক্ষার তারিখ ও রুটিন\n• ক্লাস রুটিন ও NCTB সিলেবাস (অধ্যায়/টপিক)\n• অনলাইন ভর্তি ও সময়সূচি\n• নোটিশ, ছুটির তালিকা ও শিক্ষকদের তথ্য\n• ডিজিটাল লাইব্রেরি ও পোর্টাল লগইন`
      : `Welcome to the ${schoolName} Smart Assistant!\n\nI can help you right away with:\n• Upcoming exam dates & schedules\n• Class routines & NCTB syllabus (chapters & topics)\n• Online admission dates, fees & status\n• Latest notices, holidays & teacher directory\n• Digital library books & portal login guide`;
  }

  // 2. Thanks / Closing
  if (/^(thanks|thank you|dhonnobad|ধন্যবাদ|bye|ok|okay|ঠিক আছে)/i.test(q) && q.split(/\s+/).length <= 4) {
    return lang === 'bn'
      ? `আপনাকেও ধন্যবাদ! স্কুল সংক্রান্ত আরও কোনো প্রশ্ন থাকলে যেকোনো সময় জিজ্ঞাসা করুন।`
      : `You're welcome! Ask anytime if you need anything else about ${schoolName}.`;
  }

  // 3. Upcoming Exam Dates & Exam Routine
  if (
    hasAny(q, [
      /exam|porikkha|test|mcq|quiz|পরীক্ষা|পরীক্ষার|কুইজ|রুটিন.*পরীক্ষা|পরীক্ষা.*রুটিন|date/i,
    ]) &&
    !hasAny(q, [/admission|ভর্তি|vorti/i])
  ) {
    const filteredExamRoutines = classId
      ? examRoutines.filter((r) => r.classId === classId)
      : examRoutines;
    const sortedExams = [...filteredExamRoutines].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    const filteredOnlineExams = classId
      ? onlineExams.filter((ex) => ex.classId === classId)
      : onlineExams;

    if (sortedExams.length > 0) {
      const lines = sortedExams
        .slice(0, 8)
        .map(
          (r) =>
            `• ${r.date} (${r.time}) — Class ${r.classId}: ${r.subject}${r.examTerm ? ` [${r.examTerm}]` : ''}${r.room ? `, ${r.room}` : ''}`
        );
      return lang === 'bn'
        ? `${classId ? `${classId}ম শ্রেণীর ` : ''}আসন্ন পরীক্ষার সময়সূচি:\n${lines.join('\n')}${sortedExams.length > 8 ? `\n...এবং আরও ${sortedExams.length - 8}টি পরীক্ষা (/routine পেজে দেখুন)।` : ''}\n\nঅনলাইন অনুশীলন MCQ পরীক্ষা: ${filteredOnlineExams.length}টি (/exams পেজে পাওয়া যাবে)।`
        : `Upcoming Exam Schedule${classId ? ` (Class ${classId})` : ''}:\n${lines.join('\n')}${sortedExams.length > 8 ? `\n...and ${sortedExams.length - 8} more (visit /routine).` : ''}\n\nOnline MCQ Practice Tests available: ${filteredOnlineExams.length} (visit /exams).`;
    }

    if (filteredOnlineExams.length > 0) {
      const list = filteredOnlineExams
        .slice(0, 5)
        .map((ex) => `• Class ${ex.classId} · ${ex.subject}: ${loc(ex.title, lang)} (${Array.isArray(ex.questions) ? ex.questions.length : 0} MCQ)`)
        .join('\n');
      return lang === 'bn'
        ? `এই মুহূর্তে নতুন লিখিত পরীক্ষার রুটিন যুক্ত হয়নি, তবে অনলাইন MCQ পরীক্ষা চালু আছে:\n${list}\n\nপরীক্ষার রুটিনের জন্য /routine ও MCQ-এর জন্য /exams পেজ দেখুন।`
        : `No written exam dates are currently listed${classId ? ` for Class ${classId}` : ''}, but online MCQ tests are active:\n${list}\n\nCheck /routine for updated exam schedules.`;
    }
  }

  // 4. Online Admission Schedule & Process
  if (hasAny(q, [/admission|admit\s*apply|vorti|ভর্তি|আবেদন|december|ডিসেম্বর|apply/i])) {
    const sched = resolveAdmissionSchedule(settings.admissionSchedule);
    const startFmt = formatAdmissionDate(sched.startDate, lang);
    const deadlineFmt = formatAdmissionDate(sched.deadlineDate, lang);
    const examFmt = formatAdmissionDate(sched.examDate, lang);
    const resultFmt = formatAdmissionDate(sched.resultDate, lang);
    const feeFmt = formatAdmissionFee(sched.feeAmount, lang);

    if (lang === 'bn') {
      return `অনলাইন ভর্তি পোর্টাল (সেশন ${sched.sessionYear}):\n• বর্তমান অবস্থা: ${sched.isOpen ? 'আবেদন চালু আছে' : 'আগামী ডিসেম্বর মাসে স্বয়ংক্রিয়ভাবে শুরু হবে'}\n• আবেদন শুরু: ${startFmt}\n• আবেদনের শেষ তারিখ: ${deadlineFmt}\n• ভর্তি পরীক্ষা: ${examFmt}\n• ফলাফল প্রকাশ: ${resultFmt}\n• আবেদন ফি: ${feeFmt}\n\nবিস্তারিত জানতে ও আবেদন করতে "অনলাইন ভর্তি" (/admission) মেনুতে যান।`;
    }
    return `Online Admission Portal (Session ${sched.sessionYear}):\n• Status: ${sched.isOpen ? 'OPEN NOW' : 'Starts automatically every December'}\n• Opens: ${startFmt}\n• Application Deadline: ${deadlineFmt}\n• Admission Exam: ${examFmt}\n• Result Publication: ${resultFmt}\n• Application Fee: ${feeFmt}\n\nVisit /admission to submit an online application or track your status.`;
  }

  // 5. Class Routine / Timetable
  if (hasAny(q, [/class routine|timetable|period|ক্লাস রুটিন|সময়সূচি|পিরিয়ড|রুটিন/i])) {
    const targetClass = classId || '6';
    const cr = classRoutines.find((r) => r.classId === targetClass) || classRoutines[0];
    if (cr && Array.isArray(cr.schedule) && cr.schedule.length > 0) {
      const sampleDay = cr.schedule[0];
      const periods = (Array.isArray(sampleDay.periods) ? sampleDay.periods : [])
        .slice(0, 6)
        .map((p, idx) => `  ${idx + 1}. ${p.time} — ${loc(p.subject, lang)} (${loc(p.teacher, lang)})`)
        .join('\n');
      return lang === 'bn'
        ? `${loc(cr.className, lang)}-এর সপ্তাহিক ক্লাস রুটিন (${cr.schedule.length} কর্মদিবস):\nউদাহরণ (${loc(sampleDay.day, lang)}):\n${periods}\n\nপূর্ণাঙ্গ সপ্তাহিক রুটিন ও প্রিন্ট করতে /routine পেজে যান।`
        : `${loc(cr.className, lang)} Class Timetable (${cr.schedule.length} school days):\nSample (${loc(sampleDay.day, lang)}):\n${periods}\n\nView and print all classes (6–10) on the /routine page.`;
    }
  }

  // 6. NCTB Syllabus / Subjects / Chapters / Topics
  if (
    hasAny(q, [
      /syllabus|subject|chapter|topic|nctb|সিলেবাস|বিষয়|অধ্যায়|টপিক|পাঠ্যসূচি|বই তালিকা/i,
    ])
  ) {
    const targetClass = classId || '9';
    const syl = buildNctbClassSyllabus(targetClass, subjects);
    if (syl) {
      const matchedSubject = syl.subjects.find((sub) => {
        const bn = sub.name.bn.toLowerCase();
        const en = sub.name.en.toLowerCase();
        return (
          q.includes(en) ||
          q.includes(bn) ||
          en.split(/\s+/).some((w) => w.length > 3 && q.includes(w)) ||
          bn.split(/\s+/).some((w) => w.length > 2 && q.includes(w))
        );
      });

      if (matchedSubject) {
        const chapterList = matchedSubject.chapters
          .slice(0, 6)
          .map((c, idx) => `${idx + 1}. ${loc(c.chapterTitle, lang)}\n   - ${loc(c.topics, lang)}`)
          .join('\n');
        return lang === 'bn'
          ? `${loc(syl.className, lang)} · ${loc(matchedSubject.name, lang)} [${matchedSubject.code}] (${matchedSubject.totalMarks} নম্বর — ${loc(matchedSubject.marksBreakdown, lang)}):\n\n${chapterList}\n\nসিলেবাস PDF ডাউনলোড করতে /syllabus পেজে যান।`
          : `${loc(syl.className, lang)} · ${loc(matchedSubject.name, lang)} [${matchedSubject.code}] (${matchedSubject.totalMarks} Marks — ${loc(matchedSubject.marksBreakdown, lang)}):\n\n${chapterList}\n\nDownload full PDF syllabus from /syllabus.`;
      }

      const subjectList = syl.subjects
        .slice(0, 14)
        .map((s) => `• [${s.code}] ${loc(s.name, lang)}${s.group !== 'Common' ? ` (${s.group})` : ''}`)
        .join('\n');
      return lang === 'bn'
        ? `${loc(syl.className, lang)}-এর NCTB অনুমোদিত বিষয়সমূহ (${syl.subjects.length}টি):\n${subjectList}\n\nযেকোনো বিষয়ের অধ্যায় ও টপিক দেখতে বা PDF ডাউনলোড করতে /syllabus পেজ দেখুন (৬ষ্ঠ–৮ম অভিন্ন বিষয় এবং ৯ম–১০ম বিভাগভিত্তিক)।`
        : `${loc(syl.className, lang)} NCTB Approved Subjects (${syl.subjects.length} total):\n${subjectList}\n\nView detailed chapters, topics & download PDF on /syllabus (Classes 6–8 unified; Classes 9–10 grouped).`;
    }
  }

  // 7. Notices, News & Events
  if (hasAny(q, [/notice|news|event|circular|নোটিশ|সংবাদ|ঘোষণা|খবর|ইভেন্ট/i])) {
    const latestNotices = notices
      .slice(0, 4)
      .map((n) => `• [${n.date}] ${loc(n.title, lang)}`)
      .join('\n');
    const latestEvents = eventsList
      .slice(0, 2)
      .map((ev) => `• [${ev.date}] ${loc(ev.title, lang)} (${loc(ev.location, lang)})`)
      .join('\n');
    const latestNews = newsList
      .slice(0, 2)
      .map((nw) => `• [${nw.date}] ${loc(nw.title, lang)}`)
      .join('\n');

    return lang === 'bn'
      ? `সাম্প্রতিক নোটিশসমূহ:\n${latestNotices || 'কোনো নোটিশ নেই।'}${latestEvents ? `\n\nআসন্ন ইভেন্ট:\n${latestEvents}` : ''}${latestNews ? `\n\nসংবাদ:\n${latestNews}` : ''}\n\nসব নোটিশ ও সংবাদ দেখতে /notices পেজে যান।`
      : `Latest Notices:\n${latestNotices || 'No notices published.'}${latestEvents ? `\n\nUpcoming Events:\n${latestEvents}` : ''}${latestNews ? `\n\nCampus News:\n${latestNews}` : ''}\n\nRead full notices & news on /notices.`;
  }

  // 8. Holidays & Calendar
  if (hasAny(q, [/holiday|chuti|vacation|closed|বন্ধ|ছুটি|ঈদ|পূজা|calendar|ক্যালেন্ডার/i])) {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = holidays.filter((h) => (h.date || '') >= today);
    const list = (upcoming.length > 0 ? upcoming : holidays)
      .slice(0, 6)
      .map((h) => `• ${h.date} — ${loc(h.title, lang)} (${loc(h.duration, lang)})`)
      .join('\n');
    return lang === 'bn'
      ? `সরকারি ও বিদ্যালয় ছুটির তালিকা (মোট ${holidays.length}টি):\n${list}\n\nপূর্ণাঙ্গ ছুটির তালিকা ও ক্যালেন্ডার দেখতে /holidays এবং /calendar পেজ দেখুন।`
      : `School Holiday Schedule (${holidays.length} entries):\n${list}\n\nSee the full list on /holidays and /calendar.`;
  }

  // 9. Teachers, Head Teacher & Faculty
  if (
    hasAny(q, [
      /teacher|head\s*teacher|principal|faculty|sir|madam|শিক্ষক|প্রধান শিক্ষক|স্যার|ম্যাডাম/i,
    ])
  ) {
    const headName = loc(settings.headTeacherName, lang);
    const assignedList = teachers
      .filter((tc) => tc.assignedClass)
      .sort((a, b) => Number(a.assignedClass) - Number(b.assignedClass))
      .map((tc) => `• Class ${tc.assignedClass}: ${loc(tc.name, lang)} (${loc(tc.subject, lang)})`);

    const matchedTeachers = teachers.filter((tc) => {
      const nBn = tc.name?.bn?.toLowerCase() || '';
      const nEn = tc.name?.en?.toLowerCase() || '';
      const sBn = tc.subject?.bn?.toLowerCase() || '';
      const sEn = tc.subject?.en?.toLowerCase() || '';
      return q
        .split(/\s+/)
        .some((w) => w.length > 2 && (nBn.includes(w) || nEn.includes(w) || sBn.includes(w) || sEn.includes(w)));
    });

    if (matchedTeachers.length > 0 && !/head|প্রধান|all|সকল|সব/i.test(q)) {
      const list = matchedTeachers
        .slice(0, 5)
        .map(
          (tc) =>
            `• ${loc(tc.name, lang)} — ${loc(tc.designation, lang)} (${loc(tc.subject, lang)})${tc.assignedClass ? ` · Class ${tc.assignedClass} Teacher` : ''}${tc.phone ? ` · ${tc.phone}` : ''}`
        )
        .join('\n');
      return lang === 'bn'
        ? `সংশ্লিষ্ট শিক্ষকের তথ্য:\n${list}\n\nসকল শিক্ষকের তালিকা দেখতে /teachers পেজে যান।`
        : `Matching Faculty Details:\n${list}\n\nView all ${teachers.length} faculty members on /teachers.`;
    }

    return lang === 'bn'
      ? `বিদ্যালয়ের প্রধান শিক্ষক: ${headName}\nমোট শিক্ষক-শিক্ষিকা: ${teachers.length} জন।\n\n${assignedList.length > 0 ? `শ্রেণী শিক্ষকবৃন্দ:\n${assignedList.join('\n')}\n\n` : ''}বিস্তারিত পরিচিতির জন্য /teachers পেজে যান।`
      : `Head Teacher: ${headName}\nTotal Faculty Members: ${teachers.length}\n\n${assignedList.length > 0 ? `Class Teachers:\n${assignedList.join('\n')}\n\n` : ''}See complete faculty profiles on /teachers.`;
  }

  // 10. Digital Library / E-Books
  if (hasAny(q, [/book|ebook|library|note|লাইব্রেরি|বই|নোট|পাঠ্যবই/i])) {
    const filtered = classId ? ebooks.filter((b) => b.classId === classId) : ebooks;
    const list = filtered
      .slice(0, 5)
      .map((b) => `• Class ${b.classId} · ${b.subject}: ${loc(b.title, lang)}`)
      .join('\n');
    return lang === 'bn'
      ? `ডিজিটাল লাইব্রেরিতে ${filtered.length}টি পাঠ্যবই ও স্টাডি নোট রয়েছে${classId ? ` (${classId}ম শ্রেণী)` : ''}:\n${list}\n\nবই পড়তে ও নোট ডাউনলোড করতে /ebooks পেজে যান।`
      : `Digital Library has ${filtered.length} textbooks & study guides${classId ? ` for Class ${classId}` : ''}:\n${list}\n\nOpen /ebooks to read or download study sheets.`;
  }

  // 11. Portals, Registration, Fees, Admit Card, Attendance
  if (
    hasAny(q, [
      /portal|login|register|signup|password|registration|fee|payment|admit|certificate|attendance|hajira|পোর্টাল|লগইন|রেজিস্ট্রেশন|ফি|বেতন|প্রবেশপত্র|হাজিরা|সার্টিফিকেট/i,
    ])
  ) {
    return lang === 'bn'
      ? `পোর্টাল ও একাডেমিক সেবা গাইড:\n• শিক্ষার্থী পোর্টাল (/login/student): রেজিস্ট্রেশন নম্বর (শুধু সংখ্যা) অথবা রোল দিয়ে লগইন, হাজিরা, ফলাফল, নিজ শ্রেণীর NCTB সিলেবাস, ফি ও প্রবেশপত্র দেখুন।\n• শিক্ষক পোর্টাল (/login/teacher): নিজ শ্রেণীর হাজিরা (শ্রেণী শিক্ষক/অ্যাডমিন), নম্বর এন্ট্রি, হোমওয়ার্ক ও MCQ পরীক্ষা তৈরি।\n• অভিভাবক পোর্টাল (/login/parent): সন্তানের হাজিরা, বেতন রশিদ ও শিক্ষকদের সাথে যোগাযোগ।\n• নতুন অ্যাকাউন্ট তৈরি করতে /register পেজে যান।`
      : `Portals & Academic Services Guide:\n• Student Portal (/login/student): Sign in with your numeric registration number or roll to view attendance, report card, your class NCTB syllabus, fees, and admit card.\n• Teacher Portal (/login/teacher): Class attendance (Class Teacher / Admin only), marks entry, homework & MCQ quiz builder.\n• Parent Portal (/login/parent): Track child's attendance, fees, results & message teachers.\n• Create a new account on /register.`;
  }

  // 12. School Info, EIIN, Contact, Location, Creator
  if (
    hasAny(q, [
      /eiin|phone|mobile|email|address|location|where|contact|about|established|1958|school|নাম|ঠিকানা|ফোন|ইমেইল|পরিচিতি|কোথায়|jahid|developer|তৈরি/i,
    ])
  ) {
    return lang === 'bn'
      ? `${schoolName}\n• স্থাপিত: ১৯৫৮\n• EIIN: ${settings.eiin}\n• ঠিকানা: ${loc(settings.location, 'bn')}\n• প্রধান শিক্ষক: ${loc(settings.headTeacherName, 'bn')}\n• ফোন: ${settings.phone}\n• ইমেইল: ${settings.email}\n• তৈরি করেছেন: JAHIDUL ISLAM (IIT, University of Dhaka)`
      : `${schoolName}\n• Established: 1958\n• EIIN: ${settings.eiin}\n• Address: ${loc(settings.location, 'en')}\n• Head Teacher: ${loc(settings.headTeacherName, 'en')}\n• Phone: ${settings.phone}\n• Email: ${settings.email}\n• Created by: JAHIDUL ISLAM (IIT, University of Dhaka)`;
  }

  // 13. Smart Keyword Search across all live website datasets
  const terms = q
    .replace(/[?.,!।]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  if (terms.length > 0) {
    const matches: string[] = [];
    notices.forEach((n) => {
      const hay = `${loc(n.title, lang)} ${loc(n.description, lang)}`.toLowerCase();
      if (terms.some((w) => hay.includes(w))) {
        matches.push(`• [Notice · ${n.date}] ${loc(n.title, lang)}`);
      }
    });
    examRoutines.forEach((er) => {
      const hay = `${er.subject} ${er.examTerm || ''} class ${er.classId}`.toLowerCase();
      if (terms.some((w) => hay.includes(w))) {
        matches.push(`• [Exam · ${er.date}] Class ${er.classId} ${er.subject} (${er.time})`);
      }
    });
    ebooks.forEach((b) => {
      const hay = `${loc(b.title, lang)} ${b.subject} class ${b.classId}`.toLowerCase();
      if (terms.some((w) => hay.includes(w))) {
        matches.push(`• [Library] Class ${b.classId} ${b.subject}: ${loc(b.title, lang)}`);
      }
    });
    teachers.forEach((tc) => {
      const hay = `${loc(tc.name, lang)} ${loc(tc.subject, lang)} ${loc(tc.designation, lang)}`.toLowerCase();
      if (terms.some((w) => hay.includes(w))) {
        matches.push(`• [Teacher] ${loc(tc.name, lang)} — ${loc(tc.subject, lang)}`);
      }
    });

    if (matches.length > 0) {
      return lang === 'bn'
        ? `"${qRaw}" অনুযায়ী ওয়েবসাইটে পাওয়া তথ্য:\n${matches.slice(0, 6).join('\n')}`
        : `Here is what I found on the website for "${qRaw}":\n${matches.slice(0, 6).join('\n')}`;
    }
  }

  // 14. Helpful local AI guide when query is broad/unknown
  return lang === 'bn'
    ? `${schoolName}-এর লোকাল AI অ্যাসিস্ট্যান্ট চালু আছে!\n\nআপনি নিচের যেকোনো বিষয়ে প্রশ্ন করতে পারেন:\n• "আসন্ন পরীক্ষার রুটিন কবে?"\n• "ভর্তির তথ্য ও সময়সূচি?"\n• "৯ম শ্রেণীর সিলেবাস ও বিষয়"\n• "ক্লাস রুটিন দেখাও"\n• "সাম্প্রতিক নোটিশ ও ছুটির তালিকা"\n• "শিক্ষকদের তালিকা বা যোগাযোগ নম্বর"`
    : `${schoolName} Local AI Assistant is ready!\n\nTry asking:\n• "Upcoming exam dates?"\n• "Admission dates & fee?"\n• "Class 9 syllabus & subjects"\n• "Class 6 routine"\n• "Latest notices & holidays"\n• "Teachers list or school EIIN & contact"`;
}

export function generateLocalStudyLesson(params: {
  classId: string;
  subject: string;
  topic?: string;
  question?: string;
  lang: Language;
}): string {
  const { classId, subject, topic, question, lang } = params;
  const syl = buildNctbClassSyllabus(classId);
  const subDetail = syl?.subjects.find(
    (s) =>
      s.name.en.toLowerCase().includes(subject.toLowerCase()) ||
      s.name.bn.includes(subject) ||
      subject.toLowerCase().includes(s.name.en.toLowerCase())
  );

  const topicLower = (topic || question || '').toLowerCase();
  const matchedChapter = subDetail?.chapters.find(
    (c) =>
      (topicLower &&
        (c.chapterTitle.en.toLowerCase().includes(topicLower) ||
          c.chapterTitle.bn.toLowerCase().includes(topicLower) ||
          c.topics.en.toLowerCase().includes(topicLower) ||
          c.topics.bn.toLowerCase().includes(topicLower))) ||
      false
  ) || subDetail?.chapters[0];

  const subTitle = subDetail ? loc(subDetail.name, lang) : subject;
  const chapTitle = matchedChapter
    ? loc(matchedChapter.chapterTitle, lang)
    : topic || (lang === 'bn' ? 'নির্ধারিত অধ্যায়' : 'Core Chapter');
  const chapTopics = matchedChapter
    ? loc(matchedChapter.topics, lang)
    : subDetail
      ? loc(subDetail.chaptersOutline, lang)
      : subject;
  const marksInfo = subDetail
    ? `${subDetail.totalMarks} (${loc(subDetail.marksBreakdown, lang)})`
    : '100';

  if (lang === 'bn') {
    return [
      `১. মূল ধারণা (NCTB ${classId}ম শ্রেণী · ${subTitle})`,
      `অধ্যায়/টপিক: ${topic || chapTitle}`,
      `পাঠ্যক্রম সারসংক্ষেপ: ${chapTopics}`,
      question ? `আপনার প্রশ্ন: "${question}" — এই অধ্যায়ের মূল সূত্র, সংজ্ঞা ও ধারণা ভালোভাবে বুঝলে প্রশ্নটির উত্তর সহজেই লেখা যাবে।` : '',
      ``,
      `২. ধাপে ধাপে প্রস্তুতি ও অনুশীলন`,
      `• পাঠ্যবইয়ের মূল সংজ্ঞা ও গুরুত্বপূর্ণ পয়েন্ট খাতায় নোট করুন।`,
      `• NCTB অনুমোদিত উদাহরণ ও অনুশীলনীর কাজগুলো নিজে সমাধান করে যাচাই করুন।`,
      `• নম্বর বণ্টন (${marksInfo}) অনুযায়ী সৃজনশীল (CQ) ও বহুনির্বাচনি (MCQ) অনুশীলন করুন।`,
      ``,
      `৩. পরীক্ষার জন্য গুরুত্বপূর্ণ টিপস`,
      `• প্রতিটি অধ্যায়ের মূল শব্দ (Key Terms) এবং চিত্র/সূত্র পরিষ্কারভাবে লিখুন।`,
      `• অনুশীলন শেষ করে উপরের "MCQ অনুশীলন" মোড দিয়ে নিজেকে যাচাই করুন।`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `1. Core Concept (NCTB Class ${classId} · ${subTitle})`,
    `Focus Area: ${topic || chapTitle}`,
    `Curriculum Key Topics: ${chapTopics}`,
    question ? `Regarding your question ("${question}"): break it down into definitions, core principles, and a concrete worked step from this chapter.` : '',
    ``,
    `2. Step-by-Step Study Plan`,
    `• Read the NCTB textbook chapter carefully and highlight key definitions and laws.`,
    `• Work through solved examples before attempting exercise problems independently.`,
    `• Practice both Creative Questions (CQ) and MCQs according to marks distribution (${marksInfo}).`,
    ``,
    `3. Quick Exam Tips`,
    `• Label diagrams, units, and formulas clearly for full marks.`,
    `• Switch to "MCQ Practice" above to test your mastery of this topic.`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function generateLocalMcqQuestions(params: {
  classId: string;
  subject: string;
  topic?: string;
  lang: Language;
  count?: number;
  existingExams?: OnlineExam[];
}): ExamQuestion[] {
  const { classId, subject, topic, lang, count = 4, existingExams = [] } = params;
  const results: ExamQuestion[] = [];
  const stamp = Date.now();

  // First harvest relevant questions from the school's existing online exam bank
  const bankMatches = existingExams.filter(
    (ex) =>
      ex.subject.toLowerCase().includes(subject.toLowerCase()) ||
      subject.toLowerCase().includes(ex.subject.toLowerCase())
  );
  bankMatches.forEach((ex) => {
    (Array.isArray(ex.questions) ? ex.questions : []).forEach((q) => {
      if (results.length < count) {
        results.push({
          ...q,
          id: `loc-q-${stamp}-${results.length}`,
        });
      }
    });
  });

  if (results.length >= count) {
    return results.slice(0, count);
  }

  // Synthesize curriculum-grounded NCTB questions from class chapters & topics
  const syl = buildNctbClassSyllabus(classId);
  const subDetail = syl?.subjects.find(
    (s) =>
      s.name.en.toLowerCase().includes(subject.toLowerCase()) ||
      s.name.bn.includes(subject) ||
      subject.toLowerCase().includes(s.name.en.toLowerCase())
  );
  const chapters = subDetail?.chapters || [];
  const subLabel = subDetail ? loc(subDetail.name, lang) : subject;
  const focusLabel = topic?.trim() || (chapters[0] ? loc(chapters[0].chapterTitle, lang) : subLabel);

  const templates: ExamQuestion[] =
    lang === 'bn'
      ? [
          {
            id: `loc-q-${stamp}-a`,
            question: `NCTB ${classId}ম শ্রেণীর "${subLabel}" বিষয়ে "${focusLabel}" অংশের মূল পাঠ্যবস্তু কোনটি?`,
            options: [
              chapters[0] ? loc(chapters[0].topics, 'bn').slice(0, 80) : `${subLabel}-এর মৌলিক ধারণা ও অনুশীলন`,
              'শুধুমাত্র কম্পিউটার প্রোগ্রামিং কোড',
              'অন্য শ্রেণীর উচ্চতর জ্যোতির্বিজ্ঞান',
              'উপরের কোনোটিই নয়',
            ],
            correctIndex: 0,
            explanation: `NCTB নির্ধারিত ${classId}ম শ্রেণীর ${subLabel} সিলেবাসের এই অধ্যায়ে এটিই প্রধান আলোচ্য বিষয়।`,
          },
          {
            id: `loc-q-${stamp}-b`,
            question: `${classId}ম শ্রেণীর "${subLabel}" বিষয়ে সঠিক মূল্যায়ন কাঠামো কোনটি?`,
            options: [
              'কোনো লিখিত পরীক্ষা নেই',
              subDetail ? `${subDetail.totalMarks} নম্বর (${subDetail.marksBreakdown.bn})` : '১০০ নম্বরের সমন্বিত মূল্যায়ন',
              'শুধুমাত্র মৌখিক পরীক্ষা',
              '৫০ নম্বরের অ্যাসাইনমেন্ট',
            ],
            correctIndex: 1,
            explanation: `NCTB নির্দেশিকা অনুযায়ী ${subLabel} বিষয়ের পূর্ণমান ${subDetail?.totalMarks || 100}।`,
          },
          {
            id: `loc-q-${stamp}-c`,
            question: `"${focusLabel}" অধ্যায়টি ভালোভাবে আয়ত্ত করার সবচেয়ে কার্যকর উপায় কোনটি?`,
            options: [
              'মূল পাঠ্যবই না পড়ে শুধু নোট মুখস্থ করা',
              'পাঠ্যবইয়ের ধারণা বুঝে উদাহরণ ও সৃজনশীল প্রশ্ন অনুশীলন করা',
              'অধ্যায়ের গুরুত্বপূর্ণ সংজ্ঞা বাদ দেওয়া',
              'অনুশীলন ছাড়াই পরীক্ষায় বসা',
            ],
            correctIndex: 1,
            explanation: 'মূল পাঠ্যবই বুঝে নিয়মিত অনুশীলন করলে CQ ও MCQ উভয় অংশেই ভালো করা যায়।',
          },
          {
            id: `loc-q-${stamp}-d`,
            question: `${classId}ম শ্রেণীর "${subLabel}" বিষয়ের NCTB কোড নম্বর কত?`,
            options: [
              subDetail?.code || '101',
              '999',
              '000',
              '555',
            ],
            correctIndex: 0,
            explanation: `NCTB পাঠ্যক্রম অনুযায়ী ${subLabel}-এর নির্ধারিত বিষয় কোড ${subDetail?.code || '101'}।`,
          },
        ]
      : [
          {
            id: `loc-q-${stamp}-a`,
            question: `In NCTB Class ${classId} ${subLabel}, what is the core focus of "${focusLabel}"?`,
            options: [
              chapters[0] ? loc(chapters[0].topics, 'en').slice(0, 80) : `Core concepts and exercises of ${subLabel}`,
              'Unrelated advanced university electives',
              'Only sports drill rules',
              'None of the above',
            ],
            correctIndex: 0,
            explanation: `Per the official NCTB Class ${classId} ${subLabel} syllabus, this chapter covers those exact competencies.`,
          },
          {
            id: `loc-q-${stamp}-b`,
            question: `What is the official NCTB assessment structure for Class ${classId} ${subLabel}?`,
            options: [
              'Oral assessment only',
              subDetail ? `${subDetail.totalMarks} Marks (${subDetail.marksBreakdown.en})` : '100 Marks comprehensive evaluation',
              '20 Marks attendance only',
              'No written evaluation',
            ],
            correctIndex: 1,
            explanation: `Class ${classId} ${subLabel} carries ${subDetail?.totalMarks || 100} total marks under the NCTB framework.`,
          },
          {
            id: `loc-q-${stamp}-c`,
            question: `What is the best study approach to master "${focusLabel}" for exams?`,
            options: [
              'Skip textbook definitions and examples',
              'Understand textbook concepts first, then solve worked examples and practice MCQs',
              'Memorize unrelated chapters only',
              'Avoid reviewing mistakes after practice',
            ],
            correctIndex: 1,
            explanation: 'Conceptual clarity combined with regular CQ and MCQ practice leads to top exam performance.',
          },
          {
            id: `loc-q-${stamp}-d`,
            question: `Which official NCTB subject code corresponds to Class ${classId} ${subLabel}?`,
            options: [
              subDetail?.code || '101',
              '999',
              '000',
              '555',
            ],
            correctIndex: 0,
            explanation: `The NCTB subject code for ${subLabel} is ${subDetail?.code || '101'}.`,
          },
        ];

  while (results.length < count && templates.length > 0) {
    const next = templates.shift()!;
    results.push({ ...next, id: `loc-q-${stamp}-${results.length}` });
  }

  return results;
}
