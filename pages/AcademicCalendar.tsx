import * as React from 'react';
import {
  Calendar as CalendarIcon,
  GraduationCap,
  ArrowLeft,
  PlusCircle,
  X,
  Save,
  Pencil,
  Trash2,
  FileDown,
} from 'lucide-react';
import { useApp } from '../App';
import * as RouterDom from 'react-router-dom';
import { Notice, Holiday } from '../types';

const { useState, useMemo } = React;
const { Link } = RouterDom;

interface CalendarEvent {
  id: string;
  originalId: string;
  title: string;
  date: Date;
  type: 'Holiday' | 'Exam' | 'Admission' | 'General';
  description?: string;
  raw?: Notice | Holiday;
}

const AcademicCalendar: React.FC = () => {
  const { lang, t, user, holidays, notices, addNotice, updateNotice, addHoliday, updateHoliday, deleteNotice, deleteHoliday, settings } = useApp();
  const [selectedType, setSelectedType] = useState<'All' | 'Holiday' | 'Exam' | 'Admission'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<'Exam' | 'Admission' | 'Holiday'>('Exam');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const months = [
    { bn: 'জানুয়ারি', en: 'January' },
    { bn: 'ফেব্রুয়ারি', en: 'February' },
    { bn: 'মার্চ', en: 'March' },
    { bn: 'এপ্রিল', en: 'April' },
    { bn: 'মে', en: 'May' },
    { bn: 'জুন', en: 'June' },
    { bn: 'জুলাই', en: 'July' },
    { bn: 'আগস্ট', en: 'August' },
    { bn: 'সেপ্টেম্বর', en: 'September' },
    { bn: 'অক্টোবর', en: 'October' },
    { bn: 'নভেম্বর', en: 'November' },
    { bn: 'ডিসেম্বর', en: 'December' },
  ];

  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    holidays.forEach((h) => {
      const parsed = new Date(h.date);
      if (!isNaN(parsed.getTime())) {
        events.push({
          id: `h-${h.id}`,
          originalId: h.id,
          title: t(h.title),
          date: parsed,
          type: 'Holiday',
          description: t(h.duration),
          raw: h,
        });
      }
    });

    notices.forEach((n) => {
      if (n.category === 'Exam' || n.category === 'Admission') {
        const parsed = new Date(n.date);
        if (!isNaN(parsed.getTime())) {
          events.push({
            id: `n-${n.id}`,
            originalId: n.id,
            title: t(n.title),
            date: parsed,
            type: n.category,
            description: t(n.description),
            raw: n,
          });
        }
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [holidays, notices, t]);

  const filteredEvents =
    selectedType === 'All' ? allEvents : allEvents.filter((e) => e.type === selectedType);

  const getEventsForMonth = (monthIdx: number) =>
    filteredEvents.filter((e) => e.date.getMonth() === monthIdx);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Holiday':
        return 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'Exam':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'Admission':
        return 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormType('Exam');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormType(event.type === 'Holiday' ? 'Holiday' : event.type === 'Admission' ? 'Admission' : 'Exam');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as {
      titleBn: HTMLInputElement;
      titleEn: HTMLInputElement;
      date: HTMLInputElement;
      durBn?: HTMLInputElement;
      durEn?: HTMLInputElement;
      holidayType?: HTMLSelectElement;
      descBn?: HTMLTextAreaElement;
      descEn?: HTMLTextAreaElement;
    };
    const isEdit = !!editingEvent;
    const originalId = isEdit ? editingEvent.originalId : `ev-${Date.now()}`;

    if (formType === 'Holiday') {
      const holiday: Holiday = {
        id: originalId,
        title: { bn: f.titleBn.value.trim(), en: f.titleEn.value.trim() },
        date: f.date.value,
        duration: { bn: f.durBn?.value.trim() || '১ দিন', en: f.durEn?.value.trim() || '1 Day' },
        type: (f.holidayType?.value as Holiday['type']) || 'National',
        isPublic: true,
      };
      if (isEdit) updateHoliday(holiday);
      else addHoliday(holiday);
    } else {
      const notice: Notice = {
        id: originalId,
        title: { bn: f.titleBn.value.trim(), en: f.titleEn.value.trim() },
        description: { bn: f.descBn?.value.trim() || '', en: f.descEn?.value.trim() || '' },
        category: formType,
        date: f.date.value,
        isPublic: true,
      };
      if (isEdit) updateNotice(notice);
      else addNotice(notice);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (event: CalendarEvent) => {
    if (event.type === 'Holiday') deleteHoliday(event.originalId);
    else deleteNotice(event.originalId);
    setConfirmDeleteId(null);
  };

  const PrintableCalendar = () => (
    <div id="printable-calendar" className="hidden print:block bg-white text-black p-0">
      <div className="border-[10px] border-double border-green-900 p-8 min-h-[1050px]">
        <div className="text-center space-y-2 border-b-4 border-green-900 pb-5 mb-6">
          <GraduationCap className="text-green-800 w-10 h-10 mx-auto" />
          <h1 className="text-3xl font-black uppercase text-green-900">{t(settings.name)}</h1>
          <p className="text-base font-bold">EIIN: {settings.eiin} | স্থাপিত: ১৯৫৮</p>
          <span className="inline-block px-8 py-1.5 border-2 border-green-900 font-black text-lg uppercase bg-green-50 rounded-lg">
            {lang === 'bn' ? 'একাডেমিক ক্যালেন্ডার - ২০২৬' : 'Academic Calendar - 2026'}
          </span>
        </div>

        <div className="space-y-6">
          {months.map((month, mIdx) => {
            const monthEvents = allEvents.filter((e) => e.date.getMonth() === mIdx);
            if (monthEvents.length === 0) return null;

            return (
              <div key={mIdx} className="break-inside-avoid">
                <h3 className="text-lg font-black bg-slate-100 px-4 py-1.5 border-l-4 border-green-700 mb-2">
                  {t(month)}
                </h3>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {monthEvents.map((event, eIdx) => (
                      <tr key={eIdx} className="border-b border-slate-200">
                        <td className="px-3 py-2 font-bold w-28">
                          {event.date.getDate()} {t(month)}
                        </td>
                        <td className="px-3 py-2 font-black">{event.title}</td>
                        <td className="px-3 py-2 w-24 uppercase text-xs font-bold">{event.type}</td>
                        <td className="px-3 py-2 text-slate-600">{event.description || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <PrintableCalendar />

      <div className="flex flex-col gap-4 no-print">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-sm hover:gap-3 transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
              {lang === 'bn' ? 'একাডেমিক ক্যালেন্ডার' : 'Academic Calendar'} <span className="text-slate-400">২০২৬</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl font-medium">
              {lang === 'bn'
                ? '২০২৬ শিক্ষাবর্ষের গুরুত্বপূর্ণ তারিখ, পরীক্ষা, ভর্তি এবং ছুটির তালিকা।'
                : 'Detailed monthly schedule of exams, admissions, and holidays for 2026.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="bg-green-700 text-white px-5 py-3 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-green-800 shadow-lg flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> {lang === 'bn' ? 'নতুন ইভেন্ট' : 'Add Event'}
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              {(['All', 'Holiday', 'Exam', 'Admission'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border ${
                    selectedType === type
                      ? 'bg-green-700 border-green-700 text-white shadow'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {type === 'All'
                    ? lang === 'bn'
                      ? 'সব'
                      : 'All'
                    : lang === 'bn'
                    ? type === 'Holiday'
                      ? 'ছুটি'
                      : type === 'Exam'
                      ? 'পরীক্ষা'
                      : 'ভর্তি'
                    : type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {months.map((month, idx) => {
          const monthEvents = getEventsForMonth(idx);
          if (monthEvents.length === 0 && selectedType !== 'All') return null;

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t(month)}</h3>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">
                  {monthEvents.length} Events
                </span>
              </div>
              <div className="p-5 space-y-3 flex-grow">
                {monthEvents.length > 0 ? (
                  monthEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5 relative group"
                    >
                      {isAdmin && (
                        <div className="flex justify-end gap-1 mb-1">
                          {confirmDeleteId === event.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(event)}
                                className="px-2 py-0.5 text-[10px] font-black text-white bg-red-600 rounded"
                              >
                                {lang === 'bn' ? 'নিশ্চিত' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 text-[10px] font-black text-slate-600 bg-white rounded border"
                              >
                                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEdit(event)}
                                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(event.id)}
                                className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${getBadgeStyle(event.type)}`}>
                          {event.type}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {event.date.getDate()} {t(month)}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm leading-snug">{event.title}</h4>
                      {event.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-bold text-center py-6">
                    {lang === 'bn' ? 'কোনো ইভেন্ট নেই' : 'No events scheduled'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black">{editingEvent ? 'Edit Event' : 'Add Calendar Event'}</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-5 overflow-y-auto">
              {!editingEvent && (
                <div className="flex gap-2">
                  {(['Exam', 'Admission', 'Holiday'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormType(type)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border ${
                        formType === type
                          ? 'bg-green-50 dark:bg-green-950 border-green-600 text-green-700 dark:text-green-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  name="titleBn"
                  defaultValue={editingEvent?.raw?.title?.bn}
                  placeholder="Title (Bangla)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  name="titleEn"
                  defaultValue={editingEvent?.raw?.title?.en}
                  placeholder="Title (English)"
                  className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
                <input
                  required
                  type="date"
                  name="date"
                  defaultValue={editingEvent?.raw?.date}
                  className="sm:col-span-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              {formType === 'Holiday' ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    name="durBn"
                    defaultValue={(editingEvent?.raw as Holiday)?.duration?.bn}
                    placeholder="Duration (BN) e.g. ১ দিন"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                  />
                  <input
                    required
                    name="durEn"
                    defaultValue={(editingEvent?.raw as Holiday)?.duration?.en}
                    placeholder="Duration (EN) e.g. 1 Day"
                    className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                  />
                  <select
                    name="holidayType"
                    defaultValue={(editingEvent?.raw as Holiday)?.type || 'National'}
                    className="sm:col-span-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                  >
                    <option value="National">National</option>
                    <option value="Religious">Religious</option>
                    <option value="Seasonal">Seasonal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    required
                    name="descBn"
                    defaultValue={(editingEvent?.raw as Notice)?.description?.bn}
                    placeholder="Description (Bangla)"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm resize-none"
                  />
                  <textarea
                    required
                    name="descEn"
                    defaultValue={(editingEvent?.raw as Notice)?.description?.en}
                    placeholder="Description (English)"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-green-800"
              >
                <Save className="w-5 h-5" /> {editingEvent ? 'Update Calendar' : 'Save to Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-black flex items-center justify-center md:justify-start gap-2">
            <CalendarIcon className="w-6 h-6 text-green-400" />
            {lang === 'bn' ? 'ক্যালেন্ডার ডাউনলোড করতে চান?' : 'Need a Printable Calendar?'}
          </h2>
          <p className="text-slate-300 text-sm max-w-lg">
            {lang === 'bn'
              ? 'পুরো বছরের একাডেমিক ক্যালেন্ডার প্রিন্ট বা PDF ফরম্যাটে সেভ করুন।'
              : 'Print or save the full 2026 academic calendar as a clean PDF document.'}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center gap-2 shrink-0"
        >
          <FileDown className="w-4 h-4" />
          {lang === 'bn' ? 'পিডিএফ / প্রিন্ট করুন' : 'Print / Save PDF'}
        </button>
      </div>
    </div>
  );
};

export default AcademicCalendar;
