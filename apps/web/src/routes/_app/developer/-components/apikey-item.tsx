import { useState } from "react";
import { IconCopy, IconEye, IconEyeOff, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { ApiKey } from "@/types/apikey";

interface ApiKeyItemProps {
  apiKey: ApiKey;
  newlyCreatedKey?: string | null;
  onDelete: (keyId: string) => void;
  onToggleEnabled: (keyId: string, enabled: boolean) => void;
}

export function ApiKeyItem({ apiKey, newlyCreatedKey, onDelete, onToggleEnabled }: ApiKeyItemProps) {
  const [revealed, setRevealed] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const displayKey = revealed && newlyCreatedKey ? newlyCreatedKey : "•".repeat(24);
  const showCopyButton = !!newlyCreatedKey;

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium truncate">{apiKey.name}</h4>
              {!apiKey.enabled && (
                <Badge variant="secondary" className="shrink-0">
                  Disabled
                </Badge>
              )}
            </div>

            {showCopyButton && (
              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 px-3 py-2 text-sm font-mono bg-muted rounded-md truncate">
                  {displayKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRevealed((prev) => !prev)}
                  aria-label={revealed ? "Hide key" : "Reveal key"}
                >
                  {revealed ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(newlyCreatedKey!)}
                  aria-label="Copy key"
                >
                  <IconCopy className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {apiKey.permissions.map((perm) => (
                <Badge key={perm} variant="outline" className="text-xs capitalize">
                  {perm}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                Created {new Date(apiKey.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Switch
                checked={apiKey.enabled}
                onCheckedChange={(checked) => onToggleEnabled(apiKey.id, checked)}
                aria-label={apiKey.enabled ? "Disable API key" : "Enable API key"}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(apiKey.id)}
                aria-label="Delete API key"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
