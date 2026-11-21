# Security Specification — Ranir Bazar Secondary High School

## 1. Data Invariants
1. Public catalog collections (`teachers`, `gallery`, `holidays`, `subjects`) are readable by visitors only when `isPublic == true`, and mutable ONLY by verified admins (`isAdmin()`). `notices`, `ebooks`, `homework`, `onlineExams`, and `examRoutines` may also be created/updated by verified teachers (`isTeacher()`).
2. `settings/main` is publicly readable (`get` only) and mutable ONLY by verified admins.
3. `admissions/{appId}` and `contactMessages/{msgId}` contain PII (phone numbers, addresses, emails). Anyone may submit a valid new record (`create`) starting in initial state (`status == 'pending'` / `status == 'unread'`), while reading (`get`, `list`), updating, and deleting are strictly restricted to verified admins (or the authenticated `ownerUid` for their own admission).
4. `users/{uid}` is readable only by the profile owner or verified admins; self-registration can only assign `role in ['student', 'parent']`, and owners cannot escalate their own `role`.
5. `admins/{uid}` can only be modified by the bootstrapped admin (`mdjahidulislam1025@gmail.com` with `email_verified == true`).
6. All document IDs match `^[a-zA-Z0-9_\-]+$` (max 128 chars), all strings enforce explicit `.size()` caps, and all timestamps enforce `request.time`.
7. `students/{studentId}` contains guardian mobile numbers (PII) and is readable/writable ONLY by verified teachers (`isTeacher()`) or admins (`isAdmin()`).
8. `attendance/{attendanceId}` and `examMarks/{markId}` can ONLY be created, updated, or deleted by verified teachers/admins; signed-in users (`isSignedIn()`) may read published records (`isPublished == true`). Unauthenticated visitors cannot read exam marks or attendance.
9. `assignmentSubmissions/{submissionId}` and `examAttempts/{attemptId}` are owned (`ownerUid == request.auth.uid`) by the submitting signed-in student or readable/gradable by verified teachers.
10. `parentMessages/{messageId}` can be created by signed-in parents/users (`status == 'open'`, `ownerUid == request.auth.uid`), read by owner or `isTeacher()`, and replied to ONLY by verified teachers.
11. `alumni/{alumniId}` registrations must start with `status == 'pending'` and `isPublic == false`; only verified admins may approve (`status == 'approved'`, `isPublic == true`).
12. `teacherLeaves/{leaveId}` and `studentLeaves/{leaveId}` enforce initial `status == 'pending'` and strict approval transitions (`isAdmin()` for teacher leaves, `isTeacher()` for student leaves).

## 2. Dirty Dozen+ Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Notice Create**: `{ "id": "n1", "title": {"bn":"x","en":"x"}, "isPublic": true }` -> Denied (not verified teacher/admin).
2. **Shadow Field Injection on Admission**: `{ "appId": "RBHS-1", ..., "isVerifiedAdmin": true }` -> Denied (`hasOnly` rejects ghost key).
3. **State Shortcutting on Admission Create**: `{ "appId": "RBHS-2", ..., "status": "approved" }` -> Denied (`status` must equal `'pending'`).
4. **Privilege Escalation on User Create**: `{ "uid": "u1", ..., "role": "admin" }` -> Denied (`role` limited to `'student'` or `'parent'`).
5. **Role Self-Elevation on User Update**: Authenticated user updates `users/{uid}` with `{ "role": "admin" }` -> Denied (`affectedKeys().hasOnly` + `role == existing().role`).
6. **Email Spoofing Attack**: Token has `email_verified: false` -> Denied (`isSignedIn()` requires verified email).
7. **PII Leak via Blanket List on Admissions**: Non-admin user lists `/admissions` -> Denied without `ownerUid == auth.uid`.
8. **PII Leak on Contact Messages**: Non-admin reads `/contactMessages` -> Denied.
9. **ID Poisoning**: Path exceeding 128 chars or containing slashes -> Denied (`isValidId()`).
10. **Timestamp Spoofing**: Client-forged `createdAt` -> Denied (`createdAt == request.time`).
11. **Oversized Image/Denial-of-Wallet**: Uploading >600KB string -> Denied (`photo.size() <= 600000`).
12. **Immortal Field Tampering**: Mutating `createdAt` or `uid` on update -> Denied.
13. **Teacher Self-Approving Own Leave**: Verified teacher sets `teacherLeaves.status = 'approved'` -> Denied.
14. **Student Tampering Exam Marks**: Student writes `/examMarks` -> Denied.
15. **Student Approving Own Leave**: Student updates `studentLeaves.status = 'approved'` -> Denied.
16. **Student Self-Grading Submission**: Student updates `assignmentSubmissions.marks` -> Denied.
17. **Alumni Self-Publishing**: Creating alumni doc with `status: 'approved', isPublic: true` -> Denied.
18. **Anonymous Exam Marks Read**: Visitor (`auth == null`) queries `/examMarks` -> Denied.
