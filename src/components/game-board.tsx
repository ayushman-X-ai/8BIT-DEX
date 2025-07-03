'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const PokeballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="10" fill="#fff" stroke="#000" strokeWidth="2" />
        <path d="M2 12A10 10 0 0 1 12 2v10H2z" fill="#FF0000" />
        <path d="M12 2a10 10 0 0 1 10 10h-10V2z" fill="#FF0000" />
        <circle cx="12" cy="12" r="3.5" fill="#fff" stroke="#000" strokeWidth="2" />
    </svg>
);

const PlayerIcon = ({ style }: { style: React.CSSProperties }) => (
    <div className="absolute transition-all duration-200 ease-in-out" style={style}>
        <Image 
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" 
            alt="Player" 
            fill 
            sizes="10vw"
            data-ai-hint="pokemon character"
        />
    </div>
);
  
const VillainIcon = ({ style }: { style: React.CSSProperties }) => (
    <div className="absolute transition-all duration-200 ease-in-out animate-villain-pulse" style={style}>
      <Image 
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png" 
        alt="Villain" 
        fill 
        sizes="10vw" 
        data-ai-hint="pokemon character"
      />
    </div>
);

const Starfield = ({ starCount = 50 }: { starCount?: number }) => {
    const [stars, setStars] = useState<{x: string, y: string, animationDuration: string}[]>([]);

    useEffect(() => {
        const newStars = Array.from({ length: starCount }).map(() => ({
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
        }));
        setStars(newStars);
    }, [starCount]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {stars.map((star, i) => (
                <div 
                    key={`star-${i}`} 
                    className="absolute w-px h-px bg-white/70 rounded-full animate-pulse" 
                    style={{ left: star.x, top: star.y, animationDuration: star.animationDuration }} 
                />
            ))}
        </div>
    );
};

interface GameBoardProps {
    maze: number[][];
    playerPos: { x: number; y: number };
    villainPos: { x: number; y: number };
    pokeballPos: { x: number; y: number };
}

export function GameBoard({ maze, playerPos, villainPos, pokeballPos }: GameBoardProps) {
    const gridSize = maze.length;
    const cellSize = 100 / gridSize;

    return (
        <div 
            className="relative w-full h-full bg-black"
            style={{ imageRendering: 'pixelated' }}
        >
            <Starfield />
            {/* Maze Background Grid */}
            <div className="relative grid h-full w-full" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
                {maze.map((row, y) => row.map((cell, x) => (
                    <div key={`cell-${x}-${y}`} className={cell === 1 ? 'bg-blue-600 border-2 border-t-blue-400 border-l-blue-400 border-b-blue-800 border-r-blue-800' : 'bg-transparent'} />
                )))}
            </div>

            {/* Game Objects */}
            <PlayerIcon style={{ top: `${playerPos.y * cellSize}%`, left: `${playerPos.x * cellSize}%`, width: `${cellSize}%`, height: `${cellSize}%` }} />
            <VillainIcon style={{ top: `${villainPos.y * cellSize}%`, left: `${villainPos.x * cellSize}%`, width: `${cellSize}%`, height: `${cellSize}%` }} />
            <div 
                className="absolute animate-pokeball-pulse" 
                style={{ top: `${pokeballPos.y * cellSize}%`, left: `${pokeballPos.x * cellSize}%`, width: `${cellSize}%`, height: `${cellSize}%` }}
            >
                <PokeballIcon className="w-full h-full drop-shadow-[0_0_5px_white]" />
            </div>
        </div>
    );
}
