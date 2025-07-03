'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface HandheldConsoleProps {
    children: React.ReactNode;
    onDirectionalPad: (direction: Direction) => void;
    disabled?: boolean;
}

export function HandheldConsole({ children, onDirectionalPad, disabled = false }: HandheldConsoleProps) {
    const dPadButtonClasses = "bg-[#333] active:bg-[#555] text-gray-400 p-2 flex items-center justify-center transition-colors";

    return (
        <div className="bg-[#fdfd96] p-4 sm:p-6 rounded-lg shadow-2xl border-4 border-[#e6e686] max-w-sm w-full font-body">
            {/* Top Bezel */}
            <div className="flex justify-center items-center mb-4">
                <div className="h-2 w-1/4 bg-gray-300 rounded-full" />
            </div>

            {/* Screen Area */}
            <div className="bg-[#222] p-2 rounded-md shadow-inner">
                <div className="relative bg-[#94a89a] aspect-square w-full overflow-hidden shadow-inner border-2 border-[#111]">
                    {children}
                </div>
            </div>

            {/* Logo and Speaker */}
            <div className="flex items-center justify-between mt-4 px-2">
                <h2 className="font-headline text-lg text-blue-800/70 italic">8BIT-DEX</h2>
                <div className="flex flex-col gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-0.5 w-8 bg-black/20 rounded-full" />
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mt-6">
                {/* D-Pad */}
                <div className="relative w-24 h-24">
                    <button onClick={() => onDirectionalPad('up')} disabled={disabled} className={cn(dPadButtonClasses, "absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-t-sm")}>
                        <ArrowUp size={16} />
                    </button>
                    <button onClick={() => onDirectionalPad('down')} disabled={disabled} className={cn(dPadButtonClasses, "absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-b-sm")}>
                        <ArrowDown size={16} />
                    </button>
                    <button onClick={() => onDirectionalPad('left')} disabled={disabled} className={cn(dPadButtonClasses, "absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-l-sm")}>
                        <ArrowLeft size={16} />
                    </button>
                    <button onClick={() => onDirectionalPad('right')} disabled={disabled} className={cn(dPadButtonClasses, "absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-r-sm")}>
                        <ArrowRight size={16} />
                    </button>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#333] flex items-center justify-center">
                        <div className="w-3 h-3 bg-[#222] rounded-full" />
                    </div>
                </div>

                {/* A/B Buttons */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-[#e0474c] rounded-full shadow-md border-2 border-[#c23a3f] active:bg-[#c23a3f]" />
                        <span className="font-headline text-sm mt-1 text-black/70">A</span>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-[#e0474c] rounded-full shadow-md border-2 border-[#c23a3f] active:bg-[#c23a3f]" />
                        <span className="font-headline text-sm mt-1 text-black/70">B</span>
                    </div>
                </div>
            </div>
            
            {/* Power LED */}
            <div className="absolute top-24 left-6 sm:top-28 sm:left-10 h-2.5 w-2.5 rounded-full bg-red-500/80 border border-red-700/50 shadow-[0_0_5px_red] animate-pulse" />
        </div>
    );
}
