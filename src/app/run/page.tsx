'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DexRunPage() {
    return (
        <div className="bg-background min-h-screen flex flex-col">
            <header className="py-4 px-4 md:px-8 border-b-4 border-foreground sticky top-0 z-10 bg-background">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="outline" size="xs" className="border-2 border-foreground">
                            <ArrowLeft />
                            Back
                        </Button>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex-grow container mx-auto py-8 px-4 md:px-8 flex flex-col items-center justify-center text-center">
                <Construction className="w-24 h-24 text-accent mb-6" />
                <h1 className="text-3xl font-bold font-headline text-foreground uppercase tracking-wider">
                    Coming Soon!
                </h1>
                <p className="mt-4 max-w-md text-muted-foreground">
                    This feature is currently under construction. We're working hard to bring you a new and exciting experience. Check back later!
                </p>
            </main>
            <footer className="text-center py-4 text-xs text-muted-foreground font-code">
                Made By Ayushman
            </footer>
        </div>
    );
}
