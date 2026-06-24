import random
import string
from datetime import datetime, timedelta
from database import get_db, init_db


def generate_meeting_id():
    chars = string.ascii_lowercase
    part1 = ''.join(random.choices(chars, k=3))
    part2 = ''.join(random.choices(chars, k=4))
    part3 = ''.join(random.choices(chars, k=3))
    return f"{part1}-{part2}-{part3}"


def seed():
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    existing = cursor.execute("SELECT COUNT(*) FROM meetings").fetchone()[0]
    if existing > 0:
        conn.close()
        return

    base_url = "http://localhost"

    now = datetime.utcnow()

    meetings = [
        {
            "meeting_id": "abc-defg-hij",
            "title": "Weekly Team Standup",
            "description": "Daily sync for the engineering team",
            "type": "scheduled",
            "status": "ended",
            "host_name": "John Doe",
            "scheduled_at": (now - timedelta(hours=2)).isoformat(),
            "duration": 30,
            "participant_count": 8,
            "created_at": (now - timedelta(days=1)).isoformat(),
        },
        {
            "meeting_id": "xyz-uvwx-lmn",
            "title": "Product Review Q2",
            "description": "Quarterly product roadmap review with stakeholders",
            "type": "scheduled",
            "status": "ended",
            "host_name": "John Doe",
            "scheduled_at": (now - timedelta(hours=5)).isoformat(),
            "duration": 60,
            "participant_count": 15,
            "created_at": (now - timedelta(days=2)).isoformat(),
        },
        {
            "meeting_id": "pqr-stuv-wxy",
            "title": "Design Sprint Planning",
            "description": "Sprint planning and design review session",
            "type": "scheduled",
            "status": "waiting",
            "host_name": "John Doe",
            "scheduled_at": (now + timedelta(hours=2)).isoformat(),
            "duration": 45,
            "participant_count": 0,
            "created_at": now.isoformat(),
        },
        {
            "meeting_id": "klm-nopq-rst",
            "title": "Client Demo - Acme Corp",
            "description": "Product demonstration for Acme Corp sales call",
            "type": "scheduled",
            "status": "waiting",
            "host_name": "John Doe",
            "scheduled_at": (now + timedelta(days=1)).isoformat(),
            "duration": 60,
            "participant_count": 0,
            "created_at": now.isoformat(),
        },
        {
            "meeting_id": "ijk-lmno-pqr",
            "title": "Instant Meeting",
            "description": None,
            "type": "instant",
            "status": "ended",
            "host_name": "John Doe",
            "scheduled_at": None,
            "duration": None,
            "participant_count": 3,
            "created_at": (now - timedelta(hours=1)).isoformat(),
        },
    ]

    for m in meetings:
        mid = m["meeting_id"]
        invite_link = f"https://zoom-clone.replit.app/meeting/{mid}"
        cursor.execute(
            """INSERT OR IGNORE INTO meetings
               (meeting_id, title, description, type, status, host_name, invite_link,
                scheduled_at, duration, participant_count, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (mid, m["title"], m["description"], m["type"], m["status"],
             m["host_name"], invite_link, m["scheduled_at"], m["duration"],
             m["participant_count"], m["created_at"])
        )

    conn.commit()
    conn.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    seed()
