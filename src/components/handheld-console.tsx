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
    const dPadButtonClasses = "bg-gray-800 active:bg-gray-600 text-gray-300 flex items-center justify-center transition-colors disabled:opacity-60";

    return (
        <div className="bg-blue-600 h-screen w-screen flex flex-col items-center justify-around p-4 font-body overflow-hidden">
            
            {/* Screen Area */}
            <div className="w-full max-w-xl text-center space-y-4">
                <h2 className="font-headline text-xl text-yellow-300 uppercase" style={{textShadow: '2px 2px 0px rgba(0,0,0,0.2)'}}>8BIT-DEX</h2>
                <div className="bg-black/50 p-2 rounded-lg shadow-inner">
                    <div className="relative bg-[#94a89a] aspect-square w-full overflow-hidden shadow-inner border-4 border-black/50">
                        {children}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6">
                {/* D-Pad */}
                <div className="relative w-32 h-32">
                    <button onClick={() => onDirectionalPad('up')} disabled={disabled} className={cn(dPadButtonClasses, "absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-t-lg")}>
                        <ArrowUp size={20} />
                    </button>
                    <button onClick={() => onDirectionalPad('down')} disabled={disabled} className={cn(dPadButtonClasses, "absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-b-lg")}>
                        <ArrowDown size={20} />
                    </button>
                    <button onClick={() => onDirectionalPad('left')} disabled={disabled} className={cn(dPadButtonClasses, "absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-l-lg")}>
                        <ArrowLeft size={20} />
                    </button>
                    <button onClick={() => onDirectionalPad('right')} disabled={disabled} className={cn(dPadButtonClasses, "absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-r-lg")}>
                        <ArrowRight size={20} />
                    </button>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800 flex items-center justify-center">
                        <div className="w-4 h-4 bg-black/50 rounded-full" />
                    </div>
                </div>
                 {/* A Button */}
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full shadow-lg border-4 border-red-800 active:bg-red-700" />
                    <span className="font-headline text-lg mt-2 text-white/90">A</span>
                </div>
            </div>
            
            {/* Power LED */}
            <div className="absolute top-6 left-6 h-3 w-3 rounded-full bg-red-500/80 border-2 border-red-700/50 shadow-[0_0_8px_red] animate-pulse" />
        </div>
    );
}
