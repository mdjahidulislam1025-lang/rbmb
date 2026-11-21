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
  Zap,
  Wifi,
  HardDrive,
  Server,
  MousePointer2,
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { heroCampusImg, scienceLabImg, computerLabImg } from '../src/assets/media';

const { Link } = RouterDom;

const About: React.FC = () => {
  const { lang, t, settings } = useApp();

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
    <div className="space-y-16 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-green-950/80 z-10" />
        <img
          src={settings.schoolPhoto || heroCampusImg}
          onError={(e) => {
            (e.target as HTMLImageElement).src = heroCampusImg;
          }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="School Campus"
        />
        <div className="relative z-20 text-center space-y-5 px-4">
          <div className="bg-white/15 backdrop-blur-md px-5 py-2 rounded-full border border-white/25 inline-block text-white text-xs font-black uppercase tracking-widest">
            Since 1958 • {t(settings.name)}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl">
            {t(TRANSLATIONS.nav.about)}
          </h1>
          <div className="w-24 h-1.5 bg-yellow-400 mx-auto rounded-full" />
          <p className="text-green-50 max-w-2xl mx-auto font-semibold text-base md:text-lg">
            {lang === 'bn'
              ? 'জ্ঞানের মশাল হাতে আগামীর আলোকিত বাংলাদেশ গড়ার পথে...'
              : 'Towards building an enlightened future with the torch of knowledge...'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* History & Identity */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">
              Educational Legacy
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {lang === 'bn' ? 'ঐতিহ্য ও উৎকর্ষের অনন্য সমন্বয়' : 'Unique Blend of Tradition and Excellence'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed font-medium">
              {lang === 'bn'
                ? `${t(settings.name)} কুমিল্লার চৌদ্দগ্রাম উপজেলার একটি স্বনামধন্য ও ঐতিহ্যবাহী শিক্ষা প্রতিষ্ঠান। ১৯৫৮ সাল থেকে এই অঞ্চলে মানসম্মত মাধ্যমিক শিক্ষা বিস্তারে আমরা অগ্রণী ভূমিকা পালন করে আসছি।`
                : `${t(settings.name)} is a renowned and traditional secondary school in Chauddagram, Cumilla. Since 1958, we have played a leading role in spreading quality education across the region.`}
            </p>
            <div className="flex gap-5 items-center pt-4">
              <div className="bg-green-50 dark:bg-green-950/60 p-5 rounded-3xl border border-green-100 dark:border-green-900">
                <span className="text-3xl font-black text-green-700 dark:text-green-400">৬৮+</span>
                <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mt-1">Years of Glory</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/60 p-5 rounded-3xl border border-blue-100 dark:border-blue-900">
                <span className="text-3xl font-black text-blue-700 dark:text-blue-400">৫০০০+</span>
                <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mt-1">Proud Alumni</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src={scienceLabImg}
              className="rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover border-4 border-white dark:border-slate-800"
              alt="School Science Lab"
            />
          </div>
        </section>

        {/* Modern IT & Computer Lab */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-black text-xs uppercase tracking-wider">
                <Monitor className="w-4 h-4" /> Information Technology
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'আধুনিক আইটি ও কম্পিউটার ল্যাব' : 'Modern IT & Computer Lab'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium max-w-2xl text-base">
                {lang === 'bn'
                  ? 'একুশ শতকের দক্ষতা অর্জনে শিক্ষার্থীদের জন্য রয়েছে আধুনিক কম্পিউটার ও বিজ্ঞান ল্যাব সুবিধা।'
                  : 'We maintain modern computer and science lab facilities so students gain hands-on 21st-century skills.'}
              </p>
            </div>
            <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-lg">
              <div className="bg-green-600 p-2 rounded-xl">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Connectivity</p>
                <p className="text-base font-black leading-none">Fiber Optic Campus</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div className="relative group rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 min-h-[380px]">
              <img
                src={computerLabImg}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="School Computer Lab"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-transparent to-transparent flex items-end p-8">
                <div className="space-y-2">
                  <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-block">
                    Sheikh Russel Digital Lab
                  </span>
                  <h4 className="text-2xl font-black text-white leading-tight">
                    {lang === 'bn' ? 'ডিজিটাল প্রযুক্তিতে বাস্তব অভিজ্ঞতা' : 'Hands-on ICT & Practical Learning'}
                  </h4>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {itFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div className="bg-slate-100 dark:bg-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center text-green-700 dark:text-green-400 group-hover:bg-green-700 group-hover:text-white transition-all">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 mt-5">
                    <h5 className="font-black text-lg text-slate-900 dark:text-white">{feature.title}</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider">
                    <span>Smart Campus</span> <MousePointer2 className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Multimedia Classroom */}
        <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white shadow-2xl space-y-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-green-500/15 text-green-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-green-500/20">
              <Presentation className="w-4 h-4" /> Multimedia Classroom
            </div>
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              {lang === 'bn' ? 'আধুনিক ক্লাসরুম: স্মার্ট পাঠদান' : 'Modern Classrooms: Smart Education'}
            </h2>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              {lang === 'bn'
                ? 'ডিজিটাল কন্টেন্ট ব্যবহারের মাধ্যমে পাঠদানকে আরও আনন্দদায়ক ও কার্যকর করতে মাল্টিমিডিয়া প্রযুক্তি ব্যবহার করা হয়।'
                : 'Multimedia tools make daily classroom instruction clearer, engaging, and effective.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {multimediaFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all"
              >
                <div className="bg-green-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-lg font-black text-white mb-2">{feature.title}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="bg-green-100 dark:bg-green-950 w-14 h-14 rounded-2xl flex items-center justify-center text-green-700 dark:text-green-400">
              <Target className="w-7 h-7" />
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

          <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="bg-blue-100 dark:bg-blue-950 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-700 dark:text-blue-400">
              <Eye className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আমাদের স্বপ্ন' : 'Our Vision'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
              {lang === 'bn'
                ? 'প্রযুক্তি ও মেধার সমন্বয়ে একটি আদর্শ আধুনিক শিক্ষা প্রতিষ্ঠান হিসেবে নিজেকে প্রতিষ্ঠিত করা।'
                : 'To establish our institution as a model center of academic excellence and modern digital learning.'}
            </p>
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-green-800 py-14 px-8 text-center text-white rounded-[2.5rem] shadow-2xl space-y-6">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            {lang === 'bn' ? 'আমাদের সাথে আপনার পথচলা শুরু হোক' : 'Start Your Journey With Us'}
          </h2>
          <p className="text-green-100 max-w-2xl mx-auto font-medium text-base md:text-lg">
            {lang === 'bn'
              ? 'ভর্তির জন্য আবেদন করতে বা স্কুল সম্পর্কে বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।'
              : 'Apply online for 2026 admission or reach out to our administration office.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/admission"
              className="bg-yellow-400 text-green-950 px-8 py-4 rounded-2xl font-black text-base hover:bg-white transition-all flex items-center gap-2 shadow-lg"
            >
              {lang === 'bn' ? 'ভর্তি আবেদন' : 'Admission Portal'} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="bg-white/15 text-white border border-white/25 px-8 py-4 rounded-2xl font-black text-base hover:bg-white/25 transition-all"
            >
              {lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
