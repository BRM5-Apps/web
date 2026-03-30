"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText } from "lucide-react";
import { useModalTemplates, useDeleteModalTemplate } from "@/hooks/use-templates";
import { useToast } from "@/hooks/use-toast";

export default function ModalsPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const { toast } = useToast();

  const { data: modals, isLoading } = useModalTemplates(serverId);
  const deleteModal = useDeleteModalTemplate(serverId);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteModal.mutateAsync(id);
      toast({ title: "Modal deleted" });
    } catch {
      toast({ title: "Failed to delete modal", variant: "destructive" });
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f1f1f2]">Modals</h1>
          <p className="text-sm text-[#b5bac1]">
            Discord forms that can be triggered by commands or actions
          </p>
        </div>
        <Link href={`./modal-builder`}>
          <Button className="bg-[#5865F2] hover:bg-[#4752C4]">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Modal
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </Card>
          ))}
        </div>
      ) : modals && modals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modals.map((modal) => {
            const fieldCount = (modal.template_data as any)?.pages?.reduce(
              (acc: number, p: any) => acc + (p.components?.length ?? 0),
              0
            ) ?? 0;

            return (
              <Card
                key={modal.id}
                className="group relative p-4 hover:border-[#5865F2]/50 transition-colors"
              >
                <Link href={`./modal-builder/${modal.id}`} className="block">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/20">
                      <FileText className="h-5 w-5 text-[#5865F2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{modal.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {fieldCount} field{fieldCount !== 1 ? "s" : ""} • {formatDate(modal.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => handleDelete(modal.id, modal.name)}
                  className="absolute right-2 top-2 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#3f4147] border-dashed py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#5865F2]/20">
            <FileText className="h-6 w-6 text-[#5865F2]" />
          </div>
          <h3 className="font-medium text-[#f1f1f2]">No modals yet</h3>
          <p className="mt-1 text-sm text-[#b5bac1] max-w-xs">
            Create Discord forms that users can fill out via commands or actions.
          </p>
          <Link href={`./modal-builder`} className="mt-4">
            <Button className="bg-[#5865F2] hover:bg-[#4752C4]">
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first modal
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}