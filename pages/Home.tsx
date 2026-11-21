import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Award,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  ArrowRight,
  ClipboardCheck,
  Trophy,
  Quote,
  FileText,
  Calendar,
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { heroCampusImg, headTeacherImg } from '../src/assets/media';
import CampusMap from '../components/CampusMap';

const { Link } = RouterDom;

const Home: React.FC = () => {
  const { lang, t, notices, teachers, ebooks, gallery, settings, students, alumni } = useApp();

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = React.useMemo(() => {
    const list: Array<{
      url: string;
      captionBn: string;
      captionEn: string;
      tagBn: string;
      tagEn: string;
    }> = [];

    list.push({
      url: settings.schoolPhoto || heroCampusImg,
      captionBn: 'আমাদের সুসজ্জিত ও ঐতিহ্যবাহী রাণীর বাজার মাধ্যমিক বিদ্যালয় প্রাঙ্গণ',
      captionEn: 'Our historic and serene Ranir Bazar Secondary High School campus',
      tagBn: 'স্থাপিত ১৯৫৮ • স্বাগতম প্রাঙ্গণ',
      tagEn: 'Est. 1958 • Welcome Campus',
    });

    if (gallery && gallery.length > 0) {
      gallery.forEach((item) => {
        if (item.url && item.mediaType !== 'video') {
          list.push({
            url: item.url,
            captionBn: item.caption.bn || 'বিদ্যালয়ের বিভিন্ন দৃষ্টিনন্দন কার্যক্রম',
            captionEn: item.caption.en || 'Memorable school activities and events',
            tagBn: 'বিদ্যালয়ের কার্যক্রম ও ইভেন্ট',
            tagEn: 'School Activities & Events',
          });
        }
      });
    }

    if (teachers && teachers.length > 0) {
      teachers.forEach((teacher) => {
        if (teacher.photo) {
          list.push({
            url: teacher.photo,
            captionBn: `${teacher.name.bn} — ${teacher.designation.bn} (${teacher.subject.bn})`,
            captionEn: `${teacher.name.en} — ${teacher.designation.en} (${teacher.subject.en})`,
            tagBn: 'আমাদের শ্রদ্ধেয় শিক্ষকমণ্ডলী',
            tagEn: 'Our Distinguished Educators',
          });
        }
      });
    }

    return list;
  }, [settings.schoolPhoto, gallery, teachers]);

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const featuredBooks = ebooks.slice(0, 5);
  const latestNotices = notices.slice(0, 4);

  const importantLinks = [
    {
      label: lang === 'bn' ? 'শিক্ষা বোর্ড ফলাফল' : 'Education Board Result',
      path: 'http://www.educationboardresults.gov.bd/',
      external: true,
    },
    {
      label: lang === 'bn' ? 'শিক্ষক বাতায়ন (a2i)' : 'Teachers Portal (a2i)',
      path: 'https://www.teachers.gov.bd/',
      external: true,
    },
    {
      label: lang === 'bn' ? 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর' : 'DSHE Official Website',
      path: 'https://dshe.gov.bd/',
      external: true,
    },
    {
      label: lang === 'bn' ? 'ক্লাস ও পরীক্ষার রুটিন' : 'Class & Exam Routine',
      path: '/routine',
      external: false,
    },
    {
      label: lang === 'bn' ? 'একাডেমিক ক্যালেন্ডার ২০২৬' : 'Academic Calendar 2026',
      path: '/calendar',
      external: false,
    },
    {
      label: lang === 'bn' ? 'সরকারি ছুটির তালিকা ২০২৬' : 'Holiday List 2026',
      path: '/holidays',
      external: false,
    },
  ];

  const portalCards = [
    {
      role: 'student',
      icon: UserIcon,
      color: 'bg-blue-600',
      label: lang === 'bn' ? 'শিক্ষার্থী পোর্টাল' : 'Student Portal',
      sub: lang === 'bn' ? 'ফলাফল, হাজিরা ও অ্যাসাইনমেন্ট' : 'Results, Attendance & Homework',
      path: '/login/student',
    },
    {
      role: 'parent',
      icon: Users,
      color: 'bg-emerald-600',
      label: lang === 'bn' ? 'অভিভাবক পোর্টাল' : 'Parent Portal',
      sub: lang === 'bn' ? 'সন্তানের অগ্রগতি ও শিক্ষক বার্তা' : 'Progress, Grades & Teacher Chat',
      path: '/login/parent',
    },
    {
      role: 'teacher',
      icon: ShieldCheck,
      color: 'bg-purple-600',
      label: lang === 'bn' ? 'শিক্ষক পোর্টাল' : 'Teacher Portal',
      sub: lang === 'bn' ? 'হাজিরা, নম্বর ও ক্লাস ব্যবস্থাপনা' : 'Attendance, Marks & Materials',
      path: '/login/teacher',
    },
    {
      role: 'admin',
      icon: ShieldAlert,
      color: 'bg-slate-900 dark:bg-slate-700',
      label: lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin System',
      sub: lang === 'bn' ? 'সম্পূর্ণ স্কুল ও ভর্তি নিয়ন্ত্রণ' : 'Full Campus & User Control',
      path: '/login/admin',
    },
  ];

  const featureQuickLinks = [
    {
      icon: Trophy,
      title: lang === 'bn' ? 'অনলাইন MCQ পরীক্ষা' : 'Online MCQ Exams',
      desc: lang === 'bn' ? 'অধ্যায়ভিত্তিক কুইজ ও তাৎক্ষণিক ফলাফল' : 'Timed chapter quizzes & instant analysis',
      path: '/exams',
      accent: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    },
    {
      icon: BookOpen,
      title: lang === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Digital Library',
      desc: lang === 'bn' ? 'NCTB বই, নোট ও বিগত বোর্ড প্রশ্ন' : 'Textbooks, notes, practicals & tests',
      path: '/ebooks',
      accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      icon: ClipboardCheck,
      title: lang === 'bn' ? 'ভর্তি আবেদন ও স্ট্যাটাস' : 'Admission & Status',
      desc: lang === 'bn' ? 'অনলাইন আবেদন ও লাইভ ট্র্যাকিং' : 'Apply online & verify App ID live',
      path: '/admission',
      accent: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
    },
    {
      icon: GraduationCap,
      title: lang === 'bn' ? 'অ্যালামনাই নেটওয়ার্ক' : 'Alumni Network',
      desc: lang === 'bn' ? 'প্রাক্তন শিক্ষার্থীদের গর্বিত ডিরেক্টরি' : 'Connect with former RBHS graduates',
      path: '/alumni',
      accent: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
    },
  ];

  return (
    <div className="space-y-14 pb-20">
      {/* Hero Slideshow Section */}
      <section className="relative h-[500px] md:h-[640px] overflow-hidden bg-slate-900 border-b-4 border-green-700 shadow-2xl">
        {slides.map((slide, idx) => (
          <img
            key={idx}
            src={slide.url || heroCampusImg}
            alt={lang === 'bn' ? slide.captionBn : slide.captionEn}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100 z-0' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== heroCampusImg) target.src = heroCampusImg;
            }}
          />
        ))}

        {/* Contrast Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-950/35 md:bg-gradient-to-r md:from-green-950/95 md:via-green-950/55 md:to-transparent flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 bg-green-600/40 backdrop-blur-md px-4 py-2 rounded-full border border-green-400/40">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-green-100">
                  {lang === 'bn' ? slides[currentSlide]?.tagBn : slides[currentSlide]?.tagEn}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-2xl">
                {t(settings.name)}
              </h1>

              <div className="bg-black/45 backdrop-blur-md p-5 rounded-2xl border border-white/15 max-w-2xl shadow-xl">
                <p className="text-base md:text-xl font-extrabold text-yellow-300 leading-snug">
                  {lang === 'bn' ? slides[currentSlide]?.captionBn : slides[currentSlide]?.captionEn}
                </p>
                <p className="text-xs md:text-sm text-slate-200 mt-1.5 opacity-95">
                  {t(TRANSLATIONS.hero.subtitle)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link
                  to="/admission"
                  className="bg-yellow-400 hover:bg-yellow-500 text-green-950 px-7 py-3.5 rounded-2xl font-black text-sm md:text-base shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                >
                  {t(TRANSLATIONS.admission.onlineApply)} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/exams"
                  className="bg-green-700 hover:bg-green-600 text-white border border-green-400/30 px-7 py-3.5 rounded-2xl font-black text-sm md:text-base transition-all active:scale-95 flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  {lang === 'bn' ? 'অনলাইন পরীক্ষা' : 'Online Exam'}
                </Link>
                <Link
                  to="/about"
                  className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/25 px-6 py-3.5 rounded-2xl font-black text-sm md:text-base transition-all active:scale-95"
                >
                  {t(TRANSLATIONS.hero.learnMore)}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-green-700/90 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-green-700/90 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {slides.length > 1 && (
          <div className="absolute bottom-14 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/50 backdrop-blur-md py-2 px-4 rounded-full border border-white/15">
            {slides.slice(0, 8).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-7 bg-yellow-400' : 'w-2 bg-white/45 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none z-10" />
      </section>

      {/* 4 Portal Entry Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {portalCards.map((p) => (
            <Link
              key={p.role}
              to={p.path}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              <div className={`${p.color} p-3.5 rounded-2xl text-white shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                <p.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">{p.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 truncate">{p.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-green-600 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Discovery Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureQuickLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex items-start gap-4 group"
            >
              <div className={`p-3 rounded-xl shrink-0 ${item.accent}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Head Teacher's Welcome Message & School Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800 grid lg:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center text-center lg:border-r lg:border-slate-100 dark:lg:border-slate-800 lg:pr-8">
            <div className="w-40 h-44 rounded-3xl overflow-hidden shadow-lg border-4 border-emerald-50 dark:border-emerald-950 bg-slate-100 dark:bg-slate-800">
              <img
                src={settings.headTeacherPhoto || headTeacherImg}
                alt={t(settings.headTeacherName)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== headTeacherImg) target.src = headTeacherImg;
                }}
              />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
              {t(settings.headTeacherName) || (lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher')}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-0.5">
              {lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher'} • {t(settings.name)}
            </p>
            <span className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              EIIN: {settings.eiin}
            </span>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'প্রধান শিক্ষকের স্বাগত বক্তব্য ও পরিচিতি' : 'Head Teacher’s Welcome & Overview'}
            </div>
            <p className="text-slate-700 dark:text-slate-200 text-base md:text-lg leading-relaxed font-medium">
              {t(settings.headTeacherMessage)}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-xs font-black hover:bg-green-800 transition-colors"
              >
                {lang === 'bn' ? 'বিদ্যালয়ের বিস্তারিত পরিচিতি' : 'Full School History'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/teachers"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {lang === 'bn' ? 'সকল শিক্ষক দেখুন' : 'Meet Faculty'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            {
              icon: Users,
              label: t(TRANSLATIONS.stats.students),
              value: students.length > 10 ? `${students.length}+` : lang === 'bn' ? '১২০০+' : '1,200+',
            },
            {
              icon: GraduationCap,
              label: t(TRANSLATIONS.stats.teachers),
              value: teachers.length > 0 ? `${teachers.length}+` : lang === 'bn' ? '৩০+' : '30+',
            },
            {
              icon: Award,
              label: t(TRANSLATIONS.stats.passRate),
              value: lang === 'bn' ? '৯৮.৫%' : '98.5%',
            },
            {
              icon: BookOpen,
              label: t(TRANSLATIONS.stats.library),
              value: `${Math.max(ebooks.length, 10)}+ • ${alumni.length > 0 ? `${alumni.length} Alumni` : '2026'}`,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:shadow-md transition-all"
            >
              <stat.icon className="w-9 h-9 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Digital Library Preview Section */}
      {featuredBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950/70 text-green-700 dark:text-green-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {lang === 'bn' ? '২০২৬ ডিজিটাল লাইব্রেরি' : '2026 Digital Library'}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                  {t(TRANSLATIONS.ebook.title)}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl text-sm font-medium">
                  {t(TRANSLATIONS.ebook.subtitle)}
                </p>
              </div>
              <Link
                to="/ebooks"
                className="bg-green-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-green-800 transition-all flex items-center gap-2 shadow-lg shrink-0"
              >
                {t(TRANSLATIONS.ui.seeAll)} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
              {featuredBooks.map((book) => (
                <Link key={book.id} to="/ebooks" className="group relative block">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1.5">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={t(book.title)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 p-4 flex flex-col justify-between text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase bg-white/15 px-2 py-0.5 rounded">
                            {t(book.className)}
                          </span>
                          <BookOpen className="w-4 h-4 text-yellow-300" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-emerald-200 uppercase">{book.subject}</p>
                          <p className="text-sm font-black leading-snug line-clamp-3">{t(book.title)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-green-700 dark:group-hover:text-green-400">
                    {t(book.title)}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    {t(book.className)} • {book.category || 'Textbook'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Notices & Important Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-green-700 dark:text-green-400" />
              {t(TRANSLATIONS.nav.notices)}
            </h2>
            <Link
              to="/notices"
              className="text-green-700 dark:text-green-400 hover:underline font-black flex items-center text-xs uppercase tracking-wider"
            >
              {t(TRANSLATIONS.ui.seeAll)} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {latestNotices.length > 0 ? (
              latestNotices.map((notice) => {
                const parsedDate = new Date(notice.date);
                const isValidDate = !isNaN(parsedDate.getTime());
                return (
                  <Link
                    key={notice.id}
                    to="/notices"
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg transition-all flex gap-5 group"
                  >
                    <div className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 p-3 rounded-2xl h-fit flex flex-col items-center justify-center shrink-0 min-w-[70px] border border-slate-200/60 dark:border-slate-700 group-hover:bg-green-700 group-hover:text-white transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {isValidDate ? parsedDate.toLocaleString('default', { month: 'short' }) : 'INFO'}
                      </span>
                      <span className="text-2xl font-black leading-none mt-0.5">
                        {isValidDate ? parsedDate.getDate() : '--'}
                      </span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <span
                        className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-lg mb-1.5 inline-block ${
                          notice.category === 'Admission'
                            ? 'bg-blue-600 text-white'
                            : notice.category === 'Exam'
                            ? 'bg-red-600 text-white'
                            : notice.category === 'Holiday'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        {notice.category}
                      </span>
                      <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors leading-snug">
                        {t(notice.title)}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 mt-1">
                        {t(notice.description)}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                {lang === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি' : 'No notices found'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
            {t(TRANSLATIONS.ui.importantLinks)}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {importantLinks.map((link, i) =>
              link.external ? (
                <a
                  key={i}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-green-400 hover:bg-green-50/70 dark:hover:bg-green-950/30 font-bold text-sm text-slate-800 dark:text-slate-100 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl shrink-0">
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-green-600" />
                    </div>
                    <span className="truncate">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600 shrink-0" />
                </a>
              ) : (
                <Link
                  key={i}
                  to={link.path}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-green-400 hover:bg-green-50/70 dark:hover:bg-green-950/30 font-bold text-sm text-slate-800 dark:text-slate-100 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl shrink-0">
                      <Calendar className="w-4 h-4 text-slate-500 group-hover:text-green-600" />
                    </div>
                    <span className="truncate">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600 shrink-0" />
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t(TRANSLATIONS.nav.gallery)}</h2>
            <Link to="/gallery" className="text-xs font-black uppercase text-green-700 dark:text-green-400 hover:underline tracking-wider">
              {t(TRANSLATIONS.ui.seeAll)}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {gallery.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                to="/gallery"
                className="relative group overflow-hidden rounded-3xl h-52 shadow-md bg-slate-200 dark:bg-slate-800 block"
              >
                <img
                  src={item.url || heroCampusImg}
                  alt={t(item.caption)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <p className="text-white text-xs sm:text-sm font-bold leading-snug line-clamp-2">{t(item.caption)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contact & Interactive Map Section */}
      <section className="bg-slate-900 text-white py-14 rounded-[2.5rem] mx-4 md:mx-8 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight">{t(TRANSLATIONS.nav.contact)}</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="bg-green-600/20 p-3 rounded-2xl shrink-0">
                  <MapPin className="text-green-400 w-5 h-5" />
                </div>
                <p className="text-slate-300 font-medium text-sm leading-relaxed">{t(settings.location)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-600/20 p-3 rounded-2xl shrink-0">
                  <Phone className="text-green-400 w-5 h-5" />
                </div>
                <p className="text-slate-200 font-black text-base">{settings.phone}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-600/20 p-3 rounded-2xl shrink-0">
                  <Mail className="text-green-400 w-5 h-5" />
                </div>
                <p className="text-slate-300 font-bold text-sm break-all">{settings.email}</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-black uppercase tracking-wider transition-colors"
            >
              {lang === 'bn' ? 'বার্তা পাঠান' : 'Send a Message'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="md:col-span-2">
            <CampusMap
              schoolName={t(settings.name)}
              address={t(settings.location)}
              lat={settings.latitude}
              lng={settings.longitude}
              lang={lang}
              heightClass="h-[340px]"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
