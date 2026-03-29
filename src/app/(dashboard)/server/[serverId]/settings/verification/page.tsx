"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle, XCircle, Loader2, Save, Link as LinkIcon, ExternalLink, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface VerificationConfig {
  id: string;
  server_id: string;
  enabled: boolean;
  required: boolean;
  verified_role_id?: string;
  unverified_role_id?: string;
  verification_channel_id?: string;
  welcome_message?: string;
  group_verification_enabled: boolean;
  roblox_group_id?: number;
  roblox_group_name?: string;
  require_group_membership: boolean;
}

export default function VerificationSettingsPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [enabled, setEnabled] = useState(false);
  const [required, setRequired] = useState(false);
  const [verifiedRoleId, setVerifiedRoleId] = useState("");
  const [unverifiedRoleId, setUnverifiedRoleId] = useState("");
  const [verificationChannelId, setVerificationChannelId] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [groupVerificationEnabled, setGroupVerificationEnabled] = useState(false);
  const [robloxGroupId, setRobloxGroupId] = useState("");
  const [robloxGroupName, setRobloxGroupName] = useState("");
  const [requireGroupMembership, setRequireGroupMembership] = useState(false);

  // Fetch current config
  const { data: config, isLoading } = useQuery({
    queryKey: ["server", serverId, "verification-config"],
    queryFn: async () => {
      return apiClient.get<VerificationConfig>(`/servers/${serverId}/roblox/config`);
    },
  });

  // Sync form state when config loads
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setRequired(config.required);
      setVerifiedRoleId(config.verified_role_id || "");
      setUnverifiedRoleId(config.unverified_role_id || "");
      setVerificationChannelId(config.verification_channel_id || "");
      setWelcomeMessage(config.welcome_message || "");
      setGroupVerificationEnabled(config.group_verification_enabled || false);
      setRobloxGroupId(config.roblox_group_id?.toString() || "");
      setRobloxGroupName(config.roblox_group_name || "");
      setRequireGroupMembership(config.require_group_membership || false);
    }
  }, [config]);

  // Update config mutation
  const updateConfig = useMutation({
    mutationFn: async (newConfig: Partial<VerificationConfig>) => {
      return apiClient.put<VerificationConfig>(`/servers/${serverId}/roblox/config`, newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", serverId, "verification-config"] });
      toast({
        title: "Settings saved",
        description: "Verification settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message || "An error occurred while saving settings.",
      });
    },
  });

  const handleSave = () => {
    updateConfig.mutate({
      enabled,
      required,
      verified_role_id: verifiedRoleId || undefined,
      unverified_role_id: unverifiedRoleId || undefined,
      verification_channel_id: verificationChannelId || undefined,
      welcome_message: welcomeMessage || undefined,
      group_verification_enabled: groupVerificationEnabled,
      roblox_group_id: robloxGroupId ? Number(robloxGroupId) : undefined,
      roblox_group_name: robloxGroupName || undefined,
      require_group_membership: requireGroupMembership,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roblox Verification</h1>
        <p className="text-muted-foreground">
          Configure Roblox account verification for your server members.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            Verification Settings
          </CardTitle>
          <CardDescription>
            Enable Roblox verification to link Discord accounts with Roblox accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Verification */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Verification</Label>
              <p className="text-sm text-muted-foreground">
                Allow members to verify their Roblox accounts.
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Require Verification */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="required">Require Verification</Label>
              <p className="text-sm text-muted-foreground">
                Members must verify to access the server.
              </p>
            </div>
            <Switch
              id="required"
              checked={required}
              onCheckedChange={setRequired}
              disabled={!enabled}
            />
          </div>

          {/* Verified Role */}
          <div className="space-y-2">
            <Label htmlFor="verified-role">Verified Role ID</Label>
            <p className="text-sm text-muted-foreground">
              Role to assign to members who verify their Roblox account.
            </p>
            <Input
              id="verified-role"
              placeholder="Enter role ID (e.g., 123456789012345678)"
              value={verifiedRoleId}
              onChange={(e) => setVerifiedRoleId(e.target.value)}
              disabled={!enabled}
            />
          </div>

          {/* Unverified Role */}
          <div className="space-y-2">
            <Label htmlFor="unverified-role">Unverified Role ID</Label>
            <p className="text-sm text-muted-foreground">
              Role to assign to members who haven&apos;t verified yet (optional).
            </p>
            <Input
              id="unverified-role"
              placeholder="Enter role ID (e.g., 123456789012345678)"
              value={unverifiedRoleId}
              onChange={(e) => setUnverifiedRoleId(e.target.value)}
              disabled={!enabled}
            />
          </div>

          {/* Verification Channel */}
          <div className="space-y-2">
            <Label htmlFor="verification-channel">Verification Channel ID</Label>
            <p className="text-sm text-muted-foreground">
              Channel to send verification prompts to (optional).
            </p>
            <Input
              id="verification-channel"
              placeholder="Enter channel ID (e.g., 123456789012345678)"
              value={verificationChannelId}
              onChange={(e) => setVerificationChannelId(e.target.value)}
              disabled={!enabled}
            />
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <p className="text-sm text-muted-foreground">
                  Custom message to show to members when they need to verify.
                </p>
              </div>
              <Link href={`/server/${serverId}/saved-content/defaults`}>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit in Defaults
                </Button>
              </Link>
            </div>
            <Textarea
              id="welcome-message"
              placeholder="Welcome to our server! Please verify your Roblox account to access all channels."
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              disabled={!enabled}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Roblox Group Linking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
            Roblox Group Verification
          </CardTitle>
          <CardDescription>
            Optionally require members to join your Roblox group for verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Group Verification */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="group-verification">Enable Group Verification</Label>
              <p className="text-sm text-muted-foreground">
                Prompt verified members to join your Roblox group.
              </p>
            </div>
            <Switch
              id="group-verification"
              checked={groupVerificationEnabled}
              onCheckedChange={setGroupVerificationEnabled}
              disabled={!enabled}
            />
          </div>

          {/* Roblox Group ID */}
          <div className="space-y-2">
            <Label htmlFor="roblox-group-id">Roblox Group ID</Label>
            <p className="text-sm text-muted-foreground">
              The ID of your Roblox group (found in the group URL).
            </p>
            <Input
              id="roblox-group-id"
              placeholder="Enter group ID (e.g., 1234567)"
              value={robloxGroupId}
              onChange={(e) => setRobloxGroupId(e.target.value)}
              disabled={!enabled || !groupVerificationEnabled}
            />
          </div>

          {/* Roblox Group Name */}
          <div className="space-y-2">
            <Label htmlFor="roblox-group-name">Group Name (Display)</Label>
            <p className="text-sm text-muted-foreground">
              A friendly name to display for your group.
            </p>
            <Input
              id="roblox-group-name"
              placeholder="Enter group name (e.g., My Awesome Group)"
              value={robloxGroupName}
              onChange={(e) => setRobloxGroupName(e.target.value)}
              disabled={!enabled || !groupVerificationEnabled}
            />
          </div>

          {/* Require Group Membership */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-membership">Require Group Membership</Label>
              <p className="text-sm text-muted-foreground">
                Members must be in the Roblox group to complete verification.
              </p>
            </div>
            <Switch
              id="require-membership"
              checked={requireGroupMembership}
              onCheckedChange={setRequireGroupMembership}
              disabled={!enabled || !groupVerificationEnabled}
            />
          </div>

          {/* Group Join Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Group Join Message</Label>
                <p className="text-sm text-muted-foreground">
                  The message shown when prompting members to join your Roblox group.
                </p>
              </div>
              <Link href={`/server/${serverId}/saved-content/defaults`}>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit in Defaults
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Customize the group join message in{" "}
              <Link href={`/server/${serverId}/saved-content/defaults`} className="text-primary hover:underline">
                Default Messages
              </Link>
              {" "}using the <code className="bg-muted px-1 rounded">verify_group_join</code> key.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Default Messages Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Verification Messages
          </CardTitle>
          <CardDescription>
            Customize the Component V2 messages used during verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Verification uses several default messages that can be customized with templates:
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <code className="bg-muted px-2 py-0.5 rounded text-xs">verify_instructions</code>
              <span className="text-muted-foreground">- Message shown when verification is initiated</span>
            </li>
            <li className="flex items-center gap-2">
              <code className="bg-muted px-2 py-0.5 rounded text-xs">verify_success</code>
              <span className="text-muted-foreground">- Message shown after successful verification</span>
            </li>
            <li className="flex items-center gap-2">
              <code className="bg-muted px-2 py-0.5 rounded text-xs">verify_group_join</code>
              <span className="text-muted-foreground">- Message prompting to join Roblox group</span>
            </li>
          </ul>
          <Link href={`/server/${serverId}/saved-content/defaults`}>
            <Button variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Default Messages
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Verification Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-500">1</span>
            </div>
            <div>
              <h4 className="font-medium">Member uses /verify</h4>
              <p className="text-sm text-muted-foreground">
                Members run the /verify command in your server to start the verification process.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-500">2</span>
            </div>
            <div>
              <h4 className="font-medium">OAuth Authorization</h4>
              <p className="text-sm text-muted-foreground">
                They click a link that opens Roblox OAuth to authorize their account.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium">Automatic Verification</h4>
              <p className="text-sm text-muted-foreground">
                Their Roblox account is linked and the verified role is assigned automatically.
              </p>
            </div>
          </div>

          {groupVerificationEnabled && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h4 className="font-medium">Group Join (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  If enabled, they&apos;ll be prompted to join your Roblox group.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={updateConfig.isPending || !enabled} className="w-full">
        {updateConfig.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  );
}