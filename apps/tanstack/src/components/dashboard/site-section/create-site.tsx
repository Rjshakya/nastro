import { useMemo, useRef, useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateSite } from "#/hooks/use-sites";
import type { Site } from "@/types/site";
// import { useRouter } from "@tanstack/react-router";
import { dashboardHomeApi } from "../home";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Item, ItemContent, ItemGroup, ItemTitle } from "#/components/ui/item";
import { ScrollArea } from "#/components/ui/scroll-area";
import { parsePageId } from "notion-utils";
import { defaultNotionSettings } from "#/lib/settings-defaults";
import { useNotionPages } from "#/hooks/use-notion";

interface CreateSiteDialogProps {
  onSuccess?: (site: Site) => void;
}

export function CreateSiteDialog({ onSuccess }: CreateSiteDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // const { pages } = dashboardHomeApi.useLoaderData();

  const { data: pages } = useNotionPages();
  const {
    createSite,
    isLoading: isCreating,
    input,
    setInput,
  } = useCreateSite();
  const [openPopover, setOpenPopver] = useState(false);
  const popoverTriggerRef = useRef<HTMLDivElement>(null);

  const filteredPages = useMemo(() => {
    return pages?.filter((page) => {
      if (!searchQuery) return true;
      const title = getPageTitle(page);
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [pages, searchQuery]);

  const handleCreate = async () => {
    if (!input) return;
    const result = await createSite({
      ...input,
      pageId: selectedPageId ?? "",
      siteSetting: defaultNotionSettings(input.siteName, input.slug),
    });

    if (result) {
      onSuccess?.({ ...(result as Site) });
      setOpen(false);
      setSelectedPageId(null);
      setInput({ pageId: "", siteName: "", slug: "" });
      setSelectedPageId("");
    }
  };

  const isValid = selectedPageId && input.siteName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size={"sm"}>
            <IconPlus className="mr-2 h-4 w-4" />
            New Site
          </Button>
        }
      />
      <DialogContent className=" px-4 py-4 font-sans tracking-tighter">
        <DialogHeader className="px-0">
          <DialogTitle className="font-medium">Create New Site</DialogTitle>
          <DialogDescription>
            Select a Notion page to create your site from.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              placeholder="My Awesome Site"
              value={input?.siteName}
              onChange={(e) => setInput({ ...input, siteName: e.target.value })}
            />
          </div>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="my-site"
                value={input?.slug}
                onChange={(e) => setInput({ ...input, slug: e.target.value })}
              />
            </div>
          </div>

          <Popover open={openPopover} onOpenChange={setOpenPopver}>
            <PopoverTrigger
              render={
                <div ref={popoverTriggerRef} className="space-y-2">
                  <Label>Notion Page</Label>
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Paste notion link or select notion pages"
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);

                        const idFromUrl = parsePageId(val);
                        if (idFromUrl) {
                          setSelectedPageId(idFromUrl);
                        }
                      }}
                    />
                  </div>
                </div>
              }
            />
            <PopoverContent
              style={{ width: `${popoverTriggerRef.current?.offsetWidth}px` }}
              side="bottom"
              className={" p-2"}
            >
              <PopoverHeader className="px-2">
                <PopoverTitle>Notion Pages</PopoverTitle>
              </PopoverHeader>
              <ScrollArea className={"h-32 p-0"}>
                {filteredPages && filteredPages?.length > 0 && (
                  <ItemGroup className="p-1 cursor-pointer">
                    {filteredPages?.map((page) => (
                      <Item
                        size={"xs"}
                        key={page.id}
                        className={`transition-colors ${
                          selectedPageId === page.id
                            ? "border-primary bg-primary/10"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => {
                          setSelectedPageId(page.id);
                          setSearchQuery(getPageTitle(page));
                        }}
                      >
                        <ItemContent>
                          <ItemTitle>{getPageTitle(page)}</ItemTitle>
                        </ItemContent>
                      </Item>
                    ))}
                  </ItemGroup>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isValid || isCreating}>
            {isCreating ? "Creating..." : "Create Site"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getPageTitle(page: any): string {
  if (!page.properties) {
    return "Untitled";
  }

  for (const key of Object.keys(page.properties)) {
    const prop = page.properties[key] as any;
    if (prop?.type === "title" && prop.title?.[0]?.plain_text) {
      return prop.title[0].plain_text;
    }
  }

  return "Untitled";
}
