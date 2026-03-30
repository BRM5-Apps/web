import { redirect } from "next/navigation";

export default async function SchedulePage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  redirect(`/server/${serverId}/automations`);
}