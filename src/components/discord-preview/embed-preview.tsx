interface EmbedPreviewProps {
  title?: string;
  description?: string;
  color?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: string;
  imageUrl?: string;
  authorName?: string;
  authorIconUrl?: string;
}

export function EmbedPreview({
  title,
  description,
  color = "#5865F2",
  fields,
  footer,
  imageUrl,
  authorName,
  authorIconUrl,
}: EmbedPreviewProps) {
  return (
    <div className="discord-embed" style={{ borderLeftColor: color }}>
      {authorName && (
        <div className="discord-embed-author">
          {authorIconUrl && (
            <img src={authorIconUrl} alt="" className="h-5 w-5 rounded-full" />
          )}
          <span>{authorName}</span>
        </div>
      )}
      {title && <div className="discord-embed-title">{title}</div>}
      {description && <div className="discord-embed-description">{description}</div>}
      {fields?.map((field, i) => (
        <div key={i} className="discord-embed-field">
          <div className="discord-embed-field-name">{field.name}</div>
          <div className="discord-embed-field-value">{field.value}</div>
        </div>
      ))}
      {imageUrl && <img src={imageUrl} alt="" className="discord-embed-image" />}
      {footer && <div className="discord-embed-footer">{footer}</div>}
    </div>
  );
}
