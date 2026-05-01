import { useState } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUpdateSite } from "@/hooks/use-sites";
import { client } from "@/lib/api-client";
import { toast } from "sonner";
import type { Site } from "@/types/site";
import { authClient } from "@/lib/auth-client";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import { useCodePreviewStore } from "@/stores/code-preview.store";

interface CodeTabProps {
  site: Site;
}

async function uploadCodeFile({
  slug,
  fileName,
  content,
}: {
  slug: string;
  fileName: string;
  content: string;
}) {
  const res = await client.api.upload["site-asset"].$post({
    json: {
      fileName,
      slug,
      expiresIn: 600,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to get presigned URL");
  }

  const { data } = await res.json();
  const { uploadUrl, fileUrl } = data;

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: content,
    headers: {
      "Content-Type": fileName.endsWith(".css") ? "text/css" : "application/javascript",
    },
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to storage");
  }

  return fileUrl;
}

export function CodeTab({ site }: CodeTabProps) {
  const { updateSite, isLoading } = useUpdateSite();
  const { settings } = useSiteSettingStore();
  const { setPreviewCss } = useCodePreviewStore();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || "";

  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");

  const [savedCssLink, setSavedCssLink] = useState(site.customCssLink);
  const [savedScriptLink, setSavedScriptLink] = useState(site.customScriptLink);

  const handleCssChange = (code: string) => {
    setCssCode(code);
    setPreviewCss(code);
  };

  const handleSaveCss = async () => {
    try {
      const fileUrl = await uploadCodeFile({
        slug: site.slug,
        fileName: "custom.css",
        content: cssCode,
      });

      await updateSite({
        siteId: site.id,
        input: {
          userId,
          rootPageId: site.rootPageId,
          name: site.name,
          slug: site.slug,
          setting: settings,
          themeId: site.themeId ?? null,
          customCssLink: fileUrl,
          customScriptLink: savedScriptLink,
        },
      });

      setSavedCssLink(fileUrl);
      toast.success("CSS saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save CSS");
    }
  };

  const handleSaveJs = async () => {
    try {
      const fileUrl = await uploadCodeFile({
        slug: site.slug,
        fileName: "custom.js",
        content: jsCode,
      });

      await updateSite({
        siteId: site.id,
        input: {
          userId,
          rootPageId: site.rootPageId,
          name: site.name,
          slug: site.slug,
          setting: settings,
          themeId: site.themeId ?? null,
          customCssLink: savedCssLink,
          customScriptLink: fileUrl,
        },
      });

      setSavedScriptLink(fileUrl);
      toast.success("Script saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save script");
    }
  };

  return (
    <div className="grid gap-6 py-4">
      {/* CSS Section */}
      <div className="grid gap-2">
        <Label className="capitalize">Custom CSS</Label>
        <div className="border rounded-md overflow-hidden font-mono text-sm">
          <Editor
            value={cssCode}
            onValueChange={handleCssChange}
            highlight={(code) => Prism.highlight(code, Prism.languages.css, "css")}
            padding={16}
            className="min-h-50 bg-muted"
            textareaClassName="focus:outline-none"
            ignoreTabKey={false}
          />
        </div>
        {savedCssLink && (
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Saved CSS URL</Label>
            <Input value={savedCssLink} readOnly className="text-xs bg-muted" />
          </div>
        )}
        <Button onClick={handleSaveCss} disabled={isLoading} className="w-fit">
          {isLoading ? "Saving..." : "Save CSS"}
        </Button>
      </div>

      {/* Script Section */}
      <div className="grid gap-2">
        <Label className="capitalize">Custom Script</Label>
        <div className="border rounded-md overflow-hidden font-mono text-sm">
          <Editor
            value={jsCode}
            onValueChange={setJsCode}
            highlight={(code) => Prism.highlight(code, Prism.languages.javascript, "javascript")}
            padding={16}
            className="min-h-50 bg-muted"
            textareaClassName="focus:outline-none"
            ignoreTabKey={false}
          />
        </div>
        {savedScriptLink && (
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Saved Script URL</Label>
            <Input value={savedScriptLink} readOnly className="text-xs bg-muted" />
          </div>
        )}
        <Button onClick={handleSaveJs} disabled={isLoading} className="w-fit">
          {isLoading ? "Saving..." : "Save Script"}
        </Button>
      </div>
    </div>
  );
}
