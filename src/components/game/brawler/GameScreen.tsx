'use client';

import React from 'react';
import Image from 'next/image';
import type { BrawlerCharacter } from '@/types/brawler';
import { useBrawlerGameLoop } from '@/hooks/use-brawler-game-loop';
import GameUI from '@/components/game/brawler/GameUI';
import { cn } from '@/lib/utils';

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;

interface GameScreenProps {
  playerChar: BrawlerCharacter;
  opponentChar: BrawlerCharacter;
  onGameOver: (winnerName: string | null) => void;
}

export default function GameScreen({ playerChar, opponentChar, onGameOver }: GameScreenProps) {
    const { gameState } = useBrawlerGameLoop({ playerChar, opponentChar, onGameOver });
    const { player, opponent, gameTicks } = gameState;

    return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-slate-700 via-slate-900 to-black">
            {/* Background elements */}
            <div className="absolute top-[15%] left-[20%] w-24 h-24 bg-slate-100 rounded-full opacity-60 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-full h-[150px] bg-black/40" />
            
            <GameUI player={player} opponent={opponent} />

            {/* Player */}
            <div
                className={cn(
                    "absolute transition-transform duration-75", 
                    player.isHit && "animate-shake"
                )}
                style={{
                    width: player.width,
                    height: player.height,
                    left: player.x,
                    bottom: player.y,
                    transform: `scaleX(${player.direction === 'right' ? 1 : -1})`,
                }}
            >
                <Image
                    src={player.spriteUrl}
                    alt={player.name}
                    width={player.width}
                    height={player.height}
                    className="object-contain filter brightness-0 drop-shadow-[0_0_5px_hsl(var(--primary-foreground))]"
                />
            </div>

            {/* Opponent */}
            <div
                className={cn(
                    "absolute transition-transform duration-75",
                    opponent.isHit && "animate-shake"
                )}
                style={{
                    width: opponent.width,
                    height: opponent.height,
                    left: opponent.x,
                    bottom: opponent.y,
                    transform: `scaleX(${opponent.direction === 'right' ? 1 : -1})`,
                }}
            >
                <Image
                    src={opponent.spriteUrl}
                    alt={opponent.name}
                    width={opponent.width}
                    height={opponent.height}
                    className="object-contain filter brightness-0 drop-shadow-[0_0_5px_hsl(var(--primary-foreground))]"
                />
            </div>
        </div>
    );
}
