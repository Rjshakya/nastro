import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateSite } from "@/hooks/use-sites";
import { client } from "@/lib/api-client";
import { Env } from "@/lib/env";
import { authClient } from "@/lib/auth-client";
import { useCodePreviewStore } from "@/stores/code-preview.store";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { Site } from "@/types/site";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { boolean } from "zod";

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

function extractR2Key(url: string): string {
  const path = url.split(".xyz/")[1];
  if (!path) return "";
  const parts = path.split("/");
  parts.shift();
  return parts.join("/");
}

export const CodeEditorPanel = ({ site }: CodeTabProps) => {
  const { theme } = useTheme();
  const { updateSite, isLoading: isUpdating } = useUpdateSite();
  const { settings } = useSiteSettingStore();
  const { previewCss, setPreviewCss, previewScript, setPreviewScript } = useCodePreviewStore();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || "";

  const [savedCssLink, setSavedCssLink] = useState(site.customCssLink);
  const [savedScriptLink, setSavedScriptLink] = useState(site.customScriptLink);
  const [toggleJs, setToggleJs] = useState(false);

  const handleSaveJs = async () => {
    try {
      const oldUrl = savedScriptLink;
      const fileName = `custom-${Date.now()}.js`;

      const fileUrl = await uploadCodeFile({
        slug: site.slug,
        fileName,
        content: "", // No editor yet; placeholder for future JS editor
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

      if (oldUrl) {
        const key = extractR2Key(oldUrl);
        client.api.upload["site-asset"].$delete({ query: { key } });
      }

      toast.success("Script saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save script");
    }
  };

  const handleSaveCss = async () => {
    try {
      const oldUrl = savedCssLink;
      const fileName = `custom-${Date.now()}.css`;

      const fileUrl = await uploadCodeFile({
        slug: site.slug,
        fileName,
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

      if (oldUrl) {
        const key = extractR2Key(oldUrl);
        client.api.upload["site-asset"].$delete({ query: { key } });
      }

      toast.success("CSS saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save CSS");
    }
  };

  const handleSave = () => {
    if (toggleJs) {
      return handleSaveJs();
    }
    return handleSaveCss();
  };

  return (
    <Dialog modal={false}>
      <DialogTrigger render={<Button variant={"secondary"}>Code</Button>} />
      <DialogContent
        showCloseButton={false}
        overlayClassName="hidden"
        className={"sm:max-w-3xl p-3 rounded-md "}
      >
        <DialogHeader className="gap-1 flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <DialogTitle className={"flex justify-between items-center"}>Code editor</DialogTitle>
            <DialogDescription className={""}>
              Edit your custom CSS and JS here. Remember to save after making changes.
            </DialogDescription>
          </div>

          <Toggle
            size={"sm"}
            className={"bg-secondary"}
            pressed={toggleJs}
            onPressedChange={setToggleJs}
          >
            {toggleJs ? "Javascript" : "CSS"}
          </Toggle>
        </DialogHeader>
        <Editor
          height={"70vh"}
          language={toggleJs ? "javascript" : "css"}
          value={toggleJs ? previewScript : previewCss}
          onChange={(code) => {
            if (toggleJs) {
              setPreviewScript(code || "");
            } else {
              setPreviewCss(code || "");
            }
          }}
          className="rounded-sm ring-ring/40 ring overflow-hidden p-2"
          theme={theme === "dark" ? "vs-dark" : "light"}
          keepCurrentModel={true}
        />

        <DialogFooter className="">
          <Button disabled={isUpdating} className={"px-4"} onClick={handleSave}>
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
