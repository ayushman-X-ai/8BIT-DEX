'use client';

import React from 'react';
import Image from 'next/image';

const PokeballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="#FF0000" d="M0 8h16v5H0z"/>
        <path fill="#FFFFFF" d="M0 3h16v5H0z"/>
        <path fill="#000000" d="M0 7h16v2H0z"/>
        <path fill="#FFFFFF" d="M6 7h4v2H6z"/>
        <path fill="#000000" d="M7 7.5h2v1H7z"/>
        <path fill="#000000" d="M8 3h1v1H8z M7 4h1v1H7z M9 4h1v1H9z M6 5h1v1H6z M10 5h1v1h-1z M5 6h1v1H5z M11 6h1v1h-1z"/>
        <path fill="#000000" d="M8 13h1v1H8z M7 12h1v1H7z M9 12h1v1H9z M6 11h1v1H6z M10 11h1v1h-1z M5 10h1v1H5z M11 10h1v1h-1z"/>
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
    <div className="absolute transition-all duration-200 ease-in-out" style={style}>
      <Image 
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png" 
        alt="Villain" 
        fill 
        sizes="10vw" 
        data-ai-hint="pokemon character"
      />
    </div>
);

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
            {/* Maze Background Grid */}
            <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
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
