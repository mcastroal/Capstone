# NakPath — Muay Thai Training Tracker (Capstone)

## Overview
NakPath is a web app that helps Muay Thai fighters track their training history and get AI-generated guidance. Coaches can manage their fighter roster, leave feedback on individual sessions, and generate structured training plans based on the fighters’ logged sessions.

## Roles
- **Fighter**: logs training sessions, links to a coach using a coach code, reads coach feedback, and generates **their own** AI insights.
- **Coach (Admin)**: views all linked fighters’ sessions, adds coach comments, logs group sessions for selected fighters, and generates **training plans** for fighters using AI.

## Key Features
- Training session logging (date, duration, technique/focus multi-select, intensity, notes).
- Coach roster & linking via **coach code**.
- Coach comments per training session (with unread indicator for fighters).
- Coach group session creation (coach selects which fighters are included).
- AI Insights:
  - **Fighters**: analyzes their full session history and provides future training suggestions on `/insights`.
  - **Coaches**: generates a coaching plan from up to 40 sessions in the current view/filter on `/coach/insights`.
- Quick search for past sessions (sidebar + inside the past-sessions panel stay in sync).

## Tech Stack
- Next.js (App Router) + React
- Tailwind CSS
- MySQL (via `mysql2`)
- JWT auth
- OpenAI API for AI insights

## Pages / Routes (high level)
- Public:
  - `/` (Home)
  - `/login`
  - `/register`
- Fighter (dashboard):
  - `/dashboard` (dashboard home)
  - `/dashboard/log-session`
  - `/dashboard/history`
  - `/insights` (fighter AI insights)
- Coach:
  - `/coach` (fighter roster + session log + coach comments)
  - `/coach/log-session` (coach logs a group session for selected fighters)
  - `/coach/students` (manage linked fighters)
  - `/coach/insights` (coach AI training plans)

## Environment Variables
Create a `.env.local` file (do **not** commit it) with:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `OPENAI_API_KEY`

## Database Requirements
At minimum, your database must include:
- A `users` table with:
  - `id`, `role` (`fighter` or `coach`), `coach_code`, and standard user fields (`first_name`, `last_name`, `email`, `password`).
- A `training_sessions` table with:
  - `id`, `user_id`, `session_date`, `duration_minutes`, `session_type`, `intensity`, `notes`
  - `coach_notes` and `coach_notes_unread` (used to show coach feedback and “new comment” badges)
  - `created_at`

If you see runtime errors mentioning missing `coach_notes`, ensure the schema includes those coach-comment columns.

## Local Setup
1. Install dependencies:
   - `npm install`
2. Configure `.env.local` (see above).
3. Start the dev server:
   - `npm run dev`
4. Open:
   - `http://localhost:3000`

## Build (Production)
- `npm run build`
- `npm start`

## Deploying to Vercel
1. Connect your GitHub repo.
2. Set the same environment variables (`DB_*`, `JWT_SECRET`, `OPENAI_API_KEY`) in Vercel.
3. For Vercel + Next.js, you typically **do not** need to set an output directory (leave it blank).

## Notes
AI responses are generated from your stored training log and may be inaccurate; use them as suggestions alongside real coaching judgment.