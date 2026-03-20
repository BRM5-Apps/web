"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAllTemplates } from "@/hooks/use-templates";
import type {
  FlowAction,
  FaWait,
  FaAddRole,
  FaRemoveRole,
  FaToggleRole,
  FaSendOutput,
  FaCreateThread,
  FaSetVariable,
  FaDeleteMessage,
  FaStop,
} from "./types";

interface ActionFieldsProps {
  action: FlowAction;
  onChange: (action: FlowAction) => void;
  serverId?: string;
}

export function ActionFields({ action, onChange, serverId }: ActionFieldsProps) {
  switch (action.type) {
    case "do_nothing":
      return (
        <p className="text-xs text-[#b5bac1]">
          This action does nothing. Useful for display buttons.
        </p>
      );

    case "wait":
      return <WaitFields action={action} onChange={onChange} />;

    case "add_role":
    case "remove_role":
    case "toggle_role":
      return <RoleFields action={action} onChange={onChange} />;

    case "send_output":
      return <SendOutputFields action={action} onChange={onChange} serverId={serverId} />;

    case "create_thread":
      return <CreateThreadFields action={action} onChange={onChange} />;

    case "set_variable":
      return <SetVariableFields action={action} onChange={onChange} />;

    case "delete_message":
      return <DeleteMessageFields action={action} onChange={onChange} />;

    case "stop":
      return <StopFields action={action} onChange={onChange} />;

    default:
      return null;
  }
}

// ── Individual Field Components ──────────────────────────────────────────────

const TIME_UNITS: { value: FaWait["unit"]; label: string; multiplier: number }[] = [
  { value: "seconds", label: "Seconds", multiplier: 1 },
  { value: "minutes", label: "Minutes", multiplier: 60 },
  { value: "hours", label: "Hours", multiplier: 3600 },
  { value: "days", label: "Days", multiplier: 86400 },
  { value: "weeks", label: "Weeks", multiplier: 604800 },
  { value: "months", label: "Months", multiplier: 2592000 }, // ~30 days
];

function WaitFields({ action, onChange }: { action: FaWait; onChange: (a: FlowAction) => void }) {
  const currentUnit = TIME_UNITS.find((u) => u.value === action.unit) || TIME_UNITS[0];

  function updateDuration(value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    onChange({ ...action, duration: num });
  }

  function cycleUnit(direction: "prev" | "next") {
    const currentIndex = TIME_UNITS.findIndex((u) => u.value === action.unit);
    let newIndex: number;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % TIME_UNITS.length;
    } else {
      newIndex = currentIndex === 0 ? TIME_UNITS.length - 1 : currentIndex - 1;
    }
    onChange({ ...action, unit: TIME_UNITS[newIndex].value });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Duration</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            min={0}
            value={action.duration}
            onChange={(e) => updateDuration(e.target.value)}
            className="w-24 bg-[#1e1f22] border-[#3f4147] text-white text-center"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => cycleUnit("prev")}
              className="w-7 h-8 rounded bg-[#1e1f22] border border-[#3f4147] text-white hover:bg-[#3f4147] flex items-center justify-center"
            >
              ◀
            </button>
            <span className="text-white min-w-[4.5rem] text-center text-sm px-2 py-1 bg-[#1e1f22] border border-[#3f4147] rounded">
              {currentUnit.label}
            </span>
            <button
              type="button"
              onClick={() => cycleUnit("next")}
              className="w-7 h-8 rounded bg-[#1e1f22] border border-[#3f4147] text-white hover:bg-[#3f4147] flex items-center justify-center"
            >
              ▶
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[#b5bac1] mt-1">
          Total: {action.duration * currentUnit.multiplier} seconds
        </p>
      </div>
    </div>
  );
}

