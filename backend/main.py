import os
import sys
import random
import string
from datetime import datetime, timedelta
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

sys.path.insert(0, str(Path(__file__).parent))

from database import get_db, init_db
from models import Meeting, MeetingInput, JoinMeetingInput, DashboardSummary, ErrorResponse
from seed import seed

app = FastAPI(title="Zoom Clone API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_meeting_id() -> str:
    chars = string.ascii_lowercase
    part1 = "".join(random.choices(chars, k=3))
    part2 = "".join(random.choices(chars, k=4))
    part3 = "".join(random.choices(chars, k=3))
    return f"{part1}-{part2}-{part3}"


def row_to_meeting(row) -> dict:
    return {
        "id": row["id"],
        "meetingId": row["meeting_id"],
        "title": row["title"],
        "description": row["description"],
        "type": row["type"],
        "status": row["status"],
        "hostName": row["host_name"],
        "inviteLink": row["invite_link"],
        "scheduledAt": row["scheduled_at"],
        "duration": row["duration"],
        "participantCount": row["participant_count"],
        "createdAt": row["created_at"],
    }


def get_invite_link(meeting_id: str) -> str:
    domains = os.environ.get("REPLIT_DOMAINS", "")
    if domains:
        domain = domains.split(",")[0].strip()
        return f"https://{domain}/meeting/{meeting_id}"
    return f"http://localhost/meeting/{meeting_id}"


@app.on_event("startup")
def startup_event():
    init_db()
    seed()


@app.get("/api/healthz")
def health_check():
    return {"status": "ok"}


@app.get("/api/meetings", response_model=List[Meeting])
def list_meetings():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM meetings ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [row_to_meeting(r) for r in rows]


@app.post("/api/meetings", response_model=Meeting, status_code=201)
def create_meeting(body: MeetingInput):
    meeting_id = generate_meeting_id()
    invite_link = get_invite_link(meeting_id)
    host_name = body.hostName or "John Doe"
    now = datetime.utcnow().isoformat()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO meetings
           (meeting_id, title, description, type, status, host_name, invite_link,
            scheduled_at, duration, participant_count, created_at)
           VALUES (?, ?, ?, ?, 'waiting', ?, ?, ?, ?, 0, ?)""",
        (meeting_id, body.title, body.description, body.type,
         host_name, invite_link, body.scheduledAt, body.duration, now)
    )
    row_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM meetings WHERE id = ?", (row_id,)).fetchone()
    conn.close()
    return row_to_meeting(row)


@app.post("/api/meetings/instant", response_model=Meeting, status_code=201)
def create_instant_meeting():
    meeting_id = generate_meeting_id()
    invite_link = get_invite_link(meeting_id)
    now = datetime.utcnow().isoformat()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO meetings
           (meeting_id, title, description, type, status, host_name, invite_link,
            scheduled_at, duration, participant_count, created_at)
           VALUES (?, 'Instant Meeting', NULL, 'instant', 'active', 'John Doe', ?,
                   NULL, NULL, 1, ?)""",
        (meeting_id, invite_link, now)
    )
    row_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM meetings WHERE id = ?", (row_id,)).fetchone()
    conn.close()
    return row_to_meeting(row)


@app.get("/api/meetings/upcoming", response_model=List[Meeting])
def get_upcoming_meetings():
    now = datetime.utcnow().isoformat()
    conn = get_db()
    rows = conn.execute(
        """SELECT * FROM meetings
           WHERE type = 'scheduled' AND status = 'waiting'
           AND scheduled_at >= ?
           ORDER BY scheduled_at ASC""",
        (now,)
    ).fetchall()
    conn.close()
    return [row_to_meeting(r) for r in rows]


@app.get("/api/meetings/recent", response_model=List[Meeting])
def get_recent_meetings():
    conn = get_db()
    rows = conn.execute(
        """SELECT * FROM meetings
           WHERE status IN ('ended', 'active')
           ORDER BY created_at DESC
           LIMIT 10"""
    ).fetchall()
    conn.close()
    return [row_to_meeting(r) for r in rows]


@app.post("/api/meetings/join", response_model=Meeting)
def join_meeting(body: JoinMeetingInput):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM meetings WHERE meeting_id = ?", (body.meetingId,)
    ).fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Meeting not found")

    conn.execute(
        "UPDATE meetings SET participant_count = participant_count + 1, status = 'active' WHERE meeting_id = ?",
        (body.meetingId,)
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM meetings WHERE meeting_id = ?", (body.meetingId,)
    ).fetchone()
    conn.close()
    return row_to_meeting(row)


@app.get("/api/meetings/{meeting_id_str}", response_model=Meeting)
def get_meeting(meeting_id_str: str):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM meetings WHERE meeting_id = ?", (meeting_id_str,)
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return row_to_meeting(row)


@app.delete("/api/meetings/{meeting_id_str}", status_code=204)
def delete_meeting(meeting_id_str: str):
    conn = get_db()
    result = conn.execute(
        "DELETE FROM meetings WHERE meeting_id = ?", (meeting_id_str,)
    )
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")


@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    now = datetime.utcnow().isoformat()
    conn = get_db()

    total = conn.execute("SELECT COUNT(*) FROM meetings").fetchone()[0]
    upcoming = conn.execute(
        "SELECT COUNT(*) FROM meetings WHERE type='scheduled' AND status='waiting' AND scheduled_at >= ?",
        (now,)
    ).fetchone()[0]
    recent = conn.execute(
        "SELECT COUNT(*) FROM meetings WHERE status IN ('ended', 'active')"
    ).fetchone()[0]
    total_participants = conn.execute(
        "SELECT COALESCE(SUM(participant_count), 0) FROM meetings"
    ).fetchone()[0]

    conn.close()
    return {
        "totalMeetings": total,
        "upcomingCount": upcoming,
        "recentCount": recent,
        "totalParticipants": total_participants,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
