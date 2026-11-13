# Security Specification: Apex Tesla Hub Firestore Rules

## 1. Data Invariants
- Every document under `/users/{userId}` belongs strictly to the authenticated user whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
- Client writes to `/users/{userId}` can never set `role` to anything other than `"customer"`.
- `uid`, `email`, `authProvider`, `role`, and `createdAt` are immutable after document creation.
- All string fields enforce explicit maximum lengths and IDs enforce `^[a-zA-Z0-9_-]+$`.
- Timestamps (`createdAt`, `updatedAt`) must equal `request.time` via `serverTimestamp()`.
- `/admins/{adminId}` cannot be written from client SDKs; only existing/bootstrapped admins may read admin records.
- `/site_config/seo`, `/page_seo/{pageId}`, and `/media_assets/{assetId}` contain only non-PII public site branding/SEO data; reads are public and writes are strictly restricted to verified admins (`isAdmin()`).
- `/admin_settings/{sectionId}` permits explicit `get` for non-secret storefront sections (`site_settings`, `currencies`, `feature_toggles`, `faqs`, `navigation_menus`, `site_pages`, etc.), while sensitive admin slices (`smtp_config`, `auto_gateways`, `won_prizes`) and collection `list` are strictly restricted to `isAdmin()`.
- No collection permits blanket `list` queries on PII or secret operational settings.

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
11. Authenticated non-admin writing to `/site_config/seo`, `/page_seo/home`, `/admin_settings/site_settings`, or `/media_assets/a1` -> PERMISSION_DENIED.
12. Unauthenticated or non-admin reading `/admin_settings/smtp_config` or listing `/admin_settings` -> PERMISSION_DENIED.
