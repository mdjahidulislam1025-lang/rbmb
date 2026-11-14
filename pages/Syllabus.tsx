
import * as React from 'react';
import { BookOpen, Download, FileText, Search } from 'lucide-react';
import { SYLLABUS_2026, TRANSLATIONS } from '../constants';
import { useApp } from '../App';

const Syllabus: React.FC = () => {
  const { lang, t } = useApp();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSyllabus = SYLLABUS_2026.filter(item => 
    t(item.className).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-green-900">
          {lang === 'bn' ? '২০২৬ শিক্ষাবর্ষের সিলেবাস (NCTB)' : '2026 Academic Syllabus (NCTB)'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {lang === 'bn' ? 'নতুন কারিকুলাম অনুযায়ী ৬ষ্ঠ থেকে ১০ম শ্রেণীর সকল বিষয়ের বিস্তারিত সিলেবাস নিচে দেওয়া হলো।' : 'Detailed syllabus for all subjects from Class 6 to 10 according to the new curriculum is given below.'}
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          placeholder={lang === 'bn' ? 'শ্রেণী খুঁজুন...' : 'Search class...'}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSyllabus.map((item) => (
          <div key={item.classId} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{t(item.className)}</h3>
                <p className="text-xs opacity-80">{lang === 'bn' ? '২০২৬ শিক্ষাবর্ষ' : 'Session 2026'}</p>
              </div>
              <BookOpen className="w-8 h-8 opacity-20" />
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {item.subjects.slice(0, 5).map((subject, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700 font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" /> {t(subject.name)}
                    </span>
                    <span className="text-gray-400 text-xs">#{subject.code}</span>
                  </div>
                ))}
                {item.subjects.length > 5 && (
                  <p className="text-xs text-center text-gray-400 pt-2">
                    {lang === 'bn' ? `আরও ${item.subjects.length - 5} টি বিষয়...` : `+${item.subjects.length - 5} more subjects...`}
                  </p>
                )}
              </div>

              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors mt-4">
                <Download className="w-4 h-4" /> {t(TRANSLATIONS.ui.downloadPdf)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Syllabus;
