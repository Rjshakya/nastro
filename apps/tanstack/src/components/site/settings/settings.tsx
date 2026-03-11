"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { NotionPageSettings } from "#/types/customization";
import { TabGeneral, type TabGeneralProps } from "./tabs/tab-general";
import { TabTheme, type TabThemeProps } from "./tabs/tab-theme";
import { TabTypo, type TabTypoProps } from "./tabs/tab-typo";
import { TabLayout, type TabLayoutProps } from "./tabs/tab-layout";
import { TabSeo, type TabSeoProps } from "./tabs/tab-seo";
import { useUpdateSite } from "#/components/hooks/use-sites";
import { useParams, useSearch } from "@tanstack/react-router";

interface SettingsV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Tab display names (capitalized)
const tabNames: Record<keyof NotionPageSettings, string> = {
  general: "General",
  theme: "Theme",
  typography: "Typography",
  layout: "Layout",
  seo: "Seo",
};

const generalSections: TabGeneralProps = {
  siteName: { label: "Site Name", type: "text" },
  header: { label: "Header", type: "boolean" },
  footer: { label: "Footer", type: "boolean" },
  pageWidth: { label: "Page width", type: "number", min: 20, max: 100 },
};

// Theme sections configuration - defines what renders in TabTheme
const themeSections: TabThemeProps["sections"] = [
  {
    id: "main",
    label: "Main Colors",
    fields: [
      { key: "pageBackground", label: "Page Background" },
      { key: "textColor", label: "Text Color" },
      { key: "checkboxBackground", label: "Checkbox Background" },
    ],
  },
  {
    id: "header",
    label: "Header Colors",
    fields: [
      { key: "background", label: "Background" },
      { key: "textColor", label: "Text Color" },
      { key: "buttonText", label: "Button Text" },
      { key: "buttonBackground", label: "Button Background" },
    ],
  },
  {
    id: "footer",
    label: "Footer Colors",
    fields: [
      { key: "background", label: "Background" },
      { key: "textColor", label: "Text Color" },
      { key: "buttonText", label: "Button Text" },
      { key: "buttonBackground", label: "Button Background" },
    ],
  },
  {
    id: "notion",
    label: "Notion Colors",
    fields: [
      { key: "gray", label: "Gray" },
      { key: "brown", label: "Brown" },
      { key: "orange", label: "Orange" },
      { key: "yellow", label: "Yellow" },
      { key: "teal", label: "Teal" },
      { key: "blue", label: "Blue" },
      { key: "purple", label: "Purple" },
      { key: "pink", label: "Pink" },
      { key: "red", label: "Red" },
    ],
  },
  {
    id: "card",
    label: "Card Colors",
    fields: [
      { key: "cardBackground", label: "Card Background" },
      { key: "cardHover", label: "Card Hover" },
      { key: "cardText", label: "Card Text" },
      { key: "cardBorder", label: "Card Border" },
    ],
  },
  {
    id: "buttons",
    label: "Button Colors",
    fields: [
      { key: "gray", label: "Gray" },
      { key: "brown", label: "Brown" },
      { key: "orange", label: "Orange" },
      { key: "yellow", label: "Yellow" },
      { key: "teal", label: "Teal" },
      { key: "blue", label: "Blue" },
      { key: "purple", label: "Purple" },
      { key: "pink", label: "Pink" },
      { key: "red", label: "Red" },
    ],
  },
  {
    id: "notionBackground",
    label: "Notion Background",
    fields: [
      { key: "gray", label: "Gray Background" },
      { key: "brown", label: "Brown Background" },
      { key: "orange", label: "Orange Background" },
      { key: "yellow", label: "Yellow Background" },
      { key: "teal", label: "Teal Background" },
      { key: "blue", label: "Blue Background" },
      { key: "purple", label: "Purple Background" },
      { key: "pink", label: "Pink Background" },
      { key: "red", label: "Red Background" },
    ],
  },
  {
    id: "defaultButton",
    label: "Default Button",
    fields: [
      { key: "background", label: "Background" },
      { key: "textColor", label: "Text Color" },
      { key: "borderColor", label: "Border Color" },
      { key: "hoverBackground", label: "Hover Background" },
    ],
  },
];

