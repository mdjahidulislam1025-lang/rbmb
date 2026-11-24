import {
  Notice,
  NewsArticle,
  CampusEvent,
  Teacher,
  ClassRoutine,
  SyllabusItem,
  EBook,
  GalleryItem,
  Holiday,
  SchoolSettings,
  SchoolStudent,
  HomeworkItem,
  OnlineExam,
  ExamRoutineItem,
  SchoolSubject,
  AlumniProfile,
  FeeRecord,
  PortalNotification,
} from './types';
import {
  heroCampusImg,
  headTeacherImg,
  scienceLabImg,
  computerLabImg,
  sportsEventImg,
} from './src/assets/media';

export const CAMPUS_BRAND = {
  bn: 'আরবিএমবি ডিজিটাল ক্যাম্পাস',
  en: 'RBMB Digital Campus',
};

export const SCHOOL_NAME = {
  bn: 'রাণীর বাজার মাধ্যমিক বিদ্যালয়',
  en: 'Ranir Bazar Secondary High School',
};

export const CAMPUS_TAGLINE = {
  bn: 'শেখা, পাঠদান ও সংযোগের একটি স্মার্ট মাধ্যম',
  en: 'A Smarter Way to Learn, Teach and Connect',
};

export const INITIAL_SETTINGS: SchoolSettings = {
  name: SCHOOL_NAME,
  shortName: 'RBMB Digital Campus',
  tagline: CAMPUS_TAGLINE,
  eiin: '105842',
  phone: '+880 1711-000000',
  email: 'info@rbmb-campus.edu.bd',
  location: {
    bn: 'রাণীর বাজার, চৌদ্দগ্রাম, কুমিল্লা-৩৫৫০, বাংলাদেশ',
    en: 'Rani Bazar, Chauddagram, Cumilla-3550, Bangladesh',
  },
  schoolPhoto: heroCampusImg,
  headTeacherName: {
    bn: 'মোঃ আব্দুল করিম',
    en: 'Md. Abdul Karim',
  },
  headTeacherMessage: {
    bn: 'সুপ্রিয় শিক্ষার্থী, অভিভাবক ও প্রাক্তন শিক্ষার্থীবৃন্দ — আরবিএমবি ডিজিটাল ক্যাম্পাসে (রাণীর বাজার মাধ্যমিক বিদ্যালয়) আপনাদের স্বাগতম। ১৯৫৮ সাল থেকে আমাদের প্রতিষ্ঠান নৈতিক শিক্ষা, বিজ্ঞানমনস্কতা ও সহশিক্ষা কার্যক্রমে অগ্রণী ভূমিকা পালন করে আসছে। ডিজিটাল ক্লাসরুম, অনলাইন পরীক্ষা ও সমন্বিত পোর্টালের মাধ্যমে প্রতিটি শিক্ষার্থীকে যোগ্য বিশ্বনাগরিক হিসেবে গড়ে তোলাই আমাদের লক্ষ্য।',
    en: 'Dear Students, Guardians, and Alumni — welcome to RBMB Digital Campus (Ranir Bazar Secondary High School). Since 1958, our institution has championed moral values, scientific curiosity, and co-curricular excellence. Through smart classrooms, online assessments, and unified portals, we empower every learner for tomorrow.',
  },
  headTeacherPhoto: headTeacherImg,
  latitude: 23.2248,
  longitude: 91.3185,
};

export const DEVELOPER_CREDIT = {
  text: 'Developed by Jahidul Islam • IIT, University of Dhaka',
  short: 'Jahidul Islam (IIT, DU)',
};

