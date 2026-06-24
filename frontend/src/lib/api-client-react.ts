import { useMutation, useQuery } from "@tanstack/react-query";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Meeting {
  id: number; meetingId: string; title: string; description?: string;
  type: string; status: string; hostName: string; inviteLink: string;
  scheduledAt?: string; duration?: number; participantCount: number; createdAt: string;
}
export interface DashboardSummary {
  totalMeetings: number; upcomingCount: number; recentCount: number; totalParticipants: number;
}

export const getListMeetingsQueryKey = () => ["listMeetings"] as const;
export const getGetDashboardSummaryQueryKey = () => ["dashboardSummary"] as const;
export const getGetUpcomingMeetingsQueryKey = () => ["upcomingMeetings"] as const;
export const getGetRecentMeetingsQueryKey = () => ["recentMeetings"] as const;
export const getGetMeetingQueryKey = (id: string) => ["meeting", id] as const;

export function useGetDashboardSummary() {
  return useQuery<DashboardSummary>({ queryKey: getGetDashboardSummaryQueryKey(), queryFn: () => apiFetch("/api/dashboard/summary") });
}
export function useGetUpcomingMeetings() {
  return useQuery<Meeting[]>({ queryKey: getGetUpcomingMeetingsQueryKey(), queryFn: () => apiFetch("/api/meetings/upcoming") });
}
export function useGetRecentMeetings() {
  return useQuery<Meeting[]>({ queryKey: getGetRecentMeetingsQueryKey(), queryFn: () => apiFetch("/api/meetings/recent") });
}
export function useGetMeeting(meetingId: string, options?: { query?: { queryKey?: readonly unknown[]; refetchInterval?: number } }) {
  return useQuery<Meeting>({
    queryKey: options?.query?.queryKey ?? getGetMeetingQueryKey(meetingId),
    queryFn: () => apiFetch(`/api/meetings/${meetingId}`),
    refetchInterval: options?.query?.refetchInterval,
  });
}
export function useCreateMeeting() {
  return useMutation<Meeting, Error, { data: { title: string; description?: string; type: string; scheduledAt?: string; duration?: number } }>({
    mutationFn: ({ data }) => apiFetch("/api/meetings", { method: "POST", body: JSON.stringify(data) }),
  });
}
export function useCreateInstantMeeting() {
  return useMutation<Meeting, Error, undefined>({
    mutationFn: () => apiFetch("/api/meetings/instant", { method: "POST" }),
  });
}
export function useJoinMeeting() {
  return useMutation<Meeting, Error, { data: { meetingId: string; displayName: string } }>({
    mutationFn: ({ data }) => apiFetch("/api/meetings/join", { method: "POST", body: JSON.stringify(data) }),
  });
}
export function useDeleteMeeting() {
  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) => apiFetch(`/api/meetings/${id}`, { method: "DELETE" }),
  });
}
