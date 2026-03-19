export default async function ServerOverviewPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  return (
    <div className="page-header">
      <h1 className="page-title">Server Overview</h1>
      <p className="page-description">Server ID: {serverId}</p>
    </div>
  );
}
