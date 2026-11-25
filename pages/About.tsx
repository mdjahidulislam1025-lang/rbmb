import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  Target,
  Eye,
  Monitor,
  Video,
  Speaker,
  ArrowRight,
  Laptop,
  Presentation,
  Wifi,
  HardDrive,
  Server,
  Users,
  Award,
} from 'lucide-react';
import { CAMPUS_BRAND, CAMPUS_TAGLINE, TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { heroCampusImg, scienceLabImg, computerLabImg, headTeacherImg } from '../src/assets/media';

const { Link } = RouterDom;

const About: React.FC = () => {
  const { lang, t, settings, teachers } = useApp();

  const itFeatures = [
    {
      icon: Wifi,
      title: lang === 'bn' ? 'হাই-স্পিড ইন্টারনেট' : 'High-Speed Fiber Network',
      desc: lang === 'bn' ? 'সার্ভার বেজড হাই-স্পিড ফাইবার অপটিক কানেক্টিভিটি।' : 'Dedicated high-speed fiber optic connectivity via central server.',
    },
    {
      icon: Monitor,
      title: lang === 'bn' ? 'আধুনিক ওয়ার্কস্টেশন' : 'Modern Workstations',
      desc: lang === 'bn' ? 'প্রতিটি শিক্ষার্থীর জন্য আলাদা আধুনিক ডেস্কটপ পিসি।' : 'Dedicated workstations for hands-on ICT practical classes.',
    },
    {
      icon: HardDrive,
      title: lang === 'bn' ? 'সফটওয়্যার ও প্রোগ্রামিং' : 'Software & Coding Suite',
      desc: lang === 'bn' ? 'অফিস অ্যাপ্লিকেশন, গ্রাফিক্স ডিজাইন ও বেসিক কোডিং টুলস।' : 'Full suite of Office, Graphics, and introductory programming tools.',
    },
    {
      icon: Server,
      title: lang === 'bn' ? 'সেন্ট্রাল ল্যান' : 'Central Campus LAN',
      desc: lang === 'bn' ? 'নিরাপদ ব্রাউজিং এবং ল্যান ভিত্তিক ডিজিটাল রিসোর্স শেয়ারিং।' : 'Secure local area network for safe digital library browsing.',
    },
  ];

  const multimediaFeatures = [
    {
      icon: Presentation,
      title: lang === 'bn' ? 'স্মার্ট প্রজেক্টর সিস্টেম' : 'Smart Projector System',
      desc: lang === 'bn' ? 'শ্রেণিকক্ষে ইন্টারঅ্যাকটিভ এইচডি প্রজেক্টর সুবিধা।' : 'Interactive HD projector facilities in digital classrooms.',
    },
    {
      icon: Speaker,
      title: lang === 'bn' ? 'অডিও-ভিজ্যুয়াল লার্নিং' : 'Audio-Visual Learning',
      desc: lang === 'bn' ? 'পরিষ্কার সাউন্ড সিস্টেমের মাধ্যমে পাঠদান সহজ করা হয়।' : 'Simplified learning through clear classroom audio systems.',
    },
    {
      icon: Video,
      title: lang === 'bn' ? 'ডিজিটাল কন্টেন্ট' : 'Digital Content',
      desc: lang === 'bn' ? 'পাঠ্যবইয়ের জটিল বিষয়গুলো ভিজ্যুয়াল উপস্থাপনা।' : 'Visual presentation of science and math concepts.',
    },
    {
      icon: Laptop,
      title: lang === 'bn' ? 'টিচার্স ল্যাপটপ সাপোর্ট' : 'Teacher Laptop Support',
      desc: lang === 'bn' ? 'শিক্ষকদের জন্য ডিজিটাল প্রেজেন্টেশন ও ক্লাস ম্যানেজমেন্ট কিট।' : 'Dedicated presentation tools for classroom instruction.',
    },
  ];

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-500">
      {/* Header Banner */}
      <section className="relative h-[380px] flex items-center justify-center overflow-hidden bg-slate-900">
        <img
          src={settings.schoolPhoto || heroCampusImg}
          onError={(e) => {
            (e.target as HTMLImageElement).src = heroCampusImg;
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          alt={t(settings.name)}
        />
        <div className="relative z-20 text-center space-y-4 px-4 max-w-3xl">
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest">
            {t(CAMPUS_BRAND)} · EIIN {settings.eiin} · Est. 1958
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {t(settings.name)}
          </h1>
          <p className="text-slate-200 font-medium text-base md:text-lg">
            {t(settings.tagline || CAMPUS_TAGLINE)}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* History & Identity */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
              {lang === 'bn' ? 'বিদ্যালয়ের ইতিহাস ও ঐতিহ্য' : 'Heritage & Identity'}
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {lang === 'bn' ? 'ঐতিহ্য ও আধুনিক শিক্ষার সমন্বয়' : 'Tradition Meets Digital Learning'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
              {lang === 'bn'
                ? `${t(settings.name)} কুমিল্লার চৌদ্দগ্রাম অঞ্চলের একটি ঐতিহ্যবাহী মাধ্যমিক শিক্ষা প্রতিষ্ঠান। ১৯৫৮ সাল থেকে নৈতিক মূল্যবোধ, বিজ্ঞানমনস্ক পাঠদান এবং ডিজিটাল ক্যাম্পাস উদ্যোগের মাধ্যমে আমরা মানসম্মত শিক্ষা বিস্তার করে আসছি।`
                : `${t(settings.name)} is a respected secondary institution in Chauddagram, Cumilla. Since 1958, we have combined disciplined scholarship, scientific curiosity, and digital campus tools to serve generations of students.`}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">1958</span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'bn' ? 'প্রতিষ্ঠাকাল' : 'Year Founded'}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">6–10</span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'bn' ? 'মাধ্যমিক শ্রেণি' : 'Secondary Grades'}
                </p>
              </div>
            </div>
          </div>
          <div>
            <img
              src={scienceLabImg}
              className="rounded-2xl shadow-xl w-full aspect-[4/3] object-cover border border-slate-200 dark:border-slate-800"
              alt="School Science Lab"
            />
          </div>
        </section>

        {/* Academic Leadership & Governance */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="space-y-1.5">
              <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> {lang === 'bn' ? 'নেতৃত্ব ও একাডেমিক পরিচালনা' : 'Leadership & Governance'}
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'বিদ্যালয় প্রশাসন ও শিক্ষকমণ্ডলী' : 'School Administration & Senior Faculty'}
              </h2>
            </div>
            <Link
              to="/teachers"
              className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              {lang === 'bn' ? 'সকল শিক্ষক দেখুন' : 'Full Faculty Directory'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <img
                src={settings.headTeacherPhoto || headTeacherImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = headTeacherImg;
                }}
                alt={t(settings.headTeacherName)}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher'}
                </p>
                <h3 className="font-black text-slate-900 dark:text-white truncate">{t(settings.headTeacherName)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t(settings.name)}</p>
              </div>
            </div>

            {teachers.slice(1, 3).map((tc) => (
              <div
                key={tc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-lg shrink-0">
                  {tc.photo ? (
                    <img src={tc.photo} alt={t(tc.name)} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    t(tc.name).slice(0, 1)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t(tc.designation)}
                  </p>
                  <h3 className="font-black text-slate-900 dark:text-white truncate">{t(tc.name)}</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate">{t(tc.subject)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modern IT & Computer Lab */}
        <section className="space-y-8">
          <div className="space-y-2">
            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Information Technology
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আধুনিক আইটি ও কম্পিউটার ল্যাব' : 'Modern IT & Digital Learning Lab'}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 min-h-[340px]">
              <img src={computerLabImg} className="w-full h-full object-cover" alt="School Computer Lab" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end p-6">
                <div className="space-y-1">
                  <p className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
                    Digital Computer Lab
                  </p>
                  <h4 className="text-xl font-black text-white leading-tight">
                    {lang === 'bn' ? 'ডিজিটাল প্রযুক্তিতে বাস্তব অভিজ্ঞতা' : 'Hands-on ICT & Practical Learning'}
                  </h4>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {itFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 w-11 h-11 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-black text-base text-slate-900 dark:text-white">{feature.title}</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Multimedia Classroom */}
        <section className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Presentation className="w-4 h-4" /> Multimedia Classrooms
            </p>
            <h2 className="text-2xl md:text-4xl font-black leading-tight">
              {lang === 'bn' ? 'আধুনিক ক্লাসরুম ও স্মার্ট পাঠদান' : 'Interactive Smart Classrooms'}
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {lang === 'bn'
                ? 'ডিজিটাল কন্টেন্ট ব্যবহারের মাধ্যমে পাঠদানকে আরও আনন্দদায়ক ও কার্যকর করতে মাল্টিমিডিয়া প্রযুক্তি ব্যবহার করা হয়।'
                : 'Multimedia visual tools make daily classroom instruction clearer, engaging, and effective.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {multimediaFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3">
                <feature.icon className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">{feature.title}</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/60 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
              {lang === 'bn'
                ? 'শিক্ষার্থীদের একবিংশ শতাব্দীর চ্যালেঞ্জ মোকাবিলায় যোগ্য, প্রযুক্তিনির্ভর ও নৈতিক মূল্যবোধসম্পন্ন সুনাগরিক হিসেবে গড়ে তোলা।'
                : 'To develop students into capable, tech-literate, and ethically grounded citizens ready for the 21st century.'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/60 w-12 h-12 rounded-xl flex items-center justify-center text-blue-700 dark:text-blue-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আমাদের স্বপ্ন' : 'Our Vision'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
              {lang === 'bn'
                ? 'প্রযুক্তি ও মেধার সমন্বয়ে একটি আদর্শ আধুনিক ডিজিটাল শিক্ষা প্রতিষ্ঠান হিসেবে নিজেদের প্রতিষ্ঠিত করা।'
                : 'To establish রাণীর বাজার মাধ্যমিক বিদ্যালয় as a model center of academic excellence and smart school governance.'}
            </p>
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-emerald-800 py-12 px-6 text-center text-white rounded-2xl space-y-5">
          <div className="inline-flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-widest">
            <Award className="w-4 h-4" /> {t(TRANSLATIONS.nav.aboutSchool)}
          </div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight">
            {lang === 'bn' ? 'আমাদের সাথে আপনার পথচলা শুরু হোক' : 'Begin Your Academic Journey'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/admission"
              className="bg-yellow-400 text-emerald-950 px-7 py-3.5 rounded-xl font-black text-sm hover:bg-white transition-colors flex items-center gap-2"
            >
              {lang === 'bn' ? 'অনলাইন ভর্তি আবেদন' : 'Online Admission'} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="bg-white/15 text-white border border-white/25 px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-white/25 transition-colors"
            >
              {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
