'use client';

import React from 'react';
import Image from 'next/image';
import { Swords, Heart } from 'lucide-react';
import type { CardData, ElementType } from '@/types/card-game';
import { cn } from '@/lib/utils';
import { POKEMON_TYPE_COLORS } from '@/lib/pokemon-utils';

interface CardDisplayProps {
  card: CardData | null;
  isPlayer?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  isFlipped?: boolean;
  isAttacking?: boolean;
  isDefending?: boolean;
}

const getElementBorderColor = (type: ElementType): string => {
  const colorClass = POKEMON_TYPE_COLORS[type] || POKEMON_TYPE_COLORS['neutral'];
  // e.g., "bg-red-500" -> "border-red-500"
  return colorClass.replace('bg-', 'border-');
};

export default function CardDisplay({ card, isPlayer, isActive, onClick, isFlipped, isAttacking, isDefending }: CardDisplayProps) {

  if (isFlipped || !card) {
    return (
      <div className="w-28 h-40 sm:w-40 sm:h-56 bg-card border-2 border-foreground p-1 flex items-center justify-center">
        <div className="w-full h-full border-2 border-dashed border-muted-foreground/50" />
      </div>
    );
  }
  
  const healthPercentage = (card.hp / card.maxHp) * 100;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-28 h-40 sm:w-40 sm:h-56 bg-card border-2 border-foreground p-1.5 text-center text-xs transition-all duration-300",
        onClick && "cursor-pointer hover:-translate-y-2 hover:shadow-pixel",
        isActive && "shadow-pixel-sm",
        getElementBorderColor(card.elementType),
        isAttacking && "animate-[shake_0.5s_ease-in-out]",
        isDefending && "animate-[flash_0.5s_ease-in-out]"
      )}
      style={{
        animationIterationCount: 1,
      } as React.CSSProperties}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-2 border-2 border-foreground text-xs font-bold font-headline uppercase whitespace-nowrap">
        {card.name}
      </div>
      <div className="relative w-full h-20 sm:h-28 mt-2 bg-muted border border-foreground overflow-hidden">
        <Image src={card.imageUrl} alt={card.name} layout="fill" objectFit="contain" data-ai-hint={card.imageHint}/>
      </div>

      <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between gap-1 text-xs">
              <Heart className="w-4 h-4 text-primary" />
              <div className="w-full h-3 border border-foreground bg-black/20 p-px">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${healthPercentage}%`}} />
              </div>
              <span className="font-bold w-8">{card.hp}</span>
          </div>
          <div className="flex items-center justify-between gap-1 text-xs">
              <Swords className="w-4 h-4 text-accent" />
              <p className="flex-grow text-left font-semibold">{card.attack} ATK / {card.elementType}</p>
          </div>
      </div>
    </div>
  );
}
