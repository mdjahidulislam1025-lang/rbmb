import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  Menu,
  X,
  GraduationCap,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  Settings,
  ShieldAlert,
  Mail,
  Lock,
  Save,
  CheckCircle,
  Camera,
  Trash2,
  ArrowLeft,
  LayoutDashboard,
  Search,
  Sun,
  Moon,
  Users,
} from 'lucide-react';
import { SCHOOL_NAME, EIIN, TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { PWAInstallButton } from './PWAInstallButton';
import { compressImageFile } from '../utils/imageUtils';

const { useState, useRef, useEffect } = React;
const { Link, useLocation, useNavigate } = RouterDom;

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'academic' | 'community' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const {
    lang,
    setLang,
    theme,
    toggleTheme,
    largeText,
    toggleLargeText,
    setSearchOpen,
    t,
    user,
    settings,
    logout,
    updateUser,
  } = useApp();

  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    newPassword: '',
    photo: '',
    linkedChildClass: '9',
    linkedChildRoll: '01',
  });

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (user) {
      setSettingsForm({
        name: user.name,
        email: user.email || '',
        newPassword: '',
        photo: user.photo || '',
        linkedChildClass: user.linkedChildClass || '9',
        linkedChildRoll: user.linkedChildRoll || '01',
      });
    }
  }, [user, isSettingsOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsLoginOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const primaryLinks = [
    { name: t(TRANSLATIONS.nav.home), path: '/' },
    { name: t(TRANSLATIONS.nav.notices), path: '/notices' },
    { name: t(TRANSLATIONS.nav.exams), path: '/exams' },
    { name: t(TRANSLATIONS.nav.ebooks), path: '/ebooks' },
    { name: t(TRANSLATIONS.nav.admission), path: '/admission' },
  ];

  const academicLinks = [
    { name: t(TRANSLATIONS.nav.about), path: '/about' },
    { name: t(TRANSLATIONS.nav.teachers), path: '/teachers' },
    { name: t(TRANSLATIONS.nav.routine), path: '/routine' },
    { name: t(TRANSLATIONS.nav.syllabus), path: '/syllabus' },
    { name: t(TRANSLATIONS.nav.holidays), path: '/holidays' },
    { name: t(TRANSLATIONS.nav.calendar), path: '/calendar' },
  ];

  const communityLinks = [
    { name: t(TRANSLATIONS.nav.gallery), path: '/gallery' },
    { name: t(TRANSLATIONS.nav.alumni), path: '/alumni' },
    { name: t(TRANSLATIONS.nav.contact), path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    setIsLoginOpen(false);
    setIsOpen(false);
    navigate('/');
  };

  const handleBack = () => {
    if (location.key === 'default') navigate('/');
    else navigate(-1);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 500, 0.75);
      setSettingsForm((prev) => ({ ...prev, photo: compressed }));
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateUser({
      ...user,
      name: settingsForm.name.trim(),
      email: settingsForm.email.trim(),
      ...(settingsForm.newPassword.trim() ? { password: settingsForm.newPassword.trim() } : {}),
      photo: settingsForm.photo,
      ...(user.role === 'parent'
        ? {
            linkedChildClass: settingsForm.linkedChildClass,
            linkedChildRoll: settingsForm.linkedChildRoll.trim(),
          }
        : {}),
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  const getRoleLabel = () => {
    if (!user) return t(TRANSLATIONS.nav.login);
    if (user.role === 'student') return lang === 'bn' ? 'শিক্ষার্থী' : 'Student';
    if (user.role === 'teacher') return lang === 'bn' ? 'শিক্ষক' : 'Teacher';
    if (user.role === 'parent') return lang === 'bn' ? 'অভিভাবক' : 'Parent';
    if (user.role === 'admin') return lang === 'bn' ? 'অ্যাডমিন' : 'Admin';
    return t(TRANSLATIONS.nav.login);
  };

  const getRoleIcon = (className?: string) => {
    if (!user) return null;
    if (user.role === 'student') return <User className={className} />;
    if (user.role === 'teacher') return <ShieldCheck className={className} />;
    if (user.role === 'parent') return <Users className={className} />;
    if (user.role === 'admin') return <ShieldAlert className={className} />;
    return null;
  };

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3 gap-3">
          {/* Left: Brand */}
          <div className="flex items-center min-w-0">
            {!isHome && (
              <button
                onClick={handleBack}
                className="p-2.5 mr-2.5 bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-700 hover:text-white transition-all active:scale-95"
                title={lang === 'bn' ? 'ফিরে যান' : 'Go Back'}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <div className="bg-emerald-700 p-2 rounded-xl shadow-md shadow-emerald-700/20 shrink-0">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div className="hidden sm:block min-w-0">
                <span className="block text-sm md:text-base font-extrabold text-emerald-950 dark:text-white leading-tight truncate max-w-[230px]">
                  {t(settings.name || SCHOOL_NAME)}
                </span>
                <span className="block text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                  EIIN: {settings.eiin || EIIN} • EST. 1958
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Clean 5-7 item navigation */}
          <div className="hidden xl:flex items-center gap-1" ref={navMenuRef}>
            {primaryLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive(link.path)
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Academic Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'academic' ? null : 'academic')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  academicLinks.some((l) => isActive(l.path))
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {lang === 'bn' ? 'একাডেমিক' : 'Academic'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'academic' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'academic' && (
                <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                  {academicLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpenDropdown(null)}
                      className={`block px-4 py-2.5 text-xs font-bold transition-colors ${
                        isActive(item.path)
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Community Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'community' ? null : 'community')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  communityLinks.some((l) => isActive(l.path))
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {lang === 'bn' ? 'কমিউনিটি' : 'Community'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'community' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'community' && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                  {communityLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpenDropdown(null)}
                      className={`block px-4 py-2.5 text-xs font-bold transition-colors ${
                        isActive(item.path)
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Utilities + Portal Account */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              title={lang === 'bn' ? 'তথ্য খুঁজুন (Ctrl+K)' : 'Search (Ctrl+K)'}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-yellow-400 transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleLargeText}
              className={`hidden sm:flex items-center justify-center px-2.5 py-1.5 rounded-xl text-[11px] font-black border transition-colors ${
                largeText
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300'
              }`}
              title={lang === 'bn' ? 'লেখা বড়/ছোট করুন' : 'Toggle Large Text'}
            >
              A+
            </button>

            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-wide transition-colors"
            >
              <span className={lang === 'bn' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}>BN</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className={lang === 'en' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}>EN</span>
            </button>

            <div className="hidden md:block">
              <PWAInstallButton variant="compact" />
            </div>

            {/* Portal Login / Profile Dropdown */}
            <div className="hidden lg:block relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLoginOpen(!isLoginOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all active:scale-95 ${
                  user || isLoginOpen
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                    : 'border-emerald-600 text-emerald-700 dark:text-emerald-300 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                }`}
              >
                {user ? (
                  <>
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                      {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : getRoleIcon('w-3.5 h-3.5')}
                    </div>
                    <span className="truncate max-w-[100px]">{user.name}</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5" />
                    <span>{t(TRANSLATIONS.nav.login)}</span>
                  </>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLoginOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLoginOpen && (
                <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2.5 z-[100]">
                  {user ? (
                    <div className="space-y-1">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                          {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : getRoleIcon('w-5 h-5 text-emerald-700 dark:text-emerald-300')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{getRoleLabel()}</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        </div>
                      </div>
                      <div className="px-2 space-y-1 pt-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsLoginOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          {lang === 'bn' ? 'ড্যাশবোর্ড পোর্টাল' : 'Dashboard Portal'}
                        </Link>
                        <button
                          onClick={() => {
                            setIsLoginOpen(false);
                            setIsSettingsOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          {lang === 'bn' ? 'একাউন্ট সেটিংস' : 'Account Settings'}
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                        >
                          <LogOut className="w-4 h-4" />
                          {lang === 'bn' ? 'লগআউট' : 'Logout'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 px-2">
                      <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {lang === 'bn' ? 'পোর্টাল নির্বাচন করুন' : 'Select Portal'}
                      </p>
                      <Link
                        to="/login/student"
                        onClick={() => setIsLoginOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                          <User className="w-4 h-4" />
                        </span>
                        <div>
                          <div>{t(TRANSLATIONS.nav.studentLogin)}</div>
                          <div className="text-[10px] font-normal text-slate-400">Results, Routine & Exams</div>
                        </div>
                      </Link>
                      <Link
                        to="/login/parent"
                        onClick={() => setIsLoginOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                          <Users className="w-4 h-4" />
                        </span>
                        <div>
                          <div>{t(TRANSLATIONS.nav.parentLogin)}</div>
                          <div className="text-[10px] font-normal text-slate-400">Child Progress & Notices</div>
                        </div>
                      </Link>
                      <Link
                        to="/login/teacher"
                        onClick={() => setIsLoginOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        <span className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <div>
                          <div>{t(TRANSLATIONS.nav.teacherLogin)}</div>
                          <div className="text-[10px] font-normal text-slate-400">Attendance, Marks & Leave</div>
                        </div>
                      </Link>
                      <Link
                        to="/login/admin"
                        onClick={() => setIsLoginOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        <span className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          <ShieldAlert className="w-4 h-4" />
                        </span>
                        <div>
                          <div>{t(TRANSLATIONS.nav.adminLogin)}</div>
                          <div className="text-[10px] font-normal text-slate-400">Full School Control</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {isOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-2">
            {user && (
              <div className="px-4 py-3 mb-2 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-700 flex items-center justify-center shrink-0">
                    {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : getRoleIcon('w-5 h-5 text-white')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">{getRoleLabel()}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[...primaryLinks, ...academicLinks, ...communityLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive(link.path)
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                      : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {user ? (
                <div className="flex gap-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-3 rounded-xl text-xs font-bold text-white bg-emerald-700"
                  >
                    {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40"
                  >
                    {lang === 'bn' ? 'লগআউট' : 'Logout'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login/student"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white"
                  >
                    {t(TRANSLATIONS.nav.studentLogin)}
                  </Link>
                  <Link
                    to="/login/parent"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white"
                  >
                    {t(TRANSLATIONS.nav.parentLogin)}
                  </Link>
                  <Link
                    to="/login/teacher"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white"
                  >
                    {t(TRANSLATIONS.nav.teacherLogin)}
                  </Link>
                  <Link
                    to="/login/admin"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white"
                  >
                    {t(TRANSLATIONS.nav.adminLogin)}
                  </Link>
                </div>
              )}
              <PWAInstallButton variant="full" />
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="bg-emerald-700 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <h2 className="text-lg font-extrabold">{lang === 'bn' ? 'একাউন্ট সেটিংস' : 'Account Settings'}</h2>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSettings} className="p-6 space-y-5 overflow-y-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden flex items-center justify-center">
                    {settingsForm.photo ? (
                      <img src={settingsForm.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-emerald-700 text-white p-2 rounded-xl shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {settingsForm.photo && (
                    <button
                      type="button"
                      onClick={() => setSettingsForm((prev) => ({ ...prev, photo: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-lg shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {user?.role === 'parent' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? 'সন্তানের শ্রেণী' : 'Child Class'}
                      </label>
                      <select
                        value={settingsForm.linkedChildClass}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, linkedChildClass: e.target.value }))}
                        className="w-full mt-1 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                      >
                        {['6', '7', '8', '9', '10'].map((c) => (
                          <option key={c} value={c}>
                            Class {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? 'সন্তানের রোল' : 'Child Roll'}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.linkedChildRoll}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, linkedChildRoll: e.target.value }))}
                        className="w-full mt-1 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'নতুন পাসওয়ার্ড (পরিবর্তন করতে চাইলে)' : 'New Password (optional)'}
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={settingsForm.newPassword}
                      placeholder={lang === 'bn' ? 'অপরিবর্তিত রাখতে ফাঁকা রাখুন' : 'Leave blank to keep current password'}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, newPassword: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {showSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 text-xs font-bold">
                  <CheckCircle className="w-4 h-4" />
                  {lang === 'bn' ? 'তথ্য সফলভাবে আপডেট হয়েছে!' : 'Settings updated successfully!'}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {lang === 'bn' ? 'পরিবর্তন সেভ করুন' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
