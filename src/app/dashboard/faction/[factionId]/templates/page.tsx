export default function TemplatesPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Templates</h1>
      <p className="page-description">Manage embed, container, and text templates.</p>
    </div>
  );
}
