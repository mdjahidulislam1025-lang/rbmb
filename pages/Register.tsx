import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, ShieldAlert, UserPlus, Camera, Trash2, Users } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { compressImageFile } from '../utils/imageUtils';

const { useState, useRef } = React;
const { Link, useNavigate } = RouterDom;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t, register } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'student' | 'parent' | 'teacher' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    email: '',
    password: '',
    securityKey: '',
    linkedChildClass: '9',
    linkedChildRoll: '01',
    photo: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'admin' && formData.securityKey !== 'SCHOOL2026') {
      setError(lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি কি ভুল!' : 'Incorrect Admin Security Key!');
      return;
    }

    setIsSubmitting(true);
    const success = await register({
      role: activeTab,
      name: formData.name.trim(),
      userId: formData.userId.trim(),
      email: formData.email.trim(),
      password: formData.password,
      photo: formData.photo,
      ...(activeTab === 'parent' || activeTab === 'student'
        ? {
            linkedChildClass: formData.linkedChildClass,
            linkedChildRoll: formData.linkedChildRoll.trim() || '01',
          }
        : {}),
    });
    setIsSubmitting(false);

    if (success) {
      navigate(`/login/${activeTab}`);
    } else {
      setError(lang === 'bn' ? 'এই ইউজার আইডি ইতিমধ্যে নিবন্ধিত!' : 'User ID already registered!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center">
            <div className="bg-emerald-700 p-3 rounded-2xl shadow-lg mb-3">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">
              {lang === 'bn' ? 'নতুন অ্যাকাউন্ট নিবন্ধন করুন' : 'Register New Account'}
            </h1>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 m-4 rounded-2xl gap-1">
            {(['student', 'parent', 'teacher', 'admin'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setActiveTab(role);
                  setError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === role
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                {role === 'student' ? (
                  <User className="w-3.5 h-3.5" />
                ) : role === 'parent' ? (
                  <Users className="w-3.5 h-3.5" />
                ) : role === 'teacher' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {role === 'student'
                    ? t(TRANSLATIONS.login.studentTab)
                    : role === 'parent'
                    ? t(TRANSLATIONS.login.parentTab)
                    : role === 'teacher'
                    ? t(TRANSLATIONS.login.teacherTab)
                    : t(TRANSLATIONS.login.adminTab)}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-2 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200 dark:border-red-800">
                <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="flex flex-col items-center space-y-2 pb-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-slate-300" />}
                </div>
                {photoPreview && (
                  <button type="button" onClick={removePhoto} className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow">
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
                {lang === 'bn' ? 'প্রোফাইল ছবি যোগ করুন (ঐচ্ছিক)' : 'Add Profile Picture (Optional)'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'সম্পূর্ণ নাম' : 'Full Name'}</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'ইউজার আইডি' : 'User ID'}</label>
                  <input
                    required
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    placeholder="e.g. student02"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'ইমেইল' : 'Email'}</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {(activeTab === 'student' || activeTab === 'parent') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      {activeTab === 'parent' ? (lang === 'bn' ? 'সন্তানের শ্রেণী' : 'Child Class') : lang === 'bn' ? 'শ্রেণী' : 'Class'}
                    </label>
                    <select
                      name="linkedChildClass"
                      value={formData.linkedChildClass}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                    >
                      {['6', '7', '8', '9', '10'].map((c) => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      {activeTab === 'parent' ? (lang === 'bn' ? 'সন্তানের রোল' : 'Child Roll') : lang === 'bn' ? 'রোল নম্বর' : 'Roll No'}
                    </label>
                    <input
                      type="text"
                      name="linkedChildRoll"
                      value={formData.linkedChildRoll}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {activeTab === 'admin' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <label className="text-xs font-bold flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                    {lang === 'bn' ? 'সিকিউরিটি কি (অ্যাডমিনদের জন্য)' : 'Security Key (Admin)'}
                  </label>
                  <input
                    required
                    type="password"
                    name="securityKey"
                    value={formData.securityKey}
                    onChange={handleChange}
                    placeholder="Key: SCHOOL2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
                  />
                </div>
              )}
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              {lang === 'bn' ? 'নিবন্ধন সম্পন্ন করুন' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            {lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
              {lang === 'bn' ? 'লগইন করুন' : 'Login Here'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
