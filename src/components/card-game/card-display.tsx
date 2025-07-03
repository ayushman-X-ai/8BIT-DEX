'use client';

import React from 'react';
import Image from 'next/image';
import { Swords, Heart } from 'lucide-react';
import type { CardData } from '@/types/card-game';
import { cn } from '@/lib/utils';
import { getPokemonTypeClasses, capitalize } from '@/lib/pokemon-utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CardDisplayProps {
  card: CardData | null;
  isPlayer?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  isFlipped?: boolean;
  isAttacking?: boolean;
  isDefending?: boolean;
}

export default function CardDisplay({ card, isPlayer, isActive, onClick, isFlipped, isAttacking, isDefending }: CardDisplayProps) {
  if (isFlipped || !card) {
    return (
      <div className="w-20 h-32 sm:w-24 sm:h-36 bg-card border-2 border-foreground p-1 flex items-center justify-center">
        <div className="w-full h-full border-2 border-dashed border-muted-foreground/50" />
      </div>
    );
  }

  const healthPercentage = (card.hp / card.maxHp) * 100;
  const typeClasses = getPokemonTypeClasses(card.elementType === 'neutral' ? 'normal' : card.elementType);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative w-20 h-32 sm:w-24 sm:h-36 rounded-none border-2 border-foreground transition-all duration-300 flex flex-col",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0_hsl(var(--foreground))]",
        isActive && "shadow-[2px_2px_0_hsl(var(--foreground))]",
        isAttacking && "animate-[shake_0.5s_ease-in-out]",
        isDefending && "animate-[flash_0.5s_ease-in-out]"
      )}
      style={{ animationIterationCount: 1 } as React.CSSProperties}
    >
      <CardContent className="p-0 text-center h-full flex flex-col">
        <div className={cn("p-1 transition-colors border-b-2 border-foreground", typeClasses)}>
          <div className="relative aspect-square w-full">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="object-contain drop-shadow-lg"
              sizes="(max-width: 768px) 25vw, 96px"
              data-ai-hint={card.imageHint}
            />
          </div>
        </div>
        <div className="p-1 bg-card text-center flex-grow flex flex-col justify-around">
          <h3 className="text-[9px] font-bold font-headline capitalize truncate">{capitalize(card.name)}</h3>
          
          <div className="space-y-0.5 text-[8px]">
            <div className="flex items-center justify-between gap-0.5">
                <Heart className="w-2 h-2 text-primary" />
                <div className="w-full h-1.5 border border-foreground bg-black/20 p-px">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${healthPercentage}%`}} />
                </div>
                <span className="font-bold w-4 text-right">{card.hp}</span>
            </div>
            <div className="flex items-center justify-between gap-0.5">
                <Swords className="w-2 h-2 text-accent" />
                <p className="flex-grow text-left font-semibold">{card.attack} ATK</p>
                <Badge variant="outline" className="capitalize text-[7px] px-0.5 py-0 border border-foreground">
                  {card.elementType}
                </Badge>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
