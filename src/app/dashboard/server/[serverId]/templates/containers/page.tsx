export default function ContainerTemplatesPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Container Templates</h1>
      <p className="page-description">Create and edit Discord container templates.</p>
    </div>
  );
}
