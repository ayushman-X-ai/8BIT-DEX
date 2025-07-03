'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Map, Loader2, Ban } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import RoamingView from '@/components/game/roaming-view';
import CaptureView from '@/components/game/capture-view';
import { type Coordinates, getDistance, generateRandomPoint } from '@/lib/geo-utils';
import { capitalize } from '@/lib/pokemon-utils';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';

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
                    setGameState('roaming');

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

    const renderContent = () => {
        switch (gameState) {
            case 'initializing':
                return (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-accent" />
                        <h2 className="text-xl font-bold font-headline">Initializing Geolocation</h2>
                        <p>Please allow location access to begin.</p>
                    </div>
                );
            case 'denied':
                return (
                    <div className="flex flex-col items-center justify-center text-center text-destructive-foreground bg-destructive p-8 gap-4">
                        <Ban className="h-12 w-12" />
                        <h2 className="text-xl font-bold font-headline">Location Access Required</h2>
                        <p className="max-w-sm">{error || 'Please enable location permissions in your browser settings and refresh the page.'}</p>
                    </div>
                );
            case 'roaming':
                return (
                    <RoamingView
                        distance={distance}
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
        <div className="bg-background min-h-screen flex flex-col font-body">
            <header className="py-4 px-4 md:px-8 border-b-4 border-foreground sticky top-0 z-10 bg-background">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="outline" size="xs" className="border-2 border-foreground">
                            <ArrowLeft />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 text-foreground font-headline">
                        <Map className="h-5 w-5" />
                        <h1 className="text-lg">DEX RUN</h1>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center p-4">
                {renderContent()}
            </main>
        </div>
    );
}
