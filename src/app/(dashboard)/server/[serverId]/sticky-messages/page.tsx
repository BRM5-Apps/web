"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { PERMISSION_KEYS } from "@/lib/constants";
import { StickyMessage } from "@/types/sticky-message";
import { useEmbedTemplates, useContainerTemplates, useTextTemplates } from "@/hooks/use-templates";
import { Plus, Trash2, RefreshCw, Edit, Pin } from "lucide-react";

type MessageSourceType = 'fallback' | 'embed' | 'container' | 'text';

export default function StickyMessagesPage() {
	const params = useParams<{ serverId: string }>();
	const serverId = params.serverId;
	const queryClient = useQueryClient();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingSticky, setEditingSticky] = useState<StickyMessage | null>(null);
	const [messageSourceType, setMessageSourceType] = useState<MessageSourceType>('fallback');
	const [formData, setFormData] = useState({
		name: "",
		channel_id: "",
		fallback_content: "",
		trigger_count: 10,
		is_active: true,
	});

	// Template selection state
	const [selectedEmbedId, setSelectedEmbedId] = useState<string>("");
	const [selectedContainerId, setSelectedContainerId] = useState<string>("");
	const [selectedTextId, setSelectedTextId] = useState<string>("");

	// Fetch templates for selection
	const embeds = useEmbedTemplates(serverId);
	const containers = useContainerTemplates(serverId);
	const texts = useTextTemplates(serverId);

	// Fetch sticky messages
	const { data: stickyMessages, isLoading } = useQuery({
		queryKey: ["stickyMessages", serverId],
		queryFn: () => api.stickyMessages.list(serverId),
		enabled: Boolean(serverId),
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: (data: typeof formData) => {
			const payload = {
				name: data.name,
				channel_id: data.channel_id,
				fallback_content: messageSourceType === 'fallback' ? data.fallback_content || undefined : undefined,
				trigger_count: data.trigger_count,
				is_active: data.is_active,
				embed_template_id: messageSourceType === 'embed' ? selectedEmbedId || undefined : undefined,
				container_template_id: messageSourceType === 'container' ? selectedContainerId || undefined : undefined,
				text_template_id: messageSourceType === 'text' ? selectedTextId || undefined : undefined,
			};
			return api.stickyMessages.create(serverId, payload);
		},
		onSuccess: () => {
			toast.success("Sticky message created");
			queryClient.invalidateQueries({ queryKey: ["stickyMessages", serverId] });
			resetForm();
			setIsCreateOpen(false);
		},
		onError: () => toast.error("Failed to create sticky message"),
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: (data: { id: string; updates: typeof formData }) => {
			const payload = {
				name: data.updates.name,
				channel_id: data.updates.channel_id,
				fallback_content: messageSourceType === 'fallback' ? data.updates.fallback_content || undefined : undefined,
				trigger_count: data.updates.trigger_count,
				is_active: data.updates.is_active,
				embed_template_id: messageSourceType === 'embed' ? selectedEmbedId || null : null,
				container_template_id: messageSourceType === 'container' ? selectedContainerId || null : null,
				text_template_id: messageSourceType === 'text' ? selectedTextId || null : null,
			};
			return api.stickyMessages.update(serverId, data.id, payload);
		},
		onSuccess: () => {
			toast.success("Sticky message updated");
			queryClient.invalidateQueries({ queryKey: ["stickyMessages", serverId] });
			setEditingSticky(null);
			resetForm();
		},
		onError: () => toast.error("Failed to update sticky message"),
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: (id: string) => api.stickyMessages.delete(serverId, id),
		onSuccess: () => {
			toast.success("Sticky message deleted");
			queryClient.invalidateQueries({ queryKey: ["stickyMessages", serverId] });
		},
		onError: () => toast.error("Failed to delete sticky message"),
	});

	// Reset counter mutation
	const resetMutation = useMutation({
		mutationFn: (id: string) => api.stickyMessages.resetCount(serverId, id),
		onSuccess: () => {
			toast.success("Counter reset");
			queryClient.invalidateQueries({ queryKey: ["stickyMessages", serverId] });
		},
		onError: () => toast.error("Failed to reset counter"),
	});

	const resetForm = () => {
		setFormData({
			name: "",
			channel_id: "",
			fallback_content: "",
			trigger_count: 10,
			is_active: true,
		});
		setMessageSourceType('fallback');
		setSelectedEmbedId("");
		setSelectedContainerId("");
		setSelectedTextId("");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (editingSticky) {
			updateMutation.mutate({ id: editingSticky.id, updates: formData });
		} else {
			createMutation.mutate(formData);
		}
	};

	const startEdit = (sticky: StickyMessage) => {
		setEditingSticky(sticky);
		setFormData({
			name: sticky.name,
			channel_id: sticky.channel_id,
			fallback_content: sticky.fallback_content || "",
			trigger_count: sticky.trigger_count,
			is_active: sticky.is_active,
		});

		// Set message source type and selected template
		if (sticky.embed_template_id) {
			setMessageSourceType('embed');
			setSelectedEmbedId(sticky.embed_template_id);
		} else if (sticky.container_template_id) {
			setMessageSourceType('container');
			setSelectedContainerId(sticky.container_template_id);
		} else if (sticky.text_template_id) {
			setMessageSourceType('text');
			setSelectedTextId(sticky.text_template_id);
		} else {
			setMessageSourceType('fallback');
			setSelectedEmbedId("");
			setSelectedContainerId("");
			setSelectedTextId("");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Sticky Messages</h1>
					<p className="text-muted-foreground">
						Configure messages that automatically resend after N messages in a channel.
					</p>
				</div>
				<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger asChild>
							<Button onClick={() => { resetForm(); setEditingSticky(null); }}>
								<Plus className="mr-2 h-4 w-4" />
								Create Sticky Message
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[500px]">
							<DialogHeader>
								<DialogTitle>
									{editingSticky ? "Edit Sticky Message" : "Create Sticky Message"}
								</DialogTitle>
								<DialogDescription>
									Configure a message that will automatically resend after a certain number of messages in a channel.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										placeholder="Welcome Message"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="channel_id">Channel ID</Label>
									<Input
										id="channel_id"
										value={formData.channel_id}
										onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
										placeholder="123456789012345678"
										required
									/>
								</div>

								{/* Message Source Type Selection */}
								<div className="space-y-2">
									<Label>Message Source</Label>
									<div className="flex gap-2 flex-wrap">
										{[
											{ value: 'fallback', label: 'Text (Fallback)' },
											{ value: 'embed', label: 'Embed' },
											{ value: 'container', label: 'Container' },
											{ value: 'text', label: 'Text Template' },
										].map((option) => (
											<Button
												key={option.value}
												type="button"
												variant={messageSourceType === option.value ? "default" : "outline"}
												size="sm"
												onClick={() => {
													setMessageSourceType(option.value as MessageSourceType);
													setSelectedEmbedId("");
													setSelectedContainerId("");
													setSelectedTextId("");
												}}
											>
												{option.label}
											</Button>
										))}
									</div>
								</div>

								{/* Template Selectors */}
								{messageSourceType === 'embed' && (
									<div className="space-y-2">
										<Label>Select Embed Template</Label>
										<Select value={selectedEmbedId} onValueChange={setSelectedEmbedId}>
											<SelectTrigger>
												<SelectValue placeholder="Choose an embed template..." />
											</SelectTrigger>
											<SelectContent>
												{embeds.data?.map((embed) => (
													<SelectItem key={embed.id} value={embed.id}>
														{embed.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{embeds.isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
										{!embeds.isLoading && (!embeds.data || embeds.data.length === 0) && (
											<p className="text-xs text-muted-foreground">No embed templates. Create one in Saved Content first.</p>
										)}
									</div>
								)}

								{messageSourceType === 'container' && (
									<div className="space-y-2">
										<Label>Select Container Template</Label>
										<Select value={selectedContainerId} onValueChange={setSelectedContainerId}>
											<SelectTrigger>
												<SelectValue placeholder="Choose a container template..." />
											</SelectTrigger>
											<SelectContent>
												{containers.data?.map((container) => (
													<SelectItem key={container.id} value={container.id}>
														{container.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{containers.isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
										{!containers.isLoading && (!containers.data || containers.data.length === 0) && (
											<p className="text-xs text-muted-foreground">No container templates. Create one in Saved Content first.</p>
										)}
									</div>
								)}

								{messageSourceType === 'text' && (
									<div className="space-y-2">
										<Label>Select Text Template</Label>
										<Select value={selectedTextId} onValueChange={setSelectedTextId}>
											<SelectTrigger>
												<SelectValue placeholder="Choose a text template..." />
											</SelectTrigger>
											<SelectContent>
												{texts.data?.map((text) => (
													<SelectItem key={text.id} value={text.id}>
														{text.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{texts.isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
										{!texts.isLoading && (!texts.data || texts.data.length === 0) && (
											<p className="text-xs text-muted-foreground">No text templates. Create one in Saved Content first.</p>
										)}
									</div>
								)}

								{messageSourceType === 'fallback' && (
									<div className="space-y-2">
										<Label htmlFor="fallback_content">Fallback Content</Label>
										<Textarea
											id="fallback_content"
											value={formData.fallback_content}
											onChange={(e) => setFormData({ ...formData, fallback_content: e.target.value })}
											placeholder="Message content if no template is linked..."
											rows={4}
										/>
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="trigger_count">Trigger Count</Label>
									<Input
										id="trigger_count"
										type="number"
										min={1}
										value={formData.trigger_count}
										onChange={(e) => setFormData({ ...formData, trigger_count: parseInt(e.target.value) || 10 })}
									/>
									<p className="text-xs text-muted-foreground">
										Resend after this many new messages in the channel
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id="is_active"
										checked={formData.is_active}
										onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
									/>
									<Label htmlFor="is_active">Active</Label>
								</div>
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setEditingSticky(null); }}>
										Cancel
									</Button>
									<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
										{editingSticky ? "Save Changes" : "Create"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</PermissionGate>
			</div>

			{isLoading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-20 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : stickyMessages && stickyMessages.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{stickyMessages.map((sticky) => (
						<Card key={sticky.id} className={sticky.is_active ? "" : "opacity-60"}>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Pin className="h-4 w-4 text-primary" />
										<CardTitle className="text-lg">{sticky.name}</CardTitle>
									</div>
									{sticky.is_active ? (
										<Badge variant="default" className="bg-green-600">Active</Badge>
									) : (
										<Badge variant="secondary">Inactive</Badge>
									)}
								</div>
								<CardDescription className="mt-1">
									Channel: {sticky.channel_id}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{sticky.fallback_content && (
									<p className="text-sm text-muted-foreground line-clamp-2">
										{sticky.fallback_content}
									</p>
								)}
								{(sticky.embed_template_id || sticky.container_template_id || sticky.text_template_id) && (
									<Badge variant="outline" className="text-xs">
										{sticky.embed_template_id && "Embed"}
										{sticky.container_template_id && "Container"}
										{sticky.text_template_id && "Text"} Template
									</Badge>
								)}
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										Counter: {sticky.current_count} / {sticky.trigger_count}
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => resetMutation.mutate(sticky.id)}
										disabled={resetMutation.isPending}
									>
										<RefreshCw className="h-4 w-4" />
									</Button>
								</div>
								<div className="flex gap-2">
									<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
										<Button
											variant="outline"
											size="sm"
											className="flex-1"
											onClick={() => { setIsCreateOpen(true); startEdit(sticky); }}
										>
											<Edit className="mr-1 h-3 w-3" />
											Edit
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="outline" size="sm">
													<Trash2 className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Sticky Message?</AlertDialogTitle>
													<AlertDialogDescription>
														This will permanently delete "{sticky.name}". This action cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => deleteMutation.mutate(sticky.id)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</PermissionGate>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Pin className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No Sticky Messages</h3>
						<p className="text-muted-foreground text-center mb-4">
							Create a sticky message to automatically resend messages after N messages in a channel.
						</p>
						<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Create Your First Sticky Message
							</Button>
						</PermissionGate>
					</CardContent>
				</Card>
			)}
		</div>
	);
}