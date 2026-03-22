"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useEventRequests,
  useApproveEventRequest,
  useDenyEventRequest,
} from "@/hooks/use-event-requests";
import type { EventRequest } from "@/types/event";

const STATUS_BADGE_CLASSES: Record<EventRequest["status"], string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  denied: "bg-red-500/15 text-red-400 border-red-500/30",
};

function StatusBadge({ status }: { status: EventRequest["status"] }) {
  return (
    <Badge variant="outline" className={STATUS_BADGE_CLASSES[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

interface EventRequestsTableProps {
  requests: EventRequest[];
  serverId: string;
  showActions: boolean;
}

function EventRequestsTable({
  requests,
  serverId,
  showActions,
}: EventRequestsTableProps) {
  const approve = useApproveEventRequest(serverId);
  const deny = useDenyEventRequest(serverId);

  if (requests.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No event requests found.
      </p>
    );
  }

  return (
    <Table aria-label="Event requests">
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="hidden sm:table-cell">Description</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.title}</TableCell>
            <TableCell className="hidden max-w-[200px] truncate sm:table-cell">
              {request.description ?? "-"}
            </TableCell>
            <TableCell>{request.requestedById}</TableCell>
            <TableCell className="hidden md:table-cell">
              {format(new Date(request.createdAt), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <StatusBadge status={request.status} />
            </TableCell>
            {showActions && (
              <TableCell className="text-right">
                {request.status === "pending" && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-400 border-emerald-500/30"
                      disabled={approve.isPending}
                      onClick={() => approve.mutate(request.id)}
                      aria-label={`Approve request: ${request.title}`}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-500/30"
                      disabled={deny.isPending}
                      onClick={() =>
                        deny.mutate(request.id)
                      }
                      aria-label={`Deny request: ${request.title}`}
                    >
                      Deny
                    </Button>
                  </div>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function EventRequestsPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const { data: requests, isLoading, isError, error, refetch } =
    useEventRequests(serverId);

  const pendingRequests =
    requests?.filter((r) => r.status === "pending") ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Requests</h1>
        <p className="text-muted-foreground">
          Review and approve event requests from members.
        </p>
      </div>

      {isLoading && <LoadingSkeleton />}

      {isError && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <p className="font-medium">Failed to load event requests</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {requests && (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending{" "}
              {pendingRequests.length > 0 && (
                <span className="ml-1.5 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-400">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <EventRequestsTable
              requests={pendingRequests}
              serverId={serverId}
              showActions
            />
          </TabsContent>

          <TabsContent value="all">
            <EventRequestsTable
              requests={requests}
              serverId={serverId}
              showActions
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
