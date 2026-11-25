import * as React from 'react';
import {
  BookOpen,
  Download,
  ExternalLink,
  Search,
  Tag,
  GraduationCap,
  PlusCircle,
  X,
  Save,
  Upload,
  ArrowLeft,
  Pencil,
  Trash2,
  Eye,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { EBook, LibraryCategory, LocalizedString } from '../types';
import { isSafeHttpUrl } from '../utils/security';
import { compressImageFile } from '../utils/imageUtils';
import * as RouterDom from 'react-router-dom';

const { useState, useMemo } = React;
const { Link } = RouterDom;

const SUBJECT_LABELS: Record<string, LocalizedString> = {
  Bangla: { bn: 'বাংলা', en: 'Bangla' },
  English: { bn: 'ইংরেজি', en: 'English' },
  Math: { bn: 'গণিত', en: 'Mathematics' },
  Science: { bn: 'বিজ্ঞান', en: 'Science' },
  Social: { bn: 'সামাজিক বিজ্ঞান', en: 'Social Science' },
  ICT: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' },
  Religion: { bn: 'ধর্ম ও নৈতিক শিক্ষা', en: 'Religion' },
  Commerce: { bn: 'ব্যবসায় শিক্ষা', en: 'Commerce' },
  General: { bn: 'সকল বিষয় / মডেল', en: 'General / Combined' },
};

const CATEGORY_LABELS: Record<LibraryCategory, LocalizedString> = {
  Textbook: { bn: 'NCTB পাঠ্যবই', en: 'NCTB Textbook' },
  StudyMaterial: { bn: 'স্টাডি ম্যাটেরিয়াল', en: 'Study Material' },
  Notes: { bn: 'অধ্যায়ভিত্তিক নোট', en: 'Subject Notes' },
  ChapterPDF: { bn: 'চ্যাপ্টার PDF', en: 'Chapter PDF' },
  BoardQuestion: { bn: 'বোর্ড প্রশ্ন', en: 'Board Question' },
  ModelTest: { bn: 'মডেল টেস্ট', en: 'Model Test' },
  Practical: { bn: 'বিজ্ঞান প্র্যাকটিক্যাল', en: 'Science Practical' },
  MathSolution: { bn: 'গণিত সমাধান', en: 'Math Solution' },
  EnglishGrammar: { bn: 'English Grammar', en: 'English Grammar' },
  ICT: { bn: 'ICT লার্নিং', en: 'ICT Learning' },
};

const EBookLibrary: React.FC = () => {
  const { lang, t, user, ebooks, addEbook, updateEbook, deleteEbook } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | LibraryCategory>('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EBook | null>(null);
  const [readerBook, setReaderBook] = useState<EBook | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [coverBase64, setCoverBase64] = useState('');

  const canManage = user?.role === 'admin' || user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  const classes = useMemo(() => ['All', '6', '7', '8', '9', '10'], []);
  const categories = useMemo(
    () => ['All', ...(Object.keys(CATEGORY_LABELS) as LibraryCategory[])] as const,
    []
  );
  const subjects = useMemo(() => ['All', ...Object.keys(SUBJECT_LABELS)], []);

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return ebooks.filter((book) => {
      const matchesSearch =
        !q ||
        (book.title.bn || '').toLowerCase().includes(q) ||
        (book.title.en || '').toLowerCase().includes(q) ||
        (book.subject || '').toLowerCase().includes(q) ||
        (book.description?.bn || '').toLowerCase().includes(q) ||
        (book.description?.en || '').toLowerCase().includes(q);
      const matchesClass = selectedClass === 'All' || book.classId === selectedClass;
      const matchesCategory = selectedCategory === 'All' || (book.category || 'Textbook') === selectedCategory;
      const matchesSubject = selectedSubject === 'All' || book.subject === selectedSubject;
      return matchesSearch && matchesClass && matchesCategory && matchesSubject;
    });
  }, [ebooks, searchTerm, selectedClass, selectedCategory, selectedSubject]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedClass('All');
    setSelectedCategory('All');
    setSelectedSubject('All');
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCoverBase64('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: EBook) => {
    setEditingItem(book);
    setCoverBase64(book.coverUrl || '');
    setIsModalOpen(true);
  };

  const handleDownloadStudySheet = (book: EBook) => {
    const content = [
      `RANIR BAZAR SECONDARY HIGH SCHOOL - DIGITAL LIBRARY`,
      `====================================================`,
      `Title (EN): ${book.title.en}`,
      `Title (BN): ${book.title.bn}`,
      `Class: ${t(book.className)} | Subject: ${book.subject}`,
      `Category: ${book.category || 'Textbook'}`,
      ``,
      `Summary & Study Notes:`,
      `${book.description ? t(book.description) : 'Official RBHS Digital Study Resource for 2026 Curriculum.'}`,
      ``,
      `Tips for Students:`,
      `- Review key definitions and formulas carefully.`,
      `- Practice MCQ tests in the Online Examination Portal (/exams).`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.subject || 'RBHS'}_Class${book.classId}_${book.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as {
      titleBn: HTMLInputElement;
      titleEn: HTMLInputElement;
      classId: HTMLSelectElement;
      subject: HTMLSelectElement;
      category: HTMLSelectElement;
      descBn: HTMLTextAreaElement;
      descEn: HTMLTextAreaElement;
      downloadUrl: HTMLInputElement;
    };

    const rawDownload = f.downloadUrl.value.trim();
    const safeDownload = isSafeHttpUrl(rawDownload) ? rawDownload : '#';

    const data: EBook = {
      id: editingItem ? editingItem.id : `eb-${Date.now()}`,
      title: { bn: f.titleBn.value.trim(), en: f.titleEn.value.trim() },
      classId: f.classId.value,
      className: { bn: `${f.classId.value}ম শ্রেণী`, en: `Class ${f.classId.value}` },
      subject: f.subject.value,
      category: f.category.value as LibraryCategory,
      description: {
        bn: f.descBn.value.trim() || '২০২৬ শিক্ষাবর্ষের ডিজিটাল পাঠ্য সহায়িকা।',
        en: f.descEn.value.trim() || '2026 Curriculum digital learning resource.',
      },
      coverUrl: coverBase64 || editingItem?.coverUrl || '',
      downloadUrl: safeDownload,
      isPublic: true,
    };

    if (editingItem) updateEbook(data);
    else addEbook(data);

    setIsModalOpen(false);
    setCoverBase64('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-sm hover:gap-3 transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
              {t(TRANSLATIONS.ebook.title)}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl font-medium text-sm md:text-base">
              {t(TRANSLATIONS.ebook.subtitle)}
            </p>
          </div>
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-green-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-green-800 shadow-lg transition-all active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> {lang === 'bn' ? 'নতুন রিসোর্স যোগ করুন' : 'Add Resource'}
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder={
              lang === 'bn'
                ? 'বই, নোট, বোর্ড প্রশ্ন বা বিষয় খুঁজুন...'
                : 'Search NCTB books, notes, board questions, ICT...'
            }
            className="w-full pl-14 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md focus:ring-2 focus:ring-green-600 outline-none font-bold text-base placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(searchTerm || selectedClass !== 'All' || selectedCategory !== 'All' || selectedSubject !== 'All') && (
            <button
              onClick={handleReset}
              className="absolute inset-y-0 right-3 my-auto h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> {lang === 'bn' ? 'শ্রেণী নির্বাচন করুন' : 'Filter by Class'}
            </label>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                    selectedClass === c
                      ? 'bg-green-700 border-green-700 text-white shadow'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-green-400'
                  }`}
                >
                  {c === 'All' ? (lang === 'bn' ? 'সব শ্রেণী' : 'All') : lang === 'bn' ? `${c}ম` : `Class ${c}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4" /> {lang === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Filter by Subject'}
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                    selectedSubject === s
                      ? 'bg-green-700 border-green-700 text-white shadow'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-green-400'
                  }`}
                >
                  {s === 'All' ? (lang === 'bn' ? 'সব বিষয়' : 'All') : t(SUBJECT_LABELS[s] || { bn: s, en: s })}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* All 10 Library Categories */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> {lang === 'bn' ? 'লাইব্রেরি ধরন (Categories)' : 'Resource Category'}
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-emerald-600 border-slate-900 dark:border-emerald-600 text-white shadow'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
                }`}
              >
                {cat === 'All'
                  ? lang === 'bn'
                    ? 'সব রিসোর্স'
                    : 'All Types'
                  : t(CATEGORY_LABELS[cat])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            {lang === 'bn' ? 'আপনার খোঁজা কোনো বই বা নোট পাওয়া যায়নি।' : 'No matching books or study materials found.'}
          </p>
          <button
            onClick={handleReset}
            className="text-xs font-black text-green-700 dark:text-green-400 hover:underline uppercase tracking-wider"
          >
            {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const cat = book.category || 'Textbook';
            const hasExternalUrl = isSafeHttpUrl(book.downloadUrl) && book.downloadUrl !== '#';
            return (
              <div
                key={book.id}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-xl transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={t(book.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 p-5 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase bg-white/20 px-2.5 py-1 rounded-lg">
                          {t(CATEGORY_LABELS[cat])}
                        </span>
                        <BookOpen className="w-5 h-5 text-yellow-300" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-emerald-200 uppercase">
                          {t(book.className)} • {book.subject}
                        </p>
                        <h4 className="text-base font-black leading-snug line-clamp-2 mt-1">{t(book.title)}</h4>
                      </div>
                    </div>
                  )}

                  {canManage && (
                    <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="bg-blue-600 text-white p-2 rounded-xl shadow hover:bg-blue-700"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin &&
                        (confirmDeleteId === book.id ? (
                          <button
                            onClick={() => {
                              deleteEbook(book.id);
                              setConfirmDeleteId(null);
                            }}
                            className="bg-red-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-black shadow"
                          >
                            {lang === 'bn' ? 'নিশ্চিত' : 'Confirm'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(book.id)}
                            className="bg-red-500 text-white p-2 rounded-xl shadow hover:bg-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-green-700 dark:text-green-300 uppercase bg-green-50 dark:bg-green-950/60 px-2.5 py-0.5 rounded-lg">
                        {t(book.className)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {t(CATEGORY_LABELS[cat])}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                      {t(book.title)}
                    </h3>
                    {book.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {t(book.description)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setReaderBook(book)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-2.5 rounded-xl text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> {lang === 'bn' ? 'পড়ুন' : 'Preview'}
                    </button>
                    {hasExternalUrl ? (
                      <a
                        href={book.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 text-white py-2.5 rounded-xl text-xs font-black hover:bg-green-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> {lang === 'bn' ? 'খুলুন' : 'Open'}
                      </a>
                    ) : (
                      <button
                        onClick={() => handleDownloadStudySheet(book)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 text-white py-2.5 rounded-xl text-xs font-black hover:bg-green-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> {lang === 'bn' ? 'নোট' : 'Download'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reader / Preview Modal */}
      {readerBook && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setReaderBook(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-green-700 p-6 text-white flex justify-between items-start gap-4">
              <div>
                <span className="text-[11px] font-black uppercase bg-white/20 px-2.5 py-1 rounded-lg">
                  {t(readerBook.className)} • {readerBook.subject} • {t(CATEGORY_LABELS[readerBook.category || 'Textbook'])}
                </span>
                <h2 className="text-xl md:text-2xl font-black mt-2">{t(readerBook.title)}</h2>
              </div>
              <button onClick={() => setReaderBook(null)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'পাঠ্য সারসংক্ষেপ ও গাইড' : 'Study Overview & Resource Summary'}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {readerBook.description
                    ? t(readerBook.description)
                    : lang === 'bn'
                    ? 'রাণীর বাজার মাধ্যমিক বিদ্যালয়ের ২০২৬ শিক্ষাবর্ষের অনুমোদিত ডিজিটাল পাঠ্য সহায়িকা।'
                    : 'Official 2026 academic curriculum digital material from রাণীর বাজার মাধ্যমিক বিদ্যালয়.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {isSafeHttpUrl(readerBook.downloadUrl) && readerBook.downloadUrl !== '#' && (
                  <a
                    href={readerBook.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white py-3.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-green-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {lang === 'bn' ? 'মূল লিংকে খুলুন' : 'Open External Resource'}
                  </a>
                )}
                <button
                  onClick={() => handleDownloadStudySheet(readerBook)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white py-3.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider hover:opacity-90"
                >
                  <Download className="w-4 h-4" />
                  {lang === 'bn' ? 'স্টাডি নোট ডাউনলোড (.txt)' : 'Download Study Guide (.txt)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black">
                {editingItem
                  ? lang === 'bn'
                    ? 'রিসোর্স সম্পাদনা'
                    : 'Edit Library Resource'
                  : lang === 'bn'
                  ? 'নতুন ই-বুক / নোট যোগ করুন'
                  : 'Add New Study Resource'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                  {coverBase64 ? (
                    <img src={coverBase64} className="w-full h-full object-cover" alt="Cover preview" />
                  ) : (
                    <BookOpen className="text-slate-400 w-7 h-7" />
                  )}
                </div>
                <label className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                  <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                  {lang === 'bn' ? 'কভার ছবি (ঐচ্ছিক)' : 'Cover Image (Optional)'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await compressImageFile(file, 500, 0.72);
                        setCoverBase64(compressed);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">Title (BN)</label>
                  <input
                    required
                    name="titleBn"
                    defaultValue={editingItem?.title?.bn}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">Title (EN)</label>
                  <input
                    required
                    name="titleEn"
                    defaultValue={editingItem?.title?.en}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">Class</label>
                  <select
                    name="classId"
                    defaultValue={editingItem?.classId || '6'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold text-sm"
                  >
                    {['6', '7', '8', '9', '10'].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">Subject</label>
                  <select
                    name="subject"
                    defaultValue={editingItem?.subject || 'Bangla'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold text-sm"
                  >
                    {Object.keys(SUBJECT_LABELS).map((s) => (
                      <option key={s} value={s}>
                        {t(SUBJECT_LABELS[s])}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">Category</label>
                  <select
                    name="category"
                    defaultValue={editingItem?.category || 'Textbook'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold text-sm"
                  >
                    {(Object.keys(CATEGORY_LABELS) as LibraryCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {t(CATEGORY_LABELS[cat])}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">
                    PDF / Drive URL (Optional https://...)
                  </label>
                  <input
                    name="downloadUrl"
                    defaultValue={editingItem?.downloadUrl && editingItem.downloadUrl !== '#' ? editingItem.downloadUrl : ''}
                    placeholder="https://nctb.gov.bd/..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">Notes (BN)</label>
                  <textarea
                    name="descBn"
                    rows={2}
                    defaultValue={editingItem?.description?.bn}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold text-sm resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">Notes (EN)</label>
                  <textarea
                    name="descEn"
                    rows={2}
                    defaultValue={editingItem?.description?.en}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold text-sm resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-green-800 transition-all"
              >
                <Save className="w-4 h-4" /> {editingItem ? 'Update Resource' : 'Save Resource'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EBookLibrary;
