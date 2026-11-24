import * as React from 'react';
import {
  UserPlus,
  Users,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  BookOpen,
  Camera,
  User as UserIcon,
  Search,
  Award,
} from 'lucide-react';
import { useApp } from '../App';
import { compressImageFile } from '../utils/imageUtils';
import { findMatchingTeacher, isHeadTeacherDesignation } from '../utils/teacherRole';

const { useState, useMemo, useRef } = React;

interface UnifiedTeacherOption {
  key: string;
  teacherId?: string;
  userId?: string;
  cloudUid?: string;
  nameBn: string;
  nameEn: string;
  designation: string;
  subject: string;
  phone?: string;
  photo?: string;
  teacherCode?: string;
  assignedClass: string;
  isHead: boolean;
}

interface ClassTeacherAssignmentPanelProps {
  allowAddNew?: boolean;
  onNotify?: (msg: string) => void;
}

export const ClassTeacherAssignmentPanel: React.FC<ClassTeacherAssignmentPanelProps> = ({
  allowAddNew = false,
  onNotify,
}) => {
  const {
    lang,
    t,
    teachers,
    getUsers,
    cloudUsers,
    assignClassTeacher,
    addClassTeacherByAdmin,
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [createdInfo, setCreatedInfo] = useState<{
    name: string;
    teacherCode: string;
    assignedClass?: string;
  } | null>(null);
  const [formError, setFormError] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [newForm, setNewForm] = useState({
    nameBn: '',
    nameEn: '',
    designationBn: 'সহকারী শিক্ষক',
    designationEn: 'Assistant Teacher',
    subjectBn: '',
    subjectEn: '',
    qualificationBn: '',
    qualificationEn: '',
    phone: '',
    email: '',
    bloodGroup: '',
    assignedClass: '6',
    password: '',
  });

  const localUsers = getUsers();

  // Merge Teacher directory + local registered teachers + cloud teachers cleanly without duplicates
  const unifiedTeachers = useMemo<UnifiedTeacherOption[]>(() => {
    const list: UnifiedTeacherOption[] = [];

    teachers.forEach((tc) => {
      const assigned = (tc.assignedClass || '').trim();
      const isHead =
        isHeadTeacherDesignation(tc.designation?.bn) ||
        isHeadTeacherDesignation(tc.designation?.en);
      const matchedLocal = localUsers.find(
        (u) =>
          u.role === 'teacher' &&
          Boolean(findMatchingTeacher([tc], { userId: u.userId, name: u.name, phone: u.phone, role: u.role }))
      );
      list.push({
        key: `tc:${tc.id}`,
        teacherId: tc.id,
        userId: matchedLocal?.userId || tc.teacherCode,
        nameBn: tc.name.bn || tc.name.en,
        nameEn: tc.name.en || tc.name.bn,
        designation: t(tc.designation),
        subject: t(tc.subject),
        phone: tc.phone || matchedLocal?.phone,
        photo: tc.photo || matchedLocal?.photo,
        teacherCode: tc.teacherCode || matchedLocal?.userId,
        assignedClass: assigned || (!tc.assignedClass && tc.assignedClass !== '' ? matchedLocal?.assignedClass || '' : ''),
        isHead,
      });
    });

    localUsers
      .filter((u) => u.role === 'teacher')
      .forEach((u) => {
        const alreadyInDir = findMatchingTeacher(teachers, {
          userId: u.userId,
          name: u.name,
          phone: u.phone,
          role: u.role,
        });
        if (alreadyInDir) return;
        list.push({
          key: `lu:${u.userId}`,
          userId: u.userId,
          nameBn: u.name,
          nameEn: u.name,
          designation: u.designation || (lang === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teacher'),
          subject: u.subject || (lang === 'bn' ? 'সাধারণ' : 'General'),
          phone: u.phone,
          photo: u.photo,
          teacherCode: u.userId,
          assignedClass: (u.assignedClass || '').trim(),
          isHead: u.userId.toLowerCase() === 'headteacher' || isHeadTeacherDesignation(u.designation),
        });
      });

    cloudUsers
      .filter((cu) => cu.role === 'teacher')
      .forEach((cu) => {
        const alreadyInDir = findMatchingTeacher(teachers, {
          userId: cu.uid,
          name: cu.name,
          phone: cu.phone,
          role: cu.role,
        });
        const alreadyInLocal = list.some(
          (item) =>
            item.userId === cu.uid ||
            item.nameBn.trim().toLowerCase() === cu.name.trim().toLowerCase()
        );
        if (alreadyInDir || alreadyInLocal) return;
        list.push({
          key: `cu:${cu.uid}`,
          cloudUid: cu.uid,
          userId: cu.uid,
          nameBn: cu.name,
          nameEn: cu.name,
          designation: cu.designation || (lang === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teacher'),
          subject: cu.subject || (lang === 'bn' ? 'সাধারণ' : 'General'),
          phone: cu.phone,
          photo: cu.photo,
          assignedClass: (cu.assignedClass || '').trim(),
          isHead: isHeadTeacherDesignation(cu.designation),
        });
      });

    return list;
  }, [teachers, localUsers, cloudUsers, t, lang]);

  const filteredTeachers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return unifiedTeachers;
    return unifiedTeachers.filter(
      (item) =>
        item.nameBn.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.designation.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        (item.teacherCode || '').toLowerCase().includes(q) ||
        (item.phone || '').toLowerCase().includes(q)
    );
  }, [unifiedTeachers, searchTerm]);

  const notify = (msg: string) => {
    if (onNotify) onNotify(msg);
  };

  const handleAssign = async (
    item: UnifiedTeacherOption,
    classId: string,
    exclusiveForClass: boolean
  ) => {
    setSavingKey(`${item.key}:${classId}`);
    const res = await assignClassTeacher({
      teacherId: item.teacherId,
      userId: item.userId,
      cloudUid: item.cloudUid,
      classId,
      exclusiveForClass,
    });
    setSavingKey(null);
    if (!res.ok) {
      notify(res.error || (lang === 'bn' ? 'দায়িত্ব পরিবর্তন ব্যর্থ হয়েছে।' : 'Failed to assign class teacher.'));
      return;
    }
    const displayName = lang === 'bn' ? item.nameBn : item.nameEn;
    notify(
      classId
        ? lang === 'bn'
          ? `${displayName}-কে ${classId}ম শ্রেণীর শ্রেণী শিক্ষক নির্ধারণ করা হয়েছে।`
          : `Assigned ${displayName} as Class ${classId} Class Teacher.`
        : lang === 'bn'
        ? `${displayName}-এর শ্রেণী শিক্ষক দায়িত্ব সরানো হয়েছে।`
        : `Removed Class Teacher assignment from ${displayName}.`
    );
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreatedInfo(null);
    const res = await addClassTeacherByAdmin({
      nameBn: newForm.nameBn,
      nameEn: newForm.nameEn || newForm.nameBn,
      designationBn: newForm.designationBn || 'সহকারী শিক্ষক',
      designationEn: newForm.designationEn || newForm.designationBn || 'Assistant Teacher',
      subjectBn: newForm.subjectBn || 'সাধারণ',
      subjectEn: newForm.subjectEn || newForm.subjectBn || 'General',
      qualificationBn: newForm.qualificationBn || 'স্নাতকোত্তর',
      qualificationEn: newForm.qualificationEn || newForm.qualificationBn || 'Graduate',
      phone: newForm.phone,
      email: newForm.email,
      bloodGroup: newForm.bloodGroup,
      assignedClass: newForm.assignedClass,
      password: newForm.password || '123456',
      photo: formPhoto,
    });

    if (!res.ok) {
      setFormError(res.error || (lang === 'bn' ? 'যোগ করা যায়নি!' : 'Failed to add class teacher.'));
      return;
    }

    setCreatedInfo({
      name: newForm.nameBn.trim(),
      teacherCode: res.teacherCode || '',
      assignedClass: newForm.assignedClass,
    });
    notify(
      lang === 'bn'
        ? `নতুন শ্রেণী শিক্ষক "${newForm.nameBn.trim()}" যুক্ত হয়েছে!`
        : `Added new Class Teacher "${newForm.nameEn || newForm.nameBn}"!`
    );
    setNewForm({
      nameBn: '',
      nameEn: '',
      designationBn: 'সহকারী শিক্ষক',
      designationEn: 'Assistant Teacher',
      subjectBn: '',
      subjectEn: '',
      qualificationBn: '',
      qualificationEn: '',
      phone: '',
      email: '',
      bloodGroup: '',
      assignedClass: '6',
      password: '',
    });
    setFormPhoto('');
    setShowAddForm(false);
  };

  const applyDesignationPreset = (bn: string, en: string) => {
    setNewForm((prev) => ({ ...prev, designationBn: bn, designationEn: en }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            {lang === 'bn'
              ? 'অ্যাডমিন ও প্রধান শিক্ষক কর্তৃক নিয়ন্ত্রিত'
              : 'Managed by Admin & Head Teacher'}
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight">
            {lang === 'bn'
              ? 'শ্রেণী শিক্ষক যোগ ও শ্রেণীভিত্তিক দায়িত্ব নির্ধারণ (৬ষ্ঠ – ১০ম)'
              : 'Class Teacher Roster & Assignment (Classes 6 – 10)'}
          </h3>
          <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
            {allowAddNew
              ? lang === 'bn'
                ? 'অ্যাডমিন এখান থেকে সরাসরি নতুন শ্রেণী শিক্ষক যোগ করতে পারবেন এবং অ্যাডমিন ও প্রধান শিক্ষক ঠিক করবেন কোন শিক্ষক কোন শ্রেণীর শ্রেণী শিক্ষক হবেন।'
                : 'Add new Class Teachers directly and assign which teacher serves as the Class Teacher for each class (6–10).'
              : lang === 'bn'
              ? 'প্রধান শিক্ষক ও অ্যাডমিন এখান থেকে নির্ধারণ করবেন কোন শিক্ষক কোন শ্রেণীর (৬ষ্ঠ–১০ম) শ্রেণী শিক্ষক হিসেবে দায়িত্ব পালন করবেন।'
              : 'As Head Teacher, assign or update which faculty member is the Class Teacher for Classes 6–10.'}
          </p>
        </div>
        {allowAddNew && (
          <button
            type="button"
            onClick={() => setShowAddForm((p) => !p)}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs inline-flex items-center gap-2 shadow-sm shrink-0 transition-colors"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {showAddForm
                ? lang === 'bn'
                  ? 'ফরম বন্ধ করুন'
                  : 'Close Form'
                : lang === 'bn'
                ? 'নতুন শ্রেণী শিক্ষক যোগ করুন'
                : 'Add Class Teacher'}
            </span>
          </button>
        )}
      </div>

      {/* Created Credentials Banner */}
      {createdInfo && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold">
                {lang === 'bn'
                  ? `${createdInfo.name} সফলভাবে যুক্ত হয়েছেন!`
                  : `${createdInfo.name} has been added!`}
              </p>
              <p className="text-[11px] font-semibold opacity-90">
                {lang === 'bn' ? 'শিক্ষক লগইন আইডি:' : 'Teacher Login ID:'}{' '}
                <span className="font-mono-code font-black">{createdInfo.teacherCode}</span>
                {createdInfo.assignedClass ? ` • Class ${createdInfo.assignedClass}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreatedInfo(null)}
            className="p-1.5 rounded-lg hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Add New Class Teacher Form */}
      {allowAddNew && showAddForm && (
        <form
          onSubmit={handleCreateTeacher}
          className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-emerald-200 dark:border-emerald-900 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {lang === 'bn'
                ? 'নতুন শ্রেণী শিক্ষক নিবন্ধন (Admin)'
                : 'Add New Class Teacher (Creates Faculty Profile + Login + ID Card)'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { bn: 'সহকারী শিক্ষক', en: 'Assistant Teacher' },
                { bn: 'সিনিয়র শিক্ষক', en: 'Senior Teacher' },
                { bn: 'প্রধান শিক্ষক', en: 'Head Teacher' },
              ].map((preset) => (
                <button
                  key={preset.en}
                  type="button"
                  onClick={() => applyDesignationPreset(preset.bn, preset.en)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    newForm.designationBn === preset.bn
                      ? 'bg-emerald-700 border-emerald-700 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {lang === 'bn' ? preset.bn : preset.en}
                </button>
              ))}
            </div>
          </div>

          {formError && (
            <p className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-xl">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'শিক্ষকের নাম (বাংলায়) *' : 'Teacher Name (BN) *'}
              </label>
              <input
                required
                value={newForm.nameBn}
                onChange={(e) => setNewForm((p) => ({ ...p, nameBn: e.target.value }))}
                placeholder="যেমন: মোঃ কামরুল হাসান"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'নাম (ইংরেজিতে)' : 'Teacher Name (EN)'}
              </label>
              <input
                value={newForm.nameEn}
                onChange={(e) => setNewForm((p) => ({ ...p, nameEn: e.target.value }))}
                placeholder="Md. Kamrul Hasan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'দায়িত্বপ্রাপ্ত শ্রেণী (Class Teacher) *' : 'Assigned Class *'}
              </label>
              <select
                value={newForm.assignedClass}
                onChange={(e) => setNewForm((p) => ({ ...p, assignedClass: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-sm font-extrabold text-emerald-800 dark:text-emerald-300"
              >
                <option value="">{lang === 'bn' ? 'নির্ধারিত নয় (সাধারণ শিক্ষক)' : 'Unassigned'}</option>
                {['6', '7', '8', '9', '10'].map((c) => (
                  <option key={c} value={c}>
                    {lang === 'bn' ? `${c}ম শ্রেণী (Class ${c})` : `Class ${c}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'পদবী (বাংলা) *' : 'Designation (BN) *'}
              </label>
              <input
                required
                value={newForm.designationBn}
                onChange={(e) => setNewForm((p) => ({ ...p, designationBn: e.target.value }))}
                placeholder="সহকারী শিক্ষক"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'পদবী (ইংরেজি)' : 'Designation (EN)'}
              </label>
              <input
                value={newForm.designationEn}
                onChange={(e) => setNewForm((p) => ({ ...p, designationEn: e.target.value }))}
                placeholder="Assistant Teacher"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'পাঠদানের বিষয় *' : 'Subject *'}
              </label>
              <input
                required
                value={newForm.subjectBn}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, subjectBn: e.target.value, subjectEn: e.target.value }))
                }
                placeholder="গণিত / বিজ্ঞান / ইংরেজি"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'শিক্ষাগত যোগ্যতা' : 'Qualification'}
              </label>
              <input
                value={newForm.qualificationBn}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    qualificationBn: e.target.value,
                    qualificationEn: e.target.value,
                  }))
                }
                placeholder="M.Sc, B.Ed"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
              </label>
              <input
                value={newForm.phone}
                onChange={(e) => setNewForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="017XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {lang === 'bn' ? 'পোর্টাল লগইন পাসওয়ার্ড' : 'Portal Login Password'}
              </label>
              <input
                type="text"
                value={newForm.password}
                onChange={(e) => setNewForm((p) => ({ ...p, password: e.target.value }))}
                placeholder={lang === 'bn' ? 'ডিফল্ট: 123456' : 'Default: 123456'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                {formPhoto
                  ? lang === 'bn'
                    ? 'ছবি পরিবর্তিত'
                    : 'Photo Selected'
                  : lang === 'bn'
                  ? 'ছবি আপলোড (ঐচ্ছিক)'
                  : 'Upload Photo (Optional)'}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setFormPhoto(await compressImageFile(f, 500, 0.78));
                }}
              />
              {formPhoto && (
                <img
                  src={formPhoto}
                  alt="Preview"
                  className="w-9 h-9 rounded-lg object-cover border border-emerald-400"
                />
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold inline-flex items-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              {lang === 'bn' ? 'শ্রেণী শিক্ষক সংরক্ষণ করুন' : 'Save Class Teacher'}
            </button>
          </div>
        </form>
      )}

      {/* Class 6 - 10 Assignment Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            {lang === 'bn'
              ? 'কোন শিক্ষক কোন শ্রেণীর শ্রেণী শিক্ষক হবেন (Class 6 – 10)'
              : 'Assign Class Teacher per Class (Classes 6 – 10)'}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['6', '7', '8', '9', '10'] as const).map((cid) => {
            const assignedList = unifiedTeachers.filter((item) => item.assignedClass === cid);
            return (
              <div
                key={cid}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                      {lang === 'bn' ? `${cid}ম শ্রেণী (Class ${cid})` : `Class ${cid}`}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                      {assignedList.length > 0
                        ? `${assignedList.length} ${lang === 'bn' ? 'জন নির্ধারিত' : 'assigned'}`
                        : lang === 'bn'
                        ? 'খালি'
                        : 'Open'}
                    </span>
                  </div>

                  {assignedList.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-dashed border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-semibold">
                      {lang === 'bn'
                        ? 'এখনো এই শ্রেণীর শিক্ষক নির্ধারিত হয়নি।'
                        : 'No Class Teacher assigned yet.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {assignedList.map((assignedItem) => (
                        <div
                          key={assignedItem.key}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 overflow-hidden flex items-center justify-center shrink-0">
                              {assignedItem.photo ? (
                                <img
                                  src={assignedItem.photo}
                                  alt={assignedItem.nameEn}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserIcon className="w-4 h-4 text-emerald-700" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                {lang === 'bn' ? assignedItem.nameBn : assignedItem.nameEn}
                              </p>
                              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                                {assignedItem.designation}
                                {assignedItem.phone ? ` · ${assignedItem.phone}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleAssign(assignedItem, '', false)}
                            disabled={savingKey !== null}
                            title={lang === 'bn' ? 'দায়িত্ব থেকে সরান' : 'Unassign'}
                            className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 text-[10px] font-bold shrink-0"
                          >
                            {lang === 'bn' ? 'সরান' : 'Remove'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    {lang === 'bn'
                      ? 'শ্রেণী শিক্ষক নির্বাচন / পরিবর্তন করুন'
                      : 'Set / Change Class Teacher'}
                  </label>
                  <select
                    value={assignedList[0]?.key || ''}
                    disabled={savingKey !== null}
                    onChange={(e) => {
                      const selected = unifiedTeachers.find((u) => u.key === e.target.value);
                      if (selected) {
                        void handleAssign(selected, cid, true);
                      } else if (assignedList[0]) {
                        void handleAssign(assignedList[0], '', false);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="">
                      {lang === 'bn' ? '-- শিক্ষক নির্বাচন করুন --' : '-- Select Teacher --'}
                    </option>
                    {unifiedTeachers.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {lang === 'bn' ? opt.nameBn : opt.nameEn}
                        {opt.isHead
                          ? lang === 'bn'
                            ? ' (প্রধান শিক্ষক)'
                            : ' (Head Teacher)'
                          : opt.assignedClass
                          ? ` [Class ${opt.assignedClass}]`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Teacher Roster & Individual Class Selector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {lang === 'bn'
                ? `সকল শিক্ষক ও দায়িত্ব তালিকা (${unifiedTeachers.length})`
                : `All Teachers & Assigned Class (${unifiedTeachers.length})`}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? 'যে কোনো শিক্ষকের পাশের ড্রপডাউন থেকে সরাসরি শ্রেণী পরিবর্তন বা খালি করতে পারবেন।'
                : 'Quickly assign, update, or clear any teacher’s assigned class directly.'}
            </p>
          </div>
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'bn' ? 'শিক্ষকের নাম বা বিষয় খুঁজুন...' : 'Search teacher or subject...'}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTeachers.map((item) => (
            <div
              key={item.key}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 overflow-hidden flex items-center justify-center shrink-0">
                  {item.photo ? (
                    <img src={item.photo} alt={item.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-emerald-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {lang === 'bn' ? item.nameBn : item.nameEn}
                    </p>
                    {item.isHead && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                        {lang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex flex-wrap items-center gap-x-2">
                    <span>{item.designation}</span>
                    {item.subject && (
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {item.subject}
                      </span>
                    )}
                    {item.phone && (
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Phone className="w-3 h-3" /> {item.phone}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={item.assignedClass}
                  disabled={savingKey !== null}
                  onChange={(e) => void handleAssign(item, e.target.value, false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${
                    item.assignedClass
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <option value="">{lang === 'bn' ? 'নির্ধারিত নয়' : 'Unassigned'}</option>
                  {['6', '7', '8', '9', '10'].map((c) => (
                    <option key={c} value={c}>
                      {lang === 'bn' ? `${c}ম শ্রেণী (Class ${c})` : `Class ${c}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
