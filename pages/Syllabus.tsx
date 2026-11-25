import * as React from 'react';
import { BookOpen, Download, FileText, Search } from 'lucide-react';
import { SYLLABUS_2026 } from '../constants';
import { useApp } from '../App';
import { StudyGroup } from '../types';

type GroupFilterOption = 'All' | StudyGroup;

const GROUP_TABS: { id: GroupFilterOption; bn: string; en: string }[] = [
  { id: 'All', bn: 'সকল বিভাগ', en: 'All' },
  { id: 'Common', bn: 'আবশ্যিক', en: 'Common' },
  { id: 'Science', bn: 'বিজ্ঞান', en: 'Science' },
  { id: 'Humanities', bn: 'মানবিক', en: 'Humanities' },
  { id: 'Business Studies', bn: 'ব্যবসায় শিক্ষা', en: 'Business' },
];

const Syllabus: React.FC = () => {
  const { lang, t, settings } = useApp();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedGroups, setSelectedGroups] = React.useState<Record<string, GroupFilterOption>>({
    '9': 'All',
    '10': 'All',
  });

  const filteredSyllabus = SYLLABUS_2026.filter(
    (item) =>
      t(item.className).toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjects.some(
        (s) =>
          t(s.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.code.includes(searchTerm.trim())
      )
  );

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

  const handleDownloadClassSyllabus = (item: (typeof SYLLABUS_2026)[number]) => {
    const isSecondary = item.classId === '9' || item.classId === '10';
    const activeGroup = selectedGroups[item.classId] || 'All';
    const visibleSubs = isSecondary
      ? item.subjects.filter((sub) => {
          if (activeGroup === 'All') return true;
          if (activeGroup === 'Common') return sub.group === 'Common';
          return sub.group === 'Common' || sub.group === activeGroup;
        })
      : item.subjects;

    const lines = [
      `${t(settings.name)} - NCTB ACADEMIC SYLLABUS 2026`,
      `===========================================================`,
      `Class: ${t(item.className)}${isSecondary ? ` (Group Filter: ${activeGroup})` : ' (NCTB Common Junior Secondary Curriculum)'}`,
      ``,
      `Subjects & NCTB Codes:`,
      ...visibleSubs.map(
        (sub, i) =>
          `${i + 1}. ${t(sub.name)} (Code: #${sub.code})${isSecondary && sub.group ? ` — [${sub.group}]` : ''}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NCTB_Syllabus_Class_${item.classId}_2026.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
          {lang === 'bn' ? '২০২৬ শিক্ষাবর্ষের NCTB সিলেবাস ও বিষয়সমূহ' : '2026 NCTB Approved Academic Syllabus'}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium text-sm sm:text-base">
          {lang === 'bn'
            ? '৬ষ্ঠ থেকে ৮ম শ্রেণীতে একই অভিন্ন বিষয় এবং ৯ম–১০ম শ্রেণীতে বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগ অনুযায়ী NCTB অনুমোদিত সকল বিষয়।'
            : 'Unified NCTB subjects across Classes 6–8 and group-based subjects (Science, Humanities & Business Studies) for Classes 9–10.'}
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder={lang === 'bn' ? 'শ্রেণী, বিষয় বা কোড খুঁজুন...' : 'Search class, subject, or code...'}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredSyllabus.map((item) => {
          const isSecondary = item.classId === '9' || item.classId === '10';
          const activeGroup = selectedGroups[item.classId] || 'All';
          const visibleSubjects = isSecondary
            ? item.subjects.filter((sub) => {
                if (activeGroup === 'All') return true;
                if (activeGroup === 'Common') return sub.group === 'Common';
                return sub.group === 'Common' || sub.group === activeGroup;
              })
            : item.subjects;

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
                          ? 'বিভাগভিত্তিক NCTB বিষয় · ২০২৬'
                          : 'Group-wise NCTB Subjects · 2026'
                        : lang === 'bn'
                        ? '৬ষ্ঠ–৮ম অভিন্ন NCTB বিষয় · ২০২৬'
                        : 'Unified NCTB Subjects (6–8) · 2026'}
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

                <div className="p-6 space-y-2 max-h-[420px] overflow-y-auto">
                  {visibleSubjects.map((subject, idx) => (
                    <div
                      key={`${subject.code}-${idx}`}
                      className="flex items-center justify-between gap-2 text-sm py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div className="min-w-0">
                        <span className="text-slate-800 dark:text-slate-100 font-semibold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{t(subject.name)}</span>
                        </span>
                        {isSecondary && subject.group && (
                          <p className="text-[11px] text-slate-400 pl-6">
                            {getGroupLabel(subject.group)}
                          </p>
                        )}
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-mono tabular-nums shrink-0">
                        #{subject.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-2">
                <button
                  onClick={() => handleDownloadClassSyllabus(item)}
                  className="w-full bg-slate-900 dark:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
                >
                  <Download className="w-4 h-4" />{' '}
                  {lang === 'bn' ? 'সিলেবাস ডাউনলোড' : 'Download Syllabus'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Syllabus;
