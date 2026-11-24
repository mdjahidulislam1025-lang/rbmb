import * as React from 'react';
import { Calendar, Info, Clock, PlusCircle, X, Save, Pencil, Trash2, CalendarDays, List } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { Holiday } from '../types';
import { getDhakaTodayISO, getDhakaYear, formatDhakaClock } from '../utils/dhakaTime';

const { useState, useMemo } = React;

const Holidays: React.FC = () => {
  const { lang, t, user, holidays, addHoliday, updateHoliday, deleteHoliday } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Holiday | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'upcoming'>('all');

  const isAdmin = user?.role === 'admin';
  const activeYear = getDhakaYear();
  const todayISO = getDhakaTodayISO();

  const upcomingHolidays = useMemo(() => {
    const todayDate = new Date(`${todayISO}T00:00:00+06:00`);
    const nextMonth = new Date(todayDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    return holidays
      .filter((h) => {
        const hDate = new Date(`${h.date.slice(0, 10)}T00:00:00+06:00`);
        return !isNaN(hDate.getTime()) && hDate >= todayDate && hDate <= nextMonth;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, todayISO]);

  const displayedHolidays = viewMode === 'all' ? holidays : upcomingHolidays;

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'National':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'Religious':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'Seasonal':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as {
      titleBn: HTMLInputElement;
      titleEn: HTMLInputElement;
      durBn: HTMLInputElement;
      durEn: HTMLInputElement;
      date: HTMLInputElement;
      type: HTMLSelectElement;
    };
    const data: Holiday = {
      id: editingItem ? editingItem.id : `h-${Date.now()}`,
      title: { bn: f.titleBn.value.trim(), en: f.titleEn.value.trim() },
      duration: { bn: f.durBn.value.trim(), en: f.durEn.value.trim() },
      date: f.date.value,
      type: f.type.value as Holiday['type'],
      isPublic: true,
    };
    if (editingItem) updateHoliday(data);
    else addHoliday(data);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-black text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" /> {activeYear} {lang === 'bn' ? 'NCTB ও সরকারি শিক্ষাবর্ষ সূচি' : 'NCTB Academic Schedule'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tabular-nums">
              <Clock className="w-3 h-3" /> {formatDhakaClock(lang)}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
            {t(TRANSLATIONS.holiday.title)}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium max-w-2xl text-base">
            {t(TRANSLATIONS.holiday.subtitle)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-green-700 dark:text-green-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <List className="w-4 h-4" /> {lang === 'bn' ? 'সব ছুটি' : 'All'}
            </button>
            <button
              onClick={() => setViewMode('upcoming')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                viewMode === 'upcoming'
                  ? 'bg-white dark:bg-slate-900 text-green-700 dark:text-green-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> {lang === 'bn' ? 'আসন্ন ৩০ দিন' : 'Upcoming 30d'}
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-green-700 text-white px-5 py-3 rounded-2xl font-black uppercase text-xs hover:bg-green-800 shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" /> {lang === 'bn' ? 'ছুটি যোগ করুন' : 'Add Holiday'}
            </button>
          )}
        </div>
      </div>

      {viewMode === 'upcoming' && upcomingHolidays.length === 0 && (
        <div className="bg-white dark:bg-slate-900 p-14 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
          <CalendarDays className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-black text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'আগামী ৩০ দিনে কোনো ছুটি নেই' : 'No holidays in the next 30 days'}
          </h3>
          <button onClick={() => setViewMode('all')} className="text-green-700 dark:text-green-400 font-black uppercase text-xs hover:underline">
            View Full Schedule
          </button>
        </div>
      )}

      {displayedHolidays.length > 0 && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white">
                <tr className="text-xs font-black uppercase tracking-wider">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Holiday Name</th>
                  <th className="px-8 py-5">Duration</th>
                  <th className="px-8 py-5">Type</th>
                  {isAdmin && <th className="px-8 py-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedHolidays.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900 dark:text-white">{h.date}</td>
                    <td className="px-8 py-5 font-black text-slate-900 dark:text-white">{t(h.title)}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-300 font-bold">{t(h.duration)}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${getTypeStyle(h.type)}`}>
                        {h.type}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(h)}
                          className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 rounded-xl"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteHoliday(h.id)}
                          className="p-2.5 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {displayedHolidays.map((h) => (
              <div
                key={h.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 relative"
              >
                <div className="flex justify-between items-start">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${getTypeStyle(h.type)}`}>
                    {h.type}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t(h.duration)}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t(h.title)}</h3>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-black text-sm">
                  <Calendar className="w-4 h-4" /> {h.date}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">{editingItem ? 'Edit Holiday' : 'Add New Holiday'}</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  name="titleBn"
                  defaultValue={editingItem?.title?.bn}
                  placeholder="Title (BN)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="titleEn"
                  defaultValue={editingItem?.title?.en}
                  placeholder="Title (EN)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="durBn"
                  defaultValue={editingItem?.duration?.bn}
                  placeholder="Duration (BN) e.g. ১ দিন"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="durEn"
                  defaultValue={editingItem?.duration?.en}
                  placeholder="Duration (EN) e.g. 1 Day"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  type="date"
                  name="date"
                  defaultValue={editingItem?.date}
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <select
                  name="type"
                  defaultValue={editingItem?.type || 'National'}
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option value="National">National Holiday</option>
                  <option value="Religious">Religious Festival</option>
                  <option value="Seasonal">Seasonal Vacation</option>
                  <option value="Other">Other Occasion</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-green-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-green-800"
              >
                <Save className="w-5 h-5" /> {editingItem ? 'Update Holiday' : 'Save Holiday'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-black flex items-center justify-center md:justify-start gap-2">
            <Clock className="w-6 h-6 text-yellow-400" />
            {lang === 'bn' ? 'চাঁদ দেখা ও সরকারি ছুটি' : 'Government & Religious Holiday Notice'}
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            {lang === 'bn'
              ? 'ধর্মীয় ছুটির তারিখ চাঁদ দেখার উপর নির্ভরশীল এবং সরকারি নির্দেশনা অনুযায়ী পরিবর্তিত হতে পারে।'
              : 'Dates for religious holidays are subject to moon sighting and official government directives.'}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Info className="w-4 h-4" /> Subject to official schedule
          </span>
        </div>
        <div className="px-8 py-5 bg-green-700 rounded-2xl text-center">
          <span className="text-[11px] font-black uppercase tracking-wider opacity-80 block">Total Holidays</span>
          <span className="text-4xl font-black">{holidays.length}</span>
        </div>
      </div>
    </div>
  );
};

export default Holidays;
