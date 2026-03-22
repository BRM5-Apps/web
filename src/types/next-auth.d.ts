import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    discordId?: string;
    username?: string;
    avatar?: string | null;
    authError?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    discordId?: string;
    username?: string;
    avatar?: string | null;
    discordAccessToken?: string;
    authError?: string;
  }
}
