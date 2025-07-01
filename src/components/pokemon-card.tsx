"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon } from '@/types/pokemon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPokemonId, getPokemonTypeClasses, capitalize } from '@/lib/pokemon-utils';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const primaryType = pokemon.types[0].type.name;
  const typeClasses = getPokemonTypeClasses(primaryType);

  return (
    <Link href={`/pokemon/${pokemon.id}`} className="outline-none group" aria-label={`View details for ${capitalize(pokemon.name)}`}>
      <Card className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
        <CardContent className="p-0 text-center">
          <div className={`p-4 ${typeClasses} transition-colors`}>
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
          <div className="p-4 bg-card">
            <p className="text-sm font-semibold text-muted-foreground">{formatPokemonId(pokemon.id)}</p>
            <h3 className="text-xl font-bold font-headline capitalize">{capitalize(pokemon.name)}</h3>
            <div className="flex justify-center gap-2 mt-2">
              {pokemon.types.map(({ type }) => (
                <Badge key={type.name} variant="outline" className="capitalize">
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
    <Card className="overflow-hidden rounded-lg shadow-lg">
      <CardContent className="p-0">
        <div className="bg-gray-200 dark:bg-gray-700 p-4">
          <Skeleton className="aspect-square w-full rounded-md" />
        </div>
        <div className="p-4 bg-card">
          <Skeleton className="h-4 w-1/4 mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto mt-2" />
          <div className="flex justify-center gap-2 mt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
