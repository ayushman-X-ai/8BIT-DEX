'use client';

import Link from 'next/link';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DexRunPage() {
    return (
        <div className="bg-background min-h-screen flex flex-col font-body" style={{
            backgroundImage: 'radial-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px)',
            backgroundSize: '15px 15px',
        }}>
            <header className="py-4 px-4 md:px-8 sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b-4 border-foreground">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="outline" size="xs" className="border-2 border-foreground">
                            <ArrowLeft />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 text-primary font-headline">
                        <Gamepad2 className="h-5 w-5" />
                        <h1 className="text-sm sm:text-lg tracking-wider">DEX BRAWL</h1>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                <div className="space-y-4">
                    <h2 className="text-3xl font-headline text-foreground">Coming Soon!</h2>
                    <p className="text-muted-foreground max-w-md">
                        This feature is under construction. Check back later for a new and exciting game!
                    </p>
                </div>
            </main>
        </div>
    );
}
