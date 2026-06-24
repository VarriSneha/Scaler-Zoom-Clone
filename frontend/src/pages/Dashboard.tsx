import { Link } from "wouter";
import { format } from "date-fns";
import { 
  useGetDashboardSummary, 
  useGetUpcomingMeetings, 
  useGetRecentMeetings 
} from "@/lib/api-client-react";
import { Video, Calendar as CalendarIcon, PlusSquare, MonitorUp, Users, Clock, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ActionButton({ 
  icon: Icon, 
  label, 
  colorClass, 
  href 
}: { 
  icon: React.ElementType, 
  label: string, 
  colorClass: string,
  href: string 
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-0.5 ${colorClass}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: upcomingMeetings, isLoading: isLoadingUpcoming } = useGetUpcomingMeetings();
  const { data: recentMeetings, isLoading: isLoadingRecent } = useGetRecentMeetings();

  const currentTime = new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Actions & Time */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Header/Time Card */}
          <div className="bg-cover bg-center rounded-2xl p-8 text-white shadow-sm relative overflow-hidden" 
               style={{ backgroundImage: 'linear-gradient(to right, #0B5CFF, #0043C9)' }}>
            <div className="relative z-10">
              <h2 className="text-5xl font-light tracking-tight mb-2">
                {format(currentTime, 'h:mm a')}
              </h2>
              <p className="text-lg text-white/80 font-medium">
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            {/* Abstract shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-8 px-4">
            <ActionButton 
              icon={Video} 
              label="New Meeting" 
              colorClass="bg-[#F26D21]" 
              href="/meeting/new" 
            />
            <ActionButton 
              icon={PlusSquare} 
              label="Join" 
              colorClass="bg-primary" 
              href="/meeting/join" 
            />
            <ActionButton 
              icon={CalendarIcon} 
              label="Schedule" 
              colorClass="bg-primary" 
              href="/meeting/schedule" 
            />
            <ActionButton 
              icon={MonitorUp} 
              label="Share Screen" 
              colorClass="bg-primary" 
              href="/meeting/join" 
            />
          </div>

          {/* Recent Meetings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Meetings</h3>
            </div>
            
            <div className="space-y-3">
              {isLoadingRecent ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))
              ) : recentMeetings?.length ? (
                recentMeetings.map(meeting => (
                  <Card key={meeting.id} className="border-gray-100 hover:border-gray-200 transition-colors shadow-none hover:shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <span>ID: {meeting.meetingId}</span>
                          <span>•</span>
                          <span>{meeting.type === 'instant' ? 'Instant' : 'Scheduled'}</span>
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {meeting.status}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                  No recent meetings
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Upcoming & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Upcoming Meetings */}
          <Card className="border-gray-100 shadow-sm flex-1">
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Upcoming</h3>
              </div>
              
              <div className="p-4 space-y-4 min-h-[300px]">
                {isLoadingUpcoming ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))
                ) : upcomingMeetings?.length ? (
                  upcomingMeetings.map(meeting => (
                    <div key={meeting.id} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                      <div className="flex flex-col items-center justify-center min-w-[50px] text-center">
                        <span className="text-xs text-gray-500 font-medium">
                          {meeting.scheduledAt ? format(new Date(meeting.scheduledAt), 'h:mm') : '--'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {meeting.scheduledAt ? format(new Date(meeting.scheduledAt), 'a') : ''}
                        </span>
                      </div>
                      <div className="w-px bg-gray-200"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{meeting.title}</p>
                        <p className="text-xs text-gray-500 truncate">Meeting ID: {meeting.meetingId}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-32 h-32 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No upcoming meetings</p>
                    <p className="text-sm text-gray-400">Your scheduled meetings will appear here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Video className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : summary?.totalMeetings || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Participants</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : summary?.totalParticipants || 0}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
