# API Endpoints (Current + Hybrid Go + Firestore Plan)

This repo currently implements a small set of Next.js App Router API routes under `src/app/api/**/route.ts`, plus Firebase Cloud Functions.

This document includes:

1. **Current behavior** (what the frontend calls today).
2. **Target hybrid architecture** (Firestore remains the DB; Go does the “backend work”).
3. **A Go-oriented REST spec** that matches the frontend/admin features in this repo.

---

## Conventions

### Base URL

- Local dev: `http://localhost:3000`
- Prod: `https://dtdaniel.site` (or whatever you deploy)

### Auth schemes used in this repo

#### 1) Firebase ID token (admin-only)

Some endpoints require:

- Header: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- Backend verifies token and checks `decoded.email === ADMIN_EMAIL`.

#### 2) Cron secret (server-to-server)

The scheduled publishing endpoint requires:

- Header: `Authorization: Bearer <CRON_SECRET>`

### Error shape

Current endpoints mostly return:

```json
{ "error": "Some message" }
```

Some endpoints return a richer error:

```json
{ "error": "Internal Server Error", "message": "...", "timestamp": "..." }
```

If you’re implementing the Go backend, it’s recommended to standardize on something like:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing token",
    "details": null
  }
}
```

---

## Target Architecture (Agreed Plan)

### What stays on Firebase

- **Firestore** continues to store all application data.
- **Firebase Auth** continues to handle user sign-in on the frontend.
- (Optional) **Firebase Storage / Cloud Storage** continues to store media files.

### What moves to Go

Go becomes the _service layer_ that:

- Verifies Firebase ID tokens (admin-only endpoints).
- Handles emails (contact notify + reply notify).
- Handles media upload + image processing.
- Handles scheduled publishing (cron-triggered).
- Reads/writes Firestore via Firebase Admin SDK credentials.

### Key rule (recommended)

- Treat the browser as **untrusted**.
- Prefer: **Frontend → Go API → Firestore/Storage**.

This keeps validation, authorization, and rate limiting server-side, while still using Firestore as the database.

### Firestore collections currently implied by the frontend

- `projects`
- `skills`
- `about`
- `blog-posts`
- `messages` (contact messages + replies)
- `media-library` (media metadata)

---

## Current Next.js API Routes

### 1) POST /api/notify

**Source:** `src/app/api/notify/route.ts`

Sends an email to the admin email address when someone submits the contact form.

**Auth:** None (public)

**Headers**

- `Content-Type: application/json`

**Request body** (as implemented by the route)

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Hello",
  "message": "I want to hire you."
}
```

**Important note (current frontend mismatch):**

- The contact form currently calls `addContactMessage(...)` which sends `{ name, email, subject, content }` to this endpoint (property is `content`, not `message`).
- The route reads `message`, so email body can become `undefined` unless you align them.
- Canonical field (recommended): `message`.
- Backward compatibility (recommended): accept `content` as an alias for `message` and normalize server-side:
  - `normalizedMessage = body.message ?? body.content`
  - Then use `normalizedMessage` for email + storage.

**Success response**

- `200 OK`

```json
{ "success": true }
```

**Failure responses**

- `500 Internal Server Error`

```json
{ "error": "Failed to send notification" }
```

**Operational dependencies / env vars**

- Uses Gmail via Nodemailer.
- `EMAIL_APP_PASSWORD` must be set.
- Admin sender address comes from `ADMIN_EMAIL` exported in `src/lib/firebase`.
- Uses `NEXT_PUBLIC_BASE_URL` in the email template link.

**Edge cases to handle (especially in Go)**

- Missing/invalid JSON body.
- Missing required fields; current route does not validate.
- Spam/abuse: this is public and can be used to send email repeatedly.
  - Recommended: rate limiting, CAPTCHA, and/or a honeypot field.
- Email injection: ensure you sanitize/escape user-provided strings in HTML.

---

### 2) POST /api/reply-notify

**Source:** `src/app/api/reply-notify/route.ts`

Sends an email reply to a contact message recipient.

**Auth:** None (public)

