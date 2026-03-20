"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useMarketplaceTemplates,
  useFeaturedTemplates,
} from "@/hooks/use-marketplace";
import { MarketplaceTemplate } from "@/types/platform-extensions";
import { Search, Download, Star, Package, Import, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MarketplacePage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { data: templates, isLoading: templatesLoading } = useMarketplaceTemplates({
    q: searchQuery,
  });
  const { data: featured, isLoading: featuredLoading } = useFeaturedTemplates(10);

  const renderTemplateCard = (template: MarketplaceTemplate) => (
    <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
          </div>
          <Badge variant="secondary">{template.templateType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags?.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>{template.downloadCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span>{template.averageRating.toFixed(1)} ({template.ratingCount})</span>
            </div>
          </div>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(template.createdAt))} ago
          </span>
        </div>

        <Button
          className="w-full mt-4"
          variant="secondary"
          onClick={() => {
            setSelectedTemplate(template);
            setIsImportOpen(true);
          }}
        >
          <Import className="mr-2 h-4 w-4" />
          Import
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Template Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and import templates from the community
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="featured" className="space-y-4">
        <TabsList>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="embeds">Embeds</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              featured?.map(renderTemplateCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templatesLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              templates?.map(renderTemplateCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="embeds" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates
              ?.filter((t) => t.templateType === "embed")
              .map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates
              ?.filter((t) => t.templateType === "text")
              .map(renderTemplateCard)}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Template</DialogTitle>
            <DialogDescription>
              Choose how you want to import &quot;{selectedTemplate?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <Package className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Copy</div>
                <div className="text-sm text-muted-foreground">Create a standalone copy in your server</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Reference</div>
                <div className="text-sm text-muted-foreground">Link to the original template</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <Import className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Fork</div>
                <div className="text-sm text-muted-foreground">Create your own version based on this</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
