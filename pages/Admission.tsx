import * as React from 'react';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  User,
  Book,
  Calendar,
  Sparkles,
  Smartphone,
  Printer,
  GraduationCap,
  AlertCircle,
  FileCheck,
  ClipboardList,
  CreditCard,
  Award,
  Users,
  Search,
  ShieldCheck,
  Clock,
  XCircle,
} from 'lucide-react';
import { CLASSES } from '../constants';
import { useApp } from '../App';
import { AdmissionStatusProjection } from '../types';

const { useState } = React;

const Admission: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedAppId, setSubmittedAppId] = useState('');
  const [statusQuery, setStatusQuery] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [hasSearchedStatus, setHasSearchedStatus] = useState(false);
  const [last4Input, setLast4Input] = useState('');
  const [matchedStatus, setMatchedStatus] = useState<AdmissionStatusProjection | null>(null);
  const { lang, t, settings, addAdmission, lookupAdmissionStatus } = useApp();

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
    bloodGroup: '',
  });

  const handleCheckStatus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!statusQuery.trim()) return;
    setIsCheckingStatus(true);
    setHasSearchedStatus(true);
    const result = await lookupAdmissionStatus(statusQuery.trim(), last4Input.trim() || undefined);
    setMatchedStatus(result);
    setIsCheckingStatus(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrintPDF = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    const appId = `RBHS-${Date.now().toString().slice(-6)}`;
    try {
      await addAdmission({
        ...formData,
        appId,
        status: 'pending',
        submittedDate: new Date().toLocaleDateString(),
      });
      setSubmittedAppId(appId);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Admission save failed:', err);
      setSubmitError(
        lang === 'bn'
          ? 'আবেদনটি ক্লাউডে পাঠানো যায়নি (লোকালে সংরক্ষিত হয়েছে)। দয়া করে তথ্য যাচাই করে আবার চেষ্টা করুন।'
          : 'Could not sync your application to the server. Please verify all fields (e.g. mobile number) and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const PrintableForm = () => (
    <div id="printable-admission-form" className="hidden print:block bg-white text-black font-serif p-0">
      <div className="border-[10px] border-double border-green-900 p-8 min-h-[1050px] relative overflow-hidden">
        <div className="text-center space-y-2 border-b-4 border-green-900 pb-5 mb-6 relative">
          <div className="flex justify-center mb-2">
            <div className="bg-green-800 p-3 rounded-full">
              <GraduationCap className="text-white w-9 h-9" />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase text-green-900 leading-none">{t(settings.name)}</h1>
          <p className="text-base font-bold">EIIN: {settings.eiin} | স্থাপিত: ১৯৫৮</p>
          <p className="text-sm font-medium">{t(settings.location)}</p>
          <div className="mt-3">
            <span className="inline-block px-8 py-1.5 border-2 border-green-900 font-black text-lg uppercase bg-green-50 rounded-lg">
              {lang === 'bn' ? 'ভর্তি আবেদন ফরম - ২০২৬' : 'Admission Application Form - 2026'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 text-sm font-black uppercase">
          <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
            App ID: <span className="text-green-800">{submittedAppId || '#RBHS-2026'}</span>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
            Date: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="absolute top-52 right-12 w-28 h-36 border-2 border-green-900 flex items-center justify-center text-[10px] text-gray-500 text-center p-2 bg-slate-50 font-bold">
          {lang === 'bn' ? 'পাসপোর্ট সাইজ ছবি' : 'Passport Size Photo'}
        </div>

        <div className="space-y-6 text-base mt-8 mr-36">
          {[
            { label: 'শিক্ষার্থীর নাম', en: "Student's Name", value: formData.studentName },
            { label: 'জন্ম তারিখ', en: 'Date of Birth', value: formData.birthDate },
            { label: 'পিতার নাম', en: "Father's Name", value: formData.fatherName },
            { label: 'মাতার নাম', en: "Mother's Name", value: formData.motherName },
            { label: 'আবেদিত শ্রেণী', en: 'Applied Class', value: formData.targetClass },
            { label: 'বিভাগ (৯ম-১০ম)', en: 'Group', value: formData.targetGroup },
            { label: 'অভিভাবকের মোবাইল', en: 'Mobile No', value: formData.guardianMobile },
            { label: 'রক্তের গ্রুপ', en: 'Blood Group', value: formData.bloodGroup || 'N/A' },
          ].map((item, i) => (
            <div key={i} className="flex items-end gap-4">
              <span className="font-bold min-w-[200px] whitespace-nowrap">
                {lang === 'bn' ? item.label : item.en} :
              </span>
              <span className="flex-grow border-b-2 border-dotted border-gray-400 font-bold h-6">
                {item.value}
              </span>
            </div>
          ))}
          <div className="flex items-start gap-4">
            <span className="font-bold min-w-[200px]">{lang === 'bn' ? 'বর্তমান ঠিকানা' : 'Address'} :</span>
            <div className="flex-grow border-b-2 border-dotted border-gray-400 min-h-[50px] font-medium">
              {formData.address}
            </div>
          </div>
        </div>

        <div className="mt-14 p-5 border-2 border-slate-200 bg-slate-50 rounded-xl">
          <p className="font-black text-xs uppercase mb-2 border-b border-slate-200 pb-1">Important Instructions:</p>
          <ul className="text-xs space-y-1.5 font-medium">
            <li>• আবেদনের প্রিন্ট কপি এবং ৩০০/- (তিনশত) টাকা ফি স্কুল অফিসে জমা দিয়ে অ্যাডমিট কার্ড সংগ্রহ করুন।</li>
            <li>• প্রয়োজনীয় কাগজপত্র: জন্ম নিবন্ধনের কপি, পিতা ও মাতার এনআইডি কপি এবং ৪ কপি পাসপোর্ট সাইজ ছবি।</li>
          </ul>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-16">
          <div className="p-4 bg-white border-2 border-slate-200 rounded-xl text-[10px] space-y-2">
            <p className="font-black border-b border-slate-200 pb-1 uppercase text-green-800">Office Verification</p>
            <div className="flex justify-between">
              <span>Payment Status:</span> <span className="w-20 border-b border-black">Paid / Due</span>
            </div>
            <div className="flex justify-between">
              <span>Admission Roll:</span> <span className="w-20 border-b border-black"></span>
            </div>
          </div>
          <div className="flex flex-col justify-end items-center">
            <div className="w-full border-t-2 border-black mb-1" />
            <p className="text-[11px] font-black uppercase text-center">
              {lang === 'bn' ? 'প্রধান শিক্ষকের স্বাক্ষর' : "Principal's Signature"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="animate-in fade-in duration-500">
        <PrintableForm />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center no-print">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-green-100 dark:border-slate-800 space-y-8">
            <div className="bg-green-100 dark:bg-green-950 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আবেদন সফলভাবে জমা হয়েছে!' : 'Application Submitted Successfully!'}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base font-medium max-w-md mx-auto">
              {lang === 'bn'
                ? '২০২৬ শিক্ষাবর্ষের ভর্তির আবেদনটি পোর্টালে সংরক্ষিত হয়েছে। নিচের অ্যাপ্লিকেশন আইডি দিয়ে যেকোনো সময় স্ট্যাটাস যাচাই করতে পারবেন।'
                : 'Your 2026 admission application is saved. Keep your Tracking ID below to check live status anytime.'}
            </p>

            <div className="bg-slate-900 p-8 rounded-3xl border-2 border-green-500/40 inline-block text-white shadow-xl">
              <p className="text-[11px] text-green-400 font-black uppercase tracking-widest mb-2">Tracking App ID</p>
              <p className="text-4xl font-mono font-black">{submittedAppId || 'RBHS-2026'}</p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handlePrintPDF}
                className="flex items-center justify-center gap-3 bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-base hover:bg-green-800 transition-all shadow-lg"
              >
                <Printer className="w-5 h-5" /> {lang === 'bn' ? 'ফরম প্রিন্ট / PDF' : 'Print Form'}
              </button>
              <button
                onClick={() => {
                  setStatusQuery(submittedAppId);
                  setHasSearchedStatus(true);
                  lookupAdmissionStatus(submittedAppId).then((res) => setMatchedStatus(res));
                  setIsSubmitted(false);
                  setIsFormOpen(false);
                }}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-8 py-4 rounded-2xl font-black text-base hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {lang === 'bn' ? 'ভর্তি পাতায় ফিরুন' : 'Back to Admission Page'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="animate-in fade-in duration-300">
        <PrintableForm />
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 no-print">
          <button
            onClick={() => setIsFormOpen(false)}
            className="inline-flex items-center text-green-700 dark:text-green-400 font-black text-xs uppercase tracking-wider bg-green-50 dark:bg-green-950/60 px-6 py-3 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {lang === 'bn' ? 'ফিরে যান' : 'Back'}
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-green-700 p-10 text-white">
              <span className="inline-block bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider">
                Admission Portal 2026
              </span>
              <h1 className="text-3xl md:text-4xl font-black mt-3">
                {lang === 'bn' ? 'অনলাইন ভর্তি ফরম' : 'Online Admission Form'}
              </h1>
              <p className="opacity-90 text-sm md:text-base mt-1">
                {lang === 'bn'
                  ? 'সঠিক তথ্য প্রদান করে ডিজিটাল আবেদন সম্পন্ন করুন।'
                  : 'Complete your digital admission form with accurate student details.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="bg-green-100 dark:bg-green-950 p-3 rounded-2xl text-green-700 dark:text-green-400">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'শিক্ষার্থীর ব্যক্তিগত তথ্য' : 'Student Personal Information'}
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'শিক্ষার্থীর পূর্ণ নাম' : 'Student Name'}
                    </label>
                    <input
                      required
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      type="text"
                      placeholder={lang === 'bn' ? 'যেমন: মো: আবদুল্লাহ' : 'e.g. Md. Abdullah'}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                    </label>
                    <input
                      required
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      type="date"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'পিতার নাম' : "Father's Name"}
                    </label>
                    <input
                      required
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'মাতার নাম' : "Mother's Name"}
                    </label>
                    <input
                      required
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-2xl text-blue-600 dark:text-blue-400">
                    <Book className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'একাডেমিক ও যোগাযোগ তথ্য' : 'Academic & Guardian Info'}
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'আবেদিত শ্রেণী' : 'Target Class'}
                    </label>
                    <select
                      required
                      name="targetClass"
                      value={formData.targetClass}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">{lang === 'bn' ? 'শ্রেণী নির্বাচন করুন' : 'Select Class'}</option>
                      {CLASSES.map((cls) => (
                        <option key={cls.classId} value={t(cls.className)}>
                          {t(cls.className)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'বিভাগ (৯ম–১০ম)' : 'Group (Class 9–10)'}
                    </label>
                    <select
                      name="targetGroup"
                      value={formData.targetGroup}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="General">সাধারণ (৬ষ্ঠ-৮ম)</option>
                      <option value="Science">বিজ্ঞান (Science)</option>
                      <option value="Humanities">মানবিক (Humanities)</option>
                      <option value="Commerce">ব্যবসায় শিক্ষা (Commerce)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'অভিভাবকের মোবাইল নম্বর' : 'Guardian Mobile'}
                    </label>
                    <input
                      required
                      minLength={6}
                      maxLength={30}
                      name="guardianMobile"
                      value={formData.guardianMobile}
                      onChange={handleInputChange}
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">{lang === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'বর্তমান ঠিকানা' : 'Present Address'}
                  </label>
                  <textarea
                    required
                    minLength={2}
                    maxLength={400}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder={lang === 'bn' ? 'গ্রাম, ডাকঘর, উপজেলা, জেলা...' : 'Village, Post, Upazila, District...'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  />
                </div>
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-green-700 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-800 shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {lang === 'bn' ? 'আবেদন দাখিল করুন' : 'Submit Admission Form'} <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PrintableForm />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14 no-print">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">
            <AlertCircle className="w-4 h-4" /> Admission Open 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-green-900 dark:text-white tracking-tight">
            {lang === 'bn' ? 'অনলাইন ভর্তি তথ্য ও আবেদন' : 'Online Admission Portal 2026'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium text-base md:text-lg">
            {t(settings.name)}-এ আপনার সন্তানের আধুনিক শিক্ষা নিশ্চিত করতে অনলাইন ফরম পূরণ করুন এবং অ্যাপ্লিকেশন আইডি দিয়ে লাইভ স্ট্যাটাস দেখুন।
          </p>
        </section>

        {/* Live Application Status Checker (Non-PII Projection) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-100 dark:border-slate-800 space-y-5">
          <form onSubmit={handleCheckStatus} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                {lang === 'bn' ? 'আবেদন স্ট্যাটাস যাচাই করুন' : 'Check Live Admission Status'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'bn'
                  ? 'আপনার প্রাপ্ত Tracking App ID (যেমন: RBHS-123456) এবং প্রয়োজনে মোবাইলের শেষ ৪ সংখ্যা দিন। ব্যক্তিগত তথ্য গোপন রাখা হয়।'
                  : 'Enter your Tracking App ID (e.g. RBHS-123456) and optional last 4 guardian mobile digits. Personal PII is protected.'}
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
              <input
                type="text"
                value={statusQuery}
                onChange={(e) => {
                  setStatusQuery(e.target.value);
                  setHasSearchedStatus(false);
                }}
                placeholder={lang === 'bn' ? 'App ID (RBHS-...)' : 'Tracking App ID...'}
                className="flex-1 sm:w-52 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                maxLength={4}
                value={last4Input}
                onChange={(e) => {
                  setLast4Input(e.target.value.replace(/\D/g, ''));
                  setHasSearchedStatus(false);
                }}
                placeholder={lang === 'bn' ? 'শেষ ৪ ডিজিট' : 'Last 4 digits'}
                className="w-28 px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isCheckingStatus}
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
              >
                {isCheckingStatus
                  ? lang === 'bn'
                    ? 'যাচাই...'
                    : 'Checking...'
                  : lang === 'bn'
                  ? 'যাচাই করুন'
                  : 'Check'}
              </button>
            </div>
          </form>

          {hasSearchedStatus && !isCheckingStatus && (
            matchedStatus ? (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    Tracking ID: {matchedStatus.appId} • {matchedStatus.submittedDate}
                  </p>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    {matchedStatus.targetClass} ({matchedStatus.targetGroup})
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {lang === 'bn'
                      ? 'গোপনীয়তা নীতির কারণে নাম ও মোবাইল নম্বর গোপন রাখা হয়েছে।'
                      : 'Applicant name and phone number are hidden for privacy protection.'}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase ${
                    matchedStatus.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : matchedStatus.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {matchedStatus.status === 'approved' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : matchedStatus.status === 'rejected' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  {matchedStatus.status === 'approved'
                    ? lang === 'bn'
                      ? 'অনুমোদিত (Approved)'
                      : 'Approved'
                    : matchedStatus.status === 'rejected'
                    ? lang === 'bn'
                      ? 'বাতিল (Rejected)'
                      : 'Rejected'
                    : lang === 'bn'
                    ? 'অপেক্ষমাণ (Pending)'
                    : 'Pending Review'}
                </span>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'এই App ID বা মোবাইলের শেষ ৪ সংখ্যায় কোনো আবেদন পাওয়া যায়নি।'
                  : 'No matching application status found for that App ID or verification code.'}
              </p>
            )
          )}
        </section>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'আবেদনের শেষ তারিখ', date: '১৫ জানুয়ারি, ২০২৬', icon: Calendar, accent: 'bg-orange-500' },
            { label: 'ভর্তি পরীক্ষা', date: '১৮ জানুয়ারি, ২০২৬', icon: ClipboardList, accent: 'bg-blue-500' },
            { label: 'আবেদন ফি', date: '৩০০ টাকা', icon: CreditCard, accent: 'bg-green-600' },
            { label: 'ফলাফল প্রকাশ', date: '২০ জানুয়ারি, ২০২৬', icon: Award, accent: 'bg-purple-600' },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
            >
              <div className={`${card.accent} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow mb-4`}>
                <card.icon className="w-6 h-6" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{card.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{card.date}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 space-y-10">
            <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <FileCheck className="w-7 h-7 text-green-400" />
                <h2 className="text-2xl md:text-3xl font-black">প্রয়োজনীয় কাগজপত্র</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'অনলাইন জন্ম নিবন্ধন সনদের ফটোকপি।',
                  'পিতা ও মাতার এনআইডি কার্ডের কপি।',
                  'শিক্ষার্থীর ৪ কপি পাসপোর্ট সাইজ ছবি।',
                  'পূর্ববর্তী স্কুলের মূল ছাড়পত্র (টিসি)।',
                  'গত বছরের ফলাফল কার্ড/মার্কশিট।',
                  'অভিভাবকের সচল মোবাইল নম্বর।',
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <p className="text-slate-200 font-semibold text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-600" /> ভর্তি হওয়ার ধাপসমূহ
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: '১. অনলাইন ফরম পূরণ', desc: 'সঠিক তথ্য দিয়ে আবেদন ফরমটি সাবমিট করুন।' },
                  { title: '২. ফরম প্রিন্ট ও সংগ্রহ', desc: 'আবেদন শেষে App ID সহ ফরম প্রিন্ট করুন।' },
                  { title: '৩. অফিসে জমা প্রদান', desc: 'কাগজপত্র সহ স্কুল অফিসে ৩০০/- ফি জমা দিন।' },
                  { title: '৪. চূড়ান্ত ভর্তি', desc: 'ভর্তি পরীক্ষায় উত্তীর্ণ হয়ে ক্লাস শুরু করুন।' },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h4 className="font-black text-slate-900 dark:text-white mb-1">{s.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-green-700 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
              <span className="bg-white/15 inline-block px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider">
                Portal Live 2026
              </span>
              <h2 className="text-3xl font-black leading-tight">ভর্তি হতে আজই আবেদন করুন</h2>
              <p className="opacity-90 text-sm font-medium leading-relaxed">
                আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য ডিজিটাল পোর্টালে আবেদন সম্পন্ন করুন।
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="w-full bg-white text-green-800 py-4 rounded-2xl font-black text-lg hover:bg-yellow-400 hover:text-green-950 shadow-xl transition-all flex items-center justify-center gap-2"
              >
                আবেদন শুরু করুন <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-950 p-3.5 rounded-2xl text-green-700 dark:text-green-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase text-slate-400">Admission Helpdesk</p>
                  <p className="font-black text-xl text-slate-900 dark:text-white">{settings.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Users className="w-4 h-4 text-green-600" />
                <span>{lang === 'bn' ? 'লাইভ ট্র্যাকিং ও গোপনীয়তা সুরক্ষিত' : 'Privacy-Protected Digital Status Tracking'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Verified 2026 RBHS Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admission;
