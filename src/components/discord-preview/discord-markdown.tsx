/** Simple Discord markdown renderer (bold, italic, code, etc.) */
export function DiscordMarkdown({ content }: { content: string }) {
  // Minimal rendering — expand as needed
  const html = content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-black/30 px-1 py-0.5 text-sm">$1</code>')
    .replace(/\n/g, "<br />");

  return (
    <span
      className="text-sm text-[#dcddde]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
