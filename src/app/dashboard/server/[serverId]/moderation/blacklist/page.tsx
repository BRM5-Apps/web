export default function BlacklistPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Blacklist</h1>
      <p className="page-description">Manage blacklisted users.</p>
    </div>
  );
}
