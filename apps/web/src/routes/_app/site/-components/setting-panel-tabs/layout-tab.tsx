import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { LayoutConfig, NavConfig } from "@/types/site.setting";
import { IconPlus, IconTrash } from "@tabler/icons-react";

function NavLinkEditor({
  title,
  config,
  onChange,
}: {
  title: string;
  config?: NavConfig;
  onChange: (config: NavConfig) => void;
}) {
  const links = config?.links ?? {};

  const addLink = () => {
    const idx = Object.keys(links).length + 1;
    const newName = `Link ${idx}`;
    onChange({
      ...config,
      links: { ...links, [newName]: { url: "" } },
    });
  };

  const updateLink = (oldName: string, newName: string, url: string) => {
    if (!newName.trim()) return;
    const newLinks = { ...links };
    if (oldName !== newName) {
      delete newLinks[oldName];
    }
    newLinks[newName] = { url };
    onChange({ ...config, links: newLinks });
  };

  const removeLink = (name: string) => {
    const newLinks = { ...links };
    delete newLinks[name];
    onChange({ ...config, links: newLinks });
  };

  return (
    <div className="space-y-3 border rounded-md p-3">
      <Label>Text</Label>
      <Input
        value={config?.logo?.text ?? ""}
        onChange={(e) => {
          onChange({ ...config, logo: { text: e.currentTarget.value } });
        }}
      />
      <h4 className="text-sm font-medium">{title}</h4>
      <div className="space-y-2">
        {Object.entries(links).map(([name, link]) => (
          <div key={name} className="flex gap-2 items-center">
            <Input
              value={name}
              onChange={(e) => updateLink(name, e.target.value, link.url)}
              placeholder="Name"
              className="flex-1"
            />
            <Input
              value={link.url}
              onChange={(e) => updateLink(name, name, e.target.value)}
              placeholder="URL"
              className="flex-1"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeLink(name)}
              className="shrink-0"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={addLink} className="w-full">
        <IconPlus className="h-4 w-4 mr-1" />
        Add Link
      </Button>
    </div>
  );
}

export function LayoutTab() {
  const { settings, updateLayout } = useSiteSettingStore();
  const layout = settings.layout ?? {};

  const update = (partial: Partial<LayoutConfig>) => {
    updateLayout({ ...layout, ...partial });
  };

  return (
    <div className="grid gap-6 py-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="header" className="flex-1">
          Show Header
        </Label>
        <Checkbox
          id="header"
          checked={!!layout.header}
          onCheckedChange={(c) => update({ header: c as boolean })}
        />
      </div>

      {layout.header && (
        <NavLinkEditor
          title="Header Links"
          config={layout.headerConfig}
          onChange={(headerConfig) => update({ headerConfig })}
        />
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="footer" className="flex-1">
          Show Footer
        </Label>
        <Checkbox
          id="footer"
          checked={!!layout.footer}
          onCheckedChange={(c) => update({ footer: c as boolean })}
        />
      </div>

      {layout.footer && (
        <NavLinkEditor
          title="Footer Links"
          config={layout.footerConfig}
          onChange={(footerConfig) => update({ footerConfig })}
        />
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="sidebar" className="flex-1">
          Show Sidebar
        </Label>
        <Checkbox
          id="sidebar"
          checked={!!layout.sidebar}
          onCheckedChange={(c) => update({ sidebar: c as boolean })}
        />
      </div>
    </div>
  );
}
