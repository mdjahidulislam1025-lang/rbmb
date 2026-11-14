
import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, ShieldCheck, GraduationCap, ShieldAlert, UserPlus, Camera, Trash2 } from 'lucide-react';
import { TRANSLATIONS, SCHOOL_NAME } from '../constants';
import { useApp } from '../App';
import { compressImageFile } from '../utils/imageUtils';

const { useState, useRef } = React;
const { Link, useNavigate } = RouterDom;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t, register } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    email: '',
    password: '',
    securityKey: '',
    photo: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 500, 0.75);
      setPhotoPreview(compressed);
      setFormData(prev => ({ ...prev, photo: compressed }));
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'admin' && formData.securityKey !== 'SCHOOL2026') {
      setError(lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি কি ভুল!' : 'Incorrect Admin Security Key!');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const success = register({
        role: activeTab,
        name: formData.name,
        userId: formData.userId,
        email: formData.email,
        password: formData.password,
        photo: formData.photo
      });

      setIsSubmitting(false);

      if (success) {
        navigate('/login');
      } else {
        setError(lang === 'bn' ? 'এই ইউজার আইডি ইতিমধ্যে নিবন্ধিত!' : 'User ID already registered!');
      }
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center">
            <div className="bg-green-700 p-3 rounded-2xl shadow-lg mb-4">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-900 tracking-tight">
              {lang === 'bn' ? 'নতুন অ্যাকাউন্ট নিবন্ধন করুন' : 'Register New Account'}
            </h1>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex bg-gray-50 p-1 m-4 rounded-2xl">
            {(['student', 'teacher', 'admin'] as const).map(role => (
              <button 
                key={role}
                onClick={() => { setActiveTab(role); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  activeTab === role ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {role === 'student' ? <User className="w-4 h-4" /> : role === 'teacher' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                <span className="hidden sm:inline">
                   {role === 'student' ? t(TRANSLATIONS.login.studentTab) : role === 'teacher' ? t(TRANSLATIONS.login.teacherTab) : t(TRANSLATIONS.login.adminTab)}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border border-red-100">
                <ShieldAlert className="w-5 h-5" /> {error}
              </div>
            )}

            {/* Photo Upload Section */}
            <div className="flex flex-col items-center space-y-4 pb-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-green-100 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                {photoPreview && (
                  <button 
                    type="button" 
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-green-700 text-white p-2 rounded-full shadow-lg hover:bg-green-800 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
              />
              <p className="text-xs text-gray-500 font-medium">
                {lang === 'bn' ? 'প্রোফাইল ছবি যোগ করুন (ঐচ্ছিক)' : 'Add Profile Picture (Optional)'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{lang === 'bn' ? 'সম্পূর্ণ নাম' : 'Full Name'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><User className="w-5 h-5" /></div>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{lang === 'bn' ? 'ইউজার আইডি' : 'User ID'}</label>
                  <input required type="text" name="userId" value={formData.userId} onChange={handleChange} placeholder="e.g. ID12345" className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{lang === 'bn' ? 'ইমেইল' : 'Email'}</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/30" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock className="w-5 h-5" /></div>
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/30" />
                </div>
              </div>

              {activeTab === 'admin' && (
                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> {lang === 'bn' ? 'সিকিউরিটি কি (অ্যাডমিনদের জন্য)' : 'Security Key (For Admins)'}
                  </label>
                  <input required type="password" name="securityKey" value={formData.securityKey} onChange={handleChange} placeholder="Key: SCHOOL2026" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              )}
            </div>

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-800 shadow-xl shadow-green-700/20 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              {isSubmitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{lang === 'bn' ? 'নিবন্ধন সম্পন্ন করুন' : 'Complete Registration'} <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="p-6 bg-gray-50 border-t text-center">
            <p className="text-sm text-gray-500">
              {lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'} <Link to="/login" className="text-green-700 font-bold hover:underline">{lang === 'bn' ? 'লগইন করুন' : 'Login Here'}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
