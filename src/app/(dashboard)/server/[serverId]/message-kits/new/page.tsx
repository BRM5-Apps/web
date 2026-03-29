"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { PERMISSION_KEYS } from "@/lib/constants";
import { useEmbedTemplates, useContainerTemplates, useTextTemplates } from "@/hooks/use-templates";
import { useCreateMessageKit, useAddContent, useDeleteContent, useKitContents } from "@/hooks/use-message-kits";
import type { MessageKitContentType } from "@/types/message-kit";
import { ArrowLeft, Plus, Trash2, Package, FileCode, FileText, Box, Save } from "lucide-react";
import Link from "next/link";

interface ContentItem {
	id: string;
	content_type: MessageKitContentType;
	name: string;
	template_id: string;
}

const CONTENT_TYPE_OPTIONS: { value: MessageKitContentType; label: string; icon: React.ReactNode }[] = [
	{ value: 'EMBED_TEMPLATE', label: 'Embed', icon: <FileCode className="h-4 w-4" /> },
	{ value: 'CONTAINER_TEMPLATE', label: 'Container', icon: <Box className="h-4 w-4" /> },
	{ value: 'TEXT_TEMPLATE', label: 'Text', icon: <FileText className="h-4 w-4" /> },
];

export default function NewMessageKitPage() {
	const params = useParams<{ serverId: string }>();
	const router = useRouter();
	const serverId = params.serverId;
	const queryClient = useQueryClient();

	// Kit metadata state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [version, setVersion] = useState("1.0.0");
	const [isPublic, setIsPublic] = useState(false);
	const [tagInput, setTagInput] = useState("");
	const [tags, setTags] = useState<string[]>([]);

	// Content state
	const [contents, setContents] = useState<ContentItem[]>([]);
	const [selectedType, setSelectedType] = useState<MessageKitContentType>('EMBED_TEMPLATE');
	const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
	const [contentToRemove, setContentToRemove] = useState<ContentItem | null>(null);

	// Fetch templates
	const embeds = useEmbedTemplates(serverId);
	const containers = useContainerTemplates(serverId);
	const texts = useTextTemplates(serverId);

	// Mutations
	const createMutation = useMutation({
		mutationFn: async () => {
			// Create the kit
			const kit = await api.messageKits.create(serverId, {
				name,
				description: description || undefined,
				version,
				is_public: isPublic,
				tags: tags.length > 0 ? tags : undefined,
			});

			// Add content items
			for (const content of contents) {
				await api.messageKits.addContent(serverId, kit.id, {
					content_type: content.content_type,
					content_data: { template_id: content.template_id },
				});
			}

			return kit;
		},
		onSuccess: () => {
			toast.success("Message kit created successfully");
			queryClient.invalidateQueries({ queryKey: ["messageKits", "myTemplates", serverId] });
			router.push(`/server/${serverId}/message-kits`);
		},
		onError: () => toast.error("Failed to create message kit"),
	});

	// Get templates for selected type
	const getTemplatesForType = () => {
		switch (selectedType) {
			case 'EMBED_TEMPLATE':
				return embeds.data ?? [];
			case 'CONTAINER_TEMPLATE':
				return containers.data ?? [];
			case 'TEXT_TEMPLATE':
				return texts.data ?? [];
			default:
				return [];
		}
	};

	const addContent = () => {
		if (!selectedTemplateId) {
			toast.error("Please select a template");
			return;
		}

		const templates = getTemplatesForType();
		const template = templates.find((t: any) => t.id === selectedTemplateId);

		if (!template) return;

		setContents([
			...contents,
			{
				id: crypto.randomUUID(),
				content_type: selectedType,
				name: template.name,
				template_id: selectedTemplateId,
			},
		]);
		setSelectedTemplateId("");
	};

	const removeContent = (id: string) => {
		setContents(contents.filter((c) => c.id !== id));
		setContentToRemove(null);
	};

	const addTag = () => {
		const trimmed = tagInput.trim().toLowerCase();
		if (trimmed && !tags.includes(trimmed)) {
			setTags([...tags, trimmed]);
			setTagInput("");
		}
	};

	const removeTag = (tag: string) => {
		setTags(tags.filter((t) => t !== tag));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Please enter a name for the kit");
			return;
		}
		if (contents.length === 0) {
			toast.error("Please add at least one template to the kit");
			return;
		}
		createMutation.mutate();
	};

	const getContentTypeLabel = (type: MessageKitContentType) => {
		return CONTENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
	};

	return (
		<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href={`/server/${serverId}/message-kits`}>
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Create Message Kit</h1>
						<p className="text-muted-foreground">
							Create a shareable collection of templates.
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Kit Metadata */}
					<Card>
						<CardHeader>
							<CardTitle>Kit Details</CardTitle>
							<CardDescription>
								Basic information about your message kit.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="name">Name *</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="My Awesome Kit"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="version">Version</Label>
									<Input
										id="version"
										value={version}
										onChange={(e) => setVersion(e.target.value)}
										placeholder="1.0.0"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Describe what this kit contains..."
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label>Tags</Label>
								<div className="flex gap-2">
									<Input
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										placeholder="Add a tag..."
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addTag();
											}
										}}
									/>
									<Button type="button" variant="outline" onClick={addTag}>
										Add
									</Button>
								</div>
								{tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-2">
										{tags.map((tag) => (
											<Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
												{tag}
												<Trash2 className="ml-1 h-3 w-3" />
											</Badge>
										))}
									</div>
								)}
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id="public"
									checked={isPublic}
									onCheckedChange={setIsPublic}
								/>
								<Label htmlFor="public">Make Public</Label>
								<span className="text-sm text-muted-foreground">
									Share this kit with other servers
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Content Selection */}
					<Card>
						<CardHeader>
							<CardTitle>Kit Contents</CardTitle>
							<CardDescription>
								Add templates from your saved content to this kit.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Add Content Section */}
							<div className="space-y-3">
								<div className="grid gap-3 md:grid-cols-3">
									<div className="space-y-2">
										<Label>Content Type</Label>
										<Select
											value={selectedType}
											onValueChange={(v) => {
												setSelectedType(v as MessageKitContentType);
												setSelectedTemplateId("");
											}}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select type..." />
											</SelectTrigger>
											<SelectContent>
												{CONTENT_TYPE_OPTIONS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														<div className="flex items-center gap-2">
															{option.icon}
															{option.label}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label>Template</Label>
										<div className="flex gap-2">
											<Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
												<SelectTrigger className="flex-1">
													<SelectValue placeholder="Select a template..." />
												</SelectTrigger>
												<SelectContent>
													{getTemplatesForType().map((template: any) => (
														<SelectItem key={template.id} value={template.id}>
															{template.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Button type="button" onClick={addContent}>
												<Plus className="h-4 w-4 mr-1" />
												Add
											</Button>
										</div>
										{(selectedType === 'EMBED_TEMPLATE' && embeds.isLoading) ||
											(selectedType === 'CONTAINER_TEMPLATE' && containers.isLoading) ||
											(selectedType === 'TEXT_TEMPLATE' && texts.isLoading) ? (
											<p className="text-xs text-muted-foreground">Loading templates...</p>
										) : getTemplatesForType().length === 0 ? (
											<p className="text-xs text-muted-foreground">
												No {CONTENT_TYPE_OPTIONS.find(o => o.value === selectedType)?.label.toLowerCase()} templates.
												Create some in Saved Content first.
											</p>
										) : null}
									</div>
								</div>
							</div>

							{/* Content List */}
							{contents.length > 0 ? (
								<div className="space-y-2">
									<Label>Added Content ({contents.length})</Label>
									<div className="border rounded-md divide-y">
										{contents.map((content, index) => (
											<div
												key={content.id}
												className="flex items-center justify-between p-3"
											>
												<div className="flex items-center gap-3">
													<span className="text-sm text-muted-foreground w-6">
														#{index + 1}
													</span>
													{CONTENT_TYPE_OPTIONS.find(o => o.value === content.content_type)?.icon}
													<div>
														<p className="font-medium">{content.name}</p>
														<p className="text-sm text-muted-foreground">
															{getContentTypeLabel(content.content_type)}
														</p>
													</div>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => setContentToRemove(content)}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
									<p>No content added yet.</p>
									<p className="text-sm">Select templates above to add them to your kit.</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Submit */}
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push(`/server/${serverId}/message-kits`)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={createMutation.isPending || !name.trim() || contents.length === 0}>
							<Save className="mr-2 h-4 w-4" />
							{createMutation.isPending ? "Creating..." : "Create Kit"}
						</Button>
					</div>
				</form>

				{/* Confirm Remove Dialog */}
				<AlertDialog open={!!contentToRemove} onOpenChange={(open) => !open && setContentToRemove(null)}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Remove Content?</AlertDialogTitle>
							<AlertDialogDescription>
								Remove "{contentToRemove?.name}" from this kit?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={() => contentToRemove && removeContent(contentToRemove.id)}>
								Remove
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</PermissionGate>
	);
}