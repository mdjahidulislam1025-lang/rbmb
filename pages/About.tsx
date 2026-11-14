
import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import { Target, Eye, BookOpen, ShieldCheck, Cpu, Library, Building, Monitor, Video, Speaker, Globe, ArrowRight, Laptop, Presentation, Lightbulb, Zap, Wifi, HardDrive, Server, MousePointer2 } from 'lucide-react';
import { SCHOOL_NAME, TRANSLATIONS } from '../constants';
import { useApp } from '../App';

const { Link } = RouterDom;

const About: React.FC = () => {
  const { lang, t, settings } = useApp();

  const itFeatures = [
    {
      icon: Wifi,
      title: lang === 'bn' ? '৫০০ Mbps ব্যান্ডউইথ' : '500 Mbps Bandwidth',
      desc: lang === 'bn' ? 'সার্ভার বেজড হাই-স্পিড ফাইবার অপটিক কানেক্টিভিটি।' : 'High-speed dedicated fiber optic connectivity via central server.'
    },
    {
      icon: Monitor,
      title: lang === 'bn' ? 'আধুনিক ওয়ার্কস্টেশন' : 'Modern Workstations',
      desc: lang === 'bn' ? 'প্রতিটি শিক্ষার্থীর জন্য আলাদা ডেল/এইচপি ইন্টেল কোর পিসি।' : 'Dedicated Dell/HP Intel Core PCs for every student.'
    },
    {
      icon: HardDrive,
      title: lang === 'bn' ? 'প্রয়োজনীয় সফটওয়্যার' : 'Standard Software',
      desc: lang === 'bn' ? 'অফিস অ্যাপ্লিকেশন, গ্রাফিক্স ডিজাইন ও বেসিক কোডিং টুলস।' : 'Full suite of Office, Graphics, and basic Coding software.'
    },
    {
      icon: Server,
      title: lang === 'bn' ? 'সেন্ট্রাল ল্যান' : 'Central LAN',
      desc: lang === 'bn' ? 'নিরাপদ ব্রাউজিং এবং ল্যান ভিত্তিক ডেটা শেয়ারিং নেটওয়ার্ক।' : 'Secure local area network for safe data sharing and browsing.'
    }
  ];

  const multimediaFeatures = [
    {
      icon: Presentation,
      title: lang === 'bn' ? 'স্মার্ট প্রজেক্টর সিস্টেম' : 'Smart Projector System',
      desc: lang === 'bn' ? 'প্রতিটি ক্লাসে ইন্টারঅ্যাকটিভ এইচডি প্রজেক্টর সুবিধা।' : 'Interactive HD projector facilities in digital classrooms.'
    },
    {
      icon: Speaker,
      title: lang === 'bn' ? 'অডিও-ভিজ্যুয়াল লার্নিং' : 'Audio-Visual Learning',
      desc: lang === 'bn' ? 'পরিষ্কার সাউন্ড সিস্টেমের মাধ্যমে পাঠদান সহজ করা হয়।' : 'Simplified learning through high-quality audio systems.'
    },
    {
      icon: Video,
      title: lang === 'bn' ? 'ডিজিটাল কন্টেন্ট' : 'Digital Content',
      desc: lang === 'bn' ? 'জটিল পাঠ্যবইয়ের পড়াগুলো ভিডিও এনিমেশনে উপস্থাপনা।' : 'Presentation of complex lessons through video animations.'
    },
    {
      icon: Laptop,
      title: lang === 'bn' ? 'টিচার্স ল্যাপটপ সাপোর্ট' : 'Teacher Laptop Support',
      desc: lang === 'bn' ? 'শিক্ষকদের জন্য আলাদা ল্যাপটপ ও ডিজিটাল প্রেজেন্টেশন কিট।' : 'Dedicated laptops and presentation kits for teachers.'
    }
  ];

  return (
    <div className="space-y-20 pb-20 animate-in fade-in duration-700">
      {/* Dynamic Header Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-green-900/85 z-10" />
        <img 
          src={settings.schoolPhoto || "https://images.unsplash.com/photo-1523050853064-8504f2f40fd5?auto=format&fit=crop&q=80&w=1200"} 
          className="absolute inset-0 w-full h-full object-cover"
          alt="School Header"
        />
        <div className="relative z-20 text-center space-y-6 px-4">
          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 inline-block text-white text-xs font-black uppercase tracking-[0.3em]">
            Since 1958 • {t(settings.name)}
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
            {t(TRANSLATIONS.nav.about)}
          </h1>
          <div className="w-32 h-2 bg-yellow-500 mx-auto rounded-full shadow-lg"></div>
          <p className="text-green-50 max-w-2xl mx-auto font-bold text-xl drop-shadow-md">
            {lang === 'bn' ? 'জ্ঞানের মশাল হাতে আগামীর ডিজিটাল বাংলাদেশ গড়ার পথে...' : 'Towards building a digital Bangladesh with the torch of knowledge...'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        {/* History & Identity */}
        <section className="grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                Educational Legacy
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                {lang === 'bn' ? 'ঐতিহ্য ও উৎকর্ষের অনন্য সমন্বয়' : 'Unique Blend of Tradition and Excellence'}
              </h2>
            </div>
            <div className="space-y-6 text-gray-500 text-lg leading-relaxed font-medium">
              <p>
                {lang === 'bn' 
                  ? `${t(settings.name)} কুমিল্লার চৌদ্দগ্রাম উপজেলার একটি স্বনামধন্য ও ঐতিহ্যবাহী শিক্ষা প্রতিষ্ঠান। দীর্ঘকাল ধরে এই অঞ্চল তথা দেশের শিক্ষা বিস্তারে আমরা অগ্রণী ভূমিকা পালন করে আসছি।`
                  : `${t(settings.name)} is a renowned and traditional educational institution of Chauddagram, Cumilla. We have been playing a leading role in spreading education for decades.`}
              </p>
              <div className="flex gap-6 items-center border-t border-gray-100 pt-8 mt-8">
                 <div className="bg-green-50 p-4 rounded-3xl border border-green-100">
                    <span className="text-4xl font-black text-green-700">৬৫+</span>
                    <p className="text-[10px] font-black uppercase text-slate-400">Years of Glory</p>
                 </div>
                 <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
                    <span className="text-4xl font-black text-blue-700">১০০০+</span>
                    <p className="text-[10px] font-black uppercase text-slate-400">Successful Alumni</p>
                 </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-green-100 rounded-[4rem] -rotate-3 group-hover:rotate-0 transition-transform duration-500 -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800" 
              className="rounded-[3.5rem] shadow-2xl w-full aspect-square object-cover" 
              alt="School Legacy"
            />
          </div>
        </section>

        {/* Modern IT & Computer Lab */}
        <section className="space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600 font-black text-xs uppercase tracking-widest">
                <Monitor className="w-5 h-5" /> Information Technology
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                {lang === 'bn' ? 'আধুনিক আইটি ও কম্পিউটার ল্যাব' : 'Modern IT & Computer Lab'}
              </h2>
              <p className="text-gray-500 font-medium max-w-2xl text-lg">
                {lang === 'bn' 
                  ? 'একুশ শতকের চ্যালেঞ্জ মোকাবিলায় শিক্ষার্থীদের দক্ষ করে তুলতে আমাদের রয়েছে শীতাতপ নিয়ন্ত্রিত এবং হাই-টেক কম্পিউটার ল্যাব সুবিধা।' 
                  : 'We have an air-conditioned, high-tech computer lab facility to make students skilled for the challenges of the 21st century.'}
              </p>
            </div>
            <div className="flex gap-4">
               <div className="bg-slate-900 text-white p-5 rounded-3xl flex items-center gap-4 shadow-xl">
                  <div className="bg-green-500 p-2 rounded-xl"><Zap className="w-5 h-5 text-white" /></div>
                  <div className="text-left">
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Internet Speed</p>
                     <p className="text-xl font-black leading-none">Fiber Optic</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
             <div className="relative group rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100 h-[500px]">
                <img 
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                  alt="Modern Lab"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-transparent to-transparent flex items-end p-12">
                   <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/30 inline-block">
                        Digital Lab 2.0
                      </div>
                      <h4 className="text-3xl font-black text-white leading-tight">
                        {lang === 'bn' ? 'ডিজিটাল প্রযুক্তিতে বাস্তব অভিজ্ঞতা' : 'Hands-on Experience with Technology'}
                      </h4>
                      <p className="text-green-100 font-medium text-sm">তত্ত্বীয় শিক্ষার পাশাপাশি নিয়মিত প্র্যাকটিক্যাল সেশন।</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {itFeatures.map((feature, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:border-green-200 transition-all group flex flex-col justify-between text-left">
                     <div className="bg-slate-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-green-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <feature.icon className="w-8 h-8" />
                     </div>
                     <div className="space-y-3 mt-8">
                        <h5 className="font-black text-xl text-gray-900 group-hover:text-green-700 transition-colors">{feature.title}</h5>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                     </div>
                     <div className="mt-6 flex items-center gap-2 text-green-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest">Digital Campus</span>
                        <MousePointer2 className="w-3 h-3" />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Digital Multimedia Classroom */}
        <section className="bg-slate-900 rounded-[5rem] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10 px-10 py-20 md:p-24 space-y-16">
            <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-3 bg-green-500/10 text-green-400 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">
                <Presentation className="w-5 h-5 animate-pulse" /> Multimedia Classroom
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                {lang === 'bn' ? 'আধুনিক ক্লাসরুম: স্মার্ট পাঠদান' : 'Modern Classrooms: Smart Education'}
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed font-medium">
                {lang === 'bn' 
                  ? 'ডিজিটাল কন্টেন্ট ব্যবহারের মাধ্যমে পাঠদানকে আরও আনন্দদায়ক ও কার্যকর করতে আমরা মাল্টিমিডিয়া প্রযুক্তির সফল প্রয়োগ নিশ্চিত করেছি।' 
                  : 'We have ensured successful application of multimedia technology to make teaching more enjoyable and effective through digital content.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              {multimediaFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 hover:border-green-500/40 transition-all duration-500 group">
                  <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-500 transition-all">
                    <feature.icon className="w-8 h-8 text-green-400 group-hover:text-white" />
                  </div>
                  <h4 className="text-xl font-black text-white mb-4 leading-tight">{feature.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium group-hover:text-slate-200">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid md:grid-cols-2 gap-10 text-left">
          <div className="bg-white p-16 rounded-[4rem] shadow-sm border border-gray-100 space-y-8 group hover:bg-green-700 transition-all duration-700">
            <div className="bg-green-50 w-20 h-20 rounded-3xl flex items-center justify-center text-green-700 group-hover:bg-white/20 group-hover:text-white transition-all shadow-inner">
              <Target className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-gray-900 group-hover:text-white leading-none">{lang === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}</h3>
              <p className="text-gray-500 group-hover:text-green-50 text-xl leading-relaxed font-medium">
                {lang === 'bn'
                  ? 'শিক্ষার্থীদের একবিংশ শতাব্দীর চ্যালেঞ্জ মোকাবিলায় যোগ্য, প্রযুক্তিনির্ভর ও নৈতিক মূল্যবোধসম্পন্ন সুনাগরিক হিসেবে গড়ে তোলা।'
                  : 'To develop students as capable, tech-savvy, and ethically valued citizens to face the challenges of the 21st century.'}
              </p>
            </div>
          </div>
          <div className="bg-white p-16 rounded-[4rem] shadow-sm border border-gray-100 space-y-8 group hover:bg-green-700 transition-all duration-700">
            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center text-blue-700 group-hover:bg-white/20 group-hover:text-white transition-all shadow-inner">
              <Eye className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-gray-900 group-hover:text-white leading-none">{lang === 'bn' ? 'আমাদের স্বপ্ন' : 'Our Vision'}</h3>
              <p className="text-gray-500 group-hover:text-green-50 text-xl leading-relaxed font-medium">
                {lang === 'bn'
                  ? 'প্রযুক্তি ও মেধার সমন্বয়ে একটি বিশ্বমানের আধুনিক শিক্ষা প্রতিষ্ঠান হিসেবে নিজেকে প্রতিষ্ঠিত করা।'
                  : 'To establish ourselves as a world-class modern educational institution by combining technology and merit.'}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Call to Action - Fixed Navigation with Link */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-green-900 py-24 text-center text-white rounded-[5rem] relative overflow-hidden shadow-2xl shadow-green-900/40">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="0" cy="0" r="40" fill="white" />
              <circle cx="100" cy="100" r="40" fill="white" />
            </svg>
          </div>
          <div className="relative z-10 space-y-10 px-8">
            <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 inline-block text-[10px] font-black uppercase tracking-[0.4em]">Ready for 2026?</div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
              {lang === 'bn' ? 'আমাদের সাথে আপনার পথচলা শুরু হোক' : 'Start Your Journey With Us'}
            </h2>
            <p className="text-green-100 max-w-2xl mx-auto font-medium text-xl leading-relaxed">
              {lang === 'bn' 
                ? 'ভর্তির জন্য আবেদন করতে বা স্কুল সম্পর্কে আরও বিস্তারিত তথ্য জানতে আমাদের সাথে আজই যোগাযোগ করুন।' 
                : 'Contact us today to apply for admission or to learn more details about our school.'}
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <Link to="/admission" className="group bg-yellow-500 text-green-900 px-12 py-5 rounded-3xl font-black text-2xl hover:bg-white hover:text-green-700 transition-all shadow-xl active:scale-95 flex items-center gap-3">
                {lang === 'bn' ? 'ভর্তি তথ্য' : 'Admission Info'} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link to="/contact" className="bg-white/10 backdrop-blur-md text-white border-2 border-white/20 px-12 py-5 rounded-3xl font-black text-2xl hover:bg-white/20 transition-all flex items-center gap-3">
                {lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
