import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  Clock,
  Calendar,
  FileDown,
  BookOpen,
  Coffee,
  GraduationCap,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';

const { Link } = RouterDom;

const Routine: React.FC = () => {
  const { lang, t, examRoutines, classRoutines } = useApp();
  const [routineTab, setRoutineTab] = React.useState<'class' | 'exam'>('class');
  const [selectedClassId, setSelectedClassId] = React.useState(classRoutines[0]?.classId || '6');

  const selectedRoutine = classRoutines.find((r) => r.classId === selectedClassId) || classRoutines[0];

  const filteredExamRoutines = React.useMemo(
    () => examRoutines.filter((r) => r.classId === selectedClassId),
    [examRoutines, selectedClassId]
  );

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math') || s.includes('গণিত'))
      return (
        <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
          <GraduationCap className="w-5 h-5" />
        </div>
      );
    if (s.includes('science') || s.includes('বিজ্ঞান'))
      return (
        <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
          <BookOpen className="w-5 h-5" />
        </div>
      );
    if (s.includes('english') || s.includes('ইংরেজি'))
      return (
        <div className="p-2 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-xl">
          <Coffee className="w-5 h-5" />
        </div>
      );
    if (s.includes('bangla') || s.includes('বাংলা'))
      return (
        <div className="p-2 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 rounded-xl">
          <MapPin className="w-5 h-5" />
        </div>
      );
    return (
      <div className="p-2 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-xl">
        <BookOpen className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8 no-print">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/70 text-green-700 dark:text-green-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-green-200 dark:border-green-800">
            <Calendar className="w-4 h-4" /> Academic Schedule 2026
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'bn' ? 'ক্লাস ও পরীক্ষার রুটিন' : t(TRANSLATIONS.nav.routine)}{' '}
            <span className="text-green-700 dark:text-green-400">২০২৬</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-xl font-medium text-base">
            {lang === 'bn'
              ? 'নিয়মিত ক্লাসের সময়সূচি এবং পরীক্ষার রুটিন এখান থেকে দেখুন ও প্রিন্ট করুন।'
              : 'View and print regular class timetables and upcoming examination schedules by class.'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-slate-900 dark:bg-green-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-green-700 dark:hover:bg-green-800 transition-all shadow-lg shrink-0"
        >
          <FileDown className="w-4 h-4" />
          {lang === 'bn' ? 'প্রিন্ট / PDF ডাউনলোড' : 'Print / Save PDF'}
        </button>
      </div>

      {/* Mode Switch & Class Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setRoutineTab('class')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              routineTab === 'class'
                ? 'bg-white dark:bg-slate-900 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {lang === 'bn' ? 'ক্লাস রুটিন' : 'Class Routine'}
          </button>
          <button
            onClick={() => setRoutineTab('exam')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              routineTab === 'exam'
                ? 'bg-white dark:bg-slate-900 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            {lang === 'bn' ? 'পরীক্ষার রুটিন' : 'Exam Routine'}
          </button>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-1">
          {classRoutines.map((routine) => (
            <button
              key={routine.classId}
              onClick={() => setSelectedClassId(routine.classId)}
              className={`px-5 py-2.5 rounded-xl font-black whitespace-nowrap transition-all border text-xs uppercase tracking-wider ${
                selectedClassId === routine.classId
                  ? 'bg-green-700 border-green-700 text-white shadow'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-green-400'
              }`}
            >
              {t(routine.className)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {routineTab === 'class' && selectedRoutine && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(Array.isArray(selectedRoutine.schedule) ? selectedRoutine.schedule : []).map((dayData, idx) => {
            const periods = Array.isArray(dayData.periods) ? dayData.periods : [];
            return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl text-green-700 dark:text-green-400 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">{t(dayData.day)}</h3>
                </div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {periods.length} Classes
                </span>
              </div>

              <div className="p-5 space-y-3 flex-grow">
                {periods.map((period, pIdx) => (
                  <div
                    key={pIdx}
                    className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-700 transition-colors"
                  >
                    <div className="relative shrink-0">
                      {getSubjectIcon(t(period.subject))}
                      <span className="absolute -top-1 -left-1 w-5 h-5 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                        {pIdx + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-slate-900 dark:text-white text-sm leading-tight">
                        {t(period.subject)}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {period.time}
                        </span>
                        <span>• {t(period.teacher)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {routineTab === 'exam' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {filteredExamRoutines.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <ClipboardList className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-bold">
                {lang === 'bn'
                  ? 'এই শ্রেণীর জন্য এখনো পরীক্ষার রুটিন যুক্ত করা হয়নি।'
                  : 'No exam routine published yet for this class.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="px-6 py-4">{lang === 'bn' ? 'পরীক্ষার নাম' : 'Exam Term'}</th>
                    <th className="px-6 py-4">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                    <th className="px-6 py-4">{lang === 'bn' ? 'সময়' : 'Time'}</th>
                    <th className="px-6 py-4">{lang === 'bn' ? 'কক্ষ' : 'Room'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredExamRoutines.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-black text-slate-900 dark:text-white">{item.date}</td>
                      <td className="px-6 py-4 font-bold text-emerald-700 dark:text-emerald-400">{item.examTerm}</td>
                      <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-100">{item.subject}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{item.time}</td>
                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">{item.room || 'Hall 1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-black">{lang === 'bn' ? 'জরুরি পরিবর্তনের আপডেট' : 'Need Schedule Updates?'}</h2>
          <p className="text-slate-400 text-sm max-w-xl font-medium">
            {lang === 'bn'
              ? 'বিশেষ প্রয়োজনে রুটিন পরিবর্তিত হলে ডিজিটাল নোটিশ বোর্ডে তাৎক্ষণিক জানানো হয়।'
              : 'Any emergency schedule changes are published immediately on our official Notice Board.'}
          </p>
        </div>
        <Link
          to="/notices"
          className="bg-green-600 text-white px-7 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-green-700 transition-all shrink-0"
        >
          {lang === 'bn' ? 'নোটিশ বোর্ড দেখুন' : 'Go to Notice Board'}
        </Link>
      </div>
    </div>
  );
};

export default Routine;
