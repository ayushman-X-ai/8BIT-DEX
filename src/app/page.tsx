'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Camera } from 'lucide-react';
import { PokemonGrid } from '@/components/pokemon-grid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { PokemonFilter } from '@/components/pokemon-filter';

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    {/* Body */}
    <path fill="hsl(var(--primary))" d="M5 3h14v1h1v16h-1v1H5v-1H4V4h1V3z" />
    {/* Inner body fill */}
    <path fill="hsl(var(--primary))" d="M5 4h14v16H5z" />
    {/* Screen Bezel */}
    <path fill="hsl(var(--foreground))" d="M7 6h10v9H7z" />
    {/* Screen */}
    <path fill="hsl(var(--background))" d="M8 7h8v7H8z" />
    {/* Green light on screen */}
    <path fill="lime" d="M9 8h1v1H9z" />
    {/* D-Pad */}
    <path fill="hsl(var(--foreground))" d="M8 17h3v1H8zm1-1h1v3H9z" />
    {/* A and B buttons */}
    <path fill="hsl(var(--foreground))" d="M14 16h2v2h-2zm-2 2h2v2h-2z" />
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
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground uppercase tracking-wider">
              8BitDex
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/snap" aria-label="Snap to Identify Pokémon">
              <Button variant="outline" size="icon" className="border-2 border-foreground">
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
    </div>
  );
}
