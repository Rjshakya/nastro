import { IconArrowUpRight, IconDownload, IconPhoto, IconTrash } from "@tabler/icons-react";

import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Template } from "@/types/template";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { useDeleteTemplate } from "#/hooks/use-templates";

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
          <div className="relative aspect-video bg-muted">
            {template.templateThumbnailUrl ? (
              <img
                src={template.templateThumbnailUrl}
                alt={template.templateName}
                className="size-full rounded-md object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <IconPhoto className="size-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Template Name */}
          <div className="flex items-center justify-between rounded-sm bg-muted px-2 py-1 text-base">
            <p className="max-w-50 truncate">{template.templateName}</p>
            <div className="text-muted-foreground">
              {template.isPaid ? <p>${template.price}</p> : <p>Free</p>}
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent showCloseButton={true} className="max-w-lg px-0 py-0 gap-0">
        <div className="space-y-4 overflow-hidden">
          {/* Large Thumbnail */}
          <div className="p-1 relative aspect-video overflow-hidden rounded-lg ">
            {template.templateThumbnailUrl ? (
              <img
                src={template.templateThumbnailUrl}
                alt={template.templateName}
                className="size-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <IconPhoto className="size-16 text-muted-foreground" />
              </div>
            )}

            <div className="absolute bottom-1 inset-x-0  w-full z-20 flex justify-end p-2">
              <Link to={template.templateUrl} target="_blank">
                <Button size={"xs"} variant={"secondary"}>
                  <p>Preview</p>
                  <IconArrowUpRight />
                </Button>
              </Link>
            </div>
          </div>

          <div className="px-2">
            <DialogHeader className="mb-4">
              <DialogTitle className={"text-2xl flex items-center justify-between gap-1 "}>
                {template.templateName}
              </DialogTitle>

              {template.templateDescription && (
                <DialogDescription>{template.templateDescription}</DialogDescription>
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
          </div>
          {/* Price */}
        </div>

        <DialogFooter className="p-2">
          <Link to="/templates/install/$templateId" params={{ templateId: template.id }}>
            <Button>
              <IconDownload />
              {template.isPaid ? "Buy Template" : "Install"}
            </Button>
          </Link>

          {template.createdBy === sessionData?.user.id && (
            <Button
              variant={"destructive"}
              onClick={() => {
                setIsOpen(false);
                setIsDeleteDialogOpen(true);
              }}
            >
              <IconTrash />
              <p>Delete</p>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template . This action cannot be undone
            </DialogDescription>

            <DialogFooter>
              <Button
                onClick={() => deleteTemplate({ templateId: template.id })}
                disabled={isDeleting}
                variant={"destructive"}
              >
                Confirm
              </Button>
              <Button onClick={() => setIsDeleteDialogOpen(false)} variant={"secondary"}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogHeader>
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
