import { useState } from "react";
import { IconKey, IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useApiKeys,
  useDeleteApiKey,
  useUpdateApiKey,
} from "@/hooks/use-apikeys";
import { CreateApiKeyDialog } from "./create-apikey-dialog";
import { ApiKeyItem } from "./apikey-item";
import type { CreateApiKeyResult } from "@/types/apikey";
import { ItemGroup } from "@/components/ui/item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateApiKey } from "@/lib/apikey";

export function ApiKeyCard() {
  const { data: apiKeys, isLoading, mutate } = useApiKeys();
  const { deleteApiKey, isLoading: isDeleting } = useDeleteApiKey();

  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const handleCreateSuccess = (result: CreateApiKeyResult) => {
    setNewlyCreatedKey(result.key);
    mutate();

    // Clear the newly created key highlight after 30 seconds
    setTimeout(() => {
      setNewlyCreatedKey(null);
    }, 30000);
  };

  const handleToggleEnabled = async (keyId: string, enabled: boolean) => {
    try {
      await updateApiKey({ keyId, input: { enabled } });
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDeleteClick = (keyId: string) => {
    setKeyToDelete(keyId);
  };

  const handleConfirmDelete = async () => {
    if (!keyToDelete) return;

    try {
      await deleteApiKey({ keyId: keyToDelete });
      toast.success("API key deleted successfully");
      setKeyToDelete(null);
      mutate();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleCancelDelete = () => {
    setKeyToDelete(null);
  };

  return (
    <>
      <div className="bg-accent rounded-2xl p-1">
        <div className="mb-2 p-2 flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys for MCP access and integrations.
            </CardDescription>
          </div>
          <CreateApiKeyDialog onSuccess={handleCreateSuccess} />
        </div>
        <Card className="p-1 rounded-2xl bg-accent">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading API keys...
              </div>
            ) : apiKeys && apiKeys.length > 0 ? (
              <ItemGroup className="gap-1 p-1">
                {apiKeys.map((apiKey) => (
                  <ApiKeyItem
                    key={apiKey.id}
                    apiKey={apiKey}
                    newlyCreatedKey={
                      newlyCreatedKey === apiKey.id ? newlyCreatedKey : null
                    }
                    onDelete={handleDeleteClick}
                    onToggleEnabled={handleToggleEnabled}
                  />
                ))}
              </ItemGroup>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="flex justify-center">
                  <IconKey className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <div className="text-muted-foreground">
                  No API keys yet. Create one to get started.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}

      <AlertDialog
        open={!!keyToDelete}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key? This action cannot
              be undone. Any applications or services using this key will
              immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              //variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes , delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
