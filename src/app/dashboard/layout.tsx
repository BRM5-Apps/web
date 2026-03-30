import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Layout for /dashboard routes.
 * This layout only handles auth - no sidebar needed since all pages redirect.
 * The main app layout with Sidebar is in (dashboard)/layout.tsx
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const hasBackendCookie = Boolean((await cookies()).get("backendToken")?.value);

  if (!session || !hasBackendCookie) {
    redirect("/login");
  }

  // Just render children - no sidebar since /dashboard just redirects to /select-server
  return <>{children}</>;
}