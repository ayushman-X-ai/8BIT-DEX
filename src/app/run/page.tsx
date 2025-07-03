'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HandheldConsole } from '@/components/handheld-console';
import { GameBoard } from '@/components/game-board';
import { useGameLogic } from '@/hooks/use-game-logic';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { capitalize } from '@/lib/pokemon-utils';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';

const PokedexScanner = ({ pokemonName }: { pokemonName: string }) => (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 overflow-hidden">
        <div className="absolute left-0 w-full h-1 bg-primary/70 shadow-[0_0_10px_theme(colors.primary)] animate-scanline z-20" />
        <p className="font-headline text-lg text-primary animate-pulse z-10 tracking-widest">
            CAUGHT!
        </p>
        <p className="font-headline text-sm text-white z-10 tracking-wide mt-2">
            {pokemonName}
        </p>
    </div>
);

export default function DexRunPage() {
    const router = useRouter();
    const {
        gameState,
        maze,
        playerPos,
        villainPos,
        pokeballPos,
        startGame,
        movePlayer,
        resetGame,
    } = useGameLogic();

    const [showCapture, setShowCapture] = useState(false);
    const [caughtPokemon, setCaughtPokemon] = useState<{id: number, name: string} | null>(null);

    const handleWin = useCallback(async () => {
        const randomPokemonId = Math.floor(Math.random() * 151) + 1;
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
            const data = await res.json();
            const pokemonName = capitalize(data.name);
            setCaughtPokemon({ id: data.id, name: pokemonName });
            setShowCapture(true);

            try {
                const ttsResult = await textToSpeech(pokemonName);
                if (ttsResult.media) {
                    sessionStorage.setItem('ttsAudioData', ttsResult.media);
                }
            } catch (ttsError) {
                console.error("Failed to generate or store TTS audio:", ttsError);
            }

            setTimeout(() => {
                router.push(`/pokemon/${data.id}`);
            }, 2500);
        } catch (error) {
            console.error("Failed to fetch random pokemon", error);
            // Fallback to a known pokemon if API fails
            router.push('/pokemon/1');
        }
    }, [router]);

    useEffect(() => {
        if (gameState === 'win' && !showCapture) {
            handleWin();
        }
    }, [gameState, showCapture, handleWin]);


    const renderScreenContent = () => {
        if (showCapture && caughtPokemon) {
            return <PokedexScanner pokemonName={caughtPokemon.name} />;
        }

        switch (gameState) {
            case 'menu':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <h1 className="font-headline text-3xl text-black drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">Dex Run</h1>
                        <p className="text-xs mt-2 text-black/70">Grab the Pokéball!</p>
                        <Button onClick={startGame} className="mt-4" size="sm" variant="secondary">Start Game</Button>
                    </div>
                );
            case 'playing':
                return (
                    <GameBoard
                        maze={maze}
                        playerPos={playerPos}
                        villainPos={villainPos}
                        pokeballPos={pokeballPos}
                    />
                );
            case 'lose':
                 return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <h1 className="font-headline text-2xl text-black">Game Over</h1>
                        <Button onClick={resetGame} className="mt-4" size="sm" variant="secondary">Try Again</Button>
                    </div>
                );
            case 'win':
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-black" />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <HandheldConsole onDirectionalPad={movePlayer} disabled={gameState !== 'playing'} onAButton={gameState === 'menu' ? startGame : undefined}>
            {renderScreenContent()}
        </HandheldConsole>
    );
}
