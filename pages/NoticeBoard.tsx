import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import {
  Download,
  PlusCircle,
  X,
  Save,
  Trash2,
  ArrowLeft,
  Pencil,
  Search,
  Bell,
  Megaphone,
  Clock,
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { Notice } from '../types';

const { useState, useMemo } = React;
const { Link } = RouterDom;

const NoticeBoard: React.FC = () => {
  const { lang, t, user, notices, addNotice, updateNotice, deleteNotice, settings } = useApp();
  const [filter, setFilter] = useState<'All' | 'Admission' | 'Exam' | 'Holiday' | 'General'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Notice | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canManage = user?.role === 'admin' || user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchesFilter = filter === 'All' || n.category === filter;
      const matchesSearch =
        searchTerm === '' ||
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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as {
      titleBn: HTMLInputElement;
      titleEn: HTMLInputElement;
      descBn: HTMLTextAreaElement;
      descEn: HTMLTextAreaElement;
      category: HTMLSelectElement;
      date: HTMLInputElement;
    };
    const data: Notice = {
      id: editingItem ? editingItem.id : `n-${Date.now()}`,
      title: { bn: f.titleBn.value.trim(), en: f.titleEn.value.trim() },
      description: { bn: f.descBn.value.trim(), en: f.descEn.value.trim() },
      category: f.category.value as Notice['category'],
      date: f.date.value,
      isPublic: true,
    };

    if (editingItem) updateNotice(data);
    else addNotice(data);

    setIsModalOpen(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Admission':
        return 'bg-blue-600 text-white';
      case 'Exam':
        return 'bg-red-600 text-white';
      case 'Holiday':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-black text-xs uppercase tracking-wider bg-green-50 dark:bg-green-950/60 px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === 'bn' ? 'মূল পাতায় ফিরুন' : 'Back to Home'}
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-black text-xs uppercase tracking-wider">
              <Megaphone className="w-4 h-4" /> Official Notice Board
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {t(TRANSLATIONS.nav.notices)}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base">
              {lang === 'bn'
                ? `${t(settings.name)}-এর সকল সরকারি ও প্রাতিষ্ঠানিক বিজ্ঞপ্তি।`
                : `All official academic and administrative notices for ${t(settings.name)}.`}
            </p>
          </div>
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="bg-green-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider hover:bg-green-800 shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> {lang === 'bn' ? 'নতুন নোটিশ প্রকাশ' : 'Post New Notice'}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-grow w-full relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'নোটিশ খুঁজুন...' : 'Search notices...'}
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-green-600 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          {(['All', 'Admission', 'Exam', 'Holiday', 'General'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                filter === cat
                  ? 'bg-green-700 border-green-700 text-white shadow'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat === 'All'
                ? lang === 'bn'
                  ? 'সব নোটিশ'
                  : 'All'
                : lang === 'bn'
                ? cat === 'Admission'
                  ? 'ভর্তি'
                  : cat === 'Exam'
                  ? 'পরীক্ষা'
                  : cat === 'Holiday'
                  ? 'ছুটি'
                  : 'সাধারণ'
                : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const parsedDate = new Date(notice.date);
            const hasValidDate = !isNaN(parsedDate.getTime());
            return (
              <div
                key={notice.id}
                className="bg-white dark:bg-slate-900 p-6 md:p-7 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[80px] h-[80px] shrink-0">
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                    {hasValidDate ? parsedDate.toLocaleString('default', { month: 'short' }) : '2026'}
                  </span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                    {hasValidDate ? parsedDate.getDate() : '--'}
                  </span>
                </div>

                <div className="flex-grow space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${getCategoryColor(notice.category)}`}>
                      {notice.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" /> {notice.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">{t(notice.title)}</h3>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                    {t(notice.description)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-green-700 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-green-700 dark:hover:bg-green-800 transition-all"
                  >
                    <Download className="w-4 h-4" /> Print / PDF
                  </button>
                  {canManage &&
                    (confirmDeleteId === notice.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            deleteNotice(notice.id);
                            setConfirmDeleteId(null);
                          }}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-xl font-black text-xs"
                        >
                          {lang === 'bn' ? 'নিশ্চিত' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl font-black text-xs"
                        >
                          {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(notice)}
                          className="flex-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                          title="Edit Notice"
                        >
                          <Pencil className="w-4 h-4 mx-auto" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setConfirmDeleteId(notice.id)}
                            className="flex-1 bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-black text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি!' : 'No notices match your criteria.'}
            </h3>
            <button
              onClick={() => {
                setFilter('All');
                setSearchTerm('');
              }}
              className="text-green-700 dark:text-green-400 font-black uppercase text-xs hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Info Banner without telemetry widgets */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-black flex items-center justify-center md:justify-start gap-2">
            <Bell className="w-6 h-6 text-green-400" />
            {lang === 'bn' ? 'অফিসিয়াল নোটিশ আর্কাইভ' : 'Official Notice Archive'}
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            {lang === 'bn'
              ? 'বিদ্যালয়ের পরীক্ষা, ছুটি ও ভর্তি সংক্রান্ত প্রতিটি সিদ্ধান্ত এখানে প্রকাশিত হয়।'
              : 'All examination, holiday, and admission announcements are published here.'}
          </p>
        </div>
        <div className="px-8 py-5 bg-green-700 rounded-2xl text-center">
          <span className="text-[11px] font-black uppercase tracking-wider opacity-80 block">Published Notices</span>
          <span className="text-4xl font-black">{notices.length}</span>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black">{editingItem ? 'Edit Notice' : 'Post New Notice'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  name="titleBn"
                  defaultValue={editingItem?.title?.bn}
                  placeholder="Title (Bangla)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="titleEn"
                  defaultValue={editingItem?.title?.en}
                  placeholder="Title (English)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <textarea
                required
                name="descBn"
                defaultValue={editingItem?.description?.bn}
                placeholder="Description (Bangla)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm resize-none"
              />

              <textarea
                required
                name="descEn"
                defaultValue={editingItem?.description?.en}
                placeholder="Description (English)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm resize-none"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <select
                  name="category"
                  defaultValue={editingItem?.category || 'General'}
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option value="General">General News</option>
                  <option value="Admission">Admission Notice</option>
                  <option value="Exam">Exam Schedule</option>
                  <option value="Holiday">Holiday Notice</option>
                </select>
                <input
                  required
                  type="date"
                  name="date"
                  defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]}
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-grow bg-green-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-green-800"
                >
                  <Save className="w-5 h-5" /> {editingItem ? 'Update Notice' : 'Publish Notice'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-xs"
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
