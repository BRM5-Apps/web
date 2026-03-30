"use client";

import type {
  FlowAction,
  FaRoleAction,
  FaNicknameAction,
  FaVoiceAction,
  FaChannelAction,
  FaMessageAction,
  FaThreadAction,
  FaModerationAction,
  FaDataAction,
  FaFlowControl,
  FaWaitUntil,
  FaModalAction,
  SendOutputTemplateType,
  LogLevel,
} from "./types";
import { Input } from "@/components/ui/input";
import { useAllTemplates } from "@/hooks/use-templates";

// Helper for operation dropdown styling
const operationSelectClass = "w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1.5 text-sm text-gray-300 outline-none focus:border-[#5865F2]";
const inputClass = "w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1.5 text-sm text-white outline-none focus:border-[#5865F2]";

// ── RoleActionFields ────────────────────────────────────────────────────────────

interface RoleActionFieldsProps {
  action: FaRoleAction;
  onChange: (updated: FlowAction) => void;
}

export function RoleActionFields({ action, onChange }: RoleActionFieldsProps) {
  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => onChange({ ...action, operation: e.target.value as any })}
        className={operationSelectClass}
      >
        <option value="add">Add Role(s)</option>
        <option value="remove">Remove Role(s)</option>
        <option value="toggle">Toggle Role(s)</option>
        <option value="add_temporary">Add Temporary Role</option>
      </select>

      <Input
        value={action.roleIds?.[0] ?? ""}
        onChange={(e) => onChange({ ...action, roleIds: e.target.value ? [e.target.value] : [] })}
        placeholder="Role ID"
        className={inputClass}
      />

      {action.operation === "add_temporary" && (
        <div className="flex gap-2">
          <Input
            type="number"
            value={action.duration ?? 1}
            onChange={(e) => onChange({ ...action, duration: parseInt(e.target.value) || 1 })}
            className={inputClass}
            min={1}
          />
          <select
            value={action.durationUnit ?? "hours"}
            onChange={(e) => onChange({ ...action, durationUnit: e.target.value as any })}
            className={operationSelectClass}
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      )}

      <Input
        value={action.targetUserId ?? ""}
        onChange={(e) => onChange({ ...action, targetUserId: e.target.value || undefined })}
        placeholder="Target user ID (optional - uses event user)"
        className={inputClass}
      />
    </div>
  );
}

// ── NicknameActionFields ────────────────────────────────────────────────────────

interface NicknameActionFieldsProps {
  action: FaNicknameAction;
  onChange: (updated: FlowAction) => void;
}

export function NicknameActionFields({ action, onChange }: NicknameActionFieldsProps) {
  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => onChange({ ...action, operation: e.target.value as any })}
        className={operationSelectClass}
      >
        <option value="set_nickname">Set Nickname</option>
        <option value="reset_nickname">Reset Nickname</option>
      </select>

      {action.operation === "set_nickname" && (
        <Input
          value={action.nickname ?? ""}
          onChange={(e) => onChange({ ...action, nickname: e.target.value })}
          placeholder="New nickname"
          className={inputClass}
        />
      )}

      <Input
        value={action.targetUserId ?? ""}
        onChange={(e) => onChange({ ...action, targetUserId: e.target.value || undefined })}
        placeholder="Target user ID (optional - uses event user)"
        className={inputClass}
      />
    </div>
  );
}

// ── VoiceActionFields ──────────────────────────────────────────────────────────

interface VoiceActionFieldsProps {
  action: FaVoiceAction;
  onChange: (updated: FlowAction) => void;
}

export function VoiceActionFields({ action, onChange }: VoiceActionFieldsProps) {
  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => onChange({ ...action, operation: e.target.value as any })}
        className={operationSelectClass}
      >
        <option value="move">Move to Voice Channel</option>
        <option value="disconnect">Disconnect from Voice</option>
        <option value="mute">Server Mute</option>
        <option value="deafen">Server Deafen</option>
        <option value="unmute">Unmute</option>
        <option value="undeafen">Undeafen</option>
      </select>

      {action.operation === "move" && (
        <Input
          value={action.targetChannelId ?? ""}
          onChange={(e) => onChange({ ...action, targetChannelId: e.target.value || undefined })}
          placeholder="Target voice channel ID"
          className={inputClass}
        />
      )}

      <Input
        value={action.targetUserId ?? ""}
        onChange={(e) => onChange({ ...action, targetUserId: e.target.value || undefined })}
        placeholder="Target user ID (optional)"
        className={inputClass}
      />

      {(action.operation === "mute" || action.operation === "deafen" || action.operation === "disconnect") && (
        <Input
          value={action.reason ?? ""}
          onChange={(e) => onChange({ ...action, reason: e.target.value || undefined })}
          placeholder="Reason (optional)"
          className={inputClass}
        />
      )}
    </div>
  );
}

