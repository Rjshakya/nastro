import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { SliderInput } from "#/components/ui/slider-input";
import { cn, getEntries } from "#/lib/utils";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type {
  HeaderLink,
  HeaderList,
  LayoutCardUI,
  LayoutGalleryUI,
  LayoutHeaderUI,
  LayoutSettingsUI,
  LayoutTabsUI,
} from "#/types/notion-page-settings";
import { IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

export const TabLayout = ({ layout }: { layout: LayoutSettingsUI }) => {
  return (
    <div className="grid gap-4">
      {getEntries(layout).map(([k, v]) => {
        if (!v || k === "type") {
          return null;
        }

        return (
          <Collapsible>
            <CollapsibleTrigger
              render={
                <Button className="w-full flex items-center justify-between" variant="ghost">
                  <span className="capitalize">{k}</span>
                  <IconChevronDown className="h-4 w-4 transition-transform" />
                </Button>
              }
            />
            <CollapsibleContent className=" shadow-sm ring-2 ring-input px-4 mt-2 rounded-md">
              <RenderLayoutSections section={v} sectionKey={k} />
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

const RenderLayoutSections = ({
  sectionKey,
  section,
}: {
  sectionKey: keyof LayoutSettingsUI;
  section: LayoutSettingsUI[keyof LayoutSettingsUI];
}) => {
  const { settings, updateSettings } = useNotionSettingsStore();

  const updateLayout = (key: keyof LayoutSettingsUI, value: unknown) => {
    updateSettings({
      ...settings,
      layout: {
        ...settings.layout,
        [key]: value,
        type: "layout",
      },
    });
  };

  if (!section || sectionKey === "type") {
    return null;
  }

  if (sectionKey === "header" || sectionKey === "sidebar" || sectionKey === "footer") {
    return (
      <HeaderLayoutSection
        section={section as LayoutHeaderUI}
        onChange={(value) => updateLayout("header", value)}
        showLists={sectionKey === "header"}
      />
    );
  }

  if (sectionKey === "card") {
    return (
      <CardSection
        card={section as LayoutCardUI}
        onChange={(value) => updateLayout("card", value)}
      />
    );
  }

  if (sectionKey === "gallery") {
    return (
      <GallerySection
        gallery={section as LayoutGalleryUI}
        onChange={(value) => updateLayout("gallery", value)}
      />
    );
  }

  if (sectionKey === "tabs") {
    return (
      <TabsSection
        tabs={section as LayoutTabsUI}
        onChange={(value) => updateLayout("tabs", value)}
      />
    );
  }

  return null;
};

const HeaderLayoutSection = ({
  section,
  onChange,
  showLists = true,
}: {
  section?: LayoutHeaderUI;
  onChange: (value: LayoutHeaderUI) => void;
  showLists?: boolean;
}) => {
  if (!section) return null;

  const handleDeleteList = (index: number, list?: HeaderList[]) => {
    const l = [...(list || [])];
    l.splice(index, 1);
    const updated = { ...section, lists: l };
    onChange(updated);
  };

  const handleDeleteLinks = (index: number, links?: HeaderLink[]) => {
    const l = [...(links || [])];
    l.splice(index, 1);

    const updated = { ...section, links: l };
    onChange(updated);
  };

  const LinksComp = ({
    links,
    onChange,
  }: {
    links?: HeaderLink[];
    onChange: (links: HeaderLink[]) => void;
  }) => {
    const [newLink, setNewLink] = useState<HeaderLink>({});

    const addLink = () => {
      if (!newLink.text || !newLink.url) return;
      onChange([...(links || []), newLink]);
      setNewLink({});
    };

    const removeLink = (index: number) => {
      const updated = [...(links || [])];
      updated.splice(index, 1);
      onChange(updated);
    };

    return (
      <div className="space-y-2">
        {/* Add new link */}
        <Popover>
          <PopoverTrigger>
            <Button variant="outline" size="xs" className="w-full">
              <IconPlus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </PopoverTrigger>
          <PopoverContent side="left" className="p-3">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Text</Label>
                <Input
                  value={newLink.text || ""}
                  onChange={(e) => setNewLink({ ...newLink, text: e.target.value })}
                  placeholder="Pricing"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={newLink.url || ""}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://..."
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Variant</Label>
                <Select
                  value={newLink.variant || "default"}
                  onValueChange={(value) =>
                    setNewLink({
                      ...newLink,
                      variant: value as HeaderLink["variant"],
                    })
                  }
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="left">
                    {["default", "outline", "secondary", "ghost", "destructive", "link"].map(
                      (variant) => (
                        <SelectItem key={variant} value={variant}>
                          {variant}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addLink} className="w-full">
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const ListsComp = ({
    lists,
    onChange,
  }: {
    lists?: HeaderList[];
    onChange: (lists: HeaderList[]) => void;
  }) => {
    const [newList, setNewList] = useState<HeaderList>({});
    const [isOpen, setIsOpen] = useState(false);

    const addList = () => {
      if (!newList.text) return;
      onChange([...(lists || []), newList]);
      setNewList({});
      setIsOpen(false);
    };

    const updateList = (index: number, updatedList: HeaderList) => {
      const updated = [...(lists || [])];
      updated[index] = updatedList;
      onChange(updated);
    };

    return (
      <div className="space-y-2">
        {/* Add new list */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger>
            <Button variant="outline" size="xs" className="w-full">
              <IconPlus className="h-4 w-4 mr-2" />
              Add List
            </Button>
          </PopoverTrigger>
          <PopoverContent side="left" className="">
            <div className="space-y-4">
              <div className="grid gap-6">
                <div className="flex items-center justify-between gap-1">
                  <Label className="f">
                    <p>List Title</p>
                  </Label>
                  <LinksComp
                    links={newList.links}
                    onChange={(l) => setNewList({ ...newList, links: l })}
                  />
                </div>

                <div>
                  <Input
                    value={newList.text || ""}
                    onChange={(e) => setNewList({ ...newList, text: e.target.value })}
                    placeholder="Products"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div>
                {newList.links &&
                  newList.links.length > 0 &&
                  newList.links.map((l) => {
                    return <Badge>{l?.text}</Badge>;
                  })}
              </div>

              <Button size={"sm"} onClick={addList} className="w-full">
                Add List
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="space-y-4 py-4">
      {/* Text */}
      <div className="space-y-2">
        <Label className="capitalize">Text</Label>
        <Input
          value={section.text || ""}
          onChange={(e) =>
            onChange({
              ...section,
              text: e.target.value,
            })
          }
          placeholder="Header text"
        />
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <Label className="capitalize">Logo URL</Label>
        <Input
          value={section.logo || ""}
          onChange={(e) =>
            onChange({
              ...section,
              logo: e.target.value,
            })
          }
          placeholder="https://..."
        />
      </div>

      {/* Height */}
      <SliderInput
        label="Height"
        min={30}
        max={200}
        value={section.height || 60}
        onChange={(value) =>
          onChange({
            ...section,
            height: value,
          })
        }
      />

      {/* Width */}
      <SliderInput
        label="Width (%)"
        min={0}
        max={100}
        value={section.width || 100}
        onChange={(value) =>
          onChange({
            ...section,
            width: value,
          })
        }
      />

      {/* Links */}
      <div className="grid">
        <div className="flex items-center justify-between">
          <Label className="capitalize">Navigation Links</Label>
          <LinksComp
            links={section.links}
            onChange={(links) =>
              onChange({
                ...section,
                links,
              })
            }
          />
        </div>

        <div className="flex gap-1">
          {section?.links &&
            section.links.length > 0 &&
            section.links.map((l, i) => {
              return (
                <div className="flex items-center">
                  <Badge>{l.text}</Badge>
                  <Badge onClick={() => handleDeleteLinks(i, section?.links)}>
                    <IconTrash />
                  </Badge>
                </div>
              );
            })}
        </div>
      </div>

      {/* Lists (only for header/sidebar) */}
      {showLists && (
        <div className="grid gap-1">
          <div className="flex items-center justify-between gap-2">
            <Label className="capitalize">Dropdown Lists</Label>
            <ListsComp
              lists={section.lists}
              onChange={(lists) =>
                onChange({
                  ...section,
                  lists,
                })
              }
            />
          </div>

          <div>
            {section.lists &&
              section.lists.length > 0 &&
              section.lists.map((li, listIndex) => {
                if (li.links && li.links.length > 0) {
                  return (
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Badge>
                              <p>{li.text}</p>
                              <IconChevronDown />
                            </Badge>
                          }
                        />

                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            {li.links.map((l) => {
                              return (
                                <DropdownMenuItem className={"p-1"}>{l.text}</DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="">
                        <Badge onClick={() => handleDeleteList(listIndex, section?.lists)}>
                          <IconTrash />
                        </Badge>
                      </div>
                    </div>
                  );
                }

                return <Badge>{li.text}</Badge>;
              })}
          </div>
        </div>
      )}
    </div>
  );
};

const GallerySection = ({
  gallery,
  onChange,
}: {
  gallery?: LayoutGalleryUI;
  onChange: (value: LayoutGalleryUI) => void;
}) => {
  return (
    <div className="py-4">
      {getEntries(gallery as LayoutGalleryUI).map(([k, v]) => {
        if (typeof v === "number") {
          return (
            <SliderInput
              label="Grid Gap"
              min={0}
              max={50}
              value={gallery?.[k] || 16}
              onChange={(value) =>
                onChange({
                  ...gallery,
                  [k]: value,
                })
              }
            />
          );
        }
      })}
    </div>
  );
};

const CardSection = ({
  card,
  onChange,
}: {
  card?: LayoutCardUI;
  onChange: (value: LayoutCardUI) => void;
}) => {
  return (
    <div className="space-y-4 py-4">
      {getEntries(card as LayoutCardUI).map(([k, v]) => {
        if (typeof v === "number") {
          return (
            <SliderInput
              label={k}
              min={0}
              max={10}
              value={(card?.[k] as number) || 1}
              onChange={(value) =>
                onChange({
                  ...card,
                  [k]: value,
                })
              }
            />
          );
        }

        if (k === "cover" || k === "body") {
          return (
            <Collapsible>
              <CollapsibleTrigger
                render={
                  <Button
                    className="w-full flex items-center justify-between"
                    variant="ghost"
                    size="sm"
                  >
                    <span>{k} Settings</span>
                    <IconChevronDown className="h-4 w-4 transition-transform" />
                  </Button>
                }
              />
              <CollapsibleContent
                className={"shadow-sm ring-2 ring-input grid gap-4 px-4 py-6 rounded-md mt-4 mx-2"}
              >
                {getEntries(v as Record<string, number | undefined>).map(([s, sv]) => {
                  return (
                    <SliderInput
                      label={s}
                      min={0}
                      max={400}
                      // @ts-ignore
                      value={(card?.[k]?.[s] as any) || sv}
                      onChange={(value) =>
                        onChange({
                          ...card,
                          [k]: {
                            ...card?.[k],
                            [s]: value,
                          },
                        })
                      }
                    />
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        }

        return null;
      })}
    </div>
  );
};

const TabsSection = ({
  tabs,
  onChange,
}: {
  tabs?: LayoutTabsUI;
  onChange: (value: LayoutTabsUI) => void;
}) => {
  return (
    <div className="space-y-4 py-2">
      {/* Display */}
      <div className="flex items-center justify-between gap-2">
        <Label className="capitalize">Display</Label>
        <Select
          value={tabs?.display || "flex"}
          onValueChange={(value) =>
            onChange({
              ...tabs,
              display: value as "flex" | "none",
            })
          }
        >
          <SelectTrigger size="sm" className={"w-32 "}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={"w-32"}>
            <SelectItem value="flex">Show</SelectItem>
            <SelectItem value="none">Hide</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Background Color */}
      {/* <div className="space-y-2">
        <Label className="capitalize">Background Color</Label>
        <Input
          value={tabs?.backgroundColor || ""}
          onChange={(e) =>
            onChange({
              ...tabs,
              backgroundColor: e.target.value,
            })
          }
          placeholder="transparent"
        />
      </div> */}

      {/* Active Background Color */}
      {/* <div className="space-y-2">
        <Label className="capitalize">Active Background Color</Label>
        <Input
          value={tabs?.activeBackgroundColor || ""}
          onChange={(e) =>
            onChange({
              ...tabs,
              activeBackgroundColor: e.target.value,
            })
          }
          placeholder="var(--accent)"
        />
      </div> */}
    </div>
  );
};
