'use client';

import React from 'react';

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

const PlayerIcon = ({ className }: { className?: string }) => (
    <div className={className} style={{ imageRendering: 'pixelated' }}>
      <div className="h-full w-full bg-blue-500" />
    </div>
  );
  
const VillainIcon = ({ className }: { className?: string }) => (
    <div className={className} style={{ imageRendering: 'pixelated' }}>
      <div className="h-full w-full bg-purple-700" />
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

    const renderCell = (cell: number, x: number, y: number) => {
        const isPlayer = playerPos.x === x && playerPos.y === y;
        const isVillain = villainPos.x === x && villainPos.y === y;
        const isPokeball = pokeballPos.x === x && pokeballPos.y === y;

        if (cell === 1) {
            return <div key={`${x}-${y}`} className="bg-[#5c6e62] border-r border-b border-black/10" />;
        }

        return (
            <div key={`${x}-${y}`} className="relative bg-transparent border-r border-b border-black/10">
                {isPlayer && <PlayerIcon className="absolute inset-0" />}
                {isVillain && <VillainIcon className="absolute inset-0" />}
                {isPokeball && <PokeballIcon className="absolute inset-0 p-[10%]" />}
            </div>
        );
    };

    return (
        <div 
            className="grid"
            style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                width: '100%',
                height: '100%',
                imageRendering: 'pixelated'
            }}
        >
            {maze.map((row, y) => row.map((cell, x) => renderCell(cell, x, y)))}
        </div>
    );
}