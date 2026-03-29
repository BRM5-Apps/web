"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Lock, Globe } from "lucide-react";
import { FOLDER_ICONS, getFolderIcon } from "@/lib/folder-icons";
import {
  useContentFolders,
  useCreateContentFolder,
  useUpdateContentFolder,
} from "@/hooks/use-content-folders";
import type { ContentFolder } from "@/types/content-folder";

// Predefined colors for folder selection
const FOLDER_COLORS = [
  { name: "Discord Blurple", value: "#5865F2" },
  { name: "Green", value: "#43B581" },
  { name: "Yellow", value: "#FAA61A" },
  { name: "Red", value: "#F04747" },
  { name: "Pink", value: "#EB459E" },
  { name: "Teal", value: "#26C6DA" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Orange", value: "#E67E22" },
];

// Validation schema
const folderFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$|^$/, "Color must be a valid hex color (e.g., #5865F2)")
    .optional(),
  visibility: z.enum(["private", "public"]).default("private"),
  parent_id: z.string().optional(),
});

type FolderFormValues = z.infer<typeof folderFormSchema>;

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  folder?: ContentFolder; // For edit mode
  parentFolderId?: string; // For creating subfolder
  onSuccess?: (folder: ContentFolder) => void;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  serverId,
  folder,
  parentFolderId,
  onSuccess,
}: CreateFolderDialogProps) {
  const isEditMode = Boolean(folder);

  // Fetch available folders for parent selection
  const { data: folders } = useContentFolders(serverId);

  // Mutations
  const createFolder = useCreateContentFolder(serverId);
  const updateFolder = useUpdateContentFolder(serverId, folder?.id ?? "");

  // Initialize form
  const form = useForm<FolderFormValues>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "Folder",
      color: "",
      visibility: "private",
      parent_id: parentFolderId ?? "__none__",
    },
  });

  // Reset form when dialog opens/closes or folder changes
  useEffect(() => {
    if (open) {
      if (folder) {
        // Edit mode: populate form with existing data
        form.reset({
          name: folder.name,
          description: folder.description ?? "",
          icon: folder.icon ?? "Folder",
          color: folder.color ?? "",
          visibility: folder.visibility,
          parent_id: folder.parent_id ?? "__none__",
        });
      } else {
        // Create mode: reset to defaults
        form.reset({
          name: "",
          description: "",
          icon: "Folder",
          color: "",
          visibility: "private",
          parent_id: parentFolderId ?? "__none__",
        });
      }
    }
  }, [open, folder, parentFolderId, form]);

  const onSubmit = async (values: FolderFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      icon: values.icon || undefined,
      color: values.color || undefined,
      visibility: values.visibility,
      parent_id: values.parent_id === "__none__" ? undefined : values.parent_id || undefined,
    };

    if (isEditMode && folder) {
      updateFolder.mutate(payload, {
        onSuccess: (updated) => {
          onOpenChange(false);
          form.reset();
          onSuccess?.(updated);
        },
      });
    } else {
      createFolder.mutate(payload, {
        onSuccess: (created) => {
          onOpenChange(false);
          form.reset();
          onSuccess?.(created);
        },
      });
    }
  };

  const isSubmitting = createFolder.isPending || updateFolder.isPending;

  // Filter out current folder from parent options (can't be parent of itself)
  const availableParents = folders?.filter(
    (f) => f.id !== folder?.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Folder" : "Create New Folder"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the folder details below."
              : "Organize your saved content into folders."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Folder"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a description for this folder..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon & Color Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Icon Picker */}
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? "Folder"}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon">
                            <div className="flex items-center gap-2">
                              {field.value && (() => {
                                const IconComponent =
                                  FOLDER_ICONS.find((i) => i.name === field.value)?.icon ??
                                  Folder;
                                return <IconComponent className="h-4 w-4" />;
                              })()}
                              <span>{field.value}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {FOLDER_ICONS.map(({ name, icon: IconComponent }) => (
                            <SelectItem key={name} value={name}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color Picker */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || "#5865F2"}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: field.value || "#5865F2" }}
                              />
                              <span>
                                {FOLDER_COLORS.find((c) => c.value === field.value)?.name || "Blurple"}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {FOLDER_COLORS.map(({ name, value }) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full border"
                                  style={{ backgroundColor: value }}
                                />
                                <span>{name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Visibility Toggle */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      {field.value === "private" ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                      {field.value === "private" ? "Private" : "Public"}
                    </FormLabel>
                    <FormDescription className="text-xs">
                      {field.value === "private"
                        ? "Only you can see this folder"
                        : "Visible to all server members"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "public"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "public" : "private")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Parent Folder Selector */}
            {availableParents && availableParents.length > 0 && (
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Folder (optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? "__none__"}
                        onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No parent (root folder)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FolderOpen className="h-4 w-4" />
                              <span>Root (no parent)</span>
                            </div>
                          </SelectItem>
                          {availableParents?.map((parent) => (
                            <SelectItem key={parent.id} value={parent.id}>
                              <div className="flex items-center gap-2">
                                {parent.icon &&
                                FOLDER_ICONS.find((i) => i.name === parent.icon) ? (
                                  <>
                                    {(() => {
                                      const IconComponent =
                                        FOLDER_ICONS.find((i) => i.name === parent.icon)?.icon ??
                                        Folder;
                                      return <IconComponent className="h-4 w-4" />;
                                    })()}
                                  </>
                                ) : (
                                  <Folder className="h-4 w-4" />
                                )}
                                <span>{parent.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Folder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}