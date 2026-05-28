import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateSite } from "@/hooks/use-sites";
import { client } from "@/lib/api-client";
import { useCodePreviewStore } from "@/stores/code-preview.store";
import { useCodeEditorPanelStore } from "@/stores/code-editor-panel.store";
import type { Site } from "@/types/site";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";

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
      "Content-Type": fileName.endsWith(".css")
        ? "text/css"
        : "application/javascript",
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
  const params = useParams({ from: "/_app/site/$pageId" });
  const { updateSite, isLoading: isUpdating } = useUpdateSite();
  const { previewCss, setPreviewCss, previewScript, setPreviewScript } =
    useCodePreviewStore();

  const { open, onOpenChange } = useCodeEditorPanelStore();
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
          customScriptLink: fileUrl,
        },
        pageId: params.pageId,
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
          customCssLink: fileUrl,
        },
        pageId: params.pageId,
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
    <Sheet
      disablePointerDismissal={true}
      modal={false}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        showCloseButton={false}
        overlayClassName="hidden"
        side="right"
        className={cn(" data-[side=right]:sm:max-w-xl w-full ")}
      >
        <SheetHeader className="gap-1 flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <SheetTitle>Code editor</SheetTitle>
            <SheetDescription>
              Edit your custom CSS and JS here. Remember to save after making
              changes.
            </SheetDescription>
          </div>

          <Toggle
            size={"sm"}
            className={"bg-secondary"}
            pressed={toggleJs}
            onPressedChange={setToggleJs}
          >
            {toggleJs ? "Javascript" : "CSS"}
          </Toggle>
        </SheetHeader>
        <div className="flex-1 min-h-0 px-4">
          <Editor
            height="100%"
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
        </div>

        <SheetFooter className="sm:flex flex-row items-center gap-1 justify-end ">
          <Button size={"lg"} disabled={isUpdating} onClick={handleSave}>
            Save
          </Button>
          <SheetClose render={<Button variant="outline">Close</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
