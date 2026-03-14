export default function BlacklistPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Blacklist</h1>
      <p className="page-description">Manage blacklisted users.</p>
    </div>
  );
}
