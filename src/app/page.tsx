'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { PokemonGrid } from '@/components/pokemon-grid';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';

const PokeballIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <path d="M12 21a9 9 0 0 0 9-9" />
    <path d="M12 3a9 9 0 0 0-9 9" />
    <path d="M12 21a2.5 2.5 0 0 0 0-5" />
    <path d="M12 3a2.5 2.5 0 0 1 0 5" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="bg-background min-h-screen">
      <header className="py-6 px-4 md:px-8 border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <PokeballIcon className="text-accent h-8 w-8" />
            <h1 className="text-3xl font-bold font-headline text-foreground">
              Kanto Dex
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Pokémon by name or ID..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <PokemonGrid searchQuery={searchQuery} />
      </main>
    </div>
  );
}
