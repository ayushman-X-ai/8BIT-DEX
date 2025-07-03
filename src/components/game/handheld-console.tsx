'use client';

import Link from "next/link";
import React from "react";

interface HandheldConsoleProps {
  screenContent: React.ReactNode;
  dPad: React.ReactNode;
}

export function HandheldConsole({ screenContent, dPad }: HandheldConsoleProps) {
  return (
    <div className="bg-accent rounded-lg border-b-8 border-t-2 border-x-2 border-foreground/50 p-4 sm:p-6 w-full max-w-sm shadow-2xl relative">
      {/* Top Section: Screen & Branding */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
            <h1 className="font-headline text-foreground/80 text-sm">8BIT-DEX</h1>
            <h2 className="font-headline text-foreground/60 text-xs">RUN</h2>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">POWER</span>
            <div className="h-3 w-3 rounded-full bg-primary/50 border border-primary animate-pulse" />
        </div>
      </div>

      {/* Screen Area */}
      <div className="bg-foreground p-2 sm:p-3 rounded-md shadow-inner">
        <div className="bg-card aspect-square relative overflow-hidden rounded-sm border-2 border-foreground/30">
            {screenContent}
        </div>
      </div>
      
      {/* Decorative Speaker grille */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-1">
        {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="w-1 h-3 bg-foreground/30 rounded-full" />
        ))}
      </div>


      {/* Controls Section */}
      <div className="mt-6 grid grid-cols-2 gap-4 items-center">
        {/* D-Pad */}
        <div className="flex justify-center">{dPad}</div>
        
        {/* A & B Buttons */}
        <div className="flex justify-center items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-full border-2 border-foreground/50 shadow-md" />
            <span className="font-bold text-foreground/70 mt-1">A</span>
          </div>
          <div className="flex flex-col items-center mt-6">
            <div className="w-12 h-12 bg-primary rounded-full border-2 border-foreground/50 shadow-md" />
            <span className="font-bold text-foreground/70 mt-1">B</span>
          </div>
        </div>
      </div>
      
      {/* Start/Select Buttons */}
       <div className="mt-6 flex justify-center items-center gap-4">
            <Link href="/" className="px-4 py-1 bg-foreground/60 rounded-full text-background font-bold text-xs shadow-inner">
                QUIT
            </Link>
             <div className="px-4 py-1 bg-foreground/60 rounded-full text-background font-bold text-xs shadow-inner">
                PAUSE
            </div>
       </div>

    </div>
  );
}
