import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const hasBackendCookie = Boolean(cookies().get("backendToken")?.value);

  if (!session || !hasBackendCookie) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col" style={{ marginLeft: "var(--sidebar-width)" }}>
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
