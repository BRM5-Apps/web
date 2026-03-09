interface ContainerPreviewProps {
  children: React.ReactNode;
  accentColor?: string;
}

export function ContainerPreview({ children, accentColor }: ContainerPreviewProps) {
  return (
    <div
      className="discord-container"
      style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
    >
      {children}
    </div>
  );
}
