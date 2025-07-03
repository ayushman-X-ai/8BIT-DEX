'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, RefreshCw, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameBoard from '@/components/game/game-board';
import Joystick from '@/components/game/joystick';
import { HandheldConsole } from '@/components/game/handheld-console';

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

const TILE_SIZE = 20; // Adjusted for a better fit in the console screen
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
        if (frameCount.current % PLAYER_SPEED === 0) {
            setPlayerPosition(prev => {
                let { x, y } = prev;
                if (playerDirection.current === 'up' && !isWall(x, y - 1)) y--;
                if (playerDirection.current === 'down' && !isWall(x, y + 1)) y++;
                if (playerDirection.current === 'left' && !isWall(x - 1, y)) x--;
                if (playerDirection.current === 'right' && !isWall(x + 1, y)) x++;
                return { x, y };
            });
        }

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
    
    const screenContent = (
      <>
        {gameState === 'menu' && (
            <div className="absolute inset-0 bg-card z-20 flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-xl font-headline mb-4 text-foreground">Ready to Run?</h2>
                <Button onClick={resetGame} size="lg" className="font-headline text-sm border-2 border-foreground shadow-pixel-sm">
                    <Play className="mr-2"/> Start Game
                </Button>
            </div>
        )}
        {gameState === 'lost' && (
            <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl font-headline mb-4 text-primary">Game Over</h2>
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
        {(gameState !== 'menu') && (
            <GameBoard
                maze={MAZE_LAYOUT}
                tileSize={TILE_SIZE}
                playerPosition={playerPosition}
                villainPosition={villainPosition}
                pokeballPosition={POKEBALL_POS}
            />
        )}
      </>
    );

    return (
        <div className="bg-muted min-h-screen font-body flex flex-col items-center justify-center p-4 selection:bg-accent selection:text-accent-foreground">
            <HandheldConsole
                dPad={<Joystick onDirectionChange={handleDirectionChange} />}
                screenContent={screenContent}
            />
        </div>
    );
}