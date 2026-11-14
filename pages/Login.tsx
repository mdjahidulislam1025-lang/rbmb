
import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import { 
  User as UserIcon, Lock, ArrowRight, ShieldCheck, GraduationCap, LayoutDashboard, 
  FileText, Bell, Settings, LogOut, ShieldAlert, Camera, Trash2, Info, 
  BookOpen, CheckCircle, ArrowLeft, PlusCircle, Save, AlertTriangle, Calendar, X, 
  Database, RefreshCcw, Users, Image as ImageIcon, Home, Upload, Download, Sparkles, Mail, UserPlus, RotateCcw, Pencil, Cloud, CloudOff, MessageSquare, ClipboardList
} from 'lucide-react';
import { TRANSLATIONS, CLASSES } from '../constants';
import { useApp, AuthUser } from '../App';
import { Notice, Teacher, GalleryItem } from '../types';
import { EBook } from '../constants';
import { compressImageFile } from '../utils/imageUtils';

const { useState, useEffect, useRef } = React;
const { useLocation, Link, useNavigate } = RouterDom;

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolPhotoInputRef = useRef<HTMLInputElement>(null);
  const { 
    lang, t, user, isCloudAdmin, signInWithGoogle, login, logout, getUsers, updateUser, deleteUser, dbStatus, register,
    notices, addNotice, updateNotice, deleteNotice, 
    teachers, addTeacher, updateTeacher, deleteTeacher, 
    ebooks, addEbook, updateEbook, deleteEbook, 
    gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, 
    admissions, updateAdmissionStatus, deleteAdmission,
    contactMessages, markContactMessageRead, deleteContactMessage,
    settings, updateSettings, exportDatabase, importDatabase
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dashboardView, setDashboardView] = useState<'main' | 'admin-management'>('main');
  const [managementTab, setManagementTab] = useState<'notices' | 'teachers' | 'ebooks' | 'gallery' | 'admissions' | 'messages' | 'users' | 'system'>('notices');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Editing state
  const [editingItem, setEditingItem] = useState<any>(null);

  // System form state
  const [systemForm, setSystemForm] = useState({
    nameBn: settings.name.bn,
    nameEn: settings.name.en,
    eiin: settings.eiin,
    phone: settings.phone,
    email: settings.email,
    locBn: settings.location.bn,
    locEn: settings.location.en,
    schoolPhoto: settings.schoolPhoto || ''
  });

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/teacher')) setActiveTab('teacher');
    else if (path.includes('/admin')) setActiveTab('admin');
    else setActiveTab('student');
  }, [location.pathname]);

  useEffect(() => {
    setSystemForm({
      nameBn: settings.name.bn,
      nameEn: settings.name.en,
      eiin: settings.eiin,
      phone: settings.phone,
      email: settings.email,
      locBn: settings.location.bn,
      locEn: settings.location.en,
      schoolPhoto: settings.schoolPhoto || ''
    });
  }, [settings]);

  const handleQuickLogin = (role: 'admin' | 'teacher' | 'student') => {
    setActiveTab(role);
    if (role === 'admin') { setUserId('admin'); setPassword('admin123'); }
    else { setUserId(role + '01'); setPassword('123456'); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    setTimeout(() => {
      const allUsers = getUsers();
      const inputId = userId.trim().toLowerCase();
      const inputPass = password.trim();
      
      const foundUser = allUsers.find(u => u.userId.toLowerCase() === inputId && u.password === inputPass);

      if (foundUser) {
        if (foundUser.role === activeTab) {
          login(foundUser);
          navigate('/dashboard');
        } else {
          setError(lang === 'bn' ? `এই আইডিটি ${foundUser.role} হিসেবে নিবন্ধিত।` : `This ID is registered as ${foundUser.role.toUpperCase()}.`);
        }
      } else {
        setError(lang === 'bn' ? 'ভুল আইডি বা পাসওয়ার্ড!' : 'Invalid credentials. Try admin/admin123');
      }
      setIsSubmitting(false);
    }, 800);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const compressed = await compressImageFile(file, 500, 0.75);
      updateUser({ ...user, photo: compressed });
    }
  };

  const handleSchoolPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 1000, 0.72);
      setSystemForm(prev => ({ ...prev, schoolPhoto: compressed }));
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsSubmitting(true);
    const ok = await signInWithGoogle();
    setIsSubmitting(false);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError(lang === 'bn' ? 'Google লগইন সম্পন্ন হয়নি। আবার চেষ্টা করুন।' : 'Google Sign-In was cancelled or failed.');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setTempImage('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    if (item.photo) setTempImage(item.photo);
    else if (item.coverUrl) setTempImage(item.coverUrl);
    else if (item.url) setTempImage(item.url);
    else setTempImage('');
    setIsAddModalOpen(true);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    const isEdit = !!editingItem;
    const id = isEdit ? editingItem.id : Date.now().toString();

    try {
      if (managementTab === 'notices') {
        const data: Notice = { id, title: { bn: f.titleBn.value, en: f.titleEn.value }, description: { bn: f.descBn.value, en: f.descEn.value }, category: f.category.value as any, date: f.date.value };
        isEdit ? updateNotice(data) : addNotice(data);
      } else if (managementTab === 'teachers') {
        const data: Teacher = { id, name: { bn: f.nameBn.value, en: f.nameEn.value }, designation: { bn: f.desigBn.value, en: f.desigEn.value }, subject: { bn: f.subBn.value, en: f.subEn.value }, qualification: { bn: f.qualBn.value, en: f.qualEn.value }, photo: tempImage || editingItem?.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400' };
        isEdit ? updateTeacher(data) : addTeacher(data);
      } else if (managementTab === 'ebooks') {
        const data: EBook = { id, title: { bn: f.titleBn.value, en: f.titleEn.value }, classId: f.classId.value, className: { bn: `${f.classId.value}ম শ্রেণী`, en: `Class ${f.classId.value}` }, subject: f.subject.value, coverUrl: tempImage || editingItem?.coverUrl || 'https://picsum.photos/300/400', downloadUrl: '#' };
        isEdit ? updateEbook(data) : addEbook(data);
      } else if (managementTab === 'gallery') {
        const data: GalleryItem = { id, caption: { bn: f.capBn.value, en: f.capEn.value }, url: tempImage || editingItem?.url || 'https://picsum.photos/800/600' };
        isEdit ? updateGalleryItem(data) : addGalleryItem(data);
      } else if (managementTab === 'users') {
        if (isEdit) {
           updateUser({ ...editingItem, name: f.userName.value, email: f.userEmail.value, password: f.userPass.value, role: f.userRole.value, photo: tempImage || editingItem.photo });
        } else {
          const success = register({ name: f.userName.value, userId: f.userId.value, email: f.userEmail.value, password: f.userPass.value, role: f.userRole.value, photo: tempImage || '' });
          if (!success) alert('User ID already exists!');
        }
      }
      setIsAddModalOpen(false); 
      setTempImage('');
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: { bn: systemForm.nameBn, en: systemForm.nameEn },
      eiin: systemForm.eiin,
      phone: systemForm.phone,
      email: systemForm.email,
      location: { bn: systemForm.locBn, en: systemForm.locEn },
      schoolPhoto: systemForm.schoolPhoto
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const getThemeColor = () => {
    if (activeTab === 'student') return 'text-blue-600 bg-blue-600';
    if (activeTab === 'teacher') return 'text-purple-600 bg-purple-600';
    return 'text-slate-900 bg-slate-900';
  };

  if (user) {
    const allRegisteredUsers = getUsers();

    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[70vh]">
          {/* Dashboard Header */}
          <div className="bg-green-700 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden bg-white/20 border-4 border-white/30">
                  {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-6" />}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-white text-green-700 p-2 rounded-xl shadow-lg hover:scale-110 transition-all"><Camera className="w-4 h-4" /></button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-black">{user.name}</h1>
                <p className="opacity-70 font-bold uppercase tracking-widest text-[10px]">{user.role} Portal | ID: {user.userId}</p>
              </div>
            </div>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"><LogOut className="w-4 h-4" /> Logout</button>
          </div>

          <div className="p-8">
            {dashboardView === 'main' ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b pb-6">
                   <h2 className="text-xl font-black text-slate-800">Quick Actions</h2>
                   <Link to="/" className="text-[10px] font-black uppercase text-green-700 flex items-center gap-2 hover:underline"><Home className="w-3 h-3" /> Website Home</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                   {[
                     { icon: FileText, label: 'Academic Routine', color: 'bg-blue-50 text-blue-600' },
                     { icon: GraduationCap, label: 'Results & Grade', color: 'bg-purple-50 text-purple-600' },
                     { icon: Bell, label: 'Latest Notices', color: 'bg-orange-50 text-orange-600' },
                     { icon: UserPlus, label: lang === 'bn' ? 'ইউজার রেজিস্ট্রেশন' : 'Register New User', color: 'bg-green-50 text-green-700', hidden: user.role !== 'admin', onClick: () => { setDashboardView('admin-management'); setManagementTab('users'); } },
                     { icon: ShieldAlert, label: 'Admin Tools', color: 'bg-slate-50 text-slate-900', hidden: user.role !== 'admin', onClick: () => setDashboardView('admin-management') },
                   ].filter(x => !x.hidden).map((action, i) => (
                     <button key={i} onClick={action.onClick} className="flex items-center gap-5 p-6 rounded-3xl border border-gray-100 hover:border-green-200 hover:bg-green-50/20 transition-all text-left group active:scale-95">
                       <div className={`p-4 rounded-2xl ${action.color} group-hover:scale-110 transition-transform`}><action.icon /></div>
                       <span className="font-black text-slate-700 text-sm">{action.label}</span>
                     </button>
                   ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setDashboardView('main')} 
                    className="flex items-center gap-3 text-green-700 font-black text-xs uppercase hover:bg-green-50 px-5 py-3 rounded-2xl transition-all group shadow-sm border border-green-100"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                    {lang === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}
                  </button>
                  <h2 className="text-xl font-black text-slate-900">System Management</h2>
                </div>
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isCloudAdmin ? 'bg-green-50 border-green-200 text-green-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  <div className="flex items-center gap-3">
                    {isCloudAdmin ? <Cloud className="w-6 h-6 text-green-700 shrink-0" /> : <CloudOff className="w-6 h-6 text-amber-600 shrink-0" />}
                    <div>
                      <p className="font-black text-xs uppercase tracking-wider">
                        {isCloudAdmin
                          ? (lang === 'bn' ? 'ক্লাউড ডাটাবেস সিঙ্ক সক্রিয় আছে' : 'Cloud Firestore Sync Active')
                          : (lang === 'bn' ? 'বর্তমানে শুধু এই ডিভাইসে সেভ হচ্ছে' : 'Saving Locally Only — Connect Google for Cloud Sync')}
                      </p>
                      <p className="text-xs opacity-80 font-medium">
                        {isCloudAdmin
                          ? (lang === 'bn' ? 'সব পরিবর্তন স্থায়ীভাবে ক্লাউড এবং অ্যান্ড্রয়েড অ্যাপে সেভ হচ্ছে।' : 'All changes are permanently saved to Cloud Firestore across devices.')
                          : (lang === 'bn' ? 'সব ডিভাইস ও APK-তে তথ্য সেভ রাখতে Google দিয়ে অ্যাডমিন লগইন করুন।' : 'Sign in with your Google Admin account to persist changes across all devices.')}
                      </p>
                    </div>
                  </div>
                  {!isCloudAdmin && (
                    <button
                      onClick={handleGoogleAuth}
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-700 transition-all shrink-0"
                    >
                      {lang === 'bn' ? 'Google ক্লাউড সিঙ্ক' : 'Connect Google'}
                    </button>
                  )}
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] overflow-x-auto no-scrollbar border border-slate-200">
                  {['notices', 'teachers', 'ebooks', 'gallery', 'admissions', 'messages', 'users', 'system'].map(tab => (
                    <button key={tab} onClick={() => setManagementTab(tab as any)} className={`flex-1 py-3.5 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${managementTab === tab ? 'bg-white text-green-700 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
                
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-gray-100 min-h-[40vh]">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">
                        {managementTab === 'system' ? 'System Configuration' : `Active ${managementTab.toUpperCase()} List`}
                      </h3>
                      {managementTab !== 'system' && managementTab !== 'admissions' && managementTab !== 'messages' && (
                        <button onClick={openAddModal} className="bg-green-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-green-800 transition-all shadow-lg">
                          <PlusCircle className="w-4 h-4" /> 
                          {managementTab === 'users' ? 'Register New User' : `Add New ${managementTab.slice(0, -1)}`}
                        </button>
                      )}
                   </div>
                   
                   <div className="overflow-hidden rounded-2xl">
                      {managementTab === 'system' ? (
                        <div className="space-y-12">
                          <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center border-b pb-8">
                              <div className="w-full md:w-1/2 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">School Main Building Photo</h4>
                                <div className="aspect-video w-full rounded-[1.5rem] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center relative group shadow-inner">
                                  {systemForm.schoolPhoto ? (
                                    <img src={systemForm.schoolPhoto} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                      <ImageIcon className="w-12 h-12" />
                                      <span className="text-[10px] font-black uppercase">No Image Uploaded</span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button type="button" onClick={() => schoolPhotoInputRef.current?.click()} className="bg-white text-green-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                                      <Upload className="w-4 h-4" /> {systemForm.schoolPhoto ? 'Change' : 'Upload'}
                                    </button>
                                    {systemForm.schoolPhoto && (
                                      <button type="button" onClick={() => setSystemForm(prev => ({...prev, schoolPhoto: ''}))} className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                                        <RotateCcw className="w-4 h-4" /> Reset
                                      </button>
                                    )}
                                  </div>
                                  <input ref={schoolPhotoInputRef} type="file" className="hidden" accept="image/*" onChange={handleSchoolPhotoUpload} />
                                </div>
                              </div>
                              <div className="w-full md:w-1/2 space-y-6">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">EIIN Number</label>
                                  <input required value={systemForm.eiin} onChange={e => setSystemForm({...systemForm, eiin: e.target.value})} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold focus:ring-2 focus:ring-green-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Email</label>
                                  <input required type="email" value={systemForm.email} onChange={e => setSystemForm({...systemForm, email: e.target.value})} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold focus:ring-2 focus:ring-green-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Mobile</label>
                                  <input required value={systemForm.phone} onChange={e => setSystemForm({...systemForm, phone: e.target.value})} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold focus:ring-2 focus:ring-green-500 transition-all" />
                                </div>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">School Name (Bangla)</label>
                                  <input required value={systemForm.nameBn} onChange={e => setSystemForm({...systemForm, nameBn: e.target.value})} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold focus:ring-2 focus:ring-green-500 transition-all" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">School Name (English)</label>
                                  <input required value={systemForm.nameEn} onChange={e => setSystemForm({...systemForm, nameEn: e.target.value})} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold focus:ring-2 focus:ring-green-500 transition-all" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location (Bangla)</label>
                                  <input required value={systemForm.locBn} onChange={e => setSystemForm({...systemForm, locBn: e.target.value})} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold focus:ring-2 focus:ring-green-500 transition-all" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location (English)</label>
                                  <input required value={systemForm.locEn} onChange={e => setSystemForm({...systemForm, locEn: e.target.value})} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold focus:ring-2 focus:ring-green-500 transition-all" />
                               </div>
                            </div>
                            
                            <div className="flex flex-col items-center gap-4 pt-4">
                               {showSaveSuccess && (
                                 <div className="flex items-center gap-2 text-green-600 font-black text-xs animate-in zoom-in uppercase tracking-widest">
                                   <CheckCircle className="w-4 h-4" /> Configuration Saved Successfully
                                 </div>
                               )}
                               <button type="submit" className="w-full max-w-md bg-green-700 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-green-800 transition-all active:scale-95 shadow-green-700/20">
                                 <Save className="w-6 h-6" /> Save All Settings
                               </button>
                            </div>
                          </form>

                          <div className="bg-slate-100 p-8 rounded-[2rem] border border-dashed border-slate-300">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Database Operations</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button onClick={exportDatabase} className="bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"><Download className="w-4 h-4" /> Export All Data (.json)</button>
                              <label className="bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 cursor-pointer hover:border-green-600 hover:text-green-700 transition-all">
                                <Upload className="w-4 h-4" /> Restore All Data
                                <input type="file" accept=".json" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (re) => {
                                      const success = importDatabase(re.target?.result as string);
                                      if (success) alert('Database restored successfully!');
                                      else alert('Failed to restore. Invalid file format.');
                                    };
                                    reader.readAsText(file);
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                          <table className="w-full text-left">
                             <thead className="bg-slate-50 border-b">
                                <tr className="text-[10px] font-black uppercase text-slate-400">
                                   <th className="px-6 py-4">Title / Name</th>
                                   <th className="px-6 py-4">Detail</th>
                                   <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                {managementTab === 'notices' && notices.map(n => (
                                  <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm text-slate-900">{t(n.title)}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{n.category} • {n.date}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                      <button onClick={() => openEditModal(n)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                      <button onClick={() => deleteNotice(n.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                  </tr>
                                ))}
                                {managementTab === 'teachers' && teachers.map(teach => (
                                  <tr key={teach.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm text-slate-900">{t(teach.name)}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{t(teach.designation)} • {t(teach.subject)}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                      <button onClick={() => openEditModal(teach)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                      <button onClick={() => deleteTeacher(teach.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                  </tr>
                                ))}
                                {managementTab === 'ebooks' && ebooks.map(eb => (
                                  <tr key={eb.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm text-slate-900">{t(eb.title)}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{t(eb.className)} • {eb.subject}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                      <button onClick={() => openEditModal(eb)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                      <button onClick={() => deleteEbook(eb.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                  </tr>
                                ))}
                                {managementTab === 'gallery' && gallery.map(g => (
                                  <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm text-slate-900">{t(g.caption)}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">Image Resource</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                      <button onClick={() => openEditModal(g)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                      <button onClick={() => deleteGalleryItem(g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                  </tr>
                                ))}
                                {managementTab === 'admissions' && (
                                  admissions.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-bold text-sm">No admission applications saved yet.</td></tr>
                                  ) : admissions.map(app => (
                                    <tr key={app.appId} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-4">
                                        <p className="font-bold text-sm text-slate-900">{app.studentName} <span className="text-[10px] text-green-700 font-black">({app.appId})</span></p>
                                        <p className="text-xs text-slate-500">Father: {app.fatherName} • Mobile: {app.guardianMobile}</p>
                                      </td>
                                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                        <span className="font-bold text-slate-700">{app.targetClass}</span> ({app.targetGroup}) • {app.submittedDate}
                                        <div className="mt-1">
                                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {app.status}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => updateAdmissionStatus(app.appId, 'approved')} className="px-2.5 py-1.5 text-[10px] font-black uppercase bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Approve</button>
                                        <button onClick={() => updateAdmissionStatus(app.appId, 'rejected')} className="px-2.5 py-1.5 text-[10px] font-black uppercase bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100">Reject</button>
                                        <button onClick={() => deleteAdmission(app.appId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                                {managementTab === 'messages' && (
                                  contactMessages.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-bold text-sm">No contact messages saved yet.</td></tr>
                                  ) : contactMessages.map(msg => (
                                    <tr key={msg.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-4">
                                        <p className="font-bold text-sm text-slate-900">{msg.name} <span className="text-xs text-slate-500">({msg.mobile})</span></p>
                                        <p className="text-xs text-slate-600 mt-1">{msg.message}</p>
                                      </td>
                                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${msg.status === 'read' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                                          {msg.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {msg.status === 'unread' && (
                                          <button onClick={() => markContactMessageRead(msg.id)} className="px-2.5 py-1.5 text-[10px] font-black uppercase bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">Mark Read</button>
                                        )}
                                        <button onClick={() => deleteContactMessage(msg.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                                {managementTab === 'users' && allRegisteredUsers.map(u => (
                                  <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm text-slate-900 flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-white">
                                        {u.photo ? <img src={u.photo} className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 text-slate-300" />}
                                      </div>
                                      {u.name}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                      <span className={`px-2 py-0.5 rounded-md uppercase font-black text-[9px] mr-2 ${u.role === 'admin' ? 'bg-red-50 text-red-600' : u.role === 'teacher' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>{u.role}</span>
                                      ID: {u.userId}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                      <button onClick={() => openEditModal(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                      {u.userId !== user.userId && (
                                        <button onClick={() => deleteUser(u.userId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in max-h-[90vh] flex flex-col">
              <div className="bg-green-700 p-8 text-white flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-black">
                  {editingItem ? 'Edit ' : 'Add New '}
                  {managementTab === 'users' ? 'Account' : managementTab.slice(0, -1)}
                </h2>
                <button onClick={() => setIsAddModalOpen(false)}><X /></button>
              </div>
              
              <form onSubmit={handleAddNew} className="p-8 space-y-6 overflow-y-auto">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                    {tempImage ? <img src={tempImage} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-200" />}
                  </div>
                  <label className="bg-slate-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-colors">
                    Upload Resource Photo
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await compressImageFile(file, 800, 0.72);
                        setTempImage(compressed);
                      }
                    }} />
                  </label>
                </div>

                {managementTab === 'users' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                        <input required name="userName" defaultValue={editingItem?.name} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Role</label>
                        <select name="userRole" defaultValue={editingItem?.role || 'student'} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold">
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">User ID / Roll</label>
                        <input required name="userId" disabled={!!editingItem} defaultValue={editingItem?.userId} placeholder="e.g. 2026001" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold disabled:opacity-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email (Optional)</label>
                        <input name="userEmail" type="email" defaultValue={editingItem?.email} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Password</label>
                      <input required name="userPass" defaultValue={editingItem?.password || "123456"} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                    </div>
                  </div>
                )}

                {managementTab === 'notices' && (
                  <div className="space-y-4">
                    <input required name="titleBn" defaultValue={editingItem?.title?.bn} placeholder="Title (BN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="titleEn" defaultValue={editingItem?.title?.en} placeholder="Title (EN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <textarea required name="descBn" defaultValue={editingItem?.description?.bn} placeholder="Description (BN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold h-24" />
                    <textarea required name="descEn" defaultValue={editingItem?.description?.en} placeholder="Description (EN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold h-24" />
                    <div className="grid grid-cols-2 gap-4">
                      <select name="category" defaultValue={editingItem?.category || 'General'} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold">
                        <option value="General">General</option>
                        <option value="Admission">Admission</option>
                        <option value="Exam">Exam</option>
                        <option value="Holiday">Holiday</option>
                      </select>
                      <input required type="date" name="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    </div>
                  </div>
                )}

                {managementTab === 'teachers' && (
                  <div className="grid grid-cols-2 gap-4">
                    <input required name="nameBn" defaultValue={editingItem?.name?.bn} placeholder="Name (BN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="nameEn" defaultValue={editingItem?.name?.en} placeholder="Name (EN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="desigBn" defaultValue={editingItem?.designation?.bn} placeholder="Designation (BN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="desigEn" defaultValue={editingItem?.designation?.en} placeholder="Designation (EN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="subBn" defaultValue={editingItem?.subject?.bn} placeholder="Subject (BN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="subEn" defaultValue={editingItem?.subject?.en} placeholder="Subject (EN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="qualBn" defaultValue={editingItem?.qualification?.bn} placeholder="Qualification (BN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold col-span-2" />
                    <input required name="qualEn" defaultValue={editingItem?.qualification?.en} placeholder="Qualification (EN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold col-span-2" />
                  </div>
                )}
                
                {managementTab === 'ebooks' && (
                  <div className="grid grid-cols-2 gap-4">
                    <input required name="titleBn" defaultValue={editingItem?.title?.bn} placeholder="Book Title (BN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="titleEn" defaultValue={editingItem?.title?.en} placeholder="Book Title (EN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <select name="classId" defaultValue={editingItem?.classId || '6'} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold">
                       {['6', '7', '8', '9', '10'].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <input required name="subject" defaultValue={editingItem?.subject} placeholder="Subject (e.g. Science)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                  </div>
                )}

                {managementTab === 'gallery' && (
                  <div className="space-y-4">
                    <input required name="capBn" defaultValue={editingItem?.caption?.bn} placeholder="Caption (BN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                    <input required name="capEn" defaultValue={editingItem?.caption?.en} placeholder="Caption (EN)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border font-bold" />
                  </div>
                )}

                <button type="submit" className="w-full bg-green-700 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-green-800 transition-all active:scale-95 shadow-green-700/20">
                  <Save className="w-6 h-6" /> {editingItem ? 'Update Information' : 'Save Information'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden relative">
          <div className={`h-2 w-full transition-colors duration-500 ${getThemeColor()}`} />
          
          <div className="flex bg-gray-50/50 p-1.5 m-6 rounded-2xl border border-gray-100">
            {(['student', 'teacher', 'admin'] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-white text-green-700 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab === 'student' ? <GraduationCap className="w-4 h-4" /> : tab === 'teacher' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="text-center px-8 mb-4">
             <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl transition-all duration-500 ${getThemeColor()}`}>
                {activeTab === 'student' ? <UserIcon className="w-10 h-10" /> : activeTab === 'teacher' ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
             </div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab} Portal</h1>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{t(settings.name)}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
            <div className="space-y-4">
              <input required type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID / Roll" className="w-full px-6 py-4.5 rounded-2xl border-2 border-gray-100 bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition-all font-bold placeholder:text-slate-300 shadow-sm" />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-6 py-4.5 rounded-2xl border-2 border-gray-100 bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition-all font-bold placeholder:text-slate-300 shadow-sm" />
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black text-center border border-red-100 animate-bounce">{error}</div>}

            <button disabled={isSubmitting} className="w-full bg-green-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-700/20 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-green-800">
              {isSubmitting ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <>Login Portal <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          {activeTab !== 'admin' && (
            <div className="px-8 pb-6 text-center">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-grow h-px bg-slate-100"></div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{lang === 'bn' ? 'অথবা' : 'OR'}</span>
                <div className="flex-grow h-px bg-slate-100"></div>
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 text-green-700 font-black text-xs uppercase tracking-widest border-2 border-green-700/10 px-6 py-3 rounded-xl hover:bg-green-50 transition-all active:scale-95">
                <UserPlus className="w-4 h-4" /> {lang === 'bn' ? 'একাউন্ট খুলুন' : 'Create Account'}
              </Link>
            </div>
          )}

          <div className="px-8 pb-8 pt-2 space-y-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-sm transition-all active:scale-95"
            >
              <Cloud className="w-4 h-4 text-green-700" />
              {lang === 'bn' ? 'Google দিয়ে ক্লাউড লগইন করুন' : 'Sign in with Google (Cloud Sync)'}
            </button>
            <div className="flex items-center gap-4"><div className="flex-grow h-px bg-slate-100"></div><span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Quick Access</span><div className="flex-grow h-px bg-slate-100"></div></div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleQuickLogin('student')} className="p-3 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">Student</button>
              <button onClick={() => handleQuickLogin('teacher')} className="p-3 bg-purple-50 text-purple-600 rounded-xl text-[9px] font-black uppercase border border-purple-100 hover:bg-purple-600 hover:text-white transition-all shadow-sm">Teacher</button>
              <button onClick={() => handleQuickLogin('admin')} className="p-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase border border-slate-800 hover:bg-green-700 transition-all shadow-sm">Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
