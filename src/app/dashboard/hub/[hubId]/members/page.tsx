export default function HubMembersPage({
  params,
}: {
  params: Promise<{ hubId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Members</h1>
      <p className="page-description">View and manage hub members.</p>
    </div>
  );
}
