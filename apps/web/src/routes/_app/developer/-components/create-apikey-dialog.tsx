import { useState } from "react";
import { IconPlus, IconCopy, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Permission, CreateApiKeyResult } from "@/types/apikey";
import { useCreateApiKey } from "@/hooks/use-apikeys";

interface CreateApiKeyDialogProps {
  onSuccess?: (result: CreateApiKeyResult) => void;
}

export function CreateApiKeyDialog({ onSuccess }: CreateApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>(["read"]);
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { createApiKey, isLoading } = useCreateApiKey();

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    if (checked) {
      setPermissions((prev) => [...prev, permission]);
    } else {
      setPermissions((prev) => prev.filter((p) => p !== permission));
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || permissions.length === 0) return;

    try {
      const result = await createApiKey({
        name: name.trim(),
        permissions,
      });

      if (result) {
        setCreatedKey(result);
        onSuccess?.(result);
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCopy = async () => {
    if (!createdKey?.key) return;

    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form after a delay to allow animation to complete
    setTimeout(() => {
      setName("");
      setPermissions(["read"]);
      setCreatedKey(null);
      setCopied(false);
    }, 300);
  };

  const isValid = name.trim().length > 0 && permissions.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="default" className="shadow-2xl">
            <IconPlus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        }
      />
      <DialogContent className="px-4 py-4 font-sans tracking-tighter sm:max-w-md">
        {!createdKey ? (
          <>
            <DialogHeader className="px-0">
              <DialogTitle className="font-medium">Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for MCP access. You can set permissions and name it for easy identification.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production Key, Development Key"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-3">
                <Label>
                  Permissions <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="permission-read"
                      checked={permissions.includes("read")}
                      onCheckedChange={(checked) =>
                        handlePermissionChange("read", checked as boolean)
                      }
                    />
                    <Label htmlFor="permission-read" className="font-normal cursor-pointer">
                      Read - Access to read site data and content
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="permission-write"
                      checked={permissions.includes("write")}
                      onCheckedChange={(checked) =>
                        handlePermissionChange("write", checked as boolean)
                      }
                    />
                    <Label htmlFor="permission-write" className="font-normal cursor-pointer">
                      Write - Access to modify site settings and upload files
                    </Label>
                  </div>
                </div>
                {permissions.length === 0 && (
                  <p className="text-sm text-red-500">At least one permission is required</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!isValid || isLoading}>
                {isLoading ? "Creating..." : "Create Key"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="px-0">
              <DialogTitle className="font-medium flex items-center gap-2">
                <IconCheck className="h-5 w-5 text-green-500" />
                API Key Created
              </DialogTitle>
              <DialogDescription>
                Your new API key has been created successfully.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 text-sm font-mono bg-muted rounded-md break-all">
                    {createdKey.key}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className={copied ? "text-green-500" : ""}
                  >
                    {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-amber-600 font-medium">
                  ⚠️ Copy this key now - it won&apos;t be shown again!
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{createdKey.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Permissions:</span>
                  <span className="font-medium capitalize">{createdKey.permissions.join(", ")}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
