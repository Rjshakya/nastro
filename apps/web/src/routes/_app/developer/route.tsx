import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IconCopy, IconEye, IconEyeOff, IconLink } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { handleConnectNotion } from "@/lib/auth-client";
import { useNotionToken } from "@/hooks/use-notion";
import { Error } from "@/components/error";

export const Route = createFileRoute("/_app/developer")({
  component: DeveloperPage,
  errorComponent: Error,
});

function DeveloperPage() {
  const { data: token, isLoading } = useNotionToken();
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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Developer</h1>
        <p className="text-muted-foreground">
          Manage your developer settings and integrations.
        </p>
      </div>

      <Card className="">
        <CardHeader>
          <CardTitle>Notion Integration</CardTitle>
          <CardDescription>
            Connect your Notion account to access pages and content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
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

          <Button onClick={handleConnectNotion} className="gap-2">
            <IconLink />
            Connect with Notion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
