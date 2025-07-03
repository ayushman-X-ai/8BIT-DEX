'use client';

import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

import type { Pokemon } from '@/types/pokemon';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


const PokeballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" fill="hsl(var(--primary))" stroke="none" />
        <path d="M12 22a10 10 0 0 0 10-10H12v10z" fill="hsl(var(--card))" stroke="none" />
        <circle cx="12" cy="12" r="10" stroke="hsl(var(--foreground))" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="hsl(var(--foreground))" strokeWidth="3" />
        <circle cx="12" cy="12" r="3" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
    </svg>
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
                // In a real app, you might want a way to retry or go back
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
            // Simple capture logic: 70% chance to succeed
            const captured = Math.random() < 0.7; 
            if (captured) {
                setCaptureState('success');
                setTimeout(() => onCaptureSuccess(pokemon), 1500);
            } else {
                setCaptureState('failed');
                toast({ title: 'Oh no!', description: `${pokemon.name} broke free!` });
                setTimeout(() => setCaptureState('idle'), 2000);
            }
        }, 4500); // 1.5s (throw) + 3s (wobble)
    };

    return (
        <div className="w-full h-full max-w-md mx-auto aspect-[9/16] bg-black border-4 border-foreground shadow-lg overflow-hidden relative flex flex-col justify-between">
            <Webcam
                audio={false}
                mirrored={true}
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
                videoConstraints={{ facingMode: 'environment' }}
                onUserMediaError={() => {
                     toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera.'})
                }}
            />
            <div className="absolute inset-0 bg-black/10 z-10" />

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
                <PokeballIcon className={cn(
                    "h-20 w-20 text-foreground transition-all duration-500",
                    captureState === 'throwing' && "animate-[spin_1.5s_linear] scale-[4]",
                    captureState === 'wobbling' && "scale-100 animate-[bounce_1s_ease-in-out_3]",
                    captureState === 'success' && "scale-100 opacity-0",
                    (captureState === 'idle' || captureState === 'finding' || captureState === 'failed') && "scale-0 opacity-0"
                )} />
                {captureState === 'success' && (
                    <div className="absolute text-yellow-300 text-5xl animate-ping">✨</div>
                )}
            </div>
            
            {/* UI */}
            <div className="relative z-20 p-4 text-center">
                <Button
                    onClick={handleThrow}
                    disabled={captureState !== 'idle'}
                    className="h-20 w-20 rounded-full border-4 border-foreground shadow-lg"
                    aria-label="Throw Pokéball"
                >
                    <PokeballIcon className="h-12 w-12 text-foreground" />
                </Button>
            </div>
        </div>
    );
}
