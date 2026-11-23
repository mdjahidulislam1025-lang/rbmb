
export type Language = 'bn' | 'en';
export type ThemeMode = 'light' | 'dark';
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface LocalizedString {
  bn: string;
  en: string;
}

export interface SchoolSettings {
  name: LocalizedString;
  shortName?: string;
  tagline?: LocalizedString;
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

export interface NewsArticle {
  id: string;
  title: LocalizedString;
  summary: LocalizedString;
  content: LocalizedString;
  category: 'Academic' | 'Achievement' | 'Campus' | 'Community';
  date: string;
  imageUrl?: string;
  author?: string;
  isPublic?: boolean;
}

export interface CampusEvent {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  date: string;
  time: string;
  location: LocalizedString;
  category: 'Cultural' | 'Sports' | 'Science' | 'Academic';
  isPublic?: boolean;
}

export interface Teacher {
  id: string;
  name: LocalizedString;
  designation: LocalizedString;
  subject: LocalizedString;
  qualification: LocalizedString;
  photo: string;
  teacherCode?: string;
  phone?: string;
  bloodGroup?: string;
  cardIssueDate?: string;
  cardValidUpto?: string;
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
  isPublic?: boolean;
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

export interface AdmissionStatusProjection {
  appId: string;
  targetClass: string;
  targetGroup: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  mobileLast4?: string;
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
  subject?: string;
  qualification?: string;
  bloodGroup?: string;
  registrationNo?: string;
  guardianName?: string;
  section?: string;
  session?: string;
  relationship?: 'Father' | 'Mother' | 'Guardian';
  linkedStudentId?: string;
  linkedStudentIds?: string[];
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
  phone?: string;
  designation?: string;
  subject?: string;
  qualification?: string;
  bloodGroup?: string;
  registrationNo?: string;
  guardianName?: string;
  section?: string;
  session?: string;
  relationship?: 'Father' | 'Mother' | 'Guardian';
  linkedStudentId?: string;
  linkedStudentIds?: string[];
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
  guardianName?: string;
  registrationNo?: string;
  bloodGroup?: string;
  email?: string;
  photo?: string;
  registrationDate?: string;
  session?: string;
  cardIssueDate?: string;
  cardValidUpto?: string;
  admitCardApproved?: boolean;
  admitCardTerm?: string;
  admitCardApprovedAt?: string;
  studentUid?: string;
  allowedUids?: string[];
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

export interface StudentAttendanceRecord {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  studentName: string;
  roll: string;
  status: AttendanceStatus;
  teacherName: string;
  allowedUids?: string[];
  isPublished: boolean;
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
  allowedUids?: string[];
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
  teacherId?: string;
  teacherCode?: string;
  recipientUid?: string;
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

export interface ParentStudentLink {
  id: string;
  parentUid: string;
  parentEmail: string;
  parentName: string;
  studentId?: string;
  studentName?: string;
  classId: string;
  roll: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  submittedDate: string;
}

export type FeeCategory = 'Tuition' | 'Exam' | 'Admission' | 'Library' | 'Lab' | 'Sports' | 'Other';
export type FeeStatus = 'pending' | 'partial' | 'paid' | 'waived';
export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Online';

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  roll: string;
  title: string;
  category: FeeCategory;
  billingMonth?: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: FeeStatus;
  paymentMethod?: PaymentMethod;
  receiptNo?: string;
  paidDate?: string;
  recordedBy: string;
  allowedUids?: string[];
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  targetRole: 'all' | 'student' | 'parent' | 'teacher';
  classId?: string;
  priority: 'normal' | 'urgent';
  senderName: string;
  createdDate: string;
}

export type AuditAction =
  | 'ROLE_CHANGED'
  | 'ADMISSION_STATUS_UPDATED'
  | 'ADMISSION_DELETED'
  | 'PARENT_LINK_REVIEWED'
  | 'MARKS_SAVED'
  | 'MARKS_DELETED'
  | 'ATTENDANCE_SAVED'
  | 'SETTINGS_UPDATED'
  | 'TEACHER_LEAVE_REVIEWED'
  | 'STUDENT_LEAVE_REVIEWED'
  | 'ALUMNI_REVIEWED'
  | 'FEE_CREATED'
  | 'FEE_UPDATED'
  | 'FEE_DELETED'
  | 'NOTIFICATION_SENT'
  | 'ROUTINE_UPDATED'
  | 'RECORD_DELETED';

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: AuditAction;
  targetCollection: string;
  targetId: string;
  summary: string;
  createdDate: string;
}

