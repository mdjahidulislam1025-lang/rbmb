import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  User,
  Lock,
  ArrowRight,
  ShieldAlert,
  UserPlus,
  Camera,
  Trash2,
  Users,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Droplets,
  Hash,
  BadgeCheck,
} from 'lucide-react';
import { useApp, SelfRegistrationResult } from '../App';
import { compressImageFile } from '../utils/imageUtils';
import { buildStudentRegistrationNo, phonesMatch } from '../utils/security';

const { useState, useRef, useMemo } = React;
const { Link, useNavigate } = RouterDom;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { lang, students, getUsers, login, selfRegisterAccount } = useApp();
  const registeredUsers = getUsers();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'parent'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SelfRegistrationResult | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    phone: '',
    email: '',
    password: '',
    bloodGroup: 'B+',
    photo: '',
    // Student fields
    classId: '9',
    section: 'Science',
    roll: '',
    session: '2026',
    guardianName: '',
    // Teacher fields
    designation: 'সহকারী শিক্ষক',
    subject: 'Mathematics',
    qualification: 'M.Sc, B.Ed',
    // Parent fields
    relationship: 'Father' as 'Father' | 'Mother' | 'Guardian',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 500, 0.75);
      setPhotoPreview(compressed);
      setFormData((prev) => ({ ...prev, photo: compressed }));
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewRegNo = useMemo(() => {
    if (activeTab !== 'student' || !formData.roll.trim()) return '';
    return buildStudentRegistrationNo(formData.classId, formData.roll.trim(), formData.session || '2026');
  }, [activeTab, formData.classId, formData.roll, formData.session]);

  // Live student verification preview when Parent types student's mobile number (supports multiple siblings)
  const matchedStudentsPreview = useMemo(() => {
    if (activeTab !== 'parent') return [] as Array<{ name: string; classId: string; roll: string; section: string }>;
    const digits = formData.phone.replace(/\D/g, '');
    if (digits.length < 6) return [];

    const matched: Array<{ name: string; classId: string; roll: string; section: string }> = [];
    const seen = new Set<string>();

    students.forEach((s) => {
      if (phonesMatch(formData.phone, s.guardianMobile)) {
        const key = `${s.classId}_${s.roll.trim()}`;
        if (!seen.has(key)) {
          seen.add(key);
          matched.push({ name: s.name, classId: s.classId, roll: s.roll, section: s.section });
        }
      }
    });

    (registeredUsers || []).forEach((u) => {
      if (u.role === 'student' && u.phone && phonesMatch(formData.phone, u.phone)) {
        const cId = u.linkedChildClass || '9';
        const roll = u.linkedChildRoll || '01';
        const key = `${cId}_${roll.trim()}`;
        if (!seen.has(key)) {
          seen.add(key);
          matched.push({ name: u.name, classId: cId, roll, section: u.section || 'A' });
        }
      }
    });

    return matched;
  }, [activeTab, formData.phone, students, registeredUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError(
        lang === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setIsSubmitting(true);
    const res = await selfRegisterAccount({
      role: activeTab,
      name: formData.name.trim(),
      nameBn: formData.nameBn.trim() || formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      password: formData.password,
      photo: formData.photo || undefined,
      bloodGroup: formData.bloodGroup,
      classId: formData.classId,
      section: formData.section.trim() || 'A',
      roll: formData.roll.trim(),
      session: formData.session.trim() || '2026',
      guardianName: formData.guardianName.trim() || undefined,
      designation: formData.designation.trim(),
      subject: formData.subject.trim(),
      qualification: formData.qualification.trim(),
      relationship: formData.relationship,
    });
    setIsSubmitting(false);

    if (res.ok) {
      setSuccessInfo(res);
    } else {
      setError(
        res.error ||
          (lang === 'bn'
            ? 'নিবন্ধন সম্পন্ন করা যায়নি। সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।'
            : 'Registration failed. Please verify all details and try again.')
      );
    }
  };

  const handleEnterPortalNow = () => {
    if (successInfo?.user) {
      login(successInfo.user);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center">
            <div className="bg-emerald-700 p-3 rounded-2xl shadow-lg mb-3">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">
              {lang === 'bn' ? 'নতুন অ্যাকাউন্ট নিবন্ধন করুন' : 'Create New Portal Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn'
                ? 'শিক্ষার্থী, শিক্ষক বা অভিভাবক — নিজের সঠিক তথ্য দিয়ে নিজেই অ্যাকাউন্ট খুলুন'
                : 'Self-service registration for Students, Teachers, and Parents'}
            </p>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {successInfo ? (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!' : 'Registration Successful!'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'bn'
                    ? 'আপনার সকল তথ্য ও প্রোফাইল স্থায়ীভাবে সংরক্ষিত হয়েছে।'
                    : 'All your details and portal credentials have been saved.'}
                </p>
              </div>

              {successInfo.registrationNo && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <p className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                    {lang === 'bn' ? 'আপনার শিক্ষার্থী রেজিস্ট্রেশন নম্বর (লগইনের জন্য)' : 'Your Student Registration Number (Use to Sign In)'}
                  </p>
                  <p className="text-xl font-black tracking-wider text-emerald-900 dark:text-white select-all">
                    {successInfo.registrationNo}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {lang === 'bn'
                      ? 'লগইন করার সময় এই রেজিস্ট্রেশন নম্বর ও আপনার দেওয়া পাসওয়ার্ড ব্যবহার করুন।'
                      : 'Sign in at the Student Portal using this Registration Number and your password.'}
                  </p>
                </div>
              )}

              {successInfo.teacherCode && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 space-y-1">
                  <p className="text-[11px] font-bold uppercase text-purple-700 dark:text-purple-300">
                    {lang === 'bn' ? 'স্বয়ংক্রিয় শিক্ষক আইডি কোড (ID Card প্রস্তুত)' : 'Generated Teacher ID Code (ID Card Issued)'}
                  </p>
                  <p className="text-xl font-black tracking-wider text-purple-900 dark:text-white select-all">
                    {successInfo.teacherCode}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {lang === 'bn'
                      ? 'আপনার শিক্ষক ড্যাশবোর্ডে আইডি কার্ড স্বয়ংক্রিয়ভাবে তৈরি হয়ে গেছে। মোবাইল নম্বর, ইমেইল বা আইডি কোড দিয়ে লগইন করুন।'
                      : 'Your official Teacher ID Card is ready inside your dashboard. Sign in with Teacher Code, Email, or Mobile.'}
                  </p>
                </div>
              )}

              {activeTab === 'parent' && (successInfo.matchedStudents?.length || successInfo.matchedStudentName) && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-2">
                  <p className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">
                    {lang === 'bn'
                      ? `সংযুক্ত শিক্ষার্থী (${successInfo.matchedStudents?.length || 1} জন — শুধুমাত্র এদের তথ্যই দৃশ্যমান হবে)`
                      : `Verified Linked Children (${successInfo.matchedStudents?.length || 1} — Strictly Isolated Access)`}
                  </p>
                  {successInfo.matchedStudents && successInfo.matchedStudents.length > 0 ? (
                    <div className="space-y-1.5">
                      {successInfo.matchedStudents.map((ms) => (
                        <div key={ms.id} className="text-sm font-black text-slate-900 dark:text-white">
                          {ms.name}{' '}
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            ({lang === 'bn' ? `শ্রেণী ${ms.classId} · রোল ${ms.roll}` : `Class ${ms.classId} · Roll ${ms.roll}`})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        {successInfo.matchedStudentName}
                      </p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {lang === 'bn'
                          ? `শ্রেণী ${successInfo.matchedStudentClass} · রোল ${successInfo.matchedStudentRoll}`
                          : `Class ${successInfo.matchedStudentClass} · Roll ${successInfo.matchedStudentRoll}`}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleEnterPortalNow}
                  className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  {lang === 'bn' ? 'এখনই পোর্টালে প্রবেশ করুন' : 'Enter Portal Now'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to={`/login/${activeTab}`}
                  className="block w-full py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {lang === 'bn' ? 'লগইন পেজে ফিরে যান' : 'Go to Login Page'}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1.5 m-4 rounded-2xl gap-1">
                {(
                  [
                    { id: 'student', icon: User, bn: 'শিক্ষার্থী', en: 'Student' },
                    { id: 'teacher', icon: ShieldCheck, bn: 'শিক্ষক', en: 'Teacher' },
                    { id: 'parent', icon: Users, bn: 'অভিভাবক', en: 'Parent' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setError('');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                      activeTab === item.id
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{lang === 'bn' ? item.bn : item.en}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-2 space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 border border-red-200 dark:border-red-800">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Profile Photo */}
                <div className="flex flex-col items-center space-y-2 pb-1">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-100 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-emerald-700 text-white p-1.5 rounded-full shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <p className="text-[11px] text-slate-400 font-medium">
                    {activeTab === 'teacher'
                      ? lang === 'bn'
                        ? 'আইডি কার্ডের জন্য প্রোফাইল ছবি দিন'
                        : 'Profile Photo (for ID Card)'
                      : activeTab === 'student'
                      ? lang === 'bn'
                        ? 'আইডি কার্ড ও প্রবেশপত্রের জন্য ছবি দিন'
                        : 'Student Photo (for ID & Admit Card)'
                      : lang === 'bn'
                      ? 'প্রোফাইল ছবি যোগ করুন (ঐচ্ছিক)'
                      : 'Profile Picture (Optional)'}
                  </p>
                </div>

                {/* Common Name */}
                {activeTab === 'teacher' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500">
                        {lang === 'bn' ? 'শিক্ষকের নাম (ইংরেজি) *' : 'Full Name (English) *'}
                      </label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Md. Rafiqul Islam"
                        className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">
                        {lang === 'bn' ? 'শিক্ষকের নাম (বাংলা)' : 'Full Name (Bangla)'}
                      </label>
                      <input
                        type="text"
                        name="nameBn"
                        value={formData.nameBn}
                        onChange={handleChange}
                        placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                        className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      {lang === 'bn' ? 'সম্পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={
                        activeTab === 'student'
                          ? lang === 'bn'
                            ? 'যেমন: মোঃ রহিম আহমেদ'
                            : 'e.g. Md. Rahim Ahmed'
                          : lang === 'bn'
                          ? 'অভিভাবকের সম্পূর্ণ নাম'
                          : "Guardian's Full Name"
                      }
                      className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* STUDENT SPECIFIC FIELDS */}
                {activeTab === 'student' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900">
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {lang === 'bn' ? 'শ্রেণী *' : 'Class *'}
                        </label>
                        <select
                          name="classId"
                          value={formData.classId}
                          onChange={handleChange}
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
                        >
                          {['6', '7', '8', '9', '10'].map((c) => (
                            <option key={c} value={c}>
                              {lang === 'bn' ? `${c}ম শ্রেণী` : `Class ${c}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {lang === 'bn' ? 'রোল নম্বর *' : 'Roll No *'}
                        </label>
                        <input
                          required
                          type="text"
                          name="roll"
                          value={formData.roll}
                          onChange={handleChange}
                          placeholder="05"
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {lang === 'bn' ? 'শাখা / বিভাগ *' : 'Section *'}
                        </label>
                        <input
                          required
                          type="text"
                          name="section"
                          value={formData.section}
                          onChange={handleChange}
                          placeholder="Science / A"
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {lang === 'bn' ? 'শিক্ষাবর্ষ *' : 'Session *'}
                        </label>
                        <input
                          required
                          type="text"
                          name="session"
                          value={formData.session}
                          onChange={handleChange}
                          placeholder="2026"
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {lang === 'bn' ? 'অভিভাবকের নাম *' : 'Guardian Name *'}
                        </label>
                        <input
                          required
                          type="text"
                          name="guardianName"
                          value={formData.guardianName}
                          onChange={handleChange}
                          placeholder={lang === 'bn' ? 'পিতা/মাতার নাম' : "Father / Mother's Name"}
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                        />
                      </div>
                    </div>

                    {previewRegNo && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <span className="font-bold text-slate-500 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-emerald-600" />
                          {lang === 'bn' ? 'রেজিস্ট্রেশন নম্বর:' : 'Registration No:'}
                        </span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400">{previewRegNo}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TEACHER SPECIFIC FIELDS */}
                {activeTab === 'teacher' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                          {lang === 'bn' ? 'পদবী (Designation) *' : 'Designation *'}
                        </label>
                        <input
                          required
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          placeholder="সহকারী শিক্ষক / Senior Teacher"
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                          {lang === 'bn' ? 'পাঠদানের বিষয় *' : 'Subject / Department *'}
                        </label>
                        <input
                          required
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Mathematics / Bangla / ICT"
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {lang === 'bn' ? 'শিক্ষাগত যোগ্যতা *' : 'Academic Qualification *'}
                      </label>
                      <input
                        required
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="M.Sc in Mathematics, B.Ed"
                        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* PARENT SPECIFIC RELATIONSHIP */}
                {activeTab === 'parent' && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {lang === 'bn' ? 'শিক্ষার্থীর সাথে সম্পর্ক *' : 'Relationship with Student *'}
                      </label>
                      <select
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
                      >
                        <option value="Father">{lang === 'bn' ? 'পিতা (Father)' : 'Father'}</option>
                        <option value="Mother">{lang === 'bn' ? 'মাতা (Mother)' : 'Mother'}</option>
                        <option value="Guardian">{lang === 'bn' ? 'অভিভাবক (Guardian)' : 'Guardian'}</option>
                      </select>
                    </div>
                    <p className="text-[11px] text-amber-900/80 dark:text-amber-300/90 leading-relaxed font-medium">
                      {lang === 'bn'
                        ? 'শিক্ষার্থী নিবন্ধনের সময় যে মোবাইল নম্বর দিয়েছে, ঠিক সেই মোবাইল নম্বরটি নিচে দিলে শুধুমাত্র আপনার সন্তানের তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হবে।'
                        : "Enter the exact mobile number provided by your child during registration. You will only see your own child's records."}
                    </p>
                  </div>
                )}

                {/* Phone & Blood Group / Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={activeTab === 'parent' ? 'sm:col-span-2' : ''}>
                    <label className="text-xs font-bold text-slate-500">
                      {activeTab === 'parent'
                        ? lang === 'bn'
                          ? 'শিক্ষার্থীর দেওয়া মোবাইল নম্বর *'
                          : "Student's Registered Mobile Number *"
                        : activeTab === 'student'
                        ? lang === 'bn'
                          ? 'মোবাইল নম্বর (অভিভাবক পোর্টাল সংযোগের জন্য) *'
                          : 'Mobile Number (Used for Parent Account Linking) *'
                        : lang === 'bn'
                        ? 'মোবাইল নম্বর *'
                        : 'Mobile Number *'}
                    </label>
                    <div className="relative mt-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01712-667788"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    {activeTab === 'parent' && formData.phone.replace(/\D/g, '').length >= 6 && (
                      <div
                        className={`mt-2 px-3 py-2 rounded-xl text-xs font-bold flex items-start gap-2 border ${
                          matchedStudentsPreview.length > 0
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {matchedStudentsPreview.length > 0 ? (
                          <>
                            <BadgeCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                            <div className="space-y-0.5">
                              {matchedStudentsPreview.length === 1 ? (
                                <span>
                                  {lang === 'bn'
                                    ? `শিক্ষার্থী শনাক্ত হয়েছে: ${matchedStudentsPreview[0].name} · শ্রেণী ${matchedStudentsPreview[0].classId} · রোল ${matchedStudentsPreview[0].roll}`
                                    : `Matched Student: ${matchedStudentsPreview[0].name} · Class ${matchedStudentsPreview[0].classId} · Roll ${matchedStudentsPreview[0].roll}`}
                                </span>
                              ) : (
                                <>
                                  <span className="block">
                                    {lang === 'bn'
                                      ? `${matchedStudentsPreview.length} জন শিক্ষার্থী শনাক্ত হয়েছে (সবগুলোতেই লগইন/সুইচ করা যাবে):`
                                      : `${matchedStudentsPreview.length} Students Matched on This Number:`}
                                  </span>
                                  {matchedStudentsPreview.map((ms) => (
                                    <span key={`${ms.classId}-${ms.roll}`} className="block text-[11px] font-semibold">
                                      • {ms.name} ({lang === 'bn' ? `শ্রেণী ${ms.classId} · রোল ${ms.roll}` : `Class ${ms.classId} · Roll ${ms.roll}`})
                                    </span>
                                  ))}
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <span>
                            {lang === 'bn'
                              ? 'এই মোবাইল নম্বরে এখনো কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি'
                              : 'No student matched this mobile number yet'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {activeTab !== 'parent' && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-red-500" />
                        {lang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      {lang === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
                    </label>
                    <div className="relative mt-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      {lang === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'Password (min 6 chars) *'}
                    </label>
                    <div className="relative mt-1">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        minLength={6}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {lang === 'bn' ? 'তথ্য সেভ করে নিবন্ধন সম্পন্ন করুন' : 'Save Info & Complete Registration'}{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          <div className="p-5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            {lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <Link
              to={`/login/${activeTab}`}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
            >
              {lang === 'bn' ? 'লগইন করুন' : 'Login Here'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
