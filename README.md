# Extensio.ai - No-Code Extension Factory

Full MERN stack platform for generating production-ready Chrome extensions from plain-language prompts.

## Stack

- Backend: Node.js, Express, MongoDB, JWT, Archiver, Stripe (subscription hooks)
- Frontend: React (Vite), React Router
- AI flow: Structured prompt strategy + strict JSON response parsing

## Core Features Implemented

- User auth (register/login with JWT)
- Project management (create, list, open projects)
- Version history (every generation stored as a version)
- AI generation endpoint returning strict file map JSON
- Secure auto-packaging workflow:
  - Parse `files` JSON
  - Write files to temp workspace
  - Zip using `archiver`
  - Serve immediate downloadable zip URL
- Basic access gating for advanced features
- Security controls:
  - File name/path sanitization
  - Script/pattern blocking
  - Manifest permission audit and Manifest V3 enforcement
  - Payload size checks
  - Block/allow response for unsafe generated code

## Project Structure

- `backend/` modular Express API (config, models, routes, services)
- `frontend/` React dashboard and builder UI

## Quick Start

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

## Run in VS Code

1. Open `e:\Ai project` in VS Code.
2. Open terminal and run:
   - `npm run install:all`
3. Use one of these options:
   - **Terminal**: `npm run dev:backend` and `npm run dev:frontend`
   - **VS Code Tasks**: run task `Run Full Stack`
   - **Run and Debug**: launch compound `Run Full Stack + Open Browser`

### Notes

- If MongoDB is unavailable, backend auto-runs in in-memory fallback mode.
- Registration and generation still work in fallback mode, but data resets on backend restart.

## Environment Variables

See `backend/.env.example`.

For real AI generation, set:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4o-mini`)

If API key is absent, backend uses a deterministic fallback extension generator.

For billing checkout hooks, set:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `APP_URL`
- `API_URL`

## Week-Wise Plan Mapping

- Week 1: Prompt engineering and strict JSON parser (`promptService`, `llmService`)
- Week 2: File system + zip pipeline (`extensionService`)
- Week 3: Platform UI + iterations + project versions (`projectRoutes`, React dashboard)
- Week 4: Security hardening + billing hooks (`securityService`, `billingRoutes`)
