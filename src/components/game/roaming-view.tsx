'use client';

import React from 'react';
import { Target, ArrowUp, ArrowLeft, ArrowDown, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


const PokeballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <div className="relative" {...props}>
        <div className="relative h-full w-full rounded-full border-[3px] border-foreground bg-card overflow-hidden group-hover:animate-pulse">
            <div className="h-1/2 w-full bg-primary"></div>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-foreground"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-card border-[2px] border-foreground"></div>
    </div>
);

const DPadButton = ({ icon, position }: { icon: React.ReactNode, position: string }) => (
    <div className={cn("absolute bg-gray-700 w-10 h-10 flex items-center justify-center text-gray-400 border-2 border-gray-900", position)}>
        {icon}
    </div>
);

const DPad = () => (
    <div className="relative w-32 h-32 scale-75 sm:scale-100">
        <div className="absolute w-10 h-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800" />
        <DPadButton icon={<ArrowUp />} position="top-0 left-1/2 -translate-x-1/2" />
        <DPadButton icon={<ArrowLeft />} position="left-0 top-1/2 -translate-y-1/2" />
        <DPadButton icon={<ArrowDown />} position="bottom-0 left-1/2 -translate-x-1/2" />
        <DPadButton icon={<ArrowRight />} position="right-0 top-1/2 -translate-y-1/2" />
    </div>
)


interface RoamingViewProps {
    distance: number | null;
    onEncounter: () => void;
    canEncounter: boolean;
}

export default function RoamingView({ distance, onEncounter, canEncounter }: RoamingViewProps) {
    
    // Scale goes from 0.2 (far) to 1.0 (close)
    const pokeballScale = distance !== null ? Math.max(0.1, 1 - (distance / 500)) : 0.1;

    return (
        <div className="w-full max-w-sm mx-auto p-4 flex flex-col items-center justify-between h-[60vh] min-h-[400px] bg-gray-800 border-4 border-foreground rounded-lg shadow-lg">
            {/* Screen */}
            <div className="w-full flex-grow bg-black border-2 border-gray-600 rounded flex flex-col items-center justify-center p-4 overflow-hidden relative">
                 {/* Starfield Background */}
                 <div className="absolute inset-0 z-0">
                    <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-100" />
                    <div className="absolute top-[10%] left-[80%] w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-500" />
                    <div className="absolute top-[50%] left-[50%] w-2 h-2 bg-white rounded-full opacity-80 animate-pulse" />
                    <div className="absolute top-[90%] left-[25%] w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-300" />
                    <div className="absolute top-[70%] left-[90%] w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-200" />
                </div>
                
                <div className="text-center z-10">
                    <p className="font-headline text-green-400 text-sm">PROXIMITY SCAN</p>
                    <div className="my-6">
                        <button disabled={!canEncounter} onClick={onEncounter} className="group outline-none">
                            <PokeballIcon 
                                className="h-24 w-24 mx-auto transition-transform duration-500 ease-out"
                                style={{ transform: `scale(${pokeballScale})` }}
                            />
                        </button>
                    </div>
                    
                    {distance !== null ? (
                        <p className="font-code text-white text-lg">{Math.round(distance)}m</p>
                    ) : (
                         <p className="font-code text-gray-400 text-lg animate-pulse">--m</p>
                    )}
                </div>

                {canEncounter && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                        <Button onClick={onEncounter} variant="secondary" className="border-2 border-foreground animate-pulse">
                            <Check className="mr-2" />
                            Encounter!
                        </Button>
                    </div>
                )}
            </div>
            
            {/* Controls */}
            <div className="w-full flex justify-between items-center mt-4 px-2">
                <DPad />
                <div className="flex items-center gap-4">
                     <p className="font-code text-xs text-muted-foreground -mr-2">Walk to find Pokémon!</p>
                     <Target className="w-10 h-10 text-primary" />
                </div>
            </div>
        </div>
    );
}
