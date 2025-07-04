'use client';

import React from 'react';
import type { BrawlerPlayerState } from '@/types/brawler';
import { capitalize } from '@/lib/pokemon-utils';

interface GameUIProps {
    player: BrawlerPlayerState;
    opponent: BrawlerPlayerState;
}

const HealthBar = ({ currentHp, maxHp, isPlayer = false }: { currentHp: number, maxHp: number, isPlayer?: boolean }) => {
    const percentage = Math.max(0, (currentHp / maxHp) * 100);
    return (
        <div className="w-full h-4 sm:h-5 bg-muted border-2 border-foreground p-0.5">
            <div
                className={`h-full transition-all duration-300 ${percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

const UltraMeter = ({ current, max, isPlayer = false }: { current: number, max: number, isPlayer?: boolean }) => {
    const percentage = (current / max) * 100;
    return (
        <div className="w-full h-2 sm:h-3 bg-muted border-2 border-foreground p-0.5 mt-1">
            <div
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

export default function GameUI({ player, opponent }: GameUIProps) {
    return (
        <div className="absolute top-0 left-0 w-full p-2 sm:p-4 z-10 flex justify-between gap-4">
            {/* Player Info */}
            <div className="w-2/5 p-2 bg-card/80 border-4 border-foreground">
                <h3 className="font-headline text-xs sm:text-base truncate">{capitalize(player.name)}</h3>
                <HealthBar currentHp={player.hp} maxHp={player.maxHp} isPlayer />
                <UltraMeter current={player.ultraMeter} max={100} isPlayer />
            </div>

            {/* Opponent Info */}
            <div className="w-2/f p-2 bg-card/80 border-4 border-foreground">
                <h3 className="font-headline text-xs sm:text-base truncate text-right">{capitalize(opponent.name)}</h3>
                <HealthBar currentHp={opponent.hp} maxHp={opponent.maxHp} />
                <UltraMeter current={opponent.ultraMeter} max={100} />
            </div>
        </div>
    );
}
