import * as React from 'react';
import { BookOpen, Download, ExternalLink, FileText, Loader2, Lock, Search, ShieldCheck } from 'lucide-react';
import { useApp } from '../App';
import { StudyGroup } from '../types';
import { getDhakaYear } from '../utils/dhakaTime';
import { buildAllNctbSyllabuses, NctbClassSyllabus } from '../utils/nctbSyllabus';
import { downloadSyllabusPdf } from '../utils/syllabusPdf';

type GroupFilterOption = 'All' | StudyGroup;

const GROUP_TABS: { id: GroupFilterOption; bn: string; en: string }[] = [
  { id: 'All', bn: 'সকল বিষয়', en: 'All Subjects' },
  { id: 'Common', bn: 'আবশ্যিক', en: 'Common' },
  { id: 'Science', bn: 'বিজ্ঞান', en: 'Science' },
  { id: 'Humanities', bn: 'মানবিক', en: 'Humanities' },
  { id: 'Business Studies', bn: 'ব্যবসায় শিক্ষা', en: 'Business' },
];

const Syllabus: React.FC = () => {
  const { lang, t, settings, user, students, subjects } = useApp();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [downloadingClassId, setDownloadingClassId] = React.useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = React.useState<Record<string, GroupFilterOption>>({
    '9': 'All',
    '10': 'All',
  });

  const isStudentUser = user?.role === 'student';

  const matchedStudent = React.useMemo(() => {
    if (!isStudentUser || !user) return undefined;
    if (user.linkedStudentId) {
      const byId = students.find((s) => s.id === user.linkedStudentId);
      if (byId) return byId;
    }
    return students.find(
      (s) =>
        (user.linkedChildClass &&
          user.linkedChildRoll &&
          s.classId === user.linkedChildClass &&
          s.roll.trim() === user.linkedChildRoll.trim()) ||
        (user.registrationNo && s.registrationNo === user.registrationNo)
    );
  }, [isStudentUser, user, students]);

  const lockedStudentClassId = React.useMemo(() => {
    if (!isStudentUser) return '';
    return (matchedStudent?.classId || user?.linkedChildClass || '').trim();
  }, [isStudentUser, matchedStudent?.classId, user?.linkedChildClass]);

  const allSyllabuses = React.useMemo(() => buildAllNctbSyllabuses(subjects), [subjects]);

  // Strict student isolation: students see ONLY their own class's syllabus and NEVER any other class
  const roleScopedSyllabuses = React.useMemo(() => {
    if (isStudentUser) {
      if (!lockedStudentClassId) return [];
      return allSyllabuses.filter((item) => item.classId === lockedStudentClassId);
    }
    return allSyllabuses;
  }, [isStudentUser, lockedStudentClassId, allSyllabuses]);

  const filteredSyllabus = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return roleScopedSyllabuses;
    return roleScopedSyllabuses.filter(
      (item) =>
        t(item.className).toLowerCase().includes(q) ||
        item.subjects.some(
          (s) =>
            t(s.name).toLowerCase().includes(q) ||
            t(s.chaptersOutline).toLowerCase().includes(q) ||
            s.code.includes(q) ||
            s.chapters.some(
              (ch) =>
                t(ch.chapterTitle).toLowerCase().includes(q) ||
                t(ch.topics).toLowerCase().includes(q)
            )
        )
    );
  }, [roleScopedSyllabuses, searchTerm, t]);

  const getGroupLabel = (group?: StudyGroup | 'All') => {
    switch (group) {
      case 'Science':
        return lang === 'bn' ? 'বিজ্ঞান' : 'Science';
      case 'Humanities':
        return lang === 'bn' ? 'মানবিক' : 'Humanities';
      case 'Business Studies':
        return lang === 'bn' ? 'ব্যবসায় শিক্ষা' : 'Business';
      default:
        return lang === 'bn' ? 'আবশ্যিক' : 'Common';
    }
  };

  const handleDownloadClassSyllabus = async (item: NctbClassSyllabus) => {
    if (downloadingClassId) return;
    const isSecondary = item.classId === '9' || item.classId === '10';
    const activeGroup = selectedGroups[item.classId] || 'All';
    const visibleSubs = isSecondary
      ? item.subjects.filter((sub) => {
          if (activeGroup === 'All') return true;
          if (activeGroup === 'Common') return sub.group === 'Common';
          return sub.group === 'Common' || sub.group === activeGroup;
        })
      : item.subjects;

    const groupLabel = isSecondary
      ? activeGroup === 'All'
        ? lang === 'bn'
          ? 'সকল বিভাগ'
          : 'All Groups'
        : getGroupLabel(activeGroup)
      : undefined;

    setDownloadingClassId(item.classId);
    try {
      await downloadSyllabusPdf({
        schoolName: t(settings.name),
        eiin: settings.eiin,
        location: t(settings.location),
        className: t(item.className),
        classId: item.classId,
        year: String(getDhakaYear()),
        lang,
        groupLabel,
        portalUrl: item.nctbPortalUrl,
        subjects: visibleSubs,
        translate: t,
      });
    } finally {
      setDownloadingClassId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300/70 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)' : 'National Curriculum & Textbook Board (NCTB)'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
          {isStudentUser && lockedStudentClassId
            ? lang === 'bn'
              ? `${lockedStudentClassId}ম শ্রেণীর NCTB সিলেবাস ও বিষয়সমূহ`
              : `Class ${lockedStudentClassId} NCTB Approved Syllabus`
            : lang === 'bn'
            ? '২০২৬ শিক্ষাবর্ষের NCTB সিলেবাস ও বিষয়সমূহ'
            : '2026 NCTB Approved Academic Syllabus'}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium text-sm sm:text-base">
          {isStudentUser
            ? lang === 'bn'
              ? 'শিক্ষার্থী অ্যাকাউন্টের নীতিমালা অনুযায়ী শুধুমাত্র আপনার নিজের শ্রেণীর সকল বিষয়ের NCTB অনুমোদিত সিলেবাস এখানে প্রদর্শিত হচ্ছে।'
              : 'Per student access policy, only the official NCTB syllabus for all subjects of your enrolled class is shown here.'
            : lang === 'bn'
            ? '৬ষ্ঠ থেকে ৮ম শ্রেণীতে একই অভিন্ন বিষয় এবং ৯ম–১০ম শ্রেণীতে বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগ অনুযায়ী NCTB অনুমোদিত সকল বিষয়।'
            : 'Unified NCTB subjects across Classes 6–8 and group-based subjects (Science, Humanities & Business Studies) for Classes 9–10.'}
        </p>
      </div>

      {isStudentUser && lockedStudentClassId && (
        <div className="max-w-3xl mx-auto bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-emerald-900 dark:text-emerald-200">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === 'bn'
                ? `লগইনকৃত শ্রেণী: ${lockedStudentClassId}ম শ্রেণী — শুধুমাত্র আপনার শ্রেণীর সকল বিষয়ের NCTB সিলেবাস প্রদর্শিত হচ্ছে (অন্যান্য শ্রেণী সীমাবদ্ধ)।`
                : `Enrolled Class: Class ${lockedStudentClassId} — Displaying all NCTB subjects for your class only (other classes are restricted).`}
            </span>
          </span>
          <a
            href="https://nctb.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shrink-0"
          >
            <span>{lang === 'bn' ? 'NCTB ওয়েবসাইট' : 'NCTB Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {isStudentUser && !lockedStudentClassId ? (
        <div className="max-w-xl mx-auto bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-3xl p-8 text-center space-y-3">
          <Lock className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {lang === 'bn' ? 'আপনার শ্রেণী এখনো নির্ধারিত হয়নি' : 'Class Not Linked Yet'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            {lang === 'bn'
              ? 'শুধুমাত্র নিজ শ্রেণীর সিলেবাস দেখার জন্য আপনার শিক্ষার্থী অ্যাকাউন্টে শ্রেণী যুক্ত থাকতে হবে। অনুগ্রহ করে অ্যাডমিন বা শ্রেণী শিক্ষকের সাথে যোগাযোগ করুন।'
              : 'Your student account must have an assigned class to view your class syllabus. Please contact Admin or your Class Teacher.'}
          </p>
        </div>
      ) : (
        <>
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder={
                isStudentUser
                  ? lang === 'bn'
                    ? 'আপনার শ্রেণীর বিষয় বা কোড খুঁজুন...'
                    : 'Search subject or NCTB code in your class...'
                  : lang === 'bn'
                  ? 'শ্রেণী, বিষয় বা কোড খুঁজুন...'
                  : 'Search class, subject, or code...'
              }
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div
            className={
              filteredSyllabus.length === 1
                ? 'max-w-3xl mx-auto'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7'
            }
          >
            {filteredSyllabus.map((item) => {
              const isSecondary = item.classId === '9' || item.classId === '10';
              const activeGroup = selectedGroups[item.classId] || 'All';
              const queryLower = searchTerm.trim().toLowerCase();
              const visibleSubjects = (
                isSecondary
                  ? item.subjects.filter((sub) => {
                      if (activeGroup === 'All') return true;
                      if (activeGroup === 'Common') return sub.group === 'Common';
                      return sub.group === 'Common' || sub.group === activeGroup;
                    })
                  : item.subjects
              ).filter((sub) => {
                if (!queryLower || t(item.className).toLowerCase().includes(queryLower)) return true;
                return (
                  t(sub.name).toLowerCase().includes(queryLower) ||
                  t(sub.chaptersOutline).toLowerCase().includes(queryLower) ||
                  sub.code.includes(queryLower) ||
                  sub.chapters.some(
                    (ch) =>
                      t(ch.chapterTitle).toLowerCase().includes(queryLower) ||
                      t(ch.topics).toLowerCase().includes(queryLower)
                  )
                );
              });

              return (
                <div
                  key={item.classId}
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="bg-emerald-900 p-6 text-white flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-black">{t(item.className)}</h3>
                        <p className="text-xs text-emerald-100/85 mt-0.5">
                          {isSecondary
                            ? lang === 'bn'
                              ? `NCTB অনুমোদিত সকল বিষয় (${visibleSubjects.length}টি) · ২০২৬`
                              : `NCTB Approved Subjects (${visibleSubjects.length}) · 2026`
                            : lang === 'bn'
                            ? `৬ষ্ঠ–৮ম NCTB সিলেবাস (${visibleSubjects.length}টি বিষয়) · ২০২৬`
                            : `NCTB Junior Syllabus (${visibleSubjects.length} Subjects) · 2026`}
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 opacity-30 shrink-0" />
                    </div>

                    {isSecondary && (
                      <div className="px-4 pt-4">
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          {GROUP_TABS.map((tab) => {
                            const isActive = activeGroup === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() =>
                                  setSelectedGroups((prev) => ({
                                    ...prev,
                                    [item.classId]: tab.id,
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                                  isActive
                                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {lang === 'bn' ? tab.bn : tab.en}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div
                      className={`p-6 space-y-3.5 ${
                        filteredSyllabus.length === 1 ? '' : 'max-h-[520px] overflow-y-auto'
                      }`}
                    >
                      {visibleSubjects.map((subject, idx) => (
                        <div
                          key={`${subject.code}-${subject.group}-${idx}`}
                          className="pb-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                              <span className="truncate">{t(subject.name)}</span>
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold tabular-nums">
                                {subject.totalMarks} {lang === 'bn' ? 'নম্বর' : 'Marks'}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 text-xs font-mono tabular-nums">
                                #{subject.code}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pl-6 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            <span>{t(subject.marksBreakdown)}</span>
                            {isSecondary && subject.group && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {getGroupLabel(subject.group)}
                              </span>
                            )}
                          </div>

                          {subject.chapters && subject.chapters.length > 0 && (
                            <div className="pl-6 space-y-1.5 pt-1">
                              {subject.chapters.map((ch, chIdx) => (
                                <div
                                  key={chIdx}
                                  className="pl-2.5 border-l-2 border-emerald-500/40 space-y-0.5"
                                >
                                  <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 leading-snug">
                                    {t(ch.chapterTitle)}
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                    {lang === 'bn' ? 'টপিক: ' : 'Topics: '}
                                    {t(ch.topics)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      disabled={downloadingClassId === item.classId}
                      onClick={() => handleDownloadClassSyllabus(item)}
                      className="flex-1 bg-slate-900 dark:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-wait transition-colors"
                    >
                      {downloadingClassId === item.classId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {downloadingClassId === item.classId
                        ? lang === 'bn'
                          ? 'PDF তৈরি হচ্ছে...'
                          : 'Generating PDF...'
                        : lang === 'bn'
                        ? 'সিলেবাস ডাউনলোড'
                        : 'Download Syllabus'}
                    </button>
                    <a
                      href={item.nctbPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>{lang === 'bn' ? 'NCTB বই' : 'NCTB Books'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Syllabus;
