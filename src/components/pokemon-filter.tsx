"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/pokemon-utils";

const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
  "dragon", "dark", "steel", "fairy",
];

interface PokemonFilterProps {
  selectedTypes: string[];
  onSelectedTypesChange: (types: string[]) => void;
}

export function PokemonFilter({
  selectedTypes,
  onSelectedTypesChange,
}: PokemonFilterProps) {
  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      onSelectedTypesChange([...selectedTypes, type]);
    } else {
      onSelectedTypesChange(selectedTypes.filter((t) => t !== type));
    }
  };

  const clearFilters = () => {
    onSelectedTypesChange([]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-2 border-foreground text-xs sm:text-sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {selectedTypes.length > 0 && (
            <>
                <Separator orientation="vertical" className="h-4 mx-2 bg-foreground" />
                <Badge variant="secondary" className="border-2 border-foreground">{selectedTypes.length}</Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-2 border-foreground bg-popover">
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-medium leading-none uppercase text-xs">Filter by Type</h4>
                {selectedTypes.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-auto py-1 px-2">
                        Clear
                    </Button>
                )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-64 overflow-y-auto pr-2">
            {POKEMON_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                  className="border-2 border-foreground"
                />
                <Label
                  htmlFor={type}
                  className="w-full font-normal cursor-pointer text-xs uppercase"
                >
                  {capitalize(type)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
