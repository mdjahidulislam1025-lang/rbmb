
export type Language = 'bn' | 'en';
export type ThemeMode = 'light' | 'dark';
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface LocalizedString {
  bn: string;
  en: string;
}

export interface SchoolSettings {
  name: LocalizedString;
  eiin: string;
  phone: string;
  email: string;
  location: LocalizedString;
  schoolPhoto: string;
  headTeacherName?: LocalizedString;
  headTeacherMessage?: LocalizedString;
  headTeacherPhoto?: string;
  latitude?: number;
  longitude?: number;
}

export interface Notice {
  id: string;
  title: LocalizedString;
  date: string;
  category: 'General' | 'Admission' | 'Exam' | 'Holiday';
  description: LocalizedString;
  pdfUrl?: string;
  isPublic?: boolean;
}

export interface Teacher {
  id: string;
  name: LocalizedString;
  designation: LocalizedString;
  subject: LocalizedString;
  qualification: LocalizedString;
  photo: string;
  isPublic?: boolean;
}

export interface ClassRoutine {
  classId: string;
  className: LocalizedString;
  schedule: {
    day: LocalizedString;
    periods: {
      time: string;
      subject: LocalizedString;
      teacher: LocalizedString;
    }[];
  }[];
}

export interface ExamRoutineItem {
  id: string;
  examTerm: string;
  classId: string;
  subject: string;
  date: string;
  time: string;
  room?: string;
  isPublic?: boolean;
}

export interface SchoolSubject {
  id: string;
  code: string;
  name: LocalizedString;
  classId: string;
  totalMarks: number;
  teacherName?: string;
  isPublic?: boolean;
}

export interface SyllabusItem {
  classId: string;
  className: LocalizedString;
  subjects: {
    name: LocalizedString;
    code: string;
    pdfUrl: string;
  }[];
}

export type LibraryCategory =
  | 'Textbook'
  | 'StudyMaterial'
  | 'Notes'
  | 'ChapterPDF'
  | 'BoardQuestion'
  | 'ModelTest'
  | 'Practical'
  | 'MathSolution'
  | 'EnglishGrammar'
  | 'ICT';

export interface EBook {
  id: string;
  title: LocalizedString;
  classId: string;
  className: LocalizedString;
  subject: string;
  category?: LibraryCategory;
  description?: LocalizedString;
  coverUrl: string;
  downloadUrl: string;
  isPublic?: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: LocalizedString;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  category?: 'Campus' | 'Sports' | 'Cultural' | 'Lab' | 'Tour';
  isPublic?: boolean;
}

export interface Holiday {
  id: string;
  title: LocalizedString;
  date: string;
  duration: LocalizedString;
  type: 'National' | 'Religious' | 'Seasonal' | 'Other';
  isPublic?: boolean;
}

export interface AdmissionApplication {
  appId: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  guardianMobile: string;
  targetClass: string;
  targetGroup: string;
  birthDate: string;
  address: string;
  prevSchool?: string;
  bloodGroup?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  ownerUid?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  mobile: string;
  email: string;
  message: string;
  status: 'unread' | 'read';
  date: string;
}

export interface UserAccount {
  userId: string;
  name: string;
  email?: string;
  password?: string;
  passwordHash?: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  designation?: string;
  linkedChildClass?: string;
  linkedChildRoll?: string;
  linkedChildName?: string;
}

export interface CloudUserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  linkedChildClass?: string;
  linkedChildRoll?: string;
  linkedChildName?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SchoolStudent {
  id: string;
  roll: string;
  name: string;
  classId: string;
  section: string;
  guardianMobile: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  teacherName: string;
  records: Record<string, AttendanceStatus>;
  isPublished?: boolean;
}

export interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  classId: string;
  description: string;
  dueDate: string;
  assignedBy: string;
  createdDate: string;
  isPublic?: boolean;
}

export interface AssignmentSubmission {
  id: string;
  homeworkId: string;
  classId: string;
  subject: string;
  studentId: string;
  studentName: string;
  roll: string;
  answerText: string;
  attachmentUrl?: string;
  status: 'submitted' | 'graded';
  marks?: number;
  feedback?: string;
  submittedDate: string;
  ownerUid?: string;
}

export interface ExamMark {
  id: string;
  examTerm: string;
  classId: string;
  subject: string;
  studentId: string;
  studentName: string;
  roll: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  enteredBy: string;
  isPublished?: boolean;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface OnlineExam {
  id: string;
  title: LocalizedString;
  classId: string;
  subject: string;
  chapter: string;
  durationMinutes: number;
  mode: 'exam' | 'practice';
  questions: ExamQuestion[];
  createdBy: string;
  date: string;
  isPublic?: boolean;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  classId: string;
  studentId: string;
  studentName: string;
  roll: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<string, number>;
  timeSpentSeconds: number;
  submittedAt: string;
  ownerUid?: string;
}

export interface ParentMessage {
  id: string;
  parentName: string;
  studentName: string;
  classId: string;
  roll: string;
  teacherName: string;
  subject: string;
  message: string;
  reply?: string;
  repliedBy?: string;
  status: 'open' | 'replied';
  createdDate: string;
  ownerUid?: string;
}

export interface AlumniProfile {
  id: string;
  name: string;
  batchYear: string;
  currentRole: string;
  organization: string;
  city?: string;
  message: string;
  photo?: string;
  status: 'pending' | 'approved';
  isPublic?: boolean;
  ownerUid?: string;
}

export interface TeacherLeave {
  id: string;
  teacherId: string;
  teacherName: string;
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminRemark?: string;
  submittedDate: string;
  ownerUid?: string;
}

export interface StudentLeave {
  id: string;
  studentId: string;
  studentName: string;
  roll: string;
  classId: string;
  leaveType: 'Sick' | 'Family' | 'Emergency' | 'Other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  teacherRemark?: string;
  submittedDate: string;
  ownerUid?: string;
}
