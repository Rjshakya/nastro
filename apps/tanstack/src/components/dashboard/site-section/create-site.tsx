import { useState } from "react";
import { IconLink, IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateSite } from "#/hooks/use-sites";
import type { Site } from "@/types/site";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";

import { parsePageId } from "notion-utils";
import { defaultNotionSettings } from "#/lib/settings-defaults";
import { useNotionPages } from "#/hooks/use-notion";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { NotionPage } from "#/types/notion";
import { authClient } from "#/lib/auth-client";
import { Env } from "env";

interface CreateSiteDialogProps {
  onSuccess?: (site: Site) => void;
}

export function CreateSiteDialog({ onSuccess }: CreateSiteDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pages } = useNotionPages();
  const { createSite, isLoading: isCreating, input, setInput } = useCreateSite();

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

  const handleConnectNotion = async () => {
    await authClient.linkSocial({
      provider: "notion",
      callbackURL: Env.clientUrl + "/dashboard",
    });
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
          <DialogDescription>Select a Notion page to create your site from.</DialogDescription>
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

          <div className=" space-y-3">
            <div className="flex items-center">
              <Label className=" flex-1">Notion Page</Label>
              <Button onClick={handleConnectNotion} className={""} size={"xs"}>
                <IconLink />
                connect notion
              </Button>
            </div>
            <Combobox
              items={pages}
              value={selectedPageId}
              onValueChange={(pageId) => {
                setSelectedPageId(pageId);
                const page = pages?.find((p) => p?.id === pageId);
                setSearchQuery(getPageTitle(page));
              }}
            >
              <ComboboxInput
                placeholder="Paste notion link or select notion pages"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  const idFromUrl = parsePageId(val);
                  if (idFromUrl) setSelectedPageId(idFromUrl);
                }}
              />
              <ComboboxContent>
                <ComboboxList>
                  {(item: NotionPage) => (
                    <ComboboxItem key={item?.id} value={item?.id}>
                      {getPageTitle(item)}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={!isValid || isCreating}>
            {isCreating ? "Creating..." : "Create Site"}
          </Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>
            Cancel
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
