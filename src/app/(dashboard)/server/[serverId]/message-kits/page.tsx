"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PermissionGate } from "@/components/shared/permission-gate";
import { PERMISSION_KEYS } from "@/lib/constants";
import { MessageKit } from "@/types/message-kit";
import { Star, Download, ExternalLink, Search, Plus, Trash2, Eye, Edit } from "lucide-react";
import Link from "next/link";

export default function MessageKitsPage() {
	const params = useParams<{ serverId: string }>();
	const serverId = params.serverId;
	const queryClient = useQueryClient();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedKit, setSelectedKit] = useState<MessageKit | null>(null);
	const [importDialogOpen, setImportDialogOpen] = useState(false);

	// Fetch public message kits
	const { data: publicKits, isLoading: loadingPublic } = useQuery({
		queryKey: ["messageKits", "public", serverId, { limit: 50 }],
		queryFn: () => api.messageKits.listPublic(serverId, 50, 0),
		enabled: Boolean(serverId),
	});

	// Fetch featured kits
	const { data: featuredKits } = useQuery({
		queryKey: ["messageKits", "featured", serverId],
		queryFn: () => api.messageKits.listFeatured(serverId, 10),
		enabled: Boolean(serverId),
	});

	// Fetch my templates
	const { data: myTemplates, isLoading: loadingMy } = useQuery({
		queryKey: ["messageKits", "myTemplates", serverId],
		queryFn: () => api.messageKits.getMyTemplates(serverId),
		enabled: Boolean(serverId),
	});

	// Search kits
	const { data: searchResults, isLoading: loadingSearch } = useQuery({
		queryKey: ["messageKits", "search", serverId, searchQuery],
		queryFn: () => api.messageKits.search(serverId, searchQuery),
		enabled: Boolean(serverId) && searchQuery.length > 2,
	});

	// Import mutation
	const importMutation = useMutation({
		mutationFn: (kitId: string) => api.messageKits.import(kitId, serverId),
		onSuccess: () => {
			toast.success("Message kit imported successfully!");
			queryClient.invalidateQueries({ queryKey: ["messageKits"] });
			setImportDialogOpen(false);
			setSelectedKit(null);
		},
		onError: () => toast.error("Failed to import message kit"),
	});

	// Delete mutation (for own templates)
	const deleteMutation = useMutation({
		mutationFn: (id: string) => api.messageKits.delete(serverId, id),
		onSuccess: () => {
			toast.success("Message kit deleted");
			queryClient.invalidateQueries({ queryKey: ["messageKits", "myTemplates", serverId] });
		},
		onError: () => toast.error("Failed to delete message kit"),
	});

	const renderKitCard = (kit: MessageKit, showImport = true) => (
		<Card key={kit.id} className="group relative overflow-hidden">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="text-lg">{kit.name}</CardTitle>
						<CardDescription className="line-clamp-2">
							{kit.description || "No description"}
						</CardDescription>
					</div>
					{kit.is_featured && (
						<Badge className="bg-yellow-500 text-yellow-950">Featured</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-2">
				{kit.tags && kit.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{kit.tags.slice(0, 4).map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
						{kit.tags.length > 4 && (
							<Badge variant="outline" className="text-xs">
								+{kit.tags.length - 4}
							</Badge>
						)}
					</div>
				)}
				{kit.author && (
					<p className="text-sm text-muted-foreground">
						by {kit.author.username}
					</p>
				)}
			</CardContent>
			<CardFooter className="flex items-center justify-between">
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					<span className="flex items-center gap-1">
						<Download className="h-4 w-4" />
						{kit.download_count}
					</span>
					{kit.is_public && (
						<Badge variant="outline" className="text-xs">Public</Badge>
					)}
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setSelectedKit(kit);
							setImportDialogOpen(true);
						}}
					>
						<Eye className="mr-1 h-3 w-3" />
						View
					</Button>
					{showImport && (
						<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
							<Button
								size="sm"
								onClick={() => importMutation.mutate(kit.id)}
								disabled={importMutation.isPending}
							>
								<Download className="mr-1 h-3 w-3" />
								Import
							</Button>
						</PermissionGate>
					)}
				</div>
			</CardFooter>
		</Card>
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Message Kits</h1>
					<p className="text-muted-foreground">
						Browse and import community-created message templates.
					</p>
				</div>
				<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
					<Button asChild>
						<Link href={`/server/${serverId}/message-kits/new`}>
							<Plus className="mr-2 h-4 w-4" />
							Create Kit
						</Link>
					</Button>
				</PermissionGate>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search message kits..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			<Tabs defaultValue="featured" className="space-y-6">
				<TabsList>
					<TabsTrigger value="featured">Featured</TabsTrigger>
					<TabsTrigger value="browse">Browse All</TabsTrigger>
					<TabsTrigger value="my">My Saved Content</TabsTrigger>
				</TabsList>

				<TabsContent value="featured" className="space-y-4">
					{loadingPublic ? (
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
					) : featuredKits && featuredKits.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{featuredKits.map((kit) => renderKitCard(kit))}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Star className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No Featured Kits</h3>
								<p className="text-muted-foreground text-center">
									Check back later for featured community templates.
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="browse" className="space-y-4">
					{searchQuery.length > 2 ? (
						loadingSearch ? (
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
						) : searchResults && searchResults.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{searchResults.map((kit) => renderKitCard(kit))}
							</div>
						) : (
							<Card>
								<CardContent className="flex flex-col items-center justify-center py-12">
									<Search className="h-12 w-12 text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">No Results</h3>
									<p className="text-muted-foreground text-center">
										No kits found matching "{searchQuery}"
									</p>
								</CardContent>
							</Card>
						)
					) : loadingPublic ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3, 4, 5, 6].map((i) => (
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
					) : publicKits && publicKits.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{publicKits.map((kit) => renderKitCard(kit))}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<ExternalLink className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No Public Kits</h3>
								<p className="text-muted-foreground text-center">
									Be the first to share a message template!
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="my" className="space-y-4">
					{loadingMy ? (
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
					) : myTemplates && myTemplates.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{myTemplates.map((kit) => (
								<Card key={kit.id} className="group relative overflow-hidden">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg">{kit.name}</CardTitle>
										<CardDescription className="line-clamp-2">
											{kit.description || "No description"}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-2">
										{kit.tags && kit.tags.length > 0 && (
											<div className="flex flex-wrap gap-1">
												{kit.tags.slice(0, 3).map((tag) => (
													<Badge key={tag} variant="secondary" className="text-xs">
														{tag}
													</Badge>
												))}
											</div>
										)}
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<span>v{kit.version}</span>
											{kit.is_public ? (
												<Badge variant="outline" className="text-xs">Public</Badge>
											) : (
												<Badge variant="secondary" className="text-xs">Private</Badge>
											)}
										</div>
									</CardContent>
									<CardFooter className="gap-2">
										<Button
											variant="outline"
											size="sm"
											asChild
										>
											<Link href={`/server/${serverId}/message-kits/${kit.id}`}>
												<Edit className="mr-1 h-3 w-3" />
												Edit
											</Link>
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => deleteMutation.mutate(kit.id)}
											disabled={deleteMutation.isPending}
										>
											<Trash2 className="mr-1 h-3 w-3" />
											Delete
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Plus className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No Saved Content Yet</h3>
								<p className="text-muted-foreground text-center mb-4">
									Create a message template from the Template Builder to save it here.
								</p>
								<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
									<Button asChild>
										<Link href={`/server/${serverId}/message-kits/new`}>
											<Plus className="mr-2 h-4 w-4" />
											Create Your First Kit
										</Link>
									</Button>
								</PermissionGate>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			{/* View Kit Dialog */}
			<Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>{selectedKit?.name}</DialogTitle>
						<DialogDescription>
							{selectedKit?.description || "No description available"}
						</DialogDescription>
					</DialogHeader>
					{selectedKit && (
						<div className="space-y-4">
							<div className="flex flex-wrap gap-2">
								{selectedKit.tags?.map((tag) => (
									<Badge key={tag} variant="secondary">
										{tag}
									</Badge>
								))}
							</div>
							{selectedKit.author && (
								<p className="text-sm text-muted-foreground">
									Created by <span className="font-medium">{selectedKit.author.username}</span>
								</p>
							)}
							<div className="flex items-center gap-4 text-sm">
								<span>Version: {selectedKit.version}</span>
								<span className="flex items-center gap-1">
									<Download className="h-4 w-4" />
									{selectedKit.download_count} downloads
								</span>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setImportDialogOpen(false)}>
							Cancel
						</Button>
						<PermissionGate permission={PERMISSION_KEYS.SETTINGS_EDIT}>
							<Button
								onClick={() => selectedKit && importMutation.mutate(selectedKit.id)}
								disabled={importMutation.isPending}
							>
								<Download className="mr-2 h-4 w-4" />
								Import to Server
							</Button>
						</PermissionGate>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}