// ── ChannelActionFields ────────────────────────────────────────────────────────

interface ChannelActionFieldsProps {
  action: FaChannelAction;
  onChange: (updated: FlowAction) => void;
}

export function ChannelActionFields({ action, onChange }: ChannelActionFieldsProps) {
  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => onChange({ ...action, operation: e.target.value as any })}
        className={operationSelectClass}
      >
        <option value="create">Create Channel</option>
        <option value="delete">Delete Channel</option>
        <option value="edit">Edit Channel</option>
        <option value="lock">Lock Channel</option>
        <option value="unlock">Unlock Channel</option>
        <option value="slow_mode">Set Slow Mode</option>
        <option value="clear_slow_mode">Clear Slow Mode</option>
        <option value="archive_thread">Archive Thread</option>
      </select>

      {(action.operation === "delete" || action.operation === "edit" || action.operation === "lock" ||
        action.operation === "unlock" || action.operation === "slow_mode" || action.operation === "clear_slow_mode" ||
        action.operation === "archive_thread") && (
        <Input
          value={action.channelId ?? ""}
          onChange={(e) => onChange({ ...action, channelId: e.target.value || undefined })}
          placeholder="Channel ID"
          className={inputClass}
        />
      )}

      {action.operation === "create" && (
        <>
          <Input
            value={action.channelName ?? ""}
            onChange={(e) => onChange({ ...action, channelName: e.target.value })}
            placeholder="Channel name"
            className={inputClass}
          />
          <select
            value={action.channelType ?? "text"}
            onChange={(e) => onChange({ ...action, channelType: e.target.value as any })}
            className={operationSelectClass}
          >
            <option value="text">Text</option>
            <option value="voice">Voice</option>
            <option value="announcement">Announcement</option>
            <option value="stage">Stage</option>
          </select>
          <Input
            value={action.parentId ?? ""}
            onChange={(e) => onChange({ ...action, parentId: e.target.value || undefined })}
            placeholder="Category ID (optional)"
            className={inputClass}
          />
        </>
      )}

      {action.operation === "edit" && (
        <>
          <Input
            value={action.channelName ?? ""}
            onChange={(e) => onChange({ ...action, channelName: e.target.value || undefined })}
            placeholder="New name (optional)"
            className={inputClass}
          />
          <Input
            value={action.topic ?? ""}
            onChange={(e) => onChange({ ...action, topic: e.target.value || undefined })}
            placeholder="Topic (optional)"
            className={inputClass}
          />
        </>
      )}

      {action.operation === "slow_mode" && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={action.slowModeDelay ?? 5}
            onChange={(e) => onChange({ ...action, slowModeDelay: parseInt(e.target.value) || 5 })}
            className={inputClass}
            min={0}
            max={21600}
          />
          <span className="text-xs text-gray-400">seconds</span>
        </div>
      )}

      {action.operation === "lock" && (
        <Input
          value={action.reason ?? ""}
          onChange={(e) => onChange({ ...action, reason: e.target.value || undefined })}
          placeholder="Reason (optional)"
          className={inputClass}
        />
      )}
    </div>
  );
}

// ── MessageActionFields ──────────────────────────────────────────────────────────

interface MessageActionFieldsProps {
  action: FaMessageAction;
  onChange: (updated: FlowAction) => void;
  serverId?: string;
}

