export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-discord-darker">
      <div className="w-full max-w-md space-y-6 p-6 text-center">
        {children}
      </div>
    </div>
  );
}
