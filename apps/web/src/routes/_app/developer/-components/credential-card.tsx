import { useState } from "react";
import { IconCopy, IconEye, IconEyeOff, IconLink } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { handleConnectNotion } from "@/lib/auth-client";

export function CredentialCard({
  token,
  isLoading,
}: {
  token: string | undefined;
  isLoading: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      toast.success("Token copied to clipboard");
    } catch {
      toast.error("Failed to copy token");
    }
  };

  const displayToken = revealed && token ? token : "•".repeat(24);

  return (
    <div className="bg-accent rounded-2xl p-1  ">
      <div className="mb-2 p-2 flex items-center justify-between ">
        <div>
          <CardTitle>Notion Integration</CardTitle>
          <CardDescription>
            Connect your Notion account to access pages and content.
          </CardDescription>
        </div>
        <Button onClick={handleConnectNotion} className="gap-2">
          <IconLink />
          Connect with Notion
        </Button>
      </div>
      <Card className="bg-background px-4 py-6 rounded-xl">
        <CardContent className="space-y-4 p-0">
          <div className="space-y-3">
            <Label htmlFor="notion-token">Notion Access Token</Label>
            <div className="flex items-center gap-2">
              <Input
                id="notion-token"
                readOnly
                value={isLoading ? "Loading..." : displayToken}
                type="text"
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRevealed((prev) => !prev)}
                disabled={!token}
                aria-label={revealed ? "Hide token" : "Reveal token"}
              >
                {revealed ? <IconEyeOff /> : <IconEye />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={!token}
                aria-label="Copy token"
              >
                <IconCopy />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
