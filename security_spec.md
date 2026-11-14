# Security Specification — Ranir Bazar Secondary High School

## 1. Data Invariants
1. All public school catalog collections (`notices`, `teachers`, `ebooks`, `gallery`, `holidays`) can be read by visitors only when `isPublic == true`, and can be created, updated, or deleted ONLY by verified admins (`isAdmin()`).
2. `settings/main` is publicly readable (`get` only) and mutable ONLY by verified admins.
3. `admissions/{appId}` and `contactMessages/{msgId}` contain PII (phone numbers, addresses, emails). Anyone may submit a valid new record (`create`) starting in initial state (`status == 'pending'` / `status == 'unread'`), while reading (`get`, `list`), updating, and deleting are strictly restricted to verified admins (or the authenticated `ownerUid` for their own admission).
4. `users/{uid}` is readable only by the profile owner or verified admins; self-registration can only assign `role == 'student'`, and owners cannot escalate their own `role`.
5. `admins/{uid}` can only be modified by the bootstrapped admin (`mdjahidulislam1025@gmail.com` with `email_verified == true`).
6. All document IDs match `^[a-zA-Z0-9_\-]+$` (max 128 chars), all strings enforce explicit `.size()` caps, and all timestamps enforce `request.time`.

## 2. Dirty Dozen Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Notice Create**: `{ "id": "n1", "title": {"bn":"x","en":"x"}, "isPublic": true }` -> Denied (not admin).
2. **Shadow Field Injection on Admission**: `{ "appId": "RBHS-1", "studentName": "A", ..., "status": "pending", "isVerifiedAdmin": true }` -> Denied (`hasOnly` rejects ghost key).
3. **State Shortcutting on Admission Create**: `{ "appId": "RBHS-2", ..., "status": "approved" }` -> Denied (`status` must equal `'pending'` on create).
4. **Privilege Escalation on User Create**: `{ "uid": "u1", "name": "Hacker", "email": "h@x.com", "role": "admin" }` -> Denied (`role` must be `'student'`).
5. **Role Self-Elevation on User Update**: Authenticated student updates `users/{uid}` with `{ "role": "admin" }` -> Denied (`affectedKeys().hasOnly` + `role == existing().role`).
6. **Email Spoofing Attack**: Token has `email: "mdjahidulislam1025@gmail.com"` with `email_verified: false` -> Denied (`email_verified == true` required).
7. **PII Leak via Blanket List on Admissions**: Non-admin authenticated user runs `list` on `/admissions` without `ownerUid == auth.uid` -> Denied.
8. **PII Leak on Contact Messages**: Non-admin authenticated user runs `get` or `list` on `/contactMessages` -> Denied.
9. **ID Poisoning**: Creating `/notices/../../etc` or 500-char ID -> Denied (`isValidId()` regex + size limit).
10. **Timestamp Spoofing**: Creating `/notices/n2` as admin with client-forged `createdAt: "2020-01-01"` -> Denied (`createdAt == request.time`).
11. **Oversized Image/Denial-of-Wallet**: Uploading 2MB string into `teachers/{id}.photo` -> Denied (`photo.size() <= 600000`).
12. **Immortal Field Tampering**: Admin/User trying to mutate `createdAt` or `uid` on update -> Denied (`incoming().createdAt == existing().createdAt`).