const typoSections: TabTypoProps["sections"] = [
  {
    id: "sizes",
    label: "Font Sizes",
    fields: [
      {
        key: "pageTitle",
        label: "Page Title",
        type: "number",
        min: 10,
        max: 80,
      },
      { key: "heading1", label: "Heading 1", type: "number", min: 10, max: 60 },
      { key: "heading2", label: "Heading 2", type: "number", min: 10, max: 50 },
      { key: "heading3", label: "Heading 3", type: "number", min: 10, max: 40 },
      { key: "base", label: "Base Text", type: "number", min: 10, max: 30 },
    ],
  },
  {
    id: "fonts",
    label: "Fonts",
    fields: [
      { key: "primary", label: "Primary Font", type: "font" },
      { key: "secondary", label: "Secondary Font", type: "font" },
    ],
  },
];

const seoSections: TabSeoProps = {
  title: { label: "Page Title", type: "text" },
  description: { label: "Description", type: "text" },
  ogImage: { label: "OG Image URL", type: "text" },
  pageUrl: { label: "Page URL", type: "text" },
  pageIcon: { label: "Page Icon URL", type: "text" },
};

const layoutSections: TabLayoutProps["sections"] = [
  {
    id: "header",
    label: "Header",
    fields: [
      { key: "text", label: "Header Text", type: "text" },
      { key: "logo", label: "Logo URL", type: "text" },
    ],
    links: {
      key: "links",
      label: "Navigation Links",
      itemFields: [
        { key: "text", label: "Link Text", type: "text" },
        { key: "url", label: "URL", type: "text" },
        { key: "variant", label: "Variant", type: "text" },
      ],
    },
    list: {
      key: "list",
      label: "List",
      itemFields: [
        { key: "text", label: "List Text", type: "text" },
        { key: "links", label: "List Links", type: "links" },
      ],
    },
    height: {
      key: "height",
      label: "Height",
      type: "number",
    },
    width: {
      key: "width",
      label: "Width",
      type: "number",
    },
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      { key: "text", label: "Footer Text", type: "text" },
      { key: "logo", label: "Logo URL", type: "text" },
    ],
    links: {
      key: "links",
      label: "Footer Links",
      itemFields: [
        { key: "text", label: "Link Text", type: "text" },
        { key: "url", label: "URL", type: "text" },
      ],
    },
  },
  {
    id: "sidebar",
    label: "Sidebar",
    fields: [
      { key: "text", label: "Sidebar Text", type: "text" },
      { key: "logo", label: "Logo URL", type: "text" },
    ],
    links: {
      key: "links",
      label: "Sidebar Links",
      itemFields: [
        { key: "text", label: "Link Text", type: "text" },
        { key: "url", label: "URL", type: "text" },
      ],
    },
    list: {
      key: "list",
      label: "List",
      itemFields: [
        { key: "text", label: "List Text", type: "text" },
        { key: "links", label: "List Links", type: "links" },
      ],
    },
  },
];

export function Settings({ open, onOpenChange }: SettingsV2Props) {
  const { siteId } = useParams({ from: "/site/$siteId" });
  const { pageId } = useSearch({ from: "/site/$siteId" });
  const { settings } = useNotionSettingsStore();
  const tabKeys = Object.keys(tabNames) as Array<keyof NotionPageSettings>;
  const { updateSite, isLoading } = useUpdateSite();

  const handleSave = async () => {
    await updateSite({
      siteId,
      input: {
        siteName: settings?.general?.siteName,
        siteSetting: settings,
        pageId,
      },
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        overlayClassName="supports-backdrop-filter:backdrop-blur-none  "
        className="w-full sm:max-w-md overflow-y-auto px-4 py-2 z-50 "
      >
        <SheetHeader className="px-0">
          <SheetTitle className="font-medium">Site Settings</SheetTitle>
          <SheetDescription>
            Customize your site appearance and settings
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-4 grid">
          <TabsList className="">
            {tabKeys.map((key) => (
              <TabsTrigger key={key} className="" value={key}>
                {tabNames[key]}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabKeys.map((key) => (
            <TabsContent key={key} value={key} className="space-y-4 mt-4">
              {key === "theme" ? (
                <TabTheme sections={themeSections} />
              ) : key === "general" ? (
                <TabGeneral tabProps={generalSections} />
              ) : key === "typography" ? (
                <TabTypo sections={typoSections} />
              ) : key === "layout" ? (
                <TabLayout sections={layoutSections} />
              ) : key === "seo" ? (
                <TabSeo tabProps={seoSections} />
              ) : null}
            </TabsContent>
          ))}
        </Tabs>

        <SheetFooter>
          <div className="mt-6 flex gap-2 justify-end">
            <Button size="sm" onClick={handleSave}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <SheetClose className="bg-muted px-4 rounded-md hover:bg-muted/80 transition-colors">
              Cancel
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
