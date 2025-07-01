'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { PokemonGrid } from '@/components/pokemon-grid';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { PokemonFilter } from '@/components/pokemon-filter';

const PixelPokeballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      {...props}
    >
        {/* Outer Black shell */}
        <path fill="hsl(var(--foreground))" d="M9 2h6v1h2v1h1v1h1v2h1v6h-1v2h-1v1h-1v1h-2v1H9v-1H7v-1H6v-1H5v-2H4V8h1V6h1V5h2V4h1V3z" />
        {/* Red Top */}
        <path fill="hsl(var(--primary))" d="M9 4h6v1h1v1h1v3H7V6h1V5h1V4z" />
        {/* White Bottom */}
        <path fill="#FFF" d="M7 13h10v1h1v1h-1v1h-1v1H8v-1H7v-1H6v-1h1v-1z" />
        {/* Separator Line */}
        <path fill="hsl(var(--foreground))" d="M5 11h14v2H5z" />
        {/* Button */}
        <path fill="hsl(var(--foreground))" d="M9 10h6v4H9z" />
        <path fill="#FFF" d="M10 11h4v2h-4z" />
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
            <PixelPokeballIcon className="text-primary h-8 w-8" />
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground uppercase tracking-wider">
              PokéDex
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
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
        <PokemonGrid searchQuery={searchQuery} selectedTypes={selectedTypes} />
      </main>
    </div>
  );
}
