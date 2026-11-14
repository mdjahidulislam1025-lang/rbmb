
import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import Navbar from './components/Navbar';
import NoticeTicker from './components/NoticeTicker';
import Home from './pages/Home';
import NoticeBoard from './pages/NoticeBoard';
import Teachers from './pages/Teachers';
import Admission from './pages/Admission';
import Login from './pages/Login';
import Register from './pages/Register';
import Holidays from './pages/Holidays';
import Syllabus from './pages/Syllabus';
import Routine from './pages/Routine';
import EBookLibrary from './pages/EBookLibrary';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AcademicCalendar from './pages/AcademicCalendar';
import { X, Send, Bot, Database, Sparkles } from 'lucide-react';
import { SCHOOL_NAME, EIIN, CONTACT_INFO, E_BOOKS_2026, NOTICES, TEACHERS, GALLERY, HOLIDAYS_2026, EBook } from './constants';
import { GoogleGenAI } from "@google/genai";
import { Notice, Teacher, GalleryItem, Holiday, LocalizedString } from './types';

const { useState, createContext, useContext, useEffect, useRef } = React;
const { HashRouter: Router, Routes, Route, Link } = RouterDom;

type Language = 'bn' | 'en';
export type UserRole = 'student' | 'teacher' | 'admin' | null;

export interface AuthUser {
  role: UserRole;
  name: string;
  userId: string;
  email?: string;
  password?: string;
  photo?: string;
}

export interface SchoolSettings {
  name: LocalizedString;
  eiin: string;
  phone: string;
  email: string;
  location: LocalizedString;
  schoolPhoto?: string;
}

