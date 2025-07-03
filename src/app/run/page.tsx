'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameBoard from '@/components/game/game-board';
import Joystick from '@/components/game/joystick';

const MAZE_LAYOUT = [
  '###############',
  '#B#   #   #   #',
  '# # ### # # ###',
  '#   #   # #   #',
  '### # ### ### #',
  '# #   #     # #',
  '# ### ####### #',
  '#   #   #   # #',
  '# # ### # # # #',
  '# # #   # #   #',
  '# ### ##### ###',
  '#     #   #   #',
  '### # # # ### #',
  '#V  #   #   #P#',
  '###############',
];

const TILE_SIZE = 24;
const PLAYER_SPEED = 1; // moves every frame
const VILLAIN_SPEED = 4; // moves every 4 frames

const findChar = (char: string, maze: string[]) => {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === char) return { x, y };
        }
    }
    return { x: 1, y: 1 };
};

const INITIAL_PLAYER_POS = findChar('P', MAZE_LAYOUT);
const INITIAL_VILLAIN_POS = findChar('V', MAZE_LAYOUT);
const POKEBALL_POS = findChar('B', MAZE_LAYOUT);

type GameState = 'menu' | 'playing' | 'won' | 'lost';

export default function DexRunPage() {
    const router = useRouter();
    const [gameState, setGameState] = useState<GameState>('menu');
    const [playerPosition, setPlayerPosition] = useState(INITIAL_PLAYER_POS);
    const [villainPosition, setVillainPosition] = useState(INITIAL_VILLAIN_POS);

    const playerDirection = useRef<'none' | 'up' | 'down' | 'left' | 'right'>('none');
    const frameCount = useRef(0);
    const animationFrameId = useRef<number>();

    const resetGame = useCallback(() => {
        setPlayerPosition(INITIAL_PLAYER_POS);
        setVillainPosition(INITIAL_VILLAIN_POS);
        playerDirection.current = 'none';
        frameCount.current = 0;
        setGameState('playing');
    }, []);

    const handleDirectionChange = (direction: 'none' | 'up' | 'down' | 'left' | 'right') => {
        playerDirection.current = direction;
    };

    const isWall = (x: number, y: number) => {
        return MAZE_LAYOUT[y]?.[x] === '#';
    };

    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;
        frameCount.current++;

        // --- Player Movement ---
        setPlayerPosition(prev => {
            let { x, y } = prev;
            if (playerDirection.current === 'up' && !isWall(x, y - 1)) y--;
            if (playerDirection.current === 'down' && !isWall(x, y + 1)) y++;
            if (playerDirection.current === 'left' && !isWall(x - 1, y)) x--;
            if (playerDirection.current === 'right' && !isWall(x + 1, y)) x++;
            return { x, y };
        });

        // --- Villain Movement ---
        if (frameCount.current % VILLAIN_SPEED === 0) {
            setVillainPosition(prev => {
                const pPos = playerPosition;
                let { x, y } = prev;
                if (pPos.x > x && !isWall(x + 1, y)) x++;
                else if (pPos.x < x && !isWall(x - 1, y)) x--;
                else if (pPos.y > y && !isWall(x, y + 1)) y++;
                else if (pPos.y < y && !isWall(x, y - 1)) y--;
                return { x, y };
            });
        }
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [gameState, playerPosition]);
    
    useEffect(() => {
        if (gameState === 'playing') {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [gameState, gameLoop]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        // --- Check Win/Loss Conditions ---
        if (playerPosition.x === villainPosition.x && playerPosition.y === villainPosition.y) {
            setGameState('lost');
        }
        if (playerPosition.x === POKEBALL_POS.x && playerPosition.y === POKEBALL_POS.y) {
            setGameState('won');
            setTimeout(() => {
                const randomPokemonId = Math.floor(Math.random() * 1025) + 1;
                router.push(`/pokemon/${randomPokemonId}`);
            }, 2000);
        }
    }, [playerPosition, villainPosition, gameState, router]);

    return (
        <div className="bg-black min-h-screen font-body flex flex-col text-white">
            <header className="py-4 px-4 md:px-8 border-b-4 border-gray-700 sticky top-0 z-10 bg-black">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="outline" size="xs" className="border-2 border-gray-400 bg-black text-white hover:bg-gray-800 hover:border-gray-500">
                            <ArrowLeft /> Back
                        </Button>
                    </Link>
                    <h1 className="text-sm sm:text-base font-bold font-headline uppercase tracking-tighter sm:tracking-widest text-center">
                        Dex Run
                    </h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg aspect-square bg-black border-4 border-foreground shadow-[inset_0_0_10px_black,0_0_10px_hsl(var(--primary)/0.5)] flex items-center justify-center">
                    {gameState === 'menu' && (
                        <div className="text-center">
                            <h2 className="text-2xl font-headline mb-4">Ready to Run?</h2>
                            <Button onClick={resetGame} size="lg" className="font-headline border-2 border-foreground shadow-pixel-sm">
                                <Play className="mr-2"/> Start Game
                            </Button>
                        </div>
                    )}
                    {gameState === 'lost' && (
                        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-center">
                            <h2 className="text-3xl font-headline mb-4 text-red-500">Game Over</h2>
                            <Button onClick={resetGame} size="lg" className="font-headline border-2 border-foreground shadow-pixel-sm">
                                <RefreshCw className="mr-2"/> Try Again
                            </Button>
                        </div>
                    )}
                    {gameState === 'won' && (
                        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-center overflow-hidden">
                             <div className="absolute left-0 w-full h-2 bg-primary/70 shadow-[0_0_10px_theme(colors.primary)] animate-scanline z-20" />
                             <p className="font-headline text-lg sm:text-xl text-primary animate-pulse z-10 tracking-widest drop-shadow-[2px_2px_0_hsl(var(--foreground)/0.5)]">
                                CAPTURED!
                            </p>
                        </div>
                    )}
                    {(gameState === 'playing') && (
                        <GameBoard
                            maze={MAZE_LAYOUT}
                            tileSize={TILE_SIZE}
                            playerPosition={playerPosition}
                            villainPosition={villainPosition}
                            pokeballPosition={POKEBALL_POS}
                        />
                    )}
                </div>

                <div className="mt-6 flex justify-center items-center">
                    <Joystick onDirectionChange={handleDirectionChange} />
                </div>
            </main>
        </div>
    );
}