**Headers**

- `Content-Type: application/json`

**Request body**

```json
{
  "messageId": "firestore_doc_id",
  "reply": "Thanks for reaching out — let’s talk.",
  "recipientEmail": "jane@example.com",
  "recipientName": "Jane"
}
```

**Success response**

- `200 OK`

```json
{ "success": true }
```

**Failure responses**

- `400 Bad Request`

```json
{ "error": "Missing required fields" }
```

- `500 Internal Server Error` (multiple internal cases)

```json
{ "error": "Email configuration error" }
```

```json
{ "error": "Email service not available" }
```

```json
{ "error": "Failed to send email", "details": "..." }
```

```json
{ "error": "Internal server error", "details": "..." }
```

**Operational dependencies / env vars**

- Uses Gmail via Nodemailer.
- `EMAIL_APP_PASSWORD` must be set.
- Admin sender address comes from `ADMIN_EMAIL` exported in `src/lib/firebase`.

**Edge cases / security notes**

- This endpoint is currently unauthenticated: anyone could call it to send emails to arbitrary recipients.
  - Under the hybrid plan, move this behind the Go API and make it **admin-only** (verify Firebase ID token + admin email).
- Validate `recipientEmail` format.
- Consider storing replies server-side, then generating the email from stored reply content (avoid trusting client input).

---

### 3) GET /api/publish-scheduled

**Source:** `src/app/api/publish-scheduled/route.ts`

Publishes blog posts that are `status == "scheduled"` and have `scheduledFor <= now`.

**Auth:** Cron secret

**Headers**

- `Authorization: Bearer <CRON_SECRET>`

**Request body:** none

**Success response**

- `200 OK`

```json
{
  "success": true,
  "publishedCount": 2,
  "timestamp": "2026-01-04T10:00:00.000Z",
  "message": "Successfully published 2 scheduled posts"
}
```

**Failure responses**

- `401 Unauthorized`

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authorization token"
}
```

- `500 Internal Server Error`

```json
{
  "error": "Internal Server Error",
  "message": "...",
  "timestamp": "..."
}
```

**Side effects**
For each qualifying doc in `blog-posts`:

- Sets `status: "published"`
- Sets `published: true`
- Sets `publishedAt: now`
- Sets `updatedAt: now`

**Operational dependencies / env vars**

- `CRON_SECRET` must be set.
- Uses Firebase Admin SDK Firestore via `src/lib/firebase-admin`.

**Edge cases to handle (especially in Go)**

- Idempotency: calling twice should not republish already-published posts.
- Timezones: store `scheduledFor` as UTC and compare consistently.
- Large batches: if many posts are due, batch updates may need chunking.

---

### 4) POST /api/media/upload

**Source:** `src/app/api/media/upload/route.ts`

Uploads an image/file, creates an optimized version + thumbnail, stores both in Cloud Storage, and writes metadata to Firestore `media-library`.

**Auth:** Admin-only via Firebase ID token

**Headers**

- `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- `Content-Type: multipart/form-data; boundary=...` (set automatically by browser when using `FormData`)

**Multipart form fields**

- `file`: the uploaded file
- `metadata`: JSON string

Example (conceptual):

- `file`: `myimage.png`
- `metadata`:

```json
{
  "caption": "Homepage hero",
  "altText": "Portrait photo",
  "tags": ["hero", "portrait"],
  "anyOtherFields": "allowed"
}
```

**Success response**

- `200 OK`

```json
{
  "id": "firestore_doc_id",
  "url": "https://storage.googleapis.com/...signed-url...",
  "thumbnailUrl": "https://storage.googleapis.com/...signed-url...",
  "fileName": "1700000000000-myimage.png"
}
```

**Failure responses**

- `401 Unauthorized`

```json
{ "error": "Unauthorized" }
```

```json
{ "error": "Invalid token" }
```

- `400 Bad Request`

```json
{ "error": "No file provided" }
```

- `500 Internal Server Error`

```json
{ "error": "Error uploading media" }
```

**Side effects**

