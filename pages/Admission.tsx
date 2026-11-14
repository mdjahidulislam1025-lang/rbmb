
import * as React from 'react';
import { 
  Info, Download, CheckCircle, FileText, ArrowRight, ArrowLeft, Send, 
  User, Phone, Book, Calendar, Sparkles, Smartphone, Printer, 
  GraduationCap, AlertCircle, FileCheck, ClipboardList, CreditCard, Award,
  Users, MapPin, Search, ShieldCheck
} from 'lucide-react';
import { CLASSES, TRANSLATIONS } from '../constants';
import { useApp } from '../App';

const { useState } = React;

const Admission: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { lang, t, settings } = useApp();

  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    guardianMobile: '',
    targetClass: '',
    targetGroup: 'General',
    birthDate: '',
    address: '',
    prevSchool: '',
    bloodGroup: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrintPDF = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulating database storage
    setTimeout(() => {
      const applications = JSON.parse(localStorage.getItem('admission_applications') || '[]');
      const appId = `RBHS-${Date.now().toString().slice(-6)}`;
      applications.push({ 
        ...formData, 
        appId,
        date: new Date().toLocaleDateString() 
      });
      localStorage.setItem('admission_applications', JSON.stringify(applications));
      
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const PrintableForm = () => (
    <div id="printable-admission-form" className="hidden print:block bg-white text-black font-serif p-0">
      <div className="border-[12px] border-double border-green-900 p-10 min-h-[1100px] relative overflow-hidden">
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none rotate-[-30deg]">
           <GraduationCap className="w-[600px] h-[600px]" />
        </div>

        {/* Official Header */}
        <div className="text-center space-y-2 border-b-4 border-green-900 pb-6 mb-8 relative">
          <div className="flex justify-center mb-2">
             <div className="bg-green-800 p-3 rounded-full shadow-lg"><GraduationCap className="text-white w-10 h-10" /></div>
          </div>
          <h1 className="text-4xl font-black uppercase text-green-900 leading-none">{t(settings.name)}</h1>
          <p className="text-lg font-bold tracking-widest">EIIN: {settings.eiin} | স্থাপিত: ১৯৫৮</p>
          <p className="text-sm font-medium">{t(settings.location)}</p>
          <div className="mt-4">
            <span className="inline-block px-10 py-2 border-2 border-green-900 font-black text-xl uppercase bg-green-50 rounded-lg">
              {lang === 'bn' ? 'ভর্তি আবেদন ফরম - ২০২৬' : 'Admission Application Form - 2026'}
            </span>
          </div>
        </div>

        {/* Info Row */}
        <div className="flex justify-between items-center mb-10 text-sm font-black uppercase tracking-widest">
           <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">App ID: <span className="text-green-800">#{(Math.random() * 90000 + 10000).toFixed(0)}</span></div>
           <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">Date: {new Date().toLocaleDateString()}</div>
        </div>

        {/* Photo Box */}
        <div className="absolute top-60 right-14 w-32 h-40 border-4 border-green-900 flex items-center justify-center text-[10px] text-gray-400 text-center p-4 bg-slate-50 font-bold shadow-sm">
          {lang === 'bn' ? 'পাসপোর্ট সাইজ ছবি' : 'Passport Size Photo'}
        </div>

        {/* Information Table Style Grid */}
        <div className="space-y-8 text-lg mt-10 mr-40">
          {[
            { label: 'শিক্ষার্থীর নাম', en: "Student's Name", value: formData.studentName },
            { label: 'জন্ম তারিখ', en: 'Date of Birth', value: formData.birthDate },
            { label: 'পিতার নাম', en: "Father's Name", value: formData.fatherName },
            { label: 'মাতার নাম', en: "Mother's Name", value: formData.motherName },
            { label: 'আবেদিত শ্রেণী', en: 'Applied Class', value: formData.targetClass },
            { label: 'বিভাগ (৯ম-১০ম)', en: 'Group', value: formData.targetGroup },
            { label: 'অভিভাবকের মোবাইল', en: "Mobile No", value: formData.guardianMobile },
            { label: 'রক্তের গ্রুপ', en: 'Blood Group', value: formData.bloodGroup || 'N/A' },
          ].map((item, i) => (
            <div key={i} className="flex items-end gap-4">
              <span className="font-bold min-w-[220px] whitespace-nowrap">{lang === 'bn' ? item.label : item.en} :</span>
              <span className="flex-grow border-b-2 border-dotted border-gray-400 font-bold uppercase tracking-tight h-7">
                {item.value}
              </span>
            </div>
          ))}
          <div className="flex items-start gap-4">
            <span className="font-bold min-w-[220px]">{lang === 'bn' ? 'বর্তমান ঠিকানা' : 'Address'} :</span>
            <div className="flex-grow border-b-2 border-dotted border-gray-400 min-h-[60px] font-medium text-base">
              {formData.address}
            </div>
          </div>
        </div>

        {/* Payment & Instructions */}
        <div className="mt-16 p-6 border-2 border-slate-200 bg-slate-50 rounded-2xl">
           <p className="font-black text-xs uppercase mb-3 border-b border-slate-200 pb-2">Important Instructions:</p>
           <ul className="text-xs space-y-2 font-medium">
              <li>• আবেদনের প্রিন্ট কপি এবং ৩০০/- (তিনশত) টাকা ফি স্কুল অফিসে জমা দিয়ে অ্যাডমিট কার্ড সংগ্রহ করুন।</li>
              <li>• প্রয়োজনীয় কাগজপত্র: জন্ম নিবন্ধনের কপি, পিতা ও মাতার এনআইডি কপি এবং ৪ কপি পাসপোর্ট সাইজ ছবি।</li>
           </ul>
        </div>

        {/* Footer Signature Area */}
        <div className="mt-20 grid grid-cols-2 gap-20">
          <div className="space-y-4">
             <div className="p-4 bg-white border-2 border-slate-200 rounded-xl text-[10px] space-y-2">
                <p className="font-black border-b border-slate-200 pb-1 uppercase text-green-800">Office Checkpoint</p>
                <div className="flex justify-between"><span>Payment Status:</span> <span className="w-20 border-b border-black">Paid / Due</span></div>
                <div className="flex justify-between"><span>Admission Roll:</span> <span className="w-20 border-b border-black"></span></div>
             </div>
          </div>
          <div className="flex flex-col justify-end items-center">
             <div className="w-full border-t-2 border-black mb-1"></div>
             <p className="text-[11px] font-black uppercase text-center">{lang === 'bn' ? 'প্রধান শিক্ষকের স্বাক্ষর' : "Principal's Signature"}</p>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 right-10 text-[9px] text-gray-400 flex justify-between italic font-bold">
          <span>{lang === 'bn' ? 'এটি একটি কম্পিউটার জেনারেটেড কপি' : 'Generated by Official RBHS Digital Portal'}</span>
          <span>Security Token: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="animate-in fade-in zoom-in duration-500">
        <PrintableForm />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center no-print">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-green-100 space-y-10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 p-24 bg-green-50 rounded-full opacity-50 blur-3xl"></div>
            <div className="bg-green-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-in slide-in-from-bottom">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">আবেদন সফল হয়েছে!</h1>
            <p className="text-gray-500 text-lg font-medium max-w-md mx-auto leading-relaxed">২০২৬ শিক্ষাবর্ষের ভর্তির আবেদনটি আমাদের পোর্টালে জমা হয়েছে। অনুগ্রহ করে নিচের বাটন থেকে ফরমটি ডাউনলোড করে প্রিন্ট করুন।</p>
            
            <div className="bg-slate-900 p-12 rounded-[3.5rem] border-4 border-green-600/30 inline-block text-white shadow-2xl relative">
              <p className="text-[10px] text-green-400 font-black uppercase tracking-[0.4em] mb-4">Tracking Identity</p>
              <p className="text-5xl font-mono font-black tracking-tighter">#RBHS-{(Math.random() * 9000 + 1000).toFixed(0)}</p>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row justify-center gap-6">
              <button 
                onClick={handlePrintPDF}
                className="group flex items-center justify-center gap-4 bg-green-700 text-white px-10 py-7 rounded-[2rem] font-black text-2xl hover:bg-green-800 transition-all shadow-2xl shadow-green-700/30 active:scale-95"
              >
                <Printer className="w-8 h-8 group-hover:animate-pulse" /> ফরমটি প্রিন্ট করুন
              </button>
              <button 
                onClick={() => { setIsSubmitted(false); setIsFormOpen(false); }}
                className="bg-white text-slate-800 border-2 border-slate-100 px-10 py-7 rounded-[2.5rem] font-black text-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-xl"
              >
                মূল পাতায় ফিরুন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="animate-in slide-in-from-bottom duration-500">
        <PrintableForm />
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-10 no-print">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="flex items-center text-green-700 font-black uppercase text-xs tracking-widest hover:gap-3 transition-all bg-green-50 px-8 py-4 rounded-2xl shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-3" /> ফিরে যান
          </button>

          <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-green-700 p-16 md:p-20 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-16 opacity-10"><GraduationCap className="w-72 h-72" /></div>
               <div className="relative z-10 space-y-6">
                  <div className="inline-block bg-white/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Admission Portal 2026</div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">অনলাইন ভর্তি ফরম</h1>
                  <p className="opacity-80 text-xl font-medium">সঠিক তথ্য প্রদান করে ডিজিটাল আবেদন সম্পন্ন করুন।</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="p-12 md:p-20 space-y-20">
              {/* Section 1: Basic Info */}
              <div className="space-y-12">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="bg-green-100 p-4 rounded-3xl text-green-600 shadow-sm"><User className="w-7 h-7" /></div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">ব্যক্তিগত তথ্য (Student Info)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">শিক্ষার্থীর নাম</label>
                    <input required name="studentName" value={formData.studentName} onChange={handleInputChange} type="text" className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-green-500 outline-none transition-all bg-slate-50/50 font-bold text-xl shadow-inner" placeholder="যেমন: মো: আবদুল্লাহ" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">জন্ম তারিখ</label>
                    <input required name="birthDate" value={formData.birthDate} onChange={handleInputChange} type="date" className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-green-500 outline-none bg-slate-50/50 text-gray-900 font-bold text-xl transition-all shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">পিতার নাম</label>
                    <input required name="fatherName" value={formData.fatherName} onChange={handleInputChange} type="text" className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-green-500 outline-none bg-slate-50/50 font-bold text-xl shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">মাতার নাম</label>
                    <input required name="motherName" value={formData.motherName} onChange={handleInputChange} type="text" className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-green-500 outline-none bg-slate-50/50 font-bold text-xl shadow-inner" />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Info */}
              <div className="space-y-12">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="bg-blue-100 p-4 rounded-3xl text-blue-600 shadow-sm"><Book className="w-7 h-7" /></div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">একাডেমিক ও যোগাযোগ (Academic)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">আবেদিত শ্রেণী</label>
                    <select required name="targetClass" value={formData.targetClass} onChange={handleInputChange} className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-green-500 outline-none bg-slate-50/50 font-black text-xl shadow-inner">
                      <option value="">শ্রেণী নির্বাচন করুন</option>
                      {CLASSES.map(cls => (
                        <option key={t(cls.className)} value={t(cls.className)}>{t(cls.className)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">বিভাগ (৯ম-১০ম এর জন্য)</label>
                    <select name="targetGroup" value={formData.targetGroup} onChange={handleInputChange} className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-green-500 outline-none bg-slate-50/50 font-black text-xl shadow-inner">
                      <option value="General">সাধারণ (৬ষ্ঠ-৮ম)</option>
                      <option value="Science">বিজ্ঞান (Science)</option>
                      <option value="Humanities">মানবিক (Humanities)</option>
                      <option value="Commerce">ব্যবসায় শিক্ষা (Commerce)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">অভিভাবকের সচল মোবাইল নম্বর</label>
                    <input required name="guardianMobile" value={formData.guardianMobile} onChange={handleInputChange} type="tel" placeholder="01XXXXXXXXX" className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-green-500 outline-none bg-slate-50/50 font-black text-xl shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">রক্তের গ্রুপ</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-green-500 outline-none bg-slate-50/50 font-black text-xl shadow-inner">
                      <option value="">নির্বাচন করুন</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">বর্তমান ঠিকানা (বিস্তারিত)</label>
                   <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full px-8 py-6 rounded-[2.5rem] border-2 border-slate-100 focus:border-green-500 outline-none bg-slate-50/50 font-bold text-xl h-40 resize-none shadow-inner" placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা..."></textarea>
                </div>
              </div>

              <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-8">
                <button disabled={isSubmitting} type="submit" className={`w-full max-w-md flex items-center justify-center gap-6 bg-green-700 text-white py-8 rounded-[3rem] font-black text-3xl hover:bg-green-800 shadow-[0_30px_60px_rgba(21,128,61,0.2)] transition-all active:scale-95 ${isSubmitting ? 'opacity-50 grayscale' : ''}`}>
                  {isSubmitting ? <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <>আবেদন দাখিল করুন <Send className="w-8 h-8" /></>}
                </button>
                <p className="text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em] italic">Powered by RBHS Integrated Education System</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PrintableForm />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 no-print">
        {/* Simplified Hero Section for Landing */}
        <section className="text-center space-y-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="inline-flex items-center gap-3 bg-green-100 text-green-700 px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-sm animate-bounce">
             <AlertCircle className="w-5 h-5" /> Admission Open 2026
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-green-900 tracking-tighter leading-none drop-shadow-sm">ভর্তি সংক্রান্ত তথ্য</h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium text-xl md:text-2xl leading-relaxed">
            {t(settings.name)}-এ আপনার সন্তানের আধুনিক ও সুশৃঙ্খল শিক্ষা নিশ্চিত করতে আজই অনলাইন ভর্তি পোর্টালে আবেদন সম্পন্ন করুন।
          </p>
          <div className="flex justify-center gap-6">
             <div className="flex items-center gap-4 px-8 py-4 bg-white rounded-3xl shadow-sm border border-slate-100">
                <Users className="w-6 h-6 text-green-600" />
                <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Digital Enrollment</span>
             </div>
             <div className="flex items-center gap-4 px-8 py-4 bg-white rounded-3xl shadow-sm border border-slate-100">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Verified 2026</span>
             </div>
          </div>
        </section>

        {/* Info Grid with Highlighted Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'আবেদনের শেষ তারিখ', date: '১৫ জানুয়ারি, ২০২৬', color: 'bg-white border-orange-200 text-orange-600', icon: Calendar, accent: 'bg-orange-500' },
             { label: 'ভর্তি পরীক্ষা', date: '১৮ জানুয়ারি, ২০২৬', color: 'bg-white border-blue-200 text-blue-600', icon: ClipboardList, accent: 'bg-blue-500' },
             { label: 'আবেদন ফি', date: '৩০০ টাকা', color: 'bg-white border-green-200 text-green-600', icon: CreditCard, accent: 'bg-green-500' },
             { label: 'ফলাফল প্রকাশ', date: '২০ জানুয়ারি, ২০২৬', color: 'bg-white border-purple-200 text-purple-600', icon: Award, accent: 'bg-purple-500' }
           ].map((card, i) => (
             <div key={i} className={`${card.color} p-12 rounded-[4rem] border-2 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}>
                <div className={`absolute top-0 right-0 w-28 h-28 ${card.accent} opacity-5 rounded-bl-[5rem] group-hover:scale-125 transition-transform`} />
                <div className={`${card.accent} w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl mb-10 group-hover:rotate-6 transition-transform`}>
                   <card.icon className="w-10 h-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3">{card.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-tight">{card.date}</p>
             </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-20 items-start">
          <div className="lg:col-span-3 space-y-20">
            {/* Detailed Requirements Card */}
            <section className="bg-slate-900 rounded-[5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none"><FileCheck className="w-72 h-72" /></div>
              <div className="relative z-10 space-y-12">
                 <div className="space-y-4">
                    <h2 className="text-5xl font-black tracking-tight leading-none">প্রয়োজনীয় কাগজপত্র</h2>
                    <p className="text-slate-400 font-medium text-lg">ভর্তির সময় অবশ্যই সাথে আনতে হবে:</p>
                 </div>
                 <div className="grid sm:grid-cols-2 gap-8">
                    {[
                      'অনলাইন জন্ম নিবন্ধন সনদের ফটোকপি।',
                      'পিতা ও মাতার এনআইডি কার্ডের কপি।',
                      'শিক্ষার্থীর ৪ কপি পাসপোর্ট সাইজ ছবি।',
                      'পূর্ববর্তী স্কুলের মূল ছাড়পত্র (টিসি)।',
                      'গত বছরের ফলাফল কার্ড/মার্কশিট।',
                      'অভিভাবকের সচল মোবাইল নম্বর।'
                    ].map((item, i) => (
                      <div key={i} className="flex gap-5 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-colors group">
                        <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20"><CheckCircle className="w-5 h-5" /></div>
                        <p className="text-slate-200 font-bold text-base leading-relaxed">{item}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </section>

            {/* Visual Process Map */}
            <section className="space-y-16">
               <h2 className="text-4xl font-black text-slate-900 flex items-center gap-6">
                  <div className="bg-blue-100 p-5 rounded-3xl text-blue-600 shadow-sm"><Sparkles className="w-10 h-10" /></div> ভর্তি হওয়ার ধাপসমূহ
               </h2>
               <div className="relative pl-12 space-y-16 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-1.5 before:bg-slate-100 before:rounded-full">
                  {[
                    { title: 'অনলাইন ফরম পূরণ', desc: 'প্রথমে এই ওয়েবসাইট থেকে সঠিক তথ্য দিয়ে আবেদন ফরমটি সাবমিট করুন।' },
                    { title: 'ফরম প্রিন্ট ও সংগ্রহ', desc: 'আবেদন শেষে পাওয়া পিডিএফ ফাইলটি ডাউনলোড করে নিকটস্থ কম্পিউটার দোকান থেকে প্রিন্ট করুন।' },
                    { title: 'অফিসে জমা প্রদান', desc: 'প্রিন্ট করা ফরম ও কাগজপত্র সহ স্কুল অফিসে ভর্তি ফি ৩০০/- টাকা জমা দিন।' },
                    { title: 'পরীক্ষা ও চূড়ান্ত ভর্তি', desc: 'নির্ধারিত দিনে ভর্তি পরীক্ষায় অংশ নিয়ে মেধা তালিকার ভিত্তিতে ভর্তি সম্পন্ন করুন।' }
                  ].map((s, i) => (
                    <div key={i} className="relative group">
                      <div className="absolute -left-12 top-0 w-12 h-12 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-green-500 group-hover:text-green-600 transition-all z-10 shadow-sm">
                        {i + 1}
                      </div>
                      <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm group-hover:shadow-2xl group-hover:border-green-100 transition-all duration-500">
                        <h4 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">{s.title}</h4>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-12 sticky top-28">
            {/* CTA Sidebar Card - High Visual Impact */}
            <div className="bg-green-700 text-white p-16 rounded-[4.5rem] shadow-2xl space-y-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                <GraduationCap className="w-80 h-80" />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="bg-white/20 inline-block px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/20">Portal Live 2026</div>
                <h2 className="text-5xl font-black leading-none tracking-tight">ভর্তি হতে আজই আবেদন করুন</h2>
                <p className="opacity-80 text-xl font-medium leading-relaxed">আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য ডিজিটাল পোর্টালে আবেদন সম্পন্ন করুন।</p>
              </div>
              <button onClick={() => setIsFormOpen(true)} className="w-full bg-white text-green-700 py-8 rounded-[3rem] font-black text-3xl hover:bg-yellow-500 hover:text-white shadow-[0_25px_50px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center group active:scale-95 relative z-10">
                আবেদন শুরু করুন <ArrowRight className="w-10 h-10 ml-5 group-hover:translate-x-3 transition-transform" />
              </button>
            </div>

            {/* Helpline Card with Interactive Elements */}
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 space-y-10 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 text-green-50/50 pointer-events-none"><Phone className="w-48 h-48" /></div>
              <h3 className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] border-b border-slate-100 pb-5">হেল্পলাইন সহায়তা</h3>
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-green-300 transition-all cursor-pointer shadow-inner">
                    <div className="bg-green-100 p-5 rounded-3xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all shadow-lg shadow-green-600/10"><Smartphone className="w-8 h-8" /></div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Call Helpdesk</p>
                       <p className="font-black text-3xl text-slate-800 leading-none">{settings.phone}</p>
                    </div>
                 </div>
                 <div className="p-8 bg-green-50 rounded-[2.5rem] border-2 border-dashed border-green-200">
                    <p className="text-base font-bold text-green-800 leading-relaxed">
                      ভর্তি সংক্রান্ত যেকোনো তথ্যের জন্য সরাসরি অফিসে যোগাযোগ করুন অথবা আমাদের আই-সিস্ট্যান্ট (AI) এর সহায়তা নিন।
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admission;
