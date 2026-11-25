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
  Check,
  Layers,
} from 'lucide-react';
import { useApp } from '../App';
import { compressImageFile } from '../utils/imageUtils';
import {
  CANONICAL_SUBJECTS,
  SCHOOL_CLASS_IDS,
  findMatchingTeacher,
  inferCanonicalSubjectsFromText,
  isHeadTeacherDesignation,
  normalizeTeachingClasses,
  normalizeTeachingSubjects,
} from '../utils/teacherRole';

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
  teachingClasses: string[];
  teachingSubjects: string[];
  isHead: boolean;
}

interface ClassTeacherAssignmentPanelProps {
  allowAddNew?: boolean;
  onNotify?: (msg: string) => void;
}

const ROLE_PRESETS = [
  { bn: 'সহকারী শিক্ষক', en: 'Assistant Teacher' },
  { bn: 'সিনিয়র শিক্ষক', en: 'Senior Teacher' },
  { bn: 'সহকারী প্রধান শিক্ষক', en: 'Assistant Head Teacher' },
  { bn: 'প্রধান শিক্ষক', en: 'Head Teacher' },
];

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
    assignTeacherDuties,
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
    teachingClasses: [...SCHOOL_CLASS_IDS] as string[],
    teachingSubjects: [] as string[],
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
      const resolvedClasses = Array.isArray(tc.teachingClasses)
        ? normalizeTeachingClasses(tc.teachingClasses)
        : Array.isArray(matchedLocal?.teachingClasses)
        ? normalizeTeachingClasses(matchedLocal.teachingClasses)
        : [...SCHOOL_CLASS_IDS];
      const resolvedSubjects = Array.isArray(tc.teachingSubjects)
        ? normalizeTeachingSubjects(tc.teachingSubjects)
        : Array.isArray(matchedLocal?.teachingSubjects)
        ? normalizeTeachingSubjects(matchedLocal.teachingSubjects)
        : inferCanonicalSubjectsFromText(`${tc.subject?.en || ''} ${tc.subject?.bn || ''} ${matchedLocal?.subject || ''}`);

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
        teachingClasses: resolvedClasses,
        teachingSubjects: resolvedSubjects,
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
          teachingClasses: Array.isArray(u.teachingClasses)
            ? normalizeTeachingClasses(u.teachingClasses)
            : [...SCHOOL_CLASS_IDS],
          teachingSubjects: Array.isArray(u.teachingSubjects)
            ? normalizeTeachingSubjects(u.teachingSubjects)
            : inferCanonicalSubjectsFromText(u.subject),
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
          teachingClasses: Array.isArray(cu.teachingClasses)
            ? normalizeTeachingClasses(cu.teachingClasses)
            : [...SCHOOL_CLASS_IDS],
          teachingSubjects: Array.isArray(cu.teachingSubjects)
            ? normalizeTeachingSubjects(cu.teachingSubjects)
            : inferCanonicalSubjectsFromText(cu.subject),
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

  const handleAssignClassTeacher = async (
    item: UnifiedTeacherOption,
    classId: string,
    exclusiveForClass: boolean
  ) => {
    setSavingKey(`${item.key}:ct:${classId}`);
    const res = await assignTeacherDuties({
      teacherId: item.teacherId,
      userId: item.userId,
      cloudUid: item.cloudUid,
      assignedClass: classId,
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

  const handleToggleTeachingClass = async (item: UnifiedTeacherOption, cid: string) => {
    const exists = item.teachingClasses.includes(cid);
    const nextClasses = exists
      ? item.teachingClasses.filter((c) => c !== cid)
      : normalizeTeachingClasses([...item.teachingClasses, cid]);
    setSavingKey(`${item.key}:tc:${cid}`);
    const res = await assignTeacherDuties({
      teacherId: item.teacherId,
      userId: item.userId,
      cloudUid: item.cloudUid,
      teachingClasses: nextClasses,
    });
    setSavingKey(null);
    if (!res.ok) {
      notify(res.error || (lang === 'bn' ? 'শ্রেণী আপডেট ব্যর্থ হয়েছে।' : 'Failed to update teaching classes.'));
      return;
    }
    const displayName = lang === 'bn' ? item.nameBn : item.nameEn;
    notify(
      lang === 'bn'
        ? `${displayName}-এর পাঠদানের শ্রেণী (${nextClasses.length > 0 ? nextClasses.join(', ') : 'কোনোটিই নয়'}) সংরক্ষিত হয়েছে।`
        : `Updated teaching classes for ${displayName}.`
    );
  };

  const handleSetAllTeachingClasses = async (item: UnifiedTeacherOption, selectAll: boolean) => {
    const nextClasses = selectAll ? [...SCHOOL_CLASS_IDS] : item.assignedClass ? [item.assignedClass] : [];
    setSavingKey(`${item.key}:tcall`);
    const res = await assignTeacherDuties({
      teacherId: item.teacherId,
      userId: item.userId,
      cloudUid: item.cloudUid,
      teachingClasses: nextClasses,
    });
    setSavingKey(null);
    if (!res.ok) {
      notify(res.error || (lang === 'bn' ? 'শ্রেণী আপডেট ব্যর্থ হয়েছে।' : 'Failed to update classes.'));
      return;
    }
    const displayName = lang === 'bn' ? item.nameBn : item.nameEn;
    notify(
      selectAll
        ? lang === 'bn'
          ? `${displayName} এখন সকল শ্রেণীর (৬ষ্ঠ–১০ম) ক্লাস নিতে পারবেন।`
          : `${displayName} can now take all classes (6–10).`
        : lang === 'bn'
        ? `${displayName}-এর পাঠদানের শ্রেণী রিসেট করা হয়েছে।`
        : `Cleared extra teaching classes for ${displayName}.`
    );
  };

  const handleToggleTeachingSubject = async (item: UnifiedTeacherOption, subId: string) => {
    const exists = item.teachingSubjects.some((s) => s.toLowerCase() === subId.toLowerCase());
    const nextSubjects = exists
      ? item.teachingSubjects.filter((s) => s.toLowerCase() !== subId.toLowerCase())
      : normalizeTeachingSubjects([...item.teachingSubjects, subId]);
    setSavingKey(`${item.key}:sub:${subId}`);
    const res = await assignTeacherDuties({
      teacherId: item.teacherId,
      userId: item.userId,
      cloudUid: item.cloudUid,
      teachingSubjects: nextSubjects,
    });
    setSavingKey(null);
    if (!res.ok) {
      notify(res.error || (lang === 'bn' ? 'বিষয় আপডেট ব্যর্থ হয়েছে।' : 'Failed to update subjects.'));
      return;
    }
    const displayName = lang === 'bn' ? item.nameBn : item.nameEn;
    notify(
      lang === 'bn'
        ? `${displayName}-এর নম্বর এন্ট্রির বিষয় (${nextSubjects.join(', ') || 'কোনোটিই নয়'}) সেভ হয়েছে।`
        : `Updated teaching subjects for ${displayName}.`
    );
  };

  const handleRoleChangeByAdmin = async (item: UnifiedTeacherOption, bn: string, en: string) => {
    setSavingKey(`${item.key}:role`);
    const res = await assignTeacherDuties({
      teacherId: item.teacherId,
      userId: item.userId,
      cloudUid: item.cloudUid,
      designationBn: bn,
      designationEn: en,
    });
    setSavingKey(null);
    if (!res.ok) {
      notify(res.error || (lang === 'bn' ? 'রোল পরিবর্তন ব্যর্থ হয়েছে।' : 'Failed to update teacher role.'));
      return;
    }
    const displayName = lang === 'bn' ? item.nameBn : item.nameEn;
    notify(
      lang === 'bn'
        ? `${displayName}-এর পদবী/রোল "${bn}"-এ পরিবর্তন করা হয়েছে।`
        : `Changed ${displayName}'s role to ${en}.`
    );
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreatedInfo(null);

    const effectiveSubText =
      newForm.subjectBn.trim() ||
      newForm.teachingSubjects.join(', ') ||
      'সাধারণ';

    const res = await addClassTeacherByAdmin({
      nameBn: newForm.nameBn,
      nameEn: newForm.nameEn || newForm.nameBn,
      designationBn: newForm.designationBn || 'সহকারী শিক্ষক',
      designationEn: newForm.designationEn || newForm.designationBn || 'Assistant Teacher',
      subjectBn: effectiveSubText,
      subjectEn: newForm.subjectEn || effectiveSubText,
      qualificationBn: newForm.qualificationBn || 'স্নাতকোত্তর',
      qualificationEn: newForm.qualificationEn || newForm.qualificationBn || 'Graduate',
      phone: newForm.phone,
      email: newForm.email,
      bloodGroup: newForm.bloodGroup,
      assignedClass: newForm.assignedClass,
      teachingClasses: newForm.teachingClasses,
      teachingSubjects: newForm.teachingSubjects,
      password: newForm.password || '123456',
      photo: formPhoto,
    });

    if (!res.ok) {
      setFormError(res.error || (lang === 'bn' ? 'যোগ করা যায়নি!' : 'Failed to add teacher.'));
      return;
    }

    setCreatedInfo({
      name: newForm.nameBn.trim(),
      teacherCode: res.teacherCode || '',
      assignedClass: newForm.assignedClass,
    });
    notify(
      lang === 'bn'
        ? `নতুন শিক্ষক "${newForm.nameBn.trim()}" যুক্ত হয়েছে!`
        : `Added new teacher "${newForm.nameEn || newForm.nameBn}"!`
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
      teachingClasses: [...SCHOOL_CLASS_IDS],
      teachingSubjects: [],
      password: '',
    });
    setFormPhoto('');
    setShowAddForm(false);
  };

  const toggleNewFormClass = (cid: string) => {
    setNewForm((prev) => {
      const exists = prev.teachingClasses.includes(cid);
      const next = exists
        ? prev.teachingClasses.filter((c) => c !== cid)
        : normalizeTeachingClasses([...prev.teachingClasses, cid]);
      return { ...prev, teachingClasses: next };
    });
  };

  const toggleNewFormSubject = (subId: string) => {
    setNewForm((prev) => {
      const exists = prev.teachingSubjects.includes(subId);
      const next = exists
        ? prev.teachingSubjects.filter((s) => s !== subId)
        : [...prev.teachingSubjects, subId];
      return {
        ...prev,
        teachingSubjects: next,
        subjectBn: next.join(', ') || prev.subjectBn,
        subjectEn: next.join(', ') || prev.subjectEn,
      };
    });
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
              ? 'শ্রেণী শিক্ষক, পাঠদানের শ্রেণী ও বিষয় নির্ধারণ (৬ষ্ঠ – ১০ম)'
              : 'Class Teacher, Teaching Classes & Subject Assignment (6 – 10)'}
          </h3>
          <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
            {allowAddNew
              ? lang === 'bn'
                ? 'অ্যাডমিন এখান থেকে নতুন শিক্ষক যোগ করতে ও শিক্ষকের রোল পরিবর্তন করতে পারবেন। অ্যাডমিন ও প্রধান শিক্ষক ঠিক করবেন কোন শিক্ষক কোন কোন শ্রেণীর (সব বা ১/২/৩টি) ক্লাস নিবেন, কোন বিষয়ের নম্বর এন্ট্রি দিবেন এবং কোন শ্রেণীর শ্রেণী শিক্ষক হবেন।'
                : 'Add teachers, change roles, assign Class Teachers, and choose which classes (all or 1, 2, 3...) and subjects each teacher teaches.'
              : lang === 'bn'
              ? 'প্রধান শিক্ষক এখান থেকে নির্ধারণ করবেন কোন শিক্ষক কোন শ্রেণীর শ্রেণী শিক্ষক হবেন এবং কোন কোন শ্রেণীর (সব অথবা ১, ২, ৩টি) কোন বিষয়ের ক্লাস নিবেন ও নম্বর এন্ট্রি দিবেন।'
              : 'As Head Teacher, assign Class Teachers and configure which classes and subjects each teacher handles.'}
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
                ? 'নতুন শিক্ষক / শ্রেণী শিক্ষক যোগ'
                : 'Add Class / Subject Teacher'}
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
                {createdInfo.assignedClass ? ` • Class Teacher: Class ${createdInfo.assignedClass}` : ''}
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

      {/* Admin Add New Teacher Form */}
      {allowAddNew && showAddForm && (
        <form
          onSubmit={handleCreateTeacher}
          className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-emerald-200 dark:border-emerald-900 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {lang === 'bn'
                ? 'নতুন শিক্ষক / শ্রেণী শিক্ষক নিবন্ধন (Admin)'
                : 'Add New Teacher (Creates Profile + Login + ID Card)'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_PRESETS.map((preset) => (
                <button
                  key={preset.en}
                  type="button"
                  onClick={() =>
                    setNewForm((p) => ({ ...p, designationBn: preset.bn, designationEn: preset.en }))
                  }
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
                {lang === 'bn' ? 'শ্রেণী শিক্ষক (কোন শ্রেণীর?)' : 'Class Teacher Role'}
              </label>
              <select
                value={newForm.assignedClass}
                onChange={(e) => setNewForm((p) => ({ ...p, assignedClass: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-sm font-extrabold text-emerald-800 dark:text-emerald-300"
              >
                <option value="">{lang === 'bn' ? 'নির্ধারিত নয় (শুধু বিষয় শিক্ষক)' : 'Subject Teacher Only'}</option>
                {SCHOOL_CLASS_IDS.map((c) => (
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
                {lang === 'bn' ? 'বিষয় পরিচিতি (কাস্টম বা নিচ থেকে বাছুন)' : 'Subject Display Label'}
              </label>
              <input
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

          {/* Multi-select Teaching Classes & Subjects for New Teacher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                  {lang === 'bn' ? 'কোন কোন শ্রেণীতে ক্লাস নিবেন (সব বা ১, ২, ৩টি):' : 'Teaching Classes (All or Subset):'}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNewForm((p) => ({
                      ...p,
                      teachingClasses:
                        p.teachingClasses.length === SCHOOL_CLASS_IDS.length ? [] : [...SCHOOL_CLASS_IDS],
                    }))
                  }
                  className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {newForm.teachingClasses.length === SCHOOL_CLASS_IDS.length
                    ? lang === 'bn'
                      ? 'সব ক্লিয়ার'
                      : 'Clear All'
                    : lang === 'bn'
                    ? 'সব শ্রেণী সিলেক্ট'
                    : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SCHOOL_CLASS_IDS.map((cid) => {
                  const selected = newForm.teachingClasses.includes(cid);
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => toggleNewFormClass(cid)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold inline-flex items-center gap-1 transition-colors ${
                        selected
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      Class {cid}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                  {lang === 'bn' ? 'কোন বিষয়ের নম্বর এন্ট্রি দিবেন:' : 'Allowed Subjects for Marks Entry:'}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNewForm((p) => ({
                      ...p,
                      teachingSubjects:
                        p.teachingSubjects.length === CANONICAL_SUBJECTS.length
                          ? []
                          : CANONICAL_SUBJECTS.map((s) => s.id),
                    }))
                  }
                  className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {newForm.teachingSubjects.length === CANONICAL_SUBJECTS.length
                    ? lang === 'bn'
                      ? 'সব ক্লিয়ার'
                      : 'Clear'
                    : lang === 'bn'
                    ? 'সব বিষয়'
                    : 'All Subjects'}
                </button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(
                  [
                    { key: 'common', bn: '৬ষ্ঠ–৮ম ও আবশ্যিক বিষয়', en: 'Class 6–8 & Common' },
                    { key: 'science', bn: 'বিজ্ঞান বিভাগ (৯ম–১০ম)', en: 'Science Group (9–10)' },
                    { key: 'humanities', bn: 'মানবিক বিভাগ (৯ম–১০ম)', en: 'Humanities Group (9–10)' },
                    { key: 'business', bn: 'ব্যবসায় শিক্ষা (৯ম–১০ম)', en: 'Business Studies (9–10)' },
                  ] as const
                ).map((cat) => {
                  const items = CANONICAL_SUBJECTS.filter((s) => s.category === cat.key);
                  return (
                    <div key={cat.key} className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? cat.bn : cat.en}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {items.map((sub) => {
                          const selected = newForm.teachingSubjects.includes(sub.id);
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => toggleNewFormSubject(sub.id)}
                              className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1 transition-colors ${
                                selected
                                  ? 'bg-purple-700 border-purple-700 text-white'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {selected && <Check className="w-3 h-3" />}
                              <span>{lang === 'bn' ? sub.bn : sub.en}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
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
              {lang === 'bn' ? 'শিক্ষক সংরক্ষণ করুন' : 'Save Teacher'}
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
          {SCHOOL_CLASS_IDS.map((cid) => {
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
                            onClick={() => void handleAssignClassTeacher(assignedItem, '', false)}
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
                        void handleAssignClassTeacher(selected, cid, true);
                      } else if (assignedList[0]) {
                        void handleAssignClassTeacher(assignedList[0], '', false);
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

      {/* Full Teacher Roster: Class Teacher + Teaching Classes (All or 1/2/3) + Subject Marks Permissions + Role */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {lang === 'bn'
                ? `শিক্ষকদের পাঠদানের শ্রেণী, বিষয় ও রোল ব্যবস্থাপনা (${unifiedTeachers.length})`
                : `Teachers — Classes, Subjects & Role Management (${unifiedTeachers.length})`}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? 'প্রতিটি শিক্ষক কোন কোন শ্রেণীতে ক্লাস নিবেন (সব বা ১, ২, ৩টি) এবং কোন কোন বিষয়ে নম্বর এন্ট্রি দিতে পারবেন তা এখান থেকে নির্ধারণ করুন।'
                : 'Choose which classes (All or specific 1, 2, 3...) and subjects each teacher teaches & enters marks for.'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTeachers.map((item) => {
            const allClassesSelected = item.teachingClasses.length === SCHOOL_CLASS_IDS.length;
            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 overflow-hidden flex items-center justify-center shrink-0">
                      {item.photo ? (
                        <img src={item.photo} alt={item.nameEn} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-emerald-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
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

                  {/* Class Teacher Role Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={item.assignedClass}
                      disabled={savingKey !== null}
                      onChange={(e) => void handleAssignClassTeacher(item, e.target.value, false)}
                      title={lang === 'bn' ? 'শ্রেণী শিক্ষক (সকল বিষয়ের নম্বর)' : 'Class Teacher Assignment'}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${
                        item.assignedClass
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <option value="">
                        {lang === 'bn' ? 'শ্রেণী শিক্ষক: নেই (বিষয় শিক্ষক)' : 'Class Teacher: None'}
                      </option>
                      {SCHOOL_CLASS_IDS.map((c) => (
                        <option key={c} value={c}>
                          {lang === 'bn' ? `শ্রেণী শিক্ষক: ${c}ম শ্রেণী` : `Class Teacher: Class ${c}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Multi-Class Selection (All or 1, 2, 3...) */}
                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      {lang === 'bn' ? 'যেসব শ্রেণীর ক্লাস নিবেন:' : 'Classes Taught:'}
                    </span>
                    <button
                      type="button"
                      disabled={savingKey !== null}
                      onClick={() => void handleSetAllTeachingClasses(item, !allClassesSelected)}
                      className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      {allClassesSelected
                        ? lang === 'bn'
                          ? 'শুধু নিজ শ্রেণী রাখুন'
                          : 'Reset Extra Classes'
                        : lang === 'bn'
                        ? 'সব শ্রেণী সিলেক্ট করুন (৬–১০)'
                        : 'Select All (6–10)'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SCHOOL_CLASS_IDS.map((cid) => {
                      const active = item.teachingClasses.includes(cid);
                      const isOwnClassTeacher = item.assignedClass === cid;
                      return (
                        <button
                          key={cid}
                          type="button"
                          disabled={savingKey !== null || isOwnClassTeacher}
                          onClick={() => void handleToggleTeachingClass(item, cid)}
                          title={
                            isOwnClassTeacher
                              ? lang === 'bn'
                                ? 'শ্রেণী শিক্ষক হিসেবে নির্ধারিত শ্রেণী'
                                : 'Assigned Class Teacher class'
                              : undefined
                          }
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1 transition-colors ${
                            active
                              ? 'bg-emerald-700 border-emerald-700 text-white'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {active && <Check className="w-3 h-3" />}
                          <span>Class {cid}</span>
                          {isOwnClassTeacher && <span className="text-[9px] opacity-90">(CT)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Multi-Subject Marks Entry Permission */}
                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {lang === 'bn'
                      ? 'যে বিষয়ের নম্বর এন্ট্রি দিবেন (নিজ শ্রেণী ছাড়া অন্য শ্রেণীতে):'
                      : 'Assigned Subjects (For Marks Entry in Teaching Classes):'}
                  </span>
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {(
                      [
                        { key: 'common', bn: '৬ষ্ঠ–৮ম ও আবশ্যিক', en: 'Common / 6–8' },
                        { key: 'science', bn: 'বিজ্ঞান (৯ম–১০ম)', en: 'Science' },
                        { key: 'humanities', bn: 'মানবিক (৯ম–১০ম)', en: 'Humanities' },
                        { key: 'business', bn: 'ব্যবসায় শিক্ষা (৯ম–১০ম)', en: 'Business Studies' },
                      ] as const
                    ).map((cat) => (
                      <div key={cat.key} className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400">
                          {lang === 'bn' ? cat.bn : cat.en}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {CANONICAL_SUBJECTS.filter((s) => s.category === cat.key).map((sub) => {
                            const active = item.teachingSubjects.some(
                              (s) => s.toLowerCase() === sub.id.toLowerCase()
                            );
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                disabled={savingKey !== null}
                                onClick={() => void handleToggleTeachingSubject(item, sub.id)}
                                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                                  active
                                    ? 'bg-purple-700 border-purple-700 text-white'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {active && <Check className="w-2.5 h-2.5" />}
                                <span>{lang === 'bn' ? sub.bn : sub.en}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin-Only Teacher Role Switcher */}
                {allowAddNew && (
                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'অ্যাডমিন রোল পরিবর্তন:' : 'Admin Role Control:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ROLE_PRESETS.map((preset) => {
                        const isCur =
                          item.designation.trim().toLowerCase() === preset.bn.toLowerCase() ||
                          item.designation.trim().toLowerCase() === preset.en.toLowerCase() ||
                          (preset.en === 'Head Teacher' && item.isHead);
                        return (
                          <button
                            key={preset.en}
                            type="button"
                            disabled={savingKey !== null}
                            onClick={() => void handleRoleChangeByAdmin(item, preset.bn, preset.en)}
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors ${
                              isCur
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                            }`}
                          >
                            {lang === 'bn' ? preset.bn : preset.en}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
