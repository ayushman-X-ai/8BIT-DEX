'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { BrawlerCharacter, BrawlerGameState, BrawlerPlayerState, AttackBox } from '@/types/brawler';

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600; // Visual height, not physics world
const GROUND_Y = 150; // Height of the floor platform from the bottom
const GRAVITY = 1.5;
const MAX_FALL_SPEED = -25;

const createInitialPlayerState = (character: BrawlerCharacter, isPlayer: boolean): BrawlerPlayerState => ({
    ...character,
    x: isPlayer ? 100 : 600,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    hp: character.maxHp,
    direction: isPlayer ? 'right' : 'left',
    isJumping: false,
    isAttacking: false,
    isHit: false,
    hitStun: 0,
    attackCooldown: 0,
    ultraMeter: 0,
    attack: {
        width: 0, height: 0, x: 0, y: 0
    }
});

interface GameLoopProps {
    playerChar: BrawlerCharacter;
    opponentChar: BrawlerCharacter;
    onGameOver: (winnerName: string | null) => void;
}

export const useBrawlerGameLoop = ({ playerChar, opponentChar, onGameOver }: GameLoopProps) => {
    const [gameState, setGameState] = useState<BrawlerGameState>({
        player: createInitialPlayerState(playerChar, true),
        opponent: createInitialPlayerState(opponentChar, false),
        gameTicks: 0,
        isPaused: false,
    });

    const keys = useRef<Record<string, boolean>>({});
    const requestRef = useRef<number>();

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keys.current[e.key.toLowerCase()] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const checkCollision = (p1: BrawlerPlayerState, p2: BrawlerPlayerState | AttackBox) => {
        return (
            p1.x < p2.x + p2.width &&
            p1.x + p1.width > p2.x &&
            p1.y < p2.y + p2.height &&
            p1.y + p1.height > p2.y
        );
    };

    const gameLoop = useCallback(() => {
        setGameState(prev => {
            if (prev.isPaused) return prev;

            let player = { ...prev.player };
            let opponent = { ...prev.opponent };

            // Reset transient states
            player.isHit = false;
            opponent.isHit = false;

            // Reduce cooldowns
            player.attackCooldown = Math.max(0, player.attackCooldown - 1);
            player.hitStun = Math.max(0, player.hitStun - 1);
            opponent.attackCooldown = Math.max(0, opponent.attackCooldown - 1);
            opponent.hitStun = Math.max(0, opponent.hitStun - 1);

            // --- PLAYER LOGIC ---
            if (player.hitStun === 0) {
                 // Horizontal Movement
                player.vx = 0;
                if (keys.current['a']) {
                    player.vx = -player.speed;
                    player.direction = 'left';
                }
                if (keys.current['d']) {
                    player.vx = player.speed;
                    player.direction = 'right';
                }
                
                // Jumping
                if (keys.current['w'] && !player.isJumping) {
                    player.vy = player.jumpHeight;
                    player.isJumping = true;
                }

                // Attacking
                player.isAttacking = false;
                if (keys.current[' '] && player.attackCooldown === 0) {
                    player.isAttacking = true;
                    player.attackCooldown = 30; // 0.5 seconds at 60fps
                }
            }

            // --- OPPONENT AI LOGIC ---
            if (opponent.hitStun === 0) {
                const distance = player.x - opponent.x;
                opponent.vx = 0;
                // Simple AI: move towards player if far, attack if close
                if (Math.abs(distance) > 100) {
                    opponent.vx = Math.sign(distance) * opponent.speed;
                } else if (opponent.attackCooldown === 0) {
                    opponent.isAttacking = true;
                    opponent.attackCooldown = 45; // Slower attack
                } else {
                    opponent.isAttacking = false;
                }
                opponent.direction = distance > 0 ? 'right' : 'left';
            }

            // --- PHYSICS & POSITION UPDATE ---
            [player, opponent].forEach(p => {
                // Apply velocity
                p.x += p.vx;
                p.y += p.vy;

                // Apply gravity
                p.vy -= GRAVITY;
                if (p.vy < MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;

                // Ground collision
                if (p.y <= GROUND_Y) {
                    p.y = GROUND_Y;
                    p.vy = 0;
                    p.isJumping = false;
                }

                // Arena boundaries
                p.x = Math.max(0, Math.min(p.x, ARENA_WIDTH - p.width));
            });
            
            // --- ATTACK & DAMAGE LOGIC ---
            const processAttack = (attacker: BrawlerPlayerState, defender: BrawlerPlayerState) => {
                if (!attacker.isAttacking) return defender;

                const attackX = attacker.direction === 'right' ? attacker.x + attacker.width : attacker.x - attacker.attack.baseWidth;
                attacker.attack = { x: attackX, y: attacker.y + 20, width: attacker.attack.baseWidth, height: attacker.attack.baseHeight };
                
                if (checkCollision(defender, attacker.attack)) {
                    const damage = Math.max(1, attacker.attack.damage - defender.defense);
                    defender.hp = Math.max(0, defender.hp - damage);
                    defender.isHit = true;
                    defender.hitStun = 15; // Stunned for 1/4 second
                    defender.vx = (attacker.direction === 'right' ? 1 : -1) * attacker.attack.knockback;
                    defender.vy = 5; // Pop up
                    attacker.ultraMeter = Math.min(100, attacker.ultraMeter + 10);
                }
                return defender;
            };

            opponent = processAttack(player, opponent);
            player = processAttack(opponent, player);
            
            // --- CHECK GAME OVER ---
            if (player.hp <= 0 || opponent.hp <= 0) {
                requestAnimationFrame(() => { // delay to allow final render state
                    let winner = null;
                    if (player.hp > 0) winner = player.name;
                    if (opponent.hp > 0) winner = opponent.name;
                    onGameOver(winner);
                });
                return { ...prev, isPaused: true, player, opponent };
            }

            return {
                ...prev,
                player,
                opponent,
                gameTicks: prev.gameTicks + 1,
            };
        });

        requestRef.current = requestAnimationFrame(gameLoop);
    }, [onGameOver]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [gameLoop]);

    return { gameState };
};
