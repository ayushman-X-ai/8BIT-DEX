import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PokemonListResult } from '@/types/pokemon';
import QuizClient from '@/components/quiz/quiz-client';

async function getPokemonList(): Promise<PokemonListResult[]> {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        if (!res.ok) {
            throw new Error('Failed to fetch Pokémon list');
        }
        const data = await res.json();
        return data.results;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default async function QuizPage() {
  const pokemonList: PokemonListResult[] = await getPokemonList();

  if (pokemonList.length === 0) {
      return (
        <div className="bg-background min-h-screen flex flex-col font-body">
            <header className="py-2 px-4 md:px-8 sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b-4 border-foreground">
                <div className="container mx-auto flex items-center justify-between">
                <Link href="/" aria-label="Back to 8BitDex">
                    <Button variant="outline" size="xs" className="border-2 border-foreground">
                    <ArrowLeft />
                    Back
                    </Button>
                </Link>
                <div className="flex items-center gap-3 text-primary font-headline">
                    <BrainCircuit className="h-5 w-5" />
                    Quiz-Dex
                </div>
                </div>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-headline text-destructive">Error</h1>
                <p className="mt-4 text-muted-foreground">Could not load Pokémon data for the quiz. Please try again later.</p>
            </main>
        </div>
      )
  }

  return (
    <div className="bg-background min-h-screen flex flex-col font-body">
      <header className="py-2 px-4 md:px-8 sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b-4 border-foreground">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" aria-label="Back to 8BitDex">
            <Button variant="outline" size="xs" className="border-2 border-foreground">
              <ArrowLeft />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 text-foreground font-headline">
            <BrainCircuit className="h-5 w-5" />
            <h1 className="text-sm sm:text-base">Quiz-Dex</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-start p-4 text-center">
        <QuizClient allPokemon={pokemonList} />
      </main>
    </div>
  );
}
