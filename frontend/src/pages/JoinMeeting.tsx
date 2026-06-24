import { useState } from "react";
import { useLocation } from "wouter";
import { useJoinMeeting } from "@/lib/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Users, Loader2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const schema = z.object({
  meetingId: z.string().min(1, "Meeting ID is required"),
  displayName: z.string().min(1, "Display name is required"),
});

type FormValues = z.infer<typeof schema>;

export default function JoinMeeting() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const joinMeeting = useJoinMeeting();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { meetingId: "", displayName: "John Doe" },
  });

  const onSubmit = (values: FormValues) => {
    joinMeeting.mutate(
      { data: { meetingId: values.meetingId, displayName: values.displayName } },
      {
        onSuccess: (meeting) => {
          setLocation(`/meeting/${meeting.meetingId}`);
        },
        onError: () => {
          toast({
            title: "Meeting not found",
            description: "Please check the meeting ID and try again.",
            variant: "destructive",
          });
        },
      }
    );
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
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Join a Meeting</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter a meeting ID or invite link to join.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="meetingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Meeting ID or Link
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="abc-defg-hij"
                          className="h-11 text-base font-mono tracking-wider"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Your Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your display name"
                          className="h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-semibold mt-2"
                  disabled={joinMeeting.isPending}
                >
                  {joinMeeting.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Join Meeting
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
