import { useLocation, useParams } from "wouter";
import { useGetMeeting, getGetMeetingQueryKey, useDeleteMeeting, getListMeetingsQueryKey, getGetRecentMeetingsQueryKey, getGetDashboardSummaryQueryKey } from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MessageSquare,
  Users, MoreVertical, Phone, Copy, Shield
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

function ControlButton({
  icon: Icon,
  label,
  active = true,
  variant = "default",
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  variant?: "default" | "danger";
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all group ${
        variant === "danger"
          ? "hover:bg-red-500/20"
          : active
          ? "hover:bg-white/10"
          : "hover:bg-white/10"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          variant === "danger"
            ? "bg-red-500 group-hover:bg-red-600"
            : active
            ? "bg-white/10 group-hover:bg-white/20"
            : "bg-white/10 group-hover:bg-white/20"
        }`}
      >
        <Icon className={`w-5 h-5 ${variant === "danger" ? "text-white" : active ? "text-white" : "text-white/50"}`} />
      </div>
      <span className={`text-xs font-medium ${active ? "text-white/80" : "text-white/40"}`}>{label}</span>
    </button>
  );
}

export default function MeetingRoom() {
  const params = useParams<{ meetingId: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const { data: meeting, isLoading } = useGetMeeting(params.meetingId, {
    query: {
      queryKey: getGetMeetingQueryKey(params.meetingId),
      refetchInterval: 3000,
    },
  });

  const deleteMeeting = useDeleteMeeting();

  const copyInviteLink = () => {
    if (meeting?.inviteLink) {
      navigator.clipboard.writeText(meeting.inviteLink);
      toast({ title: "Invite link copied!", description: "Share it with participants." });
    }
  };

  const endMeeting = () => {
    if (!meeting?.meetingId) return;
    deleteMeeting.mutate(
      { id: meeting.meetingId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRecentMeetingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListMeetingsQueryKey() });
          toast({ title: "Meeting ended" });
          setLocation("/");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <Skeleton className="h-8 w-64 bg-white/10 mx-auto" />
          <Skeleton className="h-4 w-48 bg-white/10 mx-auto" />
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl font-semibold mb-2">Meeting not found</p>
          <p className="text-white/60 mb-6">The meeting ID may be invalid or the meeting has ended.</p>
          <Button onClick={() => setLocation("/")} variant="outline" className="text-white border-white/30 hover:bg-white/10">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const participants = Math.max(1, meeting.participantCount);

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex flex-col select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#2D2D2D] border-b border-white/5">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-white font-semibold text-sm">{meeting.title}</p>
            <p className="text-white/50 text-xs font-mono">{meeting.meetingId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Invite Link
          </button>
          <div className="text-white/50 text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{participants} participant{participants !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className={`grid gap-4 w-full h-full max-w-5xl max-h-[calc(100vh-200px)] ${
          participants <= 1 ? "grid-cols-1" :
          participants <= 2 ? "grid-cols-2" :
          participants <= 4 ? "grid-cols-2" :
          "grid-cols-3"
        }`}>
          {/* Host tile (always shown) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[#3D3D3D] rounded-2xl overflow-hidden flex items-center justify-center aspect-video border border-white/5"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">
                JD
              </div>
              <span className="text-white/80 text-sm font-medium">John Doe (Host)</span>
            </div>
            {!camOn && (
              <div className="absolute inset-0 bg-[#3D3D3D] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white mb-2">
                  JD
                </div>
                <span className="text-white/60 text-xs">Camera off</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-lg">
              {micOn ? (
                <Mic className="w-3 h-3 text-white" />
              ) : (
                <MicOff className="w-3 h-3 text-red-400" />
              )}
              <span className="text-white text-xs font-medium">John Doe</span>
            </div>
          </motion.div>

          {/* Additional participant tiles from seeded data */}
          {Array.from({ length: Math.min(participants - 1, 5) }).map((_, i) => {
            const names = ["Alice Chen", "Bob Smith", "Carol White", "David Lee", "Eve Johnson"];
            const initials = ["AC", "BS", "CW", "DL", "EJ"];
            const colors = ["bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i + 1) * 0.1 }}
                className="relative bg-[#3D3D3D] rounded-2xl overflow-hidden flex items-center justify-center aspect-video border border-white/5"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full ${colors[i]} flex items-center justify-center text-xl font-bold text-white`}>
                    {initials[i]}
                  </div>
                  <span className="text-white/80 text-sm font-medium">{names[i]}</span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-lg">
                  <Mic className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-medium">{names[i]}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-[#2D2D2D] border-t border-white/5 px-6 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          {/* Left: Security badge */}
          <div className="flex items-center gap-2 text-white/40 text-xs min-w-[150px]">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400">Encrypted</span>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-2">
            <ControlButton
              icon={micOn ? Mic : MicOff}
              label={micOn ? "Mute" : "Unmute"}
              active={micOn}
              onClick={() => setMicOn(!micOn)}
            />
            <ControlButton
              icon={camOn ? Video : VideoOff}
              label={camOn ? "Stop Video" : "Start Video"}
              active={camOn}
              onClick={() => setCamOn(!camOn)}
            />
            <ControlButton icon={Monitor} label="Share Screen" />
            <ControlButton icon={MessageSquare} label="Chat" />
            <ControlButton icon={Users} label="Participants" />
            <ControlButton icon={MoreVertical} label="More" />
            <div className="w-px h-8 bg-white/10 mx-2" />
            <ControlButton
              icon={Phone}
              label="End"
              variant="danger"
              onClick={endMeeting}
            />
          </div>

          {/* Right: Spacer */}
          <div className="min-w-[150px]" />
        </div>
      </div>
    </div>
  );
}
