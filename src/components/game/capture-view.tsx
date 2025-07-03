'use client';

import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

import type { Pokemon } from '@/types/pokemon';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { capitalize } from '@/lib/pokemon-utils';


const PokeballIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) => (
    <div className={cn("relative h-full w-full", className)} {...props}>
        <div className="relative h-full w-full rounded-full border-[3px] border-slate-900 bg-white overflow-hidden group-hover:animate-pulse">
            <div className="h-1/2 w-full bg-red-500"></div>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-1.5 -translate-y-1/2 bg-slate-900"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-[3px] border-slate-900"></div>
    </div>
);


interface CaptureViewProps {
  pokemonId: number;
  onCaptureSuccess: (pokemon: { id: number, name: string }) => void;
}

type CaptureState = 'finding' | 'idle' | 'throwing' | 'wobbling' | 'success' | 'failed';

export default function CaptureView({ pokemonId, onCaptureSuccess }: CaptureViewProps) {
    const { toast } = useToast();
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [captureState, setCaptureState] = useState<CaptureState>('finding');
    const [hasCamera, setHasCamera] = useState(true);

    useEffect(() => {
        async function fetchPokemon() {
            try {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                if (!res.ok) throw new Error('Could not fetch Pokémon data.');
                const data: Pokemon = await res.json();
                setPokemon(data);
                setCaptureState('idle');
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load Pokémon.' });
            }
        }
        fetchPokemon();
    }, [pokemonId, toast]);

    const handleThrow = () => {
        if (!pokemon) return;
        setCaptureState('throwing');
        
        setTimeout(() => {
            setCaptureState('wobbling');
        }, 1500);

        setTimeout(() => {
            const captured = Math.random() < 0.7; 
            if (captured) {
                setCaptureState('success');
                setTimeout(() => onCaptureSuccess(pokemon), 1500);
            } else {
                setCaptureState('failed');
                toast({ title: 'Oh no!', description: `${capitalize(pokemon.name)} broke free!` });
                setTimeout(() => setCaptureState('idle'), 2000);
            }
        }, 4500);
    };

    return (
        <div className="w-full h-full bg-black overflow-hidden relative flex flex-col justify-between">
            {hasCamera ? (
                <Webcam
                    audio={false}
                    mirrored={true}
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                    videoConstraints={{ facingMode: 'environment' }}
                    onUserMediaError={() => {
                        toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera. Using fallback view.'});
                        setHasCamera(false);
                    }}
                />
            ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-800 to-slate-900" />
            )}

            {/* Futuristic AR Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none border-4 border-cyan-400/30">
                <div className="absolute top-2 left-2 text-cyan-400 font-code text-[10px] bg-black/50 px-2 py-1">LIVE FEED</div>
                <div className="absolute bottom-2 right-2 text-cyan-400 font-code text-[10px] bg-black/50 px-2 py-1">TARGET: {pokemon ? capitalize(pokemon.name) : '...'}</div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-50">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500" />
                </div>
            </div>

            {/* Pokémon Sprite */}
            {captureState !== 'finding' && pokemon && (
                <div className="relative z-20 flex-grow flex items-center justify-center p-4">
                     <div className={cn(
                        "relative transition-all duration-500",
                        captureState === 'idle' && "animate-pulse",
                        captureState === 'throwing' && "opacity-0 -translate-y-12 scale-50",
                        (captureState === 'wobbling' || captureState === 'success') && "opacity-0 scale-0",
                        captureState === 'failed' && "opacity-100 translate-y-20"
                     )}>
                        <Image
                            src={pokemon.sprites.other['official-artwork'].front_default || ''}
                            alt={`Wild ${pokemon.name}`}
                            width={200}
                            height={200}
                            className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                            data-ai-hint="pokemon character"
                        />
                     </div>
                </div>
            )}

            {/* Loading Indicator */}
            {captureState === 'finding' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
            )}

            {/* Capture Animation */}
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className={cn(
                    "h-20 w-20 transition-all duration-500",
                    captureState === 'throwing' && "animate-[spin_1.5s_linear] scale-[4]",
                    captureState === 'wobbling' && "scale-100 animate-[bounce_1s_ease-in-out_3]",
                    captureState === 'success' && "scale-100 opacity-0",
                    (captureState === 'idle' || captureState === 'finding' || captureState === 'failed') && "scale-0 opacity-0"
                )}>
                    <PokeballIcon />
                </div>
                {captureState === 'success' && (
                    <div className="absolute text-yellow-300 text-5xl animate-ping">✨</div>
                )}
            </div>
            
            {/* UI */}
            <div className="relative z-20 p-4 text-center">
                <Button
                    onClick={handleThrow}
                    disabled={captureState !== 'idle'}
                    className="h-20 w-20 rounded-full border-4 border-slate-500 bg-slate-700 text-white font-headline shadow-lg hover:bg-slate-600 active:scale-95 transition-all disabled:opacity-50"
                    aria-label="Throw Pokéball"
                >
                    <PokeballIcon className="h-10 w-10" />
                </Button>
            </div>
        </div>
    );
}