export const TRANSLATIONS = {
  nav: {
    home: { bn: 'মূল পাতা', en: 'Home' },
    about: { bn: 'বিদ্যালয় পরিচিতি', en: 'About School' },
    aboutSchool: { bn: 'বিদ্যালয় পরিচিতি', en: 'About School' },
    academics: { bn: 'একাডেমিক', en: 'Academics' },
    notices: { bn: 'নোটিশ ও সংবাদ', en: 'Notice & News' },
    noticeNews: { bn: 'নোটিশ ও সংবাদ', en: 'Notice & News' },
    learningCenter: { bn: 'লার্নিং সেন্টার', en: 'Learning Center' },
    portals: { bn: 'পোর্টাল', en: 'Portals' },
    teachers: { bn: 'শিক্ষকমণ্ডলী', en: 'Teachers' },
    routine: { bn: 'রুটিন', en: 'Routine' },
    syllabus: { bn: 'সিলেবাস', en: 'Syllabus' },
    ebooks: { bn: 'ডিজিটাল লাইব্রেরি', en: 'Digital Library' },
    exams: { bn: 'অনলাইন পরীক্ষা', en: 'Online Exam' },
    holidays: { bn: 'ছুটির তালিকা', en: 'Holidays' },
    calendar: { bn: 'একাডেমিক ক্যালেন্ডার', en: 'Academic Calendar' },
    admission: { bn: 'অনলাইন ভর্তি', en: 'Online Admission' },
    gallery: { bn: 'গ্যালারি', en: 'Gallery' },
    alumni: { bn: 'অ্যালামনাই', en: 'Alumni' },
    contact: { bn: 'যোগাযোগ', en: 'Contact' },
    login: { bn: 'লগইন', en: 'Login' },
    studentLogin: { bn: 'শিক্ষার্থী পোর্টাল', en: 'Student Portal' },
    teacherLogin: { bn: 'শিক্ষক পোর্টাল', en: 'Teacher Portal' },
    parentLogin: { bn: 'অভিভাবক পোর্টাল', en: 'Parent Portal' },
    adminLogin: { bn: 'অ্যাডমিন প্যানেল', en: 'Admin Panel' },
  },
  login: {
    studentTab: { bn: 'শিক্ষার্থী', en: 'Student' },
    teacherTab: { bn: 'শিক্ষক', en: 'Teacher' },
    parentTab: { bn: 'অভিভাবক', en: 'Parent' },
    adminTab: { bn: 'অ্যাডমিন', en: 'Admin' },
  },
  hero: {
    tagline: CAMPUS_TAGLINE,
    subtitle: {
      bn: 'স্মার্ট শিক্ষা, অনলাইন পরীক্ষা, ডিজিটাল লাইব্রেরি, শিক্ষার্থী-অভিভাবক-শিক্ষক পোর্টাল ও প্রাক্তন শিক্ষার্থী নেটওয়ার্ক।',
      en: 'Smart education, online assessments, digital library, unified portals, and alumni connectivity.',
    },
    admissionBtn: { bn: 'অনলাইন ভর্তি আবেদন', en: 'Online Admission' },
    exploreBtn: { bn: 'বিদ্যালয় পরিচিতি', en: 'Explore School' },
    learnMore: { bn: 'বিদ্যালয় পরিচিতি', en: 'About School' },
    portalBtn: { bn: 'পোর্টালসমূহ', en: 'Open Portals' },
  },
  ui: {
    latestNews: { bn: 'সর্বশেষ সংবাদ:', en: 'Latest:' },
    welcome: { bn: ' -এ স্বাগতম। ভর্তি ও একাডেমিক আপডেটের জন্য নোটিশ বোর্ড দেখুন।', en: ' portal. Check notices for admissions and academic updates.' },
    readMore: { bn: 'বিস্তারিত', en: 'Details' },
    seeAll: { bn: 'সবগুলো দেখুন', en: 'See All' },
    importantLinks: { bn: 'গুরুত্বপূর্ণ লিংকসমূহ', en: 'Important Links' },
    downloadPdf: { bn: 'পিডিএফ দেখুন', en: 'View Resource' },
    readOnline: { bn: 'অনলাইনে পড়ুন', en: 'Read Online' },
    submit: { bn: 'আবেদন জমা দিন', en: 'Submit Application' },
    search: { bn: 'যেকোনো তথ্য খুঁজুন...', en: 'Search anything...' },
    noData: { bn: 'কোনো তথ্য পাওয়া যায়নি।', en: 'No matching records found.' },
  },
  stats: {
    students: { bn: 'মোট শিক্ষার্থী', en: 'Total Students' },
    teachers: { bn: 'অভিজ্ঞ শিক্ষক', en: 'Expert Faculty' },
    passRate: { bn: 'এসএসসি পাশের হার', en: 'SSC Pass Rate' },
    established: { bn: 'প্রতিষ্ঠিত', en: 'Established' },
    library: { bn: 'ডিজিটাল লাইব্রেরি', en: 'Digital Resources' },
  },
  gallery: {
    title: { bn: 'ফটো ও ভিডিও গ্যালারি', en: 'Photo & Video Gallery' },
    subtitle: {
      bn: 'বিদ্যালয়ের বার্ষিক ক্রীড়া, বিজ্ঞান মেলা, সাংস্কৃতিক অনুষ্ঠান ও শ্রেণিকক্ষের স্মরণীয় মুহূর্ত।',
      en: 'Memorable campus highlights from sports days, science fairs, cultural events, and smart classrooms.',
    },
  },
  holiday: {
    title: { bn: 'বার্ষিক ছুটির তালিকা ২০২৬', en: 'Annual Holiday List 2026' },
    subtitle: {
      bn: 'সরকারি প্রজ্ঞাপন অনুযায়ী ২০২৬ শিক্ষাবর্ষের জাতীয়, ধর্মীয় ও মৌসুমি ছুটির তালিকা।',
      en: 'Official national, religious, and seasonal school holidays for the 2026 academic session.',
    },
  },
  admission: {
    title: { bn: 'অনলাইন ভর্তি আবেদন ফরম ২০২৬', en: 'Online Admission Application 2026' },
    onlineApply: { bn: 'অনলাইন ভর্তি আবেদন', en: 'Apply Online' },
    subtitle: {
      bn: 'সঠিক তথ্য দিয়ে নিচের ফরমটি পূরণ করুন। জমা দেওয়ার পর প্রাপ্ত আবেদন আইডি (App ID) সংরক্ষণ করুন।',
      en: 'Fill out the application carefully and keep your tracking App ID for admission status checks.',
    },
    studentName: { bn: 'শিক্ষার্থীর পূর্ণ নাম', en: 'Student Full Name' },
    fatherName: { bn: 'পিতার নাম', en: 'Father Name' },
    motherName: { bn: 'মাতার নাম', en: 'Mother Name' },
    guardianMobile: { bn: 'অভিভাবকের মোবাইল নম্বর', en: 'Guardian Mobile' },
    targetClass: { bn: 'আবেদনকৃত শ্রেণী', en: 'Applying for Class' },
    targetGroup: { bn: 'বিভাগ (প্রযোজ্য ক্ষেত্রে)', en: 'Academic Group' },
    birthDate: { bn: 'জন্ম তারিখ', en: 'Date of Birth' },
    address: { bn: 'বর্তমান ঠিকানা', en: 'Present Address' },
    prevSchool: { bn: 'পূর্ববর্তী বিদ্যালয়ের নাম', en: 'Previous School Name' },
    bloodGroup: { bn: 'রক্তের গ্রুপ', en: 'Blood Group' },
  },
  ebook: {
    title: { bn: 'ডিজিটাল লাইব্রেরি ও স্টাডি হাব', en: 'Digital Library & Study Hub' },
    subtitle: {
      bn: '৬ষ্ঠ–১০ম শ্রেণীর NCTB পাঠ্যবই, অধ্যায়ভিত্তিক নোট, বিগত বোর্ড প্রশ্ন, মডেল টেস্ট ও ব্যবহারিক গাইড।',
      en: 'NCTB textbooks, chapter-wise PDFs, previous board questions, model tests, science practicals, math & ICT guides.',
    },
  },
};

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n-2026-1',
    title: {
      bn: '২০২৬ শিক্ষাবর্ষে ৬ষ্ঠ থেকে ৯ম শ্রেণীতে অনলাইন ভর্তি বিজ্ঞপ্তি',
      en: 'Online Admission Notice for Classes 6–9 (Session 2026)',
    },
    date: '2026-01-10',
    category: 'Admission',
    description: {
      bn: 'রাণীর বাজার মাধ্যমিক বিদ্যালয়ে ২০২৬ শিক্ষাবর্ষে ৬ষ্ঠ থেকে ৯ম শ্রেণীতে শূন্য আসনে ভর্তি চলছে। আগ্রহী শিক্ষার্থীদের অনলাইনে Admission পেজ থেকে আবেদন করার জন্য অনুরোধ করা হলো।',
      en: 'Online applications are now open for vacant seats in Classes 6 to 9 for the 2026 session. Applicants can submit forms and check live status from the Admission page.',
    },
    pdfUrl: '#',
    isPublic: true,
  },
  {
    id: 'n-2026-2',
    title: {
      bn: 'অর্ধবার্ষিক ও প্রাক-নির্বাচনী পরীক্ষার সময়সূচি প্রকাশ ২০২৬',
      en: 'Half-Yearly & Pre-Test Examination Schedule 2026 Published',
    },
    date: '2026-06-01',
    category: 'Exam',
    description: {
      bn: 'আগামী জুনের তৃতীয় সপ্তাহ থেকে অর্ধবার্ষিক পরীক্ষা শুরু হবে। সকল শিক্ষার্থীকে স্টুডেন্ট পোর্টাল থেকে পরীক্ষার রুটিন সংগ্রহ করার নির্দেশ দেওয়া হলো।',
      en: 'Half-Yearly examinations commence in the third week of June. All students are instructed to review the full Exam Routine from their portal.',
    },
    pdfUrl: '#',
    isPublic: true,
  },
  {
    id: 'n-2026-3',
    title: {
      bn: 'বার্ষিক বিজ্ঞান মেলা ও ডিজিটাল কুইজ প্রতিযোগিতা',
      en: 'Annual Science Fair & Digital MCQ Olympiad Notice',
    },
    date: '2026-03-18',
    category: 'General',
    description: {
      bn: 'বিদ্যালয় অডিটোরিয়ামে আগামী সপ্তাহে বার্ষিক বিজ্ঞান মেলা ও অনলাইন MCQ অলিম্পিয়াড অনুষ্ঠিত হবে। অনুশীলনের জন্য অনলাইন এক্সাম পোর্টাল ব্যবহার করুন।',
      en: 'The Annual Science Fair & Online MCQ Olympiad will take place next week. Students may practice anytime using the Online Exam portal.',
    },
    pdfUrl: '#',
    isPublic: true,
  },
  {
    id: 'n-2026-4',
    title: {
      bn: 'পবিত্র ঈদ-উল-ফিতর ও গ্রীষ্মকালীন ছুটির বিজ্ঞপ্তি',
      en: 'Eid-ul-Fitr & Summer Vacation Schedule Notice',
    },
    date: '2026-03-22',
    category: 'Holiday',
    description: {
      bn: 'সরকারি ছুটির তালিকা অনুযায়ী ঈদ-উল-ফিতর উপলক্ষে নির্ধারিত তারিখসমূহে শ্রেণি কার্যক্রম বন্ধ থাকবে।',
      en: 'Regular classes will remain closed during the scheduled Eid-ul-Fitr holidays as per the academic calendar.',
    },
    pdfUrl: '#',
    isPublic: true,
  },
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-2026-1',
    title: {
      bn: 'আরবিএমবি ডিজিটাল ক্যাম্পাস স্মার্ট পোর্টাল ২০২৬ উদ্বোধন',
      en: 'Launch of RBMB Digital Campus Smart Education Portal 2026',
    },
    summary: {
      bn: 'শিক্ষার্থী, শিক্ষক ও অভিভাবকদের জন্য সমন্বিত ডিজিটাল লার্নিং, অনলাইন পরীক্ষা ও ফলাফল পোর্টাল চালু করা হয়েছে।',
      en: 'Integrated student, teacher, and parent portals alongside online MCQ assessments and digital library resources are now live.',
    },
    content: {
      bn: 'রাণীর বাজার মাধ্যমিক বিদ্যালয়ের একাডেমিক কার্যক্রম আরও গতিশীল ও স্বচ্ছ করতে আরবিএমবি ডিজিটাল ক্যাম্পাস চালু করা হয়েছে। শিক্ষার্থীরা এখন থেকে ঘরে বসেই পাঠ্যবই, নোট, অনলাইন পরীক্ষা ও ফলাফল দেখতে পারবে।',
      en: 'To modernize classroom administration and self-paced learning, Ranir Bazar Secondary High School has rolled out RBMB Digital Campus. Learners can access textbooks, chapter notes, timed MCQ exams, and attendance updates from any device.',
    },
    category: 'Academic',
    date: '2026-06-10',
    imageUrl: computerLabImg,
    author: 'Administration Office',
    isPublic: true,
  },
  {
    id: 'news-2026-2',
    title: {
      bn: 'উপজেলা পর্যায়ে বিজ্ঞান ও প্রযুক্তি মেলায় প্রথম স্থান অর্জন',
      en: 'First Place Award at Upazila Science & Innovation Fair',
    },
    summary: {
      bn: 'নবম ও দশম শ্রেণীর বিজ্ঞান দলের সৌরশক্তি চালিত সেচ প্রকল্প উপজেলা পর্যায়ে শ্রেষ্ঠ প্রকল্প হিসেবে নির্বাচিত হয়েছে।',
      en: 'Our Class 9 & 10 science team earned first prize for their solar smart-irrigation prototype.',
    },
    content: {
      bn: 'বিদ্যালয়ের আধুনিক বিজ্ঞান ল্যাবের তত্ত্বাবধানে নির্মিত সৌরশক্তি ও সেন্সরভিত্তিক প্রকল্পটি বিচারকদের প্রশংসা অর্জন করে প্রথম পুরস্কার লাভ করে।',
      en: 'Built inside our modern Science Lab under faculty mentorship, the solar sensor-driven prototype secured top honors across competing schools.',
    },
    category: 'Achievement',
    date: '2026-05-24',
    imageUrl: scienceLabImg,
    author: 'Science Club',
    isPublic: true,
  },
  {
    id: 'news-2026-3',
    title: {
      bn: 'বার্ষিক ক্রীড়া, সাংস্কৃতিক সপ্তাহ ও পুরস্কার বিতরণী সম্পন্ন',
      en: 'Annual Athletics, Cultural Week & Prize Distribution Concludes',
    },
    summary: {
      bn: '৬ষ্ঠ থেকে ১০ম শ্রেণীর শিক্ষার্থীদের অংশগ্রহণে উৎসবমুখর পরিবেশে বার্ষিক ক্রীড়া ও সাংস্কৃতিক অনুষ্ঠান উদযাপিত হয়।',
      en: 'Students from Classes 6 to 10 celebrated three days of athletics, debate, and cultural performances.',
    },
    content: {
      bn: 'বিদ্যালয় প্রাঙ্গণে অনুষ্ঠিত বার্ষিক ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতায় কৃতি শিক্ষার্থীদের মাঝে সনদ ও পুরস্কার প্রদান করা হয়।',
      en: 'Award certificates and medals were presented to student winners across athletics, Bangla debate, and recitation competitions on campus.',
    },
    category: 'Campus',
    date: '2026-04-28',
    imageUrl: sportsEventImg,
    author: 'Cultural Committee',
    isPublic: true,
  },
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt-2026-1',
    title: {
      bn: 'অর্ধবার্ষিক অভিভাবক ও শিক্ষক মতবিনিময় সভা',
      en: 'Half-Yearly Parent-Teacher Academic Review Meeting',
    },
    description: {
      bn: 'সকল শ্রেণীর শিক্ষার্থীদের অর্ধবার্ষিক প্রস্তুতি ও উপস্থিতি অগ্রগতি নিয়ে অভিভাবকদের সাথে মতবিনিময়।',
      en: 'Reviewing half-yearly exam readiness, attendance trends, and study support for Classes 6–10.',
    },
    date: '2026-06-28',
    time: '10:30 AM',
    location: { bn: 'বিদ্যালয় অডিটোরিয়াম', en: 'School Auditorium' },
    category: 'Academic',
    isPublic: true,
  },
  {
    id: 'evt-2026-2',
    title: {
      bn: 'আন্তঃশ্রেণী বিজ্ঞান অলিম্পিয়াড ও কুইজ ফাইনাল',
      en: 'Inter-Class Science Olympiad & Digital Quiz Final',
    },
    description: {
      bn: '৬ষ্ঠ–১০ম শ্রেণীর বাছাইকৃত শিক্ষার্থীদের নিয়ে গণিত, বিজ্ঞান ও আইসিটি অলিম্পিয়াড।',
      en: 'Finals in Mathematics, General Science, and ICT for qualifying students across all grades.',
    },
    date: '2026-07-08',
    time: '11:00 AM',
    location: { bn: 'ডিজিটাল ল্যাব ও হল রুম', en: 'Digital Lab & Main Hall' },
    category: 'Science',
    isPublic: true,
  },
  {
    id: 'evt-2026-3',
    title: {
      bn: 'বর্ষাকালীন বৃক্ষরোপণ ও পরিচ্ছন্ন ক্যাম্পাস কর্মসূচি',
      en: 'Monsoon Tree Plantation & Clean Campus Drive',
    },
    description: {
      bn: 'স্কাউট দল ও শিক্ষার্থীদের উদ্যোগে বিদ্যালয় প্রাঙ্গণে ফলজ ও বনজ বৃক্ষরোপণ।',
      en: 'Campus greening initiative led by RBMB Scouts and student volunteers.',
    },
    date: '2026-07-18',
    time: '09:30 AM',
    location: { bn: 'বিদ্যালয় প্রাঙ্গণ', en: 'Main Campus Grounds' },
    category: 'Cultural',
    isPublic: true,
  },
];

