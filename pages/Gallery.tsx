import * as React from 'react';
import {
  Image as ImageIcon,
  ZoomIn,
  PlusCircle,
  X,
  Save,
  Upload,
  Pencil,
  Trash2,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { GalleryItem } from '../types';
import { compressImageFile } from '../utils/imageUtils';
import { isSafeHttpUrl } from '../utils/security';
import { heroCampusImg } from '../src/assets/media';

const { useState, useMemo } = React;

const CATEGORY_OPTIONS: Array<{ id: 'All' | NonNullable<GalleryItem['category']>; bn: string; en: string }> = [
  { id: 'All', bn: 'সবগুলো', en: 'All' },
  { id: 'Campus', bn: 'ক্যাম্পাস', en: 'Campus' },
  { id: 'Sports', bn: 'বার্ষিক ক্রীড়া', en: 'Sports' },
  { id: 'Cultural', bn: 'সাংস্কৃতিক অনুষ্ঠান', en: 'Cultural' },
  { id: 'Lab', bn: 'ল্যাব ও বিজ্ঞান', en: 'Science & IT Lab' },
  { id: 'Tour', bn: 'শিক্ষা সফর', en: 'Study Tour' },
];

const Gallery: React.FC = () => {
  const { lang, t, user, gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [photoBase64, setPhotoBase64] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'All' | NonNullable<GalleryItem['category']>>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const filteredGallery = useMemo(() => {
    return gallery.filter((item) => {
      const mType = item.mediaType || 'image';
      const matchesMedia = mediaFilter === 'all' || mType === mediaFilter;
      const matchesCategory = categoryFilter === 'All' || (item.category || 'Campus') === categoryFilter;
      return matchesMedia && matchesCategory;
    });
  }, [gallery, mediaFilter, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setPhotoBase64('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setPhotoBase64(item.url || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as {
      capBn: HTMLInputElement;
      capEn: HTMLInputElement;
      mediaType: HTMLSelectElement;
      category: HTMLSelectElement;
      videoUrl: HTMLInputElement;
    };

    const rawVideo = f.videoUrl.value.trim();
    const safeVideo = isSafeHttpUrl(rawVideo) ? rawVideo : undefined;
    const mType = f.mediaType.value as 'image' | 'video';

    const data: GalleryItem = {
      id: editingItem ? editingItem.id : `gal-${Date.now()}`,
      caption: { bn: f.capBn.value.trim(), en: f.capEn.value.trim() },
      url: photoBase64 || editingItem?.url || heroCampusImg,
      mediaType: mType,
      category: f.category.value as GalleryItem['category'],
      ...(safeVideo ? { videoUrl: safeVideo } : {}),
      isPublic: true,
    };

    if (editingItem) updateGalleryItem(data);
    else addGalleryItem(data);

    setIsModalOpen(false);
    setPhotoBase64('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
            {t(TRANSLATIONS.gallery.title)}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
            {t(TRANSLATIONS.gallery.subtitle)}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-green-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-green-800 shadow-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" /> {lang === 'bn' ? 'ছবি / ভিডিও যোগ করুন' : 'Add Photo / Video'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                categoryFilter === cat.id
                  ? 'bg-green-700 border-green-700 text-white shadow'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {lang === 'bn' ? cat.bn : cat.en}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {[
            { id: 'all' as const, label: lang === 'bn' ? 'সব' : 'All' },
            { id: 'image' as const, label: lang === 'bn' ? 'ছবি' : 'Photos' },
            { id: 'video' as const, label: lang === 'bn' ? 'ভিডিও' : 'Videos' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMediaFilter(m.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                mediaFilter === m.id
                  ? 'bg-white dark:bg-slate-700 text-green-700 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredGallery.map((item) => {
          const isVideo = item.mediaType === 'video';
          return (
            <div
              key={item.id}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all"
            >
              <div
                onClick={() => setPreviewItem(item)}
                className="aspect-[4/3] overflow-hidden relative cursor-pointer bg-slate-100 dark:bg-slate-800"
              >
                <img
                  src={item.url || heroCampusImg}
                  alt={t(item.caption)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isVideo && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <PlayCircle className="w-14 h-14 text-white drop-shadow-xl" />
                  </div>
                )}
                {item.category && (
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>

              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="bg-white/95 text-blue-600 p-2 rounded-xl shadow hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {confirmDeleteId === item.id ? (
                    <button
                      onClick={() => {
                        deleteGalleryItem(item.id);
                        setConfirmDeleteId(null);
                      }}
                      className="bg-red-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-black shadow"
                    >
                      {lang === 'bn' ? 'নিশ্চিত' : 'Confirm'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="bg-white/95 text-red-500 p-2 rounded-xl shadow hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <div className="p-5 flex items-center justify-between gap-3">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm line-clamp-2">{t(item.caption)}</h3>
                <button
                  onClick={() => setPreviewItem(item)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-green-700 hover:text-white transition-colors shrink-0"
                  aria-label="Preview"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={() => setPreviewItem(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewItem.url || heroCampusImg}
              alt={t(previewItem.caption)}
              className="w-full max-h-[65vh] object-contain bg-slate-950"
            />
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
                  {previewItem.category || 'Campus'} • {previewItem.mediaType === 'video' ? 'Video Highlight' : 'Photo'}
                </p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{t(previewItem.caption)}</h3>
              </div>
              {previewItem.videoUrl && isSafeHttpUrl(previewItem.videoUrl) && (
                <a
                  href={previewItem.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-xs font-black hover:bg-green-800 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" /> {lang === 'bn' ? 'ভিডিও দেখুন' : 'Watch Video'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black">{editingItem ? 'Edit Media' : 'Add Photo / Video'}</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="w-full h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                  {photoBase64 ? (
                    <img src={photoBase64} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <ImageIcon className="text-slate-400 w-10 h-10" />
                  )}
                </div>
                <label className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                  <Upload className="w-4 h-4 inline mr-1.5" /> {lang === 'bn' ? 'ছবি / থাম্বনেইল দিন' : 'Choose Thumbnail / Photo'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await compressImageFile(file, 900, 0.72);
                        setPhotoBase64(compressed);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  name="mediaType"
                  defaultValue={editingItem?.mediaType || 'image'}
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option value="image">Photo (Image)</option>
                  <option value="video">Video Highlight</option>
                </select>
                <select
                  name="category"
                  defaultValue={editingItem?.category || 'Campus'}
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option value="Campus">Campus</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Lab">Science & IT Lab</option>
                  <option value="Tour">Study Tour</option>
                </select>
                <input
                  required
                  name="capBn"
                  defaultValue={editingItem?.caption?.bn}
                  placeholder="Caption (Bangla)"
                  className="sm:col-span-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="capEn"
                  defaultValue={editingItem?.caption?.en}
                  placeholder="Caption (English)"
                  className="sm:col-span-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  name="videoUrl"
                  defaultValue={editingItem?.videoUrl || ''}
                  placeholder="Optional Video Link (https://...)"
                  className="sm:col-span-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-green-800"
              >
                <Save className="w-4 h-4" /> {editingItem ? 'Update Media' : 'Save Media'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
