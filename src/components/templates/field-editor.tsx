"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Plus, Trash2 } from "lucide-react";

export interface FieldEditorProps<TItem> {
  name: string; // RHF field array name
  addLabel?: string;
  newItem: () => TItem;
  renderItem: (params: { index: number; remove: () => void; moveUp: () => void; moveDown: () => void }) => React.ReactNode;
}

export function FieldEditor<TItem>({ name, addLabel = "Add item", newItem, renderItem }: FieldEditorProps<TItem>) {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Drag or re-order items; configure each below.</div>
        <Button type="button" variant="outline" size="sm" onClick={() => append(newItem())}>
          <Plus className="mr-2 h-4 w-4" /> {addLabel}
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((f, index) => (
          <div key={f.id} className="rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GripVertical className="h-4 w-4" /> Item {index + 1}
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, index - 1)}>
                  Up
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)}>
                  Down
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {renderItem({ index, remove: () => remove(index), moveUp: () => move(index, index - 1), moveDown: () => move(index, index + 1) })}
          </div>
        ))}
      </div>
    </div>
  );
}

