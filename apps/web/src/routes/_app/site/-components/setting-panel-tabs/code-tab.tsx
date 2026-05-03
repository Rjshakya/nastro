import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Site } from "@/types/site";

interface CodeTabProps {
  site: Site;
}

export function CodeTab({ site }: CodeTabProps) {
  return (
    <div className="grid gap-6 py-4">
      {/* CSS Section */}
      <div className="grid gap-2">
        {site.customCssLink && (
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Saved CSS URL</Label>
            <Input value={site.customCssLink} readOnly className="text-xs bg-muted" />
          </div>
        )}
      </div>

      {/* Script Section */}
      <div className="grid gap-2">
        {site.customCssLink && (
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Saved Script URL</Label>
            <Input value={site.customCssLink} readOnly className="text-xs bg-muted" />
          </div>
        )}
      </div>
    </div>
  );
}
