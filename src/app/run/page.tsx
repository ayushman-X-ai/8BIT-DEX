'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RunPage() {
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
            <Gamepad2 className="h-5 w-5" />
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-headline text-foreground">Coming Soon!</h1>
        <p className="mt-4 text-muted-foreground">A new game is under construction.</p>
      </main>
    </div>
  );
}
