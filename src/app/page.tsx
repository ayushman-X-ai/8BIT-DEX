'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Camera, Gamepad2, BrainCircuit } from 'lucide-react';
import { PokemonGrid } from '@/components/pokemon-grid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { PokemonFilter } from '@/components/pokemon-filter';

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
        {/* Motion lines */}
        <path fill="hsl(var(--accent))" d="M2 8h4v2H2z M3 11h4v2H3z" />

        {/* Main Pokeball Body */}
        {/* Outline */}
        <path fill="hsl(var(--foreground))" d="M12 6h8v1h-8z M10 7h2v1h-2z M20 7h1v1h-1z M9 8h1v1H9z M21 8h1v6h-1z M9 15h1v1H9z M20 15h1v1h-1z M10 16h2v1h-2z M12 17h8v1h-8z" />

        {/* Red Part */}
        <path fill="hsl(var(--primary))" d="M12 7h8v1h-8z M10 8h11v1H10z M10 9h11v2H10z" />
        
        {/* White Part */}
        <path fill="hsl(var(--card))" d="M10 13h11v2H10z M10 15h10v1H10z M12 16h8v1h-8z" />
        
        {/* Center Band */}
        <path fill="hsl(var(--foreground))" d="M9 11h13v2H9z" />
        
        {/* Center Button */}
        <path fill="hsl(var(--card))" d="M14 11h3v2h-3z" />
        <path fill="hsl(var(--foreground))" d="M15 11.5h1v1h-1z" />
    </svg>
);


export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);

  return (
    <div className="bg-background min-h-screen">
      <header className="py-4 px-4 md:px-8 border-b-4 border-foreground sticky top-0 z-10 bg-background">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <LogoIcon className="h-8 w-8" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-headline text-foreground uppercase tracking-normal sm:tracking-wider">
              8BitDex
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/run" aria-label="Play Dex Arcade">
              <Button variant="outline" size="icon" className="border-2 border-foreground h-8 w-8 sm:h-10 sm:w-10">
                  <Gamepad2 className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/quiz" aria-label="Play Quiz-Dex">
              <Button variant="outline" size="icon" className="border-2 border-foreground h-8 w-8 sm:h-10 sm:w-10">
                  <BrainCircuit className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/snap" aria-label="Snap to Identify Pokémon">
              <Button variant="outline" size="icon" className="border-2 border-foreground h-8 w-8 sm:h-10 sm:w-10">
                  <Camera className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8 bg-card border-2 border-foreground">
          <div className="p-2 border-b-2 border-foreground">
            <h2 className="font-bold uppercase text-xs sm:text-sm text-center">Control Panel</h2>
          </div>
          <div className="p-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or ID..."
                className="w-full pl-9 border-2 border-foreground bg-input text-xs sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <PokemonFilter
              selectedTypes={selectedTypes}
              onSelectedTypesChange={setSelectedTypes}
            />
          </div>
        </div>
        <PokemonGrid searchQuery={searchQuery} selectedTypes={selectedTypes} />
      </main>
      <footer className="text-center py-4 text-xs text-muted-foreground font-code">
        Made By Ayushman
      </footer>
    </div>
  );
}
