
import * as React from 'react';
import { Book, Download, ExternalLink, Search, Filter, Tag, BookOpen, GraduationCap, PlusCircle, X, Save, Upload, RotateCcw, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { LocalizedString } from '../types';
import { EBook } from '../constants';
import * as RouterDom from 'react-router-dom';

const { useState, useMemo } = React;
const { Link } = RouterDom;

const SUBJECT_LABELS: Record<string, LocalizedString> = {
  'Bangla': { bn: 'বাংলা', en: 'Bangla' },
  'English': { bn: 'ইংরেজি', en: 'English' },
  'Math': { bn: 'গণিত', en: 'Mathematics' },
  'Social': { bn: 'সামাজিক বিজ্ঞান', en: 'Social Science' },
  'Life': { bn: 'জীবন ও জীবিকা', en: 'Life & Livelihood' },
  'Science': { bn: 'বিজ্ঞান', en: 'Science' },
  'Art': { bn: 'শিল্প ও সংস্কৃতি', en: 'Art & Culture' },
  'Tech': { bn: 'ডিজিটাল প্রযুক্তি', en: 'Digital Tech' },
  'Commerce': { bn: 'ব্যবসায় শিক্ষা', en: 'Commerce' },
};

const EBookLibrary: React.FC = () => {
  const { lang, t, user, ebooks, addEbook, updateEbook, deleteEbook } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EBook | null>(null);
  const [coverBase64, setCoverBase64] = useState('');

  const isAdmin = user?.role === 'admin';

  const classes = useMemo(() => ['All', '6', '7', '8', '9', '10'], []);
  const subjects = useMemo(() => ['All', ...Object.keys(SUBJECT_LABELS)], []);

  const filteredBooks = useMemo(() => {
    return ebooks.filter(book => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        book.title.bn.toLowerCase().includes(searchLower) || 
        book.title.en.toLowerCase().includes(searchLower);
      const matchesClass = selectedClass === 'All' || book.classId === selectedClass;
      const matchesSubject = selectedSubject === 'All' || book.subject === selectedSubject;
      return matchesSearch && matchesClass && matchesSubject;
    });
  }, [ebooks, searchTerm, selectedClass, selectedSubject]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedClass('All');
    setSelectedSubject('All');
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCoverBase64('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: EBook) => {
    setEditingItem(book);
    setCoverBase64(book.coverUrl);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    const data: EBook = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      title: { bn: f.titleBn.value, en: f.titleEn.value },
      classId: f.classId.value,
      className: { bn: `${f.classId.value}ম শ্রেণী`, en: `Class ${f.classId.value}` },
      subject: f.subject.value,
      coverUrl: coverBase64 || editingItem?.coverUrl || 'https://picsum.photos/seed/book/300/400',
      downloadUrl: '#'
    };
    
    editingItem ? updateEbook(data) : addEbook(data);
    setIsModalOpen(false);
    setCoverBase64('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col gap-4">
        <Link to="/" className="flex items-center gap-2 text-green-700 font-bold text-sm hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> {lang === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-green-900 tracking-tight">
              {t(TRANSLATIONS.nav.ebooks)} <span className="text-slate-400">২০২৬</span>
            </h1>
            <p className="text-gray-500 max-w-2xl font-medium">
              {lang === 'bn' ? 'সকল বিষয়ের ডিজিটাল ই-বুক লাইব্রেরি।' : 'Digital e-book library for all subjects.'}
            </p>
          </div>
          {isAdmin && (
            <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 shadow-xl transition-all active:scale-95">
              <PlusCircle className="w-5 h-5" /> {lang === 'bn' ? 'নতুন ই-বুক' : 'Add E-book'}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Search className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'বইয়ের নাম দিয়ে খুঁজুন (বাংলা বা ইংরেজি)...' : 'Search by book title (Bangla or English)...'}
            className="w-full pl-16 pr-14 py-6 rounded-[2.5rem] border-2 border-transparent shadow-2xl shadow-green-900/5 focus:ring-8 focus:ring-green-500/10 focus:border-green-500 outline-none bg-white font-black text-xl transition-all placeholder:text-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2 ml-2">
              <GraduationCap className="w-3.5 h-3.5" /> {lang === 'bn' ? 'শ্রেণী নির্বাচন করুন' : 'Filter by Class'}
            </label>
            <div className="flex flex-wrap gap-2">
              {classes.map(c => (
                <button 
                  key={c} 
                  onClick={() => setSelectedClass(c)} 
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                    selectedClass === c 
                      ? 'bg-green-700 border-green-700 text-white shadow-lg' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-700'
                  }`}
                >
                  {c === 'All' ? (lang === 'bn' ? 'সব' : 'All') : (lang === 'bn' ? `${c}ম` : c)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2 ml-2">
              <Tag className="w-3.5 h-3.5" /> {lang === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Filter by Subject'}
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button 
                  key={s} 
                  onClick={() => setSelectedSubject(s)} 
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                    selectedSubject === s 
                      ? 'bg-green-700 border-green-700 text-white shadow-lg' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-700'
                  }`}
                >
                   {s === 'All' ? (lang === 'bn' ? 'সব' : 'All') : t(SUBJECT_LABELS[s] || {bn: s, en: s})}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {filteredBooks.map((book) => (
            <div key={book.id} className="group relative bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="aspect-[3/4] overflow-hidden bg-slate-50 relative">
                <img src={book.coverUrl} alt={t(book.title)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleOpenEdit(book)} className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg hover:scale-110"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteEbook(book.id)} className="bg-red-500 text-white p-2.5 rounded-xl shadow-lg hover:scale-110"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[9px] font-black text-green-700 uppercase tracking-widest bg-green-50 px-2.5 py-1 rounded-lg inline-block">
                  {t(book.className)}
                </span>
                <h3 className="font-black text-gray-900 text-sm leading-tight line-clamp-2 h-10">
                  {t(book.title)}
                </h3>
                <button className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-green-700 transition-all shadow-sm active:scale-95">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-green-700 p-8 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black">{editingItem ? 'Edit E-book' : 'Add New E-book'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {coverBase64 ? <img src={coverBase64} className="w-full h-full object-cover" /> : <BookOpen className="text-gray-200" />}
                </div>
                <label className="bg-slate-100 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 transition-colors">
                  <Upload className="w-3.5 h-3.5 inline mr-2" /> Cover Image
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setCoverBase64(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title (BN)</label>
                  <input required name="titleBn" defaultValue={editingItem?.title?.bn} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-gray-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title (EN)</label>
                  <input required name="titleEn" defaultValue={editingItem?.title?.en} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-gray-100 outline-none focus:ring-2 focus:ring-green-500 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class</label>
                  <select name="classId" defaultValue={editingItem?.classId || '6'} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-gray-100 outline-none font-bold">
                    {['6', '7', '8', '9', '10'].map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                  <select name="subject" defaultValue={editingItem?.subject || 'Bangla'} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-gray-100 outline-none font-bold">
                    {subjects.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-green-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-green-800 transition-all active:scale-95">
                <Save className="w-5 h-5" /> {editingItem ? 'Update E-book' : 'Save E-book'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EBookLibrary;
