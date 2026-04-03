# CODEX Backend

Production-style API backend for CODEX Materials.

## Features
- JWT authentication (signup/login/me)
- Role-based access (`student`, `admin`)
- Secure password hashing (`bcrypt`)
- File-backed JSON persistence (no native build tools required)
- Input validation (`zod`)
- Security middleware (`helmet`, CORS, rate limit)
- Materials API with filter/sort/pagination

## Setup
1. Open terminal in `backend`
2. Install dependencies:
   - `npm install`
3. Create env file:
   - Copy `.env.example` to `.env`
4. Run in dev mode:
   - `npm run dev`

## API
Base URL: `http://localhost:4000`

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/materials`
- `POST /api/materials` (admin)
- `PUT /api/materials/:id` (admin)
- `DELETE /api/materials/:id` (admin)

## Notes
- On first startup, an admin user is auto-created from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Connect your existing frontend pages to this API for real backend authentication and material management.
