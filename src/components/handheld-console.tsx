'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Direction = 'up' | 'down' | 'left' | 'right';

interface HandheldConsoleProps {
    children: React.ReactNode;
    onDirectionalPad: (direction: Direction) => void;
    onAButton?: () => void;
    onBButton?: () => void;
    disabled?: boolean;
}

export function HandheldConsole({ children, onDirectionalPad, onAButton, onBButton, disabled = false }: HandheldConsoleProps) {
    const dPadButtonClasses = "bg-gray-800 active:bg-black text-gray-300 flex items-center justify-center transition-colors disabled:opacity-60 shadow-inner";
    const actionButtonClasses = "w-14 h-14 rounded-full bg-gray-700 border-2 border-gray-900 active:bg-gray-800 flex items-center justify-center font-bold text-lg text-white/80 shadow-md disabled:opacity-60";

    return (
        <div className="relative bg-slate-100 dark:bg-slate-900 h-dvh w-screen flex items-center justify-center font-body text-black overflow-hidden p-4">
            
            <div className="absolute top-4 left-4 z-20">
                <Link href="/" aria-label="Back to 8BitDex">
                    <Button variant="outline" size="xs" className="border-2 border-foreground">
                        <ArrowLeft />
                        Back
                    </Button>
                </Link>
            </div>
            
            <div className="relative w-full max-w-[480px] aspect-[10/16] h-auto max-h-full bg-[#d72c3a] rounded-xl sm:rounded-2xl p-4 sm:p-6 border-b-8 border-t-2 border-x-2 border-black/20 shadow-xl flex flex-col text-center">

                {/* --- Screen Area --- */}
                <div className="relative w-full aspect-square bg-gray-800 pt-6 pb-4 px-4 rounded-t-lg rounded-b-2xl shadow-inner mb-4">
                    <div className="relative bg-[#94a89a] h-full w-full overflow-hidden shadow-inner border-4 border-black/50">
                        {children}
                        {/* Screen Power LED */}
                         <div className="absolute top-3 left-3 h-2.5 w-2.5 rounded-full bg-red-900 border border-red-900/50 shadow-[0_0_5px_red]" />
                    </div>
                </div>

                {/* --- Brand Name --- */}
                <h1 className="my-2 font-headline text-2xl text-yellow-300 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                    8BIT-DEX
                </h1>

                {/* --- Controls Area --- */}
                <div className="flex-grow w-full grid grid-cols-2 items-center gap-4 px-2">
                    
                    {/* D-Pad */}
                    <div className="flex justify-center items-center">
                        <div className="relative w-28 h-28 grid grid-cols-3 grid-rows-3">
                            <div />
                            <button onClick={() => onDirectionalPad('up')} disabled={disabled} className={cn(dPadButtonClasses, "rounded-t-md")}></button>
                            <div />
                            <button onClick={() => onDirectionalPad('left')} disabled={disabled} className={cn(dPadButtonClasses, "rounded-l-md")}></button>
                            <div className="bg-gray-800"></div>
                            <button onClick={() => onDirectionalPad('right')} disabled={disabled} className={cn(dPadButtonClasses, "rounded-r-md")}></button>
                            <div />
                            <button onClick={() => onDirectionalPad('down')} disabled={disabled} className={cn(dPadButtonClasses, "rounded-b-md")}></button>
                            <div />
                        </div>
                    </div>
                    
                    {/* A & B Buttons */}
                    <div className="flex justify-center items-center">
                        <div className="relative w-36 h-20 flex justify-between items-center -rotate-[25deg] gap-4">
                           <button onClick={onBButton} disabled={disabled} className={cn(actionButtonClasses)}>B</button>
                           <button onClick={onAButton} disabled={disabled} className={cn(actionButtonClasses)}>A</button>
                        </div>
                    </div>
                </div>
                
                 {/* --- Speaker Grill --- */}
                 <div className="absolute bottom-6 right-8 w-16 h-12 space-y-1.5 -rotate-[25deg]">
                    <div className="w-full h-1.5 bg-black/40 rounded-full" />
                    <div className="w-full h-1.5 bg-black/40 rounded-full" />
                    <div className="w-full h-1.5 bg-black/40 rounded-full" />
                    <div className="w-full h-1.5 bg-black/40 rounded-full" />
                    <div className="w-full h-1.5 bg-black/40 rounded-full" />
                 </div>
            </div>
        </div>
    );
}
