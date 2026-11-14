
import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import { 
  Menu, X, GraduationCap, Globe, ChevronDown, User, ShieldCheck, 
  LogOut, Settings, ShieldAlert, Mail, Lock, Save, CheckCircle, Camera, Trash2, ArrowLeft, BookOpen, Calendar, FileText, LayoutDashboard
} from 'lucide-react';
import { SCHOOL_NAME, EIIN, TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { PWAInstallButton } from './PWAInstallButton';
import { compressImageFile } from '../utils/imageUtils';

const { useState, useRef, useEffect, useMemo } = React;
const { Link, useLocation, useNavigate } = RouterDom;

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t, user, logout, updateUser } = useApp();

  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    password: '',
    photo: ''
  });

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (user) {
      setSettingsForm({
        name: user.name,
        email: user.email || '',
        password: user.password || '',
        photo: user.photo || ''
      });
    }
  }, [user, isSettingsOpen]);

  const navLinks = useMemo(() => {
    const allLinks = [
      { name: t(TRANSLATIONS.nav.home), path: '/' },
      { name: t(TRANSLATIONS.nav.about), path: '/about' },
      { name: t(TRANSLATIONS.nav.notices), path: '/notices' },
      { name: lang === 'bn' ? 'ক্যালেন্ডার' : 'Calendar', path: '/calendar' },
      { name: t(TRANSLATIONS.nav.teachers), path: '/teachers' },
      { name: t(TRANSLATIONS.nav.routine), path: '/routine' },
      { name: t(TRANSLATIONS.nav.syllabus), path: '/syllabus' },
      { 
        name: t(TRANSLATIONS.nav.admission), 
        path: '/admission', 
        visibleFor: ['student', 'teacher', null] 
      },
      { 
        name: t(TRANSLATIONS.nav.ebooks), 
        path: '/ebooks', 
        visibleFor: ['student', 'teacher', null] 
      },
      { name: t(TRANSLATIONS.nav.gallery), path: '/gallery' },
      { name: t(TRANSLATIONS.nav.contact), path: '/contact' },
    ];

    return allLinks.filter(link => {
      if (!link.visibleFor) return true;
      const currentRole = user?.role || null;
      return link.visibleFor.includes(currentRole as any);
    });
  }, [user, lang, t]);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoginOpen(false);
    navigate('/');
  };

  const handleBack = () => {
    // Check if the history state has a key other than 'default', which usually means there is internal history
    if (location.key === 'default') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 500, 0.75);
      setSettingsForm(prev => ({ ...prev, photo: compressed }));
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser({
        ...user,
        name: settingsForm.name,
        email: settingsForm.email,
        password: settingsForm.password,
        photo: settingsForm.photo
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsSettingsOpen(false);
      }, 1500);
    }
  };

  const getRoleLabel = () => {
    if (!user) return t(TRANSLATIONS.nav.login);
    if (user.role === 'student') return lang === 'bn' ? 'শিক্ষার্থী' : 'Student';
    if (user.role === 'teacher') return lang === 'bn' ? 'শিক্ষক' : 'Teacher';
    if (user.role === 'admin') return lang === 'bn' ? 'অ্যাডমিন' : 'Admin';
    return t(TRANSLATIONS.nav.login);
  };

  const getRoleIcon = (className?: string) => {
    if (!user) return null;
    if (user.role === 'student') return <User className={className} />;
    if (user.role === 'teacher') return <ShieldCheck className={className} />;
    if (user.role === 'admin') return <ShieldAlert className={className} />;
    return null;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            {!isHome && (
              <button 
                onClick={handleBack} 
                className="p-3 mr-3 bg-slate-50 text-green-700 rounded-2xl hover:bg-green-700 hover:text-white transition-all shadow-sm active:scale-90 group flex items-center justify-center"
                title={lang === 'bn' ? 'ফিরে যান' : 'Go Back'}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-green-700 p-2 rounded-xl shadow-lg shadow-green-700/20">
                <GraduationCap className="text-white w-8 h-8" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-black text-green-900 leading-tight tracking-tight">{t(SCHOOL_NAME)}</h1>
                <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">EIIN: {EIIN}</p>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive(link.path)
                    ? 'text-green-700 bg-green-50 shadow-sm'
                    : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center gap-2 ml-6 border-l pl-6 border-gray-100" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setIsLoginOpen(!isLoginOpen)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-black border-2 transition-all active:scale-95 ${
                    user || isLoginOpen
                      ? 'bg-green-700 text-white border-green-700 shadow-xl shadow-green-700/20'
                      : 'border-green-600 text-green-700 hover:bg-green-50'
                  }`}
                >
                  {user ? (
                    <>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
                        {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : getRoleIcon("w-4 h-4")}
                      </div>
                      <div className="flex flex-col items-start leading-none text-left min-w-0 max-w-[140px]">
                        <span className="text-[13px] font-black truncate block w-full mb-0.5">{user.name}</span>
                        <span className="text-[9px] opacity-80 font-black uppercase tracking-widest">{getRoleLabel()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      {t(TRANSLATIONS.nav.login)}
                    </>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLoginOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLoginOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden z-[100]">
                    {user ? (
                      <div className="space-y-1">
                        <div className="px-5 py-4 mb-2 bg-slate-50/50 border-b border-gray-100 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-green-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                            {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : getRoleIcon("w-6 h-6 text-green-600")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-0.5">{getRoleLabel()}</p>
                            <p className="text-sm font-black text-gray-900 truncate leading-tight">{user.name}</p>
                          </div>
                        </div>
                        <div className="px-2 space-y-1">
                          <Link 
                            to="/dashboard" 
                            onClick={() => setIsLoginOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-2xl font-bold transition-all group"
                          >
                            <div className="bg-green-100 p-2 rounded-xl group-hover:bg-green-200 transition-colors">
                              <LayoutDashboard className="w-4 h-4 text-green-600" />
                            </div>
                            {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                          </Link>
                          <button 
                            onClick={() => { setIsLoginOpen(false); setIsSettingsOpen(true); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-2xl font-bold transition-all group"
                          >
                            <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-green-200 transition-colors">
                              <Settings className="w-4 h-4 text-slate-500 group-hover:text-green-600" />
                            </div>
                            {lang === 'bn' ? 'একাউন্ট সেটিংস' : 'Account Settings'}
                          </button>
                          <div className="pt-2 border-t border-gray-50 mt-1">
                            <button 
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-2xl font-black transition-all group"
                            >
                              <div className="bg-red-100 p-2 rounded-xl group-hover:bg-red-200 transition-colors">
                                <LogOut className="w-4 h-4 text-red-600" />
                              </div>
                              {lang === 'bn' ? 'লগআউট' : 'Logout'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 px-2">
                        <div className="px-4 py-2 mb-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'bn' ? 'আপনার রোল নির্বাচন করুন' : 'Select your role'}</p>
                        </div>
                        <Link 
                          to="/login/student" 
                          onClick={() => setIsLoginOpen(false)}
                          className="flex items-center gap-4 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-2xl font-bold transition-all group"
                        >
                          <div className="bg-blue-100 p-2 rounded-xl group-hover:bg-blue-200 transition-colors">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span>{t(TRANSLATIONS.nav.studentLogin)}</span>
                            <span className="text-[10px] font-medium text-slate-400">Class 6-10 Students</span>
                          </div>
                        </Link>
                        <Link 
                          to="/login/teacher" 
                          onClick={() => setIsLoginOpen(false)}
                          className="flex items-center gap-4 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-2xl font-bold transition-all group"
                        >
                          <div className="bg-purple-100 p-2 rounded-xl group-hover:bg-purple-200 transition-colors">
                            <ShieldCheck className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex flex-col">
                            <span>{t(TRANSLATIONS.nav.teacherLogin)}</span>
                            <span className="text-[10px] font-medium text-slate-400">Academic Staff Portal</span>
                          </div>
                        </Link>
                        <Link 
                          to="/login/admin" 
                          onClick={() => setIsLoginOpen(false)}
                          className="flex items-center gap-4 px-4 py-3 text-sm text-gray-700 hover:bg-slate-900 hover:text-white rounded-2xl font-bold transition-all group"
                        >
                          <div className="bg-slate-200 p-2 rounded-xl group-hover:bg-slate-300 transition-colors">
                            <ShieldAlert className="w-5 h-5 text-slate-700" />
                          </div>
                          <div className="flex flex-col">
                            <span>{t(TRANSLATIONS.nav.adminLogin)}</span>
                            <span className="text-[10px] font-medium text-slate-400">School Management</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <PWAInstallButton variant="compact" />
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-2 bg-gray-50 hover:bg-green-50 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all border border-gray-100"
            >
              <Globe className="w-3.5 h-3.5 text-green-600" />
              <span className={lang === 'bn' ? 'text-green-700' : 'text-gray-400'}>BN</span>
              <span className="text-gray-200">/</span>
              <span className={lang === 'en' ? 'text-green-700' : 'text-gray-400'}>EN</span>
            </button>

            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {user && (
              <div className="px-5 py-4 mb-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-green-700 flex items-center justify-center border-2 border-white shadow-sm">
                  {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : getRoleIcon("w-6 h-6 text-white")}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{user.name}</p>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{getRoleLabel()}</p>
                </div>
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-5 py-3.5 rounded-2xl text-base font-black transition-all ${
                  isActive(link.path)
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
               <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-5 py-3.5 rounded-2xl text-base font-black text-green-700 bg-green-50"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login/student"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-5 py-3.5 rounded-2xl text-base font-black text-white bg-green-700 shadow-lg"
              >
                Login Portal
              </Link>
            )}
            <PWAInstallButton variant="full" />
            {user && (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-5 py-3.5 rounded-2xl text-base font-black text-red-600 hover:bg-red-50 transition-all"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-green-700 p-8 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6" />
                <h2 className="text-2xl font-black">{lang === 'bn' ? 'একাউন্ট সেটিংস' : 'Account Settings'}</h2>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSettings} className="p-8 space-y-8 overflow-y-auto">
              {/* Photo Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {settingsForm.photo ? (
                      <img src={settingsForm.photo} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-green-700 text-white p-2.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  {settingsForm.photo && (
                    <button 
                      type="button"
                      onClick={() => setSettingsForm(prev => ({ ...prev, photo: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Profile Picture</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      required 
                      type="text" 
                      value={settingsForm.name} 
                      onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      required 
                      type="email" 
                      value={settingsForm.email} 
                      onChange={e => setSettingsForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      required 
                      type="password" 
                      value={settingsForm.password} 
                      onChange={e => setSettingsForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" 
                    />
                  </div>
                </div>
              </div>

              {showSuccess && (
                <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">Settings updated successfully!</span>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-green-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-green-800 transition-all active:scale-95"
              >
                <Save className="w-6 h-6" /> {lang === 'bn' ? 'সেভ করুন' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
