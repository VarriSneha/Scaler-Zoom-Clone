# Zoom Clone - Video Conferencing Platform

A functional video conferencing web application that replicates Zoom's design, user experience, and core meeting workflows.

## Tech Stack

- **Frontend**: React + Vite (TypeScript, Tailwind CSS, shadcn/ui)
- **Backend**: Python 3.11 with FastAPI
- **Database**: SQLite (via Python's built-in `sqlite3` module)
- **State Management**: TanStack React Query
- **Routing**: Wouter (client-side SPA routing)

## Features

### Core Features

1. **Landing Dashboard**
   - Clean Zoom-style UI with professional navbar
   - Profile/settings placeholder in navbar
   - Action buttons: New Meeting, Join Meeting, Schedule Meeting
   - Upcoming meetings section (scheduled future meetings)
   - Recent meetings section (past/active meetings)
   - Dashboard summary stats

2. **Instant Meeting Creation**
   - Creates a meeting instantly with one click
   - Generates unique Meeting ID (format: `abc-defg-hij`)
   - Generates shareable invite link
   - Redirects user to meeting room

3. **Join Meeting**
   - Join using Meeting ID or invite link
   - Enter display name before joining
   - Validates meeting existence via API

4. **Schedule Meetings**
   - Title and description
   - Date & Time picker
   - Duration selector (in minutes)
   - Auto-generates meeting link
   - Stored in SQLite database
   - Shows in Upcoming Meetings section

### Bonus Features
- Responsive design (mobile, tablet, desktop)
- Meeting room page with participant view and controls
- Host controls placeholder (mute all, remove participant)

## Database Schema

```sql
CREATE TABLE meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id TEXT UNIQUE NOT NULL,        -- e.g. "abc-defg-hij"
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,                     -- 'instant' | 'scheduled'
    status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting' | 'active' | 'ended'
    host_name TEXT NOT NULL DEFAULT 'John Doe',
    invite_link TEXT NOT NULL,
    scheduled_at TEXT,                      -- ISO 8601 datetime
    duration INTEGER,                       -- minutes
    participant_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.11+

### Backend Setup

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run the backend (default port 8080)
python3 backend/main.py
```

The backend will automatically:
- Initialize the SQLite database (`backend/zoom_clone.db`)
- Seed sample meeting data on first run

### Frontend Setup

```bash
# Install Node.js dependencies
pnpm install

# Run the frontend dev server
pnpm --filter @workspace/zoom-clone run dev
```

### Full Stack (Development)

```bash
# Terminal 1: Start backend
PORT=8080 python3 backend/main.py

# Terminal 2: Start frontend
pnpm --filter @workspace/zoom-clone run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/meetings` | List all meetings |
| POST | `/api/meetings` | Create a meeting (instant or scheduled) |
| POST | `/api/meetings/instant` | Create an instant meeting |
| GET | `/api/meetings/upcoming` | Get upcoming scheduled meetings |
| GET | `/api/meetings/recent` | Get recent/past meetings |
| POST | `/api/meetings/join` | Join a meeting by ID and display name |
| GET | `/api/meetings/{meeting_id}` | Get a specific meeting |
| DELETE | `/api/meetings/{meeting_id}` | Delete a meeting |
| GET | `/api/dashboard/summary` | Get dashboard statistics |

## Assumptions

1. **No login required**: A default user "John Doe" is assumed to be logged in at all times.
2. **SQLite for portability**: SQLite was chosen for simplicity and zero-configuration deployment.
3. **Meeting IDs**: Generated as 3-part lowercase strings (e.g., `abc-defg-hij`) to mimic Zoom's format.
4. **Invite links**: Auto-generated based on the deployment domain.
5. **Video streaming**: Not implemented (WebRTC integration is out of scope); meeting rooms show UI placeholders.
6. **Sample data**: 5 meetings are seeded on first run to demonstrate all features.

## Project Structure

```
.
├── backend/                 # Python FastAPI backend
│   ├── main.py             # FastAPI application & all routes
│   ├── database.py         # SQLite connection & schema init
│   ├── models.py           # Pydantic models
│   ├── seed.py             # Sample data seeder
│   └── requirements.txt    # Python dependencies
├── artifacts/
│   └── zoom-clone/         # React + Vite frontend
│       └── src/
│           ├── pages/      # Dashboard, Meeting, Join, Schedule pages
│           └── components/ # Reusable UI components
└── lib/
    └── api-spec/
        └── openapi.yaml    # OpenAPI 3.1 spec (source of truth)
```

## Deployment

The application is deployed at: [Replit Deployment]

- Frontend is built as a static SPA served via Vite
- Backend runs as a Python FastAPI service via Uvicorn


## Deploy for Free

### Step 1 — Backend on Render
1. Go to [render.com](https://render.com) → sign up with GitHub
2. New → Web Service → connect `VarriSneha/Scaler-Zoom-Clone`
3. Root Directory: `backend` | Build: `pip install -r requirements.txt` | Start: `python main.py`
4. Deploy → copy the URL, e.g. `https://scaler-zoom-clone-api.onrender.com`

### Step 2 — Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. New Project → import `VarriSneha/Scaler-Zoom-Clone`
3. Root Directory: `frontend`
4. Add env variable: `VITE_API_URL` = your Render URL from Step 1
5. Deploy → your permanent link is ready!
