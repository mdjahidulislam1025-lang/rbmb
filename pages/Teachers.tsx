import * as React from 'react';
import { GraduationCap, Camera, Trash2, PlusCircle, ShieldCheck, X, Save, Upload, Pencil, IdCard } from 'lucide-react';
import { TRANSLATIONS, SCHOOL_NAME } from '../constants';
import { useApp } from '../App';
import { Teacher } from '../types';
import { compressImageFile } from '../utils/imageUtils';
import { TeacherIdCardModal } from '../components/TeacherIdCardModal';

const { useState, useRef } = React;

const Teachers: React.FC = () => {
  const { lang, t, user, teachers, addTeacher, updateTeacher, deleteTeacher, updateUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Teacher | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState('');
  const [selectedIdTeacher, setSelectedIdTeacher] = useState<{ teacher: Teacher; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';
  const canIssueTeacherId = isAdmin || user?.role === 'teacher';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 600, 0.75);
      setPhotoBase64(compressed);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setPhotoBase64('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingItem(teacher);
    setPhotoBase64(teacher.photo || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as {
      nameBn: HTMLInputElement;
      nameEn: HTMLInputElement;
      desigBn: HTMLInputElement;
      desigEn: HTMLInputElement;
      subBn: HTMLInputElement;
      subEn: HTMLInputElement;
      qualBn: HTMLInputElement;
      qualEn: HTMLInputElement;
    };

    const data: Teacher = {
      id: editingItem ? editingItem.id : `teach-${Date.now()}`,
      name: { bn: f.nameBn.value.trim(), en: f.nameEn.value.trim() },
      designation: { bn: f.desigBn.value.trim(), en: f.desigEn.value.trim() },
      subject: { bn: f.subBn.value.trim(), en: f.subEn.value.trim() },
      qualification: { bn: f.qualBn.value.trim(), en: f.qualEn.value.trim() },
      photo: photoBase64 || editingItem?.photo || '',
      isPublic: true,
    };

    if (editingItem) updateTeacher(data);
    else addTeacher(data);

    setIsModalOpen(false);
    setPhotoBase64('');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join('')
      .toUpperCase() || 'T';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
            {t(TRANSLATIONS.nav.teachers)}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
            Dedicated Educators of {t(SCHOOL_NAME)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canIssueTeacherId && teachers.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIdTeacher({ teacher: teachers[0], index: 0 })}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 px-5 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/60 shadow-sm transition-all"
            >
              <IdCard className="w-4 h-4" />
              {lang === 'bn' ? `শিক্ষক আইডি কার্ড (${teachers.length})` : `All Teacher ID Cards (${teachers.length})`}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-green-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-green-800 shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" /> {lang === 'bn' ? 'নতুন শিক্ষক যোগ করুন' : 'Add New Teacher'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teachers.map((teacher, idx) => {
          const displayName = t(teacher.name);
          return (
            <div
              key={teacher.id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group flex flex-col relative"
            >
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                  {confirmDeleteId === teacher.id ? (
                    <>
                      <button
                        onClick={() => {
                          deleteTeacher(teacher.id);
                          setConfirmDeleteId(null);
                        }}
                        className="bg-red-600 text-white px-2.5 py-1.5 rounded-xl shadow font-black text-xs"
                      >
                        {lang === 'bn' ? 'নিশ্চিত' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-white text-slate-700 px-2.5 py-1.5 rounded-xl shadow font-black text-xs"
                      >
                        {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenEdit(teacher)}
                        className="bg-blue-600 text-white p-2 rounded-xl shadow hover:bg-blue-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(teacher.id)}
                        className="bg-red-500 text-white p-2 rounded-xl shadow hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {teacher.photo ? (
                  <img
                    src={teacher.photo}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 flex flex-col items-center justify-center text-white p-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-3xl font-black">
                      {getInitials(teacher.name.en || displayName)}
                    </div>
                    <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                      {t(teacher.designation)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{displayName}</h3>
                  <p className="text-green-700 dark:text-green-400 font-black text-xs uppercase tracking-wider mt-1">
                    {t(teacher.subject)}
                  </p>
                </div>
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-green-50 dark:bg-green-950 p-1.5 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="line-clamp-1">{t(teacher.qualification)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="bg-green-50 dark:bg-green-950 p-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{t(teacher.designation)}</span>
                  </div>
                </div>
                {canIssueTeacherId && (
                  <button
                    type="button"
                    onClick={() => setSelectedIdTeacher({ teacher, index: idx })}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <IdCard className="w-4 h-4" />
                    {lang === 'bn' ? 'শিক্ষক আইডি কার্ড' : 'Teacher ID Card'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black">{editingItem ? 'Edit Teacher Details' : 'Add New Teacher'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                  {photoBase64 ? (
                    <img src={photoBase64} className="w-full h-full object-cover" alt="Teacher preview" />
                  ) : (
                    <Camera className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload Photo (Optional)
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  name="nameBn"
                  defaultValue={editingItem?.name?.bn}
                  placeholder="Name (Bangla)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="nameEn"
                  defaultValue={editingItem?.name?.en}
                  placeholder="Name (English)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="desigBn"
                  defaultValue={editingItem?.designation?.bn}
                  placeholder="Designation (Bangla)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="desigEn"
                  defaultValue={editingItem?.designation?.en}
                  placeholder="Designation (English)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="subBn"
                  defaultValue={editingItem?.subject?.bn}
                  placeholder="Subject (Bangla)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="subEn"
                  defaultValue={editingItem?.subject?.en}
                  placeholder="Subject (English)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="qualBn"
                  defaultValue={editingItem?.qualification?.bn}
                  placeholder="Qualification (Bangla)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="qualEn"
                  defaultValue={editingItem?.qualification?.en}
                  placeholder="Qualification (English)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-green-800"
              >
                <Save className="w-5 h-5" /> {editingItem ? 'Update Teacher' : 'Save Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedIdTeacher && (
        <TeacherIdCardModal
          open={Boolean(selectedIdTeacher)}
          onClose={() => setSelectedIdTeacher(null)}
          teacher={selectedIdTeacher.teacher}
          teacherIndex={selectedIdTeacher.index}
          allTeachers={teachers}
          onSavePhoto={
            isAdmin
              ? (teacherId, photoDataUrl) => {
                  const target = teachers.find((tc) => tc.id === teacherId);
                  if (target) updateTeacher({ ...target, photo: photoDataUrl });
                }
              : user?.role === 'teacher'
              ? (teacherId, photoDataUrl) => {
                  const target = teachers.find((tc) => tc.id === teacherId);
                  if (
                    target &&
                    (target.name.en.trim().toLowerCase() === user.name.trim().toLowerCase() ||
                      target.name.bn.trim().toLowerCase() === user.name.trim().toLowerCase())
                  ) {
                    updateUser({ ...user, photo: photoDataUrl });
                  }
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default Teachers;
