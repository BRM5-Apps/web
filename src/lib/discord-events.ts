/**
 * Discord Events for Automation Triggers
 *
 * Each event has:
 * - value: The event type identifier
 * - label: Human-readable name
 * - description: What triggers this event
 * - category: Grouping for UI organization
 * - elements: Template variables available when this event fires
 */

export interface EventElement {
  key: string;
  label: string;
  description: string;
  example: string;
}

export interface DiscordEventConfig {
  value: string;
  label: string;
  description: string;
  category: EventCategory;
  icon: string; // Lucide icon name
  elements: EventElement[];
}

export type EventCategory =
  | "member"
  | "message"
  | "voice"
  | "role"
  | "channel"
  | "thread"
  | "emoji"
  | "stage"
  | "integration"
  | "guild";

// ─────────────────────────────────────────────────────────────────────────────
// EVENT DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const DISCORD_EVENTS: DiscordEventConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // MEMBER EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "MEMBER_JOIN",
    label: "Member Join",
    description: "When a new member joins the server",
    category: "member",
    icon: "UserPlus",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The new member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The new member's username", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "The new member's display name/nickname", example: "John Doe" },
      { key: "event.user.avatar", label: "Avatar URL", description: "URL to the user's avatar", example: "https://cdn.discordapp.com/avatars/..." },
      { key: "event.user.mention", label: "Mention", description: "Mention string for the user", example: "<@123456789012345678>" },
      { key: "event.user.createdAt", label: "Account Created", description: "When the user created their account", example: "2023-01-15T12:00:00Z" },
      { key: "event.joinedAt", label: "Joined At", description: "When the user joined this server", example: "2024-03-26T10:30:00Z" },
      { key: "event.guild.name", label: "Server Name", description: "The name of the server", example: "My Awesome Server" },
      { key: "event.guild.memberCount", label: "Member Count", description: "Current member count after join", example: "1234" },
    ],
  },
  {
    value: "MEMBER_LEAVE",
    label: "Member Leave",
    description: "When a member leaves the server",
    category: "member",
    icon: "UserMinus",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The leaving member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The leaving member's username", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "The leaving member's display name", example: "John Doe" },
      { key: "event.user.avatar", label: "Avatar URL", description: "URL to the user's avatar", example: "https://cdn.discordapp.com/avatars/..." },
      { key: "event.user.mention", label: "Mention", description: "Mention string for the user", example: "<@123456789012345678>" },
      { key: "event.leftAt", label: "Left At", description: "When the user left", example: "2024-03-26T10:30:00Z" },
      { key: "event.guild.name", label: "Server Name", description: "The name of the server", example: "My Awesome Server" },
      { key: "event.guild.memberCount", label: "Member Count", description: "Current member count after leave", example: "1233" },
    ],
  },
  {
    value: "MEMBER_KICK",
    label: "Member Kicked",
    description: "When a member is kicked from the server",
    category: "member",
    icon: "UserX",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The kicked member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The kicked member's username", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "The kicked member's display name", example: "John Doe" },
      { key: "event.user.mention", label: "Mention", description: "Mention string for the user", example: "<@123456789012345678>" },
      { key: "event.moderator.id", label: "Moderator ID", description: "ID of the moderator who kicked", example: "987654321098765432" },
      { key: "event.moderator.username", label: "Moderator Username", description: "Username of the moderator", example: "admin_user" },
      { key: "event.reason", label: "Reason", description: "Reason for the kick", example: "Spamming in general" },
      { key: "event.timestamp", label: "Timestamp", description: "When the kick occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MEMBER_BAN",
    label: "Member Banned",
    description: "When a member is banned from the server",
    category: "member",
    icon: "Ban",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The banned user's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The banned user's username", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "The banned user's display name", example: "John Doe" },
      { key: "event.moderator.id", label: "Moderator ID", description: "ID of the moderator who banned", example: "987654321098765432" },
      { key: "event.moderator.username", label: "Moderator Username", description: "Username of the moderator", example: "admin_user" },
      { key: "event.reason", label: "Reason", description: "Reason for the ban", example: "Repeated rule violations" },
      { key: "event.timestamp", label: "Timestamp", description: "When the ban occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MEMBER_UNBAN",
    label: "Member Unbanned",
    description: "When a member is unbanned from the server",
    category: "member",
    icon: "Unlock",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The unbanned user's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The unbanned user's username", example: "john_doe" },
      { key: "event.moderator.id", label: "Moderator ID", description: "ID of the moderator who unbanned", example: "987654321098765432" },
      { key: "event.timestamp", label: "Timestamp", description: "When the unban occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MEMBER_UPDATE",
    label: "Member Updated",
    description: "When a member's nickname or roles change",
    category: "member",
    icon: "UserCog",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The member's username", example: "john_doe" },
      { key: "event.oldNickname", label: "Old Nickname", description: "Previous nickname", example: "OldNick" },
      { key: "event.newNickname", label: "New Nickname", description: "New nickname", example: "NewNick" },
      { key: "event.addedRoles", label: "Added Roles", description: "Roles that were added", example: "Moderator, Helper" },
      { key: "event.removedRoles", label: "Removed Roles", description: "Roles that were removed", example: "New Member" },
      { key: "event.timestamp", label: "Timestamp", description: "When the update occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // MESSAGE EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "MESSAGE_CREATE",
    label: "Message Sent",
    description: "When a message is posted in a channel",
    category: "message",
    icon: "MessageSquare",
    elements: [
      { key: "event.message.id", label: "Message ID", description: "The message's Discord ID", example: "123456789012345678" },
      { key: "event.message.content", label: "Content", description: "The message content/text", example: "Hello world!" },
      { key: "event.message.url", label: "Message URL", description: "Link to the message", example: "https://discord.com/channels/..." },
      { key: "event.message.attachments", label: "Attachments", description: "Number of attachments", example: "2" },
      { key: "event.author.id", label: "Author ID", description: "The message author's ID", example: "123456789012345678" },
      { key: "event.author.username", label: "Author Username", description: "The message author's username", example: "john_doe" },
      { key: "event.author.displayName", label: "Author Display Name", description: "The message author's display name", example: "John Doe" },
      { key: "event.author.mention", label: "Author Mention", description: "Mention string for the author", example: "<@123456789012345678>" },
      { key: "event.channel.id", label: "Channel ID", description: "The channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The channel's name", example: "general" },
      { key: "event.channel.mention", label: "Channel Mention", description: "Mention string for the channel", example: "<#987654321098765432>" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the message was sent", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MESSAGE_EDIT",
    label: "Message Edited",
    description: "When a message is edited",
    category: "message",
    icon: "Pencil",
    elements: [
      { key: "event.message.id", label: "Message ID", description: "The message's Discord ID", example: "123456789012345678" },
      { key: "event.message.oldContent", label: "Old Content", description: "The message content before edit", example: "Hello world!" },
      { key: "event.message.newContent", label: "New Content", description: "The message content after edit", example: "Hello everyone!" },
      { key: "event.author.id", label: "Author ID", description: "The message author's ID", example: "123456789012345678" },
      { key: "event.author.username", label: "Author Username", description: "The message author's username", example: "john_doe" },
      { key: "event.channel.id", label: "Channel ID", description: "The channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The channel's name", example: "general" },
      { key: "event.timestamp", label: "Timestamp", description: "When the edit occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MESSAGE_DELETE",
    label: "Message Deleted",
    description: "When a message is deleted",
    category: "message",
    icon: "Trash2",
    elements: [
      { key: "event.message.id", label: "Message ID", description: "The deleted message's ID", example: "123456789012345678" },
      { key: "event.message.content", label: "Content", description: "The deleted message content (if cached)", example: "Deleted text here" },
      { key: "event.author.id", label: "Author ID", description: "The message author's ID (if cached)", example: "123456789012345678" },
      { key: "event.author.username", label: "Author Username", description: "The message author's username (if cached)", example: "john_doe" },
      { key: "event.channel.id", label: "Channel ID", description: "The channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The channel's name", example: "general" },
      { key: "event.timestamp", label: "Timestamp", description: "When the deletion occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MESSAGE_REACTION_ADD",
    label: "Reaction Added",
    description: "When a reaction is added to a message",
    category: "message",
    icon: "CircleDot",
    elements: [
      { key: "event.message.id", label: "Message ID", description: "The message's ID", example: "123456789012345678" },
      { key: "event.emoji.name", label: "Emoji Name", description: "The emoji used (name or unicode)", example: "👍" },
      { key: "event.emoji.id", label: "Emoji ID", description: "Custom emoji ID (if custom)", example: "987654321098765432" },
      { key: "event.emoji.animated", label: "Is Animated", description: "Whether the emoji is animated", example: "false" },
      { key: "event.user.id", label: "User ID", description: "Who added the reaction", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "Username of the reactor", example: "john_doe" },
      { key: "event.user.mention", label: "Mention", description: "Mention string", example: "<@123456789012345678>" },
      { key: "event.channel.id", label: "Channel ID", description: "The channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The channel's name", example: "general" },
      { key: "event.timestamp", label: "Timestamp", description: "When the reaction was added", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MESSAGE_REACTION_REMOVE",
    label: "Reaction Removed",
    description: "When a reaction is removed from a message",
    category: "message",
    icon: "CircleOff",
    elements: [
      { key: "event.message.id", label: "Message ID", description: "The message's ID", example: "123456789012345678" },
      { key: "event.emoji.name", label: "Emoji Name", description: "The emoji removed", example: "👍" },
      { key: "event.emoji.id", label: "Emoji ID", description: "Custom emoji ID (if custom)", example: "987654321098765432" },
      { key: "event.user.id", label: "User ID", description: "Who removed the reaction", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "Username of the remover", example: "john_doe" },
      { key: "event.channel.id", label: "Channel ID", description: "The channel's ID", example: "987654321098765432" },
      { key: "event.timestamp", label: "Timestamp", description: "When the reaction was removed", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MESSAGE_REACTION_REMOVE_ALL",
    label: "All Reactions Removed",
    description: "When all reactions are removed from a message",
    category: "message",
    icon: "X",
    elements: [
      { key: "event.message.id", label: "Message ID", description: "The message's ID", example: "123456789012345678" },
      { key: "event.channel.id", label: "Channel ID", description: "The channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The channel's name", example: "general" },
      { key: "event.timestamp", label: "Timestamp", description: "When reactions were cleared", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // VOICE EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "VOICE_JOIN",
    label: "Voice Join",
    description: "When a member joins a voice channel",
    category: "voice",
    icon: "Headphones",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The member's username", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "The member's display name", example: "John Doe" },
      { key: "event.user.mention", label: "Mention", description: "Mention string", example: "<@123456789012345678>" },
      { key: "event.channel.id", label: "Channel ID", description: "The voice channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The voice channel's name", example: "General Voice" },
      { key: "event.channel.mention", label: "Channel Mention", description: "Mention string for the channel", example: "<#987654321098765432>" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When they joined voice", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "VOICE_LEAVE",
    label: "Voice Leave",
    description: "When a member leaves a voice channel",
    category: "voice",
    icon: "Headphones",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The member's username", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "The member's display name", example: "John Doe" },
      { key: "event.channel.id", label: "Channel ID", description: "The voice channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The voice channel's name", example: "General Voice" },
      { key: "event.duration", label: "Duration", description: "How long they were in voice (seconds)", example: "3600" },
      { key: "event.timestamp", label: "Timestamp", description: "When they left voice", example: "2024-03-26T11:30:00Z" },
    ],
  },
  {
    value: "VOICE_MOVE",
    label: "Voice Move",
    description: "When a member moves between voice channels",
    category: "voice",
    icon: "ArrowRight",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The member's username", example: "john_doe" },
      { key: "event.oldChannel.id", label: "Old Channel ID", description: "The previous voice channel's ID", example: "111111111111111111" },
      { key: "event.oldChannel.name", label: "Old Channel Name", description: "The previous voice channel's name", example: "General Voice" },
      { key: "event.newChannel.id", label: "New Channel ID", description: "The new voice channel's ID", example: "222222222222222222" },
      { key: "event.newChannel.name", label: "New Channel Name", description: "The new voice channel's name", example: "Gaming" },
      { key: "event.timestamp", label: "Timestamp", description: "When the move occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "VOICE_MUTE",
    label: "Voice Mute/Deafen",
    description: "When a member mutes or deafens in voice",
    category: "voice",
    icon: "MicOff",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The member's username", example: "john_doe" },
      { key: "event.channel.id", label: "Channel ID", description: "The voice channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The voice channel's name", example: "General Voice" },
      { key: "event.muted", label: "Is Muted", description: "Whether they are now muted", example: "true" },
      { key: "event.deafened", label: "Is Deafened", description: "Whether they are now deafened", example: "false" },
      { key: "event.selfMute", label: "Self Mute", description: "Whether it was self-muted", example: "true" },
      { key: "event.timestamp", label: "Timestamp", description: "When the mute occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // ROLE EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "ROLE_CREATE",
    label: "Role Created",
    description: "When a new role is created",
    category: "role",
    icon: "ShieldPlus",
    elements: [
      { key: "event.role.id", label: "Role ID", description: "The new role's ID", example: "123456789012345678" },
      { key: "event.role.name", label: "Role Name", description: "The role's name", example: "Moderator" },
      { key: "event.role.color", label: "Role Color", description: "The role's color (hex)", example: "#5865F2" },
      { key: "event.role.mention", label: "Role Mention", description: "Mention string for the role", example: "<@&123456789012345678>" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the role was created", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "ROLE_DELETE",
    label: "Role Deleted",
    description: "When a role is deleted",
    category: "role",
    icon: "ShieldMinus",
    elements: [
      { key: "event.role.id", label: "Role ID", description: "The deleted role's ID", example: "123456789012345678" },
      { key: "event.role.name", label: "Role Name", description: "The role's name (if cached)", example: "Moderator" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the role was deleted", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "ROLE_UPDATE",
    label: "Role Updated",
    description: "When a role's properties are changed",
    category: "role",
    icon: "Shield",
    elements: [
      { key: "event.role.id", label: "Role ID", description: "The role's ID", example: "123456789012345678" },
      { key: "event.role.name", label: "Role Name", description: "The role's name", example: "Moderator" },
      { key: "event.oldName", label: "Old Name", description: "Previous name (if changed)", example: "Mod" },
      { key: "event.newName", label: "New Name", description: "New name (if changed)", example: "Moderator" },
      { key: "event.oldColor", label: "Old Color", description: "Previous color (if changed)", example: "#000000" },
      { key: "event.newColor", label: "New Color", description: "New color (if changed)", example: "#5865F2" },
      { key: "event.changes", label: "Changes", description: "List of what changed", example: "name, color, permissions" },
      { key: "event.timestamp", label: "Timestamp", description: "When the role was updated", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MEMBER_ROLE_ADD",
    label: "Role Assigned",
    description: "When a role is assigned to a member",
    category: "role",
    icon: "UserCheck",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The member's username", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "The member's display name", example: "John Doe" },
      { key: "event.user.mention", label: "User Mention", description: "Mention string", example: "<@123456789012345678>" },
      { key: "event.role.id", label: "Role ID", description: "The role's ID", example: "987654321098765432" },
      { key: "event.role.name", label: "Role Name", description: "The role's name", example: "Moderator" },
      { key: "event.role.mention", label: "Role Mention", description: "Mention string for the role", example: "<@&987654321098765432>" },
      { key: "event.moderator.id", label: "Moderator ID", description: "Who assigned the role (if applicable)", example: "111111111111111111" },
      { key: "event.moderator.username", label: "Moderator Username", description: "Username of the moderator", example: "admin" },
      { key: "event.timestamp", label: "Timestamp", description: "When the role was assigned", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MEMBER_ROLE_REMOVE",
    label: "Role Removed",
    description: "When a role is removed from a member",
    category: "role",
    icon: "UserX",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The member's Discord ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The member's username", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "The member's display name", example: "John Doe" },
      { key: "event.role.id", label: "Role ID", description: "The role's ID", example: "987654321098765432" },
      { key: "event.role.name", label: "Role Name", description: "The role's name", example: "Moderator" },
      { key: "event.moderator.id", label: "Moderator ID", description: "Who removed the role (if applicable)", example: "111111111111111111" },
      { key: "event.timestamp", label: "Timestamp", description: "When the role was removed", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHANNEL EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "CHANNEL_CREATE",
    label: "Channel Created",
    description: "When a new channel is created",
    category: "channel",
    icon: "Plus",
    elements: [
      { key: "event.channel.id", label: "Channel ID", description: "The new channel's ID", example: "123456789012345678" },
      { key: "event.channel.name", description: "The channel's name", label: "Channel Name", example: "new-channel" },
      { key: "event.channel.type", label: "Channel Type", description: "Type of channel (text, voice, etc.)", example: "text" },
      { key: "event.channel.topic", label: "Channel Topic", description: "The channel's topic/description", example: "Discussion about gaming" },
      { key: "event.channel.mention", label: "Channel Mention", description: "Mention string for the channel", example: "<#123456789012345678>" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the channel was created", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "CHANNEL_DELETE",
    label: "Channel Deleted",
    description: "When a channel is deleted",
    category: "channel",
    icon: "Trash2",
    elements: [
      { key: "event.channel.id", label: "Channel ID", description: "The deleted channel's ID", example: "123456789012345678" },
      { key: "event.channel.name", label: "Channel Name", description: "The channel's name (if cached)", example: "old-channel" },
      { key: "event.channel.type", label: "Channel Type", description: "Type of channel", example: "text" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the channel was deleted", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "CHANNEL_UPDATE",
    label: "Channel Updated",
    description: "When a channel's properties are changed",
    category: "channel",
    icon: "Settings",
    elements: [
      { key: "event.channel.id", label: "Channel ID", description: "The channel's ID", example: "123456789012345678" },
      { key: "event.channel.name", label: "Channel Name", description: "The channel's current name", example: "renamed-channel" },
      { key: "event.oldName", label: "Old Name", description: "Previous name (if changed)", example: "old-name" },
      { key: "event.newName", label: "New Name", description: "New name (if changed)", example: "new-name" },
      { key: "event.oldTopic", label: "Old Topic", description: "Previous topic (if changed)", example: "Old topic" },
      { key: "event.newTopic", label: "New Topic", description: "New topic (if changed)", example: "New topic" },
      { key: "event.changes", label: "Changes", description: "List of what changed", example: "name, topic" },
      { key: "event.timestamp", label: "Timestamp", description: "When the channel was updated", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "CHANNEL_PINNED_MESSAGE",
    label: "Message Pinned",
    description: "When a message is pinned in a channel",
    category: "channel",
    icon: "Pin",
    elements: [
      { key: "event.message.id", label: "Message ID", description: "The pinned message's ID", example: "123456789012345678" },
      { key: "event.message.url", label: "Message URL", description: "Link to the pinned message", example: "https://discord.com/channels/..." },
      { key: "event.author.id", label: "Author ID", description: "The message author's ID", example: "123456789012345678" },
      { key: "event.author.username", label: "Author Username", description: "The message author's username", example: "john_doe" },
      { key: "event.channel.id", label: "Channel ID", description: "The channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The channel's name", example: "announcements" },
      { key: "event.pinnedBy.id", label: "Pinned By ID", description: "Who pinned the message", example: "111111111111111111" },
      { key: "event.pinnedBy.username", label: "Pinned By Username", description: "Username of who pinned", example: "mod_user" },
      { key: "event.timestamp", label: "Timestamp", description: "When the message was pinned", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // THREAD EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "THREAD_CREATE",
    label: "Thread Created",
    description: "When a new thread is created",
    category: "thread",
    icon: "MessageSquarePlus",
    elements: [
      { key: "event.thread.id", label: "Thread ID", description: "The new thread's ID", example: "123456789012345678" },
      { key: "event.thread.name", label: "Thread Name", description: "The thread's name", example: "Discussion about X" },
      { key: "event.thread.url", label: "Thread URL", description: "Link to the thread", example: "https://discord.com/channels/..." },
      { key: "event.parentChannel.id", label: "Parent Channel ID", description: "The parent channel's ID", example: "987654321098765432" },
      { key: "event.parentChannel.name", label: "Parent Channel Name", description: "The parent channel's name", example: "general" },
      { key: "event.author.id", label: "Author ID", description: "Who created the thread", example: "123456789012345678" },
      { key: "event.author.username", label: "Author Username", description: "Username of thread creator", example: "john_doe" },
      { key: "event.timestamp", label: "Timestamp", description: "When the thread was created", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "THREAD_DELETE",
    label: "Thread Deleted",
    description: "When a thread is deleted",
    category: "thread",
    icon: "Trash2",
    elements: [
      { key: "event.thread.id", label: "Thread ID", description: "The deleted thread's ID", example: "123456789012345678" },
      { key: "event.thread.name", label: "Thread Name", description: "The thread's name (if cached)", example: "Discussion about X" },
      { key: "event.parentChannel.id", label: "Parent Channel ID", description: "The parent channel's ID", example: "987654321098765432" },
      { key: "event.timestamp", label: "Timestamp", description: "When the thread was deleted", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "THREAD_UPDATE",
    label: "Thread Updated",
    description: "When a thread's properties are changed",
    category: "thread",
    icon: "Settings",
    elements: [
      { key: "event.thread.id", label: "Thread ID", description: "The thread's ID", example: "123456789012345678" },
      { key: "event.thread.name", label: "Thread Name", description: "The thread's current name", example: "Updated Thread Name" },
      { key: "event.oldName", label: "Old Name", description: "Previous name (if changed)", example: "Old Thread Name" },
      { key: "event.newName", label: "New Name", description: "New name (if changed)", example: "New Thread Name" },
      { key: "event.archived", label: "Is Archived", description: "Whether the thread is now archived", example: "true" },
      { key: "event.locked", label: "Is Locked", description: "Whether the thread is now locked", example: "false" },
      { key: "event.timestamp", label: "Timestamp", description: "When the thread was updated", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // INTERACTION EVENTS (Commands, Buttons, Select Menus)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "SLASH_COMMAND",
    label: "Slash Command",
    description: "When a slash command is executed",
    category: "message",
    icon: "Hash",
    elements: [
      { key: "event.command.name", label: "Command Name", description: "The slash command's name", example: "ban" },
      { key: "event.command.id", label: "Command ID", description: "The command's ID", example: "123456789012345678" },
      { key: "event.command.fullCommand", label: "Full Command", description: "Full command with arguments", example: "/ban user:@user reason:spam" },
      { key: "event.options", label: "Command Options", description: "Options passed to the command", example: '{"user": "123...", "reason": "spam"}' },
      { key: "event.user.id", label: "User ID", description: "Who ran the command", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "Username of the command runner", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "Display name of the command runner", example: "John Doe" },
      { key: "event.user.mention", label: "User Mention", description: "Mention string", example: "<@123456789012345678>" },
      { key: "event.channel.id", label: "Channel ID", description: "Where the command was run", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "Channel name where command was run", example: "general" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the command was run", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "BUTTON_CLICK",
    label: "Button Click",
    description: "When an interaction button is clicked",
    category: "message",
    icon: "MousePointer2",
    elements: [
      { key: "event.button.customId", label: "Button ID", description: "The button's custom ID", example: "confirm_purchase_123" },
      { key: "event.button.label", label: "Button Label", description: "The button's label text", example: "Confirm" },
      { key: "event.button.style", label: "Button Style", description: "The button's style", example: "Primary" },
      { key: "event.message.id", label: "Message ID", description: "The message containing the button", example: "123456789012345678" },
      { key: "event.user.id", label: "User ID", description: "Who clicked the button", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "Username of the clicker", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "Display name of the clicker", example: "John Doe" },
      { key: "event.user.mention", label: "User Mention", description: "Mention string", example: "<@123456789012345678>" },
      { key: "event.channel.id", label: "Channel ID", description: "Where the button was clicked", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "Channel name", example: "general" },
      { key: "event.timestamp", label: "Timestamp", description: "When the button was clicked", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "SELECT_MENU",
    label: "Select Menu",
    description: "When a select menu option is chosen",
    category: "message",
    icon: "List",
    elements: [
      { key: "event.selectMenu.customId", label: "Select Menu ID", description: "The select menu's custom ID", example: "role_selector" },
      { key: "event.selectMenu.values", label: "Selected Values", description: "The selected values (comma-separated)", example: "role_moderator, role_helper" },
      { key: "event.selectMenu.labels", label: "Selected Labels", description: "The selected labels (comma-separated)", example: "Moderator, Helper" },
      { key: "event.message.id", label: "Message ID", description: "The message containing the select menu", example: "123456789012345678" },
      { key: "event.user.id", label: "User ID", description: "Who made the selection", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "Username of the selector", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "Display name of the selector", example: "John Doe" },
      { key: "event.user.mention", label: "User Mention", description: "Mention string", example: "<@123456789012345678>" },
      { key: "event.channel.id", label: "Channel ID", description: "Where the selection was made", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "Channel name", example: "roles" },
      { key: "event.timestamp", label: "Timestamp", description: "When the selection was made", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "MODAL_SUBMIT",
    label: "Modal Submit",
    description: "When a modal form is submitted",
    category: "message",
    icon: "LayoutGrid",
    elements: [
      { key: "event.modal.customId", label: "Modal ID", description: "The modal's custom ID", example: "application_form" },
      { key: "event.fields", label: "Form Fields", description: "Object containing all field values", example: '{"name": "John", "email": "john@example.com"}' },
      { key: "event.user.id", label: "User ID", description: "Who submitted the modal", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "Username of the submitter", example: "john_doe" },
      { key: "event.user.displayName", label: "Display Name", description: "Display name of the submitter", example: "John Doe" },
      { key: "event.user.mention", label: "User Mention", description: "Mention string", example: "<@123456789012345678>" },
      { key: "event.channel.id", label: "Channel ID", description: "Where the modal was submitted", example: "987654321098765432" },
      { key: "event.timestamp", label: "Timestamp", description: "When the modal was submitted", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // EMOJI/STICKER EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "EMOJI_CREATE",
    label: "Emoji Created",
    description: "When a custom emoji is created",
    category: "emoji",
    icon: "Smile",
    elements: [
      { key: "event.emoji.id", label: "Emoji ID", description: "The new emoji's ID", example: "123456789012345678" },
      { key: "event.emoji.name", label: "Emoji Name", description: "The emoji's name", example: "custom_emoji" },
      { key: "event.emoji.animated", label: "Is Animated", description: "Whether the emoji is animated", example: "false" },
      { key: "event.emoji.url", label: "Emoji URL", description: "URL to the emoji image", example: "https://cdn.discordapp.com/emojis/..." },
      { key: "event.creator.id", label: "Creator ID", description: "Who created the emoji", example: "123456789012345678" },
      { key: "event.creator.username", label: "Creator Username", description: "Username of the creator", example: "john_doe" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the emoji was created", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "EMOJI_DELETE",
    label: "Emoji Deleted",
    description: "When a custom emoji is deleted",
    category: "emoji",
    icon: "Trash2",
    elements: [
      { key: "event.emoji.id", label: "Emoji ID", description: "The deleted emoji's ID", example: "123456789012345678" },
      { key: "event.emoji.name", label: "Emoji Name", description: "The emoji's name (if cached)", example: "custom_emoji" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the emoji was deleted", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "STICKER_CREATE",
    label: "Sticker Created",
    description: "When a custom sticker is created",
    category: "emoji",
    icon: "Sticker",
    elements: [
      { key: "event.sticker.id", label: "Sticker ID", description: "The new sticker's ID", example: "123456789012345678" },
      { key: "event.sticker.name", label: "Sticker Name", description: "The sticker's name", example: "Cool Sticker" },
      { key: "event.sticker.description", label: "Description", description: "The sticker's description", example: "A very cool sticker" },
      { key: "event.sticker.url", label: "Sticker URL", description: "URL to the sticker image", example: "https://cdn.discordapp.com/stickers/..." },
      { key: "event.creator.id", label: "Creator ID", description: "Who created the sticker", example: "123456789012345678" },
      { key: "event.creator.username", label: "Creator Username", description: "Username of the creator", example: "john_doe" },
      { key: "event.timestamp", label: "Timestamp", description: "When the sticker was created", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "STICKER_DELETE",
    label: "Sticker Deleted",
    description: "When a custom sticker is deleted",
    category: "emoji",
    icon: "Trash2",
    elements: [
      { key: "event.sticker.id", label: "Sticker ID", description: "The deleted sticker's ID", example: "123456789012345678" },
      { key: "event.sticker.name", label: "Sticker Name", description: "The sticker's name (if cached)", example: "Cool Sticker" },
      { key: "event.timestamp", label: "Timestamp", description: "When the sticker was deleted", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // INVITE EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "INVITE_CREATE",
    label: "Invite Created",
    description: "When a new invite is created",
    category: "guild",
    icon: "Link",
    elements: [
      { key: "event.invite.code", label: "Invite Code", description: "The invite code", example: "abc123" },
      { key: "event.invite.url", label: "Invite URL", description: "Full invite URL", example: "https://discord.gg/abc123" },
      { key: "event.invite.maxUses", label: "Max Uses", description: "Maximum number of uses", example: "10" },
      { key: "event.invite.maxAge", label: "Max Age", description: "Duration in seconds", example: "86400" },
      { key: "event.invite.temporary", label: "Is Temporary", description: "Whether it grants temporary membership", example: "false" },
      { key: "event.channel.id", label: "Channel ID", description: "The target channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The target channel's name", example: "general" },
      { key: "event.inviter.id", label: "Inviter ID", description: "Who created the invite", example: "123456789012345678" },
      { key: "event.inviter.username", label: "Inviter Username", description: "Username of the inviter", example: "john_doe" },
      { key: "event.timestamp", label: "Timestamp", description: "When the invite was created", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "INVITE_DELETE",
    label: "Invite Deleted",
    description: "When an invite is deleted",
    category: "guild",
    icon: "Unlink",
    elements: [
      { key: "event.invite.code", label: "Invite Code", description: "The deleted invite's code", example: "abc123" },
      { key: "event.channel.id", label: "Channel ID", description: "The target channel's ID", example: "987654321098765432" },
      { key: "event.channel.name", label: "Channel Name", description: "The target channel's name", example: "general" },
      { key: "event.deleter.id", label: "Deleter ID", description: "Who deleted the invite", example: "123456789012345678" },
      { key: "event.deleter.username", label: "Deleter Username", description: "Username of the deleter", example: "john_doe" },
      { key: "event.timestamp", label: "Timestamp", description: "When the invite was deleted", example: "2024-03-26T10:30:00Z" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // GUILD/SERVER EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    value: "GUILD_UPDATE",
    label: "Server Updated",
    description: "When the server's properties are changed",
    category: "guild",
    icon: "Settings",
    elements: [
      { key: "event.guild.id", label: "Server ID", description: "The server's ID", example: "123456789012345678" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.oldName", label: "Old Name", description: "Previous name (if changed)", example: "Old Name" },
      { key: "event.newName", label: "New Name", description: "New name (if changed)", example: "New Name" },
      { key: "event.oldDescription", label: "Old Description", description: "Previous description", example: "Old description" },
      { key: "event.newDescription", label: "New Description", description: "New description", example: "New description" },
      { key: "event.changes", label: "Changes", description: "List of what changed", example: "name, description, icon" },
      { key: "event.timestamp", label: "Timestamp", description: "When the server was updated", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "GUILD_BAN_ADD",
    label: "Member Banned",
    description: "When a member is banned from the server",
    category: "guild",
    icon: "Ban",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The banned user's ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The banned user's username", example: "banned_user" },
      { key: "event.user.displayName", label: "Display Name", description: "The banned user's display name", example: "Banned User" },
      { key: "event.reason", label: "Ban Reason", description: "Reason for the ban", example: "Repeated violations" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the ban occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },
  {
    value: "GUILD_BAN_REMOVE",
    label: "Member Unbanned",
    description: "When a member is unbanned from the server",
    category: "guild",
    icon: "Unlock",
    elements: [
      { key: "event.user.id", label: "User ID", description: "The unbanned user's ID", example: "123456789012345678" },
      { key: "event.user.username", label: "Username", description: "The unbanned user's username", example: "unbanned_user" },
      { key: "event.guild.name", label: "Server Name", description: "The server's name", example: "My Server" },
      { key: "event.timestamp", label: "Timestamp", description: "When the unban occurred", example: "2024-03-26T10:30:00Z" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────────

export function getEventByValue(value: string): DiscordEventConfig | undefined {
  return DISCORD_EVENTS.find(e => e.value === value);
}

export function getEventsByCategory(category: EventCategory): DiscordEventConfig[] {
  return DISCORD_EVENTS.filter(e => e.category === category);
}

export function getEventCategories(): { value: EventCategory; label: string; icon: string }[] {
  return [
    { value: "member", label: "Member Events", icon: "Users" },
    { value: "message", label: "Message Events", icon: "MessageSquare" },
    { value: "voice", label: "Voice Events", icon: "Headphones" },
    { value: "role", label: "Role Events", icon: "Shield" },
    { value: "channel", label: "Channel Events", icon: "Hash" },
    { value: "thread", label: "Thread Events", icon: "MessagesSquare" },
    { value: "emoji", label: "Emoji/Sticker Events", icon: "Smile" },
    { value: "guild", label: "Server Events", icon: "Server" },
  ];
}

export function getElementsForEvent(eventType: string): EventElement[] {
  const event = getEventByValue(eventType);
  return event?.elements ?? [];
}

// Common elements available for all events
export const COMMON_ELEMENTS: EventElement[] = [
  { key: "server.id", label: "Server ID", description: "The server's Discord ID", example: "123456789012345678" },
  { key: "server.name", label: "Server Name", description: "The server's name", example: "My Awesome Server" },
  { key: "server.icon", label: "Server Icon", description: "URL to the server's icon", example: "https://cdn.discordapp.com/icons/..." },
  { key: "server.memberCount", label: "Member Count", description: "Current number of members", example: "1234" },
  { key: "timestamp", label: "Timestamp", description: "ISO timestamp of when the event occurred", example: "2024-03-26T10:30:00Z" },
  { key: "date", label: "Date", description: "Current date (YYYY-MM-DD)", example: "2024-03-26" },
  { key: "time", label: "Time", description: "Current time (HH:MM:SS)", example: "10:30:00" },
];