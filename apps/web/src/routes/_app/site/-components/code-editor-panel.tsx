import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateSite } from "@/hooks/use-sites";
import { client } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { useCodePreviewStore } from "@/stores/code-preview.store";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { Site } from "@/types/site";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

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

export const CodeEditorPanel = ({ site }: CodeTabProps) => {
  const { theme } = useTheme();
  const { updateSite, isLoading } = useUpdateSite();
  const { settings } = useSiteSettingStore();
  const { previewCss, setPreviewCss } = useCodePreviewStore();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || "";

  const [jsCode, setJsCode] = useState("");

  const [savedCssLink, setSavedCssLink] = useState(site.customCssLink);
  const [savedScriptLink, setSavedScriptLink] = useState(site.customScriptLink);

  const handleSaveCss = async () => {
    try {
      const fileUrl = await uploadCodeFile({
        slug: site.slug,
        fileName: "custom.css",
        content: previewCss,
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
    <Dialog modal={false}>
      <DialogTrigger render={<Button variant={"secondary"}>Code</Button>} />
      <DialogContent overlayClassName="hidden" className={"sm:max-w-3xl px-2 pt-2 pb-4"}>
        <Editor
          height={"70vh"}
          defaultLanguage="css"
          value={previewCss}
          onChange={(code) => setPreviewCss(code ?? "")}
          className="rounded-lg ring-ring/50 ring-2 overflow-hidden"
          theme={theme === "dark" ? "vs-dark" : "light"}
          keepCurrentModel={true}
        />
        <DialogFooter>
          <Button className={"px-4"} onClick={handleSaveCss}>
            Save
          </Button>
          <DialogClose
            className={
              "hover:bg-secondary hover:transition-colors duration-300 ease-in-out px-4 py-2 rounded-full"
            }
          >
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