function RoleFields({
  action,
  onChange,
}: {
  action: FaAddRole | FaRemoveRole | FaToggleRole;
  onChange: (a: FlowAction) => void;
}) {
  const roleIds = action.roleIds || [];

  function addRole(value: string) {
    onChange({ ...action, roleIds: [...roleIds, value] });
  }

  function updateRole(index: number, value: string) {
    const newRoleIds = [...roleIds];
    newRoleIds[index] = value;
    onChange({ ...action, roleIds: newRoleIds });
  }

  function removeRole(index: number) {
    onChange({ ...action, roleIds: roleIds.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-[#b5bac1]">Roles ({roleIds.length})</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addRole("")}
          className="h-6 text-xs border-[#5865F2]/50 text-[#5865F2] hover:bg-[#5865F2]/20"
        >
          + Add Role
        </Button>
      </div>

      {roleIds.length === 0 ? (
        <p className="text-xs text-[#b5bac1] italic">No roles configured</p>
      ) : (
        <div className="space-y-2">
          {roleIds.map((roleId, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={roleId}
                onChange={(e) => updateRole(index, e.target.value)}
                placeholder="Role ID or {{element:roleId}}"
                className="flex-1 bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
              />
              <button
                type="button"
                onClick={() => removeRole(index)}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SendOutputFields({
  action,
  onChange,
  serverId,
}: {
  action: FaSendOutput;
  onChange: (a: FlowAction) => void;
  serverId?: string;
}) {
  const templates = useAllTemplates(serverId || "");

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Output Type</Label>
        <Select
          value={action.outputKind}
          onValueChange={(v) => onChange({ ...action, outputKind: v as "message" | "modal" })}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147]">
            <SelectItem value="message">Message</SelectItem>
            <SelectItem value="modal">Modal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Template</Label>
        <Select
          value={action.templateId || ""}
          onValueChange={(v) => {
            const templateId = v || undefined;
            // Find the template type based on the ID
            let templateType: typeof action.templateType = undefined;
            if (templates.texts.find((t) => t.id === v)) templateType = "text";
            else if (templates.embeds.find((t) => t.id === v)) templateType = "embed";
            else if (templates.containers.find((t) => t.id === v)) templateType = "container";
            else if (templates.modals.find((t) => t.id === v)) templateType = "modal";
            onChange({ ...action, templateId, templateType });
          }}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue placeholder="Select template..." />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147] max-h-60">
            {templates.texts.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Text Templates</div>
                {templates.texts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
            {templates.embeds.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Embed Templates</div>
                {templates.embeds.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
            {templates.containers.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Container Templates</div>
                {templates.containers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
            {action.outputKind === "modal" && templates.modals.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Modal Templates</div>
                {templates.modals.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {action.outputKind === "message" && (
        <div className="space-y-3 pt-2 border-t border-[#3f4147]">
          <Label className="text-xs text-[#b5bac1] uppercase tracking-wide">Message Options</Label>

          <div className="flex items-center gap-2">
            <Switch
              checked={action.hidden}
              onCheckedChange={(v) => onChange({ ...action, hidden: v, reply: v ? false : action.reply })}
            />
            <Label className="text-xs text-[#b5bac1]">Hidden (ephemeral)</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={action.reply || false}
              onCheckedChange={(v) => onChange({ ...action, reply: v, hidden: v ? false : action.hidden, edit: v ? false : action.edit })}
            />
            <Label className="text-xs text-[#b5bac1]">Reply to triggering message</Label>
          </div>

          {action.reply && (
            <div className="flex items-center gap-2 pl-6">
              <Switch
                checked={action.replyEphemeral || false}
                onCheckedChange={(v) => onChange({ ...action, replyEphemeral: v })}
              />
              <Label className="text-xs text-[#b5bac1]">Reply as ephemeral</Label>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              checked={action.edit || false}
              onCheckedChange={(v) => onChange({ ...action, edit: v, hidden: v ? false : action.hidden, reply: v ? false : action.reply })}
            />
            <Label className="text-xs text-[#b5bac1]">Edit triggering message</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={action.editOriginal || false}
              onCheckedChange={(v) => onChange({ ...action, editOriginal: v })}
            />
            <Label className="text-xs text-[#b5bac1]">Edit original response</Label>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateThreadFields({
  action,
  onChange,
}: {
  action: FaCreateThread;
  onChange: (a: FlowAction) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Channel ID</Label>
        <Input
          value={action.channelId || ""}
          onChange={(e) => onChange({ ...action, channelId: e.target.value })}
          placeholder="Parent channel ID"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Thread Name</Label>
        <Input
          value={action.name}
          onChange={(e) => onChange({ ...action, name: e.target.value.slice(0, 100) })}
          placeholder="Thread name"
          maxLength={100}
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Thread Type</Label>
        <Select
          value={action.threadType || ""}
          onValueChange={(v) => onChange({ ...action, threadType: v || undefined })}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147]">
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SetVariableFields({
  action,
  onChange,
}: {
  action: FaSetVariable;
  onChange: (a: FlowAction) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Variable Type</Label>
        <Select
          value={action.varType}
          onValueChange={(v) => onChange({ ...action, varType: v })}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147]">
            <SelectItem value="Static">Static</SelectItem>
            <SelectItem value="Dynamic">Dynamic</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Guild">Guild</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Variable Name</Label>
        <Input
          value={action.varName}
          onChange={(e) => onChange({ ...action, varName: e.target.value })}
          placeholder="myVariable"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Value</Label>
        <Input
          value={action.value}
          onChange={(e) => onChange({ ...action, value: e.target.value })}
          placeholder="Value or {{element:xxx}}"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>
    </div>
  );
}

function DeleteMessageFields({
  action,
  onChange,
}: {
  action: FaDeleteMessage;
  onChange: (a: FlowAction) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#b5bac1]">
        Deletes the message this component is attached to.
      </p>
      <div>
        <Label className="text-xs text-[#b5bac1]">Message ID (optional)</Label>
        <Input
          value={action.messageId || ""}
          onChange={(e) => onChange({ ...action, messageId: e.target.value })}
          placeholder="Override message ID"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>
    </div>
  );
}

function StopFields({ action, onChange }: { action: FaStop; onChange: (a: FlowAction) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Message Content</Label>
        <textarea
          value={action.content}
          onChange={(e) => onChange({ ...action, content: e.target.value.slice(0, 2000) })}
          placeholder="Optional message to send..."
          rows={3}
          maxLength={2000}
          className="mt-1 w-full bg-[#1e1f22] border border-[#3f4147] text-white rounded px-3 py-2 resize-y"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={action.hidden}
            onCheckedChange={(v) => onChange({ ...action, hidden: v })}
          />
          <Label className="text-xs text-[#b5bac1]">Hidden (ephemeral)</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={action.silent}
            onCheckedChange={(v) => onChange({ ...action, silent: v })}
          />
          <Label className="text-xs text-[#b5bac1]">Silent</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={action.hideEmbeds}
            onCheckedChange={(v) => onChange({ ...action, hideEmbeds: v })}
          />
          <Label className="text-xs text-[#b5bac1]">Hide Embeds</Label>
        </div>
      </div>
    </div>
  );
}
