import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Site } from "@/types/site";
import { useUpdateSite } from "@/hooks/use-sites";
import { toast } from "sonner";
import z from "zod";
import { useParams } from "@tanstack/react-router";

interface CodeTabProps {
  site: Site;
}

const urlSchema = z.url();

export function CodeTab({ site }: CodeTabProps) {
  const { updateSite, isLoading } = useUpdateSite();
  const params = useParams({ from: "/_app/site/$pageId" });
  const handleUpdateCustomCss = async (url: string) => {
    const { success, data } = urlSchema.safeParse(url);

    if (!success) {
      return;
    }

    try {
      await updateSite({
        input: {
          customCssLink: data,
        },
        siteId: site.id,
        pageId: params.pageId,
      });

      toast.success("CSS saved successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save CSS");
    }
  };

  const handleUpdateCustomJS = async (url: string) => {
    const { success, data } = urlSchema.safeParse(url);
    if (!success) {
      return;
    }

    try {
      await updateSite({
        input: {
          customScriptLink: data,
        },
        siteId: site.id,
        pageId: params.pageId,
      });

      toast.success("Script saved successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save script");
    }
  };

  return (
    <div className="grid gap-6 py-4">
      {/* CSS Section */}
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">CSS URL</Label>
          <Input
            value={site.customCssLink ?? ""}
            onChange={(e) => handleUpdateCustomCss(e.target.value)}
            className="text-xs bg-muted"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Script Section */}
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Script URL</Label>
          <Input
            value={site.customScriptLink ?? ""}
            onChange={(e) => handleUpdateCustomJS(e.target.value)}
            className="text-xs bg-muted"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
