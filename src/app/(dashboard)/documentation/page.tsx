"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BookOpen,
  Users,
  Shield,
  Trophy,
  MessageSquare,
  Zap,
  BarChart3,
  Gavel,
  Code,
  Server,
  Bot,
  LayoutTemplate,
  Clock,
  Webhook,
  Layers,
  GitBranch,
  ExternalLink,
  Calendar,
  Handshake,
  ChevronDown,
  Layers2,
  Settings,
  Play,
  ListOrdered,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  HelpCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  docFile: string;

  // Beginner content
  whatItDoes: string;
  whyUseIt: string;
  howToAccess: string;
  stepByStep: { step: number; title: string; description: string }[];
  commonTasks: { title: string; steps: string[] }[];
  tips: string[];

  // Technical content
  howItWorks: string;
  databaseTables: { table: string; purpose: string }[];
  apiEndpoints: { endpoint: string; method: string; description: string }[];
  keyComponents: { component: string; purpose: string }[];
}

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  features: Feature[];
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function getDocsUrl(filename: string): string {
  return `information/obsidian/Feature Lists/${encodeURIComponent(filename)}`;
}

// ─── Feature Data ────────────────────────────────────────────────────────────

const categories: Category[] = [
  // ============================================================
  // CORE FEATURES
  // ============================================================
  {
    id: "core",
    name: "Core Features",
    icon: Server,
    features: [
      {
        id: "server-management",
        name: "Server Management",
        description: "Connect and manage your Discord servers",
        icon: Server,
        docFile: "Server Management.md",

        whatItDoes: `Server Management is the foundation of BRM5. It connects your Discord server to the dashboard, allowing you to manage everything from one place. When you add a server, BRM5 creates a profile for it, syncs your members, roles, and channels, and makes all features available to you.

Think of it as "registering" your Discord server with BRM5. Without this connection, none of the other features work because BRM5 doesn't know about your server.`,

        whyUseIt: `• You have multiple Discord servers and want to manage them from one dashboard
• You want to track member activity, points, and ranks across your server
• You need to send scheduled messages or automate tasks
• You want moderators to manage the server through a web interface instead of Discord

Basically, if you want to use any BRM5 feature, you need to connect your server first.`,

        howToAccess: `1. Log into the BRM5 dashboard
2. You'll see a "Select Server" or "Add Server" screen
3. Click "Add Server"
4. You'll be redirected to Discord to authorize BRM5
5. Select the Discord server you want to add
6. BRM5 will automatically sync your server data
7. You'll be redirected back to the dashboard with your server selected`,

        stepByStep: [
          {
            step: 1,
            title: "Add Your First Server",
            description: `When you first log in, you won't have any servers connected. Click the "Add Server" button (the green + button in the left sidebar). You'll be taken to Discord's authorization page where you select which server to add BRM5 to.

**Important:** You need "Manage Server" permissions in Discord to add BRM5 to a server. If you don't see your server in the list, check your Discord permissions.`
          },
          {
            step: 2,
            title: "Server Sync",
            description: `After authorization, BRM5 automatically:
• Creates a server profile in the database
• Syncs all members (this can take a few minutes for large servers)
• Syncs all roles and channels
• Sets up default ranks based on your Discord roles

You'll see a loading indicator while this happens. Don't close the page until it finishes.`
          },
          {
            step: 3,
            title: "Access Your Server",
            description: `Once synced, your server appears in the left sidebar. Click it to access all features:
• Dashboard (overview with stats)
• Members (view and manage members)
• Ranks (configure rank hierarchy)
• Events (schedule and manage events)
• And more...

The sidebar is organized by category: Overview, Management, Content, Automation, Moderation, Analytics, Settings, Billing.`
          },
          {
            step: 4,
            title: "Add More Servers",
            description: `You can connect multiple servers. Each one appears in the left sidebar. Click the + button again to add another server. Switch between servers by clicking their icons in the sidebar.

Each server has its own separate data - members, ranks, templates, etc. are not shared between servers unless you explicitly import/export them.`
          },
        ],

        commonTasks: [
          {
            title: "Check Server Stats",
            steps: [
              "Select your server from the sidebar",
              "The dashboard shows member count, online members, total events, and recent activity",
              "Scroll down to see quick links to common actions",
            ]
          },
          {
            title: "Update Server Settings",
            steps: [
              "Go to Settings > General",
              "Update server name, timezone, or other configuration",
              "Changes sync to Discord where applicable",
            ]
          },
          {
            title: "Remove a Server",
            steps: [
              "Go to Settings > General",
              "Scroll to the bottom",
              "Click 'Delete Server'",
              "Confirm the deletion - this removes all BRM5 data for that server",
            ]
          },
        ],

        tips: [
          "The bot needs specific Discord permissions to work properly. If features aren't working, check that the bot has: Manage Roles, Manage Channels, Send Messages, View Audit Log",
          "Large servers (10,000+ members) may take several minutes to fully sync. Be patient and don't refresh the page.",
          "If you're an admin on multiple servers, you can quickly switch between them using the sidebar - no need to log out.",
          "Server deletion is permanent. All member data, ranks, templates, and settings are erased. Consider exporting templates first if you want to keep them.",
        ],

        howItWorks: `When you add a server, BRM5 creates a Server record in the database with your Discord Guild ID mapped to an internal UUID. This UUID is used throughout the system to reference your server.

The bot then performs a "guild sync" operation:
1. Fetches all members from Discord
2. Creates/updates ServerUser records for each member
3. Syncs roles, channels, and emoji
4. Stores Discord entity mappings for quick lookups

All subsequent operations (sending messages, updating ranks, etc.) use this mapping to translate between Discord IDs and internal UUIDs.`,

        databaseTables: [
          { table: "Server", purpose: "Stores server configuration, Discord guild ID, subscription tier" },
          { table: "ServerUser", purpose: "Maps Discord users to servers with rank assignment and points" },
          { table: "User", purpose: "Global user profile synced from Discord" },
          { table: "DiscordEntityReference", purpose: "Cache for Discord ID to internal UUID mapping" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers", method: "GET", description: "List all servers the user has access to" },
          { endpoint: "POST /servers", method: "POST", description: "Create a new server (bot authorization flow)" },
          { endpoint: "GET /servers/:id", method: "GET", description: "Get server details and stats" },
          { endpoint: "PATCH /servers/:id", method: "PATCH", description: "Update server settings" },
          { endpoint: "DELETE /servers/:id", method: "DELETE", description: "Delete server and all associated data" },
          { endpoint: "GET /servers/:id/permissions", method: "GET", description: "Get user's permissions for this server" },
        ],

        keyComponents: [
          { component: "ServerList", purpose: "Sidebar component showing all connected servers" },
          { component: "ServerSwitcher", purpose: "Dropdown to quickly switch between servers" },
          { component: "useServer hook", purpose: "React hook for fetching and caching server data" },
          { component: "useServerStore", purpose: "Zustand store for active server state" },
        ],
      },

      {
        id: "members",
        name: "Members Management",
        description: "View, search, and manage all your server members",
        icon: Users,
        docFile: "Members Management.md",

        whatItDoes: `The Members page is your member database. It shows everyone in your server in a powerful table with sorting, filtering, and bulk actions. You can see at a glance who has what rank, how many points they have, when they joined, and their activity level.

Think of it like a spreadsheet for your Discord server - but smarter. You can filter by rank, search by name, sort by join date, and perform actions on multiple members at once.`,

        whyUseIt: `• You have hundreds of members and need to find someone quickly
• You want to promote or demote multiple people at once
• You need to see who hasn't been active lately
• You're doing a rank audit and need to see everyone's current rank
• You want to kick inactive members or clean up the roster

If you've ever tried to manage members through Discord's native interface, you know how tedious it is. This makes it instant.`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Members" in the Management section of the sidebar
3. You'll see a table with all members, their rank, points, join date, and status
4. Use the search bar to find specific members
5. Use the rank filter dropdown to show only certain ranks
6. Click column headers to sort`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding the Members Table",
            description: `The members table shows:
• **Avatar + Name**: Click the name to see member details
• **Rank**: Current rank with colored badge
• **Points**: Total points earned
• **Joined**: When they joined the server
• **Status**: Online, offline, idle, DND
• **Actions**: Promote, Demote, Kick buttons

Hover over a row to see quick action buttons. Click the checkbox on the left to select multiple members for bulk actions.`
          },
          {
            step: 2,
            title: "Searching and Filtering",
            description: `**Search:** Type in the search box to find members by name or nickname. Search is instant - no need to press Enter.

**Filter by Rank:** Click the "All Ranks" dropdown to show only specific ranks. This is useful for seeing all Privates, all Officers, etc.

**Sort:** Click any column header to sort. Click again to reverse the order. The active sort shows a small arrow indicator.

**Pagination:** If you have many members, use the page controls at the bottom to navigate. You can also change how many rows show per page.`
          },
          {
            step: 3,
            title: "Individual Member Actions",
            description: `Click on a member's row to see their details, or use the action buttons on the right:

**Promote:** Move the member up to the next rank. They must meet any point thresholds you've configured.

**Demote:** Move the member down one rank. You can only demote to existing ranks.

**Kick:** Remove the member from the server. This is the same as kicking them in Discord - they can rejoin if you have an open invite.

**View Profile:** See their full profile including activity history, points earned, event attendance, etc.`
          },
          {
            step: 4,
            title: "Bulk Actions",
            description: `Select multiple members by clicking their checkboxes. A "Bulk Actions" bar appears at the top with:

**Bulk Promote:** Promote all selected members one rank. Each must meet point thresholds.

**Bulk Demote:** Demote all selected members one rank.

**Bulk Kick:** Kick all selected members from the server.

**Export:** Download selected members as CSV (coming soon).

Be careful with bulk kick - there's no confirmation dialog after the initial prompt.`
          },
        ],

        commonTasks: [
          {
            title: "Find a Specific Member",
            steps: [
              "Open the Members page",
              "Start typing their name in the search box",
              "Results appear instantly as you type",
              "Click their name to view their profile",
            ]
          },
          {
            title: "Promote Multiple Members",
            steps: [
              "Filter to the rank you want to promote from",
              "Select all members using the checkbox in the header",
              "Click 'Bulk Promote' in the action bar",
              "Confirm the promotion",
              "Each member moves up one rank",
            ]
          },
          {
            title: "See Who's Inactive",
            steps: [
              "Sort by 'Last Active' or 'Joined' date",
              "Scroll to see members with oldest dates",
              "Select those who haven't been active recently",
              "Use bulk actions to kick or note them",
            ]
          },
        ],

        tips: [
          "The search works on Discord username, display name, and nickname - so you can find people however you know them.",
          "Points don't automatically promote members. You must manually promote, or set up scheduled sequences to auto-promote based on points.",
          "Kicked members can rejoin if they have an invite link. Use bans for permanent removal.",
          "The 'Last Active' column shows when the member last sent a message or joined a voice channel. Use this to identify inactive members.",
          "You can't see members in private channels you don't have access to. Make sure the bot has access to all channels for accurate data.",
        ],

        howItWorks: `Members data is pulled from Discord and cached in the database. The bot syncs member data periodically (on join, leave, update events).

When you view the Members page:
1. The frontend requests members with current filters from the API
2. The API queries the database with pagination
3. Results are returned and rendered in a TanStack Table

Actions (promote, demote, kick) send requests to the API, which updates the database and then pushes changes back to Discord through the bot.`,

        databaseTables: [
          { table: "ServerUser", purpose: "Member data: rank, points, join date, last active" },
          { table: "User", purpose: "Global user: Discord ID, username, avatar URL" },
          { table: "Rank", purpose: "Rank definitions: name, level, permissions" },
          { table: "UserPoints", purpose: "Point totals per user per server" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/:id/members", method: "GET", description: "List members with pagination, search, and filters" },
          { endpoint: "GET /servers/:id/members/:memberId", method: "GET", description: "Get detailed member profile" },
          { endpoint: "POST /servers/:id/ranks/promote", method: "POST", description: "Promote member to next rank" },
          { endpoint: "POST /servers/:id/ranks/demote", method: "POST", description: "Demote member to previous rank" },
          { endpoint: "POST /servers/:id/ranks/promote/bulk", method: "POST", description: "Bulk promote selected members" },
          { endpoint: "POST /servers/:id/members/:memberId/kick", method: "POST", description: "Kick member from server" },
        ],

        keyComponents: [
          { component: "MembersTable", purpose: "TanStack Table wrapper with sorting, filtering, pagination" },
          { component: "MemberRow", purpose: "Individual member row with action buttons" },
          { component: "MemberProfile", purpose: "Detailed member profile modal" },
          { component: "BulkActionBar", purpose: "Actions bar shown when multiple members selected" },
          { component: "RankFilter", purpose: "Dropdown to filter by rank" },
        ],
      },

      {
        id: "ranks",
        name: "Ranks System",
        description: "Create and manage your server's rank hierarchy",
        icon: Shield,
        docFile: "RBAC.md",

        whatItDoes: `Ranks are the backbone of your server's organization. They define who can do what, who reports to whom, and how members progress through your hierarchy. Each rank has:
• A name (like "Private", "Corporal", "Sergeant")
• A level number (lower = lower rank)
• Discord role assignments
• Permission sets
• Point thresholds for promotion

Members progress through ranks by earning points or being manually promoted by officers.`,

        whyUseIt: `• You run a gaming clan, military roleplay, or any organization with hierarchy
• You want to control who can access different features
• You want automatic promotion based on activity
• You need different permission levels for moderators, admins, etc.
• You want a visible progression system that keeps members engaged

Without ranks, every member has the same access. Ranks let you create structured organizations.`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Ranks" in the Management section
3. You'll see your rank hierarchy displayed visually
4. Click any rank to edit it
5. Click "Create Rank" to add a new rank`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding Rank Hierarchy",
            description: `Ranks are ordered by level number. Level 1 is the lowest rank (like Recruit), Level 10 might be the highest (like Commander).

The rank tree shows your hierarchy visually:
• Each rank is a card showing the name, level, and member count
• Lines connect ranks to show the progression path
• Click a rank to see all members at that level

You can reorder ranks by dragging and dropping - this automatically updates their levels.`
          },
          {
            step: 2,
            title: "Creating a New Rank",
            description: `Click "Create Rank" to open the rank editor:

**Name:** The display name (e.g., "Sergeant Major")
**Level:** Auto-assigned based on position, or manual
**Discord Role:** Link to a Discord role (members get this role when promoted)
**Color:** Badge color for the rank
**Permissions:** Check which actions this rank can perform

When you save, the rank appears in the hierarchy at the correct position.`
          },
          {
            step: 3,
            title: "Setting Up Promotion Paths",
            description: `Promotion Paths define how members move through ranks:

1. Go to the "Promotion Paths" tab
2. Click "Create Path"
3. Select a starting rank and ending rank
4. Set requirements:
   • Points needed
   • Time in current rank
   • Manual approval required

For example, "Private to Corporal" path requires 100 points and 7 days in rank.`
          },
          {
            step: 4,
            title: "Configuring Permissions",
            description: `Each rank has a permission set that controls what members can do:

**Members:** View, Promote, Demote, Kick
**Events:** View, Create, Edit, Delete, Host
**Moderation:** View, Warn, Kick, Ban
**Templates:** View, Create, Edit, Delete
**Settings:** View, Edit
**Billing:** View, Manage

Check the permissions for each rank. Higher ranks automatically inherit lower rank permissions (configurable).

Members see a "My Permissions" page showing exactly what they can do.`
          },
        ],

        commonTasks: [
          {
            title: "Set Up a Basic Hierarchy",
            steps: [
              "Create the lowest rank (e.g., Recruit) at level 1",
              "Create intermediate ranks (Private, Corporal, Sergeant)",
              "Create officer ranks (Lieutenant, Captain, General)",
              "Create the highest rank (Commander) at the highest level",
              "Link each rank to its Discord role",
              "Set permissions for each rank tier",
            ]
          },
          {
            title: "Configure Auto-Promotion",
            steps: [
              "Go to Ranks > Promotion Paths",
              "Create a path from Recruit to Private",
              "Set point threshold (e.g., 50 points)",
              "Set time requirement (e.g., 7 days)",
              "Enable 'Auto-promote' checkbox",
              "Members meeting criteria will auto-promote",
            ]
          },
          {
            title: "Give Officers More Power",
            steps: [
              "Edit the Lieutenant rank",
              "Go to Permissions tab",
              "Check: Members > Promote, Members > Demote",
              "Check: Events > Create, Events > Edit",
              "Check: Moderation > View, Moderation > Warn",
              "Save changes",
              "All Lieutenants now have these permissions",
            ]
          },
        ],

        tips: [
          "Lower level numbers = lower rank. A Recruit at level 1 is below a Private at level 2.",
          "You can skip levels! Create a path from Recruit directly to Sergeant if you want.",
          "Point thresholds are optional. Set them to 0 if you want purely manual promotion.",
          "When you link a Discord role to a rank, promoting a member automatically gives them that role in Discord.",
          "Deleting a rank moves all members to the next lowest rank. You can't delete the only rank.",
          "Permissions can be set to 'inherit from above' - officers automatically get all permissions their subordinates have.",
        ],

        howItWorks: `Ranks are stored in a hierarchy with level numbers. When you promote a member:
1. The system finds the next rank in the hierarchy
2. Updates the member's ServerUser record with the new rank
3. If a Discord role is linked, sends a role assignment to Discord
4. Logs the promotion in RankHistory

Auto-promotion runs on a schedule:
1. Finds members meeting point and time thresholds
2. Checks if manual approval is required
3. If auto-enabled, performs promotion
4. If approval required, flags for officer review`,

        databaseTables: [
          { table: "Rank", purpose: "Rank definition: name, level, color, Discord role ID" },
          { table: "RankPermission", purpose: "Permission assignments per rank" },
          { table: "ServerUser", purpose: "Member's current rank" },
          { table: "RankHistory", purpose: "History of promotions and demotions" },
          { table: "PromotionThreshold", purpose: "Points and time required for each rank" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/:id/ranks", method: "GET", description: "List all ranks in hierarchy order" },
          { endpoint: "POST /servers/:id/ranks", method: "POST", description: "Create a new rank" },
          { endpoint: "PATCH /servers/:id/ranks/:rankId", method: "PATCH", description: "Update rank settings" },
          { endpoint: "DELETE /servers/:id/ranks/:rankId", method: "DELETE", description: "Delete a rank" },
          { endpoint: "POST /servers/:id/ranks/reorder", method: "POST", description: "Reorder ranks" },
          { endpoint: "POST /servers/:id/ranks/promote", method: "POST", description: "Promote a member" },
          { endpoint: "POST /servers/:id/ranks/demote", method: "POST", description: "Demote a member" },
        ],

        keyComponents: [
          { component: "RankTree", purpose: "Visual hierarchy display with drag-drop reordering" },
          { component: "RankCard", purpose: "Individual rank display with member count" },
          { component: "RankForm", purpose: "Create/edit rank dialog" },
          { component: "PermissionEditor", purpose: "Checkbox grid for setting permissions" },
          { component: "PromotionPathEditor", purpose: "Configure promotion requirements" },
        ],
      },

      {
        id: "points",
        name: "Points & Leaderboard",
        description: "Track member activity and reward engagement",
        icon: Trophy,
        docFile: "Points & Leaderboard.md",

        whatItDoes: `Points are a gamification system that rewards members for activity. Members earn points by:
• Attending events
• Being active in chat
• Participating in voice channels
• Receiving manual awards from officers
• Completing certain tasks

The leaderboard shows top members by points. You can set point thresholds for rank promotion. Points turn engagement into something measurable.`,

        whyUseIt: `• You want members to be active, not just lurk
• You want objective criteria for promotions
• You want friendly competition between members
• You need to track who contributes most
• You want to reward participation automatically

Points give members a reason to show up and participate.`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Leaderboard" in the Analytics section
3. See the top members ranked by points
4. Click any member to see their point history
5. Go to Members page to see individual point totals`,

        stepByStep: [
          {
            step: 1,
            title: "How Members Earn Points",
            description: `Points can be earned automatically or manually:

**Automatic Points:**
• Event attendance: Points for showing up to events
• Event hosting: Bonus points for hosting
• Voice activity: Points per hour in voice channels
• Message activity: Points for active messaging

**Manual Points:**
• Officers can award points from the Members page
• Points can be awarded as recognition
• Points can be deducted as penalties

Go to Settings > Events to configure automatic point amounts for each activity type.`
          },
          {
            step: 2,
            title: "Viewing the Leaderboard",
            description: `The Leaderboard page shows:
• Rank position (gold, silver, bronze for top 3)
• Member name and avatar
• Total points
• Recent activity indicator

Click a member to see:
• Point breakdown by source
• Point history graph
• Recent point transactions
• Promotion eligibility status`
          },
          {
            step: 3,
            title: "Awarding Points Manually",
            description: `To give points to a member:

1. Go to Members page
2. Find the member (use search)
3. Click their row to open details
4. Click "Award Points"
5. Enter the amount and reason
6. Submit

To deduct points, use negative amounts. All point changes are logged with the reason and who made the change.`
          },
          {
            step: 4,
            title: "Setting Promotion Thresholds",
            description: `Link points to rank progression:

1. Go to Ranks page
2. Edit a rank
3. Set "Points Required" field
4. Members must have this many points to be eligible for promotion

When a member reaches the threshold:
• They appear in the "Ready for Promotion" list
• Officers can promote them with one click
• Or enable auto-promotion to skip manual approval`
          },
        ],

        commonTasks: [
          {
            title: "Award Points to Active Members",
            steps: [
              "Go to Members page",
              "Find the member",
              "Click their row",
              "Click 'Award Points'",
              "Enter amount and reason (e.g., 'Great event leadership')",
              "Submit",
            ]
          },
          {
            title: "Check Who's Ready for Promotion",
            steps: [
              "Go to Ranks > Promotion Flags",
              "See all members who meet point thresholds",
              "Review their point history",
              "Approve or reject promotions",
            ]
          },
          {
            title: "Configure Event Point Rewards",
            steps: [
              "Go to Settings > Events",
              "Set points for attending events",
              "Set bonus points for hosting",
              "Set points for different event types",
            ]
          },
        ],

        tips: [
          "Point thresholds should scale with rank. Lower ranks need fewer points, higher ranks need more.",
          "Consider point decay for inactivity. You can deduct points from inactive members monthly.",
          "Don't make points the only criteria for promotion. Manual review prevents gaming the system.",
          "Voice points are counted by time spent. Make sure you're not awarding points for AFK time in voice channels.",
          "Export the leaderboard to CSV for external analysis or sharing.",
          "Point history shows exactly when and why points were added or removed. Use it to audit suspicious point changes.",
        ],

        howItWorks: `Points are tracked in the UserPoints table with a running total. When points change:
1. A PointTransaction record is created with amount, reason, source
2. The UserPoints total is updated
3. If points cross a threshold, a PromotionFlag is created
4. The leaderboard query recalculates rankings

Points are aggregated daily, weekly, and monthly for analytics. You can see trends over time in the analytics dashboard.`,

        databaseTables: [
          { table: "UserPoints", purpose: "Total points per member with daily/weekly/monthly breakdowns" },
          { table: "PointTransaction", purpose: "History of every point change with reason" },
          { table: "PromotionThreshold", purpose: "Points required for each rank" },
          { table: "PromotionFlag", purpose: "Members flagged for promotion review" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/:id/points/:userId", method: "GET", description: "Get member's point total and history" },
          { endpoint: "POST /servers/:id/points/award", method: "POST", description: "Award points to a member" },
          { endpoint: "POST /servers/:id/points/deduct", method: "POST", description: "Deduct points from a member" },
          { endpoint: "GET /servers/:id/leaderboard", method: "GET", description: "Get top members by points" },
          { endpoint: "GET /servers/:id/points/promotion-flags", method: "GET", description: "List members ready for promotion" },
        ],

        keyComponents: [
          { component: "Leaderboard", purpose: "Top members display with medal icons" },
          { component: "PointsDisplay", purpose: "Member points in their profile" },
          { component: "PointHistory", purpose: "Graph and list of point transactions" },
          { component: "AwardPointsDialog", purpose: "Form for awarding/deducting points" },
        ],
      },

      {
        id: "permissions",
        name: "Permissions System",
        description: "Control who can do what in your server",
        icon: Shield,
        docFile: "Permissions System.md",

        whatItDoes: `Permissions control access to features and actions. Instead of giving everyone full access, you define what each rank can do:
• View members, events, settings
• Create, edit, delete content
• Manage other members
• Access sensitive features

The system uses a deny-by-default approach: members can only do what their rank explicitly permits.`,

        whyUseIt: `• You don't want recruits deleting templates
• You want moderators to warn but not ban
• You want officers to promote but not demote
• You want admins to have full control
• You want to limit who can send announcements

Permissions let you delegate safely without giving away the keys to the kingdom.`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Permissions" in the Management section
3. See your current permissions
4. (Admins) Go to Settings > Permissions to edit rank permissions`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding Permission Domains",
            description: `Permissions are grouped into domains:

**Members Domain:**
• members.view - See member list
• members.promote - Promote members
• members.demote - Demote members
• members.kick - Kick members from server

**Events Domain:**
• events.view - See events
• events.create - Create events
• events.edit - Edit any event
• events.delete - Delete events
• events.host - Host events

**Moderation Domain:**
• moderation.view - See moderation log
• moderation.warn - Issue warnings
• moderation.mute - Mute members
• moderation.kick - Kick members
• moderation.ban - Ban members

**Templates Domain:**
• templates.view - View templates
• templates.create - Create templates
• templates.edit - Edit templates
• templates.delete - Delete templates

**Settings Domain:**
• settings.view - View settings
• settings.edit - Change settings

**Billing Domain:**
• billing.view - View subscription
• billing.manage - Manage subscription`
          },
          {
            step: 2,
            title: "Setting Rank Permissions",
            description: `To configure what a rank can do:

1. Go to Settings > Permissions
2. Select a rank from the dropdown
3. You'll see a grid of permissions by domain
4. Check/uncheck permissions as needed
5. Save changes

Members with that rank immediately get the new permissions.

**Permission Inheritance:** By default, higher ranks inherit permissions from lower ranks. A Commander can do everything a Private can do, plus more. You can disable this per-rank.`
          },
          {
            step: 3,
            title: "Checking Your Own Permissions",
            description: `To see what you can do:

1. Go to Permissions page
2. You'll see your permissions grouped by domain
3. Green checkmarks = you can do this
4. Gray X = you cannot do this

If you try to access something you don't have permission for, you'll see an "Access Denied" message and be redirected.`
          },
          {
            step: 4,
            title: "Permission-Based Rendering",
            description: `The frontend automatically hides features you can't access:

• If you can't create events, the "Create Event" button won't appear
• If you can't manage billing, the Billing page won't show in the sidebar
• If you can't edit templates, edit buttons won't appear

This prevents confusion - you won't see buttons you can't use.`
          },
        ],

        commonTasks: [
          {
            title: "Set Up Moderator Permissions",
            steps: [
              "Go to Settings > Permissions",
              "Select 'Moderator' rank",
              "Enable: members.view, members.kick",
              "Enable: moderation.view, moderation.warn, moderation.mute, moderation.kick",
              "Disable: moderation.ban, members.promote, members.demote",
              "Save changes",
            ]
          },
          {
            title: "Give Officers Full Member Management",
            steps: [
              "Go to Settings > Permissions",
              "Select 'Officer' rank",
              "Enable all members.* permissions",
              "Enable all moderation.* permissions",
              "Save changes",
            ]
          },
          {
            title: "Restrict Template Creation",
            steps: [
              "Go to Settings > Permissions",
              "Select lower ranks",
              "Disable: templates.create, templates.edit, templates.delete",
              "Keep templates.view enabled",
              "Save changes",
              "Now only higher ranks can manage templates",
            ]
          },
        ],

        tips: [
          "Start restrictive and add permissions as needed. It's easier to grant than revoke.",
          "Create a 'Moderator' rank with limited powers before giving anyone full admin.",
          "Test permissions by logging in as a lower rank and trying actions.",
          "Document what each rank can do. Members will ask!",
          "The bot owner (server owner) always has full permissions - this can't be changed.",
          "Permissions don't affect Discord itself. A member banned from the dashboard can still use Discord normally.",
        ],

        howItWorks: `Permissions use middleware checks on every API request:

1. Request comes in to a protected endpoint
2. Middleware extracts the user and server
3. Middleware checks user's rank permissions
4. If permission exists, request proceeds
5. If permission missing, 403 Forbidden returned

On the frontend:
1. usePermissions hook fetches user's permissions
2. PermissionGate component conditionally renders children
3. Routes check permissions before loading
4. Buttons/actions hidden based on permissions`,

        databaseTables: [
          { table: "Permission", purpose: "Permission definitions: domain, action, description" },
          { table: "RankPermission", purpose: "Associations between ranks and permissions" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/:id/permissions", method: "GET", description: "Get current user's permissions" },
          { endpoint: "GET /servers/:id/ranks/:rankId/permissions", method: "GET", description: "Get rank's permissions" },
          { endpoint: "PATCH /servers/:id/ranks/:rankId/permissions", method: "PATCH", description: "Update rank's permissions" },
        ],

        keyComponents: [
          { component: "PermissionGate", purpose: "React component that conditionally renders based on permission" },
          { component: "usePermissions", purpose: "Hook to check permissions in code" },
          { component: "PermissionEditor", purpose: "Grid UI for editing rank permissions" },
          { component: "requirePermission middleware", purpose: "Backend middleware that checks permissions" },
        ],
      },
    ],
  },

  // ============================================================
  // CONTENT & MESSAGING
  // ============================================================
  {
    id: "content",
    name: "Content & Messaging",
    icon: MessageSquare,
    features: [
      {
        id: "message-builder",
        name: "Message Builder",
        description: "Create and send Discord messages with rich formatting",
        icon: MessageSquare,
        docFile: "Message Builder.md",

        whatItDoes: `The Message Builder is a visual editor for creating Discord messages. Instead of typing JSON or Discord markdown, you use a drag-and-drop interface to build:
• **Text messages**: Simple text with formatting
• **Embeds**: Rich cards with titles, descriptions, colors, images
• **Components (V2)**: Advanced layouts with containers, buttons, select menus

Preview exactly how your message will look in Discord before sending. Save messages as templates to reuse later.`,

        whyUseIt: `• You want to send professional-looking announcements
• You need buttons that perform actions when clicked
• You want to create welcome messages with member counts
• You need to send the same message regularly (save as template)
• You want to preview messages before sending to a live channel
• You're tired of Discord's limited formatting options

The Message Builder is like a content management system for your Discord messages.`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Message Builder" in the Content section
3. Choose your message type: Text, Embed, or Component
4. Build your message using the editor
5. Preview in real-time on the right
6. Click "Send" when ready`,

        stepByStep: [
          {
            step: 1,
            title: "Creating a Text Message",
            description: `Text messages are the simplest option:

1. Select "Text" mode at the top
2. Type your message in the text area
3. Use the formatting toolbar:
   • **Bold**: **text**
   • *Italic*: *text*
   • ~~Strikethrough~~: ~~text~~
   • \`Code\`: \`text\`
4. Use elements like {memberCount} or {userName} for dynamic content
5. Preview shows exactly how it will appear in Discord
6. Choose a channel and click Send

Text messages are best for simple announcements or reminders.`
          },
          {
            step: 2,
            title: "Creating an Embed",
            description: `Embeds are rich message cards:

1. Select "Embed" mode at the top
2. Fill in the fields:
   • **Title**: The headline (appears larger and bold)
   • **Description**: Main body text
   • **Color**: Side bar color (click the color picker)
   • **Author**: Small text above title (like "Announcement")
   • **Footer**: Small text at bottom
   • **Thumbnail**: Small image on the right
   • **Image**: Large image below the content
3. Add fields (name/value pairs) using the "Add Field" button
4. Preview updates live on the right
5. Use elements in any text field for dynamic content

Embeds are great for announcements, status updates, or any message that needs to stand out.`
          },
          {
            step: 3,
            title: "Creating a Component V2 Message",
            description: `Component V2 is Discord's newest message format:

1. Select "Component" mode at the top
2. You'll see an empty canvas
3. Click "Add Container" from the sidebar
4. Drag components into the container:
   • **Text Display**: Markdown text blocks
   • **Section**: Text with a thumbnail or button
   • **Media Gallery**: Grid of images
   • **Separator**: Visual divider
   • **Action Row**: Buttons and select menus
5. Configure each component by clicking it
6. Buttons can trigger actions or open links

Component V2 messages are the most powerful option for interactive content.`
          },
          {
            step: 4,
            title: "Adding Buttons and Actions",
            description: `In Component mode, you can add interactive buttons:

1. Add an Action Row to your container
2. Click "Add Button"
3. Configure the button:
   • **Label**: Button text
   • **Style**: Primary (blue), Secondary (gray), Success (green), Danger (red)
   • **Emoji**: Optional emoji
4. Choose an action type:
   • **Open Modal**: Open a form popup
   • **Run Sequence**: Execute a predefined action sequence
   • **Link**: Open a URL
5. Link to a modal or action sequence you've created

Buttons turn passive messages into interactive experiences.`
          },
          {
            step: 5,
            title: "Using Elements for Dynamic Content",
            description: `Elements are placeholders that fill in when the message is sent:

**To insert an element:**
1. Click the element picker icon in the toolbar
2. Browse available elements by category
3. Click an element to insert it at cursor position

**Common elements:**
• {userName} - The person who triggered the message
• {memberCount} - Current server member count
• {serverName} - Your server's name
• {currentRank} - User's current rank name

Elements let you create templates that stay up-to-date.`
          },
          {
            step: 6,
            title: "Sending and Saving",
            description: `When your message is ready:

**Send Now:**
1. Click "Send" button
2. Choose a channel from the dropdown
3. Optionally add a webhook URL for webhooks
4. Confirm to send immediately

**Save as Template:**
1. Click "Save Template"
2. Enter a name
3. The template appears in your Templates list
4. Load it anytime to edit and resend

**Export as JSON:**
1. Click "Export JSON"
2. Copy the JSON for external use
3. Import back later with "Import JSON"

Templates are essential for recurring messages like weekly announcements.`
          },
        ],

        commonTasks: [
          {
            title: "Send a Welcome Message",
            steps: [
              "Create an Embed message",
              "Title: 'Welcome to {serverName}!'",
              "Description: 'We now have {memberCount} members'",
              "Color: Your brand color",
              "Thumbnail: Your server icon",
              "Save as 'Welcome Message' template",
              "Use in welcome configuration or send manually",
            ]
          },
          {
            title: "Create an Announcement with Buttons",
            steps: [
              "Create a Component V2 message",
              "Add a container with text about the announcement",
              "Add an Action Row",
              "Add a button: 'Learn More' -> Link to documentation",
              "Add a button: 'RSVP' -> Opens RSVP modal",
              "Preview to verify buttons work",
              "Send to your announcements channel",
            ]
          },
          {
            title: "Schedule a Weekly Update",
            steps: [
              "Create your weekly update message",
              "Save as 'Weekly Update' template",
              "Go to Scheduled Sequences",
              "Create new sequence",
              "Set to run weekly",
              "Link the 'Weekly Update' template",
              "Enable the sequence",
            ]
          },
        ],

        tips: [
          "Preview in dark mode to match Discord's appearance. Toggle the theme switch above the preview.",
          "Elements inside embed fields don't update dynamically. Put elements in the description instead.",
          "Component V2 messages have a character limit per component. Keep text blocks under 1000 characters.",
          "Test buttons by sending to a test channel first. Make sure modals open correctly.",
          "Use the element picker sidebar to see all available elements and their descriptions.",
          "Export your message JSON before making major edits. You can always import it back.",
        ],

        howItWorks: `Message Builder uses a visual editor that generates Discord-compatible JSON:

1. User builds message in the UI
2. Editor state stored as internal format
3. On send, format is converted to Discord API JSON
4. Sent via bot to the selected channel

For Component V2:
1. Components are stored as C2TopLevelItem structure
2. Actions are linked to action sequences
3. On button click, Discord sends an interaction
4. Bot looks up the action sequence
5. Executes each step in sequence`,

        databaseTables: [
          { table: "TextTemplate", purpose: "Saved text message templates" },
          { table: "EmbedTemplate", purpose: "Saved embed templates with fields" },
          { table: "ContainerTemplate", purpose: "Saved Component V2 templates" },
          { table: "ActionSequence", purpose: "Button action sequences" },
        ],

        apiEndpoints: [
          { endpoint: "POST /servers/:id/messages/send", method: "POST", description: "Send a message immediately" },
          { endpoint: "GET /servers/:id/templates/text", method: "GET", description: "List text templates" },
          { endpoint: "POST /servers/:id/templates/embed", method: "POST", description: "Save embed template" },
          { endpoint: "POST /servers/:id/templates/container", method: "POST", description: "Save Component V2 template" },
        ],

        keyComponents: [
          { component: "MessageBuilder", purpose: "Main editor with mode switching" },
          { component: "EmbedBuilder", purpose: "Visual embed editor with fields" },
          { component: "ComponentV2Builder", purpose: "Drag-drop Component V2 editor" },
          { component: "DiscordPreview", purpose: "Live preview matching Discord's appearance" },
          { component: "ElementPicker", purpose: "Sidebar to browse and insert elements" },
        ],
      },

      {
        id: "modal-builder",
        name: "Modal Builder",
        description: "Create custom Discord forms (modals) that collect user input",
        icon: LayoutTemplate,
        docFile: "Module Builder.md",

        whatItDoes: `The Modal Builder (also called Module Builder) lets you create custom Discord forms that pop up when users click buttons. Each form can have up to 5 fields with validation rules, and when submitted, the data is stored as Elements (variables) that can be used in messages, role assignments, and other actions.

Think of it like a Google Form, but inside Discord. When someone fills out your form, you can automatically process their responses - approve applications, assign roles, create tickets, etc.`,

        whyUseIt: `• Collect structured user input (applications, reports, feedback)
• Validate responses with regex patterns and length limits
• Automatically process submissions through Action Sequences
• Store form data as Elements for use throughout the system
• Create application forms, bug reports, suggestion boxes, event registrations
• All without leaving Discord`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Modal Builder" in the Content section
3. Click "Create Modal"
4. Add a title and configure fields
5. Set the on-submit action sequence
6. Save the modal
7. Link it to a button in Message Builder`,

        stepByStep: [
          {
            step: 1,
            title: "Creating a Modal",
            description: `A Modal is a popup form in Discord:

1. Click "Create Modal" in the Modal Builder
2. Enter a title (shown at the top of the popup)
3. Add up to 5 fields:
   • Each field has a label, placeholder, and type
   • Choose "Short" for single-line or "Paragraph" for multi-line
   • Mark fields as required or optional
4. Set validation rules (regex, min/max length)
5. Save the modal

The modal can now be opened by buttons in your messages.`
          },
          {
            step: 2,
            title: "Configuring Field Validation",
            description: `Each field supports validation:

**Short Text Fields:**
• Use for names, IDs, short answers
• Set minimum/maximum character length
• Apply regex patterns for validation (e.g., numbers only, email format)

**Paragraph Fields:**
• Use for descriptions, explanations, long answers
• Set character limits (up to 4000 characters)

**Validation Examples:**
• Age field: Regex pattern "^[0-9]+$" ensures numbers only
• Email field: Built-in email validation pattern
• Custom pattern: Any valid regex for your needs

Invalid submissions show error messages to the user.`
          },
          {
            step: 3,
            title: "Setting Up Action Sequences",
            description: `When a modal is submitted, an Action Sequence runs:

1. Go to "On Submit Action" dropdown
2. Select or create an action sequence
3. The sequence receives all form field values as Elements
4. Use Elements in your sequence:
   • Send confirmation: "Thank you {{element:application_username}}!"
   • Assign roles based on form selections
   • Create tickets with form data
   • Post to channels with formatted content

The sequence can do anything: send messages, assign roles, create tickets, call APIs, etc.`
          },
          {
            step: 4,
            title: "Linking Modals to Buttons",
            description: `To let users open your modal:

1. Go to Message Builder
2. Create or edit a message with buttons
3. Click on a button to edit it
4. Choose "Open Modal" as the action type
5. Select your modal from the dropdown
6. Save the message

When users click that button, the modal pops up. After they submit, the form data is processed by your action sequence.`
          },
        ],

        commonTasks: [
          {
            title: "Create an Application Form",
            steps: [
              "Create modal titled 'Server Application'",
              "Add fields: Username, Age, Experience, Why Join",
              "Mark required fields",
              "Create action sequence 'Process Application'",
              "Add steps: Send to staff channel, assign Applicant role",
              "Save modal and link to 'Apply' button",
            ]
          },
          {
            title: "Create a Bug Report Form",
            steps: [
              "Create modal titled 'Bug Report'",
              "Add fields: Description, Steps to Reproduce, Severity",
              "Create action sequence 'Log Bug Report'",
              "Add steps: Create ticket, notify developers",
              "Link to 'Report Bug' button",
            ]
          },
        ],

        tips: [
          "Discord limits modals to 5 fields. If you need more, consider breaking into multiple steps.",
          "Field values become Elements automatically. A field labeled 'Username' becomes {{element:application_username}}.",
          "Always test your validation regex before going live - it's easy to accidentally block valid input.",
          "Use paragraph fields sparingly - they take up more screen space and can overwhelm users.",
          "Set up a confirmation message in your action sequence so users know their submission was received.",
        ],

        howItWorks: `Modal forms use Discord's Modal API:

1. Button click triggers modal open request
2. Bot fetches modal definition from database
3. Discord displays the modal popup to user
4. User fills fields and submits
5. Bot receives submission with all field values
6. Values stored as Elements ({{element:modalname_fieldname}})
7. Linked Action Sequence executes with Elements available

The modal definition (ModalTemplate) stores field configurations, and ModalSubmission records track each submission.`,

        databaseTables: [
          { table: "ModalTemplate", purpose: "Modal definitions with field configurations" },
          { table: "ModalField", purpose: "Individual field settings per modal" },
          { table: "ModalSubmission", purpose: "Records of each form submission" },
          { table: "ActionSequence", purpose: "Linked action sequence to run on submit" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/{id}/modals", method: "GET", description: "List all modals for server" },
          { endpoint: "POST /servers/{id}/modals", method: "POST", description: "Create new modal" },
          { endpoint: "GET /servers/{id}/modals/{id}", method: "GET", description: "Get modal details" },
          { endpoint: "PUT /servers/{id}/modals/{id}", method: "PUT", description: "Update modal configuration" },
          { endpoint: "DELETE /servers/{id}/modals/{id}", method: "DELETE", description: "Delete modal" },
          { endpoint: "GET /servers/{id}/modals/{id}/submissions", method: "GET", description: "List submissions for modal" },
        ],

        keyComponents: [
          { component: "ModalBuilder", purpose: "Main modal configuration interface" },
          { component: "ModalFieldEditor", purpose: "Individual field settings editor" },
          { component: "ValidationPreview", purpose: "Test validation patterns live" },
          { component: "ActionSequencePicker", purpose: "Select on-submit sequence" },
          { component: "useModals hook", purpose: "Fetch and mutate modal data" },
        ],
      },

      {
        id: "template-system",
        name: "Template System",
        description: "Save and reuse message templates across your server",
        icon: LayoutTemplate,
        docFile: "Template System.md",

        whatItDoes: `The Template System lets you save any message (text, embed, or Component V2) as a reusable template. Create it once, use it anywhere - in scheduled messages, button responses, welcome messages, and more.

Templates support the Element System, so dynamic content like {userName} or {memberCount} automatically fills in when the template is used.`,

        whyUseIt: `• Send the same announcement weekly without recreating it
• Keep branding consistent across all your messages
• Share templates with other servers via Template Marketplace
• Update a template once, all uses of it get the changes
• Use Elements for dynamic content that stays up-to-date`,

        howToAccess: `1. Create a message in Message Builder
2. Click "Save as Template"
3. Give it a name and description
4. Access saved templates from the Templates page
5. Load template to edit or send`,

        stepByStep: [
          {
            step: 1,
            title: "Creating a Template",
            description: `Templates can be created from any message type:

**Text Template:**
1. Create a text message
2. Add Elements like {serverName}
3. Click "Save as Template"
4. Name it (e.g., "Weekly Announcement")

**Embed Template:**
1. Create an embed with title, description, color
2. Add fields and images
3. Use Elements in any text field
4. Save with a descriptive name

**Container Template (Component V2):**
1. Create a Component V2 message
2. Add containers, text, buttons
3. Link actions to buttons
4. Save the entire container as a template`
          },
          {
            step: 2,
            title: "Using Templates",
            description: `To use a saved template:

1. Go to Templates page
2. Browse by type: Text, Embeds, Containers, Modals
3. Click "Use Template" on any template
4. The Message Builder opens with template content loaded
5. Make any edits if needed
6. Send the message

Templates are copies - editing after sending doesn't change the original. To update a template, edit and re-save it.`
          },
          {
            step: 3,
            title: "Template Categories",
            description: `Organize templates by purpose:

**Welcome Templates:**
• Welcome embeds with member count
• Onboarding messages
• Rules acknowledgment

**Announcement Templates:**
• Event announcements
• Update posts
• Weekly newsletters

**Form Templates:**
• Application confirmations
• Report receipts
• Ticket created messages

Create naming conventions to stay organized.`
          },
        ],

        commonTasks: [
          {
            title: "Create a Weekly Announcement Template",
            steps: [
              "Create embed with title 'Weekly Update'",
              "Add fields for stats using Elements",
              "Include dynamic member count",
              "Save as 'Weekly Update Template'",
              "Use in Scheduled Sequences for auto-posting",
            ]
          },
          {
            title: "Import a Template",
            steps: [
              "Copy template JSON from another server",
              "Go to Templates page",
              "Click 'Import JSON'",
              "Paste the JSON",
              "Template appears in your list",
            ]
          },
        ],

        tips: [
          "Use Elements in templates so content updates automatically - {memberCount} will always show current count.",
          "Name templates descriptively: 'Welcome New Member' not 'Template 1'.",
          "Export important templates as JSON backups - you can re-import them if needed.",
          "Test templates by sending to a test channel first - previews aren't always perfect.",
          "Templates are server-scoped - each server has its own template library.",
        ],

        howItWorks: `Templates are stored as JSON structures in the database:

1. When you save a template, the message configuration is serialized to JSON
2. The JSON includes all content, styling, and element references
3. When you load a template, the JSON is deserialized back into the editor
4. Elements are resolved at send time, not save time
5. Templates can be shared via the Marketplace by publishing their JSON

Each template type has its own table (TextTemplate, EmbedTemplate, ContainerTemplate, ModalTemplate).`,

        databaseTables: [
          { table: "TextTemplate", purpose: "Plain text message templates" },
          { table: "EmbedTemplate", purpose: "Discord embed templates with fields" },
          { table: "ContainerTemplate", purpose: "Component V2 container templates" },
          { table: "ModalTemplate", purpose: "Modal form templates" },
          { table: "ElementUsage", purpose: "Tracks which elements are used where" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/{id}/texts", method: "GET", description: "List text templates" },
          { endpoint: "POST /servers/{id}/texts", method: "POST", description: "Create text template" },
          { endpoint: "GET /servers/{id}/embeds", method: "GET", description: "List embed templates" },
          { endpoint: "POST /servers/{id}/embeds", method: "POST", description: "Create embed template" },
          { endpoint: "GET /servers/{id}/containers", method: "GET", description: "List container templates" },
          { endpoint: "POST /servers/{id}/containers", method: "POST", description: "Create container template" },
        ],

        keyComponents: [
          { component: "TemplateList", purpose: "Grid of template cards with previews" },
          { component: "TemplateCard", purpose: "Individual template preview with actions" },
          { component: "TemplateImport", purpose: "Import templates from JSON" },
          { component: "TemplateExport", purpose: "Export template as shareable JSON" },
          { component: "useTemplates hook", purpose: "Fetch and mutate templates" },
        ],
      },

      {
        id: "element-system",
        name: "Element System",
        description: "Dynamic variables that fill in automatically when messages are sent",
        icon: Code,
        docFile: "Element System.md",

        whatItDoes: `Elements are reusable variables that you can insert anywhere in your messages. Instead of hard-coding "156 members", you use {memberCount} and it automatically fills in the current count when the message is sent.

There are system elements (like server name, member count), user elements (username, join date), rank elements (current rank, points), and custom elements you create yourself.`,

        whyUseIt: `• Messages stay up-to-date without editing
• Create once, use everywhere
• Personalize messages with user-specific data
• Build complex automations that reference real-time data
• Track counters like "applications this week"`,

        howToAccess: `1. In Message Builder, click the element picker icon (brackets)
2. Browse elements by category
3. Click an element to insert it at your cursor
3. Or type {{ and use IntelliSense to autocomplete
4. Elements appear in orange in your text`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding Element Types",
            description: `Elements come in several categories:

**System Elements:**
• {serverName} - Your Discord server name
• {memberCount} - Total members
• {onlineCount} - Members currently online
• {timestamp} - Current date/time

**User Elements:**
• {userName} - The user who triggered the message
• {userMention} - Mentions the user (@PlayerOne)
• {userAvatar} - URL to user's avatar
• {joinDate} - When the user joined

**Rank Elements:**
• {currentRank} - User's current rank name
• {points} - User's points
• {nextRank} - Next rank they can achieve
• {pointsToNext} - Points needed for promotion

**Custom Elements:**
• Create your own counters and values
• Auto-increment on events
• Reset on schedules`
          },
          {
            step: 2,
            title: "Using Elements in Messages",
            description: `To use an element:

**Method 1 - Element Picker:**
1. Click the { } icon in the toolbar
2. Browse categories on the left
3. Click an element to insert it

**Method 2 - Type Directly:**
1. Type {{ in any text field
2. A dropdown appears with suggestions
3. Select from the list or keep typing
4. Press Tab to autocomplete

Elements show in orange to indicate they're dynamic. When you preview, you'll see placeholder values.`,
          },
          {
            step: 3,
            title: "Creating Custom Counters",
            description: `Custom counters track values over time:

1. Go to Elements page in Settings
2. Click "Create Custom Element"
3. Choose "Counter" type
4. Set the name and key (e.g., "eventsHosted")
5. Configure:
   • Initial value (usually 0)
   • Reset schedule (daily, weekly, monthly, never)
   • Auto-increment events (what increases it)

Example: "Applications This Week"
• Starts at 0 on Monday
• Auto-increments when an application is submitted
• Resets weekly
• Use {applicationsThisWeek} in any message`
          },
          {
            step: 4,
            title: "Module Field Elements",
            description: `When you create modals, each field becomes an element:

**If your modal is named "Application" with fields:**
• Username → {application_username}
• Age → {application_age}
• Experience → {application_experience}

**Use these in action sequences:**
• Send message: "Thank you {application_username}!"
• Check condition: Is {application_age} over 18?
• Store in spreadsheet: Log {application_username} to column A

Module elements are only available in the sequence that runs after submission.`
          },
        ],

        commonTasks: [
          {
            title: "Add Member Count to Welcome Message",
            steps: [
              "Open your welcome message template",
              "In the description, add: 'We now have {memberCount} members!'",
              "Save the template",
              "When sent, {memberCount} becomes the actual number",
            ]
          },
          {
            title: "Create a Counter for Weekly Events",
            steps: [
              "Go to Elements page",
              "Create custom element 'eventsThisWeek'",
              "Set to reset weekly on Sunday",
              "Add auto-increment: On EVENT_CREATE",
              "Use in announcements: '{eventsThisWeek} events this week!'",
            ]
          },
        ],

        tips: [
          "Elements are resolved at send time, not save time - {memberCount} always shows current count.",
          "If an element can't be resolved, it shows as [elementName] with brackets.",
          "Use fallback syntax: {userName?there} shows 'there' if username is unavailable.",
          "Module field elements only exist during the action sequence that processes the submission.",
          "Custom counters can auto-increment based on events - no manual updates needed.",
        ],

        howItWorks: `Elements use a resolution pipeline:

1. Parser finds all {element:key} tokens in text
2. Context determines what elements are available (user context, server context, module submission)
3. Each element key is looked up in order:
   - Module fields (if in submission context)
   - User elements (if user context available)
   - Rank elements (if user has rank)
   - Server elements (server scope)
   - Custom counters (server scope)
   - System elements (global)
4. Values are substituted into text
5. Result is sent to Discord

Elements can also use computed values: {member_count / total_members * 100}%.`,

        databaseTables: [
          { table: "Element", purpose: "Element definitions with keys and types" },
          { table: "CustomCounter", purpose: "Counter configurations and values" },
          { table: "ElementUsage", purpose: "Tracks which templates use which elements" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/{id}/elements", method: "GET", description: "List available elements" },
          { endpoint: "POST /servers/{id}/elements", method: "POST", description: "Create custom element" },
          { endpoint: "GET /servers/{id}/elements/{key}", method: "GET", description: "Get element value" },
          { endpoint: "POST /servers/{id}/elements/{key}/increment", method: "POST", description: "Increment counter" },
          { endpoint: "POST /elements/resolve", method: "POST", description: "Resolve elements in text" },
        ],

        keyComponents: [
          { component: "ElementPicker", purpose: "Sidebar with browsable element categories" },
          { component: "ElementIntellisense", purpose: "Autocomplete dropdown when typing {{}}" },
          { component: "ElementEditor", purpose: "Create and edit custom elements" },
          { component: "CounterConfig", purpose: "Configure auto-increment counters" },
        ],
      },
    ],
  },

  // ============================================================
  // AUTOMATION
  // ============================================================
  {
    id: "automation",
    name: "Automation",
    icon: Zap,
    features: [
      {
        id: "automation-workbench",
        name: "Automation Workbench",
        description: "Visual workflow editor for creating automations with triggers and actions",
        icon: GitBranch,
        docFile: "Automation Workbench.md",

        whatItDoes: `The Automation Workbench is a visual, node-based editor where you create automations by connecting triggers to actions. Instead of writing code, you draw a flowchart: "When this happens → do this → then do that."

Triggers can be time-based (run every Monday at 9 AM) or event-based (when a member joins). Actions are the steps that run when triggered.`,

        whyUseIt: `• Automate repetitive tasks without coding
• Create complex workflows with conditions and branching
• Visualize your automation logic
• Chain multiple actions together
• Add delays, conditions, and branching paths`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Automations" in the Automation section
3. Click "Create Automation"
4. Choose a trigger type (time or event)
5. Add actions to the workflow
6. Save and enable`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding Triggers",
            description: `Every automation starts with a trigger:

**Time-Based Triggers:**
• Recurring: Every hour, daily, weekly, monthly
• One-time: Run once at a specific date/time
• Custom cron: Advanced scheduling

**Event-Based Triggers:**
• Member join/leave
• Message sent/deleted
• Voice join/leave
• Role added/removed
• Reaction added/removed

Choose your trigger in the left panel when creating an automation.`
          },
          {
            step: 2,
            title: "Adding Actions to Workflows",
            description: `After the trigger, add actions:

**Available Actions:**
• Send message to channel
• Send DM to user
• Assign/remove role
• Change nickname
• Wait (delay)
• Check condition (branch)
• Call webhook
• Log to channel
• Stop execution

Drag actions from the palette and connect them. Each action has configuration options in the right panel.`
          },
          {
            step: 3,
            title: "Using Conditions and Branching",
            description: `Add logic to your automation with conditions:

**Check Condition node:**
1. Add a "Check Condition" action
2. Set up your condition (e.g., "Does user have role X?")
3. Two branches appear: TRUE and FALSE
4. Add different actions to each branch

**Example:**
• Trigger: Member joins
• Condition: Has "Newbie" role?
• TRUE path: Send welcome to #general
• FALSE path: Send DM with verification link

Conditions can check roles, element values, time of day, etc.`
          },
          {
            step: 4,
            title: "Adding Filters to Events",
            description: `Event triggers can have filters:

**Why use filters?**
• "When member joins" → but only if they have specific role
• "When message sent" → but only in #support channel
• "When reaction added" → but only for specific emoji

**Add filters in the trigger panel:**
1. Select your event type
2. Click "Add Filter"
3. Choose field (channel, role, user, content)
4. Set operator (equals, contains, matches)
5. Set value

Multiple filters can be combined with AND/OR logic.`
          },
        ],

        commonTasks: [
          {
            title: "Create a Welcome Automation",
            steps: [
              "Create automation with 'Member Join' trigger",
              "Add 'Wait' action (5 minutes)",
              "Add 'Check Condition' - Has Verified role?",
              "TRUE: Send welcome embed to #general",
              "FALSE: Send DM with verification link",
              "Save and enable",
            ]
          },
          {
            title: "Schedule Daily Announcements",
            steps: [
              "Create automation with 'Daily 9AM' trigger",
              "Add 'Send Message' action",
              "Select #announcements channel",
              "Use template or build message inline",
              "Add elements like {memberCount}",
              "Save and enable",
            ]
          },
        ],

        tips: [
          "Test automations manually before enabling - use the 'Run Now' button.",
          "Use delays between actions for human-paced responses.",
          "Event filters reduce unnecessary automation runs - add them when possible.",
          "Check conditions let you create complex branching logic without multiple automations.",
          "One-time triggers are great for reminders and scheduled announcements.",
        ],

        howItWorks: `Automations use a node-graph architecture:

1. Trigger node starts the workflow
2. Each action node executes in sequence
3. Condition nodes create branches (TRUE/FALSE)
4. Wait nodes pause execution for specified time
5. All nodes have access to context variables

Context variables differ by trigger:
• Time trigger: {trigger.time}, {server.name}, {server.memberCount}
• Member join: {event.user.name}, {event.user.id}, {event.user.joinedAt}

The graph is stored as JSON and executed by the backend scheduler.`,

        databaseTables: [
          { table: "ScheduledSequence", purpose: "Automation configuration with trigger" },
          { table: "ScheduledSequenceExecution", purpose: "Execution history log" },
          { table: "ActionSequence", purpose: "Linked action sequence to execute" },
          { table: "ActionGraph", purpose: "Node-graph definition" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/{id}/automations", method: "GET", description: "List automations" },
          { endpoint: "POST /servers/{id}/automations", method: "POST", description: "Create automation" },
          { endpoint: "GET /servers/{id}/automations/{id}", method: "GET", description: "Get automation details" },
          { endpoint: "PATCH /servers/{id}/automations/{id}", method: "PATCH", description: "Update automation" },
          { endpoint: "POST /servers/{id}/automations/{id}/execute", method: "POST", description: "Run automation now" },
          { endpoint: "GET /servers/{id}/automations/{id}/history", method: "GET", description: "Execution history" },
        ],

        keyComponents: [
          { component: "AutomationWorkbench", purpose: "Main workflow editor canvas" },
          { component: "TriggerPanel", purpose: "Left panel for trigger configuration" },
          { component: "NodeCanvas", purpose: "Center canvas for node graph" },
          { component: "NodeInspector", purpose: "Right panel for node settings" },
          { component: "ActionPalette", purpose: "Sidebar of available actions" },
        ],
      },

      {
        id: "scheduled-sequences",
        name: "Scheduled Sequences",
        description: "Run action sequences on a schedule using cron expressions",
        icon: Clock,
        docFile: "Scheduled Sequences.md",

        whatItDoes: `Scheduled Sequences execute action sequences at specific times. Use cron expressions for complex scheduling (every Monday at 9 AM, first of every month, etc.) or use quick presets for common schedules.

Think of it like a cron job, but for Discord - send announcements, run cleanups, award points, etc., all on autopilot.`,

        whyUseIt: `• Weekly announcements without manual posting
• Daily reminders at specific times
• Monthly reports automatically generated
• Time-based promotions and role updates
• Cleanup tasks on a schedule`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Schedule" in the Automation section
3. Click "Create Sequence"
4. Set your schedule (preset or custom cron)
5. Link an action sequence to run
6. Enable and save`,

        stepByStep: [
          {
            step: 1,
            title: "Creating a Scheduled Sequence",
            description: `To create a scheduled automation:

1. Go to Schedule page
2. Click "Create Sequence"
3. Give it a name (e.g., "Weekly Announcement")
4. Choose schedule type:
   • Preset: Daily, Weekly, Monthly
   • Custom: Enter cron expression
5. Select timezone (important for international servers)
6. Link an action sequence
7. Click Enable
8. Save

The sequence will run automatically at the scheduled times.`
          },
          {
            step: 2,
            title: "Using Cron Expressions",
            description: `Cron expressions give precise control:

Format: minute hour day-of-month month day-of-week

**Examples:**
• 0 9 * * * - Every day at 9:00 AM
• 0 9 * * 1 - Every Monday at 9:00 AM
• 0 9 1 * * - First of every month at 9:00 AM
• */15 * * * * - Every 15 minutes
• 0 17 * * 5 - Every Friday at 5:00 PM

The preview shows the next 5 run times to verify your expression is correct.`
          },
          {
            step: 3,
            title: "Managing Sequences",
            description: `From the Schedule page you can:

**View all sequences:**
• See name, schedule, last run, next run
• Enable/disable with toggle
• See status (active, paused, failed)

**Actions:**
• Edit: Change schedule or linked sequence
• Duplicate: Copy to create variations
• Delete: Remove permanently
• Run Now: Execute immediately (testing)
• View History: See past runs and results

The History tab shows each execution with success/failure status.`
          },
        ],

        commonTasks: [
          {
            title: "Create a Daily Stats Announcement",
            steps: [
              "Create action sequence 'Daily Stats'",
              "Add 'Send Message' action to #announcements",
              "Use elements: {memberCount}, {onlineCount}, {eventsToday}",
              "Go to Schedule page",
              "Create sequence with 'Daily 9AM' preset",
              "Link the 'Daily Stats' sequence",
              "Enable and save",
            ]
          },
          {
            title: "Run Weekly Cleanup",
            steps: [
              "Create action sequence 'Weekly Cleanup'",
              "Add actions: Remove 'Inactive' role, Archive old channels",
              "Go to Schedule page",
              "Create sequence with 'Weekly Sunday' preset",
              "Set time to midnight",
              "Link the 'Weekly Cleanup' sequence",
              "Enable and save",
            ]
          },
        ],

        tips: [
          "Always set the correct timezone - your server members might be in different timezones than you.",
          "Test new sequences with 'Run Now' before relying on the schedule.",
          "Check the history tab if sequences aren't running - it shows failure reasons.",
          "One-time schedules are perfect for reminders - they run once then disable themselves.",
          "Use preset schedules for common patterns, custom cron for everything else.",
        ],

        howItWorks: `Scheduled sequences use a backend scheduler:

1. Backend service checks every minute for due sequences
2. Cron expression is evaluated against current time
3. If match, the linked action sequence is loaded
4. Sequence executed step by step
5. Results logged to execution history
6. Next run time calculated and stored

The scheduler handles:
• Timezone conversion
• Daylight saving time
• Failed execution retry (configurable)
• Concurrent execution prevention`,

        databaseTables: [
          { table: "ScheduledSequence", purpose: "Sequence configuration with cron schedule" },
          { table: "ScheduledSequenceExecution", purpose: "History of each execution" },
          { table: "ActionSequence", purpose: "The sequence to execute" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/{id}/scheduled-sequences", method: "GET", description: "List scheduled sequences" },
          { endpoint: "POST /servers/{id}/scheduled-sequences", method: "POST", description: "Create sequence" },
          { endpoint: "GET /servers/{id}/scheduled-sequences/{id}", method: "GET", description: "Get sequence details" },
          { endpoint: "PATCH /servers/{id}/scheduled-sequences/{id}", method: "PATCH", description: "Update sequence" },
          { endpoint: "POST /servers/{id}/scheduled-sequences/{id}/execute", method: "POST", description: "Run sequence immediately" },
          { endpoint: "GET /servers/{id}/scheduled-sequences/{id}/history", method: "GET", description: "Get execution history" },
        ],

        keyComponents: [
          { component: "ScheduledSequenceList", purpose: "List of all sequences with status" },
          { component: "SequenceForm", purpose: "Create/edit sequence form" },
          { component: "CronEditor", purpose: "Visual cron expression builder" },
          { component: "CronPreview", purpose: "Shows next 5 run times" },
          { component: "ExecutionHistory", purpose: "History log with status" },
        ],
      },

      {
        id: "action-sequences",
        name: "Action Sequences",
        description: "Multi-step workflows that execute when triggered",
        icon: Play,
        docFile: "Action Sequences.md",

        whatItDoes: `Action Sequences are ordered lists of actions that run one after another. They're like recipes: "Do step 1, then step 2, then step 3." Each step can be sending a message, assigning a role, checking a condition, waiting, or calling an API.

Sequences are triggered by: button clicks, select menu choices, modal submissions, schedules, or webhook calls.`,

        whyUseIt: `• Process form submissions automatically
• Create multi-step onboarding flows
• Send confirmations and follow-up messages
• Make decisions based on conditions
• Chain together complex workflows`,

        howToAccess: `1. Create in the Automation Workbench
2. Or create standalone from Action Sequences page
3. Link to buttons in Message Builder
4. Or link to schedules in Scheduled Sequences`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding Action Types",
            description: `Actions are the building blocks:

**Communication:**
• SEND_MESSAGE - Post to channel or DM
• SEND_OUTPUT - Reply to interaction

**User Management:**
• ASSIGN_ROLE - Add role to user
• REMOVE_ROLE - Remove role
• CHANGE_NICKNAME - Update display name

**Flow Control:**
• CHECK_CONDITION - Branch based on criteria
• DELAY - Wait before next step
• STOP - End execution

**External:**
• CALL_API - Make HTTP request
• CREATE_TICKET - Open support ticket
• ADD_TO_SHEET - Export to Google Sheets

**Data:**
• UPDATE_ELEMENT - Modify counter
• LOG_EVENT - Record for analytics`
          },
          {
            step: 2,
            title: "Creating a Sequence",
            description: `Build your workflow step by step:

1. Go to Action Sequences page
2. Click "Create Sequence"
3. Give it a name and description
4. Add steps in order:
   - Click "Add Step"
   - Choose action type
   - Configure the action
   - Set error handling
5. Reorder steps by dragging
6. Save the sequence

Sequences can be tested with the "Test Run" button.`
          },
          {
            step: 3,
            title: "Using Conditions",
            description: `Add branching logic:

**CHECK_CONDITION action:**
1. Add condition type (member has role, element equals, etc.)
2. Set comparison value
3. Two branches appear: TRUE and FALSE
4. Add different actions to each branch

**Condition types:**
• MEMBER_HAS_ROLE - Check user's roles
• ELEMENT_EQUALS - Compare element value
• ELEMENT_MATCHES_REGEX - Pattern match
• ELEMENT_GREATER_THAN - Numeric comparison
• ELEMENT_LESS_THAN - Numeric comparison
• ELEMENT_CONTAINS - String contains
• AND / OR / NOT - Combine conditions

You can nest conditions for complex logic.`
          },
          {
            step: 4,
            title: "Error Handling",
            description: `Each step has error handling options:

**STOP (default):**
• Halt entire sequence
• Log error message
• User sees generic error

**CONTINUE:**
• Log error
• Skip to next step
• Sequence continues

**GOTO_STEP:**
• Jump to specific step
• Useful for retry logic

Configure error handling per step based on criticality.`
          },
        ],

        commonTasks: [
          {
            title: "Create an Application Processing Sequence",
            steps: [
              "Create sequence 'Process Application'",
              "Step 1: CHECK_CONDITION - Is user already member?",
              "TRUE branch: Send 'Already member' message, STOP",
              "FALSE branch: Continue",
              "Step 2: SEND_MESSAGE - Confirmation to user",
              "Step 3: ASSIGN_ROLE - Give 'Applicant' role",
              "Step 4: SEND_MESSAGE - Notify staff channel",
              "Step 5: UPDATE_ELEMENT - Increment applications counter",
            ]
          },
          {
            title: "Create a Conditional Role Assignment",
            steps: [
              "Create sequence 'Assign Division Role'",
              "Step 1: CHECK_CONDITION - Element equals selectedDivision",
              "Branch for each division value",
              "Each branch: ASSIGN_ROLE for that division",
              "Final step: SEND_MESSAGE confirmation",
            ]
          },
        ],

        tips: [
          "Test sequences manually before linking to buttons - use the Test Run button.",
          "Use DELAY actions for human-paced responses - don't spam channels instantly.",
          "Always set error handling for external API calls - they can fail.",
          "LOG_EVENT actions help debug sequences - check the logs if something goes wrong.",
          "Conditions can be nested - think about all edge cases.",
        ],

        howItWorks: `Action sequences execute through the backend:

1. Trigger received (button click, schedule, etc.)
2. Backend loads the sequence definition
3. For each step in order:
   a. Execute action
   b. Store result in execution context
   c. If error, apply error handling
   d. If CHECK_CONDITION, follow appropriate branch
4. All results available as context variables
5. Execution logged with timing

The execution context includes:
• User who triggered
• Channel, server, message IDs
• Form values (if from modal)
• Element values
• Previous step results`,

        databaseTables: [
          { table: "ActionSequence", purpose: "Sequence definition with steps" },
          { table: "ActionStep", purpose: "Individual step configuration" },
          { table: "CheckCondition", purpose: "Condition definitions for branching" },
          { table: "SequenceExecution", purpose: "Execution history log" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/{id}/sequences", method: "GET", description: "List action sequences" },
          { endpoint: "POST /servers/{id}/sequences", method: "POST", description: "Create sequence" },
          { endpoint: "GET /servers/{id}/sequences/{id}", method: "GET", description: "Get sequence details" },
          { endpoint: "PUT /servers/{id}/sequences/{id}", method: "PUT", description: "Update sequence" },
          { endpoint: "POST /servers/{id}/sequences/{id}/test", method: "POST", description: "Test run sequence" },
          { endpoint: "POST /bot/sequences/{id}/execute", method: "POST", description: "Bot executes sequence" },
        ],

        keyComponents: [
          { component: "SequenceEditor", purpose: "Visual sequence builder" },
          { component: "ActionCard", purpose: "Individual step configuration" },
          { component: "ConditionBuilder", purpose: "Build condition logic" },
          { component: "SequenceTester", purpose: "Test sequences manually" },
          { component: "ExecutionLog", purpose: "View execution history" },
        ],
      },

      {
        id: "webhook-triggers",
        name: "Webhook Triggers",
        description: "Trigger automations from external services via HTTP",
        icon: Webhook,
        docFile: "Webhook Triggers.md",

        whatItDoes: `Webhook Triggers create HTTP endpoints that external services can call to trigger your automations. When a webhook receives a request, it validates it and executes a linked action sequence.

This lets you integrate BRM5 with external tools like GitHub, Stripe, custom APIs, or any service that can send webhooks.`,

        whyUseIt: `• Connect to external services without custom code
• React to events from other platforms
• Integrate with payment systems (Stripe, PayPal)
• Connect to GitHub for CI/CD notifications
• Receive alerts from monitoring systems`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Webhooks" in the Automation section
3. Click "Create Webhook"
4. Configure security settings
5. Link to an action sequence
6. Use the provided URL in external service`,

        stepByStep: [
          {
            step: 1,
            title: "Creating a Webhook",
            description: `Set up your webhook endpoint:

1. Go to Webhooks page
2. Click "Create Webhook"
3. Enter a name (e.g., "GitHub Push Handler")
4. Optionally configure:
   • HMAC secret for signature validation
   • IP allowlist for source restriction
   • Rate limiting (requests per minute)
5. Select action sequence to run
6. Save to get your unique URL

The URL format is: /webhooks/{your-unique-path}`
          },
          {
            step: 2,
            title: "Configuring Security",
            description: `Protect your webhook from abuse:

**HMAC Secret:**
• Enter a secret key
• External service must sign requests with this key
• BRM5 validates the signature
• Prevents unauthorized calls

**IP Allowlist:**
• Enter allowed IP addresses
• Only requests from these IPs are accepted
• Useful for known services like GitHub IPs

**Rate Limiting:**
• Set max requests per minute
• Prevents abuse and flooding
• Configurable per webhook`
          },
          {
            step: 3,
            title: "Using the Webhook URL",
            description: `Connect external services:

**In external service:**
1. Copy the webhook URL
2. Paste into external service's webhook configuration
3. If using HMAC, copy the secret too
4. Configure the service to send POST requests
5. Payload can be any JSON

**In action sequence:**
1. The webhook payload is available as Elements
2. Access: {webhook.body.fieldName}
3. Use conditions to check payload values
4. Process and respond as needed`
          },
          {
            step: 4,
            title: "Viewing Execution History",
            description: `Track webhook calls:

1. Go to Webhooks page
2. Click on a webhook
3. View the "History" tab
4. See each call with:
   • Timestamp
   • Source IP
   • Payload received
   • Execution status
   • Response sent

Failed calls show error details. Successful calls show what sequence ran.`
          },
        ],

        commonTasks: [
          {
            title: "Connect GitHub Push Events",
            steps: [
              "Create webhook named 'GitHub Push'",
              "Set HMAC secret (use GitHub's secret field)",
              "Create action sequence for push handling",
              "Link sequence to webhook",
              "Copy webhook URL",
              "In GitHub repo settings, add webhook URL",
              "Set content type to JSON",
              "Save and test with a push event",
            ]
          },
          {
            title: "Connect Payment Webhooks",
            steps: [
              "Create webhook named 'Payment Received'",
              "Set HMAC secret from payment provider",
              "Create action sequence for payment handling",
              "Use conditions to check payment status",
              "Link sequence to webhook",
              "Add webhook URL to payment provider dashboard",
            ]
          },
        ],

        tips: [
          "Always use HMAC validation for webhooks from untrusted sources.",
          "Rate limit webhooks to prevent abuse - even from legitimate services.",
          "Log the full payload in your action sequence for debugging.",
          "Use IP allowlists when you know the source IPs (like GitHub's IP ranges).",
          "Test webhooks with curl before connecting to external services.",
        ],

        howItWorks: `Webhooks receive and process requests:

1. External service sends POST to webhook URL
2. BRM5 receives request at public endpoint
3. Validates IP allowlist (if configured)
4. Validates HMAC signature (if configured)
5. Checks rate limit (if configured)
6. Parses JSON payload
7. Loads linked action sequence
8. Executes sequence with payload as Elements
9. Logs execution result
10. Returns success response to caller

The execution context includes:
• {webhook.body.*} - Parsed JSON body
• {webhook.headers.*} - Request headers
• {webhook.ip} - Source IP address`,

        databaseTables: [
          { table: "WebhookTrigger", purpose: "Webhook endpoint configuration" },
          { table: "WebhookTriggerExecution", purpose: "History of webhook calls" },
          { table: "ActionSequence", purpose: "Linked sequence to execute" },
        ],

        apiEndpoints: [
          { endpoint: "GET /servers/{id}/webhook-triggers", method: "GET", description: "List webhooks" },
          { endpoint: "POST /servers/{id}/webhook-triggers", method: "POST", description: "Create webhook" },
          { endpoint: "GET /servers/{id}/webhook-triggers/{id}", method: "GET", description: "Get webhook details" },
          { endpoint: "PATCH /servers/{id}/webhook-triggers/{id}", method: "PATCH", description: "Update webhook" },
          { endpoint: "DELETE /servers/{id}/webhook-triggers/{id}", method: "DELETE", description: "Delete webhook" },
          { endpoint: "GET /servers/{id}/webhook-triggers/{id}/history", method: "GET", description: "Execution history" },
          { endpoint: "POST /webhooks/{path}", method: "POST", description: "Public webhook endpoint" },
        ],

        keyComponents: [
          { component: "WebhookList", purpose: "List of webhooks with status" },
          { component: "WebhookForm", purpose: "Create/edit webhook form" },
          { component: "HmacConfig", purpose: "HMAC secret configuration" },
          { component: "IpAllowlist", purpose: "IP restriction settings" },
          { component: "WebhookHistory", purpose: "Execution history log" },
        ],
      },
    ],
  },

  // ============================================================
  // ANALYTICS & MODERATION
  // ============================================================
  {
    id: "analytics",
    name: "Analytics & Moderation",
    icon: BarChart3,
    features: [
      {
        id: "analytics-dashboard",
        name: "Analytics Dashboard",
        description: "Visual insights into server activity through charts and metrics",
        icon: BarChart3,
        docFile: "Analytics Dashboard.md",

        whatItDoes: `The Analytics Dashboard shows you what's happening in your server through charts, graphs, and metrics. See event trends, top participants, message activity, voice channel usage, and more - all in one place.

Instead of guessing what's going on, you have real data to make decisions about moderation, engagement, and community building.`,

        whyUseIt: `• Understand member activity patterns
• Identify your most active members
• Track engagement over time
• Make data-driven moderation decisions
• Measure the impact of events and changes
• Spot trends before they become problems`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Analytics" in the Analytics section
3. View overview metrics at the top
4. Scroll down for detailed charts
5. Use date filters to see specific time ranges
6. Click on events for details`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding the Overview",
            description: `The top of the dashboard shows key metrics:

**Total Events:** All events tracked in the selected period
**Unique Users:** How many different members were active
**Event Types:** Number of different event categories
**Daily Average:** Events per day on average

These numbers give you a quick sense of overall activity. Hover over each for more details.`
          },
          {
            step: 2,
            title: "Reading the Charts",
            description: `The dashboard includes several visualizations:

**Pie Chart - Event Distribution:**
• Shows breakdown of event types
• Hover for percentages
• Click legend to toggle categories

**Bar Chart - Top Events:**
• Most frequent events by type
• Sorted by occurrence count
• Helps identify patterns

**Activity Timeline:**
• Events over time (daily/weekly)
• Spot peaks and valleys
• Correlate with server changes

**User Activity:**
• Most active members
• Helps identify engaged users vs lurkers`
          },
          {
            step: 3,
            title: "Filtering and Exploring",
            description: `Drill down into specific data:

**Date Range:**
• Select preset ranges (today, week, month)
• Or set custom start/end dates
• Charts update automatically

**Event Type Filter:**
• Show only specific event categories
• Compare message events vs voice events
• Focus on what matters to you

**User Filter:**
• See activity for specific members
• Track individual engagement
• Investigate moderation concerns`
          },
          {
            step: 4,
            title: "Using Analytics for Decisions",
            description: `Turn data into action:

**Low Activity Periods:**
• Schedule events during slow times
• Post announcements when more people see them

**Inactive Members:**
• Identify who hasn't been active
• Consider outreach or cleanup

**Popular Channels:**
• See where conversations happen
• Focus moderation efforts there

**Voice Usage Patterns:**
• When are voice channels used?
• Adjust channel capacity accordingly`
          },
        ],

        commonTasks: [
          {
            title: "Find Most Active Members",
            steps: [
              "Open Analytics Dashboard",
              "Scroll to User Activity section",
              "Sort by event count",
              "See top contributors",
              "Click member for detailed history",
            ]
          },
          {
            title: "Compare Week over Week",
            steps: [
              "Set date range to last week",
              "Note total events and patterns",
              "Change to previous week",
              "Compare metrics",
              "Identify trends",
            ]
          },
        ],

        tips: [
          "Analytics are updated in real-time - no need to refresh.",
          "Combine analytics with member management - click a member to see their activity.",
          "Export data for deeper analysis in spreadsheets or BI tools.",
          "Set up scheduled reports to get analytics delivered to your inbox.",
          "Track specific events by creating custom event types in your integrations.",
        ],

        howItWorks: `Analytics data flows through the system:

1. Bot tracks Discord events (messages, voice, reactions, etc.)
2. Events batched and sent to API
3. API stores in analytics database
4. Aggregation jobs run periodically for summaries
5. Dashboard queries aggregated data
6. Charts rendered with Recharts library

Events are stored with:
• Timestamp
• Event type
• User ID
• Channel ID
• Server ID
• Metadata (varies by event type)`

        ,

        databaseTables: [
          { table: "AnalyticsEvent", purpose: "Individual event records" },
          { table: "AnalyticsMetric", purpose: "Aggregated metrics" },
          { table: "ServerStats", purpose: "Server-level statistics" },
          { table: "UserStats", purpose: "Per-user statistics" },
          { table: "UserDailyStats", purpose: "Daily user activity rollups" },
        ],

        apiEndpoints: [
          { endpoint: "POST /track", method: "POST", description: "Track analytics event" },
          { endpoint: "GET /events", method: "GET", description: "Query analytics events" },
          { endpoint: "GET /servers/{id}/dashboard", method: "GET", description: "Get dashboard stats" },
          { endpoint: "GET /servers/{id}/summary", method: "GET", description: "Get event summary" },
          { endpoint: "GET /servers/{id}/users/{id}/activity", method: "GET", description: "Get user activity" },
          { endpoint: "GET /servers/{id}/top-events", method: "GET", description: "Get top events" },
        ],

        keyComponents: [
          { component: "AnalyticsDashboard", purpose: "Main dashboard page" },
          { component: "PieChart", purpose: "Event distribution chart" },
          { component: "BarChart", purpose: "Top events chart" },
          { component: "MetricsCard", purpose: "Individual metric display" },
          { component: "RecentEventsList", purpose: "Latest activity feed" },
          { component: "useAnalytics hook", purpose: "Fetch analytics data" },
        ],
      },

      {
        id: "moderation-system",
        name: "Moderation System",
        description: "Comprehensive tools for managing server behavior",
        icon: Gavel,
        docFile: "Moderation System.md",

        whatItDoes: `The Moderation System provides everything you need to keep your server orderly: warnings, mutes, kicks, bans, and blacklists. Track all moderation actions, review appeals, and maintain a safe environment.

More than just punishment tools, it includes cross-server blacklists and appeal handling so you can manage moderation professionally.`,

        whyUseIt: `• Keep server orderly with clear consequences
• Track all moderation actions for accountability
• Handle appeals through a formal process
• Block known bad actors across your server hub
• Maintain moderation history for each member`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Moderation" in the Moderation section
3. Use tabs: Punishments, Blacklist, Promo Locks
4. Issue punishments from member profiles or directly
5. Review and manage from the Moderation page`,

        stepByStep: [
          {
            step: 1,
            title: "Issuing Punishments",
            description: `To punish a member:

**From Member Profile:**
1. Go to Members page
2. Find the member
3. Click their profile
4. Click "Punish" button
5. Select type: Warn, Mute, Kick, Ban
6. Enter reason
7. Set duration (for mutes/timeouts)
8. Confirm

**From Moderation Page:**
1. Go to Moderation > Punishments
2. Click "Issue Punishment"
3. Select member from dropdown
4. Choose punishment type
5. Enter reason and configure options
6. Submit

All punishments are logged with the moderator who issued them.`
          },
          {
            step: 2,
            title: "Managing Blacklist",
            description: `The blacklist prevents users from joining your server:

**Add to Blacklist:**
1. Go to Moderation > Blacklist
2. Click "Add to Blacklist"
3. Enter Discord ID or username
4. Add reason
5. Optionally notify hub servers
6. Submit

**Blacklisted users who try to join:**
• Are automatically kicked
• Receive a DM explaining why
• Moderators are notified

**Remove from Blacklist:**
1. Find the entry in Blacklist tab
2. Click "Remove"
3. Add removal reason
4. They can now join again`
          },
          {
            step: 3,
            title: "Handling Appeals",
            description: `Members can appeal punishments:

**View Appeals:**
1. Moderation > Appeals tab
2. See pending appeals
3. Click to view details

**Process Appeal:**
1. Review the appeal reason
2. Check punishment history
3. Choose action:
   • Approve: Remove/shorten punishment
   • Deny: Punishment stands
4. Add your reasoning
5. Submit decision

Member receives notification of the decision.`
          },
          {
            step: 4,
            title: "Viewing History",
            description: `All moderation actions are tracked:

**Member History:**
1. Go to member's profile
2. Click "History" tab
3. See all warnings, mutes, kicks, bans
4. Each shows date, reason, moderator

**Server History:**
1. Moderation > Punishments tab
2. Filter by type, date range, moderator
3. Export for records

**Audit Log:**
1. Moderation > Audit Log
2. See all moderation actions
3. Who did what and when`
          },
        ],

        commonTasks: [
          {
            title: "Issue a Warning",
            steps: [
              "Find the member in Members page",
              "Click their profile",
              "Click 'Punish'",
              "Select 'Warn'",
              "Enter clear reason",
              "Submit - member receives DM with warning",
            ]
          },
          {
            title: "Ban a Problem User",
            steps: [
              "Go to Moderation > Punishments",
              "Click 'Issue Punishment'",
              "Select member",
              "Choose 'Ban'",
              "Enter detailed reason",
              "Optionally delete message history",
              "Confirm - user banned and logged",
            ]
          },
        ],

        tips: [
          "Always include clear reasons - they're shown to the member and recorded in history.",
          "Use warnings for first offenses - they don't restrict the user but create a record.",
          "Mute durations should match the offense severity - don't mute for minor issues.",
          "Blacklist is for serious cases - users on the blacklist can't rejoin.",
          "Check member history before issuing punishment - repeat offenders may need stronger action.",
        ],

        howItWorks: `Moderation actions flow through the system:

1. Moderator issues punishment via dashboard
2. Request sent to API with details
3. API validates permissions
4. Action recorded in database
5. API sends command to bot
6. Bot executes action in Discord:
   • Warn: DM sent to user
   • Mute: Role assigned/timeout applied
   • Kick: User removed from server
   • Ban: User banned from server
7. Member notified (if not banned)
8. Action logged to history

Blacklist checks happen on member join events.`,

        databaseTables: [
          { table: "Punishment", purpose: "Punishment records with type, reason, dates" },
          { table: "PL5Blacklist", purpose: "Cross-server blacklist entries" },
          { table: "PL5BlacklistConfig", purpose: "Blacklist configuration" },
          { table: "PunishmentNotification", purpose: "Notifications to hub servers" },
          { table: "PunishmentAppeal", purpose: "Appeal requests and status" },
        ],

        apiEndpoints: [
          { endpoint: "POST /servers/{id}/punishments", method: "POST", description: "Issue punishment" },
          { endpoint: "POST /punishments/{id}/revoke", method: "POST", description: "Revoke punishment" },
          { endpoint: "GET /blacklist/{discordId}", method: "GET", description: "Check blacklist status" },
          { endpoint: "POST /blacklist", method: "POST", description: "Add to blacklist" },
          { endpoint: "DELETE /blacklist/{discordId}", method: "DELETE", description: "Remove from blacklist" },
          { endpoint: "GET /servers/{id}/punishment-appeals", method: "GET", description: "List appeals" },
          { endpoint: "POST /servers/{id}/punishment-appeals/{id}/review", method: "POST", description: "Review appeal" },
        ],

        keyComponents: [
          { component: "PunishmentTable", purpose: "List of punishments with filters" },
          { component: "BlacklistTable", purpose: "Blacklist management interface" },
          { component: "PunishmentDialog", purpose: "Issue punishment form" },
          { component: "AppealViewer", purpose: "Review and process appeals" },
          { component: "useModeration hook", purpose: "Punishment operations" },
        ],
      },

      {
        id: "events-system",
        name: "Events System",
        description: "Create, schedule, and manage server events with RSVP tracking",
        icon: Calendar,
        docFile: "Events System.md",

        whatItDoes: `The Events System lets you plan server events in advance, track RSVPs, record attendance, and award points. Create one-time or recurring events, set capacity limits, and see who's coming before it starts.

Perfect for gaming sessions, meetings, competitions, community nights, and any scheduled server activity.`,

        whyUseIt: `• Plan events in advance with RSVP tracking
• See who's attending before the event
• Automatically award points for attendance
• Keep event history for member records
• Schedule recurring events (weekly, monthly)`,

        howToAccess: `1. Select your server from the sidebar
2. Click "Events" in the Management section
3. See upcoming events on the calendar
4. Click "Create Event" to add new
5. View event details to see RSVPs`,

        stepByStep: [
          {
            step: 1,
            title: "Creating an Event",
            description: `Set up your event:

1. Go to Events page
2. Click "Create Event"
3. Fill in details:
   • Title: Name of the event
   • Description: What's happening
   • Date/Time: When it occurs
   • Location: Channel or external
   • Capacity: Max attendees (optional)
   • RSVP deadline: Last day to sign up
4. Set points for attendance
5. Publish the event

The event appears on the calendar and in Discord channel.`
          },
          {
            step: 2,
            title: "Managing RSVPs",
            description: `Track who's coming:

**View RSVPs:**
1. Click on an event
2. See RSVP list with status:
   • Going
   • Maybe
   • Not Going
3. Filter by status
4. See total count

**RSVP Options:**
• Members can RSVP via dashboard or Discord
• Set capacity limits
• Close RSVP at deadline
• Export RSVP list

**Notify Attendees:**
• Send reminders before event
• Ping relevant roles
• Post in event channel`
          },
          {
            step: 3,
            title: "Running an Event",
            description: `On the day of the event:

1. Go to the event
2. Click "Start Event" when beginning
3. Status changes to "Active"
4. Attendance tracking begins:
   • Members join voice channel
   • Attendance auto-logged
   • Or manually mark attendance
5. Event runs normally
6. Click "End Event" when finished
7. Points awarded to attendees`
          },
          {
            step: 4,
            title: "Post-Event Management",
            description: `After the event:

1. Event status: "Completed"
2. Attendance record saved
3. Points distributed to attendees
4. View event history:
   • Who attended
   • Duration
   • Points awarded

**Event History:**
• All past events stored
• Filter by date, type, host
• See member's attendance record

**Attendance Points:**
• Automatically added to members
• Based on points configured
• Bonus for hosts (optional)`
          },
        ],

        commonTasks: [
          {
            title: "Create a Weekly Game Night",
            steps: [
              "Create event 'Game Night'",
              "Set to recurring: Every Friday",
              "Set time: 8 PM",
              "Set location: Gaming Voice Channel",
              "Set capacity: 20",
              "Set attendance points: 50",
              "Publish - members can RSVP",
            ]
          },
          {
            title: "Mark Attendance After Event",
            steps: [
              "Go to event page",
              "Click 'Mark Attendance'",
              "See list of RSVPs",
              "Check who actually attended",
              "Or use auto-detect from voice channel",
              "Submit - points awarded",
            ]
          },
        ],

        tips: [
          "Set RSVP deadlines to prevent last-minute signups.",
          "Use capacity limits for limited-space events like tournaments.",
          "Send reminders 1 hour before the event.",
          "Host bonus points encourage members to organize events.",
          "Check the attendance history to find members who never attend.",
        ],

        howItWorks: `Events follow a state machine:

1. **SCHEDULED:** Event created, waiting for start time
   • Members can RSVP
   • Host can edit details

2. **ACTIVE:** Event is running
   • Attendance being tracked
   • Members join voice channel
   • Host can end early

3. **COMPLETED:** Event finished
   • Attendance finalized
   • Points distributed
   • History recorded

4. **CANCELLED:** Event cancelled
   • Members notified
   • No points awarded

Transitions trigger notifications to attendees.`,

        databaseTables: [
          { table: "EventType", purpose: "Event category/type definition" },
          { table: "Event", purpose: "Event instance with details" },
          { table: "EventRSVP", purpose: "Member RSVP records" },
          { table: "EventLog", purpose: "Event completion records" },
          { table: "EventAttendance", purpose: "Who attended the event" },
          { table: "EventRequest", purpose: "Event request for approval" },
        ],

        apiEndpoints: [
          { endpoint: "POST /servers/{id}/events", method: "POST", description: "Create event" },
          { endpoint: "PATCH /servers/{id}/events/{id}", method: "PATCH", description: "Update event" },
          { endpoint: "POST /servers/{id}/events/{id}/start", method: "POST", description: "Start scheduled event" },
          { endpoint: "POST /servers/{id}/events/{id}/cancel", method: "POST", description: "Cancel event" },
          { endpoint: "GET /servers/{id}/events/upcoming", method: "GET", description: "Get upcoming events" },
          { endpoint: "POST /servers/{id}/events/{id}/rsvp", method: "POST", description: "RSVP to event" },
          { endpoint: "POST /servers/{id}/events/{id}/attendance", method: "POST", description: "Record attendance" },
        ],

        keyComponents: [
          { component: "EventCard", purpose: "Event display with status" },
          { component: "EventForm", purpose: "Create/edit event dialog" },
          { component: "EventCalendar", purpose: "Calendar view of events" },
          { component: "RSVPButton", purpose: "RSVP interaction button" },
          { component: "AttendanceList", purpose: "Mark attendance interface" },
          { component: "useEvents hook", purpose: "Fetch and mutate events" },
        ],
      },
    ],
  },

  // ============================================================
  // ADVANCED FEATURES
  // ============================================================
  {
    id: "advanced",
    name: "Advanced Features",
    icon: Layers2,
    features: [
      {
        id: "component-v2-builder",
        name: "Component V2 Builder",
        description: "Create Discord Components V2 messages with containers, sections, and actions",
        icon: Layers2,
        docFile: "Component V2 Builder.md",

        whatItDoes: `Component V2 is Discord's newest message format, allowing for rich layouts with containers, sections, media galleries, and interactive buttons. The Component V2 Builder provides a visual editor for creating these advanced messages without writing JSON.

Unlike embeds, Component V2 messages support structured layouts with multiple text blocks, images in grids, and buttons that can trigger actions.`,

        whyUseIt: `• Create richer layouts than embeds allow
• Combine text, images, and buttons in one message
• Build stats cards with computed values
• Create interactive messages with actions
• Support for separators and visual organization`,

        howToAccess: `1. Go to Message Builder
2. Select "Component" mode at the top
3. Add containers and components from sidebar
4. Configure each component in the editor
5. Preview in real-time
6. Send or save as template`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding Component Types",
            description: `Component V2 has several building blocks:

**Container:** Groups content together with an accent color
**Text Display:** Markdown text block
**Section:** Text with a thumbnail or button accessory
**Media Gallery:** Grid of images/videos
**Separator:** Visual divider between content
**Action Row:** Container for buttons and select menus

Each component has specific properties and constraints. Learn what each does before combining them.`
          },
          {
            step: 2,
            title: "Building a Container",
            description: `Containers group related content:

1. Click "Add Container" from sidebar
2. Container appears in the canvas
3. Set accent color (optional)
4. Drag components into container:
   - Text Display for content
   - Media Gallery for images
   - Sections for text + thumbnail
   - Separators between sections
5. Each component can be reordered by dragging

Containers are the main structural element. Most messages have one or two containers.`
          },
          {
            step: 3,
            title: "Adding Interactive Buttons",
            description: `Buttons make messages interactive:

1. Add an Action Row to your container
2. Click "Add Button" inside the Action Row
3. Configure button:
   - Label: Button text
   - Style: Primary, Secondary, Success, Danger
   - Emoji: Optional emoji
   - Disabled: Gray out if needed
4. Set the action:
   - Open Modal: Show a form
   - Run Sequence: Execute automation
   - Open URL: Link to website

Buttons in the same Action Row appear side by side (max 5).`
          },
          {
            step: 4,
            title: "Creating Stats Cards",
            description: `Stats cards show computed values:

1. Add a Text Display component
2. Click "Edit Stats Card" button
3. Configure title and description
4. Add stats to the grid
5. For each stat:
   - Label: "Members Online"
   - Value: Static or computed
6. For computed values:
   - Click "Edit Graph"
   - Add input nodes (stats, elements)
   - Connect to operation nodes
   - Format output

Stats cards update dynamically when the message is sent or viewed.`
          },
        ],

        commonTasks: [
          {
            title: "Create an Announcement with Image",
            steps: [
              "Add Container with accent color",
              "Add Text Display for announcement text",
              "Add Media Gallery with event image",
              "Add Separator",
              "Add Action Row with buttons",
              "Button 1: 'Learn More' → Link",
              "Button 2: 'RSVP' → Open modal",
            ]
          },
          {
            title: "Create a Stats Dashboard",
            steps: [
              "Add Container",
              "Add Text Display for title",
              "Add Stats Card component",
              "Configure stats: Members, Online, Events",
              "Add computation graphs for percentages",
              "Preview computed values",
            ]
          },
        ],

        tips: [
          "Use separators to visually separate sections - they improve readability.",
          "Action Rows can only have 5 buttons max - group related actions together.",
          "Stats cards are computed when the message is sent, not when it's created.",
          "Test buttons in a test channel before sending to announcements.",
          "Use sections when you want text next to an image thumbnail.",
        ],

        howItWorks: `Component V2 messages are structured data:

1. Builder stores components as C2TopLevelItem structure
2. Each component has a kind (container, text, section, etc.)
3. Components have content and optional accessories
4. On send, structure converted to Discord API format
5. Bot sends via Discord's Component V2 endpoint
6. Discord renders the message in client

The conversion happens in discord-json-converter.ts, which transforms internal format to Discord's expected JSON.`,

        databaseTables: [
          { table: "ContainerTemplate", purpose: "Saved Component V2 containers" },
          { table: "ActionSequence", purpose: "Button action sequences" },
          { table: "StatsCardConfig", purpose: "Stats card configurations" },
        ],

        apiEndpoints: [
          { endpoint: "POST /servers/{id}/messages/send", method: "POST", description: "Send Component V2 message" },
          { endpoint: "GET /servers/{id}/containers", method: "GET", description: "List saved containers" },
          { endpoint: "POST /servers/{id}/containers", method: "POST", description: "Save container template" },
          { endpoint: "GET /servers/{id}/containers/{id}", method: "GET", description: "Get container details" },
          { endpoint: "DELETE /servers/{id}/containers/{id}", method: "DELETE", description: "Delete container" },
        ],

        keyComponents: [
          { component: "ComponentV2Builder", purpose: "Main builder interface" },
          { component: "ContainerEditor", purpose: "Container configuration panel" },
          { component: "TextDisplayEditor", purpose: "Text block editor" },
          { component: "ButtonEditDialog", purpose: "Button configuration dialog" },
          { component: "MediaGalleryEditor", purpose: "Image/video grid editor" },
          { component: "StatsCardEditor", purpose: "Stats card configuration" },
          { component: "GraphWorkbench", purpose: "Computation graph editor" },
        ],
      },

      {
        id: "graph-workbench",
        name: "Graph Workbench",
        description: "Node-based editor for creating computation graphs",
        icon: GitBranch,
        docFile: "Graph Workbench.md",

        whatItDoes: `The Graph Workbench is a visual node editor for creating computation graphs. Connect nodes together to perform calculations, combine values, and produce outputs - all visually, like drawing a flowchart.

Use it in stats cards to compute values like "percentage online" or "average points per member" without writing code.`,

        whyUseIt: `• Calculate percentages, averages, ratios
• Combine multiple stats into one value
• Apply conditional logic to outputs
• Create dynamic computed values
• No coding required`,

        howToAccess: `1. In Component V2 Builder, add a Stats Card
2. Click "Edit Stats Card"
3. For a stat value, click "Edit Graph"
4. The Graph Workbench opens
5. Drag nodes from the sidebar
6. Connect by dragging between ports
7. Output connects to your stat value`,

        stepByStep: [
          {
            step: 1,
            title: "Understanding Nodes",
            description: `Nodes are the building blocks:

**Input Nodes:**
• Constant - Fixed value you enter
• Stat - Server stat (member count, online count)
• Element - Dynamic element value

**Operation Nodes:**
• Add - Sum two values
• Subtract - Difference
• Multiply - Product
• Divide - Quotient
• Compare - Boolean comparison
• Conditional - If/then/else

**Output Node:**
• Display - The computed value

Each node has input ports (left) and output ports (right).`
          },
          {
            step: 2,
            title: "Creating a Simple Calculation",
            description: `Calculate percentage of members online:

1. Drag "Member Count" stat node
2. Drag "Online Count" stat node
3. Drag "Divide" operation node
4. Drag "Multiply" operation node
5. Drag "Constant" node, set to 100
6. Drag "Display" output node

**Connect them:**
• Online Count → Divide (numerator)
• Member Count → Divide (denominator)
• Divide result → Multiply (left)
• Constant 100 → Multiply (right)
• Multiply result → Display

Result: (online / total) × 100 = percentage`
          },
          {
            step: 3,
            title: "Using Conditionals",
            description: `Show different values based on conditions:

1. Drag "Compare" node
2. Drag "Constant" node for threshold
3. Drag two output nodes (one for true, one for false)
4. Drag "Conditional" node

**Setup:**
• Stat value → Compare (left)
• Threshold → Compare (right)
• Compare result → Conditional (condition)
• True value → Conditional (true input)
• False value → Conditional (false input)
• Conditional → Display

Result: "High" if value > threshold, else "Low"`
          },
          {
            step: 4,
            title: "Saving and Using",
            description: `After building your graph:

1. Click "Apply" to save
2. The computed value appears in your stats card
3. Preview updates to show the result
4. When message is sent, graph evaluates:
   - Stats fetched from server
   - Calculations performed
   - Result displayed

You can edit the graph anytime to change the calculation.`
          },
        ],

        commonTasks: [
          {
            title: "Calculate Online Percentage",
            steps: [
              "Add Online Count stat node",
              "Add Member Count stat node",
              "Add Divide node",
              "Connect: Online Count → Divide numerator",
              "Connect: Member Count → Divide denominator",
              "Add Multiply node with constant 100",
              "Connect Divide result to Multiply",
              "Output: Percentage online",
            ]
          },
          {
            title: "Show Conditional Greeting",
            steps: [
              "Add User Rank element node",
              "Add Compare node (equals)",
              "Add Constant for 'New' rank",
              "Add Conditional node",
              "True: 'Welcome, new member!'",
              "False: 'Welcome back!'",
              "Output: Personalized greeting",
            ]
          },
        ],

        tips: [
          "Hover over ports to see what data type they accept.",
          "Use constants for fixed values like multipliers.",
          "Conditionals let you show different text based on conditions.",
          "You can use elements as inputs - they resolve when the message is sent.",
          "Preview shows the result with current stat values.",
        ],

        howItWorks: `Computation graphs are evaluated at send time:

1. Graph structure stored as JSON
2. When message is sent:
   a. All stat nodes fetch current values
   b. Element nodes resolve to user/server context
   c. Operations execute in dependency order
   d. Output node produces final value
3. Value formatted and inserted into message

Graph nodes can be:
• Cached (stats update periodically)
• Live (elements resolve per user)
• Static (constants never change)`,

        databaseTables: [
          { table: "StatsCardConfig", purpose: "Stats card with linked graphs" },
          { table: "ActionGraph", purpose: "Node graph definitions" },
          { table: "GraphNode", purpose: "Individual node configurations" },
          { table: "GraphEdge", purpose: "Connections between nodes" },
        ],

        apiEndpoints: [
          { endpoint: "POST /servers/{id}/graphs/evaluate", method: "POST", description: "Evaluate graph with context" },
          { endpoint: "GET /servers/{id}/stats", method: "GET", description: "Get all server stats" },
          { endpoint: "POST /servers/{id}/graphs/preview", method: "POST", description: "Preview graph result" },
        ],

        keyComponents: [
          { component: "GraphWorkbench", purpose: "Visual node editor canvas" },
          { component: "NodeSidebar", purpose: "Draggable node palette" },
          { component: "GraphNode", purpose: "Individual node renderer" },
          { component: "NodePort", purpose: "Input/output connectors" },
          { component: "GraphCanvas", purpose: "Drag-and-drop canvas" },
          { component: "NodeInspector", purpose: "Node configuration panel" },
        ],
      },

      {
        id: "bot-integration",
        name: "Bot Integration",
        description: "Discord bot that handles events, commands, and message delivery",
        icon: Bot,
        docFile: "Bot Integration.md",

        whatItDoes: `The BRM5 Discord Bot connects your dashboard to Discord. It handles all Discord events (member joins, messages, reactions, voice), processes slash commands, delivers messages from the dashboard, and executes action sequences when buttons are clicked.

Think of it as the bridge between your web dashboard and your Discord server.`,

        whyUseIt: `• Dashboard sends messages through the bot
• Events in Discord sync to the dashboard
• Slash commands for quick Discord actions
• Button clicks trigger action sequences
• Real-time updates when things happen`,

        howToAccess: `The bot runs automatically when configured. No dashboard access needed - it's a background service that connects Discord to BRM5.

Configure via environment variables: DISCORD_TOKEN, BOT_API_KEY, etc.`,

        stepByStep: [
          {
            step: 1,
            title: "Bot Architecture",
            description: `The bot has several key components:

**ExtendedClient:** Custom Discord.js client with command handling

**Event Handlers:** One file per Discord event:
• ready - Bot startup
• guildCreate - Bot joins server
• guildMemberAdd - Member joins
• messageCreate - Message sent
• interactionCreate - Button click, slash command

**Event Queues:** Batched event processing:
• Member events (join/leave/update)
• Message events (create/delete)
• Voice events (join/leave)
• Reaction events (add/remove)

**API Sync:** Sends all events to backend`
          },
          {
            step: 2,
            title: "Slash Commands",
            description: `The bot provides slash commands:

**Available Commands:**
• /ping - Test bot response with button
• /promote - Promote user to next rank
• /demote - Demote user to previous rank
• /blacklist-check - Check if user is blacklisted

**How Commands Work:**
1. User types /command in Discord
2. Bot receives interaction
3. Bot validates permissions
4. Bot calls API for data
5. Bot sends response

Commands are defined in /commands folder and auto-registered on startup.`
          },
          {
            step: 3,
            title: "Message Delivery",
            description: `How dashboard messages reach Discord:

**SSE-based Delivery:**
1. Dashboard sends message via API
2. API stores message in database
3. API emits SSE event to connected bots
4. Bot receives message event
5. Bot sends to Discord channel
6. Bot confirms delivery

**Fallback Polling:**
If SSE disconnects:
1. Bot polls API for pending messages
2. Delivers any found messages
3. Confirms delivery

This dual-approach ensures messages are delivered even during brief disconnections.`
          },
          {
            step: 4,
            title: "Event Processing",
            description: `How Discord events reach the dashboard:

**Event Flow:**
1. Discord event fires (member join, etc.)
2. Bot's event handler receives it
3. Event added to priority queue:
   - CRITICAL: Member events
   - HIGH: Message events
   - NORMAL: Voice, reaction events
   - LOW: Presence updates
4. Queue processes in batches
5. Events sent to API endpoints
6. API updates database

**Batching Benefits:**
• Reduces API calls
• Handles rate limits
• Prioritizes critical events
• Processes in order`
          },
        ],

        commonTasks: [
          {
            title: "Check Bot Status",
            steps: [
              "Use /ping command in Discord",
              "Bot should respond with pong",
              "If no response, check logs",
              "Verify DISCORD_TOKEN is set",
              "Check bot is in the server",
            ]
          },
          {
            title: "Promote a Member via Command",
            steps: [
              "Type /promote in Discord",
              "Select the member to promote",
              "Bot checks permissions",
              "Bot calls API",
              "Member receives new role",
              "Success message shown",
            ]
          },
        ],

        tips: [
          "Check bot logs if messages aren't delivering - the logs show why.",
          "Bot needs specific Discord permissions: Manage Roles, Send Messages, View Audit Log.",
          "Event queues batch events - there may be a slight delay before dashboard updates.",
          "Slash commands auto-register on bot startup - no manual deployment needed.",
          "The bot reconnects automatically if disconnected from Discord gateway.",
        ],

        howItWorks: `The bot runs as a separate process:

1. **Startup:**
   - Bot loads Discord token
   - Connects to Discord gateway
   - Registers slash commands
   - Connects to API via SSE

2. **Running:**
   - Listens for Discord events
   - Queues events by priority
   - Batches to API
   - Receives message delivery requests
   - Sends messages to Discord

3. **Error Handling:**
   - Auto-reconnects on disconnect
   - Retries failed deliveries
   - Logs errors with context
   - Falls back to polling if SSE fails`,

        databaseTables: [
          { table: "DiscordEntityReference", purpose: "Discord ID to UUID mapping" },
          { table: "DiscordGuild", purpose: "Cached guild data" },
          { table: "DiscordRole", purpose: "Cached role data" },
          { table: "DiscordChannel", purpose: "Cached channel data" },
          { table: "DiscordAuditEvent", purpose: "Audit log events" },
        ],

        apiEndpoints: [
          { endpoint: "POST /bot/events/batch", method: "POST", description: "Batch event processing" },
          { endpoint: "GET /bot/messages/stream", method: "GET", description: "SSE message stream" },
          { endpoint: "GET /bot/servers/by-guild/:id", method: "GET", description: "Server lookup by guild ID" },
          { endpoint: "GET /bot/users/by-discord/:id", method: "GET", description: "User lookup by Discord ID" },
          { endpoint: "POST /bot/blacklist/check", method: "POST", description: "Check blacklist status" },
        ],

        keyComponents: [
          { component: "ExtendedClient", purpose: "Custom Discord.js client" },
          { component: "EventQueue", purpose: "Priority-based event batching" },
          { component: "MessageSender", purpose: "SSE-based message delivery" },
          { component: "ActionExecutor", purpose: "Execute action sequences" },
          { component: "IDCache", purpose: "Discord ID to UUID mapping cache" },
          { component: "HTTPClient", purpose: "API communication" },
        ],
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DocumentationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].id);
  const [selectedFeature, setSelectedFeature] = useState<string>(categories[0].features[0].id);
  const [activeTab, setActiveTab] = useState<string>("beginner");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const currentFeature = currentCategory?.features.find((f) => f.id === selectedFeature);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <h2 className="font-semibold">Documentation</h2>
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-2">
            {categories.map((category) => (
              <div key={category.id} className="mb-2">
                <button
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedFeature(category.features[0].id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </button>
                {selectedCategory === category.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {category.features.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => setSelectedFeature(feature.id)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                          selectedFeature === feature.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <feature.icon className="h-3.5 w-3.5" />
                        {feature.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentFeature && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <currentFeature.icon className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold">{currentFeature.name}</h1>
                  <Badge variant="secondary">{currentCategory?.name}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={`/${getDocsUrl(currentFeature.docFile)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Full Documentation
                  </a>
                </Button>
              </div>
              <p className="text-muted-foreground">{currentFeature.description}</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b px-6 pt-2 shrink-0">
                <TabsList>
                  <TabsTrigger value="beginner">Beginner Guide</TabsTrigger>
                  <TabsTrigger value="technical">Technical Details</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 h-0">
                <div className="p-6">
                  <TabsContent value="beginner" className="mt-0 space-y-6" forceMount>
                    {/* What It Does */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <HelpCircle className="h-5 w-5" />
                          What It Does
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {currentFeature.whatItDoes}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Why Use It */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Why Use It
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {currentFeature.whyUseIt}
                        </p>
                      </CardContent>
                    </Card>

                    {/* How To Access */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Play className="h-5 w-5" />
                          How To Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {currentFeature.howToAccess}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Step By Step */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ListOrdered className="h-5 w-5" />
                          Step By Step Guide
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {currentFeature.stepByStep.map((step) => (
                          <Collapsible
                            key={step.step}
                            open={expandedSection === `step-${step.step}`}
                            onOpenChange={(open) => setExpandedSection(open ? `step-${step.step}` : null)}
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                                  {step.step}
                                </div>
                                <span className="font-medium">{step.title}</span>
                              </div>
                              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSection === `step-${step.step}` ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-3 pt-3">
                              <p className="text-muted-foreground whitespace-pre-wrap pl-11">
                                {step.description}
                              </p>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Common Tasks */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ArrowRight className="h-5 w-5" />
                          Common Tasks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {currentFeature.commonTasks.map((task, index) => (
                          <div key={index} className="p-4 rounded-lg bg-muted/50">
                            <h4 className="font-medium mb-2">{task.title}</h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                              {task.steps.map((step, stepIndex) => (
                                <li key={stepIndex}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          Tips & Best Practices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentFeature.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span className="text-muted-foreground">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="technical" className="mt-0 space-y-6" forceMount>
                    {/* How It Works */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">How It Works</CardTitle>
                        <CardDescription>Underlying architecture and data flow</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {currentFeature.howItWorks}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Database Tables */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Database Tables</CardTitle>
                        <CardDescription>Database tables used by this feature</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {currentFeature.databaseTables.map((table) => (
                            <div key={table.table} className="flex items-start gap-3 p-2 rounded bg-muted/50">
                              <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {table.table}
                              </code>
                              <span className="text-muted-foreground text-sm">{table.purpose}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* API Endpoints */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">API Endpoints</CardTitle>
                        <CardDescription>REST endpoints for this feature</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {currentFeature.apiEndpoints.map((endpoint) => (
                            <div key={endpoint.endpoint} className="flex items-start gap-3 p-2 rounded bg-muted/50">
                              <Badge variant="outline" className="font-mono text-xs">
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono">{endpoint.endpoint}</code>
                              <span className="text-muted-foreground text-sm">— {endpoint.description}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Components */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Key Components</CardTitle>
                        <CardDescription>Frontend components and backend services</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {currentFeature.keyComponents.map((component) => (
                            <div key={component.component} className="flex items-start gap-3 p-2 rounded bg-muted/50">
                              <code className="text-sm font-mono text-primary">{component.component}</code>
                              <span className="text-muted-foreground text-sm">{component.purpose}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}