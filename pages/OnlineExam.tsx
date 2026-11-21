import * as React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  BookOpen,
  Play,
  RotateCcw,
  Award,
  Sparkles,
  History,
  Filter,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../App';
import { OnlineExam as OnlineExamType, ExamAttempt } from '../types';

const { useState, useEffect, useMemo } = React;

const OnlineExam: React.FC = () => {
  const {
    lang,
    t,
    user,
    onlineExams,
    examAttempts,
    submitExamAttempt,
  } = useApp();

  const [viewMode, setViewMode] = useState<'catalog' | 'taking' | 'result' | 'history' | 'leaderboard'>('catalog');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [modeFilter, setModeFilter] = useState<'all' | 'exam' | 'practice'>('all');

  const [activeExam, setActiveExam] = useState<OnlineExamType | null>(null);
  const [runAsPractice, setRunAsPractice] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [latestResult, setLatestResult] = useState<ExamAttempt | null>(null);

  const subjects = useMemo(() => {
    const set = new Set<string>(onlineExams.map((e) => e.subject));
    return ['All', ...Array.from(set)];
  }, [onlineExams]);

  const filteredExams = useMemo(() => {
    return onlineExams.filter((ex) => {
      if (classFilter !== 'All' && ex.classId !== classFilter) return false;
      if (subjectFilter !== 'All' && ex.subject !== subjectFilter) return false;
      if (modeFilter !== 'all' && ex.mode !== modeFilter) return false;
      return true;
    });
  }, [onlineExams, classFilter, subjectFilter, modeFilter]);

  const handleFinishExam = React.useCallback(() => {
    if (!activeExam) return;
    let score = 0;
    activeExam.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score += 1;
    });
    const totalQuestions = activeExam.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      examId: activeExam.id,
      examTitle: t(activeExam.title),
      subject: activeExam.subject,
      classId: activeExam.classId,
      studentId: user?.userId || 'guest',
      studentName: user?.name || (lang === 'bn' ? 'অতিথি শিক্ষার্থী' : 'Guest Student'),
      roll: user?.linkedChildRoll || '01',
      score,
      totalQuestions,
      percentage,
      answers,
      timeSpentSeconds: elapsedSeconds,
      submittedAt: new Date().toLocaleString(),
    };
    submitExamAttempt(attempt);
    setLatestResult(attempt);
    setViewMode('result');
  }, [activeExam, answers, elapsedSeconds, lang, submitExamAttempt, t, user]);

  useEffect(() => {
    if (viewMode !== 'taking' || !activeExam) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (!runAsPractice) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [viewMode, activeExam, runAsPractice, handleFinishExam]);

  const startExam = (exam: OnlineExamType, practice: boolean) => {
    setActiveExam(exam);
    setRunAsPractice(practice);
    setAnswers({});
    setSecondsLeft(exam.durationMinutes * 60);
    setElapsedSeconds(0);
    setViewMode('taking');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const leaderboardEntries = useMemo(() => {
    const byStudent: Record<string, { name: string; classId: string; attempts: number; totalPct: number; bestPct: number }> = {};
    examAttempts.forEach((att) => {
      const key = `${att.studentId}-${att.classId}`;
      if (!byStudent[key]) {
        byStudent[key] = {
          name: att.studentName,
          classId: att.classId,
          attempts: 0,
          totalPct: 0,
          bestPct: 0,
        };
      }
      byStudent[key].attempts += 1;
      byStudent[key].totalPct += att.percentage;
      byStudent[key].bestPct = Math.max(byStudent[key].bestPct, att.percentage);
    });
    return Object.values(byStudent)
      .map((item) => ({ ...item, avgPct: Math.round(item.totalPct / item.attempts) }))
      .sort((a, b) => b.avgPct - a.avgPct || b.bestPct - a.bestPct)
      .slice(0, 10);
  }, [examAttempts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-300">
            <Sparkles className="w-4 h-4" />
            {lang === 'bn' ? 'অনলাইন MCQ ও অনুশীলন পরীক্ষা' : 'Online MCQ Assessment & Practice Center'}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {lang === 'bn' ? 'অনলাইন পরীক্ষা ও কুইজ পোর্টাল' : 'Online Examination System'}
          </h1>
          <p className="text-emerald-100 text-sm md:text-base">
            {lang === 'bn'
              ? 'বিষয়ভিত্তিক ও অধ্যায়ভিত্তিক নির্ধারিত সময়ের MCQ পরীক্ষা, তাৎক্ষণিক ফলাফল ও ভুল-সঠিক উত্তরের বিশ্লেষণ।'
              : 'Timed subject & chapter-wise MCQ tests, practice mode, instant grading, and answer explanations.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('catalog')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'catalog' || viewMode === 'taking' || viewMode === 'result'
                ? 'bg-white text-green-900 shadow-lg'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <BookOpen className="w-4 h-4" /> {lang === 'bn' ? 'সকল পরীক্ষা' : 'All Exams'}
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'history' ? 'bg-white text-green-900 shadow-lg' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <History className="w-4 h-4" /> {lang === 'bn' ? `পরীক্ষার ইতিহাস (${examAttempts.length})` : `History (${examAttempts.length})`}
          </button>
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'leaderboard' ? 'bg-white text-green-900 shadow-lg' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Trophy className="w-4 h-4" /> {lang === 'bn' ? 'লিডারবোর্ড' : 'Leaderboard'}
          </button>
        </div>
      </div>

      {/* CATALOG VIEW */}
      {viewMode === 'catalog' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-4 h-4 text-green-700 dark:text-green-400" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                aria-label="Filter by Class"
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="All">{lang === 'bn' ? 'সকল শ্রেণী' : 'All Classes'}</option>
                {['6', '7', '8', '9', '10'].map((c) => (
                  <option key={c} value={c}>
                    {lang === 'bn' ? `${c}ম শ্রেণী` : `Class ${c}`}
                  </option>
                ))}
              </select>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                aria-label="Filter by Subject"
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === 'All' ? (lang === 'bn' ? 'সকল বিষয়' : 'All Subjects') : sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              {(['all', 'exam', 'practice'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    modeFilter === m
                      ? 'bg-green-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m === 'all' ? (lang === 'bn' ? 'সব' : 'All') : m === 'exam' ? (lang === 'bn' ? 'সময়ভিত্তিক পরীক্ষা' : 'Timed Exam') : (lang === 'bn' ? 'প্র্যাকটিস' : 'Practice')}
                </button>
              ))}
            </div>
          </div>

          {filteredExams.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
              {lang === 'bn' ? 'নির্বাচিত ফিল্টারে কোনো পরীক্ষা পাওয়া যায়নি।' : 'No MCQ exams match your selected filters.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-green-700 dark:text-green-400 uppercase tracking-wider">
                        {lang === 'bn' ? `${exam.classId}ম শ্রেণী • ${exam.subject}` : `Class ${exam.classId} • ${exam.subject}`}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} min
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{t(exam.title)}</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{exam.chapter}</p>
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                      <span>{exam.questions.length} MCQs</span>
                      <span>{exam.createdBy}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-6">
                    <button
                      onClick={() => startExam(exam, false)}
                      className="px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> {lang === 'bn' ? 'পরীক্ষা শুরু' : 'Timed Exam'}
                    </button>
                    <button
                      onClick={() => startExam(exam, true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> {lang === 'bn' ? 'প্র্যাকটিস' : 'Practice'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAKING EXAM VIEW */}
      {viewMode === 'taking' && activeExam && (
        <div className="space-y-6">
          <div className="sticky top-24 z-30 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t(activeExam.title)}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {runAsPractice ? (lang === 'bn' ? 'ফ্রি প্র্যাকটিস মোড' : 'Untimed Practice Mode') : (lang === 'bn' ? 'নির্ধারিত সময়ের পরীক্ষা' : 'Timed Exam Mode')} • {Object.keys(answers).length}/{activeExam.questions.length} {lang === 'bn' ? 'উত্তরিত' : 'answered'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!runAsPractice && (
                <div className={`px-4 py-2 rounded-xl font-mono-code font-bold text-sm flex items-center gap-2 ${secondsLeft < 60 ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                  <Clock className="w-4 h-4" />
                  {formatTimer(secondsLeft)}
                </div>
              )}
              <button
                onClick={handleFinishExam}
                className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center gap-2 shadow-md"
              >
                {lang === 'bn' ? 'জমা দিন ও ফলাফল দেখুন' : 'Submit & View Score'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {activeExam.questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-green-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white pt-0.5">{q.question}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-11">
                  {q.options.map((opt, optIdx) => {
                    const selected = answers[q.id] === optIdx;
                    return (
                      <button
                        type="button"
                        key={optIdx}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`text-left px-4 py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all flex items-center gap-3 ${
                          selected
                            ? 'border-green-600 bg-green-50 dark:bg-green-950/60 text-green-900 dark:text-green-200'
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:border-green-300'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${selected ? 'bg-green-600 text-white border-green-600' : 'border-slate-300 dark:border-slate-600'}`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULT & EXPLANATION VIEW */}
      {viewMode === 'result' && activeExam && latestResult && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-5 shadow-lg">
            <div className="w-20 h-20 rounded-3xl bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 flex items-center justify-center mx-auto">
              <Award className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'আপনার পরীক্ষার ফলাফল' : 'Examination Result Summary'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{latestResult.examTitle}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'স্কোর' : 'Score'}</p>
                <p className="text-2xl font-extrabold text-green-700 dark:text-green-400">
                  {latestResult.score}/{latestResult.totalQuestions}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'শতকরা হার' : 'Accuracy'}</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{latestResult.percentage}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'সময় লেগেছে' : 'Time Taken'}</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatTimer(latestResult.timeSpentSeconds)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'গ্রেড' : 'Status'}</p>
                <p className={`text-2xl font-extrabold ${latestResult.percentage >= 40 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {latestResult.percentage >= 80 ? 'A+' : latestResult.percentage >= 60 ? 'A' : latestResult.percentage >= 40 ? 'Pass' : 'Retry'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => startExam(activeExam, runAsPractice)}
                className="px-6 py-3 rounded-xl bg-green-700 text-white text-xs font-bold hover:bg-green-800 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> {lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retake Test'}
              </button>
              <button
                onClick={() => setViewMode('catalog')}
                className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                {lang === 'bn' ? 'অন্যান্য পরীক্ষা দেখুন' : 'Back to Exam Catalog'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ভুল ও সঠিক উত্তরের বিস্তারিত বিশ্লেষণ' : 'Detailed Answer Review & Explanations'}
            </h3>
            {activeExam.questions.map((q, idx) => {
              const userAns = latestResult.answers[q.id];
              const isCorrect = userAns === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-3xl border bg-white dark:bg-slate-900 space-y-3 ${
                    isCorrect ? 'border-emerald-200 dark:border-emerald-900' : 'border-red-200 dark:border-red-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </h4>
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-xs font-bold text-slate-500 block">{lang === 'bn' ? 'আপনার উত্তর:' : 'Your Answer:'}</span>
                      <span className={isCorrect ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'font-bold text-red-600 dark:text-red-400'}>
                        {userAns !== undefined ? q.options[userAns] : (lang === 'bn' ? 'উত্তর দেওয়া হয়নি' : 'Not answered')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">{lang === 'bn' ? 'সঠিক উত্তর:' : 'Correct Answer:'}</span>
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">{q.options[q.correctIndex]}</span>
                    </div>
                  </div>
                  {q.explanation && (
                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-xs md:text-sm text-blue-900 dark:text-blue-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span><strong>{lang === 'bn' ? 'ব্যাখ্যা: ' : 'Explanation: '}</strong>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {viewMode === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আমার পূর্ববর্তী পরীক্ষার ফলাফল' : 'My Examination History'}
            </h2>
          </div>
          {examAttempts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-bold">
              {lang === 'bn' ? 'এখনো কোনো অনলাইন পরীক্ষায় অংশগ্রহণ করা হয়নি।' : 'No exam attempts recorded yet. Try any quiz above!'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {examAttempts.map((att) => (
                <div key={att.id} className="p-5 px-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{att.examTitle}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? `${att.classId}ম শ্রেণী` : `Class ${att.classId}`} • {att.subject} • {att.submittedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-extrabold text-green-700 dark:text-green-400">{att.score}/{att.totalQuestions}</p>
                      <p className="text-xs text-slate-500">{att.percentage}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD VIEW */}
      {viewMode === 'leaderboard' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              {lang === 'bn' ? 'অনলাইন কুইজ লিডারবোর্ড' : 'Top Performers Leaderboard'}
            </h2>
          </div>
          {leaderboardEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-bold">
              {lang === 'bn' ? 'লিডারবোর্ড দেখতে অন্তত একটি পরীক্ষা সম্পন্ন করুন।' : 'Complete a test to appear on the leaderboard.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboardEntries.map((entry, idx) => (
                <div key={`${entry.name}-${idx}`} className="p-5 px-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className={`w-9 h-9 rounded-xl font-extrabold text-sm flex items-center justify-center ${idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-orange-300 text-orange-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{entry.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? `${entry.classId}ম শ্রেণী` : `Class ${entry.classId}`} • {entry.attempts} {lang === 'bn' ? 'টি পরীক্ষা' : 'attempts'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-green-700 dark:text-green-400">{entry.avgPct}% Avg</p>
                    <p className="text-xs text-slate-400">Best: {entry.bestPct}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnlineExam;
