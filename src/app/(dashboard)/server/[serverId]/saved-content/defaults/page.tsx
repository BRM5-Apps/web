"use client";

import { useParams } from "next/navigation";
import { DefaultsTabContent } from "@/components/defaults/defaults-tab-content";

export default function DefaultMessagesPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId;

  return <DefaultsTabContent serverId={serverId} showHeading />;
}