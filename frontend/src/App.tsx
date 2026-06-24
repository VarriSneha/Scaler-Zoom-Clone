import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import NewMeeting from "@/pages/NewMeeting";
import JoinMeeting from "@/pages/JoinMeeting";
import ScheduleMeeting from "@/pages/ScheduleMeeting";
import MeetingRoom from "@/pages/MeetingRoom";
import PageLayout from "@/components/layout/PageLayout";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PageLayout><Dashboard /></PageLayout>} />
      <Route path="/meeting/new" component={() => <PageLayout><NewMeeting /></PageLayout>} />
      <Route path="/meeting/join" component={() => <PageLayout><JoinMeeting /></PageLayout>} />
      <Route path="/meeting/schedule" component={() => <PageLayout><ScheduleMeeting /></PageLayout>} />
      <Route path="/meeting/:meetingId" component={MeetingRoom} />
      <Route component={() => <PageLayout><NotFound /></PageLayout>} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
