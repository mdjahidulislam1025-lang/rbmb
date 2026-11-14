
import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import { Users, GraduationCap, Award, BookOpen, ChevronRight, ChevronLeft, Phone, Mail, MapPin, Sparkles, Download, Info, ExternalLink, ShieldCheck, ShieldAlert, User as UserIcon, ArrowRight, ImageIcon } from 'lucide-react';
import { SCHOOL_NAME, TRANSLATIONS, CONTACT_INFO } from '../constants';
import { useApp } from '../App';

const { Link } = RouterDom;

const Home: React.FC = () => {
  const { lang, t, notices, teachers, ebooks, gallery, settings } = useApp();
  
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const defaultHeroImage = "https://images.unsplash.com/photo-1523050853064-8504f2f40fd5?auto=format&fit=crop&q=80&w=1200";

  // Build high-quality dynamic slides combining campus, event gallery, and teachers
  const slides = React.useMemo(() => {
    const list: Array<{
      url: string;
      captionBn: string;
      captionEn: string;
      tagBn: string;
      tagEn: string;
    }> = [];

    // 1. Core School Building Image
    list.push({
      url: settings.schoolPhoto || defaultHeroImage,
      captionBn: "আমাদের সুসজ্জিত ও ঐতিহ্যবাহী রানীর বাজার মাধ্যমিক বিদ্যালয় প্রাঙ্গণ",
      captionEn: "Our historic and beautiful Ranir Bazar Secondary High School campus",
      tagBn: "স্বাগতম প্রাঙ্গণ",
      tagEn: "Welcome Campus"
    });

    // 2. Event/Gallery entries
    if (gallery && gallery.length > 0) {
      gallery.forEach((item) => {
        list.push({
          url: item.url,
          captionBn: item.caption.bn || "বিদ্যালয়ের বিভিন্ন দৃষ্টিনন্দন কার্যক্রম",
          captionEn: item.caption.en || "Glorious school activities and snapshots",
          tagBn: "বিদ্যালয়ের কার্যক্রম ও ইভেন্ট",
          tagEn: "School Activities & Events"
        });
      });
    }

    // 3. Teacher details
    if (teachers && teachers.length > 0) {
      teachers.forEach((teacher) => {
        if (teacher.photo) {
          list.push({
            url: teacher.photo,
            captionBn: `${teacher.name.bn} — ${teacher.designation.bn} (${teacher.subject.bn})`,
            captionEn: `${teacher.name.en} — ${teacher.designation.en} (${teacher.subject.en})`,
            tagBn: "আমাদের পরম শ্রদ্ধেয় শিক্ষক মন্ডলী",
            tagEn: "Our Proud Educators"
          });
        }
      });
    }

    return list;
  }, [settings.schoolPhoto, gallery, teachers]);

  // Handle auto-advance interval for the slideshow
  React.useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const featuredBooks = ebooks.slice(0, 5);
  const latestNotices = notices.slice(0, 3);
  const headTeacher = teachers.find(teach => t(teach.designation).includes('Head') || t(teach.designation).includes('প্রধান')) || teachers[0];

  const importantLinks = [
    { label: lang === 'bn' ? 'শিক্ষা বোর্ড ফলাফল' : 'Education Board Result', path: 'http://www.educationboardresults.gov.bd/', external: true },
    { label: lang === 'bn' ? 'শিক্ষক বাতায়ন' : 'Teacher Portal', path: 'https://www.teachers.gov.bd/', external: true },
    { label: lang === 'bn' ? 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর' : 'DSHE Website', path: 'https://dshe.gov.bd/', external: true },
    { label: lang === 'bn' ? 'NCTB ই-বুক লাইব্রেরি' : 'NCTB E-Book Library', path: '/ebooks', external: false },
    { label: lang === 'bn' ? 'ছুটির তালিকা ২০২৬' : 'Holiday List 2026', path: '/holidays', external: false }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section with Custom Slide Transition Animation */}
      <section className="relative h-[480px] md:h-[650px] overflow-hidden bg-slate-900 border-b-4 border-green-700 shadow-2xl">
        {slides.map((slide, idx) => (
          <img 
            key={idx}
            src={slide.url} 
            alt={lang === 'bn' ? slide.captionBn : slide.captionEn}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out transform ${
              idx === currentSlide ? 'opacity-100 scale-100 z-0' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultHeroImage;
            }}
          />
        ))}

        {/* Dynamic Dark Gradient Overlay to guarantee high contrast typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35 md:bg-gradient-to-r md:from-green-950/95 md:via-green-950/45 md:to-transparent flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
            <div className="max-w-3xl space-y-6">
              {/* Slidable Tag Badge */}
              <div className="inline-flex items-center gap-2 bg-green-600/35 backdrop-blur-md px-4 py-2 rounded-full border border-green-400/40 animate-pulse duration-1000">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-green-20">
                  {lang === 'bn' ? slides[currentSlide]?.tagBn : slides[currentSlide]?.tagEn}
                </span>
              </div>

              {/* Majestic School Name */}
              <h1 className="text-3xl md:text-7xl font-black md:leading-none tracking-tight drop-shadow-2xl">
                {t(settings.name)}
              </h1>

              {/* Contextual Active Slide Caption Box */}
              <div className="bg-black/50 backdrop-blur-md p-5 rounded-2xl border border-white/10 max-w-2xl shadow-xl transform transition-all duration-500 hover:bg-black/60">
                <p className="text-lg md:text-xl font-extrabold text-yellow-400 leading-snug tracking-tight">
                  {lang === 'bn' ? slides[currentSlide]?.captionBn : slides[currentSlide]?.captionEn}
                </p>
                <p className="text-xs md:text-sm text-slate-300 mt-1.5 opacity-90">
                  {t(TRANSLATIONS.hero.subtitle)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/admission" className="bg-yellow-500 hover:bg-yellow-600 text-green-950 px-8 py-4 rounded-2xl font-black text-base shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
                  {t(TRANSLATIONS.admission.onlineApply)}
                </Link>
                <Link to="/about" className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/25 px-8 py-4 rounded-2xl font-black text-base transition-all active:scale-95">
                  {t(TRANSLATIONS.hero.learnMore)}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-green-700/90 hover:scale-110 active:scale-95 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-green-700/90 hover:scale-110 active:scale-95 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 bg-black/50 backdrop-blur-md py-2.5 px-5 rounded-full border border-white/15">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-yellow-400' : 'w-2.5 bg-white/45 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Ambient Fader */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-10" />
      </section>

      {/* Portal Selection Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'student', icon: UserIcon, color: 'bg-blue-600', label: lang === 'bn' ? 'শিক্ষার্থী' : 'Student', path: '/login/student' },
              { role: 'teacher', icon: ShieldCheck, color: 'bg-purple-600', label: lang === 'bn' ? 'শিক্ষক' : 'Teacher', path: '/login/teacher' },
              { role: 'admin', icon: ShieldAlert, color: 'bg-slate-900', label: lang === 'bn' ? 'অ্যাডমিন' : 'Admin', path: '/login/admin' }
            ].map((p, i) => (
              <Link key={i} to={p.path} className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-50 flex items-center gap-6 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div className={`${p.color} p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}><p.icon className="w-8 h-8" /></div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{p.label} পোর্টাল</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">প্রবেশ করতে ক্লিক করুন</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-green-600 transition-colors" />
              </Link>
            ))}
         </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: t(TRANSLATIONS.stats.students), value: lang === 'bn' ? '১০০০+' : '1000+' },
            { icon: GraduationCap, label: t(TRANSLATIONS.stats.teachers), value: teachers.length > 0 ? (lang === 'bn' ? `${teachers.length}+` : `${teachers.length}+`) : (lang === 'bn' ? '৪০+' : '40+') },
            { icon: Award, label: t(TRANSLATIONS.stats.passRate), value: lang === 'bn' ? '৯৮%' : '98%' },
            { icon: BookOpen, label: t(TRANSLATIONS.stats.library), value: lang === 'bn' ? '৫০০০+ বই' : '5000+ Books' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all">
              <stat.icon className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</div>
              <div className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* E-books Section */}
      {featuredBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-green-900/5 border border-green-50 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> 2026 Curriculum
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                  {lang === 'bn' ? '২০২৬ শিক্ষাবর্ষের ই-বুক লাইব্রেরি' : 'NCTB 2026 E-book Library'}
                </h2>
                <p className="text-gray-500 max-w-xl font-medium">
                  {lang === 'bn' ? 'নতুন কারিকুলাম অনুযায়ী সকল বিষয়ের ই-বুক এখন আপনার হাতের নাগালে।' : 'All subject e-books according to the new curriculum are now available.'}
                </p>
              </div>
              <Link to="/ebooks" className="bg-green-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-800 transition-all flex items-center gap-3 shadow-lg group">
                {t(TRANSLATIONS.ui.seeAll)} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {featuredBooks.map((book) => (
                <div key={book.id} className="group relative">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    <img src={book.coverUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-white text-green-700 p-3 rounded-full hover:scale-110 transition-transform">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-4 font-bold text-sm text-gray-800 line-clamp-1 group-hover:text-green-700 transition-colors">{t(book.title)}</h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t(book.className)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Notices & Important Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 pt-10">
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-black text-gray-900">{t(TRANSLATIONS.nav.notices)}</h2>
            <Link to="/notices" className="text-green-600 hover:text-green-700 font-black flex items-center text-xs uppercase tracking-widest">
              {t(TRANSLATIONS.ui.seeAll)} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {latestNotices.length > 0 ? latestNotices.map(notice => (
              <div key={notice.id} className="bg-white p-5 rounded-3xl border border-transparent hover:border-green-100 hover:shadow-xl transition-all flex gap-5 group cursor-pointer">
                <div className="bg-slate-50 text-slate-400 p-3 rounded-2xl h-fit flex flex-col items-center justify-center shrink-0 min-w-[75px] border border-gray-100 group-hover:bg-green-700 group-hover:text-white transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest">{new Date(notice.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-3xl font-black leading-none">{new Date(notice.date).getDate()}</span>
                </div>
                <div className="flex-grow">
                  <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-lg mb-2 inline-block shadow-sm ${
                    notice.category === 'Admission' ? 'bg-blue-600 text-white' : 
                    notice.category === 'Exam' ? 'bg-red-600 text-white' : 'bg-slate-700 text-white'
                  }`}>
                    {notice.category}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-green-700 transition-colors leading-tight">{t(notice.title)}</h3>
                  <p className="text-gray-500 text-sm line-clamp-1 mt-1 font-medium">{t(notice.description)}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                {lang === 'bn' ? 'কোন নোটিশ পাওয়া যায়নি' : 'No notices found'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 border-b pb-4">{t(TRANSLATIONS.ui.importantLinks)}</h2>
          <div className="grid grid-cols-1 gap-3">
            {importantLinks.map((link, i) => (
              link.external ? (
                <a key={i} href={link.path} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-300 hover:bg-green-50 hover:text-green-700 font-bold transition-all group shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-slate-50 p-2 rounded-xl mr-3 group-hover:bg-white transition-colors"><ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-green-600" /></div>
                    {link.label}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </a>
              ) : (
                <Link key={i} to={link.path} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-300 hover:bg-green-50 hover:text-green-700 font-bold transition-all group shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-slate-50 p-2 rounded-xl mr-3 group-hover:bg-white transition-colors"><BookOpen className="w-4 h-4 text-slate-400 group-hover:text-green-600" /></div>
                    {link.label}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <h2 className="text-2xl font-black text-gray-900 mb-8 flex justify-between items-center">
            {t(TRANSLATIONS.nav.gallery)}
            <Link to="/gallery" className="text-xs font-black uppercase text-green-600 hover:underline tracking-widest">{t(TRANSLATIONS.ui.seeAll)}</Link>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gallery.slice(0, 4).map(item => (
              <div key={item.id} className="relative group overflow-hidden rounded-[2rem] h-56 shadow-lg bg-slate-100">
                <img src={item.url} alt={t(item.caption)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-white text-sm font-black tracking-tight">{t(item.caption)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Snippet */}
      <section className="bg-slate-900 text-white py-20 rounded-[4rem] mx-4 md:mx-8">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-16">
          <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tight">{t(TRANSLATIONS.nav.contact)}</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="bg-green-600/20 p-4 rounded-2xl"><MapPin className="text-green-500 w-6 h-6" /></div>
                <p className="text-gray-400 font-medium text-lg leading-relaxed">{t(settings.location)}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="bg-green-600/20 p-4 rounded-2xl"><Phone className="text-green-500 w-6 h-6" /></div>
                <p className="text-gray-400 font-black text-lg">{settings.phone}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="bg-green-600/20 p-4 rounded-2xl"><Mail className="text-green-500 w-6 h-6" /></div>
                <p className="text-gray-400 font-bold">{settings.email}</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 rounded-[3rem] overflow-hidden h-96 grayscale opacity-80 hover:grayscale-0 transition-all duration-700 border-8 border-white/5">
             <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.2201977799514!2d91.29177117589574!3d23.235017408375635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37549303d8d6469b%3A0x8e87d15967000e3!2sChauddagram!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
