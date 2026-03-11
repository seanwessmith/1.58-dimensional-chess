# 1.58 Dimensional Chess

A Bun + React implementation of a custom chess variant played on an 8x8 board with only 27 active squares.

## Commands

```bash
bun install
bun run dev
bun run build
bun run typecheck
bun test
```

## Auth Configuration

Copy `.env.example` to `.env` and set at least one of these:

```bash
BUN_PUBLIC_AUTH_WORKER_URL=http://127.0.0.1:8787
AUTH_WORKER_URL=http://127.0.0.1:8787
```

- `BUN_PUBLIC_AUTH_WORKER_URL` is inlined into the browser bundle.
- `AUTH_WORKER_URL` is used by the Bun server proxy on `/auth/*`.

## Cloudflare Worker

From `workers/`, configure runtime secrets before deploying:

```bash
wrangler secret put JWT_SECRET
wrangler secret put RESEND_API_KEY
```

`workers/wrangler.toml` keeps only non-secret defaults like `FRONTEND_URL` and `EMAIL_FROM`.
