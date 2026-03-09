export default function WelcomeSettingsPage({
  params,
}: {
  params: { factionId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Welcome Settings</h1>
      <p className="page-description">Configure the welcome message and onboarding flow.</p>
    </div>
  );
}
