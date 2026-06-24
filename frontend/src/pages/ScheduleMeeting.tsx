import { useLocation } from "wouter";
import { useCreateMeeting, getGetUpcomingMeetingsQueryKey, getGetDashboardSummaryQueryKey, getListMeetingsQueryKey } from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, "Date and time are required"),
  duration: z.string().min(1, "Duration is required"),
});

type FormValues = z.infer<typeof schema>;

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

export default function ScheduleMeeting() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMeeting = useCreateMeeting();

  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const defaultDateTime = now.toISOString().slice(0, 16);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      scheduledAt: defaultDateTime,
      duration: "60",
    },
  });

  const onSubmit = (values: FormValues) => {
    createMeeting.mutate(
      {
        data: {
          title: values.title,
          description: values.description || undefined,
          type: "scheduled",
          scheduledAt: new Date(values.scheduledAt).toISOString(),
          duration: parseInt(values.duration),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUpcomingMeetingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListMeetingsQueryKey() });
          toast({
            title: "Meeting scheduled",
            description: "Your meeting has been scheduled successfully.",
          });
          setLocation("/");
        },
        onError: () => {
          toast({
            title: "Failed to schedule meeting",
            description: "Please try again.",
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
        className="w-full max-w-lg"
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-6 border-b border-gray-100">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Schedule a Meeting</CardTitle>
            <CardDescription className="text-base mt-2">
              Set up a meeting in advance and share the invite link.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" id="schedule-form">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Meeting Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Weekly Team Standup" className="h-11 text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add a description for your meeting..."
                          className="resize-none text-base"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel className="text-sm font-medium text-gray-700">Date & Time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            className="h-11 text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel className="text-sm font-medium text-gray-700">Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 text-base">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DURATION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="bg-gray-50 rounded-b-xl p-6 border-t border-gray-100">
            <Button
              type="submit"
              form="schedule-form"
              size="lg"
              className="w-full text-base font-semibold"
              disabled={createMeeting.isPending}
            >
              {createMeeting.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Schedule Meeting
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
