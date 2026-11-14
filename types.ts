
export interface LocalizedString {
  bn: string;
  en: string;
}

export interface Notice {
  id: string;
  title: LocalizedString;
  date: string;
  category: 'Admission' | 'Exam' | 'Holiday' | 'General';
  description: LocalizedString;
  pdfUrl?: string;
}

export interface Teacher {
  id: string;
  name: LocalizedString;
  designation: LocalizedString;
  subject: LocalizedString;
  qualification: LocalizedString;
  photo: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: LocalizedString;
}

export interface AcademicClass {
  className: LocalizedString;
  sections: string[];
  totalStudents: number;
}

export interface Holiday {
  id: string;
  title: LocalizedString;
  date: string;
  duration: LocalizedString;
  type: 'National' | 'Religious' | 'Seasonal' | 'Other';
}

export interface Syllabus {
  classId: string;
  className: LocalizedString;
  subjects: {
    name: LocalizedString;
    code: string;
  }[];
}

export interface RoutinePeriod {
  time: string;
  subject: LocalizedString;
}

export interface ClassRoutine {
  classId: string;
  className: LocalizedString;
  schedule: {
    day: LocalizedString;
    periods: RoutinePeriod[];
  }[];
}
