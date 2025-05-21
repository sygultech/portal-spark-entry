import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Option {
  value: string;
  label: string;
}

interface CreatableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: Option[];
  onCreateOption: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function CreatableSelect({
  value,
  onValueChange,
  options = [],
  onCreateOption,
  placeholder = "Select an option",
  emptyText = "No options found.",
  className,
  disabled = false,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const safeOptions = React.useMemo(() => {
    const baseOptions = Array.isArray(options) ? options : [];
    if (!searchQuery) return baseOptions;
    
    return baseOptions.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectedOption = React.useMemo(() => 
    safeOptions.find((option) => option.value === value),
    [safeOptions, value]
  );

  const handleCreateOption = React.useCallback(() => {
    if (searchQuery) {
      onCreateOption(searchQuery);
      onValueChange(searchQuery);
      setSearchQuery("");
      setOpen(false);
    }
  }, [searchQuery, onCreateOption, onValueChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          <input
            className="flex h-10 w-full rounded-none border-0 border-b bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ScrollArea className="h-[200px]">
            {safeOptions.length === 0 ? (
              <div className="p-2">
                <p className="text-sm text-muted-foreground">{emptyText}</p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleCreateOption}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{searchQuery}"
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                {safeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className="relative flex w-full cursor-pointer select-none items-center rounded-none py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    onClick={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
} 
// force update

// force update
