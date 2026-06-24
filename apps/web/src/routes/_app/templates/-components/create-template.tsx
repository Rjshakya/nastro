import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateTemplate } from "@/hooks/use-templates";
import type { Template, TemplateInsert } from "@/types/template";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import InputWithTags from "@/components/comp-56";
import { authClient } from "@/lib/auth-client";

interface CreateTemplateDialogProps {
  onSuccess?: (template: Template) => void;
}

export function CreateTemplateDialog({ onSuccess }: CreateTemplateDialogProps) {
  const { data } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<TemplateInsert>({
    name: "",
    url: "",
    thumbnail: "",
    notionPageUrl: "",
    isPaid: false,
    paymentLink: null,
    price: null,
    tags: null,
    instructionsPageUrl: "",
    description: "",
    createdBy: data?.user.id ?? "",
  });

  const { createTemplate, isLoading } = useCreateTemplate();

  const setInputToDefault = () =>
    setInput({
      name: "",
      url: "",
      thumbnail: "",
      notionPageUrl: "",
      isPaid: false,
      paymentLink: null,
      price: null,
      tags: null,
      instructionsPageUrl: "",
      description: "",
      createdBy: data?.user.id ?? "",
    });

  const handleCreate = async () => {
    const result = await createTemplate(input);

    if (result) {
      onSuccess?.(result as Template);
      setOpen(false);
      setInputToDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className={"dark:border-border dark:hover:bg-secondary "}
            size="sm"
            variant="outline"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        }
      />
      <DialogContent
        showCloseButton={false}
        className="font-sans tracking-tighter max-w-lg"
      >
        <DialogBody className="grid-rows-[auto_1fr] overflow-hidden p-0">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="font-medium">
              Create New Template
            </DialogTitle>
            <DialogDescription>
              Add a new template to your collection.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-70 px-5 pb-5">
            {/* Template Name */}
            <div className="mb-3 grid gap-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="My Awesome Template"
                value={input.name}
                onChange={(e) => setInput({ ...input, name: e.target.value })}
              />
            </div>
            {/* Description */}
            <div className="mb-3 grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="describe your template"
                value={input.description ?? ""}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            {/* Template URL */}
            <div className="mb-4 grid gap-2">
              <Label htmlFor="templateUrl">Template URL</Label>
              <Input
                id="templateUrl"
                placeholder="https://your-site.nastro.site/123"
                value={input.url}
                onChange={(e) => setInput({ ...input, url: e.target.value })}
              />
            </div>
            {/* Notion Page URL */}
            <div className="mb-3 grid gap-2">
              <Label htmlFor="notionPageUrl">Notion Page URL</Label>
              <div className="my-2">
                <Input
                  id="notionPageUrl"
                  placeholder="https://notion.so/page-id"
                  value={input.notionPageUrl}
                  onChange={(e) =>
                    setInput({ ...input, notionPageUrl: e.target.value })
                  }
                />
              </div>
            </div>
            {/* Instructions page url */}
            <div className="mb-3 grid gap-2">
              <Label htmlFor="instructionsPageUrl">
                Instructions page url{" "}
              </Label>
              <div className="my-2">
                <Input
                  id="instructionsPageUrl"
                  placeholder="https://notion.so/page-id"
                  value={input.instructionsPageUrl ?? ""}
                  onChange={(e) =>
                    setInput({ ...input, instructionsPageUrl: e.target.value })
                  }
                />
              </div>
            </div>
            {/* Thumbnail URL */}
            <div className="mb-3 grid gap-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://example.com/image.jpg"
                value={input.thumbnail || ""}
                onChange={(e) =>
                  setInput({
                    ...input,
                    thumbnail: e.target.value,
                  })
                }
              />
            </div>
            {/* Tags */}
            <div className="mb-4 grid gap-2">
              <InputWithTags
                label="Tags"
                onChange={(tags) => {
                  const texts = tags.map((t) => t.text);
                  setInput((prev) => ({ ...prev, tags: texts }));
                }}
                placeholder="Portfolio , Blog , Marketing"
                defaultTags={[]}
              />
            </div>
            {/* Is Paid Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3 mb-3">
              <Label htmlFor="isPaid" className="grid flex-1">
                <span>Paid Template</span>
                <span className="text-sm text-muted-foreground">
                  Mark this as a paid template
                </span>
              </Label>
              <Switch
                id="isPaid"
                checked={input.isPaid || false}
                onCheckedChange={(checked) =>
                  setInput({ ...input, isPaid: checked })
                }
              />
            </div>
            {/* Price (only if paid) */}
            {input.isPaid && (
              <div className="grid gap-2 mb-3">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="29.99"
                  value={input.price || ""}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      price: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
            )}
            {/* Payment Link (only if paid) */}
            {input.isPaid && (
              <div className="grid gap-2 mb-3">
                <Label htmlFor="paymentLink">Payment Link</Label>
                <Input
                  id="paymentLink"
                  placeholder="https://stripe.com/pay/..."
                  value={input.paymentLink || ""}
                  onChange={(e) =>
                    setInput({ ...input, paymentLink: e.target.value || null })
                  }
                />
              </div>
            )}
          </ScrollArea>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Template"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setInputToDefault();
            }}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
