'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GameBoardProps {
    maze: string[];
    tileSize: number;
    playerPosition: { x: number; y: number };
    villainPosition: { x: number; y: number };
    pokeballPosition: { x: number; y: number };
}

const MemoizedGameBoard = React.memo(function GameBoard({
    maze,
    tileSize,
    playerPosition,
    villainPosition,
    pokeballPosition,
}: GameBoardProps) {
    const width = maze[0].length;
    const height = maze.length;

    const renderTile = (char: string, x: number, y: number) => {
        if (char === '#') {
            return <div key={`${x}-${y}`} className="bg-foreground" />;
        }
        return <div key={`${x}-${y}`} className="bg-card" />;
    };

    return (
        <div
            className="relative bg-card"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${width}, ${tileSize}px)`,
                gridTemplateRows: `repeat(${height}, ${tileSize}px)`,
                width: width * tileSize,
                height: height * tileSize,
                imageRendering: 'pixelated',
            }}
        >
            {maze.map((row, y) => row.split('').map((char, x) => renderTile(char, x, y)))}

            {/* Pokéball */}
            <div
                className="absolute transition-all duration-100 ease-linear"
                style={{
                    left: pokeballPosition.x * tileSize,
                    top: pokeballPosition.y * tileSize,
                    width: tileSize,
                    height: tileSize,
                }}
            >
                <Image
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                    alt="Pokéball"
                    width={tileSize}
                    height={tileSize}
                    className="object-contain"
                    data-ai-hint="pokeball"
                />
            </div>
            
            {/* Villain */}
            <div
                className="absolute transition-all duration-300 ease-linear"
                style={{
                    left: villainPosition.x * tileSize,
                    top: villainPosition.y * tileSize,
                    width: tileSize,
                    height: tileSize,
                }}
            >
                <Image
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"
                    alt="Gengar"
                    width={tileSize * 1.5}
                    height={tileSize * 1.5}
                    className="object-contain -translate-x-1/4 -translate-y-1/4"
                    data-ai-hint="pokemon character"
                />
            </div>

            {/* Player */}
            <div
                className="absolute bg-accent border-2 border-accent-foreground transition-all duration-100 ease-linear"
                style={{
                    left: playerPosition.x * tileSize,
                    top: playerPosition.y * tileSize,
                    width: tileSize,
                    height: tileSize,
                }}
            />
        </div>
    );
});

export default MemoizedGameBoard;