export const TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: { bn: 'মোঃ আব্দুল করিম', en: 'Md. Abdul Karim' },
    designation: { bn: 'প্রধান শিক্ষক', en: 'Head Teacher' },
    subject: { bn: 'ইংরেজি ও প্রশাসন', en: 'English & Administration' },
    qualification: { bn: 'এম.এ, বি.এড (ঢাকা বিশ্ববিদ্যালয়)', en: 'M.A, B.Ed (University of Dhaka)' },
    teachingClasses: ['6', '7', '8', '9', '10'],
    teachingSubjects: ['English'],
    photo: headTeacherImg,
    isPublic: true,
  },
  {
    id: 't-2',
    name: { bn: 'মোসাঃ ফাতেমা বেগম', en: 'Mst. Fatema Begum' },
    designation: { bn: 'সহকারী প্রধান শিক্ষক', en: 'Assistant Head Teacher' },
    subject: { bn: 'বাংলা সাহিত্য', en: 'Bangla Literature' },
    qualification: { bn: 'এম.এ (বাংলা), এম.এড', en: 'M.A (Bangla), M.Ed' },
    assignedClass: '9',
    teachingClasses: ['6', '7', '8', '9', '10'],
    teachingSubjects: ['Bangla', 'Science', 'Mathematics', 'General Math'],
    photo: '',
    isPublic: true,
  },
  {
    id: 't-3',
    name: { bn: 'বাবু সুব্রত দাস', en: 'Subrata Das' },
    designation: { bn: 'সিনিয়র শিক্ষক (গণিত)', en: 'Senior Teacher (Mathematics)' },
    subject: { bn: 'গণিত ও উচ্চতর গণিত', en: 'Mathematics & Higher Math' },
    qualification: { bn: 'এম.এসসি (গণিত), বি.এড', en: 'M.Sc (Math), B.Ed' },
    teachingClasses: ['6', '7', '8', '9', '10'],
    teachingSubjects: ['Mathematics', 'General Math'],
    photo: '',
    isPublic: true,
  },
  {
    id: 't-4',
    name: { bn: 'জান্নাতুল ফেরদৌস', en: 'Jannatul Ferdous' },
    designation: { bn: 'সহকারী শিক্ষক (আইসিটি)', en: 'Assistant Teacher (ICT)' },
    subject: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT & Computer Lab' },
    qualification: { bn: 'বি.এসসি ইন সিএসই', en: 'B.Sc in CSE' },
    teachingClasses: ['6', '7', '8', '9', '10'],
    teachingSubjects: ['ICT'],
    photo: '',
    isPublic: true,
  },
  {
    id: 't-5',
    name: { bn: 'মোঃ রফিকুল ইসলাম', en: 'Md. Rafiqul Islam' },
    designation: { bn: 'সহকারী শিক্ষক (বিজ্ঞান)', en: 'Assistant Teacher (Science)' },
    subject: { bn: 'পদার্থবিজ্ঞান ও রসায়ন', en: 'Physics & Chemistry' },
    qualification: { bn: 'এম.এসসি (পদার্থবিজ্ঞান), বি.এড', en: 'M.Sc (Physics), B.Ed' },
    teachingClasses: ['6', '7', '8', '9', '10'],
    teachingSubjects: ['Science', 'Physics', 'Chemistry'],
    photo: '',
    isPublic: true,
  },
  {
    id: 't-6',
    name: { bn: 'মোঃ নজরুল ইসলাম', en: 'Md. Nazrul Islam' },
    designation: { bn: 'সহকারী শিক্ষক (ইংরেজি)', en: 'Assistant Teacher (English)' },
    subject: { bn: 'ইংরেজি ১ম ও ২য় পত্র', en: 'English 1st & 2nd Paper' },
    qualification: { bn: 'এম.এ (ইংরেজি), বি.এড', en: 'M.A (English), B.Ed' },
    teachingClasses: ['6', '7', '8', '9', '10'],
    teachingSubjects: ['English'],
    photo: '',
    isPublic: true,
  },
];

