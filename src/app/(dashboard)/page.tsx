"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFactionStore } from "@/stores/faction-store";
import { Loading } from "@/components/shared/loading";

export default function DashboardPage() {
  const router = useRouter();
  const { activeFactionId } = useFactionStore();

  useEffect(() => {
    if (activeFactionId) {
      router.replace(`/faction/${activeFactionId}`);
    } else {
      router.replace("/select-server");
    }
  }, [activeFactionId, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <Loading />
    </div>
  );
}
