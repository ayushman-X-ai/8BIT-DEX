'use client';

import { useState, useEffect, useCallback } from 'react';

type GameState = 'menu' | 'playing' | 'win' | 'lose';
type Direction = 'up' | 'down' | 'left' | 'right';
type Position = { x: number; y: number };

const MAZE_LAYOUT = [
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
];

const INITIAL_PLAYER_POS = { x: 0, y: 0 };
const INITIAL_VILLAIN_POS = { x: 9, y: 9 };
const POKEBALL_POS = { x: 5, y: 4 };

// BFS Pathfinding to find the shortest path from start to end
const findPath = (maze: number[][], start: Position, end: Position): Position | null => {
    const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [start] }];
    const visited = new Set<string>([`${start.x},${start.y}`]);
    const directions = [ { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 } ];
    const gridSize = maze.length;

    while (queue.length > 0) {
        const { pos, path } = queue.shift()!;

        if (pos.x === end.x && pos.y === end.y) {
            // Return the second step in the path, which is the next move from start
            return path.length > 1 ? path[1] : null; 
        }

        for (const dir of directions) {
            const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };
            const posKey = `${nextPos.x},${nextPos.y}`;

            if (
                nextPos.x >= 0 && nextPos.x < gridSize && 
                nextPos.y >= 0 && nextPos.y < gridSize && 
                maze[nextPos.y][nextPos.x] === 0 && !visited.has(posKey)
            ) {
                visited.add(posKey);
                queue.push({ pos: nextPos, path: [...path, nextPos] });
            }
        }
    }
    return null; // No path found
};

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [playerPos, setPlayerPos] = useState<Position>(INITIAL_PLAYER_POS);
    const [villainPos, setVillainPos] = useState<Position>(INITIAL_VILLAIN_POS);

    const maze = MAZE_LAYOUT;
    const gridSize = maze.length;

    const movePlayer = useCallback((direction: Direction) => {
        if (gameState !== 'playing') return;

        setPlayerPos(prevPos => {
            const newPos = { ...prevPos };
            if (direction === 'up') newPos.y = Math.max(0, prevPos.y - 1);
            if (direction === 'down') newPos.y = Math.min(gridSize - 1, prevPos.y + 1);
            if (direction === 'left') newPos.x = Math.max(0, prevPos.x - 1);
            if (direction === 'right') newPos.x = Math.min(gridSize - 1, prevPos.x + 1);

            if (maze[newPos.y][newPos.x] === 1) {
                return prevPos; // Wall collision
            }
            
            if (newPos.x === villainPos.x && newPos.y === villainPos.y) {
                setGameState('lose');
            } else if (newPos.x === POKEBALL_POS.x && newPos.y === POKEBALL_POS.y) {
                setGameState('win');
            }
            return newPos;
        });
    }, [gameState, gridSize, maze, villainPos]);

    const moveVillain = useCallback(() => {
        if (gameState !== 'playing') return;
        
        const nextStep = findPath(maze, villainPos, playerPos);

        setVillainPos(prevPos => {
            const newPos = nextStep ? { x: nextStep.x, y: nextStep.y } : prevPos;
            
            if (newPos.x === playerPos.x && newPos.y === playerPos.y) {
                setGameState('lose');
            }

            return newPos;
        });
    }, [gameState, maze, villainPos, playerPos]);

    const startGame = () => {
        resetGame();
        setGameState('playing');
    };

    const resetGame = () => {
        setGameState('menu');
        setPlayerPos(INITIAL_PLAYER_POS);
        setVillainPos(INITIAL_VILLAIN_POS);
    }

    useEffect(() => {
        if (gameState === 'playing') {
            const villainInterval = setInterval(moveVillain, 850); // Villain moves every 850ms
            return () => {
                clearInterval(villainInterval);
            };
        }
    }, [gameState, moveVillain]);

    return {
        gameState,
        maze,
        playerPos,
        villainPos,
        pokeballPos: POKEBALL_POS,
        startGame,
        movePlayer,
        resetGame,
    };
};
