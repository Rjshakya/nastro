import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { IconUpload } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import {
  getFileUploadUrl,
  uploadFileToUrl,
  deleteSiteAsset,
} from "@/lib/upload";
import { saveOgImage } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { SeoConfig } from "@/types/site.setting";
import type { Site } from "@/types/site";

interface SeoTabProps {
  site: Site;
  pageId: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function SeoTab({ site, pageId }: SeoTabProps) {
  const { settings, updateSeo } = useSiteSettingStore();
  const seo = settings.seo;

  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof SeoConfig, value: string) => {
    updateSeo({ ...seo, [key]: value });
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please upload an image file.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image must be smaller than 5 MB.";
    }
    return null;
  };

  const cleanup = (deleteUploaded: boolean) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (deleteUploaded && uploadedFileUrl) {
      deleteSiteAsset(uploadedFileUrl).catch(() => {});
    }
    setUploadedFileUrl(null);
    setIsUploading(false);
    setIsSaving(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const extension =
        file.name.split(".").pop() || file.type.split("/").pop() || "png";
      const fileName = `og-image-${Date.now()}.${extension}`;

      const { uploadUrl, fileUrl } = await getFileUploadUrl({
        fileName,
        slug: site.slug,
      });

      await uploadFileToUrl({ file, uploadUrl });
      setUploadedFileUrl(fileUrl);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload OG image");
      cleanup(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!uploadedFileUrl) return;

    setIsSaving(true);
    try {
      await saveOgImage({
        siteId: site.id,
        pageId,
        setting: settings,
        ogImageUrl: uploadedFileUrl,
      });

      updateSeo({ ...seo, ogImage: uploadedFileUrl });
      cleanup(false);
      setIsOpen(false);
      toast.success("OG image saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save OG image");
      setUploadedFileUrl(null);
      cleanup(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (e.target.value) e.target.value = "";
  };

  const canSave = Boolean(uploadedFileUrl) && !isUploading && !isSaving;

  return (
    <div className="grid gap-4 py-4">
      <div className="w-full grid gap-2">
        <Label className="capitalize">Title</Label>
        <Input
          value={seo.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Site title"
        />
      </div>
      <div className="w-full grid gap-2">
        <Label className="capitalize">Description</Label>
        <Input
          value={seo.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Site description"
        />
      </div>
      <div className="w-full grid gap-2">
        <Label className="capitalize">URL</Label>
        <Input
          value={seo.url}
          onChange={(e) => update("url", e.target.value)}
          placeholder="https://example.com"
        />
      </div>
      <div className="w-full grid gap-2">
        <div className="flex items-center justify-between">
          <Label className="capitalize">OG Image</Label>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Upload OG image"
                >
                  <IconUpload />
                </Button>
              }
            />
            <DialogContent>
              <DialogBody>
                <DialogHeader>
                  <DialogTitle>Upload OG Image</DialogTitle>
                  <DialogDescription>
                    Drag and drop an image, or click to browse.
                  </DialogDescription>
                </DialogHeader>

                {previewUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
                    <img
                      src={previewUrl}
                      alt="OG image preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      isUploading && "pointer-events-none opacity-60",
                    )}
                  >
                    <IconUpload className="size-8 text-muted-foreground" />
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Drag & drop an image here</p>
                      <p>or click to browse</p>
                      <p className="text-xs mt-2">PNG, JPG, WebP up to 5 MB</p>
                    </div>
                  </div>
                )}

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />

                {isUploading && (
                  <p className="text-center text-sm text-muted-foreground">
                    Uploading...
                  </p>
                )}
              </DialogBody>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSaving || isUploading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!canSave}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Input
          value={seo.ogImage}
          onChange={(e) => update("ogImage", e.target.value)}
          placeholder="https://example.com/og.png"
        />
      </div>
    </div>
  );
}
