import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateInstantMeeting } from "@/lib/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Video, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function NewMeeting() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const createInstant = useCreateInstantMeeting();
  const [createdMeeting, setCreatedMeeting] = useState<any>(null);

  const handleCreate = () => {
    createInstant.mutate(undefined, {
      onSuccess: (meeting) => {
        setCreatedMeeting(meeting);
      },
      onError: () => {
        toast({
          title: "Failed to create meeting",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    });
  };

  const copyLink = () => {
    if (createdMeeting?.inviteLink) {
      navigator.clipboard.writeText(createdMeeting.inviteLink);
      toast({
        title: "Link copied!",
        description: "Meeting invite link copied to clipboard.",
      });
    }
  };

  const startMeeting = () => {
    if (createdMeeting?.meetingId) {
      setLocation(`/meeting/${createdMeeting.meetingId}`);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center flex-1 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-6 border-b border-gray-100">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">New Instant Meeting</CardTitle>
            <CardDescription className="text-base mt-2">
              Start a meeting instantly and invite others.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {!createdMeeting ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-gray-600 mb-6">
                  Click below to generate a new meeting room instantly. You'll be able to copy the invite link before joining.
                </p>
                <Button 
                  onClick={handleCreate} 
                  disabled={createInstant.isPending}
                  size="lg"
                  className="w-full text-base font-semibold"
                >
                  {createInstant.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</>
                  ) : (
                    "Generate Meeting"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Meeting ID</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-lg font-mono tracking-widest text-center text-gray-900 font-semibold">
                    {createdMeeting.meetingId}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Invite Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate">
                      {createdMeeting.inviteLink}
                    </div>
                    <Button variant="outline" onClick={copyLink} className="shrink-0" data-testid="button-copy-link">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {createdMeeting && (
            <CardFooter className="bg-gray-50 rounded-b-xl p-6 border-t border-gray-100">
              <Button onClick={startMeeting} size="lg" className="w-full text-base font-semibold">
                Start Meeting <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
