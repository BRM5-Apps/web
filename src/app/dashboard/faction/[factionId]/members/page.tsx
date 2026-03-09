export default function MembersPage({
  params,
}: {
  params: { factionId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Members</h1>
      <p className="page-description">View and manage faction members.</p>
    </div>
  );
}
