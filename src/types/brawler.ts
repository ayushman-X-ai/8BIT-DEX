
export interface BrawlerCharacter {
    id: number;
    name: string;
    maxHp: number;
    speed: number;
    jumpHeight: number;
    attack: number;
    defense: number;
    elementType: string;
    spriteUrl: string;
    width: number;
    height: number;
    attack: {
        damage: number;
        knockback: number;
        baseWidth: number;
        baseHeight: number;
    };
}

export interface AttackBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface BrawlerPlayerState extends BrawlerCharacter {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    direction: 'left' | 'right';
    isJumping: boolean;
    isAttacking: boolean;
    isHit: boolean;
    hitStun: number; // number of frames to be stunned
    attackCooldown: number; // number of frames before next attack
    ultraMeter: number; // 0-100
    attack: AttackBox & {
        damage?: number;
        knockback?: number;
    };
}

export interface BrawlerGameState {
    player: BrawlerPlayerState;
    opponent: BrawlerPlayerState;
    gameTicks: number;
    isPaused: boolean;
}
