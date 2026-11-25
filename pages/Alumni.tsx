import * as React from 'react';
import {
  Users,
  Search,
  GraduationCap,
  MapPin,
  Briefcase,
  Calendar,
  PlusCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../App';
import { AlumniProfile } from '../types';

const { useState, useMemo } = React;

const Alumni: React.FC = () => {
  const { lang, alumni, submitAlumniProfile, isCloudAdmin } = useApp();
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const visibleAlumni = useMemo(() => {
    return alumni.filter((a) => isCloudAdmin || a.status === 'approved');
  }, [alumni, isCloudAdmin]);

  const batches = useMemo(() => {
    const years = Array.from(new Set<string>(visibleAlumni.map((a) => a.batchYear))).sort((a, b) =>
      b.localeCompare(a)
    );
    return ['All', ...years];
  }, [visibleAlumni]);

  const filtered = useMemo(() => {
    return visibleAlumni.filter((a) => {
      if (batchFilter !== 'All' && a.batchYear !== batchFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.organization.toLowerCase().includes(q) ||
        a.currentRole.toLowerCase().includes(q) ||
        a.batchYear.includes(q)
      );
    });
  }, [visibleAlumni, batchFilter, search]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');
    const f = e.currentTarget as HTMLFormElement & {
      fullName: HTMLInputElement;
      batchYear: HTMLInputElement;
      currentRole: HTMLInputElement;
      organization: HTMLInputElement;
      city: HTMLInputElement;
      message: HTMLTextAreaElement;
    };
    const cleanBatch = f.batchYear.value.trim();
    if (cleanBatch.length < 4) {
      setSubmitError(lang === 'bn' ? 'কমপক্ষে ৪ সংখ্যার পাশের সাল লিখুন (যেমন: 2018)।' : 'Please enter a valid 4-digit batch year (e.g. 2018).');
      return;
    }
    const newProfile: AlumniProfile = {
      id: `alu-${Date.now()}`,
      name: f.fullName.value.trim(),
      batchYear: cleanBatch,
      currentRole: f.currentRole.value.trim(),
      organization: f.organization.value.trim(),
      city: f.city.value.trim(),
      message: f.message.value.trim(),
      status: 'pending',
      isPublic: false,
    };
    setIsSubmitting(true);
    try {
      await submitAlumniProfile(newProfile);
      setShowJoinModal(false);
      setSubmittedNotice(true);
      setTimeout(() => setSubmittedNotice(false), 5000);
    } catch {
      setSubmitError(
        lang === 'bn'
          ? 'ক্লাউড ডাটাবেসে সংরক্ষণ করা যায়নি। তথ্য যাচাই করে পুনরায় চেষ্টা করুন।'
          : 'Could not save to cloud database. Please check fields and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header & Reunion Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-400">
            <Users className="w-4 h-4" />
            {lang === 'bn' ? 'প্রাক্তন শিক্ষার্থী নেটওয়ার্ক' : 'RBHS Alumni Association'}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {lang === 'bn' ? 'গৌরবময় প্রাক্তন শিক্ষার্থী নেটওয়ার্ক' : 'Proud Alumni Network'}
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {lang === 'bn'
              ? 'দেশ-বিদেশে কর্মরত রাণীর বাজার মাধ্যমিক বিদ্যালয়ের প্রাক্তন শিক্ষার্থীদের তথ্য, অভিজ্ঞতা ও পুনর্মিলনী বার্তা।'
              : 'Connecting graduates of রাণীর বাজার মাধ্যমিক বিদ্যালয় across universities, medicine, engineering, and public service.'}
          </p>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-2xl p-6 space-y-3 max-w-sm shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
            <Calendar className="w-4 h-4" />
            {lang === 'bn' ? 'আসন্ন পুনর্মিলনী ২০২৬' : 'Grand Reunion 2026'}
          </div>
          <p className="text-sm font-medium text-slate-100">
            {lang === 'bn'
              ? 'ডিসেম্বর ২৫, ২০২৬ — বিদ্যালয় ক্যাম্পাস প্রাঙ্গণে সকল ব্যাচের প্রাক্তন শিক্ষার্থীদের মিলনমেলা।'
              : 'December 25, 2026 — Annual Homecoming & Career Mentorship Day at the RBHS Campus.'}
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {lang === 'bn' ? 'অ্যালামনাই হিসেবে নিবন্ধন করুন' : 'Register as Alumni'}
          </button>
        </div>
      </div>

      {submittedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {lang === 'bn'
            ? 'আপনার অ্যালামনাই তথ্য সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদনের পর ডিরেক্টরিতে যুক্ত হবে।'
            : 'Thank you! Your alumni registration has been submitted for admin verification.'}
        </div>
      )}

      {/* Search & Batch Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'নাম, প্রতিষ্ঠান বা ব্যাচ খুঁজুন...' : 'Search by name, organization, or batch...'}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          {batches.map((b) => (
            <button
              key={b}
              onClick={() => setBatchFilter(b)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                batchFilter === b
                  ? 'bg-green-700 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {b === 'All' ? (lang === 'bn' ? 'সকল ব্যাচ' : 'All Batches') : `SSC ${b}`}
            </button>
          ))}
        </div>
      </div>

      {/* Alumni Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-green-700 text-white font-extrabold text-lg flex items-center justify-center shrink-0">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{item.name}</h3>
                  <p className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5" /> SSC Batch {item.batchYear}
                  </p>
                </div>
              </div>
              {item.status === 'pending' && (
                <span className="text-[10px] font-bold uppercase text-amber-600">Pending</span>
              )}
            </div>

            <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2 font-semibold">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                {item.currentRole} — {item.organization}
              </p>
              {item.city && (
                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {item.city}
                </p>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              "{item.message}"
            </p>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{lang === 'bn' ? 'অ্যালামনাই নিবন্ধন ফরম' : 'Alumni Directory Registration'}</h2>
              <button onClick={() => setShowJoinModal(false)} className="p-1.5 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
                  {submitError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</label>
                  <input required name="fullName" maxLength={150} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{lang === 'bn' ? 'SSC পাশের সাল' : 'SSC Batch Year'}</label>
                  <input required name="batchYear" minLength={4} placeholder="2018" maxLength={10} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{lang === 'bn' ? 'বর্তমান পদবি / পেশা' : 'Current Role'}</label>
                  <input required name="currentRole" maxLength={150} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{lang === 'bn' ? 'কর্মস্থল / বিশ্ববিদ্যালয়' : 'Organization / University'}</label>
                  <input required name="organization" maxLength={200} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{lang === 'bn' ? 'বর্তমান শহর' : 'Current City'}</label>
                <input name="city" maxLength={100} placeholder="Dhaka / Cumilla" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{lang === 'bn' ? 'শিক্ষার্থীদের উদ্দেশ্যে বার্তা' : 'Message for Students'}</label>
                <textarea required name="message" rows={3} maxLength={1000} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm" />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-3.5 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-lg disabled:opacity-60">
                {isSubmitting ? (lang === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : lang === 'bn' ? 'তথ্য জমা দিন' : 'Submit Alumni Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alumni;
