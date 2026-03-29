"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useMessageKit, useUpdateMessageKit, useKitContents, useAddContent, useDeleteContent, useDeleteMessageKit } from "@/hooks/use-message-kits";
import type { MessageKitContentType, MessageKitContent } from "@/types/message-kit";
import { ArrowLeft, Plus, Trash2, Package, FileCode, FileText, Box, Save, Loader2 } from "lucide-react";
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

export default function EditMessageKitPage() {
	const params = useParams<{ serverId: string; kitId: string }>();
	const router = useRouter();
	const serverId = params.serverId;
	const kitId = params.kitId;
	const queryClient = useQueryClient();

	// Fetch kit data
	const { data: kit, isLoading: loadingKit } = useMessageKit(serverId, kitId);
	const { data: kitContents, isLoading: loadingContents } = useKitContents(serverId, kitId);

	// Fetch templates
	const embeds = useEmbedTemplates(serverId);
	const containers = useContainerTemplates(serverId);
	const texts = useTextTemplates(serverId);

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
	const [hasChanges, setHasChanges] = useState(false);

	// Initialize form from loaded data
	useEffect(() => {
		if (kit) {
			setName(kit.name);
			setDescription(kit.description || "");
			setVersion(kit.version);
			setIsPublic(kit.is_public);
			setTags(kit.tags || []);
		}
	}, [kit]);

	useEffect(() => {
		if (kitContents && embeds.data && containers.data && texts.data) {
			const items: ContentItem[] = kitContents.map((content: MessageKitContent) => {
				const templateId = content.content_data?.template_id as string || "";
				let templateName = "Unknown";

				if (content.content_type === 'EMBED_TEMPLATE') {
					const found = embeds.data.find((t: any) => t.id === templateId);
					templateName = found?.name || templateId;
				} else if (content.content_type === 'CONTAINER_TEMPLATE') {
					const found = containers.data.find((t: any) => t.id === templateId);
					templateName = found?.name || templateId;
				} else if (content.content_type === 'TEXT_TEMPLATE') {
					const found = texts.data.find((t: any) => t.id === templateId);
					templateName = found?.name || templateId;
				}

				return {
					id: content.id,
					content_type: content.content_type,
					name: templateName,
					template_id: templateId,
				};
			});
			setContents(items);
		}
	}, [kitContents, embeds.data, containers.data, texts.data]);

	// Track changes
	useEffect(() => {
		if (kit) {
			const metadataChanged =
				name !== kit.name ||
				description !== (kit.description || "") ||
				version !== kit.version ||
				isPublic !== kit.is_public ||
				JSON.stringify(tags.sort()) !== JSON.stringify((kit.tags || []).sort());
			setHasChanges(metadataChanged);
		}
	}, [name, description, version, isPublic, tags, kit]);

	// Mutations
	const updateMutation = useUpdateMessageKit(serverId, kitId);
	const deleteMutation = useDeleteMessageKit(serverId);
	const addContentMutation = useAddContent(serverId, kitId);
	const deleteContentMutation = useDeleteContent(serverId);

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

		addContentMutation.mutate(
			{
				content_type: selectedType,
				content_data: { template_id: selectedTemplateId },
			},
			{
				onSuccess: (newContent) => {
					setContents([
						...contents,
						{
							id: newContent.id,
							content_type: selectedType,
							name: template.name,
							template_id: selectedTemplateId,
						},
					]);
					setSelectedTemplateId("");
				},
			}
		);
	};

	const removeContent = (content: ContentItem) => {
		deleteContentMutation.mutate(content.id, {
			onSuccess: () => {
				setContents(contents.filter((c) => c.id !== content.id));
				setContentToRemove(null);
			},
		});
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

	const handleSaveMetadata = () => {
		updateMutation.mutate({
			name,
			description: description || null,
			version,
			is_public: isPublic,
			tags: tags.length > 0 ? tags : undefined,
		});
	};

	const handleDelete = () => {
		deleteMutation.mutate(kitId, {
			onSuccess: () => {
				router.push(`/server/${serverId}/message-kits`);
			},
		});
	};

	const getContentTypeLabel = (type: MessageKitContentType) => {
		return CONTENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
	};

	const isLoading = loadingKit || loadingContents;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10 rounded" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-64" />
					</div>
				</div>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-20 w-full" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!kit) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Package className="h-12 w-12 text-muted-foreground mb-4" />
				<h3 className="text-lg font-semibold mb-2">Kit Not Found</h3>
				<p className="text-muted-foreground text-center mb-4">
					This message kit doesn't exist or you don't have access to it.
				</p>
				<Button asChild>
					<Link href={`/server/${serverId}/message-kits`}>Back to Message Kits</Link>
				</Button>
			</div>
		);
	}

	return (
		<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild>
							<Link href={`/server/${serverId}/message-kits`}>
								<ArrowLeft className="h-4 w-4" />
							</Link>
						</Button>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Edit Message Kit</h1>
							<p className="text-muted-foreground">
								Modify your message kit contents and settings.
							</p>
						</div>
					</div>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Kit
					</Button>
				</div>

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
							<Label htmlFor="public">Public</Label>
							<span className="text-sm text-muted-foreground">
								Share this kit with other servers
							</span>
						</div>
						{hasChanges && (
							<Button onClick={handleSaveMetadata} disabled={updateMutation.isPending}>
								{updateMutation.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Save className="mr-2 h-4 w-4" />
								)}
								Save Changes
							</Button>
						)}
					</CardContent>
				</Card>

				{/* Content Selection */}
				<Card>
					<CardHeader>
						<CardTitle>Kit Contents</CardTitle>
						<CardDescription>
							Add or remove templates from this kit.
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
										<Button
											type="button"
											onClick={addContent}
											disabled={addContentMutation.isPending || !selectedTemplateId}
										>
											{addContentMutation.isPending ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Plus className="h-4 w-4 mr-1" />
											)}
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
												disabled={deleteContentMutation.isPending}
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
							<AlertDialogAction
								onClick={() => contentToRemove && removeContent(contentToRemove)}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Remove
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</PermissionGate>
	);
}