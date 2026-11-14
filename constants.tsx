
import { Notice, Teacher, GalleryItem, AcademicClass, LocalizedString, Holiday, Syllabus, ClassRoutine } from './types';

export const SCHOOL_NAME: LocalizedString = {
  bn: "রাণীর বাজার মাধ্যমিক বিদ্যালয়",
  en: "Ranir Bazar Secondary High School"
};

export const EIIN = "105342";

export const CONTACT_INFO = {
  mobile: "01516528497",
  email: "mdjahidulislam1025@gmail.com",
  location: {
    bn: "রানির বাজার, চৌদ্দগ্রাম, কুমিল্লা",
    en: "Ranir Bazar, Chauddagram, Cumilla"
  }
};

export interface EBook {
  id: string;
  title: LocalizedString;
  classId: string;
  className: LocalizedString;
  coverUrl: string;
  downloadUrl: string;
  subject: string;
}

export const E_BOOKS_2026: EBook[] = [
  // Class 6 - NCTB 2026
  {
    id: 'c6-bn',
    title: { bn: 'বাংলা (৬ষ্ঠ)', en: 'Bangla (Class 6)' },
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subject: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c6-en',
    title: { bn: 'English (Class 6)', en: 'English (Class 6)' },
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subject: 'English',
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c6-math',
    title: { bn: 'গণিত (৬ষ্ঠ)', en: 'Mathematics (Class 6)' },
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subject: 'Math',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c6-sci-inq',
    title: { bn: 'বিজ্ঞান: অনুসন্ধানী পাঠ', en: 'Science: Inquiry Path' },
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subject: 'Science',
    coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c6-sci-prac',
    title: { bn: 'বিজ্ঞান: অনুশীলন বই', en: 'Science: Practice Book' },
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subject: 'Science',
    coverUrl: 'https://images.unsplash.com/photo-1636466484292-711224159c5a?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c6-digi',
    title: { bn: 'ডিজিটাল প্রযুক্তি', en: 'Digital Technology' },
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subject: 'Tech',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },

  // Class 7 - NCTB 2026
  {
    id: 'c7-bn',
    title: { bn: 'বাংলা (৭ম)', en: 'Bangla (Class 7)' },
    classId: '7',
    className: { bn: '৭ম শ্রেণী', en: 'Class 7' },
    subject: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c7-math',
    title: { bn: 'গণিত (৭ম)', en: 'Mathematics (Class 7)' },
    classId: '7',
    className: { bn: '৭ম শ্রেণী', en: 'Class 7' },
    subject: 'Math',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c7-his',
    title: { bn: 'ইতিহাস ও সামাজিক বিজ্ঞান', en: 'History & Social Science' },
    classId: '7',
    className: { bn: '৭ম শ্রেণী', en: 'Class 7' },
    subject: 'Social',
    coverUrl: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },

  // Class 8 - NCTB 2026
  {
    id: 'c8-bn',
    title: { bn: 'বাংলা (৮ম)', en: 'Bangla (Class 8)' },
    classId: '8',
    className: { bn: '৮ম শ্রেণী', en: 'Class 8' },
    subject: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c8-math',
    title: { bn: 'গণিত (৮ম)', en: 'Mathematics (Class 8)' },
    classId: '8',
    className: { bn: '৮ম শ্রেণী', en: 'Class 8' },
    subject: 'Math',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },

  // Class 9-10 - NCTB 2026
  {
    id: 'c9-phy',
    title: { bn: 'পদার্থবিজ্ঞান (৯ম)', en: 'Physics (Class 9)' },
    classId: '9',
    className: { bn: '৯ম শ্রেণী', en: 'Class 9' },
    subject: 'Science',
    coverUrl: 'https://images.unsplash.com/photo-1636466484292-711224159c5a?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c9-chem',
    title: { bn: 'রসায়ন (৯ম)', en: 'Chemistry (Class 9)' },
    classId: '9',
    className: { bn: '৯ম শ্রেণী', en: 'Class 9' },
    subject: 'Science',
    coverUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  },
  {
    id: 'c10-bio',
    title: { bn: 'জীববিজ্ঞান (১০ম)', en: 'Biology (Class 10)' },
    classId: '10',
    className: { bn: '১০ম শ্রেণী', en: 'Class 10' },
    subject: 'Science',
    coverUrl: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=300&h=400',
    downloadUrl: '#'
  }
];

