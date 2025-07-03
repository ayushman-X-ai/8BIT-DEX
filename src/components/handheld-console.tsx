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
    const dPadButtonClasses = "bg-gray-700 active:bg-gray-800 text-gray-300 flex items-center justify-center transition-colors disabled:opacity-60 shadow-inner";
    const actionButtonClasses = "w-14 h-14 rounded-full bg-[#a93b4f] border-2 border-[#8c2a3e] active:bg-[#8c2a3e] flex items-center justify-center font-bold text-lg text-white/80 shadow-md disabled:opacity-60";

    return (
        <div className="bg-slate-100 dark:bg-slate-900 h-dvh w-screen flex items-center justify-center font-body text-black overflow-hidden p-2 sm:p-4">
            
            <div className="relative w-full max-w-[450px] aspect-[10/16] h-auto max-h-full bg-[#e0d8b0] dark:bg-gray-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-b-8 border-t-2 border-x-2 border-black/20 shadow-xl flex flex-col text-center">

                {/* Top border detail & Back button */}
                <div className="absolute top-4 left-4 z-10">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-black/60 dark:text-white/60 hover:bg-black/10">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                </div>
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-1/4 h-1.5 bg-black/10 rounded-full" />
                <div className="absolute top-2.5 right-6 h-[calc(100%-2rem)] w-1.5 bg-black/10 rounded-full" />


                {/* --- Screen Area --- */}
                <div className="relative flex-grow flex flex-col justify-center items-center">
                    <div className="w-full bg-gray-800 pt-6 pb-4 px-4 rounded-t-lg rounded-b-2xl shadow-inner">
                        <div className="relative bg-[#94a89a] aspect-square w-full overflow-hidden shadow-inner border-4 border-black/50">
                            {children}
                            {/* Screen Power LED */}
                             <div className="absolute top-3 left-3 h-2.5 w-2.5 rounded-full bg-red-500/80 border border-red-700/50 shadow-[0_0_5px_red]" />
                        </div>
                    </div>
                    <p className="mt-2 text-[8px] font-bold text-blue-800/80 dark:text-blue-300/80 tracking-tighter">DOT MATRIX WITH STEREO SOUND</p>
                </div>

                {/* --- Brand Name --- */}
                <h1 className="my-4 font-headline text-3xl text-blue-800/90 dark:text-blue-300/90 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)] dark:drop-shadow-none">
                    8BIT-DEX
                </h1>

                {/* --- Controls Area --- */}
                <div className="relative flex-grow grid grid-cols-2 items-center justify-center px-2">
                    
                    {/* D-Pad */}
                    <div className="flex justify-center items-center">
                        <div className="relative w-28 h-28 bg-gray-400/50 rounded-full flex items-center justify-center">
                            <div className="absolute w-full h-9 bg-gray-700" />
                            <div className="absolute w-9 h-full bg-gray-700" />
                            <button onClick={() => onDirectionalPad('up')} disabled={disabled} className={cn(dPadButtonClasses, "absolute top-0 w-9 h-9")}></button>
                            <button onClick={() => onDirectionalPad('down')} disabled={disabled} className={cn(dPadButtonClasses, "absolute bottom-0 w-9 h-9")}></button>
                            <button onClick={() => onDirectionalPad('left')} disabled={disabled} className={cn(dPadButtonClasses, "absolute left-0 w-9 h-9")}></button>
                            <button onClick={() => onDirectionalPad('right')} disabled={disabled} className={cn(dPadButtonClasses, "absolute right-0 w-9 h-9")}></button>
                        </div>
                    </div>
                    
                    {/* A & B Buttons */}
                    <div className="flex justify-center items-center">
                        <div className="relative w-36 h-20 flex justify-between items-center -rotate-[25deg]">
                           <button onClick={onBButton} disabled={disabled} className={cn(actionButtonClasses)}>B</button>
                           <button onClick={onAButton} disabled={disabled} className={cn(actionButtonClasses)}>A</button>
                        </div>
                    </div>
                </div>
                
                {/* --- Start/Select Area --- */}
                 <div className="flex-grow flex justify-center items-center gap-6">
                    <button disabled={disabled} className="w-16 h-5 rounded-full bg-gray-800/80 text-white/60 text-[10px] font-bold shadow-inner disabled:opacity-60 tracking-tighter">SELECT</button>
                    <button disabled={disabled} className="w-16 h-5 rounded-full bg-gray-800/80 text-white/60 text-[10px] font-bold shadow-inner disabled:opacity-60 tracking-tighter">START</button>
                 </div>

                 {/* --- Speaker Grill --- */}
                 <div className="absolute bottom-4 right-8 w-14 h-10 space-y-1.5 -rotate-[25deg]">
                    <div className="w-full h-1 bg-black/40 rounded-full" />
                    <div className="w-full h-1 bg-black/40 rounded-full" />
                    <div className="w-full h-1 bg-black/40 rounded-full" />
                    <div className="w-full h-1 bg-black/40 rounded-full" />
                    <div className="w-full h-1 bg-black/40 rounded-full" />
                 </div>
            </div>
        </div>
    );
}
