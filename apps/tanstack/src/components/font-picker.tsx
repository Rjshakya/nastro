import React, { useState, useEffect, useRef, type FC } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { loadFont } from "@/lib/fonts";
import useSWR from "swr";
import { Env } from "env";

// --- Types ---

interface GoogleFont {
  family: string;
  category: string;
}

interface GoogleFontsResponse {
  items: GoogleFont[];
}

interface FontPickerProps {
  value: string;
  onChange: (fontFamily: string) => void;
  apiKey?: string;
}

interface VirtualizedCommandBoxProps {
  options: GoogleFont[];
  placeholder: string;
  selectedOption: string;
  onSelectOption?: (option: string) => void;
  height: string;
}

// --- Component ---
const fetcher = (key: string) =>
  fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${key}`,
  )
    .then((r) => r.json() as Promise<GoogleFontsResponse>)
    .then((d) => d.items)
    .catch((err) => console.error("Error fetching fonts:", err));

export const VirtualizedCommandBox = ({
  options,
  selectedOption,
  onSelectOption,
  height,
}: VirtualizedCommandBoxProps) => {
  const [filteredOptions, setFilteredOptions] = useState<GoogleFont[]>(options);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = useState(false);

  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const scrollToIndex = (index: number) => {
    virtualizer.scrollToIndex(index, {
      align: "center",
    });
  };

  const handleSearch = (search: string) => {
    setIsKeyboardNavActive(false);
    setFilteredOptions(
      options.filter((option) =>
        option.family.toLowerCase().includes(search.toLowerCase() ?? []),
      ),
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          const newIndex =
            prev === -1 ? 0 : Math.min(prev + 1, filteredOptions.length - 1);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          const newIndex =
            prev === -1 ? filteredOptions.length - 1 : Math.max(prev - 1, 0);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (filteredOptions[focusedIndex]) {
          onSelectOption?.(filteredOptions[focusedIndex].family);
        }
        break;
      }
      default:
        break;
    }
  };

  React.useEffect(() => {
    if (selectedOption) {
      const option = filteredOptions.find(
        (option) => option.family === selectedOption,
      );
      if (option) {
        const index = filteredOptions.indexOf(option);
        setFocusedIndex(index);
        virtualizer.scrollToIndex(index, {
          align: "center",
        });
      }
    }
  }, [selectedOption, filteredOptions, virtualizer]);

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput onValueChange={handleSearch} />
      <CommandList
        ref={parentRef}
        style={{
          height: height,
          width: "100%",
          overflow: "auto",
        }}
        onMouseDown={() => setIsKeyboardNavActive(false)}
        onMouseMove={() => setIsKeyboardNavActive(false)}
      >
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualOptions.map((virtualOption) => {
              const font = filteredOptions[virtualOption.index].family;
              loadFont(font);
              return (
                <CommandItem
                  key={font}
                  disabled={isKeyboardNavActive}
                  className={cn(
                    "data-selected:bg-transparent",
                    "absolute left-0 top-0 w-full bg-transparent",
                    isKeyboardNavActive &&
                      focusedIndex !== virtualOption.index &&
                      "aria-selected:bg-transparent aria-selected:text-primary",
                  )}
                  style={{
                    height: `${virtualOption.size}px`,
                    transform: `translateY(${virtualOption.start}px)`,
                    fontFamily: font && `${font}`,
                  }}
                  value={font}
                  onMouseEnter={() =>
                    !isKeyboardNavActive && setFocusedIndex(virtualOption.index)
                  }
                  onMouseLeave={() =>
                    !isKeyboardNavActive && setFocusedIndex(-1)
                  }
                  onSelect={() => {
                    onSelectOption?.(font);
                    loadFont(font);
                    // setFocusedIndex(-1);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedOption ===
                        filteredOptions[virtualOption.index].family
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {filteredOptions[virtualOption.index].family}
                </CommandItem>
              );
            })}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export const FontPicker: FC<FontPickerProps> = ({ onChange, value }) => {
  const [open, setOpen] = useState(false);
  const { data, error } = useSWR(Env.googleFontApiKey, fetcher);
  const [popoverWidth, setPopoverWidth] = useState(0);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!triggerBtnRef.current) return;
    const width = triggerBtnRef.current.getBoundingClientRect().width;
    setPopoverWidth(width);
  }, [triggerBtnRef.current]);

  if (error) return null;
  if (!data) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            ref={triggerBtnRef}
            variant="outline"
            role="combobox"
            className="justify-between w-full"
          >
            {value}
            <ChevronsUpDown className="ml-auto" />
          </Button>
        }
      />
      <PopoverContent style={{ width: `${popoverWidth}px` }} className=" p-0">
        <VirtualizedCommandBox
          height={"400px"}
          options={data}
          placeholder={"fonts"}
          selectedOption={value}
          onSelectOption={onChange}
        />
      </PopoverContent>
    </Popover>
  );
};
