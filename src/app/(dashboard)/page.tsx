"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useServerStore } from "@/stores/server-store";
import { Loading } from "@/components/shared/loading";

export default function DashboardPage() {
  const router = useRouter();
  const { activeServerId } = useServerStore();

  useEffect(() => {
    if (activeServerId) {
      router.replace(`/server/${activeServerId}`);
    } else {
      router.replace("/select-server");
    }
  }, [activeServerId, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <Loading />
    </div>
  );
}
