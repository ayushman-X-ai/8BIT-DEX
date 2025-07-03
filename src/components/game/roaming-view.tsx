'use client';

import React from 'react';
import { Target, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RoamingViewProps {
    distance: number | null;
    proximity: number; // 0 (far) to 1 (close)
    onEncounter: () => void;
    canEncounter: boolean;
}

export default function RoamingView({ distance, proximity, onEncounter, canEncounter }: RoamingViewProps) {
    // Use a modulo of the distance to give the blip a pseudo-random angle
    const angle = distance ? (distance * 137.5) % 360 : 45;

    return (
        <div className="w-full h-full bg-black text-green-400 font-code flex flex-col items-center justify-center p-4 overflow-hidden">
            <h2 className="text-base font-headline tracking-widest text-cyan-400 uppercase flex-shrink-0">Proximity Scanner</h2>

            <div className="flex-grow flex items-center justify-center w-full">
                <div className="relative w-56 h-56 flex items-center justify-center">
                    {/* Radar grid */}
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/10" />
                    <div className="absolute inset-[12.5%] rounded-full border-2 border-cyan-400/10" />
                    <div className="absolute inset-[25%] rounded-full border-2 border-cyan-400/10" />
                    <div className="absolute inset-[37.5%] rounded-full border-2 border-cyan-400/10" />
                    
                    {/* Crosshairs */}
                    <div className="absolute w-full h-[2px] bg-cyan-400/10 top-1/2 -translate-y-1/2" />
                    <div className="absolute h-full w-[2px] bg-cyan-400/10 left-1/2 -translate-x-1/2" />

                    {/* Radar sweep */}
                    <div className="absolute inset-0 w-full h-full animate-spin [animation-duration:3s]">
                        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-cyan-400/20 to-transparent" />
                    </div>
                    
                    {/* Target Blip */}
                    {distance !== null && (
                        <div 
                            className="absolute w-4 h-4 rounded-full transition-transform duration-500 ease-out"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${105 * (1 - proximity)}px)`,
                            }}
                        >
                            <div className={cn(
                                "w-full h-full rounded-full animate-pulse",
                                canEncounter ? "bg-green-400 shadow-[0_0_8px_green]" : "bg-red-500 shadow-[0_0_8px_red]"
                            )} />
                        </div>
                    )}

                    {/* Center point */}
                    <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
                </div>
            </div>
            
            <div className="flex-shrink-0 text-center w-full">
                <p className="text-xs uppercase text-cyan-400/80">Signal Distance</p>
                <p className="text-4xl font-headline text-white mt-1">{distance !== null ? `${Math.round(distance)}m` : '--'}</p>

                <div className="h-16 mt-4 flex items-center justify-center">
                    {canEncounter && (
                        <Button 
                            onClick={onEncounter} 
                            variant="secondary" 
                            className="border-2 border-foreground animate-pulse bg-green-500/80 hover:bg-green-500 text-white font-headline text-lg"
                        >
                            <Check className="mr-2" />
                            Encounter
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
