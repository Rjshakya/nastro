import { IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ApiKey } from "@/types/apikey";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiKeyItemProps {
  apiKey: ApiKey;
  newlyCreatedKey?: string | null;
  onDelete: (keyId: string) => void;
  onToggleEnabled: (keyId: string, enabled: boolean) => void;
}

export function ApiKeyItem({
  apiKey,
  onDelete,
  onToggleEnabled,
}: ApiKeyItemProps) {
  const [enabled, setEnabled] = useState(apiKey.enabled);

  return (
    <Item key={apiKey.id} className="rounded-xl hover:bg-accent">
      <ItemContent>
        <ItemTitle className="text-base ">{apiKey.name}</ItemTitle>
        <ItemDescription>
          permissions : {apiKey.permissions.join(",")}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Tooltip>
          <TooltipTrigger
            render={
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => {
                  onToggleEnabled(apiKey.id, checked);
                  setEnabled(!enabled);
                }}
              />
            }
          />
          <TooltipContent>
            <p>Enable/Disable Api key</p>
          </TooltipContent>
        </Tooltip>

        <Button
          size={"icon"}
          variant={"destructive"}
          onClick={() => onDelete(apiKey.id)}
        >
          <IconTrash />
        </Button>
      </ItemActions>
    </Item>
  );
}
