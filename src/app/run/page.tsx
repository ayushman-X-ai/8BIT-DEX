'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DexRunPage() {
    return (
        <div className="bg-gray-900 min-h-screen flex flex-col font-body" style={{
            backgroundImage: 'radial-gradient(hsl(0 0% 100% / 0.05) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
        }}>
            <header className="py-4 px-4 md:px-8 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b-2 border-slate-700">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="outline" size="xs" className="border-2 border-foreground bg-slate-800 hover:bg-slate-700">
                            <ArrowLeft />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 text-cyan-400 font-headline">
                        <Gamepad2 className="h-5 w-5" />
                        <h1 className="text-lg tracking-widest">DEX RUN</h1>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-headline text-cyan-400">Coming Soon!</h2>
                    <p className="mt-4 text-slate-400 font-code">A new adventure is being prepared.</p>
                </div>
            </main>
        </div>
    );
}
