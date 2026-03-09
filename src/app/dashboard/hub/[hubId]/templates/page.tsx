export default function HubTemplatesPage({
  params,
}: {
  params: { hubId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Templates</h1>
      <p className="page-description">Manage embed, container, and text templates.</p>
    </div>
  );
}
