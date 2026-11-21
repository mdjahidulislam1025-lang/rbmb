// Security Rules Verification Matrix for Ranir Bazar Secondary High School
// Covers the Dirty Dozen + Role-Specific Negative Cases defined in security_spec.md

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list';
  expected: 'PERMISSION_DENIED';
  reason: string;
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Notice Create',
    collection: 'notices',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'isTeacher() requires verified Firebase Auth teacher or admin identity',
  },
  {
    id: 2,
    name: 'Shadow Field Injection on Admission',
    collection: 'admissions',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'isValidAdmission enforces strict keys().hasOnly(...)',
  },
  {
    id: 3,
    name: 'State Shortcutting on Admission Create',
    collection: 'admissions',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'incoming().status == "pending" enforced on create',
  },
  {
    id: 4,
    name: 'Privilege Escalation on User Create',
    collection: 'users',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'Non-admin registration only allows student or parent role',
  },
  {
    id: 5,
    name: 'Role Self-Elevation on User Update',
    collection: 'users',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    reason: 'Owner update checks incoming().role == existing().role and affectedKeys().hasOnly',
  },
  {
    id: 6,
    name: 'Email Spoofing with Unverified Email',
    collection: 'notices',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'isSignedIn() enforces request.auth.token.email_verified == true',
  },
  {
    id: 7,
    name: 'PII Leak via Blanket List on Admissions',
    collection: 'admissions',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
    reason: 'allow list requires isAdmin() or matching existing().ownerUid == request.auth.uid',
  },
  {
    id: 8,
    name: 'PII Leak on Contact Messages',
    collection: 'contactMessages',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
    reason: 'Only isAdmin() can read or list contactMessages',
  },
  {
    id: 9,
    name: 'ID Poisoning on Document Path',
    collection: 'notices',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'isValidId enforces ^[a-zA-Z0-9_\\-]+$ and <= 128 chars',
  },
  {
    id: 10,
    name: 'Client Timestamp Spoofing',
    collection: 'notices',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'createdAt == request.time and updatedAt == request.time enforced',
  },
  {
    id: 11,
    name: 'Oversized Image Denial-of-Wallet',
    collection: 'teachers',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'photo.size() <= 600000 enforced',
  },
  {
    id: 12,
    name: 'Immortal Field Tampering',
    collection: 'users',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    reason: 'incoming().uid == existing().uid and incoming().createdAt == existing().createdAt enforced',
  },
  {
    id: 13,
    name: 'Teacher Self-Approving Own Leave',
    collection: 'teacherLeaves',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    reason: 'Only isAdmin() may update teacherLeaves approval status',
  },
  {
    id: 14,
    name: 'Student Tampering Exam Marks',
    collection: 'examMarks',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    reason: 'Only isTeacher() may create, update, or delete examMarks',
  },
  {
    id: 15,
    name: 'Student Approving Own Leave',
    collection: 'studentLeaves',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    reason: 'Only isTeacher() may update studentLeaves approval status',
  },
  {
    id: 16,
    name: 'Student Self-Grading Assignment Submission',
    collection: 'assignmentSubmissions',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    reason: 'Only isTeacher() may update marks, feedback, and graded status',
  },
  {
    id: 17,
    name: 'Unapproved Alumni Self-Publishing',
    collection: 'alumni',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    reason: 'New alumni profiles must start with status == "pending" and isPublic == false',
  },
  {
    id: 18,
    name: 'Anonymous Exam Marks List',
    collection: 'examMarks',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
    reason: 'Exam marks require isSignedIn() or isTeacher()',
  },
];
