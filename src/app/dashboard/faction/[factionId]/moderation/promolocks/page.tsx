export default function PromolocksPage({
  params,
}: {
  params: { factionId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Promotion Locks</h1>
      <p className="page-description">View and manage promotion lock flags.</p>
    </div>
  );
}
