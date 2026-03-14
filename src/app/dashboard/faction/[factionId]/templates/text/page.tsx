export default function TextTemplatesPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Text Templates</h1>
      <p className="page-description">Create and edit text message templates.</p>
    </div>
  );
}
