import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featureCards = [
  {
    title: "Server command center",
    description:
      "Manage ranks, rosters, permissions, and structure from one clean dashboard built for organized communities.",
  },
  {
    title: "Discord-powered workflows",
    description:
      "Connect your community operations to Discord so promotions, moderation, and templates stay fast and consistent.",
  },
  {
    title: "Events and activity tracking",
    description:
      "Run trainings, operations, and community events with better visibility into participation and performance.",
  },
  {
    title: "Moderation that scales",
    description:
      "Handle blacklists, promo locks, and community enforcement with tools designed for larger gaming groups.",
  },
  {
    title: "Reusable templates",
    description:
      "Create consistent embeds, containers, and text templates for announcements, logs, and server comms.",
  },
  {
    title: "Stats that matter",
    description:
      "Surface member activity, engagement trends, and leadership insights without juggling multiple tools.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Connect your community",
    description:
      "Bring your server or hub into a centralized space for members, leadership, and moderators.",
  },
  {
    step: "02",
    title: "Organize operations",
    description:
      "Set up ranks, permissions, templates, and moderation systems that match your community structure.",
  },
  {
    step: "03",
    title: "Run with confidence",
    description:
      "Track activity, manage events, and keep your Discord-facing operations polished as your community grows.",
  },
];

const statItems = [
  { value: "All-in-one", label: "Server and Discord operations" },
  { value: "24/7", label: "Community-ready control center" },
  { value: "Built for teams", label: "Leadership, staff, and members" },
];

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const hasBackendCookie = Boolean(cookieStore.get("backendToken")?.value);
  const isAuthenticated = Boolean(session && hasBackendCookie);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.22),transparent_55%)]" />
        <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-10%] top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--background))/0.92_35%,hsl(var(--background))_100%)]" />
      </div>

      <section className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-16 pt-6 sm:px-8 lg:px-12">
        <header className="mb-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-black text-primary">
              B5
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                BRM5 Apps
              </p>
              <p className="text-sm text-muted-foreground">
                Server and Discord community management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Launch your hub</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 border border-primary/20 bg-primary/10 text-primary">
              Gaming communities • Servers • Discord operations
            </Badge>

            <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Run your server like a real command center.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              BRM5 Apps gives gaming communities a central place to manage ranks,
              members, events, moderation, templates, and Discord-facing workflows
              without the spreadsheet chaos.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="shadow-lg shadow-primary/25">
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/dashboard/server">View servers</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="shadow-lg shadow-primary/25">
                    <Link href="/login">Get started</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/login">Connect Discord</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {statItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur"
                >
                  <div className="text-lg font-bold text-foreground">{item.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">Live community ops overview</CardTitle>
              <CardDescription>
                A focused workspace for server leadership, staff teams, and
                Discord-integrated management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-primary/15 bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Active operations
                  </span>
                  <Badge className="bg-primary text-primary-foreground">Synced</Badge>
                </div>
                <div className="mt-3 text-3xl font-black">12 communities</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Managing events, moderation, templates, and member structure.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-background/70 p-4">
                  <div className="text-sm text-muted-foreground">Member systems</div>
                  <div className="mt-2 text-xl font-bold">Ranks + permissions</div>
                </div>
                <div className="rounded-xl border bg-background/70 p-4">
                  <div className="text-sm text-muted-foreground">Discord comms</div>
                  <div className="mt-2 text-xl font-bold">Templates + logs</div>
                </div>
                <div className="rounded-xl border bg-background/70 p-4">
                  <div className="text-sm text-muted-foreground">Operations</div>
                  <div className="mt-2 text-xl font-bold">Events + requests</div>
                </div>
                <div className="rounded-xl border bg-background/70 p-4">
                  <div className="text-sm text-muted-foreground">Moderation</div>
                  <div className="mt-2 text-xl font-bold">Blacklists + controls</div>
                </div>
              </div>

              <div className="rounded-xl border border-dashed bg-background/60 p-4">
                <p className="text-sm text-muted-foreground">
                  Built to make structured gaming groups easier to run, easier to scale,
                  and easier to present professionally.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="mb-10 max-w-2xl">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
            Core platform capabilities
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your leadership team needs in one place
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From server administration to Discord content workflows, the platform is
            built for communities that want structure without friction.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/70 bg-card/70 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            >
              <CardHeader>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-6">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              How it works
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From setup to daily operations
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              BRM5 Apps is designed to support communities from initial structure all
              the way through repeatable daily management.
            </p>
          </div>

          <div className="grid gap-4">
            {workflowSteps.map((item) => (
              <Card key={item.step} className="border-border/70 bg-card/70">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <Badge variant="secondary" className="mb-4 bg-background/80 text-primary">
                Built for serious community operations
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Keep Discord clean, professional, and easy to manage
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                Whether you are running a server, staff group, or wider community hub,
                BRM5 Apps helps your team standardize communication, automate repetitive
                workflows, and stay aligned during fast-moving operations.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border bg-background/80 p-5">
                <div className="text-sm font-medium text-muted-foreground">
                  Community output
                </div>
                <div className="mt-2 text-xl font-bold">Announcements that stay consistent</div>
              </div>
              <div className="rounded-2xl border bg-background/80 p-5">
                <div className="text-sm font-medium text-muted-foreground">
                  Staff tooling
                </div>
                <div className="mt-2 text-xl font-bold">Clear moderation and rank control</div>
              </div>
              <div className="rounded-2xl border bg-background/80 p-5">
                <div className="text-sm font-medium text-muted-foreground">
                  Operational clarity
                </div>
                <div className="mt-2 text-xl font-bold">Events, stats, and member visibility</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-24 pt-10 sm:px-8 lg:px-12">
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="flex flex-col items-start justify-between gap-6 p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Build a stronger server hub from day one
              </h2>
              <p className="mt-3 text-muted-foreground">
                Launch a cleaner, more organized community management experience for
                your staff team and members.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg">
                    <Link href="/dashboard">Go to dashboard</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/dashboard/profile">Open profile</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/login">Start now</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/login">Sign in with Discord</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <footer className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>BRM5 Apps — server and Discord community management.</p>
          <p>Built for structured gaming communities that want better tools.</p>
        </footer>
      </section>
    </main>
  );
}
