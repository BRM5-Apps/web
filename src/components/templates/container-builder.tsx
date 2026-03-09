"use client";

// Visual container builder with live preview
export function ContainerBuilder() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-md border p-6">
        <p className="text-muted-foreground">Container builder form — wire up with form state</p>
      </div>
      <div className="rounded-md border p-6">
        <p className="text-muted-foreground">Live preview</p>
      </div>
    </div>
  );
}
