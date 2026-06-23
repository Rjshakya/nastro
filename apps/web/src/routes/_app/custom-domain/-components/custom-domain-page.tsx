import { useState } from "react";
import {
  IconLink,
  IconAlertTriangle,
  IconCopy,
  IconAlertTriangleFilled,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useCustomDomains,
  useDeleteCustomDomain,
  useDomainCname,
} from "@/hooks/use-custom-domains";
import { useSites } from "@/hooks/use-sites";
import { DomainList } from "./domain-list";
import { CreateDomainDialog } from "./create-domain-dialog";

export function CustomDomainPage() {
  const { domains, isLoading, mutate } = useCustomDomains();
  const { cname } = useDomainCname();
  const { deleteCustomDomain, isLoading: isDeleting } = useDeleteCustomDomain();
  const { data: sites } = useSites();

  const [domainToDelete, setDomainToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDomainToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!domainToDelete) return;

    try {
      await deleteCustomDomain({ id: domainToDelete });
      toast.success("Custom domain deleted successfully");
      setDomainToDelete(null);
      mutate();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleCancelDelete = () => {
    setDomainToDelete(null);
  };

  const handleCopyCname = () => {
    if (cname) {
      navigator.clipboard.writeText(cname);
      toast.success("CNAME copied to clipboard");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-medium">
              Custom Domains
            </h1>
            <p className="text-muted-foreground">
              Manage custom domains for your sites.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SidebarTrigger />
          </div>
        </div>

        {/* CNAME Alert Box */}
        {cname && (
          <div className="flex items-start gap-4 rounded-xl border bg-muted/50 p-4">
            <IconAlertTriangleFilled className="size-6 sm:size-9 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">DNS Configuration Required</p>
              <p className="text-sm text-muted-foreground">
                Point your domain&apos;s CNAME record to{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                  {cname}
                </code>
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopyCname}>
              <IconCopy className="size-4 mr-1" />
              Copy
            </Button>
          </div>
        )}

        {/* Domain List Card */}
        <div className="bg-accent rounded-2xl p-1">
          <div className="mb-2 p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconLink className="size-5 text-blue-400" stroke={2} />
              <CardTitle>Your Domains</CardTitle>
            </div>
            <CreateDomainDialog sites={sites || []} />
          </div>
          <Card className="p-1 bg-background rounded-2xl">
            <CardContent className="p-0">
              <DomainList
                domains={domains || []}
                isLoading={isLoading}
                onDelete={handleDeleteClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!domainToDelete}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom domain? This action
              cannot be undone. Your site will no longer be accessible via this
              domain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
