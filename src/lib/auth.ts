import type { NextAuthOptions } from "next-auth";
import type {} from "@/types/next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  // JWT-based sessions; next-auth v4+ produces HMAC-signed tokens by default.
  // The Go API validates with the shared NEXTAUTH_SECRET.
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: { scope: "identify guilds" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign-in, enrich token with Discord identity only.
      // Backend token exchange happens via /api/auth/exchange after login.
      if (account && profile) {
        token.discordId = account.providerAccountId;
        token.username = (profile as { username?: string }).username ?? profile.name ?? "";
        token.avatar = (profile as { avatar?: string }).avatar ?? null;
        token.discordAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // We rely on a cookie for backend token; keep session lightweight.
      session.backendToken = undefined;
      session.discordId = token.discordId as string | undefined;
      session.username = token.username as string | undefined;
      session.avatar = token.avatar as string | null | undefined;
      session.authError = undefined;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callbacks to the same origin
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};
