
import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import { 
  FileText, Download, Calendar, Tag, PlusCircle, X, Save, 
  Trash2, ArrowLeft, Pencil, Search, Bell, AlertTriangle, 
  ChevronRight, Filter, Info, Megaphone, Clock, Database, RefreshCw
} from 'lucide-react';
import { TRANSLATIONS, SCHOOL_NAME } from '../constants';
import { useApp } from '../App';
import { Notice } from '../types';

const { useState, useMemo } = React;
const { Link } = RouterDom;

const NoticeBoard: React.FC = () => {
  const { lang, t, user, notices, addNotice, updateNotice, deleteNotice, settings, dbStatus } = useApp();
  const [filter, setFilter] = useState<'All' | 'Admission' | 'Exam' | 'Holiday' | 'General'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Notice | null>(null);
  
  const isAdmin = user?.role === 'admin';

  // Filter and Search Logic
  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const matchesFilter = filter === 'All' || n.category === filter;
      const matchesSearch = searchTerm === '' || 
        t(n.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
        t(n.description).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [notices, filter, searchTerm, t]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (n: Notice) => {
    setEditingItem(n);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    const data: Notice = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      title: { bn: f.titleBn.value, en: f.titleEn.value },
      description: { bn: f.descBn.value, en: f.descEn.value },
      category: f.category.value as any,
      date: f.date.value
    };
    
    editingItem ? updateNotice(data) : addNotice(data);
    setIsModalOpen(false);
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Admission': return 'bg-blue-600 text-white';
      case 'Exam': return 'bg-red-600 text-white';
      case 'Holiday': return 'bg-orange-500 text-white';
      default: return 'bg-slate-700 text-white';
    }
  };

  // Status helper functions
  const getStatusColor = () => {
    if (dbStatus === 'syncing') return 'bg-yellow-400';
    if (dbStatus === 'error') return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (dbStatus === 'syncing') return lang === 'bn' ? 'ডেটা আপডেট হচ্ছে...' : 'SYNCING DATA...';
    if (dbStatus === 'error') return lang === 'bn' ? 'ডেটাবেস ত্রুটি!' : 'DATABASE ERROR';
    return lang === 'bn' ? 'সিস্টেম সচল আছে' : 'SYSTEM ONLINE';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-green-700 font-black text-xs uppercase tracking-[0.2em] hover:gap-4 transition-all bg-green-50 px-6 py-2 rounded-full">
          <ArrowLeft className="w-4 h-4" /> {lang === 'bn' ? 'মূল পাতায় ফিরুন' : 'Back to Home'}
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
          <div className="space-y-3">
             <div className="flex items-center gap-3 text-green-600 font-black text-xs uppercase tracking-widest">
                <Megaphone className="w-5 h-5 animate-pulse" /> Official Newsroom
             </div>
             <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
               {t(TRANSLATIONS.nav.notices)}
             </h1>
             <p className="text-slate-400 font-medium text-lg">
                {lang === 'bn' ? `${t(settings.name)} এর সকল সর্বশেষ আপডেট ও নোটিশ এখানে পাওয়া যাবে।` : `All latest updates and official notices of ${t(settings.name)} are available here.`}
             </p>
          </div>
          {isAdmin && (
            <button 
              onClick={handleOpenAdd} 
              className="bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-800 shadow-xl shadow-green-700/20 transition-all flex items-center gap-3 active:scale-95"
            >
              <PlusCircle className="w-5 h-5" /> {lang === 'bn' ? 'নতুন নোটিশ' : 'Post New Notice'}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-grow w-full relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-green-600 transition-colors" />
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'নোটিশ খুঁজুন...' : 'Search notices...'}
            className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white outline-none font-bold text-lg transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          {(['All', 'Admission', 'Exam', 'Holiday', 'General'] as const).map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                filter === cat 
                  ? 'bg-green-700 border-green-700 text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-green-200 hover:text-green-700'
              }`}
            >
              {cat === 'All' ? (lang === 'bn' ? 'সব নোটিশ' : 'All') : (lang === 'bn' ? (cat === 'Admission' ? 'ভর্তি' : cat === 'Exam' ? 'পরীক্ষা' : cat === 'Holiday' ? 'ছুটি' : 'সাধারণ') : cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col md:flex-row gap-8 items-start">
              {/* Date Badge */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center min-w-[90px] h-[90px] group-hover:bg-green-700 group-hover:text-white transition-all duration-500 shadow-inner">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-80">
                   {new Date(notice.date).toLocaleString('default', { month: 'short' })}
                 </span>
                 <span className="text-4xl font-black leading-none">{new Date(notice.date).getDate()}</span>
                 <span className="text-[10px] font-black opacity-40 group-hover:opacity-60">{new Date(notice.date).getFullYear()}</span>
              </div>

              {/* Content */}
              <div className="flex-grow space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                   <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${getCategoryColor(notice.category)}`}>
                     {notice.category}
                   </span>
                   <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" /> Published 2026
                   </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-green-700 transition-colors tracking-tight leading-tight">
                  {t(notice.title)}
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed line-clamp-2 md:line-clamp-none">
                  {t(notice.description)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 md:pt-2">
                 <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95">
                    <Download className="w-4 h-4" /> Download PDF
                 </button>
                 {isAdmin && (
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEdit(notice)}
                        className="flex-1 bg-blue-50 text-blue-600 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                        title="Edit Notice"
                      >
                        <Pencil className="w-5 h-5 mx-auto" />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm(lang === 'bn' ? 'আপনি কি এই নোটিশটি ডিলিট করতে চান?' : 'Confirm delete?')) deleteNotice(notice.id);
                        }}
                        className="flex-1 bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-5 h-5 mx-auto" />
                      </button>
                   </div>
                 )}
              </div>
              
              {/* Decorative Index */}
              <div className="absolute top-8 right-8 text-slate-100 font-black text-6xl pointer-events-none group-hover:text-green-50 transition-colors z-0">
                #
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-200">
             <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Search className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-2xl font-black text-slate-400 tracking-tight">
               {lang === 'bn' ? 'কোন নোটিশ পাওয়া যায়নি!' : 'No notices match your criteria.'}
             </h3>
             <button onClick={() => { setFilter('All'); setSearchTerm(''); }} className="mt-4 text-green-700 font-black uppercase text-xs tracking-widest hover:underline">
               Reset Filters
             </button>
          </div>
        )}
      </div>

      {/* Info Card with Live Database Status */}
      <div className="bg-slate-900 rounded-[4rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl transition-all duration-500">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Bell className="w-64 h-64" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 text-center md:text-left">
               <h2 className="text-3xl md:text-4xl font-black leading-tight">নোটিশের গুরুত্ব ও আপডেট</h2>
               <p className="text-slate-400 font-medium text-lg max-w-xl">
                 {lang === 'bn' ? 'বিদ্যালয়ের প্রতিটি সিদ্ধান্ত নোটিশ বোর্ডের মাধ্যমে জানানো হয়। নিয়মিত আপডেট পেতে আমাদের ফেসবুক পেজ অথবা অনলাইন পোর্টাল চেক করুন।' : 'Every official decision is communicated through the notice board. Check our portal or Facebook page regularly for updates.'}
               </p>
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 transition-colors">
                     <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} ${dbStatus === 'syncing' ? 'animate-spin' : 'animate-ping'}`}></div>
                     <span className="text-[10px] font-black uppercase tracking-widest">
                       {dbStatus === 'syncing' ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'রিয়েল-টাইম আপডেট' : 'Real-time Updates')}
                     </span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-center p-8 bg-green-700 rounded-[3rem] shadow-2xl border-4 border-green-600 transition-all">
               <span className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Total Notices</span>
               <div className="flex items-baseline gap-2">
                 <span className="text-6xl font-black">{notices.length}</span>
                 {dbStatus === 'syncing' && <RefreshCw className="w-6 h-6 animate-spin text-green-300" />}
               </div>
               <div className={`mt-4 px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-colors shadow-inner flex items-center gap-2 ${dbStatus === 'error' ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}>
                 <Database className="w-3 h-3" /> {getStatusText()}
               </div>
            </div>
         </div>
      </div>

      {/* Notice Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-green-700 p-10 text-white flex justify-between items-center shrink-0">
              <div className="space-y-1">
                 <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block border border-white/20">Official System</div>
                 <h2 className="text-3xl font-black tracking-tight">{editingItem ? 'Edit Notice' : 'Post New Notice'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/20 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto">
              <div className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title (Bangla)</label>
                       <input required name="titleBn" defaultValue={editingItem?.title?.bn} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title (English)</label>
                       <input required name="titleEn" defaultValue={editingItem?.title?.en} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description (Bangla)</label>
                    <textarea required name="descBn" defaultValue={editingItem?.description?.bn} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold h-32 resize-none" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description (English)</label>
                    <textarea required name="descEn" defaultValue={editingItem?.description?.en} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold h-32 resize-none" />
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notice Category</label>
                       <select name="category" defaultValue={editingItem?.category || 'General'} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none font-black">
                          <option value="General">General News</option>
                          <option value="Admission">Admission Notice</option>
                          <option value="Exam">Exam Schedule</option>
                          <option value="Holiday">Holiday Notice</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Release Date</label>
                       <input required type="date" name="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none font-black" />
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                  type="submit" 
                  className="flex-grow bg-green-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-green-800 transition-all active:scale-95 shadow-green-700/20"
                 >
                   <Save className="w-6 h-6" /> {editingItem ? 'Update Notice' : 'Publish Notice Now'}
                 </button>
                 <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-5 bg-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                   Cancel
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
