'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right';

interface HandheldConsoleProps {
    children: React.ReactNode;
    onDirectionalPad: (direction: Direction) => void;
    onAButton?: () => void;
    onBButton?: () => void;
    disabled?: boolean;
}

export function HandheldConsole({ children, onDirectionalPad, onAButton, onBButton, disabled = false }: HandheldConsoleProps) {
    const dPadButtonClasses = "bg-gray-800 active:bg-gray-950 text-gray-300 flex items-center justify-center transition-colors disabled:opacity-60";
    const actionButtonClasses = "w-14 h-14 rounded-full bg-[#a93b4f] border-4 border-[#8c2a3e] active:bg-[#8c2a3e] flex items-center justify-center font-bold text-lg text-white/80 shadow-inner disabled:opacity-60";

    return (
        <div className="bg-slate-100 dark:bg-slate-900 h-dvh w-screen flex items-center justify-center font-body text-black overflow-hidden p-2 sm:p-4">
            
            <div className="relative max-w-full max-h-full aspect-[10/16] bg-gray-300 dark:bg-gray-500 rounded-2xl sm:rounded-3xl p-4 border-4 border-gray-400 dark:border-gray-700 shadow-2xl flex flex-col text-center">

                {/* Top border detail */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gray-400/70 dark:bg-gray-600/70 rounded-full" />

                {/* --- Screen Area --- */}
                <div className="relative flex-[2_2_0%] flex flex-col justify-center items-center py-4">
                    <div className="w-full bg-gray-700 dark:bg-gray-800 pt-6 pb-4 px-4 rounded-lg shadow-inner">
                        <div className="relative bg-[#94a89a] aspect-square w-full overflow-hidden shadow-inner border-4 border-black/50">
                            {children}
                            {/* Screen Power LED */}
                             <div className="absolute top-2 left-2 h-3 w-3 rounded-full bg-red-500/80 border-2 border-red-700/50 shadow-[0_0_8px_red]" />
                        </div>
                    </div>
                    <p className="mt-1 text-xs font-bold text-blue-800/80 dark:text-blue-300/80">DOT MATRIX WITH STEREO SOUND</p>
                </div>

                {/* --- Brand Name --- */}
                <h1 className="flex-[0.5_0.5_0%] font-headline text-3xl text-blue-800/90 dark:text-blue-300/90 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)] dark:drop-shadow-none">
                    8BIT-DEX
                </h1>

                {/* --- Controls Area --- */}
                <div className="relative flex-[2_2_0%] grid grid-cols-2 items-center justify-center">
                    
                    {/* D-Pad */}
                    <div className="flex justify-center items-center">
                        <div className="relative w-28 h-28">
                            <button onClick={() => onDirectionalPad('up')} disabled={disabled} className={cn(dPadButtonClasses, "absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-t-md")}>▲</button>
                            <button onClick={() => onDirectionalPad('down')} disabled={disabled} className={cn(dPadButtonClasses, "absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-b-md")}>▼</button>
                            <button onClick={() => onDirectionalPad('left')} disabled={disabled} className={cn(dPadButtonClasses, "absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-l-md")}>◄</button>
                            <button onClick={() => onDirectionalPad('right')} disabled={disabled} className={cn(dPadButtonClasses, "absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-r-md")}>►</button>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-gray-800 flex items-center justify-center">
                                <div className="w-4 h-4 bg-black/50 rounded-full" />
                            </div>
                        </div>
                    </div>
                    
                    {/* A & B Buttons */}
                    <div className="flex justify-center items-center">
                        <div className="relative w-36 h-20 flex justify-center items-center -rotate-[25deg]">
                           <button onClick={onBButton} disabled={disabled} className={cn(actionButtonClasses, "absolute left-0")}>B</button>
                           <button onClick={onAButton} disabled={disabled} className={cn(actionButtonClasses, "absolute right-0")}>A</button>
                        </div>
                    </div>
                </div>
                
                {/* --- Start/Select Area --- */}
                 <div className="flex-[0.5_0.5_0%] flex justify-center items-center gap-6">
                    <button disabled={disabled} className="w-16 h-5 rounded-full bg-gray-800/80 text-white/80 text-xs font-bold shadow-inner disabled:opacity-60">SELECT</button>
                    <button disabled={disabled} className="w-16 h-5 rounded-full bg-gray-800/80 text-white/80 text-xs font-bold shadow-inner disabled:opacity-60">START</button>
                 </div>

                 {/* --- Speaker Grill --- */}
                 <div className="absolute bottom-4 right-6 w-14 h-10 space-y-1 -rotate-[25deg]">
                    <div className="w-full h-1 bg-gray-400/80 dark:bg-gray-600/80 rounded-full" />
                    <div className="w-full h-1 bg-gray-400/80 dark:bg-gray-600/80 rounded-full" />
                    <div className="w-full h-1 bg-gray-400/80 dark:bg-gray-600/80 rounded-full" />
                    <div className="w-full h-1 bg-gray-400/80 dark:bg-gray-600/80 rounded-full" />
                    <div className="w-full h-1 bg-gray-400/80 dark:bg-gray-600/80 rounded-full" />
                 </div>
            </div>
        </div>
    );
}
