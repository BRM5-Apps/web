"use client";

import {
  Folder,
  FolderOpen,
  Star,
  Heart,
  Archive,
  Tag,
  Bookmark,
  LucideIcon,
} from "lucide-react";

// Icon name to component mapping
export const FOLDER_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: "Folder", icon: Folder },
  { name: "FolderOpen", icon: FolderOpen },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Archive", icon: Archive },
  { name: "Tag", icon: Tag },
  { name: "Bookmark", icon: Bookmark },
];

// Create a map for faster lookup
const ICON_MAP: Record<string, LucideIcon> = FOLDER_ICONS.reduce(
  (acc, { name, icon }) => {
    acc[name] = icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);

/**
 * Resolves an icon name string to a Lucide icon component.
 * Returns the Folder icon as default if the icon name is not found.
 */
export function getFolderIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) {
    return Folder;
  }
  return ICON_MAP[iconName] ?? Folder;
}