- Stores files:
  - `media/<fileName>` (optimized)
  - `media/thumbnails/<fileName>` (thumbnail)
- Writes Firestore doc in `media-library` with fields like:
  - `fileName`, `originalName`, `type`, `size`, `url`, `thumbnailUrl`, `metadata`, `uploadedAt`, `caption`, `altText`, `tags`

**Operational dependencies / env vars**

- Requires Firebase Admin SDK credentials.
- Requires `ADMIN_EMAIL` env var (checked against the decoded token email).
- Uses `sharp` for image processing.

**Edge cases to handle (especially in Go)**

- Large files: current implementation buffers the entire file in memory.
- Non-images: current code still attempts `sharp(buffer)` and will fail.
- Invalid `metadata` JSON (parsing error).
- Filename collisions: uses `Date.now()` prefix; consider UUID.
- Signed URLs expiring: current code sets expiry to year 2100; consider public ACL or shorter-lived signed URLs.

---

## Firebase Cloud Functions (Not HTTP Routes)

These are not called via `/api/...` but are part of the system behavior.

### A) Firestore trigger: messages/{messageId} onCreate

**Source:** `functions/index.js`

Triggered when a new doc is created in `messages/{messageId}`.

Typical responsibilities (based on repo intent):

- Send an email notification to admin
- Potentially send push notification to registered devices

**Go backend equivalent**

- Background worker / queue consumer for “new contact message” events.

### B) Callable function: updateFCMToken

**Source:** `functions/index.js`

A Firebase callable function (invoked via Firebase Functions client SDK, not via REST by default).

Typical responsibilities:

- Register/unregister an FCM token for the admin user/device.

**Go backend equivalent**

- Admin-authenticated endpoint like `POST /v1/admin/fcm-tokens`.

---

## Go Backend REST Spec (Recommended for Hybrid Plan)

This section is a suggested API surface that fits the frontend/admin features in this repo.

Under the hybrid plan:

- **Firestore remains the database** (source of truth).
- Go endpoints **read/write Firestore** using Firebase Admin SDK.
- The frontend should call Go for operations that need validation/authorization (and ideally for most writes).

### Auth (recommended for Go)

- Use Firebase Authentication on the frontend.
- Backend verifies Firebase ID tokens.
- Admin-only operations additionally check `email == ADMIN_EMAIL` (or a role claim).

Implementation note (Go): use Firebase Admin SDK to verify ID tokens and to access Firestore.

### Public endpoints

#### GET /v1/projects

Returns the projects list in display order.

**Response**

```json
{
  "projects": [
    {
      "id": "abc123",
      "title": "Project Name",
      "description": "...",
      "imageUrl": "https://...",
      "githubUrl": "https://github.com/...",
      "liveUrl": "https://...",
      "technologies": ["Next.js", "Firebase"],
      "isPrivate": false,
      "order": 1
    }
  ]
}
```

**Edge cases**

- If `isPrivate == true`, frontend expects `githubUrl` to become the string `"private"`.

#### GET /v1/projects/{id}

Returns a single project.

- `404` if not found.

#### GET /v1/blog/posts

Returns published blog posts.

**Query params (optional)**

- `limit` (default e.g. 20)
- `cursor` (for pagination)
- `tag`
- `category`

**Response**

```json
{
  "posts": [
    {
      "id": "post123",
      "title": "...",
      "slug": "my-post",
      "excerpt": "...",
      "content": "<html>...</html>",
      "coverImage": "https://...",
      "tags": ["react"],
      "category": "Tech",
      "published": true,
      "status": "published",
      "createdAt": "2026-01-04T10:00:00.000Z",
      "updatedAt": "2026-01-04T10:00:00.000Z"
    }
  ]
}
```

#### GET /v1/blog/posts/{slug}

Returns one blog post by slug.

- `404` if not found.

#### POST /v1/contact/messages

Creates a new contact message and triggers an admin notification.

Firestore writes (recommended):

- Add document to `messages` with `status: "unread"`, timestamps, etc.
- Store a canonical message field. Recommended approach for compatibility with existing UI/data:
  - Write `content` (existing field name used by the frontend today)
  - Also write `message` (canonical field name for the API)
  - Set both to the same normalized value

