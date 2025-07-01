"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({ className }: { className?: string }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("text-white hover:bg-white/20", className)}
      onClick={() => setIsFavorite((prev) => !prev)}
      aria-label="Toggle Favorite"
    >
      <Heart
        className={cn(
          "transition-colors",
          isFavorite ? "fill-white" : "fill-transparent"
        )}
      />
    </Button>
  );
}
