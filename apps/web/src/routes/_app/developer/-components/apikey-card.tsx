import { useState } from "react";
import { IconKey, IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApiKeys, useDeleteApiKey, useUpdateApiKey } from "@/hooks/use-apikeys";
import { CreateApiKeyDialog } from "./create-apikey-dialog";
import { ApiKeyItem } from "./apikey-item";
import type { CreateApiKeyResult } from "@/types/apikey";

export function ApiKeyCard() {
  const { data: apiKeys, isLoading, mutate } = useApiKeys();
  const { deleteApiKey, isLoading: isDeleting } = useDeleteApiKey();
  const { updateApiKey } = useUpdateApiKey();
  
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
      await updateApiKey({
        keyId,
        input: { enabled },
      });
      toast.success(enabled ? "API key enabled" : "API key disabled");
      mutate();
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
        <div className="mb-2 p-2">
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API keys for MCP access and integrations.</CardDescription>
        </div>
        <Card className="px-4 py-6 rounded-xl">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {apiKeys?.length || 0} key{apiKeys?.length !== 1 ? "s" : ""} created
              </div>
              <CreateApiKeyDialog onSuccess={handleCreateSuccess} />
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading API keys...</div>
            ) : apiKeys && apiKeys.length > 0 ? (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <ApiKeyItem
                    key={apiKey.id}
                    apiKey={apiKey}
                    newlyCreatedKey={newlyCreatedKey === apiKey.id ? newlyCreatedKey : null}
                    onDelete={handleDeleteClick}
                    onToggleEnabled={handleToggleEnabled}
                  />
                ))}
              </div>
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
      <Dialog open={!!keyToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="h-5 w-5" />
              Delete API Key
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
              <br /><br />
              Any applications or services using this key will immediately lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
