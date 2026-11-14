
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
import { Notice, Teacher, GalleryItem, Holiday, LocalizedString, AdmissionApplication, ContactMessage } from './types';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
  testFirestoreConnection,
} from './firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { sanitizeFirestoreId } from './utils/imageUtils';

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

const BOOTSTRAPPED_ADMIN_EMAIL = 'mdjahidulislam1025@gmail.com';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isCloudAdmin: boolean;
  signInWithGoogle: () => Promise<boolean>;
  logoutGoogle: () => Promise<void>;
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
  admissions: AdmissionApplication[];
  addAdmission: (app: AdmissionApplication) => Promise<void>;
  updateAdmissionStatus: (appId: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  deleteAdmission: (appId: string) => Promise<void>;
  contactMessages: ContactMessage[];
  addContactMessage: (msg: ContactMessage) => Promise<void>;
  markContactMessageRead: (id: string) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
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

const safeLocalGet = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
};

const safeLocalSet = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`localStorage write skipped for ${key}:`, e);
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('bn');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isCloudAdmin, setIsCloudAdmin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [dbStatus, setDbStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [notices, setNotices] = useState<Notice[]>(() => safeLocalGet('db_notices', NOTICES));
  const [teachers, setTeachers] = useState<Teacher[]>(() => safeLocalGet('db_teachers', TEACHERS));
  const [ebooks, setEbooks] = useState<EBook[]>(() => safeLocalGet('db_ebooks', E_BOOKS_2026));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => safeLocalGet('db_gallery', GALLERY));
  const [holidays, setHolidays] = useState<Holiday[]>(() => safeLocalGet('db_holidays', HOLIDAYS_2026));
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(() => safeLocalGet('admission_applications', []));
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => safeLocalGet('contact_messages', []));
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>(() => {
    const users = safeLocalGet<AuthUser[]>('registered_users', [DEFAULT_ADMIN]);
    if (!users.some((u) => u.userId === DEFAULT_ADMIN.userId)) {
      users.push(DEFAULT_ADMIN);
    }
    return users;
  });
  const [settings, setSettings] = useState<SchoolSettings>(() =>
    safeLocalGet('school_settings', {
      name: SCHOOL_NAME,
      eiin: EIIN,
      phone: CONTACT_INFO.mobile,
      email: CONTACT_INFO.email,
      location: CONTACT_INFO.location,
      schoolPhoto: 'https://images.unsplash.com/photo-1523050853064-8504f2f40fd5?auto=format&fit=crop&q=80&w=1200'
    })
  );

  // Refs holding latest state for initial cloud seeding when admin connects
  const latestStateRef = useRef({ notices, teachers, ebooks, gallery, holidays, settings });
  useEffect(() => {
    latestStateRef.current = { notices, teachers, ebooks, gallery, holidays, settings };
  }, [notices, teachers, ebooks, gallery, holidays, settings]);

  useEffect(() => {
    const savedUser = safeLocalGet<AuthUser | null>('school_user', null);
    if (savedUser) setUser(savedUser);
    testFirestoreConnection();
  }, []);

  // Firebase Authentication & Admin Role Detection
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setIsCloudAdmin(false);
        return;
      }

      const isVerified = fbUser.emailVerified === true;
      const isBootstrap = isVerified && fbUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
      let adminStatus = isBootstrap;

      if (!adminStatus && isVerified) {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
          adminStatus = adminSnap.exists();
        } catch {
          adminStatus = false;
        }
      }

      setIsCloudAdmin(adminStatus);

      // Sync or create user profile document in Firestore
      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userRef);
        const role: UserRole = adminStatus ? 'admin' : 'student';

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: sanitizeFirestoreId(fbUser.uid),
            name: (fbUser.displayName || fbUser.email || 'User').slice(0, 150),
            email: (fbUser.email || 'user@rbhs.edu').slice(0, 150),
            role,
            ...(fbUser.photoURL ? { photo: fbUser.photoURL.slice(0, 600000) } : {}),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        const syncedAuthUser: AuthUser = {
          role: userSnap.exists() ? (userSnap.data().role as UserRole) : role,
          name: fbUser.displayName || fbUser.email || 'Google User',
          userId: fbUser.uid,
          email: fbUser.email || '',
          photo: fbUser.photoURL || '',
        };
        setUser(syncedAuthUser);
        safeLocalSet('school_user', syncedAuthUser);
      } catch (err) {
        console.warn('User profile sync skipped:', err);
      }
    });

    return () => unsubAuth();
  }, []);

  // Seed Firestore once if Cloud Admin signs in and cloud collections are still empty
  useEffect(() => {
    if (!isCloudAdmin) return;
    let cancelled = false;

    const seedCloudIfEmpty = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'main');
        const settingsSnap = await getDoc(settingsRef);
        if (cancelled || settingsSnap.exists()) return;

        setDbStatus('syncing');
        const current = latestStateRef.current;
        const batch = writeBatch(db);

        batch.set(settingsRef, {
          name: { bn: current.settings.name.bn.slice(0, 200), en: current.settings.name.en.slice(0, 200) },
          eiin: current.settings.eiin.slice(0, 32),
          phone: current.settings.phone.slice(0, 40),
          email: current.settings.email.slice(0, 150),
          location: { bn: current.settings.location.bn.slice(0, 300), en: current.settings.location.en.slice(0, 300) },
          ...(current.settings.schoolPhoto ? { schoolPhoto: current.settings.schoolPhoto.slice(0, 600000) } : {}),
          updatedAt: serverTimestamp(),
        });

        current.notices.forEach((n) => {
          const id = sanitizeFirestoreId(n.id);
          batch.set(doc(db, 'notices', id), {
            id,
            title: { bn: n.title.bn.slice(0, 300), en: n.title.en.slice(0, 300) },
            date: n.date.slice(0, 32),
            category: n.category,
            description: { bn: n.description.bn.slice(0, 5000), en: n.description.en.slice(0, 5000) },
            ...(n.pdfUrl ? { pdfUrl: n.pdfUrl.slice(0, 2000) } : {}),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        current.teachers.forEach((teach) => {
          const id = sanitizeFirestoreId(teach.id);
          batch.set(doc(db, 'teachers', id), {
            id,
            name: { bn: teach.name.bn.slice(0, 200), en: teach.name.en.slice(0, 200) },
            designation: { bn: teach.designation.bn.slice(0, 200), en: teach.designation.en.slice(0, 200) },
            subject: { bn: teach.subject.bn.slice(0, 200), en: teach.subject.en.slice(0, 200) },
            qualification: { bn: teach.qualification.bn.slice(0, 300), en: teach.qualification.en.slice(0, 300) },
            photo: (teach.photo || '').slice(0, 600000),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        current.ebooks.forEach((eb) => {
          const id = sanitizeFirestoreId(eb.id);
          batch.set(doc(db, 'ebooks', id), {
            id,
            title: { bn: eb.title.bn.slice(0, 300), en: eb.title.en.slice(0, 300) },
            classId: eb.classId.slice(0, 16),
            className: { bn: eb.className.bn.slice(0, 100), en: eb.className.en.slice(0, 100) },
            subject: eb.subject.slice(0, 120),
            coverUrl: (eb.coverUrl || '').slice(0, 600000),
            downloadUrl: (eb.downloadUrl || '#').slice(0, 2000),
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        current.gallery.forEach((g) => {
          const id = sanitizeFirestoreId(g.id);
          batch.set(doc(db, 'gallery', id), {
            id,
            url: (g.url || '').slice(0, 600000),
            caption: { bn: g.caption.bn.slice(0, 400), en: g.caption.en.slice(0, 400) },
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        current.holidays.forEach((h) => {
          const id = sanitizeFirestoreId(h.id);
          batch.set(doc(db, 'holidays', id), {
            id,
            title: { bn: h.title.bn.slice(0, 300), en: h.title.en.slice(0, 300) },
            date: h.date.slice(0, 32),
            duration: { bn: h.duration.bn.slice(0, 100), en: h.duration.en.slice(0, 100) },
            type: h.type,
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();
        setDbStatus('synced');
      } catch (err) {
        setDbStatus('error');
        handleFirestoreError(err, OperationType.WRITE, 'initial-seed');
      }
    };

    seedCloudIfEmpty();
    return () => {
      cancelled = true;
    };
  }, [isCloudAdmin]);

  // Real-time Firestore Listeners for Public School Data
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          const nextSettings: SchoolSettings = {
            name: d.name,
            eiin: d.eiin,
            phone: d.phone,
            email: d.email,
            location: d.location,
            schoolPhoto: d.schoolPhoto || '',
          };
          setSettings(nextSettings);
          safeLocalSet('school_settings', nextSettings);
        }
      },
      (err) => {
        console.warn('Settings listener warning:', err);
      }
    );

    const unsubNotices = onSnapshot(
      query(collection(db, 'notices'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              title: data.title,
              date: data.date,
              category: data.category,
              description: data.description,
              ...(data.pdfUrl ? { pdfUrl: data.pdfUrl } : {}),
            } as Notice;
          });
          items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setNotices(items);
          safeLocalSet('db_notices', items);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'notices')
    );

    const unsubTeachers = onSnapshot(
      query(collection(db, 'teachers'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              name: data.name,
              designation: data.designation,
              subject: data.subject,
              qualification: data.qualification,
              photo: data.photo,
            } as Teacher;
          });
          setTeachers(items);
          safeLocalSet('db_teachers', items);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'teachers')
    );

    const unsubEbooks = onSnapshot(
      query(collection(db, 'ebooks'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              title: data.title,
              classId: data.classId,
              className: data.className,
              subject: data.subject,
              coverUrl: data.coverUrl,
              downloadUrl: data.downloadUrl,
            } as EBook;
          });
          setEbooks(items);
          safeLocalSet('db_ebooks', items);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'ebooks')
    );

    const unsubGallery = onSnapshot(
      query(collection(db, 'gallery'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              url: data.url,
              caption: data.caption,
            } as GalleryItem;
          });
          setGallery(items);
          safeLocalSet('db_gallery', items);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'gallery')
    );

    const unsubHolidays = onSnapshot(
      query(collection(db, 'holidays'), where('isPublic', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              title: data.title,
              date: data.date,
              duration: data.duration,
              type: data.type,
            } as Holiday;
          });
          items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
          setHolidays(items);
          safeLocalSet('db_holidays', items);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'holidays')
    );

    return () => {
      unsubSettings();
      unsubNotices();
      unsubTeachers();
      unsubEbooks();
      unsubGallery();
      unsubHolidays();
    };
  }, []);

  // Real-time Admin-only listeners for Admissions & Contact Messages
  useEffect(() => {
    if (!isCloudAdmin) return;

    const unsubAdmissions = onSnapshot(
      collection(db, 'admissions'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as AdmissionApplication);
        setAdmissions(items);
        safeLocalSet('admission_applications', items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'admissions')
    );

    const unsubMessages = onSnapshot(
      collection(db, 'contactMessages'),
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: data.id,
            name: data.name,
            mobile: data.mobile,
            email: data.email || '',
            message: data.message,
            status: data.status,
          } as ContactMessage;
        });
        setContactMessages(items);
        safeLocalSet('contact_messages', items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'contactMessages')
    );

    return () => {
      unsubAdmissions();
      unsubMessages();
    };
  }, [isCloudAdmin]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const persistLocal = (key: string, data: any) => {
    setDbStatus('syncing');
    safeLocalSet(key, data);
    setTimeout(() => setDbStatus('synced'), 400);
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      return false;
    }
  };

  const logoutGoogle = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Google Sign-Out failed:', err);
    }
  };

  const login = (authUser: AuthUser) => {
    setUser(authUser);
    safeLocalSet('school_user', authUser);
  };

  const register = (newUser: AuthUser): boolean => {
    if (registeredUsers.some(u => u.userId.toLowerCase() === newUser.userId.toLowerCase())) return false;
    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    persistLocal('registered_users', updated);
    return true;
  };

  const updateUser = (updatedUser: AuthUser) => {
    const updated = registeredUsers.map(u => u.userId === updatedUser.userId ? updatedUser : u);
    setRegisteredUsers(updated);
    persistLocal('registered_users', updated);
    if (user?.userId === updatedUser.userId) {
      setUser(updatedUser);
      safeLocalSet('school_user', updatedUser);
    }
  };

  const deleteUser = (userId: string) => {
    if (userId === 'admin') return;
    const updated = registeredUsers.filter(u => u.userId !== userId);
    setRegisteredUsers(updated);
    persistLocal('registered_users', updated);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_user');
    if (firebaseUser) {
      logoutGoogle();
    }
  };

  // Cloud + Local CRUD helpers
  const syncDocUpsert = async (
    collectionName: string,
    id: string,
    payload: Record<string, any>,
    isUpdate: boolean
  ) => {
    if (!isCloudAdmin) return;
    setDbStatus('syncing');
    const docRef = doc(db, collectionName, id);
    try {
      if (isUpdate) {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
      } else {
        await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setDbStatus('synced');
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, `${collectionName}/${id}`);
    }
  };

  const syncDocDelete = async (collectionName: string, id: string) => {
    if (!isCloudAdmin) return;
    setDbStatus('syncing');
    try {
      await deleteDoc(doc(db, collectionName, id));
      setDbStatus('synced');
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  const addNotice = (n: Notice) => {
    const id = sanitizeFirestoreId(n.id);
    const item = { ...n, id };
    const updated = [item, ...notices];
    setNotices(updated);
    persistLocal('db_notices', updated);
    syncDocUpsert('notices', id, {
      id,
      title: { bn: n.title.bn.slice(0, 300), en: n.title.en.slice(0, 300) },
      date: n.date.slice(0, 32),
      category: n.category,
      description: { bn: n.description.bn.slice(0, 5000), en: n.description.en.slice(0, 5000) },
      ...(n.pdfUrl ? { pdfUrl: n.pdfUrl.slice(0, 2000) } : {}),
      isPublic: true,
    }, false);
  };

  const updateNotice = (n: Notice) => {
    const id = sanitizeFirestoreId(n.id);
    const updated = notices.map(i => i.id === n.id ? { ...n, id } : i);
    setNotices(updated);
    persistLocal('db_notices', updated);
    syncDocUpsert('notices', id, {
      id,
      title: { bn: n.title.bn.slice(0, 300), en: n.title.en.slice(0, 300) },
      date: n.date.slice(0, 32),
      category: n.category,
      description: { bn: n.description.bn.slice(0, 5000), en: n.description.en.slice(0, 5000) },
      ...(n.pdfUrl ? { pdfUrl: n.pdfUrl.slice(0, 2000) } : {}),
      isPublic: true,
    }, true);
  };

  const deleteNotice = (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    persistLocal('db_notices', updated);
    syncDocDelete('notices', sanitizeFirestoreId(id));
  };

  const addTeacher = (teach: Teacher) => {
    const id = sanitizeFirestoreId(teach.id);
    const item = { ...teach, id };
    const updated = [...teachers, item];
    setTeachers(updated);
    persistLocal('db_teachers', updated);
    syncDocUpsert('teachers', id, {
      id,
      name: { bn: teach.name.bn.slice(0, 200), en: teach.name.en.slice(0, 200) },
      designation: { bn: teach.designation.bn.slice(0, 200), en: teach.designation.en.slice(0, 200) },
      subject: { bn: teach.subject.bn.slice(0, 200), en: teach.subject.en.slice(0, 200) },
      qualification: { bn: teach.qualification.bn.slice(0, 300), en: teach.qualification.en.slice(0, 300) },
      photo: (teach.photo || '').slice(0, 600000),
      isPublic: true,
    }, false);
  };

  const updateTeacher = (teach: Teacher) => {
    const id = sanitizeFirestoreId(teach.id);
    const updated = teachers.map(i => i.id === teach.id ? { ...teach, id } : i);
    setTeachers(updated);
    persistLocal('db_teachers', updated);
    syncDocUpsert('teachers', id, {
      id,
      name: { bn: teach.name.bn.slice(0, 200), en: teach.name.en.slice(0, 200) },
      designation: { bn: teach.designation.bn.slice(0, 200), en: teach.designation.en.slice(0, 200) },
      subject: { bn: teach.subject.bn.slice(0, 200), en: teach.subject.en.slice(0, 200) },
      qualification: { bn: teach.qualification.bn.slice(0, 300), en: teach.qualification.en.slice(0, 300) },
      photo: (teach.photo || '').slice(0, 600000),
      isPublic: true,
    }, true);
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    persistLocal('db_teachers', updated);
    syncDocDelete('teachers', sanitizeFirestoreId(id));
  };

  const addEbook = (b: EBook) => {
    const id = sanitizeFirestoreId(b.id);
    const item = { ...b, id };
    const updated = [...ebooks, item];
    setEbooks(updated);
    persistLocal('db_ebooks', updated);
    syncDocUpsert('ebooks', id, {
      id,
      title: { bn: b.title.bn.slice(0, 300), en: b.title.en.slice(0, 300) },
      classId: b.classId.slice(0, 16),
      className: { bn: b.className.bn.slice(0, 100), en: b.className.en.slice(0, 100) },
      subject: b.subject.slice(0, 120),
      coverUrl: (b.coverUrl || '').slice(0, 600000),
      downloadUrl: (b.downloadUrl || '#').slice(0, 2000),
      isPublic: true,
    }, false);
  };

  const updateEbook = (b: EBook) => {
    const id = sanitizeFirestoreId(b.id);
    const updated = ebooks.map(i => i.id === b.id ? { ...b, id } : i);
    setEbooks(updated);
    persistLocal('db_ebooks', updated);
    syncDocUpsert('ebooks', id, {
      id,
      title: { bn: b.title.bn.slice(0, 300), en: b.title.en.slice(0, 300) },
      classId: b.classId.slice(0, 16),
      className: { bn: b.className.bn.slice(0, 100), en: b.className.en.slice(0, 100) },
      subject: b.subject.slice(0, 120),
      coverUrl: (b.coverUrl || '').slice(0, 600000),
      downloadUrl: (b.downloadUrl || '#').slice(0, 2000),
      isPublic: true,
    }, true);
  };

  const deleteEbook = (id: string) => {
    const updated = ebooks.filter(b => b.id !== id);
    setEbooks(updated);
    persistLocal('db_ebooks', updated);
    syncDocDelete('ebooks', sanitizeFirestoreId(id));
  };

  const addGalleryItem = (i: GalleryItem) => {
    const id = sanitizeFirestoreId(i.id);
    const item = { ...i, id };
    const updated = [item, ...gallery];
    setGallery(updated);
    persistLocal('db_gallery', updated);
    syncDocUpsert('gallery', id, {
      id,
      url: (i.url || '').slice(0, 600000),
      caption: { bn: i.caption.bn.slice(0, 400), en: i.caption.en.slice(0, 400) },
      isPublic: true,
    }, false);
  };

  const updateGalleryItem = (i: GalleryItem) => {
    const id = sanitizeFirestoreId(i.id);
    const updated = gallery.map(item => item.id === i.id ? { ...i, id } : item);
    setGallery(updated);
    persistLocal('db_gallery', updated);
    syncDocUpsert('gallery', id, {
      id,
      url: (i.url || '').slice(0, 600000),
      caption: { bn: i.caption.bn.slice(0, 400), en: i.caption.en.slice(0, 400) },
      isPublic: true,
    }, true);
  };

  const deleteGalleryItem = (id: string) => {
    const updated = gallery.filter(i => i.id !== id);
    setGallery(updated);
    persistLocal('db_gallery', updated);
    syncDocDelete('gallery', sanitizeFirestoreId(id));
  };

  const addHoliday = (h: Holiday) => {
    const id = sanitizeFirestoreId(h.id);
    const item = { ...h, id };
    const updated = [...holidays, item];
    setHolidays(updated);
    persistLocal('db_holidays', updated);
    syncDocUpsert('holidays', id, {
      id,
      title: { bn: h.title.bn.slice(0, 300), en: h.title.en.slice(0, 300) },
      date: h.date.slice(0, 32),
      duration: { bn: h.duration.bn.slice(0, 100), en: h.duration.en.slice(0, 100) },
      type: h.type,
      isPublic: true,
    }, false);
  };

  const updateHoliday = (h: Holiday) => {
    const id = sanitizeFirestoreId(h.id);
    const updated = holidays.map(i => i.id === h.id ? { ...h, id } : i);
    setHolidays(updated);
    persistLocal('db_holidays', updated);
    syncDocUpsert('holidays', id, {
      id,
      title: { bn: h.title.bn.slice(0, 300), en: h.title.en.slice(0, 300) },
      date: h.date.slice(0, 32),
      duration: { bn: h.duration.bn.slice(0, 100), en: h.duration.en.slice(0, 100) },
      type: h.type,
      isPublic: true,
    }, true);
  };

  const deleteHoliday = (id: string) => {
    const updated = holidays.filter(h => h.id !== id);
    setHolidays(updated);
    persistLocal('db_holidays', updated);
    syncDocDelete('holidays', sanitizeFirestoreId(id));
  };

  const updateSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    persistLocal('school_settings', newSettings);
    if (isCloudAdmin) {
      setDbStatus('syncing');
      setDoc(doc(db, 'settings', 'main'), {
        name: { bn: newSettings.name.bn.slice(0, 200), en: newSettings.name.en.slice(0, 200) },
        eiin: newSettings.eiin.slice(0, 32),
        phone: newSettings.phone.slice(0, 40),
        email: newSettings.email.slice(0, 150),
        location: { bn: newSettings.location.bn.slice(0, 300), en: newSettings.location.en.slice(0, 300) },
        ...(newSettings.schoolPhoto ? { schoolPhoto: newSettings.schoolPhoto.slice(0, 600000) } : {}),
        updatedAt: serverTimestamp(),
      })
        .then(() => setDbStatus('synced'))
        .catch((err) => {
          setDbStatus('error');
          handleFirestoreError(err, OperationType.WRITE, 'settings/main');
        });
    }
  };

  // Public Admission Submission -> Saved Locally + Cloud Firestore
  const addAdmission = async (appData: AdmissionApplication) => {
    const appId = sanitizeFirestoreId(appData.appId);
    const cleanApp: AdmissionApplication = {
      ...appData,
      appId,
      status: 'pending',
      ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
    };
    const updated = [cleanApp, ...admissions];
    setAdmissions(updated);
    persistLocal('admission_applications', updated);

    try {
      setDbStatus('syncing');
      await setDoc(doc(db, 'admissions', appId), {
        appId,
        studentName: cleanApp.studentName.slice(0, 150),
        fatherName: cleanApp.fatherName.slice(0, 150),
        motherName: cleanApp.motherName.slice(0, 150),
        guardianMobile: cleanApp.guardianMobile.slice(0, 30),
        targetClass: cleanApp.targetClass.slice(0, 40),
        targetGroup: (cleanApp.targetGroup || 'General').slice(0, 40),
        birthDate: cleanApp.birthDate.slice(0, 32),
        address: cleanApp.address.slice(0, 400),
        ...(cleanApp.prevSchool ? { prevSchool: cleanApp.prevSchool.slice(0, 200) } : {}),
        ...(cleanApp.bloodGroup ? { bloodGroup: cleanApp.bloodGroup.slice(0, 16) } : {}),
        status: 'pending',
        submittedDate: cleanApp.submittedDate.slice(0, 40),
        ...(firebaseUser?.emailVerified ? { ownerUid: firebaseUser.uid } : {}),
        createdAt: serverTimestamp(),
      });
      setDbStatus('synced');
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, OperationType.CREATE, `admissions/${appId}`);
    }
  };

  const updateAdmissionStatus = async (appId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updated = admissions.map((a) => (a.appId === appId ? { ...a, status } : a));
    setAdmissions(updated);
    persistLocal('admission_applications', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'admissions', sanitizeFirestoreId(appId)), {
        status,
        updatedAt: serverTimestamp(),
      });
      setDbStatus('synced');
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, OperationType.UPDATE, `admissions/${appId}`);
    }
  };

  const deleteAdmission = async (appId: string) => {
    const updated = admissions.filter((a) => a.appId !== appId);
    setAdmissions(updated);
    persistLocal('admission_applications', updated);
    await syncDocDelete('admissions', sanitizeFirestoreId(appId));
  };

  // Public Contact Form Submission -> Saved Locally + Cloud Firestore
  const addContactMessage = async (msgData: ContactMessage) => {
    const id = sanitizeFirestoreId(msgData.id);
    const cleanMsg: ContactMessage = { ...msgData, id, status: 'unread' };
    const updated = [cleanMsg, ...contactMessages];
    setContactMessages(updated);
    persistLocal('contact_messages', updated);

    try {
      setDbStatus('syncing');
      await setDoc(doc(db, 'contactMessages', id), {
        id,
        name: cleanMsg.name.slice(0, 150),
        mobile: cleanMsg.mobile.slice(0, 30),
        ...(cleanMsg.email ? { email: cleanMsg.email.slice(0, 150) } : {}),
        message: cleanMsg.message.slice(0, 2000),
        status: 'unread',
        createdAt: serverTimestamp(),
      });
      setDbStatus('synced');
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, OperationType.CREATE, `contactMessages/${id}`);
    }
  };

  const markContactMessageRead = async (id: string) => {
    const updated = contactMessages.map((m) => (m.id === id ? { ...m, status: 'read' as const } : m));
    setContactMessages(updated);
    persistLocal('contact_messages', updated);
    if (!isCloudAdmin) return;
    try {
      setDbStatus('syncing');
      await updateDoc(doc(db, 'contactMessages', sanitizeFirestoreId(id)), { status: 'read' });
      setDbStatus('synced');
    } catch (err) {
      setDbStatus('error');
      handleFirestoreError(err, OperationType.UPDATE, `contactMessages/${id}`);
    }
  };

  const deleteContactMessage = async (id: string) => {
    const updated = contactMessages.filter((m) => m.id !== id);
    setContactMessages(updated);
    persistLocal('contact_messages', updated);
    await syncDocDelete('contactMessages', sanitizeFirestoreId(id));
  };

  const exportDatabase = () => {
    const data = {
      settings,
      notices,
      teachers,
      ebooks,
      gallery,
      holidays,
      admissions,
      contactMessages,
      users: registeredUsers,
      exportDate: new Date().toISOString(),
    };
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
      if (data.settings) {
        setSettings(data.settings);
        safeLocalSet('school_settings', data.settings);
        if (isCloudAdmin) updateSettings(data.settings);
      }
      if (data.notices) {
        setNotices(data.notices);
        safeLocalSet('db_notices', data.notices);
        if (isCloudAdmin) data.notices.forEach((n: Notice) => updateNotice(n));
      }
      if (data.teachers) {
        setTeachers(data.teachers);
        safeLocalSet('db_teachers', data.teachers);
        if (isCloudAdmin) data.teachers.forEach((teach: Teacher) => updateTeacher(teach));
      }
      if (data.users) {
        setRegisteredUsers(data.users);
        safeLocalSet('registered_users', data.users);
      }
      if (data.ebooks) {
        setEbooks(data.ebooks);
        safeLocalSet('db_ebooks', data.ebooks);
        if (isCloudAdmin) data.ebooks.forEach((eb: EBook) => updateEbook(eb));
      }
      if (data.gallery) {
        setGallery(data.gallery);
        safeLocalSet('db_gallery', data.gallery);
        if (isCloudAdmin) data.gallery.forEach((g: GalleryItem) => updateGalleryItem(g));
      }
      if (data.holidays) {
        setHolidays(data.holidays);
        safeLocalSet('db_holidays', data.holidays);
        if (isCloudAdmin) data.holidays.forEach((h: Holiday) => updateHoliday(h));
      }
      if (data.admissions) {
        setAdmissions(data.admissions);
        safeLocalSet('admission_applications', data.admissions);
      }
      if (data.contactMessages) {
        setContactMessages(data.contactMessages);
        safeLocalSet('contact_messages', data.contactMessages);
      }
      return true;
    } catch {
      return false;
    }
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
      lang, setLang, user, firebaseUser, isCloudAdmin, signInWithGoogle, logoutGoogle,
      login, register, updateUser, deleteUser, logout, t, getUsers: () => registeredUsers,
      notices, addNotice, updateNotice, deleteNotice, 
      teachers, addTeacher, updateTeacher, deleteTeacher, 
      ebooks, addEbook, updateEbook, deleteEbook, 
      gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, 
      holidays, addHoliday, updateHoliday, deleteHoliday,
      admissions, addAdmission, updateAdmissionStatus, deleteAdmission,
      contactMessages, addContactMessage, markContactMessageRead, deleteContactMessage,
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

          <OfflineIndicator />
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
