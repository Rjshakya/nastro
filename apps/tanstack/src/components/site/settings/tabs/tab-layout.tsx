import { useCallback, useMemo, useState } from "react";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type {
  LayoutSettingsUI,
  HeaderLink,
  LayoutHeaderUI,
} from "#/types/customization";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { SliderInput } from "#/components/ui/slider-input";

interface LayoutField {
  key: string;
  label: string;
  type: "text" | "number";
  max?: number;
  min?: number;
  step?: number;
}

interface LayoutLinksItem {
  key: string;
  label: string;
  itemFields: LayoutField[];
}

interface LayoutListItem {
  key: string;
  label: string;
  itemFields: (LayoutField | { key: string; label: string; type: "links" })[];
}

interface LayoutSection {
  id: keyof LayoutSettingsUI;
  label: string;
  fields: LayoutField[];
  links?: LayoutLinksItem;
  list?: LayoutListItem;
  height?: { key: string; label: string; type: string };
  width?: { key: string; label: string; type: string };
}

export interface TabLayoutProps {
  sections: LayoutSection[];
}

const btnVariants = [
  { label: "Default", value: "default" },
  { label: "Outline", value: "outline" },
  { label: "Secondary", value: "secondary" },
  { label: "Ghost", value: "ghost" },
  { label: "Destructive", value: "destructive" },
  { label: "Link", value: "link" },
];

