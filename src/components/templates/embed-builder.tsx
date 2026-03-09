"use client";

// Visual embed builder with live preview
export function EmbedBuilder() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-md border p-6">
        <p className="text-muted-foreground">Embed builder form — wire up with form state</p>
      </div>
      <div className="rounded-md border p-6">
        <p className="text-muted-foreground">Live preview</p>
      </div>
    </div>
  );
}
