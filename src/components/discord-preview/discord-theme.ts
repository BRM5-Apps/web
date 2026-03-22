// Discord UI theme tokens for the preview components.
// These are Discord's actual hex values for dark and light mode,
// used only in preview rendering — NOT the app's design system.

export type DiscordTheme = "dark" | "light";

interface DiscordThemeTokens {
  // Message wrapper
  messageBg: string;
  messageHover: string;
  // Embed
  embedBg: string;
  embedBorder: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textLink: string;
  // Bot name / header
  botName: string;
  timestamp: string;
  // Container / components
  containerBg: string;
  containerBorder: string;
  sectionBg: string;
  separatorColor: string;
  selectBg: string;
  selectBorder: string;
  selectText: string;
  selectPlaceholder: string;
}

export const discordThemes: Record<DiscordTheme, DiscordThemeTokens> = {
  dark: {
    messageBg: "#313338",
    messageHover: "#2e3035",
    embedBg: "#2b2d31",
    embedBorder: "#202225",
    textPrimary: "#f2f3f5",
    textSecondary: "#b5bac1",
    textMuted: "#949ba4",
    textLink: "#00A8FC",
    botName: "#f2f3f5",
    timestamp: "#949ba4",
    containerBg: "#2b2d31",
    containerBorder: "#1e1f22",
    sectionBg: "#232428",
    separatorColor: "#3f4147",
    selectBg: "#1f2124",
    selectBorder: "#1e1f22",
    selectText: "#dbdee1",
    selectPlaceholder: "#b5bac1",
  },
  light: {
    messageBg: "#ffffff",
    messageHover: "#f2f3f5",
    embedBg: "#f2f3f5",
    embedBorder: "#e3e5e8",
    textPrimary: "#2e3338",
    textSecondary: "#4f5660",
    textMuted: "#5c5e66",
    textLink: "#006ce7",
    botName: "#060607",
    timestamp: "#5c5e66",
    containerBg: "#f2f3f5",
    containerBorder: "#d4d7dc",
    sectionBg: "#e3e5e8",
    separatorColor: "#d4d7dc",
    selectBg: "#ffffff",
    selectBorder: "#d4d7dc",
    selectText: "#2e3338",
    selectPlaceholder: "#4f5660",
  },
};
