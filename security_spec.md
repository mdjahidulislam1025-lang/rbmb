# Security Specification — Ranir Bazar Secondary High School

## 1. Data Invariants
1. Public catalog collections (`teachers`, `gallery`, `holidays`, `subjects`) are readable by visitors only when `isPublic == true`, and mutable ONLY by verified admins (`isAdmin()`). `notices`, `ebooks`, `homework`, `onlineExams`, and `examRoutines` may also be created/updated by verified teachers (`isTeacher()`).
2. `settings/main` is publicly readable (`get` only) and mutable ONLY by verified admins.
3. `admissions/{appId}` and `contactMessages/{msgId}` contain PII (phone numbers, addresses, emails). Anyone may submit a valid new record (`create`) starting in initial state (`status == 'pending'` / `status == 'unread'`), while reading (`get`, `list`), updating, and deleting are strictly restricted to verified admins (or the authenticated `ownerUid` for their own admission). Public admission status checks use `admission_status/{appId}` (`get` by exact App ID only, `list: false`, zero PII).
4. `users/{uid}` is readable only by the profile owner or verified admins; self-registration can only assign `role in ['student', 'parent']`, and owners cannot escalate their own `role`.
5. `admins/{uid}` can only be modified by the bootstrapped admin (`mdjahidulislam1025@gmail.com` with `email_verified == true`).
6. All document IDs match `^[a-zA-Z0-9_\-]+$` (max 128 chars), all strings enforce explicit `.size()` caps, and all timestamps enforce `request.time`.
7. `students/{studentId}` contains guardian mobile numbers (PII) and is readable/writable by verified teachers (`isTeacher()`) or admins (`isAdmin()`), or read-only (`get`, `list`) by the linked student/parent whose `request.auth.uid in existing().allowedUids`.
8. `attendance/{attendanceId}` is readable/writable ONLY by verified teachers/admins. Per-student `studentAttendance/{recordId}` and `examMarks/{markId}` can ONLY be written by verified teachers/admins, and read by signed-in students/parents ONLY when `isPublished == true` AND `request.auth.uid in existing().allowedUids`. Unauthenticated visitors or other students cannot read marks or attendance.
9. `assignmentSubmissions/{submissionId}` and `examAttempts/{attemptId}` are owned (`ownerUid == request.auth.uid`) by the submitting signed-in student or readable/gradable by verified teachers.
10. `parentMessages/{messageId}` can be created by signed-in parents/users (`status == 'open'`, `ownerUid == request.auth.uid`), read by owner or `isTeacher()`, and replied to ONLY by verified teachers.
11. `alumni/{alumniId}` registrations must start with `status == 'pending'` and `isPublic == false`; only verified admins may approve (`status == 'approved'`, `isPublic == true`).
12. `teacherLeaves/{leaveId}` and `studentLeaves/{leaveId}` enforce initial `status == 'pending'` and strict approval transitions (`isAdmin()` for teacher leaves, `isTeacher()` for student leaves).
13. `parent_student_links/{linkId}` can only be created by signed-in parents (`parentUid == request.auth.uid`, `status == 'pending'`), read by the requesting parent or teachers/admins, and approved/rejected ONLY by verified teachers/admins.
14. `audit_logs/{logId}` is append-only (`create` by `isTeacher()` with `actorUid == request.auth.uid` and `createdAt == request.time`), readable ONLY by verified admins (`isAdmin()`), and strictly immutable (`update: false`, `delete: false`).

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
19. **Unauthenticated News Create**: Visitor creates `/news` -> Denied.
20. **Student Event Update Bypass**: Student updates `/events` -> Denied.
21. **Admission Status Enumeration**: Listing `/admission_status` -> Denied (`allow list: if false`).
22. **Audit Log Tampering / Deletion**: Admin updates or deletes `/audit_logs/{id}` -> Denied (`update, delete: if false`).
23. **Parent Self-Approving Child Link**: Parent creates or updates `parent_student_links` with `status: 'approved'` -> Denied.
24. **Cross-Student Exam Marks Read**: Signed-in student whose UID is not in `allowedUids` reads another student's `/examMarks` -> Denied.
25. **Cross-Student Attendance Read**: Signed-in student reads `/attendance` or another student's `/studentAttendance` -> Denied.
26. **Cross-Student PII Read**: Signed-in student/parent reads unlinked `/students/{id}` -> Denied.