export function MessageActionFields({ action, onChange, serverId }: MessageActionFieldsProps) {
  const templates = useAllTemplates(serverId ?? "");
  const allTemplates = [
    ...(templates.embeds || []).map((t: { id: string; name: string }) => ({ id: t.id, name: t.name, type: "embed" as const })),
    ...(templates.containers || []).map((t: { id: string; name: string }) => ({ id: t.id, name: t.name, type: "container" as const })),
    ...(templates.texts || []).map((t: { id: string; name: string }) => ({ id: t.id, name: t.name, type: "text" as const })),
    ...(templates.modals || []).map((t: { id: string; name: string }) => ({ id: t.id, name: t.name, type: "modal" as const })),
  ];

  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => {
          const op = e.target.value;
          onChange({
            ...action,
            operation: op as any,
            // Reset operation-specific fields
            templateId: undefined,
            templateType: undefined,
            sendAs: undefined,
            channelId: undefined,
            fallbackChannelId: undefined,
            hidden: undefined,
            messageId: undefined,
            emoji: undefined,
          });
        }}
        className={operationSelectClass}
      >
        <optgroup label="Send Messages">
          <option value="send_output">Send Output</option>
          <option value="edit_message">Edit Message</option>
        </optgroup>
        <optgroup label="Manage Messages">
          <option value="delete">Delete Message</option>
          <option value="pin">Pin Message</option>
          <option value="unpin">Unpin Message</option>
          <option value="react">Add Reaction</option>
        </optgroup>
      </select>

      {/* Send Output - unified send operation */}
      {action.operation === "send_output" && (
        <>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Send As</label>
            <select
              value={action.sendAs ?? "channel"}
              onChange={(e) => onChange({ ...action, sendAs: e.target.value as any })}
              className={operationSelectClass}
            >
              <option value="channel">Send to Channel</option>
              <option value="dm">Direct Message</option>
              <option value="reply">Reply to Message</option>
            </select>
          </div>

          {(action.sendAs === "channel" || !action.sendAs) && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Channel ID (optional)</label>
              <Input
                value={action.channelId ?? ""}
                onChange={(e) => onChange({ ...action, channelId: e.target.value || undefined })}
                placeholder="Leave empty for current channel"
                className={inputClass}
              />
            </div>
          )}

          {action.sendAs === "dm" && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fallback Channel (if DM fails)</label>
              <Input
                value={action.fallbackChannelId ?? ""}
                onChange={(e) => onChange({ ...action, fallbackChannelId: e.target.value || undefined })}
                placeholder="Channel ID"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Template Type</label>
            <select
              value={action.templateType ?? "text"}
              onChange={(e) => onChange({ ...action, templateType: e.target.value as SendOutputTemplateType })}
              className={operationSelectClass}
            >
              <option value="text">Text</option>
              <option value="embed">Embed</option>
              <option value="container">Container (Components V2)</option>
            </select>
          </div>

          {allTemplates.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Template</label>
              <select
                value={action.templateId ?? ""}
                onChange={(e) => onChange({ ...action, templateId: e.target.value || undefined })}
                className={operationSelectClass}
              >
                <option value="">Select template...</option>
                {allTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={action.hidden ?? false}
              onChange={(e) => onChange({ ...action, hidden: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-400">Hidden (ephemeral)</span>
          </div>
        </>
      )}

      {/* Edit Message */}
      {action.operation === "edit_message" && (
        <>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Message ID (optional)</label>
            <Input
              value={action.messageId ?? ""}
              onChange={(e) => onChange({ ...action, messageId: e.target.value || undefined })}
              placeholder="Leave empty to edit the last message sent in this flow"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Template Type</label>
            <select
              value={action.templateType ?? "text"}
              onChange={(e) => onChange({ ...action, templateType: e.target.value as SendOutputTemplateType })}
              className={operationSelectClass}
            >
              <option value="text">Text</option>
              <option value="embed">Embed</option>
              <option value="container">Container (Components V2)</option>
            </select>
          </div>
          {allTemplates.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Template</label>
              <select
                value={action.templateId ?? ""}
                onChange={(e) => onChange({ ...action, templateId: e.target.value || undefined })}
                className={operationSelectClass}
              >
                <option value="">Select template...</option>
                {allTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {/* Delete Message */}
      {action.operation === "delete" && (
        <Input
          value={action.messageId ?? ""}
          onChange={(e) => onChange({ ...action, messageId: e.target.value || undefined })}
          placeholder="Message ID (optional - uses triggering message)"
          className={inputClass}
        />
      )}

      {/* Pin/Unpin Message */}
      {(action.operation === "pin" || action.operation === "unpin") && (
        <>
          <Input
            value={action.messageId ?? ""}
            onChange={(e) => onChange({ ...action, messageId: e.target.value || undefined })}
            placeholder="Message ID (optional - uses triggering message)"
            className={inputClass}
          />
          <Input
            value={action.channelId ?? ""}
            onChange={(e) => onChange({ ...action, channelId: e.target.value || undefined })}
            placeholder="Channel ID (optional)"
            className={inputClass}
          />
        </>
      )}

      {/* Add Reaction */}
      {action.operation === "react" && (
        <>
          <Input
            value={action.messageId ?? ""}
            onChange={(e) => onChange({ ...action, messageId: e.target.value || undefined })}
            placeholder="Message ID (optional - uses triggering message)"
            className={inputClass}
          />
          <Input
            value={action.emoji ?? ""}
            onChange={(e) => onChange({ ...action, emoji: e.target.value })}
            placeholder="Emoji (e.g., 👍 or :custom_emoji:)"
            className={inputClass}
          />
        </>
      )}
    </div>
  );
}

// ── ModerationActionFields ──────────────────────────────────────────────────────

interface ModerationActionFieldsProps {
  action: FaModerationAction;
  onChange: (updated: FlowAction) => void;
}

export function ModerationActionFields({ action, onChange }: ModerationActionFieldsProps) {
  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => onChange({ ...action, operation: e.target.value as any })}
        className={operationSelectClass}
      >
        <option value="kick">Kick User</option>
        <option value="ban">Ban User</option>
        <option value="unban">Unban User</option>
        <option value="timeout">Timeout User</option>
        <option value="remove_timeout">Remove Timeout</option>
        <option value="warn">Warn User</option>
        <option value="clear_warnings">Clear Warnings</option>
        <option value="quarantine">Quarantine User</option>
      </select>

      <Input
        value={action.targetUserId ?? ""}
        onChange={(e) => onChange({ ...action, targetUserId: e.target.value || undefined })}
        placeholder="Target user ID (optional - uses event user)"
        className={inputClass}
      />

      {action.operation === "timeout" && (
        <div className="flex gap-2">
          <Input
            type="number"
            value={action.duration ?? 1}
            onChange={(e) => onChange({ ...action, duration: parseInt(e.target.value) || 1 })}
            className={inputClass}
            min={1}
          />
          <select
            value={action.durationUnit ?? "minutes"}
            onChange={(e) => onChange({ ...action, durationUnit: e.target.value as any })}
            className={operationSelectClass}
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      )}

      {action.operation === "ban" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Delete messages:</span>
          <select
            value={action.deleteMessageDays ?? 0}
            onChange={(e) => onChange({ ...action, deleteMessageDays: parseInt(e.target.value) })}
            className={operationSelectClass}
          >
            <option value={0}>Don&apos;t delete</option>
            <option value={1}>Last 24 hours</option>
            <option value={2}>Last 2 days</option>
            <option value={3}>Last 3 days</option>
            <option value={4}>Last 4 days</option>
            <option value={5}>Last 5 days</option>
            <option value={6}>Last 6 days</option>
            <option value={7}>Last 7 days</option>
          </select>
        </div>
      )}

      {action.operation === "quarantine" && (
        <Input
          value={action.quarantineRoleId ?? ""}
          onChange={(e) => onChange({ ...action, quarantineRoleId: e.target.value || undefined })}
          placeholder="Quarantine role ID"
          className={inputClass}
        />
      )}

      {(action.operation === "kick" || action.operation === "ban" || action.operation === "timeout" || action.operation === "warn") && (
        <Input
          value={action.reason ?? ""}
          onChange={(e) => onChange({ ...action, reason: e.target.value || undefined })}
          placeholder="Reason (optional)"
          className={inputClass}
        />
      )}
    </div>
  );
}

// ── DataActionFields ──────────────────────────────────────────────────────────────

interface DataActionFieldsProps {
  action: FaDataAction;
  onChange: (updated: FlowAction) => void;
}

export function DataActionFields({ action, onChange }: DataActionFieldsProps) {
  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => onChange({ ...action, operation: e.target.value as any })}
        className={operationSelectClass}
      >
        <option value="set">Set Variable</option>
        <option value="increment">Increment</option>
        <option value="decrement">Decrement</option>
        <option value="append">Append to Array</option>
        <option value="remove">Remove from Array</option>
        <option value="random_number">Random Number</option>
        <option value="random_choice">Random Choice</option>
      </select>

      <Input
        value={action.varName}
        onChange={(e) => onChange({ ...action, varName: e.target.value })}
        placeholder="Variable name"
        className={inputClass}
      />

      {(action.operation === "set" || action.operation === "increment" || action.operation === "decrement" || action.operation === "append" || action.operation === "remove") && (
        <Input
          value={action.value?.toString() ?? ""}
          onChange={(e) => onChange({ ...action, value: e.target.value })}
          placeholder={action.operation === "increment" || action.operation === "decrement" ? "Amount" : "Value"}
          className={inputClass}
        />
      )}

      {action.operation === "random_number" && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Min</label>
            <Input
              type="number"
              value={action.min ?? 0}
              onChange={(e) => onChange({ ...action, min: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Max</label>
            <Input
              type="number"
              value={action.max ?? 100}
              onChange={(e) => onChange({ ...action, max: parseInt(e.target.value) || 100 })}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {action.operation === "random_choice" && (
        <textarea
          value={action.choices?.join("\n") ?? ""}
          onChange={(e) => onChange({ ...action, choices: e.target.value.split("\n").filter(Boolean) })}
          placeholder="One choice per line"
          rows={3}
          className={`${inputClass} resize-y`}
        />
      )}
    </div>
  );
}

// ── FlowControlFields ────────────────────────────────────────────────────────────

interface FlowControlFieldsProps {
  action: FaFlowControl;
  onChange: (updated: FlowAction) => void;
}

export function FlowControlFields({ action, onChange }: FlowControlFieldsProps) {
  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => onChange({ ...action, operation: e.target.value as any })}
        className={operationSelectClass}
      >
        <option value="loop">Loop</option>
        <option value="parallel">Parallel Execution</option>
        <option value="try_catch">Try/Catch</option>
        <option value="subflow">Call Subflow</option>
        <option value="return">Return</option>
        <option value="break">Break</option>
        <option value="continue">Continue</option>
        <option value="retry">Retry</option>
      </select>

      {action.operation === "loop" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Iterations:</span>
          <Input
            type="number"
            value={action.iterations ?? 1}
            onChange={(e) => onChange({ ...action, iterations: parseInt(e.target.value) || 1 })}
            className={inputClass}
            min={1}
          />
        </div>
      )}

      {action.operation === "subflow" && (
        <Input
          value={action.subflowId ?? ""}
          onChange={(e) => onChange({ ...action, subflowId: e.target.value || undefined })}
          placeholder="Subflow ID"
          className={inputClass}
        />
      )}

      {action.operation === "retry" && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Max retries:</span>
            <Input
              type="number"
              value={action.maxRetries ?? 3}
              onChange={(e) => onChange({ ...action, maxRetries: parseInt(e.target.value) || 3 })}
              className={inputClass}
              min={1}
              max={10}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Delay (ms):</span>
            <Input
              type="number"
              value={action.retryDelay ?? 1000}
              onChange={(e) => onChange({ ...action, retryDelay: parseInt(e.target.value) || 1000 })}
              className={inputClass}
              min={0}
            />
          </div>
        </>
      )}

      {(action.operation === "return" || action.operation === "break" || action.operation === "continue") && (
        <p className="text-xs text-gray-400">No additional configuration needed.</p>
      )}
    </div>
  );
}

// ── WaitUntilFields ──────────────────────────────────────────────────────────────

interface WaitUntilFieldsProps {
  action: FaWaitUntil;
  onChange: (updated: FlowAction) => void;
}

export function WaitUntilFields({ action, onChange }: WaitUntilFieldsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">Wait until a specific time or condition is met.</p>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Wait until timestamp (optional)</label>
        <Input
          type="datetime-local"
          value={action.timestamp ?? ""}
          onChange={(e) => onChange({ ...action, timestamp: e.target.value || undefined })}
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Max wait (seconds):</span>
        <Input
          type="number"
          value={action.maxWait ?? 300}
          onChange={(e) => onChange({ ...action, maxWait: parseInt(e.target.value) || 300 })}
          className={inputClass}
          min={1}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Check interval (seconds):</span>
        <Input
          type="number"
          value={action.checkInterval ?? 10}
          onChange={(e) => onChange({ ...action, checkInterval: parseInt(e.target.value) || 10 })}
          className={inputClass}
          min={1}
        />
      </div>

      <p className="text-xs text-gray-500 italic">Condition builder available in visual editor.</p>
    </div>
  );
}

// ── ThreadActionFields ────────────────────────────────────────────────────────────

interface ThreadActionFieldsProps {
  action: FaThreadAction;
  onChange: (updated: FlowAction) => void;
}

export function ThreadActionFields({ action, onChange }: ThreadActionFieldsProps) {
  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => onChange({ ...action, operation: e.target.value as any })}
        className={operationSelectClass}
      >
        <option value="create">Create Thread</option>
        <option value="archive">Archive Thread</option>
        <option value="delete">Delete Thread</option>
      </select>

      {action.operation === "create" && (
        <>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Parent Channel ID</label>
            <Input
              value={action.channelId ?? ""}
              onChange={(e) => onChange({ ...action, channelId: e.target.value || undefined })}
              placeholder="Channel ID to create thread in"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Thread Name</label>
            <Input
              value={action.name ?? ""}
              onChange={(e) => onChange({ ...action, name: e.target.value })}
              placeholder="Thread name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Thread Type</label>
            <select
              value={action.threadType ?? "public"}
              onChange={(e) => onChange({ ...action, threadType: e.target.value as any })}
              className={operationSelectClass}
            >
              <option value="public">Public Thread</option>
              <option value="private">Private Thread</option>
              <option value="news">News Thread</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Auto Archive Duration</label>
            <select
              value={action.autoArchive ?? 60}
              onChange={(e) => onChange({ ...action, autoArchive: parseInt(e.target.value) })}
              className={operationSelectClass}
            >
              <option value={60}>1 Hour</option>
              <option value={1440}>1 Day</option>
              <option value={4320}>3 Days</option>
              <option value={10080}>1 Week</option>
            </select>
          </div>
        </>
      )}

      {(action.operation === "archive" || action.operation === "delete") && (
        <>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Thread ID</label>
            <Input
              value={action.threadId ?? ""}
              onChange={(e) => onChange({ ...action, threadId: e.target.value || undefined })}
              placeholder="Thread ID"
              className={inputClass}
            />
          </div>
          {action.operation === "delete" && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Reason (optional)</label>
              <Input
                value={action.reason ?? ""}
                onChange={(e) => onChange({ ...action, reason: e.target.value || undefined })}
                placeholder="Reason for deletion"
                className={inputClass}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── ModalActionFields ──────────────────────────────────────────────────────────

interface ModalActionFieldsProps {
  action: FaModalAction;
  onChange: (updated: FlowAction) => void;
  serverId?: string;
}

export function ModalActionFields({ action, onChange, serverId }: ModalActionFieldsProps) {
  const templates = useAllTemplates(serverId ?? "");
  const modalTemplates = (templates.modals || []).map((t: { id: string; name: string }) => ({
    id: t.id,
    name: t.name,
  }));

  return (
    <div className="space-y-2">
      <select
        value={action.operation}
        onChange={(e) => {
          const op = e.target.value;
          onChange({
            ...action,
            operation: op as any,
            // Reset operation-specific fields
            modalId: undefined,
            title: undefined,
            customId: undefined,
            targetModalId: undefined,
            fields: undefined,
            closeModalId: undefined,
          });
        }}
        className={operationSelectClass}
      >
        <option value="show">Show Modal</option>
        <option value="update">Update Modal</option>
        <option value="close">Close Modal</option>
      </select>

      {action.operation === "show" && (
        <>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Modal Template</label>
            <select
              value={action.modalId ?? ""}
              onChange={(e) => onChange({ ...action, modalId: e.target.value || undefined })}
              className={operationSelectClass}
            >
              <option value="">Select modal template...</option>
              {modalTemplates.map((t: { id: string; name: string }) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title Override (optional)</label>
            <Input
              value={action.title ?? ""}
              onChange={(e) => onChange({ ...action, title: e.target.value || undefined })}
              placeholder="Override modal title"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Custom ID (optional)</label>
            <Input
              value={action.customId ?? ""}
              onChange={(e) => onChange({ ...action, customId: e.target.value || undefined })}
              placeholder="For tracking modal interactions"
              className={inputClass}
            />
          </div>
        </>
      )}

      {action.operation === "update" && (
        <>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Target Modal ID</label>
            <Input
              value={action.targetModalId ?? ""}
              onChange={(e) => onChange({ ...action, targetModalId: e.target.value || undefined })}
              placeholder="The modal instance to update"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Field Updates</label>
            <textarea
              value={action.fields ? JSON.stringify(action.fields, null, 2) : ""}
              onChange={(e) => {
                try {
                  const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;
                  onChange({ ...action, fields: parsed });
                } catch {
                  // Invalid JSON - keep as is
                }
              }}
              placeholder='{"field_id": "new value"}'
              rows={3}
              className={`${inputClass} resize-y font-mono text-xs`}
            />
          </div>
        </>
      )}

      {action.operation === "close" && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Modal ID (optional)</label>
          <Input
            value={action.closeModalId ?? ""}
            onChange={(e) => onChange({ ...action, closeModalId: e.target.value || undefined })}
            placeholder="Leave empty to close current modal"
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
}