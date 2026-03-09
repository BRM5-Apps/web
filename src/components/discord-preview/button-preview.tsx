interface ButtonPreviewProps {
  label: string;
  style: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
}

const styleMap = {
  primary: "discord-button discord-button-primary",
  secondary: "discord-button discord-button-secondary",
  success: "discord-button discord-button-success",
  danger: "discord-button discord-button-danger",
};

export function ButtonPreview({ label, style, disabled }: ButtonPreviewProps) {
  return (
    <button className={styleMap[style]} disabled={disabled}>
      {label}
    </button>
  );
}
