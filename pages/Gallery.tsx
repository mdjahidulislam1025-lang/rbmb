
import * as React from 'react';
import { Camera, Image as ImageIcon, ZoomIn, PlusCircle, X, Save, Upload, Pencil, Trash2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { GalleryItem } from '../types';
import { compressImageFile } from '../utils/imageUtils';

const { useState } = React;

const Gallery: React.FC = () => {
  const { lang, t, user, gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [photoBase64, setPhotoBase64] = useState('');

  const isAdmin = user?.role === 'admin';

  const handleOpenAdd = () => {
    setEditingItem(null);
    setPhotoBase64('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setPhotoBase64(item.url);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    const data: GalleryItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      caption: { bn: f.capBn.value, en: f.capEn.value },
      url: photoBase64 || editingItem?.url || 'https://picsum.photos/seed/gallery/800/600'
    };
    
    editingItem ? updateGalleryItem(data) : addGalleryItem(data);
    setIsModalOpen(false);
    setPhotoBase64('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-green-900 tracking-tight">{t(TRANSLATIONS.nav.gallery)}</h1>
          <p className="text-gray-500 max-w-2xl font-medium">Moments captured at our institution.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 shadow-xl transition-all">
            <PlusCircle className="w-5 h-5" /> {lang === 'bn' ? 'ছবি যোগ করুন' : 'Add Photo'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {gallery.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={item.url} alt={t(item.caption)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleOpenEdit(item)} className="bg-white text-blue-600 p-2.5 rounded-xl shadow-lg hover:bg-blue-50"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => deleteGalleryItem(item.id)} className="bg-white text-red-500 p-2.5 rounded-xl shadow-lg hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
              <h3 className="text-white font-bold text-lg">{t(item.caption)}</h3>
              <ZoomIn className="text-white/50 w-6 h-6 mt-2" />
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-green-700 p-8 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black">{editingItem ? 'Edit Photo' : 'Add New Photo'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-48 rounded-2xl bg-slate-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {photoBase64 ? <img src={photoBase64} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-200 w-12 h-12" />}
                </div>
                <label className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200">
                  <Upload className="w-4 h-4 inline mr-2" /> Choose Photo
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const compressed = await compressImageFile(file, 900, 0.72);
                      setPhotoBase64(compressed);
                    }
                  }} />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <input required name="capBn" defaultValue={editingItem?.caption?.bn} placeholder="Caption (BN)" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-gray-100 outline-none font-bold" />
                <input required name="capEn" defaultValue={editingItem?.caption?.en} placeholder="Caption (EN)" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-gray-100 outline-none font-bold" />
              </div>
              <button type="submit" className="w-full bg-green-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> {editingItem ? 'Update Photo' : 'Save Photo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
