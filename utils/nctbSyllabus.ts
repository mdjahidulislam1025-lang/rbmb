import { SYLLABUS_2026 } from '../constants';
import { LocalizedString, SchoolSubject, StudyGroup } from '../types';
import { inferSubjectStudyGroup } from './teacherRole';

export interface NctbSyllabusSubjectDetail {
  code: string;
  name: LocalizedString;
  group: StudyGroup;
  totalMarks: number;
  marksBreakdown: LocalizedString;
  chaptersOutline: LocalizedString;
  nctbBookUrl: string;
}

export interface NctbClassSyllabus {
  classId: string;
  className: LocalizedString;
  nctbPortalUrl: string;
  subjects: NctbSyllabusSubjectDetail[];
}

const NCTB_CURRICULUM_META: Record<
  string,
  {
    totalMarks: number;
    marksBreakdown: LocalizedString;
    chaptersOutline: LocalizedString;
  }
> = {
  '101': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'NCTB গদ্য, পদ্য, সহপাঠ/উপন্যাস-নাটক ও নির্ধারিত পাঠ্যবই অধ্যায়সমূহ',
      en: 'NCTB Prose, Poetry, Supplementary Reader & Prescribed Chapters',
    },
  },
  '102': {
    totalMarks: 100,
    marksBreakdown: { bn: 'ব্যাকরণ ও বহুনির্বাচনি ৩০ + নির্মিতি ৭০', en: 'Grammar & MCQ 30 + Composition 70' },
    chaptersOutline: {
      bn: 'ধ্বনিতত্ত্ব, শব্দতত্ত্ব, বাক্যতত্ত্ব, অনুচ্ছেদ, ভাবসম্প্রসারণ, পত্র ও প্রবন্ধ রচনা',
      en: 'Phonology, Morphology, Syntax, Precis, Letter & Essay Writing',
    },
  },
  '107': {
    totalMarks: 100,
    marksBreakdown: { bn: 'লিখিত ১০০ (Reading, Grammar & Writing)', en: 'Written 100 (Reading, Grammar & Writing)' },
    chaptersOutline: {
      bn: 'NCTB English for Today — Seen/Unseen Comprehension, Vocabulary & Guided Writing',
      en: 'NCTB English for Today — Units, Reading Comprehension & Composition',
    },
  },
  '108': {
    totalMarks: 100,
    marksBreakdown: { bn: 'Grammar ৬০ + Composition ৪০', en: 'Grammar 60 + Composition 40' },
    chaptersOutline: {
      bn: 'Parts of Speech, Tense, Voice, Narration, Connectors, CV, Paragraph & Email',
      en: 'Grammar Mastery (Tense, Voice, Narration, Clauses) & Academic Writing',
    },
  },
  '109': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'বাস্তব সংখ্যা, সেট ও ফাংশন, বীজগাণিতিক রাশি, জ্যামিতি, ত্রিকোণমিতি, পরিমিতি ও পরিসংখ্যান',
      en: 'Number Systems, Sets, Algebra, Geometry, Trigonometry, Mensuration & Statistics',
    },
  },
  '126': {
    totalMarks: 100,
    marksBreakdown: { bn: 'তত্ত্বীয় ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫', en: 'CQ 50 + MCQ 25 + Practical 25' },
    chaptersOutline: {
      bn: 'সেট ও ফাংশন, অসীম ধারা, স্থানাঙ্ক জ্যামিতি, ভেক্টর, দ্বিপদী বিস্তৃতি ও সম্ভাবনা',
      en: 'Functions, Infinite Series, Coordinate Geometry, Vectors, Binomial & Probability',
    },
  },
  '127': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'জীবকোষ, পুষ্টি, পদার্থের গঠন, বল ও গতি, আলো, বিদ্যুৎ, প্রাকৃতিক সম্পদ ও পরিবেশ',
      en: 'Cell Biology, Matter, Force & Motion, Light, Electricity & Environment',
    },
  },
  '136': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫', en: 'CQ 50 + MCQ 25 + Practical 25' },
    chaptersOutline: {
      bn: 'ভৌত রাশি ও পরিমাপ, গতি, বল, কাজ-ক্ষমতা-শক্তি, তরঙ্গ ও শব্দ, আলোর প্রতিফলন-প্রতিসরণ ও তড়িৎ',
      en: 'Measurement, Motion, Force, Work-Energy, Waves, Optics, Electricity & Magnetism',
    },
  },
  '137': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫', en: 'CQ 50 + MCQ 25 + Practical 25' },
    chaptersOutline: {
      bn: 'পদার্থের অবস্থা, পরমাণুর গঠন, পর্যায় সারণি, রাসায়নিক বন্ধন, মোল, অ্যাসিড-ক্ষার ও জৈব রসায়ন',
      en: 'Atomic Structure, Periodic Table, Chemical Bonding, Mole Concept & Organic Chemistry',
    },
  },
  '138': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫', en: 'CQ 50 + MCQ 25 + Practical 25' },
    chaptersOutline: {
      bn: 'জীবন পাঠ, জীবকোষ ও টিস্যু, কোষ বিভাজন, জীবনীশক্তি, পুষ্টি, সংবহন, রেচন ও বংশগতি',
      en: 'Cell & Tissue, Cell Division, Bioenergetics, Nutrition, Circulation & Genetics',
    },
  },
  '150': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'মুক্তিযুদ্ধ ও স্বাধীন বাংলাদেশ, রাষ্ট্র ও সংবিধান, ভূ-প্রকৃতি, অর্থনীতি ও টেকসই উন্নয়ন',
      en: 'Liberation War & History, State & Constitution, Geography, Economy & SDGs',
    },
  },
  '154': {
    totalMarks: 50,
    marksBreakdown: { bn: 'বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫', en: 'MCQ 25 + Practical 25' },
    chaptersOutline: {
      bn: 'তথ্য প্রযুক্তির ব্যবহার, কম্পিউটার নিরাপত্তা, স্প্রেডশিট, মাল্টিমিডিয়া ও ডিজিটাল কন্টেন্ট',
      en: 'ICT Applications, Cybersecurity, Spreadsheets, Multimedia & Digital Content',
    },
  },
  '111': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'আকাইদ ও নৈতিকতা, ইবাদত, কুরআন ও হাদিস শিক্ষা, আদর্শ জীবনচরিত ও মানবিক মূল্যবোধ',
      en: 'Faith & Ethics, Worship, Sacred Texts, Ideal Character & Moral Values',
    },
  },
  '134': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫', en: 'CQ 50 + MCQ 25 + Practical 25' },
    chaptersOutline: {
      bn: 'কৃষি প্রযুক্তি, বীজ সংরক্ষণ, ফসল উৎপাদন, মৎস্য ও গবাদিপশু পালন এবং বনায়ন',
      en: 'Agricultural Technology, Soil & Seeds, Crop Production, Fisheries & Forestry',
    },
  },
  '151': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫', en: 'CQ 50 + MCQ 25 + Practical 25' },
    chaptersOutline: {
      bn: 'গৃহ ব্যবস্থাপনা, শিশু বিকাশ, খাদ্য ও পুষ্টি, বস্ত্র পরিচ্ছদ ও পারিবারিক বাজেট',
      en: 'Home Management, Child Development, Food & Nutrition, Textiles & Family Budget',
    },
  },
  '147': {
    totalMarks: 50,
    marksBreakdown: { bn: 'তত্ত্বীয় ২৫ + ব্যবহারিক ২৫', en: 'Theory 25 + Practical 25' },
    chaptersOutline: {
      bn: 'শারীরিক সক্ষমতা, ব্যায়াম, বয়ঃসন্ধিকালীন স্বাস্থ্য, প্রাথমিক চিকিৎসা ও খেলাধুলার নিয়মাবলি',
      en: 'Physical Fitness, Hygiene, First Aid, Athletics & Sports Rules',
    },
  },
  '148': {
    totalMarks: 50,
    marksBreakdown: { bn: 'তত্ত্বীয় ২০ + ব্যবহারিক ৩০', en: 'Theory 20 + Practical 30' },
    chaptersOutline: {
      bn: 'বাংলাদেশের লোকশিল্প, অঙ্কন, জলরং, নকশা ও কারুশিল্প অনুশীলন',
      en: 'Folk Art of Bangladesh, Drawing, Watercolor, Design & Craft Practice',
    },
  },
  '156': {
    totalMarks: 50,
    marksBreakdown: { bn: 'তত্ত্বীয় ২৫ + ব্যবহারিক/ধারাবাহিক ২৫', en: 'Theory 25 + Assessment 25' },
    chaptersOutline: {
      bn: 'ক্যারিয়ার পরিকল্পনা, কর্মদক্ষতা, যোগাযোগ দক্ষতা ও পেশা নির্বাচন',
      en: 'Career Planning, Workplace Skills, Communication & Profession Choices',
    },
  },
  '153': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'প্রাচীন ও মধ্যযুগের বাংলা, প্রাচীন বিশ্বসভ্যতা, ব্রিটিশ শাসন, ভাষা আন্দোলন ও মুক্তিযুদ্ধ',
      en: 'Ancient & Medieval Bengal, World Civilizations, Colonial Era & Liberation War',
    },
  },
  '110': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'মহাবিশ্ব ও পৃথিবী, মানচিত্র পঠন, ভূমিরূপ, জলবায়ু, বাংলাদেশের নদ-নদী ও দুর্যোগ ব্যবস্থাপনা',
      en: 'Earth & Universe, Map Reading, Landforms, Climate, Rivers & Disaster Management',
    },
  },
  '140': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'নাগরিক ও নাগরিকতা, রাষ্ট্র ও সরকার ব্যবস্থা, সংবিধান, স্থানীয় সরকার ও আন্তর্জাতিক সংস্থা',
      en: 'Citizenship, State & Government, Constitution, Local Governance & Global Bodies',
    },
  },
  '141': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'মৌলিক অর্থনৈতিক সমস্যা, চাহিদা ও যোগান, উৎপাদন, জাতীয় আয়, মুদ্রা ও ব্যাংকিং ব্যবস্থা',
      en: 'Demand & Supply, Production, National Income, Money, Banking & Public Finance',
    },
  },
  '146': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'হিসাব সমীকরণ, লেনদেন, জাবেদা, খতিয়ান, নগদান বই, রেওয়ামিল ও আর্থিক বিবরণী',
      en: 'Accounting Equation, Journal, Ledger, Cash Book, Trial Balance & Financial Statements',
    },
  },
  '152': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'অর্থায়নের উৎস, অর্থের সময়মূল্য, মূলধন বাজেটিং, ঝুঁকি ও অনিশ্চয়তা এবং বাণিজ্যিক ব্যাংকিং',
      en: 'Time Value of Money, Capital Budgeting, Risk & Return, Commercial & Central Banking',
    },
  },
  '143': {
    totalMarks: 100,
    marksBreakdown: { bn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০', en: 'CQ 70 + MCQ 30' },
    chaptersOutline: {
      bn: 'ব্যবসায় পরিচিতি, উদ্যোগ উন্নয়ন, আত্মকর্মসংস্থান, ব্যবসায় পরিকল্পনা, বিপণন ও নৈতিকতা',
      en: 'Business Fundamentals, Entrepreneurship, Business Plan, Marketing & Business Ethics',
    },
  },
};

