# Security Specification: Apex Tesla Hub Firestore Rules

## 1. Data Invariants
- Every document under `/users/{userId}` belongs strictly to the authenticated user whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
- Client writes to `/users/{userId}` can never set `role` to anything other than `"customer"`.
- `uid`, `email`, `authProvider`, `role`, and `createdAt` are immutable after document creation.
- All string fields enforce explicit maximum lengths and IDs enforce `^[a-zA-Z0-9_-]+$`.
- Timestamps (`createdAt`, `updatedAt`) must equal `request.time` via `serverTimestamp()`.
- `/admins/{adminId}` cannot be written from client SDKs; only existing/bootstrapped admins may read admin records.
- No collection permits blanket `list` queries; `allow list` on `/users` is limited to admins or `resource.data.uid == request.auth.uid`.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated `get` on `/users/u1` -> PERMISSION_DENIED.
2. Unauthenticated `create` on `/users/u1` -> PERMISSION_DENIED.
3. Authenticated user `u2` reading `/users/u1` -> PERMISSION_DENIED (PII isolation).
4. Authenticated user `u1` creating `/users/u1` with `role: "admin"` -> PERMISSION_DENIED (privilege escalation).
5. Authenticated user `u1` creating `/users/u1` with `uid: "u2"` -> PERMISSION_DENIED (identity spoofing).
6. Authenticated user `u1` creating `/users/u1` with an extra shadow field `isVerified: true` -> PERMISSION_DENIED (`hasOnly` check).
7. Authenticated user `u1` creating `/users/u1` with `email_verified: false` -> PERMISSION_DENIED.
8. Authenticated user `u1` creating `/users/u1` with a 2KB `userId` document ID -> PERMISSION_DENIED (`isValidId`).
9. Authenticated user `u1` updating `/users/u1` with forged past `updatedAt` timestamp -> PERMISSION_DENIED (`request.time`).
10. Authenticated user `u1` updating `/users/u1` to mutate immutable `createdAt` or `role` -> PERMISSION_DENIED.
11. Authenticated user `u1` running blanket `list` on `/users` without `uid` equality -> PERMISSION_DENIED.
12. Authenticated non-admin creating `/admins/u1` -> PERMISSION_DENIED.
