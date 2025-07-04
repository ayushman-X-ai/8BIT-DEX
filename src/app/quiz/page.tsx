import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PokemonListResult } from '@/types/pokemon';
import QuizClient from '@/components/quiz/quiz-client';

const QuizIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
        {/* Bulb part */}
        <path fill="hsl(var(--accent))" d="M10 6h4v1h-4z M9 7h6v1H9z M8 8h8v4H8z M9 12h6v1H9z M10 13h4v1h-4z" />
        {/* Base part */}
        <path fill="hsl(var(--foreground))" d="M10 14h4v1h-4z M9 15h6v1H9z M10 16h4v1h-4z" />
    </svg>
);

async function getPokemonList(): Promise<PokemonListResult[]> {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
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
                <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] items-center">
                    <div className="flex justify-start">
                        <Link href="/" aria-label="Back to 8BitDex">
                            <Button variant="outline" size="xs" className="border-2 border-foreground">
                            <ArrowLeft />
                            <span className="hidden sm:inline">Back</span>
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-primary font-headline">
                        <QuizIcon className="h-5 w-5" />
                        Quiz-Dex
                    </div>
                    <div />
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
        <div className="container mx-auto grid grid-cols-[auto_1fr_auto] items-center">
            <div className="flex justify-start">
                <Link href="/" aria-label="Back to 8BitDex">
                    <Button variant="outline" size="xs" className="border-2 border-foreground">
                    <ArrowLeft />
                    <span className="hidden sm:inline">Back</span>
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-center gap-3 text-foreground font-headline">
                <QuizIcon className="h-5 w-5" />
                <h1 className="text-sm sm:text-base">Quiz-Dex</h1>
            </div>
            <div />
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <QuizClient allPokemon={pokemonList} />
      </main>
    </div>
  );
}
