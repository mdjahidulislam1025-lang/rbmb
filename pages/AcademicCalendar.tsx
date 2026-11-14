
import * as React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, GraduationCap, Award, MapPin, ArrowLeft, Filter, PlusCircle, X, Save, Clock, Info, Pencil, Trash2, Printer, FileDown, ShieldCheck } from 'lucide-react';
import { useApp } from '../App';
import * as RouterDom from 'react-router-dom';
import { Notice, Holiday } from '../types';

const { useState, useMemo } = React;
const { Link } = RouterDom;

interface CalendarEvent {
  id: string;
  originalId: string; // The real ID in holidays or notices
  title: string;
  date: Date;
  type: 'Holiday' | 'Exam' | 'Admission' | 'General';
  description?: string;
  raw?: any; // The original object
}

const AcademicCalendar: React.FC = () => {
  const { lang, t, user, holidays, notices, addNotice, updateNotice, addHoliday, updateHoliday, deleteNotice, deleteHoliday, settings } = useApp();
  const [selectedType, setSelectedType] = useState<'All' | 'Holiday' | 'Exam' | 'Admission'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<'Exam' | 'Admission' | 'Holiday'>('Exam');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const isAdmin = user?.role === 'admin';

  const months = [
    { bn: 'জানুয়ারি', en: 'January' }, { bn: 'ফেব্রুয়ারি', en: 'February' },
    { bn: 'মার্চ', en: 'March' }, { bn: 'এপ্রিল', en: 'April' },
    { bn: 'মে', en: 'May' }, { bn: 'জুন', en: 'June' },
    { bn: 'জুলাই', en: 'July' }, { bn: 'আগস্ট', en: 'August' },
    { bn: 'সেপ্টেম্বর', en: 'September' }, { bn: 'অক্টোবর', en: 'October' },
    { bn: 'নভেম্বর', en: 'November' }, { bn: 'ডিসেম্বর', en: 'December' }
  ];

  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add Holidays
    holidays.forEach(h => {
      events.push({
        id: `h-${h.id}`,
        originalId: h.id,
        title: t(h.title),
        date: new Date(h.date),
        type: 'Holiday',
        description: t(h.duration),
        raw: h
      });
    });

    // Add Notices (Exams and Admissions)
    notices.forEach(n => {
      if (n.category === 'Exam' || n.category === 'Admission') {
        events.push({
          id: `n-${n.id}`,
          originalId: n.id,
          title: t(n.title),
          date: new Date(n.date),
          type: n.category as any,
          description: t(n.description),
          raw: n
        });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [holidays, notices, t]);

  const filteredEvents = selectedType === 'All' 
    ? allEvents 
    : allEvents.filter(e => e.type === selectedType);

  const getEventsForMonth = (monthIdx: number) => {
    return filteredEvents.filter(e => e.date.getMonth() === monthIdx && e.date.getFullYear() === 2026);
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Holiday': return 'bg-red-100 text-red-700 border-red-200';
      case 'Exam': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Admission': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormType('Exam');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormType(event.type === 'Holiday' ? 'Holiday' : (event.type as any));
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    const isEdit = !!editingEvent;
    const originalId = isEdit ? editingEvent.originalId : Date.now().toString();
    
    if (formType === 'Holiday') {
      const holiday: Holiday = {
        id: originalId,
        title: { bn: f.titleBn.value, en: f.titleEn.value },
        date: f.date.value,
        duration: { bn: f.durBn.value, en: f.durEn.value },
        type: f.holidayType.value
      };
      isEdit ? updateHoliday(holiday) : addHoliday(holiday);
    } else {
      const notice: Notice = {
        id: originalId,
        title: { bn: f.titleBn.value, en: f.titleEn.value },
        description: { bn: f.descBn.value, en: f.descEn.value },
        category: formType,
        date: f.date.value
      };
      isEdit ? updateNotice(notice) : addNotice(notice);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (event: CalendarEvent) => {
    if(!window.confirm('Are you sure?')) return;
    if (event.type === 'Holiday') deleteHoliday(event.originalId);
    else deleteNotice(event.originalId);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const PrintableCalendar = () => (
    <div id="printable-calendar" className="hidden print:block bg-white text-black p-0">
      <div className="border-[12px] border-double border-green-900 p-10 min-h-[1100px]">
        <div className="text-center space-y-2 border-b-4 border-green-900 pb-6 mb-8">
          <div className="flex justify-center mb-2">
             <div className="bg-green-800 p-3 rounded-full shadow-lg"><GraduationCap className="text-white w-10 h-10" /></div>
          </div>
          <h1 className="text-4xl font-black uppercase text-green-900">{t(settings.name)}</h1>
          <p className="text-lg font-bold">EIIN: {settings.eiin} | স্থাপিত: ১৯৫৮</p>
          <div className="mt-4">
            <span className="inline-block px-10 py-2 border-2 border-green-900 font-black text-xl uppercase bg-green-50 rounded-lg">
              {lang === 'bn' ? 'একাডেমিক ক্যালেন্ডার ও ছুটির তালিকা - ২০২৬' : 'Academic Calendar & Holidays - 2026'}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {months.map((month, mIdx) => {
            const monthEvents = allEvents.filter(e => e.date.getMonth() === mIdx && e.date.getFullYear() === 2026);
            if (monthEvents.length === 0) return null;
            
            return (
              <div key={mIdx} className="break-inside-avoid">
                <h3 className="text-xl font-black bg-slate-100 px-4 py-2 border-l-8 border-green-700 mb-4">{t(month)}</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase border-b-2 border-slate-200">
                      <th className="px-4 py-2 text-left w-24">Date</th>
                      <th className="px-4 py-2 text-left">Event Name</th>
                      <th className="px-4 py-2 text-left w-32">Type</th>
                      <th className="px-4 py-2 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthEvents.map((event, eIdx) => (
                      <tr key={eIdx} className="border-b border-slate-100 text-sm">
                        <td className="px-4 py-3 font-bold">{event.date.getDate()} {t(month)}</td>
                        <td className="px-4 py-3 font-black text-slate-800">{event.title}</td>
                        <td className="px-4 py-3">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getBadgeStyle(event.type)}`}>
                             {event.type}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 italic">{event.description || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-end">
          <div className="text-[9px] text-gray-400 font-bold italic">
            * কর্তৃপক্ষের সিদ্ধান্ত অনুযায়ী যে কোনো ইভেন্ট বা ছুটির তারিখ পরিবর্তিত হতে পারে।<br/>
            এটি একটি কম্পিউটার জেনারেটেড কপি।
          </div>
          <div className="text-center w-48">
             <div className="w-full border-t border-black mb-1"></div>
             <p className="text-[10px] font-black uppercase">প্রধান শিক্ষকের স্বাক্ষর</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <PrintableCalendar />
      <div className="flex flex-col gap-4 no-print">
        <Link to="/" className="flex items-center gap-2 text-green-700 font-bold text-sm hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> {lang === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-green-900 tracking-tight">
              {lang === 'bn' ? 'একাডেমিক ক্যালেন্ডার' : 'Academic Calendar'} <span className="text-slate-400">২০২৬</span>
            </h1>
            <p className="text-gray-500 max-w-xl font-medium">
              {lang === 'bn' 
                ? '২০২৬ শিক্ষাবর্ষের সকল গুরুত্বপূর্ণ তারিখ, পরীক্ষা এবং ছুটির বিস্তারিত তালিকা।' 
                : 'Detailed schedule of all important dates, exams, and holidays for the 2026 academic session.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             {isAdmin && (
               <button 
                 onClick={handleOpenAdd}
                 className="bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 shadow-xl transition-all active:scale-95 flex items-center gap-2"
               >
                 <PlusCircle className="w-5 h-5" /> {lang === 'bn' ? 'নতুন ইভেন্ট' : 'Add New Event'}
               </button>
             )}
            <div className="flex flex-wrap gap-2">
              {(['All', 'Holiday', 'Exam', 'Admission'] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                    selectedType === type 
                      ? 'bg-white border-green-700 text-green-700 shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-700'
                  }`}
                >
                  {type === 'All' ? (lang === 'bn' ? 'সব' : 'All') : (lang === 'bn' ? (type === 'Holiday' ? 'ছুটি' : type === 'Exam' ? 'পরীক্ষা' : 'ভর্তি') : type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print">
        {months.map((month, idx) => {
          const monthEvents = getEventsForMonth(idx);
          if (monthEvents.length === 0 && selectedType !== 'All') return null;

          return (
            <div key={idx} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden flex flex-col hover:shadow-xl transition-all group">
              <div className="bg-slate-50 p-6 border-b flex justify-between items-center group-hover:bg-green-50 transition-colors">
                <h3 className="text-xl font-black text-gray-900">{t(month)}</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{monthEvents.length} Events</span>
              </div>
              <div className="p-6 space-y-4 flex-grow">
                {monthEvents.length > 0 ? monthEvents.map(event => (
                  <div key={event.id} className="p-4 rounded-2xl border border-gray-50 bg-slate-50/30 space-y-2 hover:border-green-100 hover:bg-white transition-all relative group/event">
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/event:opacity-100 transition-all">
                        <button onClick={() => handleOpenEdit(event)} className="p-1.5 text-blue-600 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(event)} className="p-1.5 text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getBadgeStyle(event.type)}`}>
                        {event.type}
                      </span>
                      <span className="text-[10px] font-black text-slate-400">{event.date.getDate()} {t(month)}</span>
                    </div>
                    <h4 className="font-black text-gray-800 text-sm leading-tight">{event.title}</h4>
                    {event.description && <p className="text-[11px] text-gray-500 font-medium line-clamp-2">{event.description}</p>}
                  </div>
                )) : (
                  <div className="h-full flex items-center py-8 text-center">
                    <p className="text-xs text-slate-300 font-bold italic w-full">
                      {lang === 'bn' ? 'কোন ইভেন্ট নেই' : 'No events scheduled'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in max-h-[90vh] flex flex-col">
            <div className="bg-green-700 p-8 text-white flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSaveEvent} className="p-8 space-y-6 overflow-y-auto">
              {!editingEvent && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Event Category</label>
                  <div className="flex gap-2">
                    {(['Exam', 'Admission', 'Holiday'] as const).map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setFormType(type)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                          formType === type ? 'bg-green-50 border-green-600 text-green-700' : 'bg-slate-50 border-gray-100 text-gray-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title (Bangla)</label>
                  <input required name="titleBn" defaultValue={editingEvent?.raw?.title?.bn} placeholder="যেমন: বার্ষিক পরীক্ষা" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-gray-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title (English)</label>
                  <input required name="titleEn" defaultValue={editingEvent?.raw?.title?.en} placeholder="e.g. Annual Exam" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-gray-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Event Date</label>
                  <input required type="date" name="date" defaultValue={editingEvent?.raw?.date} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-gray-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
              </div>

              {formType === 'Holiday' ? (
                <div className="grid grid-cols-2 gap-6 p-6 bg-red-50/50 rounded-3xl border border-red-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-red-400 ml-1">Duration (BN)</label>
                    <input required name="durBn" defaultValue={editingEvent?.raw?.duration?.bn} placeholder="যেমন: ১ দিন" className="w-full px-5 py-3.5 rounded-xl bg-white border border-red-100 outline-none focus:ring-2 focus:ring-red-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-red-400 ml-1">Duration (EN)</label>
                    <input required name="durEn" defaultValue={editingEvent?.raw?.duration?.en} placeholder="e.g. 1 Day" className="w-full px-5 py-3.5 rounded-xl bg-white border border-red-100 outline-none focus:ring-2 focus:ring-red-500 font-bold" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-red-400 ml-1">Holiday Type</label>
                    <select name="holidayType" defaultValue={editingEvent?.raw?.type || 'National'} className="w-full px-5 py-3.5 rounded-xl bg-white border border-red-100 outline-none focus:ring-2 focus:ring-red-500 font-bold">
                      <option value="National">National</option>
                      <option value="Religious">Religious</option>
                      <option value="Seasonal">Seasonal</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 ml-1">Description (Bangla)</label>
                    <textarea required name="descBn" defaultValue={editingEvent?.raw?.description?.bn} placeholder="ইভেন্টের বিস্তারিত..." className="w-full px-5 py-3.5 rounded-xl bg-white border border-blue-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold h-24" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 ml-1">Description (English)</label>
                    <textarea required name="descEn" defaultValue={editingEvent?.raw?.description?.en} placeholder="Event details..." className="w-full px-5 py-3.5 rounded-xl bg-white border border-blue-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold h-24" />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-green-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-green-800 transition-all active:scale-95"
              >
                <Save className="w-6 h-6" /> {editingEvent ? 'Update Calendar' : 'Save to Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <CalendarIcon className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
            <h2 className="text-3xl font-black">{lang === 'bn' ? 'ক্যালেন্ডার ডাউনলোড করতে চান?' : 'Need a Printed Copy?'}</h2>
            <p className="text-slate-400 max-w-lg font-medium">
              {lang === 'bn' 
                ? 'পুরো বছরের একাডেমিক ক্যালেন্ডার ও ছুটির তালিকা পিডিএফ ফরম্যাটে ডাউনলোড করুন।' 
                : 'Download the full academic calendar and holiday list in PDF format for offline use.'}
            </p>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-green-600/20 active:scale-95 flex items-center gap-3"
          >
            <FileDown className="w-5 h-5" />
            {lang === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download PDF Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicCalendar;
