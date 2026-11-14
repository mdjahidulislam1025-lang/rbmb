
import * as React from 'react';
import { Mail, GraduationCap, BookOpen, Camera, Trash2, PlusCircle, User, ShieldCheck, X, Save, Upload, Pencil } from 'lucide-react';
import { TRANSLATIONS, SCHOOL_NAME } from '../constants';
import { useApp } from '../App';
import { Teacher } from '../types';

const { useState, useRef } = React;

const Teachers: React.FC = () => {
  const { lang, t, user, teachers, addTeacher, updateTeacher, deleteTeacher } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Teacher | null>(null);
  const [photoBase64, setPhotoBase64] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = user?.role === 'admin';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setPhotoBase64('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingItem(teacher);
    setPhotoBase64(teacher.photo);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    
    const data: Teacher = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: { bn: f.nameBn.value, en: f.nameEn.value },
      designation: { bn: f.desigBn.value, en: f.desigEn.value },
      subject: { bn: f.subBn.value, en: f.subEn.value },
      qualification: { bn: f.qualBn.value, en: f.qualEn.value },
      photo: photoBase64 || editingItem?.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
    };
    
    editingItem ? updateTeacher(data) : addTeacher(data);
    setIsModalOpen(false);
    setPhotoBase64('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black text-green-900 tracking-tight">{t(TRANSLATIONS.nav.teachers)}</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Dedicated Educators of {t(SCHOOL_NAME)}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenAdd} 
            className="flex items-center gap-2 bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 shadow-xl transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5" /> Add New Teacher
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group flex flex-col relative">
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleOpenEdit(teacher)} 
                  className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl hover:bg-blue-700"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই শিক্ষককে ডিলিট করতে চান?' : 'Are you sure you want to remove this teacher?')) {
                      deleteTeacher(teacher.id);
                    }
                  }} 
                  className="bg-red-500 text-white p-3 rounded-2xl shadow-xl hover:bg-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="relative h-80 overflow-hidden bg-slate-50">
              <img 
                src={teacher.photo} 
                alt={t(teacher.name)} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-green-700 transition-colors leading-tight">{t(teacher.name)}</h3>
                <p className="text-green-700 font-black text-[10px] uppercase tracking-widest mt-1">{t(teacher.subject)}</p>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-50 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg"><GraduationCap className="w-4 h-4 text-green-600" /></div>
                  <span className="line-clamp-1">{t(teacher.qualification)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg"><ShieldCheck className="w-4 h-4 text-green-600" /></div>
                  <span>{t(teacher.designation)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in max-h-[90vh] flex flex-col">
            <div className="bg-green-700 p-8 text-white flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black">{editingItem ? 'Edit Teacher Details' : 'Add New Teacher'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="w-32 h-32 rounded-[2rem] bg-slate-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {photoBase64 ? <img src={photoBase64} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-gray-300" />}
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Change Photo
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Name (Bangla)</label>
                  <input required name="nameBn" defaultValue={editingItem?.name?.bn} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Name (English)</label>
                  <input required name="nameEn" defaultValue={editingItem?.name?.en} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Designation (Bangla)</label>
                  <input required name="desigBn" defaultValue={editingItem?.designation?.bn} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Designation (English)</label>
                  <input required name="desigEn" defaultValue={editingItem?.designation?.en} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Subject (Bangla)</label>
                  <input required name="subBn" defaultValue={editingItem?.subject?.bn} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Subject (English)</label>
                  <input required name="subEn" defaultValue={editingItem?.subject?.en} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Qualification (Bangla)</label>
                  <input required name="qualBn" defaultValue={editingItem?.qualification?.bn} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Qualification (English)</label>
                  <input required name="qualEn" defaultValue={editingItem?.qualification?.en} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border outline-none font-bold" />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-green-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-green-800 transition-all active:scale-95"
              >
                <Save className="w-6 h-6" /> {editingItem ? 'Update Teacher' : 'Save Teacher Data'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
