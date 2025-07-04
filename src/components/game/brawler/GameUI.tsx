'use client';

import React from 'react';
import type { BrawlerPlayerState } from '@/types/brawler';
import { capitalize } from '@/lib/pokemon-utils';

interface GameUIProps {
    player: BrawlerPlayerState;
    opponent: BrawlerPlayerState;
}

const HealthBar = ({ currentHp, maxHp }: { currentHp: number, maxHp: number }) => {
    const percentage = Math.max(0, (currentHp / maxHp) * 100);
    return (
        <div className="w-full h-4 sm:h-5 bg-slate-800 border-2 border-slate-600 p-0.5">
            <div
                className={`h-full transition-all duration-300 ${percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

const UltraMeter = ({ current, max }: { current: number, max: number }) => {
    const percentage = (current / max) * 100;
    return (
        <div className="w-full h-2 sm:h-3 bg-slate-800 border-2 border-slate-600 p-0.5 mt-1">
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
            <div className="w-2/5 p-2 bg-black/50 border-2 border-slate-700">
                <h3 className="font-headline text-xs sm:text-base truncate text-white">{capitalize(player.name)}</h3>
                <HealthBar currentHp={player.hp} maxHp={player.maxHp} />
                <UltraMeter current={player.ultraMeter} max={100} />
            </div>

            {/* Opponent Info */}
            <div className="w-2/5 p-2 bg-black/50 border-2 border-slate-700">
                <h3 className="font-headline text-xs sm:text-base truncate text-right text-white">{capitalize(opponent.name)}</h3>
                <HealthBar currentHp={opponent.hp} maxHp={opponent.maxHp} />
                <UltraMeter current={opponent.ultraMeter} max={100} />
            </div>
        </div>
    );
}
