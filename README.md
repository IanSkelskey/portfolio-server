# portfolio-server

Backend API for [ianskelskey.github.io](https://ianskelskey.github.io). Handles contact form submissions, validates input, and sends styled HTML emails via [Resend](https://resend.com).

## Stack

- **Express 4** — HTTP server
- **Zod** — request validation
- **Resend** — transactional email
- **Helmet** — security headers
- **express-rate-limit** — per-IP rate limiting
- **tsx** — TypeScript execution (no build step)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Returns `{ status: "ok" }` |
| `POST` | `/api/contact` | Submit a contact form message |

### `POST /api/contact`

**Request body**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "Hello!",
  "_honey": "",
  "_loadTime": 1713657600000
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Max 100 chars |
| `email` | string | Yes | Valid email, max 200 chars |
| `message` | string | Yes | Max 2000 chars |
| `_honey` | string | No | Honeypot — must be empty |
| `_loadTime` | number | No | `Date.now()` at form mount, used for timing check |

**Responses**

| Status | Body | Meaning |
|--------|------|---------|
| `200` | `{ "ok": true }` | Message sent (or silently dropped as spam) |
| `400` | `{ "error": "Invalid input." }` | Validation failed |
| `429` | `{ "error": "Too many requests..." }` | Rate limit exceeded |
| `500` | `{ "error": "..." }` | Server or email delivery error |

## Spam protection

Submissions are silently dropped (returns `200 { ok: true }`) if any of the following are true:

- `_honey` field is non-empty (honeypot)
- Submission arrived less than 2 seconds after `_loadTime` (bot timing check)
- `name` contains a URL
- `message` contains more than 5 URLs

Rate limit: **3 requests per IP per 24 hours**.

## Local development

```bash
cp .env.example .env
# Fill in RESEND_API_KEY and CONTACT_TO_EMAIL in .env
npm install
npm run dev
```

The server starts on `http://localhost:3000` by default.

To test with the portfolio frontend locally, set `EXTRA_ORIGINS=http://localhost:5173` in `.env` and `VITE_API_URL=http://localhost:3000` in the portfolio's `.env.local`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | API key from [resend.com/api-keys](https://resend.com/api-keys) |
| `CONTACT_TO_EMAIL` | Yes | Address that receives contact form submissions |
| `PORT` | No | Port to listen on (default `3000`; set automatically by Render) |
| `EXTRA_ORIGINS` | No | Comma-separated additional CORS origins, e.g. `http://localhost:5173` |
| `NODE_ENV` | No | Set to `production` on Render |

See `.env.example` for a template.

## Deployment

Deployed on [Render](https://render.com) via `render.yaml`. On every push to `master`, Render runs `npm install` and starts the server with `npm start` (`node --import tsx/esm src/index.ts`).

Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` as **secret** environment variables in the Render dashboard — they are marked `sync: false` in `render.yaml` intentionally.