const DEFAULT_ADMIN: AuthUser = {
  userId: 'admin',
  password: 'admin123',
  name: 'System Admin',
  role: 'admin',
  email: 'admin@school.com'
};

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  user: AuthUser | null;
  login: (authUser: AuthUser) => void;
  register: (newUser: AuthUser) => boolean;
  updateUser: (updatedUser: AuthUser) => void;
  deleteUser: (userId: string) => void;
  logout: () => void;
  t: (obj: any) => string;
  getUsers: () => AuthUser[];
  notices: Notice[];
  addNotice: (notice: Notice) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;
  teachers: Teacher[];
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  ebooks: EBook[];
  addEbook: (ebook: EBook) => void;
  updateEbook: (ebook: EBook) => void;
  deleteEbook: (id: string) => void;
  gallery: GalleryItem[];
  addGalleryItem: (item: GalleryItem) => void;
  updateGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;
  holidays: Holiday[];
  addHoliday: (holiday: Holiday) => void;
  updateHoliday: (holiday: Holiday) => void;
  deleteHoliday: (id: string) => void;
  settings: SchoolSettings;
  updateSettings: (newSettings: SchoolSettings) => void;
  exportDatabase: () => void;
  importDatabase: (jsonData: string) => boolean;
  dbStatus: 'synced' | 'syncing' | 'error';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('bn');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [dbStatus, setDbStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>({
    name: SCHOOL_NAME,
    eiin: EIIN,
    phone: CONTACT_INFO.mobile,
    email: CONTACT_INFO.email,
    location: CONTACT_INFO.location,
    schoolPhoto: 'https://images.unsplash.com/photo-1523050853064-8504f2f40fd5?auto=format&fit=crop&q=80&w=1200'
  });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('school_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      const loadData = (key: string, initial: any[]) => {
        const saved = localStorage.getItem(key);
        if (!saved) return initial;
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
          return initial;
        }
      };

      setNotices(loadData('db_notices', NOTICES));
      setTeachers(loadData('db_teachers', TEACHERS));
      setEbooks(loadData('db_ebooks', E_BOOKS_2026));
      setGallery(loadData('db_gallery', GALLERY));
      setHolidays(loadData('db_holidays', HOLIDAYS_2026));
      
      const savedSettings = localStorage.getItem('school_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const users = loadData('registered_users', [DEFAULT_ADMIN]);
      if (!users.some((u: AuthUser) => u.userId === DEFAULT_ADMIN.userId)) {
        users.push(DEFAULT_ADMIN);
      }
      setRegisteredUsers(users);
    } catch (e) {
      console.error('Initial load failed:', e);
      setDbStatus('error');
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const persist = (key: string, data: any) => {
    setDbStatus('syncing');
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setTimeout(() => setDbStatus('synced'), 600);
    } catch (e) {
      setDbStatus('error');
    }
  };

  const login = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem('school_user', JSON.stringify(authUser));
  };

  const register = (newUser: AuthUser): boolean => {
    if (registeredUsers.some(u => u.userId.toLowerCase() === newUser.userId.toLowerCase())) return false;
    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    persist('registered_users', updated);
    return true;
  };

  const updateUser = (updatedUser: AuthUser) => {
    const updated = registeredUsers.map(u => u.userId === updatedUser.userId ? updatedUser : u);
    setRegisteredUsers(updated);
    persist('registered_users', updated);
    if (user?.userId === updatedUser.userId) {
      setUser(updatedUser);
      localStorage.setItem('school_user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (userId: string) => {
    if (userId === 'admin') return; 
    const updated = registeredUsers.filter(u => u.userId !== userId);
    setRegisteredUsers(updated);
    persist('registered_users', updated);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_user');
  };

  const addNotice = (n: Notice) => { const updated = [n, ...notices]; setNotices(updated); persist('db_notices', updated); };
  const updateNotice = (n: Notice) => { const updated = notices.map(i => i.id === n.id ? n : i); setNotices(updated); persist('db_notices', updated); };
  const deleteNotice = (id: string) => { const updated = notices.filter(n => n.id !== id); setNotices(updated); persist('db_notices', updated); };

  const addTeacher = (t: Teacher) => { const updated = [...teachers, t]; setTeachers(updated); persist('db_teachers', updated); };
  const updateTeacher = (t: Teacher) => { const updated = teachers.map(i => i.id === t.id ? t : i); setTeachers(updated); persist('db_teachers', updated); };
  const deleteTeacher = (id: string) => { const updated = teachers.filter(t => t.id !== id); setTeachers(updated); persist('db_teachers', updated); };

  const addEbook = (b: EBook) => { const updated = [...ebooks, b]; setEbooks(updated); persist('db_ebooks', updated); };
  const updateEbook = (b: EBook) => { const updated = ebooks.map(i => i.id === b.id ? b : i); setEbooks(updated); persist('db_ebooks', updated); };
  const deleteEbook = (id: string) => { const updated = ebooks.filter(b => b.id !== id); setEbooks(updated); persist('db_ebooks', updated); };

  const addGalleryItem = (i: GalleryItem) => { const updated = [i, ...gallery]; setGallery(updated); persist('db_gallery', updated); };
  const updateGalleryItem = (i: GalleryItem) => { const updated = gallery.map(item => item.id === i.id ? i : item); setGallery(updated); persist('db_gallery', updated); };
  const deleteGalleryItem = (id: string) => { const updated = gallery.filter(i => i.id !== id); setGallery(updated); persist('db_gallery', updated); };

  const addHoliday = (h: Holiday) => { const updated = [...holidays, h]; setHolidays(updated); persist('db_holidays', updated); };
  const updateHoliday = (h: Holiday) => { const updated = holidays.map(i => i.id === h.id ? h : i); setHolidays(updated); persist('db_holidays', updated); };
  const deleteHoliday = (id: string) => { const updated = holidays.filter(h => h.id !== id); setHolidays(updated); persist('db_holidays', updated); };

  const updateSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    persist('school_settings', newSettings);
  };

  const exportDatabase = () => {
    const data = { settings, notices, teachers, ebooks, gallery, holidays, users: registeredUsers, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school_db_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.settings) setSettings(data.settings);
      if (data.notices) setNotices(data.notices);
      if (data.teachers) setTeachers(data.teachers);
      if (data.users) setRegisteredUsers(data.users);
      if (data.ebooks) setEbooks(data.ebooks);
      if (data.gallery) setGallery(data.gallery);
      if (data.holidays) setHolidays(data.holidays);
      return true;
    } catch (e) { return false; }
  };

  const t = (obj: any) => {
    if (!obj) return '';
    return obj[lang] || obj['bn'] || '';
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(p => [...p, { role: 'user', text: msg }]);
    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      // Dynamic Notice Context for AI
      const noticeSummaries = notices.slice(0, 5).map(n => 
        `- ${t(n.title)} (${n.date}): ${t(n.description)}`
      ).join('\n');

      const systemInstruction = `You are the AI Academic Assistant for ${t(settings.name)}. School EIIN: ${settings.eiin}. 
      Always provide helpful, professional, and friendly information. 
      
      Current Notices:\n${noticeSummaries}

      Priority Topics: 
      - Admission: 2026 Session is open. Apply online at /admission. Required: Photo, Birth Certificate.
      - Contact: Location is ${t(settings.location)}, Mobile: ${settings.phone}, Email: ${settings.email}.
      - General: Syllabus and routines are available on the website.
      Language: Respond in the language used by the user (${lang}).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: msg,
        config: { systemInstruction }
      });
      setChatMessages(p => [...p, { role: 'model', text: response.text || 'I am sorry, I could not process your request.' }]);
    } catch (e) {
      console.error('AI Error:', e);
      setChatMessages(p => [...p, { role: 'model', text: "AI Assistant is currently offline. Please contact office directly." }]);
    } finally { setIsTyping(false); }
  };

  return (
    <AppContext.Provider value={{ 
      lang, setLang, user, login, register, updateUser, deleteUser, logout, t, getUsers: () => registeredUsers,
      notices, addNotice, updateNotice, deleteNotice, 
      teachers, addTeacher, updateTeacher, deleteTeacher, 
      ebooks, addEbook, updateEbook, deleteEbook, 
      gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, 
      holidays, addHoliday, updateHoliday, deleteHoliday,
      settings, updateSettings, exportDatabase, importDatabase, dbStatus
    }}>
      <Router>
        <div className={`min-h-screen flex flex-col ${lang === 'bn' ? 'bangla-font' : 'font-sans'}`}>
          <Navbar />
          <NoticeTicker />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/notices" element={<NoticeBoard />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/admission" element={<Admission />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/syllabus" element={<Syllabus />} />
              <Route path="/routine" element={<Routine />} />
              <Route path="/ebooks" element={<EBookLibrary />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/calendar" element={<AcademicCalendar />} />
              <Route path="/login/*" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Login />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-gray-100 py-12 text-center no-print">
            <h3 className="text-xl font-black text-green-900 mb-6">{t(settings.name)}</h3>
            <div className="flex flex-wrap justify-center gap-6 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
              <Link to="/login/admin" className="hover:text-green-700">Admin Login</Link>
              <Link to="/contact" className="hover:text-green-700">Contact</Link>
              <div className="flex items-center gap-1">
                <Database className={`w-3 h-3 ${dbStatus === 'error' ? 'text-red-500' : 'text-green-500'}`} /> 
                {dbStatus.toUpperCase()}
              </div>
            </div>
            <p className="text-[10px] text-slate-300 font-bold mb-4">© 2026 {t(settings.name)}। সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="inline-block border-t border-gray-100 pt-4 px-6">
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'bn' ? 'তৈরি করেছেন: ' : 'Made by '}
                <span className="text-green-700 font-extrabold hover:text-green-800 transition-colors">JAHIDUL ISLAM</span>
              </p>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5 uppercase">
                IIT, University of Dhaka
              </p>
            </div>
          </footer>

          <button onClick={() => setShowChat(!showChat)} className="fixed bottom-6 right-6 bg-green-700 text-white p-5 rounded-2xl shadow-2xl z-50 transition-all hover:scale-110 active:scale-95 no-print">
            {showChat ? <X /> : <Bot className="w-6 h-6" />}
          </button>

          {showChat && (
            <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] md:w-[26rem] h-[34rem] bg-white rounded-[2.5rem] shadow-2xl z-50 border border-gray-100 flex flex-col animate-in slide-in-from-bottom-4 no-print">
              <div className="bg-green-700 p-6 text-white flex justify-between items-center rounded-t-[2.5rem]">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black block leading-none">AI Assistant</span>
                    <span className="text-[9px] opacity-70 uppercase tracking-widest font-black">Helpdesk</span>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="hover:bg-white/10 p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10 opacity-30 flex flex-col items-center">
                    <Sparkles className="w-12 h-12 mb-4 text-green-700" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">How can I help you today?</p>
                    <p className="text-[10px] font-bold mt-2">Ask about admission, notices, or school location.</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-green-700 text-white shadow-lg' : 'bg-white text-slate-800 border border-slate-100 shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-6 border-t bg-white flex gap-2 rounded-b-[2.5rem]">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()} 
                  className="flex-grow bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all" 
                  placeholder="Ask anything..." 
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={!chatInput.trim() || isTyping}
                  className={`bg-green-700 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-95 ${(!chatInput.trim() || isTyping) ? 'opacity-50 grayscale' : 'hover:bg-green-800'}`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
