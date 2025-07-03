'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ban, Loader2, Signal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import RoamingView from '@/components/game/roaming-view';
import CaptureView from '@/components/game/capture-view';
import { type Coordinates, getDistance, generateRandomPoint } from '@/lib/geo-utils';
import { capitalize } from '@/lib/pokemon-utils';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { cn } from '@/lib/utils';

type GameState = 'initializing' | 'denied' | 'roaming' | 'capturing';

const ENCOUNTER_RADIUS_METERS = 20; // Within 20 meters to encounter
const SPAWN_RADIUS_METERS = 200; // New Pokemon spawn within a 200m radius

export default function DexRunPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [gameState, setGameState] = useState<GameState>('initializing');
    const [error, setError] = useState<string | null>(null);

    const [currentPosition, setCurrentPosition] = useState<Coordinates | null>(null);
    const [targetPosition, setTargetPosition] = useState<Coordinates | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [encounterPokemonId, setEncounterPokemonId] = useState<number | null>(null);

    const geoWatchId = useRef<number | null>(null);

    const generateNewTarget = useCallback((center: Coordinates) => {
        setTargetPosition(generateRandomPoint(center, SPAWN_RADIUS_METERS));
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            geoWatchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const newPos = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setCurrentPosition(newPos);
                    
                    if (gameState === 'initializing') {
                        setGameState('roaming');
                    }

                    if (!targetPosition) {
                        generateNewTarget(newPos);
                    }
                },
                (err) => {
                    console.error(err);
                    setError(err.message);
                    setGameState('denied');
                    toast({
                        variant: 'destructive',
                        title: 'Location Access Denied',
                        description: 'Please enable location permissions in your browser settings to play.',
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
            setGameState('denied');
        }

        return () => {
            if (geoWatchId.current !== null) {
                navigator.geolocation.clearWatch(geoWatchId.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetPosition, generateNewTarget, toast]);

    useEffect(() => {
        if (currentPosition && targetPosition) {
            const newDistance = getDistance(currentPosition, targetPosition);
            setDistance(newDistance);
        }
    }, [currentPosition, targetPosition]);


    const handleEncounter = useCallback(() => {
        const randomPokemonId = Math.floor(Math.random() * 151) + 1;
        setEncounterPokemonId(randomPokemonId);
        setGameState('capturing');
    }, []);

    const handleCapture = useCallback(async (pokemon: { id: number, name: string }) => {
        toast({
            title: 'Capture Successful!',
            description: `You caught a wild ${capitalize(pokemon.name)}!`,
        });

        try {
            const pokemonNameToSpeak = capitalize(pokemon.name);
            const ttsResult = await textToSpeech(pokemonNameToSpeak);
            if (ttsResult.media) {
                sessionStorage.setItem('ttsAudioData', ttsResult.media);
            }
        } catch (ttsError) {
            console.error("Failed to generate or store TTS audio:", ttsError);
        }
        
        router.push(`/pokemon/${pokemon.id}`);
        
        // Reset for next encounter
        if(currentPosition) {
            generateNewTarget(currentPosition);
        }
        setGameState('roaming');
        setEncounterPokemonId(null);
    }, [router, toast, currentPosition, generateNewTarget]);

    const proximity = distance !== null ? Math.max(0, 1 - (distance / SPAWN_RADIUS_METERS)) : 0;

    const renderContent = () => {
        switch (gameState) {
            case 'initializing':
                return (
                    <div className="flex flex-col items-center justify-center text-center text-cyan-400 gap-4">
                        <Loader2 className="h-12 w-12 animate-spin" />
                        <h2 className="text-xl font-bold font-headline">Awaiting GPS Lock</h2>
                        <p className="font-code text-sm">Please allow location access to begin.</p>
                    </div>
                );
            case 'denied':
                return (
                    <div className="flex flex-col items-center justify-center text-center text-red-400 p-8 gap-4">
                        <Ban className="h-12 w-12" />
                        <h2 className="text-xl font-bold font-headline">Location Access Denied</h2>
                        <p className="max-w-sm font-code text-sm">{error || 'Please enable location permissions in your browser settings and refresh the page.'}</p>
                    </div>
                );
            case 'roaming':
                return (
                    <RoamingView
                        distance={distance}
                        proximity={proximity}
                        onEncounter={handleEncounter}
                        canEncounter={distance !== null && distance <= ENCOUNTER_RADIUS_METERS}
                    />
                );
            case 'capturing':
                if (!encounterPokemonId) return null;
                return (
                    <CaptureView
                        pokemonId={encounterPokemonId}
                        onCaptureSuccess={handleCapture}
                    />
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-gray-900 min-h-screen flex flex-col font-body" style={{
            backgroundImage: 'radial-gradient(hsl(0 0% 100% / 0.05) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
        }}>
            <header className="py-4 px-4 md:px-8 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b-2 border-slate-700">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="outline" size="xs" className="border-2 border-foreground bg-slate-800 hover:bg-slate-700">
                            <ArrowLeft />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 text-cyan-400 font-headline">
                        <Signal className="h-5 w-5" />
                        <h1 className="text-lg tracking-widest">DEX RUN</h1>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-sm h-auto aspect-[9/16] max-h-[800px] flex flex-col gap-4">
                    {/* Device Frame */}
                    <div className="flex-grow bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-slate-600 rounded-[2.5rem] shadow-2xl p-4 flex flex-col relative">
                        {/* Top Bezel with Speaker Grill */}
                        <div className="h-8 flex-shrink-0 flex items-center justify-center px-4">
                            <div className="w-16 h-1 bg-slate-900 rounded-full" />
                        </div>

                        {/* Screen Area */}
                        <div className="flex-grow bg-black rounded-md overflow-hidden relative shadow-inner shadow-black/50 border-2 border-slate-900">
                             {renderContent()}
                        </div>
                        
                        {/* Bottom Bezel with decorative elements */}
                         <div className="h-12 flex-shrink-0 flex items-center justify-between px-6 pt-4">
                            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]" />
                            <div className={cn(
                                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors",
                                gameState === 'roaming' ? 'bg-cyan-400/20 border-cyan-400' : 'bg-slate-900/50 border-slate-700'
                            )}>
                                <div className={cn(
                                    "w-4 h-4 rounded-full transition-colors",
                                    gameState === 'roaming' ? 'bg-cyan-400' : 'bg-slate-600'
                                )} />
                            </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
