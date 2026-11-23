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
  Newspaper,
  CalendarDays,
  MapPin,
  Printer,
  GraduationCap,
} from 'lucide-react';
import { CAMPUS_BRAND, TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { Notice, NewsArticle, CampusEvent } from '../types';
import { heroCampusImg } from '../src/assets/media';

const { useState, useMemo, useEffect } = React;
const { Link } = RouterDom;

interface NoticeBoardProps {
  initialTab?: 'notices' | 'news' | 'events';
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ initialTab = 'notices' }) => {
  const {
    lang,
    t,
    user,
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    newsList,
    addNews,
    updateNews,
    deleteNews,
    eventsList,
    addEvent,
    updateEvent,
    deleteEvent,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'notices' | 'news' | 'events'>(initialTab);
  const [noticeFilter, setNoticeFilter] = useState<'All' | 'Admission' | 'Exam' | 'Holiday' | 'General'>('All');
  const [newsFilter, setNewsFilter] = useState<'All' | 'Academic' | 'Achievement' | 'Campus' | 'Community'>('All');
  const [eventFilter, setEventFilter] = useState<'All' | 'Academic' | 'Science' | 'Sports' | 'Cultural'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [printableNotice, setPrintableNotice] = useState<Notice | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const canManage = user?.role === 'admin' || user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchesFilter = noticeFilter === 'All' || n.category === noticeFilter;
      const matchesSearch =
        searchTerm === '' ||
        t(n.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
        t(n.description).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [notices, noticeFilter, searchTerm, t]);

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchesFilter = newsFilter === 'All' || item.category === newsFilter;
      const matchesSearch =
        searchTerm === '' ||
        t(item.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
        t(item.summary).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [newsList, newsFilter, searchTerm, t]);

  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const matchesFilter = eventFilter === 'All' || ev.category === eventFilter;
      const matchesSearch =
        searchTerm === '' ||
        t(ev.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
        t(ev.description).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [eventsList, eventFilter, searchTerm, t]);

  const handleOpenAdd = () => {
    setEditingNotice(null);
    setEditingNews(null);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleSaveNotice = (e: React.FormEvent<HTMLFormElement>) => {
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
      id: editingNotice ? editingNotice.id : `n-${Date.now()}`,
      title: { bn: f.titleBn.value.trim(), en: f.titleEn.value.trim() },
      description: { bn: f.descBn.value.trim(), en: f.descEn.value.trim() },
      category: f.category.value as Notice['category'],
      date: f.date.value,
      isPublic: true,
    };
    if (editingNotice) updateNotice(data);
    else addNotice(data);
    setIsModalOpen(false);
  };

  const handleSaveNews = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as {
      titleBn: HTMLInputElement;
      titleEn: HTMLInputElement;
      summaryBn: HTMLTextAreaElement;
      summaryEn: HTMLTextAreaElement;
      contentBn: HTMLTextAreaElement;
      contentEn: HTMLTextAreaElement;
      category: HTMLSelectElement;
      date: HTMLInputElement;
      author: HTMLInputElement;
    };
    const data: NewsArticle = {
      id: editingNews ? editingNews.id : `news-${Date.now()}`,
      title: { bn: f.titleBn.value.trim(), en: f.titleEn.value.trim() },
      summary: { bn: f.summaryBn.value.trim(), en: f.summaryEn.value.trim() },
      content: { bn: f.contentBn.value.trim(), en: f.contentEn.value.trim() },
      category: f.category.value as NewsArticle['category'],
      date: f.date.value,
      author: f.author.value.trim() || user?.name || 'RBMB Editorial',
      imageUrl: editingNews?.imageUrl || heroCampusImg,
      isPublic: true,
    };
    if (editingNews) updateNews(data);
    else addNews(data);
    setIsModalOpen(false);
  };

  const handleSaveEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as {
      titleBn: HTMLInputElement;
      titleEn: HTMLInputElement;
      descBn: HTMLTextAreaElement;
      descEn: HTMLTextAreaElement;
      locBn: HTMLInputElement;
      locEn: HTMLInputElement;
      category: HTMLSelectElement;
      date: HTMLInputElement;
      time: HTMLInputElement;
    };
    const data: CampusEvent = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
      title: { bn: f.titleBn.value.trim(), en: f.titleEn.value.trim() },
      description: { bn: f.descBn.value.trim(), en: f.descEn.value.trim() },
      location: { bn: f.locBn.value.trim(), en: f.locEn.value.trim() },
      category: f.category.value as CampusEvent['category'],
      date: f.date.value,
      time: f.time.value.trim() || '10:00 AM',
      isPublic: true,
    };
    if (editingEvent) updateEvent(data);
    else addEvent(data);
    setIsModalOpen(false);
  };

  const getCategoryTextColor = (cat: string) => {
    switch (cat) {
      case 'Admission':
      case 'Academic':
        return 'text-blue-700 dark:text-blue-400';
      case 'Exam':
      case 'Science':
        return 'text-rose-700 dark:text-rose-400';
      case 'Holiday':
      case 'Cultural':
        return 'text-amber-700 dark:text-amber-400';
      case 'Achievement':
      case 'Sports':
        return 'text-emerald-700 dark:text-emerald-400';
      default:
        return 'text-slate-600 dark:text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === 'bn' ? 'মূল পাতায় ফিরুন' : 'Back to Home'}
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> {t(CAMPUS_BRAND)} · Notice, News & Events
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t(TRANSLATIONS.nav.noticeNews)}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-2xl">
              {lang === 'bn'
                ? `${t(settings.name)}-এর প্রাতিষ্ঠানিক বিজ্ঞপ্তি, সর্বশেষ ক্যাম্পাস সংবাদ ও আসন্ন ইভেন্টসমূহ।`
                : `Official notices, campus news dispatches, and scheduled events for ${t(settings.name)}.`}
            </p>
          </div>
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-800 transition-colors flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              {activeTab === 'notices'
                ? lang === 'bn'
                  ? 'নতুন নোটিশ'
                  : 'Post Notice'
                : activeTab === 'news'
                ? lang === 'bn'
                  ? 'নতুন সংবাদ'
                  : 'Publish News'
                : lang === 'bn'
                ? 'নতুন ইভেন্ট'
                : 'Add Event'}
            </button>
          )}
        </div>

        {/* Interactive Hub Switcher */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('notices')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              activeTab === 'notices'
                ? 'bg-emerald-700 border-emerald-700 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{lang === 'bn' ? 'অফিসিয়াল নোটিশ' : 'Official Notices'}</span>
            <span className="tabular-nums opacity-80">({notices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              activeTab === 'news'
                ? 'bg-emerald-700 border-emerald-700 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ক্যাম্পাস সংবাদ' : 'Campus News'}</span>
            <span className="tabular-nums opacity-80">({newsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              activeTab === 'events'
                ? 'bg-emerald-700 border-emerald-700 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{lang === 'bn' ? 'আসন্ন ইভেন্ট' : 'Campus Events'}</span>
            <span className="tabular-nums opacity-80">({eventsList.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-grow w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'notices'
                ? lang === 'bn'
                  ? 'নোটিশ খুঁজুন...'
                  : 'Search notices...'
                : activeTab === 'news'
                ? lang === 'bn'
                  ? 'সংবাদ খুঁজুন...'
                  : 'Search news stories...'
                : lang === 'bn'
                ? 'ইভেন্ট খুঁজুন...'
                : 'Search campus events...'
            }
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'notices' && (
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            {(['All', 'Admission', 'Exam', 'Holiday', 'General'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setNoticeFilter(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap border ${
                  noticeFilter === cat
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat === 'All'
                  ? lang === 'bn'
                    ? 'সবগুলো'
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
        )}

        {activeTab === 'news' && (
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            {(['All', 'Academic', 'Achievement', 'Campus', 'Community'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setNewsFilter(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap border ${
                  newsFilter === cat
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            {(['All', 'Academic', 'Science', 'Sports', 'Cultural'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setEventFilter(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap border ${
                  eventFilter === cat
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: OFFICIAL NOTICES */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => {
              const parsedDate = new Date(notice.date);
              const hasValidDate = !isNaN(parsedDate.getTime());
              return (
                <div
                  key={notice.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-start hover:border-emerald-400 dark:hover:border-emerald-700 transition-colors"
                >
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl flex flex-col items-center justify-center min-w-[76px] h-[76px] shrink-0">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      {hasValidDate ? parsedDate.toLocaleString('default', { month: 'short' }) : '2026'}
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tabular-nums mt-0.5">
                      {hasValidDate ? parsedDate.getDate() : '--'}
                    </span>
                  </div>

                  <div className="flex-grow space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <span className={getCategoryTextColor(notice.category)}>{notice.category}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 tabular-nums">
                        <Clock className="w-3.5 h-3.5" /> {notice.date}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug">
                      {t(notice.title)}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                      {t(notice.description)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrintableNotice(notice)}
                      className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors"
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
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-xl font-bold text-xs"
                          >
                            {lang === 'bn' ? 'নিশ্চিত' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl font-bold text-xs"
                          >
                            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingNotice(notice);
                              setIsModalOpen(true);
                            }}
                            className="flex-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                            title="Edit Notice"
                          >
                            <Pencil className="w-4 h-4 mx-auto" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setConfirmDeleteId(notice.id)}
                              className="flex-1 bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
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
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-base font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি' : 'No notices match your filter.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCHOOL NEWS */}
      {activeTab === 'news' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.length > 0 ? (
            filteredNews.map((item) => (
              <article
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
              >
                <div className="h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={item.imageUrl || heroCampusImg}
                    alt={t(item.title)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = heroCampusImg;
                    }}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <span className={getCategoryTextColor(item.category)}>{item.category}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{t(item.title)}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t(item.summary)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">{t(item.content)}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">{item.author || 'RBMB Editorial'}</span>
                    {canManage && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingNews(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => deleteNews(item.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-base font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি' : 'No news articles match your search.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CAMPUS EVENTS */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className={getCategoryTextColor(ev.category)}>{ev.category}</span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">{ev.date}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{t(ev.title)}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t(ev.description)}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="tabular-nums">{ev.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {t(ev.location)}
                    </span>
                    {canManage && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingEvent(ev);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => deleteEvent(ev.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-base font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'কোনো ইভেন্ট পাওয়া যায়নি' : 'No upcoming events found.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-emerald-700 p-5 text-white flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black">
                {activeTab === 'notices'
                  ? editingNotice
                    ? 'Edit Notice'
                    : 'Post New Notice'
                  : activeTab === 'news'
                  ? editingNews
                    ? 'Edit News Article'
                    : 'Publish News Article'
                  : editingEvent
                  ? 'Edit Campus Event'
                  : 'Create Campus Event'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'notices' && (
              <form onSubmit={handleSaveNotice} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    name="titleBn"
                    defaultValue={editingNotice?.title?.bn}
                    placeholder="Title (Bangla)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm"
                  />
                  <input
                    required
                    name="titleEn"
                    defaultValue={editingNotice?.title?.en}
                    placeholder="Title (English)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm"
                  />
                </div>
                <textarea
                  required
                  name="descBn"
                  defaultValue={editingNotice?.description?.bn}
                  placeholder="Description (Bangla)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm resize-none"
                />
                <textarea
                  required
                  name="descEn"
                  defaultValue={editingNotice?.description?.en}
                  placeholder="Description (English)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm resize-none"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <select
                    name="category"
                    defaultValue={editingNotice?.category || 'General'}
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm"
                  >
                    <option value="General">General</option>
                    <option value="Admission">Admission</option>
                    <option value="Exam">Exam</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                  <input
                    required
                    type="date"
                    name="date"
                    defaultValue={editingNotice?.date || new Date().toISOString().split('T')[0]}
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-grow bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-800"
                  >
                    <Save className="w-4 h-4" /> {editingNotice ? 'Update Notice' : 'Publish Notice'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'news' && (
              <form onSubmit={handleSaveNews} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    name="titleBn"
                    defaultValue={editingNews?.title?.bn}
                    placeholder="News Headline (Bangla)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                  <input
                    required
                    name="titleEn"
                    defaultValue={editingNews?.title?.en}
                    placeholder="News Headline (English)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <textarea
                    required
                    name="summaryBn"
                    defaultValue={editingNews?.summary?.bn}
                    placeholder="Short Summary (Bangla)"
                    rows={2}
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold resize-none"
                  />
                  <textarea
                    required
                    name="summaryEn"
                    defaultValue={editingNews?.summary?.en}
                    placeholder="Short Summary (English)"
                    rows={2}
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold resize-none"
                  />
                </div>
                <textarea
                  required
                  name="contentBn"
                  defaultValue={editingNews?.content?.bn}
                  placeholder="Full Article (Bangla)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold resize-none"
                />
                <textarea
                  required
                  name="contentEn"
                  defaultValue={editingNews?.content?.en}
                  placeholder="Full Article (English)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold resize-none"
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <select
                    name="category"
                    defaultValue={editingNews?.category || 'Academic'}
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Campus">Campus</option>
                    <option value="Community">Community</option>
                  </select>
                  <input
                    required
                    type="date"
                    name="date"
                    defaultValue={editingNews?.date || new Date().toISOString().split('T')[0]}
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                  <input
                    name="author"
                    defaultValue={editingNews?.author || user?.name || 'RBMB Editorial'}
                    placeholder="Author / Desk"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-grow bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-800"
                  >
                    <Save className="w-4 h-4" /> {editingNews ? 'Update News' : 'Publish News'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'events' && (
              <form onSubmit={handleSaveEvent} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    name="titleBn"
                    defaultValue={editingEvent?.title?.bn}
                    placeholder="Event Title (Bangla)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                  <input
                    required
                    name="titleEn"
                    defaultValue={editingEvent?.title?.en}
                    placeholder="Event Title (English)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>
                <textarea
                  required
                  name="descBn"
                  defaultValue={editingEvent?.description?.bn}
                  placeholder="Description (Bangla)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold resize-none"
                />
                <textarea
                  required
                  name="descEn"
                  defaultValue={editingEvent?.description?.en}
                  placeholder="Description (English)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold resize-none"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    name="locBn"
                    defaultValue={editingEvent?.location?.bn || 'বিদ্যালয় অডিটোরিয়াম'}
                    placeholder="Location (Bangla)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                  <input
                    required
                    name="locEn"
                    defaultValue={editingEvent?.location?.en || 'School Auditorium'}
                    placeholder="Location (English)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <select
                    name="category"
                    defaultValue={editingEvent?.category || 'Academic'}
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Science">Science</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                  <input
                    required
                    type="date"
                    name="date"
                    defaultValue={editingEvent?.date || new Date().toISOString().split('T')[0]}
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                  <input
                    required
                    name="time"
                    defaultValue={editingEvent?.time || '10:30 AM'}
                    placeholder="Time (e.g. 10:30 AM)"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-grow bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-800"
                  >
                    <Save className="w-4 h-4" /> {editingEvent ? 'Update Event' : 'Save Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Official Printable Notice Circular Modal */}
      {printableNotice && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm no-print" onClick={() => setPrintableNotice(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
            <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {lang === 'bn' ? 'অফিসিয়াল নোটিশ প্রিভিউ' : 'Official Notice Circular Preview'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableNotice(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div id="printable-notice" className="p-8 sm:p-10 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 space-y-6">
              <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-5 space-y-1">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-800 text-white mb-1">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  {settings.shortName || 'RBMB Digital Campus'} · Est. 1958
                </p>
                <h2 className="text-2xl font-black">{t(settings.name)}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {t(settings.location)} · EIIN: {settings.eiin} · {settings.phone}
                </p>
                <div className="pt-2">
                  <span className="inline-block border border-slate-900 dark:border-slate-600 px-4 py-0.5 text-xs font-black uppercase tracking-widest">
                    {lang === 'bn' ? 'অফিসিয়াল বিজ্ঞপ্তি' : 'OFFICIAL NOTICE CIRCULAR'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono-code font-bold text-slate-500 tabular-nums">
                <span>Memo No: RBMB/{printableNotice.category.toUpperCase()}/{printableNotice.id.slice(-6)}</span>
                <span>Date: {printableNotice.date}</span>
              </div>

              <div className="space-y-4 py-2">
                <h3 className="text-xl font-black leading-snug text-slate-900 dark:text-white">
                  {t(printableNotice.title)}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {t(printableNotice.description)}
                </p>
              </div>

              <div className="flex justify-end pt-10">
                <div className="text-center border-t border-slate-400 dark:border-slate-600 px-6 pt-2 text-xs">
                  <p className="font-black text-slate-900 dark:text-white">
                    {t(settings.headTeacherName) || (lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher')}
                  </p>
                  <p className="text-slate-500 font-semibold">
                    {lang === 'bn' ? 'প্রধান শিক্ষক, রাণীর বাজার মাধ্যমিক বিদ্যালয়' : 'Head Teacher, Ranir Bazar Secondary High School'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
