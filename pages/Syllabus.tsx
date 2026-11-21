import * as React from 'react';
import { BookOpen, Download, FileText, Search } from 'lucide-react';
import { SYLLABUS_2026 } from '../constants';
import { useApp } from '../App';

const Syllabus: React.FC = () => {
  const { lang, t } = useApp();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSyllabus = SYLLABUS_2026.filter(
    (item) =>
      t(item.className).toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjects.some((s) => t(s.name).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadClassSyllabus = (item: (typeof SYLLABUS_2026)[number]) => {
    const lines = [
      `RANIR BAZAR SECONDARY HIGH SCHOOL - ACADEMIC SYLLABUS 2026`,
      `===========================================================`,
      `Class: ${t(item.className)}`,
      ``,
      `Subjects & Codes:`,
      ...item.subjects.map((sub, i) => `${i + 1}. ${t(sub.name)} (Code: #${sub.code})`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RBHS_Syllabus_Class_${item.classId}_2026.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
          {lang === 'bn' ? '২০২৬ শিক্ষাবর্ষের সিলেবাস (NCTB)' : '2026 Academic Syllabus (NCTB)'}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
          {lang === 'bn'
            ? 'নতুন কারিকুলাম অনুযায়ী ৬ষ্ঠ থেকে ১০ম শ্রেণীর সকল বিষয়ের বিস্তারিত সিলেবাস নিচে দেওয়া হলো।'
            : 'Detailed subject list and academic syllabus for Classes 6 to 10 under the 2026 curriculum.'}
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder={lang === 'bn' ? 'শ্রেণী বা বিষয় খুঁজুন...' : 'Search class or subject...'}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredSyllabus.map((item) => (
          <div
            key={item.classId}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="bg-green-700 p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black">{t(item.className)}</h3>
                  <p className="text-xs opacity-85">{lang === 'bn' ? '২০২৬ শিক্ষাবর্ষ' : 'Session 2026'}</p>
                </div>
                <BookOpen className="w-8 h-8 opacity-30" />
              </div>

              <div className="p-6 space-y-2.5">
                {item.subjects.map((subject, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <span className="text-slate-800 dark:text-slate-100 font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" /> {t(subject.name)}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">#{subject.code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => handleDownloadClassSyllabus(item)}
                className="w-full bg-slate-900 dark:bg-green-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
              >
                <Download className="w-4 h-4" /> {lang === 'bn' ? 'সিলেবাস ডাউনলোড' : 'Download Syllabus'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Syllabus;
