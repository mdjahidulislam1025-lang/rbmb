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
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { compressImageFile } from '../utils/imageUtils';

const { useState, useRef } = React;
const { Link, useNavigate } = RouterDom;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t, registerWithEmail, resendVerificationEmail, refreshAuthSession } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
    setInfoMsg('');

    if (formData.password.length < 6) {
      setError(
        lang === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setIsSubmitting(true);
    const res = await registerWithEmail({
      role: activeTab,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      photo: formData.photo,
      linkedChildClass: formData.linkedChildClass,
      linkedChildRoll: formData.linkedChildRoll.trim() || '01',
    });
    setIsSubmitting(false);

    if (res.ok) {
      if (res.needsVerification) {
        setVerificationPending(true);
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(
        res.error ||
          (lang === 'bn'
            ? 'নিবন্ধন সম্পন্ন করা যায়নি। সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।'
            : 'Registration failed. Please check your details and try again.')
      );
    }
  };

  const handleResend = async () => {
    setInfoMsg('');
    const ok = await resendVerificationEmail();
    setInfoMsg(
      ok
        ? lang === 'bn'
          ? 'ভেরিফিকেশন ইমেইল পুনরায় পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স ও স্প্যাম ফোল্ডার দেখুন।'
          : 'Verification email resent. Please check your inbox and spam folder.'
        : lang === 'bn'
        ? 'ইমেইল পাঠানো যায়নি। অনুগ্রহ করে একটু পর চেষ্টা করুন।'
        : 'Could not resend email right now. Try again shortly.'
    );
  };

  const handleCheckVerified = async () => {
    setIsSubmitting(true);
    const verified = await refreshAuthSession();
    setIsSubmitting(false);
    if (verified) {
      navigate('/dashboard');
    } else {
      setError(
        lang === 'bn'
          ? 'ইমেইল এখনো ভেরিফাই হয়নি। আপনার ইনবক্সের লিংকে ক্লিক করে আবার চেষ্টা করুন।'
          : 'Email not verified yet. Click the link in your inbox, then press Continue.'
      );
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
          {verificationPending ? (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'ইমেইল ভেরিফিকেশন লিংক পাঠানো হয়েছে' : 'Verify Your Email Address'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'bn'
                  ? `আপনার ইমেইল (${formData.email}) এ একটি যাচাইকরণ লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন।`
                  : `A verification link has been sent to ${formData.email}. Click the link in your email to activate your portal access.`}
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 p-3 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              {infoMsg && (
                <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 p-3 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  {infoMsg}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCheckVerified}
                  className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'bn' ? 'ভেরিফাই সম্পন্ন — পোর্টালে প্রবেশ করুন' : 'I Have Verified — Continue'}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'পুনরায় ভেরিফিকেশন ইমেইল পাঠান' : 'Resend Verification Email'}
                </button>
                <Link
                  to={`/login/${activeTab}`}
                  className="block w-full py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {lang === 'bn' ? 'লগইন পাতায় যান' : 'Go to Login Page'}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 m-4 rounded-2xl gap-1">
                {(['student', 'parent'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setActiveTab(role);
                      setError('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === role
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {role === 'student' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    <span>
                      {role === 'student' ? t(TRANSLATIONS.login.studentTab) : t(TRANSLATIONS.login.parentTab)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mx-6 mb-2 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                {lang === 'bn'
                  ? 'শিক্ষক ও অ্যাডমিন অ্যাকাউন্ট স্কুল কর্তৃপক্ষ কর্তৃক অনুমোদিত ও নির্ধারিত হয়।'
                  : 'Teacher and Admin roles are provisioned exclusively by School Administration.'}
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

                  <div>
                    <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'ইমেইল' : 'Email Address'}</label>
                    <div className="relative mt-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

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

                  <div>
                    <label className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min 6 chars)'}</label>
                    <div className="relative mt-1">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        minLength={6}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {lang === 'bn' ? 'নিবন্ধন সম্পন্ন করুন' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

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
