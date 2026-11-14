
import * as React from 'react';
import { Clock, Calendar, ChevronRight, FileDown, BookOpen, Coffee, GraduationCap, MapPin, Download } from 'lucide-react';
import { CLASS_ROUTINES, TRANSLATIONS } from '../constants';
import { useApp } from '../App';

const Routine: React.FC = () => {
  const { lang, t } = useApp();
  const [selectedClassId, setSelectedClassId] = React.useState(CLASS_ROUTINES[0].classId);

  const selectedRoutine = CLASS_ROUTINES.find(r => r.classId === selectedClassId);

  // Helper to get a subject icon (can be expanded)
  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math') || s.includes('গণিত')) return <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><GraduationCap className="w-5 h-5" /></div>;
    if (s.includes('science') || s.includes('বিজ্ঞান')) return <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>;
    if (s.includes('english') || s.includes('ইংরেজি')) return <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Coffee className="w-5 h-5" /></div>;
    if (s.includes('bangla') || s.includes('বাংলা')) return <div className="p-2 bg-pink-100 text-pink-600 rounded-xl"><MapPin className="w-5 h-5" /></div>;
    return <div className="p-2 bg-green-100 text-green-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-green-100">
            <Calendar className="w-4 h-4" /> Academic Schedule
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            {t(TRANSLATIONS.nav.routine)} <span className="text-green-700">২০২৬</span>
          </h1>
          <p className="text-gray-500 max-w-xl font-medium text-lg leading-relaxed">
            {lang === 'bn' 
              ? 'শিক্ষার্থীদের নিয়মিত পাঠদানের সময়সূচী। নিচের শ্রেণী নির্বাচন করে আপনার কাঙ্ক্ষিত রুটিনটি দেখুন।' 
              : 'Regular class schedule for the 2026 academic session. Select your class below to view the detailed timetable.'}
          </p>
        </div>
        <button className="group bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-3 hover:bg-green-700 transition-all shadow-2xl shadow-slate-900/10 active:scale-95">
          <FileDown className="w-5 h-5 group-hover:animate-bounce" /> 
          {lang === 'bn' ? 'সম্পূর্ণ রুটিন ডাউনলোড' : 'Download PDF Routine'}
        </button>
      </div>

      {/* Class Selector Scrollable Container */}
      <div className="relative group">
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth">
          {CLASS_ROUTINES.map((routine) => (
            <button
              key={routine.classId}
              onClick={() => setSelectedClassId(routine.classId)}
              className={`px-8 py-4 rounded-[1.5rem] font-black whitespace-nowrap transition-all border-2 text-sm uppercase tracking-wider ${
                selectedClassId === routine.classId
                  ? 'bg-green-700 border-green-700 text-white shadow-2xl shadow-green-700/30 -translate-y-1'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-700'
              }`}
            >
              {t(routine.className)}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Grid Display */}
      {selectedRoutine && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {selectedRoutine.schedule.map((dayData, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-500">
              {/* Day Header */}
              <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center group-hover:bg-green-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl text-green-700 shadow-sm">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-gray-900 text-xl tracking-tight">{t(dayData.day)}</h3>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100">
                  {dayData.periods.length} Classes
                </div>
              </div>

              {/* Period Slots */}
              <div className="p-6 space-y-4 flex-grow">
                {dayData.periods.map((period, pIdx) => (
                  <div 
                    key={pIdx} 
                    className="relative flex items-center justify-between p-4 rounded-3xl border border-transparent hover:border-green-100 hover:bg-green-50/30 transition-all duration-300 group/period"
                  >
                    <div className="flex items-center gap-5">
                      {/* Icon & Index */}
                      <div className="relative">
                        {getSubjectIcon(t(period.subject))}
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-white text-slate-400 rounded-full flex items-center justify-center text-[10px] font-black border border-gray-50 shadow-sm">
                          {pIdx + 1}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="font-black text-gray-800 text-lg group-hover/period:text-green-800 transition-colors leading-tight">
                          {t(period.subject)}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 group-hover/period:text-green-600 transition-colors uppercase tracking-tight">
                          <Clock className="w-3 h-3" /> {period.time}
                        </div>
                      </div>
                    </div>
                    
                    <button className="opacity-0 group-hover/period:opacity-100 p-2 rounded-xl bg-white shadow-md text-green-600 hover:scale-110 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Day Footer/Quick Action */}
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-center">
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-green-700 transition-colors flex items-center gap-2">
                   View Full Day <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BookOpen className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black">{lang === 'bn' ? 'পরিবর্তিত নোটিশ' : 'Schedule Changes?'}</h2>
            <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
              {lang === 'bn' 
                ? 'বিশেষ প্রয়োজনে বা প্রাকৃতিক দুর্যোগে রুটিনে পরিবর্তন আসতে পারে। সেক্ষেত্রে নিয়মিত নোটিশ বোর্ড পরীক্ষা করুন।' 
                : 'Routine may change during special events or natural calamities. Please check the Notice Board regularly for official updates.'}
            </p>
            <button className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all shadow-[0_20px_40px_rgba(22,163,74,0.3)] hover:-translate-y-1">
              {lang === 'bn' ? 'নোটিশ বোর্ড দেখুন' : 'Go to Notice Board'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] text-center space-y-2">
                <div className="text-3xl font-black text-green-400">০৫+</div>
                <div className="text-[10px] font-black uppercase opacity-60 tracking-widest">Classes / Day</div>
             </div>
             <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] text-center space-y-2">
                <div className="text-3xl font-black text-green-400">১০:০০</div>
                <div className="text-[10px] font-black uppercase opacity-60 tracking-widest">Start Time</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Routine;
