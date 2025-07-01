"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon } from '@/types/pokemon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPokemonId, getPokemonTypeClasses, capitalize } from '@/lib/pokemon-utils';
import { cn } from '@/lib/utils';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const primaryType = pokemon.types[0].type.name;
  const typeClasses = getPokemonTypeClasses(primaryType);

  return (
    <Link href={`/pokemon/${pokemon.id}`} className="outline-none group" aria-label={`View details for ${capitalize(pokemon.name)}`}>
      <Card className="relative overflow-hidden rounded-none border-2 border-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0_hsl(var(--foreground))] group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 bg-card">
        <CardContent className="p-0 text-center">
          <div className={cn("p-4 transition-colors border-b-2 border-foreground", typeClasses)}>
            <div className="relative aspect-square w-full">
              <Image
                src={pokemon.sprites.other['official-artwork'].front_default || `https://placehold.co/256x256.png`}
                alt={pokemon.name}
                fill
                className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                data-ai-hint="pokemon character"
              />
            </div>
          </div>
          <div className="p-2 sm:p-4 bg-card text-center">
            <p className="text-xs font-semibold text-muted-foreground">{formatPokemonId(pokemon.id)}</p>
            <h3 className="text-sm sm:text-base font-bold font-headline capitalize truncate">{capitalize(pokemon.name)}</h3>
            <div className="flex justify-center gap-1 sm:gap-2 mt-2">
              {pokemon.types.map(({ type }) => (
                <Badge key={type.name} variant="outline" className="capitalize text-[10px] px-1.5 py-0.5 border-2 border-foreground">
                  {type.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PokemonCardSkeleton() {
  return (
    <Card className="rounded-none border-2 border-foreground">
      <CardContent className="p-0">
        <div className="bg-muted p-4 border-b-2 border-foreground">
          <Skeleton className="aspect-square w-full rounded-none" />
        </div>
        <div className="p-4 bg-card">
          <Skeleton className="h-4 w-1/4 mx-auto rounded-none" />
          <Skeleton className="h-6 w-3/4 mx-auto mt-2 rounded-none" />
          <div className="flex justify-center gap-2 mt-2">
            <Skeleton className="h-6 w-16 rounded-none" />
            <Skeleton className="h-6 w-16 rounded-none" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