export const SYLLABUS_2026: Syllabus[] = [
  {
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subjects: [
      { name: { bn: 'বাংলা', en: 'Bangla' }, code: '101' },
      { name: { bn: 'ইংরেজি', en: 'English' }, code: '107' },
      { name: { bn: 'গণিত', en: 'Mathematics' }, code: '109' },
    ]
  },
  {
    classId: '9',
    className: { bn: '৯ম শ্রেণী', en: 'Class 9' },
    subjects: [
      { name: { bn: 'বাংলা', en: 'Bangla' }, code: '101' },
      { name: { bn: 'ইংরেজি', en: 'English' }, code: '107' },
      { name: { bn: 'গণিত', en: 'Mathematics' }, code: '109' },
    ]
  },
  {
    classId: '10',
    className: { bn: '১০ম শ্রেণী', en: 'Class 10' },
    subjects: [
      { name: { bn: 'বাংলা', en: 'Bangla' }, code: '101' },
      { name: { bn: 'ইংরেজি', en: 'English' }, code: '107' },
      { name: { bn: 'গণিত', en: 'Mathematics' }, code: '109' },
      { name: { bn: 'পদার্থবিজ্ঞান', en: 'Physics' }, code: '071' },
    ]
  }
];

const DAYS = [
  { bn: 'শনিবার', en: 'Saturday' },
  { bn: 'রবিবার', en: 'Sunday' },
  { bn: 'সোমবার', en: 'Monday' },
  { bn: 'মঙ্গলবার', en: 'Tuesday' },
  { bn: 'বুধবার', en: 'Wednesday' },
  { bn: 'বৃহস্পতিবার', en: 'Thursday' },
];

export const CLASS_ROUTINES: ClassRoutine[] = [
  {
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    schedule: DAYS.map(day => ({
      day,
      periods: [
        { time: '10:00 - 10:45', subject: { bn: 'বাংলা', en: 'Bangla' } },
        { time: '10:45 - 11:30', subject: { bn: 'ইংরেজি', en: 'English' } },
        { time: '11:30 - 12:15', subject: { bn: 'গণিত', en: 'Math' } },
      ]
    }))
  }
];

export const HOLIDAYS_2026: Holiday[] = [
  {
    id: 'h1',
    title: { bn: 'শহীদ দিবস', en: 'Martyrs Day' },
    date: '2026-02-21',
    duration: { bn: '১ দিন', en: '1 Day' },
    type: 'National'
  },
  {
    id: 'h2',
    title: { bn: 'স্বাধীনতা দিবস', en: 'Independence Day' },
    date: '2026-03-26',
    duration: { bn: '১ দিন', en: '1 Day' },
    type: 'National'
  }
];

