import { useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateSite } from "@/hooks/use-sites";
import type { Site } from "@/types/site";
import { useRouter } from "@tanstack/react-router";
import { dashboardHomeApi } from "../home";

interface CreateSiteDialogProps {
  onSuccess?: (site: Site) => void;
}

export function CreateSiteDialog({ onSuccess }: CreateSiteDialogProps) {
  const [open, setOpen] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { pages } = dashboardHomeApi.useLoaderData();
  const { createSite, isLoading: isCreating } = useCreateSite();
  const router = useRouter();

  const filteredPages = pages?.filter((page) => {
    if (!searchQuery) return true;
    const title = getPageTitle(page);
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreate = async () => {
    if (!selectedPageId || !siteName.trim()) return;

    const result = await createSite({
      pageId: selectedPageId,
      siteName: siteName.trim(),
    });

    if (result?.data) {
      onSuccess?.({ ...(result?.data as Site) });
      setOpen(false);
      setSiteName("");
      setSelectedPageId(null);
      await router.invalidate({ sync: true });
    }
  };

  const isValid = selectedPageId && siteName.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            New Site
          </Button>
        }
      />
      <SheetContent className="sm:max-w-135 px-4 py-2 font-sans tracking-tighter">
        <SheetHeader className="px-0">
          <SheetTitle className="font-medium">Create New Site</SheetTitle>
          <SheetDescription>
            Select a Notion page to create your site from.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              placeholder="My Awesome Site"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Notion Page</Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-md max-h-75 overflow-y-auto">
            {filteredPages && filteredPages?.length > 0 && (
              <div className="p-2 space-y-2">
                {filteredPages?.map((page) => (
                  <button
                    key={page.id}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedPageId === page.id
                        ? "border-primary bg-primary/10"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedPageId(page.id)}
                  >
                    <div className="font-medium text-sm line-clamp-1">
                      {getPageTitle(page)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {page.id.slice(0, 8)}...
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isValid || isCreating}>
            {isCreating ? "Creating..." : "Create Site"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function getPageTitle(page: any): string {
  if (!page.properties) return "Untitled";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const key of Object.keys(page.properties)) {
    const prop = page.properties[key] as any;
    if (prop?.type === "title" && prop.title?.[0]?.plain_text) {
      return prop.title[0].plain_text;
    }
  }
  return "Untitled";
}