**Request**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Hello",
  "message": "I want to hire you."
}
```

Backward compatible request (accepted by Go, but not preferred):

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Hello",
  "content": "I want to hire you."
}
```

**Response**

- `201 Created`

```json
{ "id": "message_doc_id", "success": true }
```

**Edge cases**

- Validate email format.
- Rate limit / CAPTCHA.
- If storing message fails but email succeeds (or vice versa), decide on transactional behavior.

---

### Admin endpoints (Firebase ID token + admin email)

#### GET /v1/admin/messages

Returns contact messages ordered by timestamp desc.

#### PATCH /v1/admin/messages/{id}

Updates message status.

**Request**

```json
{ "status": "read" }
```

#### POST /v1/admin/messages/{id}/replies

Stores a reply and sends an email to the message sender.

Firestore writes (recommended):

- Append a reply object to `messages/{id}.replies`.
- Set `status: "replied"`.

**Request**

```json
{ "reply": "Thanks for reaching out..." }
```

#### POST /v1/admin/media

Uploads media (multipart) and returns URLs.

- Same shape/behavior as current `POST /api/media/upload`.

#### GET /v1/admin/media

Returns the media library.

#### PATCH /v1/admin/media/{id}

Updates media metadata (caption/tags/etc).

#### DELETE /v1/admin/media/{id}

Deletes media and its storage objects.

#### CRUD for projects/skills/about/blog

This repo’s admin UI implies typical CRUD operations for:

- Projects (`projects`)
- Skills (`skills`)
- About (`about`)
- Blog posts (`blog-posts`) including draft/scheduled/published

If you want strict parity with current Firestore usage, implement:

- `GET /v1/admin/projects`, `POST /v1/admin/projects`, `PATCH /v1/admin/projects/{id}`, `DELETE /v1/admin/projects/{id}`
- `GET /v1/admin/skills`, `POST /v1/admin/skills`, `PATCH /v1/admin/skills/{id}`, `DELETE /v1/admin/skills/{id}`
- `GET /v1/admin/about`, `PATCH /v1/admin/about`
- `GET /v1/admin/blog/posts`, `POST /v1/admin/blog/posts`, `PATCH /v1/admin/blog/posts/{id}`, `DELETE /v1/admin/blog/posts/{id}`

---

### Cron endpoint (server-to-server)

#### POST /v1/admin/cron/publish-scheduled

Same behavior as current `GET /api/publish-scheduled`, but `POST` is usually preferable for a job trigger.

**Headers**

- `Authorization: Bearer <CRON_SECRET>`

**Response**

```json
{ "success": true, "publishedCount": 2 }
```

---

## Migration Notes (from Next API routes to Go)

To reflect the hybrid plan, you can keep the existing Next `/api/*` routes temporarily, but long-term:

- Replace `POST /api/notify` with `POST /v1/contact/messages` (Go writes Firestore + sends admin email).
- - Rollout note: the frontend can keep sending `content` initially; Go should accept it as an alias and normalize to the canonical `message`.
- Replace `POST /api/reply-notify` with `POST /v1/admin/messages/{id}/replies` (Go enforces admin + sends email).
- Replace `POST /api/media/upload` with `POST /v1/admin/media` (Go enforces admin + processes + stores media).
- Replace `GET /api/publish-scheduled` with `POST /v1/admin/cron/publish-scheduled` (Go does Firestore batch update).

This reduces duplicated logic and prevents unauthenticated email/media endpoints from being exposed.

## Quick mapping: where these are used in the frontend

- Contact form: `src/app/contact/page.tsx` → `addContactMessage()` → `POST /api/notify`
- Reply flow: `src/lib/firebaseHelpers.ts` → `addMessageReply()` → `POST /api/reply-notify`
- Media uploads: `src/utils/mediaManager.ts` → `uploadMedia()` → `POST /api/media/upload`
- Scheduled publishing: external cron → `GET /api/publish-scheduled`
