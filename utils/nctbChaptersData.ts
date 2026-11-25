import { LocalizedString } from '../types';

export interface NctbSyllabusChapter {
  chapterTitle: LocalizedString;
  topics: LocalizedString;
}

const ch = (bnTitle: string, enTitle: string, bnTopics: string, enTopics: string): NctbSyllabusChapter => ({
  chapterTitle: { bn: bnTitle, en: enTitle },
  topics: { bn: bnTopics, en: enTopics },
});

// Class-specific NCTB chapters & topics keyed by `${classId}:${subjectCode}`
// Junior Secondary (6, 7, 8) & Secondary (9, 10)
export const NCTB_CHAPTERS_BY_CLASS_CODE: Record<string, NctbSyllabusChapter[]> = {
  // ==================== CLASS 6 ====================
  '6:101': [
    ch('অধ্যায় ১: গদ্য (সততার পুরস্কার, মিনু, নীলনদ আর পিরামিডের দেশ)', 'Part 1: Prose (Satatar Puroskar, Minu, Nile & Pyramids)', 'মানবিক মূল্যবোধ, সহমর্মিতা, ভ্রমণকাহিনী ও শব্দার্থ বিশ্লেষণ', 'Moral values, empathy, travelogue comprehension & vocabulary'),
    ch('অধ্যায় ২: পদ্য (জন্মভূমি, সুখ, মানুষ জাতি, আসমানী)', 'Part 2: Poetry (Janmabhumi, Sukh, Manush Jati, Asmani)', 'স্বদেশপ্রেম, মানবতা, ছন্দ-অন্ত্যমিল ও ভাবার্থ অনুধাবন', 'Patriotism, humanism, rhyme analysis & poetic theme'),
    ch('অধ্যায় ৩: বাংলা ব্যাকরণ ও নির্মিতি', 'Part 3: Bangla Grammar & Composition', 'ধ্বনি ও বর্ণ, শব্দ গঠন, পদ পরিচয়, অনুচ্ছেদ, সারাংশ ও পত্র রচনা', 'Phonetics, word formation, parts of speech, paragraph & letter writing'),
  ],
  '6:107': [
    ch('Units 1–5: Going to a New School & Everyday English', 'Units 1–5: Going to a New School & Everyday English', 'Greetings, introductions, vocabulary building, reading comprehension', 'Greetings, introductions, vocabulary building & reading comprehension'),
    ch('Units 6–10: Health, Remedies & Cultural Stories', 'Units 6–10: Health, Remedies & Cultural Stories', 'Daily routines, healthy habits, dialogues & guided paragraphs', 'Daily routines, healthy habits, dialogues & guided paragraphs'),
    ch('Grammar & Guided Writing', 'Grammar & Guided Writing', 'Parts of Speech, Articles, Simple Tense, Punctuation, Formal/Informal Letters', 'Parts of Speech, Articles, Simple Tense, Punctuation & Letter Writing'),
  ],
  '6:109': [
    ch('অধ্যায় ১: স্বাভাবিক সংখ্যা ও ভগ্নাংশ', 'Chapter 1: Whole Numbers & Fractions', 'দেশীয় ও আন্তর্জাতিক গণনা পদ্ধতি, মৌলিক-যৌগিক সংখ্যা, গ.সা.গু, ল.সা.গু ও ভগ্নাংশ', 'Place value, prime numbers, HCF, LCM, common & decimal fractions'),
    ch('অধ্যায় ২: অনুপাত ও শতকরা', 'Chapter 2: Ratio & Percentage', 'অনুপাতের ধারণা, সরল ও সমতুল অনুপাত, শতকরা হিসাব ও ঐকিক নিয়ম', 'Concept of ratio, equivalent ratios, percentages & unitary method'),
    ch('অধ্যায় ৩–৪: পূর্ণসংখ্যা ও বীজগণিতীয় রাশি', 'Chapters 3–4: Integers & Algebraic Expressions', 'সংখ্যারেখা, ধনাত্মক-ঋণাত্মক সংখ্যা, চলক, সহগ, সূচক ও যোগ-বিয়োগ', 'Number line, positive/negative integers, variables, terms & addition/subtraction'),
    ch('অধ্যায় ৫–৮: সরল সমীকরণ, জ্যামিতি ও তথ্য-উপাত্ত', 'Chapters 5–8: Simple Equations, Geometry & Data', 'এক চলকবিশিষ্ট সমীকরণ, রেখা-কোণ-ত্রিভুজ অঙ্কন, গড়, মধ্যক ও প্রচুরক', 'Linear equations, lines, angles, triangles, mean, median & mode'),
  ],
  '6:127': [
    ch('অধ্যায় ১–৩: বৈজ্ঞানিক প্রক্রিয়া, জীবজগৎ ও উদ্ভিদ-প্রাণীর কোষ', 'Chapters 1–3: Scientific Process, Living World & Cells', 'পরিমাপের একক, জীবের শ্রেণিবিন্যাস, উদ্ভিদ ও প্রাণী কোষের গঠন', 'Measurement units, classification of organisms, plant & animal cell structure'),
    ch('অধ্যায় ৪–৭: সপুষ্পক উদ্ভিদ, খাদ্য-পুষ্টি ও পদার্থের বৈশিষ্ট্য', 'Chapters 4–7: Flowering Plants, Nutrition & Matter', 'সালোকসংশ্লেষণ, সুষম খাদ্য, পদার্থের অবস্থা, ধাতু ও অধাতুর ধর্ম', 'Photosynthesis, balanced diet, states of matter, metals & non-metals'),
    ch('অধ্যায় ৮–১৪: মিশ্রণ, আলোর ঘটনা, গতি, বল, বিদ্যুৎ ও জলবায়ু', 'Chapters 8–14: Mixtures, Light, Motion, Electricity & Climate', 'দ্রবণ ও পৃথকীকরণ, আলোর সরল পথে গমন, সরল যন্ত্র, চুম্বক ও পরিবেশ দূষণ', 'Solutions, propagation of light, simple machines, magnets & climate change'),
  ],
  '6:150': [
    ch('অধ্যায় ১–৩: বাংলাদেশের ইতিহাস, বিশ্বসভ্যতা ও ভৌগোলিক পরিচয়', 'Chapters 1–3: History of Bangladesh, World Civilization & Geography', 'ভাষা আন্দোলন, মুক্তিযুদ্ধ, সিন্ধু-মিশরীয় সভ্যতা এবং এশিয়া মহাদেশে বাংলাদেশ', 'Language Movement, Liberation War, Indus-Egyptian civilization & geography'),
    ch('অধ্যায় ৪–৭: জনসংখ্যা, সমাজ, সংস্কৃতি ও অর্থনীতি', 'Chapters 4–7: Population, Society, Culture & Economy', 'সামাজিকীকরণ, লোকসংস্কৃতি, কৃষি ও শিল্প খাতের অবদান', 'Socialization, folk culture, agriculture & industrial economy'),
    ch('অধ্যায় ৮–১২: রাষ্ট্র, নাগরিক অধিকার ও শিশু বিকাশ', 'Chapters 8–12: State, Citizen Rights & Child Development', 'নাগরিকের মৌলিক অধিকার, শিশু অধিকার সনদ ও আঞ্চলিক সহযোগিতা', 'Fundamental rights, UN child rights & regional cooperation'),
  ],
  '6:154': [
    ch('অধ্যায় ১–২: তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি ও যন্ত্রপাতি', 'Chapters 1–2: Introduction to ICT & Hardware Devices', 'ইনপুট-আউটপুট ডিভাইস, মেমোরি, প্রসেসর ও সফটওয়্যারের প্রাথমিক ধারণা', 'Input-output devices, memory, CPU & basics of software'),
    ch('অধ্যায় ৩–৪: নিরাপদ ব্যবহার ও ওয়ার্ড প্রসেসিং', 'Chapters 3–4: Safe ICT Use & Word Processing', 'কম্পিউটার রক্ষণাবেক্ষণ, স্বাস্থ্যঝুঁকি, বাংলা-ইংরেজি টাইপিং ও ডকুমেন্ট ফরম্যাটিং', 'Hardware care, ergonomics, typing & document formatting'),
    ch('অধ্যায় ৫: ইন্টারনেট পরিচিতি', 'Chapter 5: Introduction to the Internet', 'ওয়েব ব্রাউজার, সার্চ ইঞ্জিন ব্যবহার ও অনলাইন তথ্য অনুসন্ধান', 'Web browsers, search engines & safe online information search'),
  ],
  '6:111': [
    ch('অধ্যায় ১–২: আকাইদ ও ইবাদত', 'Chapters 1–2: Faith (Aqaid) & Worship (Ibadat)', 'তাওহিদ, রিসালাত, পবিত্রতা, ওজু, গোসল ও সালাতের গুরুত্ব ও নিয়ম', 'Tawhid, Risalat, cleanliness, Wudu & importance of Salah'),
    ch('অধ্যায় ৩–৫: কুরআন-হাদিস শিক্ষা, আখলাক ও জীবনাদর্শ', 'Chapters 3–5: Quran-Hadith, Moral Character & Biographies', 'তাজবিদ, নির্বাচিত সূরা ও হাদিস, সত্যবাদিতা, পিতা-মাতার প্রতি কর্তব্য ও নবী-রাসূলদের জীবনী', 'Tajwid, selected Surahs & Hadiths, truthfulness, respect to parents & biographies'),
  ],
  '6:134': [
    ch('অধ্যায় ১–৩: আমাদের জীবনে কৃষি ও কৃষি প্রযুক্তি', 'Chapters 1–3: Agriculture in Daily Life & Farm Technology', 'কৃষির পরিধি, কৃষি যন্ত্রপাতি, সার ও সেচ ব্যবস্থাপনা', 'Scope of agriculture, farm tools, fertilizers & irrigation'),
    ch('অধ্যায় ৪–৬: কৃষি উপকরণ, বনায়ন ও পশুপালন', 'Chapters 4–6: Seeds, Soil, Forestry & Livestock', 'মাটির গঠন, ভালো বীজ চেনা, বৃক্ষরোপণ, হাঁস-মুরগি ও মাছ চাষ', 'Soil composition, quality seeds, afforestation, poultry & fish farming'),
  ],
  '6:151': [
    ch('অধ্যায় ১–৫: গৃহ ব্যবস্থাপনা ও পরিবার', 'Chapters 1–5: Home Management & Family Life', 'গৃহের পরিবেশ, সময়ের সদ্ব্যবহার, বাজেট ও পারিবারিক দায়িত্ব', 'Home environment, time management, budgeting & family roles'),
    ch('অধ্যায় ৬–১২: খাদ্য, পুষ্টি, শিশু বিকাশ ও বস্ত্র পরিচর্যা', 'Chapters 6–12: Food, Nutrition, Child Growth & Textiles', 'পুষ্টি উপাদান, খাদ্য সংরক্ষণ, বয়ঃসন্ধিকালীন যত্ন ও সেলাই কৌশল', 'Nutrients, food preservation, adolescent care & basic sewing'),
  ],
  '6:147': [
    ch('অধ্যায় ১–৩: শরীরচর্চা, প্রাত্যহিক সমাবেশ ও ব্যক্তিগত স্বাস্থ্য', 'Chapters 1–3: Physical Exercise, Assembly & Hygiene', 'সমাবেশের নিয়ম, পিটি ব্যায়াম, পরিষ্কার-পরিচ্ছন্নতা ও প্রাথমিক চিকিৎসা', 'School assembly, PT drills, personal hygiene & first aid'),
    ch('অধ্যায় ৪–৫: ক্রীড়া ও খেলাধুলার নিয়মাবলি', 'Chapters 4–5: Sports & Athletics Rules', 'ফুটবল, ক্রিকেট, ভলিবল ও দেশীয় খেলাধুলার মৌলিক নিয়ম', 'Basic rules of football, cricket, volleyball & local games'),
  ],
  '6:148': [
    ch('অধ্যায় ১–৩: চারু ও কারুকলার ধারণা ও লোকশিল্প', 'Chapters 1–3: Concept of Arts-Crafts & Folk Art', 'বাংলাদেশের ঐতিহ্যবাহী লোকশিল্প, নকশিকাঁথা, মৃৎশিল্প ও বাঁশ-বেতের কাজ', 'Folk art heritage, Nakshi Kantha, pottery & bamboo crafts'),
    ch('অধ্যায় ৪–৬: অঙ্কন, জলরং ও কাগজের কারুকাজ', 'Chapters 4–6: Drawing, Watercolor & Paper Craft', 'জ্যামিতিক আকৃতি, প্রাকৃতিক দৃশ্য, রং মিশ্রণ ও কাগজ ভাঁজ করে নকশা', 'Perspective drawing, watercolor mixing & paper craft design'),
  ],

  // ==================== CLASS 7 ====================
  '7:101': [
    ch('অধ্যায় ১: গদ্য (কাবুলিওয়ালা, লখার একুশে, মরু-ভাস্কর, পিতৃপুরুষের গল্প)', 'Part 1: Prose (Kabuliwala, Lokhar Ekushe, Moru-Bhaskor)', 'মুক্তিযুদ্ধের চেতনা, মানবপ্রেম, জীবনী সাহিত্য ও সৃজনশীল প্রশ্ন চর্চা', 'Liberation War spirit, empathy, biography & creative question analysis'),
    ch('অধ্যায় ২: পদ্য (নতুন দেশ, কুলি-মজুর, আমার বাড়ি, শ্রাবণে)', 'Part 2: Poetry (Natun Desh, Kuli-Mojur, Amar Bari)', 'শ্রমের মর্যাদা, প্রকৃতিপ্রেম, সাম্যবাদ ও কবিতার মূলভাব বিশ্লেষণ', 'Dignity of labor, nature poetry, equality & central theme analysis'),
    ch('অধ্যায় ৩: ব্যাকরণ ও নির্মিতি', 'Part 3: Grammar & Composition', 'বচন, লিঙ্গ, সন্ধি, কারক-বিভক্তি, ভাবসম্প্রসারণ, অনুচ্ছেদ ও প্রবন্ধ রচনা', 'Number, gender, Sandhi, case-endings, amplification & essay writing'),
  ],
  '7:107': [
    ch('Units 1–5: Attention Please, Great Women & Leisure', 'Units 1–5: Attention Please, Great Women & Leisure', 'Classroom instructions, biographies, hobbies & reading comprehension', 'Classroom instructions, biographies, hobbies & reading comprehension'),
    ch('Units 6–9: Environment, Games & Climate Change', 'Units 6–9: Environment, Games & Climate Change', 'Climate impact, sports dialogues, paragraph & dialogue writing', 'Climate impact, sports dialogues, paragraph & dialogue writing'),
    ch('English Grammar & Composition', 'English Grammar & Composition', 'Tense (Present/Past/Future), Prepositions, Adjectives, Degree, Email & Story Writing', 'Tenses, Prepositions, Adjectives, Degrees of comparison & Email writing'),
  ],
  '7:109': [
    ch('অধ্যায় ১–২: মূলদ-অমূলদ সংখ্যা, সমানুপাত ও লাভ-ক্ষতি', 'Chapters 1–2: Rational-Irrational Numbers, Proportion & Profit-Loss', 'বর্গমূল নির্ণয়, সমানুপাত, সময় ও কাজ, ক্রয়মূল্য-বিক্রয়মূল্য ও শতকরা লাভ-ক্ষতি', 'Square roots, proportions, time-work problems, profit & loss'),
    ch('অধ্যায় ৩–৬: পরিমাপ ও বীজগণিতীয় সূত্রাবলি', 'Chapters 3–6: Mensuration & Algebraic Formulas', 'ক্ষেত্রফল-আয়তন পরিমাপ, বীজগণিতীয় রাশির গুণ-ভাগ, বর্গ ও উৎপাদকে বিশ্লেষণ', 'Area-volume measurement, algebraic multiplication, formulas & factorization'),
    ch('অধ্যায় ৭–১১: সরল সমীকরণ, ত্রিভুজ উপপাদ্য ও তথ্য-উপাত্ত', 'Chapters 7–11: Equations, Triangle Theorems & Statistics', 'লেখচিত্র, সমান্তরাল সরলরেখা, ত্রিভুজ সর্বসমতা ও আয়তলেখ অঙ্কন', 'Graphs, parallel lines, triangle congruence & histogram drawing'),
  ],
  '7:127': [
    ch('অধ্যায় ১–৪: নিম্নশ্রেণির জীব, কোষীয় সংগঠন ও শ্বসন', 'Chapters 1–4: Microorganisms, Cell Organization & Respiration', 'ভাইরাস-ব্যাকটেরিয়া, টিস্যু, উদ্ভিদ ও প্রাণীর শ্বসন এবং পরিবহনতন্ত্র', 'Viruses-bacteria, plant/animal tissues, respiration & transport'),
    ch('অধ্যায় ৫–৯: পরিপাক, পরমাণুর গঠন, তাপ ও সঞ্চালন', 'Chapters 5–9: Digestion, Atomic Structure, Heat & Transfer', 'পরিপাকতন্ত্র, পদার্থের কণাতত্ত্ব, তাপমাত্রা স্কেল ও তাপ পরিবহন-পরিচলন-বিকিরণ', 'Digestive system, atoms & molecules, temperature scales & heat transfer'),
    ch('অধ্যায় ১০–১৪: বিদ্যুৎ, চুম্বক, শব্দ, পরিবেশ ও জলবায়ু', 'Chapters 10–14: Electricity, Magnets, Sound & Climate', 'স্থির ও চল তড়িৎ, শব্দের উৎপত্তি, প্রাকৃতিক পরিবেশের ভারসাম্য ও দুর্যোগ', 'Static & current electricity, sound waves, ecosystem balance & climate'),
  ],
  '7:150': [
    ch('অধ্যায় ১–৪: বাংলাদেশের স্বাধীনতা সংগ্রাম, সংস্কৃতি ও সমাজ', 'Chapters 1–4: Liberation Struggle, Culture & Society', '১৯৫২–১৯৭১ ঐতিহাসিক ঘটনা, বাঙালির সাংস্কৃতিক বৈচিত্র্য ও পরিবার কাঠামো', 'Historical milestones 1952–1971, cultural diversity & family structure'),
    ch('অধ্যায় ৫–৯: বাংলাদেশের নাগরিক, নির্বাচন, জলবায়ু ও প্রবীণ অধিকার', 'Chapters 5–9: Citizenship, Elections, Climate & Senior Rights', 'নির্বাচন প্রক্রিয়া, মৌসুমি জলবায়ু, নারী-শিশু ও প্রবীণদের অধিকার', 'Election system, monsoon climate, women, child & senior citizen rights'),
    ch('অধ্যায় ১০–১৩: বাংলাদেশের সামাজিক সমস্যা ও বৈশ্বিক সম্পর্ক', 'Chapters 10–13: Social Challenges & Global Cooperation', 'যৌতুক-বাল্যবিবাহ প্রতিরোধ, পরিবেশ সুরক্ষা ও জাতিসংঘের ভূমিকা', 'Preventing social issues, environmental care & UN agencies'),
  ],
  '7:154': [
    ch('অধ্যায় ১–২: প্রাত্যহিক জীবনে ICT ও কম্পিউটারের বিভিন্ন অংশ', 'Chapters 1–2: ICT in Daily Life & Computer Components', 'কর্মক্ষেত্রে ও শিক্ষায় ICT, মাদারবোর্ড, RAM-ROM ও স্টোরেজ ডিভাইস', 'ICT in education/work, motherboard, RAM/ROM & storage devices'),
    ch('অধ্যায় ৩–৫: নিরাপদ ও নৈতিক ব্যবহার, ওয়ার্ড প্রসেসিং ও ইন্টারনেট', 'Chapters 3–5: Digital Ethics, Word Processing & Internet', 'কম্পিউটার ভাইরাস, পাসওয়ার্ড নিরাপত্তা, অভ্র/বিজয় বাংলা টাইপিং, ইমেইল', 'Cybersecurity, antivirus, Bangla typing, documents & email usage'),
  ],
  '7:111': [
    ch('অধ্যায় ১–৩: আকাইদ, ইবাদত ও কুরআন-হাদিস', 'Chapters 1–3: Aqaid, Ibadat & Quran-Hadith', 'ইমান, ফেরেশতা-আসমানি কিতাব, সাওম (রোজা), যাকাত ও নির্বাচিত সূরার শিক্ষা', 'Faith articles, fasting, charity (Zakat) & selected Quranic teachings'),
    ch('অধ্যায় ৪–৫: আখলাকে হামিদাহ ও আদর্শ জীবনচরিত', 'Chapters 4–5: Noble Character & Ideal Biographies', 'শৃঙ্খলাবোধ, অহংকার বর্জন, পরোপকার ও সাহাবা-মনীষীদের জীবনী', 'Self-discipline, humility, charity & inspiring biographies'),
  ],
  '7:134': [
    ch('অধ্যায় ১–৩: কৃষি ও আমাদের সংস্কৃতি, কৃষি প্রযুক্তি ও ফসল', 'Chapters 1–3: Agriculture Culture, Technology & Crops', 'কৃষি পরিবেশ অঞ্চল, আধুনিক সেচ, বীজতলা ও সবজি চাষ পদ্ধতি', 'Agro-ecological zones, irrigation, seedbed & vegetable cultivation'),
    ch('অধ্যায় ৪–৬: কৃষি ও জলবায়ু, গৃহপালিত প্রাণী ও মাছ চাষ', 'Chapters 4–6: Climate-Smart Farming, Livestock & Aquaculture', 'খরা-বন্যা সহিষ্ণু ফসল, ছাগল-গরু পালন, পুকুরের মাছ চাষ ও বনায়ন', 'Stress-tolerant crops, cattle/goat farming, pond aquaculture & forestry'),
  ],
  '7:151': [
    ch('অধ্যায় ১–৬: গৃহ পরিচালনা, সম্পদ ব্যবস্থাপনা ও শিশুর বেড়ে ওঠা', 'Chapters 1–6: Home Management, Resources & Child Growth', 'গৃহের নিরাপত্তা, মানবীয় ও বস্তুগত সম্পদ, শৈশব ও কৈশোর বিকাশ', 'Home safety, resource allocation, childhood & adolescent development'),
    ch('অধ্যায় ৭–১২: পুষ্টি, রোগ প্রতিরোধ, বস্ত্র শিল্প ও পোশাকের যত্ন', 'Chapters 7–12: Nutrition, Disease Prevention & Clothing Care', 'ভিটামিন ও খনিজ লবণ, রোগীর পথ্য, প্রাকৃতিক ও কৃত্রিম তন্তু', 'Vitamins & minerals, therapeutic diet, natural & synthetic fibers'),
  ],
  '7:147': [
    ch('অধ্যায় ১–৩: প্রাত্যহিক সমাবেশ, ব্যায়াম ও বয়ঃসন্ধিকাল', 'Chapters 1–3: Assembly, PT & Adolescent Health', 'দলগত ব্যায়াম, শারীরিক পরিবর্তন, মানসিক স্বাস্থ্য ও পুষ্টি', 'Group exercises, adolescent changes, mental wellness & nutrition'),
    ch('অধ্যায় ৪–৫: প্রাথমিক চিকিৎসা ও দলীয় ক্রীড়া', 'Chapters 4–5: First Aid & Team Sports', 'হাড়ভাঙা, রক্তপাত ও সাপে কাটার প্রাথমিক চিকিৎসা, অ্যাথলেটিকস ও ব্যাডমিন্টন', 'Fracture/bleeding first aid, athletics, badminton & kabaddi'),
  ],
  '7:148': [
    ch('অধ্যায় ১–৩: বাংলাদেশের প্রাচীন শিল্পকলা ও আলপনা', 'Chapters 1–3: Ancient Art of Bengal & Alpana', 'টেরাকোটা, মসলিন ঐতিহ্য, উৎসবের আলপনা ও দেয়ালচিত্র', 'Terracotta heritage, traditional motifs, Alpana & mural art'),
    ch('অধ্যায় ৪–৬: প্রকৃতি অঙ্কন, ছাপচিত্র ও কারুশিল্প', 'Chapters 4–6: Nature Sketching, Printmaking & Crafts', 'পেনসিল শেডিং, ব্লক-বাটিক প্রিন্ট, মাটি ও কাঠের নকশা তৈরি', 'Pencil shading, block print basics, clay & decorative crafts'),
  ],

  // ==================== CLASS 8 ====================
  '8:101': [
    ch('অধ্যায় ১: গদ্য (অতিথির স্মৃতি, ভাব ও কাজ, পড়ে পাওয়া, তৈলচিত্রের ভূত, এবারের সংগ্রাম)', 'Part 1: Prose (Atithir Smriti, Bhab o Kaj, Pore Pawa, Bangabandhu Speech)', '৭ই মার্চের ঐতিহাসিক ভাষণ, মানবতাবোধ, যুক্তিবাদ ও কিশোর গল্প বিশ্লেষণ', '7th March speech, humanism, rational thinking & prose analysis'),
    ch('অধ্যায় ২: পদ্য (মানবধর্ম, বঙ্গভূমির প্রতি, দুই বিঘা জমি, পাছে লোকে কিছু বলে)', 'Part 2: Poetry (Manabdharma, Bangabhumir Proti, Dui Bigha Jomi)', 'অসাম্প্রদায়িক চেতনা, স্বদেশপ্রেম, সামাজিক ন্যায়বিচার ও আত্মপ্রত্যয়', 'Secular values, patriotism, social justice & self-confidence'),
    ch('অধ্যায় ৩: বাংলা ব্যাকরণ ও নির্মিতি', 'Part 3: Bangla Grammar & Composition', 'ধ্বনির পরিবর্তন, সন্ধি, সমাস, উপসর্গ, বিরাম চিহ্ন, সারাংশ, ভাবসম্প্রসারণ ও রচনা', 'Sound change, Sandhi, Samas, prefixes, punctuation & formal essays'),
  ],
  '8:107': [
    ch('Units 1–4: A Glimpse of Our Culture, Food & Health', 'Units 1–4: Culture, Food, Nutrition & Health', 'Bangladeshi heritage, ethnic cultures, hygiene, nutrition & reading comprehension', 'Cultural heritage, nutrition, hygiene & reading comprehension'),
    ch('Units 5–9: Making a Difference, Going on a Foreign Trip & Travel', 'Units 5–9: Social Change, Travel & River Gypsies', 'Airport & travel dialogues, biographical stories, environmental awareness', 'Travel dialogues, biographies & social change themes'),
    ch('English Grammar & Writing', 'English Grammar & Writing', 'Changing Sentences, Voice, Narration, Suffix-Prefix, Tag Questions, CV & Composition', 'Sentence transformation, Voice, Narration, Affixes & Composition'),
  ],
  '8:109': [
    ch('অধ্যায় ১–৩: প্যাটার্ন, মুনাফা ও পরিমাপ', 'Chapters 1–3: Patterns, Profit-Interest & Mensuration', 'ফিবোনাচ্চি ও ম্যাজিক বর্গ, সরল ও চক্রবৃদ্ধি মুনাফা, ক্ষেত্রফল ও আয়তন নির্ণয়', 'Number patterns, simple & compound interest, area & volume'),
    ch('অধ্যায় ৪–৭: বীজগণিতীয় সূত্র, ভগ্নাংশ, সরল সহসমীকরণ ও সেট', 'Chapters 4–7: Algebraic Formulas, Fractions, Simultaneous Equations & Sets', 'ঘনের সূত্র, গ.সা.গু-ল.সা.গু, প্রতিস্থাপন-অপনয়ন ও লেখচিত্র সমাধান, সেট সংযোগ-ছেদ', 'Cubic formulas, algebraic HCF/LCM, 2-variable equations & set operations'),
    ch('অধ্যায় ৮–১১: চতুর্ভুজ, পিথাগোরাসের উপপাদ্য, বৃত্ত ও তথ্য-উপাত্ত', 'Chapters 8–11: Quadrilaterals, Pythagoras Theorem, Circles & Statistics', 'পিথাগোরাসের উপপাদ্য প্রমাণ, বৃত্তের পরিধি-ক্ষেত্রফল, গণসংখ্যা সারণি ও পাই-চিত্র', 'Pythagoras theorem, circle geometry, frequency tables & pie charts'),
  ],
  '8:127': [
    ch('অধ্যায় ১–৪: প্রাণিজগতের শ্রেণিবিন্যাস, কোষ বিভাজন ও উদ্ভিদে পরিবহন', 'Chapters 1–4: Animal Classification, Cell Division & Plant Transport', 'পর্বভিত্তিক শ্রেণিবিন্যাস, মাইটোসিস-মিয়োসিস, অভিস্রবণ ও প্রস্বেদন', 'Animal phyla, mitosis & meiosis, osmosis & transpiration'),
    ch('অধ্যায় ৫–৯: সমন্বয়-নিঃসরণ, পরমাণুর গঠন, রাসায়নিক বিক্রিয়া ও তড়িৎ', 'Chapters 5–9: Nervous System, Atomic Structure, Reactions & Circuits', 'স্নায়ুতন্ত্র, রাদারফোর্ড ও বোর পরমাণু মডেল, এসিড-ক্ষার-লবণ, ওহমের সূত্র ও বর্তনী', 'Nervous system, atomic models, acids-bases-salts, Ohm law & circuits'),
    ch('অধ্যায় ১০–১৪: পৃথিবী-মহাকর্ষ, আলোর প্রতিসরণ, মহাকাশ ও বাস্তুতন্ত্র', 'Chapters 10–14: Gravitation, Refraction, Space & Ecosystems', 'মহাকর্ষীয় বল, ভর ও ওজন, লেন্স ও চোখের গঠন, কৃত্রিম উপগ্রহ ও খাদ্যজাল', 'Gravitation, mass vs weight, refraction & eye, satellites & food webs'),
  ],
  '8:150': [
    ch('অধ্যায় ১–৪: ঔপনিবেশিক যুগ, বাংলার স্বাধীনতার সংগ্রাম ও মুক্তিযুদ্ধ', 'Chapters 1–4: Colonial Era & Liberation War of 1971', 'পলাশী যুদ্ধ, সিপাহী বিদ্রোহ, ১৯৭০ নির্বাচন ও মুক্তিযুদ্ধের সেক্টর', 'Battle of Plassey, 1857 uprising, 1970 election & Liberation War sectors'),
    ch('অধ্যায় ৫–৯: বাংলাদেশের সমাজ, অর্থনীতি, রাষ্ট্র ও জনসংখ্যা', 'Chapters 5–9: Society, Economy, Governance & Demography', 'সামাজিকীকরণ, রেমিট্যান্স ও জিডিপি, সংবিধানের মূলনীতি ও জনসম্পদ উন্নয়ন', 'Socialization, GDP & remittance, constitution & human capital'),
    ch('অধ্যায় ১০–১৪: বাংলাদেশের দুর্যোগ, জলবায়ু ও টেকসই উন্নয়ন', 'Chapters 10–14: Disasters, Climate & Sustainable Development', 'ঘূর্ণিঝড়-নদীভাঙন মোকাবিলা, কিশোর অপরাধ প্রতিরোধ ও SDGs লক্ষ্যমাত্রা', 'Disaster management, juvenile delinquency prevention & UN SDGs'),
  ],
  '8:154': [
    ch('অধ্যায় ১–২: তথ্য ও যোগাযোগ প্রযুক্তির গুরুত্ব এবং কম্পিউটার নেটওয়ার্ক', 'Chapters 1–2: Importance of ICT & Computer Networks', 'কর্মসংস্থান, ই-গভর্ন্যান্স, LAN-MAN-WAN, টপোলজি ও রাউটার-সুইচ', 'E-governance, e-commerce, LAN/WAN, network topologies & routers'),
    ch('অধ্যায় ৩–৫: সাইবার নিরাপত্তা, স্প্রেডশিট ও দৈনন্দিন জীবনে ইন্টারনেট', 'Chapters 3–5: Cybersecurity, Spreadsheets & Internet Applications', 'ম্যালওয়্যার ও হ্যাকিং, Excel/Calc যোগ-বিয়োগ-গড় ফর্মুলা ও ই-মেইল যোগাযোগ', 'Malware protection, spreadsheet formulas (SUM/AVERAGE) & safe email'),
  ],
  '8:111': [
    ch('অধ্যায় ১–৩: আকাইদ, ইবাদত (যাকাত ও হজ) এবং কুরআন-হাদিস', 'Chapters 1–3: Aqaid, Zakat, Hajj & Quran-Hadith', 'আখিরাত, শাফাআত, যাকাতের খাত, হজের ফরজ ও ওয়াজিব, নির্বাচিত আয়াত ও হাদিস', 'Hereafter, Zakat recipients, Hajj rituals & selected Quran/Hadith texts'),
    ch('অধ্যায় ৪–৫: আখলাক ও ইসলামের আদর্শ চরিত্র', 'Chapters 4–5: Ethics & Exemplary Personalities', 'ভ্রাতৃত্ববোধ, মাদক-সন্ত্রাস বর্জন, দুর্নীতি প্রতিরোধ ও মহানবি (সা.)-এর আদর্শ', 'Brotherhood, anti-corruption values, social peace & prophetic conduct'),
  ],
  '8:134': [
    ch('অধ্যায় ১–৩: বাংলাদেশের কৃষি, আন্তর্জাতিক প্রেক্ষাপট ও কৃষি প্রযুক্তি', 'Chapters 1–3: Global Agriculture Perspective & Farm Tech', 'জমির উর্বরতা, গুটি ইউরিয়া, সমন্বিত বালাই ব্যবস্থাপনা (IPM) ও ফসল সংরক্ষণ', 'Soil fertility, Guti Urea, Integrated Pest Management & grain storage'),
    ch('অধ্যায় ৪–৬: কৃষি ও জলবায়ু, বনায়ন ও মৎস্য-পশু সম্পদ', 'Chapters 4–6: Climate Adaptation, Forestry & Fisheries', 'লবণাক্ততা ও জলমগ্নতা সহিষ্ণু ধান, সামাজিক বনায়ন, গবাদিপশুর রোগ ও মিশ্র মাছ চাষ', 'Salinity-tolerant rice, social forestry, livestock care & polyculture'),
  ],
  '8:151': [
    ch('অধ্যায় ১–৫: গৃহ সম্পদ ব্যবস্থাপনা, বাজেট ও পারিবারিক স্বাস্থ্য', 'Chapters 1–5: Home Resources, Budgeting & Family Health', 'সময়-শক্তি-অর্থ ব্যবস্থাপনা, গৃহের পরিচ্ছন্নতা ও রোগ-জীবাণু প্রতিরোধ', 'Resource planning, family budgeting, home sanitation & hygiene'),
    ch('অধ্যায় ৬–১১: কৈশোরের পুষ্টি, খাদ্য প্রস্তুত ও বস্ত্র নকশা', 'Chapters 6–11: Adolescent Nutrition, Culinary Skills & Textile Design', 'ক্যালরি হিসাব, সুষম মেনু পরিকল্পনা, বাটিক-টাইডাই ও সেলাই শিল্প', 'Calorie balance, meal planning, batik/tie-dye & tailoring'),
  ],
  '8:147': [
    ch('অধ্যায় ১–৩: শারীরিক সক্ষমতা, মানসিক স্বাস্থ্য ও মাদকমুক্ত জীবন', 'Chapters 1–3: Fitness, Mental Health & Drug-Free Living', 'গতি-দক্ষতা বৃদ্ধির ব্যায়াম, ধূমপান ও মাদকের কুফল, এইডস প্রতিরোধ সচেতনতা', 'Fitness drills, anti-drug awareness, mental resilience & health'),
    ch('অধ্যায় ৪–৫: সাঁতার, প্রাথমিক চিকিৎসা ও মেজর গেমস', 'Chapters 4–5: Swimming, First Aid & Major Sports', 'জীবনরক্ষাকারী সাঁতার, কৃত্রিম শ্বাসপ্রশ্বাস, ক্রিকেট-হকি-বাস্কেটবলের নিয়ম', 'Swimming safety, CPR/first aid, cricket, hockey & basketball rules'),
  ],
  '8:148': [
    ch('অধ্যায় ১–৩: বাংলাদেশের স্বাধীনতা সংগ্রামে চারুশিল্পীদের ভূমিকা ও চিত্রকলা', 'Chapters 1–3: Art in Liberation War & Heritage Painting', 'জয়নুল আবেদিন, কামরুল হাসান ও এস এম সুলতানের শিল্পকর্ম পরিচিতি', 'Works of Zainul Abedin, Quamrul Hassan & SM Sultan'),
    ch('অধ্যায় ৪–৬: প্রাকৃতিক ও মানব অবয়ব অঙ্কন, মিশ্র মাধ্যম ও ভাস্কর্য', 'Chapters 4–6: Figure Drawing, Mixed Media & Sculpture', 'পোস্টার ও দেয়ালিকা ডিজাইন, প্যাস্টেল রং ও পোড়ামাটির ফলক নির্মাণ', 'Poster design, pastel color techniques & terracotta relief art'),
  ],

  // ==================== CLASS 9 (NCTB SSC Part-1) ====================
  '9:101': [
    ch('গদ্যাংশ: সুভা, বইপড়া, অভাগীর স্বর্গ, পল্লীসাহিত্য, আম-আঁটির ভেঁপু, মানুষ মুহম্মদ (সা.)', 'Prose: Shuvasini, Boipora, Pollishahitto, Am-Atir Bhepu', 'সৃজনশীল ও বহুনির্বাচনি বিশ্লেষণ, লেখক পরিচিতি ও জীবনদর্শন', 'Creative & MCQ mastery, author context & literary criticism'),
    ch('কবিতাংশ: বঙ্গবাণী, কপোতাক্ষ নদ, জীবন-সঙ্গীত, মানুষ, সেইদিন এই মাঠ, পল্লিজননী', 'Poetry: Bangabani, Kopotakkho Nod, Manush, Polli-Jononi', 'কবিতার ছন্দ, অলংকার, প্রতীকী অর্থ ও মাতৃভাষা চেতনা', 'Poetic devices, meter, symbolism & mother-tongue heritage'),
    ch('সহপাঠ: উপন্যাস (কাকতাড়ুয়া) ও নাটক (বহিপীর) — প্রারম্ভিক পর্ব', 'Supplementary: Novel (Kaktarua) & Drama (Bohipir) — Part I', 'চরিত্র বিশ্লেষণ, মুক্তিযুদ্ধভিত্তিক কাহিনী ও নাট্যদ্বন্দ্ব', 'Character sketch, Liberation War narrative & dramatic conflict'),
  ],
  '9:102': [
    ch('পরিচ্ছেদ ১–১৪: ধ্বনি, বর্ণ, সন্ধি, শব্দের শ্রেণিবিভাগ ও উপসর্গ', 'Sections 1–14: Phonetics, Sandhi, Word Classes & Prefixes', 'ধ্বনিতত্ত্ব, বাগ্‌যন্ত্র, স্বর-ব্যঞ্জন-বিসর্গ সন্ধি, প্রকৃতি-প্রত্যয় ও সমাস', 'Phonology, articulation, Sandhi rules, suffixes & Samas compounds'),
    ch('পরিচ্ছেদ ১৫–২৬: কারক, বাচ্য, উক্তি ও বাক্যতত্ত্ব', 'Sections 15–26: Case, Voice, Narration & Syntax', 'সরল-জটিল-যৌগিক বাক্য, বাগধারা, এক কথায় প্রকাশ ও বিপরীত শব্দ', 'Sentence types, idioms, one-word substitution & antonyms'),
    ch('নির্মিতি অংশ: অনুচ্ছেদ, সারাংশ-সারমর্ম, ভাবসম্প্রসারণ, পত্র ও প্রতিবেদন', 'Composition: Paragraph, Precis, Amplification, Letter & Report', 'দাপ্তরিক আবেদন, সংবাদ প্রতিবেদন ও প্রবন্ধ রচনার কৌশল', 'Formal applications, news reporting & structured essay writing'),
  ],
  '9:107': [
    ch('Units 1–5: Father of the Nation, Pastimes, Events & Festivals', 'Units 1–5: History, Pastimes & Cultural Festivals', 'Seen/Unseen passage comprehension, vocabulary, summary & flow-chart', 'Reading comprehension, summary writing, vocabulary & information transfer'),
    ch('Units 6–10: Our Neighbours, People Who Stand Out & Renewable Energy', 'Units 6–10: Regional Geography, Role Models & Energy', 'Matching, completing stories, describing graphs/charts & informal letters', 'Story completion, graph/chart analysis & dialogue writing'),
    ch('Guided & Academic Writing', 'Guided & Academic Writing', 'Paragraphs, Dialogue, Email & Descriptive Writing (Units 1–10)', 'Paragraphs, Dialogue, Email & Descriptive Writing mastery'),
  ],
  '9:108': [
    ch('Part A (Grammar): Gap Filling, Substitution, Right Form of Verbs & Narrative Style', 'Part A (Grammar): Prepositions, Verbs, Voice & Narration', 'Cloze test with/without clues, Transformation of Sentences, Completing Sentences', 'Cloze tests, sentence transformation & conditional clauses'),
    ch('Part A (Grammar): Suffix-Prefix, Tag Questions, Connectors & Punctuation', 'Part A (Grammar): Affixes, Tag Questions, Connectors & Punctuation', 'Word derivation, cohesive devices, capitalization & punctuation rules', 'Word building, sentence connectors, tag questions & punctuation'),
    ch('Part B (Composition): CV, Formal Application, Complaint Letter & Paragraph', 'Part B (Composition): CV, Formal Letters & Paragraphs', 'Writing CV with cover letter, official notice/application & academic paragraphs', 'CV with cover letter, formal complaints, notices & academic essays'),
  ],
  '9:109': [
    ch('অধ্যায় ১–৩: বাস্তব সংখ্যা, সেট ও ফাংশন এবং বীজগাণিতিক রাশি', 'Chapters 1–3: Real Numbers, Sets-Functions & Algebraic Expressions', 'মূলদ-অমূলদ, ভেনচিত্র, ডোমেন-রেঞ্জ, বর্গ-ঘন, উৎপাদক ও ভাগশেষ উপপাদ্য', 'Real numbers, Venn diagrams, functions, remainder & factor theorems'),
    ch('অধ্যায় ৪–৭: সূচক-লগারিদম, এক চলক সমীকরণ ও ব্যবহারিক জ্যামিতি', 'Chapters 4–7: Exponents, Logarithms, Equations & Constructions', 'লগারিদমের সূত্র, রেখা-কোণ-ত্রিভুজ ও চতুর্ভুজ অঙ্কন (সম্পাদ্য)', 'Laws of indices & logs, equations & geometric constructions'),
    ch('অধ্যায় ৮–১০ ও ১৭: বৃত্ত, ত্রিকোণমিতিক অনুপাত ও পরিসংখ্যান (প্রথম ধাপ)', 'Chapters 8–10 & 17: Circles, Trigonometry & Statistics Intro', 'বৃত্তের জ্যা ও স্পর্শক উপপাদ্য, sin-cos-tan অনুপাত, গড় ও অজিভ রেখা', 'Circle chord/tangent theorems, trig ratios, mean & ogive curves'),
  ],
  '9:154': [
    ch('অধ্যায় ১–২: তথ্য ও যোগাযোগ প্রযুক্তি এবং কম্পিউটার রক্ষণাবেক্ষণ', 'Chapters 1–2: ICT & Digital Bangladesh + System Security', 'ই-লার্নিং, ই-গভর্ন্যান্স, সফটওয়্যার ইনস্টলেশন-আনইনস্টলেশন, পাসওয়ার্ড ও অ্যান্টিভাইরাস', 'E-learning, e-governance, software installation, cybersecurity & maintenance'),
    ch('অধ্যায় ৩–৪: আমার শিক্ষায় ইন্টারনেট ও আমার লেখালেখি ও হিসাব', 'Chapters 3–4: Internet in Education, Word Processing & Spreadsheets', 'ডিজিটাল কন্টেন্ট, ই-বুক, MS Word টেবিল-ছবি যুক্তকরণ ও Excel স্প্রেডশিট হিসাব', 'Digital content, e-books, Word formatting & Excel spreadsheet formulas'),
  ],
  '9:111': [
    ch('অধ্যায় ১–২: আকাইদ-নৈতিক জীবন ও শরিয়তের উৎস (কুরআন-সুন্নাহ)', 'Chapters 1–2: Aqaid & Sources of Shariah (Quran & Sunnah)', 'তাওহিদ-রিসালাত, মাক্কী-মাদানী সূরা, হাদিস সংকলন, ইজমা ও কিয়াস', 'Tawhid, Risalat, Quran compilation, Hadith sciences, Ijma & Qiyas'),
    ch('অধ্যায় ৩–৪: ইবাদত (সালাত-সাওম-যাকাত) ও আখলাক', 'Chapters 3–4: Ibadat & Islamic Ethics', 'ইবাদতের তাৎপর্য, আমানত, সত্যবাদিতা, ওয়াদা পালন ও সামাজিক শিষ্টাচার', 'Significance of worship, honesty, trustworthiness & social ethics'),
  ],
  '9:147': [
    ch('অধ্যায় ১–৪: সুস্থ জীবনের জন্য শারীরিক শিক্ষা, স্কাউটিং ও বয়ঃসন্ধিকাল', 'Chapters 1–4: Physical Education, Scouting & Adolescence', 'শারীরিক সক্ষমতা, স্কাউট ও গার্ল গাইডস, বয়ঃসন্ধিকালীন প্রজনন স্বাস্থ্য', 'Fitness science, Scouting/Girl Guides & adolescent reproductive health'),
    ch('অধ্যায় ৫–৭: ক্রীড়া মনস্তত্ত্ব, পুষ্টি ও প্রাথমিক চিকিৎসা', 'Chapters 5–7: Sports Nutrition & First Aid', 'ক্রীড়াবিদের খাদ্য, প্রোটিন-ভিটামিন চাহিদা, আঘাত ও মোচকানো চিকিৎসা', 'Athlete diet, macro/micronutrients & sports injury first aid'),
  ],
  '9:156': [
    ch('অধ্যায় ১–২: আমি ও আমার ক্যারিয়ার এবং ক্যারিয়ার গঠন ও গুণাবলি', 'Chapters 1–2: Self & Career Planning, Core Competencies', 'আত্মসচেতনতা, আগ্রহ-দক্ষতা মূল্যায়ন, সৃজনশীলতা ও নেতৃত্বের গুণাবলি', 'Self-assessment, aptitude mapping, creativity & leadership skills'),
    ch('অধ্যায় ৩: ক্যারিয়ার গঠনে সংযোগ স্থাপন ও আচরণ', 'Chapter 3: Networking & Workplace Communication', 'দলগত কাজ, ইন্টারভিউ প্রস্তুতি ও পেশাগত নৈতিকতা', 'Teamwork, interview skills & professional ethics'),
  ],
  '9:136': [
    ch('অধ্যায় ১–৩: ভৌত রাশি ও পরিমাপ, গতি এবং বল', 'Chapters 1–3: Physical Quantities, Motion & Force', 'ভার্নিয়ার ও স্ক্রু-গজ, গতির সমীকরণ, নিউটনের সূত্র, ভরবেগ সংরক্ষণ ও ঘর্ষণ', 'Vernier caliper, kinematics, Newton laws, momentum & friction'),
    ch('অধ্যায় ৪–৬: কাজ-ক্ষমতা-শক্তি, পদার্থের অবস্থা-চাপ ও বস্তুর ওপর তাপের প্রভাব', 'Chapters 4–6: Work-Energy, Pressure & Thermal Expansion', 'গতিশক্তি-বিভবশক্তি, প্যাসকেলের সূত্র, আর্কিমিডিসের নীতি ও তাপীয় প্রসারণ', 'Kinetic/potential energy, Pascal law, buoyancy & thermal expansion'),
    ch('অধ্যায় ৭–৮: তরঙ্গ ও শব্দ এবং আলোর প্রতিফলন', 'Chapters 7–8: Waves & Sound + Reflection of Light', 'কম্পাঙ্ক-তরঙ্গদৈর্ঘ্য, প্রতিধ্বনি, সমতল ও গোলীয় দর্পণে প্রতিবিম্ব গঠন', 'Wave equation, echo, plane & spherical mirrors'),
  ],
  '9:137': [
    ch('অধ্যায় ১–৩: রসায়নের ধারণা, পদার্থের অবস্থা ও গঠন', 'Chapters 1–3: Chemistry Scope, States of Matter & Atomic Structure', 'ব্যাপন-নিঃসরণ, গলনাঙ্ক-স্ফুটনাঙ্ক, ইলেকট্রন-প্রোটন-নিউট্রন, আইসোটোপ ও বিন্যাস', 'Diffusion, melting/boiling, isotopes & electronic configuration'),
    ch('অধ্যায় ৪–৬: পর্যায় সারণি, রাসায়নিক বন্ধন এবং মোলের ধারণা', 'Chapters 4–6: Periodic Table, Chemical Bonding & Mole Concept', 'পর্যায়বৃত্ত ধর্ম, আয়নিক-সমযোজী-ধাতব বন্ধন, অ্যাভোগাড্রো সংখ্যা ও শতকরা সংযুতি', 'Periodic trends, ionic/covalent/metallic bonds & stoichiometry'),
    ch('অধ্যায় ৭: রাসায়নিক বিক্রিয়া (জারণ-বিজারণ ও লা-শাতেলিয়ার নীতি)', 'Chapter 7: Chemical Reactions & Equilibrium', 'সমন্বিত সমীকরণ, জারণ সংখ্যা, উভমুখী বিক্রিয়া ও সাম্যাবস্থা', 'Redox reactions, oxidation states & Le Chatelier principle'),
  ],
  '9:138': [
    ch('অধ্যায় ১–৩: জীবন পাঠ, জীবকোষ ও টিস্যু এবং কোষ বিভাজন', 'Chapters 1–3: Biology Intro, Cells-Tissues & Cell Division', 'দ্বিপদ নামকরণ, মাইটোকন্ড্রিয়া-প্লাস্টিড, উদ্ভিদ-প্রাণী টিস্যু ও মাইটোসিস-মিয়োসিস', 'Binomial nomenclature, organelles, tissues & mitosis/meiosis'),
    ch('অধ্যায় ৪–৬: জীবনীশক্তি, খাদ্য-পুষ্টি-পরিপাক এবং জীবে পরিবহন', 'Chapters 4–6: Bioenergetics, Digestion & Transport', 'সালোকসংশ্লেষণ-শ্বসন (ATP), পরিপাক এনজাইম, রক্ত ও হৃৎপিণ্ডের ক্রিয়া', 'Photosynthesis, cellular respiration, digestive enzymes & heart circulation'),
    ch('অধ্যায় ৭: গ্যাসীয় বিনিময়', 'Chapter 7: Gaseous Exchange', 'উদ্ভিদের গ্যাস বিনিময়, মানব শ্বসনতন্ত্র ও শ্বসনজনিত রোগ', 'Plant gas exchange, human respiratory system & disorders'),
  ],
  '9:126': [
    ch('অধ্যায় ১–৩: সেট ও ফাংশন, বীজগাণিতিক রাশি ও জ্যামিতি', 'Chapters 1–3: Sets-Functions, Polynomials & Geometry', 'এক-এক ও সার্বিক ফাংশন, চক্রক্রমিক-প্রতিসম রাশি, ব্রহ্মগুপ্ত ও টলেমির উপপাদ্য', 'Bijective functions, symmetric polynomials & Brahmagupta/Ptolemy theorems'),
    ch('অধ্যায় ৫, ৭–৮: সমীকরণ, অসীম ধারা এবং ত্রিকোণমিতি', 'Chapters 5, 7–8: Equations, Infinite Series & Trigonometry', 'দ্বিঘাত সমীকরণের সমাধান, অসীম গুণোত্তর ধারার সমষ্টি ও রেডিয়ান কোণ', 'Quadratic equations, infinite geometric series & radian measure'),
    ch('অধ্যায় ৯–১১: সূচকীয় ও লগারিদমীয় ফাংশন এবং স্থানাঙ্ক জ্যামিতি', 'Chapters 9–11: Exponential-Log Functions & Coordinate Geometry', 'বিন্দুর দূরত্ব, ত্রিভুজের ক্ষেত্রফল ও সরলরেখার ঢাল', 'Distance formula, polygon area & slope of a straight line'),
  ],
  '9:150': [
    ch('অধ্যায় ১–৫: পূর্ব বাংলার আন্দোলন, ১৯৭১ মুক্তিযুদ্ধ ও সৌরজগৎ', 'Chapters 1–5: Language Movement, 1971 War & Solar System', '১৯৫২–১৯৭১ সংগ্রাম, আহ্নিক-বার্ষিক গতি, বাংলাদেশের ভূ-প্রকৃতি ও নদ-নদী', '1952–1971 milestones, Earth motion, physiography & river systems'),
    ch('অধ্যায় ৬–৯: রাষ্ট্র, নাগরিকতা, বাংলাদেশের সরকার ও জাতিসংঘ', 'Chapters 6–9: State, Governance, Constitution & UN', 'সংসদীয় গণতন্ত্র, আইন-বিচার-শাসন বিভাগ ও আন্তর্জাতিক সংস্থা', 'Parliamentary system, three branches of government & UN'),
  ],
  '9:127': [
    ch('অধ্যায় ১–৪: উন্নততর জীবনধারা, জীবনের জন্য পানি ও হৃদযন্ত্রের যত্ন', 'Chapters 1–4: Nutrition, Water Chemistry & Cardiovascular Care', 'সুষম খাদ্য ও BMI, পানির খড়তা ও দূষণ, রক্তের গ্রুপ ও রক্তচাপ', 'Balanced diet & BMI, water hardness, blood groups & blood pressure'),
    ch('অধ্যায় ৫–৭: দেখতে হলে আলো চাই, পলিমার ও অম্ল-ক্ষারক-লবণ', 'Chapters 5–7: Optics, Polymers & Acids-Bases-Salts', 'লেন্স ও চোখের ত্রুটি, প্রাকৃতিক-কৃত্রিম পলিমার, pH স্কেল ও নির্দেশক', 'Lenses & vision defects, polymers, pH scale & neutralization'),
  ],
  '9:134': [
    ch('অধ্যায় ১–২: কৃষি প্রযুক্তি ও কৃষি উপকরণ', 'Chapters 1–2: Agricultural Technology & Farm Inputs', 'মাটি ও ফসল নির্বাচন, জমি চাষ, ভূমি ক্ষয় রোধ, বীজ সংরক্ষণ ও মাছের পুকুর প্রস্তুতি', 'Crop-soil matching, soil erosion control, seed storage & pond prep'),
    ch('অধ্যায় ৩–৪: কৃষি ও জলবায়ু এবং কৃষিজ উৎপাদন', 'Chapters 3–4: Climate Resilience & Crop-Livestock Production', 'খরা-লবণাক্ততা সহিষ্ণু কৃষি, ধান-পাট-আলু চাষ ও গবাদিপশুর খাদ্য', 'Climate-resilient farming, rice/jute cultivation & livestock feed'),
  ],
  '9:151': [
    ch('অধ্যায় ১–৬: গৃহ ব্যবস্থাপনা, গৃহের অভ্যন্তরীণ সজ্জা ও বয়ঃসন্ধি', 'Chapters 1–6: Home Management, Interior Design & Adolescence', 'গৃহের রঙ ও আলোকসজ্জা, পরিবারে সিদ্ধান্ত গ্রহণ ও কৈশোরের পুষ্টি-মানসিকতা', 'Interior color/lighting, decision-making & adolescent wellness'),
    ch('অধ্যায় ৭–১২: রোগ-ব্যাধি, খাদ্য পরিকল্পনা ও বস্ত্র বিজ্ঞান', 'Chapters 7–12: Therapeutic Diets, Meal Planning & Textiles', 'বিভিন্ন বয়সের মেনু পরিকল্পনা, প্রাকৃতিক তন্তু ও পোশাক নকশা', 'Age-wise meal planning, fiber science & garment design'),
  ],
  '9:153': [
    ch('অধ্যায় ১–৫: ইতিহাস পরিচিতি, বিশ্বসভ্যতা ও প্রাচীন বাংলার ইতিহাস', 'Chapters 1–5: Historiography, World Civilizations & Ancient Bengal', 'মিশর-সিন্ধু-গ্রিক-রোমান সভ্যতা, মৌর্য-গুপ্ত-পাল-সেন শাসনামল', 'Egypt, Indus, Greek-Roman civilizations & Maurya-Pala-Sena Bengal'),
    ch('অধ্যায় ৬–১০: মধ্যযুগের বাংলা ও ইংরেজ শাসনবিরোধী আন্দোলন', 'Chapters 6–10: Medieval Bengal & Anti-Colonial Movements', 'সুলতানি ও মুঘল আমল, সিপাহী বিদ্রোহ, বঙ্গভঙ্গ ও স্বদেশী আন্দোলন', 'Sultanate-Mughal Bengal, 1857 revolt & Swadeshi movement'),
  ],
  '9:110': [
    ch('অধ্যায় ১–৫: ভূগোল ও পরিবেশ, মহাবিশ্ব, মানচিত্র ও পৃথিবীর অভ্যন্তরীণ গঠন', 'Chapters 1–5: Geography, Universe, Map Scales & Earth Structure', 'অক্ষাংশ-দ্রাঘিমাংশ, প্রমাণ সময়, শিলা ও খনিজ, ভূমিকম্প-আগ্নেয়গিরি ও নদ-নদী', 'Lat-long, standard time, rocks/minerals, plate tectonics & rivers'),
    ch('অধ্যায় ৬–৮: বায়ুমণ্ডল, বারিমণ্ডল ও মানব বসতি', 'Chapters 6–8: Atmosphere, Hydrosphere & Human Settlements', 'বায়ুমণ্ডলের স্তর, বায়ুপ্রবাহ, সমুদ্রস্রোত, জোয়ার-ভাটা ও নগরায়ণ', 'Atmospheric layers, wind belts, ocean currents, tides & urbanization'),
  ],
  '9:140': [
    ch('অধ্যায় ১–৫: পৌরনীতি ও নাগরিকতা, নাগরিক অধিকার, রাষ্ট্র ও সংবিধান', 'Chapters 1–5: Civics, Citizenship, State & Constitution', 'রাষ্ট্রের উপাদান, নাগরিকের অধিকার ও কর্তব্য, গণতন্ত্র ও সংবিধানের শ্রেণিবিভাগ', 'Elements of state, citizen rights & duties, democracy & constitutions'),
    ch('অধ্যায় ৬–৭: বাংলাদেশের সরকার ব্যবস্থা ও রাজনৈতিক দল', 'Chapters 6–7: Government System of Bangladesh & Political Parties', 'সংসদীয় পদ্ধতি, প্রধানমন্ত্রী ও মন্ত্রিসভা, নির্বাচন কমিশন ও জনমত', 'Parliamentary system, Cabinet, Election Commission & public opinion'),
  ],
  '9:141': [
    ch('অধ্যায় ১–৪: অর্থনীতি পরিচিতি, গুরুত্বপূর্ণ ধারণা, উপযোগ-চাহিদা-যোগান ও উৎপাদন', 'Chapters 1–4: Economics Basics, Utility, Demand-Supply & Production', 'দুষ্প্রাপ্যতা ও নির্বাচন, ক্রমহ্রাসমান প্রান্তিক উপযোগ, চাহিদা-যোগান বিধি ও ভারসাম্য', 'Scarcity, diminishing marginal utility, demand-supply & equilibrium'),
    ch('অধ্যায় ৫–৬: বাজার ও জাতীয় আয় পরিমাপ', 'Chapters 5–6: Market Structures & National Income Intro', 'পূর্ণ প্রতিযোগিতা ও একচেটিয়া বাজার, GDP ও GNP ধারণা', 'Perfect competition vs monopoly, GDP & GNP concepts'),
  ],
  '9:146': [
    ch('অধ্যায় ১–৫: হিসাববিজ্ঞান পরিচিতি, লেনদেন, দুতরফা দাখিলা ও মূলধন-মুনাফা', 'Chapters 1–5: Accounting Basics, Transactions, Double-Entry & Capital/Revenue', 'হিসাব সমীকরণ (A = L + E), ডেবিট-ক্রেডিট নির্ণয় ও হিসাবের শ্রেণিবিভাগ', 'Accounting equation (A = L + E), debit-credit rules & account types'),
    ch('অধ্যায় ৬–৮: জাবেদা, খতিয়ান ও নগদান বই', 'Chapters 6–8: Journal, Ledger & Cash Book', 'ক্রয়-বিক্রয় জাবেদা, T-ছক ও চলমান জের খতিয়ান, একঘরা-দুঘরা-তিনঘরা নগদান বই', 'Special journals, T-account ledgers & single/double/triple column cash books'),
  ],
  '9:152': [
    ch('অধ্যায় ১–৪: অর্থায়ন ও ব্যবসায় অর্থায়ন, তহবিলের উৎস, অর্থের সময়মূল্য ও ঝুঁকি', 'Chapters 1–4: Business Finance, Sources, Time Value of Money & Risk', 'অভ্যন্তরীণ-বাহ্যিক উৎস, বর্তমান-ভবিষ্যৎ মূল্য (PV/FV), আদর্শ বিচ্যুতি নির্ণয়', 'Internal/external capital, PV/FV compounding & standard deviation risk'),
    ch('অধ্যায় ৫–৬: মূলধনী আয়-ব্যয় প্রাক্কলন ও মূলধন ব্যয়', 'Chapters 5–6: Capital Budgeting & Cost of Capital', 'গড় মুনাফার হার (ARR) ও পে-ব্যাক সময় (PBP) পদ্ধতি', 'Accounting Rate of Return (ARR) & Payback Period calculation'),
  ],
  '9:143': [
    ch('অধ্যায় ১–৪: ব্যবসায় পরিচিতি, ব্যবসায় উদ্যোগ, আত্মকর্মসংস্থান ও মালিকানাভিত্তিক ব্যবসায়', 'Chapters 1–4: Business Intro, Entrepreneurship & Ownership Forms', 'শিল্প-বাণিজ্য-প্রত্যক্ষ সেবা, একমালিকানা, অংশীদারি, যৌথ মূলধনী ও সমবায় সমিতি', 'Industry & commerce, sole proprietorship, partnership & corporations'),
    ch('অধ্যায় ৫–৬: ব্যবসায়ের আইনগত দিক ও ব্যবসায় পরিকল্পনা', 'Chapters 5–6: Legal Aspects & Business Plan', 'ট্রেড লাইসেন্স, পেটেন্ট-ট্রেডমার্ক, প্রাক্কলিত আর্থিক বিবরণী ও ঝুঁকি বিশ্লেষণ', 'Trade license, trademark/patent & feasibility business planning'),
  ],

  // ==================== CLASS 10 (NCTB SSC Part-2 & Board Prep) ====================
  '10:101': [
    ch('গদ্যাংশ: শিক্ষা ও মনুষ্যত্ব, প্রবাস বন্ধু, মমতাদি, পয়লা বৈশাখ, একাত্তরের দিনগুলি, সাহিত্যের রূপ ও রীতি', 'Prose: Shikkha o Monusshotto, Probash Bondhu, Ekattorer Dinguli', 'মুক্তিযুদ্ধের স্মৃতিকথা, মানবিক মূল্যবোধ, লেখ্যরীতি ও সৃজনশীল চর্চা', 'Liberation War memoirs, human values, literary forms & board questions'),
    ch('কবিতাংশ: জীবন-সঙ্গীত, জুতা-আবিষ্কার, ঝর্ণার গান, মানুষ, তোমাকে পাওয়ার জন্যে হে স্বাধীনতা, স্বাধীনতা এই শব্দটি কীভাবে আমাদের হলো', 'Poetry: Tomake Pawar Jonne He Shadhinota, Shadhinota Ei Shobdoti', 'স্বাধীনতার চেতনা, আধুনিক বাংলা কবিতার ছন্দ-অলংকার ও বোর্ড প্রশ্ন', 'Independence theme, modern Bangla poetry & SSC board analysis'),
    ch('সহপাঠ: উপন্যাস (কাকতাড়ুয়া) ও নাটক (বহিপীর) — সমাপনী ও বোর্ড বিশ্লেষণ', 'Supplementary: Novel (Kaktarua) & Drama (Bohipir) — Complete SSC', 'সামগ্রিক কাহিনী, সংলাপ তাৎপর্য ও সৃজনশীল-বহুনির্বাচনি পূর্ণাঙ্গ প্রস্তুতি', 'Full plot synthesis, critical dialogues & SSC board preparation'),
  ],
  '10:102': [
    ch('পরিচ্ছেদ ২৭–৪৩: বাক্যের শ্রেণিবিভাগ, বাচ্য, উক্তি, বাগধারা ও সমার্থক শব্দ', 'Sections 27–43: Clauses, Voice, Narration, Idioms & Synonyms', 'বাক্য রূপান্তর, যতিচিহ্ন, প্রতিশব্দ, বিপরীত শব্দ ও দ্বিরুক্ত শব্দ', 'Sentence transformation, punctuation, idioms, synonyms & reduplication'),
    ch('পূর্ববর্তী অধ্যায় পুনরালোচনা (ধ্বনি, সন্ধি, সমাস, প্রত্যয়, কারক)', 'Full Grammar Revision (Phonology, Sandhi, Samas, Case)', 'বোর্ড পরীক্ষাভিত্তিক বহুনির্বাচনি (৩০ নং) পূর্ণাঙ্গ মডেল চর্চা', 'Board MCQ (30 marks) comprehensive revision & drill'),
    ch('নির্মিতি অংশ: পত্র, আবেদন, সংবাদ প্রতিবেদন ও প্রবন্ধ রচনা (SSC ফাইনাল)', 'SSC Composition: Letters, Reports, Precis & Essays', 'সমসাময়িক বিষয়ভিত্তিক প্রবন্ধ, সারাংশ-সারমর্ম ও ভাবসম্প্রসারণ', 'Current-affairs essays, formal reports, precis & amplification'),
  ],
  '10:107': [
    ch('Units 11–14: Renewable Energy, Roots, Media & E-Communications, Pleasure', 'Units 11–14: Renewable Energy, Roots, Media & Literature', 'Seen comprehension, unseen passage, summary, table completion & matching', 'Comprehension, summary, information table & matching'),
    ch('SSC Complete Revision: Units 1–14 & Board Passage Bank', 'SSC Complete Revision: Units 1–14 & Board Passage Bank', 'Rearranging sentences, completing stories, graphs/charts & dialogue writing', 'Sentence rearranging, story completion, graphs/charts & dialogues'),
    ch('Academic Writing & Model Tests', 'Academic Writing & Model Tests', 'Timed SSC Board practice on Paragraph, Email & Informal/Formal Letters', 'Timed SSC Board practice on writing skills'),
  ],
  '10:108': [
    ch('Advanced Grammar Board Drills (Items 1–11)', 'Advanced Grammar Board Drills (Items 1–11)', 'Right Form of Verbs, Narration, Modifiers, Connectors, Voice & Transformation', 'Board-standard practice on Verbs, Narration, Voice & Connectors'),
    ch('Composition & Board Writing Pack', 'Composition & Board Writing Pack', 'CV with Cover Letter, Formal Complaint/Notice, Paragraph & Short Composition', 'CV, official letters, academic paragraphs & compositions'),
  ],
  '10:109': [
    ch('অধ্যায় ১১–১৩: বীজগাণিতিক অনুপাত-সমানুপাত, দুই চলক সমীকরণ ও সসীম ধারা', 'Chapters 11–13: Algebraic Ratio, 2-Variable Equations & Finite Series', 'ধারাবাহিক অনুপাত, আড়গুণন পদ্ধতি, সমান্তর ও গুণোত্তর ধারার সমষ্টি', 'Ratio-proportion, cross-multiplication, arithmetic & geometric series'),
    ch('অধ্যায় ১৪–১৬: অনুপাত-সদৃশতা-প্রতিসমতা, ক্ষেত্রফল উপপাদ্য ও পরিমিতি', 'Chapters 14–16: Similarity, Area Theorems & Mensuration', 'ত্রিভুজ-চতুর্ভুজ-বৃত্ত-সিলিন্ডার-ঘনকের ক্ষেত্রফল ও আয়তন', 'Similarity, Pythagoras applications, prisms, cylinders & spheres'),
    ch('অধ্যায় ১০ ও ১৭: দূরত্ব ও উচ্চতা এবং পরিসংখ্যান (SSC পূর্ণাঙ্গ)', 'Chapters 10 & 17: Heights & Distances + Full Statistics', 'উন্নতি ও অবনতি কোণ, মধ্যক, প্রচুরক, বহুভুজ ও অজিভ রেখা', 'Angle of elevation/depression, median, mode, frequency polygon & ogive'),
  ],
  '10:154': [
    ch('অধ্যায় ৫–৬: মাল্টিমিডিয়া ও গ্রাফিক্স এবং ডেটাবেজের ব্যবহার', 'Chapters 5–6: Multimedia Graphics & Database Management', 'PowerPoint স্লাইড অ্যানিমেশন, Adobe Photoshop/Illustrator টুলস ও MS Access ডেটাবেজ', 'Presentation animation, raster/vector graphics & relational databases'),
    ch('সম্পূর্ণ ব্যবহারিক ও SSC মডেল টেস্ট (অধ্যায় ১–৬)', 'Complete Practical Lab & SSC Board Prep (Ch 1–6)', 'Word, Excel, PowerPoint ও Access ব্যবহারিক পরীক্ষা ও বহুনির্বাচনি চর্চা', 'Hands-on Word/Excel/PowerPoint/Access practical & MCQ bank'),
  ],
  '10:111': [
    ch('অধ্যায় ৩ (হজ ও জিহাদ) ও অধ্যায় ৫: আদর্শ জীবনচরিত', 'Chapters 3 (Hajj) & 5: Ideal Biographies & Islamic Civilization', 'হজের তাৎপর্য, বিদায় হজ, খোলাফায়ে রাশেদিন ও মুসলিম মনীষীদের অবদান', 'Hajj significance, Farewell Sermon, Rightly Guided Caliphs & scholars'),
    ch('পূর্ণাঙ্গ রিভিশন: আকাইদ, শরিয়ত ও আখলাক (SSC বোর্ড প্রস্তুতি)', 'Full SSC Board Revision: Aqaid, Shariah & Ethics', 'সূরা-হাদিস অনুবাদ, ফরজ-ওয়াজিব ও সৃজনশীল বোর্ড প্রশ্ন অনুশীলন', 'Quranic & Hadith commentary, jurisprudence & board question drills'),
  ],
  '10:147': [
    ch('অধ্যায় ৮–১০: দলগত খেলা ও অ্যাথলেটিকস এবং শরীরচর্চা', 'Chapters 8–10: Team Sports, Athletics & Practical Fitness', 'ক্রিকেট, ফুটবল, ভলিবল, হ্যান্ডবল, ট্র্যাক ও ফিল্ড ইভেন্ট ও ব্যবহারিক মূল্যায়ন', 'Cricket, football, volleyball, handball & track-and-field events'),
  ],
  '10:156': [
    ch('অধ্যায় ৪: কর্মক্ষেত্রে আমি ও পেশাগত ভবিষ্যৎ', 'Chapter 4: Workplace Readiness & Future Career Paths', 'সিভি রাইটিং, উদ্যোক্তা মানসিকতা, বৈশ্বিক কর্মবাজার ও পূর্ণাঙ্গ অনুশীলন', 'Resume building, entrepreneurial mindset & global career readiness'),
  ],
  '10:136': [
    ch('অধ্যায় ৯–১১: আলোর প্রতিসরণ, স্থির তড়িৎ এবং চল তড়িৎ', 'Chapters 9–11: Refraction of Light, Electrostatics & Current Electricity', 'স্নেলের সূত্র, লেন্সের ক্ষমতা, কুলম্বের সূত্র, ওহমের সূত্র, শ্রেণি-সমান্তরাল বর্তনী ও রোধ', 'Snell law, lens power, Coulomb law, Ohm law, series/parallel circuits'),
    ch('অধ্যায় ১২–১৪: তড়িতের চৌম্বক ক্রিয়া, আধুনিক পদার্থবিজ্ঞান ও জীবন বাঁচাতে পদার্থবিজ্ঞান', 'Chapters 12–14: Electromagnetism, Modern Physics & Medical Physics', 'ট্রান্সফরমার, মোটর-জেনারেটর, তেজস্ক্রিয়তা, এক্স-রে, আল্ট্রাসাউন্ড, MRI ও ব্যবহারিক', 'Transformers, motors, radioactivity, X-ray, ultrasound, MRI & lab'),
  ],
  '10:137': [
    ch('অধ্যায় ৮–১০: রসায়ন ও শক্তি, এসিড-ক্ষারক সমতা এবং খনিজ সম্পদ: ধাতু-অধাতু', 'Chapters 8–10: Electrochemistry, Acid-Base Balance & Metallurgy', 'তড়িৎ বিশ্লেষণ, গ্যালভানিক কোষ, pH ও প্রশমন, ধাতু নিষ্কাশন ও সালফিউরিক এসিড', 'Electrolysis, galvanic cells, pH balance, ore extraction & H2SO4'),
    ch('অধ্যায় ১১–১২: খনিজ সম্পদ: জীবাশ্ম (জৈব রসায়ন) এবং আমাদের জীবনে রসায়ন', 'Chapters 11–12: Organic Chemistry (Fossil Fuels) & Everyday Chemistry', 'অ্যালকেন-অ্যালকিন-অ্যালকাইন, অ্যালকোহল-জৈব এসিড, পলিমার, সাবান ও ডিটারজেন্ট', 'Alkanes/alkenes/alkynes, alcohols, carboxylic acids, polymers & soaps'),
  ],
  '10:138': [
    ch('অধ্যায় ৮–১১: রেচন প্রক্রিয়া, দৃঢ়তা ও চলন, সমন্বয় এবং জীবের প্রজনন', 'Chapters 8–11: Excretion, Skeletal Movement, Coordination & Reproduction', 'নেফ্রনের গঠন ও বৃক্ক, অস্থি-পেশি, হরমোন-স্নায়ুতন্ত্র এবং উদ্ভিদ-প্রাণীর প্রজনন', 'Nephron & kidney, skeleton, hormones, nervous system & reproduction'),
    ch('অধ্যায় ১২–১৪: জীবের বংশগতি ও বিবর্তন, জীবের পরিবেশ এবং জীবপ্রযুক্তি', 'Chapters 12–14: Genetics & Evolution, Ecology & Biotechnology', 'DNA-RNA, মেন্ডেলের সূত্র, খাদ্যশৃঙ্খল, টিস্যু কালচার ও জেনেটিক ইঞ্জিনিয়ারিং', 'DNA/RNA, Mendelian genetics, food chains, tissue culture & GMO'),
  ],
  '10:126': [
    ch('অধ্যায় ৪, ৬, ১২–১৪: জ্যামিতিক অঙ্কন, অসমতা, সমতলীয় ভেক্টর, ঘনজ্যামিতি ও সম্ভাবনা', 'Chapters 4, 6, 12–14: Constructions, Inequalities, Vectors, Solid Geometry & Probability', 'দুই চলকের অসমতা লেখচিত্র, ভেক্টর যোগ-বিয়োগ, পিরামিড-কোণক-গোলক ও সম্ভাব্যতা', 'Linear inequalities, vector algebra, cones/pyramids/spheres & probability'),
    ch('পূর্ণাঙ্গ SSC রিভিশন: ত্রিকোণমিতি, দ্বিপদী বিস্তৃতি ও স্থানাঙ্ক জ্যামিতি', 'Full SSC Revision: Trigonometry, Binomial & Coordinate Geometry', 'বোর্ড প্রশ্ন বিশ্লেষণ (অধ্যায় ১–১৪) ও ব্যবহারিক খাতা প্রস্তুতি', 'Complete SSC board exam drills & math practical workbook'),
  ],
  '10:150': [
    ch('অধ্যায় ১০–১৬: জাতীয় সম্পদ ও অর্থনৈতিক ব্যবস্থা, বাংলাদেশের অর্থনীতি ও সামাজিক সমস্যা', 'Chapters 10–16: National Resources, Economy, Social Issues & SDGs', 'অর্থনৈতিক ব্যবস্থা, ব্যাংকিং ব্যবস্থা, নারী নির্যাতন-দুর্নীতি-জঙ্গিবাদ প্রতিরোধ', 'Economic systems, banking, social awareness & SDG implementation'),
    ch('পূর্ণাঙ্গ SSC বোর্ড রিভিশন (অধ্যায় ১–১৬)', 'Full SSC Board Revision (Chapters 1–16)', 'ইতিহাস, ভূগোল, পৌরনীতি ও অর্থনীতি সমন্বিত সৃজনশীল অনুশীলন', 'Integrated creative & MCQ practice across all 16 chapters'),
  ],
  '10:127': [
    ch('অধ্যায় ৮–১৪: আমাদের সম্পদ, দুর্যোগের সাথে বসবাস, এসো বলকে জানি, জীবপ্রযুক্তি ও প্রাত্যহিক জীবনে তড়িৎ', 'Chapters 8–14: Natural Resources, Disasters, Force, Biotechnology & Electricity', 'জ্বালানি ও জীবাশ্ম, খরা-বন্যা-ঘূর্ণিঝড়, নিউটনের সূত্র, ক্লোনিং-DNA ও বিদ্যুৎ বিল হিসাব', 'Fossil fuels, natural hazards, force/motion, DNA/biotech & electric bills'),
  ],
  '10:134': [
    ch('অধ্যায় ৫–৭: বনায়ন, কৃষি সমবায় ও পারিবারিক খামার', 'Chapters 5–7: Forestry, Agricultural Cooperatives & Family Farming', 'উপকূলীয় ও সামাজিক বনায়ন, কৃষি সমবায়ের গুরুত্ব, দুগ্ধ-মাছ ও হাঁস-মুরগির পারিবারিক খামার', 'Coastal/social forestry, farmer cooperatives & family dairy/fish farms'),
  ],
  '10:151': [
    ch('অধ্যায় ১৩–১৮: পোশাক তৈরি, রান্না ও পরিবেশন এবং বিশেষ চাহিদাসম্পন্ন শিশু', 'Chapters 13–18: Garment Construction, Culinary Arts & Special Needs', 'ব্লক ও প্যাটার্ন তৈরি, খাদ্য রন্ধন কৌশল, অটিজম ও প্রতিবন্ধী শিশুর যত্ন', 'Pattern making, cooking nutrition retention & special-needs care'),
  ],
  '10:153': [
    ch('অধ্যায় ১১–১৫: ভাষা আন্দোলন, ১৯৬৯ গণঅভ্যুত্থান, মুক্তিযুদ্ধ ও স্বাধীন বাংলাদেশ', 'Chapters 11–15: Language Movement, 1969 Uprising, 1971 War & Post-1971', '৬ দফা, আগরতলা মামলা, ৭ই মার্চ ভাষণ, মুজিবনগর সরকার ও যুদ্ধবিধ্বস্ত দেশ পুনর্গঠন', '6-Point Demand, 1969 mass uprising, Mujibnagar Govt & reconstruction'),
  ],
  '10:110': [
    ch('অধ্যায় ৯–১৫: সম্পদ ও অর্থনৈতিক কার্যাবলি, বাংলাদেশের ভৌগোলিক বিবরণ, নদ-নদী ও দুর্যোগ', 'Chapters 9–15: Economic Geography, Bangladesh Physiography, Rivers & Disasters', 'কৃষি-শিল্প-বাণিজ্য, পদ্মা-মেঘনা-যমুনা অববাহিকা, বন্যা ও জলবায়ু পরিবর্তন', 'Agriculture/industry/trade, river basins, flood & climate adaptation'),
  ],
  '10:140': [
    ch('অধ্যায় ৮–১১: বাংলাদেশের স্থানীয় সরকার, নাগরিক সমস্যা, স্বাধীন বাংলাদেশের অভ্যুদয় ও আন্তর্জাতিক সংস্থা', 'Chapters 8–11: Local Governance, Civic Issues, 1971 & Global Organizations', 'ইউনিয়ন-উপজেলা-জেলা পরিষদ, সিটি কর্পোরেশন, সার্ক-কমনওয়েলথ-ওআইসি ও জাতিসংঘ', 'Union/Upazila/City Corp governance, SAARC, OIC, Commonwealth & UN'),
  ],
  '10:141': [
    ch('অধ্যায় ৭–১০: অর্থ ও ব্যাংক ব্যবস্থা, বাংলাদেশের কৃষি ও শিল্প এবং সরকারি অর্থব্যবস্থা', 'Chapters 7–10: Money & Banking, Agro-Industry & Public Finance', 'কেন্দ্রীয় ও বাণিজ্যিক ব্যাংক, দারিদ্র্য-বেকারত্ব, বাজেট ও কর ব্যবস্থা', 'Central/commercial banks, poverty/unemployment, national budget & taxation'),
  ],
  '10:146': [
    ch('অধ্যায় ৯–১২: রেওয়ামিল, আর্থিক বিবরণী, পণ্যের ক্রয়মূল্য-উৎপাদন ব্যয় ও পারিবারিক হিসাব', 'Chapters 9–12: Trial Balance, Financial Statements, Cost Sheet & Family Accounting', 'বিশদ আয় বিবরণী, মালিকানাস্বত্ব ও আর্থিক অবস্থার বিবরণী (সমন্বয়সহ)', 'Trial balance, income statement, balance sheet with adjustments & cost sheets'),
  ],
  '10:152': [
    ch('অধ্যায় ৭–১৩: শেয়ার-বন্ড-ডিবেঞ্চার, মুদ্রা-ব্যাংক ও ব্যাংকিং, বাণিজ্যিক ব্যাংক ও বাংলাদেশ ব্যাংক', 'Chapters 7–13: Shares-Bonds, Banking System, Commercial & Central Bank', 'ব্যাংক তহবিল সংগ্রহ, চেক ও পে-অর্ডার, ঋণ নিয়ন্ত্রণ ও গ্রাহকের প্রতি ব্যাংকের দায়িত্ব', 'Shares & bonds, cheques, credit control & commercial/central bank functions'),
  ],
  '10:143': [
    ch('অধ্যায় ৭–১২: বাংলাদেশের শিল্প, ব্যবসায় প্রতিষ্ঠানের ব্যবস্থাপনা, বিপণন, নৈতিকতা ও সফল উদ্যোক্তা', 'Chapters 7–12: Industries, Management, Marketing, Ethics & Case Studies', 'পরিকল্পনা-সংগঠন-প্রেষণা-নিয়ন্ত্রণ, বিপণন প্রণালী, সামাজিক দায়বদ্ধতা ও উদ্যোক্তা জীবনী', 'Management functions, marketing channels, CSR & entrepreneur case studies'),
  ],
};
