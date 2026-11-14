
import * as React from 'react';
import { Calendar, Info, Clock, Tag, PlusCircle, X, Save, Pencil, Trash2, CalendarDays, List } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { Holiday } from '../types';

const { useState, useMemo } = React;

const Holidays: React.FC = () => {
  const { lang, t, user, holidays, addHoliday, updateHoliday, deleteHoliday } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Holiday | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'upcoming'>('all');

  const isAdmin = user?.role === 'admin';

  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return holidays.filter(h => {
      const hDate = new Date(h.date);
      return hDate >= today && hDate <= nextWeek;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [holidays]);

  const displayedHolidays = viewMode === 'all' ? holidays : upcomingHolidays;

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'National': return 'bg-red-50 text-red-700 border-red-100';
      case 'Religious': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Seasonal': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Holiday) => {
    setEditingItem(h);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    const data: Holiday = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      title: { bn: f.titleBn.value, en: f.titleEn.value },
      duration: { bn: f.durBn.value, en: f.durEn.value },
      date: f.date.value,
      type: f.type.value as any
    };
    editingItem ? updateHoliday(data) : addHoliday(data);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left border-b border-gray-100 pb-10">
        <div className="space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-3 text-green-700 font-black text-xs uppercase tracking-widest">
            <Calendar className="w-5 h-5" /> 2026 Academic Schedule
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-green-900 tracking-tight">{t(TRANSLATIONS.holiday.title)}</h1>
          <p className="text-gray-500 font-medium max-w-2xl text-lg">{t(TRANSLATIONS.holiday.subtitle)}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* View Toggle Button */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-2 border border-slate-200 shadow-inner">
            <button 
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'all' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" /> {lang === 'bn' ? 'সব ছুটি' : 'All'}
            </button>
            <button 
              onClick={() => setViewMode('upcoming')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'upcoming' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <CalendarDays className="w-4 h-4" /> {lang === 'bn' ? 'আগামী ৭ দিন' : 'Next 7 Days'}
            </button>
          </div>

          {isAdmin && (
            <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 shadow-xl transition-all active:scale-95">
              <PlusCircle className="w-5 h-5" /> {lang === 'bn' ? 'ছুটি যোগ করুন' : 'Add Holiday'}
            </button>
          )}
        </div>
      </div>

      {viewMode === 'upcoming' && upcomingHolidays.length === 0 && (
        <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 text-center space-y-6">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
             <CalendarDays className="w-12 h-12" />
           </div>
           <h3 className="text-2xl font-black text-slate-400">
             {lang === 'bn' ? 'আগামী ৭ দিনে কোন ছুটি নেই' : 'No holidays in the next 7 days'}
           </h3>
           <button onClick={() => setViewMode('all')} className="text-green-700 font-black uppercase text-xs tracking-widest hover:underline">
             View Full Schedule
           </button>
        </div>
      )}

      {displayedHolidays.length > 0 && (
        <>
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white">
                <tr className="text-[10px] font-black uppercase tracking-widest">
                  <th className="px-10 py-6">Date</th>
                  <th className="px-10 py-6">Holiday Name</th>
                  <th className="px-10 py-6">Duration</th>
                  <th className="px-10 py-6">Type</th>
                  {isAdmin && <th className="px-10 py-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedHolidays.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6 font-black text-slate-900">{h.date}</td>
                    <td className="px-10 py-6 font-black text-slate-900 group-hover:text-green-700 transition-colors">{t(h.title)}</td>
                    <td className="px-10 py-6 text-slate-500 font-bold">{t(h.duration)}</td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border shadow-sm ${getTypeStyle(h.type)}`}>{h.type}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-10 py-6 text-right flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(h)} className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><Pencil className="w-5 h-5" /></button>
                        <button onClick={() => deleteHoliday(h.id)} className="p-3 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-6">
             {displayedHolidays.map(h => (
               <div key={h.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative group">
                 {isAdmin && (
                   <div className="absolute top-6 right-6 flex gap-2">
                     <button onClick={() => handleOpenEdit(h)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                     <button onClick={() => deleteHoliday(h.id)} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 )}
                 <div className="flex justify-between items-start">
                   <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border shadow-sm ${getTypeStyle(h.type)}`}>{h.type}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(h.duration)}</span>
                 </div>
                 <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-green-700 transition-colors">{t(h.title)}</h3>
                 <div className="flex items-center gap-2 text-green-700 font-black text-sm">
                   <Calendar className="w-4 h-4" /> {h.date}
                 </div>
               </div>
             ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-green-700 p-10 text-white flex justify-between items-center shrink-0">
              <div className="space-y-1">
                 <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block border border-white/20">Holiday Manager</div>
                 <h2 className="text-3xl font-black tracking-tight">{editingItem ? 'Edit Holiday' : 'Post New Holiday'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/20 rounded-full transition-colors"><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title (BN)</label>
                  <input required name="titleBn" defaultValue={editingItem?.title?.bn} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title (EN)</label>
                  <input required name="titleEn" defaultValue={editingItem?.title?.en} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Duration (BN)</label>
                  <input required name="durBn" defaultValue={editingItem?.duration?.bn} placeholder="যেমন: ১ দিন" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Duration (EN)</label>
                  <input required name="durEn" defaultValue={editingItem?.duration?.en} placeholder="e.g. 1 Day" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Release Date</label>
                  <input required type="date" name="date" defaultValue={editingItem?.date} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Holiday Type</label>
                  <select name="type" defaultValue={editingItem?.type || 'National'} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none font-black">
                    <option value="National">National Holiday</option>
                    <option value="Religious">Religious Festival</option>
                    <option value="Seasonal">Seasonal Vacation</option>
                    <option value="Other">Other Occasion</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-grow bg-green-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-green-800 transition-all active:scale-95 shadow-green-700/20">
                  <Save className="w-6 h-6" /> {editingItem ? 'Update Holiday' : 'Save Holiday'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 bg-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Clock className="w-64 h-64" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 text-center md:text-left">
               <h2 className="text-3xl md:text-4xl font-black leading-tight">চাঁদ দেখা ও সরকারি ছুটি</h2>
               <p className="text-slate-400 font-medium text-lg max-w-xl">
                 {lang === 'bn' ? 'সকল ধর্মীয় ছুটির তারিখ চাঁদ দেখার উপর নির্ভরশীল এবং সরকারি নির্দেশ অনুযায়ী পরিবর্তিত হতে পারে।' : 'Dates for all religious holidays depend on moon sightings and may change according to government directives.'}
               </p>
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                     <Info className="w-5 h-5 text-yellow-500" />
                     <span className="text-xs font-black uppercase tracking-widest">Subject to Change</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-center p-8 bg-green-700 rounded-[2.5rem] shadow-2xl border-4 border-green-600">
               <span className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Total Holidays</span>
               <span className="text-6xl font-black">{holidays.length}</span>
               <div className="mt-4 bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Session 2026</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Holidays;
