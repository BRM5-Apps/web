export default function EmbedTemplatesPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Embed Templates</h1>
      <p className="page-description">Create and edit Discord embed templates.</p>
    </div>
  );
}
