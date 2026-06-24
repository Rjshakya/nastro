import {
  IconArrowUpRight,
  IconDownload,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react";

import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Template } from "@/types/template";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useDeleteTemplate } from "@/hooks/use-templates";
import { EditTemplateDialog } from "./edit-template";

interface TemplateCardProps {
  template: Template;
  className?: string;
}

export function TemplateCard({ template, className }: TemplateCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: sessionData } = authClient.useSession();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deleteTemplate, isLoading: isDeleting } = useDeleteTemplate();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Card
          className={cn(
            "gap-1 cursor-pointer overflow-hidden rounded-md bg-muted p-0 pt-0 ",
            className,
          )}
        >
          {/* Thumbnail */}
          <div className="relative bg-muted">
            {template.thumbnail ? (
              <img
                src={template.thumbnail}
                alt={template.name}
                className="size-full rounded-md aspect-square object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <IconPhoto className="size-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Template Name */}
          <div className="flex items-center justify-between rounded-sm bg-muted px-2 py-1 text-base">
            <p className="max-w-50 truncate">{template.name}</p>
            <div className="text-muted-foreground">
              {template.isPaid ? <p>${template.price}</p> : <p>Free</p>}
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent showCloseButton className="max-w-lg">
        <div className="space-y-4 overflow-hidden">
          {/* Large Thumbnail */}
          <div className="relative aspect-video overflow-hidden rounded-lg p-1">
            {template.thumbnail ? (
              <img
                src={template.thumbnail}
                alt={template.name}
                className="size-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <IconPhoto className="size-16 text-muted-foreground" />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-1 z-20 flex w-full justify-end p-2">
              <Link to={template.url} target="_blank">
                <Button size="xs" variant="secondary">
                  <p>Preview</p>
                  <IconArrowUpRight />
                </Button>
              </Link>
            </div>
          </div>

          <DialogBody>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl flex items-center justify-between gap-1">
                {template.name}
              </DialogTitle>

              {template.description && (
                <DialogDescription>{template.description}</DialogDescription>
              )}
            </DialogHeader>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </DialogBody>
        </div>

        <DialogFooter>
          <Link
            to="/templates/install/$templateId"
            params={{ templateId: template.id }}
          >
            <Button>
              <IconDownload />
              {template.isPaid ? "Buy Template" : "Install"}
            </Button>
          </Link>

          {template.createdBy === sessionData?.user?.id && (
            <>
              <EditTemplateDialog template={template} />
              <Button
                variant="destructive"
                onClick={() => {
                  setIsOpen(false);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <IconTrash />
                <p>Delete</p>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogBody>
            <DialogHeader>
              <DialogTitle>Delete template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this template. This action
                cannot be undone
              </DialogDescription>
            </DialogHeader>
          </DialogBody>

          <DialogFooter>
            <Button
              onClick={() => deleteTemplate({ templateId: template.id })}
              disabled={isDeleting}
              variant="destructive"
            >
              Confirm
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export function TemplateCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-md bg-muted p-0 pt-0">
      {/* Thumbnail Skeleton */}
      <Skeleton className="aspect-video" />

      <CardHeader className="p-2">
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
    </Card>
  );
}
