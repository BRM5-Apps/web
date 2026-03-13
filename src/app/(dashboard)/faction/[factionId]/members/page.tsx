"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";
import { useFactionMembers } from "@/hooks/use-faction";
import { useRanks } from "@/hooks/use-ranks";
import { usePromoteMember, useDemoteMember, useKickMember } from "@/hooks/use-members";
import { useHasPermission } from "@/hooks/use-permissions";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  MoreHorizontal,
  ArrowUpDown,
  Search,
  ChevronUp,
  ChevronDown,
  UserX,
  Shield,
} from "lucide-react";
import type { FactionMember } from "@/types/faction";

export default function MembersPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;

  // Table state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<string>("all");

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: "promote" | "demote" | "kick";
    member: FactionMember;
  } | null>(null);

  // Queries
  const sortCol = sorting[0];
  const { data, isLoading } = useFactionMembers(factionId, {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: search || undefined,
    rankId: rankFilter !== "all" ? rankFilter : undefined,
    sortBy: sortCol?.id,
    sortOrder: sortCol?.desc ? "desc" : "asc",
  });
  const { data: ranks } = useRanks(factionId);

  // Mutations
  const promoteMutation = usePromoteMember(factionId);
  const demoteMutation = useDemoteMember(factionId);
  const kickMutation = useKickMember(factionId);

  const canPromote = useHasPermission("members.promote");
  const canDemote = useHasPermission("members.demote");
  const canKick = useHasPermission("members.kick");

  // Column definitions
  const columns = useMemo<ColumnDef<FactionMember, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            className="h-4 w-4 rounded border-input"
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            className="h-4 w-4 rounded border-input"
            aria-label="Select row"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "username",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Member
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.username} />}
                <AvatarFallback className="text-xs">
                  {member.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{member.username}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "rankName",
        header: "Rank",
        cell: ({ row }) => {
          const member = row.original;
          if (!member.rankName) return <span className="text-muted-foreground">—</span>;
          return (
            <Badge
              variant="outline"
              style={member.rankColor ? { borderColor: member.rankColor, color: member.rankColor } : undefined}
            >
              {member.rankName}
            </Badge>
          );
        },
      },
      {
        accessorKey: "points",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Points
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.points.toLocaleString()}</span>
        ),
      },
      {
        accessorKey: "joinedAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.joinedAt)}</span>
        ),
      },
      {
        accessorKey: "lastActiveAt",
        header: "Last Active",
        cell: ({ row }) => {
          const lastActive = row.original.lastActiveAt;
          if (!lastActive) return <span className="text-muted-foreground">—</span>;
          return <span className="text-muted-foreground">{formatRelativeTime(lastActive)}</span>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const member = row.original;
          if (!canPromote && !canDemote && !canKick) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {canPromote && (
                  <DropdownMenuItem
                    onClick={() => setConfirmAction({ type: "promote", member })}
                  >
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Promote
                  </DropdownMenuItem>
                )}
                {canDemote && (
                  <DropdownMenuItem
                    onClick={() => setConfirmAction({ type: "demote", member })}
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Demote
                  </DropdownMenuItem>
                )}
                {canKick && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setConfirmAction({ type: "kick", member })}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Kick
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [canPromote, canDemote, canKick]
  );

  const members = data?.members ?? [];
  const pageCount = data?.totalPages ?? 0;

  const table = useReactTable({
    data: members,
    columns,
    pageCount,
    state: { pagination, sorting, rowSelection },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  // Bulk action handlers
  const selectedMembers = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original);

  async function handleConfirm() {
    if (!confirmAction) return;
    const { type, member } = confirmAction;
    const payload = { factionUserId: member.id };

    if (type === "promote") await promoteMutation.mutateAsync(payload);
    else if (type === "demote") await demoteMutation.mutateAsync(payload);
    else await kickMutation.mutateAsync(payload);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            {data?.total !== undefined
              ? `${data.total.toLocaleString()} total members`
              : "Manage faction members"}
          </p>
        </div>
        {selectedMembers.length > 0 && (canPromote || canDemote) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedMembers.length} selected
            </span>
            {canPromote && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  selectedMembers.forEach((m) =>
                    promoteMutation.mutate({ factionUserId: m.id })
                  );
                  setRowSelection({});
                }}
              >
                <ChevronUp className="mr-1 h-4 w-4" />
                Promote
              </Button>
            )}
            {canDemote && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  selectedMembers.forEach((m) =>
                    demoteMutation.mutate({ factionUserId: m.id })
                  );
                  setRowSelection({});
                }}
              >
                <ChevronDown className="mr-1 h-4 w-4" />
                Demote
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={rankFilter}
          onValueChange={(value) => {
            setRankFilter(value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by rank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            {ranks?.map((rank) => (
              <SelectItem key={rank.id} value={rank.id}>
                {rank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable table={table} columns={columns} isLoading={isLoading} emptyMessage="No members found." />

      {/* Confirm dialog for single-row actions */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.type === "kick"
            ? `Kick ${confirmAction.member.username}?`
            : confirmAction?.type === "promote"
              ? `Promote ${confirmAction?.member.username}?`
              : `Demote ${confirmAction?.member.username}?`
        }
        description={
          confirmAction?.type === "kick"
            ? `This will remove ${confirmAction.member.username} from the faction. They can rejoin later.`
            : confirmAction?.type === "promote"
              ? `${confirmAction?.member.username} will be promoted to the next rank.`
              : `${confirmAction?.member.username} will be demoted to the previous rank.`
        }
        onConfirm={handleConfirm}
        confirmLabel={confirmAction?.type === "kick" ? "Kick" : confirmAction?.type === "promote" ? "Promote" : "Demote"}
        variant={confirmAction?.type === "kick" ? "destructive" : "default"}
        isLoading={
          confirmAction?.type === "promote"
            ? promoteMutation.isPending
            : confirmAction?.type === "demote"
              ? demoteMutation.isPending
              : confirmAction?.type === "kick"
                ? kickMutation.isPending
                : false
        }
      />
    </div>
  );
}