export const ROUTINES: ClassRoutine[] = [
  {
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    schedule: [
      {
        day: { bn: 'রবিবার', en: 'Sunday' },
        periods: [
          { time: '10:00 - 10:45', subject: { bn: 'বাংলা', en: 'Bangla' }, teacher: { bn: 'মোসাঃ ফাতেমা বেগম', en: 'Mst. Fatema Begum' } },
          { time: '10:45 - 11:30', subject: { bn: 'ইংরেজি', en: 'English' }, teacher: { bn: 'মোঃ নজরুল ইসলাম', en: 'Md. Nazrul Islam' } },
          { time: '11:30 - 12:15', subject: { bn: 'গণিত', en: 'Mathematics' }, teacher: { bn: 'বাবু সুব্রত দাস', en: 'Subrata Das' } },
          { time: '12:45 - 01:30', subject: { bn: 'বিজ্ঞান', en: 'Science' }, teacher: { bn: 'মোঃ রফিকুল ইসলাম', en: 'Md. Rafiqul Islam' } },
          { time: '01:30 - 02:15', subject: { bn: 'ডিজিটাল প্রযুক্তি', en: 'ICT' }, teacher: { bn: 'জান্নাতুল ফেরদৌস', en: 'Jannatul Ferdous' } },
        ],
      },
      {
        day: { bn: 'সোমবার', en: 'Monday' },
        periods: [
          { time: '10:00 - 10:45', subject: { bn: 'ইংরেজি', en: 'English' }, teacher: { bn: 'মোঃ নজরুল ইসলাম', en: 'Md. Nazrul Islam' } },
          { time: '10:45 - 11:30', subject: { bn: 'গণিত', en: 'Mathematics' }, teacher: { bn: 'বাবু সুব্রত দাস', en: 'Subrata Das' } },
          { time: '11:30 - 12:15', subject: { bn: 'বাংলা', en: 'Bangla' }, teacher: { bn: 'মোসাঃ ফাতেমা বেগম', en: 'Mst. Fatema Begum' } },
          { time: '12:45 - 01:30', subject: { bn: 'ইতিহাস ও সামাজিক বিজ্ঞান', en: 'Social Science' }, teacher: { bn: 'মোঃ আব্দুল করিম', en: 'Md. Abdul Karim' } },
        ],
      },
    ],
  },
  {
    classId: '7',
    className: { bn: '৭ম শ্রেণী', en: 'Class 7' },
    schedule: [
      {
        day: { bn: 'রবিবার', en: 'Sunday' },
        periods: [
          { time: '10:00 - 10:45', subject: { bn: 'গণিত', en: 'Mathematics' }, teacher: { bn: 'বাবু সুব্রত দাস', en: 'Subrata Das' } },
          { time: '10:45 - 11:30', subject: { bn: 'বিজ্ঞান', en: 'Science' }, teacher: { bn: 'মোঃ রফিকুল ইসলাম', en: 'Md. Rafiqul Islam' } },
          { time: '11:30 - 12:15', subject: { bn: 'ইংরেজি', en: 'English' }, teacher: { bn: 'মোঃ নজরুল ইসলাম', en: 'Md. Nazrul Islam' } },
          { time: '12:45 - 01:30', subject: { bn: 'বাংলা', en: 'Bangla' }, teacher: { bn: 'মোসাঃ ফাতেমা বেগম', en: 'Mst. Fatema Begum' } },
        ],
      },
    ],
  },
  {
    classId: '8',
    className: { bn: '৮ম শ্রেণী', en: 'Class 8' },
    schedule: [
      {
        day: { bn: 'রবিবার', en: 'Sunday' },
        periods: [
          { time: '10:00 - 10:45', subject: { bn: 'ইংরেজি', en: 'English' }, teacher: { bn: 'মোঃ নজরুল ইসলাম', en: 'Md. Nazrul Islam' } },
          { time: '10:45 - 11:30', subject: { bn: 'গণিত', en: 'Mathematics' }, teacher: { bn: 'বাবু সুব্রত দাস', en: 'Subrata Das' } },
          { time: '11:30 - 12:15', subject: { bn: 'ডিজিটাল প্রযুক্তি', en: 'ICT' }, teacher: { bn: 'জান্নাতুল ফেরদৌস', en: 'Jannatul Ferdous' } },
          { time: '12:45 - 01:30', subject: { bn: 'বিজ্ঞান', en: 'Science' }, teacher: { bn: 'মোঃ রফিকুল ইসলাম', en: 'Md. Rafiqul Islam' } },
        ],
      },
    ],
  },
  {
    classId: '9',
    className: { bn: '৯ম শ্রেণী', en: 'Class 9' },
    schedule: [
      {
        day: { bn: 'রবিবার', en: 'Sunday' },
        periods: [
          { time: '10:00 - 10:45', subject: { bn: 'উচ্চতর গণিত / অর্থনীতি', en: 'Higher Math / Economics' }, teacher: { bn: 'বাবু সুব্রত দাস', en: 'Subrata Das' } },
          { time: '10:45 - 11:30', subject: { bn: 'পদার্থবিজ্ঞান', en: 'Physics' }, teacher: { bn: 'মোঃ রফিকুল ইসলাম', en: 'Md. Rafiqul Islam' } },
          { time: '11:30 - 12:15', subject: { bn: 'ইংরেজি', en: 'English' }, teacher: { bn: 'মোঃ নজরুল ইসলাম', en: 'Md. Nazrul Islam' } },
          { time: '12:45 - 01:30', subject: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' }, teacher: { bn: 'জান্নাতুল ফেরদৌস', en: 'Jannatul Ferdous' } },
        ],
      },
    ],
  },
  {
    classId: '10',
    className: { bn: '১০ম শ্রেণী', en: 'Class 10' },
    schedule: [
      {
        day: { bn: 'রবিবার', en: 'Sunday' },
        periods: [
          { time: '10:00 - 10:45', subject: { bn: 'রসায়ন', en: 'Chemistry' }, teacher: { bn: 'মোঃ রফিকুল ইসলাম', en: 'Md. Rafiqul Islam' } },
          { time: '10:45 - 11:30', subject: { bn: 'সাধারণ গণিত', en: 'General Math' }, teacher: { bn: 'বাবু সুব্রত দাস', en: 'Subrata Das' } },
          { time: '11:30 - 12:15', subject: { bn: 'বাংলা', en: 'Bangla' }, teacher: { bn: 'মোসাঃ ফাতেমা বেগম', en: 'Mst. Fatema Begum' } },
          { time: '12:45 - 01:30', subject: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' }, teacher: { bn: 'জান্নাতুল ফেরদৌস', en: 'Jannatul Ferdous' } },
        ],
      },
    ],
  },
];

export const INITIAL_EXAM_ROUTINES: ExamRoutineItem[] = [
  { id: 'er-1', examTerm: 'Half-Yearly Exam 2026', classId: '9', subject: 'Bangla', date: '2026-06-15', time: '10:00 AM - 01:00 PM', room: 'Room 101', isPublic: true },
  { id: 'er-2', examTerm: 'Half-Yearly Exam 2026', classId: '9', subject: 'English', date: '2026-06-17', time: '10:00 AM - 01:00 PM', room: 'Room 101', isPublic: true },
  { id: 'er-3', examTerm: 'Half-Yearly Exam 2026', classId: '9', subject: 'Mathematics', date: '2026-06-20', time: '10:00 AM - 01:00 PM', room: 'Room 102', isPublic: true },
  { id: 'er-4', examTerm: 'Half-Yearly Exam 2026', classId: '9', subject: 'Science / Physics', date: '2026-06-22', time: '10:00 AM - 01:00 PM', room: 'Science Hall', isPublic: true },
  { id: 'er-5', examTerm: 'Half-Yearly Exam 2026', classId: '9', subject: 'ICT', date: '2026-06-24', time: '10:00 AM - 12:00 PM', room: 'ICT Lab', isPublic: true },
  { id: 'er-6', examTerm: 'Half-Yearly Exam 2026', classId: '10', subject: 'Bangla', date: '2026-06-15', time: '10:00 AM - 01:00 PM', room: 'Hall 1', isPublic: true },
  { id: 'er-7', examTerm: 'Half-Yearly Exam 2026', classId: '10', subject: 'English', date: '2026-06-16', time: '10:00 AM - 01:00 PM', room: 'Hall 1', isPublic: true },
  { id: 'er-8', examTerm: 'Half-Yearly Exam 2026', classId: '10', subject: 'General Math', date: '2026-06-18', time: '10:00 AM - 01:00 PM', room: 'Hall 1', isPublic: true },
  { id: 'er-9', examTerm: 'Half-Yearly Exam 2026', classId: '10', subject: 'Physics / Biology', date: '2026-06-21', time: '10:00 AM - 01:00 PM', room: 'Hall 1', isPublic: true },
  { id: 'er-10', examTerm: 'Half-Yearly Exam 2026', classId: '10', subject: 'ICT', date: '2026-06-23', time: '10:00 AM - 12:00 PM', room: 'ICT Lab', isPublic: true },
  { id: 'er-11', examTerm: 'Half-Yearly Exam 2026', classId: '8', subject: 'Bangla', date: '2026-06-15', time: '09:00 AM - 10:30 AM', room: 'RBMB Examination Centre', isPublic: true },
  { id: 'er-12', examTerm: 'Half-Yearly Exam 2026', classId: '8', subject: 'English', date: '2026-06-16', time: '11:00 AM - 12:30 PM', room: 'RBMB Examination Centre', isPublic: true },
  { id: 'er-13', examTerm: 'Half-Yearly Exam 2026', classId: '8', subject: 'Mathematics', date: '2026-06-18', time: '09:00 AM - 10:30 AM', room: 'RBMB Examination Centre', isPublic: true },
  { id: 'er-14', examTerm: 'Half-Yearly Exam 2026', classId: '8', subject: 'Science', date: '2026-06-20', time: '11:00 AM - 12:30 PM', room: 'RBMB Examination Centre', isPublic: true },
  { id: 'er-15', examTerm: 'Half-Yearly Exam 2026', classId: '8', subject: 'ICT', date: '2026-06-22', time: '09:00 AM - 10:30 AM', room: 'RBMB Examination Centre', isPublic: true },
  { id: 'er-16', examTerm: 'Half-Yearly Exam 2026', classId: '7', subject: 'Bangla', date: '2026-06-15', time: '09:00 AM - 11:30 AM', room: 'Room 202', isPublic: true },
  { id: 'er-17', examTerm: 'Half-Yearly Exam 2026', classId: '7', subject: 'English', date: '2026-06-17', time: '09:00 AM - 11:30 AM', room: 'Room 202', isPublic: true },
  { id: 'er-18', examTerm: 'Half-Yearly Exam 2026', classId: '7', subject: 'Mathematics', date: '2026-06-19', time: '09:00 AM - 11:30 AM', room: 'Room 202', isPublic: true },
  { id: 'er-19', examTerm: 'Half-Yearly Exam 2026', classId: '7', subject: 'Science', date: '2026-06-21', time: '09:00 AM - 11:30 AM', room: 'Room 202', isPublic: true },
  { id: 'er-20', examTerm: 'Half-Yearly Exam 2026', classId: '7', subject: 'ICT', date: '2026-06-23', time: '09:00 AM - 11:00 AM', room: 'ICT Lab', isPublic: true },
  { id: 'er-21', examTerm: 'Half-Yearly Exam 2026', classId: '6', subject: 'Bangla', date: '2026-06-15', time: '10:00 AM - 12:30 PM', room: 'Room 201', isPublic: true },
  { id: 'er-22', examTerm: 'Half-Yearly Exam 2026', classId: '6', subject: 'English', date: '2026-06-17', time: '10:00 AM - 12:30 PM', room: 'Room 201', isPublic: true },
  { id: 'er-23', examTerm: 'Half-Yearly Exam 2026', classId: '6', subject: 'Mathematics', date: '2026-06-18', time: '10:00 AM - 12:30 PM', room: 'Room 201', isPublic: true },
  { id: 'er-24', examTerm: 'Half-Yearly Exam 2026', classId: '6', subject: 'Science', date: '2026-06-20', time: '10:00 AM - 12:30 PM', room: 'Room 201', isPublic: true },
  { id: 'er-25', examTerm: 'Half-Yearly Exam 2026', classId: '6', subject: 'ICT', date: '2026-06-22', time: '10:00 AM - 12:00 PM', room: 'ICT Lab', isPublic: true },
];

export const SYLLABUS_2026: SyllabusItem[] = [
  {
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subjects: [
      { name: { bn: 'বাংলা', en: 'Bangla' }, code: '101', pdfUrl: '#' },
      { name: { bn: 'ইংরেজি', en: 'English' }, code: '107', pdfUrl: '#' },
      { name: { bn: 'গণিত', en: 'Mathematics' }, code: '109', pdfUrl: '#' },
      { name: { bn: 'বিজ্ঞান', en: 'Science' }, code: '127', pdfUrl: '#' },
      { name: { bn: 'ইতিহাস ও সামাজিক বিজ্ঞান', en: 'History & Social Science' }, code: '150', pdfUrl: '#' },
      { name: { bn: 'ডিজিটাল প্রযুক্তি', en: 'Digital Technology' }, code: '154', pdfUrl: '#' },
    ],
  },
  {
    classId: '7',
    className: { bn: '৭ম শ্রেণী', en: 'Class 7' },
    subjects: [
      { name: { bn: 'বাংলা', en: 'Bangla' }, code: '101', pdfUrl: '#' },
      { name: { bn: 'ইংরেজি', en: 'English' }, code: '107', pdfUrl: '#' },
      { name: { bn: 'গণিত', en: 'Mathematics' }, code: '109', pdfUrl: '#' },
      { name: { bn: 'বিজ্ঞান', en: 'Science' }, code: '127', pdfUrl: '#' },
      { name: { bn: 'ডিজিটাল প্রযুক্তি', en: 'Digital Technology' }, code: '154', pdfUrl: '#' },
    ],
  },
  {
    classId: '8',
    className: { bn: '৮ম শ্রেণী', en: 'Class 8' },
    subjects: [
      { name: { bn: 'বাংলা', en: 'Bangla' }, code: '101', pdfUrl: '#' },
      { name: { bn: 'ইংরেজি', en: 'English' }, code: '107', pdfUrl: '#' },
      { name: { bn: 'গণিত', en: 'Mathematics' }, code: '109', pdfUrl: '#' },
      { name: { bn: 'বিজ্ঞান', en: 'Science' }, code: '127', pdfUrl: '#' },
      { name: { bn: 'ডিজিটাল প্রযুক্তি', en: 'Digital Technology' }, code: '154', pdfUrl: '#' },
    ],
  },
  {
    classId: '9',
    className: { bn: '৯ম শ্রেণী', en: 'Class 9' },
    subjects: [
      { name: { bn: 'বাংলা', en: 'Bangla' }, code: '101', pdfUrl: '#' },
      { name: { bn: 'ইংরেজি', en: 'English' }, code: '107', pdfUrl: '#' },
      { name: { bn: 'গণিত', en: 'Mathematics' }, code: '109', pdfUrl: '#' },
      { name: { bn: 'পদার্থবিজ্ঞান', en: 'Physics' }, code: '136', pdfUrl: '#' },
      { name: { bn: 'রসায়ন', en: 'Chemistry' }, code: '137', pdfUrl: '#' },
      { name: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' }, code: '154', pdfUrl: '#' },
    ],
  },
  {
    classId: '10',
    className: { bn: '১০ম শ্রেণী', en: 'Class 10' },
    subjects: [
      { name: { bn: 'বাংলা', en: 'Bangla' }, code: '101', pdfUrl: '#' },
      { name: { bn: 'ইংরেজি', en: 'English' }, code: '107', pdfUrl: '#' },
      { name: { bn: 'সাধারণ গণিত', en: 'General Mathematics' }, code: '109', pdfUrl: '#' },
      { name: { bn: 'জীববিজ্ঞান', en: 'Biology' }, code: '138', pdfUrl: '#' },
      { name: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' }, code: '154', pdfUrl: '#' },
    ],
  },
];

export const INITIAL_SUBJECTS: SchoolSubject[] = [
  { id: 'sub-1', code: '101', name: { bn: 'বাংলা', en: 'Bangla' }, classId: '9', totalMarks: 100, teacherName: 'Mst. Fatema Begum', isPublic: true },
  { id: 'sub-2', code: '107', name: { bn: 'ইংরেজি', en: 'English' }, classId: '9', totalMarks: 100, teacherName: 'Md. Nazrul Islam', isPublic: true },
  { id: 'sub-3', code: '109', name: { bn: 'গণিত', en: 'Mathematics' }, classId: '9', totalMarks: 100, teacherName: 'Subrata Das', isPublic: true },
  { id: 'sub-4', code: '136', name: { bn: 'পদার্থবিজ্ঞান', en: 'Physics' }, classId: '9', totalMarks: 100, teacherName: 'Md. Rafiqul Islam', isPublic: true },
  { id: 'sub-5', code: '154', name: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' }, classId: '9', totalMarks: 50, teacherName: 'Jannatul Ferdous', isPublic: true },
  { id: 'sub-6', code: '109', name: { bn: 'গণিত', en: 'Mathematics' }, classId: '10', totalMarks: 100, teacherName: 'Subrata Das', isPublic: true },
  { id: 'sub-7', code: '101', name: { bn: 'বাংলা', en: 'Bangla' }, classId: '6', totalMarks: 100, teacherName: 'Mst. Fatema Begum', isPublic: true },
];

export const INITIAL_EBOOKS: EBook[] = [
  {
    id: 'eb-1',
    title: { bn: 'বাংলা সাহিত্য (৬ষ্ঠ শ্রেণী - NCTB)', en: 'Bangla Literature (Class 6 NCTB)' },
    classId: '6',
    className: { bn: '৬ষ্ঠ শ্রেণী', en: 'Class 6' },
    subject: 'Bangla',
    category: 'Textbook',
    description: { bn: 'NCTB কর্তৃক প্রকাশিত ২০২৬ শিক্ষাবর্ষের মূল পাঠ্যবই।', en: 'Official 2026 NCTB textbook for Class 6 Bangla.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
  {
    id: 'eb-2',
    title: { bn: 'English Grammar & Composition Guide (Class 6–10)', en: 'English Grammar & Composition Mastery (Class 6–10)' },
    classId: '9',
    className: { bn: '৯ম শ্রেণী', en: 'Class 9' },
    subject: 'English Grammar',
    category: 'EnglishGrammar',
    description: { bn: 'টেন্স, ভয়েস, ন্যারেশন, প্রিপোজিশন ও প্যারাগ্রাফ লেখার পূর্ণাঙ্গ গাইড।', en: 'Complete guide covering Tense, Voice, Narration, Connectors, and Academic Writing.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
  {
    id: 'eb-3',
    title: { bn: 'মাধ্যমিক গণিত অধ্যায়ভিত্তিক সমাধান (৯ম-১০ম)', en: 'SSC Mathematics Full Solutions (Class 9–10)' },
    classId: '9',
    className: { bn: '৯ম শ্রেণী', en: 'Class 9' },
    subject: 'Mathematics',
    category: 'MathSolution',
    description: { bn: 'বীজগণিত, ত্রিকোণমিতি ও জ্যামিতির সৃজনশীল প্রশ্নের ধাপে ধাপে সমাধান।', en: 'Step-by-step solutions for Algebra, Trigonometry, and Geometry creative questions.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
  {
    id: 'eb-4',
    title: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT) হ্যান্ডনোট ও কোডিং', en: 'ICT Learning Handbook & HTML/Spreadsheet Guide' },
    classId: '9',
    className: { bn: '৯ম শ্রেণী', en: 'Class 9' },
    subject: 'ICT',
    category: 'ICT',
    description: { bn: 'ইন্টারনেট নিরাপত্তা, স্প্রেডশিট ফর্মুলা ও ওয়েব ডিজাইন প্র্যাকটিক্যাল নোট।', en: 'Practical notes covering cybersecurity, spreadsheet formulas, and HTML fundamentals.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
  {
    id: 'eb-5',
    title: { bn: 'পদার্থবিজ্ঞান ও রসায়ন প্র্যাকটিক্যাল ল্যাব ম্যানুয়াল', en: 'Science Practical & Lab Experiment Manual' },
    classId: '10',
    className: { bn: '১০ম শ্রেণী', en: 'Class 10' },
    subject: 'Science',
    category: 'Practical',
    description: { bn: 'এসএসসি ব্যবহারিক পরীক্ষার চিত্র, পর্যবেক্ষণ ছক ও মৌখিক প্রশ্নোত্তর।', en: 'SSC practical diagrams, observation tables, and viva-voce preparation.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
  {
    id: 'eb-6',
    title: { bn: 'বিগত ৫ বছরের SSC বোর্ড প্রশ্ন ও উত্তর (কুমিল্লা বোর্ড)', en: 'Previous 5 Years SSC Board Questions (Cumilla Board)' },
    classId: '10',
    className: { bn: '১০ম শ্রেণী', en: 'Class 10' },
    subject: 'All Subjects',
    category: 'BoardQuestion',
    description: { bn: '২০২১–২০২৫ সালের কুমিল্লা ও ঢাকা বোর্ডের প্রশ্ন ও সমাধান সংকলন।', en: 'Curated archive of 2021–2025 SSC Board creative and MCQ papers with solutions.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
  {
    id: 'eb-7',
    title: { bn: 'SSC ২০২৬ স্পেশাল মডেল টেস্ট সিরিজ ও সাজেশন', en: 'SSC 2026 Model Test Papers & Revision Pack' },
    classId: '10',
    className: { bn: '১০ম শ্রেণী', en: 'Class 10' },
    subject: 'Science & Math',
    category: 'ModelTest',
    description: { bn: 'সময় ধরে পরীক্ষা অনুশীলনের জন্য ১০টি পূর্ণাঙ্গ মডেল টেস্ট।', en: '10 timed model test sets designed for final board exam readiness.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
  {
    id: 'eb-8',
    title: { bn: '৭ম ও ৮ম শ্রেণী সাধারণ বিজ্ঞান অধ্যায়-১ থেকে ৫ নোটস', en: 'Class 7 & 8 General Science Chapter PDFs (Ch 1–5)' },
    classId: '8',
    className: { bn: '৮ম শ্রেণী', en: 'Class 8' },
    subject: 'Science',
    category: 'ChapterPDF',
    description: { bn: 'কোষ বিভাজন, উদ্ভিদের বংশবৃদ্ধি ও শক্তির রূপান্তর সহজ নোট।', en: 'Concise visual chapter summaries for Cell Biology, Force, and Energy.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
  {
    id: 'eb-9',
    title: { bn: '৭ম শ্রেণী গণিত ও জ্যামিতি স্টাডি ম্যাটেরিয়াল', en: 'Class 7 Mathematics Study Material & Worksheets' },
    classId: '7',
    className: { bn: '৭ম শ্রেণী', en: 'Class 7' },
    subject: 'Mathematics',
    category: 'StudyMaterial',
    description: { bn: 'অনুপাত, লাভ-ক্ষতি ও ত্রিভুজ সংক্রান্ত অনুশীলনী ওয়ার্কশিট।', en: 'Structured practice worksheets on ratios, percentages, and triangle properties.' },
    coverUrl: '',
    downloadUrl: 'https://nctb.gov.bd',
    isPublic: true,
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    url: heroCampusImg,
    mediaType: 'image',
    category: 'Campus',
    caption: { bn: 'রাণীর বাজার মাধ্যমিক বিদ্যালয়ের মনোরম একাডেমিক ভবন ও প্রাঙ্গণ', en: 'Ranir Bazar Secondary High School Main Campus & Courtyard' },
    isPublic: true,
  },
  {
    id: 'gal-2',
    url: scienceLabImg,
    mediaType: 'image',
    category: 'Lab',
    caption: { bn: 'আধুনিক বিজ্ঞান ল্যাবে শিক্ষার্থীদের ব্যবহারিক ক্লাস ও গবেষণা', en: 'Students performing experiments in the Modern Science Laboratory' },
    isPublic: true,
  },
  {
    id: 'gal-3',
    url: computerLabImg,
    mediaType: 'image',
    category: 'Lab',
    caption: { bn: 'শেখ রাসেল ডিজিটাল আইসিটি ল্যাবে শিক্ষার্থীদের হাতে-কলমে প্রশিক্ষণ', en: 'Hands-on ICT and programming practice at the Digital Computer Lab' },
    isPublic: true,
  },
  {
    id: 'gal-4',
    url: sportsEventImg,
    mediaType: 'image',
    category: 'Sports',
    caption: { bn: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ও পুরস্কার বিতরণী অনুষ্ঠান ২০২৬', en: 'Annual Sports Championship & Cultural Assembly 2026' },
    isPublic: true,
  },
];

export const HOLIDAYS_2026: Holiday[] = [
  { id: 'h-1', title: { bn: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস', en: 'Shaheed Day & Int. Mother Language Day' }, date: '2026-02-21', duration: { bn: '১ দিন', en: '1 Day' }, type: 'National', isPublic: true },
  { id: 'h-2', title: { bn: 'স্বাধীনতা ও জাতীয় দিবস', en: 'Independence & National Day' }, date: '2026-03-26', duration: { bn: '১ দিন', en: '1 Day' }, type: 'National', isPublic: true },
  { id: 'h-3', title: { bn: 'পবিত্র ঈদ-উল-ফিতর', en: 'Eid-ul-Fitr Holiday' }, date: '2026-03-21', duration: { bn: '৫ দিন', en: '5 Days' }, type: 'Religious', isPublic: true },
  { id: 'h-4', title: { bn: 'বাংলা নববর্ষ (পহেলা বৈশাখ)', en: 'Pahela Baishakh (Bangla New Year)' }, date: '2026-04-14', duration: { bn: '১ দিন', en: '1 Day' }, type: 'National', isPublic: true },
  { id: 'h-5', title: { bn: 'গ্রীষ্মকালীন অবকাশ ও ঈদ-উল-আযহা', en: 'Summer Vacation & Eid-ul-Adha' }, date: '2026-05-27', duration: { bn: '১২ দিন', en: '12 Days' }, type: 'Seasonal', isPublic: true },
  { id: 'h-6', title: { bn: 'মহান বিজয় দিবস', en: 'Victory Day of Bangladesh' }, date: '2026-12-16', duration: { bn: '১ দিন', en: '1 Day' }, type: 'National', isPublic: true },
];

export const INITIAL_STUDENTS: SchoolStudent[] = [
  { id: 'st-6-1', roll: '01', name: 'সাদিয়া আফরিন (Sadia Afrin)', classId: '6', section: 'A', guardianMobile: '01711-223344', session: '2026', registrationNo: 'RBMB-REG-2026-0601' },
  { id: 'st-6-2', roll: '02', name: 'রাফি আহমেদ (Rafi Ahmed)', classId: '6', section: 'A', guardianMobile: '01811-334455', session: '2026', registrationNo: 'RBMB-REG-2026-0602' },
  { id: 'st-7-1', roll: '01', name: 'তাসনিম তাবাসসুম (Tasnim Tabassum)', classId: '7', section: 'A', guardianMobile: '01911-445566', session: '2026', registrationNo: 'RBMB-REG-2026-0701' },
  { id: 'st-8-1', roll: '01', name: 'মাহফুজ রহমান (Mahfuz Rahman)', classId: '8', section: 'A', guardianMobile: '01611-556677', session: '2026', registrationNo: 'RBMB-REG-2026-0801' },
  { id: 'st-9-1', roll: '01', name: 'আরিয়ান করিম (Aryan Karim)', classId: '9', section: 'Science', guardianName: 'মোঃ করিম উদ্দিন', guardianMobile: '01712-667788', session: '2026', registrationNo: 'RBMB-REG-2026-0901' },
  { id: 'st-9-2', roll: '02', name: 'নুসরাত জাহান (Nusrat Jahan)', classId: '9', section: 'Science', guardianMobile: '01715-778899', session: '2026', registrationNo: 'RBMB-REG-2026-0902' },
  { id: 'st-9-3', roll: '03', name: 'তামিম ইকবাল (Tamim Iqbal)', classId: '9', section: 'Commerce', guardianMobile: '01815-889900', session: '2026', registrationNo: 'RBMB-REG-2026-0903' },
  { id: 'st-10-1', roll: '01', name: 'জাহিদুল ইসলাম (Jahidul Islam)', classId: '10', section: 'Science', guardianMobile: '01700-112233', session: '2026', registrationNo: 'RBMB-REG-2026-1001' },
  { id: 'st-10-2', roll: '02', name: 'সুমাইয়া আক্তার (Sumaiya Akter)', classId: '10', section: 'Science', guardianMobile: '01700-445566', session: '2026', registrationNo: 'RBMB-REG-2026-1002' },
];

export const INITIAL_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1',
    title: 'Quadratic Equations & Factorization Practice',
    subject: 'Mathematics',
    classId: '9',
    description: 'Solve Exercise 3.1 problems 1 to 10 in your notebook and submit clear steps.',
    dueDate: '2026-06-25',
    assignedBy: 'Subrata Das',
    createdDate: '2026-06-15',
    isPublic: true,
  },
  {
    id: 'hw-2',
    title: 'Paragraph: Importance of Digital Education',
    subject: 'English',
    classId: '9',
    description: 'Write a structured 200-word paragraph highlighting digital classrooms and online practice.',
    dueDate: '2026-06-27',
    assignedBy: 'Md. Nazrul Islam',
    createdDate: '2026-06-16',
    isPublic: true,
  },
  {
    id: 'hw-3',
    title: 'HTML Basic Page Design Assignment',
    subject: 'ICT',
    classId: '9',
    description: 'Create a simple HTML structure with headings, lists, and a table for class timetable.',
    dueDate: '2026-06-29',
    assignedBy: 'Jannatul Ferdous',
    createdDate: '2026-06-17',
    isPublic: true,
  },
];

export const CLASS_SUBJECTS: Record<string, string[]> = {
  '6': ['Bangla', 'English', 'Mathematics', 'Science', 'ICT'],
  '7': ['Bangla', 'English', 'Mathematics', 'Science', 'ICT'],
  '8': ['Bangla', 'English', 'Mathematics', 'Science', 'ICT'],
  '9': ['Bangla', 'English', 'Mathematics', 'Physics', 'Chemistry', 'ICT'],
  '10': ['Bangla', 'English', 'General Math', 'Biology', 'Physics', 'ICT'],
};

export const INITIAL_ONLINE_EXAMS: OnlineExam[] = [
  {
    id: 'exam-math-9-ch3',
    title: { bn: '৯ম শ্রেণী গণিত: বীজগাণিতিক রাশি MCQ', en: 'Class 9 Math: Algebraic Expressions MCQ' },
    classId: '9',
    subject: 'Mathematics',
    chapter: 'Chapter 3: Algebraic Expressions',
    durationMinutes: 10,
    mode: 'exam',
    createdBy: 'Subrata Das',
    date: '2026-06-12',
    isPublic: true,
    questions: [
      {
        id: 'q1',
        question: 'If a + b = 5 and ab = 6, what is the value of a² + b²?',
        options: ['11', '13', '17', '25'],
        correctIndex: 1,
        explanation: 'a² + b² = (a + b)² - 2ab = 5² - 2(6) = 25 - 12 = 13.',
      },
      {
        id: 'q2',
        question: 'What is the factored form of x² - 9?',
        options: ['(x - 3)²', '(x + 3)²', '(x + 3)(x - 3)', '(x - 9)(x + 1)'],
        correctIndex: 2,
        explanation: 'Using difference of squares: a² - b² = (a + b)(a - b). Here b = 3.',
      },
      {
        id: 'q3',
        question: 'If x - 1/x = 4, then what is x² + 1/x²?',
        options: ['14', '16', '18', '20'],
        correctIndex: 2,
        explanation: 'x² + 1/x² = (x - 1/x)² + 2 = 16 + 2 = 18.',
      },
      {
        id: 'q4',
        question: 'What is the value of (a - b)² + 4ab?',
        options: ['(a + b)²', 'a² - b²', '2(a² + b²)', 'a² + b²'],
        correctIndex: 0,
        explanation: '(a - b)² + 4ab = a² - 2ab + b² + 4ab = a² + 2ab + b² = (a + b)².',
      },
    ],
  },
  {
    id: 'exam-ict-9-ch2',
    title: { bn: 'আইসিটি কুইজ: কম্পিউটার নিরাপত্তা ও নেটওয়ার্ক', en: 'ICT Quiz: Cybersecurity & Networks' },
    classId: '9',
    subject: 'ICT',
    chapter: 'Chapter 2: Computer Security',
    durationMinutes: 8,
    mode: 'practice',
    createdBy: 'Jannatul Ferdous',
    date: '2026-06-14',
    isPublic: true,
    questions: [
      {
        id: 'q1',
        question: 'Which protocol encrypts communication between browser and web server?',
        options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
        correctIndex: 2,
        explanation: 'HTTPS uses TLS/SSL encryption to secure web traffic.',
      },
      {
        id: 'q2',
        question: 'What is the full form of CPU?',
        options: ['Central Program Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Control Processing Utility'],
        correctIndex: 1,
        explanation: 'CPU stands for Central Processing Unit, the primary processor of a computer.',
      },
      {
        id: 'q3',
        question: 'Which of the following is considered strong password hygiene?',
        options: ['Using 123456', 'Using your birth date', 'Combining upper/lowercase letters, numbers & symbols', 'Sharing passwords with friends'],
        correctIndex: 2,
        explanation: 'Long passwords with mixed characters resist brute-force and dictionary attacks.',
      },
      {
        id: 'q4',
        question: 'Which HTML tag defines the largest heading?',
        options: ['<head>', '<h6>', '<h1>', '<header>'],
        correctIndex: 2,
        explanation: '<h1> defines the highest-level heading in HTML documents.',
      },
    ],
  },
  {
    id: 'exam-phy-10-ch1',
    title: { bn: 'পদার্থবিজ্ঞান: গতি ও বল অনুশীলন পরীক্ষা', en: 'Physics Practice: Motion & Force' },
    classId: '10',
    subject: 'Physics',
    chapter: 'Chapter 2 & 3: Motion & Laws of Force',
    durationMinutes: 10,
    mode: 'exam',
    createdBy: 'Md. Rafiqul Islam',
    date: '2026-06-16',
    isPublic: true,
    questions: [
      {
        id: 'q1',
        question: 'What is the SI unit of Acceleration?',
        options: ['m/s', 'm/s²', 'N', 'kg·m/s'],
        correctIndex: 1,
        explanation: 'Acceleration is rate of change of velocity: (m/s)/s = m/s².',
      },
      {
        id: 'q2',
        question: 'According to Newton’s Second Law, Force F equals:',
        options: ['m / a', 'm × v', 'm × a', 'v / t'],
        correctIndex: 2,
        explanation: 'Newton’s Second Law states F = m × a (mass times acceleration).',
      },
      {
        id: 'q3',
        question: 'A car starts from rest with uniform acceleration 2 m/s². What is its velocity after 5 seconds?',
        options: ['2.5 m/s', '7 m/s', '10 m/s', '25 m/s'],
        correctIndex: 2,
        explanation: 'v = u + at = 0 + (2 × 5) = 10 m/s.',
      },
    ],
  },
  {
    id: 'exam-eng-6-ch1',
    title: { bn: '৬ষ্ঠ শ্রেণী ইংরেজি গ্রামার প্র্যাকটিস', en: 'Class 6 English Grammar Practice' },
    classId: '6',
    subject: 'English',
    chapter: 'Parts of Speech & Articles',
    durationMinutes: 8,
    mode: 'practice',
    createdBy: 'Md. Nazrul Islam',
    date: '2026-06-15',
    isPublic: true,
    questions: [
      {
        id: 'q1',
        question: 'Choose the correct article: "He is ___ honest man."',
        options: ['a', 'an', 'the', 'no article'],
        correctIndex: 1,
        explanation: '"Honest" begins with a vowel sound (/ɒ/), so "an" is used.',
      },
      {
        id: 'q2',
        question: 'Identify the verb in: "The students study diligently."',
        options: ['The', 'students', 'study', 'diligently'],
        correctIndex: 2,
        explanation: '"study" expresses the action in the sentence.',
      },
      {
        id: 'q3',
        question: 'Which is the plural form of "Child"?',
        options: ['Childs', 'Childrens', 'Children', 'Childes'],
        correctIndex: 2,
        explanation: '"Child" has the irregular plural "Children".',
      },
    ],
  },
];

export const INITIAL_ALUMNI: AlumniProfile[] = [
  {
    id: 'alu-1',
    name: 'Md. Jahidul Islam',
    batchYear: '2018',
    currentRole: 'Software Engineer & Researcher',
    organization: 'IIT, University of Dhaka',
    city: 'Dhaka',
    message: 'Proud alumnus of Ranir Bazar Secondary High School. Wishing our younger students limitless curiosity and excellence.',
    status: 'approved',
    isPublic: true,
  },
  {
    id: 'alu-2',
    name: 'Dr. Taslima Akter',
    batchYear: '2014',
    currentRole: 'Medical Officer',
    organization: 'Cumilla Medical College Hospital',
    city: 'Cumilla',
    message: 'The discipline and guidance of our teachers built the foundation of my career in medicine.',
    status: 'approved',
    isPublic: true,
  },
  {
    id: 'alu-3',
    name: 'Engr. Kamrul Hasan',
    batchYear: '2016',
    currentRole: 'Civil Engineer',
    organization: 'LGED Bangladesh',
    city: 'Chattogram',
    message: 'Grateful to every mentor at RBHS. Looking forward to the Winter Alumni Reunion 2026!',
    status: 'approved',
    isPublic: true,
  },
];

export const EIIN = INITIAL_SETTINGS.eiin;
export const CONTACT_INFO = {
  mobile: INITIAL_SETTINGS.phone,
  email: INITIAL_SETTINGS.email,
  location: INITIAL_SETTINGS.location,
};
export const CLASSES = ROUTINES;
export const CLASS_ROUTINES = ROUTINES;
export const EXAM_TERMS = [
  { id: 'First Term Exam 2026', bn: 'প্রথম সাময়িক পরীক্ষা ২০২৬', en: 'First Term Exam 2026' },
  { id: 'Half-Yearly Exam 2026', bn: 'অর্ধবার্ষিক পরীক্ষা ২০২৬', en: 'Half-Yearly Exam 2026' },
  { id: 'Pre-Test Exam 2026', bn: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬', en: 'Pre-Test Exam 2026' },
  { id: 'Annual Exam 2026', bn: 'বার্ষিক পরীক্ষা ২০২৬', en: 'Annual Exam 2026' },
];
export const NOTICES = INITIAL_NOTICES;
export const E_BOOKS_2026 = INITIAL_EBOOKS;
export const GALLERY = INITIAL_GALLERY;
export const INITIAL_STUDENT_LEAVES = [
  {
    id: 'sl-1',
    studentId: 'st-9-1',
    studentName: 'আরিয়ান করিম (Aryan Karim)',
    roll: '01',
    classId: '9',
    leaveType: 'Sick' as const,
    startDate: '2026-06-18',
    endDate: '2026-06-19',
    reason: 'Seasonal fever and doctor advised 2 days rest.',
    status: 'pending' as const,
    submittedDate: '2026-06-17',
  },
];
export const INITIAL_FEE_RECORDS: FeeRecord[] = [
  {
    id: 'fee-2026-9-01-tuition',
    studentId: 'st-9-1',
    studentName: 'আরিয়ান করিম (Aryan Karim)',
    classId: '9',
    roll: '01',
    title: 'Monthly Tuition Fee — June 2026',
    category: 'Tuition',
    billingMonth: 'June 2026',
    amount: 850,
    paidAmount: 850,
    dueDate: '2026-06-10',
    status: 'paid',
    paymentMethod: 'bKash',
    receiptNo: 'RBMB-2026-0901',
    paidDate: '2026-06-05',
    recordedBy: 'Md. Abdul Karim',
  },
  {
    id: 'fee-2026-9-01-exam',
    studentId: 'st-9-1',
    studentName: 'আরিয়ান করিম (Aryan Karim)',
    classId: '9',
    roll: '01',
    title: 'Half-Yearly Examination Fee 2026',
    category: 'Exam',
    billingMonth: 'Half-Yearly 2026',
    amount: 600,
    paidAmount: 0,
    dueDate: '2026-06-25',
    status: 'pending',
    recordedBy: 'Office Accounts',
  },
];

export const INITIAL_PORTAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: 'pn-2026-1',
    title: 'Half-Yearly Exam Admit & Fee Clearance',
    message: 'Students of Classes 6–10 are requested to clear pending exam fees before 25 June 2026 to collect their printed exam admit card.',
    targetRole: 'all',
    classId: 'all',
    priority: 'urgent',
    senderName: 'Md. Abdul Karim (Head Teacher)',
    createdDate: '2026-06-12',
  },
  {
    id: 'pn-2026-2',
    title: 'Parent-Teacher Academic Progress Meet',
    message: 'Guardians of Class 9 & 10 are invited to review half-yearly preparation and attendance sheets in respective classrooms at 10:00 AM.',
    targetRole: 'parent',
    classId: '9',
    priority: 'normal',
    senderName: 'Class Teacher Desk',
    createdDate: '2026-06-14',
  },
];

export type { EBook };

