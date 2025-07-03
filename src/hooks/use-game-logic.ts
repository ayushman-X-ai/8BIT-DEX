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

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [playerPos, setPlayerPos] = useState<Position>(INITIAL_PLAYER_POS);
    const [villainPos, setVillainPos] = useState<Position>(INITIAL_VILLAIN_POS);

    const maze = MAZE_LAYOUT;
    const gridSize = maze.length;

    const checkCollision = useCallback((pos: Position) => {
        if (pos.x === villainPos.x && pos.y === villainPos.y) {
            setGameState('lose');
        } else if (pos.x === POKEBALL_POS.x && pos.y === POKEBALL_POS.y) {
            setGameState('win');
        }
    }, [villainPos]);

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
            
            checkCollision(newPos);
            return newPos;
        });
    }, [gameState, gridSize, maze, checkCollision]);

    const moveVillain = useCallback(() => {
        setVillainPos(prevPos => {
            const newPos = { ...prevPos };
            const dx = playerPos.x - prevPos.x;
            const dy = playerPos.y - prevPos.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                newPos.x += Math.sign(dx);
            } else {
                newPos.y += Math.sign(dy);
            }

            if (newPos.x < 0 || newPos.x >= gridSize || newPos.y < 0 || newPos.y >= gridSize || maze[newPos.y][newPos.x] === 1) {
                return prevPos; // Invalid move
            }
            
            return newPos;
        });
    }, [playerPos, gridSize, maze]);

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
            const villainInterval = setInterval(() => {
                moveVillain();
            }, 700);
            
            const gameCheckInterval = setInterval(() => {
                 setPlayerPos(p => {
                    checkCollision(p);
                    return p;
                });
            }, 100);

            return () => {
                clearInterval(villainInterval);
                clearInterval(gameCheckInterval);
            };
        }
    }, [gameState, moveVillain, checkCollision]);

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
