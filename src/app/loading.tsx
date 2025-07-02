
import React from 'react';

const PokeballLoader = () => (
    <div className="relative h-20 w-20 animate-spin">
        {/* The main ball shape with border */}
        <div className="w-full h-full rounded-full border-[5px] border-foreground bg-card overflow-hidden">
            {/* Red top half */}
            <div className="h-1/2 w-full bg-primary"></div>
        </div>
        
        {/* The black center band */}
        <div className="absolute top-1/2 left-0 w-full h-3 -translate-y-1/2 bg-foreground"></div>
        
        {/* The center button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-card border-[3px] border-foreground"></div>
    </div>
);


export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]">
      <PokeballLoader />
      <p className="mt-4 font-headline text-lg text-foreground animate-pulse">Loading...</p>
    </div>
  );
}
