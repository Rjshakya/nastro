import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCustomDomain } from "@/hooks/use-custom-domains";
import type { Site } from "@/types/site";

interface CreateDomainDialogProps {
  sites: Site[];
}

export function CreateDomainDialog({ sites }: CreateDomainDialogProps) {
  const [open, setOpen] = useState(false);
  const [hostName, setHostName] = useState("");
  const [siteId, setSiteId] = useState("");
  const { createCustomDomain, isLoading } = useCreateCustomDomain();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hostName.trim()) {
      toast.error("Hostname is required");
      return;
    }

    if (!siteId) {
      toast.error("Please select a site");
      return;
    }

    try {
      await createCustomDomain({ siteId, hostName: hostName.trim() });
      toast.success("Custom domain created successfully");
      setOpen(false);
      setHostName("");
      setSiteId("");
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <IconPlus className="size-4 mr-1" />
            Add Domain
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Domain</DialogTitle>
          <DialogDescription>
            Connect a custom domain to one of your sites.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            <Select
              value={siteId}
              onValueChange={(siteId) => setSiteId(siteId ?? "")}
            >
              <SelectTrigger id="site" className="w-full">
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostname">Domain Name</Label>
            <Input
              id="hostname"
              placeholder="www.example.com"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the full domain name you want to connect (e.g.,
              www.example.com).
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Domain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
