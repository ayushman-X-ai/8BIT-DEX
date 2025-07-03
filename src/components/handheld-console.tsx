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
    disabled?: boolean;
}

const ArrowIcon = ({ rotation }: { rotation: string }) => (
    <svg 
        width="14" 
        height="14" 
        viewBox="0 0 12 12" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg" 
        className={cn('text-black/40', rotation)}
    >
        <path d="M4 2L10 6L4 10V2Z"/>
    </svg>
);


export function HandheldConsole({ children, onDirectionalPad, disabled = false }: HandheldConsoleProps) {
    // Classes for a 3D, shaded D-pad
    const dPadButtonClasses = "bg-[#3d3d3d] active:bg-[#2e2e2e] border-2 border-t-[#555] border-l-[#555] border-b-black/70 border-r-black/70 active:border-b-[#555] active:border-r-[#555] active:border-t-black/70 active:border-l-black/70 flex items-center justify-center transition-colors disabled:opacity-60";
    
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
                <div className="relative w-full aspect-[4/3] bg-gray-800 pt-6 pb-4 px-4 rounded-t-lg rounded-b-2xl shadow-inner mb-4">
                    <div className="relative bg-[#94a89a] h-full w-full overflow-hidden shadow-inner border-4 border-black/50">
                        {children}
                        {/* Screen Power LED */}
                         <div className="absolute top-3 left-3 h-2.5 w-2.5 rounded-full bg-red-900 border border-red-900/50 shadow-[0_0_5px_red]" />
                    </div>
                </div>

                {/* --- Controls Area --- */}
                <div className="flex-grow w-full grid grid-cols-1 justify-center items-center px-2 mt-4">
                    
                    {/* D-Pad */}
                    <div className="flex justify-center items-center">
                        <div className="relative w-28 h-28 grid grid-cols-3 grid-rows-3">
                            <div />
                            <button onClick={() => onDirectionalPad('up')} disabled={disabled} className={cn(dPadButtonClasses, "rounded-t-md")}>
                                <ArrowIcon rotation="-rotate-90" />
                            </button>
                            <div />
                            <button onClick={() => onDirectionalPad('left')} disabled={disabled} className={cn(dPadButtonClasses, "rounded-l-md")}>
                                <ArrowIcon rotation="rotate-180" />
                            </button>
                            <div className="bg-[#3d3d3d]"></div>
                            <button onClick={() => onDirectionalPad('right')} disabled={disabled} className={cn(dPadButtonClasses, "rounded-r-md")}>
                                <ArrowIcon rotation="" />
                            </button>
                            <div />
                            <button onClick={() => onDirectionalPad('down')} disabled={disabled} className={cn(dPadButtonClasses, "rounded-b-md")}>
                                <ArrowIcon rotation="rotate-90" />
                            </button>
                            <div />
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
