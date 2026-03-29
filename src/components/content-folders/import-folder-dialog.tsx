'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, FileText, LayoutPanelTop, Zap, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getFolderIcon } from '@/lib/folder-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import type { ContentFolder, ContentItemType } from '@/types/content-folder';
import type { Server } from '@/types/server';

interface ImportFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: ContentFolder | null;
  serverId: string;
  onSuccess?: () => void;
}

const itemTypeIcons: Record<ContentItemType, React.ReactNode> = {
  EMBED: <FileText className="h-4 w-4" />,
  CONTAINER: <Folder className="h-4 w-4" />,
  TEXT: <FileText className="h-4 w-4" />,
  MODAL: <LayoutPanelTop className="h-4 w-4" />,
  AUTOMATION: <Zap className="h-4 w-4" />,
};

const itemTypeLabels: Record<ContentItemType, string> = {
  EMBED: 'Embed Template',
  CONTAINER: 'Container Template',
  TEXT: 'Text Template',
  MODAL: 'Modal Template',
  AUTOMATION: 'Automation',
};

/**
 * ImportFolderDialog - Dialog for importing a public folder
 *
 * Shows:
 * - Folder preview with contents list
 * - Server selector for import destination
 * - Import progress/status
 */
export function ImportFolderDialog({
  open,
  onOpenChange,
  folder,
  serverId,
  onSuccess,
}: ImportFolderDialogProps) {
  const queryClient = useQueryClient();

  // Fetch servers for selector
  const { data: servers, isLoading: loadingServers } = useQuery({
    queryKey: ['servers'],
    queryFn: () => api.servers.list(),
    enabled: open,
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (targetServerId: string) =>
      api.contentFolders.import(folder?.id || '', targetServerId),
    onSuccess: () => {
      toast.success('Folder imported successfully!');
      queryClient.invalidateQueries({ queryKey: ['contentFolders'] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to import folder: ${error.message}`);
    },
  });

  // Fetch folder details with stats
  const { data: folderDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['contentFolders', 'public', folder?.id],
    queryFn: () => api.contentFolders.getPublic(folder?.id || ''),
    enabled: open && Boolean(folder?.id),
  });

  // Fetch folder stats
  const { data: stats } = useQuery({
    queryKey: ['contentFolders', folder?.id, 'stats'],
    queryFn: () => api.contentFolders.getStats(folder?.id || ''),
    enabled: open && Boolean(folder?.id),
  });

  const handleImport = () => {
    if (folder) {
      importMutation.mutate(serverId);
    }
  };

  const displayFolder = folderDetails || folder;

  if (!displayFolder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(() => {
              const IconComponent = getFolderIcon(displayFolder.icon);
              return (
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: displayFolder.color || '#5865F2' }}
                />
              );
            })()}
            {displayFolder.name}
          </DialogTitle>
          <DialogDescription>
            {displayFolder.description || 'No description available'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {displayFolder.download_count.toLocaleString()} downloads
            </span>
            {stats && stats.rating_count > 0 && (
              <span>
                {stats.average_rating.toFixed(1)} avg rating ({stats.rating_count})
              </span>
            )}
          </div>

          <Separator />

          {/* Server Selector */}
          <div className="space-y-2">
            <Label htmlFor="server-select">Import to Server</Label>
            <Select value={serverId} disabled>
              <SelectTrigger id="server-select">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent>
                {servers?.map((server: Server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Contents List */}
          <div className="space-y-2">
            <Label>Contents</Label>
            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayFolder.items && displayFolder.items.length > 0 ? (
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="space-y-1 p-2">
                  {displayFolder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      {itemTypeIcons[item.item_type]}
                      <span className="text-sm">{itemTypeLabels[item.item_type]}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.item_type.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Folder className="h-8 w-8 mb-2" />
                <p className="text-sm">This folder is empty</p>
              </div>
            )}
          </div>

          {/* Children Folders */}
          {displayFolder.children && displayFolder.children.length > 0 && (
            <div className="space-y-2">
              <Label>Subfolders ({displayFolder.children.length})</Label>
              <ScrollArea className="h-[100px] rounded-md border">
                <div className="space-y-1 p-2">
                  {displayFolder.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      <Folder className="h-4 w-4" style={{ color: child.color || '#5865F2' }} />
                      <span className="text-sm">{child.name}</span>
                      {child.items && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {child.items.length} items
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={importMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importMutation.isPending || !serverId}
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import to Server
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}