export function getNctbBookPortalUrl(classId: string): string {
  const cid = String(classId || '').trim();
  if (cid === '6' || cid === '7' || cid === '8' || cid === '9' || cid === '10') {
    return 'https://nctb.gov.bd/site/page/41937698-7733-4a34-b082-0a0a672676f3';
  }
  return 'https://nctb.gov.bd';
}

export function buildNctbClassSyllabus(
  classId: string,
  customSubjects: SchoolSubject[] = []
): NctbClassSyllabus | null {
  const base = SYLLABUS_2026.find((s) => s.classId === classId);
  if (!base) return null;

  const portalUrl = getNctbBookPortalUrl(classId);
  const items: NctbSyllabusSubjectDetail[] = base.subjects.map((sub) => {
    const meta = NCTB_CURRICULUM_META[sub.code] || {
      totalMarks: 100,
      marksBreakdown: { bn: 'NCTB মূল্যায়ন পদ্ধতি অনুযায়ী', en: 'Per NCTB Assessment Framework' },
      chaptersOutline: {
        bn: 'NCTB অনুমোদিত ২০২৬ শিক্ষাবর্ষের পূর্ণাঙ্গ পাঠ্যক্রম ও অধ্যায়সমূহ',
        en: 'Official 2026 NCTB approved chapters and competency units',
      },
    };
    return {
      code: sub.code,
      name: sub.name,
      group: sub.group && sub.group !== 'All' ? sub.group : 'Common',
      totalMarks: meta.totalMarks,
      marksBreakdown: meta.marksBreakdown,
      chaptersOutline: meta.chaptersOutline,
      nctbBookUrl: sub.pdfUrl && sub.pdfUrl !== '#' ? sub.pdfUrl : portalUrl,
    };
  });

  // Merge any extra Admin-managed subjects for this class that aren't already in base NCTB list
  customSubjects
    .filter((cs) => cs.classId === classId)
    .forEach((cs) => {
      const group = inferSubjectStudyGroup(classId, cs.code, cs.name.en, cs.group);
      const exists = items.some(
        (existing) =>
          (existing.code === cs.code && existing.group === group) ||
          (existing.name.en.trim().toLowerCase() === cs.name.en.trim().toLowerCase() &&
            existing.group === group)
      );
      if (exists) return;

      const meta = NCTB_CURRICULUM_META[cs.code];
      items.push({
        code: cs.code,
        name: cs.name,
        group,
        totalMarks: cs.totalMarks || meta?.totalMarks || 100,
        marksBreakdown: meta?.marksBreakdown || {
          bn: 'বিদ্যালয় ও NCTB মূল্যায়ন কাঠামো',
          en: 'School & NCTB Assessment Structure',
        },
        chaptersOutline: meta?.chaptersOutline || {
          bn: 'NCTB ও বিদ্যালয় নির্ধারিত অধ্যায়ভিত্তিক সিলেবাস',
          en: 'NCTB & School Prescribed Chapter Syllabus',
        },
        nctbBookUrl: portalUrl,
      });
    });

  return {
    classId: base.classId,
    className: base.className,
    nctbPortalUrl: portalUrl,
    subjects: items,
  };
}

export function buildAllNctbSyllabuses(customSubjects: SchoolSubject[] = []): NctbClassSyllabus[] {
  return SYLLABUS_2026.map((item) => buildNctbClassSyllabus(item.classId, customSubjects)).filter(
    (item): item is NctbClassSyllabus => item !== null
  );
}