export const NOTICES: Notice[] = [
  {
    id: 'n1',
    title: { bn: 'ভর্তি বিজ্ঞপ্তি ২০২৬', en: 'Admission Notice 2026' },
    date: '2026-01-05',
    category: 'Admission',
    description: { 
      bn: '২০২৬ শিক্ষাবর্ষে ৬ষ্ঠ থেকে ৯ম শ্রেণীতে অনলাইনে ভর্তি আবেদন শুরু হয়েছে।', 
      en: 'Online admission applications for classes 6 to 9 for the 2026 academic year have started.' 
    }
  },
  {
    id: 'n2',
    title: { bn: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬', en: 'Half-Yearly Exam 2026' },
    date: '2026-06-15',
    category: 'Exam',
    description: { 
      bn: 'সকল শ্রেণীর অর্ধ-বার্ষিক পরীক্ষা আগামী ১৫ই জুন থেকে শুরু হবে।', 
      en: 'Half-yearly examination for all classes will start from June 15.' 
    }
  },
  {
    id: 'n3',
    title: { bn: 'বার্ষিক পরীক্ষা ২০২৬', en: 'Annual Exam 2026' },
    date: '2026-11-20',
    category: 'Exam',
    description: { 
      bn: 'সকল শ্রেণীর বার্ষিক পরীক্ষা আগামী ২০শে নভেম্বর থেকে শুরু হবে।', 
      en: 'Annual examination for all classes will start from November 20.' 
    }
  }
];

export const TEACHERS: Teacher[] = [
  {
    id: 'head-teacher',
    name: { bn: 'মোঃ আব্দুল কুদ্দুস', en: 'Md. Abdul Kuddus' },
    designation: { bn: 'প্রধান শিক্ষক', en: 'Head Teacher' },
    subject: { bn: 'প্রশাসন', en: 'Administration' },
    qualification: { bn: 'এম.এ, বি.এড', en: 'MA, BEd' },
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 't2',
    name: { bn: 'মোসাম্মাৎ জেসমিন আক্তার', en: 'Mst. Jasmine Akter' },
    designation: { bn: 'सहকারী শিক্ষক', en: 'Assistant Teacher' },
    subject: { bn: 'ইংরেজি', en: 'English' },
    qualification: { bn: 'বি.এ (সম্মান), এম.এ', en: 'BA (Hons), MA' },
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400'
  }
];

export const GALLERY: GalleryItem[] = [
  {
    id: 'g1',
    url: 'https://images.unsplash.com/photo-1523050853064-8504f2f40fd5?auto=format&fit=crop&q=80&w=800&h=600',
    caption: { bn: 'বিদ্যালয় প্রাঙ্গণ', en: 'School Campus' }
  },
  {
    id: 'g2',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800&h=600',
    caption: { bn: 'শ্রেণীকক্ষের কার্যক্রম', en: 'Classroom Activities' }
  }
];

export const CLASSES: AcademicClass[] = [
  { className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' }, sections: ['A'], totalStudents: 120 },
  { className: { bn: '৭ম শ্রেণী', en: 'Class 7' }, sections: ['A'], totalStudents: 115 },
  { className: { bn: '৮ম শ্রেণী', en: 'Class 8' }, sections: ['A'], totalStudents: 110 },
  { className: { bn: '৯ম শ্রেণী', en: 'Class 9' }, sections: ['Science', 'Arts', 'Commerce'], totalStudents: 105 },
  { className: { bn: '১০ম শ্রেণী', en: 'Class 10' }, sections: ['Science', 'Arts', 'Commerce'], totalStudents: 100 },
];

export const TRANSLATIONS = {
  nav: {
    home: { bn: 'মূল পাতা', en: 'Home' },
    about: { bn: 'বিদ্যালয় পরিচিতি', en: 'About' },
    notices: { bn: 'নোটিশ বোর্ড', en: 'Notice Board' },
    teachers: { bn: 'শিক্ষক মন্ডলী', en: 'Teachers' },
    admission: { bn: 'ভর্তি তথ্য', en: 'Admission' },
    gallery: { bn: 'গ্যালারি', en: 'Gallery' },
    contact: { bn: 'যোগাযোগ', en: 'Contact' },
    login: { bn: 'লগইন', en: 'Login' },
    studentLogin: { bn: 'শিক্ষার্থী লগইন', en: 'Student Login' },
    teacherLogin: { bn: 'শিক্ষক লগইন', en: 'Teacher Login' },
    adminLogin: { bn: 'অ্যাডমিন লগইন', en: 'Admin Login' },
    syllabus: { bn: 'সিলেবাস', en: 'Syllabus' },
    routine: { bn: 'ক্লাস রুটিন', en: 'Class Routine' },
    ebooks: { bn: 'ই-বুক লাইব্রেরি', en: 'E-book Library' },
  },
  // ... rest of translations
  hero: {
    subtitle: { bn: 'জ্ঞানের আলোয় আলোকিত হোক আগামীর ভবিষ্যৎ।', en: 'Let the light of knowledge illuminate the future.' },
    apply: { bn: 'ভর্তি সংক্রান্ত তথ্য', en: 'Admission Info' },
    learnMore: { bn: 'বিস্তারিত জানুন', en: 'Learn More' },
  },
  stats: {
    students: { bn: 'ছাত্র-ছাত্রী', en: 'Students' },
    teachers: { bn: 'শিক্ষক মন্ডলী', en: 'Teachers' },
    passRate: { bn: 'পাশের হার', en: 'Pass Rate' },
    library: { bn: 'পাঠাগার', en: 'Library' },
  },
  headMessage: {
    title: { bn: 'প্রধান শিক্ষকের বাণী', en: "Head Teacher's Message" },
    greeting: { bn: 'শুভেচ্ছা বার্তা', en: 'Greeting Message' },
    body: { bn: '"আমরা শিক্ষার্থীকে সুনাগরিক হিসেবে গড়ে তোলাই আমাদের লক্ষ্য। জ্ঞানের মশাল বহন করে এগিয়ে যাক আমাদের প্রতিটি শিক্ষার্থী।"', en: '"Our goal is to build students as good citizens. Let every student move forward carrying the torch of knowledge."' }
  },
  admission: {
    title: { bn: 'ভর্তি সংক্রান্ত তথ্য', en: 'Admission Information' },
    desc: { bn: 'ভর্তি সংক্রান্ত সকল তথ্য এখানে পাওয়া যাবে।', en: 'All admission related information can be found here.' },
    process: { bn: 'ভর্তি প্রক্রিয়া', en: 'Admission Process' },
    onlineApply: { bn: 'অনলাইন আবেদন', en: 'Online Application' },
    applyBtn: { bn: 'আবেদন ফরম পূরণ করুন', en: 'Fill Application' },
    back: { bn: 'তথ্য পাতায় ফিরে যান', en: 'Back' },
    formTitle: { bn: 'অনলাইন ভর্তি ফরম', en: 'Online Admission Form' },
    successTitle: { bn: 'আবেদন সফল হয়েছে!', en: 'Successful!' },
    successDesc: { bn: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।', en: 'We will contact you soon.' },
    appId: { bn: 'আবেদন আইডি:', en: 'App ID:' },
    backHome: { bn: 'মূল পাতায় ফিরে যান', en: 'Home' },
  },
  login: {
    studentTitle: { bn: 'শিক্ষার্থী লগইন পোর্টাল', en: 'Student Login Portal' },
    teacherTitle: { bn: 'শিক্ষক লগইন পোর্টাল', en: 'Teacher Login Portal' },
    adminTitle: { bn: 'অ্যাডমিন লগইন পোর্টাল', en: 'Admin Login Portal' },
    username: { bn: 'ইউজার আইডি / রোল নম্বর', en: 'User ID' },
    password: { bn: 'পাসওয়ার্ড', en: 'Password' },
    signIn: { bn: 'লগইন করুন', en: 'Sign In' },
    rememberMe: { bn: 'মনে রাখুন', en: 'Remember Me' },
    forgotPassword: { bn: 'পাসওয়ার্ড ভুলে গেছেন?', en: 'Forgot?' },
    studentTab: { bn: 'শিক্ষার্থী', en: 'Student' },
    teacherTab: { bn: 'শিক্ষক', en: 'Teacher' },
    adminTab: { bn: 'অ্যাডমিন', en: 'Admin' },
  },
  holiday: {
    title: { bn: 'ছুটির তালিকা', en: 'Academic Holiday List' },
    subtitle: { bn: 'ছুটির তালিকা নিচে দেওয়া হলো।', en: 'Holiday list is below.' },
    date: { bn: 'তারিখ', en: 'Date' },
    holidayName: { bn: 'ছুটির নাম', en: 'Holiday Name' },
    duration: { bn: 'সময়কাল', en: 'Duration' },
    type: { bn: 'ধরণ', en: 'Type' },
    note: { bn: '*চাঁদ দেখার উপর নির্ভরশীল', en: '*Subject to Moon' }
  },
  form: {
    studentName: { bn: 'শিক্ষার্থীর নাম', en: "Student Name" },
    fatherName: { bn: 'পিতার নাম', en: "Father's Name" },
    motherName: { bn: 'মাতার নাম', en: "Mother's Name" },
    guardianName: { bn: 'অভিভাবকের নাম', en: "Guardian Name" },
    guardianMobile: { bn: 'অভিভাবকের মোবাইল', en: "Guardian Mobile" },
    mobile: { bn: 'শিক্ষার্থীর মোবাইল (যদি থাকে)', en: "Student Mobile" },
    class: { bn: 'শ্রেণী', en: 'Class' },
    birthDate: { bn: 'জন্ম তারিখ', en: 'Date of Birth' },
    submit: { bn: 'দাখিল করুন', en: 'Submit' },
    submitting: { bn: 'পাঠানো হচ্ছে...', en: 'Submitting...' },
    selectClass: { bn: 'নির্বাচন করুন', en: 'Select' },
  },
  footer: {
    tagline: { bn: 'একটি মানসম্মত শিক্ষা প্রতিষ্ঠান যা দীর্ঘ দিন ধরে জ্ঞানের আলো ছড়িয়ে যাচ্ছে।', en: 'Spreading light of knowledge for a long time.' },
    links: { bn: 'দ্রুত লিংক', en: 'Quick Links' },
    academic: { bn: 'একাডেমিক', en: 'Academic' },
    social: { bn: 'সোশ্যাল মিডিয়া', en: 'Social' },
    copyright: { bn: 'সর্বস্বত্ব সংরক্ষিত।', en: 'All rights reserved.' },
    result: { bn: 'ফলাফল', en: 'Result' },
    holidays: { bn: 'ছুটির তালিকা', en: 'Holidays' },
    library: { bn: 'পাঠাগার', en: 'Library' },
  },
  ui: {
    seeAll: { bn: 'সব দেখুন', en: 'See All' },
    latestNews: { bn: 'সর্বশেষ সংবাদ:', en: 'Latest News:' },
    welcome: { bn: '-এ আপনাকে স্বাগতম!', en: ' Welcome!' },
    importantLinks: { bn: 'গুরুত্বপূর্ণ লিংক', en: 'Links' },
    help: { bn: 'সহায়তা চান?', en: 'Help?' },
    aiAssistant: { bn: 'শিক্ষার্থী সহায়ক (AI)', en: 'Assistant (AI)' },
    placeholder: { bn: 'আপনার প্রশ্ন লিখুন...', en: 'Type question...' },
    details: { bn: 'বিস্তারিত', en: 'Details' },
    downloadPdf: { bn: 'PDF ডাউনলোড', en: 'Download PDF' },
  }
};
