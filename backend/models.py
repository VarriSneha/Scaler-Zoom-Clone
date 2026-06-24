from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Meeting(BaseModel):
    id: int
    meetingId: str
    title: str
    description: Optional[str] = None
    type: str
    status: str
    hostName: str
    inviteLink: str
    scheduledAt: Optional[str] = None
    duration: Optional[int] = None
    participantCount: int
    createdAt: str


class MeetingInput(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    hostName: Optional[str] = "John Doe"
    scheduledAt: Optional[str] = None
    duration: Optional[int] = None


class JoinMeetingInput(BaseModel):
    meetingId: str
    displayName: str


class DashboardSummary(BaseModel):
    totalMeetings: int
    upcomingCount: int
    recentCount: int
    totalParticipants: int


class ErrorResponse(BaseModel):
    error: str