function LinksComponent({
  label,
  itemFields,
  value,
  onChange,
}: {
  label: string;
  itemFields: { key: string; label: string }[];
  value: HeaderLink[];
  onChange: (links: HeaderLink[]) => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [newLink, setNewLink] = useState<{
    text?: string;
    url?: string;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "destructive"
      | "link"
      | undefined;
  }>({
    text: "",
    url: "",
    variant: "link",
  });

  const handleAdd = () => {
    if (newLink.text && newLink.url) {
      onChange([...value, newLink]);
      setNewLink({ text: "", url: "", variant: "link" });
      setPopoverOpen(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>

        <Popover modal={true} open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" size="xs" className="">
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            }
          />
          <PopoverContent side="left" className="w-72 z-9">
            <div className="space-y-3">
              {itemFields.map((field, i) => {
                if (field.key === "variant") {
                  return (
                    <LinkVariantSelector
                      items={btnVariants}
                      value={newLink?.variant}
                      onChange={(v) => {
                        setNewLink({ ...newLink, variant: v as any });
                      }}
                      key={i}
                    />
                  );
                }

                return (
                  <div key={field.key} className="space-y-1">
                    <Label>{field.label}</Label>
                    <Input
                      value={newLink[field.key as keyof typeof newLink]}
                      onChange={(e) =>
                        setNewLink({
                          ...newLink,
                          [field.key]: e.target.value,
                        })
                      }
                      placeholder={field.label}
                    />
                  </div>
                );
              })}
              <Button onClick={handleAdd} className="w-full">
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        {value.map((link, index) => (
          <div key={index} className="flex items-center gap-2">
            <Button
              variant={"outline"}
              size={"icon-sm"}
              className="flex-1 text-sm"
            >
              {link.text}
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              className="text-destructive"
              onClick={() => handleRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListComponent({
  label,
  linksItemFields,
  sectionId,
  layout,
}: {
  label: string;
  linksItemFields: { key: string; label: string }[];
  sectionId: string;
  layout: LayoutSettingsUI | undefined;
}) {
  const [listText, setListText] = useState("");
  const [listLinks, setListLinks] = useState<HeaderLink[]>([]);
  const { settings, updateSettings } = useNotionSettingsStore((s) => s);

  const getList = (
    currentSection: LayoutHeaderUI | undefined,
    links: HeaderLink[],
  ) => {
    let list = [
      ...((currentSection?.list as []) ?? []),
      { text: listText, links: links },
    ];

    if (currentSection?.list && currentSection?.list?.length) {
      const exitingListItem = currentSection?.list?.find(
        (l) => l.text === listText,
      );
      if (!exitingListItem) return list;

      list = [
        ...(currentSection.list.filter((l) => l.text !== listText) as {
          text: string;
          links: HeaderLink[];
        }[]),
        { text: listText, links: links },
      ];
    }

    return list;
  };

  const handleAddList = (links: HeaderLink[]) => {
    const currentLayout = settings?.layout || {};
    const currentSection = currentLayout?.[
      sectionId as keyof LayoutSettingsUI
    ] as LayoutHeaderUI | undefined;

    const list = getList(currentSection, links);

    updateSettings({
      ...settings,
      layout: {
        ...currentLayout,
        [sectionId]: {
          ...currentSection,
          list,
        },
      },
    });

    setListLinks([]);
  };

  const currentListData = useMemo(() => {
    const sectionWithList = layout?.[
      sectionId as keyof LayoutSettingsUI
    ] as LayoutHeaderUI;

    return sectionWithList;
  }, [layout]);

  const setCurrentListLink = useCallback(() => {
    const sectionWithList = layout?.[
      sectionId as keyof LayoutSettingsUI
    ] as LayoutHeaderUI;

    if (!sectionWithList?.list) return;

    const links = sectionWithList?.list?.find(
      (l) => l.text === listText,
    )?.links;
    setListLinks(links || []);
  }, [layout, listText]);

  return (
    <div className="space-y-3  rounded-md border-muted-foreground border-2 border-dashed p-4">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {currentListData &&
          currentListData?.list &&
          currentListData?.list?.length > 0 &&
          currentListData?.list?.map((v) => {
            return (
              <Button
                onClick={() => {
                  setListText(v?.text || "");
                  setCurrentListLink();
                }}
                variant={"outline"}
                size={"xs"}
              >
                {v?.text}
              </Button>
            );
          })}

        <Input
          placeholder="List text"
          value={listText}
          onChange={(e) => setListText(e.currentTarget.value)}
        />
      </div>
      <LinksComponent
        label="List Links"
        itemFields={linksItemFields}
        value={listLinks}
        onChange={(links) => {
          setListLinks(links);
        }}
      />

      <div className="w-full ">
        <Button
          className={"w-full"}
          size={"sm"}
          onClick={() => handleAddList(listLinks)}
        >
          Add List
        </Button>
      </div>
    </div>
  );
}

export function TabLayout({ sections }: TabLayoutProps) {
  const { settings, updateSettings } = useNotionSettingsStore();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handleFieldChange = (
    sectionId: keyof LayoutSettingsUI,
    fieldKey: string,
    fieldValue: string | number | undefined,
  ) => {
    const currentLayoutSettings = settings?.layout;
    const currentSection = currentLayoutSettings?.[sectionId] as
      | Record<string, unknown>
      | undefined;
    updateSettings({
      ...settings,
      layout: {
        ...currentLayoutSettings,
        [sectionId]: {
          ...currentSection,
          [fieldKey]: fieldValue,
        },
      },
    });
  };

  const handleLinksChange = (
    sectionId: keyof LayoutSettingsUI,
    links: HeaderLink[],
  ) => {
    const currentLayoutSettings = settings?.layout;
    const currentSection = currentLayoutSettings?.[sectionId] as
      | Record<string, unknown>
      | undefined;
    updateSettings({
      ...settings,
      layout: {
        ...currentLayoutSettings,
        [sectionId]: {
          ...currentSection,
          links,
        },
      },
    });
  };

  const handleHeightChange = (sectionId: any, h?: number) => {
    const sectionData = settings?.layout?.[sectionId as keyof LayoutSettingsUI];
    updateSettings({
      ...settings,
      layout: {
        ...settings?.layout,
        [sectionId]: { ...sectionData, height: h },
      },
    });
  };

  const handleWidthChange = (sectionId: any, w?: number) => {
    const sectionData = settings.layout?.[sectionId as keyof LayoutSettingsUI];
    updateSettings({
      ...settings,
      layout: {
        ...settings?.layout,
        [sectionId]: { ...sectionData, width: w },
      },
    });
  };

  return (
    <div className="space-y-4">
      {sections?.map((section) => {
        const sectionData = settings?.layout?.[section.id] as any;

        return (
          <Collapsible
            key={section.id}
            open={openSections.includes(section.id)}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  className="w-full justify-between font-medium"
                >
                  {section.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openSections.includes(section.id) && "rotate-180",
                    )}
                  />
                </Button>
              }
            />

            <CollapsibleContent className="bg-muted px-4 mt-2  rounded-md  space-y-4 py-4">
              {section.fields.map((field) => {
                if (field.type === "number") {
                  const currentValue = sectionData?.[field.key];
                  const displayValue = currentValue ?? field.min ?? 0;

                  return (
                    <SliderInput
                      key={field.key}
                      label={field.label}
                      value={displayValue}
                      onChange={(v) =>
                        handleFieldChange(section.id, field.key, v)
                      }
                      min={field.min ?? 0}
                      max={field.max ?? 100}
                      step={field.step ?? 1}
                    />
                  );
                }
                return (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {field.label}
                    </Label>
                    <Input
                      value={sectionData?.[field.key] ?? ""}
                      onChange={(e) =>
                        handleFieldChange(section.id, field.key, e.target.value)
                      }
                      placeholder={field.label}
                    />
                  </div>
                );
              })}

              {section.links && (
                <LinksComponent
                  label={section.links.label}
                  itemFields={section.links.itemFields}
                  value={(sectionData?.links as HeaderLink[]) ?? []}
                  onChange={(links) => handleLinksChange(section.id, links)}
                />
              )}

              {section.list && (
                <ListComponent
                  label={section.list.label}
                  layout={settings?.layout}
                  sectionId={section?.id}
                  linksItemFields={
                    section.list.itemFields.find((f) => f.type === "links")
                      ? [
                          { key: "text", label: "Link Text" },
                          { key: "url", label: "URL" },
                        ]
                      : []
                  }
                />
              )}

              {section?.height && (
                <SliderInput
                  label={section.height.label}
                  value={sectionData?.[section.height.key] || 45}
                  onChange={(v) => handleHeightChange(section.id, v)}
                  max={100}
                  min={0}
                />
              )}

              {section.width && (
                <SliderInput
                  label={section.width.label}
                  value={sectionData[section.width.key] || 100}
                  onChange={(v) => handleWidthChange(section.id, v)}
                  max={100}
                  min={0}
                />
              )}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

function LinkVariantSelector({
  value,
  onChange,
  items,
}: {
  value?: string;
  onChange?: (value: string) => void;
  items?: {
    label: string;
    value: string;
  }[];
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange?.(v || "link")}
      items={items}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={"z-99999"}>
        <SelectGroup>
          <SelectLabel>Variants</SelectLabel>
          {items &&
            items?.length > 0 &&
            items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
